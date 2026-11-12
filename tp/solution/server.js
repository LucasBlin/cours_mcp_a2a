import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { analyserBudget } from './budget.js';

function creerServeur() {
  const server = new McpServer({ name: 'budget-voyage', version: '1.0.0' });

  server.registerTool('analyser_budget', {
    description:
      "Vérifie si un voyage tient dans un budget. Calcule le coût total " +
      "(jours × coût journalier + transport) et la marge restante, en euros. " +
      "Une marge négative signifie que le voyage dépasse le budget.",
    inputSchema: z.object({
      budget_total: z.number().nonnegative().describe('Budget disponible, en euros'),
      nb_jours: z.number().int().min(1).describe('Durée du séjour, en jours'),
      cout_journalier: z.number().nonnegative().describe('Hébergement et repas par jour, en euros'),
      cout_transport: z.number().nonnegative().describe('Transport aller-retour, en euros')
    }),
    outputSchema: z.object({
      cout_total: z.number(),
      marge: z.number(),
      faisable: z.boolean()
    })
  }, async (args) => {
    const resultat = analyserBudget(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(resultat) }],
      structuredContent: resultat
    };
  });

  return server;
}

serveStdio(creerServeur);
console.error('Serveur MCP budget-voyage prêt (stdio)');
