package com.echoproject.echo.document.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DocumentResponse {
  private UUID id;
  private String title;
  private String ownerUsername;
  private List<CollaboratorResponse> collaborators;
  private Instant createdAt;
  private Instant updatedAt;
}
