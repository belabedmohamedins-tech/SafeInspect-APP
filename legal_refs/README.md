# legal_refs — Index des textes légaux de référence SafeInspect

> **Dossier canonique unique.** Tous les textes légaux de référence pour SafeInspect se trouvent ici et uniquement ici.  
> `docs/legal_sources/` **a été supprimé définitivement** (confirmé le 2026-08-09 — voir `CLEANUP_LOG.md`). Ce dossier n'existe plus et ne doit pas être recréé.

Chaque fichier est une transcription verbatim du texte officiel publié au Journal Officiel de la République Algérienne (JORADP).  
Statut par défaut : ⚠️ NON VÉRIFIÉ — à vérifier contre le JORADP original avant tout usage légal.

---

## Index des fichiers

| Fichier | Instrument | Objet | Statut |
|---|---|---|---|
| `loi-90-11-relations-travail.md` | Loi n° 90-11 du 21 avril 1990 | Relations individuelles et collectives de travail | ✅ Texte intégral (Art. 1–130) |
| `loi-09-03-protection-consommateur.md` | Loi n° 09-03 du 25 février 2009 | Protection du consommateur et répression des fraudes | ✅ Texte intégral (Art. 1–95, amdt Loi 18-09 intégré) |
| `loi-05-12-ressources-en-eau.md` | Loi n° 05-12 du 4 août 2005 | Ressources en eau | ⚠️ Partiel — Art. 1–2, 86–106, 126–183 absents (OCR pages 1, 9–11, 13–20 non restituées) |
| `loi-03-10-protection-environnement.md` | Loi n° 03-10 du 19 juillet 2003 | Protection de l'environnement dans le cadre du développement durable | ✅ Texte intégral |
| `loi-01-19-gestion-dechets.md` | Loi n° 01-19 du 12 décembre 2001 | Gestion, contrôle et élimination des déchets | ✅ Texte intégral |
| `loi-19-02-incendie-panique.md` | Loi n° 19-02 du 17 juillet 2019 | Règles générales de prévention des risques d'incendie et de panique | ✅ Texte intégral |
| `decret-17-140-hygiene-alimentaire.md` | Décret exécutif n° 17-140 du 11 avril 2017 | Conditions d'hygiène et de salubrité — mise à la consommation des denrées alimentaires | ✅ Texte intégral (Art. 1–64) |
| `decret-07-144-nomenclature-installations-classees.md` | Décret exécutif n° 07-144 du 19 mai 2007 | Nomenclature des installations classées pour la protection de l'environnement | ⚠️ Partiel — rubriques 1243–2922 manquantes (voir [MANQUANT]) |
| `decret-06-198-etablissements-classes.md` | Décret exécutif n° 06-198 du 31 mai 2006 **+ Décret n° 24-196 du 11 juin 2024 (intégré inline)** | Établissements classés pour la protection de l'environnement | ✅ Texte intégral Art. 1–50 — modifications D24-196 (Art. 14, 24, 25, 26, 29, 44) intégrées inline ⚠️ NON VÉRIFIÉ |
| `decret-09-19.md` | Décret exécutif n° 09-19 du 20 janvier 2009 | Modalités de fonctionnement du système de management environnemental | ✅ Texte intégral |
| `decret-91-05-hygiene-securite-milieu-travail.md` | Décret exécutif n° 91-05 du 19 janvier 1991 | Prescriptions générales de protection en matière d'hygiène et de sécurité en milieu de travail | ✅ Texte intégral |
| `decret-93-120-medecine-du-travail.md` | Décret exécutif n° 93-120 du 15 mai 1993 | Organisation de la médecine du travail | ✅ Texte intégral |
| `arrete-interministeriel-2025-liaison-froide.md` | Arrêté interminist. du 7 mai 2025 | Conditions d'hygiène restauration — chaîne du froid / liaison chaude-froide | ⚠️ Valeurs de référence — texte intégral JO 43/2025 non extrait |
| `aim-gpl2-regles-techniques-securite.md` | AIM GPL2 | Règles techniques de sécurité | ⚠️ À vérifier |

---

## Fichiers restant à créer

| Fichier cible | Instrument | PDF source disponible |
|---|---|---|
| `loi-90-29-urbanisme.md` | Loi n° 90-29 du 1er décembre 1990 — Aménagement et urbanisme | `loi-90-29.pdf` ✅ |
| `loi-04-20-eau.md` | Loi n° 04-20 du 25 décembre 2004 — Prévention des risques majeurs | `Loi-04-20.pdf` ✅ |
| `loi-18-11-sante.md` | Loi n° 18-11 du 2 juillet 2018 — Santé | `loi-18-11.pdf` ✅ |

---

## Notes

- Aucun fichier PDF ne doit être stocké dans ce dossier — les PDFs ne sont pas lisibles par les outils IA sur GitHub.
- Pour ajouter un nouveau texte : transcrire verbatim depuis le PDF source, respecter la convention de nommage `{type}-{numéro}-{sujet-court}.md`, mettre à jour cet index.
- Un instrument = un fichier. Ne jamais regrouper plusieurs arrêtés ou décrets dans un seul fichier.
- **Renommages effectués le 2026-08-09 :** `Decret-07-144.md` → `decret-07-144-nomenclature-installations-classees.md` ; `Decret-17-140.md` → `decret-17-140-hygiene-alimentaire.md`. Les anciens fichiers ont été supprimés.
- **2026-08-09 :** Décret n° 24-196 du 11 juin 2024 (Art. 14, 24, 25, 26, 29, 44) intégré inline dans `decret-06-198-etablissements-classes.md` — commit 455e661.
