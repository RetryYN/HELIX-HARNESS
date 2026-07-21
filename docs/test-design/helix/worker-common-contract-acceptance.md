---
title: "HELIX L3 受入テスト設計 — worker共通契約（委譲面/sandbox/receipt/blind benchmark）"
layer: L3
executed_at_layer: L10
canonical_layer_scheme: L1-L12
artifact_type: test_design
status: draft
created: 2026-07-21
updated: 2026-07-21
owner: QA / TL / PO承認必須
plan: PLAN-L3-18-worker-contract-benchmark-promotion
pair_artifact: docs/design/helix/L3-requirements/worker-common-contract.md
next_pair_freeze: L10
---

# HELIX L3 受入テスト設計 — worker共通契約（委譲面/sandbox/receipt/blind benchmark）

## §0 共通合否契約

各HATは対応するACとoracleを全て実行し、正常系だけでなくnegative mutationが期待failure codeで
拒否された場合だけpassする。command、exit code、output digest、artifact/DB query digest、
worker/reviewer分離を必須とする。smoke greenやdoctor greenだけでcanonical合格としない
（`docs/design/helix/L3-requirements/worker-common-contract.md` §3 `WCC-AC-04`と同一規律）。

## §1 oracle表

| HAT ID | 対応 FR/AC | oracle | 必須evidence | negative / 拒否条件 |
|---|---|---|---|---|
| `HAT-WCC-01` | `WCC-FR-07`, `WCC-AC-04` | **smoke-only採用拒否**: 固定3件程度のsmoke fixture結果だけではfull admissionを許可しない。full admissionにはblind judge・実task scorecardの結果が必須である | smoke判定digest、full bench判定digest（存在しない場合はadmission decision自体を拒否） | smoke判定のみでadmission decisionを生成した場合はfailとする（`PLAN-DISCOVERY-13`のS2完了/S4未了状態をfull admissionの根拠に使わないことを含む） |
| `HAT-WCC-02` | `WCC-FR-07`, `WCC-AC-04` | **blind packetへのauthor claim混入0**: `BlindPacketV1`相当のpacketに`author_claim_count`超過、reasoning/chat contextが含まれないことを検証する | packet構造のfield一覧、`author_claim_count`/`private_context_count`の実測値 | 1件でもauthor claimまたはprivate contextが混入した場合はfailとする |
| `HAT-WCC-03` | `WCC-FR-04`, `WCC-AC-02` | **provider縮退時のfail-close**: sandbox/network denyや期待providerが利用不可の場合、代替providerへ無許可でfallbackせず、fail-closeする | 縮退イベントのdecision digest、fallback発生の有無ログ | 無許可providerへの自動fallback、またはdeny違反を検出せず継続した場合はfailとする |
| `HAT-WCC-04` | `WCC-FR-01`, `WCC-FR-02`, `WCC-AC-01` | **非allowlist providerの起動拒否**: `worker-common-contract.md` §2 provider対応表に無いprovider、またはraw CLI直接呼び出し経路からの起動を拒否する | 起動要求のprovider識別子、拒否時のfailure code | allowlist外providerまたはraw CLI経路の呼び出しが成立した場合はfailとする |
| `HAT-WCC-05` | `WCC-AC-06` | **Discovery成果のS4前正本化拒否**: `PLAN-DISCOVERY-12`/`PLAN-DISCOVERY-13`のS0-S2成果を、S4 decide（admission decision receipt）を経ずに正本claim（「採用済み」「admit済み」等）として扱っていないかを検査する | 該当PLANの`status`/S4チェックリスト状態、参照箇所の文言 | S4未了のPLANを根拠に「採用済み」「動作保証済み」等の正本claimが生成された場合はfailとする |
| `HAT-WCC-06` | `WCC-FR-09/11`, `WCC-AC-07` | **brokered child lane**: Claude／Codexのtyped requestが同一Node brokerを通り、用途別admit済みKimiだけを隔離laneへ起動する | parent request、descriptor、admission、sandbox digest | raw `kimi` spawn、repository本体cwd、S4未admit用途を拒否する |
| `HAT-WCC-07` | `WCC-FR-10`, `WCC-AC-08` | **proposal-only再検証**: Kimi出力を別identityがschema／digest／oracleで再検証し、Nodeだけがtransaction化する | proposal、verifier receipt、commit receipt | direct write、自己review、approval／merge verdictを拒否する |
| `HAT-WCC-08` | `WCC-FR-12`, `WCC-AC-09` | **child lifecycle再生**: requestからaccepted/rejected/quarantinedまでparent/child/HEAD/sandbox/output/verifierを再生できる | event列、FS diff、egress、terminal receipt | orphan child、HEAD drift、receipt欠落を拒否する |
| `HAT-WCC-09` | §2, `WCC-AC-10` | **current Kimi反例保持**: 2026-07-22 exact-token failureを独立failureとしてscorecardへ保持する | raw output digest、exit、FS diff、disposition | 過去S2 4/4との平均でfailureを相殺しadmitすることを拒否する |

## §2 evidence要件

- 全HATはworker/reviewerの別identity・別session・独立contextをreceipt digestで確認する。runtime/provider/modelは記録するが、異なるfamilyを合格条件にしない。
- `HAT-WCC-01`〜`HAT-WCC-03`はsandbox/receipt/blind benchmarkの各実行receiptをcite し、prose claimのみでpassにしない（`docs/skills/judgment-core.md` §1原則1）。
- `HAT-WCC-05`は`docs/plans/PLAN-DISCOVERY-12-grok-build-worktree-precedent.md`と
  `docs/plans/PLAN-DISCOVERY-13-kimi-worker-cli-poc.md`のS4 routing欄（未完了チェックボックス）を
  機械可読な正本として参照する。

## §3 trace

| HAT | 対応FR | 対応AC | pair design |
|---|---|---|---|
| `HAT-WCC-01` | `WCC-FR-07` | `WCC-AC-04` | `docs/design/helix/L3-requirements/worker-common-contract.md` §1, §3 |
| `HAT-WCC-02` | `WCC-FR-07` | `WCC-AC-04` | 同上 |
| `HAT-WCC-03` | `WCC-FR-04` | `WCC-AC-02` | 同上 |
| `HAT-WCC-04` | `WCC-FR-01`, `WCC-FR-02` | `WCC-AC-01` | 同上 §2 |
| `HAT-WCC-05` | — | `WCC-AC-06` | 同上 §2, §3 |
| `HAT-WCC-06` | `WCC-FR-09`, `WCC-FR-11` | `WCC-AC-07` | 同上 §1, §3 |
| `HAT-WCC-07` | `WCC-FR-10` | `WCC-AC-08` | 同上 §1, §3 |
| `HAT-WCC-08` | `WCC-FR-12` | `WCC-AC-09` | 同上 §1, §3 |
| `HAT-WCC-09` | — | `WCC-AC-10` | 同上 §2, §3 |

## §4 量閉じ

- HAT: 9件。
- 対応FR: `WCC-FR-01`, `WCC-FR-02`, `WCC-FR-04`, `WCC-FR-07`, `WCC-FR-09..12`（各oracleでtrace済み）。
- status: draft。PO承認と`worker-common-contract.md`の確定なしにG3を通過しない。
