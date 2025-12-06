package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.DocumentCollaborator;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentCollaboratorRepository extends JpaRepository<DocumentCollaborator, UUID> {

  List<DocumentCollaborator> findByDocumentId(UUID documentId);

  boolean existsByDocumentIdAndUserId(UUID documentId, UUID userId);

  void deleteByDocumentIdAndUserId(UUID documentId, UUID userId);
}
