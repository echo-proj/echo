package com.echoproject.echo.user.service;

import com.echoproject.echo.common.util.JwtUtil;
import com.echoproject.echo.user.dto.AuthResponse;
import com.echoproject.echo.user.dto.LoginRequest;
import com.echoproject.echo.user.dto.RegisterRequest;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.models.UserProfile;
import com.echoproject.echo.user.repository.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    Optional<User> existing = userRepository.findByUsername(request.getUsername());
    if (existing.isPresent()) {
      throw new IllegalArgumentException("Username already exists");
    }
    User user = new User(request.getUsername(), passwordEncoder.encode(request.getPassword()));
    UserProfile profile = new UserProfile(user);
    if (request.getFullName() != null && !request.getFullName().isBlank()) {
      profile.setFullName(request.getFullName());
    }
    user.setProfile(profile);
    userRepository.save(user);
    String token = jwtUtil.generateToken(user.getUsername());
    return new AuthResponse(token, user.getUsername());
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByUsername(request.getUsername()).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new IllegalArgumentException("Invalid credentials");
    }
    return new AuthResponse(jwtUtil.generateToken(user.getUsername()), user.getUsername());
  }
}
