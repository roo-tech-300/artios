import { useEffect } from 'react';

// Sets the browser tab title for a page, so shared tabs and history read clearly.
export default function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Artios Fashion House` : 'Artios Fashion House · Wear the calling';
  }, [title]);
}
