---
date: 2026-10-12
title: Relisez-vous encore le code que vous générez ?
extra:
  lang: fr
  link: https://www.linkedin.com/feed/update/urn:li:activity:7515402839800561664/
  ai-assisted: true
---

« Relisez-vous encore le code que vous générez ? »

Cette question, on n'arrête pas de la voir partout sur LinkedIn en ce moment.
Elle est parfois tournée à l'affirmative : « J'ai arrêté de relire le code généré par Claude »

Mais l'idée reste là : les développeurs ne lisent plus le code qu'ils génèrent. Ils sont devenus des "architectes IA" qui monitorent des agents.

Pour ma part, effectivement, il y a du code que je génère et que je ne relis pas. Je pense à toutes ces petites applications, ces petits scripts sans impact majeur, ces petites expériences que je veux juste tenter, sans me préoccuper de tous les détails techniques de leur fonctionnement.

Je pense notamment aux extensions que j'ai créées :
- PR Review Collector
- Mermaid JSDoc Viewer for VSCode
- Mermaid JSDoc Viewer for GitHub

Pour celles-ci, le simple fait de les lancer dans mon navigateur ou dans mon éditeur de code me suffit pour savoir si la fonctionnalité développée est celle attendue. Regarder le code se résumerait presque à de la simple curiosité, sans grande importance.

En revanche, toutes les pull requests qui modifient des services en production de notre infra auront droit à un regard attentif de ma part.

Cependant, ce regard attentif dans les pull requests, s'il se limite aux pull requests, est déjà une réduction de la relecture à laquelle je m'astreignais.

Avant l'arrivée de Claude Code dans mon processus de développement, je profitais de chaque instant libre de tout développement fonctionnel pour relire le code des services et modifier là où je voyais des imprécisions, de la complexité inutile ou autre manque de lisibilité et de documentation.

Ce temps de relecture me permettait aussi de remplir le backlog technique et de solidifier ma compréhension des services en production.

Avec la vitesse infernale de l'IA, il devient de plus en plus difficile de prendre ce temps de relecture. Le nombre de lignes de code produites devient supérieur à la quantité que je peux relire par jour.

Ma solution :
1. utiliser des outils automatiques de visualisation (p.ex. Mermaid JSDoc Viewer)
2. explorer avec un agent
3. faire ou lancer des tests manuels

Pourtant, j'ai toujours ce petit hoquet. Ce désir de relire le code des services qui tournent en production pour, à la fois, avoir une meilleure compréhension et aussi bidouiller les lignes de code, comme on joue avec des LEGOs pour en arriver à une forme plus élégante.
