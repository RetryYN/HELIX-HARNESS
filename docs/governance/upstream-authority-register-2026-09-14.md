# 上流authority管理台帳

status: draft_register
as_of: 2026-09-14

## 台帳の役割

本台帳は、上流再整備で確認すべき母集団と正規入口を管理する。GitHub Issue／PR数を要求件数や進捗分母にしない。
件数は対象集合を特定するための観測値であり、採択・実装・受入・完了を示さない。

| 管理集合 | 現在の母集団 | authority／入口 | 現在状態 | 次の処置 |
|---|---:|---|---|---|
| 最新責務候補 | 1 | [HARNESS・HELIX-OS・個別製品の責務記録](../concept/product-boundary.md) | PO発言の出典記録。exact SHAへの人間decision待ち | 人間判断packetへ束縛し、承認後にConcept／L1／L2の親境界として使う |
| 上流統制方針 | 1 | [上流再整備と既存資産統制方針](upstream-rebaseline-and-asset-governance-policy-2026-09-14.md) | draft policy | 対象別改訂と資産台帳の運用へ適用 |
| 旧世代archive-first隔離 | 4020 Git追跡ファイル | [隔離記録](archive-first-transition-record-2026-09-14.md)、`archive/legacy-generation-2026-09-14/MANIFEST.sha256`、[資産明細台帳](legacy-asset-disposition.jsonl) | 旧実行面・旧文書・旧IRを非実行archiveへ隔離し、全entryを個別`unresolved`行へ展開済み | archive sourceの意味を対象別L2へ採否し、物理削除はしない |
| 旧L0 charter source | 1 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L0-charter/helix-charter_v0.1.md` | historical source。旧confirmedを新世代へ継承しない | P0–P9の意味を対象別L1へ再採否する |
| 旧Concept source | 1 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md` | historical source。旧Core Read・旧製品境界 | v4.1との差分sourceとしてのみ使う |
| 新世代Concept候補 | 1文書 | [Concept v4.1候補](../concept/helix-concept-v4.1.md) | [人間判断packet](audits/source-rebaseline/concept-v4.1-human-decision-packet.md)でexact SHAを固定し直す。v4.0はarchive source | Conceptと4対象L1を別decisionとして人間が判断し、承認後に対象別L2の個別採否へ進む |
| 旧HELIX柱要求 | HBR 9件、HNFR 4件 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` | historical source。旧confirmedを継承せず、工程と実行管理が混在 | [対象別対応](audits/source-rebaseline/pillar-target-crosswalk.md)からL1／L2へ個別採否する |
| 旧要件v1.3 source | 1 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` | historical source。旧Core Read状態とHARNESS／OS責務が混在 | [対象別対応](audits/source-rebaseline/requirements-v1.3-target-crosswalk.md)からL2へ個別採否する |
| 対象別L1 | 4文書、32企画要求案 | HARNESS／HELIX-OS／HELIX-Web／HELIX-Web-OSの各`L1-planning/` | 親Concept v4.1承認待ち。HARNESS 9、HELIX-OS 12、HELIX-Web 6、HELIX-Web-OS 5 | v4.1承認後に導出一致をreviewし、対象別L1を人間承認する |
| 対象別L2 | 4文書、37要求案 | [L2要求入口](audits/source-rebaseline/l2-source-register.md) | HARNESS 9、HELIX-OS 13、HELIX-Web 9、HELIX-Web-OS 6。draft、未合意。[粒度監査](audits/source-rebaseline/current-l2-requirement-granularity-audit.md)でmixed 15、composite 15、connection 7、unit 0 | 単体・接続・構成体へ分割し、出典・prototype／N/A・合意revisionを確定 |
| 総称HELIXの旧L2／L11案 | HCV4-L2 6件、旧L11 6件 | `docs/governance/crosswalks/legacy-concept-derived-requirements.md`と対文書 | migration crosswalk only。6件すべてHARNESS／HELIX-OSへsplit先を記録、採否待ち | 対象別L2／L11承認後に非実行archiveへ移し、要求ownerから除外する |
| 対象別L11 | 4文書、37受入案 | HARNESS／HELIX-OS／HELIX-Web／HELIX-Web-OSの各L11 | draft、未実行 | 対応L2合意後に利用者受入を実行 |
| 旧Infinity Loop Requirement IR | 153要求 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`と3 shard | historical machine projection。旧canonical表示を新世代へ継承しない | [対象別crosswalk](audits/source-rebaseline/infinity-business-target-crosswalk.md)群からsemantic atomをL2へ個別採否する |
| 旧refinement契約 | 14契約 | `archive/legacy-generation-2026-09-14/root/requirements-ir/refinement_contracts.json` | historical source。旧frozen／specified状態 | [対象別対応](audits/source-rebaseline/refinement-target-crosswalk.md)に従い意味を個別採否する |
| 旧authority候補 | 97文書 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/` | historical candidate source。旧状態を新世代へ継承しない | [候補対象別台帳](audits/source-rebaseline/candidate-source-target-inventory.md)から個別採否する |
| 新世代要求候補 | 8文書 | `docs/governance/candidates/` | HARNESS／HELIX-OSへ分離したdraft。要求エンジン、意味密度抽出、Design Template、typed ticket候補を含む | Concept／対象別L1承認後に対象別L2／L11へ個別採否する |
| 新世代Feature Ticket | 8件 | [Feature Ticket入口](feature-tickets/README.md) | 原登録→semantic抽出→要求engine→分類projection→Design Template→typed ticketの順で発行。全件`proposed_upstream_waiting` | local ticketを意味source、GitHub Issueを作業projectionとして同期し、上流承認後にL3／L10へ降ろす |
| L2 source採否queue | 29 decision unit | [対象別L2 source採否順序](audits/source-rebaseline/l2-source-adoption-sequence.md) | Concept系列を除く29候補系列をS1–S4へ配置、未採否 | Concept／対象別L1承認後、各unitを別decisionとして対象別L2／L11へ採否する |
| 新世代CI要求候補 | HARNESS 4要求、HELIX-OS 8要求、L11候補8項目 | `docs/governance/candidates/next-generation-ci-requirements.md` | draft、要求整理のみ。CI relationを分離し、既存CIはlegacy source | HARNESS検証契約とHELIX-OS実行統制を対象別L1／L2へ接続し、L3／L10以降は上流確定まで待つ |
| 新世代AI可読文書要求候補 | HARNESS 3要求、HELIX-OS 9要求、L11候補8項目 | [AI可読上流文書の要求候補](candidates/ai-readable-authority-requirements.md) | 旧AI実行面をarchiveへ隔離し、最小上流入口を配置。要求はhuman approval待ち、生成器は未設計 | Concept／対象別L1確定後に要求を承認し、manifest／生成器はL3／L10から再導出する |
| 現行CI資産 | workflow 4件、consumer relation 11種、関連filename発見集合82件 | [現行CI・AI読取り資産inventory](audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md)と[CI consumer relation inventory](audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md) | 4 workflowを`archive/legacy-generation-2026-09-14/root/.github/workflows/`へ隔離済み。個別依存closure未完 | archive sourceから意味と判断史を採取し、新世代CIのbaseline・parity oracleにしない |
| AI可読文書 | 直接入口38件、consumer relation 10種 | [現行CI・AI読取り資産inventory](audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md)、[38件の意味移管台帳](audits/source-rebaseline/legacy-ai-read-entry-disposition.md)、[consumer relation inventory](audits/source-rebaseline/legacy-ai-consumer-relation-inventory.md) | exact直接入口、直接配線、relation familyを分類済み。個別consumer／動的read set closureは未完 | HARNESS工程契約とOS実行contextへ分解し、対象別L2へ採否する。要求整理中は現行文書・runtimeを変更しない |
| archive資産の完全一致再利用 | manifest／明細台帳 4020件、個別判断0件 | [完全一致再利用統制](legacy-asset-reuse-control.md)と[append-only判断ログ契約](legacy-asset-decision-log.md) | 承認済みcopy 0件。全entryは個別`unresolved`行を持ち、全asset atom閉包は未完 | 資産ごとにcopy可否、owner、親要求、consumer、権利、実行性を判定し、判断ログへ追記した適格な非実行資産だけarchiveから同一byteで現行pathへコピーする |
| 旧資産退役要求候補 | HARNESS 3要求、HELIX-OS 7要求、L11候補5項目 | [旧資産退役・非実行archive要求候補](candidates/legacy-asset-retirement-requirements.md) | 旧実行面はarchive-first隔離済み、要求はhuman approval待ち。物理削除は未認可 | Concept／対象別L1確定後に個別採否し、L3以降でreplacementと最終退役を再導出する |
| CI・AI既存候補の新世代対応 | 3系列、22旧要件、25旧受入 | [新世代CI・AI source crosswalk](audits/source-rebaseline/new-generation-ci-ai-source-crosswalk.md) | semantic atom照合済み、新世代で再承認待ち | Concept／対象別L1確定後、NCI／AIDOCのL2／L11で個別採否する |
| authority・全資産統制の新世代対応 | 3系列、30旧要件、44旧受入、4旧L12観測 | [新世代authority・asset crosswalk](audits/source-rebaseline/new-generation-authority-asset-governance-crosswalk.md) | JSON-only／旧owner／旧実装再利用前提を分離済み、新世代で再承認待ち | Concept／対象別L1確定後、HELIX-OS L2／L11で個別採否する |
| 提供構成の新世代対応 | 1系列、9旧利用者要求、6旧feature contract、24旧要件、26旧受入 | [新世代提供構成source crosswalk](audits/source-rebaseline/new-generation-release-composition-source-crosswalk.md) | HARNESS契約とOS実行を分離済み。旧CI先行利用は棄却、Cursor固有条件はWorkerへ移送、新世代で再承認待ち | Concept／対象別L1確定後、HARNESS／HELIX-OS L2／L11で個別採否する |
| 運用品質の新世代対応 | 1系列、9旧要求群、5旧L1要求、9旧L3要件、9旧L10受入 | [新世代運用品質source crosswalk](audits/source-rebaseline/new-generation-operational-quality-source-crosswalk.md) | 工程契約・OS運用・製品固有品質へ分離済み。旧owner／engine再利用と候補からの操作認可を棄却、新世代で再承認待ち | Concept／対象別L1確定後、対象別L2／L11へ採否し、L3／L10はその後に再導出する |
| Concept・Package取込の新世代対応 | 2整理文書、受領原文10文書、旧PKG 13候補、長期Vision 5段階 | [新世代Concept・Package source crosswalk](audits/source-rebaseline/new-generation-concept-package-source-crosswalk.md) | Concept・HARNESS・OS・個別製品へ分離済み。旧Package／Module／Bundle数、旧CI先行利用、旧main／Issue／PR authorityを棄却、新世代で再承認待ち | Concept v4.1確定後、対象別L1／L2／L11へ個別採否する |
| 管理変更入口の新世代対応 | 旧policy 1文書、旧受入4件 | [新世代管理変更source crosswalk](audits/source-rebaseline/new-generation-management-change-source-crosswalk.md) | OS管理統制とHARNESS差戻し条件へ分離済み。Issue-first、PLANを含むGit一括authority、旧workflow／adapter／CIを棄却、新世代で再承認待ち | Concept／対象別L1確定後、HARNESS／HELIX-OS L2／L11へ個別採否する |
| 管理状態projectionの新世代対応 | 1系列、7旧要件、6旧受入、2旧PLAN oracle | [新世代管理状態projection crosswalk](audits/source-rebaseline/new-generation-management-state-projection-crosswalk.md) | HARNESS工程条件とOS projectionへ分離済み。固定7 operation、旧layer、既存DB／roadmap／test／CIを棄却、新世代で再承認待ち | HELIX-OS L2確定後、管理状態をL3／L10へ再導出する |
| 限定修復の新世代対応 | 1系列、2旧利用要求、5旧要件、7旧受入、未提供別紙3件 | [新世代限定修復source crosswalk](audits/source-rebaseline/new-generation-bounded-repair-source-crosswalk.md) | HARNESS検証契約とOS修復統制へ分離済み。旧GH-FR-011権限、既存CI／DB／transactionを棄却、新世代で再承認待ち | HELIX-OS L1／L2確定後、操作別authorityとL3／L10／L11を再導出する |
| 構造改善判断の新世代対応 | 1系列、L1要求なし、6旧L3要件、12旧L10受入 | [新世代構造改善trigger crosswalk](audits/source-rebaseline/new-generation-refactoring-trigger-source-crosswalk.md) | HARNESS変更契約とOS改善統制へ分離済み。旧UIL／RF0／current 9 scope／既存CIを棄却、新世代L1から再承認待ち | Concept／L1で利用者価値を補い、対象別L2／L11からL3／L10／L12を再導出する |
| Worker capacityの新世代対応 | 1系列、1旧利用要求、6旧要件、6旧受入、1旧L12認識候補 | [新世代Worker capacity crosswalk](audits/source-rebaseline/new-generation-worker-capacity-source-crosswalk.md) | HARNESS独立検証とOS capacity統制へ分離済み。三社・provider固定数・8-slot・既存CI／Merge Trainを棄却、新世代で再承認待ち | HELIX-OS L1／L2確定後、resource profileとL3／L10／L12を再導出する |
| Security engagementの新世代対応 | 1系列、旧価値5項目、12旧機能要件、6旧非機能要件、12旧受入 | [新世代Security engagement crosswalk](audits/source-rebaseline/new-generation-security-engagement-source-crosswalk.md) | 個別製品security、HARNESS検証、OS操作統制へ分離済み。旧broker／provider／DB／CIを棄却し、実行権限なし、新世代で再承認待ち | 対象別L1／L2確定後、data・操作authorityとL3／L10／L11を再導出する |
| 利用許諾・配布の新世代対応 | 1系列、12旧要件、12旧受入 | [新世代license・distribution crosswalk](audits/source-rebaseline/new-generation-license-distribution-source-crosswalk.md) | HARNESS提供許諾、OS配布統制、個別製品契約へ分離済み。HELIX全体一括方針は不採用、法的条件未決、現行LICENSE不変 | 製品scope確定後、権利棚卸しと法務判断を経て対象別L2／L11を再承認する |
| 開発投資候補の新世代対応 | INV-001..072 exact 72件 | [新世代investment candidate crosswalk](audits/source-rebaseline/new-generation-investment-candidate-crosswalk.md) | 5群へ全件分類済み。旧P0..P4、Issue／owner、既存CI／Cursor／DB／scheduler、実装順を棄却し、新世代で再採否待ち | Concept／対象別L1確定後、意味候補だけを対象別L2へ採否し、方式はL3以降で再導出する |
| 旧HARNESS要求群 | 5文書。10 BR、3 UX、51 FR、15 NFR、15画面、技術要求7節 | [旧HARNESS要求の新世代対象別対応](audits/source-rebaseline/legacy-harness-requirements-source-crosswalk.md) | 全文確認・対象別分類済み。個別採否・L2合意待ち | 最新Concept／対象別L1の承認後、保持意味だけをHARNESS／HELIX-OS／個別製品L2へ採否する。旧実装を継承しない |
| 旧screen要求・設計 | 7文書、個別Low-Fi 7画面、共通骨格参照8画面 | [L2画面・モック境界](../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L2-screen/screen-mock-boundary.md) | 7文書と15画面の存在・内容を確認済み。8画面の個別操作・欠落・失敗状態、prototype合意、L11受入が未確定 | 採択した画面だけを対象別L2要求、prototype revision、L11利用結果へ接続する。旧pairのPASSを流用しない |
| 旧IR由来の適用待ちsemantic atom | 7 JSON record＋authority語彙 | [L2 freeze IR是正差分](audits/source-rebaseline/l2-freeze-ir-correction.md) | historical proposal、未採否。旧IRへ適用しない | 対象別L2へ個別採否し、承認後に新世代projectionを再導出する |
| open PR整理 | 6件close、open 0件 | [上流再整理に伴うopen PR整理記録](audits/source-rebaseline/github-pr-cleanup-2026-09-14.md) | GitHub projection整理済み。branch・Issue・要求意味は変更していない | legacy sourceの意味は対象別L2で再採否する |
| 旧open Issue projection | 488件、comment 1330件 | [退役記録](audits/source-rebaseline/github-issue-retirement-2026-09-15.md)、[Issue明細](audits/source-rebaseline/github-open-issue-retirement-inventory.jsonl)、[comment明細](audits/source-rebaseline/github-issue-comment-retirement-inventory.jsonl) | 488/488件を`closed / not_planned`へ退役、open 0件。本文digest 488/488一致。Issueとcommentの意味は`unresolved` | closeを要求棄却・実装完了にせず、必要な意味だけを対象別L2へ個別採否する |
| 新世代Feature Issue projection | open 8件（#1798..#1805） | [Feature Ticket入口](feature-tickets/README.md) | local ticket commits `543ffc305`／`0e17dadf0`から原登録、semantic抽出、要求engine、分類、Design Template、typed ticket／workflowをprojectionし、marker・source commit・open stateをread-after済み | Issueを作業共有に使い、意味・依存・状態はlocal ticketと承認上流から同期する。Issue closeを要求採否や実装完了にしない |
| 旧GitHub Project projection | Project 1件、item 210件 | [退役記録](audits/source-rebaseline/github-project-retirement-2026-09-15.md)と[item明細](audits/source-rebaseline/github-project-1-item-inventory.jsonl) | Project #1を削除せずclose。全item `Done`は完了証拠にせず、意味`unresolved` | 承認済みHELIX-OS要求から新世代dashboard／projectionを別identityで再導出する |
| 旧PLAN | 1252文書 | `archive/legacy-generation-2026-09-14/root/docs/plans/` | historical作業契約・履歴。要求意味の正本ではない | 必要なbehavior atomだけを上流ID・対象・revisionへ再採否し、旧PLANを実行しない |

## 母集団の閉じ方

現時点の要求源は次の入口で漏れを検査する。

1. archive内の旧Core Read、L0／L1／L2 sourceと、現行側のConcept／対象別L1／L2候補。
2. Requirement IR 153要求とrefinement 14契約。
3. archive内candidates directoryのMarkdown 97文書と、現行側の新世代候補8文書。
4. 旧HARNESS要求5文書、旧screen文書、Concept／Vision intake。
5. 人間の新規決定と、出典付きの運用・外部変化candidate。

新しい要求源を発見した場合は、Issueを作る前でも本台帳へ追加できる。必須項目はsource、対象製品、authority状態、
親Concept／L1、L2要求、L3要件、pair、採否、revision、次の処置である。未分類のsourceは`unresolved`として残し、
既存集合へ暗黙算入しない。

## 完了判定

上流再整備の完了は、次をすべて満たしたときだけ主張する。

- 全sourceがexact targetとauthority状態を持ち、`unresolved`の意味が記録されている。
- HARNESS、HELIX-OS、個別製品の要求所有が分離されている。
- Concept→L1→L2→L3とL2↔L11／L3↔L10の接続が対象別に閉じている。
- canonical、candidate、compatibility、historical、projectionが混在していない。
- GitHub状態を要求意味・採否・受入・削除の根拠にしていない。
- 自動走行対象が上位要求、責務、scope、pair、oracle、停止・復旧条件を持つ。
- 旧資産のreuse／split／replace／retire／archive判断とreplacement evidenceがある。

現在は対象別整理と適用待ち差分までであり、この完了条件は未達である。

## 要求整理の閉鎖台帳

この表は「文書を見た」「Issueがある」と「要求整理が閉じた」を区別する。`完了`は本表の作業単位に
限った状態であり、製品実装・受入・運用の完了を意味しない。

| 作業単位 | 閉鎖条件 | 現在の証拠 | 状態 | 残る処置 |
|---|---|---|---|---|
| 母集団の発見 | Core Read、IR、refinement、候補、旧要求、画面、intakeの入口と件数が台帳化される | 本台帳の母集団、候補97文書／31系列、IR 153、refinement 14、旧5＋7文書 | 完了 | 新規sourceは発見時に追記する |
| 製品責務 | HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの所有範囲、service log export、改善接続が決定される | [対象別責務決定](../concept/product-boundary.md) | 完了 | Concept v4.1へ承認revisionとして固定する |
| 最新Concept | HARNESS自己改善を含む最新責務、新世代境界、authority、上流順序、Version 1の複数プロダクト・自己適用検証とWeb展開依存が人間承認revisionへ束縛される | v4.1候補と承認準備監査 | 人間承認待ち | v4.1 exact revisionを人間が採否する |
| 対象別L1 | ConceptからHARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの企画・価値・対象外が分冊される | 対象別L1候補4文書。HARNESS 9、HELIX-OS 12、HELIX-Web 6、HELIX-Web-OS 5要求。L0柱とL2接続案を記載 | 起草済み・親承認待ち | v4.1承認後に導出一致をreviewし、人間承認する |
| 要求源の意味分類 | 各source atomのtarget、保持／変更／棄却、旧実現手段の扱いが分かる | Infinity 153、refinement 14、候補31系列、旧HARNESS 5文書のcrosswalk | 照合済み | 対象別L1確定後に再採否する |
| 対象別L2 | 利用者、場面、操作、期待結果、非対象、出典、採否、合意revisionが対象別に閉じる | HARNESS 9、HELIX-OS 13、HELIX-Web 9、HELIX-Web-OS 6のdraft。粒度監査で37件すべてに分割・具体化が必要 | 未合意 | unit、connection、compositeへ再構成し、source atomを個別採否してprototype／非UI記録と人間合意を束縛する |
| 画面・prototype | 採択画面ごとに要求revision、prototype revision、正常・欠落・失敗状態、合意者が対応する | 旧7文書・15画面の照合、L2画面境界 | 未合意 | 共通骨格参照8画面を含め、採択後のprototype条件を確定する |
| L11受入設計 | 各L2要求に利用場面、期待結果、negative case、対象revisionが対応する | 対象別L11 draft 37件 | 起草済み・未承認 | L2のunit／connection／composite分割と合意revisionに合わせて確定する。実行は後工程 |
| L3／L10接続 | 合意済みL2から要件・総合検証を導出し、旧revisionを混ぜない | crosswalkと適用待ち差分のみ | 未着手 | L2合意後に開始する |
| AI可読上流 | 承認済み上流からHARNESS契約、OS実行context、個別製品要求を分離生成できる要求が確定する | AIDOC要求10件とL11候補、legacy入口inventory | 要求案接続済み | Concept／L1／L2確定後に採否し、L3以降でmanifestを導出する |
| 旧資産archive判断 | 旧実行面をcurrent pathから隔離し、各資産に意味移管、consumer、replacement、rollback、最終処置がある | `archive/legacy-generation-2026-09-14/`、legacy CI／AI inventory、各crosswalk | 実行面隔離済み、文書分類と意味移管は継続中 | archive sourceを対象別L2へ採否し、物理削除は個別判断まで行わない |

要求整理の現在の直列境界は、`Concept v4.1人間判断 → 対象別L1承認 → source atom再採否 → 対象別L2・prototype合意`
である。ここが閉じる前にL3／L10、AI文書生成器、新世代CI、runtime、archive資産の意味移管・最終退役へ進まない。

[上流再整備の実行backlog](upstream-rebaseline-execution-backlog-2026-09-14.md)は、本台帳の各集合を
U0 archive-first隔離・母集団固定からU7意味移管・最終退役までのwork unitへ変換する。GitHub Issueを起票しなくても作業契約を保持できる。
