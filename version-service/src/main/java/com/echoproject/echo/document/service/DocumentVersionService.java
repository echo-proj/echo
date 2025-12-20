package com.echoproject.echo.document.service;

import com.echoproject.echo.common.exception.BadRequestException;
import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.document.domain.DocumentAccessControl;
import com.echoproject.echo.document.dto.CreateVersionRequest;
import com.echoproject.echo.document.dto.VersionContentResponse;
import com.echoproject.echo.document.dto.VersionResponse;
import com.echoproject.echo.document.models.Document;
import com.echoproject.echo.document.models.DocumentContent;
import com.echoproject.echo.document.models.DocumentVersion;
import com.echoproject.echo.document.repository.DocumentCollaboratorRepository;
import com.echoproject.echo.document.repository.DocumentContentRepository;
import com.echoproject.echo.document.repository.DocumentRepository;
import com.echoproject.echo.document.repository.DocumentVersionRepository;
import com.echoproject.echo.notification.client.CollaborationServiceClient;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.repository.UserRepository;
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
  private final DocumentRepository documentRepository;
  private final DocumentContentRepository contentRepository;
  private final DocumentCollaboratorRepository collaboratorRepository;
  private final UserRepository userRepository;
  private final CollaborationServiceClient collabClient;

  @Transactional
  public VersionResponse createVersion(UUID userId, UUID documentId, CreateVersionRequest request) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUser().getId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwner().getId(), collaboratorIds)) throw new BadRequestException("Access denied");
    DocumentContent content = contentRepository.findByDocumentId(documentId).orElseThrow(() -> new BadRequestException("Document has no content to version"));
    long versionCount = versionRepository.countByDocumentId(documentId);
    if (versionCount >= MAX_VERSIONS_PER_DOCUMENT) deleteOldestVersion(documentId);
    Integer nextVersionNumber = versionRepository.findMaxVersionNumberByDocumentId(documentId).map(max -> max + 1).orElse(1);
    User createdBy = userRepository.findById(userId).orElseThrow();
    DocumentVersion version = new DocumentVersion(document, nextVersionNumber, content.getState(), createdBy, request.getLabel());
    versionRepository.save(version);
    return toVersionResponse(version);
  }

  @Transactional(readOnly = true)
  public List<VersionResponse> getDocumentVersions(UUID userId, UUID documentId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUser().getId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwner().getId(), collaboratorIds)) throw new BadRequestException("Access denied");
    return versionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId).stream().map(this::toVersionResponse).toList();
  }

  @Transactional(readOnly = true)
  public VersionContentResponse getVersionContent(UUID userId, UUID documentId, UUID versionId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUser().getId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwner().getId(), collaboratorIds)) throw new BadRequestException("Access denied");
    DocumentVersion version = versionRepository.findById(versionId).orElseThrow(() -> new NotFoundException("Version not found"));
    if (!version.getDocument().getId().equals(documentId)) throw new BadRequestException("Version does not belong to this document");
    return toVersionContentResponse(version);
  }

  @Transactional
  public void restoreVersion(UUID userId, UUID documentId, UUID versionId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUser().getId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwner().getId(), collaboratorIds)) throw new BadRequestException("Access denied");
    DocumentVersion version = versionRepository.findById(versionId).orElseThrow(() -> new NotFoundException("Version not found"));
    if (!version.getDocument().getId().equals(documentId)) throw new BadRequestException("Version does not belong to this document");
    DocumentContent content = contentRepository.findByDocumentId(documentId).orElseGet(() -> new DocumentContent(document));
    content.setState(version.getState());
    contentRepository.save(content);
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override public void afterCommit() { collabClient.reloadDocument(documentId.toString()); }
    });
  }

  @Transactional
  public void deleteVersion(UUID userId, UUID documentId, UUID versionId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    if (!DocumentAccessControl.isOwner(userId, document.getOwner().getId())) throw new BadRequestException("Only the owner can delete versions");
    DocumentVersion version = versionRepository.findById(versionId).orElseThrow(() -> new NotFoundException("Version not found"));
    if (!version.getDocument().getId().equals(documentId)) throw new BadRequestException("Version does not belong to this document");
    versionRepository.delete(version);
  }

  private void deleteOldestVersion(UUID documentId) {
    List<DocumentVersion> versions = versionRepository.findOldestVersionsByDocumentId(documentId);
    if (!versions.isEmpty()) versionRepository.delete(versions.get(0));
  }

  private VersionResponse toVersionResponse(DocumentVersion version) {
    return new VersionResponse(
        version.getId(),
        version.getDocument().getId(),
        version.getVersionNumber(),
        version.getLabel(),
        version.getCreatedBy().getUsername(),
        version.getCreatedAt());
  }

  private VersionContentResponse toVersionContentResponse(DocumentVersion version) {
    return new VersionContentResponse(
        version.getId(),
        version.getDocument().getId(),
        version.getVersionNumber(),
        version.getState(),
        version.getLabel(),
        version.getCreatedBy().getUsername(),
        version.getCreatedAt());
  }
}
