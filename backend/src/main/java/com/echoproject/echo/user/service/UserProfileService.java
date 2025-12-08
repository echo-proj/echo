package com.echoproject.echo.user.service;

import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.user.dto.UserProfileRequest;
import com.echoproject.echo.user.dto.UserProfileResponse;
import com.echoproject.echo.user.dto.UserSearchResponse;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.models.UserProfile;
import com.echoproject.echo.user.repository.UserProfileRepository;
import com.echoproject.echo.user.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileService {

  private final UserProfileRepository userProfileRepository;
  private final UserRepository userRepository;

  public UserProfileResponse getProfile(String username) {
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new NotFoundException("User not found"));

    UserProfile profile =
        userProfileRepository
            .findByUserId(user.getId())
            .orElseThrow(() -> new NotFoundException("Profile not found"));

    return new UserProfileResponse(
        profile.getId(),
        user.getUsername(),
        profile.getFullName(),
        profile.getPhoneNumber(),
        profile.getProfilePicture());
  }

  public UserProfileResponse updateProfile(String username, UserProfileRequest request) {
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new NotFoundException("User not found"));

    UserProfile profile =
        userProfileRepository
            .findByUserId(user.getId())
            .orElseThrow(() -> new NotFoundException("Profile not found"));

    profile.setFullName(request.getFullName());
    profile.setPhoneNumber(request.getPhoneNumber());
    profile.setProfilePicture(request.getProfilePicture());

    userProfileRepository.save(profile);

    return new UserProfileResponse(
        profile.getId(),
        user.getUsername(),
        profile.getFullName(),
        profile.getPhoneNumber(),
        profile.getProfilePicture());
  }

  public List<UserSearchResponse> searchUsers(String query) {
    if (query == null || query.trim().isEmpty()) {
      return List.of();
    }

    List<User> users = userRepository.searchByUsername(query.trim());

    return users.stream()
        .map(
            user -> {
              UserProfile profile = user.getProfile();
              return new UserSearchResponse(
                  user.getId(),
                  user.getUsername(),
                  profile != null ? profile.getFullName() : null,
                  profile != null ? profile.getProfilePicture() : null);
            })
        .limit(10)
        .collect(Collectors.toList());
  }
}
