package com.echoproject.echo.document.models;

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

  @Column(name = "document_id", nullable = false)
  private UUID documentId;

  @Column(name = "version_number", nullable = false)
  private Integer versionNumber;

  @Column(name = "state", nullable = false, columnDefinition = "bytea")
  private byte[] state;

  @Column(name = "created_by", nullable = false)
  private UUID createdById;

  @Column(name = "label")
  private String label;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  public DocumentVersion(UUID documentId, Integer versionNumber, byte[] state, UUID createdById, String label) {
    this.documentId = documentId;
    this.versionNumber = versionNumber;
    this.state = state;
    this.createdById = createdById;
    this.label = label;
  }
}
