# TP — Un serveur MCP qui donne accès aux fichiers

45 minutes, en binôme. Vous complétez un serveur MCP local (transport stdio) qui expose l'outil `lister_dossier`, limité au dossier `bac-a-sable/`, puis vous le testez avec MCP Inspector, sans LLM ni clé d'API.

- **[GUIDE_ELEVES.md](GUIDE_ELEVES.md)** : le déroulé pas à pas, avec les points de contrôle.
- **[SCHEMA_ET_ATTENDU.md](SCHEMA_ET_ATTENDU.md)** : l'architecture, le contrat de l'outil et les pistes d'implémentation.

## Démarrer

Node.js 20 ou plus récent.

```bash
npm install
npm run inspect   # MCP Inspector sur src/server.js, dans le navigateur
npm test          # tests de la logique métier
```

En ligne de commande :

```bash
node scripts/inspecter.js src/server.js --cli --method tools/list
node scripts/inspecter.js src/server.js --cli --method tools/call --tool-name lister_dossier --tool-arg chemin=voyages
```

## Organisation

| Fichier | Rôle |
|---|---|
| `src/server.js` | Le protocole : déclaration de l'outil, démarrage en stdio (TODO 1 et 4) |
| `src/fichiers.js` | La logique métier, sans MCP (TODO 2 et 3) |
| `tests/fichiers.test.js` | Les tests de la logique métier (TODO 5) |
| `bac-a-sable/` | Le seul dossier visible par le serveur : notes de voyage fictives |
| `scripts/inspecter.js` | Lance Inspector avec le chemin complet de Node (nécessaire sous Windows) |

`node src/server.js <dossier>` change le dossier autorisé. Ne pointez pas le serveur sur votre dossier personnel.

## Pour aller plus loin

- Ajouter un outil `lire_fichier`, avec une taille maximale et la même protection des chemins.
- Exposer les fichiers comme **resources** (`file://…`) plutôt que comme outil : qui décide alors de les lire ?
- Brancher le serveur sur l'agent Mastra du TP précédent : l'agent devient l'hôte, ce serveur l'un de ses outils.

## Versions

SDK TypeScript MCP v2 (`@modelcontextprotocol/server` 2.4), révision du protocole 2026-07-28, MCP Inspector 2.15. `serveStdio` accepte aussi les clients de la génération précédente (handshake `initialize`).
