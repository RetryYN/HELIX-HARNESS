# RDP-001 RUL-OSP-04 atom research candidate

status: research_premise_candidate
authority_effect: none
binding: SCF-B-0011

これは RUL-OSP-04 の旧規則 atom を、要求採否・successor・現行 authority へ昇格させずに調査可能な形へ束ねた scaffold である。台帳の `requirement_primary: RUL-OSP-04` を 25 件、別要求を primary としながら `requirement_secondary` に RUL-OSP-04 を持つ relation atom を 22 件、重複なく保持する。

## 分母を混ぜない

`atom-candidates.jsonl` の分母は旧規則 atom 台帳の関係集合である。

| 集計 | 件数 | 意味 |
|---|---:|---|
| primary | 25 | `requirement_primary` が RUL-OSP-04 の atom |
| secondary relation | 22 | primary は別要求だが `requirement_secondary` に RUL-OSP-04 を持つ atom |
| primary ∪ secondary relation | 47 | この候補束が保持する一意 atom |
| S1-01 primary screen | 10 / 25 | S1-01 accounting 行の `screened_atoms`。全 primary の screen 結果ではない |
| S1-01 secondary link count | 5 | S1-01 accounting 行の `secondary_links_from_other_primary`。22 atom の集合ではなく、S1-01 への cross-link 集計 |

したがって S1-01 の 5 と台帳の secondary relation 22 は同じ denominator ではない。S1-01 row はそのまま `s1_accounting_snapshot` に保存し、5 を 22 に補完したり、22 を 5 に縮退したりしない。

secondary 22 行には `legacy_requirement_primary` として旧台帳の `requirement_primary` を一件ずつ保持する。`product_unit_candidate.product: HELIX-OS` は RUL-OSP-04 への OS 関係先候補を表すだけであり、旧 primary の製品 owner や責務を確定しない。各 secondary 行の `secondary_relation_boundary` と `connection_candidate.product_owner_status` はこの境界を固定する。

## 記録境界

各 atom は旧台帳の `rule_text` を `original_text` として保持し、出典 source の archive path・line span・逐語 source text・span digest と、対応する `legacy-asset-disposition.jsonl` の asset ID・file digest・状態を記録する。旧 source／runtime／hook／gate は実行していない。

`product_unit_candidate`、`actor_candidate`、`authority_candidate`、`consumer_candidate` は調査候補であり、現行責務・現行 authority・実装・採否を表さない。`authority_vocabulary_relation.current_authority_claim` は全件 false、per-atom S1-01 coverage は未評価である。

旧 source の prose／config／hook／gate が示す自律・拒否・escalation の挙動と、現行側の `L2D-S1-01 defer`・`authority_effect: none`・per-atom 未評価は同値化せず、`old_current_contradiction.status: unresolved_preserved` として併記する。旧挙動を現行 authority に昇格させず、現行停止状態を旧 source の意味の否定にも使わない。

## 残余

この slice は 47 atom と 26 source file の exact span closure に限定する。旧規則 atom 台帳全 7,622 件の網羅性、要求候補の対応づけの妥当性、AVS 46 atom との被覆、product unit の最終確定、RUL-OSM-01 の介入点列挙、現行 consumer／failure contract、human disposition は未解決のまま残す。

## 検証

```
python3 scaffold/rdp001-rul-osp-04/validate.py
python3 scaffold/rdp001-rul-osp-04/selfcheck.py
python3 scaffold/tools/scfctl.py validate
```

validator は台帳・S1-01 accounting・legacy asset ledger・archive source を読み取り、件数、relation closure、source/file/span digest、asset mapping、authority boundary、分母分離を確認する。selfcheck は一時コピーだけを改変し、primary/secondary の入替、source span digest、asset digest、S1-01 5/22 distinction、current authority claim の否定例を確認する。
