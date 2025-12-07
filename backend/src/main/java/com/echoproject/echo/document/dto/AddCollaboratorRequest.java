package com.echoproject.echo.document.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AddCollaboratorRequest {

  @NotBlank(message = "Username is required")
  private String username;
}
