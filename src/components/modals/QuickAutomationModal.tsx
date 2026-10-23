import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Zap, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export const QuickAutomationModal: React.FC = () => {
  const { isQuickAutomationModalOpen, setIsQuickAutomationModalOpen, setActiveTab } = useApp();
  const [prompt, setPrompt] = useState(
    'When a new order arrives, record it in a spreadsheet, arrange delivery via Porter, and send a customer notification on WhatsApp.'
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const samplePrompts = [
    'When a new lead arrives from Instagram, score intent, draft WhatsApp follow-up, and create task.',
    'When low inventory (<5) is detected in Google Sheets, alert Slack and prepare supplier draft.',
    'When high-value order (>₹10,000) arrives, require owner approval before booking Shiprocket Air.',
  ];

  const handleCreate = async () => {
    setIsGenerating(true);
    try {
      await api.generateWorkflow(prompt);
      setIsQuickAutomationModalOpen(false);
      setActiveTab('studio');
    } catch (e) {
      console.error(e);
      setActiveTab('studio');
      setIsQuickAutomationModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isQuickAutomationModalOpen}
      onClose={() => setIsQuickAutomationModalOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <span>Describe an Automation in Natural Language</span>
        </div>
      }
      description="Nexus AI converts your plain-English instructions into a verified multi-step business workflow."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            What business workflow do you want to automate?
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-[#151824] border border-[#282F48] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/70"
            placeholder="e.g. When a new order arrives, book Porter local courier and alert Slack..."
          />
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Or choose an established template:
          </p>
          <div className="space-y-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                className="w-full text-left p-2 rounded-lg bg-[#141724] hover:bg-[#1C2032] border border-[#242A40] text-xs text-slate-300 hover:text-white transition-colors"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-2.5 text-xs text-purple-300">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            Nexus AI will parse Triggers, Conditions, Transformations, Delivery Adapters, and Approval Gates automatically.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQuickAutomationModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="sm"
            isLoading={isGenerating}
            onClick={handleCreate}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Generate Workflow in Studio
          </Button>
        </div>
      </div>
    </Modal>
  );
};
