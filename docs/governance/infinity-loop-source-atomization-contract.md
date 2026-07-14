---
title: "HELIX Infinity Loop source原子化・完全性契約"
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
requirements:
  - HIL-FR-16
  - HIL-FR-21
  - HIL-FR-22
gates:
  - HIL_SOURCE_SET_OPEN
  - HIL_SOURCE_ENTRY_UNCLASSIFIED
  - HIL_SOURCE_AGGREGATE_ONLY
  - HIL_SOURCE_ATOM_ORPHAN
---

# HELIX Infinity Loop source原子化・完全性契約

## §0 目的と非主張

本書は、ZIP 703 entry、旧UT `main` 1,784＋branch overlay 52 entryと5 remote ref、現行HELIX seed HEADの
full tree 1,931 path（core 1,756＋outside 175）という**集計値**を、採用済みcapability件数として誤って
合算しないための
機械契約である。sourceを読んだこと、file pathを分類したこと、代表capabilityを数件起票したことは、
atomic behaviorの完全性を証明しない。

本書でいう`source entry`はarchive entryまたはGit blob/tombstone、`behavior atom`は一つの入力・出力・
副作用・失敗境界として独立に採否できる最小意味単位である。directory、branch、file、module群、生成bundle、
「agent registry一式」のようなaggregate parentは探索単位にはできるがcoverage分母へ算入しない。

現時点で手作業により全fileの意味を列挙し終えたとは主張しない。§2の件数とdigestは機械走査で確認できた
source集合の閉包証拠であり、atomic behavior集合は未閉鎖である。本契約を実装したgenerated manifestと
coverage receiptがgreenになるまで、`docs/governance/infinity-loop-source-capability-ledger.md`の代表行を
完全性証拠へ昇格させない。

## §1 正本entityとcardinality

### §1.1 entity

| entity | 識別子 | 意味 | coverage分母 |
|---|---|---|---:|
| `source_snapshot` | `snapshot_id` | 一回の不変なZIP/Git/current HEAD観測 | 否 |
| `source_ref` | `source_ref_id` | archive、Git ref、current HEAD scope | 否 |
| `source_entry` | `entry_id` | ZIP entry、Git blob、branch tombstone | entry閉包だけに算入 |
| `entry_classification` | `entry_id + revision` | entryの意味種別と分類rule | 否 |
| `aggregate_parent` | `aggregate_id` | directory、module群、branch、代表capability | **常に否** |
| `behavior_atom` | `atom_id` | 独立採否できる不可分なbehavior契約。入力等の配列要素数ではなく独立採否境界で分割 | `atom_kind=behavior`のみ算入 |
| `fixture_atom` | `atom_id` | generated output、sample、golden、screenshot等 | fixture分母だけに算入 |
| `decision` | `decision_id` | `adopt/harden/redesign/reject/absorbed/pending` | 否 |
| `coverage_edge` | `edge_id` | atomからHIL/design/assertion/gateへの型付きedge | 否 |
| `coverage_receipt` | `receipt_id` | 閉包式と全manifest digestの判定 | 否 |

`behavior_atom`と`fixture_atom`は同じschemaを用いるが、`atom_kind`を混同しない。生成物を大量に含むZIPの
file数をruntime capability数へ水増ししないため、fixtureは専用分母へ隔離する。

### §1.2 必須cardinality

1. `source_snapshot 1 -> source_ref 1..N`。
2. `source_ref 1 -> source_entry 0..N`。Git branch overlayは固有deltaが0件でも正当だが、0件であることを
   ancestryとempty digestで証明する。
3. `source_entry 1 -> entry_classification exactly 1`。
4. 実行・規則・契約・workflow・人間判断を含むentryは`behavior_atom 1..N`へ結ぶ。
5. generated/sample/golden entryは`fixture_atom exactly 1..N`へ結ぶ。fixtureであることを理由にentry集合から
   削除しない。
6. 非意味binary、directory placeholder、重複aliasも無視せず、`atom_kind=evidence_only|duplicate_alias`の
   terminal atomを1件以上持つ。これらはbehavior分母へ算入しない。
7. `atom 1 -> source_span 1..N`。複数fileで一つのbehaviorを構成でき、同一fileから複数atomを作れる。
8. `behavior_atom 1 -> current decision exactly 1`。過去decisionはappend-only revisionとして保持する。
9. `decision=adopt|harden|redesign`は`HIL 1..N -> design 1..N -> assertion 1..N -> gate 1..N`を全て持つ。
10. `decision=reject`も、scope/non-goalを与えるHILまたはPO directiveを1件以上、反証assertionを1件以上、
    再出現を検出するgateを1件以上持つ。理由だけのrejectを禁止する。
11. `decision=absorbed`は`absorbed_by_atom_id exactly 1`を持ち、target atomが上記joinを満たす。source atom側は
    targetのedgeを参照するが、独立covered件数へ二重算入しない。
12. `decision=pending`は調査中だけ許容し、pair-freeze時は1件でもfailとする。
13. `aggregate_parent -> child atom 1..N`を持てるが、aggregate自身の`covered_weight`は常に0とする。

joinの正規順序は次であり、途中をrepresentative proseで短絡しない。

```text
source_snapshot
  -> source_ref
  -> source_entry
  -> source_span
  -> atomic behavior / fixture / evidence-only / duplicate-alias
  -> current decision
  -> HIL requirement or authoritative non-goal
  -> L4/L5/L6 design reference
  -> executable assertion
  -> blocking or observation gate
```

## §2 現時点で機械確認できたsource証拠

### §2.1 ハイブリッド設計文書ZIP

| 項目 | 観測値 |
|---|---|
| source | `ハイブリッド設計ドキュメントv1-fixed.zip` |
| archive SHA-256 | `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3` |
| ZIP entry count | 703 |
| 展開後size | 10,373,451 bytes |
| 既存監査のpath＋content合成SHA-256 | `eb1d3238a833d7eb65ce92a2fae5c946f500f249b23c9d0d91a86b5111542cc5` |

archive SHAは`sha256sum`、entry数はarchive central directoryの機械走査で確認した。既存の合成digestは
原監査の証拠として保持するが、canonicalization versionが記録されていないため、§3の`entry_set_digest_v1`
とは同一視しない。新manifest生成時に703件それぞれのpath、entry type、uncompressed size、content SHA-256を
再計算し、新旧digestを並記する。

既知のtop-level分類は`.claude=16`、`.github=1`、`.vscode=3`、`api=1`、`build=427`、`docs=139`、
`schema=2`、`scripts=1`、`templates=77`、`tools=29`、root=7で、合計703、path group未分類0である。
ただし`build=427`を427 runtime capabilityとして数えない。generated由来を再判定し、source→generated lineageを
持つ`fixture_atom`へ分類する。

### §2.2 旧UT Git snapshot

観測remoteは`https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git`。`origin/HEAD`は
`origin/main`と同じcommitを指すsymbolic aliasなのでref分母へ二重算入しない。以下の5 refをsource ref集合とする。

| ref | commit | tree | tree files | mainからの固有delta files | binary diff SHA-256 |
|---|---|---|---:|---:|---|
| `origin/main` | `e506a67e9c243cc9781ff4a6d8d1870b072fd37b` | `2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720` | 1,784 | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `origin/work/l6-81-agent-registry-design` | `ffb13d6c87b3903fbef89d4632b04b1267ecd772` | `dff1970a4be6e18957e938cbf3ffbc1f12bb8a65` | 1,783 | 1 | `d858def2d0bf410a7ea60b9146d465f2181b415efa3d6a0666163df5fe1d8ff1` |
| `origin/work/l6-82-universal-pr-trigger` | `9bcdbe5af48345af13485c1d098390cd4de935bc` | `188b01f01db15b17c690bdd28b59ca7d3f493ad8` | 1,787 | 11 | `9ccba3db263cc60038f65ebdfe16f372dd13646b817fe08f158fd8d9ca798575` |
| `origin/work/l7-418-plan-asset-v2` | `a588981b4d580ad78f1534bc47fc065ddb5cef01` | `657af0fcb1e38d98a720d73c286cd9fa6aaf1622` | 1,804 | 40 | `9a5c3f1a1ef25fab9377b5d3dd885bccf8ff9f7d7e3d61ead9c6aeefa1b2bd67` |
| `origin/work/l7-421-test-hygiene-live-tree-fence` | `c163e6e5d4ec41c8b5192355e10cc5cc88102e50` | `d2f597e3bc64e9147a6ab9f5654d2628ab2ed1d1` | 1,777 | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

固有deltaは`merge-base(origin/main, ref)..ref`、file数は`git diff --name-only origin/main...ref`、digestは
`git diff --binary --full-index origin/main...ref`のbytesへSHA-256を適用した観測値である。将来のmanifestは
Git version、fetch時刻、remote URL、merge-base、ahead/behind、command contract versionを必須にする。
現観測はfetch時刻を保持していないため、source refのcommit/tree固定には使えるがremote ref集合の鮮度証明には不足する。

`work/l7-421-test-hygiene-live-tree-fence`はmerge-baseが当該commit自身であり、mainに対しahead=0、behind=47、
固有delta=0である。これはbranch overlay entryがmainへcommit ancestry上absorbedされた証拠になる。一方、
`work/l6-81-agent-registry-design`はmainに対しahead=2/behind=5で、固有変更1 fileを持つため、branch名だけを
`absorbed`にしてはならない。その1 fileから複数behavior atomを抽出し、各atomについてmainまたは現行HELIXの
吸収先を証明する。

### §2.3 現行HELIX snapshot

| 項目 | 観測値 |
|---|---|
| HEAD commit | `9c8d09c224c5fc506eb314933519981dadfea3e9` |
| HEAD tree | `ae66a258ac26c0578fcdcc69a4bbcfb277860c26` |
| inventory scope | commit済みHEAD full tree |
| full-tree path count | 1,931（core 1,756＋outside 175、交差0） |
| full-tree entry集合digest | `b9708d6c5a7e85607ec7f481841f50f711f9f6e8fc7fad052d6a71a46d4fec09` |
| full-tree分類digest | `d7d54c8bf4a7c1bb15fdbdc85e74a36d61eb33e6c0046a31598cc9974f4a3256` |
| path未分類 | 0 |

core 1,756は`src/tests/docs`、outside 175はhook、agent、CI、config、evidence、entrypoint、root supply-chainを
含む非交差partitionである。1,931件すべてをsource entry分母へ含めるが、root ZIP file自体とZIP内部703 entryを
同じentryとは扱わない。この分類はsource entry閉包だけを示し、atomic behavior閉包を示さない。working treeの
foreign変更とuntracked artifactはHEAD baselineへ混入させず、別の`working_tree_observation`として記録する。

## §3 digestと不変snapshot契約

### §3.1 正規直列化

機械artifactはUTF-8、BOMなし、改行LFとし、objectはRFC 8785 JSON Canonicalization Scheme相当でserializeする。
JSONLはstable IDのUnicode code point昇順で1行1object、末尾LFありとする。pathはarchive/Git内の`/`区切りを維持し、
OS native separatorへ変換しない。Unicodeは入力bytesと表示用NFC pathを別fieldで保持し、正規化により異なるentryを
同一化しない。

各digestは`sha256:<lowercase hex>`で表し、少なくとも次を保持する。

| digest | 入力 |
|---|---|
| `raw_source_digest` | ZIP archive bytesまたはGit commit/tree object identity |
| `entry_blob_digest` | entry content bytes。tombstoneは削除前blob＋operationを含む |
| `entry_set_digest` | canonical `source_entries.jsonl`全bytes |
| `atom_set_digest` | canonical `behavior_atoms.jsonl`全bytes |
| `decision_set_digest` | canonical `capability_decisions.jsonl`全bytes |
| `edge_set_digest` | canonical `coverage_edges.jsonl`全bytes |
| `receipt_root_digest` | 上記digest、schema/extractor/rule versions、source refsを含むreceipt object |

source entry、atom、decision、edgeはsilent rewriteしない。source digest、extractor version、classification rule、
HIL/design/assertion/gate先digestのいずれかが変われば新revisionを発行し、旧coverage receiptを`stale`にする。
digestだけ同じでもsource ref集合が増減した場合は別snapshotとする。

### §3.2 stable ID

IDは表示名から手採番せず、namespaceと不変digestから導出する。

```text
snapshot_id = HSS-<sha256(source_bundle identity)[0:24]>
entry_id    = HSE-<sha256(snapshot_id, source_ref_id, raw_path_bytes, blob_digest)[0:24]>
atom_id     = HSA-<sha256(atom_kind, semantic_signature, sorted source spans)[0:24]>
decision_id = HSD-<sha256(atom_id, revision, decision, rationale_digest)[0:24]>
edge_id     = HSE-EDGE-<sha256(from, relation, to, target_digest)[0:24]>
```

atomの`semantic_signature`は名前だけでなく、正規化した入力、出力、副作用、failure、state transitionを含む。
同名functionまたは同一文章であることだけをabsorbed/duplicate証拠にしない。

## §4 branch overlay、unique、absorbedの証明

旧UT全branchを各1,700件超の独立copyとして数えるとmain共通blobを重複計上する。Git sourceはmain snapshotと
branch overlayに分ける。

1. mainの1,784 tree entryをbaseline entry集合にする。
2. 各branchは`merge_base`、`ahead/behind`、`A/M/D/R` deltaを持つoverlayとする。
3. `M`はbase/ref双方のblob digestと変更span、`D`はtombstone、`R`は旧新pathとblob同一性を記録する。
4. branch固有atomはoverlay entryから抽出する。main共通atomをbranchごとに複製しない。
5. branch固有file数はbehavior数ではない。1 fileから0件または複数atomが生じる。
6. branch全体の`absorbed`は子atomの判定を代替しない。

`absorbed`を許す証拠は次のいずれかとする。

- `commit_ancestry`: branch tipがtarget refのancestorで、固有deltaがempty digestである。
- `patch_identity`: canonical patch IDと全blob transitionがtargetに存在する。
- `semantic_identity`: atom semantic digest、input/output/side-effect/failure、assertion結果が一致し、
  `absorbed_by_atom_id`が一意である。

path名一致、類似prose、同じPLAN番号、LLMの「既にありそう」という判断だけではabsorbedにしない。部分吸収は
atomを分割し、吸収済みatomと未吸収atomを別decisionにする。

## §5 generated fixtureの扱い

生成物はsource集合から落とさず、runtime capabilityにも数えない。

| entry class | atom kind | 必須lineage | gate |
|---|---|---|---|
| generated document/xlsx/png | `regression_fixture` | producer atom、input digest、generator version | 再生成digestまたは許容差分assertion |
| golden/snapshot/sample | `regression_fixture` | tested atom、assertion ID | fixture orphan禁止 |
| cache/temp/log | `evidence_only`または`reject` | 生成理由、retention/non-goal | 正本昇格禁止 |
| duplicate packaged copy | `duplicate_alias` | canonical entry/atom ID、blob/semantic証拠 | 二重算入禁止 |

producerが不明なgenerated entryは`fixture_producer_missing`でfailする。binaryで内部意味を抽出できない場合も、
path、bytes digest、producer、consumer assertionを追跡する。ZIP `build/` 427件を一括で「generatedだからcovered」には
しない。

## §6 自動生成可能な分類手順

### 工程A: source取得

1. ZIPはcentral directoryを順序非依存で読んで全entryを取得し、重複path、暗号化entry、symlink、path traversalを
   finding化する。
2. Gitはremote URLとfetch時刻を固定し、symbolic aliasを解決して全remote refを列挙する。
3. current HELIXはcommit/treeとscope prefixを固定し、working treeを別観測へ隔離する。
4. raw source、entry集合、ref集合のdigestを先にsealする。

### 工程B: 決定的entry分類

path、Git mode、MIME、content magic、generated marker、source map、manifest参照をversioned ruleで分類する。
各entryは`classification_rule_id`、rule version、confidenceではなく決定的reason codeを持つ。拡張子だけで
generated/runtimeを決めない。rule未該当は`unclassified`として残し、default `other`で隠さない。

### 工程C: atom候補抽出

- TypeScript/Python: ASTからexport、class/function、CLI command、schema、DB migration、I/O、副作用、throw/failureを抽出。
- Markdown: heading、normative table row、MUST/禁止、workflow step、acceptance criterion、skill contractを抽出。
- YAML/JSON/TOML: schema object、rule、job/step、template variable、state transitionを抽出。
- GitHub workflow/hook: event trigger、permission、condition、command、fail-close routeを抽出。
- generated/binary: producer/consumer/fixture relationだけを抽出し、runtime behaviorとしない。

AST nodeまたはline/column spanを保持し、file全体を一つのatomにしない。抽出器が候補を出せない意味entryは
`atom_extraction_empty`となり、人手reviewを要求する。

### 工程D: 原子分割と重複検出

candidateごとに`inputs[]`、`outputs[]`、`side_effects[]`、`failures[]`、`state_transitions[]`を正規化する。
複数の独立副作用または別々に採否可能なfailure policyがあるcandidateは分割する。semantic digestが同じ候補は
自動削除せずduplicate候補としてedge化し、ancestry/patch/assertion証拠でabsorbed可否を決める。

### 工程E: 採否とcoverage結線

decisionはreview済みledgerからversion付きで取り込み、LLMの分類だけで`pending`を終端化しない。
HIL、design、assertion、gateのtarget IDとtarget content digestを解決する。target不在、target digest stale、
reject根拠不足、absorbed target不在はorphanとする。

### 工程F: receipt生成

全manifestをcanonicalizeし、§7の閉包式とfailure codeを評価する。receiptはsource snapshotへbindし、別snapshotの
greenを再利用しない。

## §7 未分類0とcoverage gate

最終PASS条件は次の積である。

```text
source_ref_count == expected_source_ref_count
AND source_entry_count == classified_entry_count
AND unclassified_entry_count == 0
AND behavior_bearing_entry_without_atom_count == 0
AND generated_entry_without_fixture_atom_count == 0
AND fixture_without_producer_or_assertion_count == 0
AND aggregate_parent_counted_as_covered == 0
AND current_decision_count == behavior_atom_count
AND pending_decision_count == 0
AND unjustified_reject_count == 0
AND absorbed_without_unique_target_count == 0
AND branch_unique_delta_unatomized_count == 0
AND HIL_orphan_count == 0
AND design_orphan_count == 0
AND assertion_orphan_count == 0
AND gate_orphan_count == 0
AND stale_edge_count == 0
AND duplicate_covered_weight_count == 0
AND receipt_root_digest_matches == true
```

主なfailure code:

| code | 意味 |
|---|---|
| `HIL_SOURCE_SET_OPEN` | expected ref/entry集合が固定できていない |
| `HIL_SOURCE_ENTRY_UNCLASSIFIED` | entry分類が無い、またはdefault otherへ隠した |
| `HIL_SOURCE_ATOM_EXTRACTION_EMPTY` | behavior-bearing entryにatomが無い |
| `HIL_SOURCE_ATOM_NOT_ATOMIC` | 独立trigger、副作用authority、failure policy、state transitionを一atomへ混在した |
| `HIL_SOURCE_ATOM_UNCLASSIFIED` | atom kindまたは原子分割後の意味分類が未確定 |
| `HIL_SOURCE_ATOM_OVERLAP` | primary source spanを複数atomic childへ重複所有させた |
| `HIL_SOURCE_ATOM_EXTRACTOR_STALE` | extractor/plugin/config/signature schema変更後も旧receiptをcurrent扱いした |
| `HIL_SOURCE_AGGREGATE_ONLY` | aggregate親だけでcoverageを主張した |
| `HIL_SOURCE_FIXTURE_MISCOUNT` | generated fixtureをruntime behaviorへ算入した |
| `HIL_SOURCE_FIXTURE_ORPHAN` | producerまたはassertionのないfixture |
| `HIL_SOURCE_BRANCH_DELTA_OPEN` | branch固有deltaが未原子化 |
| `HIL_SOURCE_ABSORPTION_UNPROVEN` | ancestry/patch/semantic証拠なしのabsorbed |
| `HIL_SOURCE_DECISION_PENDING` | current decisionがpending |
| `HIL_SOURCE_REJECT_UNJUSTIFIED` | authority/反証/gateのないreject |
| `HIL_SOURCE_ATOM_ORPHAN` | HIL/design/assertion/gate joinが欠ける |
| `HIL_SOURCE_EDGE_STALE` | edge先またはsource digestが変わった |
| `HIL_SOURCE_RECEIPT_DIGEST_MISMATCH` | manifestまたはreceiptの改変・再計算漏れ |

entry分類率、atom抽出率、decision確定率、join率は別々に報告する。例えば703/703 path分類を100%と報告しても、
atom抽出0ならatomic coverageは0%である。総合進捗は分母を明記せず平均しない。

## §8 機械可読artifact

正規生成先は実装時に`SourceSnapshotter`のL5/L6設計で確定するが、論理artifact名とschemaは次に固定する。

```text
source_bundle.json
source_refs.jsonl
source_entries.jsonl
entry_classifications.jsonl
behavior_atoms.jsonl
entry_atom_edges.jsonl
capability_decisions.jsonl
coverage_edges.jsonl
coverage_receipt.json
```

最小record例:

```json
{
  "schema_version": "helix-source-atom.v1",
  "atom_id": "HSA-...",
  "atom_kind": "behavior",
  "semantic_signature": "sha256:...",
  "name": "universal pull-request trigger policy",
  "inputs": ["github.event.pull_request"],
  "outputs": ["harness-check decision"],
  "side_effects": [],
  "failures": ["filtered base branch", "missing policy evidence"],
  "state_transitions": [],
  "source_spans": [
    {
      "entry_id": "HSE-...",
      "start_line": 1,
      "end_line": 24,
      "span_digest": "sha256:..."
    }
  ],
  "aggregate_parent_ids": ["HAGG-UT-L6-82"],
  "covered_weight": 1,
  "extractor": { "id": "workflow-atomizer", "version": "1" }
}
```

`coverage_edges.jsonl`の初期relationは、前半の識別子
`implements_requirement / designed_by / asserted_by / enforced_by / absorbed_by / generated_by / verifies`と、後半の識別子
`supersedes / duplicates`の9種だけをallowlistにする。自由文字列relationを許すと未joinを別名で隠せるため、
追加はschema version更新とmigrationを要求する。
双方向traceはrelationの別名やinverse rowを追加せず、同じcanonical edge集合からreverse projectionを生成する。
forward/reverse projectionは同一snapshot、target digest、edge digestを共有し、片側だけの更新を許可しない。

## §9 現在の判定

| source | entry/ref閉包 | path/ref分類 | atomic behavior閉包 | freeze判定 |
|---|---:|---:|---:|---|
| ZIP | 703 entryを観測 | top-level 703/703 | 未閉鎖 | FAIL |
| 旧UT | 5 ref、main 1,784 entryを観測 | ref 5/5 | branch deltaを含め未閉鎖 | FAIL |
| 現行HELIX | full-tree 1,931 pathを観測 | partition分類1,931/1,931 | 未閉鎖 | FAIL |

したがって、既知件数はsource captureの前進証拠ではあるが、HIL-FR-22のSource Capability Coverage Gateを
PASSさせない。次の実装単位は本契約のmachine-readable manifest generator、language別atom extractor、
coverage edge resolver、receipt gateであり、代表capability表の手拡張だけでは代替できない。
