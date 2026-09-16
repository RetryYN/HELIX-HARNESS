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
| 上流authority状態 | 5独立軸 | [上流authority状態モデル](authority-state-model.md) | source、対象別authority、carry-forward、管理層仮登録、work projectionを分離。暗黙遷移を禁止 | 後続の登録・分類機構で別fieldとして実装し、現在は台帳とdecision recordで判定する |
| GitHub上流運用 | 1 | [GitHub上流運用モデル](github-upstream-operating-model.md) | repository foundation、要求、設計・検証、実装、外部運用のPR classとauthority／merge条件を定義 | #1797でrepository運用基盤を固定し、個別要求は旧要求を保持したまま一要求identityずつ後続PRで再配置する |
| 新世代作業基盤集約 | 1 operation | [集約operation contract](new-generation-workbase-consolidation.md) | PO指示により、旧Git／worktree stateを非実行archiveへ全量退避し、現役面を`main`一つへ集約中。要求authority effectなし | exact inventory、verified bundle、raw archive、fresh clone、remote branch削除をread-afterし、要求整理前で停止する |
| 企画・Vision→research→要求 | 旧source 4文書、現行被覆5箇所 | [被覆監査](audits/source-rebaseline/planning-research-requirement-flow-audit-2026-09-15.md) | GitHub投影までの経路は定義済み。premise、research、PoC／prototype、backflowの製品要求は未承認。`operating_route_defined_requirements_unapproved` | HARNESS／OS要求を一要求identityずつ後続PRで具体化する |
| 旧世代archive-first隔離 | 4020 Git追跡ファイル | [隔離記録](archive-first-transition-record-2026-09-14.md)、`archive/legacy-generation-2026-09-14/MANIFEST.sha256`、[資産明細台帳](legacy-asset-disposition.jsonl) | 旧実行面・旧文書・旧IRを非実行archiveへ隔離し、全entryを個別`unresolved`行へ展開済み | archive sourceの意味を対象別L2へ採否し、物理削除はしない |
| archive隔離前revision差分 | 333 path | [revision差分保全監査](audits/source-rebaseline/pre-isolation-revision-delta-audit-2026-09-16.md)、[機械台帳](pre-isolation-revision-delta-source-holding.jsonl) | 監査基準と隔離直前でblobが異なる全pathについて、両revisionのcommit・blob・SHA-256を保持。意味同値、置換、採否は未判断 | 要求・候補・検証・PLAN等の意味を後続reviewで比較し、基準revisionを未計上にしない |
| 旧L0 charter source | 1 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L0-charter/helix-charter_v0.1.md` | sourceでconfirmedだった状態を保持する。新世代target authorityへは自動昇格しない | P0–P9の意味を保持して対象別L1へ再配置する |
| 旧Concept source | 1 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md` | historical source。旧Core Read・旧製品境界 | v4.1との差分sourceとしてのみ使う |
| 新世代Concept候補 | 1文書 | [Concept v4.1候補](../concept/helix-concept-v4.1.md) | 5大目標を到達価値、七大原則をエージェント行動規律として接続した`draft_candidate`。[人間判断packet](audits/source-rebaseline/concept-v4.1-human-decision-packet.md)へexact SHAを固定し、v4.0はarchive sourceのまま。候補mergeはauthorityを生成しない | current revisionを外部reviewし、将来のauthority判断は4対象L1と別decisionにする。確定後に旧要求を保持した対象別L2整理へ進む |
| HELIX自体の5大目標候補 | 1文書、5目標 | [5大目標候補](../concept/helix-five-goals.md)、[人間判断packet](audits/source-rebaseline/helix-five-goals-human-decision-packet.md) | `draft_candidate / awaiting_human_approval`。HELIX全体の到達方向であり、個別要求・実装方式・達成を生成しない。Concept改訂候補への接続済み | Concept接続の無矛盾をreviewする。将来のauthority判断はexact本文SHAへ束縛し、対象別L1・L2／L11への分解と分ける |
| HELIXエージェント七大原則候補 | 1文書、7原則 | [七大原則候補](../concept/helix-principles.md)、[人間判断packet](audits/source-rebaseline/helix-principles-human-decision-packet.md) | PO提示の7原則を行動判断へ具体化した`draft_candidate`。Conceptの9構造原則と分離してConcept改訂候補へ接続済み。authority effectなし | Concept接続の無矛盾をreviewする。将来のauthority判断後も個別要求の採否は別decisionにする |
| 旧HELIX柱要求 | HBR 9件、HNFR 4件 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` | sourceでconfirmedだった要求意味を保持し、新世代targetは未承認。工程と実行管理の配置が混在 | [対象別対応](audits/source-rebaseline/pillar-target-crosswalk.md)からL1／L2へ欠落なく再配置する |
| 旧要件v1.3 source | 1 | [現行保持copy](requirements-source/helix-requirements_v1.3.md)、[対象別対応](audits/source-rebaseline/requirements-v1.3-target-crosswalk.md) | archive隔離直前revisionの原文を同一byteで現行保持し、監査基準revisionとの差は333 path台帳で別保持。旧Core Read状態とHARNESS／OS責務の混在は配置課題であり削除理由にしない | 全要求を保持したまま対象別L2へ再配置し、すべての要求PRを人間決定に束縛する |
| 旧v1.3委任文書・意味relation closure | 117文書（114 file blob＋行保持3） | [file-blob保全inventory](delegated-requirement-document-source-inventory.md)、[機械台帳](delegated-requirement-document-source-holding.jsonl)、[参照候補holding](delegated-requirement-document-reference-inventory.md) | v1.3の直接委任22文書から意味frontmatter relation 265 edgeを再帰的に辿り、117文書をarchive原文とSHA-256へ束縛して管理層へ仮登録。別にfrontmatter・本文参照788 edgeを行・target digest付きで保持。要求atom化、採否、配置、successorは未実施 | 対象文書と意味relation closureを先に無損失atom化する。分類待ち参照を利用・縮退・retireする場合も別holdingへ仮登録し、理由なく除外しない |
| 旧要求文書の現行保持 | 22文書 | [保持領域](requirements-source/README.md)、[文書台帳](legacy-requirement-document-carry-forward.jsonl) | 29/29関連fileはarchive隔離直前revisionと同一byte。22文書の隔離直前statusはconfirmed 17、draft 3、proposed 1、placeholder 1。監査基準はscreen境界をconfirmedとして別保持し、confirmed 18、draft 2、proposed 1、placeholder 1 | 原要求ID単位で両revisionの対象・successor・未被覆atomを追加し、すべての要求PRを人間判断に束縛する |
| confirmed要求identity | 175 source-qualified identity | [identity台帳](legacy-confirmed-requirement-identity-carry-forward.jsonl) | confirmed文書の要求表・見出し・宣言行を原文行digest付きで保持。同名IDを自動統合しない | successorと未被覆atomを要求PRで記録する |
| 旧要求文書semantic line | 2,386 source line | [全量保全inventory](legacy-requirement-semantic-line-inventory.md)／[機械台帳](legacy-requirement-semantic-line-carry-forward.jsonl) | 22文書の非空semantic lineを原文・行番号・digest付きで保持。328行は既存identityへ接続し、残る2,058行を過包含のatom化待ちとする | 要求／制約／受入／根拠／例／navigationへ分類し、要求atomを対象別に再配置する。分類前に候補を削除しない |
| IR↔人間向け要求原文 | 153 relation | [IR・文書relation台帳](legacy-ir-document-source-relation.jsonl) | IR 153/153件のsource pointer、ID、statementが保持済みMarkdown宣言行と一致 | 対象別successorを加えて三者traceにし、片側差分はconflictとして停止する |
| IR対象routing queue | 153要求 | [routing queue](legacy-ir-target-routing-queue.jsonl) | OS候補84、HARNESS／OS分割候補51、対象未解決18。意味変更・照合候補23は未適用 | 対象と変更判断を分け、successorと全atom被覆を後続要求PRで確定する |
| IR対象未解決判断 | 2論点、18要求 | [判断packet](legacy-ir-unresolved-routing-decision-packet.md) | runtime・技術制約の層別17件、Domain Object規律の適用範囲1件。全件意味保持・未配置 | 製品要求、HARNESS提供契約、OS内部要求、L3以降の設計制約へ分ける判断時に使う |
| IR再配置wave | 4 wave、11 partition、153要求 | [wave台帳](legacy-ir-rehome-wave-register.md) | 業務価値→機能→非機能→技術制約の順を固定。全件successor未割当 | repository foundation後に原要求identityごとの要求PRで無損失再配置する |
| 対象別L1 | 4文書、32企画要求案 | HARNESS／HELIX-OS／HELIX-Web／HELIX-Web-OSの各`L1-planning/` | 親Concept v4.1承認待ち。HARNESS 9、HELIX-OS 12、HELIX-Web 6、HELIX-Web-OS 5 | v4.1承認後に導出一致をreviewし、対象別L1を人間承認する |
| 5大目標・七大原則のL1被覆 | 5目標、7原則、既存L1 32件 | [L1被覆監査](audits/source-rebaseline/l1-goals-principles-coverage-audit.md) | 目標2は`covered`、目標1・3・4・5は`partial`。七大原則は行動規律として既存L1へ接続し、原則名からL1要求を自動追加しない。L1本文は不変 | `partial`四領域を管理層仮登録と無損失被覆receiptへ束縛し、最終的な要求identityごとに別PRで採否する |
| 5大目標・七大原則のPO原文holding | 12 atom | [source inventory](l1-goals-principles-source-inventory.md)、[機械台帳](l1-goals-principles-source-atoms.jsonl) | PO原文5目標・7原則をexact textとdigest付きで管理層へ`registered_source_holding`として仮登録。要求identity、対象製品、採否、authority effectは未生成 | 後続の要求identityごとに使用atomと未使用atomの生存先を明記し、既存L1・旧要求sourceとの無損失被覆receiptを作る |
| 対象別L2 | 4文書、37要求案 | [L2要求入口](audits/source-rebaseline/l2-source-register.md) | HARNESS 9、HELIX-OS 13、HELIX-Web 9、HELIX-Web-OS 6。draft、未合意。[粒度監査](audits/source-rebaseline/current-l2-requirement-granularity-audit.md)でmixed 15、composite 15、connection 7、unit 0 | 単体・接続・構成体へ分割し、出典・prototype／N/A・合意revisionを確定 |
| 総称HELIXの旧L2／L11案 | HCV4-L2 6件、旧L11 6件 | `docs/governance/crosswalks/legacy-concept-derived-requirements.md`と対文書 | migration crosswalk only。6件すべてHARNESS／HELIX-OSへsplit先を記録、採否待ち | 対象別L2／L11承認後に非実行archiveへ移し、要求ownerから除外する |
| 対象別L11 | 4文書、37受入案 | HARNESS／HELIX-OS／HELIX-Web／HELIX-Web-OSの各L11 | draft、未実行 | 対応L2合意後に利用者受入を実行 |
| 旧Infinity Loop Requirement IR | 153要求 | [現行保持IR](requirements-source/requirements-ir/requirements.json)、[carry-forward台帳](legacy-requirement-carry-forward.jsonl) | 153/153を原文・digest付きで`preserved_pending_rehome`として現行保持。37件はrouting containerであり代替集合ではない | [無損失carry-forward方針](legacy-requirement-carry-forward-policy.md)に従い対象別successorへ再配置する。欠落atomはpendingのまま残す |
| 旧refinement契約 | 14契約 | `archive/legacy-generation-2026-09-14/root/requirements-ir/refinement_contracts.json` | historical source。旧frozen／specified状態 | [対象別対応](audits/source-rebaseline/refinement-target-crosswalk.md)に従い意味を保持して再配置する |
| 旧authority候補 | 97文書 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/` | historical candidate source。旧状態を新世代へ継承しない | [候補対象別台帳](audits/source-rebaseline/candidate-source-target-inventory.md)から個別採否する |
| 新世代要求候補 | 8文書 | `docs/governance/candidates/` | HARNESS／HELIX-OSへ分離したdraft。要求エンジン、意味密度抽出、Design Template、typed ticket候補を含む | Concept／対象別L1承認後に対象別L2／L11へ個別採否する |
| 新世代Feature Ticket | 9件 | [Feature Ticket入口](feature-tickets/README.md) | 原登録→semantic抽出→要求engine→分類projection→Design Template→typed ticket→GitHub一方向同期の順で発行。全件`proposed_upstream_waiting` | local ticketを意味source、GitHub Issueを作業projectionとして同期し、上流承認後にL3／L10へ降ろす |
| 要求要否・重複・技術代替review program | 親1件、子2件 | [要否・再配置](requirement-disposition-review-program.md)、[責務・機能重複](requirement-overlap-review-program.md)、[技術代替可能性](requirement-technical-substitutability-review-program.md) | 全要求保持、重複候補の意味比較、技術と意味機能の分離条件を定義。個別判断・successorは未開始 | Concept／対象別L1承認後、source-qualified identityまたはatomごとに人間decisionと要求PRへ分ける |
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
| 旧HARNESS要求群 | 5文書。10 BR、3 UX、51 FR、15 NFR、15画面、技術要求7節 | [旧HARNESS要求の新世代対象別対応](audits/source-rebaseline/legacy-harness-requirements-source-crosswalk.md) | archive隔離直前revisionの全文・同一byte copyを保持し対象別分類済み。監査基準との差は333 path台帳で別保持。原要求単位の再配置・L2合意待ち | 原要求を保持してHARNESS／HELIX-OS／個別製品L2へ再配置する。旧実装方式の採用判断は要求意味と分ける |
| 旧screen要求・設計 | 7文書、個別Low-Fi 7画面、共通骨格参照8画面 | [L2画面・モック境界](../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L2-screen/screen-mock-boundary.md) | 7文書と15画面の存在・内容を確認済み。8画面の個別操作・欠落・失敗状態、prototype合意、L11受入が未確定 | 採択した画面だけを対象別L2要求、prototype revision、L11利用結果へ接続する。旧pairのPASSを流用しない |
| 旧IR由来の適用待ちsemantic atom | 7 JSON record＋authority語彙 | [L2 freeze IR是正差分](audits/source-rebaseline/l2-freeze-ir-correction.md) | historical proposal、未採否。旧IRへ適用しない | 対象別L2へ個別採否し、承認後に新世代projectionを再導出する |
| open PR整理 | 6件close、open 0件 | [上流再整理に伴うopen PR整理記録](audits/source-rebaseline/github-pr-cleanup-2026-09-14.md) | GitHub projection整理済み。branch・Issue・要求意味は変更していない | legacy sourceの意味は対象別L2で再採否する |
| 旧open Issue projection | 488件、comment 1330件 | [退役記録](audits/source-rebaseline/github-issue-retirement-2026-09-15.md)、[Issue明細](audits/source-rebaseline/github-open-issue-retirement-inventory.jsonl)、[comment明細](audits/source-rebaseline/github-issue-comment-retirement-inventory.jsonl) | 488/488件を`closed / not_planned`へ退役、open 0件。本文digest 488/488一致。Issueとcommentの意味は`unresolved` | closeを要求棄却・実装完了にせず、必要な意味だけを対象別L2へ欠落なく再配置する |
| 新世代Feature Issue projection | open 9件（#1798..#1805、#1812） | [Feature Ticket入口](feature-tickets/README.md) | local ticketから原登録、semantic抽出、要求engine、分類、Design Template、typed ticket／workflow、GitHub一方向同期adapterをprojectionし、marker・source commit・digest・open stateをread-after済み | Issueを作業共有に使い、意味・依存・状態はlocal ticketと承認上流から同期する。Issue closeを要求採否や実装完了にしない |
| 要求整理Issue projection | open 3件（#1813..#1815） | [投影記録](audits/source-rebaseline/github-requirement-review-program-projection-2026-09-15.md) | RDP-001の要否・再配置、RDP-002の責務・機能重複、RDP-003の技術代替可能性をlocal sourceから投影しread-after済み | 親子Issueを進行共有だけに使い、closeやcheckboxから個別要求の採否・統合・技術選定を生成しない |
| 旧GitHub Project projection | Project 1件、item 210件 | [退役記録](audits/source-rebaseline/github-project-retirement-2026-09-15.md)と[item明細](audits/source-rebaseline/github-project-1-item-inventory.jsonl) | Project #1を削除せずclose。全item `Done`は完了証拠にせず、意味`unresolved` | 承認済みHELIX-OS要求から新世代dashboard／projectionを別identityで再導出する |
| 旧PLAN | 1252文書 | `archive/legacy-generation-2026-09-14/root/docs/plans/` | historical作業契約・履歴。要求意味の正本ではない | 必要なbehavior atomだけを上流ID・対象・revisionへ再採否し、旧PLANを実行しない |

## 母集団の閉じ方

現時点の要求源は次の入口で漏れを検査する。

1. archive内の旧Core Read、L0／L1／L2 sourceと、現行側のConcept／対象別L1／L2候補。
2. Requirement IR 153要求とrefinement 14契約。
3. archive内candidates directoryのMarkdown 92文書と、現行側の新世代候補8文書。
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
- すべての`requirement` PRが、旧source atomの未計上0を示すHARNESS無損失被覆receiptと、同じ候補digestを持つHELIX-OS管理層の`registered_proposal`へmerge前に束縛されている。
- 自動走行対象が上位要求、責務、scope、pair、oracle、停止・復旧条件を持つ。
- 旧資産のreuse／split／replace／retire／archive判断とreplacement evidenceがある。

現在は対象別整理と適用待ち差分までであり、この完了条件は未達である。

## 要求整理の閉鎖台帳

この表は「文書を見た」「Issueがある」と「要求整理が閉じた」を区別する。`完了`は本表の作業単位に
限った状態であり、製品実装・受入・運用の完了を意味しない。

| 作業単位 | 閉鎖条件 | 現在の証拠 | 状態 | 残る処置 |
|---|---|---|---|---|
| 母集団の発見 | Core Read、IR、refinement、候補、旧要求、画面、intakeの入口と件数が台帳化される | 本台帳の母集団、archive候補92文書、現行候補8文書、31系列、IR 153、refinement 14、旧5＋7文書、旧v1.3直接委任22文書から閉じた意味relation closure 117文書、分類待ちを含む参照edge 788件 | 継続中 | archive全体から新しい要求源を発見したら、判断前にfile blobまたは参照候補holdingへ追記する |
| 製品責務 | HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの所有範囲、service log export、改善接続が決定される | [対象別責務決定](../concept/product-boundary.md) | 完了 | Concept v4.1へ承認revisionとして固定する |
| 最新Concept | HARNESS自己改善を含む最新責務、新世代境界、authority、上流順序、5大目標、七大原則、Version 1の複数プロダクト・自己適用検証とWeb展開依存が一つの候補revisionへ束縛される | v4.1候補、承認準備監査、5大目標・七大原則接続監査 | 候補統合・外部review待ち | 候補を証拠で統合し、将来のauthority判断時にv4.1 exact revisionを人間が採否する |
| 対象別L1 | ConceptからHARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの企画・価値・対象外が分冊される | 対象別L1候補4文書。HARNESS 9、HELIX-OS 12、HELIX-Web 6、HELIX-Web-OS 5要求。L0柱とL2接続案を記載 | 起草済み・親承認待ち | v4.1承認後に導出一致をreviewし、人間承認する |
| 要求源の意味分類 | 各source atomのtarget、保持／変更／棄却、旧実現手段の扱いが分かる | Infinity 153、refinement 14、候補31系列、旧HARNESS 5文書のcrosswalk | 照合済み | 対象別L1確定後に原要求を保持して再配置する |
| 対象別L2 | 利用者、場面、操作、期待結果、非対象、出典、採否、合意revisionが対象別に閉じる | HARNESS 9、HELIX-OS 13、HELIX-Web 9、HELIX-Web-OS 6のdraft。粒度監査で37件すべてに分割・具体化が必要 | 未合意 | unit、connection、compositeへ再構成し、source atomを欠落なく再配置してprototype／非UI記録と人間合意を束縛する |
| 画面・prototype | 採択画面ごとに要求revision、prototype revision、正常・欠落・失敗状態、合意者が対応する | 旧7文書・15画面の照合、L2画面境界 | 未合意 | 共通骨格参照8画面を含め、採択後のprototype条件を確定する |
| L11受入設計 | 各L2要求に利用場面、期待結果、negative case、対象revisionが対応する | 対象別L11 draft 37件 | 起草済み・未承認 | L2のunit／connection／composite分割と合意revisionに合わせて確定する。実行は後工程 |
| L3／L10接続 | 合意済みL2から要件・総合検証を導出し、旧revisionを混ぜない | crosswalkと適用待ち差分のみ | 未着手 | L2合意後に開始する |
| AI可読上流 | 承認済み上流からHARNESS契約、OS実行context、個別製品要求を分離生成できる要求が確定する | AIDOC要求10件とL11候補、legacy入口inventory | 要求案接続済み | Concept／L1／L2確定後に採否し、L3以降でmanifestを導出する |
| 旧資産archive判断 | 旧実行面をcurrent pathから隔離し、各資産に意味移管、consumer、replacement、rollback、最終処置がある | `archive/legacy-generation-2026-09-14/`、legacy CI／AI inventory、各crosswalk | 実行面隔離済み、文書分類と意味移管は継続中 | archive sourceを対象別L2へ採否し、物理削除は個別判断まで行わない |

要求整理の現在の直列境界は、`Concept v4.1人間判断 → 対象別L1承認 → source atom無損失再配置 → 対象別L2・prototype合意`
である。ここが閉じる前にL3／L10、AI文書生成器、新世代CI、runtime、archive資産の意味移管・最終退役へ進まない。

[上流再整備の実行backlog](upstream-rebaseline-execution-backlog-2026-09-14.md)は、本台帳の各集合を
U0 archive-first隔離・母集団固定からU7意味移管・最終退役までのwork unitへ変換する。GitHub Issueを起票しなくても作業契約を保持できる。
