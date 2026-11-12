# Corrigé des TODO — document enseignant

Ce corrigé reprend **le squelette distribué aux élèves** (`src/server.js`, `src/fichiers.js`, `tests/fichiers.test.js`). Le dossier `correction/` contient exactement ce code, appliqué au projet élève. Depuis `tp/correction/`, après `npm install` dans `tp/` :

```bash
npm test          # tests de la correction
npm run inspect   # Inspector sur la correction
```

Version de Node : 22.22 ou plus récent, comme le TP Mastra. MCP Inspector 2.15 recommande 22.23.4 et affiche un avertissement `EBADENGINE` en dessous, sans conséquence. On garde Inspector 2.15 plutôt que 2.13 (compatible 22.19 sans avertissement) : la 2.15 corrige quatre vulnérabilités présentes de 2.0 à 2.14.

Le code ci-dessous a été vérifié sous Windows avec Node 22.22.0 (installation propre par `npm ci`) et Node 22.19.0, SDK `@modelcontextprotocol/server` 2.4.0, Inspector 2.15.0 en ligne de commande et en interface web. Non vérifié sous macOS ni sous Linux. Résultats :
- `npm test` dans `correction/` : 5 tests réussis, 0 échec, 0 en attente ;
- `npm test` dans `tp/` (squelette) : 0 échec, 4 tests `todo` ;
- par Inspector en ligne de commande : les cas `.`, `voyages/lisbonne`, `voyages/tokyo`, `notes.md`, `../..` et `C:/Windows` donnent les résultats de [SCHEMA_ET_ATTENDU.md](../SCHEMA_ET_ATTENDU.md) ;
- une jonction Windows `bac-a-sable/raccourci → C:/Windows` est refusée ;
- en JSON-RPC brut, révision 2026-07-28 : `server/discover` répond, chaque résultat porte `resultType: "complete"`.

Pour chaque TODO : le code attendu, puis les erreurs fréquentes à surveiller.

---

## TODO 1 — Description et schéma d'entrée (`src/server.js`)

```js
server.registerTool('lister_dossier', {
  description:
    "Liste les fichiers et sous-dossiers d'un dossier du poste de l'utilisateur. " +
    "Lecture seule. Les chemins sont relatifs au dossier autorisé ; « . » désigne ce dossier. " +
    "Tout chemin qui en sort est refusé.",
  inputSchema: z.object({
    chemin: z.string().default('.').describe('Chemin relatif au dossier autorisé, par exemple « voyages/rome »')
  }),
  // outputSchema : voir TODO 4
}, async ({ chemin }) => { /* … */ });
```

**À surveiller**
- La description doit dire **ce que fait l'outil**, qu'il est **en lecture seule** et **comment écrire un chemin**. Une description vide ou « liste un dossier » ne suffit pas : c'est le seul texte que le modèle lira avant d'appeler l'outil.
- Elle ne doit pas révéler le chemin absolu de la racine : inutile pour le modèle, et c'est une information sur la machine.
- `.default('.')` ou `.optional()` : sans l'un des deux, un appel sans argument est rejeté par le schéma. Les deux sont acceptables ; le défaut rend l'outil plus simple à appeler.
- Variante acceptée : l'objet brut `{ chemin: z.string().default('.') }` au lieu de `z.object(...)`. Le SDK v2 l'accepte encore (vérifié en 2.4.0), mais sa documentation utilise `z.object`.

---

## TODO 2 — Lister le dossier (`src/fichiers.js`)

```js
const MESSAGES_ERREUR = {
  ENOENT: (chemin) => `Dossier introuvable : « ${chemin} »`,
  ENOTDIR: (chemin) => `« ${chemin} » n'est pas un dossier`,
  EACCES: (chemin) => `Lecture non autorisée par le système : « ${chemin} »`
};

function erreurLisible(erreur, chemin) {
  const message = MESSAGES_ERREUR[erreur.code];
  return message ? new Error(message(chemin)) : erreur;
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
```

**À surveiller**
- Les messages doivent reprendre **le chemin demandé** (relatif), pas le chemin absolu : l'erreur brute de Node (`ENOENT: no such file or directory, scandir 'C:\Users\…'`) révèle l'arborescence de la machine.
- Le tri n'est pas exigé, mais un ordre stable rend les tests et les réponses du modèle reproductibles. La spécification 2026-07-28 recommande d'ailleurs un ordre déterministe pour `tools/list`.
- Erreur fréquente : `readdir` sans `withFileTypes`, puis un `stat` par entrée. Ça marche, mais c'est plus lent et plus long à écrire.

---

## TODO 3 — Protéger les chemins (`src/fichiers.js`)

```js
function estSousRacine(racine, cible) {
  const rel = relative(racine, cible);
  return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
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
```

Imports correspondants : `realpath` depuis `node:fs/promises`, `isAbsolute`, `relative`, `resolve` et `sep` depuis `node:path`.

**À surveiller**
- **`chemin.includes('..')` n'est pas une protection** : il refuse à tort `notes..md`, et laisse passer un chemin absolu comme `C:/Windows` ou `/etc`. Il faut comparer des chemins résolus.
- **`cible.startsWith(racine)` non plus** : `/tp/bac-a-sable-secret` commence par `/tp/bac-a-sable`. `path.relative` évite ce piège.
- **`isAbsolute(rel)`** couvre le cas Windows d'un autre lecteur (`D:/…`), où `relative` renvoie un chemin absolu.
- **La seconde vérification après `realpath`** est la plus souvent oubliée. Pour la démontrer : `mklink /J bac-a-sable\raccourci C:\Windows` sous Windows, `ln -s /etc bac-a-sable/raccourci` ailleurs.
- La racine elle-même doit être passée par `realpath` au démarrage (c'est fait dans `server.js`) ; sinon la comparaison échoue dès que la racine contient un lien.

---

## TODO 4 — Résultat structuré (`src/server.js`)

```js
outputSchema: z.object({
  chemin: z.string(),
  entrees: z.array(z.object({
    nom: z.string(),
    type: z.enum(['dossier', 'fichier'])
  }))
})
```

```js
async ({ chemin }) => {
  const entrees = await listerDossier(racine, chemin);
  const texte = entrees.map((e) => `[${e.type}] ${e.nom}`).join('\n') || '(dossier vide)';
  return {
    content: [{ type: 'text', text: texte }],
    structuredContent: { chemin, entrees }
  };
}
```

**À surveiller**
- Garder **les deux** : `content` pour le modèle, `structuredContent` pour le code de l'hôte. Supprimer `content` casse les clients qui ne lisent que le texte.
- Si `structuredContent` ne respecte pas l'`outputSchema` (par exemple `type: 'file'`), le SDK renvoie `isError: true` avec « Output validation error: … expected one of "dossier"|"fichier" » (vérifié) : bon moment pour montrer que le schéma de sortie est contrôlé.
- Un dossier vide doit produire un texte explicite (`(dossier vide)`), pas une chaîne vide.

---

## TODO 5 — Tests (`tests/fichiers.test.js`)

Fichier complet : voir [`tests/fichiers.test.js`](tests/fichiers.test.js). Les quatre tests demandés, plus un bonus sur le lien symbolique :

```js
const racine = await realpath(fileURLToPath(new URL('../bac-a-sable', import.meta.url)));

test('refuse « ../.. » : le chemin sort du dossier autorisé', async () => {
  await assert.rejects(listerDossier(racine, '../..'), /Accès refusé/);
});

test('dossier introuvable : message clair, sans chemin absolu de la machine', async () => {
  await assert.rejects(listerDossier(racine, 'voyages/tokyo'), (erreur) => {
    assert.match(erreur.message, /introuvable/);
    assert.ok(!erreur.message.includes(racine));
    return true;
  });
});
```

Dans le projet élève, la racine est `../bac-a-sable` ; dans `correction/tests`, `../../bac-a-sable`.

**À surveiller**
- Les tests appellent `listerDossier` **directement**, sans Inspector ni MCP : c'est l'intérêt d'avoir séparé la logique métier du protocole.
- `assert.rejects` doit recevoir la **promesse**, pas le résultat d'un `await`.
- Le test du lien symbolique crée ses fichiers dans un dossier temporaire et le supprime dans un `finally` : ne jamais créer de lien dans `bac-a-sable/`, qui est versionné.

---

## Réponses attendues à la restitution

1. **Rôles** : MCP Inspector est à la fois l'hôte et le client (il n'y a pas de LLM) ; le processus `node src/server.js` est le serveur ; `bac-a-sable/` est la ressource derrière le serveur.
2. **Erreurs** : toutes reviennent comme un résultat `isError: true`, y compris un argument invalide rejeté par le schéma. Le modèle lit ce texte et peut corriger son appel. Les erreurs JSON-RPC sont réservées au protocole : méthode inconnue, version non prise en charge.
3. **Pourquoi au serveur** : le serveur s'exécute avec les droits de l'utilisateur et c'est lui qui touche le disque. Le client ne voit qu'un nom et des arguments, et il peut être trompé : un modèle qui lit une page web piégée peut demander `../..` de bonne foi. C'est le « trio dangereux » vu en cours : données privées, contenu non fiable, canal de sortie.

Point de discussion observé lors de la vérification : à l'étape 4, `../..` depuis le bac à sable liste le dossier du cours (`.git`, `node_modules`, `index.html`…). C'est concret et parlant pour les élèves.
