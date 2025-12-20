package com.echoproject.echo.user.repository;

import com.echoproject.echo.user.models.UserProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
  Optional<UserProfile> findByUserUsername(String username);
}

