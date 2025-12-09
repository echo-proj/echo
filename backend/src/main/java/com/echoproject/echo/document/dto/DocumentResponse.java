package com.echoproject.echo.document.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {

  private UUID id;
  private String title;
  private String ownerUsername;
  private List<CollaboratorResponse> collaborators;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
