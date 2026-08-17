# PDF–Markdown Legal Text Verification Report

**Author:** Manus AI
**Verification date:** 17 August 2026
**GitHub source revision:** [`1cd6cb9db4c0dbf81e0329bd3116f9704f936df1`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/tree/1cd6cb9db4c0dbf81e0329bd3116f9704f936df1/legal_refs)

## Executive conclusion

I **cannot confirm that the Markdown files are 100% identical to the attached PDFs**. The independent comparison found **zero character-identical PDF–Markdown pairs after layout, PDF header/footer, whitespace, and Markdown-format normalization**. This does not mean that every Markdown file is wrong: in many cases the PDF contains complete Journal Officiel pages or several instruments while the Markdown intentionally contains only one target instrument. It does mean that the current evidence is insufficient to certify exact equivalence for legal use.

The comparison produced strong evidence that the target text is substantially present for **15 of 37 mapped PDF–Markdown pairs**, but those should be described as **high-coverage matches requiring human/legal sign-off**, not as proven verbatim copies. Seven additional pairs were partial or ambiguous, and the remaining pairs require correction, a better source match, or manual inspection of scanned pages.

> **Important legal limitation:** This is a document-transcription and text-equivalence audit, not legal advice and not a certification of authenticity, legal validity, current force, amendments, or repeal status.

## Scope and inventory

I cloned the supplied repository and used the `legal_refs` directory at the revision shown above [1] [2]. The attached material contained **43 PDFs**. The repository contained **42 Markdown files**, including repository-control files, split copies, and a project draft. I established **37 direct PDF–Markdown comparisons**.

| Inventory item | Count | Result |
|---|---:|---|
| Attached PDFs | 43 | 37 had a direct Markdown candidate; 6 had no direct candidate. |
| Markdown files in `legal_refs` | 42 | 37 were paired; 7 had no attached PDF counterpart. |
| Native-text PDF comparisons | 31 | Suitable for automated text comparison, subject to layout and scope issues. |
| OCR PDF comparisons | 6 | Not certifiable automatically because OCR can introduce character, number, table, and punctuation errors. |
| Character-identical normalized pairs | 0 | No pair passed the strict normalized equality test. |
| High-coverage target-text matches | 15 | At least 95% of Markdown word tokens were found in the corresponding PDF extraction. |

## Strong-coverage matches

The following pairs had at least **95% of Markdown word tokens located in the corresponding PDF extraction**. This is a useful indication that the Markdown largely reflects the supplied PDF, but it is not proof that every character, number, table, annex, heading, or punctuation mark is identical.

| PDF | Markdown | Coverage finding |
|---|---|---:|
| `21-430.pdf` | `decret-21-430-gpl-carburant.md` | 99.87% |
| `Décret02-427.pdf` | `decret-02-427-prevention-risques-professionnels.md` | 98.37% |
| `Décret04-82.pdf` | `decret-04-82-agrement-sanitaire-animaux.md` | 99.63% |
| `Décret06-138.pdf` | `decret-06-138-emissions-atmospheriques.md` | 97.76% |
| `LOI04-08.pdf` | `loi-04-08-activites-commerciales.md` | 99.89% |
| `LOI90-11.pdf` | `loi-90-11-relations-travail.md` | 99.81% |
| `Loi-03-10.pdf` | `loi-03-10-protection-environnement.md` | 95.66% |
| `Loi01-19.pdf` | `loi-01-19-gestion-dechets.md` | 96.11% |
| `Loi04-20.pdf` | `loi-04-20-risques-majeurs.md` | 95.48% |
| `arrete-interministeriel-2011-02-06-permis-construire-energie.pdf` | `arrete-interministeriel-2011-02-06-permis-construire-energie.md` | 99.60% |
| `decret09-19.pdf` | `decret-09-19.md` | 95.08% |
| `loi05-12.pdf` | `loi-05-12-ressources-en-eau.md` | 99.42% |
| `loi09-03.pdf` | `loi-09-03-protection-consommateur.md` | 99.39% |
| `loi18-11.pdf` | `loi-18-11-sante.md` | 98.41% |
| `loi19-02.pdf` | `loi-19-02-incendie-panique.md` | 97.61% |

Several strong-coverage pairs still contain detected differences or extraction ambiguities. For example, the audit found unmatched or substituted sequences in the Markdown for `loi-90-11`, `Loi-03-10`, `Loi01-19`, `Loi04-20`, `decret-09-19`, and `loi18-11`. Some may be source-layout or extraction differences, but they require page-level review before calling the transcription verbatim.

## Partial or ambiguous pairs

These pairs showed substantial overlap but did not meet the 95% coverage threshold, or the source PDF contains a broader or different instrument set. They should not be marked fully verified from this automated comparison alone.

| PDF | Markdown | Coverage | Main issue |
|---|---|---:|---|
| `22-167.pdf` | `decret-22-167-etablissements-classes-modification.md` | 93.20% | Full-JO preamble and surrounding text affect matching; manual article-level review required. |
| `Decret06-198.pdf` | `decret-06-198-etablissements-classes.md` | 87.97% | PDF and Markdown article counts differ; the Markdown describes the original decree while the PDF extraction includes additional structure. |
| `decret-25-63-plans-intervention-catastrophes.pdf` | `decret-25-63-plans-intervention-catastrophes.md` | 78.09% | Coverage is incomplete or extraction is materially different. |
| `decret11-125.pdf` | `decret-11-125-eau-consommation-humaine.md` | 77.97% | Annex and/or page extraction requires manual review. |
| `dec21-261.pdf` | `decret-21-261-esp-equipements-hydrocarbures.md` | 93.22% | Several unmatched sequences occur in the equipment and inspection provisions. |
| `decret21-319.pdf` | `decret-21-319-autorisation-exploitation-hydrocarbures.md` | 93.17% | Annex/table content and long definitions need page-level checking. |
| `decret24-196.pdf` | `decret-24-196-etablissements-classes-modification.md` | 84.15% | The Markdown and PDF article coverage are not aligned. |

## Pairs requiring correction, better source matching, or manual OCR review

The following comparisons cannot support a 100% identity claim.

| PDF | Markdown | Finding |
|---|---|---|
| `06-138JO.pdf` | `decret-06-138-emissions-atmospheriques.md` | Alternate/full-JO source; the target decree is mixed with surrounding Journal Officiel content. Compare against `Décret06-138.pdf` instead. |
| `Arrêtéinterministérieldu21novembre1999.pdf` | `arrete-interministeriel-1999-11-21-conservation-aliments.md` | PDF is image-only to native extraction; OCR was not completed for this non-primary candidate. |
| 2016 microbiological-criteria PDF | `arrete-interministeriel-2016-10-04-criteres-microbiologiques.md` | Only partial word coverage was found; annex/table OCR and layout need visual review. |
| 2025 restaurant-hygiene PDF | `arrete-interministeriel-2025-05-07-hygiene-restauration.md` | Article sequence aligns, but word coverage is only 61.23%; not certifiable automatically. |
| `Decret17-140.pdf` | `decret-17-140-hygiene-alimentaire.md` | Native extraction is not comparable; the PDF appears to contain a different text encoding/layout than the Markdown. |
| `Décret76-35.pdf` | `decret-76-35-igh-incendie.md` | OCR comparison is unreliable and coverage is only 37.38%. |
| `Décret83-496.pdf` | `decret-83-496-gpl-carburant.md` | OCR comparison failed to recover the article structure reliably. |
| `Décret90-245...pdf` | `decret-90-245-appareils-pression-gaz.md` | OCR comparison is unreliable and coverage is only 34.56%. |
| `Loi09-03_frarticle.pdf` | `loi-09-03-protection-consommateur.md` | This PDF is a much larger/alternate source; use `loi09-03.pdf` for the direct comparison. |
| `decret06-141.pdf` | `decret-06-141-rejets-effluents-liquides.md` | PDF extraction includes substantially more content than the Markdown candidate. |
| `decret91-05.pdf` | `decret-91-05-hygiene-securite-milieu-travail.md` | OCR comparison is unreliable; coverage is 50.88%. |
| `decret93-120.pdf` | `decret-93-120-medecine-du-travail.md` | OCR comparison is unreliable; coverage is 49.15%. |
| `loi90-29.pdf` | `loi-90-29-urbanisme.md` | OCR comparison is unreliable; coverage is 42.66%. |

## PDFs without a direct Markdown counterpart

The following attached PDFs were not directly matched to a Markdown file in `legal_refs`:

| PDF | Observation |
|---|---|
| `20sep831.pdf` | No direct Markdown counterpart found. |
| `20sep832.pdf` | No direct Markdown counterpart found. |
| `Arrêtéintermin.du31août1983(équipementvéhiculesGPLC).pdf` | No direct Markdown counterpart found. |
| `Arrêtéinterministérieldu20septembre1983(stationsdistributionGPL).pdf` | No direct Markdown counterpart found. |
| `loi18-09fr.pdf` | No separate Markdown file; the repository appears to integrate the amendment into the consumer-protection text. |
| `manuel-installation-gpl-web(1).pdf` | No direct Markdown counterpart found. |

The repository also contains Markdown files without an attached PDF counterpart: `loi-18-11-sante-partie1-arts1-164.md`, `loi-18-11-sante-partie2-arts165-264.md`, `loi-18-11-sante-partie3-arts265-450.md`, `loi-88-07-hygiene-securite-medecine-travail.md`, and `projet-arrete-gpl-installations-securite.md`, in addition to `README.md` and `CLEANUP_LOG.md`.

## Method used

For native-text PDFs, I extracted text with Poppler in both layout-preserving and raw modes. For six image-only scans, I used local French OCR as a secondary extraction, while treating OCR results as inherently non-certifying. Markdown metadata, warnings, repository notes, layout headers, page numbers, repeated Journal Officiel banners, whitespace, and common Markdown emphasis were removed for comparison. The audit then calculated article-heading sequences, normalized equality, word similarity, and matching-block coverage. The raw extracted files and discrepancy outputs are included with this report.

The strongest measure reported here is **Markdown word-token coverage in the PDF extraction**. It answers: “How much of the Markdown text can be located in the PDF-derived text?” It does not prove that the PDF has no extra text, that tables and annexes were preserved correctly, or that OCR did not change a legally significant character.

## Recommended decision

Do not label the full corpus “100% identical” or “verbatim certified” based on this audit. A defensible status scheme would be:

| Status | Meaning |
|---|---|
| **High textual coverage — human sign-off required** | The Markdown is substantially located in the PDF extraction, but exact legal equivalence is not certified. |
| **Partial / needs review** | Coverage or article alignment is incomplete; compare the relevant pages manually. |
| **OCR / unavailable** | The PDF is scanned or lacks a direct Markdown counterpart; automated text verification is insufficient. |

For legal deployment, the remaining review should be performed against the exact PDF page images, with special attention to **article numbers, decimal values, units, negations, dates, annexes, tables, footnotes, and amendment language**. The repository README itself states that verification requires a named human reviewer who read the full text against the official Journal Officiel source [3].

## References

[1]: https://github.com/belabedmohamedins-tech/SafeInspect-APP/tree/1cd6cb9db4c0dbf81e0329bd3116f9704f936df1/legal_refs — SafeInspect `legal_refs` directory at the audited revision.
[2]: https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/1cd6cb9db4c0dbf81e0329bd3116f9704f936df1 — Audited Git commit.
[3]: https://github.com/belabedmohamedins-tech/SafeInspect-APP/blob/1cd6cb9db4c0dbf81e0329bd3116f9704f936df1/legal_refs/README.md — Repository verification rules and legal-reference index.
