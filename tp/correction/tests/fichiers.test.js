import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listerDossier } from '../src/fichiers.js';

const racine = await realpath(fileURLToPath(new URL('../../bac-a-sable', import.meta.url)));

test('liste le dossier racine : voyages (dossier) et notes.md (fichier)', async () => {
  // given / when
  const entrees = await listerDossier(racine, '.');
  // then
  assert.deepEqual(entrees, [
    { nom: 'voyages', type: 'dossier' },
    { nom: 'notes.md', type: 'fichier' }
  ]);
});

test('refuse « ../.. » : le chemin sort du dossier autorisé', async () => {
  // given / when / then
  await assert.rejects(listerDossier(racine, '../..'), /Accès refusé/);
});

test('refuse un chemin absolu hors de la racine', async () => {
  // given
  const racineDuDisque = parse(racine).root;
  // when / then
  await assert.rejects(listerDossier(racine, racineDuDisque), /Accès refusé/);
});

test('dossier introuvable : message clair, sans chemin absolu de la machine', async () => {
  // given / when / then
  await assert.rejects(listerDossier(racine, 'voyages/tokyo'), (erreur) => {
    assert.match(erreur.message, /introuvable/);
    assert.ok(!erreur.message.includes(racine));
    return true;
  });
});

test('bonus : refuse un lien symbolique qui pointe hors de la racine', async () => {
  // given : une racine temporaire contenant un lien vers la racine du disque
  const racineTemporaire = await realpath(await mkdtemp(join(tmpdir(), 'tp-mcp-')));
  await symlink(parse(racineTemporaire).root, join(racineTemporaire, 'raccourci'), 'junction');
  try {
    // when / then
    await assert.rejects(listerDossier(racineTemporaire, 'raccourci'), /Accès refusé/);
  } finally {
    await rm(racineTemporaire, { recursive: true, force: true });
  }
});
