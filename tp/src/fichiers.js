import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Logique métier : aucune dépendance à MCP.

export async function resoudreChemin(racine, chemin) {
  // TODO 3 : sécurité. En l'état, « ../.. » sort de la racine : testez-le avant de corriger.
  // Refuser tout chemin qui ne reste pas sous `racine` (indices : path.relative, path.sep),
  // puis traiter le cas d'un lien symbolique qui pointe ailleurs (fs.realpath).
  return resolve(racine, chemin);
}

export async function listerDossier(racine, chemin) {
  const dossier = await resoudreChemin(racine, chemin);
  // TODO 2 : lire le dossier avec readdir(dossier, { withFileTypes: true })
  // et renvoyer un tableau de { nom, type } où type vaut 'dossier' ou 'fichier'.
  // Traduire les erreurs ENOENT et ENOTDIR en messages clairs, sans chemin absolu.
  throw new Error('listerDossier : à implémenter');
}
