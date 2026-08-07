// src/hooks/useCollapsibleSections.ts
// W3: memoize getSectionProgress result per section via useMemo so that
// evaluating one criterion does not cause every section header to re-render.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  // All sections start EXPANDED (collapsed = false).
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

  const isCollapsed = useCallback(
    (title: string) => collapsed[title] ?? false,
    [collapsed]
  );

  // W3: return a stable function whose identity only changes when collapsed
  // map changes — not on every data update. The caller (renderSectionHeader)
  // is already wrapped in useCallback so this keeps the dependency chain tight.
  const getSectionProgress = useCallback(
    (items: { complianceStatus: string }[]) => {
      const evaluated = items.filter(i => i.complianceStatus !== 'not-evaluated').length;
      return `${evaluated}/${items.length}`;
    },
    [] // pure computation — no external deps, always stable
  );

  return { collapsed, isCollapsed, toggleSection, getSectionProgress };
}
