---
title: "HARNESS L1企画 v1.1改訂候補"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft_candidate
authority_status: awaiting_human_approval
parent_candidate: docs/concept/helix-concept-v4.2.md
previous_approved_l1_sha256: a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04
parent_concept_sha256: b395a54c42782d93651f2a5660736b0330f013ccfd10af925c61c53ec355eebf
source_goals_sha256: cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca
created: 2026-09-14
updated: 2026-09-24
---

# HARNESS L1企画 v1.1改訂候補

承認済みv4.1親の[L1本文](product-intent.md)9件を保持し、本文承認済みの[Concept v4.2](../../concept/helix-concept-v4.2.md)から
5大目標の不足4領域だけを追加する改訂候補である。Concept v4.2はまだ現行適用前で、本書も未承認である。
既存L1、L2合意、L3凍結、実装指示として使わない。

## 提供価値

HARNESSは、外部利用者が企画・要求・要件・設計・実装・検証・運用評価を一貫したV-model契約として
扱える開発基盤を提供する。変更の種類や実装技術が違っても、何を満たせば次へ進めるか、何を検証し、
どの結果を利用者が受け入れるかを追跡できるようにする。

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
| HARNESS-L1-010 | 利用者は、承認済み上流から次の進行・停止・差戻し・再開・検証・完了を判断できる工程契約を使い、エージェントの自走が要求・承認・権限を自己生成しない条件を確認できる | 後続L2判断 |
| HARNESS-L1-011 | 利用者は、要求・domain・責務・依存・interface・state・failure・V-pair・検証・運用条件の関係を用いた全体simulationの入力、前提、revision、不確実性、反証、再検証義務を確認できる | 後続L2判断 |
| HARNESS-L1-012 | 実装詳細を操作しない利用者も、目的、進行条件、品質、未決、risk、必要な判断を理解しながら製品を作れる開発契約を使える | 後続L2判断 |
| HARNESS-L1-013 | 利用者は、作業分類と必要能力、検証義務、低コストWorkerの適用範囲、上位能力へのescalation条件を定義できる | 後続L2判断 |

上表は接続予定である。L2側にも親L1 IDと親revisionを記載して初めて導出関係が成立する。
追加4件は[5大目標](../../concept/helix-five-goals.md)のG1・G3・G4・G5と
[L1被覆監査](../../governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md)の未被覆意味に対応する候補である。
既存9件を再計上せず、L2 ID・受入条件・実装方式は本改訂で確定しない。

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

Worker割当、CI運転、ログ・state保存、学習、プロジェクト群の統制、artifact配布運転はHELIX-OSが所有する。
HELIX-Web等の個別製品の利用者体験もHARNESS要求へ含めない。HARNESSは必要な工程・検証契約を定め、
OSや個別製品が参照する版を持つ。

## 採択条件

Concept v4.2のexact本文承認を入力とし、本書13件のうち既存9件の意味保持と追加4件の製品責務を
人間がこの本文revisionで別途承認する。Concept v4.2の現行適用は別のcanonicalization記録まで保留する。
旧L0-L14、旧9-mode、既存CI、旧DB／CLI／hook、旧HARNESS要求の実装済み宣言を承認根拠にしない。
採択後にL2要求、L11受入、非UI適用性またはprototype、L12運用評価を同じrevisionへ接続する。
