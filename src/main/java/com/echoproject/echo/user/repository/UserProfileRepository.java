package com.echoproject.echo.user.repository;

import com.echoproject.echo.user.models.UserProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
  Optional<UserProfile> findByUserId(Long userId);
}
