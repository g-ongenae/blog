#!/usr/bin/env bash

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

  echo "\`\`\`mermaid" >> _index.md
  echo "xychart-beta" >> _index.md
  echo "  title \"Poems per year\"" >> _index.md
  echo "  x-axis \"Year\" 2007 --> ${CURRENT_YEAR}" >> _index.md
  echo "  y-axis \"Poems\" 1 --> ${MAX_COUNT}" >> _index.md
  echo "  bar [${POEMS_PER_YEAR}]" >> _index.md
  echo "  line [${FAVORITE_PER_YEAR}]" >> _index.md
  echo "\`\`\`" >> _index.md
}

# Map of language codes to their full names and flags
declare -A LANG_MAP=(
  ["en"]="English 🇬🇧"
  ["fr"]="French 🇫🇷"
)

# Add the list of poems with statistics to the README file
function add_poem_list() {
  local POEM TITLE STATE DATE LOCATION LANG LABELS;

  echo "## 💌 Poems" >> _index.md
  echo "" >> _index.md

  # Add summary statistics to the README file
  echo "### Summary" >> _index.md
  echo "" >> _index.md
  echo "**Total:** $(find poems -maxdepth 1 -type f -name '*.md' ! -name '_index.md' | wc -l | tr -d ' ') <br>" >> _index.md
  echo "**Drafts:** $(grep '^state: draft' poems/*.md | wc -l | tr -d ' ') <br>" >> _index.md
  echo "**Favorites:** $(grep '^favorite: true' poems/*.md | wc -l | tr -d ' ') <br>" >> _index.md
  echo "**Languages:**" >> _index.md
  echo "" >> _index.md
  echo "$(
    grep -h '^lang:' poems/*.md | grep -v '_index.md:' | sort | uniq -c | \
    awk '{print $3 ":" $1 }' | \
    while read LANG; do
      echo "- ${LANG_MAP[${LANG%%:*}]}: ${LANG##*:}"
    done
  )" >> _index.md
  echo "" >> _index.md
  generate_poems_per_year_chart
  echo "" >> _index.md

  # Add the list of poems to the README file
  echo "### Poem list" >> _index.md
  echo "" >> _index.md

  # Reverse loop through all poem files and extract metadata to build the README
  # Reverse order is for the most recent poems to appear at the top of the list
  find poems -maxdepth 1 -type f -name '*.md' ! -name '_index.md' -print | sort -r | while read POEM; do
    # Extract metadata from the poem file
    TITLE=$(grep -m 1 '^title:' "${POEM}" | sed 's/^title: //')

    LABELS=(
      "$(add_draft_label "${POEM}")"
      "$(add_favorite_label "${POEM}")"
    );

    # Append the poem information to the README file
    echo "- ${TITLE}, [↗️](@/tell/poems/$(basename "${POEM}"))$(echo "${LABELS[*]}" | sed 's/[[:space:]]*$//')" >> _index.md
  done
}

# Generate a Mermaid chart for the length of each story in words
function generate_story_length_chart() {
  local MAX_LENGTH STORY_LENGTH STORY_LENGTHS STORY;

  while read STORY; do
    STORY_LENGTH=$(wc -w < "${STORY}" | tr -d ' ')
    STORY_LENGTHS+="${STORY_LENGTH}, "
    if [ "${STORY_LENGTH}" -gt "${MAX_LENGTH:-0}" ]; then
      MAX_LENGTH="${STORY_LENGTH}"
    fi
  done < <(find stories -maxdepth 1 -type f -name '*.md' ! -name '_index.md' -print | sort)

  # Trim trailing comma and space
  STORY_LENGTHS="${STORY_LENGTHS%, }"

  echo "\`\`\`mermaid" >> _index.md
  echo "xychart-beta" >> _index.md
  echo "  title \"Story lengths (in words)\"" >> _index.md
  echo "  x-axis \"Story\" 1 --> $(find stories -maxdepth 1 -type f -name '*.md' ! -name '_index.md' | wc -l | tr -d ' ')" >> _index.md
  echo "  y-axis \"Length (words)\" 1 --> ${MAX_LENGTH}" >> _index.md
  echo "  line [${STORY_LENGTHS}]" >> _index.md
  echo "\`\`\`" >> _index.md
}

# Add the list of stories with statistics to the README file
function add_story_list() {
  local STORY SUITE TITLE STATE DATE LOCATION LANG LABELS;

  echo "## 📖 Stories" >> _index.md
  echo "" >> _index.md

  # Add summary statistics to the README file
  echo "### Summary" >> _index.md
  echo "" >> _index.md
  echo "**Total:** $(find stories -maxdepth 1 -type f -name '*.md' ! -name '_index.md' | wc -l | tr -d ' ') <br>" >> _index.md
  echo "**Drafts:** $(grep '^state: draft' stories/*.md | wc -l | tr -d ' ') <br>" >> _index.md
  echo "**Favorites:** $(grep '^favorite: true' stories/*.md | wc -l | tr -d ' ') <br>" >> _index.md
  echo "**Languages:**" >> _index.md
  echo "" >> _index.md
  echo "$(
    grep -h '^lang:' stories/*.md | grep -v '_index.md:' | sort | uniq -c | \
    awk '{print $3 ":" $1 }' | \
    while read LANG; do
      echo "- ${LANG_MAP[${LANG%%:*}]}: ${LANG##*:}"
    done
  )" >> _index.md
  echo "" >> _index.md
  generate_story_length_chart
  echo "" >> _index.md

  # Add the list of stories to the README file
  echo "### Story list" >> _index.md
  echo "" >> _index.md

  # Reverse loop through all story files and extract metadata to build the README
  # Ordered alphabetically by filename, not by date
  find stories -maxdepth 1 -type f -name '*.md' ! -name '_index.md' -print | sort | while read STORY; do
    # Extract metadata from the story file
    TITLE=$(grep -m 1 '^title:' "${STORY}" | sed 's/^title: //')
    SUITE=$(grep -m 1 '^suite:' "${STORY}" | sed 's/^suite: //')

    if [ -n "${SUITE}" ] && [ "${SUITE}" != "none" ]; then
      TITLE="${SUITE}: ${TITLE}"
    fi

    LABELS=(
      "$(add_draft_label "${STORY}")"
      "$(add_favorite_label "${STORY}")"
      " ($(wc -w < "${STORY}" | tr -d ' ') words)" # Story length
    );

    # Append the story information to the README file
    echo "- ${TITLE}, [↗️](@/tell/stories/$(basename "${STORY}"))${LABELS[*]}" >> _index.md
  done
}

# Build the README file of Literature
echo "---" > _index.md
echo "title: Literature" >> _index.md
echo "---" >> _index.md
echo "" >> _index.md
echo "# 🖋️ Literature" >> _index.md
echo "" >> _index.md
add_poem_list
echo "" >> _index.md
add_story_list
echo "" >> _index.md
echo "Last updated on $(date)" >> _index.md
