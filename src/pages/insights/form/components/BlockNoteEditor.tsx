import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useRef } from "react";
import { toast } from "sonner";

import { assetApi } from "@/api/services/asset.api";
import { AssetContext } from "@/types/asset";

// Decode a data: URL without fetch(), which CSP connect-src would block
function dataUrlToFile(dataUrl: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/png";
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new File([bytes], `pasted-image.${mime.split("/")[1] || "png"}`, {
    type: mime,
  });
}

interface BlockNoteEditorComponentProps {
  content: any;
  onChange: (content: any) => void;
  error?: string;
  contextId?: string;
}

export function BlockNoteEditorComponent({
  content,
  onChange,
  error,
  contextId,
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

  // Upload editor images to the CDN instead of embedding them as base64
  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only images can be uploaded");
    }
    const result = await assetApi.uploadImage(file, AssetContext.BLOGS, contextId);
    if (!result.data.url) throw new Error("Upload returned no URL");
    return result.data.url;
  };

  // Create editor with useCreateBlockNote
  const editor = useCreateBlockNote({
    initialContent: parseInitialContent(content),
    uploadFile,
  });

  // Pasted HTML (e.g. from Word/Docs) bypasses uploadFile and embeds data:
  // URLs, so upload those afterwards and swap in the CDN URL
  const uploadingBlocks = useRef(new Set<string>());
  const uploadEmbeddedImages = () => {
    editor.forEachBlock((block) => {
      const url = (block.props as { url?: string }).url;
      if (
        block.type === "image" &&
        url?.startsWith("data:") &&
        !uploadingBlocks.current.has(block.id)
      ) {
        uploadingBlocks.current.add(block.id);
        uploadFile(dataUrlToFile(url))
          .then((cdnUrl) => {
            if (editor.getBlock(block.id)) {
              editor.updateBlock(block.id, { props: { url: cdnUrl } });
            }
          })
          .catch(() => toast.error("Failed to upload pasted image"))
          .finally(() => uploadingBlocks.current.delete(block.id));
      }
      return true;
    });
  };

  // Handle content changes
  const handleChange = () => {
    const blocks = editor.document;
    onChange(blocks);
    uploadEmbeddedImages();
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
