package com.echoproject.echo.integration.user;

import static org.assertj.core.api.Assertions.assertThat;

import com.echoproject.echo.user.dto.RegisterRequest;
import com.echoproject.echo.user.dto.UserProfileRequest;
import com.echoproject.echo.user.dto.UserProfileResponse;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.models.UserProfile;
import com.echoproject.echo.user.repository.UserProfileRepository;
import com.echoproject.echo.user.repository.UserRepository;
import com.echoproject.echo.user.service.AuthService;
import com.echoproject.echo.user.service.UserProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class UserProfileServiceIntegrationTest {

  @Autowired private UserProfileService userProfileService;

  @Autowired private AuthService authService;

  @Autowired private UserRepository userRepository;

  @Autowired private UserProfileRepository userProfileRepository;

  @BeforeEach
  void setUp() {
    userProfileRepository.deleteAll();
    userRepository.deleteAll();
  }

  @Test
  void shouldGetProfileSuccessfully() {
    // Given
    RegisterRequest registerRequest = new RegisterRequest();
    registerRequest.setUsername("testuser");
    registerRequest.setPassword("password123");
    authService.register(registerRequest);

    // When
    UserProfileResponse response = userProfileService.getProfile("testuser");

    // Then
    assertThat(response).isNotNull();
    assertThat(response.getUsername()).isEqualTo("testuser");
    assertThat(response.getFullName()).isNull();
    assertThat(response.getPhoneNumber()).isNull();
    assertThat(response.getProfilePicture()).isNull();
  }

  @Test
  void shouldUpdateProfileSuccessfully() {
    // Given
    RegisterRequest registerRequest = new RegisterRequest();
    registerRequest.setUsername("testuser");
    registerRequest.setPassword("password123");
    authService.register(registerRequest);

    UserProfileRequest updateRequest = new UserProfileRequest();
    updateRequest.setFullName("John Doe");
    updateRequest.setPhoneNumber("+1234567890");
    updateRequest.setProfilePicture("https://example.com/profile.jpg");

    // When
    UserProfileResponse response =
        userProfileService.updateProfile("testuser", updateRequest);

    // Then
    assertThat(response).isNotNull();
    assertThat(response.getUsername()).isEqualTo("testuser");
    assertThat(response.getFullName()).isEqualTo("John Doe");
    assertThat(response.getPhoneNumber()).isEqualTo("+1234567890");
    assertThat(response.getProfilePicture()).isEqualTo("https://example.com/profile.jpg");
  }

  @Test
  void shouldSearchUsersSuccessfully() {
    // Given
    var user1 = new User("alice", "password123");
    var user2 = new User("bob", "password123");
    var user3 = new User("charlie", "password123");

    userRepository.save(user1);
    userRepository.save(user2);
    userRepository.save(user3);

    var profile1 = new UserProfile();
    profile1.setUser(user1);
    profile1.setFullName("Alice Johnson");
    userProfileRepository.save(profile1);

    var profile2 = new UserProfile();
    profile2.setUser(user2);
    profile2.setFullName("Bob Smith");
    userProfileRepository.save(profile2);

    var profile3 = new UserProfile();
    profile3.setUser(user3);
    profile3.setFullName("Charlie Brown");
    userProfileRepository.save(profile3);

    var results = userProfileService.searchUsers("al");

    assertThat(results).hasSize(1);
    assertThat(results).extracting("username").contains("alice");
    assertThat(results).extracting("fullName").contains("Alice Johnson");

    var aliceResult = results.stream()
        .filter(user -> "alice".equals(user.getUsername()))
        .findFirst()
        .orElse(null);
    assertThat(aliceResult).isNotNull();
    assertThat(aliceResult.getFullName()).isEqualTo("Alice Johnson");
  }
}
