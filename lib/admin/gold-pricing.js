import { getGoldPricingSettings } from '../gold-pricing';

export async function getGoldPricingAdminData() {
  const settings = await getGoldPricingSettings();
  return { settings };
}
