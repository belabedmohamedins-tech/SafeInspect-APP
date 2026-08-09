# SafeInspect — Legal Instrument Coverage Audit

> Generated: 2026-08-09 18:30 WAT by Perplexity  
> Method: Direct read of `legal_refs/` directory listing + `baseGeneralCriteria.ts` full read + cross-reference with STRATEGIC_PLAN.md Legal Quick-Reference  
> Phase: W37  

---

## Summary

| Category | Count |
|---|---|
| Instruments in `legal_refs/` (files present) | 18 |
| Instruments cited in criteria with NO file | 13 |
| Instruments with file but content is STUB only | 3 |
| Instruments with file and verbatim text confirmed | 15 |

---

## ✅ Instruments with File Present (legal_refs/)

| File | Status | Cited in |
|---|---|---|
| `loi-01-19-gestion-dechets.md` | ✅ Verbatim | BGN-04-01/02/04/05/06/07/08, BGN-03-02/03 |
| `loi-03-10-protection-environnement.md` | ✅ Verbatim | BGN-01-01/02/03, BGN-02-01/02/03, BGN-07-05, BGN-09-01, BGN-10-01 |
| `loi-04-20-risques-majeurs.md` | ✅ Verbatim | fire-safety supporting references |
| `loi-05-12-ressources-en-eau.md` | ✅ Verbatim | BGN-02-03, BGN-03-06 |
| `loi-09-03-protection-consommateur.md` | ✅ Verbatim (W34-FIX) | BGN-01-02, BFD-08-01, baseFoodCriteria |
| `loi-19-02-incendie-panique.md` | ✅ Verbatim | BGN-08-01/02/05 |
| `loi-90-11-relations-travail.md` | ✅ Verbatim | BGN-02-07, BGN-08-03 |
| `loi-90-29-urbanisme.md` | ✅ Verbatim | BGN-02-01/04, UPD-AX2-01 |
| `decret-06-198-etablissements-classes.md` | ✅ Verbatim | BGN-01-01, BGN-08-06, BGN-10-01 |
| `decret-07-144-nomenclature-installations-classees.md` | ⚠️ PARTIEL (rubriques 1243–2922 [MANQUANT]) | BGN-10-01 |
| `decret-09-19.md` | ✅ Verbatim | BGN-04-06 |
| `decret-17-140-hygiene-alimentaire.md` | ✅ Verbatim | baseFoodCriteria, semiPharmaCriteria, bakeryCriteria |
| `decret-91-05-hygiene-securite-milieu-travail.md` | ✅ Verbatim | BGN-02-05/06/07, BGN-03-04/05, BGN-04-03, BGN-07-04, BGN-09-01 |
| `decret-93-120-medecine-du-travail.md` | ✅ Verbatim | occupational health criteria |
| `aim-gpl2-regles-techniques-securite.md` | ✅ Verbatim | gplCriteria |
| `arrete-interministeriel-2025-liaison-froide.md` | ✅ Verbatim | coldRoomCriteria, baseFoodCriteria |
| `arrete-interministeriel-1999-temperatures-conservation.md` | ⚠️ STUB | coldRoomCriteria — converting (W19) |
| `arrete-interministeriel-2016-criteres-microbiologiques.md` | ⚠️ STUB | baseFoodCriteria — converting (W19) |
| `decret-06-141-rejets-industriels-liquides.md` | ⚠️ STUB (W36 OPEN) | BGN-03-02/03, ABT-AX6-xx, UAB-AX6-xx, carWash, mechanic, marble |

---

## ❌ Instruments Cited in Criteria with NO File in legal_refs/

These are ranked by urgency (number of criteria citing them + severity of those criteria).

### P1 — Critical Gap (multiple criteria, high severity)

| Instrument | Articles cited | Criteria affected | Notes |
|---|---|---|---|
| **Décret exécutif 06-138** | Annex I + II | UAB-AX7-xx (all air emission criteria), PNT/MRB/CRP/PRT/BSM-07-xx | Claimed ✅ in Quick-Ref (Phase T) but NO FILE in legal_refs/. Highest priority after 06-141. |
| **Décret exécutif 07-145** | Art. EIA procedures | BGN-10-01 | Required for EIE validity checks. No file. |
| **Décret exécutif 05-315** | Art. bordereau | BGN-04-06, BGN-04-08 | Hazardous waste transport document mandate. No file. |
| **Décret exécutif 09-335** | Art. 4–6 (PII) | fire safety criteria across all activity types | Internal intervention plan (Plan d’Intervention Interne). Quick-Ref says ✅ Verified but NO FILE. |

### P2 — High Gap (1–2 criteria, high severity)

| Instrument | Articles cited | Criteria affected | Notes |
|---|---|---|---|
| **Décret exécutif 21-430** | Art. 4, 7, 8 | gplCriteria (GPL accreditation checks) | LPG installer accreditation. Quick-Ref says ✅ but NO FILE. |
| **Décret exécutif 11-125** | drinking water standards | BGN-03-01 | Water potability for all activities. Phase W8 confirmed correct citation but NO FILE in legal_refs/. |
| **Décret exécutif 07-205** | Art. (licensed incinerators) | BGN-04-07 | Hazardous waste incineration. No file. |
| **Décret exécutif 01-102** | ONA powers | BGN-03-06 | ONA septic pumping mandate. No file. |
| **Loi 18-11** | Art. 104, 105, 107 | semiPharmaCriteria | Health/pharmaceutical law. semiPharma confirmed W12 but NO FILE. |

### P3 — Medium Gap (1 criterion, medium severity)

| Instrument | Articles cited | Criteria affected | Notes |
|---|---|---|---|
| **Décret exécutif 02-427** | OHS training obligations | BGN-09-02 | Worker hazard training documentation. No file. |
| **Décret exécutif 76-35** | electrical safety | BGN-08-03 | Electrical installation worker protection. Very old decree. May be superseded — verify before converting. |
| **Décret exécutif 03-478** | Art. 3 (healthcare waste) | Quick-ref row only | Cited in Quick-Ref as ✅ but no criteria file confirmed + no legal_refs/ file. Low risk if no active criteria cite it. |
| **Loi 88-07** | Art. 12–14 | Quick-ref row only | Occupational health framework. Cited in Quick-Ref. loi-90-11 may be sufficient substitute. |

---

## Recommended Phase Plan for Other Conversation (W19)

Order of conversion from PDF:

1. `decret-06-141` — STUB exists (W36). Convert verbatim, Annexes I+II critical.
2. `decret-06-138` — Create file. Air emissions Annex I+II.
3. `decret-09-335` — Create file. PII Arts.4–6.
4. `decret-05-315` — Create file. Bordereau articles.
5. `decret-07-145` — Create file. EIA procedure articles.
6. `decret-11-125` — Create file. Drinking water standards table.
7. `decret-21-430` — Create file. GPL accreditation Arts.4/7/8.
8. `loi-18-11` (Arts.104/105/107 only) — Create file, extract only cited articles.
9. `decret-07-205`, `decret-01-102`, `decret-02-427`, `decret-76-35` — Low priority, batch last.

---

## Actions for This Session (Perplexity)

- [x] W36: `decret-06-141` stub created in `legal_refs/`
- [x] W37: This audit report pushed to `docs/`
- [ ] Update STRATEGIC_PLAN.md with W36+W37 open phases and next identifier W38

---

*This report should be regenerated after each batch of legal_refs/ conversions.*
