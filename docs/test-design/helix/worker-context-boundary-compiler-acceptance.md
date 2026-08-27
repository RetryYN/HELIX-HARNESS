---
title: "HELIX L10 受入テスト設計 — worker context boundary compiler CLI"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: draft
created: 2026-08-27
updated: 2026-08-27
owner: QA / Codex TL
plan: PLAN-L3-69-worker-context-boundary-compiler
pair_artifact: docs/design/helix/L3-requirements/worker-context-boundary-compiler.md
---

> 本書はL10受入設計であり、実行可能な`tests/`配下のoracleはL3 PLAN確認後のL6実装PRへ分離する。
> boundary fileとsealed packetを混同せず、CLI単体の成功だけではprovider実行を許可しない。

# HELIX L10 受入テスト設計 — worker context boundary compiler CLI

## §0 合否境界

受入は「ファイルが生成された」だけでは合格にしない。明示入力、current HEAD／authority再束縛、wrapper
共通利用、packet非永続化、秘密情報非出力、失敗時provider未起動を個別に検証する。

## §1 oracle完全一致集合

| AC ID | 対応requirement | 入力／操作 | 合格条件 | negative mutation |
|---|---|---|---|---|
| `WCTX-AC-001` | `WCTX-R-01` | 全必須fieldと正のbudgetを指定してcompileする | validなboundary v1をcanonical JSONで生成する | field欠落、空文字、unknown axis、digest不正を出力しない |
| `WCTX-AC-002` | `WCTX-R-01` | `budget.time_ms`または`token_limit`を0、負値、非整数にする | `WORKER_CONTEXT_BUDGET_UNRESOLVED`相当でfail-closeする | 無制限またはdefault budgetへ補完しない |
| `WCTX-AC-003` | `WCTX-R-02` | plan metadataと明示owner／contract／scopeを不一致にする | boundaryを生成せず不一致を報告する | planの一部だけを採用して通さない |
| `WCTX-AC-004` | `WCTX-R-03` | `.helix/worker-context/`外、絶対path、`..`、symlink経由を指定する | ファイルを書かずpath violationで拒否する | 外部pathへ書き込まない |
| `WCTX-AC-005` | `WCTX-R-03` | 同じ入力で2回compileする | 出力boundaryとdigestがbyte一致する | timestampやランダムIDをboundaryへ混ぜない |
| `WCTX-AC-006` | `WCTX-R-03` | `--dry-run`でcompileする | 内容と判定だけを返し、ファイルを作らない | dry-runがstate／packetを作らない |
| `WCTX-AC-007` | `WCTX-R-04` | authority path、旧layer、compatibility文書を入力へ混ぜる | current authority入力として拒否する | legacy greenでcurrent failureを相殺しない |
| `WCTX-AC-008` | `WCTX-R-05` | compile後にpacket fileの存在を探索する | persistent packetを作成していない | JSONをsealed capabilityとして再利用しない |
| `WCTX-AC-009` | `WCTX-R-06` | task／token／secretを入力してstdout、stderr、receiptを確認する | digestとfailure codeだけを追跡し、機密本文を出力しない | secret／PII／credentialの漏洩がない |
| `WCTX-AC-010` | `WCTX-R-07` | codex、claude、loop、pair-agent、teamの各execute経路を起動する | 同一loader／attestation／compiler経路でprovider起動前にpacketをsealする | いずれかの経路だけraw fallbackまたは独自defaultを使わない |
| `WCTX-AC-011` | `WCTX-R-07` | boundary作成後にHEAD、authority、rule、scopeを変更する | staleまたはdriftとしてproviderを起動せず拒否する | compile時のgreenを実行時の許可へ持ち越さない |
| `WCTX-AC-012` | `WCTX-R-08` | 旧`mode`／`model`／legacy layerを入力する | input-only変換または曖昧値拒否となる | current output、DB、receiptへ旧identityを再出力しない |

## §2 量閉じと実装分割

- behavior contract: `WCTXCLI-FR-001..002` exact 2件。
- supporting requirements: `WCTX-R-01..08` exact 8件。
- acceptance: `WCTX-AC-001..012` exact 12件。
- 本PRでは実行可能oracleを追加しない。L3確認後、L6実装PRが`tests/worker-context-boundary-compiler.test.ts`
  と4つの既存wrapper経路のE2E oracleを所有する。
- `worker-context-packet.v1`のin-memory capability、authority attestation、provider未起動の検証は、既存
  `tests/worker-context-packet.test.ts`等との重複を避け、追加差分だけをmutationで固定する。
