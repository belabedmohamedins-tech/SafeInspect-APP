// src/hooks/useCollapsibleSections.ts
import { useCallback, useEffect, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Add new sections as collapsed, preserve existing state
  useEffect(() => {
    setCollapsedSections(prev => {
      const next = { ...prev };
      let changed = false;
      for (const title of sectionTitles) {
        if (!(title in next)) {
          next[title] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [sectionTitles]);

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