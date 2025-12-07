package com.echoproject.echo.document.service;

import com.echoproject.echo.common.exception.BadRequestException;
import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.document.domain.DocumentAccessControl;
import com.echoproject.echo.document.dto.AddCollaboratorRequest;
import com.echoproject.echo.document.dto.CreateDocumentRequest;
import com.echoproject.echo.document.dto.DocumentResponse;
import com.echoproject.echo.document.models.Document;
import com.echoproject.echo.document.models.DocumentCollaborator;
import com.echoproject.echo.document.repository.DocumentCollaboratorRepository;
import com.echoproject.echo.document.repository.DocumentRepository;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.repository.UserRepository;
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
  private final UserRepository userRepository;

  @Transactional
  public DocumentResponse createDocument(UUID userId, CreateDocumentRequest request) {
    User owner = userRepository.findById(userId).orElseThrow();

    Document document = new Document(request.getTitle(), owner);
    documentRepository.save(document);

    return toResponse(document);
  }

  @Transactional(readOnly = true)
  public List<DocumentResponse> getUserDocuments(UUID userId) {
    List<Document> documents = documentRepository.findAllAccessibleByUser(userId);
    return documents.stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public DocumentResponse getDocument(UUID userId, UUID documentId) {
    Document document =
        documentRepository
            .findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));

    Set<UUID> collaboratorIds =
        collaboratorRepository.findByDocumentId(documentId).stream()
            .map(dc -> dc.getUser().getId())
            .collect(Collectors.toSet());

    if (!DocumentAccessControl.hasAccess(userId, document.getOwner().getId(), collaboratorIds)) {
      throw new BadRequestException("Access denied");
    }

    return toResponse(document);
  }

  @Transactional
  public void deleteDocument(UUID userId, UUID documentId) {
    Document document =
        documentRepository
            .findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));

    if (!DocumentAccessControl.isOwner(userId, document.getOwner().getId())) {
      throw new BadRequestException("Only the owner can delete the document");
    }

    documentRepository.delete(document);
  }

  @Transactional
  public void addCollaborator(UUID userId, UUID documentId, AddCollaboratorRequest request) {
    Document document =
        documentRepository
            .findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));

    if (!DocumentAccessControl.isOwner(userId, document.getOwner().getId())) {
      throw new BadRequestException("Only the owner can add collaborators");
    }

    User collaborator =
        userRepository
            .findByUsername(request.getUsername())
            .orElseThrow(() -> new NotFoundException("Collaborator user not found"));

    Set<UUID> existingCollaboratorIds =
        collaboratorRepository.findByDocumentId(documentId).stream()
            .map(dc -> dc.getUser().getId())
            .collect(Collectors.toSet());

    if (!DocumentAccessControl.canAddCollaborator(
        collaborator.getId(), document.getOwner().getId(), existingCollaboratorIds)) {
      throw new BadRequestException("Cannot add this user as a collaborator");
    }

    DocumentCollaborator documentCollaborator = new DocumentCollaborator(document, collaborator);
    collaboratorRepository.save(documentCollaborator);
  }

  @Transactional
  public void removeCollaborator(UUID userId, UUID documentId, UUID collaboratorUserId) {
    Document document =
        documentRepository
            .findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));

    if (!DocumentAccessControl.isOwner(userId, document.getOwner().getId())) {
      throw new BadRequestException("Only the owner can remove collaborators");
    }

    Set<UUID> existingCollaboratorIds =
        collaboratorRepository.findByDocumentId(documentId).stream()
            .map(dc -> dc.getUser().getId())
            .collect(Collectors.toSet());

    if (!DocumentAccessControl.isCollaborator(collaboratorUserId, existingCollaboratorIds)) {
      throw new NotFoundException("Collaborator not found");
    }

    collaboratorRepository.deleteByDocumentIdAndUserId(documentId, collaboratorUserId);
  }

  @Transactional(readOnly = true)
  public boolean validateDocumentAccess(UUID userId, UUID documentId) {
    Document document =
        documentRepository
            .findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));

    Set<UUID> collaboratorIds =
        collaboratorRepository.findByDocumentId(documentId).stream()
            .map(dc -> dc.getUser().getId())
            .collect(Collectors.toSet());

    return DocumentAccessControl.hasAccess(userId, document.getOwner().getId(), collaboratorIds);
  }

  private DocumentResponse toResponse(Document document) {
    return new DocumentResponse(
        document.getId(),
        document.getTitle(),
        document.getOwner().getUsername(),
        document.getCreatedAt(),
        document.getUpdatedAt());
  }
}
