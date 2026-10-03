# confirmed175 live recount（2026-10-01）

- 基準HEAD: `origin/main` `50686b6762788574cb471967e8c24846d3dd56ae`。固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。authority effect: `none`。
- 対象175 source-qualified identityについて、既存queueと以後のfocused auditを再照合した。今回の報告自身は証拠に含めない。

## 件数

| 指標 | 件数 | 意味 |
|---|---:|---|
| confirmed175 identity母集団 | 175 | full audit・queue・canonical ledgerの一意集合 |
| queueで個別比較済みと分類、参照artifact SHA一致 | 30 | 9/30 queueのidentity-specific fixed-pair比較行 |
| 後続focused identity recordが厳格pinを充足 | 90 | 旧source line SHA＋identity内residual＋固定F6 pairのL2/L11双方のfile SHA |
| 上記の重複 | 8 | source-qualified ID完全一致 |
| 個別比較証拠のunion | **112** | queueまたはfocused recordを満たすidentity |
| この閾値で未確認 | **63** | 個別比較不存在の断定ではなく、証拠未接続 |
| successor assignment | 0 | canonical ledger |
| source atom closure | 0 | canonical ledger; `preserved_pending_rehome` remains |

以前のdraftにあった`167/175`は自己参照を含むため撤回した。queueの30行は元のqueue artifact path/SHAが一致する行に限定し、後続focused auditは上記のidentity-local条件で独立に数え直した。

## 採用閾値

- source-qualified IDをconfirmed175へ完全一致でjoinし、archive上のsource file SHA・exact source line SHAを全件再計算する。
- queue行は`individually_compared`、指定されたrow-level comparison kind、`comparison_is_closure=false`を要求し、参照artifactのSHAを実bytesと照合する。
- focused auditは、単一identity recordに旧source line SHAとidentity局所のresidual/open条件があり、F6固定revisionを示し、同一artifact中に該当固定pairのL2とL11双方のF6 file SHAがある場合だけ数える。
- route mention、候補監査、source reference、target存在、group residual、別revisionのpair、および本レポート自身は数えない。

identity比較はsource atomの網羅・採択・同値判定・移管closureを意味しない。全件でsource atom closureは未完了である。

## 次の優先集合

比較証拠がこの閾値で未確認の**63 IDs**を次のidentity-specific fixed-pair比較queueとする。具体的source-qualified IDsはJSONの`next_priority_set.unconfirmed_identity_condition_comparison`に記録した。full audit上のknown-residual identities（17件）は別途残差atom整理の対象であり、比較済み・未比較の別にclosureは未完了のままである。

全175件のsource path、line、source file/line SHA、原文、carry-forward状態、identity別証拠・artifact SHA/fixed-pair SHA pinは同梱JSONを参照。旧runtime等は実行していない。
