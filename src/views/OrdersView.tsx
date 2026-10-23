import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Truck,
  Plus,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  weightKg: number;
  orderValueInr: number;
  pickupPincode: string;
  deliveryAddress: string;
  deliveryPincode: string;
  deliveryType: string;
  deliveryStatus: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  bookingId?: string;
  trackingId?: string;
  trackingUrl?: string;
  chargedAmountInr?: number;
  requiresApproval?: boolean;
  approvalReason?: string;
  createdAt: string;
}

interface QuoteItem {
  providerId: string;
  providerName: string;
  serviceName: string;
  deliveryType: string;
  estimatedPriceInr: number;
  formattedEta: string;
  vehicleType?: string;
  isRecommended?: boolean;
  recommendationReason?: string;
  serviceable: boolean;
}

export const OrdersView: React.FC = () => {
  const { setActiveTab, setIsQuickOrderModalOpen } = useApp();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Quotes Modal state
  const [activeQuotesOrder, setActiveQuotesOrder] = useState<OrderItem | null>(null);
  const [availableQuotes, setAvailableQuotes] = useState<QuoteItem[]>([]);
  const [recommendationReason, setRecommendationReason] = useState('');
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Tracking Timeline Modal
  const [trackingOrder, setTrackingOrder] = useState<OrderItem | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery || undefined,
      });
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, searchQuery]);

  const handleOpenQuotes = async (order: OrderItem) => {
    setActiveQuotesOrder(order);
    setQuotesLoading(true);
    try {
      const data = await api.getOrderQuotes(order.id);
      if (data.success) {
        setAvailableQuotes(data.quotes || []);
        setRecommendationReason(data.recommendationReason || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQuotesLoading(false);
    }
  };

  const handleBookQuote = async (quote: QuoteItem) => {
    if (!activeQuotesOrder) return;
    setBookingLoading(true);
    try {
      const res = await api.bookDelivery(activeQuotesOrder.id, quote.providerId, quote.serviceName);
      if (res.success) {
        setActiveQuotesOrder(null);
        await loadOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleViewTracking = async (order: OrderItem) => {
    setTrackingOrder(order);
    try {
      const data = await api.getOrder(order.id);
      if (data.success) {
        setTrackingEvents(data.timeline || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting_approval':
        return <Badge variant="amber" dot pulseDot>Awaiting Approval</Badge>;
      case 'in_transit':
        return <Badge variant="blue" dot pulseDot>In Transit</Badge>;
      case 'assigned':
        return <Badge variant="cyan" dot>Courier Assigned</Badge>;
      case 'delivered':
        return <Badge variant="emerald" dot>Delivered</Badge>;
      case 'ready_for_assignment':
        return <Badge variant="violet" dot>Ready for Dispatch</Badge>;
      default:
        return <Badge size="sm">{status.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0F111A] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Orders & Delivery Management</h2>
            <Badge variant="cyan" dot>Live Dispatch Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Smart routing: Local courier (Porter) & Pan-India logistics (Shiprocket) with real rate comparison & audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsQuickOrderModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Demo Order
          </Button>
          <Button variant="secondary" size="sm" onClick={loadOrders} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Demo Sandbox:</strong> All courier quotes, tracking IDs, and dispatch events are calculated from realistic Indian pin code models without live charges.
          </span>
        </div>
        <button
          onClick={() => setActiveTab('approvals')}
          className="underline font-semibold hover:text-white"
        >
          Review Approvals Gate →
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F111A] p-3 rounded-xl border border-[#1F2438]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search orders, customers, pin codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151824] border border-[#282F48] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#151824] border border-[#282F48] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="ready_for_assignment">Ready for Assignment</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="assigned">Courier Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Active Orders & Courier Assignments ({orders.length})</CardTitle>
          <span className="text-xs text-slate-400">Live Database Stream</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading orders from backend API...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No matching orders found.</div>
          ) : (
            <div className="divide-y divide-[#1F2438] overflow-x-auto">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 hover:bg-[#151824]/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">#{ord.orderNumber}</span>
                      <span className="text-slate-200 font-semibold">{ord.customerName}</span>
                      <span className="text-[11px] text-slate-400">({ord.customerPhone})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#181C2C] text-slate-400 border border-[#252C42]">
                        Pin: {ord.deliveryPincode}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ₹{ord.orderValueInr.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      <span>{ord.productName} ({ord.weightKg} kg)</span>
                      <span>•</span>
                      <span className="text-slate-300 truncate max-w-md">{ord.deliveryAddress}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-[11px] pt-0.5">
                      <span className="text-cyan-300 font-medium">
                        {ord.deliveryType === 'local_express' ? 'Local Express' : 'Pan-India Multi-Carrier'}
                      </span>
                      <span>•</span>
                      <span>Carrier: <strong className="text-slate-200">{ord.assignedProviderName || 'Unassigned'}</strong></span>
                      {ord.trackingId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-purple-300">AWB/Track: {ord.trackingId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                    {getStatusBadge(ord.deliveryStatus)}

                    {ord.deliveryStatus === 'awaiting_approval' ? (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => setActiveTab('approvals')}
                      >
                        Review in Approvals
                      </Button>
                    ) : ord.deliveryStatus === 'ready_for_assignment' ? (
                      <Button
                        variant="gradient"
                        size="xs"
                        onClick={() => handleOpenQuotes(ord)}
                        leftIcon={<Sparkles className="w-3 h-3" />}
                      >
                        Compare Rates & Assign
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleViewTracking(ord)}
                        >
                          View Tracking
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleOpenQuotes(ord)}
                        >
                          Change Carrier
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Courier Quotes Modal */}
      <Modal
        isOpen={!!activeQuotesOrder}
        onClose={() => setActiveQuotesOrder(null)}
        title={
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-400" />
            <span>Courier Rates & Smart Recommendation</span>
          </div>
        }
        description={
          activeQuotesOrder
            ? `Order #${activeQuotesOrder.orderNumber} • ${activeQuotesOrder.productName} (${activeQuotesOrder.weightKg} kg) to Pin ${activeQuotesOrder.deliveryPincode}`
            : ''
        }
        maxWidth="lg"
      >
        {quotesLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Querying Porter and Shiprocket adapter endpoints...
          </div>
        ) : (
          <div className="space-y-4">
            {recommendationReason && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-2.5 text-xs text-purple-200">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">AI Recommendation:</p>
                  <p className="text-[11px] text-purple-300 mt-0.5 leading-relaxed">{recommendationReason}</p>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {availableQuotes.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    q.isRecommended
                      ? 'bg-purple-600/10 border-purple-500/50 shadow-sm'
                      : 'bg-[#141724] border-[#242A40]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">{q.serviceName}</h4>
                      {q.isRecommended && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                          BEST MATCH
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-slate-400 text-[11px]">
                      <span>ETA: <strong className="text-slate-200">{q.formattedEta}</strong></span>
                      {q.vehicleType && (
                        <>
                          <span>•</span>
                          <span>Vehicle: {q.vehicleType}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      ₹{q.estimatedPriceInr}
                    </span>
                    <Button
                      variant={q.isRecommended ? 'gradient' : 'secondary'}
                      size="xs"
                      isLoading={bookingLoading}
                      onClick={() => handleBookQuote(q)}
                    >
                      Book Courier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Tracking Modal */}
      <Modal
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
        title={
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Tracking Lifecycle • #{trackingOrder?.orderNumber}</span>
          </div>
        }
        description={`Carrier: ${trackingOrder?.assignedProviderName} • Tracking ID: ${trackingOrder?.trackingId}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#141724] border border-[#23293F] text-xs space-y-1">
            <p className="text-slate-400">Destination: <strong className="text-white">{trackingOrder?.deliveryAddress}</strong></p>
            <p className="text-slate-400">Delivery Status: <strong className="text-cyan-300">{trackingOrder?.deliveryStatus.replace('_', ' ')}</strong></p>
          </div>

          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#282F48]">
            {trackingEvents.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 relative pl-6 text-xs">
                <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-[#0F111A]" />
                <div>
                  <p className="font-bold text-white">{ev.status}</p>
                  <p className="text-[11px] text-slate-400">{ev.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{new Date(ev.timestamp).toLocaleTimeString()} • {ev.location}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setTrackingOrder(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
