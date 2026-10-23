import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ScrollText, Clock, RefreshCw, CheckCircle2, AlertCircle, Hourglass, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const LogsView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getLogs(50);
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-4 rounded-xl bg-[#0F111A] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Execution Logs & Audit Trail</h2>
            <Badge variant="violet" dot>{logs.length} Executions Logged</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete step-by-step history of automation triggers, adapter responses, and error handling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadLogs} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
            Back to Overview
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow Runs & Webhook Deliveries</CardTitle>
          <span className="text-xs text-slate-400">All executions logged with idempotency keys</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading audit logs...</div>
          ) : (
            <div className="divide-y divide-[#1F2438] overflow-x-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-[#151824]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : log.status === 'waiting_approval' ? (
                        <Hourglass className="w-4 h-4 text-amber-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{log.workflowName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#181C2C] text-slate-400 border border-[#252C42]">
                          {log.sourceTool}
                        </span>
                        <span className="text-[10px] text-purple-400 font-mono">ID: {log.id}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{log.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.startedAt).toLocaleTimeString()}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{log.durationMs}ms</span>
                    <Badge
                      variant={
                        log.status === 'success'
                          ? 'emerald'
                          : log.status === 'waiting_approval'
                          ? 'amber'
                          : 'rose'
                      }
                      size="sm"
                    >
                      {log.status}
                    </Badge>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1E2F] border border-[#23293F] transition-colors"
                      title="Inspect Payloads"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Payload Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-purple-400" />
            <span>Audit Detail • {selectedLog?.workflowName}</span>
          </div>
        }
        description={`Execution ID: ${selectedLog?.id} • Key: ${selectedLog?.idempotencyKey}`}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-[#141724] border border-[#23293F]">
              <p className="font-bold text-white">Execution Summary:</p>
              <p className="text-slate-300 mt-1">{selectedLog.summary}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                Executed Steps ({selectedLog.steps?.length || 0}):
              </h4>
              <div className="space-y-2">
                {selectedLog.steps?.map((st: any, i: number) => (
                  <div key={st.stepId || i} className="p-3 rounded-lg bg-[#12141F] border border-[#242A40] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">
                        {i + 1}. {st.stepTitle}
                      </p>
                      <Badge variant={st.status === 'success' ? 'emerald' : 'amber'} size="sm">
                        {st.status} ({st.durationMs}ms)
                      </Badge>
                    </div>

                    <div className="p-2 rounded bg-black/50 font-mono text-[10px] text-slate-300 overflow-x-auto space-y-1">
                      <div><strong className="text-slate-500">Input:</strong> {JSON.stringify(st.inputPayload)}</div>
                      <div><strong className="text-purple-400">Output:</strong> {JSON.stringify(st.outputPayload)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
