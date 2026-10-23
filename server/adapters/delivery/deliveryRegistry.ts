import { PorterDeliveryAdapter } from './porterAdapter';
import { ShiprocketDeliveryAdapter } from './shiprocketAdapter';
import { CourierQuote, BookingRequest, BookingResult, DeliveryType } from './types';

export class DeliveryRegistry {
  private porter = new PorterDeliveryAdapter();
  private shiprocket = new ShiprocketDeliveryAdapter();

  classifyDelivery(pickupPincode: string, deliveryPincode: string): {
    deliveryType: DeliveryType;
    isLocal: boolean;
    city: string;
  } {
    const isLocal = this.porter.isLocalServiceable(pickupPincode, deliveryPincode);
    return {
      deliveryType: isLocal ? 'local_express' : 'pan_india',
      isLocal,
      city: isLocal ? 'Intra-city Metro' : 'Inter-state / Pan-India',
    };
  }

  getAvailableQuotes(
    pickupPincode: string,
    deliveryPincode: string,
    weightKg: number,
    orderValue: number
  ): {
    quotes: CourierQuote[];
    recommendedQuote?: CourierQuote;
    recommendationReason: string;
    requiresApproval: boolean;
    approvalReason?: string;
  } {
    const { isLocal } = this.classifyDelivery(pickupPincode, deliveryPincode);
    const quotes: CourierQuote[] = [];

    // 1. Fetch Local quotes if serviceable
    if (isLocal) {
      const porterQuotes = this.porter.getQuotes(pickupPincode, deliveryPincode, weightKg);
      quotes.push(...porterQuotes);
    }

    // 2. Fetch Pan-India quotes
    const shiprocketQuotes = this.shiprocket.getQuotes(pickupPincode, deliveryPincode, weightKg);
    quotes.push(...shiprocketQuotes);

    // 3. Smart Recommendation Algorithm
    let recommended: CourierQuote | undefined;
    let reason = '';

    if (isLocal && quotes.some((q) => q.providerId === 'porter')) {
      // Prioritize fast intra-city local courier for local pin codes
      recommended = quotes.find((q) => q.serviceName.includes('2-Wheeler')) || quotes[0];
      reason = `Intra-city destination detected (${pickupPincode} -> ${deliveryPincode}). Porter Local delivers in ${recommended.formattedEta} at lowest cost (₹${recommended.estimatedPriceInr}).`;
    } else {
      // Pan-India: Balance speed vs value
      if (orderValue >= 5000) {
        recommended = quotes.find((q) => q.serviceName.includes('Air')) || quotes[0];
        reason = `High-value order (₹${orderValue.toLocaleString('en-IN')}) requires priority transit. Shiprocket Air Express provides insured next-day delivery.`;
      } else {
        recommended = quotes.find((q) => q.serviceName.includes('Surface')) || quotes[0];
        reason = `Cost-optimized for standard e-commerce shipment. Shiprocket Surface delivers at ₹${recommended?.estimatedPriceInr}.`;
      }
    }

    if (recommended) {
      recommended.isRecommended = true;
      recommended.recommendationReason = reason;
    }

    // 4. Check Approval Threshold (>₹10,000 order value requires human confirmation)
    const requiresApproval = orderValue >= 10000;
    const approvalReason = requiresApproval
      ? `Order value (₹${orderValue.toLocaleString('en-IN')}) exceeds the auto-dispatch limit of ₹10,000. Human verification required before carrier booking.`
      : undefined;

    return {
      quotes,
      recommendedQuote: recommended,
      recommendationReason: reason,
      requiresApproval,
      approvalReason,
    };
  }

  async bookDelivery(request: BookingRequest): Promise<BookingResult> {
    if (request.providerId === 'porter') {
      return this.porter.bookDelivery(request);
    }
    return this.shiprocket.bookDelivery(request);
  }

  getTrackingTimeline(providerId: string, trackingId: string, bookedAt: string) {
    if (providerId === 'porter') {
      return this.porter.getTrackingTimeline(trackingId, bookedAt);
    }
    return this.shiprocket.getTrackingTimeline(trackingId, bookedAt);
  }
}

export const deliveryRegistry = new DeliveryRegistry();
