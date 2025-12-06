package com.echoproject.echo.user.service;

import com.echoproject.echo.user.dto.AuthResponse;
import com.echoproject.echo.user.dto.LoginRequest;
import com.echoproject.echo.user.dto.RegisterRequest;
import com.echoproject.echo.common.util.JwtUtil;
import com.echoproject.echo.user.domain.UserLogin;
import com.echoproject.echo.user.domain.UserRegistration;
import com.echoproject.echo.user.repository.User;
import com.echoproject.echo.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        // Create domain object
        UserRegistration registration = new UserRegistration(
            request.getUsername(),
            request.getPassword()
        );

        // Domain validation (pure function)
        UserRegistration.ValidationResult validation = registration.validate();
        if (!validation.isValid()) {
            throw new RuntimeException(validation.errorMessage());
        }

        // Check if username exists (side effect - repository call)
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Create and persist user (side effect)
        User user = new User(
            request.getUsername(),
            passwordEncoder.encode(request.getPassword())
        );
        userRepository.save(user);

        // Generate token and return response
        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        // Create domain object
        UserLogin login = new UserLogin(
            request.getUsername(),
            request.getPassword()
        );

        // Domain validation (pure function)
        UserLogin.ValidationResult validation = login.validate();
        if (!validation.isValid()) {
            throw new RuntimeException(validation.errorMessage());
        }

        // Authenticate (side effect)
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Fetch user (side effect - repository call)
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate token and return response
        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }
}
