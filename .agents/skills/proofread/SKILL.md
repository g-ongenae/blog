---
name: proofread
description: Use when the user wants to proofread a text.
---

# Proofread

Spelling and grammar pass over the author's texts in `content/` (`tell/poems`,
`tell/stories`, `think`, `code`). Texts are mostly French, some English. The goal is
correct text in the author's own voice, never a rewrite.

Read [deliberate-choices.md](deliberate-choices.md) first. Nothing listed there
may be changed or flagged.

## 1. Correct

Fix directly only what is unambiguous:

- spelling, accents, conjugation, agreement, homophones (a/à, ces/ses, -é/-er, -ai/-ais);
- missing or doubled words that make a sentence ungrammatical;
- typos in `title:` (no other front-matter key).

Never change wording, register, imagery, rhymes, meter, line breaks, `<br>`,
stanza layout, slang or oral forms in dialogue, wordplay, LinkedIn Unicode
bold/italic, links or facts.

Flag instead of fixing when:

- the fix changes the sound, the rhyme or the syllable count of a verse;
- it could be wordplay, a regional word or poetic licence;
- it is an English idiom or preposition choice;
- the meaning is unclear, or depends on who or what is meant;
- it needs rewording;
- it is a factual point.

Before fixing a conjugation, check which verb is meant (« jouierais » is *jouir*).

Preserve whitespace exactly. The author puts non-breaking spaces (U+00A0 /
U+202F) before `? ! : ; »` and after `«`: never add or remove them.

For a large batch, split the files across parallel subagents by filename range,
one file per agent at most, and give each one these rules. Afterwards, check that:

- the non-breaking space count per file is unchanged;
- only `title:` changed in front matter;
- nothing outside `content/` changed.

Spot-check the context-dependent fixes.

## 2. Write the review file

Write `PROOFREADING.md` at the repo root. Zola doesn't publish it; never commit it.

- Header: how to use it, and the tags `sound`, `rhyme`, `intentional?`, `unclear`, `ambiguous`, `rewording`, `grammar`, `word`, `fact`.
- One section per area (Poems, Stories, *L'Ascension du Ciel*, LinkedIn posts). Each item:

  ```markdown
  ### 12. [file.md:14](content/tell/poems/file.md#L14) · `sound`

  > quote of the line with the **problem fragment** in bold

  **Suggestion:** « fix » — why.

  - [ ] Apply
  - Note:
  ```

- A last section, "Corrections already applied that you may want to check". It lists the judgement calls made in step 1 (names, changed words, English) with a `- [ ] Revert` box.

Locate lines by searching each fragment with a script, so the links are exact.
Try both `'` and `’`.

## 3. Apply the review

The author may review part of the file and mark where they stopped. Process
only the reviewed part.

- `[x] Apply`: apply the suggestion.
- A note with a fix: apply the note, even when the box is unticked. The note wins over the suggestion.
- A note that only restates the current text: keep it as is.
- A note asking for a related change (« also the verb above »): make it.
- A question in a note: answer it in the reply, and don't edit.
- An ambiguous note: keep it at the top of `PROOFREADING.md` as an open question and ask.

Then:

- Remove processed items from `PROOFREADING.md`. Keep the unreviewed ones and the open questions.
- Add every choice the author confirmed as deliberate to `deliberate-choices.md`.
- Delete `PROOFREADING.md` once everything is processed.

## 4. Renames and checks

- Fix filename typos with `git mv`. Don't add `aliases` unless the page is already published.
- Regenerate the index with `make generate`. It needs PyYAML; use a venv if it isn't installed.
- Validate with a Zola 0.19.1 build, `python3 scripts/check-tree.py` and `node scripts/test-router.mjs`.
- Don't commit unless asked.
