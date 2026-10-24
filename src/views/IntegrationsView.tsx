import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Plug,
  Check,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const IntegrationsView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; latency: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Configure Modal
  const [activeConfigItem, setActiveConfigItem] = useState<any | null>(null);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await api.getIntegrations();
      if (data.success) {
        setIntegrations(data.integrations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await api.testIntegration(id);
      if (res.success) {
        setTestResult({
          id,
          message: res.message,
          latency: res.latencyMs,
        });
        await loadIntegrations();
        setTimeout(() => setTestResult(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleConnection = async (id: string) => {
    try {
      await api.toggleIntegration(id);
      await loadIntegrations();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = integrations.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'logistics', label: 'Logistics & Delivery' },
    { id: 'communication', label: 'Communication' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'developer', label: 'Developer & Webhooks' },
  ];

  // Official verified website destinations for each integration
  const INTEGRATION_OFFICIAL_URLS: Record<string, { url: string; label: string }> = {
    shopify: { url: 'https://www.shopify.com/', label: 'Visit Shopify' },
    woocommerce: { url: 'https://woocommerce.com/', label: 'Visit WooCommerce' },
    porter: { url: 'https://porter.in/', label: 'Visit Porter' },
    shiprocket: { url: 'https://www.shiprocket.in/', label: 'Visit Shiprocket' },
    whatsapp: { url: 'https://business.whatsapp.com/', label: 'Visit WhatsApp' },
    slack: { url: 'https://slack.com/', label: 'Visit Slack' },
    gmail: { url: 'https://mail.google.com/', label: 'Visit Gmail' },
    sheets: { url: 'https://sheets.google.com/', label: 'Visit Google Sheets' },
    instagram: { url: 'https://www.instagram.com/', label: 'Visit Instagram' },
    webhook: { url: 'https://www.google.com/', label: 'Visit Website' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-4 rounded-xl bg-[#0F111A] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Integrations Hub</h2>
            <Badge variant="emerald" dot>
              {integrations.filter((i) => i.status === 'demo_connected' || i.status === 'connected').length} Connected
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard adapter architecture with verified triggers, actions, and server-side secret management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadIntegrations} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
            Back to Overview
          </Button>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{testResult.message}</span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded">
            {testResult.latency} ms
          </span>
        </div>
      )}

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F111A] p-3 rounded-xl border border-[#1F2438]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#151824]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151824] border border-[#282F48] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const official = INTEGRATION_OFFICIAL_URLS[item.id] || {
            url: 'https://www.google.com/',
            label: `Visit ${item.name}`,
          };

          return (
            <Card
              key={item.id}
              onClick={(e) => {
                // If user clicked a button or anchor inside, let the child handler handle it
                if ((e.target as HTMLElement).closest('button, a')) return;
                window.open(official.url, '_blank', 'noopener,noreferrer');
              }}
              className="p-4 flex flex-col justify-between hover:border-purple-500/40 transition-colors cursor-pointer hover:bg-purple-950/10"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-[#161928] px-2 py-0.5 rounded border border-[#252C42]">
                    {item.category}
                  </span>
                  <Badge
                    variant={
                      item.status === 'demo_connected'
                        ? 'emerald'
                        : item.status === 'connected'
                        ? 'cyan'
                        : 'neutral'
                    }
                    size="sm"
                    dot
                  >
                    {item.status === 'demo_connected'
                      ? 'Demo Connected'
                      : item.status === 'connected'
                      ? 'Live Connected'
                      : 'Not Connected'}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-white mt-1">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="mt-3 pt-2 border-t border-[#1F2438] space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Triggers:</span>
                    <span className="text-slate-200 font-semibold">{item.supportedTriggers?.length || 0} supported</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Actions:</span>
                    <span className="text-slate-200 font-semibold">{item.supportedActions?.length || 0} supported</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2438] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTestConnection(item.id)}
                  disabled={testingId === item.id}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  {testingId === item.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>Test Ping</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveConfigItem(item)}
                    className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-[#181C2C] hover:bg-[#20253B] border border-[#2A314C]"
                  >
                    Configure
                  </button>
                  <a
                    href={official.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded transition-colors bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{official.label}</span>
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Configure Modal */}
      <Modal
        isOpen={!!activeConfigItem}
        onClose={() => setActiveConfigItem(null)}
        title={
          <div className="flex items-center gap-2">
            <Plug className="w-5 h-5 text-purple-400" />
            <span>Configure {activeConfigItem?.name}</span>
          </div>
        }
        description={activeConfigItem?.description}
        maxWidth="lg"
      >
        {activeConfigItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-[#141724] border border-[#23293F] space-y-1">
              <p className="font-bold text-white">Setup Instructions:</p>
              <p className="text-slate-300">{activeConfigItem.setupInstructions}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                Supported Triggers & Webhook Events:
              </h4>
              <div className="space-y-1.5">
                {activeConfigItem.supportedTriggers.map((trig: any) => (
                  <div key={trig.id} className="p-2 rounded bg-[#151824] border border-[#242A40] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{trig.name}</p>
                      <p className="text-[10px] text-slate-400">{trig.description}</p>
                    </div>
                    <code className="text-[10px] text-purple-300 font-mono">{trig.id}</code>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                Supported Automated Actions:
              </h4>
              <div className="space-y-1.5">
                {activeConfigItem.supportedActions.map((act: any) => (
                  <div key={act.id} className="p-2 rounded bg-[#151824] border border-[#242A40] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{act.name}</p>
                      <p className="text-[10px] text-slate-400">{act.description}</p>
                    </div>
                    <code className="text-[10px] text-cyan-300 font-mono">{act.id}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveConfigItem(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleTestConnection(activeConfigItem.id);
                  setActiveConfigItem(null);
                }}
              >
                Save & Test Connection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
