// src/hooks/useCollapsibleSections.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  // All sections start EXPANDED (collapsed = false).
  // Individual sections collapse when the user taps the header.
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
          next[title] = false; // new sections also start expanded
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
    (title: string) => collapsed[title] ?? false,
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
