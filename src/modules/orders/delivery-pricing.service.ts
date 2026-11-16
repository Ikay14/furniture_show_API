import { Injectable } from '@nestjs/common';

export type DeliveryZone = 'same_city' | 'intra_state' | 'interstate';

const ZONE_RATE_PER_KG: Record<DeliveryZone, number> = {
  same_city: 1.5,
  intra_state: 2.5,
  interstate: 4.0,
};

const ZONE_BASE_FEE: Record<DeliveryZone, number> = {
  same_city: 15,
  intra_state: 30,
  interstate: 55,
};

@Injectable()
export class DeliveryPricingService {
  calculateVolumetricWeightKg(dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  }): number {
    if (!dimensions?.width || !dimensions?.height || !dimensions?.depth) {
      return 0;
    }
    return Number(((dimensions.width * dimensions.height * dimensions.depth) / 5000).toFixed(2));
  }

  resolveZone(
    vendorLocation?: { city?: string; state?: string },
    shippingAddress?: { city?: string; state?: string },
  ): DeliveryZone {
    const vCity = vendorLocation?.city?.trim().toLowerCase();
    const vState = vendorLocation?.state?.trim().toLowerCase();
    const sCity = shippingAddress?.city?.trim().toLowerCase();
    const sState = shippingAddress?.state?.trim().toLowerCase();

    if (vCity && sCity && vCity === sCity && (!vState || !sState || vState === sState)) {
      return 'same_city';
    }
    if (vState && sState && vState === sState) {
      return 'intra_state';
    }
    return 'interstate';
  }

  calculateOrderFees(
    order: { items?: any[]; vendor?: { city?: string; state?: string } },
    shippingAddress?: { city?: string; state?: string },
    requiresAssembly: boolean = false,
  ) {
    const zone = this.resolveZone(order.vendor, shippingAddress);
    let totalChargeableWeightKg = 0;
    let totalUnits = 0;

    for (const item of order.items || []) {
      const product = item.product || {};
      const qty = Number(item.quantity || 1);
      const volumetricKg = this.calculateVolumetricWeightKg(product.dimensions);
      const actualKg = Number.parseFloat(product.weight) || 0;
      const unitWeight = Math.max(volumetricKg, actualKg, 5);
      totalChargeableWeightKg += unitWeight * qty;
      totalUnits += qty;
    }

    const deliveryFee = Number(
      (ZONE_BASE_FEE[zone] + totalChargeableWeightKg * ZONE_RATE_PER_KG[zone]).toFixed(2),
    );
    const assemblyFee = requiresAssembly
      ? Number((totalUnits * 20 + totalChargeableWeightKg * 0.5).toFixed(2))
      : 0;

    return {
      zone,
      chargeableWeightKg: Number(totalChargeableWeightKg.toFixed(2)),
      deliveryFee,
      assemblyFee,
    };
  }

  calculateQuote(
    orders: Array<{ _id: any; totalPrice: number; items?: any[]; vendor?: { city?: string; state?: string } }>,
    shippingAddress?: { city?: string; state?: string },
    requiresAssembly: boolean = false,
  ) {
    const breakdown = orders.map((order) => {
      const fees = this.calculateOrderFees(order, shippingAddress, requiresAssembly);
      return {
        orderId: String(order._id),
        subtotal: order.totalPrice,
        ...fees,
      };
    });

    const subtotal = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
    const totalDeliveryFee = Number(breakdown.reduce((sum, b) => sum + b.deliveryFee, 0).toFixed(2));
    const totalAssemblyFee = Number(breakdown.reduce((sum, b) => sum + b.assemblyFee, 0).toFixed(2));
    const grandTotal = Number((subtotal + totalDeliveryFee + totalAssemblyFee).toFixed(2));

    return {
      subtotal,
      totalDeliveryFee,
      totalAssemblyFee,
      grandTotal,
      breakdown,
    };
  }
}
