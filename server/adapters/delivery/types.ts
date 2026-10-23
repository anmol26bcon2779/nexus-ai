export type DeliveryType = 'local_express' | 'pan_india';

export interface CourierQuote {
  providerId: 'porter' | 'shiprocket' | 'manual_rider';
  providerName: string;
  serviceName: string;
  deliveryType: DeliveryType;
  estimatedPriceInr: number;
  estimatedMinutes: number;
  formattedEta: string;
  vehicleType?: string;
  isRecommended?: boolean;
  recommendationReason?: string;
  serviceable: boolean;
  restrictions?: string[];
  isDemo: boolean;
}

export interface BookingRequest {
  orderId: string;
  providerId: 'porter' | 'shiprocket' | 'manual_rider';
  serviceName: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupPincode: string;
  deliveryPincode: string;
  customerName: string;
  customerPhone: string;
  packageWeightKg: number;
  orderValueInr: number;
  idempotencyKey?: string;
}

export interface BookingResult {
  success: boolean;
  bookingId: string;
  trackingId: string;
  trackingUrl: string;
  providerId: string;
  providerName: string;
  bookedAt: string;
  estimatedDelivery: string;
  chargedAmountInr: number;
  status: 'booked' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
  isDemo: boolean;
  carrierPayload: Record<string, unknown>;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}
