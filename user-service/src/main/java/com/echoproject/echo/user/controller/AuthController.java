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
    return ResponseEntity.ok(authService.register(request));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @GetMapping("/me")
  public ResponseEntity<UserInfoResponse> me(@AuthenticationPrincipal CustomUserDetails user) {
    return ResponseEntity.ok(new UserInfoResponse(user.getId(), user.getUsername()));
  }
}

