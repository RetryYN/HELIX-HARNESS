# RDP-001 REQATOM A1 0006--0010（scaffold候補）

status: `research_premise_candidate`
authority_effect: `none`
binding: `SCF-B-0050`
source_commit: `2654cf936719dee21dfbf1ceb8140163400f081a`

この束は、旧要求atom化 review queue の `REQATOM-QUEUE-0006`〜`0010` を、旧 business source の semantic line 台帳・read-only source snapshot・archive source・旧資産の判断／failure／consumer記録へ結び付ける独立review用候補である。source は次の7 lineで、旧sourceと現行read-only snapshotおよびarchive sourceのSHA-256は `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` で一致する。

- `REQSRC-LINE-00008`、`00009`: BR節見出しと表ヘッダ
- `REQSRC-LINE-00019`、`00020`: UX節見出しと表ヘッダ
- `REQSRC-LINE-00024`〜`00026`: PO、AI agent roster、HELIX運用者のactor定義

`proposals.jsonl` は5 unit、7 input line、10 candidate atomを保持する。同一source lineを複数atom（0010のHARNESS／OS connection）から参照しても、coverage分母は一度だけ数える。各atomには原文、line digest、actor、authority boundary、failure／停止条件、証拠、否定／例外、既存identity relation、consumer候補、実装・劣化・phase状態を保持する。

## 四製品候補分母

| 対象 | candidate atom | 状態 |
|---|---:|---|
| HELIX-HARNESS | 5 | candidate only。V-model、受入・役割契約、外部package consumerの候補 |
| HELIX-OS | 3 | candidate only。authority／Worker／verifier／配布統制への接続候補 |
| HELIX-Web | 0 | この5 unitに直接source evidenceなし |
| HELIX-Web-OS | 0 | この5 unitに直接source evidenceなし |
| target unresolved | 2 | 旧表ヘッダ（BR／UX）のowner・schema未確定 |

Web／Web-OSに直接根拠がないことは、両製品の要求が不要・不採用であることを意味しない。旧見出し・表構造はnavigation／metadataとして削除せず、後続unitの要求identityとの接続を人間reviewへ残す。

## 保持した意味と境界

- `0006` は「業務要求 (BR-01〜08)」という旧節の存在を保持する。見出しからBRの現行分母、target authority、successorを生成しない。
- `0007` は旧BR表の `ID / 業務要求 / 出所 (trace)` 構造を保持する。表ヘッダを現行schemaや受入契約へ昇格しない。
- `0008` は「UX要求 (UX-01〜03)」という旧節の存在を保持する。UXをHELIX-Webへ自動routingせず、HARNESSの工程体験との境界を未解決にする。
- `0009` は旧UX表の `ID / UX/価値要求 / 出所` 構造を保持する。価値要求を四製品のownerへ丸めない。
- `0010` はPOのscope／acceptance／final approval、AI agent roster、`worker≠verifier`、L0-L3人間承認境界、HELIX運用者とHARNESS package展開先の旧記述を保持する。HARNESSのcontract候補とHELIX-OS接続候補へ分けるが、OS側の管理・実行・配布という現行推論は `candidate_inference` に分離し、旧sourceの `retained_meaning` や `normalized_statement`へ混入させていない。現行permission、review、merge、release、deployment、実装、受入は生成しない。

旧sourceの「人間を常設reviewerとしない」表現やAI rosterは、旧時点の意味として保存する。現行の人間承認、独立検証、PR／CI／merge権限、完了を推定しない。

## 旧資産・判断・failure・consumer

対応資産は `LEGACY-ASSET-9F48ADEEB477DCA54039` revision 3 で、`source_snapshot_preservation`、`non_executable_read_only_source`、product `unresolved`、decision `pending_human_confirmation` である。revision 2の初回判断とrevision 3訂正（`REQ-SNAPSHOT-CORRECTION-9F48ADEEB477DCA54039`）をappend-onlyで参照し、訂正が旧PO判断を現行承認へ昇格させないことを保持する。

copy read-after `READ-REQ-SNAPSHOT-9F48ADEEB477DCA54039` は、過去のdigest／consumer match `pass`、failure `null` を示す観測である。consumer refsは `requirement-carry-forward-ledgers` と `requirement-atomization-review`。これは候補のcurrent consumer closureや実装完了を意味しない。各atomのfailureは `source_meaning_preserved; current_failure_contract_unresolved` とし、旧sourceの停止・例外・否定条件を残したまま現行failure contractを未解決にしている。

全atomの状態は `source_authority: confirmed (legacy source declaration)`、`target_authority: none`、`preserved_pending_atomization`、`implementation_status: unknown`、`degradation_status: unknown`、`phase_status: legacy declaration preserved; current phase placement unresolved`、`successor_status: unassigned` で固定する。

## 静的検証

```text
python3 scaffold/rdp001-reqatom-next5/generate.py
python3 scaffold/rdp001-reqatom-next5/validate.py
python3 scaffold/rdp001-reqatom-next5/selfcheck.py
python3 scaffold/tools/scfctl.py validate
git diff --check
```

`generate.py` は queue、semantic line台帳、source、asset catalog、append-only decision、copy read-afterから同じJSONL／inventoryを再生成する。`validate.py` は queue coverage全量、exact source／line digest、archive同一性、asset revision／decision／consumer、10 atom、四製品分母、actor／authority／failure／否定条件、OS現行推論のcandidate_inference分離、implementation／degradation／phase unknown、authority／successor／decision禁止を独立に検査する。`selfcheck.py` はcoverage欠落・重複、本文／digest改変、authority／successor／implementation／degradation／phase昇格、分母改変、actor conflict削除、OS機能意味のretained混入、推論分離解除、Web直接根拠の捏造を拒否する14否定例を一時ファイル上で確認する。

旧archiveは行テキスト・digestの静的比較だけに使い、旧workflow、runtime、CLI、hook、adapter、source、test、CIは実行していない。この候補は `scaffold/` 内の仮組みであり、正式な要求、設計、実装、CI、Issue、PR、承認、受入、release、deploymentではない。
