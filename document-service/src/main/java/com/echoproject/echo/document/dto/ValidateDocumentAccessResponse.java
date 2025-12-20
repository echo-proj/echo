package com.echoproject.echo.document.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ValidateDocumentAccessResponse {
  private boolean hasAccess;
  private UUID userId;
  private String username;
}

