# Safe Use Policy for Markdown Legal References in AI Agents

## 1. Core trust boundary

Treat every Markdown file as a **derived working transcription**, not as the authoritative legal source. The official PDF or Journal Officiel publication remains the authority. Markdown is used to make the authority searchable and usable by AI systems; it must never silently replace the source PDF when an answer depends on exact wording, numbers, dates, conditions, exceptions, tables, or annexes.

The agent should follow this rule:

> Retrieve from Markdown first; verify against the source PDF before making a high-consequence or legally definitive statement.

## 2. Add provenance to every legal file

Each Markdown file should begin with machine-readable metadata containing the source identity and quality status. At minimum, record the instrument title and number, source PDF filename, source URL or Journal Officiel reference, publication date, PDF SHA-256 hash, page range, article range, conversion method, conversion date, reviewer, review date, and known limitations.

A recommended front matter block is:

```yaml
---
instrument_id: decree-21-430
language: fr
source_pdf: "21-430.pdf"
source_url: "https://example.org/source.pdf"
source_publication: "JORADP, JO n° 85/2021"
pdf_sha256: "<sha256>"
pdf_pages: "1-28"
article_range: "1-3; modifies decree 83-496 articles 4, 7, 8"
conversion_method: "native-text-extraction"
conversion_date: "2026-08-17"
verification_status: "high-coverage-human-review-required"
verified_by: null
verified_date: null
known_limitations: []
---
```

Do not use a label such as `VERIFIED` unless a named human has compared the complete Markdown text with the complete source PDF, including annexes and tables. Automated similarity should produce a separate status such as `AUTOMATED-CHECK-PASSED`, not human verification.

## 3. Preserve source-to-text traceability

Every article, annex, table, and important heading should carry a source-page reference. For example:

```markdown
<!-- source: 21-430.pdf, page 19, Article 2 -->
**Art. 2.** — ...
```

A better production format is a structured article record containing `instrument_id`, `article`, `text`, `source_pdf`, `source_pages`, and `verification_status`. This allows an agent to cite the exact article and page instead of citing only a whole Markdown file.

Do not remove tables by converting them into ambiguous prose. Preserve table headers, row labels, units, decimal separators, footnotes, and annex identifiers. If a table cannot be converted reliably, mark it as `TABLE-REQUIRES-PDF-VERIFICATION` and force the agent to consult the PDF for that passage.

## 4. Use a controlled validation pipeline

Every source update should trigger automated checks before the Markdown is indexed. The checks should verify that the file has the required metadata, the title and instrument number agree with the PDF, article numbers are present and ordered, annexes referenced in the PDF are represented, and the file contains no placeholder, truncation, OCR-warning, or unexplained gap.

The pipeline should also calculate normalized PDF–Markdown coverage, record the extraction method, generate a discrepancy report, and reject publication to the production index when coverage falls below the configured threshold. A practical initial policy is:

| Status | Production behavior |
|---|---|
| `human-verified` | Allow normal retrieval, while retaining source-page citations. |
| `automated-high-coverage` | Allow retrieval for research and draft answers; require source verification for high-risk claims. |
| `partial` | Allow discovery only; do not use as the sole evidence for an answer. |
| `ocr-review-required` | Do not use for exact quotations, measurements, tables, or legal conclusions. |
| `unmatched-source` | Keep outside the production index until a matching Markdown file exists. |
| `obsolete-or-repealed` | Retain for historical search but clearly display its legal status. |

The current audit showed that the corpus contains several strong-coverage pairs as well as OCR-limited, partial, and unmatched documents. Therefore, a single corpus-wide `verified` flag would be unsafe.

## 5. Build retrieval safeguards into the AI agent

The retrieval system should index articles and annexes as separate chunks, not arbitrary page-sized fragments. Each chunk should carry the instrument identifier, article or annex number, source PDF, source page, legal status, language, and verification status. Retrieval should prefer human-verified chunks, then high-coverage chunks, and should exclude partial or OCR-only chunks for exact-quotation requests.

The agent should always return a source citation containing the instrument, article or annex, Markdown path, and PDF page. If the evidence comes from a non-verified Markdown file, the answer should say so explicitly. If the agent cannot identify the article and source page, it should not present the answer as a definitive legal quotation.

Use retrieval thresholds and contradiction checks. For a high-consequence question, retrieve multiple relevant chunks, check whether they refer to the same version and date, and look for amendments or repeal notices. If the retrieved texts conflict, the agent should report the conflict and request PDF or human review rather than choosing silently.

## 6. Define high-risk questions that require PDF verification

The agent must escalate to the PDF or a human reviewer when the question involves an exact quotation, a numerical threshold, a measurement, a unit, a decimal value, a deadline, a penalty, an exception, a prohibition, a legal status, an amendment, a repeal, an annex, a technical table, a signature, or a scanned page. These are precisely the areas where a small transcription or OCR error can change the meaning.

A safe response pattern is:

> “The Markdown reference indicates this requirement in Article X. Because this is a numerical/legal condition, verify the wording and page reference against the source PDF before relying on it.”

## 7. Separate legal retrieval from legal conclusions

The agent may retrieve and summarize legislative material, but it should distinguish three layers: what the source text says, what the text appears to mean in context, and what action the user should take. The first layer can be supported by Markdown plus PDF provenance. The second requires careful interpretation. The third may require a qualified legal or compliance professional and current-law verification.

The agent should never invent missing text, silently complete an OCR passage, merge different versions, or treat a repository note as part of the law. Repository metadata, conversion notes, and audit comments are evidence about the transcription process, not legal provisions.

## 8. Change management and audit trail

Pin the production index to a Git commit and record the source PDF hash used for every indexed file. When a PDF or Markdown file changes, invalidate the old index entry and rerun the comparison. Keep previous versions so answers can be tied to the exact source revision available at the time.

Require review for changes to article text, article numbering, dates, numbers, tables, annexes, legal-status fields, and source metadata. A normal code review is useful, but legal-text changes should also produce a human-readable before/after diff and a PDF-page discrepancy report.

## 9. Minimum implementation checklist

Before using the corpus in production, complete these steps:

1. Add provenance front matter and SHA-256 hashes to every legal Markdown file.
2. Assign one of the controlled quality statuses rather than using a single global verified flag.
3. Add source-page and article references to each article and annex.
4. Reconvert or manually review every OCR-only, partial, and unmatched document.
5. Preserve tables and annexes structurally, or explicitly mark them as requiring PDF verification.
6. Index by instrument, article, annex, date, source page, and verification status.
7. Require citations in every agent answer.
8. Add a high-risk trigger for numbers, units, deadlines, penalties, exceptions, amendments, tables, and exact quotations.
9. Block definitive answers when the source is partial, OCR-only, conflicting, or unmatched.
10. Pin every answer to the repository commit and source-PDF hash used for retrieval.

## 10. Recommended final policy

The corpus is safe for AI-assisted legislative search when it is treated as a **versioned, provenance-rich retrieval index**. It is not safe when it is treated as an unquestioned replacement for the official PDFs. The correct operational posture is therefore **“retrieval convenience with source verification,”** supported by explicit quality labels, article-level citations, PDF-page traceability, automated regression checks, and human review for high-consequence claims.
