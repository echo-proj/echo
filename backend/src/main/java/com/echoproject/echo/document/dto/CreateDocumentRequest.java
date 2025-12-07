package com.echoproject.echo.document.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateDocumentRequest {

  @NotBlank(message = "Title is required")
  private String title;
}
