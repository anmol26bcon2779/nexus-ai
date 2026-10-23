import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CheckSquare, ShieldAlert, Check, X, RefreshCw, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const ApprovalsView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovals();
      if (data.success) {
        setApprovals(data.approvals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await api.approveAction(id);
      if (res.success) {
        await loadApprovals();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await api.rejectAction(id);
      if (res.success) {
        await loadApprovals();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingList = approvals.filter((a) => a.status === 'pending');
  const historyList = approvals.filter((a) => a.status !== 'pending');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-4 rounded-xl bg-[#0F111A] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Approvals Gate</h2>
            <Badge variant="rose" dot pulseDot>
              {pendingList.length} Action{pendingList.length === 1 ? '' : 's'} Require Review
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop safety protection against high-cost bookings, courier cancellations, and mass customer messaging.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadApprovals} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
            Back to Overview
          </Button>
        </div>
      </div>

      {/* Pending Items */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Pending Approvals ({pendingList.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading approvals from backend...</div>
        ) : pendingList.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0F111A] border border-[#1F2438] text-center text-xs text-slate-400">
            No pending approvals requiring review. All workflows running within automatic parameters.
          </div>
        ) : (
          pendingList.map((item) => (
            <Card key={item.id} className="p-5 border-amber-500/30 bg-amber-950/10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    {item.orderId && <Badge variant="violet" size="sm">Order #{item.orderId}</Badge>}
                    <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleTimeString()}</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                    {item.reason}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>Customer: <strong className="text-white">{item.payload?.customerName || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Destination: <strong className="text-slate-300">{item.payload?.deliveryAddress || 'N/A'}</strong></span>
                    {item.costInr && (
                      <>
                        <span>•</span>
                        <span>Estimated Rate: <strong className="text-emerald-400">₹{item.costInr}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleReject(item.id)}
                    leftIcon={<X className="w-3.5 h-3.5 text-rose-400" />}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    isLoading={actionLoadingId === item.id}
                    onClick={() => handleApprove(item.id)}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Approve & Dispatch
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* History */}
      {historyList.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resolved Approvals History
          </h3>
          <div className="divide-y divide-[#1F2438] rounded-xl bg-[#0F111A] border border-[#1F2438] overflow-hidden">
            {historyList.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-200">{item.title}</p>
                  <p className="text-[11px] text-slate-400">{item.reason}</p>
                </div>
                <Badge variant={item.status === 'approved' ? 'emerald' : 'rose'} size="sm">
                  {item.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
