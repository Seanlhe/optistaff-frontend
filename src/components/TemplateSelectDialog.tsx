import { useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Template, TemplateSelectDialogProps } from "../types/components";
import { useAvailabilityTemplate } from "../hooks/useAvailabilityTemplate";

export const TemplateSelectDialog = ({
  isOpen,
  onClose,
  onSelect,
  onDelete,
  onSaveTemplate,
  loading = false,
}: TemplateSelectDialogProps) => {
  const { templates, fetchAllTemplates, loading: templateLoading } = useAvailabilityTemplate();

  useEffect(() => {
    if (isOpen) {
      fetchAllTemplates();
    }
  }, [isOpen, fetchAllTemplates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-secondary-text/50 flex items-center justify-center z-50">
      <div className="bg-card-color rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-primary-text">Templates</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg rounded transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-secondary-text" />
          </button>
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button
            type="button"
            onClick={() => onSaveTemplate && onSaveTemplate()}
            className="px-4 py-2 text-sm text-secondary-text border border-border rounded-md hover:bg-bg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Save as New Template
          </button>
        </div>

        {templateLoading ? (
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
              <div
                key={template.template_id}
                className="flex items-center justify-between p-3 border border-border rounded-md transition-colors"
              >
                <div className="flex-1">
                  <div className="text-base font-semibold text-primary-text">
                    {template.template_name}
                  </div>
                  <div className="text-sm text-secondary-text">
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">

                      <button
                      className="px-4 py-2 text-sm text-secondary-text border border-border rounded-md hover:bg-bg transition-colors"
                      onClick={() =>  onDelete(template.template_id)}
                    >
                      Delete
                    </button>

                      <button
                      className="px-4 py-2 text-sm text-secondary-text border border-border rounded-md hover:bg-bg transition-colors"
                      onClick={() =>  onSelect(template.template_id)}
                    >
                      Use
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
