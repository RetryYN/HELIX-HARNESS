# confirmed175 FR-L1-46..50 固定L2/L11個票照合

- 基準main: `a3d9f7e205a3d766280c9de4936551f0fef16143`（#2414 merge/read-after後）
- 対象: `harness/L1-requirements/functional-requirements.md::FR-L1-46..50`（5件）
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` / SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`
- 旧資産: `LEGACY-ASSET-6B6C5CB0E481BE01088B`、`preserved_pending_rehome`
- 比較対象: f6固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のHARNESS/HELIX-OS L2/L11。全4文書の固定SHAは同名JSONを参照。
- 判定: 全行 `open_partial_correspondence`。この記録のauthority effectは`none`。adoption、successor、coverage closure、実装/実行成功を主張しない。

## 重複確認と方法

基準main `a3d9f7e205a3d766280c9de4936551f0fef16143` のqueue/full-auditでは5件とも未個別比較のOPEN identityであり、source-qualified identityをrequirements-stage監査群から検索しても個票条件照合の重複はない。full auditとREG-06は母集団・関係join監査として存在するが、本件と同じ個別L2/L11条件比較ではない。旧source、consumer、f6本文、57+11 decisionの静的読取だけを実施した。旧CLI、CI、runtime、testは起動していない。

旧L3ではFR46–49をL4–L6 carryとし、BR-22/Recovery PLAN-RECOVERY-01に結び、W6/W7（roster）、W10（skill）、W11/W12/W16（command）、IMP-033（drift lint）を列挙する。FR50はL6–L8 Add-feature carryで、DDD/TDD SSoT、workflow anchor、Red-first evidence、oracle strength、integration GWTを機械化し、重要gateに定量・定性evidenceを組み合わせる計画だった（旧L3 745–746, 768）。旧L6 GreenDefinition consumerのprofile/required command、missing/non-zero、computed-green/review時刻条件は個票でline SHA付き固定し、旧L3 A-122のhistory/schema/collector/migration/evidence matrix拡張は別の保持点・残差として扱う。この旧計画・残差を現行要件の採択や実装証拠には使わない。

旧screen HM-02はFR46–49を一つの内部資産画面群に束ねる（旧screen 493）。旧inventoryの数値は旧世代の記録値であり現行状態ではない: initial findingはvendor prompts 19、vendor skills 107、当初`docs/skills/` 0、command docs 19、旧CLI binary 70（旧inventory 20–26）。後の旧世代backfillではrosterはPMO9/PdM3/review3/BE2/DB1/DevOps1の計19件、allowlist/path/legacy-commandの旧統制や`helix doctor`結果が記録された（同28–46）。同文書はvendor skillsをread-only・非bulk-load、core/optional/dropに分類してcurateすること、command behaviorをHELIX subcommandとして再実装すること、executable behaviorを旧`src/`で再実装したことも記す（同48–83）。いずれも旧時点のconsumer/実績である。

## 個票

各source行の全文とline SHA-256はJSONの`rows[].source_row`に固定した。現行target IDは既存full audit上の参照であり、後継割当ではない。

### FR-L1-46 — subagent rosterのHELIX化

旧要求はcapability class、model family、guard統合、legacy source前提の除去を含む。旧inventoryは19 promptsの再構成とrole/capability/model boundary、guard整合を説明する。f6のHARNESS Worker/工程契約とOS Worker統制・evidence continuityは責務上の接点だが、個々の旧subagent資産を定義しない。後発decision record上のHARNESS-L2-047は「条件付き採択：A配置（HARNESSが契約生成規範を所有）」である。A配置の場合に限り、選択されたtask/scope/revision/contextに対する専門Workerの必要性・契約に限定して近接する。B配置（INTELLIGENCE配置）なら当該候補は未採択のままでtarget placement/L1 parent/ownerの再登録が必要となる。したがって無条件採択とは扱わない。19 rosterのrename/harden、全model family、guardとの全数整合や旧参照ゼロの移管ではない。

**残差:** 旧roster全件に対する現行catalog、capability/model対応、guard整合、legacy-source residue検出条件はf6固定L2/L11で明示されない。選択Worker条件から全roster移管を推定しない。

### FR-L1-47 — skill packのcuration

旧要求はHELIX版SKILL_MAP、core/optional/drop分類、CLI trigger、legacy用語除去を対象とする。旧inventoryにはvendor snapshot 107件、`docs/skills/` initially 0の記録がある。旧L6のU-FR-46/47はroster capability、skill recommendation/metric inputのunit oracle familyに置かれる（137）。`catalogAutomationAssets`はpath/trigger/capability/search token/drift statusをcatalog化し、drift/empty-catalog/invalid-rootをfindingにする一方、prompt本文/secret/provider transcriptを複写しない（70）。U-FR-47はtask/layer/drive文脈から決定的に推薦し、metadata欠落をfindingとし、skill source docsを書き換えない（284、803–810）。現行pack境界やsource provenanceとの接点はあるが、旧skill catalogと同一ではない。HARNESS-L2-047もA配置に条件付けられた専門Workerの必要性・context selectionに限られ、B配置では未採択・再登録となる。

**残差:** f6固定本文からSKILL_MAP、core/optional/dropの適用ルール、skill metadata/recommendation、CLI trigger、legacy term lintは確定しない。107/0を現行在庫に読み替えない。

### FR-L1-48 — command資産のCLI化

旧要求の範囲はdashboard/asset/builder等を含む。旧L1は70 CLI binariesと19 command docsを数え、旧L6 U-FR-48はcommand docsとCLI surfaceをHELIX subcommand contractへ対応づけ、search rowはrebuildableでauthoring sourceにしないとしていた（L6 285）。f6 OS Worker controlは実行統制の接点だが、旧command catalogではない。

後発HARNESS-L2-052はcanonical command semantic identityとretry/replay分類、依存するHELIXOS-L2-053は対象操作のatomicity/competition/failure isolationに限る（11候補decision）。これは限定されたcommand operation契約であり、旧70 binaries/19 docsのsubcommand再編、全CLI surface、catalog/search authoring規則を定めない。

**残差:** 旧command全件の対応表、現行canonical CLI catalog、authoring sourceとderived indexの関係、旧command coverageはf6固定L2/L11に明示されない。旧CLIは実行・移植していない。

### FR-L1-49 — internal asset drift lint

旧要求はlegacy absolute path、空の`docs/skills`、roster↔guard不整合の検出とfail-close reportを挙げる。旧L6の`catalogAutomationAssets`はapproved rootsを実装内`SOURCES`に固定し、path/trigger/capability/search token/drift statusをcatalog化し、drift/empty-catalog/invalid-rootをfindingとして返す契約だった（70、U-FR-L1-49は138）。後の旧inventoryはpath residue 0、legacy command residue 0、allowlist missing 0を報告したが、それは旧世代の`current-backfilled`文書内の値である。f6の検証義務、pack境界、source/path authorityは一般的な関連性にとどまる。後発のselected detector registryやWorker/command pairは限定scopeであり、旧assets一式のdrift lintではない。

**残差:** 旧3条件を一括検査する現行lint、fail-close挙動、legacy residue zero閾値はf6固定L2/L11で明示されない。旧`helix doctor`/asset-driftは実行せず、旧zero値を現行passへ転用しない。

### FR-L1-50 — DDD/TDD strictness automation

旧L1/L3はdomain boundary、invariant trace、Red-first evidence、oracle strength、integration GWTを挙げ、L6/L7/ReverseのPLAN範囲に機械検出を計画した。旧L6 `function-spec.md:127`（line SHA-256 `d2863ca6e2001dff0f186cd233622b5aa35c504f28206b6b5078e4949c355bae`）では`evaluateGreenDefinition`がartifact kind別profileとrequired command kindを既知とし、computed green time、missing commands、non-zero exits、DB projection refsを返す。confirmed review evidenceはresultがgreenかつ`computed_green_at <= reviewed_at`の場合だけ有効。実装consumer行313（SHA-256 `36df49a8f758853ec8f06beef8b752420ae60c247310cf51479c326b3f45d8b9`）もrequired commandの欠落/non-zero、またはcomputed green timeがreview timeより後ならfailとする。f6 HARNESS-L2-003は工程freeze/backflow/再開と段階状態、L2-004はtraceと変更影響、L2-005はscope/riskから検証義務・oracle/evidenceを導く。各L11は対応する状態、trace、evidenceの受入条件を持つが、旧GreenDefinition全条件とは一致しない。

後発HARNESS-L2-042はDesign Refactorの選択episodeについてsemantic/consumer/oracle/dependency graphと機能追加分離を採択。HARNESS-L2-051はstage-exit evidence completenessに限定される。どちらも旧DDD/TDD全体、全対象のRed-before-Green順序、integration GWT、全gateでのquantitative+qualitative bundleを置き換えない。

**A-122と残差の分離:** 旧L3行770（SHA-256 `b041b014357502cdb9c5015e7cd66c201107054b7377f3ab9ee9c4de714698c9`）のA-122は`test_cases/test_runs/test_results/test_flake_events` history、GreenDefinition、Bun `bun:sqlite` collector/rebuild/migration、CI/hook/OS evidence matrixを束ねた後続拡張案で、L6 GreenDefinitionの基礎consumer条件そのものとは分けて記録する。旧L6行127/313がGreenDefinitionのprofile・command欠落/non-zero・green/review時刻条件を明記し、旧L3 A-122行770はこれを含むhistory/collector/migration/evidence matrixへの拡張を提案する。A-122のhistory schema/SQLite collector/migrationと全gate matrixもf6へ移植済みとはしない。A-124/A-125/A-126はgraph impact、external verification profile、document exportの追加案であり、FR50のGreenDefinition条件と同値ではない（770–773）。

## 後発decisionの扱い

後発57候補decision（42 adopted、11 conditional、4 held）と11候補decision（10 adopted、1 held）を全identityで照合した。JSONに近接した採択pairのdecision record、対象MPR、L2/L11 file SHA、節digest、対象revisionを収録する。候補への近接効果を限定して説明するが、いずれもFR-L1-46..50のsuccessorやclosureを生成しない。decision recordのSHAと完全なpair表はJSONの`later_adopted_pairs_review`を参照。

## 検証結果と限界

- JSON parse、source行・SHA、連続5 identity、重複なし、authority=`none`、successor空、固定f6文書SHA、Markdown whitespaceを静的検証する。
- audit statusは全件`open_partial_correspondence`。carry-forwardは全件`preserved_pending_rehome`のまま。
- 旧consumerの記載は歴史的根拠であり、旧test/CLI/runtime/CIは実行していない。
- この監査は採択、人間判断、実装、受入、step5全体完了を主張しない。
