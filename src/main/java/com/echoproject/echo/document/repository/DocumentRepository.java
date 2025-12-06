package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.Document;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

  @Query(
      "SELECT d FROM Document d LEFT JOIN DocumentCollaborator dc ON d.id = dc.document.id "
          + "WHERE d.owner.id = :userId OR dc.user.id = :userId")
  List<Document> findAllAccessibleByUser(@Param("userId") UUID userId);
}
