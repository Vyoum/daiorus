import { getOverseasPricingData } from '../../../../lib/admin/overseas';
import OverseasPricingEditor from './OverseasPricingEditor';

export const dynamic = 'force-dynamic';

export default async function OverseasPricing() {
  const data = await getOverseasPricingData();
  return <OverseasPricingEditor initialData={data} />;
}
