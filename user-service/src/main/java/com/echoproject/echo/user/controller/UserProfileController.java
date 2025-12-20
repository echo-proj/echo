package com.echoproject.echo.user.controller;

import com.echoproject.echo.user.dto.UserProfileRequest;
import com.echoproject.echo.user.dto.UserProfileResponse;
import com.echoproject.echo.user.dto.UserSearchResponse;
import com.echoproject.echo.user.service.UserProfileService;
import java.util.List;
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
  public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(userProfileService.getProfile(userDetails.getUsername()));
  }
  @PutMapping
  public ResponseEntity<UserProfileResponse> updateProfile(
      @AuthenticationPrincipal UserDetails userDetails, @RequestBody UserProfileRequest request) {
    return ResponseEntity.ok(userProfileService.updateProfile(userDetails.getUsername(), request));
  }
  @GetMapping("/search")
  public ResponseEntity<List<UserSearchResponse>> searchUsers(@RequestParam(required = false) String query) {
    return ResponseEntity.ok(userProfileService.searchUsers(query));
  }
}

