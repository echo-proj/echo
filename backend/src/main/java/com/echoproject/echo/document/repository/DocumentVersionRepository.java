package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.DocumentVersion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, UUID> {

  @Query("SELECT v FROM DocumentVersion v WHERE v.document.id = :documentId ORDER BY v.versionNumber DESC")
  List<DocumentVersion> findByDocumentIdOrderByVersionNumberDesc(@Param("documentId") UUID documentId);

  @Query("SELECT COUNT(v) FROM DocumentVersion v WHERE v.document.id = :documentId")
  long countByDocumentId(@Param("documentId") UUID documentId);

  @Query("SELECT MAX(v.versionNumber) FROM DocumentVersion v WHERE v.document.id = :documentId")
  Optional<Integer> findMaxVersionNumberByDocumentId(@Param("documentId") UUID documentId);

  @Query("SELECT v FROM DocumentVersion v WHERE v.document.id = :documentId ORDER BY v.versionNumber ASC")
  List<DocumentVersion> findOldestVersionsByDocumentId(@Param("documentId") UUID documentId);
}
