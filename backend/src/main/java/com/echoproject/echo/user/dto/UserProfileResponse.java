package com.echoproject.echo.user.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {
  private UUID id;
  private String username;
  private String fullName;
  private String phoneNumber;
  private String profilePicture;
}
