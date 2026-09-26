# Worker統合に伴う旧実行主体の分類監査

status: audit_record
authority_effect: none
recorded_at: 2026-09-26（Asia/Tokyo）
base_commit: `578d335b3146bfe133d4b49684b7dcdceb818843`（origin/main）
source: [POの原文](../../concept/sources/worker-execution-model-po-original-2026-09-26.md)
decision_record: [Worker実行モデルのPO判断](../decisions/worker-execution-model-po-decisions-2026-09-26.md)

## 1. 記録の範囲

2026-09-26、POは実行主体をWorkerへまとめると決めた。独立した上位概念として廃止するのは、HELIXサブエージェント、エージェントレーン、
Runner（共通部品）、Sandbox（共通部品）の4つである。POの移行条件（[原文](../../concept/sources/worker-execution-model-po-original-2026-09-26.md)
「6. Migration条件」）に従い、これらに結び付く要求・設計・実装・テスト・設定・Hook・CI・文書を洗い出し、分類した。

- 対象のrevision：origin/main `578d335b3146bfe133d4b49684b7dcdceb818843`。作業ツリーで進んでいる本文の改訂は含めない。行番号はすべてこのcommitのものである。
- 検索語：`runner`、`sandbox`、`サンドボックス`、`エージェントレーン`、`レーン`、`サブエージェント`、`subagent`（英字は大文字小文字を区別しない）。
  英語の`lane`は語数が多いため、書き換えが必要な現行文書と旧HELIXの資産でだけ行を読んだ。
- 検索範囲：`docs/`（115ファイル、1,226か所）、`scaffold/`（192ファイル、735か所）、
  `archive/legacy-generation-2026-09-14/root/`（`src/` 102、`tests/` 108、`docs/` 1,496、`.claude/` 7、`.codex/` 1、
  `.github/` 4、`config/` 8、`requirements-ir/` 5、`.helix/` 40ファイル）。repository直下の`AGENTS.md`、`CLAUDE.md`、`README.md`、`.github/`には該当がない。
- 旧HELIXの資産は読むだけにした。旧CLI・hook・test・CIは実行していない。[資産明細台帳](../legacy-asset-disposition.jsonl)は変更していない。
- 本書はその時点の監査記録であり、書き換えない。訂正は後続の記録で行う。本書から承認、要求の採否、Issueのclose、下流の完了は生じない。

## 2. 分類の区分

| 区分 | 意味 |
|---|---|
| retain→Worker | 能力を残し、Workerの実行能力・lifecycle・receipt・内部のSubagentへ移す |
| retain→SECURITY | 能力を残し、実行の制約と権限としてHELIX-SECURITYへ移す（強制はWorkerの実行環境が行う） |
| retain→Runtime Infrastructure | 能力を残し、物理資源と隔離の仕組みとして実行基盤へ移す（POが別に提案したHELIX-INFRASTRUCTUREはPR #2148の構想段階で、Conceptに未収載） |
| replace | 目的は残し、廃止概念に依存する形（固定lane、Subagentによる独立reviewの代用など）を置き換える |
| retire | 能力ごと不要とする |
| 記録（書き換えない） | 判断記録、POの発言記録、source snapshot、監査、append-onlyの台帳、旧本文を引用する棚卸。その時点の記録として残す |
| 別の意味 | 同じ語を別の意味で使っている（GitHub・CIのrunner、test runner、VS CodeのGUIセッションなど） |

本監査でretireに当てはまる能力は見つからなかった。

## 3. 現行文書（`docs/`）

「行」は書き換えが必要な、現在の意味を述べる行である。

| path | 件数 | 何を述べているか | 区分 | 対応 |
|---|---:|---|---|---|
| `docs/concept/helix-concept.md` | 14 | 1.0の機構にRunner／Sandbox（45）、1.0の図（65）、「8つの機構と2つの共通部品」（111）、実行者「エージェントレーン・HELIXサブエージェント」（139）、Runner／Sandboxの節点と矢印（141、151〜153、157、177、190、201、202）、OSが「エージェントレーンとHELIXサブエージェントへ割り当てる」（213）、機構表のRunner／Sandbox行（221） | retain→Worker／SECURITY | Workerへ書き換える。行：45、65、111、139、141、151、152、153、157、177、190、201、202、213、221。機構表の行を削り、Workerは図と本文で示す。共通部品はCONNECTの1つになる |
| `docs/concept/product-boundary.md` | 2 | 「8機構と2共通部品」、1.0にRunner／Sandbox（7）、外部実行統制をRunner／Sandboxへ分ける（87） | retain→Worker／SECURITY | 書き換える。行：7、87 |
| `docs/concept/helix-five-goals.md` | 1 | 目標「1 自走」の担い手にRunner／Sandbox（68） | retain→Worker | Workerへ書き換える。行：68 |
| `docs/concept/helix-structure-tvo-po-statements-2026-09-18.md` | 5 | 推進「レーン、サブエージェント」（50）、実行者「エージェントレーン、HELIXサブエージェント」（94）、Issue #1859の題名（179）、付録のPO発言の引用（194、201） | retain→Worker（本文）、記録（179、194、201） | ファイル名は発言記録だが、本文は「通常の改訂で直す」仮説である（冒頭10行目）。行50、94を書き換える。179はIssue題名、194と201はPO発言の引用なので書き換えない |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 7 | HELIXOS-L2-004「実行はRunner／Sandbox」（57）、旧文書名「常駐レーン」「三社レーン」「旧Three Lane候補」「旧三社lane」（70、71、203、211）、resource profileの`runner`数（209）、「固定レーン数」（271）、CI結果のrunner（278）、`provider lane`を別名にしない（474）、HXT-RQ-04「開発レーン」（527） | retain→Worker | 書き換える。行：57、271（固定Worker数）、527（Workerのcapacity）。70、71、203、211は旧文書名、474は旧語を名指す禁止文なので残す。209は実行資源の数（Runtime Infrastructureの資源）、278はCIのrunnerで、変更不要 |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | 1 | HELIXOS-L2-004「実行はRunner／Sandbox」（24） | retain→Worker／SECURITY | 書き換える。行：24 |
| `docs/helix-labo/L1-planning/labo-intent.md` | 2 | 実験の実行はRunner／Sandboxと接続（55）、隔離・運転の問題をRunner／Sandboxへ返す（57） | retain→Worker | 書き換える。行：55、57 |
| `docs/helix-intelligence/candidates/audit-bounded-repair-requirements.md` | 2 | 隔離適用を「HELIX-Runner／Sandbox（実行）」が担う（49）、常駐レーンを追加しない（68） | retain→SECURITY（49）、retain→Worker（68） | 書き換える。行：49（制約はSECURITY、強制はWorkerの実行環境）、68（新しい常駐の実行主体を追加しない） |
| `docs/governance/new-generation-start-here.md` | 1 | 責務差分の候補にRunner／Sandbox（52） | retain→Worker | 書き換える。行：52 |
| `docs/governance/helix-structure-requirement-coverage.md` | 23 | 層の名前「OS：推進（チケット発行・レーン・サブエージェント）」とその所見 | retain→Worker（層の名前）、記録（旧要求本文の引用） | 現在の分類を述べる文書（status `draft_review_pending`）。層の名前を書き換える。行：39、51、190、196、261、267、279、280、282、289、359、362、374。366はHELIXOS-L2-004本文の写しなので、L2の改訂に合わせる。111、189、202、210、214、222、230、231、242、250は旧要求本文の引用で、書き換えない |
| `docs/governance/legacy-ir-structure-classification.md` | 38 | 同じ層の名前、分類の理由「レーン、ベンチ、CI」（107）、旧システム名（OS Contract Runner、Worker Sandbox Contract、Detector Registry/Runner）と旧本文の引用 | retain→Worker（層の名前）、記録（旧名と引用） | 現在の分類を述べる文書（status `draft_review_pending`）。書き換える行：46、72、107、120、123、130、131、133、136、147、148、150、153、441、533、534、606、731、732、759、765、801。145、154、156、161、282、284、444、448、598、633、636、640、641、643、689、741、745は旧名・旧本文なので書き換えない。機械台帳の鍵`os_promotion`は名前を含まないので変えない |
| `docs/governance/crosswalks/concept-mechanism-version-requirement-crosswalk.md`と同名の`.jsonl` | 1＋37 | 製品属性「Runner／Sandboxは共通部品」（md 14）。jsonlの33行がRunner／Sandboxかsandboxを含み、うち32行が`mechanism_candidate`に持つ（13、17、69、78、97、104、134〜139、148、153、157、158、176〜179、182〜184、187、188、209〜215行。96行は原文だけ） | retain→Worker／SECURITY／Runtime Infrastructure（行ごと） | 現在のConceptを基準にする候補対応表（md 3行目）。md 14を書き換え、jsonlの33行を行ごとに付け直す（4.の表の対応） |
| `docs/governance/candidates/legacy-rule-derived-requirements.md` | 7 | 規則の群名「レーンと委譲」（79）、`RUL-OSP-01`の説明「レーンと役割」（399）、例文のrunner（267、293、443）、SubagentStopの例（592）、Issue #1864の題名（624） | retain→Worker（79、399）、別の意味（267、293）、記録（443、592、624） | 書き換える。行：79、399。267はGitHub Actionsのrunner、293はtest runner。443、592は旧atomの引用、624はIssue題名 |
| `docs/governance/feature-tickets/FT-OS-REVIEWHANDOFF-001.md`、`README.md` | 3＋1 | VS Code GUIの「実行レーン」と「レビュー／マージレーン」の通知（FT 3、27、README 27）、Issue #1864（FT 42） | retain→Worker | レーンは各GUIセッションに置いたWorkerの見方であり、authorityを持たせていない。POの原文（RETIRE-WORKER-005）は、この用法でのLaneの名前を残すことを認めている。変更は必須でない。次の改訂で、各レーンがどのWorkerかを明記する |
| `docs/governance/crosswalks/legacy-concept-derived-requirements.md` | 1 | 内部のsubagentを独立したauthorityへ昇格させない（114） | retain→Worker | POの方針（RETIRE-WORKER-003／004）と一致しているので、変更しない |
| `docs/governance/legacy-ir-w1-human-decision-candidates.md` | 3 | 旧原要求の引用（59、75）、整理の注記（61） | 記録 | 59と75は引用。61は既に「実行Worker」を使っているので、変更しない |
| `docs/governance/legacy-ir-w1-business-rehome-queue.md`、`w2-functional`、`w3-nonfunctional` | 3＋4＋3 | 旧IR本文の引用（`>`の行） | 記録 | 書き換えない |
| `docs/helix-os/candidates/next-generation-ci-requirements.md` | 2 | CIのrunner（31、46） | 別の意味 | 変更しない（CIのrunnerの意味） |
| `docs/helix-harness/L2-requirements/product-requirements.md` | 1 | CI profileのrunner（119） | 別の意味 | 変更しない |
| `docs/governance/candidates/scaffold-binding-requirements.md` | 4 | 仮のrunner・仮CI（38、60、84、122） | 別の意味 | 変更しない（CIの実行器の意味） |
| `docs/governance/github-codeql-default-setup-backup-2026-09-15.json` | 3 | GitHubの`runner_type`（24、25、44） | 別の意味 | 変更しない |
| `docs/governance/crosswalks/concept-requirement-po-decision-packet.md` | 38 | 機構候補「HELIX-OS／HELIX-BRAIN／Runner／Sandbox／HELIX-Security」など（222〜226、270〜274、850〜922、959〜1071） | 記録 | 2026-09-24にPO判断を求めた時点の候補一覧として残すと、冒頭5行目が定めている。書き換えない |
| `docs/governance/crosswalks/po-optimal-draft-packet.md` | 1 | 「実行はRunner／Sandbox」（26） | 記録 | 判断を求めた時点の一覧（3〜4行目）。書き換えない |
| `docs/governance/decisions/`の2ファイル | 3 | 2026-09-24の判断「実行はRunner／Sandbox」（concept-requirement-po-decisions-2026-09-24.md:120）、2026-09-19の仮runner（l2d-s0…:90、198） | 記録 | 書き換えない。2026-09-26の判断記録が後続になる |
| `docs/governance/intake/helix-os-foundation-directive-2026-09-14.md`、`candidates/helix-os-organization-intake-2026-09-14.md` | 2＋1 | 2026-09-14の指示とintake（runnerへの配車） | 記録 | 日付付きのintakeなので書き換えない |
| `docs/helix-labo/sources/labo-core-engine-po-original-2026-09-26.md` | 3 | POの原文の図（39、55、670） | 記録 | source snapshotなので書き換えない |
| `docs/governance/requirements-source/`（18ファイル） | 118 | 旧要求文書・旧Requirement IRの複製 | 記録 | source snapshotなので書き換えない |
| `docs/governance/audits/source-rebaseline/`（29ファイル） | 107 | 過去の監査、対応表、棚卸（例：concept-rehome-binding-impact-audit.md:160、new-generation-worker-capacity-source-crosswalk.md:29） | 記録 | 書き換えない |
| `docs/governance/*.jsonl`（29台帳。`legacy-asset-disposition`、`legacy-rule-atom-inventory`、`legacy-requirement-semantic-line-carry-forward`、`legacy-requirement-implementation-crosswalk-bootstrap`など） | 761 | 旧本文、旧path、旧atomの転記 | 記録 | 1行にまとめた。書き換えない |
| `docs/governance/legacy-requirement-direct-semantic-review-wave*.meta.json`（4）、`docs/governance/tools/verify_*.py`（2） | 22 | review waveの記録と、それに埋め込んだ旧atom | 記録 | 書き換えない |
| `docs/governance/phase-capability-inventory.json` | 1 | 旧path `src/orchestration/loop-runner.ts`（667） | 記録 | 書き換えない |

## 4. 旧HELIXの資産

pathは`archive/legacy-generation-2026-09-14/root/`からの相対である。「台帳」は[資産明細台帳](../legacy-asset-disposition.jsonl)の行番号と`disposition`である。
台帳の`disposition`は、source snapshotとして保全した29件を除き、すべて`unresolved`（3,991件）である。本監査は台帳を変えない。

### 4.1 要求・候補

| path(:行) | 持っている能力 | 区分 | 移管先 | 台帳 | 衝突 |
|---|---|---|---|---|---|
| `docs/design/helix/L1-requirements/pillar-requirements.md:96`（HBR-P2） | 作成したWorkerの自己承認を拒否する。単一runtimeでは`intra_runtime_subagent`と記録し、cross-agentを名乗らず、自己reviewをgateのPASS根拠にしない | retain→Worker | Worker（作成と検証の分離） | 425 `source_snapshot_preservation` | なし。POの原文（RETIRE-WORKER-004）と同じ向きで、Subagentのreviewを独立検証の代わりにしない |
| `docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md:93`（GH-FR-008） | runtime間のreview。単一runtimeでは「独立subagent receipt」を代わりの証跡とする | replace | Worker（独立検証は別Workerが行う） | 449 `unresolved` | **POと衝突。** Subagentのreceiptを独立reviewの代わりにしている。作成と判断の分離、所見のseverity・根拠・dispositionの必須化は残す |
| `docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md:39-41`（3L-BR-001） | 第一級laneをCodex、Cursor Cloud、Claude Reviewの3つに固定する | replace | Worker（役割とcapacityの属性） | 428 `source_snapshot_preservation` | **POと衝突。** laneをidentityとして固定している |
| `docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md:37-41`（3L-R-01〜03） | 3L-R-01 laneを3つに固定、3L-R-02 modelとlaneの分離、3L-R-03 laneとruntimeの可用性の分離 | replace（R-01）、retain→Worker（R-02、R-03） | Worker（R-02はRETIRE-WORKER-009と同じ）、Runtime Infrastructure（R-03の可用性） | 489 `unresolved` | **R-01はPOと衝突。** 現行のOS L2（governance-requirements.md:209）は既に固定数を恒久要件にしないとしている |
| `docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md:98-107`（BR-8） | 常駐レーン、providerのnative subagent、CLI workerを別のidentity・capacity・receiptとする。subagentは親laneのscope・branch・budgetを継ぐ | replace（別identityの3分類）、retain→Worker（継承の規則） | Worker（Subagentは親Workerの内部） | 426 `source_snapshot_preservation` | 3種類を並べて実行主体にする点がPOと衝突する。継承の規則はRETIRE-WORKER-003と同じ |
| `docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` §7.2〜7.4（237-300）、§7.5（302-313）、§10（446-） | provider別の常駐レーンの責務、sub-agentの境界（scopeを広げない、独立leaseを持たない、使用量は親のbudgetに入れる）、レーンの状態機械 | replace（§7.2〜7.4のprovider別レーン）、retain→Worker（§7.5、§10） | Worker（Subagentの境界、実行lifecycle）、OS（割当） | 477 `unresolved` | §7.5はPOと一致する |
| `docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md:30-61` | 親TL（Sol）と内部worker（Luna）を別のidentityとreceipt欄にする。Solをsubagentとして起動しない | replace（provider固有の経路）、retain→Worker（親と内部の区別） | Worker（RETIRE-WORKER-007：Subagentは親Workerまで辿れる） | 442 `unresolved` | model名の経路を恒久要件にしている点を置き換える |
| `docs/design/helix/L3-requirements/worker-common-contract.md:57-58`（WCC-FR-03／04）、`:95-96` | 全workerを隔離worktreeで動かし、repository本体・DB・`.helix/`・credentialへ届かせない。networkは既定で拒否する。providerのpermission promptをsandboxの証拠にしない | retain→SECURITY、retain→Runtime Infrastructure | SECURITY（制約）、Runtime Infrastructure（worktreeの払い出し）、Worker（実行時の強制とreceipt） | 497 `unresolved` | なし |
| `docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:42`（HR-FR-HIL-08） | teamのlease、run、checkpoint、verify、release、quarantine、retireをfencing付きで正本化する。workerとverifierを同じにしない | retain→Worker | Worker（実行lifecycle）、OS（lease、割当） | 461 `unresolved` | なし |
| `docs/governance/candidates/execution-ticket-requirements.md:141、222、315、478` | Assignmentにowner、lane、runtime descriptorを持たせる。sandboxの費用を区分する。sandbox境界とworker・judgeの独立性 | retain→Worker（lane欄はWorkerの記述子へ）、retain→SECURITY（478） | Worker、SECURITY | 814 `unresolved` | なし |
| `docs/governance/candidates/three-lane-capacity-profile-requirements.md` | 三社レーンのcapacity profile | retain→Worker（配置とcapacityの属性）、replace（三社固定） | Worker | 873 `unresolved` | 三社固定の部分はPOと衝突する |
| `requirements-ir/requirements.json`のHIL-BR-32、HIL-FR-08／27／64〜69、HIL-NFR-14／18／37／38／39／40、HIL-TR-03／08／09 | 第三者workerの隔離、環境変数の最小化、出力の再検証、sparse worktree、委譲protocol、委譲の監査証拠、IPC、lease失効、quota枯渇時の退避 | retain→Worker／SECURITY／Runtime Infrastructure（IDごと） | 3.の対応表jsonlの33行で付け直す | IR 5ファイル | なし |
| 同上のHIL-FR-34、HIL-NFR-09／19、HIL-TR-04／05 | OS Contract Runner：Linux、macOS、WindowsのOS差をadapterで吸収し、同じfixtureで検査する | 未定 | 6.を参照 | 同上 | なし |

### 4.2 設計

| path(:行) | 持っている能力 | 区分 | 移管先 | 台帳 | 衝突 |
|---|---|---|---|---|---|
| `docs/design/helix/L4-basic-design/worker-isolation-broker.md:48`（L5、L6、PLANも同名） | 隔離brokerを1つにし、provider別のsandbox serviceと第二のledgerを作らない | retain→SECURITY、retain→Runtime Infrastructure | SECURITY（policy）、Runtime Infrastructure（仕組み）、Worker（実行時の強制） | 533、597、758、1194 `unresolved` | なし。独立したSandbox部品を作らないという点で、POと同じ向きである |
| `docs/design/helix/L4-basic-design/worker-isolation-policy.md:45`（L5、L6、PLANも同名） | 隔離policyを1つのmoduleにし、既存brokerへつなぐ | retain→SECURITY | SECURITY | 534、598、759、1195 `unresolved` | なし |
| `docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md:20`（L5、L6、PLANも同名） | worker実行を`requested→admitted→sandboxed→running→…`として再生し、receiptを作る | retain→Worker | Worker（lifecycle、receipt）。`sandboxed`はSECURITYの制約を適用した状態として読む | 535、599、760、1201 `unresolved` | なし |
| `docs/design/helix/L6-function-design/runner-attestation-journal-authority.md:20-28` | testとgateの実行結果（runner attestation）の書き手を1つにし、crashの後に巻き戻すか完了させる | retain→Worker | Worker（execution receipt）、OS（証拠の保存） | 729、2117、2723 `unresolved` | なし |
| `docs/design/helix/L6-function-design/independent-review-fallback.md` | 主のreviewerが使えない時に、別のprovider（Kimi）でreviewする。bubblewrapの空workspaceで実行する | retain→Worker（別のWorkerによる独立review）、retain→SECURITY／Runtime Infrastructure（隔離） | Worker、SECURITY、Runtime Infrastructure | 673、2009、2676 `unresolved` | なし。別のproviderなので、POの「別Worker」に当たる |

### 4.3 実装・設定・Hook・CI・テスト

| path | 件数 | 持っている能力 | 区分 | 移管先 | 台帳 | 衝突 |
|---|---:|---|---|---|---|---|
| `src/runtime/`の隔離：`isolated-worktree-sandbox-runner.ts`、`worker-isolation-broker.ts`、`worker-isolation-policy.ts`、`machine-safety-guard.ts`ほか（sandboxの語を含む`src/`は20ファイル） | 20 | worktreeの計画、書込可能path、network・credentialのpolicy、後始末の証拠 | retain→SECURITY、retain→Runtime Infrastructure | SECURITY、Runtime Infrastructure、Worker（強制） | 3185、3250、3251、3195 `unresolved` | なし |
| `src/runtime/worker-lifecycle-receipt.ts`、`src/state-db/closure-evidence-runner.ts` | 2 | 実行lifecycle、subprocessのexit code・signal・stdout・stderr・timeout | retain→Worker | Worker（RETIRE-RUNNER-001の能力） | 3252、3342 `unresolved` | なし |
| Subagentの統制：`src/runtime/agent-guard.ts`、`agent-guard-policy.ts`、`agent-slots.ts`、`specialist-agent-registry.ts`、`config/specialist-agent-registry.json`、`.claude/hooks/agent-guard.ts`、`.claude/settings.json:12、90-97`、`.codex/hooks.json:67-74` | 8 | subagentのallowlist、並列数の上限、SubagentStopでのslotの解放、専門agentの登録 | retain→Worker（Subagentの使用と使用量を親Workerへ結ぶ）、retain→SECURITY（allowlistは権限の上限）、replace（provider固有のhook配線） | Worker、SECURITY | 3129、3128、3134、3229、250、30、34、36 `unresolved` | provider固有の仕組みを共通仕様にしない（RETIRE-WORKER-002） |
| laneの割当：`src/runtime/resident-lane-assignment.ts`、`review-lane-closure.ts`、`cursor-cloud-run-authority.ts`、`src/team/run.ts`、`launch-policy.ts` | 5 | 常駐レーンへの割当、review laneの完了、Cursor Cloudの実行権限、hybrid teamの構成 | retain→Worker（割当はOS、実行はWorker）、replace（固定のprovider lane） | Worker、OS | 3213、3217、3157、3384、3380 `unresolved` | 固定laneの部分は3L-BR-001と同じ衝突 |
| Subagentによるreviewの代用：旧`AGENTS.md:209`、旧`CLAUDE.md:282`、旧`.claude/CLAUDE.md:108`、`src/gate/review-tier.ts`、`src/lint/review-evidence.ts`、`src/audit/pr-review-route.ts`、`src/orchestration/pair-agent.ts`、`.claude/commands/ship.md`、`sdd-review.md`ほか | 22 | 単一runtimeでは`intra_runtime_subagent`をreviewの代わりの証跡として受け入れる | replace | Worker（自己検査として記録し、独立検証は別Workerへ割り当てる） | 210、211、1ほか `unresolved` | **POと衝突**（RETIRE-WORKER-004）。自己reviewだけでPASSにしない点は残す |
| `.github/scripts/install-bubblewrap.sh`、`.github/workflows/harness-check.yml:231、948` | 2 | CIでbubblewrapを入れ、隔離backendを用意する | retain→Runtime Infrastructure | Runtime Infrastructure（隔離の仕組み）、SECURITY（制約） | 46、50 `unresolved` | なし。bubblewrapなど具体の技術は固定しない |
| `.github/workflows/harness-check.yml:9、35、108-170`、`claude-unanswered-review-audit.yml`の`RUNNER_TEMP` | 2 | CI jobのlane、GitHub Actionsのrunner | 別の意味 | ― | 50、48 `unresolved` | なし |
| `tests/`（108ファイル。sandbox 17、subagent 41、lane 43、runner 47、`intra_runtime_subagent` 20） | 108 | 上の実装の試験。例：`tests/worker-isolation-broker.test.ts`、`tests/three-lane-ir-admission.test.ts`（台帳3923）、`tests/resident-lane-orchestration-requirements.test.ts`（3823）、`tests/isolated-worktree-sandbox-runner.test.ts`（3674） | 試験対象の分類に従う | 試験対象と同じ | `unresolved` | 旧testは実行せず、合格を新世代の証拠にしない |
| `src/`の残り（runner 46、lane 51、subagent 37ファイルのうち上に挙げなかったもの） | ― | 多くはtest runner、CI、GUIの表示laneなど | 別の意味または上の群に従う | ― | `unresolved` | 個票は6.のとおり後続で作る |
| `.helix/`（audit 12、evidence 25、memory・review・config 各1） | 40 | 旧世代の監査・証拠・状態 | 記録 | ― | ― | 書き換えない |
| `docs/`の残り（plans 1,073、design 154、governance 82、test-design 79、archive 26、templates 24、skills 21、research 16ほか） | 1,496 | 旧PLAN、設計、試験設計、adapter用の`.claude/agents`の雛形、skill | plans・archive・researchは記録。design・test-designは4.2の各群に従う。templatesのsubagent定義はretain→Worker（provider-nativeのSubagent）。skillsの`intra_runtime_subagent`の代用はreplace | 各群と同じ | `unresolved` | 個票は6.のとおり後続で作る |

## 5. scaffold

| path(:行) | 件数 | 何を述べているか | 区分 | 対応 |
|---|---:|---|---|---|
| `scaffold/bindings/SCF-B-0148.json:7、154`、`SCF-B-0150.json:7、151` | 6 | owner_candidate「Securityの許可・隔離、Runner／Sandboxの実行へ単体と接続を分離」 | retain→Worker／SECURITY | owner_candidateとboundaryの文言を、Workerの実行（制約はSECURITY）へ付け直す。scfctlの手順で行う |
| `scaffold/bindings/SCF-B-0003.json:5、9、44、48、58`、`scaffold/review-handoff/README.md`、`gui_mailbox.py` | 5＋14 | VS Code GUIの実行レーンとレビュー／マージレーン | retain→Worker | 3.のFT-OS-REVIEWHANDOFF-001と同じ。レーンはWorkerの見方で、変更は必須でない |
| `scaffold/governance/rules/RUL-OSA-01.md:31、39、41、50、52、53、60、79、83、122、137`、`RUL-OSA-02.md:53` | 18（うち代用に当たるのは挙げた12行。RUL-OSA-01の残り6行は下の行と同じ記録） | 単一runtimeの判断gateで専門サブエージェントのreview（`intra_runtime_subagent`）を必須とし、代わりの証跡にする（例：41のRB04-020） | replace | **POと衝突**（RETIRE-WORKER-004）。生成物なので手で直さない。採否の時に、Subagentのreviewを自己検査として扱い、独立検証は別Workerとする形へ置き換える |
| `scaffold/governance/rules/`のほか26ファイル（RUL-COR-04、RUL-OSP-03、RUL-OSM-02、RUL-OSP-06など） | 130 | 旧規則atomの引用。群の鍵`lane_delegation` | 記録 | 候補（legacy-rule-derived-requirements.md）から生成される。鍵は名前を含む表示ではないので変えない |
| `scaffold/governance/README.md:52` | 1 | 「AIレーン設定の引き継ぎは #1864」 | 記録 | Issue題名なので書き換えない |
| `scaffold/phcap04-05-requirement-acceptance-research/inventory.json:675`、`phcap08-09-wbs-ticket-static/inventory.json:2672`、`phcap12-13-review/inventory.json:2024`（governance-acceptance.mdの1〜33／42／45行。24行を含む）、`phcap10-11-worker-ci-static/inventory.json:650`、`phcap14-release-research/inventory.json:890`（governance-requirements.mdの57〜61／64行）、`phcap15-deploy-pool12-research/inventory.json:318、343、368、393`（product-boundary.mdの1〜10行） | 5＋4 | 書き換える行を含む現行本文を`exact_text`または`span_sha256`で固定している | retain（固定位置の付け直し） | 本文の改訂に合わせて固定位置を付け直す（validatorの条件は変えない） |
| 現行文書4つのファイルSHA-256を固定しているscaffold（helix-concept.md 3、product-boundary.md 143、governance-acceptance.md 18、governance-requirements.md 31。重複を除いて150ファイル、うちbinding 123） | ― | 対象文書の版を固定している | retain（固定の付け直し） | 本文の改訂でscfctlがstaleにする。既存のscfctlの手順で付け直す。分類の対象ではない |
| 上記以外の`inventory.json`（24）、研究・証拠・source snapshot（`rdp001-*`、`*-evidence-*`、`legacy-*-classification-*`、`legacy-semantic-review-wave*`など） | ― | 旧本文の引用、旧資産の研究用製品分類（例：`legacy-runtime-product-classification-0117/generate.py:84`が`isolated-worktree-sandbox-runner`をHELIX-OSへ置く） | 記録 | 研究用で`authority_effect`はnone。書き換えない。製品分類は後続の分類で見直す |

scaffoldの該当は192ファイル、735か所である。上の表はこれを8群にまとめた。

## 6. 移管先が決まらない項目

POの条件に従い、次の項目は削除しない。今の場所に残したまま、移管先が決まるのを待つ。

| 項目 | 根拠 | 決まっていないこと |
|---|---|---|
| Runtime Infrastructureへ移す能力（物理資源、資源のcapacityと状態、隔離の仕組み、bubblewrapの導入、3L-R-03の可用性） | 4.1のworker-common-contract、4.2のworker-isolation-broker、4.3のinstall-bubblewrap.sh | 移管先は決まっているが、受け皿の機構（HELIX-INFRASTRUCTURE）はPR #2148の構想段階で、Conceptに入っていない。Conceptに入るまで、今の文書と台帳の場所に残す |
| OS Contract Runner（HIL-FR-34、HIL-NFR-09／19、HIL-TR-04／05） | `requirements-ir/requirements.json`。現行の対応表jsonl 104、148、158、183、184行はRunner／Sandboxだけを機構候補にしている | OSごとの違いを吸収するadapterの検査を、Workerの実行能力、Runtime Infrastructure、HARNESSの検証契約のどれに置くかが決まっていない |
| Workerの要求を置く文書 | Workerは機構表に置かない（PO判断）。POの原文（RETIRE-WORKER-014）は、Workerを割り当てるのはOSだとしている | Workerのlifecycle、capability、receiptの要求を、OSのL2（現在のgovernance-requirements.mdの「Worker・学習・ログ・CIの具体条件」節）に置くか、別の文書にするかが決まっていない |
| 旧資産の個票 | 4.3の`src/`の残り、`tests/`、`docs/`の残り（1,496ファイル） | 数は数え終えたが、1ファイルずつの分類は代表の資産と群の規則までで止めた。個票は後続で作る。それまで台帳は`unresolved`のままにする |

同じproviderの別Workerを独立検証として認めるかどうかは、POの原文（RETIRE-WORKER-004、009）からは読み切れない。
これは意味の判断であり、能力の欠落ではない。受け入れの前にPOへ確かめる候補とする。

## 7. 集計

表の行を単位に数えた。複数の区分を持つ行は、各区分に1つずつ数えた。

| 区分 | 3. 現行文書 | 4. 旧HELIX | 5. scaffold | 計 |
|---|---:|---:|---:|---:|
| retain→Worker | 15 | 16 | 2 | 33 |
| retain→SECURITY | 5 | 8 | 1 | 14 |
| retain→Runtime Infrastructure | 1 | 6 | 0 | 7 |
| replace | 0 | 11 | 1 | 12 |
| retire | 0 | 0 | 0 | 0 |
| 記録（書き換えない） | 16 | 2 | 3 | 21 |
| 別の意味 | 5 | 1 | 0 | 6 |
| 固定位置の付け直し | 0 | 0 | 2 | 2 |
| 未定（6.） | 0 | 1 | 0 | 1 |

4.3の`tests/`と`src/`の残りの2行は、試験対象や上の群に従うとしたので数えていない。

書き換えが必要な現行文書は、3.の表で行番号を挙げた13行、14ファイル（対応表はmdとjsonlの2つ）である。
POと衝突する旧資産と規則は、GH-FR-008（github-autonomous-operations-requirements.md:93）、3L-BR-001と3L-R-01（固定lane）、
BR-8（3種類を並べた実行主体）、`intra_runtime_subagent`による代用（旧AGENTS.md:209ほか、RUL-OSA-01:41ほか）である。
pillar-requirements.md:96は、Subagentのreviewを独立検証の代わりにしない点でPOと一致している。
