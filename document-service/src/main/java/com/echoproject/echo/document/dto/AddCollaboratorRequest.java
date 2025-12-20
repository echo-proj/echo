package com.echoproject.echo.document.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddCollaboratorRequest {
  @NotBlank private String username;
}

