
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface InlineEditFormProps {
  value: string | boolean;
  fieldName: string;
  onSave: (value: string | boolean) => Promise<void>;
  type?: 'text' | 'textarea' | 'boolean';
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export function InlineEditForm({
  value,
  fieldName,
  onSave,
  type = 'text',
  placeholder,
  className = '',
  isLoading = false
}: InlineEditFormProps) {
  const [editValue, setEditValue] = useState<string | boolean>(value);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error(`Error saving ${fieldName}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {type === 'text' && (
          <Input
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder || `Enter ${fieldName}`}
            disabled={isSaving}
            autoFocus
          />
        )}
        
        {type === 'textarea' && (
          <Textarea
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder || `Enter ${fieldName}`}
            disabled={isSaving}
            autoFocus
            rows={3}
          />
        )}
        
        {type === 'boolean' && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={editValue as boolean}
              onCheckedChange={setEditValue}
              disabled={isSaving}
              id={`switch-${fieldName}`}
            />
            <Label htmlFor={`switch-${fieldName}`}>
              {(editValue as boolean) ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div 
      className={`cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors ${className}`}
      onClick={() => !isLoading && setIsEditing(true)}
    >
      {type === 'boolean' ? (
        <div className="flex items-center">
          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${(value as boolean) ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{(value as boolean) ? 'Enabled' : 'Disabled'}</span>
        </div>
      ) : type === 'textarea' ? (
        <div className="whitespace-pre-wrap">{(value as string) || <span className="text-gray-400 italic">No {fieldName} provided</span>}</div>
      ) : (
        <div>{(value as string) || <span className="text-gray-400 italic">No {fieldName} provided</span>}</div>
      )}
    </div>
  );
}
