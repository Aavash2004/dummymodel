"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Strikethrough,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Undo,
  Redo,
  LinkIcon,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline dark:text-blue-400",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[220px] px-3 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const toolbarButton = (
    onClick: () => void,
    isActive: boolean,
    icon: React.ReactNode,
    label: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
        isActive
          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700/60 dark:bg-zinc-900/80">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 p-2 dark:border-zinc-800">
        {toolbarButton(
          () => editor.chain().focus().undo().run(),
          false,
          <Undo className="h-4 w-4" />,
          "Undo"
        )}
        {toolbarButton(
          () => editor.chain().focus().redo().run(),
          false,
          <Redo className="h-4 w-4" />,
          "Redo"
        )}

        <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        {toolbarButton(
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive("heading", { level: 2 }),
          <Heading2 className="h-4 w-4" />,
          "Heading"
        )}
        {toolbarButton(
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold"),
          <Bold className="h-4 w-4" />,
          "Bold"
        )}
        {toolbarButton(
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic"),
          <Italic className="h-4 w-4" />,
          "Italic"
        )}
        {toolbarButton(
          () => editor.chain().focus().toggleUnderline().run(),
          editor.isActive("underline"),
          <UnderlineIcon className="h-4 w-4" />,
          "Underline"
        )}
        {toolbarButton(
          () => editor.chain().focus().toggleStrike().run(),
          editor.isActive("strike"),
          <Strikethrough className="h-4 w-4" />,
          "Strikethrough"
        )}

        <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        {toolbarButton(
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive("bulletList"),
          <List className="h-4 w-4" />,
          "Bullet list"
        )}
        {toolbarButton(
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive("orderedList"),
          <ListOrdered className="h-4 w-4" />,
          "Numbered list"
        )}

        <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        {toolbarButton(
          () => {
            const url = window.prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          },
          editor.isActive("link"),
          <LinkIcon className="h-4 w-4" />,
          "Link"
        )}
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}