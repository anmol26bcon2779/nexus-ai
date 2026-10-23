import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Settings2, Trash2, Globe, Save, AlertTriangle, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { dbService } from '../../services/db';
import type { WorkspaceRecord } from '../../services/db';
import { useApp } from '../../context/AppContext';

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
  const { workspaces, loadWorkspaces } = useApp();
  const [name, setName] = useState(workspace.name);
  const [websiteUrl, setWebsiteUrl] = useState(workspace.website_url || '');
  const [description, setDescription] = useState(workspace.description || '');
  const [saving, setSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isOnlyWorkspace = workspaces.length <= 1;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Workspace name must be at least 2 characters long.');
      return;
    }

    setSaving(true);
    try {
      const updated = await dbService.updateWorkspace(workspace.id, {
        name: cleanName,
        website_url: websiteUrl.trim(),
        description: description.trim(),
      });

      if (updated) {
        setSuccessMessage('Workspace updated successfully!');
        await loadWorkspaces();
        onWorkspaceUpdated(updated);
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMessage('Failed to save changes.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isOnlyWorkspace) {
      setErrorMessage('Cannot delete the only remaining workspace. Create another workspace first.');
      setShowConfirmDelete(false);
      return;
    }

    setDeleting(true);
    setErrorMessage(null);
    try {
      await dbService.deleteWorkspace(workspace.id);
      await loadWorkspaces();
      onWorkspaceDeleted(workspace.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete workspace.');
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
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <Input
            label="Workspace Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
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
              onClick={() => {
                if (isOnlyWorkspace) {
                  setErrorMessage('Cannot delete the only remaining workspace. Please create another workspace first.');
                } else {
                  setShowConfirmDelete(true);
                }
              }}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              disabled={isOnlyWorkspace}
              title={isOnlyWorkspace ? 'At least one workspace must remain active' : 'Delete workspace'}
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
