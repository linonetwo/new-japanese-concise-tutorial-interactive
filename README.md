# An interactive note for New Japanese Concise Tutorial

[Online Demo](https://new-japanese-concise-tutorial-interactive-ffozkkoxia.now.sh)

This project demonstrates basic usage of SoLiD POD (Linked Data Platform) and plugin architecture of SlateJS.

## SoLiD POD

In `src/store/texts.ts`, it uses `comunicaEngine` to load file list on a POD with `GraphQL`.

Texts was uploaded to [solid.authing.cn](https://new-japanese-concise-tutorial.solid.authing.cn/public/textbook/).

## SlateJS

`slate-mark-parsed` is a plugin that use provided parser (in this demo, [nlcst-parse-japanese](https://github.com/azu/nlp-pattern-match/blob/master/packages/nlcst-parse-japanese/README.md)) to get Natural Language Concrete Syntax Tree, and generate Slate Marks on the document.

`slate-mark-intellisense` consumes Slate Marks on a document, and provide Intellisense style tooltip.
