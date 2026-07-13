import { getMediaLibraryContent } from '../../../../lib/site-content';
import MediaLibraryEditor from './MediaLibraryEditor';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const content = await getMediaLibraryContent();
  return <MediaLibraryEditor initialContent={content} />;
}
