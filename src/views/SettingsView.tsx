import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Settings, ShieldCheck, Key, Lock, Bell, Check, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [settings, setSettings] = useState({
    autoApprovalMaxOrderValue: 10000,
    localRadiusKmPriority: 15,
    preferredLocalProvider: 'porter',
    preferredNationalProvider: 'shiprocket',
    isDemoMode: true,
    requireApprovalForHighValue: true,
    slackWebhookActive: true,
  });
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    api.getSettings().then((res) => {
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-4 rounded-xl bg-[#0F111A] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Settings & Security Policy</h2>
            <Badge variant="emerald" dot>Zero Trust Architecture</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure delivery rules, priority logistics partners, approval thresholds, and server-side secret vaults.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedMessage && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              Settings Saved!
            </span>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Changes
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
            Back to Overview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Delivery Assignment Guardrails</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#141724] border border-[#23293F] space-y-1">
              <label className="font-semibold text-white block">Auto-Approval Max Order Value (INR)</label>
              <p className="text-[11px] text-slate-400">Orders exceeding this amount pause and route to Approvals Gate</p>
              <input
                type="number"
                value={settings.autoApprovalMaxOrderValue}
                onChange={(e) => setSettings({ ...settings, autoApprovalMaxOrderValue: Number(e.target.value) })}
                className="w-full bg-[#181C2B] border border-[#282F48] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#141724] border border-[#23293F] space-y-1">
              <label className="font-semibold text-white block">Local Delivery Radius Threshold (km)</label>
              <p className="text-[11px] text-slate-400">Orders within this distance prioritize on-demand 2-wheelers</p>
              <input
                type="number"
                value={settings.localRadiusKmPriority}
                onChange={(e) => setSettings({ ...settings, localRadiusKmPriority: Number(e.target.value) })}
                className="w-full bg-[#181C2B] border border-[#282F48] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#141724] border border-[#23293F]">
              <div>
                <p className="font-semibold text-white">Require Approval for High-Value Orders</p>
                <p className="text-[11px] text-slate-400">Protects against unintended courier charges</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireApprovalForHighValue}
                onChange={(e) => setSettings({ ...settings, requireApprovalForHighValue: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">API Credentials & Sandbox Security</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#141724] border border-[#23293F] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Demo Sandbox Mode</p>
                  <p className="text-[11px] text-slate-400">Keeps external courier charges and customer SMS simulated</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isDemoMode: !settings.isDemoMode })}
                  className={`px-3 py-1 rounded-md font-bold text-xs ${
                    settings.isDemoMode ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {settings.isDemoMode ? 'Active (Safe)' : 'Disabled (Live)'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#141724] border border-[#23293F] flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Server-side Secrets Vault</p>
                <p className="text-[11px] text-slate-400">API keys never exposed to frontend code or client network tabs</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                ENCRYPTED
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#141724] border border-[#23293F]">
              <div>
                <p className="font-semibold text-white">Slack Operational Webhooks</p>
                <p className="text-[11px] text-slate-400">Post approval alerts and digests to #operations channel</p>
              </div>
              <input
                type="checkbox"
                checked={settings.slackWebhookActive}
                onChange={(e) => setSettings({ ...settings, slackWebhookActive: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
