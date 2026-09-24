---
title: "HELIX-Intelligenceの全体監査・限定修復の要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-25
mechanism: HELIX-Intelligence
moved_from:
  - docs/helix-os/L2-requirements/governance-requirements.md
  - docs/helix-os/L11-acceptance/governance-acceptance.md
decision_record: docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md
---

# HELIX-Intelligenceの全体監査・限定修復の要求候補

## これは何か

HELIX-OSの要求案にあった次の2つを、2026-09-25のPO判断によりここへ移した。

- 旧Bugbot候補に由来する限定修復の節。検出から修復の実行までを、まとめて移した。
- 監査・学習・成果の出所の節のうち、監査（AAFD）の部分。

移した文言は元のまま保持する。HELIX-Intelligenceにはまだ企画（L1）がないため、本書は要求（L2）ではなく候補であり、
IntelligenceのL1ができた後に要求として採否する。本書から要求の採用・承認・実装許可を生成しない。

[Concept](../../concept/helix-concept.md)では、IntelligenceはHELIXについて最も知っている部位であり、バグbot・ヘルプbot・クローラーを発行してHELIX全体の監査に寄せる。
バグbotは、CIでよく失敗する種類のログがたまり、機械で判定できるようになったものから発行する（[2026-09-25 PO指示](../../governance/decisions/brain-helix-core-po-intent-2026-09-25.md)）。

## 限定修復の条件

[旧Bugbot候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requests.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-bounded-repair-source-crosswalk.md)に従って再採否する。
移す前はHELIXOS-L2-001／002／004／005／007／009に接続していた。逸脱の検出、修復候補、意味判断、操作許可、隔離適用、検収、
停止・復旧を別状態として追跡する。対象revision、actor、write-set、副作用、予算、期限、再試行、影響範囲、復旧先、
独立検証が成立する操作だけを実行対象にし、候補・登録・旧GH-FR-011から包括的write権限を生成しない。

二重実行、session交代による予算reset、循環、stale、所有競合、未信頼実装、範囲外変更、不明な外部副作用を
成功へ補完しない。意味矛盾は上流変更候補へ戻し、要求・設計・検証義務を修復器が変更しない。
本節では旧bugbot、既存CI、旧DB／transaction、自動修復を実行しない。

## 全体監査に関する候補条件（AAFD）

出典は[AAFD](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requests.md)である。
移す前はHELIXOS-L2-005／007に接続していた。

| 出典 | 保持する具体条件 |
|---|---|
| AAFD-BR-01 | 監査提案から対象HEAD・authority・producer・証拠・再現手順・反証条件へ辿れる。自由文だけをauthorityにしない |
| AAFD-BR-02 | 内部改善と外部環境変化の出所を保持し、既存UIL／TERからFuture Synthesisへ接続する |
| AAFD-BR-03 | 確定変更で影響する将来投影・前提・指令だけを失効・再合成し、古い投影で割当・公開・廃止を判断しない |
| AAFD-BR-04 | モデル更新を同一corpus・責務scopeで比較し、所見の増減・誤検出・見逃し・再現性・費用・遅延を確認する。更新だけで適格化しない |

AAFDの提案・差分・将来指令から要求・設計・提供・割当・mergeのauthorityを直接変更しない。
既存UIL／TER／Future Synthesis等への接続であり、新しいroute、開発style、DB正本、常駐レーンを追加しない。

## L11受入候補

全件未実行である。

限定修復の条件は、新世代で採用するrevision確定後に評価する。

- 候補、登録、許可、適用、検収を別々に確認し、旧GH-FR-011、修復器登録、他修復の成功からwrite権限を生成しない。
- write-set逸脱、stale、所有競合、予算超過、循環、二重実行、不明副作用を個別に与え、停止・保全・上流返却を確認する。
- 旧bugbot、既存CI、旧DB／transaction、main read-afterを与えても、新世代限定修復の実行・受入証拠にしない。

AAFDは採用revision確定後に次を確認する。

- 監査提案からHEAD・根拠・出所・再現・反証へ辿り、内部改善と外部変化を区別できる。変更時に影響する将来投影だけが再評価される。
- 同じcorpusでモデル変更前後の所見・誤検出・見逃し・費用・遅延を比較でき、モデル更新だけでは適格にならない。

## HARNESSとの関係

HARNESSの要求案「限定修復に適用する検証条件」は、修復後に維持すべき検証義務（要求revision、oracle、expected failure、独立検証、consumer受入、差戻し条件）を定める。
本書へ移したのは修復の検出から実行までであり、修復後の検証義務はHARNESSに残す。
