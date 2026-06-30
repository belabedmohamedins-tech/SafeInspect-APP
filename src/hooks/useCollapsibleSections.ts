// src/hooks/useCollapsibleSections.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  // All sections start COLLAPSED (true) so the SectionList only renders
  // section headers on mount — items are rendered on demand when the user
  // taps a header. This prevents mounting 30-60+ InspectionItem components
  // simultaneously, which was causing the visible jank on checklist open.
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
          next[title] = true; // new sections also start collapsed
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
    (title: string) => collapsed[title] ?? true,
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
