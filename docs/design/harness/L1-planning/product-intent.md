---
title: "HARNESS L1企画候補"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: awaiting_parent_approval
parent_candidate: docs/governance/candidates/helix-concept-v4.1.md
created: 2026-09-14
updated: 2026-09-14
---

# HARNESS L1企画候補

本書はConcept v4.1候補と2026-09-14の製品責務決定から導いたHARNESSの対象別L1候補である。
親Conceptが未承認のため、現行L1、L2合意、L3凍結、実装指示として使わない。

## 提供価値

HARNESSは、外部利用者が企画・要求・要件・設計・実装・検証・運用評価を一貫したV-model契約として
扱える開発基盤を提供する。変更の種類や実装技術が違っても、何を満たせば次へ進めるか、何を検証し、
どの結果を利用者が受け入れるかを追跡できるようにする。

| ID | L1企画要求 | L2への導出先 |
|---|---|---|
| HARNESS-L1-001 | 利用者は、L1–L12と正規V-pairで上流の意図から運用評価までを構成できる | HARNESS-L2-001 |
| HARNESS-L1-002 | 利用者は、対象と変更に適した開発styleを選び、品質条件を落とさず進行できる | HARNESS-L2-002／003 |
| HARNESS-L1-003 | 利用者は、要求変更の影響を設計・実装・検証へ伝え、未接続とstaleを確認できる | HARNESS-L2-003／004 |
| HARNESS-L1-004 | 利用者は、対象revisionとriskに合う検証義務、反例、証拠、差戻し条件を定義できる | HARNESS-L2-004／005 |
| HARNESS-L1-005 | 外部利用者は、HELIX内部の管理機構を暗黙の依存にせず、明示された版・構成・条件でHARNESSを利用できる | HARNESS-L2-006 |

## 対象外

Worker割当、CI運転、ログ・state保存、学習、プロジェクト群の統制、artifact配布運転はHELIX-OSが所有する。
HELIX-Web等の個別製品の利用者体験もHARNESS要求へ含めない。HARNESSは必要な工程・検証契約を定め、
OSや個別製品が参照する版を持つ。

## 採択条件

Concept v4.1のexact revisionが人間承認され、本書の5要求がそのrevisionから導出されることを確認する。
旧L0-L14、旧9-mode、既存CI、旧DB／CLI／hook、旧HARNESS要求の実装済み宣言を承認根拠にしない。
採択後にL2要求、L11受入、非UI適用性またはprototypeを同じrevisionへ接続する。
