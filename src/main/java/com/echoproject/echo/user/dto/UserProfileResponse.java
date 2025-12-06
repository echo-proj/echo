package com.echoproject.echo.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {
  private Long id;
  private String username;
  private String fullName;
  private String phoneNumber;
  private String profilePicture;
}
