import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Users, Plus, MessageSquare, Check, RefreshCw, Sparkles, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const LeadsView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Lead Modal
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [name, setName] = useState('Deepak Singhania');
  const [phone, setPhone] = useState('+91 99880 12345');
  const [channel, setChannel] = useState('instagram');
  const [productInterest, setProductInterest] = useState('Dual Motor Standing Desk');
  const [message, setMessage] = useState('Hi, what is the best price for bulk order? Can you deliver by tomorrow?');
  const [submitting, setSubmitting] = useState(false);

  // Draft Viewer Modal
  const [activeDraftLead, setActiveDraftLead] = useState<any | null>(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createLead({
        name,
        phone,
        channel,
        message,
        productInterest,
      });
      if (res.success) {
        setIsNewLeadOpen(false);
        await loadLeads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-4 rounded-xl bg-[#0F111A] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Leads & Customer Pipeline</h2>
            <Badge variant="amber" dot>{leads.length} Leads Active</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated lead qualification: Inbound message → validate → score intent → draft WhatsApp reply → create follow-up task.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewLeadOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Submit Lead Form
          </Button>
          <Button variant="secondary" size="sm" onClick={loadLeads} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="p-4 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">
                  {lead.channel}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(lead.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-1">{lead.name}</h3>
              <p className="text-xs text-slate-400">{lead.phone}</p>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Intent Score: {lead.intentScore}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {lead.intentScore > 85 ? 'High Buyer Intent' : 'Warm Inquiry'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2 font-medium">
                Interest: <span className="text-purple-300">{lead.productInterest}</span>
              </p>

              <div className="mt-2 p-2 rounded-lg bg-[#141724] border border-[#23293F] text-[11px] text-slate-400">
                <strong className="text-slate-300 block">Assigned Task:</strong>
                {lead.followUpTask}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1F2438] flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                <Check className="w-3.5 h-3.5" />
                <span>Ready</span>
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setActiveDraftLead(lead)}
                leftIcon={<MessageSquare className="w-3 h-3 text-purple-400" />}
              >
                Inspect Draft
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* New Lead Modal */}
      <Modal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <span>Simulate Inbound Lead Event</span>
          </div>
        }
        description="Trigger the end-to-end lead qualification and outreach drafting workflow."
        maxWidth="md"
      >
        <form onSubmit={handleCreateLead} className="space-y-3.5">
          <Input label="Lead Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Inbound Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-[#151824] border border-[#282F48] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
              >
                <option value="instagram">Instagram Direct</option>
                <option value="whatsapp">WhatsApp Inbound</option>
                <option value="website">Website Contact Form</option>
              </select>
            </div>
            <Input
              label="Product Interest"
              value={productInterest}
              onChange={(e) => setProductInterest(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Customer Message</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#151824] border border-[#282F48] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-2 text-xs text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>AI will score buyer intent and prepare a personalized WhatsApp response draft.</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewLeadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Run Lead Automation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Message Draft Viewer Modal */}
      <Modal
        isOpen={!!activeDraftLead}
        onClose={() => setActiveDraftLead(null)}
        title={
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>WhatsApp Draft • {activeDraftLead?.name}</span>
          </div>
        }
        description={`Recipient: ${activeDraftLead?.phone} • Lead Score: ${activeDraftLead?.intentScore}/100`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#141724] border border-[#23293F] space-y-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Prepared WhatsApp Message Draft:</span>
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-[#1E2336] text-slate-200 leading-relaxed font-sans">
              {activeDraftLead?.followUpDraft}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-300 text-[11px]">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>In Demo Sandbox, messages are held for agent review before dispatching to Meta Cloud API.</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setActiveDraftLead(null)}>
              Close
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => {
                alert(`Simulated dispatch to WhatsApp for ${activeDraftLead?.name}`);
                setActiveDraftLead(null);
              }}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send to Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
