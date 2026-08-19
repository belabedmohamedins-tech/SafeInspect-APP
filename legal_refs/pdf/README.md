# Dossier PDFs — Sources légales officielles

Ce dossier contient les fichiers PDF originaux des textes légaux algériens (JORADP/ministères).

**Les PDFs sont la source de vérité immuable.** Ne jamais modifier un PDF.

---

## Comment uploader un PDF

1. Nommer le fichier **exactement** selon le slug du fichier MD correspondant dans `/legal_refs/` :
   - `decret-21-261-esp-equipements-hydrocarbures.pdf`
   - `loi-03-10-protection-environnement.pdf`
   - etc.
2. Uploader le fichier dans ce dossier (`legal_refs/pdf/`).
3. Mettre `"pdf_available": true` dans `/legal_refs/validation/conversion_status.json` pour ce document.
4. L'audit peut alors démarrer.

---

## PDFs disponibles

*Aucun PDF uploadé pour l'instant — en attente d'upload.*

---

## Cas particulier : loi-18-11 (Loi Santé)

Cette loi est divisée en 3 fichiers MD mais un seul PDF source est attendu :
- `loi-18-11-sante.pdf` → couvre les 3 parties (Arts. 1–450)

---

*Ne pas modifier les PDFs. Ne pas renommer les PDFs après upload sans mettre à jour `conversion_status.json`.*
