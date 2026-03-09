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
    <div className="flex-1 w-full flex flex-col">
      <div
        className={`flex-1 transition-all duration-300 ${
          error ? "border-l-4 border-red-500 pl-4" : ""
        }`}
      >
        <BlockNoteView 
          editor={editor} 
          onChange={handleChange} 
          theme="light"
          formattingToolbar={true}
          className="min-h-[500px] pb-40"
        />
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest pl-1">
          {error}
        </p>
      )}
    </div>
  );
}
