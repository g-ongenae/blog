---
date: 2026-10-31
title: Je crois que je tourne au vinaigre.
extra:
  lang: fr
  link: https://www.linkedin.com/feed/update/urn:li:activity:7522084955196145664/
  ai-assisted: true
---

Je crois que je tourne au vinaigre.

En 2022, j'ai publié un petit plugin pour Insomnia.
Celui-ci permet de rajouter des commentaires dans les JSON des requêtes API.
C'est très utile pour itérer rapidement.

Je l'ai créé parce que l'équipe d'Insomnia n'a pas l'air décidée à rajouter cette fonctionnalité.
Il y a plusieurs issues sur leur dépôt Git qui demandent cette fonctionnalité depuis le début du projet. Sans réponse.

Pas grave, je me suis dit à l'époque, ils permettent d'avoir des plugins. Je vais en créer un.
Et c'est ce que j'ai fait. Une solution simple qui fonctionne en très peu de lignes de code.

J'en étais assez fier et donc je l'ai publié sur npm pour pouvoir l'installer facilement et le partager avec mes collègues. Et puis au monde entier.

Il faut dire que c'est plutôt une réussite. Plus de 1200 downloads depuis sa création, téléchargement stable, environ une vingtaine par semaine. Et zéro ticket, zéro bug depuis sa création.

Hier je me repenche dessus et le donne à Claude pour faire un petit audit.
Ça m'a permis de corriger pas mal de choses, d'améliorer grandement les performances. Et de rajouter une petite fonctionnalité très importante à laquelle je n'avais pas pensé à l'époque.

Mais en faisant ça, je me suis aussi rendu compte qu'il y avait deux autres projets qui ont été créés depuis qui font la même chose que le mien.

Le premier est littéralement une copie de mon code…
Mais sans mention.
J'ai créé une issue sur son dépôt Git. (MIT = Mention IT)

Et le second, propre, une nouvelle implémentation avec la petite fonctionnalité qui m'avait échappé (mais les mêmes défauts).
Et surtout, un meilleur branding que le mien.

En 2022, j'ai fait une erreur : le nommage de mon plugin.

Un technique (et court) :

> insomnia-plugin-jsonc

Au lieu du plus simple (pris par le copieur 🫠) :

> insomnia-plugin-json-comments

Finalement, j'ai publié une nouvelle version juste pour avoir un meilleur branding.
Tellement aigri que j'ai mis dedans "The Original." (Ce qui est vrai 🤷‍♂️)

Cependant, j'en suis moins fier que de la première version.
Une version mal nommée, imparfaite, mais qui avait du charme par sa simplicité.

---

https://github.com/g-ongenae/insomnia-plugin-jsonc