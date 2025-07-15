import { useState } from "react";
import { X } from "lucide-react";
import { TemplateNameDialogProps } from '../types/components';

export const TemplateNameDialog = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
}: TemplateNameDialogProps) => {
  const [templateName, setTemplateName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (templateName.trim()) {
      onSave(templateName.trim());
      setTemplateName("");
    }
  };

  const handleClose = () => {
    setTemplateName("");
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-text">Save Template</h2>
          <button
            onClick={handleClose} // Close popup only when clicking the X button
            className="p-1 hover:bg-secondary-bg rounded transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-secondary-text" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="templateName" className="block text-sm font-medium text-primary-text mb-2">
              Template Name
            </label>
            <input
              id="templateName"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name..."
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-gradient-end focus:border-transparent bg-card-color text-primary-text"
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-secondary-text border border-border rounded-md hover:bg-secondary-bg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!templateName.trim() || loading}
              className="px-4 py-2 text-sm bg-gradient-end text-white rounded-md hover:bg-gradient-end/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
