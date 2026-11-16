import { DeliveryPricingService } from './delivery-pricing.service';

describe('DeliveryPricingService', () => {
  let service: DeliveryPricingService;

  beforeEach(() => {
    service = new DeliveryPricingService();
  });

  it('computes volumetric weight and uses max(volumetric, actual) for shipping', () => {
    // 200 x 90 x 80 cm / 5000 = 288 kg volumetric (> 45 kg actual)
    const quote = service.calculateQuote(
      [
        {
          _id: 'ord-1',
          totalPrice: 1200,
          vendor: { city: 'Lagos', state: 'Lagos' },
          items: [
            {
              quantity: 1,
              product: {
                dimensions: { width: 200, height: 90, depth: 80 },
                weight: '45',
              },
            },
          ],
        },
      ],
      { city: 'Abuja', state: 'FCT' },
      true,
    );

    expect(quote.breakdown[0].zone).toBe('interstate');
    expect(quote.breakdown[0].chargeableWeightKg).toBe(288);
    expect(quote.totalDeliveryFee).toBe(1207); // 55 + 288 * 4
    expect(quote.totalAssemblyFee).toBe(164); // 20 + 288 * 0.5
    expect(quote.grandTotal).toBe(2571);
  });

  it('applies same-city rates and zero assembly fee when assembly is not requested', () => {
    const quote = service.calculateQuote(
      [
        {
          _id: 'ord-2',
          totalPrice: 300,
          vendor: { city: 'Lagos', state: 'Lagos' },
          items: [
            {
              quantity: 2,
              product: {
                dimensions: { width: 50, height: 50, depth: 50 }, // 25 kg volumetric
                weight: '10',
              },
            },
          ],
        },
      ],
      { city: 'lagos', state: 'Lagos' },
      false,
    );

    expect(quote.breakdown[0].zone).toBe('same_city');
    expect(quote.totalDeliveryFee).toBe(90); // 15 + 50 * 1.5
    expect(quote.totalAssemblyFee).toBe(0);
    expect(quote.grandTotal).toBe(390);
  });
});
