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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {
  private final UserRepository userRepository;
  private final UserProfileRepository profileRepository;

  @Transactional(readOnly = true)
  public UserProfileResponse getProfile(String username) {
    UserProfile profile = profileRepository.findByUserUsername(username)
        .orElseThrow(() -> new NotFoundException("Profile not found"));
    return toResponse(profile);
  }

  @Transactional
  public UserProfileResponse updateProfile(String username, UserProfileRequest request) {
    User user = userRepository.findByUsername(username).orElseThrow(() -> new NotFoundException("User not found"));
    UserProfile profile = user.getProfile();
    if (profile == null) {
      profile = new UserProfile(user);
    }
    profile.setFullName(request.getFullName());
    profile.setPhoneNumber(request.getPhoneNumber());
    profile.setProfilePicture(request.getProfilePicture());
    profileRepository.save(profile);
    return toResponse(profile);
  }

  @Transactional(readOnly = true)
  public List<UserSearchResponse> searchUsers(String query) {
    if (query == null || query.isBlank()) return List.of();
    return userRepository.searchByUsername(query.trim()).stream()
        .map(u -> new UserSearchResponse(u.getId(), u.getUsername(),
            u.getProfile() != null ? u.getProfile().getFullName() : null,
            u.getProfile() != null ? u.getProfile().getProfilePicture() : null))
        .limit(10)
        .toList();
  }

  private UserProfileResponse toResponse(UserProfile profile) {
    return new UserProfileResponse(
        profile.getUser().getId(),
        profile.getUser().getUsername(),
        profile.getFullName(),
        profile.getPhoneNumber(),
        profile.getProfilePicture());
  }
}

