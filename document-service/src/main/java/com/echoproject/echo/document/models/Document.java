package com.echoproject.echo.document.models;

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
  @Column(name = "owner_id", nullable = false) private UUID ownerId;
  @Column(name = "created_at", nullable = false) private Instant createdAt;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;

  public Document(String title, UUID ownerId) {
    this.id = UUID.randomUUID();
    this.title = title;
    this.ownerId = ownerId;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }
}
