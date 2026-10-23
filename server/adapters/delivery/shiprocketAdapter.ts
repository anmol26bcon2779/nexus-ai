import { CourierQuote, BookingRequest, BookingResult, TrackingEvent } from './types';

export class ShiprocketDeliveryAdapter {
  readonly id = 'shiprocket';
  readonly name = 'Shiprocket Pan-India Multi-Carrier';
  readonly isDemo = true;

  getQuotes(
    pickupPincode: string,
    deliveryPincode: string,
    weightKg: number
  ): CourierQuote[] {
    const isIntercity = pickupPincode.substring(0, 3) !== deliveryPincode.substring(0, 3);
    const weightSlab = Math.max(0.5, Math.ceil(weightKg * 2) / 2); // 0.5kg slabs

    const quotes: CourierQuote[] = [];

    // Air Express (Priority 1-2 Days)
    const airRate = Math.round(95 + weightSlab * 65);
    quotes.push({
      providerId: 'shiprocket',
      providerName: 'Shiprocket Pan-India',
      serviceName: 'Shiprocket Priority Air (BlueDart / Delhivery)',
      deliveryType: 'pan_india',
      estimatedPriceInr: airRate,
      estimatedMinutes: 24 * 60, // 24-48 hrs
      formattedEta: '1 - 2 Business Days (Air Express)',
      vehicleType: 'Air Cargo Jet',
      serviceable: true,
      restrictions: ['Dangerous goods not permitted', 'Max weight 30 kg'],
      isDemo: true,
    });

    // Surface Standard (Cost-optimized 3-5 Days)
    const surfaceRate = Math.round(55 + weightSlab * 35);
    quotes.push({
      providerId: 'shiprocket',
      providerName: 'Shiprocket Pan-India',
      serviceName: 'Shiprocket Standard Surface (DTDC / Ecom)',
      deliveryType: 'pan_india',
      estimatedPriceInr: surfaceRate,
      estimatedMinutes: 72 * 60, // 3-4 days
      formattedEta: '3 - 5 Business Days (Surface)',
      vehicleType: 'Heavy Surface Logistics',
      serviceable: true,
      restrictions: ['Standard volumetric guidelines apply'],
      isDemo: true,
    });

    return quotes;
  }

  async bookDelivery(request: BookingRequest): Promise<BookingResult> {
    const isAir = request.serviceName.toLowerCase().includes('air');
    const rate = isAir ? Math.round(95 + request.packageWeightKg * 65) : Math.round(55 + request.packageWeightKg * 35);

    const shipmentId = `SR-${Math.floor(100000 + Math.random() * 900000)}`;
    const awbCode = `DEMO-AWB-${Math.floor(10000000 + Math.random() * 90000000)}`;

    return {
      success: true,
      bookingId: shipmentId,
      trackingId: awbCode,
      trackingUrl: `https://nexus-demo.internal/tracking/${awbCode}`,
      providerId: this.id,
      providerName: this.name,
      bookedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + (isAir ? 36 : 84) * 3600 * 1000).toISOString(),
      chargedAmountInr: rate,
      status: 'booked',
      isDemo: true,
      carrierPayload: {
        partner: 'Shiprocket API Sandbox v2',
        carrierAssigned: isAir ? 'Blue Dart Express Air' : 'Delhivery Surface',
        awb: awbCode,
        labelUrl: `https://nexus-demo.internal/labels/${shipmentId}.pdf`,
        manifestGenerated: true,
        originPincode: request.pickupPincode,
        destinationPincode: request.deliveryPincode,
        idempotencyKey: request.idempotencyKey || `idem-${Date.now()}`,
      },
    };
  }

  getTrackingTimeline(awb: string, bookedAt: string): TrackingEvent[] {
    return [
      {
        timestamp: bookedAt,
        status: 'Shipment Manifested',
        location: 'Central Fulfillment Hub',
        description: `AWB ${awb} assigned to carrier. Pickup scheduled with local sorting center.`,
      },
      {
        timestamp: new Date(new Date(bookedAt).getTime() + 4 * 3600 * 1000).toISOString(),
        status: 'Picked up by Courier',
        location: 'Origin Processing Center',
        description: 'Package scanned at hub, bagged for regional transit.',
      },
      {
        timestamp: new Date(new Date(bookedAt).getTime() + 18 * 3600 * 1000).toISOString(),
        status: 'In Transit',
        location: 'Regional Linehaul Sorting Facility',
        description: 'Package in linehaul movement toward destination delivery station.',
      },
    ];
  }
}
