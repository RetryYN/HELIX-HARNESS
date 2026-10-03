# IR153 HIL-FR-46〜50 現行pair条件照合（2026-10-02）

## 対象と基準

基準は `6265c512bae65789b177e38404c8266726799f46`。旧資産 `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（資産台帳row 424）はread-only保存snapshotである。原L1のファイルSHA-256は `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、物理行136–140を条項単位で照合した。IR原文 `requirements.json` SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。各行hash、IR object/statement digest、decisionとpair section digest、関連source pinは同梱JSONに記録した。

5件はいずれもrevision 1 / specified / frozenで、primary contractはHR-FR-HIL-18、acceptanceはHAC-HIL-18a/b/c、testはHAT-HIL-18、下流ownerはHR-FR-HIL-18・`pending_pair_descent`。formal successor IDは全件空、route issue/actor/task/surface/design obligationも未設定である。移行時に質問・回答・prototype・actor/task/surface証拠を作らないこと、Issue #290をG1/G3 rebind後に有効化するまでdesign template選択を保留することも維持する。

## 条項別の現行行き先

| 旧IR identity / 原L1行 | 対応・採択の根拠 | 残る条件 |
|---|---|---|
| HIL-FR-46 / 136 | HARNESS-040-002採択（9/29 57候補 decision row45）。canonical L1–L12 catalog、層外L0 authority anchor、row field、snapshot/coverage contractを保持。 | なし（要件本文の条件について）。実装・実行済みとはしていない。 |
| HIL-FR-47 / 137 | HARNESS-041-003採択（9/29 11候補 row27）。active templateからのatomic extraction、provenance/applicability/version、unsupported/empty/TBD/unextractable/duplicateのgap、自由補完禁止を保持。OS-038-002も依存条件付き採択（同decision rows35–40）でappend outcomeを規定。 | なし（要件本文の条件について）。 |
| HIL-FR-48 / 138 | HARNESS-055-001採択（9/30 live26 row40）の選択sliceは隣接層bidirectional edge、未降下/未逆伝播、粒度/aggregate不整合を保持。 | `stale revision`拒否は055選択slice外。040のrevision/catalog記録はgate拒否oracleではない。HST-CASE-031-04 / 031-09は旧設計証拠で、実行証拠ではないため未完保持。 |
| HIL-FR-49 / 139 | HARNESS-056-001採択（9/30 live26 row41）の選択sliceは6 canonical V-pair、L12→L1/L0 feedback、左右片側欠落、oracle identity、未実行oracleを保持。 | `different snapshot`拒否は056がNFR-29 cross conditionとして明示除外。generic snapshot fieldだけでは拒否保証にならず未完保持。 |
| HIL-FR-50 / 140 | HARNESS-050-001採択（9/29 11候補 row30）。trigger、候補変換、全consumer、before/after oracle、pair保持、rollback、DesignRefactorとRedesign/Retrofitの分岐、出力を保持。 | なし（要件本文の条件について）。 |

各行の文章、原子条件、具体反例、現在の要求行き先はJSONの `fr_rows` に記録した。040/041/038/050/055/056は候補frontmatterのstatusではなく、対象revisionのdecisionとexact L2/L11 digestで採択を判定した。特に038-002のnegative addendumも9/29 decisionが採択範囲に含めている。

## 未完条件と関係境界

- **FR48 stale revision**：双方向edgeが揃い粒度も一致していても、edge先がsuperseded semantic revisionなら受理しない条件が残る。選択済み055だけでpairをgreen扱いしない。
- **FR49 different snapshot**：6 pairのedgeとoracle IDが一致しても、designとverification evidenceが異なるsnapshotなら受理しない条件が残る。選択済み056だけでFR49全体を完了扱いしない。
- 旧HR-FR-HIL-18、HAC/HAT、HIL-BR-25、HIL-NFR-29は共有contract/consumerまたは別source identityであり、FR46–50のatomとして重複計上しない。HAT-HIL-18の旧statusは `designed_not_implemented`。旧assertion casesも `design-defined / not-implemented` で、pass証拠ではない。
- FR48/49の過去監査やsource atom receiptは時点記録である。今回の現行判定は6265基準のexact採択本文を使い、既存記録を遡及書換しない。
- IR移行registerの `successor_requirement_ids: []` と `pending_pair_descent` はそのまま。候補採択をformal successor assignmentや旧IR全体のclosureに読み替えない。

## 検証範囲

旧archiveのruntime、CLI、test、CIは実行していない。新generationのruntime testおよび共通137 comparisonもworker側では実行していない（root実施）。JSONは原L1各行と旧asset/file hashesに照合し、採択根拠はdecision記録とsection digestで照合した。機械可読の全証拠は[paired JSON](ir153-hil-fr46-50-current-pairs-condition-audit-2026-10-02.json)にある。
