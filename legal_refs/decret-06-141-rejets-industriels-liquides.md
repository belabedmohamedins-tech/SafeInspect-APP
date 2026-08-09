# Décret exécutif n° 06-141 du 19 Rabie El Aouel 1427 correspondant au 19 avril 2006
## définissant les valeurs limites des rejets d'effluents liquides industriels

> **STATUT** : STUB — texte verbatim NON extrait  
> **Source à convertir** : JORADP JO n° 26 du 26 avril 2006  
> **Phase** : W36 — ouvert 2026-08-09  
> **Priorité** : P1 — instrument le plus cité dans les critères sans fichier  
> **⚠️ Critères qui citent ce décret** : BGN-03-02, BGN-03-03, ABT-AX6-01/02, UAB-AX6-xx, carWashCriteria AX6-xx, mechanicCriteria AX6-xx, marbleCriteria AX6-xx — rejets liquides industriels vers réseau ou milieu récepteur

---

## Articles clés à extraire en priorité

| Article | Objet |
|---|---|
| Art. 1–4 | Champ d'application, définitions, obligation de traitement |
| Art. 5–8 | Procédure d'autorisation de rejet (renvoi vers décret 06-198) |
| Annexe I | Valeurs limites générales (mg/L) : MES, DBO5, DCO, pH, huiles/graisses, métaux lourds, etc. |
| Annexe II | Valeurs limites spécifiques par secteur (abattoirs, laiteries, tanneries, peintures, etc.) |
| Art. 9–12 | Autocontrôle analytique obligatoire, fréquences, laboratoires agréés |
| Art. 13–17 | Sanctions, contrôle, mise en conformité |

---

## Critères impactés — action requise après conversion

Une fois le texte verbatim extrait et le fichier complet poussé, les valeurs numériques suivantes devront être vérifiées dans les fichiers critères :

- `abattoirCriteria.ts` ABT-AX6-01 : DBO5 ≤ 30 mg/L, DCO ≤ 90 mg/L, MES ≤ 30 mg/L — à vérifier contre Annexe II abattoirs
- `abattoirCriteria.ts` ABT-AX6-02 : Annex II g/tonne option — W10 OPEN, vérifier unités après conversion
- `uabCriteria.ts` UAB-AX6-xx : valeurs générales Annexe I — à confirmer
- `carWashCriteria.ts` CRW-AX6-xx : huiles/graisses, DCO — à confirmer Annexe II garage/lavage
- `mechanicCriteria.ts` MEC-AX6-xx : hydrocarbures, DCO — à confirmer

---

*INSTRUCTION POUR L'AUTRE CONVERSATION : convertir ce fichier depuis le PDF JORADP JO n° 26/2006. Utiliser push_files (>20 000 chars attendus). Vérifier le diff après push (deletions < 20 lignes). Ne jamais remplacer ce fichier en totalité si la taille du contenu à pousser est < 90% de la taille originale.*
