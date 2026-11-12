import { readdir, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

function estSousRacine(racine, cible) {
  const rel = relative(racine, cible);
  return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

const MESSAGES_ERREUR = {
  ENOENT: (chemin) => `Dossier introuvable : « ${chemin} »`,
  ENOTDIR: (chemin) => `« ${chemin} » n'est pas un dossier`,
  EACCES: (chemin) => `Lecture non autorisée par le système : « ${chemin} »`
};

function erreurLisible(erreur, chemin) {
  const message = MESSAGES_ERREUR[erreur.code];
  return message ? new Error(message(chemin)) : erreur;
}

export async function resoudreChemin(racine, chemin) {
  const refus = new Error(`Accès refusé : « ${chemin} » sort du dossier autorisé`);
  const demande = resolve(racine, chemin);
  if (!estSousRacine(racine, demande)) throw refus;

  // Un lien symbolique placé sous la racine peut pointer ailleurs :
  // on revérifie après résolution du chemin réel.
  const reel = await realpath(demande).catch((erreur) => {
    throw erreurLisible(erreur, chemin);
  });
  if (!estSousRacine(racine, reel)) throw refus;
  return reel;
}

export async function listerDossier(racine, chemin) {
  const dossier = await resoudreChemin(racine, chemin);
  const entrees = await readdir(dossier, { withFileTypes: true }).catch((erreur) => {
    throw erreurLisible(erreur, chemin);
  });
  return entrees
    .map((entree) => ({ nom: entree.name, type: entree.isDirectory() ? 'dossier' : 'fichier' }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.nom.localeCompare(b.nom));
}
