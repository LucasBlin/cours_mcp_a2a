# Guide élève — TP serveur MCP

**Durée : 45 min · en binôme.**
Question du TP : *comment exposer une capacité de l'OS à un modèle, sans lui ouvrir tout le disque ?*

Vous partez d'un serveur MCP qui démarre mais ne fait rien, et vous en faites un outil `lister_dossier` limité au dossier `bac-a-sable/`. Le schéma et l'attendu sont dans [SCHEMA_ET_ATTENDU.md](SCHEMA_ET_ATTENDU.md).

Cochez chaque case au fur et à mesure.

---

## Étape 0 — Installer (avant la séance ou 5 premières minutes)

- [ ] Node.js 22.22 ou plus récent : `node -v`
- [ ] Dans le dossier `tp/` :
  ```bash
  npm install
  npm test        # 4 tests « todo » sont normaux : c'est le TODO 5
  ```

> ✅ **Point de contrôle** : `npm test` affiche `fail 0` et `todo 4`.

---

## Étape 1 — Se connecter (5 min)

- [ ] Lancer Inspector :
  ```bash
  npm run inspect
  ```
- [ ] Dans le navigateur : **Connect**, puis onglet **Tools** → **List Tools**.
- [ ] Appeler `lister_dossier`.

> ✅ **Point de contrôle** : l'outil apparaît sans description, et l'appel renvoie `listerDossier : à implémenter` avec `isError: true`.

Après chaque modification du code : **Disconnect** puis **Connect**, le serveur est relancé à chaque connexion.

---

## Étape 2 — Décrire l'outil · TODO 1 (`src/server.js`)

- [ ] Écrire la **description** : ce que fait l'outil, qu'il est en lecture seule, comment écrire un chemin. C'est le seul texte que le modèle lira.
- [ ] Déclarer le **schéma d'entrée** : un champ `chemin`, texte, `.` par défaut, avec un `.describe(...)`.

> ✅ **Point de contrôle** : dans Inspector, l'outil affiche sa description et un champ `chemin`.

---

## Étape 3 — Lister le dossier · TODO 2 (`src/fichiers.js`)

- [ ] Implémenter `listerDossier` : un tableau de `{ nom, type }`, `type` valant `dossier` ou `fichier`.
- [ ] Traduire les erreurs `ENOENT` et `ENOTDIR` en messages clairs, sans chemin absolu.

> ✅ **Point de contrôle** : `.` renvoie `voyages` et `notes.md` ; `voyages/tokyo` renvoie une erreur lisible.

---

## Étape 4 — Constater la faille (5 min)

- [ ] Appeler l'outil avec `chemin` = `../..`, puis avec un chemin absolu (`C:/Windows` ou `/etc`).
- [ ] Noter ce que vous voyez. Qu'aurait pu en faire un modèle qui lit une page web piégée (injection de prompt) ?

---

## Étape 5 — Protéger les chemins · TODO 3 (`src/fichiers.js`)

- [ ] Dans `resoudreChemin`, refuser tout chemin qui ne reste pas sous la racine.
- [ ] Revérifier après `fs.realpath` : un lien symbolique dans le bac à sable peut pointer ailleurs.

> ✅ **Point de contrôle** : `../..` et `C:/Windows` renvoient `Accès refusé`, `voyages/lisbonne` fonctionne toujours.

---

## Étape 6 — Résultat structuré · TODO 4 (`src/server.js`)

- [ ] Renvoyer `structuredContent` : `{ chemin, entrees }`.
- [ ] Déclarer l'`outputSchema` correspondant.

> ✅ **Point de contrôle** : dans Inspector, le résultat contient `structuredContent` et l'outil affiche un schéma de sortie.

---

## Étape 7 — Tester sans Inspector · TODO 5 (`tests/fichiers.test.js`, si le temps le permet)

- [ ] Remplacer chaque `test.todo` par un vrai test qui appelle `listerDossier` directement.

> ✅ **Point de contrôle** : `npm test` affiche `fail 0` et plus aucun `todo`.

---

## Étape 8 — Restitution (5 min)

Répondre à l'oral, à partir de ce que vous avez observé :

1. Dans ce TP, qui joue l'hôte, qui le client, qui le serveur ?
2. Les erreurs reviennent-elles comme des erreurs JSON-RPC ou comme des résultats `isError: true` ? Pourquoi ce choix aide-t-il le modèle ?
3. Pourquoi est-ce au serveur, et pas au client, de limiter les chemins ?

---

## En cas de problème

| Symptôme | Cause probable |
|---|---|
| `npm warn EBADENGINE` pour `@modelcontextprotocol/inspector` | Normal avec Node 22.22 : Inspector recommande 22.23.4 mais fonctionne. Si le paquet cité est `tp-mcp-fichiers`, Node est trop ancien (moins de 22.22). |
| `spawn node ENOENT` | Inspector lancé directement avec `node` sous Windows : passer par `npm run inspect`. |
| Inspector ne reçoit plus rien, erreur de parsing | Un `console.log` écrit sur stdout, réservé au JSON-RPC : utiliser `console.error`. |
| La modification n'a aucun effet | Le serveur n'a pas été relancé : **Disconnect** puis **Connect**. |
| `Input validation error: … chemin` | L'argument ne respecte pas le schéma d'entrée : vérifier le type et la valeur par défaut. |
| `Output validation error: …` | `structuredContent` ne respecte pas l'`outputSchema` (TODO 4). |
| `listerDossier : à implémenter` | Le TODO 2 n'est pas fait : le `throw` est toujours là. |
| Les messages d'erreur montrent `C:\Users\…` | Les erreurs système sont renvoyées telles quelles : les traduire (TODO 2). |
