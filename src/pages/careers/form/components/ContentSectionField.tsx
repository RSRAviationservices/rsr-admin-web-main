import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContentSectionFieldProps {
  title: string;
  content?: string;
  items?: string[];
  onTitleChange: (value: string) => void;
  onContentChange?: (value: string) => void;
  onItemAdd: () => void;
  onItemUpdate: (index: number, value: string) => void;
  onItemRemove: (index: number) => void;
  error?: string;
  showContent?: boolean;
  itemPlaceholder?: string;
}

export function ContentSectionField({
  title,
  content,
  items = [],
  onTitleChange,
  onContentChange,
  onItemAdd,
  onItemUpdate,
  onItemRemove,
  error,
  showContent = false,
  itemPlaceholder = "Enter item...",
}: ContentSectionFieldProps) {
  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Section Title
        </Label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Section Title"
          className="bg-white"
        />
      </div>

      {showContent && onContentChange && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Content (Optional)
          </Label>
          <Textarea
            value={content || ""}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Additional context or description..."
            rows={3}
            className="bg-white resize-none"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">Items</Label>
          <Button type="button" size="sm" variant="outline" onClick={onItemAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No items added yet. Click &quot;Add Item&quot; to start.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={item}
                onChange={(e) => onItemUpdate(index, e.target.value)}
                placeholder={itemPlaceholder}
                className="flex-1 bg-white"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => onItemRemove(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
