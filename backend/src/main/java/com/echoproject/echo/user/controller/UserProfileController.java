package com.echoproject.echo.user.controller;

import com.echoproject.echo.user.dto.UserProfileRequest;
import com.echoproject.echo.user.dto.UserProfileResponse;
import com.echoproject.echo.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

  private final UserProfileService userProfileService;

  @GetMapping
  public ResponseEntity<UserProfileResponse> getProfile(
      @AuthenticationPrincipal UserDetails userDetails) {
    UserProfileResponse response = userProfileService.getProfile(userDetails.getUsername());
    return ResponseEntity.ok(response);
  }

  @PutMapping
  public ResponseEntity<UserProfileResponse> updateProfile(
      @AuthenticationPrincipal UserDetails userDetails, @RequestBody UserProfileRequest request) {
    UserProfileResponse response =
        userProfileService.updateProfile(userDetails.getUsername(), request);
    return ResponseEntity.ok(response);
  }
}
