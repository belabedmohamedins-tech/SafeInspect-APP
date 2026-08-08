// src/hooks/useCollapsibleSections.ts
// W3: memoize getSectionProgress result per section via useMemo so that
// evaluating one criterion does not cause every section header to re-render.
// W4-fix (2026-08-08): sections start collapsed=true (closed) so the first
//   tap correctly opens them (collapsed→false, chevron-down→chevron-up).
//   Previous collapsed=false initial state caused react-native-collapsible to
//   render visually closed on mount despite state saying open, producing a
//   3-step tap cycle: down(closed) → right(mid) → down(open).
//   Unknown keys return true (collapsed/safe — never accidentally shows content).
//   New sections added dynamically also start collapsed (true).
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  // All sections start COLLAPSED (collapsed = true).
  // chevron-down shown when collapsed=true  → tap opens  (collapsed → false, chevron-up)
  // chevron-up   shown when collapsed=false → tap closes (collapsed → true,  chevron-down)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sectionTitles.map(t => [t, true]))
  );

  const titlesKey = sectionTitles.join('||');
  const titlesRef = useRef(sectionTitles);
  titlesRef.current = sectionTitles;

  useEffect(() => {
    setCollapsed(prev => {
      const next = { ...prev };
      let changed = false;
      for (const title of titlesRef.current) {
        if (!(title in next)) {
          next[title] = true; // new sections start collapsed
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [titlesKey]);

  const toggleSection = useCallback((title: string) => {
    setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const isCollapsed = useCallback(
    (title: string) => collapsed[title] ?? true, // unknown title → collapsed (safe)
    [collapsed]
  );

  const getSectionProgress = useCallback(
    (items: { complianceStatus: string }[]) => {
      const evaluated = items.filter(i => i.complianceStatus !== 'not-evaluated').length;
      return `${evaluated}/${items.length}`;
    },
    []
  );

  return { collapsed, isCollapsed, toggleSection, getSectionProgress };
}
