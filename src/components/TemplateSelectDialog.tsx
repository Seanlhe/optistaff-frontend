import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Template, TemplateSelectDialogProps } from '../types/components';

export const TemplateSelectDialog = ({
  isOpen,
  onClose,
  onSelect,
  onSaveTemplate,
  loading = false,
}: TemplateSelectDialogProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock template data - replace with actual API call
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading templates
      setTimeout(() => {
        setTemplates([
          { id: "1", name: "Morning Schedule", created_at: "2024-01-15" },
          { id: "2", name: "Weekend Template", created_at: "2024-01-10" },
          { id: "3", name: "Work Week", created_at: "2024-01-05" },
        ]); 
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      setSelectedTemplate("");
    }
  };

  const handleClose = () => {
    setSelectedTemplate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-secondary-text/50 flex items-center justify-center z-50"
    >
      <div
        className="bg-card-color rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-border"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-primary-text">Templates</h2>
          <button
            onClick={handleClose} // Close popup only when clicking the X button
            className="p-1 hover:bg-bg rounded transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-secondary-text" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onSaveTemplate && onSaveTemplate()}
              className="px-4 py-2 text-sm text-secondary-text border border-border rounded-md hover:bg-bg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Save as A New Template
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-base font-semibold text-primary-text mb-2">
              Select a template
            </label>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="text-sm text-secondary-text">Loading templates...</div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-secondary-text mx-auto mb-2" />
                <div className="text-sm text-secondary-text">No templates found</div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className="flex items-center justify-between p-3 border border-border rounded-md : cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-base font-semibold text-primary-text">{template.name}</div>
                      <div className="text-sm text-secondary-text">
                        Created: {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelect(template.id)}
                      className="px-4 py-2 text-sm text-secondary-text border border-border rounded-md hover:bg-bg transition-colors"
                    >
                      Use Template
                    </button>
                  </label>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
