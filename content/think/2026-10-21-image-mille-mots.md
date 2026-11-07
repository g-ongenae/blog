---
date: 2026-10-21
title: Une image vaut mille mots.
extra:
  lang: fr
  link: https://lnkd.in/p/evywpHPX
  ai-assisted: true
---

Une image vaut mille mots.

J'ai toujours cru en cet adage.
Et c'est pourquoi quand j'ai découvert MermaidJS, j'en suis tombé amoureux tout de suite.

Un graphe qu'on peut écrire en quelques lignes de code et donc modifier facilement a été pour moi salvateur.

- Une nouvelle route -> Un diagramme de séquence dans la description de la PR
- Un découpage d'un service en plusieurs classes -> Un diagramme de classe
- Un enum pour décrire un état -> Un diagramme de flow dans le JSDoc

Je n'ai même pas besoin de lire une seule ligne de la PR, que j'ai déjà une bonne idée de ce qu'elle devrait contenir.

Et aujourd'hui, à l'heure des PRs auto-générées avec 2000+ lignes de code, voir n'a jamais été aussi utile.

C'est pourquoi j'ai créé deux outils pour m'aider à mieux voir :

- mermaid-jsdoc-viewer pour VSCode
- mermaid-jsdoc-viewer-for-github pour GitHub

Leur rôle :
- détecter les graphes mermaid
- afficher les graphes dans une webview/widget
- rediriger vers mermaid live editor (pour éditer si besoin)
- voir les changements d'un graphe (PR ou commit)

Et ça marche dans VSCode et dans GitHub
Lien des repos github en commentaire
(parce que publier est aujourd'hui plus long que créer, j'en reparlerai une autre fois)

#mermaidjs #jsdoc #vscode #github #web-extension