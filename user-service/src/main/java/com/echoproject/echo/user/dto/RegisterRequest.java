package com.echoproject.echo.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
  @NotBlank
  @Size(min = 2, max = 100)
  private String fullName;
  @NotBlank private String username;
  @NotBlank private String password;
}
