package com.echoproject.echo.document.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidateDocumentAccessRequest {
  @NotNull private UUID documentId;
}

