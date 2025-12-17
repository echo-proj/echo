import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { CollaboratorSlidePanel } from '@/components/custom/documents/CollaboratorSlidePanel';
import { VersionHistory } from '@/components/custom/documents/VersionHistory';
import { useDocument, useCreateVersion, useUpdateDocument } from '@/hooks/useDocuments';
import { Loader2, FileText, User, Calendar, Users, Save, Check, X } from 'lucide-react';
import styles from './DocumentEditorDialog.module.scss';
import { formatDate } from "@/lib/utils";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {TiptapEditor, type TiptapEditorHandle} from "@/components/custom/documents/TiptapEditor";
import { ActiveCollaborators } from '@/components/custom/documents/ActiveCollaborators';
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [activeUsers, setActiveUsers] = useState<Array<{ name: string; color: string }>>([]);
  const editorRef = useRef<TiptapEditorHandle | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const createVersion = useCreateVersion();
  const updateDocument = useUpdateDocument();

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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

  const handleStartEditTitle = () => {
    setEditedTitle(document?.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (!documentId || !editedTitle.trim() || editedTitle === document?.title) {
      setIsEditingTitle(false);
      setEditedTitle(document?.title || '');
      return;
    }

    updateDocument.mutate(
      { id: documentId, data: { title: editedTitle.trim() } },
      {
        onSuccess: () => {
          setIsEditingTitle(false);
        },
        onError: () => {
          setEditedTitle(document?.title || '');
          setIsEditingTitle(false);
        },
      }
    );
  };

  const handleCancelEditTitle = () => {
    setEditedTitle(document?.title || '');
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEditTitle();
    }
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
                {isEditingTitle ? (
                  <div className={styles.titleEditContainer}>
                    <FileText className={styles.titleIcon} />
                    <Input
                      ref={titleInputRef}
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      onBlur={handleSaveTitle}
                      disabled={updateDocument.isPending}
                      className={styles.titleInput}
                    />
                    <div className={styles.titleEditActions}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={styles.titleEditButton}
                        onClick={handleSaveTitle}
                        disabled={updateDocument.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={styles.titleEditButton}
                        onClick={handleCancelEditTitle}
                        disabled={updateDocument.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DialogTitle
                    className={styles.title}
                    onDoubleClick={!isLoading && document ? handleStartEditTitle : undefined}
                  >
                    <FileText className={styles.titleIcon} />
                    <span className={styles.titleText}>
                      {isLoading ? 'Loading...' : document?.title || 'Document Editor'}
                    </span>
                  </DialogTitle>
                )}

                {!isLoading && document && (
                  <div className={styles.actionButtons}>
                    <ActiveCollaborators users={activeUsers} />
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
                        <div className="space-y-6">
                          <div className="grid gap-2">
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
            {open && <TiptapEditor ref={editorRef} documentId={documentId} onActiveUsersChange={setActiveUsers} />}
          </div>
        </div>

        <div className={styles.rightPanel}>
          <VersionHistory
            documentId={documentId}
            ownerUsername={document?.ownerUsername || ''}
            currentUsername={authStorage.getUsername() || undefined}
            onBeginRestore={() => editorRef.current?.startRestore()}
          />
        </div>

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
