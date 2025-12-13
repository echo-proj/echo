import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { CollaboratorSlidePanel } from '@/pages/documents/components/CollaboratorSlidePanel';
import { VersionHistory } from '@/pages/documents/components/VersionHistory';
import { useDocument, useCreateVersion } from '@/hooks/useDocuments';
import { Loader2, FileText, User, Calendar, Users, Save } from 'lucide-react';
import styles from './DocumentEditorDialog.module.scss';
import { formatDate } from "@/lib/utils";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {TiptapEditor} from "@/pages/documents/components/TiptapEditor";
import { authStorage } from '@/lib/auth';

interface DocumentEditorDialogProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentEditorDialog({ documentId, open, onOpenChange }: DocumentEditorDialogProps) {
  const { data: document, isLoading } = useDocument(documentId || '');
  const [isCollaboratorPanelOpen, setIsCollaboratorPanelOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const createVersion = useCreateVersion();

  const handleSaveVersion = () => {
    createVersion.mutate(
      { documentId: documentId || '', data: { label: versionLabel || undefined } },
      {
        onSuccess: () => {
          setVersionLabel('');
          setSaveDialogOpen(false);
        },
      }
    );
  };

  if (!documentId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <div className={styles.contentWrapper}>
        <div className={styles.leftPanel}>
          <DialogHeader>
            <div className={styles.headerWrapper}>
              <div className={styles.titleRow}>
                <DialogTitle className={styles.title}>
                  <FileText className={styles.titleIcon} />
                  {isLoading ? 'Loading...' : document?.title || 'Document Editor'}
                </DialogTitle>

                {!isLoading && document && (
                  <div className={styles.actionButtons}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCollaboratorPanelOpen(true)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Collaborators
                    </Button>

                    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Save className="w-4 h-4 mr-2" />
                          Save Version
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save Document Version</DialogTitle>
                          <DialogDescription>
                            Create a snapshot of the current document state. You can add an optional label to help identify this
                            version later.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="version-label">Label (optional)</Label>
                            <Input
                              id="version-label"
                              placeholder="e.g., Draft 1, Before refactor, etc."
                              value={versionLabel}
                              onChange={(e) => setVersionLabel(e.target.value)}
                              maxLength={100}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveVersion} disabled={createVersion.isPending}>
                            {createVersion.isPending ? 'Saving...' : 'Save Version'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>

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
            {open && <TiptapEditor documentId={documentId} />}
          </div>
        </div>

        <div className={styles.rightPanel}>
          <VersionHistory
            documentId={documentId}
            ownerUsername={document?.ownerUsername || ''}
            currentUsername={authStorage.getUsername() || undefined}
          />
        </div>

        {/* Collaborator Slide Panel */}
        <CollaboratorSlidePanel
          documentId={documentId}
          collaborators={document?.collaborators || []}
          isLoading={isLoading}
          isOpen={isCollaboratorPanelOpen}
          onClose={() => setIsCollaboratorPanelOpen(false)}
        />
        </div>
      </DialogContent>
    </Dialog>
  );
}
