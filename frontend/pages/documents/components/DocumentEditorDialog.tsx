import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TiptapEditor } from '@/pages/documents/components/TiptapEditor';
import styles from './DocumentEditorDialog.module.scss';

interface DocumentEditorDialogProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentEditorDialog({ documentId, open, onOpenChange }: DocumentEditorDialogProps) {
  if (!documentId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            Document Editor
          </DialogTitle>
          <p className={styles.subtitle}>
            Document ID: {documentId}
          </p>
        </DialogHeader>

        <div className={styles.editorWrapper}>
          <TiptapEditor documentId={documentId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
