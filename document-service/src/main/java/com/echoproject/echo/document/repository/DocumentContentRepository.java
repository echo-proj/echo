package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.DocumentContent;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentContentRepository extends JpaRepository<DocumentContent, UUID> {
  @Query("SELECT dc FROM DocumentContent dc WHERE dc.document.id = :documentId")
  Optional<DocumentContent> findByDocumentId(UUID documentId);
}

