import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TiptapEditor } from '@/pages/documents/components/TiptapEditor';
import { CollaboratorManager } from '@/pages/documents/components/CollaboratorManager';
import { VersionHistory } from '@/pages/documents/components/VersionHistory';
import { useDocument } from '@/hooks/useDocuments';
import { Loader2, FileText, User, Calendar, Users, History } from 'lucide-react';
import styles from './DocumentEditorDialog.module.scss';
import { formatDate } from "@/lib/utils";
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DocumentEditorDialogProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentEditorDialog({ documentId, open, onOpenChange }: DocumentEditorDialogProps) {
  const { data: document, isLoading } = useDocument(documentId || '');
  const [activeTab, setActiveTab] = useState<'collaborators' | 'versions'>('collaborators');

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
            <div className={styles.tabButtons}>
              <Button
                variant={activeTab === 'collaborators' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('collaborators')}
                className={styles.tabButton}
              >
                <Users className="w-4 h-4 mr-2" />
                Collaborators
              </Button>
              <Button
                variant={activeTab === 'versions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('versions')}
                className={styles.tabButton}
              >
                <History className="w-4 h-4 mr-2" />
                Versions
              </Button>
            </div>
          </div>
          <div className={styles.rightPanelBody}>
            {activeTab === 'collaborators' ? (
              <CollaboratorManager
                documentId={documentId}
                collaborators={document?.collaborators || []}
                isLoading={isLoading}
              />
            ) : (
              <VersionHistory
                documentId={documentId}
                ownerUsername={document?.ownerUsername || ''}
                currentUsername={localStorage.getItem('username') || undefined}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
