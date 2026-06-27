// src/hooks/useCollapsibleSections.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  // collapsed map: false = expanded (visible), true = collapsed (hidden)
  // Tests expect initial value to be false (expanded) for all sections.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sectionTitles.map(t => [t, false]))
  );

  // Stable string dep — only changes when titles actually change
  const titlesKey = sectionTitles.join('||');
  const titlesRef = useRef(sectionTitles);
  titlesRef.current = sectionTitles;

  useEffect(() => {
    setCollapsed(prev => {
      const next = { ...prev };
      let changed = false;
      for (const title of titlesRef.current) {
        if (!(title in next)) {
          next[title] = false;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [titlesKey]);

  const toggleSection = useCallback((title: string) => {
    setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));
  }, []);

  // isCollapsed() kept for backward compatibility with existing screen components
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
