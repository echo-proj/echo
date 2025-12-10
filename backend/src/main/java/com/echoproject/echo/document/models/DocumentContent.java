package com.echoproject.echo.document.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "document_content")
@Getter
@Setter
@NoArgsConstructor
public class DocumentContent {

  @Id
  @Column(name = "document_id")
  private UUID documentId;

  @OneToOne
  @MapsId
  @JoinColumn(name = "document_id")
  private Document document;

  @Lob
  @Column(name = "state", columnDefinition = "BYTEA")
  private byte[] state;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @CreationTimestamp
  @Column(name = "created_at")
  private LocalDateTime createdAt;

  public DocumentContent(Document document) {
    this.document = document;
  }
}
