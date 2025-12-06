package com.echoproject.echo.user.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.echoproject.echo.user.dto.AuthResponse;
import com.echoproject.echo.user.dto.LoginRequest;
import com.echoproject.echo.user.dto.RegisterRequest;
import com.echoproject.echo.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        // Given
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(userRepository.findByUsername("testuser")).isPresent();
    }

    @Test
    void shouldLoginUserSuccessfully() {
        // Given
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setPassword("password123");
        authService.register(registerRequest);

        // When
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getUsername()).isEqualTo("testuser");
    }
}
