# TP — Un serveur MCP qui analyse un budget de voyage

45 minutes, en binôme. Vous complétez un serveur MCP local (transport stdio) qui expose l'outil `analyser_budget`, puis vous le testez avec MCP Inspector, sans LLM ni clé d'API.

Même domaine que le TP Mastra : la préparation d'un voyage. Ce serveur pourra devenir un outil de l'agent Mastra.

## Objectifs

- Écrire le **contrat** d'un outil : nom, description, schéma d'entrée, schéma de sortie.
- Séparer la **logique métier** (`budget.js`) du **protocole** (`server.js`).
- Observer le protocole : `server/discover`, `tools/list`, `tools/call`, résultats et erreurs.

## Installation

Node.js 20 ou plus récent.

```bash
npm install
npm run inspect
```

`npm run inspect` lance MCP Inspector sur `src/server.js` et ouvre l'interface dans le navigateur. Cliquez sur **Connect**, puis ouvrez l'onglet **Tools**.

Tester en ligne de commande :

```bash
node scripts/inspecter.js src/server.js --cli --method tools/list
node scripts/inspecter.js src/server.js --cli --method tools/call --tool-name analyser_budget --tool-arg budget_total=1800 nb_jours=4 cout_journalier=150 cout_transport=400
```

## Ce qu'il faut faire

Les `TODO` sont numérotés dans `src/server.js` et `src/budget.js`.

1. **Description** de l'outil : c'est du prompt. Dites ce que l'outil calcule et dans quelles unités.
2. **Schéma d'entrée** : `budget_total`, `nb_jours`, `cout_journalier`, `cout_transport`. Choisissez les types et les bornes.
3. **Calcul** dans `analyserBudget` : coût total, marge, faisabilité.
4. **Résultat structuré** : renvoyez `structuredContent` et déclarez l'`outputSchema`.

Après chaque modification, reconnectez-vous dans Inspector (**Disconnect** puis **Connect**) : le serveur est relancé à chaque connexion.

## Trois cas à tester

| Cas | Entrées | Attendu |
|---|---|---|
| Faisable | budget 1 800 € · 4 jours · 150 €/j · transport 400 € | coût total 1 000 € · marge +800 € |
| Impossible | budget 500 € · 2 jours · 150 €/j · transport 800 € | coût total 1 100 € · marge −600 € |
| Invalide | durée négative, ou budget manquant | erreur explicite, lisible par un modèle |

Pour le cas invalide, observez : qui rejette l'entrée, le schéma ou votre code ? L'erreur revient-elle comme une erreur JSON-RPC ou comme un résultat `isError: true` ? Pourquoi ce choix aide-t-il le modèle ?

## Pièges

- **Rien sur stdout** : en stdio, stdout transporte les messages JSON-RPC. Un `console.log` corrompt le flux ; utilisez `console.error`.
- **Windows** : passez par `npm run inspect` ou `scripts/inspecter.js`, qui donnent à Inspector le chemin complet de Node. `npx @modelcontextprotocol/inspector node src/server.js` peut y échouer avec `spawn node ENOENT`.

## Pour aller plus loin

- Ajouter une resource `budget://bareme` qui expose des coûts journaliers par destination.
- Brancher le serveur sur l'agent Mastra du TP précédent : l'agent devient l'hôte, ce serveur l'un de ses outils.

## Versions

SDK TypeScript MCP v2 (`@modelcontextprotocol/server` 2.4), révision du protocole 2026-07-28, MCP Inspector 2.15. `serveStdio` accepte aussi les clients de la génération précédente (handshake `initialize`).

Une correction se trouve dans `solution/` : à retirer avant de distribuer le squelette.
