# legal_refs/md/ — Fichiers Markdown

Ce dossier contient les représentations machine-readable (Markdown) des textes juridiques algériens.

> **⚠️ IMPORTANT** : Les fichiers Markdown sont en cours de migration depuis `legal_refs/` vers ce dossier.
> Statut de la migration : **EN COURS** — 2026-08-19

## Structure cible

```
legal_refs/
├── md/          ← CE DOSSIER — fichiers Markdown validés
├── pdf/         ← PDFs originaux JORADP (SOURCE AUTORITAIRE)
└── validation/  ← Rapports d'audit et statuts
```

## Règle d'usage

- Les fichiers `.md` dans ce dossier sont des **représentations machine-readable**.
- Ils ne sont **pas autoritaires** tant que `conversion_status` ≠ `VERIFIED`.
- Consulter `/legal_refs/validation/conversion_status.json` pour le statut de chaque fichier.
- En cas de doute sur un contenu légal critique, **toujours vérifier contre le PDF source**.

## Migration depuis legal_refs/

Pour compléter la migration des fichiers `.md` depuis la racine `legal_refs/` vers ce dossier, exécuter localement :

```bash
# Cloner le repo si pas déjà fait
git clone https://github.com/belabedmohamedins-tech/SafeInspect-APP.git
cd SafeInspect-APP

# Déplacer tous les fichiers MD (hors README, HANDOVER, CLEANUP_LOG, AGENT_INSTRUCTIONS)
git mv legal_refs/arrete-interministeriel-1999-11-21-conservation-aliments.md legal_refs/md/
git mv legal_refs/arrete-interministeriel-2011-02-06-permis-construire-energie.md legal_refs/md/
git mv legal_refs/arrete-interministeriel-2016-10-04-criteres-microbiologiques.md legal_refs/md/
git mv legal_refs/arrete-interministeriel-2025-05-07-hygiene-restauration.md legal_refs/md/
git mv legal_refs/decret-01-102-creation-ona.md legal_refs/md/
git mv legal_refs/decret-02-427-prevention-risques-professionnels.md legal_refs/md/
git mv legal_refs/decret-04-410-regles-installations-traitement-dechets.md legal_refs/md/
git mv legal_refs/decret-04-82-agrement-sanitaire-elevage.md legal_refs/md/
git mv legal_refs/decret-05-315-declaration-dechets-speciaux-dangereux.md legal_refs/md/
git mv legal_refs/decret-06-138-emissions-atmospheriques.md legal_refs/md/
git mv legal_refs/decret-06-141-rejets-effluents-liquides.md legal_refs/md/
git mv legal_refs/decret-06-198-etablissements-classes.md legal_refs/md/
git mv legal_refs/decret-07-144-nomenclature-installations-classees.md legal_refs/md/
git mv legal_refs/decret-07-205-schema-communal-dechets.md legal_refs/md/
git mv legal_refs/decret-09-19.md legal_refs/md/
git mv legal_refs/decret-09-335-plans-internes-intervention.md legal_refs/md/
git mv legal_refs/decret-11-125-eau-consommation-humaine.md legal_refs/md/
git mv legal_refs/decret-17-140-hygiene-alimentaire.md legal_refs/md/
git mv legal_refs/decret-21-261-esp-equipements-hydrocarbures.md legal_refs/md/
git mv legal_refs/decret-21-319-autorisation-exploitation-hydrocarbures.md legal_refs/md/
git mv legal_refs/decret-21-430-gpl-carburant.md legal_refs/md/
git mv legal_refs/decret-22-167-etablissements-classes-modification.md legal_refs/md/
git mv legal_refs/decret-24-196-etablissements-classes-modification.md legal_refs/md/
git mv legal_refs/decret-25-63-plans-intervention-catastrophes.md legal_refs/md/
git mv legal_refs/decret-76-35-igh-incendie.md legal_refs/md/
git mv legal_refs/decret-76-36-incendie-panique.md legal_refs/md/
git mv legal_refs/decret-83-496-gpl-carburant.md legal_refs/md/
git mv legal_refs/decret-90-245-appareils-pression-gaz.md legal_refs/md/
git mv legal_refs/decret-91-05-hygiene-securite-milieu-travail.md legal_refs/md/
git mv legal_refs/decret-93-120-medecine-du-travail.md legal_refs/md/
git mv legal_refs/loi-01-19-gestion-dechets.md legal_refs/md/
git mv legal_refs/loi-03-10-protection-environnement.md legal_refs/md/
git mv legal_refs/loi-04-08-activites-commerciales.md legal_refs/md/
git mv legal_refs/loi-04-20-risques-majeurs.md legal_refs/md/
git mv legal_refs/loi-05-12-ressources-en-eau.md legal_refs/md/
git mv legal_refs/loi-09-03-protection-consommateur.md legal_refs/md/
git mv legal_refs/loi-18-09-protection-consommateur.md legal_refs/md/
git mv legal_refs/loi-18-11-sante-partie1-arts1-164.md legal_refs/md/
git mv legal_refs/loi-18-11-sante-partie2-arts165-264.md legal_refs/md/
git mv legal_refs/loi-18-11-sante-partie3-arts265-450.md legal_refs/md/
git mv legal_refs/loi-19-02-incendie-panique.md legal_refs/md/
git mv legal_refs/loi-88-07-hygiene-securite-medecine-travail.md legal_refs/md/
git mv legal_refs/loi-90-11-relations-travail.md legal_refs/md/
git mv legal_refs/loi-90-29-urbanisme.md legal_refs/md/
git mv legal_refs/projet-arrete-gpl-installations-securite.md legal_refs/md/

# Commit de migration
git add -A
git commit -m "refactor(legal_refs): migrate all MD files to legal_refs/md/ — structural reorganization"
git push origin main
```

> Après cette migration, supprimer ce bloc « Migration » du README.
