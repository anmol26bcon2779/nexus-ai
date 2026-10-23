import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useApp } from '../../context/AppContext';
import { PackagePlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const QuickOrderModal: React.FC = () => {
  const { isQuickOrderModalOpen, setIsQuickOrderModalOpen, setActiveTab } = useApp();

  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [product, setProduct] = useState('Ergonomic Wooden Monitor Stand');
  const [quantity, setQuantity] = useState('1');
  const [weightKg, setWeightKg] = useState('1.2');
  const [address, setAddress] = useState('1204, 5th Block, Koramangala, Bengaluru, Karnataka 560034');
  const [pincode, setPincode] = useState('560034');
  const [orderValue, setOrderValue] = useState('2499');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.createOrder({
        customerName,
        customerPhone: phone,
        productName: product,
        quantity: Number(quantity),
        weightKg: Number(weightKg),
        orderValueInr: Number(orderValue),
        deliveryAddress: address,
        deliveryPincode: pincode,
      });

      if (res.success && res.order) {
        setCreatedOrderNumber(res.order.orderNumber);
        setTimeout(() => {
          setCreatedOrderNumber(null);
          setIsQuickOrderModalOpen(false);
          setActiveTab('orders');
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isQuickOrderModalOpen}
      onClose={() => setIsQuickOrderModalOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-emerald-400" />
          <span>Add Demo Order for Instant Routing</span>
        </div>
      }
      description="Simulate a new e-commerce order to test Porter local dispatch vs Shiprocket pan-India freight"
      maxWidth="lg"
    >
      {createdOrderNumber ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Order Created & Dispatched!</h3>
          <p className="text-xs text-slate-400">
            Assigned Order ID: <span className="text-purple-400 font-mono font-bold">#{createdOrderNumber}</span>. Navigating to Orders...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Product Name"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Value (INR)"
                type="number"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Input
                label="Weight (kg)"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                type="number"
                step="0.1"
                required
              />
            </div>
            <div>
              <Input
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                required
              />
            </div>
            <div>
              <Input
                label="Destination Pin Code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Delivery Street Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#151824] border border-[#282F48] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/70 resize-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-2.5 text-xs text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Autonomous delivery engine will check proximity (560xxx local vs national), compare Porter & Shiprocket, and route order immediately.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsQuickOrderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<PackagePlus className="w-4 h-4" />}
            >
              Create & Match Courier
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
