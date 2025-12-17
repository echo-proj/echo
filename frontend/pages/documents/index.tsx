import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateDocumentDialog } from '@/components/custom/documents/CreateDocumentDialog';
import { DocumentEditorDialog } from '@/components/custom/documents/DocumentEditorDialog';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';
import { useDocuments } from '@/hooks/useDocuments';
import styles from './Documents.module.scss';
import {formatDate} from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';

export default function Documents() {
  const { data: documents, isLoading, isError } = useDocuments();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!searchQuery.trim()) return documents;

    const query = searchQuery.toLowerCase();
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.ownerUsername.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const handleEditorOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedDocumentId(null);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout showSearch={false}>
        <div className={styles.documentsPage}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>

            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className={styles.documentCard}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (isError) {
    return (
      <AuthenticatedLayout showSearch={false}>
        <div className={styles.documentsPage}>
          <div className={styles.container}>
            <div className={styles.error}>
              Failed to load documents. Please try again later.
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout onSearch={setSearchQuery}>
      <div className={styles.documentsPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>My Documents</h1>
              <p className={styles.subtitle}>
                {documents?.length === 0
                  ? 'No documents yet. Create your first one!'
                  : searchQuery
                  ? `${filteredDocuments.length} of ${documents?.length} document${documents?.length === 1 ? '' : 's'}`
                  : `${documents?.length} document${documents?.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              Create Documenta
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
          ) : filteredDocuments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateContent}>
                <h2>No documents found</h2>
                <p>Try adjusting your search query</p>
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredDocuments.map((doc) => (
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
    </AuthenticatedLayout>
  );
}
