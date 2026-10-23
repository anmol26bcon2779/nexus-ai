import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Building2, Globe, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { dbService } from '../../services/db';
import type { WorkspaceRecord } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (ws: WorkspaceRecord) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onWorkspaceCreated,
}) => {
  const { user } = useAuth();
  const { workspaces, setCurrentWorkspace, loadWorkspaces } = useApp();
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [plan, setPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Workspace name must be at least 2 characters long.');
      return;
    }

    // Check for duplicate workspace name in active list
    if (workspaces.some((w) => w.name.toLowerCase() === cleanName.toLowerCase())) {
      setErrorMessage(`A workspace named "${cleanName}" already exists. Please choose a distinctive name.`);
      return;
    }

    setSubmitting(true);
    try {
      const created = await dbService.createWorkspace({
        name: cleanName,
        website_url: websiteUrl.trim(),
        description: description.trim(),
        plan,
        userId: user?.id,
      });

      setSuccessMessage(`Workspace "${created.name}" created successfully!`);

      // Refresh workspaces in context and notify parent
      await loadWorkspaces();
      onWorkspaceCreated(created);

      // Reset form and close
      setTimeout(() => {
        setName('');
        setWebsiteUrl('');
        setDescription('');
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to create workspace:', err);
      setErrorMessage(err.message || 'Failed to create workspace. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-400" />
          <span>Create New Business Workspace</span>
        </div>
      }
      description="Each workspace isolates orders, integrations, customer leads, and automated courier dispatches."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

        <Input
          label="Workspace / Business Name"
          placeholder="e.g. Acme Logistics India"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          required
        />

        <Input
          label="Store / Business Website URL"
          placeholder="https://acme-store.com"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
        />

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Business Description
          </label>
          <textarea
            rows={2}
            placeholder="e.g. D2C furniture & home essentials fulfillment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#151824] border border-[#282F48] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Operational Plan
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Starter', 'Growth', 'Enterprise'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  plan === p
                    ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm'
                    : 'bg-[#141724] border-[#242A40] text-slate-400 hover:text-white'
                }`}
              >
                <p className="font-bold">{p}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {p === 'Starter' ? 'Up to 5 automations' : p === 'Growth' ? 'Unlimited workflows' : 'Dedicated SLA'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 flex items-center gap-2 text-purple-300 text-[11px]">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>New workspace will be saved to your database and immediately available for courier routing.</span>
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};
