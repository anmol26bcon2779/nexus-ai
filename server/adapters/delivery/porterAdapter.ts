import { CourierQuote, BookingRequest, BookingResult, TrackingEvent } from './types';

// Supported local intra-city hubs
const CITY_PINCODES: Record<string, string> = {
  '560': 'Bengaluru',
  '400': 'Mumbai',
  '110': 'Delhi NCR',
  '500': 'Hyderabad',
  '600': 'Chennai',
  '411': 'Pune',
  '700': 'Kolkata',
};

export class PorterDeliveryAdapter {
  readonly id = 'porter';
  readonly name = 'Porter Local Logistics';
  readonly isDemo = true;

  // Check if pickup & delivery are in the same urban hub
  isLocalServiceable(pickupPincode: string, deliveryPincode: string): boolean {
    const pickupPrefix = pickupPincode.substring(0, 3);
    const deliveryPrefix = deliveryPincode.substring(0, 3);
    return pickupPrefix === deliveryPrefix && !!CITY_PINCODES[pickupPrefix];
  }

  // Estimate distance based on pin code difference
  calculateDistanceKm(pickupPincode: string, deliveryPincode: string): number {
    const p1 = parseInt(pickupPincode, 10);
    const p2 = parseInt(deliveryPincode, 10);
    const diff = Math.abs(p1 - p2);
    // Typical intra-city pin code delta maps to 3 to 22 km
    const km = Math.max(3.2, Math.min(24.5, (diff % 18) + 3.8));
    return parseFloat(km.toFixed(1));
  }

  getQuotes(
    pickupPincode: string,
    deliveryPincode: string,
    weightKg: number
  ): CourierQuote[] {
    const isServiceable = this.isLocalServiceable(pickupPincode, deliveryPincode);
    if (!isServiceable) {
      return [];
    }

    const distanceKm = this.calculateDistanceKm(pickupPincode, deliveryPincode);
    const city = CITY_PINCODES[pickupPincode.substring(0, 3)] || 'Local Metro';

    const quotes: CourierQuote[] = [];

    // 2-Wheeler Express (Light packages < 20kg)
    if (weightKg <= 20) {
      const price2W = Math.round(45 + distanceKm * 12.5);
      const etaMins2W = Math.round(20 + distanceKm * 2.8);

      quotes.push({
        providerId: 'porter',
        providerName: 'Porter Local',
        serviceName: 'Porter 2-Wheeler Express',
        deliveryType: 'local_express',
        estimatedPriceInr: price2W,
        estimatedMinutes: etaMins2W,
        formattedEta: `${etaMins2W} mins (${distanceKm} km in ${city})`,
        vehicleType: '2-Wheeler Bike',
        serviceable: true,
        restrictions: ['Max 20 kg', 'Package fits in backpack/box'],
        isDemo: true,
      });
    }

    // 3-Wheeler / Mini Truck (Bulkier packages > 10kg or any)
    const price3W = Math.round(180 + distanceKm * 22);
    const etaMins3W = Math.round(35 + distanceKm * 3.5);

    quotes.push({
      providerId: 'porter',
      providerName: 'Porter Local',
      serviceName: 'Porter Mini-Truck / 3-Wheeler',
      deliveryType: 'local_express',
      estimatedPriceInr: price3W,
      estimatedMinutes: etaMins3W,
      formattedEta: `${etaMins3W} mins (${distanceKm} km in ${city})`,
      vehicleType: '3-Wheeler / Piaggio Ape',
      serviceable: true,
      restrictions: ['Up to 500 kg', 'Commercial cargo allowed'],
      isDemo: true,
    });

    return quotes;
  }

  async bookDelivery(request: BookingRequest): Promise<BookingResult> {
    const distanceKm = this.calculateDistanceKm(request.pickupPincode, request.deliveryPincode);
    const is2W = request.serviceName.includes('2-Wheeler');
    const amount = is2W ? Math.round(45 + distanceKm * 12.5) : Math.round(180 + distanceKm * 22);

    const bookingNum = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `PTR-BK-${bookingNum}`;
    const trackingId = `DEMO-PTR-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      bookingId,
      trackingId,
      trackingUrl: `https://nexus-demo.internal/tracking/${trackingId}`,
      providerId: this.id,
      providerName: this.name,
      bookedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      chargedAmountInr: amount,
      status: 'assigned',
      isDemo: true,
      carrierPayload: {
        partner: 'Porter Enterprise API Sandbox',
        vehicleAssigned: is2W ? 'Honda Activa (KA-01-EQ-4491)' : 'Mahindra Bolero (KA-04-B-8821)',
        riderName: is2W ? 'Ramesh Kumar (+91 98451 00291)' : 'Suresh Yadav (+91 99002 11827)',
        distanceKm,
        originPincode: request.pickupPincode,
        destinationPincode: request.deliveryPincode,
        idempotencyKey: request.idempotencyKey || `idem-${Date.now()}`,
      },
    };
  }

  getTrackingTimeline(trackingId: string, bookedAt: string): TrackingEvent[] {
    const now = new Date();
    return [
      {
        timestamp: bookedAt,
        status: 'Booking Confirmed',
        location: 'Porter Dispatch Center',
        description: `Order assigned to courier partner. Verification code generated for pickup.`,
      },
      {
        timestamp: new Date(new Date(bookedAt).getTime() + 10 * 60 * 1000).toISOString(),
        status: 'Rider En Route to Pickup',
        location: 'Merchant Warehouse',
        description: 'Assigned rider is arriving at pickup location.',
      },
      {
        timestamp: new Date(new Date(bookedAt).getTime() + 25 * 60 * 1000).toISOString(),
        status: 'Package Picked Up',
        location: 'In Transit Hub',
        description: 'Package verified and safely loaded. On route to delivery destination.',
      },
    ];
  }
}
