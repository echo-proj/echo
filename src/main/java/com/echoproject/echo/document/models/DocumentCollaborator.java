package com.echoproject.echo.document.models;

import com.echoproject.echo.user.models.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
    name = "document_collaborators",
    uniqueConstraints = @UniqueConstraint(columnNames = {"document_id", "user_id"}))
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentCollaborator {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "document_id", nullable = false)
  private Document document;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @CreationTimestamp private LocalDateTime addedAt;

  public DocumentCollaborator(Document document, User user) {
    this.document = document;
    this.user = user;
  }
}
