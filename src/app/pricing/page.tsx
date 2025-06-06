import { getActiveProductsWithPrices } from '@/services/subscription';
import { Pricing } from './components/pricing';

export default async function PricingPage() {
  const products = await getActiveProductsWithPrices();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Pricing Plans</h1>
      <Pricing products={products} />
    </div>
  );
}