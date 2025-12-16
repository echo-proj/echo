import { Editor } from '@tiptap/react';
import styles from './TiptapEditor.module.scss';

interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
}

export function EditorToolbar({ editor, disabled }: ToolbarProps) {
  if (!editor) return null;

  const buttons: Array<
    | { type: 'button'; label: string; action: () => void; active: boolean }
    | { type: 'divider' }
  > = [
    { type: 'button', label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { type: 'button', label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { type: 'button', label: 'Strike', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    { type: 'divider' },
    { type: 'button', label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
    { type: 'button', label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { type: 'button', label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    { type: 'divider' },
    { type: 'button', label: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { type: 'button', label: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
  ];

  return (
    <div className={styles.toolbar}>
      {buttons.map((btn, i) => {
        if (btn.type === 'divider') return <div key={`div-${i}`} className={styles.divider} />;
        return (
          <button
            key={btn.label}
            onClick={btn.action}
            disabled={disabled}
            className={btn.active ? styles.active : ''}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}

