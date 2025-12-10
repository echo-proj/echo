package com.echoproject.echo.document.repository;

import com.echoproject.echo.document.models.DocumentContent;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentContentRepository extends JpaRepository<DocumentContent, UUID> {}
