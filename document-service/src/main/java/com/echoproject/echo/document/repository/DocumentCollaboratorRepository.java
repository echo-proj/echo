package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.DocumentCollaborator;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface DocumentCollaboratorRepository extends JpaRepository<DocumentCollaborator, UUID> {
  @Query("SELECT dc FROM DocumentCollaborator dc WHERE dc.document.id = :documentId")
  List<DocumentCollaborator> findByDocumentId(UUID documentId);

  @Modifying
  @Query("DELETE FROM DocumentCollaborator dc WHERE dc.document.id = :documentId AND dc.userId = :userId")
  void deleteByDocumentIdAndUserId(UUID documentId, UUID userId);
}
