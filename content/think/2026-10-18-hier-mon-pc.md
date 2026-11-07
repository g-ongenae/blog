---
date: 2026-10-16
title: Hier, mon PC a crashé…
extra:
  lang: fr
  link: https://lnkd.in/p/eSkUXiF6
  ai-assisted: true
---

Hier, mon PC a crashé…

Ce ne m'était pas arrivé depuis longtemps.
Surtout que j'ai un MacBookPro M4.

Bon, il faut dire que j'avais lancé 9 sessions claude en même temps.
Deux d'entre elles lançaient des tests avec bases de données mockées en mode docker.
Ça tape vite sur la RAM et le CPU tout ça.

Donc, je me suis dit : « eh mince, va falloir que je limite »

Et en plus, ça me faisait ramer mon navigateur (Firefox).

Attendez, vous n'y êtes pas. Le problème, c'est en réalité mon navigateur (et aussi l'accumulation, certes).

Dès que j'ouvre LinkedIn, hop 1.2GB la page.
Notion, je ne compte plus.
Et le pire ? C'est les PRs avec 50 commentaires de Copilot.

Mon Firefox avait 3 tabs à 5GB, 3.5GB et 2.5GB de mémoire.

On fait le compte, il ne reste plus grand-chose des 16Go que ma machine supporte.

Bon, ce n'était ni une ni deux, je me suis dit, une petite extension qui me prévient, ça doit être faisable ça ?

Pas exactement, Firefox bloque l'accès au Process, en revanche, une autoconfig marche.

Maintenant, j'ai une barre qui s'affiche dès qu'une page prend plus de 1GB de mémoire.

Et, je peux :

- fermer l'onglet
- décharger l'onglet
- ignorer l'alerte pendant 10 minutes

Si vous voulez l'autoconfig, elle est sur mon GitHub : `firefox-memory-guard`

Bon, je retourne m'occuper de mes 9 claudes.