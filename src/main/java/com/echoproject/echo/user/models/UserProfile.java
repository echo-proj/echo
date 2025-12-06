package com.echoproject.echo.user.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(name = "full_name")
  private String fullName;

  @Column(name = "phone_number")
  private String phoneNumber;

  @Column(name = "profile_picture")
  private String profilePicture;

  @CreationTimestamp
  @Column(updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp private LocalDateTime updatedAt;
}
