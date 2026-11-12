import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { analyserBudget } from './budget.js';

function creerServeur() {
  const server = new McpServer({ name: 'budget-voyage', version: '1.0.0' });

  server.registerTool('analyser_budget', {
    // TODO 1 : écrire la description. C'est le seul texte que le modèle lira
    // pour décider quand appeler l'outil : dire ce qu'il calcule, avec quelles unités.
    description: '',

    // TODO 2 : déclarer les quatre arguments attendus par analyserBudget,
    // avec leur type, leurs bornes et une description (.describe()).
    inputSchema: z.object({})
  }, async (args) => {
    const resultat = analyserBudget(args);
    // TODO 4 : renvoyer aussi le résultat structuré (structuredContent),
    // puis déclarer l'outputSchema correspondant ci-dessus.
    return {
      content: [{ type: 'text', text: JSON.stringify(resultat) }]
    };
  });

  return server;
}

serveStdio(creerServeur);
// stdout est réservé aux messages JSON-RPC : les logs vont sur stderr.
console.error('Serveur MCP budget-voyage prêt (stdio)');
