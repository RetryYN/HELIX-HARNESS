# v1.3 521行の意味条件・行先監査（最終補正版）

対象source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:1-664`、SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。664物理行中521非空行。全521行のsource text・line SHA-256をarchive sourceと再照合した。条件になり得る規範文・継続行は保守的に`condition`へ保持し、意味上の非対象と推定しない。旧source全文と現main `68ffa6f09` のL2/L11、authority記録を比較した。現mainの本文にはPO固定採択分と後発未採択候補が共存する。旧runtime/test/CIは実行していない。

## 521行の分類

| 分類 | 件数 |
|---|---:|
| `condition` | 303 |
| `description` | 154 |
| `heading_structure` | 64 |

`description` 154行にも条件文の継続や暗黙の規範が残る可能性がある。一次分類は条件母集団の完全なatom化ではない。


condition rowsの行先比較結果（条件状態）:

| 状態 | 行数 | 解釈 |
|---|---:|---|
| `covered` | 3 | 固定・採択済みL2/L11の限定された条件と直接照合 |
| `partial` | 84 | 意味親の一部を照合。source条件全体は閉じていない |
| `unresolved` | 171 | 後継／対受入の照合未完、または不確実性を保持 |
| `implementation-only` | 31 | 旧runtime/schema/adapterだけの条件。現行の意味被覆とは別 |
| `version-target` | 14 | 未採択candidateのversion_target行先。採択・被覆ではない |


**全521行の完全閉包は主張しない。** 形式的後継割当は0。source IDの明示・補助到達性はJSON recordsに保持し、行先routeは採択や承認を意味しない。

旧v1.3の計測・完成条件（§4.3・§4.8・§10のREG-03）と配布・consumer受入（§4.6.1・§10のREG-05）は、[既存の横断監査](post-po-cross-mechanism-audit-2026-09-28.md)と[package条件の照合](package-acceptance-legacy-differences-2026-09-28.md)に未完の条件として残る。HARNESS-L2/L11-034やOS-L2/L11-030などの後発候補があっても、[25候補の判断パケット](post-confirmation-25-po-decision-packet-2026-09-28.md)どおり未採択であり、旧受入を実行済み・全条件被覆済みとは判定しない。

## 修正内容

- `32`行をnormative/continuation conditionとして再分類または保持: 73, 74, 75, 79, 80, 158, 162, 167, 168, 169, 170, 171, 179, 180, 281, 306, 307, 308, 309, 319, 320, 321, 322, 415, 522, 523, 527, 529, 530, 531, 553, 653。曖昧または対受入未照合の行先は`unresolved`にした。
- line 102はSR0–SR4等の固定L2/L11照合を残しつつ、Reverse成果物の最終句を未確認として`partial`へ変更した。
- lines 65–66の限定的なcovered根拠に、HARNESS-L2-003と、同IDをkeyに持つL2 106–107／L11 41–42の参照行を追記した。
- line 112（旧source行SHA-256 `cd626aa398130c2023ec3167563fae6d79522561aa8ade8e93e48381f851c5fd`）のSR3差分をexactly oneのrouteへ送る条件は、PO固定revision `f6dad2a33` のHARNESS-L2-002／003（L2:105）と対L11:39（route 0件・複数件を拒否）に直接一致するため、`unresolved`から`covered`へ訂正した。この2条項は現main `bf1c30cec` でも同文。旧L113–119の個別条件まで一括して閉じず、形式的な後継割当も行わない。
- line 119（旧source行SHA-256 `b8d0bd53395b0c57bf8aed4d6007d792e7aa0e7038480f0880754e0a2d22f0d6`）は、固定L2:105,111,399／L11:39–40,292–294のSR3 route、Refactor／Backflow境界、Performance Refactorの測定条件・測定不能な高速化拒否と一部一致するため、`unresolved`から`partial`へ訂正した。Design Refactorのsemantic similarity／consumer／oracle／dependency graph判定、名称類似だけの統合拒否、機能追加との同一episode混載禁止は対L2/L11で未確認であり、全条件被覆とはしない。L2側の性能規範が未特定とした前回記述は、HARNESS-L2-016:399を見落とした誤りとして撤回する。
- line 639（旧source行SHA-256 `a1246b2d13e88149de79871a952cb1c9749e5ff9b5f74891a2a3679daddb277e`）は、旧3方式のexactly-one選択とDiscovery／PoC起動の別field判定を一行に束ねた受入条件である。[2026-09-25のPO判断](../../decisions/po-optimal-draft-po-decisions-2026-09-25.md#L49)は方式を4種類・合成可能へ明示変更し、採択済みHARNESS-L2-002:101–103と対L11:22,34–35,37は未選択・適用条件不成立の拒否、合成時の品質条件、Discovery／PoCの方式phaseからの分離を保持する。ただし旧原文のliteralな別fieldのschema形状までは現行pairで固定していないため、`unresolved`から`partial`に限って訂正する。旧意味の変更はPO判断と対応付け、別fieldの同一実装・受入実行やformal successorは主張しない。同文のbaseline revision `V13-BASE-6FAB-L0620`（`docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:620`、file SHA-256 `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`）は別atomとして保全し、この521行監査で一体化しない。
- 条件の意味分類は採択・実装・受入完了の証拠ではない。`unresolved`を含む行単位の比較であり、全source条件の最終割当ではない。


## 現行authority境界

現main `68ffa6f09` のL2/L11比較対象とSHA-256、route source、判断状態はJSONの`comparison_evidence_sources`と`routing_sources`に列挙した。このSHA-256はPO固定revision `f6dad2a33` のfile SHAではない。coveredの旧L65/66を支えるHARNESS-L2-003のL2:106-107と対L11:41-42の条項は、固定revisionと現mainで同じ文言であることを照合した。2026-09-28固定8機構・明示250候補の採択範囲を拡張せず、候補やsection routeから採択を推定しない。REG-03/REG-05等の未解消残件も閉じたと主張しない。

行ごとのsource text/digest、condition cluster/status、比較理由、target refsは同梱JSONの521 recordsに保持した。後続版／L3具体化／最終割当は対象別pairとauthorityに従う。

## 後続追補：旧L650の保持先候補

基準main後、旧v1.3 §10 L650（`REQSRC-SUP-00507`、行SHA-256 `c9587a6500b2a47d8827b8e9e2c966b9b79e63a1d1b01263f32b7dd8ff978f01`）と同文のbaseline L631（`V13-BASE-6FAB-L0631`）を別revision atomとして、未採択のHARNESS-L2/L11-039へ追補した。r3 receiptはこの2 atomを加えた24 atomの局所`no_loss`、生存registerは`MPR-RC-HARNESS-L2-039-003`である。7軸のcurrent UX evidenceと欠落・stale時のUX完成拒否を候補本文と対受入に明記した。候補のPO採否はまだないため、この監査のL650は`unresolved`のままとし、formal successorや受入実行を生成しない。

比較根拠とrouting sourceに列挙した現行ファイルの存在・記載SHAを確認した。旧source本文中に埋め込まれた過去のpath文字列のうち、現行repoに存在しないものはsource記録として保持し、current target linkとして検証済みとは扱わない。
