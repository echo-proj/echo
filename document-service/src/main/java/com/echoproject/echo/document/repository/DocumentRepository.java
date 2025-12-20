package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.Document;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
  @Query("SELECT d FROM Document d WHERE d.owner.id = :userId OR d.id IN (SELECT dc.document.id FROM DocumentCollaborator dc WHERE dc.user.id = :userId)")
  List<Document> findAllAccessibleByUser(UUID userId);
}

