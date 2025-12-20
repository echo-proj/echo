import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import styles from './TiptapEditor.module.scss';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollab } from './useCollab';
import { useSmoothLoading } from './useSmoothLoading';
import { EditorToolbar } from './EditorToolbar';

interface TiptapEditorProps {
  documentId: string;
  onActiveUsersChange?: (users: Array<{ name: string; color: string }>) => void;
}

export type TiptapEditorHandle = {
  startRestore: () => void;
};

export const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(function TiptapEditor(
  { documentId, onActiveUsersChange },
  ref
) {
  const [sessionId, setSessionId] = useState(0);
  const { provider, ydoc, synced, connected, activeUsers, isRemoteRestoring } = useCollab(documentId, sessionId);

  useEffect(() => {
    onActiveUsersChange?.(activeUsers);
  }, [activeUsers, onActiveUsersChange]);

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({ history: false }),
      ...(ydoc ? [Collaboration.configure({ document: ydoc, field: 'prosemirror' })] : []),
    ],
    editorProps: { attributes: { class: styles.editor } },
  }, [ydoc]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(synced && !isRemoteRestoring);
  }, [editor, synced, isRemoteRestoring]);

  useImperativeHandle(ref, () => ({
    startRestore: () => {
      if (!provider) return;
      provider.awareness.setLocalStateField('restoring', { active: true, ts: Date.now() });
      window.setTimeout(() => setSessionId((v) => v + 1), 150);
    },
  }));

  const blocked = !connected || !editor || !synced || isRemoteRestoring;
  const showOverlay = useSmoothLoading(blocked, 350);

  useEffect(() => {
    if (!editor) return;
    if (connected && !synced) {
      const t = window.setTimeout(() => setSessionId((v) => v + 1), 6000);
      return () => window.clearTimeout(t);
    }
  }, [connected, synced, editor]);

  return (
    <div className={styles.editorContainer}>
      {showOverlay && (
        <div className={styles.overlay}>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      <EditorToolbar editor={editor} disabled={showOverlay} />

      {editor ? <EditorContent editor={editor} /> : <div className={styles.editorPlaceholder} />}
    </div>
  );
});
