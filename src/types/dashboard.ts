export interface DashboardMetrics {
  activeAutomations: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  connectedToolsCount: number;
  pendingApprovalsCount: number;
  ordersAwaitingFulfillment: number;
  deliveriesInProgress: number;
  deliveredOrders: number;
  failedOrders: number;
  estimatedHoursSaved: number;
}

export interface ActivityDataPoint {
  date: string;
  executions: number;
  orders: number;
  deliveries: number;
}

export type ExecutionStatus = 'success' | 'failed' | 'running' | 'waiting_approval' | 'retrying';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerType: 'webhook' | 'schedule' | 'manual' | 'order_event';
  sourceTool: string;
  startedAt: string;
  durationMs: number;
  status: ExecutionStatus;
  summary: string;
  isDemo: boolean;
  stepsCount: number;
  completedStepsCount: number;
}

export interface AIInsight {
  id: string;
  type: 'optimization' | 'risk' | 'cost_saving' | 'delivery';
  title: string;
  description: string;
  impact: string;
  recommendedAction: string;
  actionTab?: string;
  actionPayload?: Record<string, unknown>;
  confidenceScore: number;
  createdAt: string;
}

export interface DashboardAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  source: string;
  actionLabel: string;
  actionTab: string;
  timestamp: string;
  dismissed?: boolean;
}
