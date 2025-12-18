package com.echoproject.echo.user.controller;

import com.echoproject.echo.security.service.CustomUserDetails;
import com.echoproject.echo.user.dto.AuthResponse;
import com.echoproject.echo.user.dto.LoginRequest;
import com.echoproject.echo.user.dto.RegisterRequest;
import com.echoproject.echo.user.dto.UserInfoResponse;
import com.echoproject.echo.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    AuthResponse response = authService.register(request);
    return ResponseEntity.ok(response);
  }

  // check check
  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    AuthResponse response = authService.login(request);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/me")
  public ResponseEntity<UserInfoResponse> getCurrentUser(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    UserInfoResponse response = new UserInfoResponse(userDetails.getId(), userDetails.getUsername());
    return ResponseEntity.ok(response);
  }
}
