package com.echoproject.echo.document.models;

import com.echoproject.echo.user.models.User;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "document_collaborators")
@Getter
@Setter
@NoArgsConstructor
public class DocumentCollaborator {
  @Id private UUID id;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "document_id", nullable = false)
  private Document document;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
  private User user;
}

