package com.echoproject.echo.document.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CollaboratorResponse {
  private UUID id;
  private String username;
  private String fullName;
  private String profilePicture;
}

