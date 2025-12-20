package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.DocumentVersion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, UUID> {
  List<DocumentVersion> findByDocumentIdOrderByVersionNumberDesc(UUID documentId);

  @Query("SELECT COUNT(v) FROM DocumentVersion v WHERE v.documentId = :documentId")
  long countByDocumentId(UUID documentId);

  @Query("SELECT MAX(v.versionNumber) FROM DocumentVersion v WHERE v.documentId = :documentId")
  Optional<Integer> findMaxVersionNumberByDocumentId(UUID documentId);

  @Query(value = "SELECT * FROM document_versions WHERE document_id = :documentId ORDER BY created_at ASC LIMIT 1", nativeQuery = true)
  List<DocumentVersion> findOldestVersionsByDocumentId(UUID documentId);
}
