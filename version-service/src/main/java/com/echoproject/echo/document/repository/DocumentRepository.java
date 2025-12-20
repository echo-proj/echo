package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.Document;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, UUID> {}

