import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Settings2, Trash2, Globe, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { dbService } from '../../services/db';
import type { WorkspaceRecord } from '../../services/db';

interface ManageWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceRecord;
  onWorkspaceUpdated: (ws: WorkspaceRecord) => void;
  onWorkspaceDeleted: (id: string) => void;
}

export const ManageWorkspaceModal: React.FC<ManageWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onWorkspaceUpdated,
  onWorkspaceDeleted,
}) => {
  const [name, setName] = useState(workspace.name);
  const [websiteUrl, setWebsiteUrl] = useState(workspace.website_url || '');
  const [description, setDescription] = useState(workspace.description || '');
  const [saving, setSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await dbService.updateWorkspace(workspace.id, {
        name,
        website_url: websiteUrl,
        description,
      });
      if (updated) {
        onWorkspaceUpdated(updated);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dbService.deleteWorkspace(workspace.id);
      onWorkspaceDeleted(workspace.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-purple-400" />
          <span>Workspace Settings • {workspace.name}</span>
        </div>
      }
      description="Update workspace business credentials, website metadata, and access rules."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        <form onSubmit={handleSave} className="space-y-3.5">
          <Input
            label="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
            placeholder="https://yourbusiness.com"
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#151824] border border-[#282F48] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-[#1F2438]">
            <Button
              type="button"
              variant="danger"
              size="xs"
              onClick={() => setShowConfirmDelete(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Workspace
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving} leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Changes
            </Button>
          </div>
        </form>

        {showConfirmDelete && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Are you sure you want to delete this workspace?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This will permanently delete workspace <strong>"{workspace.name}"</strong> and remove all associated local orders, leads, and workflow logs.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="xs" onClick={() => setShowConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="xs" isLoading={deleting} onClick={handleDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
