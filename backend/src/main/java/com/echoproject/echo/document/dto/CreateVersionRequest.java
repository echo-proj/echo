package com.echoproject.echo.document.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateVersionRequest {
  @Size(max = 100, message = "Label must not exceed 100 characters")
  private String label;
}
