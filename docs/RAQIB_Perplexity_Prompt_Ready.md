# RAQIB — Ready-to-Send Prompt
### Copy everything below the line into your Perplexity task. It's self-contained — no other document needs to be open.

---

You're working on `belabedmohamedins-tech/SafeInspect-APP`. Three small, independent
fixes below. Do them in order. Each is separable — if you can only do one right now, do
Task 1, since it's the only one that prevents a wrong number from shipping rather than
correcting one already there.

**Standing rule for this and every future citation task:** a citation is not "verified"
until you've fetched the actual article or table it refers to and the specific number/
subject in your fetched text matches the specific claim you're making. A source existing,
or a URL being reachable, is not verification — the specific number has to match. If you
can't verify the specific claim, say so explicitly and use a vaguer, honest citation
(e.g. "international reference, Algerian source unconfirmed") rather than a specific one
you haven't actually checked. This rule exists because four separate citations in this
codebase already failed exactly this way — confident, specific, source-adjacent, and
wrong on the actual number/subject when checked.

---

## Task 1 (urgent) — use the correct Décret 06-138 numbers, not the ones currently on record

Your own project notes currently record Décret 06-138 Annex I's general emissions limits
as: total dust 30 mg/Nm³ (50 old installations), VOC 20 mg/Nm³ (100 old installations).
**These are wrong.** I fetched the actual decree text from two independent official
copies (`me.gov.dz` and `and.dz`) and the real Annex I general limits are:

- **Total dust (Poussières totales): 50 mg/Nm³ general limit, 100 mg/Nm³ for
  pre-existing installations.**
- **VOC (Composés organiques volatils): 150 mg/Nm³ general limit, 200 mg/Nm³ for
  pre-existing installations.**

The 30 mg/Nm³ dust figure is a real number from the real decree — just from Annex II's
cement/plaster/lime-manufacturing table, not Annex I's general limit. None of the target
facility types (paint shop, marble, carpentry, printing, blacksmith) are cement/lime
facilities, so Annex I's general limit is what applies. The 20 mg/Nm³ VOC figure doesn't
match anything findable in the decree at all.

If `PNT-07-01`, `MRB-07-01`, `CRP-07-01`, `PRT-07-01`, or `BLS-07-01` (or equivalent new
IDs) don't exist in the codebase yet, use the correct numbers (50/150, or 100/200 if you
wire in the pre-existing-installation tolerance) when creating them. If any of them
already exist with the wrong numbers, correct them. Template shape (adapt id/axis per
file):

```typescript
{
  id: 'PNT-07-01',
  axis: 'التهوية ومنع التلوث الهوائي',
  category: 'بيئية',
  criteria: 'عدم تجاوز تركيز الغبار الكلي في الانبعاثات الهوائية للحد الأقصى المحدد قانوناً.',
  legalReference: 'المرسوم التنفيذي 06-138 (الملحق 1 — القيم القصوى العامة لتركيز الملوثات في الانبعاثات الجوية للمنشآت الصناعية).',
  severity: 'medium',
  controlType: 'measurement',
  complianceStatus: 'not-evaluated',
  numericField: {
    unit: 'mg/Nm³',
    labelAr: 'تركيز الغبار الكلي المقاس',
    max: 50,
    warningMax: 45,
    step: 1,
    upperLimit: true,
  },
},
{
  id: 'PNT-07-02',
  axis: 'التهوية ومنع التلوث الهوائي',
  category: 'بيئية',
  criteria: 'عدم تجاوز تركيز المركبات العضوية المتطايرة (VOC) في الانبعاثات الهوائية للحد الأقصى المحدد قانوناً.',
  legalReference: 'المرسوم التنفيذي 06-138 (الملحق 1 — القيم القصوى العامة لتركيز المركبات العضوية المتطايرة في الانبعاثات الجوية للمنشآت الصناعية).',
  severity: 'medium',
  controlType: 'measurement',
  complianceStatus: 'not-evaluated',
  numericField: {
    unit: 'mg/Nm³',
    labelAr: 'تركيز المركبات العضوية المتطايرة المقاس',
    max: 150,
    warningMax: 135,
    step: 1,
    upperLimit: true,
  },
},
```

Before finalizing: do your own independent fetch of Décret 06-138's Annex I text and
confirm these two numbers yourself rather than trusting this prompt alone — a third
independent check is cheap insurance given how consequential a wrong emissions threshold
is for a real inspection app.

---

## Task 2 — fix the one remaining Décret 93-120 noise mis-citation

`uabCriteria.ts`'s `UAB-AX7-07` still cites Décret 93-120 for an 85 dB occupational noise
limit. Décret 93-120's confirmed subject is organization of occupational medicine — it
does not set a noise limit. The identical problem in `blacksmithCriteria.ts`'s
`BLS-04-06` was already fixed correctly (reframed as an unconfirmed international
reference, not asserted as Algerian law). Fetch `BLS-04-06`'s current exact wording and
apply the same pattern to `UAB-AX7-07`, adjusting only the file-specific parts (e.g. the
secondary citation, currently Loi 18-11 there vs. whatever `BLS-04-06` pairs it with).

---

## Task 3 — fix the Décret 22-167 mis-citation

`uabCriteria.ts`'s `UAB-AX6-01` cites Décret 22-167 for industrial equipment
maintenance. I fetched Décret 22-167's actual Journal Officiel text from three sources
(`faolex.fao.org`, `me.gov.dz`, `cnas.dz`) — its sole stated purpose (Article 1) is
amending Décret 06-198's terminology and establishment categories, plus setting
environmental-audit terms of reference. Nothing about equipment maintenance.

Fetch `UAB-AX6-01`'s exact current text, then replace the legal reference with Décret
06-198 art. 13 (the base classified-establishment decree, which does cover technical-
file/equipment-maintenance compliance) — this is the citation the pre-2026 version of
this same criterion used, before it was apparently swapped out for the wrong one.
**Independently confirm art. 13's actual content before finalizing** — I've confirmed
22-167 is wrong, but haven't independently re-verified that art. 13 is the fully correct
replacement, only that it's more plausible than what's there now.

---

## When done

Run `npx tsc --noEmit` and confirm no new errors were introduced by any of these three
changes. Report back which of the three you completed and what, if anything, you
couldn't independently verify (per the standing rule above) rather than marking anything
"done" that you weren't able to actually check.
