import { getGoldPricingAdminData } from '../../../../lib/admin/gold-pricing';
import GoldPricingEditor from './GoldPricingEditor';

export const dynamic = 'force-dynamic';

export default async function GoldPricingPage() {
  const data = await getGoldPricingAdminData();
  return <GoldPricingEditor initialSettings={data.settings} />;
}
