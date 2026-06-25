// src/hooks/useCollapsibleSections.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Stabilise the dependency: JSON.stringify only changes when the actual
  // titles change, not every render due to a new array reference.
  const titlesKey = sectionTitles.join('||');
  const titlesRef = useRef(sectionTitles);
  titlesRef.current = sectionTitles;

  useEffect(() => {
    setCollapsedSections(prev => {
      const next = { ...prev };
      let changed = false;
      for (const title of titlesRef.current) {
        if (!(title in next)) {
          next[title] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [titlesKey]); // stable string dep — only re-runs when titles actually change

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const isCollapsed = useCallback(
    (title: string) => collapsedSections[title] ?? true,
    [collapsedSections]
  );

  const getSectionProgress = useCallback(
    (items: { complianceStatus: string }[]) => {
      const evaluated = items.filter(i => i.complianceStatus !== 'not-evaluated').length;
      return `${evaluated}/${items.length}`;
    },
    []
  );

  return { isCollapsed, toggleSection, getSectionProgress };
}
