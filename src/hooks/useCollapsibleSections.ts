// src/hooks/useCollapsibleSections.ts
// W3: memoize getSectionProgress result per section via useMemo so that
// evaluating one criterion does not cause every section header to re-render.
// W4: sections now start COLLAPSED (true) so the initial chevron-down is
//     correct AND one tap opens the section. Previously initialised as false
//     (open) while react-native-collapsible defaults to true (closed), which
//     caused a state/UI mismatch requiring two taps to open a section.
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCollapsibleSections(sectionTitles: string[]) {
  // All sections start COLLAPSED (collapsed = true).
  // One tap → false → section opens. Arrow: chevron-down (closed) → chevron-up (open).
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
    (title: string) => collapsed[title] ?? true, // unknown title → collapsed
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
