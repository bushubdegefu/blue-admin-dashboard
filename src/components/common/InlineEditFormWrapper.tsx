
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InlineEditForm } from "./InlineEditForm";

interface InlineEditFormWrapperProps {
  label: string;
  value: string | boolean;
  fieldName: string;
  onSave: (value: string | boolean) => Promise<void>;
  type?: 'text' | 'textarea' | 'boolean';
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export function InlineEditFormWrapper({
  label,
  value,
  fieldName,
  onSave,
  type = 'text',
  placeholder,
  className = '',
  isLoading = false
}: InlineEditFormWrapperProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async (newValue: string | boolean) => {
    try {
      await onSave(newValue);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Card className={`border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEditClick}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      
      <InlineEditForm
        value={value}
        fieldName={fieldName}
        onSave={handleSave}
        type={type}
        placeholder={placeholder}
        isLoading={isLoading}
      />
    </Card>
  );
}
