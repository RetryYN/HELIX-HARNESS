# RDP-001 REQATOM A1 first five（scaffold候補）

status: `research_premise_candidate`
authority_effect: `none`
binding: `SCF-B-0049`
source_commit: `4a195555fed7f5e67e7839be232570972dc6e2ae`

この束は、旧要求atom化 review queue の先頭5 unit（`REQATOM-QUEUE-0001`〜`0005`）を、semantic line台帳と旧source snapshotへ結び付けた独立review用の候補である。対象sourceは旧business要求文書で、archive原文と現行read-only snapshotのSHA-256はともに `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` である。旧資産台帳では `LEGACY-ASSET-9F48ADEEB477DCA54039` revision 3、`source_snapshot_preservation`、`non_executable_read_only_source`、product `unresolved`、implementation unknown、配置判断 `pending_human_confirmation` と記録されている。

`proposals.jsonl` は5 unit、7 input line、16 candidate atomを保持する。各unitの`line_coverage`は入力lineを一度だけ`consumed_once`へ置き、同じlineを複数atomが参照する場合もcoverage集計は一度にしている。`exact_source_text`、line digest、source file digestは台帳・source snapshot・archive sourceの三者照合で検査する。前後unitの`shared_context`は使用していない。

### 対象候補の分母

| 対象 | candidate atom | 状態 |
|---|---:|---|
| HELIX-HARNESS | 12 | candidate only。V-model、工程、検証・trace、外部提供物の意味候補 |
| HELIX-OS | 2 | candidate only。Worker／検証実行・PR/CI等の接続候補 |
| HELIX-Web | 0 | この5 unitに直接source evidenceなし |
| HELIX-Web-OS | 0 | この5 unitに直接source evidenceなし |
| target unresolved | 2 | 0001の旧件数宣言（BR/UX、NFR） |

これは現行L1のsuccessorやtarget authorityを割り当てる表ではない。Web／Web-OSへの直接根拠がないことも、両製品の要求が不要であることを意味しない。

### 保持した意味と未解決境界

- `0001` はL0 SSoT／anti-corruption制約、旧sourceが宣言したBR 10件・UX 3件・NFR 15件（NFR-09/10欠番、NFR-17統合、NFR正本は`nfr.md`）、L3 PLANの`dependencies.requires`接続を保持する。旧件数は現行分母・承認へ昇格しない。
- `0002` はPLAN-L1-06のsolo改訂、1人の開発者からsolo＋AI rosterへのactor mapping、機械機構は不変という制約を保持する。HARNESS工程意味とOS execution責務の分割は未解決である。
- `0003` は安全なAI委譲の基盤不足という旧rationale、回帰防止と設計⇔実装⇔テスト整合の機械強制、POのL0/L1/L2-mock/L3承認境界、L3起草〜L7実装・L8–L14検証・PR/CI/merge/tagのAI roster無人完走主張を分けて保持する。後半の無人完走は旧source意味であり、現行review／merge／権限境界、実装、受入、完了を生成しない。conflictとauthority unresolvedを残す。
- `0004` は安全な検証・開発基盤、旧L0-L14 V-model全工程のPLAN／gate／trace機械強制、solo＋PO／`tl`／`qa`／`aim`／`uiux` roster、`HELIX-HARNESS` repository/package名を保持する。旧L0-L14と現行L1-L12のphase関係は未解決である。
- `0005` はprocess／safety／automationの三者を偏らせず統合する価値、単一要素への最適化を禁ずる条件、UX-01再掲を一つのcomposite candidateとして保持する。統合条件を後続atomで落とさない。

全atomに、旧source authority `confirmed`、target authority `none`、`preserved_pending_atomization`、implementation `unknown`、degradation `unknown`、phase placement unresolved、successor unassignedを記録した。旧asset consumer refsは各atomの`consumer_candidate`へ引き継ぎ、current consumer statusは`unresolved`、failureはsource meaningを残したままcurrent failure contract unresolvedとしている。候補のproduct targetは現行責務境界との比較候補であり、採否・意味変更・retire・successor・L2/L11完了を表さない。

### 旧資産の参照範囲

旧source本文はarchiveから実行せず、行テキスト・digestの静的比較だけに使った。asset disposition、append-only decision log（初回判断とrevision 3訂正）、copy read-after（`pass`、digest／consumer match true、`failure: null`）、consumer refs（requirement carry-forward ledgers／requirement atomization review）を照合し、旧実装・旧CI・旧runtime・旧testを完了証拠やoracleとして使っていない。現行のConcept／4対象L1は、責務候補とconflictを考えるための参照であり、旧source意味を上書きしない。

### 静的検証

```text
python3 scaffold/rdp001-reqatom-first5/generate.py
python3 scaffold/rdp001-reqatom-first5/validate.py
python3 scaffold/rdp001-reqatom-first5/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
git diff --check
```

review 依頼の直前に `scfctl stale` を再実行し、`stale=0` を確認する。

`generate.py`は queue、semantic line台帳、source snapshotから同じJSONLを再生成する。`validate.py`はqueue coverage全量、exact source／line digest、archive同一性、16 atom、四製品分母、actor／authority／failure／evidence／negative条件、unknown status、authority/successor/decision禁止を独立に検査する。`selfcheck.py`はcoverage欠落・重複、本文／digest改変、authority／successor／decision／implementation昇格、四製品分母改変、旧無人merge conflictの削除を拒否する10否定例を一時ファイル上で確認する。

この候補は`scaffold/`内の仮組みであり、正式な要求、設計、実装、CI、Issue、PR、承認、受入、release、deploymentではない。
