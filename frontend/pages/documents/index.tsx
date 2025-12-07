import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateDocumentDialog } from '@/pages/documents/components/CreateDocumentDialog';
import { DocumentEditorDialog } from '@/pages/documents/components/DocumentEditorDialog';
import { useDocuments } from '@/hooks/useDocuments';
import styles from './Documents.module.scss';
import {formatDate} from "@/lib/utils";

export default function Documents() {
  const { data: documents, isLoading, isError } = useDocuments();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const handleEditorOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedDocumentId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.documentsPage}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading documents...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.documentsPage}>
        <div className={styles.container}>
          <div className={styles.error}>
            Failed to load documents. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.documentsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Documents</h1>
            <p className={styles.subtitle}>
              {documents?.length === 0
                ? 'No documents yet. Create your first one!'
                : `${documents?.length} document${documents?.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            Create Document
          </Button>
        </div>

        {documents && documents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h2>No documents yet</h2>
              <p>Create your first document to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
                Create Your First Document
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {documents?.map((doc) => (
              <Card
                key={doc.id}
                className={styles.documentCard}
                onClick={() => setSelectedDocumentId(doc.id)}
              >
                <CardHeader>
                  <CardTitle className={styles.documentTitle}>{doc.title}</CardTitle>
                  <CardDescription>
                    Owner: {doc.ownerUsername}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={styles.documentMeta}>
                    <span className={styles.metaItem}>
                      Created: {formatDate(doc.createdAt)}
                    </span>
                    <span className={styles.metaItem}>
                      Updated: {formatDate(doc.updatedAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateDocumentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {selectedDocumentId && (
        <DocumentEditorDialog
          documentId={selectedDocumentId}
          open={true}
          onOpenChange={handleEditorOpenChange}
        />
      )}
    </div>
  );
}
