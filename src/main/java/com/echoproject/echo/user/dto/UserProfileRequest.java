package com.echoproject.echo.user.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
  private String fullName;
  private String phoneNumber;
  private String profilePicture;
}
