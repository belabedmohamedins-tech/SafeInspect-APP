// src/hooks/useCollapsibleSections.ts
// W3: memoize getSectionProgress result per section via useMemo so that
// evaluating one criterion does not cause every section header to re-render.
// W4 fix (2026-08-08): sections start EXPANDED (collapsed=false) so the
//   chevron is correct on first render (chevron-down = closed = invite to open)
//   and ONE tap opens the section. Unknown keys return false (expanded/safe).
//   New sections added dynamically also start expanded (false).
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  // All sections start EXPANDED (collapsed = false).
  // Chevron shows chevron-down when collapsed=true, chevron-up when collapsed=false.
  // One tap → true → section closes. Second tap → false → section opens.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sectionTitles.map(t => [t, false]))
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
          next[title] = false; // new sections start expanded
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
    (title: string) => collapsed[title] ?? false, // unknown title → expanded (safe)
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
