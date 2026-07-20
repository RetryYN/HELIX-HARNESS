---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
legacy_physical_layer: L3
l3_progression_marker: HELIX:L3-PROGRESSION-AUTHORITY:v1
l3_progression_authority: docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
title: "provider横断モデルworker共通契約 — 委譲面/sandbox/receipt/blind benchmark"
layer: L3
kind: add-design
status: draft
created: 2026-07-21
updated: 2026-07-21
owner: TL / PO承認必須
plan: PLAN-L3-18-worker-contract-benchmark-promotion
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_requirements:
  - docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
pair_artifact: docs/test-design/helix/worker-common-contract-acceptance.md
next_pair_freeze: L10
---

# provider横断モデルworker共通契約 — 委譲面/sandbox/receipt/blind benchmark

## §0 位置づけと被覆差分

本書は `HR-FR-HIL-22`（blind benchmarkによるworker/model/effort比較と用途別admit/retire）を
requirements v1.3 §4.10へ昇格するためのL3設計入力である。§4.10は外部AI workerの境界（versioned
descriptor／隔離worktree／secret task deny／non-authoritative output／schema・digest検証）を
`HR-FR-P2-05..08`として定めるが、複数provider（Claude／Codex／Kimi／将来のGrok）を**同一の委譲面・
sandbox・receipt・blind benchmarkで比較する契約**としては書かれていない。以下は被覆差分表である。

| 観点 | `HR-FR-HIL-22`（L3設計文書） | v1.3 §4.10（要件定義書本文） | 差分 |
|---|---|---|---|
| 委譲面の共通化 | 記述なし（bench対象のI/Oは前提のみ） | `HR-FR-P2-06`: delegationはtyped eventで交換、Node control planeが決定 | provider間で委譲面（CLI wrapper経路）が同一であることは未規定 |
| sandbox境界 | 記述なし | `HR-FR-P2-05`: 隔離worktree／secret task deny | provider横断で同一sandbox契約を適用する規定が無い |
| receipt検証 | 「選択receipt」のみ言及、schema規定なし | `HR-FR-P2-08`: strict schema／digest検証 | receiptに`worker_model`／`reviewer_model`を記録する規定が無い |
| blind benchmark | fixed fixture/rubric/task/risk、blind score、実効cost、選択receipt（`HAC-HIL-22a/b/c`） | 記述なし | v1.3本文にblind benchmarkによるadmit/retire要件が存在しない（本PLANの主目的） |
| 重大failure非相殺 | `HAC-HIL-22b` | 記述なし | v1.3本文に未昇格 |
| provider instance化 | 記述なし | 記述なし | Claude/Codex/Kimi/Grokを「同一契約のinstance」と位置づける規定がどちらにも無い |

被覆差分の結論: `HR-FR-HIL-22`はbenchmark実行契約を定義済みだが、**provider非依存の委譲面/sandbox/
receiptの共通契約**としての明文化と、v1.3本文への昇格が未了である。本書§1で契約4面をFR化し、
`docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md` Step 4でv1.3 §4.10へ反映する。

## §1 provider非依存の契約4面（FR）

worker共通契約（worker common contract）は、Claude／Codex／Kimi／将来のGrokを**同一契約の
instance**として扱うための最小共通面である。個別providerの実装詳細（CLI引数、runtime内部）は
L4以降で確定し、本書はsystem observable behaviorだけを定める。

| FR ID | 契約面 | 要件 | HIL-22 trace | 事前条件 → 事後条件 | failure |
|---|---|---|---|---|---|
| `WCC-FR-01` | 委譲面 | 全workerはversioned descriptor（`agent_id`/`contract_version`/`capability_class`）を持ち、providerごとに別形式のI/Oを許さない | `HR-FR-HIL-22`（比較対象の同一性前提）、`HR-FR-P2-06` | descriptor登録済み → 全provider呼び出しが同一typed event形へ収束 | provider固有I/Oの素通し、descriptor欠落 |
| `WCC-FR-02` | 委譲面 | 全workerは同一CLI wrapper経路（`helix codex` / `helix claude` 相当のHARNESS所有entrypoint）からのみ起動し、raw provider CLIの直接呼び出しを比較対象にしない | `HR-FR-HIL-22`（bench対象の再現可能性） | wrapper経路のみ許可 → raw呼び出しはbench非対象として拒否 | raw CLI経由の結果をbenchmark scorecardへ混入 |
| `WCC-FR-03` | sandbox | 全workerは隔離worktree内でのみ実行し、repository本体・harness DB・`.helix/`・credentialへ到達しない | `HR-FR-P2-05` | 隔離worktree払い出し済み → 実行cwdがscratch fixtureに限定 | 本体repository/DB/credentialへの到達 |
| `WCC-FR-04` | sandbox | 全workerはnetwork default denyかつsecretを含むtaskをdenyされ、allowlist外egressとscope外diffはfail-close | `HR-FR-P2-05`、`HR-FR-HIL-23`（sandbox契約の既存正本） | sandbox policy適用済み → 許可path/host以外への到達0 | allowlist外egress、scope外diff、機密委譲 |
| `WCC-FR-05` | receipt | worker出力はstrict schema／digest検証を既定とし、緩和には対象・理由・期限・再検証receiptを要求する | `HR-FR-P2-08` | schema/digest policyあり → 不合格出力はcommit対象外 | schema違反出力のNode write、期限なし緩和 |
| `WCC-FR-06` | receipt | 全receiptは`worker_model`（提示provider/model family）と`reviewer_model`（独立検証者のprovider/model family）を記録し、両者は独立でなければならない | `HR-FR-HIL-22`（scorecard比較の前提）、`HR-FR-HIL-08`（`SeparationDecisionV1`） | worker/reviewer独立性ポリシーあり → receiptに双方のmodel familyを記録 | worker=reviewerの自己検証、model family欠落 |
| `WCC-FR-07` | blind benchmark | 候補worker/model/effortは固定fixture・固定rubric・固定task・risk別のblind score（`BlindPacketV1`相当、author claim/private context 0）で比較する | `HR-FR-HIL-22`、`HAC-HIL-22a` | fixed fixture/rubric/task/riskあり → blind score、実効cost、選択receipt | smoke-only採用、author claimの packet混入 |
| `WCC-FR-08` | blind benchmark | 重大failure（scope逸脱、secret漏洩、schema違反）は平均点で相殺せず単独failureとして記録し、用途別（用途A可／用途B不可等）にadmit・retireを決定する | `HR-FR-HIL-22`、`HAC-HIL-22b`、`HAC-HIL-22c` | risk別scorecardあり → 重大failureが平均へ埋没しない | 重大failureの平均相殺、根拠なしeffort固定 |

## §2 provider対応表（同一契約instance化）

| provider | 委譲面（`WCC-FR-01/02`） | 現状ステータス | 根拠 |
|---|---|---|---|
| Claude | `helix claude --role <role> --task "..."` | 実装済み、既存正本 | `CLAUDE.md`「正規コマンド」、`.claude/CLAUDE.md`「Runtimeと委譲」 |
| Codex | `helix codex --role <role> --task "..."` | 実装済み、既存正本 | `CLAUDE.md`「正規コマンド」 |
| Kimi | Kimi Code CLI経由（`kimi -p <prompt> --output-format text\|stream-json`が正、raw API接続ではない） | **S2完了・S4未了の仮説**。smoke 4/4 pass、機械判定のみ | `PLAN-DISCOVERY-13-kimi-worker-cli-poc`（issue #51）。`helix kimi`委譲面・sandbox templateはS4 admit後のForward範囲 |
| Grok | grok-build相当のworktree allocation/recovery/conflict処理をbehavior atomとして採取（直接import禁止） | **S0仮説、behavior atom採取段階**。委譲面は未確定 | `PLAN-DISCOVERY-12-grok-build-worktree-precedent` |

Kimi/GrokのDiscovery成果（S2 PoC知見、behavior atom）は本書の契約設計の**入力**として引用するが、
S4 decideを経ない限り正本claim（「採用済み」「動作確認済み」）へ昇格しない。§3のACでこれを明示する。

## §3 受入条件（falsifiable AC、HIL-22 trace明記）

| AC ID | 対応FR | 正常系 | 異常系 | HIL-22 trace |
|---|---|---|---|---|
| `WCC-AC-01` | `WCC-FR-01/02` | 全provider呼び出しが同一versioned descriptor＋wrapper経路を経由する | raw CLI直接呼び出しの結果がbenchmark scorecardへ混入した場合は拒否する | `HR-FR-HIL-22`前提（比較対象の同一性） |
| `WCC-AC-02` | `WCC-FR-03/04` | worker実行が隔離worktree内に閉じ、network/secret denyが有効である | 本体repository到達、allowlist外egress、scope外diffを検出した場合はfail-closeする | `HR-FR-P2-05`、`HR-FR-HIL-23` |
| `WCC-AC-03` | `WCC-FR-05/06` | 全receiptがschema/digest検証を通過し、`worker_model`/`reviewer_model`が独立記録される | schema違反出力のcommit、worker=reviewerの自己検証を検出した場合は拒否する | `HR-FR-P2-08`、`HR-FR-HIL-08` |
| `WCC-AC-04` | `WCC-FR-07` | blind benchmarkがfixed fixture/rubric/taskでauthor claim 0のblind scoreを生成する | smoke-onlyの結果をfull admission根拠にした場合は拒否する | `HR-FR-HIL-22`、`HAC-HIL-22a` |
| `WCC-AC-05` | `WCC-FR-08` | 重大failureが用途別admit/retire決定で単独failureとして扱われる | 重大failureを平均点で相殺した場合、または根拠なしにeffortを固定した場合は拒否する | `HR-FR-HIL-22`、`HAC-HIL-22b`、`HAC-HIL-22c` |
| `WCC-AC-06` | §2 provider対応表 | Kimi/GrokのDiscovery（S2）成果は「入力・仮説」として引用されるに留まる | Discovery成果をS4 decide前に正本claim（採用済み/admit済み）として扱った場合は拒否する | `PLAN-DISCOVERY-12`/`PLAN-DISCOVERY-13`のS4 routing境界 |

受入テスト設計は `docs/test-design/helix/worker-common-contract-acceptance.md` を参照する
（`next_pair_freeze: L10`）。

## §4 用語

- **worker共通契約（worker common contract）**: 委譲面・sandbox・receipt・blind benchmarkの
  provider非依存4面契約。`HR-FR-HIL-22`由来語のv1.3昇格。
- **blind benchmark**: author claim・private context 0のblind packetでworker/model/effortを比較する
  評価方式（`BlindPacketV1`準拠）。

design doc確定時にL0 glossaryへ両語を登録する（`PLAN-L3-18-worker-contract-benchmark-promotion.md`
§6用語更新）。
