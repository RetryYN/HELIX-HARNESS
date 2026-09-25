---
title: "HARNESS L1企画候補"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: draft_candidate
parent_concept: docs/concept/helix-concept.md
created: 2026-09-14
updated: 2026-09-15
---

# HARNESS L1企画候補

本書の親は[HELIX Concept](../../concept/helix-concept.md)である。2026-09-17のdecisionは旧本文のexact SHAに限る。2026-09-24のPO判断（[decision record](../../governance/decisions/concept-requirement-po-decisions-2026-09-24.md)）で、本文SHA `ece3e268…4e96`の内容を採用し、1.0土台の追記を指示された。追記後の本文はPO最適ドラフトPRで対象revisionを確認する。L2合意、L3承認、実装・実行権限は本書から生成しない。

Conceptのサービス①〜⑦は各単独で成立・利用・リリースできる単位であり、入口・枠・部品・コアはそれらを支える。下表の従来L1 IDはサービス別に分割済みという意味ではない。個別サービスと接続の受入差分は要求対応表へ送る。

## 提供価値

HARNESSは、外部利用者が企画・要求・要件・設計・実装・検証・運用評価を一貫したV-model契約として
扱える開発基盤を提供する。変更の種類や実装技術が違っても、何を満たせば次へ進めるか、何を検証し、
どの結果を利用者が受け入れるかを追跡できるようにする。

1.0で、Conceptの1.0土台7項目（ログと証拠、データの利用区分、計測、接続契約と版、隔離の単位、構成版の固定と切戻し、後から加わる機構の受け口）を入れる。HARNESSの工程・検証契約は、この土台が全機構で共通に成り立つことを前提にする。

| ID | L1企画要求 | L2接続予定 |
|---|---|---|
| HARNESS-L1-001 | 利用者は、L1–L12と正規V-pairで上流の意図から運用評価までを構成できる | HARNESS-L2-001 |
| HARNESS-L1-002 | 利用者は、対象と変更に適した開発styleを選び、品質条件を落とさず進行できる | HARNESS-L2-002／003 |
| HARNESS-L1-003 | 利用者は、要求変更の影響を設計・実装・検証へ伝え、未接続とstaleを確認できる | HARNESS-L2-003／004 |
| HARNESS-L1-004 | 利用者は、対象revisionとriskに合う検証義務、反例、証拠、差戻し条件を定義できる | HARNESS-L2-004／005 |
| HARNESS-L1-005 | 外部利用者は、HELIX内部の管理機構を暗黙の依存にせず、明示された版・構成・条件でHARNESSを利用できる | HARNESS-L2-006 |
| HARNESS-L1-006 | 利用者は、要求形成、prototype／非UI適用性、合意、freeze、差戻し、再開、完了を別条件として確認できる | HARNESS-L2-003／004 |
| HARNESS-L1-007 | 依存製品の展開判断者は、複数プロダクトの開発検証とHELIX自身への適用を含む、HELIX-HARNESS製品群Version 1の完成範囲と成立証拠を確認できる | HARNESS-L2-007 |
| HARNESS-L1-008 | 利用者は、指示と根拠から要求候補を形成し、欠落・矛盾・過剰解釈・変更影響を確認して、合意した要求へ収束できる | HARNESS-L2-008 |
| HARNESS-L1-009 | 利用者は、要求の種類と構成に合う設計templateを参照して必要な設計義務を導き、設計に必要な要求入力の不足を上流へ戻せる | HARNESS-L2-009 |

上表は接続予定である。L2側にも親L1 IDと親revisionを記載して初めて導出関係が成立する。

## L0 charterからの投影

| L0柱 | 本L1での帰属 |
|---|---|
| P0／P1 | HARNESS-L1-002／006の工程選択・進行条件 |
| P2 | HARNESS-L1-004の役割分離・検証条件。Worker運転はOS |
| P3 | HARNESS-L1-001／003／004のV-pair・trace・verification |
| P4 | HARNESS-L1-003の要求への差戻し。学習運転はOS |
| P5 | 独立柱が存在しないため推測で追加しない |
| P6 | HARNESS-L1-005の外部提供条件。配布運転はOS |
| P7 | HARNESS-L1-003／004の参照・証拠条件。memory運転はOS |
| P8 | HARNESS-L1-004の根拠・安全検証。外部tool実行はOS |
| P9 | HARNESS-L1-001／003のtrace・変更影響 |

## 対象外

Worker割当とticket発行、CI・testの最適化と運転、ログ・stateの管理、プロジェクト群の統制、artifact配布運転はHELIX-OSが所有する。計測・改善効果と退行の独立評価はHELIX-LABO、知識・モデルの改善は3.0で加わるHELIX-INTELLIGENCEが担う。
HELIX-Web等の個別製品の利用者体験もHARNESS要求へ含めない。HARNESSは必要な工程・検証契約を定め、
OSや個別製品が参照する版を持つ。

## 採択条件

本書の旧承認revisionと現行Conceptの差分を照合し、本書の9要求の変更候補を対象revision付きで判断する。
旧L0-L14、旧9-mode、既存CI、旧DB／CLI／hook、旧HARNESS要求の実装済み宣言を承認根拠にしない。
採択後にL2要求、L11受入、非UI適用性またはprototype、L12運用評価を同じrevisionへ接続する。
