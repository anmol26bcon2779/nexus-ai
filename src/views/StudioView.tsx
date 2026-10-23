import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Workflow,
  Plus,
  Zap,
  ArrowRight,
  ShieldCheck,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const StudioView: React.FC = () => {
  const { setActiveTab, setIsQuickAutomationModalOpen } = useApp();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Execution result modal
  const [activeExecLog, setActiveExecLog] = useState<any | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await api.getWorkflows();
      if (data.success) {
        setWorkflows(data.workflows);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleTestExecute = async (wf: any) => {
    setRunningId(wf.id);
    try {
      const res = await api.executeWorkflow(wf.id, {
        orderId: 'NX-8941',
        orderNumber: 'NX-8941',
        customerName: 'Priya Iyer',
        pickupPincode: '560066',
        deliveryPincode: '400050',
        weightKg: 4.5,
        orderValueInr: 8500,
      });
      if (res.success) {
        setActiveExecLog(res.log);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-4 rounded-xl bg-[#0F111A] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Automation Studio</h2>
            <Badge variant="blue" dot>{workflows.length} Workflows Loaded</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual connected-step engine supporting webhooks, scheduled triggers, courier adapters, and approval gates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsQuickAutomationModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create from Prompt
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
            Back to Overview
          </Button>
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((wf) => (
          <Card key={wf.id} className="p-5 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">
                  {wf.sourceTool} • {wf.triggerType}
                </span>
                <Badge variant={wf.isActive ? 'emerald' : 'neutral'} size="sm" dot>
                  {wf.isActive ? 'Active' : 'Paused'}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-white mt-1">{wf.name}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{wf.description}</p>

              {/* Connected Steps Preview */}
              <div className="mt-4 pt-3 border-t border-[#1F2438] space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Execution Pipeline ({wf.steps?.length || 0} nodes):
                </p>
                <div className="space-y-1">
                  {wf.steps?.slice(0, 4).map((st: any, idx: number) => (
                    <div key={st.id} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-[#181C2B] text-slate-400 flex items-center justify-center font-mono text-[9px] border border-[#262C42]">
                        {idx + 1}
                      </span>
                      <span className="truncate">{st.title}</span>
                      <span className="text-[9px] text-slate-500 font-mono ml-auto">[{st.type}]</span>
                    </div>
                  ))}
                  {wf.steps?.length > 4 && (
                    <p className="text-[10px] text-purple-400 font-semibold pl-6">
                      + {wf.steps.length - 4} more sequential steps
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#1F2438] flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {wf.successfulExecutions}/{wf.totalExecutions} successful runs
              </span>
              <Button
                variant="primary"
                size="xs"
                isLoading={runningId === wf.id}
                onClick={() => handleTestExecute(wf)}
                leftIcon={<Play className="w-3 h-3 fill-current" />}
              >
                Test Run
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Execution Step Inspector Modal */}
      <Modal
        isOpen={!!activeExecLog}
        onClose={() => setActiveExecLog(null)}
        title={
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Workflow Execution Result • {activeExecLog?.workflowName}</span>
          </div>
        }
        description={`Status: ${activeExecLog?.status.toUpperCase()} • Total Duration: ${activeExecLog?.durationMs}ms`}
        maxWidth="lg"
      >
        {activeExecLog && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-[#141724] border border-[#23293F]">
              <p className="text-slate-300">{activeExecLog.summary}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                Step-by-Step Execution Audit ({activeExecLog.steps.length} steps):
              </h4>
              <div className="space-y-2">
                {activeExecLog.steps.map((st: any, i: number) => (
                  <div key={st.stepId} className="p-3 rounded-lg bg-[#12141F] border border-[#242A40] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center font-mono">
                          {i + 1}
                        </span>
                        <p className="font-bold text-white">{st.stepTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{st.durationMs}ms</span>
                        <Badge variant={st.status === 'success' ? 'emerald' : 'amber'} size="sm">
                          {st.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/40 font-mono text-[10px] text-slate-300 overflow-x-auto">
                      Payload: {JSON.stringify(st.outputPayload)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[#1F2438]">
              <span className="text-[11px] text-slate-400">Idempotency Key: {activeExecLog.idempotencyKey}</span>
              <Button variant="secondary" size="sm" onClick={() => setActiveExecLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
