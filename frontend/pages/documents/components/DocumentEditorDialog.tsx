import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TiptapEditor } from '@/pages/documents/components/TiptapEditor';
import { CollaboratorManager } from '@/pages/documents/components/CollaboratorManager';
import { useDocument } from '@/hooks/useDocuments';
import { Loader2, FileText, User, Calendar } from 'lucide-react';
import styles from './DocumentEditorDialog.module.scss';
import { formatDate } from "@/lib/utils";

interface DocumentEditorDialogProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentEditorDialog({ documentId, open, onOpenChange }: DocumentEditorDialogProps) {
  const { data: document, isLoading } = useDocument(documentId || '');

  if (!documentId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>

        <div className={styles.leftPanel}>
          <DialogHeader>
            <div className={styles.headerWrapper}>
              <DialogTitle className={styles.title}>
                <FileText className={styles.titleIcon} />
                {isLoading ? 'Loading...' : document?.title || 'Document Editor'}
              </DialogTitle>

              {isLoading ? (
                <div className={styles.loadingContainer}>
                  <Loader2 className={styles.spinner} />
                  <span>Loading document details...</span>
                </div>
              ) : document ? (
                <div className={styles.documentInfo}>
                  <div className={styles.infoItem}>
                    <User className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Owner:</span>
                    <span className={styles.infoValue}>{document.ownerUsername}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Calendar className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Created:</span>
                    <span className={styles.infoValue}>{formatDate(document.createdAt)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Calendar className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Updated:</span>
                    <span className={styles.infoValue}>{formatDate(document.updatedAt)}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </DialogHeader>

          <div className={styles.editorWrapper}>
            <TiptapEditor documentId={documentId} />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.rightPanelHeader}>
            <span className={styles.rightPanelTitle}>Collaborators</span>
          </div>
          <div className={styles.rightPanelBody}>
            <CollaboratorManager documentId={documentId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
