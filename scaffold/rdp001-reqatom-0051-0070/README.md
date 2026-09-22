# RDP-001 REQATOM A1 0051--0070

A1 atomization review queue の `REQATOM-QUEUE-0051`〜`0070`（20 review unit）を、旧 source の意味候補として独立 review に渡す research Scaffold である。正式な要求 identity、採否、owner、authority、successor、実装、縮退、phase、受入、CI、release、deployment は生成しない。

## 固定範囲

- base: `origin/main` の `af288f3975d06f483d0c1fe5ba2f85041f06a607`。queue／semantic ledger／source／asset の固定入力に変更があれば rebaseline が必要。
- queue: 20 unit、37 input line、44 atomized candidate、6 `composite_unresolved` span。
- source group: 1件。全unitは `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md` に属する。
- source digest: `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`。
- archive digest: sourceと同一。archive は旧sourceの行・digestを照合する静的 evidence としてだけ読んだ。

unitごとの分母は次のとおりである。

| queue unit | input line | atomized | composite_unresolved |
|---|---:|---:|---:|
| 0051 | 7 | 7 | 0 |
| 0052 | 1 | 2 | 0 |
| 0053 | 4 | 4 | 0 |
| 0054 | 1 | 1 | 0 |
| 0055 | 1 | 0 | 1 |
| 0056 | 3 | 3 | 0 |
| 0057 | 1 | 1 | 0 |
| 0058 | 1 | 4 | 0 |
| 0059 | 1 | 6 | 0 |
| 0060 | 1 | 2 | 0 |
| 0061 | 1 | 0 | 1 |
| 0062 | 2 | 2 | 0 |
| 0063 | 1 | 1 | 0 |
| 0064 | 1 | 0 | 1 |
| 0065 | 1 | 0 | 1 |
| 0066 | 2 | 2 | 0 |
| 0067 | 1 | 0 | 1 |
| 0068 | 5 | 5 | 0 |
| 0069 | 1 | 4 | 0 |
| 0070 | 1 | 0 | 1 |

## 意味単位化

各input lineは `atomization_plan.json` の非重複な意味spanへ束縛した。atomごとに `source_line_text`、最小 `source_span`、逐語 `verbatim_anchor`、`normalized_statement`、`semantic_subject`、`inherited_subject`、`parent_context`、`semantic_action`、`semantic_condition`、`semantic_predicate`、`historical_conflict`、`typed_relation`、`product_boundary`、actor候補、failure／consumer候補を保持する。`retained_meaning` はそのatomの逐語spanであり、行全文をatomへ水増ししていない。

表のセル単語は要求数へ数えず、0051のL4 data-design行、0053のreference行、0056のPM／HM／GD行、0062・0066のmapping行、0068のBR-21属性行を各行一つの関係として保持した。0055、0061、0064、0065、0067、0070の表headerは具体的なactor・action・conditionを確定できないため `composite_unresolved` として別計数にした。

複合 prose は意味義務を落とさない範囲で分割した。0052はdependency列挙とlint検証、0058はL2 screen必須・wireframe例外・旧BE-only規約撤回・drive非依存検証、0059はG1-trace宣言・R1〜R4・trace matrix／lint接続、0060はentity追加禁止とFR接続、0069は評価改善cycle・委譲成否の蓄積分析・改善対象・反復委譲の成果へ分けた。旧sourceに記された実装済み、PO承認、Phase A／後続carryは歴史的属性として保持し、現行implementation、authority、phaseへ昇格していない。

## 旧資産・判断史・failure・consumer

対応assetは `LEGACY-ASSET-9F48ADEEB477DCA54039` revision 3。disposition は `source_snapshot_preservation`、implementation は `non_executable_read_only_source`、product target は `unresolved`、decision status は `pending_human_confirmation` である。`docs/governance/legacy-asset-decisions.jsonl#REQ-SNAPSHOT-CORRECTION-9F48ADEEB477DCA54039` のrevision 2→3訂正、`READ-REQ-SNAPSHOT-9F48ADEEB477DCA54039` のdigest／consumer read-afterを静的に照合した。

failure は旧sourceの原文・actor・condition・trace欠落またはdigest不一致ならsource closureを停止する候補として記録した。これは現行failure contractではない。consumer refs は `requirement-carry-forward-ledgers` と `requirement-atomization-review`、current status は `unresolved` である。

## 四製品境界

現行Concept／product-boundaryと4製品L1は routing candidate の比較にだけ使った。旧business source全体の bounded search では dashboard／UI／tenant 等の語は確認できたが、HELIX-Web、HELIX-Web-OS、Connector型SaaSの製品identityを直接示す記述はこのsourceにない。したがって、0054〜0059のscreen／dashboard関係は `candidate_target=unresolved`、`candidate_products` は `HELIX-HARNESS`／`HELIX-OS`／`HELIX-Web`／`HELIX-Web-OS` の四製品集合を保持する。UI語や旧HARNESS文書のdashboard／tenant語からWebまたはWeb-OSへ単独routingしていない。

非UIのL4／carry／FR／observability／BR-21／learning関係は、旧source上のHARNESS文脈と現行OSの管理・改善候補を分けるため、`HELIX-HARNESS`候補または `HELIX-HARNESS`／`HELIX-OS` の未確定集合として保持した。Web=0、Web-OS=0は、このbounded source範囲に直接の製品証拠がないという分母結果であり、Web系要求不存在や未実装の判定ではない。

| candidate target | atom count | status |
|---|---:|---|
| HELIX-HARNESS | 13 | candidate_only |
| HELIX-OS | 0 | no_direct_source_evidence |
| HELIX-Web | 0 | no_direct_source_evidence |
| HELIX-Web-OS | 0 | no_direct_source_evidence |
| product未確定 | 31 | candidate boundary only |

## 汎用生成・検証

`generate.py` は queue unit、semantic line ledger、`atomization_plan.json` を読み、source pathごとにasset／decision／read-after／consumerを解決する。source line順、意味義務anchor、`A1-0051-...`〜`A1-0070-...` のIDを固定し、再実行時のJSONLを決定的にする。sourceが増えてもpath単位でasset closureを確認できる。

`validate.py` は queue／ledger／source／archive digest、asset revision・append-only decision・read-after、非重複span、同一行義務の欠落・重複、actor／action／condition、否定・順序・接続を含むtyped relation、四製品分母、composite分離、authority／successor／implementation／degradation／phase unknown境界を静的に検査する。`selfcheck.py` は同一行の義務欠落・重複、表cell断片化、source／predicate／typed relation／product boundary／Web単独routing／否定関係改変、authority／implementation／degradation／phase昇格、composite欠落、input digest改変をvalidatorが拒否することを確認する。

```sh
python3 -B scaffold/rdp001-reqatom-0051-0070/generate.py
python3 -B scaffold/rdp001-reqatom-0051-0070/validate.py
python3 -B scaffold/rdp001-reqatom-0051-0070/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archiveのworkflow、runtime、test、CI、hook、adapterは実行していない。
