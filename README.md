# Cours MCP & A2A — Master IA

Présentation Reveal.js locale : introduction aux protocoles MCP et A2A pour des étudiants de master, à la suite du cours « Architectures & patterns des systèmes agentiques ». Environ 1 h 15 de cours et 45 min de TP.

## Plan

0. **Le problème d'intégration** : rappel du tool calling, N × M, framework / protocole / implémentation, repères historiques, les deux axes (vertical MCP, horizontal A2A)
1. **MCP** : hôte / client / serveur, primitives (tools, resources, prompts), contrat d'outil, cycle d'un appel, JSON-RPC, révisions 2025-11-25 → 2026-07-28, transports, sécurité, limites
2. **A2A** : acteurs et découverte, Agent Card, objets clés, cycle de vie d'une tâche, scénario de délégation, suivi des tâches longues
3. **Choisir et combiner** : comparaison, architecture combinée, critères outil / agent, questions ouvertes, exercice de conception
4. **TP** : serveur MCP `analyser_budget` testé avec MCP Inspector

Les schémas sont des SVG en ligne dans `index.html`, stylés par les classes `.dg` de `custom.css`.

## Lancer

```bash
npm install
npm start
```

Ouvrir http://localhost:8001. Appuyer sur S pour les notes orateur. La présentation et ses dépendances sont locales après installation.

## Avant la séance

- Révisions de référence du contenu : MCP 2026-07-28, A2A 1.0. Vérifier qu'elles sont toujours courantes, ainsi que la version du SDK TypeScript MCP montrée dans l'extrait de code.
- Le squelette du TP est à préparer séparément.
