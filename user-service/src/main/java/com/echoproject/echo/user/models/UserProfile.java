package com.echoproject.echo.user.models;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
public class UserProfile {
  @Id private UUID id;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(name = "full_name")
  private String fullName;

  @Column(name = "phone_number")
  private String phoneNumber;

  @Column(name = "profile_picture")
  private String profilePicture;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public UserProfile(User user) {
    this.id = UUID.randomUUID();
    this.user = user;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }
}

