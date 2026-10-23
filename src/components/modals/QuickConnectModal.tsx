import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Plug, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const QuickConnectModal: React.FC = () => {
  const { isQuickConnectModalOpen, setIsQuickConnectModalOpen, setActiveTab } = useApp();

  const tools = [
    { name: 'Shopify', desc: 'Sync orders, customers & line items', status: 'Demo Connected', color: 'text-emerald-400' },
    { name: 'Porter Local', desc: 'On-demand 2-wheeler & mini truck intra-city delivery', status: 'Demo Connected', color: 'text-cyan-400' },
    { name: 'Shiprocket', desc: 'Multi-carrier Pan-India shipping and tracking', status: 'Demo Connected', color: 'text-blue-400' },
    { name: 'WhatsApp Business', desc: 'Customer dispatch notices & automated follow-ups', status: 'Demo Connected', color: 'text-emerald-400' },
    { name: 'Slack', desc: 'Team alerts, approval requests & daily digests', status: 'Demo Connected', color: 'text-purple-400' },
    { name: 'Google Sheets', desc: 'Append order rows & inventory sync database', status: 'Demo Connected', color: 'text-emerald-400' },
  ];

  return (
    <Modal
      isOpen={isQuickConnectModalOpen}
      onClose={() => setIsQuickConnectModalOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <Plug className="w-5 h-5 text-blue-400" />
          <span>Connect Business Integrations</span>
        </div>
      }
      description="Connect your store, logistics partners, and communication channels."
      maxWidth="lg"
    >
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-2 text-xs text-purple-300">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            In Demo Sandbox, safe mock adapters are pre-configured so you can test end-to-end automations immediately.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tools.map((t) => (
            <div
              key={t.name}
              className="p-3 rounded-xl bg-[#141724] border border-[#242A40] flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-white">{t.name}</p>
                <p className="text-[10px] text-slate-400">{t.desc}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                <Check className="w-3 h-3" />
                <span>{t.status}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#1F2438] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Need custom webhooks or live credentials?
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsQuickConnectModalOpen(false);
              setActiveTab('integrations');
            }}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Integrations Hub
          </Button>
        </div>
      </div>
    </Modal>
  );
};
