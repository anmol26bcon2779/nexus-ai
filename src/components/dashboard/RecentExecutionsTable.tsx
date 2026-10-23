import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { mockRecentExecutions } from '../../data/mockData';
import type { WorkflowExecution } from '../../types/dashboard';
import { useApp } from '../../context/AppContext';
import {
  ScrollText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const RecentExecutionsTable: React.FC = () => {
  const { setActiveTab } = useApp();

  const getStatusBadge = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="emerald" dot size="sm">
            Success
          </Badge>
        );
      case 'waiting_approval':
        return (
          <Badge variant="amber" dot pulseDot size="sm">
            Awaiting Approval
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="rose" dot size="sm">
            Failed (Retrying)
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="violet" dot pulseDot size="sm">
            In Progress
          </Badge>
        );
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ScrollText className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>Recent Workflow Executions</CardTitle>
            <p className="text-xs text-slate-400">
              Live audit stream of triggered business rules & integrations
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('logs')}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 group transition-colors"
        >
          <span>View All Logs</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-[#1F2438]/60 overflow-x-auto">
          {mockRecentExecutions.slice(0, 5).map((exec) => (
            <div
              key={exec.id}
              className="p-4 hover:bg-[#151824]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {exec.status === 'success' ? (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : exec.status === 'waiting_approval' ? (
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                      <Hourglass className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200 hover:text-purple-300 transition-colors">
                      {exec.workflowName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#181C2C] text-slate-400 border border-[#252C42]">
                      {exec.sourceTool}
                    </span>
                    <span className="text-[10px] text-purple-400/90 font-mono">
                      {exec.completedStepsCount}/{exec.stepsCount} steps
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 truncate max-w-xl">
                    {exec.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{exec.startedAt}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {exec.durationMs}ms
                  </span>
                </div>

                <div className="shrink-0">{getStatusBadge(exec.status)}</div>

                {exec.status === 'waiting_approval' ? (
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Review</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1E2F] border border-[#23293F] transition-colors"
                    title="View Step Payload Details"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
