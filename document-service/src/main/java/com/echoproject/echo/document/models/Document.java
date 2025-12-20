package com.echoproject.echo.document.models;

import com.echoproject.echo.user.models.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
public class Document {
  @Id private UUID id;
  @Column(nullable = false) private String title;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "owner_id", nullable = false)
  private User owner;
  @Column(name = "created_at", nullable = false) private Instant createdAt;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;

  public Document(String title, User owner) {
    this.id = UUID.randomUUID();
    this.title = title;
    this.owner = owner;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }
}

