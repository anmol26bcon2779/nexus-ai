import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DemoModeBanner } from '../components/dashboard/DemoModeBanner';
import { MetricCard } from '../components/dashboard/MetricCard';
import { QuickActionsBar } from '../components/dashboard/QuickActionsBar';
import { AlertsBanner } from '../components/dashboard/AlertsBanner';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RecentExecutionsTable } from '../components/dashboard/RecentExecutionsTable';
import { AIInsightsCard } from '../components/dashboard/AIInsightsCard';
import {
  Zap,
  Plug,
  CheckSquare,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export const OverviewView: React.FC = () => {
  const { metrics, setActiveTab } = useApp();
  const [liveAnalytics, setLiveAnalytics] = useState<any>(null);

  useEffect(() => {
    api.getAnalytics().then((res) => {
      if (res.success) {
        setLiveAnalytics(res.data);
      }
    }).catch(console.error);
  }, []);

  const activeAutomations = liveAnalytics?.activeAutomations || metrics.activeAutomations;
  const connectedTools = liveAnalytics?.connectedToolsCount || metrics.connectedToolsCount;
  const pendingApprovals = liveAnalytics?.pendingApprovals !== undefined ? liveAnalytics.pendingApprovals : metrics.pendingApprovalsCount;
  const hoursSaved = liveAnalytics?.estimatedHoursSaved || metrics.estimatedHoursSaved;
  const awaitingFulfillment = liveAnalytics?.ordersAwaitingFulfillment !== undefined ? liveAnalytics.ordersAwaitingFulfillment : metrics.ordersAwaitingFulfillment;
  const deliveriesInProgress = liveAnalytics?.deliveriesInProgress !== undefined ? liveAnalytics.deliveriesInProgress : metrics.deliveriesInProgress;
  const deliveredCount = liveAnalytics?.deliveredCount !== undefined ? liveAnalytics.deliveredCount : metrics.deliveredOrders;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Demo Sandbox Alert Header */}
      <DemoModeBanner />

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Automations"
          value={activeAutomations}
          subtext="1,428 runs successful (99.2%)"
          trend={{ value: '+14% this week', isPositive: true }}
          icon={<Zap className="w-5 h-5 text-purple-400" />}
          iconBgColor="bg-purple-500/10 border border-purple-500/20"
          badge="12 Failures"
          badgeVariant="neutral"
          onClick={() => setActiveTab('studio')}
        />

        <MetricCard
          title="Connected Business Tools"
          value={connectedTools}
          subtext="Shopify, Porter, Shiprocket, Slack..."
          trend={{ value: 'All 8 Healthy', isPositive: true }}
          icon={<Plug className="w-5 h-5 text-blue-400" />}
          iconBgColor="bg-blue-500/10 border border-blue-500/20"
          badge="Demo Mode"
          badgeVariant="emerald"
          onClick={() => setActiveTab('integrations')}
        />

        <MetricCard
          title="Pending Approvals"
          value={pendingApprovals}
          subtext="High-value orders requiring review"
          trend={{ value: pendingApprovals > 0 ? 'Action required' : 'All clear', isPositive: pendingApprovals === 0 }}
          icon={<CheckSquare className="w-5 h-5 text-amber-400" />}
          iconBgColor="bg-amber-500/10 border border-amber-500/20"
          badge={pendingApprovals > 0 ? 'Urgent' : 'Clear'}
          badgeVariant={pendingApprovals > 0 ? 'amber' : 'emerald'}
          onClick={() => setActiveTab('approvals')}
        />

        <MetricCard
          title="Estimated Time Saved"
          value={`${hoursSaved}h`}
          subtext="Simulated manual effort avoided"
          trend={{ value: '+6.2h vs last wk', isPositive: true }}
          icon={<Clock className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 border border-emerald-500/20"
          badge="ROI +420%"
          badgeVariant="violet"
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* Orders & Logistics Secondary Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Orders Awaiting Fulfillment"
          value={awaitingFulfillment}
          subtext="Packed & ready for dispatch assignment"
          icon={<Package className="w-5 h-5 text-cyan-400" />}
          iconBgColor="bg-cyan-500/10 border border-cyan-500/20"
          badge={`${awaitingFulfillment} Ready`}
          badgeVariant="cyan"
          onClick={() => setActiveTab('orders')}
        />

        <MetricCard
          title="Deliveries In Progress"
          value={deliveriesInProgress}
          subtext="Intra-city express & Pan-India linehaul"
          icon={<Truck className="w-5 h-5 text-indigo-400" />}
          iconBgColor="bg-indigo-500/10 border border-indigo-500/20"
          badge={`${deliveriesInProgress} In Transit`}
          badgeVariant="blue"
          onClick={() => setActiveTab('orders')}
        />

        <MetricCard
          title="Completed Deliveries"
          value={deliveredCount}
          subtext="98.9% on-time delivery SLA"
          trend={{ value: '0 Exceptions', isPositive: true }}
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 border border-emerald-500/20"
          badge={`${deliveredCount} Delivered`}
          badgeVariant="emerald"
          onClick={() => setActiveTab('orders')}
        />
      </div>

      {/* Quick Actions Bar */}
      <QuickActionsBar />

      {/* Critical Operational Alerts */}
      <AlertsBanner />

      {/* Activity Chart & Telemetry */}
      <ActivityChart />

      {/* Split Row: Recent Workflow Executions & AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RecentExecutionsTable />
        </div>
        <div className="lg:col-span-5">
          <AIInsightsCard />
        </div>
      </div>
    </div>
  );
};
