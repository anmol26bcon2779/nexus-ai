// Nexus AI Universal Client API Service
const API_BASE = '/api';

export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  weightKg: number;
  orderValueInr: number;
  pickupAddress?: string;
  pickupPincode?: string;
  deliveryAddress: string;
  deliveryPincode: string;
}

export const api = {
  // Health
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Orders & Deliveries
  async getOrders(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/orders${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getOrder(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return res.json();
  },

  async getOrderQuotes(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}/quotes`);
    return res.json();
  },

  async createOrder(payload: OrderPayload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async bookDelivery(id: string, providerId: string, serviceName: string) {
    const res = await fetch(`${API_BASE}/orders/${id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, serviceName }),
    });
    return res.json();
  },

  async updateOrderStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Workflows
  async getWorkflows() {
    const res = await fetch(`${API_BASE}/workflows`);
    return res.json();
  },

  async executeWorkflow(workflowId: string, payload: Record<string, unknown> = {}) {
    const res = await fetch(`${API_BASE}/workflows/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId, payload }),
    });
    return res.json();
  },

  // Integrations Hub
  async getIntegrations() {
    const res = await fetch(`${API_BASE}/integrations`);
    return res.json();
  },

  async testIntegration(id: string) {
    const res = await fetch(`${API_BASE}/integrations/${id}/test`, {
      method: 'POST',
    });
    return res.json();
  },

  async toggleIntegration(id: string) {
    const res = await fetch(`${API_BASE}/integrations/${id}/toggle`, {
      method: 'POST',
    });
    return res.json();
  },

  // Leads & CRM
  async getLeads() {
    const res = await fetch(`${API_BASE}/leads`);
    return res.json();
  },

  async createLead(lead: { name: string; phone: string; channel?: string; message?: string; productInterest?: string }) {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    return res.json();
  },

  // Approvals Gate
  async getApprovals() {
    const res = await fetch(`${API_BASE}/approvals`);
    return res.json();
  },

  async approveAction(id: string) {
    const res = await fetch(`${API_BASE}/approvals/${id}/approve`, {
      method: 'POST',
    });
    return res.json();
  },

  async rejectAction(id: string) {
    const res = await fetch(`${API_BASE}/approvals/${id}/reject`, {
      method: 'POST',
    });
    return res.json();
  },

  // Analytics & Logs
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },

  async getLogs(limit: number = 50) {
    const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
    return res.json();
  },

  // AI Assistant
  async chatAssistant(message: string) {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  async generateWorkflow(prompt: string) {
    const res = await fetch(`${API_BASE}/assistant/generate-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};
