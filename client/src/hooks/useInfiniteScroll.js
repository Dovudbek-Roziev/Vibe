import { useEffect, useRef } from 'react';

export function useInfiniteScroll(callback, hasMore) {
  const observerRef = useRef(null);

  const lastElementRef = (node) => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) callback();
    });
    if (node) observerRef.current.observe(node);
  };

  return lastElementRef;
}