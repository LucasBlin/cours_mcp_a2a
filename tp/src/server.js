import { realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { listerDossier } from './fichiers.js';

// Seul dossier accessible au serveur : bac-a-sable/ par défaut, ou le premier argument.
const racine = await realpath(
  process.argv[2] ?? fileURLToPath(new URL('../bac-a-sable', import.meta.url))
);

function creerServeur() {
  const server = new McpServer({ name: 'fichiers', version: '1.0.0' });

  server.registerTool('lister_dossier', {
    // TODO 1 : écrire la description et le schéma d'entrée.
    // La description est le seul texte que le modèle lira pour décider d'appeler l'outil.
    // Le schéma attend un argument `chemin` (texte, relatif à la racine, « . » par défaut).
    description: '',
    inputSchema: z.object({})
  }, async ({ chemin = '.' }) => {
    const entrees = await listerDossier(racine, chemin);
    // TODO 4 : renvoyer aussi le résultat structuré (structuredContent),
    // puis déclarer l'outputSchema correspondant ci-dessus.
    return {
      content: [{ type: 'text', text: JSON.stringify(entrees) }]
    };
  });

  return server;
}

serveStdio(creerServeur);
// stdout est réservé aux messages JSON-RPC : les logs vont sur stderr.
console.error(`Serveur MCP fichiers prêt (stdio), dossier autorisé : ${racine}`);
