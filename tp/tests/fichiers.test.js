/*
 * TODO 5 — Tester la logique métier, sans Inspector
 *
 * src/fichiers.js ne dépend pas de MCP : on peut l'appeler directement.
 * La racine de test est le dossier bac-a-sable/ fourni :
 *
 *   import { realpath } from 'node:fs/promises';
 *   import { fileURLToPath } from 'node:url';
 *   const racine = await realpath(fileURLToPath(new URL('../bac-a-sable', import.meta.url)));
 *
 * Pour une erreur attendue : await assert.rejects(promesse, /motif du message/).
 *
 * Structure conseillée pour chaque test, une vérification principale par test :
 *   // given : les données d'entrée
 *   // when  : l'appel testé
 *   // then  : l'assertion
 *
 * Remplacez chaque test.todo par un vrai test(...) au fur et à mesure.
 */
import { test } from 'node:test';

test.todo('liste le dossier racine : voyages (dossier) et notes.md (fichier)');
test.todo('refuse « ../.. » : le chemin sort du dossier autorisé');
test.todo('refuse un chemin absolu hors de la racine');
test.todo('dossier introuvable : message clair, sans chemin absolu de la machine');
