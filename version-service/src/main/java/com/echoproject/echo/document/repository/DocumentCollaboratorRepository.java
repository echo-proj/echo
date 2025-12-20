package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.DocumentCollaborator;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentCollaboratorRepository extends JpaRepository<DocumentCollaborator, UUID> {
  @Query("SELECT dc FROM DocumentCollaborator dc WHERE dc.document.id = :documentId")
  List<DocumentCollaborator> findByDocumentId(UUID documentId);
}

