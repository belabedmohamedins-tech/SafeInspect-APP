# Audit Patches — couvoirCriteria.ts (export: couvoirSpecificCriteria)

**This file needs a SYSTEMATIC RE-CITATION PASS, not simple per-criterion
patches.** Roughly half its 23 criteria cite "معايير الرقابة" / "المعايير
الأساسية" — an apparently internal, informal standards document, not actual
law — either alone or blended with a real citation. See cross-cutting
Finding 8 for full context.

---

### Criteria citing NO real law at all — highest priority
| Criterion | Current basis |
|---|---|
| COU-AX3-02 | "المعايير الأساسية" only |
| COU-AX3-03 | "المعايير الأساسية" only |
| COU-AX4-01 | "كما أُشير إليه في المعايير الأساسية" — literally just a reference to the internal doc |
| COU-AX4-02 | bare HACCP/GHP principles, no legal citation |
| COU-AX5-02 | "كما وردت في معايير الرقابة" only |

**Action:** For each, determine the actual underlying requirement and cite
the real law. Given this is a hatchery (poultry breeding, food-safety
adjacent), the most likely real sources are:
- Décret 17-140 (hygiene/HACCP obligations) — already correctly used
  elsewhere in this same file (see COU-AX9-01)
- Décret 91-05 (general workplace safety, if the criterion concerns worker
  conditions rather than food safety)

---

### Criteria blending a real citation with the vague internal reference
| Criterion | Real citation present | Vague addition to remove |
|---|---|---|
| COU-AX2-01 | Décret 17-140 Art.15 | "+ معايير الرقابة" |
| COU-AX2-04 | — | "المعايير العامة... في معايير الرقابة" |
| COU-AX3-01 | — | "المعايير الأساسية" |
| COU-AX5-01 | Décret 17-140 | "+ المعايير الأساسية" |
| COU-AX6-01 | Décret 17-140 | "المحور الثالث من معايير الرقابة" |
| COU-AX6-02 | Loi 03-10, no article number | "+ معايير الرقابة الخاصة بالمياه" |
| COU-AX7-01 | Décret 17-140 | "+ المعايير الأساسية" |
| COU-AX7-02 | Décret 17-140 | "+ المعايير الأساسية" |

**Action:** Remove the internal-document reference from each; keep and
strengthen the real legal citation (add article numbers where missing,
e.g. COU-AX6-02).

---

### COU-AX7-03 — citing an inspection report as legal authority
**Current:** القانون 18-11 المتعلق بالصحة، "كما فُسِّر في تقرير التفتيش البيئي"
**Problem:** A prior inspection report is not a legal interpretive
authority. This is a category error, not a citation-precision issue.
**Action:** Remove the inspection-report reference entirely; cite Loi 18-11
directly with a specific article number, or mark [À VÉRIFIER] if the
specific article can't be identified.

---

### COU-AX10-01 — EIE citation, apply cross-cutting Finding 1
**Current:** القانون 03-10 المواد 15–18
**New:** Apply canonical citation from Finding 1.

---

### Already correctly handled, no action needed
COU-AX9-01 (HACCP, Décret 17-140 Art.5) is a good, correctly-cited model —
use its citation style as the template when fixing the criteria above.
