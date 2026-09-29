# confirmed175 FR-L1-07 event capture scope frame（2026-09-29）

## 基準と位置づけ

基準HEADは `fc8add40776f3b176eb97e9c8ffffb8ac5835c5b`（origin/main、PR #2331 merge後）。本記録はconfirmed175の旧source atom `FR-L1-07` と、採択済みHELIXOS-L2/L11-019との条件境界を静的に照合する。旧sourceは参照のみとし、旧hook、CLI、runtime、test、CIは実行しない。

このframeは監査記録であり、要求候補、owner移管、formal successor、MPR登録、採択、source closureを作らない。source identity ledger上のcarry statusは `confirmed::preserved_pending_rehome`、successorは未割当のままである。

## 旧source identity

| 項目 | 値 |
|---|---|
| confirmed identity | `harness/L1-requirements/functional-requirements.md::FR-L1-07` |
| asset | `LEGACY-ASSET-6B6C5CB0E481BE01088B` |
| archive path:line | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:38` |
| source file SHA-256 | `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008` |
| source line SHA-256 | `3fe7ef2132ed2b539f14dbdd60a3d375a7a16a04d2b086bb0faf604692c69d82` |
| holding | `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md` |

confirmed175 full auditの当該行は `部分再導出／旧固有条件・反例・数値・出力の一部が未確認` と分類され、`current_target_ids` はHELIXOS-L2-019のみである。event provenanceとfailure-safe projectionは関連条件として残るが、旧hook trigger集合、fail-open session log、forced-stop heuristic、および各実装を現行runtimeの約束としていない。[confirmed175 full audit](legacy-confirmed175-full-audit-2026-09-28.md)にFR-L1-07の行があり、現行follow-up indexにはFR-L1-07固有の追補がない。

## 条件分割と旧consumer／failure文脈

FR-L1-07の一行は、次の意味を分けて読む必要がある。

| 区分 | sourceの記載 | 扱い |
|---|---|---|
| A. state eventの登録 | PLAN起票、コード変更、Codex実行、ゲート通過、停止の5イベントからstateを自動登録し、手動登録漏れを避ける。 | eventとstate projectionの意味を現行OS-019へ照合できる。5 source class全ての自動捕捉・完全性は別の条件で、OS-019の採択だけでは成立しない。 |
| B. session観測の拡張 | SessionStart/PostToolUse/Stopをfail-openで記録し、PLAN単位digestへまとめてcontinuation/audit/FR-L1-19へ接続する。 | 旧source自体がAのstate自動登録（fail-close）と別系統の観測hookと明記する。旧hook名、fail-open runtime、digest実装は引き継がない。 |
| C. forced-stopの拡張 | dangling sessionを強制停止と推定し、是正feedbackを記録する。Recovery起票は人間のyesを要する。 | A/Bから独立した分類・Recovery triggerの意味。現行OS-019への単純なevent-mappingへ混ぜない。 |

旧L6 session-log設計 `LEGACY-ASSET-63550AFA101E73760CEC`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/session-log.md`, file SHA-256 `059a5cc9d40959b32f2fd3a0d1a42282c295bc1a39289e4d093e0cb617d8f5b9`）の§1 `:33`は、PLAN digestをhandover/auditの入力かつFR-L1-07 state登録hookのtriggerと位置づける。同設計`:72`はsession-start記録をI/O failureでもthrowしないものとし、`:113`はSessionStart/PostToolUse/Stopをhook entrypointとしている。これはBのconsumer・実現contextで、現行runtime採用の証明ではない。接続先に挙げる旧FR-L1-19 `functional-requirements.md:50`はLearning Engine、skill/recovery/interrupt/detector情報からrecipe・予防ルール等を扱う別要求であり、FR-L1-07や現行OS-019へ意味を併合しない。

旧L3 acceptance設計 `LEGACY-ASSET-1B92155F959D7905DD1E`（`archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md`, file SHA-256 `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`）`:73–77`は、旧oracleのfailure境界を具体化する。AT-FR-07-01はcommitからPostCommit hookを経てcode_catalogへ追加、-02はpermission denied時にwarn/exit 2としてもgit commit自体は成功、-03は未実装hookをskip+audit/exit 0とする。別系統の-04はsession観測hookのI/O/JSON failureをfail-openとし、記録できた分をappendしdigest idempotencyとsecret/PII sanitizationを要求する。-05はdangling sessionをfeedbackだけにし、Recovery起票候補は人間yes待ちとする。したがって、Aのfailureをsource側のcommit/operation停止と同一視せず、Bのfail-open条件をAへ移さない。

旧L7 unit-test design `LEGACY-ASSET-FAAFFA616A44F65911EB`（`archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L7-unit-test-design.md`, file SHA-256 `0fd9f9dc3ac452fefaa74d3fea79c19a9fe2e162908ed763bfbcc56514186347`）`:278–285`は、session hook recording/digest、invalid inputのfail-open、idempotent digest、session event entrypointsをU-SLOG-001〜008に割り付ける。これらは旧受入設計のconsumer contextに限り、現行OS-019の受入結果には使わない。

## 現行採択済みcoverageと未回復条件

HELIXOS-L2-019は、共通形式event、source/revision、correlation ID、actor、data-use class、実行・検証結果、訂正、checkpoint、未完義務を入力に、episode記録・参照・projection・再開情報を提供する。L2 `:685–689`は欠落・重複・stale・拒否・未実行を成功証拠から分離し、projection/replay失敗を成功checkpointにしない。

HELIXOS-L11-019 `:354–357`は要求等のeventを入力し、episodeを再構築してprovenance・訂正履歴を保持し、missing/duplicate/stale/denied/not-executedとsuccessを分ける。反例は単なる記録件数を完了扱いすること、provider memory/summaryだけで再開すること、重複eventから同じ副作用を二重実行すること等である。この採択済み契約は「受け取ったevent」の保存・projection・continuityを支える。

不足はproducer側の捕捉完全性である。L2/L11-019の入力がevent集合から始まるため、宣言されたproducerが発行したeventが入力集合に入る前に欠落した場合、現行oracleは欠落自体を検出できない。採択済みL11は、5旧event classの網羅、自動hook登録、old event-to-state map、session hook/digest、forced-stop判定を定義しない。よってFR-L1-07全体の完全coverageやfailure-safe captureを採択済みと判定できない。

対象file pin（origin/main `fc8add407`）：HELIX-OS L2 SHA-256 `a36e05f87aa83975e8b344f77d8df0ed2fbd28f3aa19b1a5d22b6e3f85d057fd`、L11 SHA-256 `cd9fbe5299ec89430cb318adaa2d7f8f039b0cc267801eb071e833da28ad48ae`。2026-09-28の[HELIX-OS PO判断](../../decisions/helix-os-requirements-po-decision-2026-09-28.md#採用する明示候補集合)はL2-019を含むHELIXOS-L2-014〜029を固定対象として採用したが、旧FR-L1-07 source atomのsuccessorや完全coverageまでは生成していない。

## 限定negative oracle案

候補とする確認単位は、現行ownerが明示した一つのproducer source/revisionと、そのsourceから渡されたevent/projection関係に限る。

- **正常**：明示されたproducer recordとevent identity/revisionをprojectionへたどれる。既存HELIXOS-L11-019のprovenance/correction/continuity oracleを適用する。
- **反例**：producer recordが「event Eを発行」と示す一方、同じscope/revisionのprojectionにEがない。結果はmissing/unresolvedとして保持し、当該scopeのcapture-completeまたはsuccess checkpointを主張しない。別revisionのeventやrecord件数で穴を補わない。
- **unknown**：producer inventory、source revision、scope、または発行eventの根拠が無い・不一致・staleの場合、未列挙producer/eventが存在しないとは推定しない。該当scopeをunknownのままにし、5種類の旧hookが全て現行の義務であるとも推定しない。

このoracleは宣言済み入力のsource-to-projection欠落だけを確認し、全repoのproducer inventory、自動hook、未提示eventの探索、旧5種の一律必須化、fail-open policy、session digest、forced-stop分類、Recovery起票、人間承認条件を定めない。実装・実行・L11受入を証明しない。

## PO判断境界と推奨

既採択OS-019へ旧event/provenance意味をatom単位で対応づける静的な記録だけなら、新しい上流意味の決定は不要である。これは部分再導出にとどまり、FR-L1-07のsuccessor、採択、旧source closureを意味しない。上記のproducer-completeness negative oracleを現行L2/L11の新しい義務として加える場合は、固定PO対象revisionにない入力関係・受入条件の追加となるため、その採択には対象revision付きPO判断が必要である。現行契約に既にある義務の解釈として記録できるかを、候補・採択と分けて判断する。

PO判断が必要となるのは、現行要求として「どのproducer classを完全捕捉必須にするか」、旧5 classを一律に必須とするか、hook failure時のoperation継続/停止、fail-open session log、dangling sessionをforced-stop/Recovery相当とするかを選ぶ場合である。これらは既採択OS-019の汎用event evidenceを越える要求意味であり、旧L1に現れたことだけで現行1.0義務へ昇格させない。

推奨は、まずsource Aだけを現行L2/L11-019への部分対応としてsource atom単位で記録し、ownerが宣言したproducer scopeに限る欠落negative oracleをL2/L11-019へ適用できるか静的に整理すること。B/Cは別atomとしてholdingに残し、意味の採用または変更を選ぶ場合だけPOへ提示する。FR-L1-07の残りのsource semantics、successor、採択、owner移管は未解決のままとする。

## 照合した現行資料

- [confirmed175 full audit](legacy-confirmed175-full-audit-2026-09-28.md) `:55` と対応JSON row `FR-L1-07`（current target HELIXOS-L2-019、partial classification）。JSON SHA-256: `ca08a81d97e39e94aa02151c7cc4e48f621f9d30baccc1cf9b715331fed38f45`。
- [旧source condition follow-up index](legacy-source-condition-followup-index-2026-09-28.md): 現在の追加候補・限定監査にFR-L1-07の追補はない。file SHA-256: `100ea9496792ca12a2ec33d3231151182a1263eb8934c94466b46334e4a54266`。
- [HELIXOS-L2-019](../../../helix-os/L2-requirements/governance-requirements.md) `:682–690` と [HELIXOS-L11-019](../../../helix-os/L11-acceptance/governance-acceptance.md) `:352–357`。
- [HELIX-OS PO decision](../../decisions/helix-os-requirements-po-decision-2026-09-28.md) `:44–56`。

以上はsource splitとrequirement boundaryの静的監査であり、旧asset consumer全域、全producer捕捉、実装状態、現行受入実行、旧source atomの再配置完了を主張しない。
