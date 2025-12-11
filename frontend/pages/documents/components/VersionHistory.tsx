import React, { useState } from 'react';
import { useCreateVersion, useDeleteVersion, useDocumentVersions, useRestoreVersion } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Save, RotateCcw, Trash2, History } from 'lucide-react';
import styles from './VersionHistory.module.scss';

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return then.toLocaleDateString();
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface VersionHistoryProps {
  documentId: string;
  ownerUsername: string;
  currentUsername?: string;
}

export function VersionHistory({ documentId, ownerUsername, currentUsername }: VersionHistoryProps) {
  const [label, setLabel] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const { data: versions, isLoading } = useDocumentVersions(documentId);
  const createVersion = useCreateVersion();
  const restoreVersion = useRestoreVersion();
  const deleteVersion = useDeleteVersion();

  const isOwner = currentUsername === ownerUsername;

  const handleSaveVersion = () => {
    createVersion.mutate(
      { documentId, data: { label: label || undefined } },
      {
        onSuccess: () => {
          setLabel('');
          setSaveDialogOpen(false);
        },
      }
    );
  };

  const handleRestore = (versionId: string) => {
    if (confirm('Are you sure you want to restore this version? Current content will be replaced.')) {
      restoreVersion.mutate({ documentId, versionId });
    }
  };

  const handleDelete = (versionId: string) => {
    if (confirm('Are you sure you want to delete this version?')) {
      deleteVersion.mutate({ documentId, versionId });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <History className={styles.icon} />
          <h3>Version History</h3>
        </div>
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
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
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

      <div className={styles.versionList}>
        {isLoading && <div className={styles.loading}>Loading versions...</div>}

        {!isLoading && versions && versions.length === 0 && (
          <div className={styles.empty}>
            <History className={styles.emptyIcon} />
            <p>No versions saved yet</p>
            <p className={styles.emptyHint}>Click &#34;Save Version&#34; to create your first snapshot</p>
          </div>
        )}

        {versions &&
          versions.map((version) => (
            <div key={version.id} className={styles.versionItem}>
              <div className={styles.versionInfo}>
                <div className={styles.versionHeader}>
                  <span className={styles.versionNumber}>v{version.versionNumber}</span>
                  {version.label && <span className={styles.versionLabel}>{version.label}</span>}
                </div>
                <div className={styles.versionMeta}>
                  <Clock className={styles.metaIcon} />
                  <span className={styles.metaText}>
                    {formatTimeAgo(version.createdAt)} by {version.createdByUsername}
                  </span>
                </div>
              </div>
              <div className={styles.versionActions}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRestore(version.id)}
                  disabled={restoreVersion.isPending}
                  title="Restore this version"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(version.id)}
                    disabled={deleteVersion.isPending}
                    title="Delete this version"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>

      {versions && versions.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.footerText}>
            {versions.length} of 15 versions • Oldest versions auto-delete when limit reached
          </p>
        </div>
      )}
    </div>
  );
}
