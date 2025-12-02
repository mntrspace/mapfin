import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TagBadge } from './TagBadge';
import { TAG_COLORS } from '@/constants';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

interface TagMultiSelectProps {
  availableTags: Tag[];
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag?: (tag: Omit<Tag, 'id'>) => Promise<Tag>;
  placeholder?: string;
  disabled?: boolean;
}

export function TagMultiSelect({
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  placeholder = 'Add tags...',
  disabled = false,
}: TagMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLORS[0].value);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tags by search
  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search matches any existing tag exactly
  const exactMatch = availableTags.some(
    (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase()
  );

  const handleToggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!onCreateTag || !newTagName.trim()) return;

    setCreating(true);
    try {
      const newTag = await onCreateTag({
        name: newTagName.trim(),
        color: newTagColor,
      });
      onTagsChange([...selectedTags, newTag]);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0].value);
      setShowNewTagForm(false);
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to create tag:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleStartNewTag = () => {
    setNewTagName(searchQuery);
    setShowNewTagForm(true);
    setSearchQuery('');
  };

  useEffect(() => {
    if (showNewTagForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNewTagForm]);

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              onRemove={() => handleRemoveTag(tag.id)}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className="w-full justify-between text-muted-foreground font-normal"
            size="sm"
          >
            {placeholder}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[250px]" align="start">
          {/* Search Input */}
          <div className="p-2">
            <Input
              placeholder="Search or create tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>

          {showNewTagForm ? (
            /* New Tag Form */
            <div className="p-2 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Create new tag</div>
              <Input
                ref={inputRef}
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8"
              />
              <div className="flex flex-wrap gap-1">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewTagColor(color.value)}
                    className={cn(
                      'h-6 w-6 rounded-full border-2 transition-all',
                      newTagColor === color.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || creating}
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNewTagForm(false);
                    setNewTagName('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Tag List */}
              <div className="max-h-[200px] overflow-y-auto">
                {filteredTags.length === 0 && !searchQuery && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No tags available
                  </div>
                )}
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.some((t) => t.id === tag.id);
                  return (
                    <DropdownMenuItem
                      key={tag.id}
                      onClick={() => handleToggleTag(tag)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  );
                })}
              </div>

              {/* Create New Tag Option */}
              {onCreateTag && searchQuery && !exactMatch && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleStartNewTag} className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Create "{searchQuery}"
                  </DropdownMenuItem>
                </>
              )}

              {/* Create New Button */}
              {onCreateTag && !searchQuery && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowNewTagForm(true)}
                    className="cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create new tag
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
