package com.echoproject.echo.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileRequest {
  private String fullName;
  private String phoneNumber;
  private String profilePicture;
}

