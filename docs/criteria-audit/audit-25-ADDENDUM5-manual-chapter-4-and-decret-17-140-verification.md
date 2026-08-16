# Audit Addendum 5 — Chapter 4 (Food Safety) + Direct Verification of Décret 17-140

This addendum includes a direct correction to a claim made in
`docs/Inspection_Manual_Chapter4_Food_Safety.md` — verified against the
actual primary text of `legal_refs/decret-17-140-hygiene-alimentaire.md`
(all 64 articles read in full).

---

## 1. HACCP article: Art. 5 is correct, NOT Art. 9

`docs/Inspection_Manual_Chapter4_Food_Safety.md` claims (citing an academic
secondary source) that the HACCP obligation is at Art. 9. **This is
incorrect.** Direct primary-text verification confirms:

> **Art. 5** (verbatim): *"À l'exception de l'étape de la production
> primaire, tous les établissements... doivent appliquer les procédures
> pour s'assurer de la salubrité et de la sécurité des denrées alimentaires
> basées sur les principes du système d'analyse des dangers et points de
> contrôle critiques (HACCP)."*

Art. 9 actually covers equipment/material standards for primary-production
handling — unrelated to HACCP.

**Action: NONE needed on already-delivered patches.** The main audit's
citations (e.g. COU-AX9-01: "Décret 17-140 Art.5, HACCP") were already
correct. Do not apply the manual chapter's proposed Art.9 correction
anywhere — it would introduce an error where none existed.

---

## 2. New resolved item: worker medical-exam interval is confirmed [LOI]

Both `Inspection_Manual_Chapter4_Food_Safety.md` and
`Inspection_Manual_Chapter5_Occupational_Health.md` left the "6-month"
medical exam interval as unconfirmed (`[PRATIQUE]`, not `[LOI]`). Direct
primary-text verification resolves this:

> **Art. 55** (verbatim, in the personnel-training chapter): *"...que les
> personnels chargés de manipuler les denrées alimentaires se soumettent
> à des examens médicaux périodiques et à des examens complémentaires
> **tous les six (6) mois au moins**..."*

**Action:** upgrade the 6-month interval to `[LOI]`, citing Décret 17-140
Art. 55 directly, in any criterion currently using this figure at
`[PRATIQUE]` status (relevant across baseFoodCriteria.ts and multiple
food-related facility files).

---

## 3. BFD-05-01 — fabricated joint ministerial order citation

**Current:** cites an undated "2020 joint ministerial HACCP order."
**Problem:** No such order exists. The real, dated joint orders are 4
October 2016 (microbiological criteria) and 7 May 2025 (hygiene
conditions) — both already correctly identified elsewhere in this audit.
**New:** Cite Décret 17-140 Art.5 directly as the primary HACCP legal
basis (decree-level, stronger than a ministerial order), with the 2016/2025
orders added only where a specific technical detail from either is being
referenced.

---

## 4. Temperature figures — reinforces main audit's existing fix, no change

Art. 48 of Décret 17-140 explicitly delegates all specific temperature/
preservation-duration figures to a separate joint ministerial order,
confirming (not changing) the main audit's existing finding that
BFD-04-01/04-02 needed re-sourcing to the actual 2025/1999 arrêtés rather
than Décret 17-140 itself.

---

## 5. Worth checking — HACCP's primary-production exclusion vs. UPD

Décret 17-140 Art. 2 and Art. 5 both explicitly exclude "production
primaire" from the HACCP obligation. UPD (poultry/livestock housing) is
plausibly primary production. If any UPD criterion currently requires a
HACCP plan, verify whether UPD's specific activities fall on the
"primary production" or "establishment" side of this boundary before
treating a HACCP requirement there as settled.
