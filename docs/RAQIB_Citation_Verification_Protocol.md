# RAQIB — Citation Verification Protocol
## A standing instruction to prevent the recurring "confident but wrong" citation pattern

**Purpose of this document:** four separate legal citations in this codebase have now
been found stated with high apparent confidence — specific decree numbers, sometimes
specific article numbers, sometimes a source URL — and turned out, on primary-source
verification, to be wrong. This isn't four unrelated mistakes; it's one recurring failure
mode. This document is a short, insertable set of rules meant to go directly into whatever
system prompt, instruction set, or task template drives citation-correction work (via
Perplexity or otherwise), so the next citation pass catches this before merging rather
than after.

---

## The four confirmed instances, as the evidence base for this protocol

| # | Claim | What was actually true | How it was caught |
|---|---|---|---|
| 1 | Décret 93-120 art. 9 governs the 85 dB occupational noise limit | 93-120's only confirmed subject, per this project's own extensively-researched legal manual, is organization of occupational medicine. No article-level content was ever retrieved. "Art. 9" had no traceable source anywhere. | Checked the live file — it didn't even contain "Art. 9," despite that detail being asserted as verified elsewhere. |
| 2 | Décret 06-141 governs VOC/air-emission limits (printing, paint, blacksmith) | 06-141 is the industrial liquid-discharge decree — its full parameter table (pH, MES, BOD5, COD, heavy metals) is entirely water-related. | Cross-checked against this project's own most-researched chapter on that exact decree. |
| 3 | Décret 06-138 Annex I sets 30 mg/Nm³ dust / 20 mg/Nm³ VOC, "confirmed from official source (me.gov.dz)" | The real Annex I general limits are 50 mg/Nm³ dust / 150 mg/Nm³ VOC. The wrong dust figure was real, but from Annex II's cement/lime-specific table, not Annex I's general limit. The VOC figure matched nothing in the decree at all. | Fetched the actual PDF from **two** independent copies of the same official source the claim itself cited. |
| 4 | Décret 22-167 governs industrial equipment maintenance | 22-167's Article 1 states its sole purpose is amending Décret 06-198's terminology and establishment categories, plus an environmental-audit annex. Nothing about equipment maintenance. | Fetched the Journal Officiel text from three independent sources. |

**The pattern in all four:** a specific, confident-sounding legal detail (an article
number, a numeric threshold, a source URL) was presented as settled without the
underlying primary text actually being checked against the specific claim made — only
against the decree's general existence or general area of law.

---

## The rule, stated plainly

**A legal citation is not "verified" until the specific claim attached to it — the
article number, the numeric value, the subject matter — has been checked against an
actual fetched excerpt of the primary source, not against the decree's title, its general
area of law, or a secondary source's summary.**

Corollaries:

1. **A source URL is not verification.** Citing `me.gov.dz` or any other official domain
   confirms the decree exists and is reachable. It does not confirm the specific number or
   article claimed matches what's actually in that document at that URL. Instance #3 above
   had a source URL attached and was still wrong.
2. **A plausible-sounding article number is not verification.** "Art. 9" sounds more
   authoritative than a bare decree number, but is *more* likely to be fabricated
   precision if no one actually opened the article and read it — a vague citation that's
   honest about its vagueness is safer than a specific one that's invented.
3. **Being right about the general subject is not being right about the specific claim.**
   Décret 06-141 genuinely is an environmental-discharge decree — that's not wrong. It's
   specifically wrong about *which kind* of discharge (liquid, not air). Getting the
   category right and the specific number/subject wrong is exactly this failure mode, not
   a near-miss.
4. **A number matching a real value in the real decree is not verification if it's the
   wrong row.** Instance #3's dust figure (30 mg/Nm³) is a real number from the real
   decree — just from a different, more specific table than applies to the facility type
   in question. Check that the applicable category/tier matches, not just that the number
   exists somewhere in the document.
5. **Reverting a "wrong" citation to something vaguer is often safer than replacing it
   with something equally specific but unverified.** When a specific citation can't be
   confirmed, the correct move (already applied successfully to the 93-120 noise case) is
   to state the figure as an unconfirmed international reference and flag it as an open
   research task — not to swap in a different specific-sounding citation without the same
   verification standard applied to it.

---

## The required workflow, before any citation is marked "✅ CORRECT" or "resolved"

1. **State the specific claim being verified** — not "is Décret X relevant to Y" but
   "does Décret X, article Z, actually say the number is N."
2. **Fetch an actual excerpt of the primary source** — the specific article or the
   specific annex table, not the decree's title page or a secondary summary of it.
3. **Quote or closely paraphrase the actual retrieved text** in whatever documents this
   claim (a citation comment, a roadmap entry, a fix spec) — not just a conclusion
   ("confirmed correct") but the evidence ("art. 9 states X, retrieved from [source]").
   If the specific article/table couldn't be retrieved, say so explicitly rather than
   letting a general "confirmed" stand in for it.
4. **If two independent copies of the source disagree, or extraction quality is
   questionable** (this happened in instance #3 — one PDF copy produced corrupted numeric
   output), **fetch a second independent copy before trusting either.**
5. **If the specific claim cannot be verified within reasonable effort, don't invent
   precision to fill the gap.** Mark the item as a research task with the actual current
   state (`[PRATIQUE]`/`[SILENCE]`/"international reference, not Algerian law") — this
   project's legal manual already has this convention; use it rather than a fabricated
   specific citation.

---

## Suggested insertion point

Recommend adding this as a standing instruction wherever citation-correction tasks are
defined for the Perplexity workflow — e.g. a persistent line in the prompt template such
as: *"Before marking any legal citation as verified or corrected, quote the specific
retrieved text (article content or table row) that supports the specific claim being
made. A source existing is not sufficient — the specific number or subject must be shown
to match."* This is a one-time addition that should prevent recurrence of all four
instance types above, since each failed at the same step (claim not checked against
retrieved specific text) rather than four different steps.
