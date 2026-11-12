import { realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { listerDossier } from './fichiers.js';

const racine = await realpath(
  process.argv[2] ?? fileURLToPath(new URL('../../bac-a-sable', import.meta.url))
);

function creerServeur() {
  const server = new McpServer({ name: 'fichiers', version: '1.0.0' });

  server.registerTool('lister_dossier', {
    description:
      "Liste les fichiers et sous-dossiers d'un dossier du poste de l'utilisateur. " +
      "Lecture seule. Les chemins sont relatifs au dossier autorisé ; « . » désigne ce dossier. " +
      "Tout chemin qui en sort est refusé.",
    inputSchema: z.object({
      chemin: z.string().default('.').describe('Chemin relatif au dossier autorisé, par exemple « voyages/rome »')
    }),
    outputSchema: z.object({
      chemin: z.string(),
      entrees: z.array(z.object({
        nom: z.string(),
        type: z.enum(['dossier', 'fichier'])
      }))
    })
  }, async ({ chemin }) => {
    const entrees = await listerDossier(racine, chemin);
    const texte = entrees.map((e) => `[${e.type}] ${e.nom}`).join('\n') || '(dossier vide)';
    return {
      content: [{ type: 'text', text: texte }],
      structuredContent: { chemin, entrees }
    };
  });

  return server;
}

serveStdio(creerServeur);
console.error(`Serveur MCP fichiers prêt (stdio), dossier autorisé : ${racine}`);
