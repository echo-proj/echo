package com.echoproject.echo.document.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DocumentContentResponse {
  private UUID documentId;
  private byte[] state;
  private LocalDateTime updatedAt;
}
