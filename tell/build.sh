#!/usr/local/Cellar/bash/5.3.9/bin/bash

# This script requires bash 4.0 or higher for associative arrays

# Add a draft state indicator
function add_draft_label() {
  local STATE;

  STATE=$(grep -m 1 '^state:' "${1}" | sed 's/^state: //')

  if [ "${STATE}" == "draft" ] ; then
    echo " ✂︎"
  fi
}

# Add a favorite state indicator
function add_favorite_label() {
  local FAVORITE;

  FAVORITE=$(grep -m 1 '^favorite:' "${1}" | sed 's/^favorite: //')

  if [ "${FAVORITE}" == "true" ] ; then
    echo " ⭐"
  fi
}

# Map of language codes to their full names and flags
declare -A LANG_MAP=(
  ["en"]="English 🇬🇧"
  ["fr"]="French 🇫🇷"
)

# Add the list of poems with statistics to the README file
function add_poem_list() {
  local POEM TITLE STATE DATE LOCATION LANG;

  echo "## 💌 Poems" >> README.md
  echo "" >> README.md

  # Add summary statistics to the README file
  echo "### Summary" >> README.md
  echo "" >> README.md
  echo "**Total:** $(ls poems/*.md | wc -l | tr -d ' ') <br>" >> README.md
  echo "**Drafts:** $(grep '^state: draft' poems/*.md | wc -l | tr -d ' ') <br>" >> README.md
  echo "**Favorites:** $(grep '^favorite: true' poems/*.md | wc -l | tr -d ' ') <br>" >> README.md
  echo "**Languages:**" >> README.md
  echo "" >> README.md
  echo "$(
    grep -h '^lang:' poems/*.md | sort | uniq -c | \
    awk '{print $3 ":" $1 }' | \
    while read LANG; do
      echo "- ${LANG_MAP[${LANG%%:*}]}: ${LANG##*:}"
    done
  )" >> README.md
  echo "" >> README.md

  # Add the list of poems to the README file
  echo "### Poem list" >> README.md
  echo "" >> README.md

  # Reverse loop through all poem files and extract metadata to build the README
  ls poems/*.md | tac | while read POEM; do
    # Extract metadata from the poem file
    TITLE=$(grep -m 1 '^title:' "${POEM}" | sed 's/^title: //')

    # Append the poem information to the README file
    echo "- ${TITLE}, [↗️](./poems/$(basename "${POEM}"))$(add_draft_label "${POEM}")$(add_favorite_label "${POEM}")" >> README.md
  done
}

# Build the README file of Literature
echo "# 🖋️ Literature" > README.md
echo "" >> README.md
add_poem_list
