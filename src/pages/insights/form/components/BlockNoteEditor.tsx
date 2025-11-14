import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

interface BlockNoteEditorComponentProps {
  content: any;
  onChange: (content: any) => void;
  error?: string;
}

export function BlockNoteEditorComponent({
  content,
  onChange,
  error,
}: BlockNoteEditorComponentProps) {
  // Parse initial content
  const parseInitialContent = (content: any) => {
    if (!content) return undefined;

    if (Array.isArray(content)) {
      return content.length > 0 ? content : undefined;
    }

    if (content.blocks && Array.isArray(content.blocks)) {
      return content.blocks.length > 0 ? content.blocks : undefined;
    }

    if (typeof content === "object" && Object.keys(content).length === 0) {
      return undefined;
    }

    return undefined;
  };

  // Create editor with useCreateBlockNote
  const editor = useCreateBlockNote({
    initialContent: parseInitialContent(content),
  });

  // Handle content changes
  const handleChange = () => {
    const blocks = editor.document;
    onChange(blocks);
  };

  return (
    <div className="space-y-2">
      <div
        className={`border rounded-lg overflow-hidden bg-white min-h-64 ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      >
        <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
