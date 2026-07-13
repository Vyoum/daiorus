import HomePage from '../components/HomePage';
import { getLandingContent } from '../lib/site-content';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { announce, hero, signature } = await getLandingContent();
  return <HomePage announce={announce} hero={hero} signature={signature} />;
}
