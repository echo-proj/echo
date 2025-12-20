package com.echoproject.echo.document.service;

import com.echoproject.echo.common.exception.BadRequestException;
import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.document.domain.DocumentAccessControl;
import com.echoproject.echo.document.dto.CreateVersionRequest;
import com.echoproject.echo.document.dto.VersionContentResponse;
import com.echoproject.echo.document.dto.VersionResponse;
import com.echoproject.echo.document.models.DocumentVersion;
import com.echoproject.echo.document.repository.DocumentVersionRepository;
import com.echoproject.echo.notification.client.CollaborationServiceClient;
import com.echoproject.echo.document.client.DocumentServiceClient;
import com.echoproject.echo.user.client.UserServiceClient;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentVersionService {

  private static final int MAX_VERSIONS_PER_DOCUMENT = 15;

  private final DocumentVersionRepository versionRepository;
  private final CollaborationServiceClient collabClient;
  private final UserServiceClient userClient;
  private final DocumentServiceClient documentClient;

  @Transactional
  public VersionResponse createVersion(UUID userId, UUID documentId, CreateVersionRequest request) {
    if (!validateAccess(documentId)) throw new BadRequestException("Access denied");
    // Pull latest content from document-service
    // Reuse existing endpoints via DocumentServiceClient? For now, read from our DB if still present, else consider adding a GET client
    String auth = getCurrentAuthorization();
    byte[] state = documentClient.getContent(documentId, auth);
    if (state == null || state.length == 0) throw new BadRequestException("Document has no content to version");
    long versionCount = versionRepository.countByDocumentId(documentId);
    if (versionCount >= MAX_VERSIONS_PER_DOCUMENT) deleteOldestVersion(documentId);
    Integer nextVersionNumber = versionRepository.findMaxVersionNumberByDocumentId(documentId).map(max -> max + 1).orElse(1);
    DocumentVersion version = new DocumentVersion(documentId, nextVersionNumber, state, userId, request.getLabel());
    versionRepository.save(version);
    return toVersionResponse(version);
  }

  @Transactional(readOnly = true)
  public List<VersionResponse> getDocumentVersions(UUID userId, UUID documentId) {
    if (!validateAccess(documentId)) throw new BadRequestException("Access denied");
    List<DocumentVersion> versions = versionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId);
    Set<UUID> creatorIds = versions.stream().map(DocumentVersion::getCreatedById).collect(Collectors.toSet());
    var usernames = userClient.getUsernames(creatorIds);
    return versions.stream().map(v ->
        new VersionResponse(
            v.getId(), v.getDocumentId(), v.getVersionNumber(), v.getLabel(),
            usernames.getOrDefault(v.getCreatedById(), null),
            v.getCreatedAt()
        )
    ).toList();
  }

  @Transactional(readOnly = true)
  public VersionContentResponse getVersionContent(UUID userId, UUID documentId, UUID versionId) {
    if (!validateAccess(documentId)) throw new BadRequestException("Access denied");
    DocumentVersion version = versionRepository.findById(versionId).orElseThrow(() -> new NotFoundException("Version not found"));
    if (!version.getDocumentId().equals(documentId)) throw new BadRequestException("Version does not belong to this document");
    var usernames = userClient.getUsernames(Set.of(version.getCreatedById()));
    return new VersionContentResponse(
        version.getId(), version.getDocumentId(), version.getVersionNumber(), version.getState(), version.getLabel(),
        usernames.getOrDefault(version.getCreatedById(), null),
        version.getCreatedAt()
    );
  }

  @Transactional
  public void restoreVersion(UUID userId, UUID documentId, UUID versionId) {
    if (!validateAccess(documentId)) throw new BadRequestException("Access denied");
    DocumentVersion version = versionRepository.findById(versionId).orElseThrow(() -> new NotFoundException("Version not found"));
    if (!version.getDocumentId().equals(documentId)) throw new BadRequestException("Version does not belong to this document");
    String auth = getCurrentAuthorization();
    documentClient.overwriteContent(documentId, version.getState(), auth);
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override public void afterCommit() { collabClient.reloadDocument(documentId.toString()); }
    });
  }

  @Transactional
  public void deleteVersion(UUID userId, UUID documentId, UUID versionId) {
    // Verify owner via document-service
    UUID ownerId = getOwnerId(documentId);
    if (!ownerId.equals(userId)) throw new BadRequestException("Only the owner can delete versions");
    DocumentVersion version = versionRepository.findById(versionId).orElseThrow(() -> new NotFoundException("Version not found"));
    if (!version.getDocumentId().equals(documentId)) throw new BadRequestException("Version does not belong to this document");
    versionRepository.delete(version);
  }

  private void deleteOldestVersion(UUID documentId) {
    List<DocumentVersion> versions = versionRepository.findOldestVersionsByDocumentId(documentId);
    if (!versions.isEmpty()) versionRepository.delete(versions.get(0));
  }

  private VersionResponse toVersionResponse(DocumentVersion version) {
    var usernames = userClient.getUsernames(Set.of(version.getCreatedById()));
    return new VersionResponse(
        version.getId(),
        version.getDocumentId(),
        version.getVersionNumber(),
        version.getLabel(),
        usernames.getOrDefault(version.getCreatedById(), null),
        version.getCreatedAt());
  }

  private VersionContentResponse toVersionContentResponse(DocumentVersion version) {
    var usernames = userClient.getUsernames(Set.of(version.getCreatedById()));
    return new VersionContentResponse(
        version.getId(),
        version.getDocumentId(),
        version.getVersionNumber(),
        version.getState(),
        version.getLabel(),
        usernames.getOrDefault(version.getCreatedById(), null),
        version.getCreatedAt());
  }

  private boolean validateAccess(UUID documentId) {
    try {
      String auth = getCurrentAuthorization();
      String url = "http://gateway:8080/api/documents/validate-access";
      org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
      headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
      if (auth != null) headers.set("Authorization", auth);
      var body = java.util.Map.of("documentId", documentId);
      var entity = new org.springframework.http.HttpEntity<>(body, headers);
      var rest = new org.springframework.web.client.RestTemplate();
      var res = rest.postForEntity(url, entity, java.util.Map.class);
      Object ok = res.getBody() != null ? ((java.util.Map<?,?>)res.getBody()).get("hasAccess") : null;
      return Boolean.TRUE.equals(ok);
    } catch (Exception e) { return false; }
  }

  private UUID getOwnerId(UUID documentId) {
    try {
      String auth = getCurrentAuthorization();
      String url = "http://gateway:8080/api/internal/documents/" + documentId + "/owner";
      org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
      if (auth != null) headers.set("Authorization", auth);
      var entity = new org.springframework.http.HttpEntity<>(headers);
      var rest = new org.springframework.web.client.RestTemplate();
      var res = rest.exchange(url, org.springframework.http.HttpMethod.GET, entity, java.util.Map.class);
      var body = res.getBody();
      if (body != null && body.get("ownerId") != null) return java.util.UUID.fromString(String.valueOf(body.get("ownerId")));
    } catch (Exception ignored) {}
    throw new NotFoundException("Document not found");
  }

  private String getCurrentAuthorization() {
    try {
      var attrs = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
      if (attrs instanceof org.springframework.web.context.request.ServletRequestAttributes sra) {
        String h = sra.getRequest().getHeader("Authorization");
        return h;
      }
    } catch (Exception ignored) {}
    return null;
  }
}
