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

# Generates a Mermaid chart for the number of poems per year
function generate_poems_per_year_chart() {
  local COUNT CURRENT_YEAR FAVORITE_COUNT FAVORITE_PER_YEAR MAX_COUNT POEMS_PER_YEAR YEAR;

  CURRENT_YEAR="$(date +%Y)"

  for YEAR in $(seq 2007 "${CURRENT_YEAR}"); do
    COUNT="$(find poems -type f -name "${YEAR}-*.md" 2>/dev/null | wc -l | tr -d ' ')"
    POEMS_PER_YEAR+="${COUNT}, "

    FAVORITE_COUNT="$(find poems -type f -name "${YEAR}-*.md" -exec grep -l '^favorite: true' {} \; 2>/dev/null | wc -l | tr -d ' ')"
    FAVORITE_PER_YEAR+="${FAVORITE_COUNT}, "
    if [ "${COUNT}" -gt "${MAX_COUNT:-0}" ]; then
      MAX_COUNT="${COUNT}"
    fi
  done

  # Trim trailing comma and space
  POEMS_PER_YEAR="${POEMS_PER_YEAR%, }"
  FAVORITE_PER_YEAR="${FAVORITE_PER_YEAR%, }"

  echo "\`\`\`mermaid" >> README.md
  echo "xychart-beta" >> README.md
  echo "  title \"Poems per year\"" >> README.md
  echo "  x-axis \"Year\" 2007 --> ${CURRENT_YEAR}" >> README.md
  echo "  y-axis \"Poems\" 1 --> ${MAX_COUNT}" >> README.md
  echo "  bar [${POEMS_PER_YEAR}]" >> README.md
  echo "  line [${FAVORITE_PER_YEAR}]" >> README.md
  echo "\`\`\`" >> README.md
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
  generate_poems_per_year_chart
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
