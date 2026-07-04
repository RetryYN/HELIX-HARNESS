---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-17-gate-confirm.md
---

> **L6 contract marker**: `analyzeGateConfirm(input: GateConfirmInput) => GateConfirmResult` は unit-test 粒度の contract である。DbC pre/post/invariant は gate の PASS/park 状態を U-GCONF-001..005 へ対応付ける。

# gate-confirm lint — 関数設計 (IMP-079)

## §1 スコープ

`gate-confirm` は gate status と document freeze status の機械的な結合を検証する。design または test-design document は、`docs/governance/gate-design.md` §2 の対応する gate 行が PASS の場合に限り `status: confirmed` にできる。これにより、gate record を伴わない status だけの freeze を検出する。

## §2 関数

| 関数 | contract |
|---|---|
| `parseGateStatuses(gateText)` | gate-design §2 table から `G<N>` / `L<N>` / status cell を parse する。PASS は status cell が `PASS` を含む場合だけ true とする。 |
| `parseConfirmDoc(file, content, kind)` | design/test-design frontmatter から `layer` と `status` を抽出する。 |
| `layerToGate(layer)` | `L<N>` を `G<N>` へ対応付ける。layer ではない値は null を返す。 |
| `analyzeGateConfirm(input)` | confirmed doc ごとに、対応する gate が PASS かを確認する。Gate parse failure は `skipped=true` と `ok=false` を返す（fail-close）。 |
| `loadGateConfirmDocs(repoRoot)` | gate-design と `docs/design/harness/**`、`docs/test-design/harness/**` を読み込む。 |
| `gateConfirmMessages(result)` | doctor 向けの OK / violation message を出力する。 |

## §2.1 DbC / fail-close 不変条件

| contract point | invariant |
|---|---|
| gate parser failure | `skipped=true`、`ok=false`、かつ message は `violation` を含まなければならない。parse の曖昧さが silent PASS を生んではならない |
| confirmed doc with PASS gate | その doc/gate pair では `violations=[]` になる |
| confirmed doc with park/non-PASS gate | doc path、layer、expected gate を含む violation を 1 件出す |
| draft doc | coupling check では無視する。draft は gate PASS を要求しない |

## §3 Doctor 挙動

現在の integration は hard/fail-close である。`checkGateConfirm` は doctor messages に含まれ、`checkGateConfirm.ok` は `runDoctor.ok` に接続される。gate/doc coupling drift は `ut-tdd doctor` を block する。

## §4 テストオラクル

`tests/gate-confirm.test.ts` で cover する:

| ID | oracle |
|---|---|
| U-GCONF-001 | gate table parser が PASS 行と park 行を抽出する |
| U-GCONF-002 | layer から gate への mapping |
| U-GCONF-003 | park gate + confirmed doc の場合は violation |
| U-GCONF-004 | PASS gate + confirmed doc の場合は ok |
| U-GCONF-005 | parse failure の場合は fail-close violation |
| U-GCONF-006 | draft doc は check 対象外である |
