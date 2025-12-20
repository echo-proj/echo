package com.echoproject.echo.document.service;

import com.echoproject.echo.common.exception.BadRequestException;
import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.document.domain.DocumentAccessControl;
import com.echoproject.echo.document.dto.AddCollaboratorRequest;
import com.echoproject.echo.document.dto.CollaboratorResponse;
import com.echoproject.echo.document.dto.CreateDocumentRequest;
import com.echoproject.echo.document.dto.DocumentContentResponse;
import com.echoproject.echo.document.dto.DocumentResponse;
import com.echoproject.echo.document.dto.UpdateDocumentRequest;
import com.echoproject.echo.document.models.Document;
import com.echoproject.echo.document.models.DocumentCollaborator;
import com.echoproject.echo.document.models.DocumentContent;
import com.echoproject.echo.document.repository.DocumentCollaboratorRepository;
import com.echoproject.echo.document.repository.DocumentContentRepository;
import com.echoproject.echo.document.repository.DocumentRepository;
import com.echoproject.echo.notification.client.CollaborationServiceClient;
import com.echoproject.echo.notification.models.NotificationType;
import com.echoproject.echo.notification.service.NotificationService;
import com.echoproject.echo.user.dto.UserSearchResponse;
import com.echoproject.echo.user.client.UserServiceClient;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentService {

  private final DocumentRepository documentRepository;
  private final DocumentCollaboratorRepository collaboratorRepository;
  private final DocumentContentRepository contentRepository;
  private final UserServiceClient userClient;
  private final NotificationService notificationService;
  private final CollaborationServiceClient collaborationServiceClient;

  @Transactional
  public DocumentResponse createDocument(UUID userId, CreateDocumentRequest request) {
    Document document = new Document(request.getTitle(), userId);
    documentRepository.save(document);
    var sum = userClient.getSummaries(java.util.Set.of(userId)).get(userId);
    String ownerUsername = sum != null ? sum.username() : null;
    return toResponseWithoutCollaborators(document, ownerUsername);
  }

  @Transactional(readOnly = true)
  public List<DocumentResponse> getUserDocuments(UUID userId) {
    List<Document> documents = documentRepository.findAllAccessibleByUser(userId);
    var ownerIds = documents.stream().map(Document::getOwnerId).collect(Collectors.toSet());
    var ownerSummaries = userClient.getSummaries(ownerIds);
    return documents.stream().map(d -> toResponseWithoutCollaborators(d, ownerSummaries.get(d.getOwnerId()) != null ? ownerSummaries.get(d.getOwnerId()).username() : null)).toList();
  }

  @Transactional(readOnly = true)
  public DocumentResponse getDocument(UUID userId, UUID documentId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    List<DocumentCollaborator> documentCollaborators = collaboratorRepository.findByDocumentId(documentId);
    Set<UUID> collaboratorIds = documentCollaborators.stream().map(dc -> dc.getUserId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwnerId(), collaboratorIds)) {
      throw new BadRequestException("Access denied");
    }
    return toResponseWithCollaborators(document, documentCollaborators);
  }

  @Transactional
  public void deleteDocument(UUID userId, UUID documentId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    if (!DocumentAccessControl.isOwner(userId, document.getOwnerId())) {
      throw new BadRequestException("Only the owner can delete the document");
    }
    documentRepository.delete(document);
  }

  @Transactional
  public DocumentResponse updateDocument(UUID userId, UUID documentId, UpdateDocumentRequest request) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUserId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwnerId(), collaboratorIds)) {
      throw new BadRequestException("Access denied");
    }
    document.setTitle(request.getTitle());
    documentRepository.save(document);
    List<DocumentCollaborator> documentCollaborators = collaboratorRepository.findByDocumentId(documentId);
    return toResponseWithCollaborators(document, documentCollaborators);
  }

  @Transactional
  public void addCollaborator(UUID userId, UUID documentId, AddCollaboratorRequest request) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    if (!DocumentAccessControl.isOwner(userId, document.getOwnerId())) {
      throw new BadRequestException("Only the owner can add collaborators");
    }
    var coll = userClient.getByUsername(request.getUsername()).orElseThrow(() -> new NotFoundException("Collaborator user not found"));
    Set<UUID> existingCollaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUserId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.canAddCollaborator(coll.id(), document.getOwnerId(), existingCollaboratorIds)) {
      throw new BadRequestException("Cannot add this user as a collaborator");
    }
    DocumentCollaborator documentCollaborator = new DocumentCollaborator(document, coll.id());
    collaboratorRepository.save(documentCollaborator);
    notificationService.createNotification(coll.id(), NotificationType.COLLABORATOR_ADDED, documentId, userId);
    collaborationServiceClient.broadcastDocumentUpdate(List.of(coll.id()), documentId);
  }

  @Transactional
  public void removeCollaborator(UUID userId, UUID documentId, UUID collaboratorUserId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    if (!DocumentAccessControl.isOwner(userId, document.getOwnerId())) {
      throw new BadRequestException("Only the owner can remove collaborators");
    }
    Set<UUID> existingCollaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUserId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.isCollaborator(collaboratorUserId, existingCollaboratorIds)) {
      throw new NotFoundException("Collaborator not found");
    }
    notificationService.createNotification(collaboratorUserId, NotificationType.COLLABORATOR_REMOVED, documentId, userId);
    collaborationServiceClient.broadcastDocumentUpdate(List.of(collaboratorUserId), documentId);
    collaboratorRepository.deleteByDocumentIdAndUserId(documentId, collaboratorUserId);
  }

  @Transactional(readOnly = true)
  public List<UserSearchResponse> searchAvailableCollaborators(UUID userId, UUID documentId, String query) {
    if (query == null || query.trim().isEmpty()) return List.of();
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUserId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwnerId(), collaboratorIds)) {
      throw new BadRequestException("Access denied");
    }
    var results = userClient.search(query.trim());
    UUID ownerId = document.getOwnerId();
    return results.stream()
        .filter(r -> !r.id().equals(ownerId) && !collaboratorIds.contains(r.id()))
        .limit(10)
        .map(r -> new UserSearchResponse(r.id(), r.username(), r.fullName(), r.profilePicture()))
        .toList();
  }

  @Transactional(readOnly = true)
  public boolean validateDocumentAccess(UUID userId, UUID documentId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUserId()).collect(Collectors.toSet());
    return DocumentAccessControl.hasAccess(userId, document.getOwnerId(), collaboratorIds);
  }

  @Transactional
  public void saveDocumentContent(UUID userId, UUID documentId, byte[] state) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUserId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwnerId(), collaboratorIds)) {
      throw new BadRequestException("Access denied");
    }
    DocumentContent content = contentRepository.findByDocumentId(documentId).orElseGet(() -> new DocumentContent(document));
    content.setState(state);
    contentRepository.save(content);
  }

  @Transactional(readOnly = true)
  public DocumentContentResponse getDocumentContent(UUID userId, UUID documentId) {
    Document document = documentRepository.findById(documentId).orElseThrow(() -> new NotFoundException("Document not found"));
    Set<UUID> collaboratorIds = collaboratorRepository.findByDocumentId(documentId).stream().map(dc -> dc.getUserId()).collect(Collectors.toSet());
    if (!DocumentAccessControl.hasAccess(userId, document.getOwnerId(), collaboratorIds)) {
      throw new BadRequestException("Access denied");
    }
    DocumentContent content = contentRepository.findByDocumentId(documentId).orElse(null);
    if (content == null) return new DocumentContentResponse(documentId, new byte[0], null);
    return new DocumentContentResponse(documentId, content.getState(), content.getUpdatedAt());
  }

  private DocumentResponse toResponseWithoutCollaborators(Document document, String ownerUsername) {
    return new DocumentResponse(document.getId(), document.getTitle(), ownerUsername, Collections.emptyList(), document.getCreatedAt(), document.getUpdatedAt());
  }

  private DocumentResponse toResponseWithCollaborators(Document document, List<DocumentCollaborator> documentCollaborators) {
    List<UUID> collaboratorIds = documentCollaborators.stream().map(DocumentCollaborator::getUserId).toList();
    Set<UUID> fetchIds = new java.util.HashSet<>(collaboratorIds);
    fetchIds.add(document.getOwnerId());
    var summaries = userClient.getSummaries(fetchIds);
    List<CollaboratorResponse> collaborators = collaboratorIds.stream().map(id -> {
      var s = summaries.get(id);
      return new CollaboratorResponse(id, s != null ? s.username() : null, s != null ? s.fullName() : null, s != null ? s.profilePicture() : null);
    }).toList();
    String ownerUsername = summaries.get(document.getOwnerId()) != null ? summaries.get(document.getOwnerId()).username() : null;
    return new DocumentResponse(document.getId(), document.getTitle(), ownerUsername, collaborators, document.getCreatedAt(), document.getUpdatedAt());
  }
}
