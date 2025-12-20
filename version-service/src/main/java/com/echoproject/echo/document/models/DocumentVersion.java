package com.echoproject.echo.document.models;

import com.echoproject.echo.user.models.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "document_versions")
@Getter
@Setter
@NoArgsConstructor
public class DocumentVersion {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "document_id", nullable = false)
  private Document document;

  @Column(name = "version_number", nullable = false)
  private Integer versionNumber;

  @Column(name = "state", nullable = false, columnDefinition = "bytea")
  private byte[] state;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy;

  @Column(name = "label")
  private String label;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  public DocumentVersion(Document document, Integer versionNumber, byte[] state, User createdBy, String label) {
    this.document = document;
    this.versionNumber = versionNumber;
    this.state = state;
    this.createdBy = createdBy;
    this.label = label;
  }
}
