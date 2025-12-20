package com.echoproject.echo.document.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VersionResponse {
  private UUID id;
  private UUID documentId;
  private Integer versionNumber;
  private String label;
  private String createdByUsername;
  private LocalDateTime createdAt;
}
