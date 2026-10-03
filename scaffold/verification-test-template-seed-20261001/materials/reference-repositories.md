# 参考資料候補：採択要求クラスタ別の外部リポジトリ・OSS・標準

status: scaffold（調査材料。採否、要求、設計、実装の決定ではない）
authority_effect: none
binding: [SCF-B-0153](../../bindings/SCF-B-0153.json)

> 本書は2026-10-01に`origin/main` `479d5f95`で作った。`6404579a`までの差分は監査記録2件だけで、本書が引く行番号は変わらない。

- 作成日：2026-10-01（調査時点）
- 性格：**参考資料の収集のみ**。採用・技術選定・L3決定・実装許可ではない。本書からHELIXの要求意味、承認、merge admissionを生成しない。
- 入力要求の読取元：`origin/main`（fetch時点）の
  - `docs/helix-harness/L2-requirements/product-requirements.md`（HARNESS-L2-034/036/037/039/040/041/042/046/049/055/056/057/058/059/060/062/063）
  - `docs/helix-os/L2-requirements/governance-requirements.md`（HELIXOS-L2-033/038/043/046/103〜111）
  - `docs/helix-labo/L2-requirements/labo-requirements.md`（HELIXLABO-L2-064/065/068/070/071）
  - 注記：要求本文の状態欄には「未採択候補」「registered_proposal」と書かれた節が多い。採択・条件付採択の扱いは依頼者指定の判断記録（`po-decision-2026-09-29-57candidates.md`、`po-decision-2026-09-30-live26.md`）に従うものとし、本書では採否を再判定していない。
- 検証方法：GitHub REST API（`gh api repos/<owner>/<repo>`）で存在・SPDXライセンス・最終push日時・archived有無を取得（2026-09-30〜10-01時点）。ライセンスが`NOASSERTION`のものはLICENSEファイル先頭を読んで補った。機能主張は一次資料（公式docs／spec本文／repo内docs）をWebFetchまたはraw取得で確認した。確認できなかった主張は **[未検証]** と明示。
- 旧HELIXとの対応：本書は外部資料の収集であり、HELIXの規則・手続きを新設しない。各候補を実際に取り込む際は、AGENTS.md「再構築の原則」に従い旧HELIXの対応箇所（`archive/legacy-generation-2026-09-14/`、資産明細台帳）を先に読み、完全一致再利用／意味の再導出／置換を明示する必要がある（本調査では旧HELIX側の突合は未実施）。

## HELIX要求に共通する適合判定軸（misfit検出用）

外部ツールの多くはHELIXの境界と衝突する既定挙動を持つ。各候補の「misfit」欄は次の軸で評価した。

| 軸 | HELIX側の要求・境界 | 典型的な衝突 |
|---|---|---|
| M1 自動merge禁止 | 作成側はmergeせず、独立review側が`gh pr merge --merge`で明示merge。native auto-merge不使用 | Prow/Tide、merge queue、`gh pr merge --auto`、Renovate automerge |
| M2 exact HEAD／revision pin | review・merge・証拠は対象HEAD/revision/digestに束縛。変化したらstale | ブランチ名・最新・"latest"参照、HEAD非固定の評価 |
| M3 CI・状態から承認を生成しない | CI green、ACK、reviewer名、merge済みから要求承認・受入・close を生成しない | required status checks＝merge可、PASS attestation＝承認 と読む運用 |
| M4 unknown/missing/staleはfail-close | 欠落を0・成功・非適用へ変換しない | 欠損を"skip"/"pass"扱いするツール既定値 |
| M5 追記専用・訂正は新record | ledger・eventは上書き・削除せず履歴で訂正 | baselineファイル上書き再生成、ledger行の直接更新 |
| M6 1.0で前倒ししない領域 | web配備後のsecurity/infra（本番隔離、公開透明性ログ、本番incident運用）は1.0必須にしない | 公開Sigstore/Rekor必須化、本番SLO基盤必須化 |

## サマリ表

| # | クラスタ | 主対象要求 | 最有力の参考資料 | ライセンス | 借りるもの（要約） |
|---|---|---|---|---|---|
| A | 計測契約・完成判定 | H-034, H-036, (L-070) | OpenSLO / Lighthouse CI assert / Bencher / in-toto test-result predicate | Apache-2.0 / Apache-2.0 / Apache-2.0 or MIT(一部別) / Apache-2.0 | metric・target・window・budgetingのYAML schema、level付きassertionと複数run集約、閾値+統計検定、結果predicate |
| B | 全層ledger・隣接双方向trace・V-pair gate・freeze閉包 | H-040, H-055, H-056, H-063, OS-038 | OpenFastTrace / Doorstop / StrictDoc / sphinx-needs / TRLC+LOBSTER / ASPICE 4.0 | GPL-3.0 / LGPL-3.0 / Apache-2.0 / MIT / GPL-3.0+AGPL-3.0 / VDA(規格) | revision付きitem ID・Needs/Covers・outdated/predated判定、fingerprint付きlink＝suspect検出、grammar付き文書model、needs.json+schema、tracing policy |
| C | template obligation抽出・二段設計・Design Refactor判定 | H-037, H-041, H-042 | StrictDoc grammar / sphinx-needs schema / MADR / oasdiff / buf breaking / dependency-cruiser / ArchUnit | Apache-2.0 / MIT / MIT or CC0 / Apache-2.0 / Apache-2.0 / MIT / Apache-2.0 | field必須性の宣言、決定記録の型、契約差分（breaking判定）、依存graph規則検査 |
| D | UI/Experience/Frontend契約・prototype表示計測oracle | H-039, H-049 | Playwright（toHaveScreenshot・toMatchAriaSnapshot）/ axe-core / Storybook / DTCG 2025.10 / Style Dictionary / reg-suit / textlint・Vale | Apache-2.0 / MPL-2.0 / MIT / W3C SDL / Apache-2.0 / MIT / MIT | 環境別baseline命名と許容差、ARIA木のYAML oracle、violations/incomplete/inapplicable四分、token schema |
| E | 工程workflow・Issue contract・stage入力revision・closure・dispatch→merge連続性・event因果 | H-046, H-057, H-059, H-060, OS-046, OS-103 | GitHub REST merge `sha` / `gh pr merge --match-head-commit` / CloudEvents / CDEvents / OTel span links / pyeventsourcing / GitHub Issue forms | GitHub仕様 / Apache-2.0 / Apache-2.0 / Apache-2.0 / BSD-3 | HEAD一致しなければ409で拒否するmerge、event identity(source+id)、CI/CD語彙とlinks(因果)、append-only event store |
| F | finding分類・disposition・debt ratchet・taxonomy handoff | H-058, H-062, OS-107 | SARIF 2.1.0 / OpenVEX / CWE / ESLint bulk suppressions / betterer / detekt baseline / Semgrep diff-aware / SonarQube new code | OASIS / CC0 / MITRE terms / MIT / MIT / Apache-2.0 / LGPL-2.1 / LGPL-3.0 | baselineState(new/unchanged/updated/absent)、suppression status+justification、fingerprint、taxonomy版参照、ratchet CLI UX |
| G | versioned engine/detector registry・同一snapshot再現 | OS-033 | CodeQL packs（qlpack+lock）/ SARIF tool.driver・versionControlProvenance / SLSA provenance v1 / in-toto witness | MIT / OASIS / Community-Spec-1.0 / Apache-2.0 | detector版のlock、結果へのtool版・対象revision埋込、実行receiptの型 |
| H | provenance chain・consumer逆graph・semantic epoch drift・receipt AND・authority再帰検査 | OS-106, OS-108, OS-109, OS-110, OS-111 | in-toto Statement/attestation / SLSA VSA / GUAC / OpenLineage / Backstage catalog relations / Bazel・Nx・Pants rdeps / TUF delegation / Renovate | Apache-2.0 / CS-1.0 / Apache-2.0 / Apache-2.0 / Apache-2.0 / Apache-2.0,MIT / CS-1.0 / AGPL-3.0 | subject digest束縛、Verification Summary、graph DB model、forward/reverse自動対関係、rdeps query、委譲の前順DFS・失効・版単調性、pin遅れ検出 |
| I | Worker委譲追跡・authority/隔離/品質の独立記録・incident復旧証拠 | OS-043, OS-104, OS-105 | OTel GenAI semconv（invoke_agent/execute_tool）/ OpenInference / MCP / A2A / OPA decision logs / Argo Rollouts（後続版） | Apache-2.0 / Apache-2.0 / MIT→Apache移行中 / Apache-2.0 / Apache-2.0 / Apache-2.0 | tool call ID・agent IDの属性語彙、task状態機械、policy判定記録、analysis run |
| J | Worker比較評価（blind・attempt数・telemetry・qualification） | L-064, L-065, L-068, L-070, L-071 | inspect_ai / SWE-bench / Harbor(Terminal-Bench) / lm-evaluation-harness / HELM / FastChat llm_judge / promptfoo | MIT / MIT / Apache-2.0 / MIT / Apache-2.0 / Apache-2.0 / MIT | Epochs+reducer(pass_at_k)、FAIL_TO_PASS/PASS_TO_PASS oracle、container化再現、eval log、judge位置入替 |

凡例：H-=HARNESS-L2、OS-=HELIXOS-L2、L-=HELIXLABO-L2。

---

## A. 計測契約と完成判定（HARNESS-L2-034, 036；関連 HELIXLABO-L2-070）

要求の要点：要求ごとに版付き計測契約（metric ID、対象req/NFR、workload/env/data、baseline、target/SLO、許容差、sampling/window、tool/probe、evidence schema、oracle、owner、実行layer、再測定trigger）。必須metricの未測定・stale・非代表環境・未達が一つでもあればsystem completion不成立。036はローカルとCIの同一契約。

### A1. OpenSLO
- URL：https://github.com/OpenSLO/OpenSLO ／ https://openslo.com/
- ライセンス：Apache-2.0。最終push 2026-09-29、非archived。
- 借りるもの：`apiVersion: openslo/v1`、`kind: SLO`、`spec.indicator`（`ratioMetric.good/total`、`metricSource`）、`timeWindow`（`duration`、`isRolling`）、`budgetingMethod`（例 `RatioTimeslices`）、`objectives[].target/op/timeSliceWindow`（repo examplesで確認）。034の「target/SLO・window・sampling・tool/probe」を分離fieldとして持つschemaの先行例。
- fit：metric定義とprobe（metricSource）を分離する設計は034の「契約はHARNESS、実測はOS/利用者」と一致。
- misfit：SLOは運用中サービス前提で、requirement revision・非代表環境・stale判定・evidence schema・再測定triggerのfieldを持たない（M2/M4）。運用SLOの本番基盤は後続版領域（M6）。v2alphaは提案段階。
- リスク：低（schema参照のみ）。field名を流用する場合もrequirement binding fieldは自作が必要。

### A2. Lighthouse CI（assert設定）
- URL：https://github.com/GoogleChrome/lighthouse-ci ／ docs/configuration.md
- ライセンス：Apache-2.0。最終push 2026-03-27（活動はやや低下）。
- 借りるもの：assertion level `off/warn/error`、`minScore`/`maxNumericValue`/`maxLength`、`numberOfRuns`と集約`median/optimistic/pessimistic/median-run`、preset。036の「ローカルとCIで同じ設定ファイル（lighthouserc）を使う」UXの先例。
- misfit：`warn`は未達でもexit 0＝fail-closeでない（M4）。集約`optimistic`は「別runの好成績で相殺しない」要求と衝突し得る。
- リスク：中（web性能計測に特化。HELIX 1.0の対象製品に直接適用できるかは対象次第）。

### A3. Bencher（継続ベンチマーク）
- URL：https://github.com/bencherdev/bencher
- ライセンス：Apache-2.0またはMIT（一部`plus`機能ディレクトリは別ライセンス、LICENSE冒頭で確認）。最終push 2026-09-30。
- 借りるもの：branch/testbed（環境）/benchmark/measureの分離、閾値と統計検定によるregression alert。034の「environmentと結果の対応」「baseline比較」のデータモデル参考。 **[未検証：閾値検定の種類の詳細はdocs未読]**
- misfit：testbed同一性の宣言はあるが「代表性」判定はない。SaaS前提機能あり。
- リスク：中（plus機能のライセンス境界に注意）。

### A4. k6 thresholds
- URL：https://github.com/grafana/k6
- ライセンス：**AGPL-3.0**。最終push 2026-09-30。
- 借りるもの：scriptに`thresholds`を宣言し未達で非0終了する「計測と判定条件の同居」。 **[未検証：本調査でdocs本文は未取得]**
- リスク：高（AGPL。コード取込は避け、概念参照に限る）。

### A5. in-toto attestation `test-result` predicate
- URL：https://github.com/in-toto/attestation/blob/main/spec/predicates/test-result.md
- ライセンス：Apache-2.0。最終push 2026-09-14。
- 借りるもの：`predicateType: https://in-toto.io/attestation/test-result/v0.1`、必須`result`（PASSED/WARNED/FAILED）と`configuration`（ResourceDescriptor配列）、`passedTests/warnedTests/failedTests`。subjectはdigest必須。034のevidence schemaの「結果＋実行構成＋対象digest」三点束縛の雛形。
- misfit：`WARNED`の扱いを政策側に委ねる。stale/unknownの状態値がない（M4）ので拡張必要。PASSEDを承認と読まない運用が必要（M3）。

### A6. ISO/IEC 25010（品質モデル）
- 034の品質領域列挙（性能、信頼性、security、互換性、保守性等）の分類源として参照候補。 **[未検証：本調査で規格本文・最新版（2023改訂）の区分は確認していない。有償規格]**

---

## B. 全層ledger・隣接双方向trace・canonical V-pair gate・freeze閉包（HARNESS-L2-040, 055, 056, 063；HELIXOS-L2-038）

要求の要点：L1–L12のledger catalog（stable subject ID、row revision、source span、semantic digest、status、owner、上下edge）、6組のV-pair（L0は層外anchorで7組目にしない）、隣接層の下降（descent）と上昇（backflow）を別々に判定、粒度不一致・非隣接・aggregate覆いは不成立、atom→source span→authority revisionの閉包。

### B1. OpenFastTrace（OFT）
- URL：https://github.com/itsallcode/openfasttrace
- ライセンス：**GPL-3.0**。最終push 2026-09-30、Java。
- 借りるもの（repo内 `doc/terminology.md`、`doc/user_guide/introduction/concepts_and_terms.md`で確認）：
  - specification item ID＝`artifact type`＋`name`＋`revision`（例 `req~login~2`）。
  - revisionは「意味的変更で既存coverage linkを無効化する」ための整数。→ HELIXのrow revision／semantic digestと、下流pinのstale化（H-055/063、OS-110）に直結する設計。
  - item自身の欠陥として missing / **outdated** / **predated** / unwanted coverage を区別。→ 055の「各方向の欠落」「粒度・隣接性不一致」を理由付きで区別する結果型の先行例。
  - `Needs:`（下流に要求するartifact type）と`Covers:`で「どの層がどの層を覆うべきか」を宣言。→ 056のpair定義を「needs宣言」として表現する発想。
- fit：軽量・text-in-repo・CI exit code前提で、HELIXの静的検証段階に近い。
- misfit：artifact typeの連鎖は任意DAGで、「隣接層のみ有効」「L0は層外」の制約はない（自前規則が必要）。backflow（下位発見→上位）を別方向の義務として持たない。authority状態（承認/unknown）の概念なし。
- リスク：中（GPL-3.0のためコード取込は不可に近い。ID文法・状態語彙の概念参照向き）。

### B2. Doorstop
- URL：https://github.com/doorstop-dev/doorstop ／ docs/cli/validation.md
- ライセンス：**LGPL-3.0**（LICENSEで確認）。最終push 2026-09-28、Python。
- 借りるもの：itemごとにYAML1ファイル、ディレクトリ＝document、document間の親子tree。**linkは「親UID＋親itemのfingerprint」を保存し、親fingerprintが変わるとsuspect linkとして警告**、`doorstop clear`で再確認済みに戻す。「no initial review」「unreviewed changes」「子documentからlinkのない親item」「inactive itemへのlink」等の検査項目。
- fit：H-063のchange/stale receipt、OS-110のpin drift、H-055のdescent欠落検出にそのまま対応する最小データモデル。ファイル単位でgit差分review可能。
- misfit：`clear`や`review`はfingerprintを上書き更新（M5：履歴は git 依存）。review記録がreviewer identityやexact HEADを持たない。document treeは単一親で、V-pair（左右対）という横方向relationは表現しにくい。
- リスク：低〜中（LGPL。概念とYAML形状の参照は安全）。

### B3. StrictDoc
- URL：https://github.com/strictdoc-project/strictdoc
- ライセンス：Apache-2.0（LICENSEで確認）。最終push 2026-09-25。
- 借りるもの：`.sdoc`文書のgrammar（要素型ごとのfield定義・必須性）、Parent/Child/File relation、ReqIF入出力、HTML/traceability matrix出力。 **[未検証：grammarの必須field記法とrelation role名の詳細はdocs本文未取得]**
- fit：文書型ごとにfield集合を宣言する点がH-040「ledger type・必須node/edge」とH-041のtemplate atomに近い。Apache-2.0で流用リスクが低い。
- misfit：単一リポジトリ内の文書集合前提。authority revisionやsemantic digestは自前。
- リスク：低。

### B4. sphinx-needs
- URL：https://github.com/useblocks/sphinx-needs ／ https://sphinx-needs.readthedocs.io/
- ライセンス：MIT。最終push 2026-09-30。
- 借りるもの：need type定義、追加field、links（incoming/outgoing）、`needs.json`のexport/import builder、JSON Schemaによるschema validation（公式docsの「Schema validation」節で確認）。→ ledger snapshotの交換形式（OS-038のsnapshot/projection）と、row単位schema検証（H-040）の実例。
- misfit：Sphinx文書生成に強く結合。gateの結果型（成立/不成立/unknown）は持たない。
- リスク：低（MIT）。ただしSphinx依存を持ち込むかは別判断。

### B5. TRLC ＋ LOBSTER（BMW）
- URL：https://github.com/bmw-software-engineering/trlc 、 https://github.com/bmw-software-engineering/lobster
- ライセンス：TRLC **GPL-3.0**、LOBSTER **AGPL-3.0**。両方とも最終push 2026-09-30。
- 借りるもの：TRLC＝型付き要求記述言語（型・制約check）。LOBSTER＝ISO 26262向けのtracing evidence report。`.conf`のtracing policyで階層levelと「どのlevelがどのlevelへtraceすべきか」を宣言し、TRLC/codebeamer/Python/C++/gtest/JSON等から抽出、HTML/CI/JSONレポート（repo READMEで確認）。
- fit：056の「pair定義をpolicyとして宣言しgate結果を局所化」する構造に最も近いOSS。JSON中間形式でtool非依存。
- misfit：exit code仕様はREADMEで明示されず **[未検証]**。authority・revision stale概念は薄い。
- リスク：高（GPL/AGPL。policy記法・レポート構造の概念参照に限る）。

### B6. 標準：Automotive SPICE 4.0 / ReqIF / OSLC
- ASPICE 4.0：traceabilityとconsistencyのbase practiceが統合され、V-model全体で双方向traceability＋内容整合を求める。「traceabilityは参照の存在、consistencyは内容・意味」の区別（VDA PAM 4.0 PDF、解説記事で確認）。→ H-055/056で「linkの存在だけでgate成立としない」根拠資料として有用。ライセンス：VDA QMC配布（再配布制限あり）。
- ReqIF（OMG Requirements Interchange Format）：要求交換XML標準。StrictDocが入出力対応。 **[未検証：本調査でOMG仕様本文は未取得]**
- OSLC RM/QM（OASIS）：requirement↔test等のlinked-data relation語彙。 **[未検証：repo/仕様の現行状態未確認]**
- リスク：規格は参照のみ。ASPICEは有償/制限付き配布。

---

## C. template obligation抽出・二段設計合流・Design Refactor判定（HARNESS-L2-037, 041, 042）

要求の要点：active template revisionから章・field・table row・applicability・done-when・pair contractを原子的obligationとして機械抽出し、source span・semantic digest・extractor版を付与。空/TBD/抽出不能/重複はgap finding。LLM自由補完禁止。042は意味・consumer・oracle・依存graphの前後比較で判定、名称一致だけで判定しない。

### C1. StrictDoc grammar ／ sphinx-needs schema（B3/B4再掲）
- 借りるもの：template＝grammar（型付きfield・必須性）として宣言し、文書側の欠落をvalidatorが個別エラーにする方式。H-041の「未対応template要素・空/TBD」を個別gapにする実装形。
- misfit：applicability rule（条件付き必須）や「pair contract」は表現力不足の可能性 **[未検証]**。

### C2. MADR（Markdown Any Decision Records）／ log4brains ／ adr-tools
- MADR：https://github.com/adr/madr 、ライセンス MIT OR CC0-1.0、最終push 2026-08-28。テンプレートfront-matter `status`（proposed/rejected/accepted/deprecated/superseded by ADR-xxxx）、`date`、`decision-makers`、`consulted`、`informed`、本文「Context and Problem Statement」「Decision Drivers」「Considered Options」「Decision Outcome」「Consequences」（repo templateで確認）。→ 042の判定根拠・拒否理由・維持契約の記録形、037の二段設計合流時の選択記録。
- log4brains：https://github.com/thomvaill/log4brains 、Apache-2.0、最終push 2024-12-17（**停滞**）。
- adr-tools：https://github.com/npryce/adr-tools 、**GPL-3.0**、最終push 2024-04-25（**停滞**）。`supersede`リンクUXのみ参考。
- misfit：statusに「accepted」があり、ツールがそれを承認記録として扱うと人間decision生成と混同（M3）。HELIXでは判断記録は別の不変recordとし、MADR statusを要求承認として読まない注意が要る。

### C3. 契約差分（breaking change判定）：oasdiff ／ buf breaking
- oasdiff：https://github.com/oasdiff/oasdiff 、Apache-2.0、最終push 2026-09-21。OpenAPI差分とbreaking change検出 **[未検証：rule一覧はdocs未読]**。
- buf：https://github.com/bufbuild/buf 、Apache-2.0、最終push 2026-09-29。Protobufの`buf breaking`（互換性category別の規則） **[未検証：category名は未確認]**。
- fit：042の「維持すべき契約」「consumerへの影響」を機械判定する素材。semantic epoch（OS-110）の「内容差≠意味世代差」を補助する材料にもなる。
- misfit：API契約に限定。要求・設計文書の意味比較は対象外。

### C4. 依存graph規則：dependency-cruiser ／ ArchUnit
- dependency-cruiser：https://github.com/sverweij/dependency-cruiser 、MIT、最終push 2026-09-23（JS/TS依存の規則検査と可視化）。
- ArchUnit：https://github.com/TNG/ArchUnit 、Apache-2.0、最終push 2026-09-30（Javaのアーキテクチャ規則をunit testとして記述）。
- fit：042の「変更前後の依存graph」比較と、Design Refactorで機能追加を混載しない判定の補助証拠。
- リスク：言語別。HELIX自体の実装言語決定後に選ぶ。

### C5. 設計テンプレート標準（参考）
- ISO/IEC/IEEE 29148（要求）、42010（アーキテクチャ記述）、arc42、C4 model。 **[未検証：本調査で本文・現行版は未確認。structurizr/javaは2026-02にarchived化を確認、DSL repoは404]**

---

## D. UI/Experience/Frontend契約と画面prototype表示計測oracle（HARNESS-L2-039, 049）

要求の要点：体験成果・UI・Frontend契約を同一scope/revisionに結ぶ（039）。与えられたrenderable prototypeを表示計測するoracle・検査精度・文言量評価（049、生成はしない）。

### D1. Playwright（visual comparison ＋ ARIA snapshot）
- URL：https://github.com/microsoft/playwright 、https://playwright.dev/docs/test-snapshots 、https://playwright.dev/docs/aria-snapshots
- ライセンス：Apache-2.0。最終push 2026-09-30。
- 借りるもの：
  - `toHaveScreenshot`：baseline名に**browser名とplatform**を含め環境別baselineを分ける、`maxDiffPixels`等の許容差、`stylePath`で動的要素を除外。docsは「描画はhost OS・版・設定・hardware・電源・headless等で変わる」と明記（確認済み）→ 049の「検査精度」と034の「非代表環境」判定の根拠。
  - `toMatchAriaSnapshot`：アクセシビリティ木をYAML（`role "name" [attr]`）で表す構造oracle、部分一致・正規表現、`--update-snapshots`（確認済み）。→ pixelに依存しない画面構造oracle。
- misfit：`--update-snapshots`でbaselineを上書き（M5）。baseline更新はauthority付き変更として別記録が必要。
- リスク：低。

### D2. axe-core
- URL：https://github.com/dequelabs/axe-core 、doc/API.md
- ライセンス：**MPL-2.0**（file単位copyleft）。最終push 2026-09-30。
- 借りるもの：結果を`violations`／`passes`／**`incomplete`（要人手確認）**／`inapplicable`の4区分で返し、`testEngine`版・`testEnvironment`・`timestamp`・`url`を同梱。`runOnly`のtag（wcag2a/wcag2aa/wcag21aa/wcag22aa/best-practice）。→ 034/049の「unknownを非適用や合格へ変えない」結果型の良い先例（incompleteとinapplicableの分離）。
- リスク：低〜中（MPLは改変fileの開示義務。依存利用は問題少）。

### D3. Storybook
- URL：https://github.com/storybookjs/storybook 、https://storybook.js.org/docs/writing-tests
- ライセンス：MIT。最終push 2026-09-30。
- 借りるもの：story＝画面状態の単位契約、play functionによるinteraction test、a11y addon、Vitest addonでstoryをtest化、coverage表示（docsで確認）。→ 039の「screen/profile/source contract」を状態単位で列挙する形。
- misfit：visual testはChromatic（商用SaaS）連携が既定導線。
- リスク：低。

### D4. デザイントークン：DTCG Format Module 2025.10 ／ Style Dictionary
- DTCG：https://www.designtokens.org/ 、https://github.com/design-tokens/community-group 。**初の安定版 2025.10（2025-10-28公表）**を確認。draft版（2026-09-08）は「実装するな」と明記。`$value`、`$type`、`$description`、`$extensions`、`$deprecated`、`{group.token}`参照とJSON Pointer`$ref`。ライセンス：W3C Software and Document License。
- Style Dictionary：https://github.com/style-dictionary/style-dictionary （旧amzn/style-dictionaryから移管を確認）、Apache-2.0、最終push 2026-09-30。token→platform出力変換。
- fit：039のUI profile・製品COREの制約を「版付きtoken集合」としてrevision pinできる。**参照は安定版2025.10に固定**すべき（M2）。
- リスク：低。

### D5. 画像回帰：reg-suit ／ BackstopJS
- reg-suit：https://github.com/reg-viz/reg-suit 、MIT、最終push 2026-09-24。
- BackstopJS：https://github.com/garris/BackstopJS 、MIT、最終push 2026-09-08。
- fit：baseline画像の保管・比較レポート。Playwrightで足りれば不要。

### D6. 文言量評価：textlint ／ Vale
- textlint：https://github.com/textlint/textlint 、MIT、最終push 2026-09-30（日本語rule資産が厚い）。
- Vale：https://github.com/vale-cli/vale 、MIT、最終push 2026-09-28（旧errata-ai/valeから移管）。
- fit：049の「文言量評価」をrule化する素材（文長・語数・表記）。 **[未検証：画面DOMから抽出したtextへの適用例は未確認]**

### D7. Figma Code Connect（参考）
- https://github.com/figma/code-connect 、MIT、最終push 2026-09-23。design componentとcode componentの対応宣言。039のExperience↔UI↔Frontend対応の一例。Figma依存のため参考止まり。

---

## E. 工程workflow・Issue contract・stage入力revision・closure・dispatch→merge連続性・event因果（HARNESS-L2-046, 057, 059, 060；HELIXOS-L2-046, 103）

### E1. GitHub REST「Merge a pull request」の`sha` ／ `gh pr merge --match-head-commit`
- URL：https://docs.github.com/en/rest/pulls/pulls#merge-a-pull-request
- 確認事項：body `sha`＝「PR headが一致しなければmergeさせないSHA」、不一致時 **409 Conflict**。`merge_method`は merge/squash/rebase。ローカル`gh pr merge --help`に`--match-head-commit SHA`あり（確認済み）。
- fit：OS-046「dispatch→merge admissionでHEADが変わればstale」と、CLAUDE.md の「exact HEADを独立review→明示merge」を**機械的に担保する最小手段**。review対象HEADをそのまま`--match-head-commit`へ渡す運用が直接使える。
- misfit：同helpにある`--auto`（auto-merge）は使わない（M1）。409はHEAD一致のみでbase変化・scope変化は検出しない（base／`scfctl stale=0`の再照合は別途必要）。
- リスク：極小（既存運用の範囲内）。

### E2. CloudEvents 1.0
- URL：https://github.com/cloudevents/spec 、Apache-2.0、最終push 2026-09-03。
- 借りるもの：必須`id`・`source`・`specversion`・`type`、任意`datacontenttype`・`dataschema`・`subject`・`time`。「`source`＋`id`は各eventで一意（producer責任）」（確認済み）。→ OS-103の重複event検出・冪等projectionのidentity規約。
- misfit：因果（parent/cause）は拡張依存。

### E3. CDEvents（CloudEvents上のCI/CD語彙）
- URL：https://github.com/cdevents/spec 、Apache-2.0、最終push 2026-09-28。
- 借りるもの：`type`＝`dev.cdevents.<subject>.<predicate>.M.m.p`、`chainId`と`links`（PATH／RELATION／END）で**event因果**を表現、subject語彙（change created/reviewed/merged、pipelineRun/taskRun、artifact packaged/published/signed、testCaseRun、incident detected/resolved）。spec.md記載のspecversionは`0.1.1`表記（確認時点。版表記は要再確認）。
- fit：OS-103（stage event→projectionの因果）、OS-043（委譲event）、OS-105（incident）に語彙・link型を借用できる。
- misfit：`change.merged`等のeventを受領しただけでmerge admissionや完了の証拠とする設計にしない（M3）。語彙はCD pipeline寄りで、HELIXのstage（V-model層）は自前定義。
- リスク：低〜中（仕様の成熟度が0.x）。

### E4. OpenTelemetry trace／span links
- URL：https://github.com/open-telemetry/opentelemetry-specification 、Apache-2.0、最終push 2026-09-30。
- 借りるもの：parent-child以外の因果（fan-in、batch）をspan linkで表す考え方。 **[未検証：本調査でlinks節本文は未取得]**

### E5. append-only event store（eventsourcing）
- pyeventsourcing/eventsourcing：https://github.com/pyeventsourcing/eventsourcing 、BSD-3-Clause、最終push 2026-08-23。aggregate version・notification log・projection再構築の実装パターン。 **[未検証：API詳細未確認]**
- Dolt：https://github.com/dolthub/dolt 、Apache-2.0、最終push 2026-09-30。git的commit/branchを持つSQL DB。ledger snapshot（OS-038）の保存候補の一例。ただしHELIXではDB状態から承認・完了を生成しない（M3）。

### E6. GitHub Issue forms（H-059 Issue contract 11 fields）
- URL：https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema
- 借りるもの：body要素（input/textarea/dropdown/checkboxes/markdown/upload）に`id`と`validations.required`。11 fieldを独立`id`で持つ投影形の先例。
- **重要misfit**：`required`は**public repositoryのみ強制**（docsで確認）。private repoでは必須性が効かず、GitHub側でfield欠落を拒否できない。またGitHubはprojectionであり正本ではない（AGENTS.md）。→ contract＋digestの必須検査はHARNESS側で行い、Issue formは投影UIに留めるのが整合的。
- リスク：低（UIのみ）。

### E7. gate／merge自動化系（misfit例として記録）
- Prow/Tide：https://github.com/kubernetes-sigs/prow 、Apache-2.0、最終push 2026-09-30。label・required contextsに基づく自動merge pool。**M1違反のため採用不可**、ただし「merge前に最新baseで再test」する考え方はOS-046の再照合の参考。
- Zuul（speculative gating）：**[未検証：github.com/zuul-ci/zuul・opendev/zuulともにAPIで404、OpenDevのgit hostingは未確認]**。
- 057 closure gate：GitHub branch protectionのrequired checksは「CI green＝merge可」の結合で、HELIXの「merge済み・CI greenからoracle合格やIssue closeを生成しない」と逆向き（M3）。closure条件はPR/CI/audit/merge/oracle/子Issueを別入力として持つ自前判定器にする必要がある（下記H2のAND結合と共通化可能）。

### E8. H-046（Full V workflow／Scrum slice backfill）
- 直接対応する成熟OSSは見つからなかった。検索範囲：要求管理ツール（B節）、CI/CD event語彙（E3）。ASPICE 4.0のagile適用ガイダンスが近い可能性 **[未検証]**。新規案扱いで、旧HELIX v1.3 §4.4/§10の再導出を起点にするのが妥当。

---

## F. finding分類・disposition・debt ratchet・taxonomy handoff（HARNESS-L2-058, 062；HELIXOS-L2-107）

### F1. SARIF 2.1.0（OASIS標準、errata01）
- URL：https://docs.oasis-open.org/sarif/sarif/v2.1.0/errata01/os/sarif-v2.1.0-errata01-os-complete.html 、https://github.com/oasis-tcs/sarif-spec （OASIS IPR）、SDK https://github.com/microsoft/sarif-sdk （MIT、LICENSEで確認）
- 借りるもの（仕様本文で確認）：
  - `result.baselineState`：`new`／`unchanged`／`updated`／`absent` → **H-062のbaseline debt／new debt区別そのもの**。
  - `suppression.kind`（inSource/external）、`suppression.status`（accepted/underReview、errata版で`rejected`含むかは要再確認 **[未検証]**）、`justification`。→ H-058の`accepted_risk`／`false_positive`のdisposition記録形。
  - `fingerprints`／`partialFingerprints`：artifact変更を越えたfinding同一性 → baseline比較と`duplicate`判定。
  - `taxonomies`・`taxa`・`relationships`（例：CWEへの版付き対応）→ **OS-107のtaxonomy revision／mapping revision pin**。
  - `run.versionControlProvenance`（`repositoryUri`、`revisionId`、`branch`、`revisionTag`、`asOfTimeUtc`）→ 対象revision束縛（M2）。
  - `tool.driver.version`／`semanticVersion` → OS-033のdetector版。
- fit：HELIXのfinding交換形式の第一候補。HARNESS・OS・既存linterの間で共通化できる。
- misfit：HELIXの六分類（current_pr_fix／successor_issue／duplicate／false_positive／accepted_risk／telemetry）とaffected layerは標準に無く、`properties`拡張で持つ必要。baselineState算出アルゴリズムはtool依存。
- リスク：低。

### F2. OpenVEX
- URL：https://github.com/openvex/spec 、**CC0-1.0**、最終push 2026-09-09。
- 借りるもの：status `not_affected`／`affected`／`fixed`／`under_investigation`、`not_affected`には機械可読`justification`（5値）または`impact_statement`必須、`affected`には`action_statement`、文書`version`は内容変更ごとに増分必須・`timestamp`必須（確認済み）。→ H-058のobjection／disposition記録に「理由の型付き必須化」と「版の単調増加」を移植できる。`under_investigation`はunknownを明示する状態値の好例（M4）。
- misfit：脆弱性×製品の文脈専用。

### F3. CWE
- https://cwe.mitre.org/ 。OS-107の「外部taxonomyを版付きで参照する」例（SARIFのtaxonomy参照先の定番）。 **[未検証：本調査で現行CWE版番号は未確認]**。security分類はweb配備後の比重が大きく、1.0必須のtaxonomyにしない（M6）。

### F4. ratchet／baselineのCLI実装例
| ツール | URL | ライセンス | 最終push | 借りる点 | misfit |
|---|---|---|---|---|---|
| ESLint bulk suppressions | https://eslint.org/docs/latest/use/suppressions | MIT | 2026-09-30 | `eslint-suppressions.json`をcommit、`--suppress-all`/`--suppress-rule`/`--prune-suppressions`、**解消済みsuppressionが残ると非0終了**（逆方向のratchet）、errorレベルのみ対象（確認済み） | `--pass-on-unpruned-suppressions`で緩められる |
| betterer | https://github.com/phenomnomnominal/betterer | MIT | 2026-07-11 | 結果ファイルを保存し「悪化したら失敗・改善したら更新」 **[未検証：現行CLI詳細]** | 改善時の自動更新はM5（上書き）に注意 |
| detekt baseline | https://detekt.dev/docs/introduction/baseline/ | Apache-2.0 | 2026-09-29 | `baseline.xml`に`ManuallySuppressedIssues`と`CurrentIssues`を分離、ID＝`RuleID:署名`、以降は新規のみ報告（確認済み） | 手動抑止と既存debtを同じfileで管理（authority区別なし） |
| Semgrep diff-aware | https://docs.semgrep.dev/semgrep-ci/findings-ci | LGPL-2.1（engine） | 2026-09-30 | `--baseline-commit`／`SEMGREP_BASELINE_REF`で**baseline commitからの新規findingのみ**報告（確認済み） | baselineが「commit」でありauthority付き集合ではない |
| SonarQube new code | https://docs.sonarsource.com/sonarqube-server/user-guide/about-new-code | LGPL-3.0 | 2026-09-29 | new code定義4方式（previous version／number of days／specific analysis／reference branch）、quality gateをnew codeのみに適用（確認済み） | server前提、gate green＝承認と読まれやすい（M3） |
| PHPStan baseline | https://github.com/phpstan/phpstan | MIT | 2026-09-30 | baseline neon file **[未検証]** | — |
| reviewdog | https://github.com/reviewdog/reviewdog | MIT | 2026-09-30 | diff範囲filter（added/diff_context等）でPR差分上の新規のみ指摘 **[未検証：filter-mode名]** | PR comment自動投稿は投影に留める |

- H-062への総括：**「baselineのauthority／identity／revision／scope／鮮度」を持つツールは無い**。どれもbaselineをファイルまたはcommitで暗黙に表す。HELIXは(1) SARIF `baselineState`で結果を表し、(2) baseline集合自体を版付き・authority参照付きrecordにし、(3) baseline不明時はunknown（pass不可）にする、の三点を自前で足す必要がある。

---

## G. versioned engine/detector registryと同一snapshot再現（HELIXOS-L2-033）

### G1. CodeQL packs
- URL：https://github.com/github/codeql （MIT、2026-09-30）、docs「Creating and working with CodeQL packs」
- 借りるもの：`qlpack.yml`（`<scope>/<pack>`名、`version`、依存のsemver範囲）、`codeql-pack.lock.yml`に正確な版を固定しcommit、GHCRで配布（確認済み）。→ detector identity＋version＋lockの registry 形。
- misfit：CodeQL CLI自体は商用条件付き利用 **[未検証：CLI利用許諾条件は本調査で未確認]**。

### G2. Semgrep rules registry
- URL：https://github.com/semgrep/semgrep-rules 、**Semgrep Rules License v1.0**（LICENSEで確認。OSIライセンスではなく利用制限あり）、最終push 2026-09-28。
- 借りるもの：rule ID・metadata（CWE・confidence等）の付け方。 **リスク高**：rule本文の取込は許諾確認が必要。

### G3. SARIF `tool.driver`／`versionControlProvenance`（F1再掲）＋ SLSA provenance v1 ＋ in-toto witness
- SLSA provenance：https://slsa.dev/spec/v1.1/provenance （v1.1はretired表示、v1.2が現行と確認）、repo https://github.com/slsa-framework/slsa （Community Specification License 1.0）。`buildDefinition`（`buildType`、`externalParameters`、`internalParameters`、`resolvedDependencies`）、`runDetails`（`builder.id`、`builder.version`、`metadata.invocationId/startedOn/finishedOn`、`byproducts`）。→ OS-033の「登録・開始時入力」と「実行後receipt」の分離にそのまま使える構造。
- in-toto witness：https://github.com/in-toto/witness 、Apache-2.0、2026-09-28。コマンド実行をラップしattestationを生成 **[未検証：attestor一覧]**。
- 同一snapshot再現：Reproducible Builds（https://reproducible-builds.org/）の比較手法 **[未検証]**。
- misfit：SLSA/witnessはbuild供給網向けで、detector判定の「再現比較結果」型は自前。署名基盤（Sigstore公開インフラ）必須化はM6で1.0に前倒ししない。

---

## H. provenance chain・consumer逆graph・semantic epoch drift・三receipt AND・authority再帰検査（HELIXOS-L2-106〜111）

### H1. in-toto Statement／attestation framework
- URL：https://github.com/in-toto/attestation （Apache-2.0、2026-09-14）、https://github.com/in-toto/in-toto （Apache-2.0、2026-08-27）
- 借りるもの：Statement＝`subject[]`（各要素に`digest`必須、subjectは不変と仮定）＋`predicateType`（URI）＋`predicate`（確認済み）。predicate種（provenance、link、test-result、vsa、spdx、cyclonedx、release、runtime-trace、scai、reference等）をrepoで確認。→ OS-109の各edge（source→generator→artifact→consumer）を「digest束縛のstatement連鎖」で表す基本単位。in-toto layoutはstep間のartifact一致を検証する（OS-109の「edge両端のidentity/revision一致」） **[未検証：layout仕様本文は未読]**。
- misfit：consumer（読む側）edgeの型は標準に薄い。

### H2. SLSA Verification Summary Attestation（VSA）
- URL：https://slsa.dev/spec/v1.2/verification_summary
- 借りるもの：`verifier.id`、`timeVerified`、`resourceUri`、`policy`（URI＋digest）、`inputAttestations`（URI＋digest）、`verificationResult`（PASSED/FAILED）、`verifiedLevels`（確認済み）。→ **OS-111の三receipt AND結合**を「入力receiptをdigestで列挙し、policy版を固定した集約結果」として記録する形。H-057 closure gateの集約結果にも流用可。
- misfit：VSAは「消費者が個別attestationを検証せず信頼できる」ことを狙う＝集約で個別を代替する設計。HELIXは集約greenを各ownerの結果へ昇格させない（OS-104/111）ので、集約receiptに入力状態（missing/stale/unknown）を保持する拡張が必須（M4）。PASSEDを承認と読まない（M3）。

### H3. GUAC（Graph for Understanding Artifact Composition）
- URL：https://github.com/guacsec/guac 、Apache-2.0、最終push 2026-09-29。
- 借りるもの：SBOM・SLSA・OpenVEX等のattestationをingestしてartifact／package／source間のgraphを作りqueryする設計 **[未検証：GraphQL schemaの具体名]**。→ OS-108/109のgraph projection設計の参考。
- misfit：規模が大きい。「forward authoritative relationとreverse projectionを別保持」する区別はない。
- リスク：中（運用重量級。概念参照推奨）。

### H4. OpenLineage
- URL：https://github.com/OpenLineage/OpenLineage 、Apache-2.0、最終push 2026-09-30。
- 借りるもの：Run／Job／Dataset（input/output）とfacetによるlineage event。 **[未検証：facet名]** → OS-109のgenerator run→generated artifactのedge表現。
- misfit：data pipeline向け。

### H5. W3C PROV-O
- Entity／Activity／Agentと`wasDerivedFrom`／`wasGeneratedBy`／`used`等の語彙。 **[未検証：本調査で仕様本文未取得]**。OS-109のchain語彙の中立な基礎として参照候補。

### H6. 逆依存graph（OS-108）
| 資料 | URL | ライセンス | 最終push | 借りる点 |
|---|---|---|---|---|
| Backstage Software Catalog | https://backstage.io/docs/features/software-catalog/well-known-relations | Apache-2.0 | 2026-09-30 | 対関係`dependsOn/dependencyOf`、`providesApi/apiProvidedBy`、**`consumesApi/apiConsumedBy`**、`ownedBy/ownerOf`、`partOf/hasPart`等。片側宣言から逆側を自動生成（docsで確認） |
| Bazel query `rdeps` | https://github.com/bazelbuild/bazel | Apache-2.0 | 2026-09-30 | `rdeps(universe, x)`でscope（universe）を明示した逆依存 **[未検証：本調査でdocs未取得、周知機能]** |
| Nx graph／affected | https://github.com/nrwl/nx | MIT | 2026-09-30 | project graphと変更影響（affected） |
| Pants `dependents` | https://github.com/pantsbuild/pants | Apache-2.0 | 2026-09-30 | 逆依存列挙 **[未検証]** |
| deps.dev | https://github.com/google/deps.dev | Apache-2.0 | 2026-09-28 | 公開package依存graphのAPI（外部package向け） |
- fit／misfit：OS-108は「authoritative forward relationとreverse projectionを別保持し双方向照合」を求める。Backstageの自動逆生成は**逆側を派生物として作る**ため、「forward期待集合をreverseから作らない」要求に照らすと、HELIXでは生成された逆edgeを照合対象（projection）としてのみ扱う必要がある。Bazelの`universe`明示はOS-108の「明示scope」に合う。

### H7. semantic epoch drift／consumer pin差分（OS-110）
- Renovate：https://github.com/renovatebot/renovate 、**AGPL-3.0**、最終push 2026-09-30。consumerのpin（lock/digest）が上流より古いことを検出する代表例。**automerge機能はM1違反**、概念参照のみ。
- Apicurio Registry：https://github.com/Apicurio/apicurio-registry 、Apache-2.0、最終push 2026-09-30。schema版と互換性規則（BACKWARD/FORWARD等） **[未検証：規則名]**。→ 「content digest差だけでsemantic epoch変更と推定しない」ため、epochを明示宣言し互換性規則で判定する設計の参考。
- OpenFastTrace revision（B1）とDoorstop fingerprint（B2）：前者は**意味的変更時のみ手動でrevisionを上げる**＝semantic epochの明示宣言、後者は**内容fingerprint**＝content digest。OS-110が区別する二概念の対比例として最適。

### H8. authority binding参照先の再帰検査（OS-106）
- TUF（The Update Framework）仕様：https://theupdateframework.github.io/specification/latest/ 、repo https://github.com/theupdateframework/specification （Community Specification License 1.0、2026-09-21）
- 借りるもの（確認済み）：delegated targets roleの階層、「delegationはいつでもrevoke可」、terminating delegation、threshold署名（同一keyidは重複countしない）、`expires`と単調`version`によるfreeze/rollback防止、**top-level targetsからの前順深さ優先探索（循環回避・訪問数上限）**。→ OS-106の「binding chainを再帰的に辿り、失効・履歴状態のtargetへのcurrent edgeを有効と扱わない」検査アルゴリズムの直接の参考。
- misfit：署名鍵・暗号検証は範囲外（HELIX 1.0は記録の参照関係の検査）。公開配布の鍵運用はM6。
- OPA／conftest：https://github.com/open-policy-agent/opa （Apache-2.0）、https://github.com/open-policy-agent/conftest （Apache-2.0、LICENSEで確認）。policy-as-codeでrecord群を検査。decision log（decision_id・input・result） **[未検証：field名]** はOS-104のauthority判定記録の形の参考。

---

## I. Worker委譲追跡・authority/隔離/品質の独立記録・incident復旧証拠（HELIXOS-L2-043, 104, 105）

### I1. OpenTelemetry GenAI semantic conventions
- URL：https://github.com/open-telemetry/semantic-conventions-genai （Apache-2.0、2026-09-30。2026年に本体semantic-conventionsから移設されたことをdocsで確認）
- 借りるもの：agent操作`create_agent`／`invoke_agent`／`execute_tool`、属性`gen_ai.agent.id`、`gen_ai.tool.call.id`、`gen_ai.tool.name`、`gen_ai.conversation.id`（移設前ページで確認。現行repoでの安定度は **[未検証]**）。→ OS-043の「approval request／tool call／resultを区別し対応を後から追う」ためのID語彙。
- misfit：approval request型は標準語彙に無い **[未検証]**。traceはtelemetryであり承認・完了の証拠ではない（M3）。

### I2. OpenInference
- https://github.com/Arize-ai/openinference 、Apache-2.0、2026-09-30。LLM/agent/tool spanの属性規約（OTel互換） **[未検証：span kind一覧]**。

### I3. Model Context Protocol（MCP）／Agent2Agent（A2A）
- MCP：https://github.com/modelcontextprotocol/modelcontextprotocol 、MIT→Apache-2.0へ移行中（LICENSEで確認）、2026-09-30。tool call request/resultのJSON-RPC形、利用者確認の仕組み **[未検証：現行版の該当節]**。
- A2A：https://github.com/a2aproject/A2A 、Apache-2.0、2026-09-29。task状態機械（input-required等） **[未検証：状態名]**。
- fit：OS-043のevent型の分類参考。misfit：transport・runtimeを定義する仕様だが、OS-043はschema/transport/runtimeを本候補で定義しないと明記→参照は語彙に限定。

### I4. OS-104（authority・隔離・品質の三記録）
- in-toto attestationで**predicateTypeを分けた三種のstatement**（authority判定／隔離適用観測／品質oracle結果）を同一subject（operation identity＋revision）に束縛する形が素直（H1、A5）。
- 隔離実行環境（gVisor、Firecracker、コンテナsandbox等）は**web配備後のinfra領域でありHELIX 1.0の必須にしない**（M6）。inspect_ai／SWE-benchのDocker sandbox（J節）は評価用途として別扱い。

### I5. OS-105（incident復旧証拠相関）— 後続版寄り
- CDEvents `incident.detected/resolved`（E3）、OpenSLO（A1）、Argo Rollouts（https://github.com/argoproj/argo-rollouts 、Apache-2.0、2026-09-29：AnalysisRunとrollback） **[未検証：AnalysisRun fieldの詳細]**。
- 本要求は「production事象」前提であり、**本番運用基盤はweb配備後。1.0の必須依存に前倒ししない**（M6）。1.0で要るのは「incident identity・影響revision・回復確認結果・procedure・rollback実施/未実施」の相関record形だけで、これはCDEvents subject＋in-toto statementで表せる。

---

## J. Worker比較評価：blind・attempt数・補助telemetry・qualification（HELIXLABO-L2-064, 065, 068, 070, 071）

### J1. inspect_ai（UK AISI）
- URL：https://github.com/UKGovernmentBEIS/inspect_ai 、https://inspect.aisi.org.uk/ 、MIT、最終push 2026-09-30。
- 借りるもの（docsで確認）：Task＝dataset＋solver＋scorer、sandbox（Docker/Kubernetes等）、eval log（sample・transcript・score）、model roles（solver/grader）、eval set（retry・limits）。**`Epochs(5, ["mean", "pass_at_5"])`のように複数epochをreducerで集約**、`HeadlineMetric`、judge間一致の`krippendorff_alpha()`（repo docs/metrics.qmdで確認）。
- fit：L-064（fixture/rubric/judge version/sample/retryを比較前に固定）→Task定義＋eval logの版固定、L-065（machine smokeとfull benchの分離、8軸scorecard）、L-068（attempt identity数）→epoch×sampleのlog単位。
- misfit：retryとepochの区別がHELIXのAttempt identity（OS記録由来）と一致しない。L-068は「OS記録のdistinct Attempt identity数」でありinspectのepoch数とは別物として扱う必要。
- リスク：低（MIT、活発）。

### J2. SWE-bench
- URL：https://github.com/SWE-bench/SWE-bench 、MIT、最終push 2026-09-18。
- 借りるもの：Docker化された再現評価、`swebench eval verified -p <predictions> --run-id <id>`のCLI（README確認）、instanceごとのFAIL_TO_PASS／PASS_TO_PASS test集合をoracleとする方式（周知。本調査READMEでは語を未確認 **[未検証]**）、人手検証済みsubset（Verified）。→ L-065の「task別性能証拠」「quality/acceptance oracle」の先例。
- misfit：公開benchmarkは学習汚染の懸念。HELIX固有のGitHub監査task class（L-071）は自前fixtureが必要。

### J3. Harbor（Terminal-Benchの後継framework）
- URL：https://github.com/harbor-framework/harbor 、Apache-2.0、最終push 2026-09-30。旧`laude-institute/terminal-bench`はAPI上`harbor-framework/terminal-bench-1`へ移管（2026-07-11最終push）。
- 借りるもの：Claude Code／Codex CLI／OpenHands等の**任意agentを同一環境で評価**、Terminal-Bench 2.0実行、並列sandbox provider（README確認）。→ L-064/065のruntime比較（候補runtime資格）。
- misfit：外部sandbox provider利用はsecrets・data境界の確認が必要（1.0ではローカルDockerに限定するのが安全）。

### J4. その他の評価基盤
| 資料 | URL | ライセンス | 最終push | 借りる点 |
|---|---|---|---|---|
| lm-evaluation-harness | https://github.com/EleutherAI/lm-evaluation-harness | MIT | 2026-09-14 | task版管理と再現設定 |
| HELM | https://github.com/stanford-crfm/helm | Apache-2.0 | 2026-09-01 | 多軸評価（accuracy以外の軸）とscenario版 |
| FastChat（MT-bench llm_judge） | https://github.com/lm-sys/FastChat | Apache-2.0 | 2026-05-01 | pairwise judgeで**回答位置を入替えて位置biasを抑える**手法 **[未検証：現行コード位置]** → L-064 blind比較 |
| promptfoo | https://github.com/promptfoo/promptfoo | MIT | 2026-09-30 | 宣言的比較matrix、assertion |
| AlpacaEval | https://github.com/tatsu-lab/alpaca_eval | Apache-2.0 | 2025-08-09（**停滞**） | length-controlled win rate（長さbias補正）→ L-070の文言量併記の注意点 |
| openai/evals | https://github.com/openai/evals | MIT（LICENSEで確認） | 2026-04-14（活動低下） | registry形式のeval定義 |
| DORA Four Keys | https://github.com/dora-team/fourkeys | Apache-2.0 | **archived**（2024-01） | 変更リードタイム等の指標定義のみ参考（L-070の待ち時間・escaped defects・recovery） |

- L-064 blind：候補名遮蔽は多くの基盤で標準機能ではない。FastChatの位置入替、inspect_aiのgrader role分離を組み合わせ、「judgeに提示した資料の記録」と「元identityの追跡記録」を分けるのはHELIX側の設計になる。
- L-071 qualification：model revision更新で旧資格を失効させる規則は外部基盤に無い。inspect eval logのmodel名・版固定を入力にし、資格recordは別に持つ。

---

## 横断リスクと推奨の読み方

1. **ライセンス**：コード取込を想定しないなら問題は小さいが、GPL-3.0（OpenFastTrace、TRLC、adr-tools）、AGPL-3.0（LOBSTER、k6、Renovate）、LGPL（Doorstop、Semgrep engine、SonarQube）、Semgrep Rules License（非OSI）、MPL-2.0（axe-core）は取込時に要判断。Apache-2.0/MIT/CC0で概念が揃うのは SARIF・OpenVEX・in-toto・SLSA仕様・StrictDoc・sphinx-needs・inspect_ai・Playwright。
2. **承認生成の混入（M3）**：MADR `status: accepted`、VSA `PASSED`、SonarQube quality gate、branch protection required checks、CDEvents `change.merged`は、いずれも「状態＝承認／完了」と読まれやすい。HELIXでは各々を**owner別の独立結果**として保持し、要求承認・受入・closeへ昇格させない。
3. **自動merge（M1）**：Prow/Tide、Renovate automerge、`gh pr merge --auto`は不採用。逆に`gh pr merge --match-head-commit`（REST `sha`、409）は現行運用を強化する。
4. **unknownの扱い（M4）**：外部ツールの多くは欠落をskip/passにする。先例として良いのは axe-core `incomplete`、OpenVEX `under_investigation`、SARIF `baselineState`、OFT `outdated/predated`。
5. **後続版（M6）**：公開Sigstore/Rekor、本番隔離runtime、本番SLO/incident基盤、CWE中心のsecurity taxonomyは1.0必須にしない。

## 未検証項目一覧

- Bencherの閾値検定種類、k6 thresholds本文、ISO/IEC 25010本文。
- StrictDoc grammarの必須field記法、ReqIF・OSLC仕様の現行状態、LOBSTERのexit code。
- oasdiff・bufの規則category名、ISO/IEC/IEEE 29148/42010・arc42・C4、Structurizr DSL repo（404）。
- textlint/ValeのDOM抽出text適用例。
- OTel span links節、pyeventsourcingのAPI、Zuulのrepo所在（GitHub上404）。
- SARIF suppression statusの`rejected`値の有無（errata01）、CWE現行版、PHPStan baseline・reviewdog filter-mode名・betterer現行CLI。
- CodeQL CLIの利用許諾条件、in-toto witnessのattestor、Reproducible Builds手法、in-toto layout仕様本文。
- GUAC schema、OpenLineage facet、PROV-O本文、Bazel `rdeps`・Pants `dependents`のdocs、Apicurio互換規則名、OPA decision log field。
- OTel GenAI semconvの現行安定度とapproval語彙、OpenInference span kind、MCP/A2Aの該当節と状態名、Argo Rollouts AnalysisRun。
- SWE-benchのFAIL_TO_PASS/PASS_TO_PASS語（README内で未確認）、FastChat judgeのコード位置。

## Sources

- https://github.com/OpenSLO/OpenSLO
- https://github.com/OpenSLO/OpenSLO/blob/main/examples/budgeting-method/ratio-timeslices.yaml
- https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
- https://github.com/bencherdev/bencher
- https://github.com/grafana/k6
- https://github.com/in-toto/attestation/blob/main/spec/predicates/test-result.md
- https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md
- https://github.com/in-toto/attestation/tree/main/spec/predicates
- https://github.com/in-toto/in-toto
- https://github.com/in-toto/witness
- https://github.com/itsallcode/openfasttrace
- https://github.com/itsallcode/openfasttrace/blob/main/doc/terminology.md
- https://github.com/itsallcode/openfasttrace/blob/main/doc/user_guide/introduction/concepts_and_terms.md
- https://github.com/doorstop-dev/doorstop
- https://github.com/doorstop-dev/doorstop/blob/develop/docs/cli/validation.md
- https://doorstop.readthedocs.io/en/latest/
- https://github.com/strictdoc-project/strictdoc
- https://github.com/useblocks/sphinx-needs
- https://sphinx-needs.readthedocs.io/en/latest/
- https://github.com/bmw-software-engineering/trlc
- https://github.com/bmw-software-engineering/lobster
- https://vda-qmc.de/wp-content/uploads/2023/12/Automotive-SPICE-PAM-v40.pdf
- https://www.jamasoftware.com/requirements-management-guide/meeting-regulatory-compliance-and-industry-standards/aspice/
- https://github.com/adr/madr
- https://github.com/adr/madr/blob/develop/template/adr-template.md
- https://github.com/thomvaill/log4brains
- https://github.com/npryce/adr-tools
- https://github.com/oasdiff/oasdiff
- https://github.com/bufbuild/buf
- https://github.com/sverweij/dependency-cruiser
- https://github.com/TNG/ArchUnit
- https://github.com/microsoft/playwright
- https://playwright.dev/docs/test-snapshots
- https://playwright.dev/docs/aria-snapshots
- https://github.com/dequelabs/axe-core/blob/develop/doc/API.md
- https://github.com/storybookjs/storybook
- https://storybook.js.org/docs/writing-tests
- https://www.designtokens.org/
- https://www.designtokens.org/tr/drafts/format/
- https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
- https://github.com/design-tokens/community-group
- https://github.com/style-dictionary/style-dictionary
- https://github.com/reg-viz/reg-suit
- https://github.com/garris/BackstopJS
- https://github.com/textlint/textlint
- https://github.com/vale-cli/vale
- https://github.com/figma/code-connect
- https://docs.github.com/en/rest/pulls/pulls#merge-a-pull-request
- https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema
- https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
- https://github.com/cdevents/spec/blob/main/spec.md
- https://github.com/open-telemetry/opentelemetry-specification
- https://github.com/pyeventsourcing/eventsourcing
- https://github.com/dolthub/dolt
- https://github.com/kubernetes-sigs/prow
- https://docs.oasis-open.org/sarif/sarif/v2.1.0/errata01/os/sarif-v2.1.0-errata01-os-complete.html
- https://github.com/oasis-tcs/sarif-spec
- https://github.com/microsoft/sarif-sdk
- https://github.com/openvex/spec/blob/main/OPENVEX-SPEC.md
- https://cwe.mitre.org/
- https://eslint.org/docs/latest/use/suppressions
- https://github.com/phenomnomnominal/betterer
- https://detekt.dev/docs/introduction/baseline/
- https://docs.semgrep.dev/semgrep-ci/findings-ci
- https://docs.sonarsource.com/sonarqube-server/user-guide/about-new-code
- https://github.com/phpstan/phpstan
- https://github.com/reviewdog/reviewdog
- https://github.com/github/codeql
- https://docs.github.com/en/code-security/codeql-cli/using-the-advanced-functionality-of-the-codeql-cli/creating-and-working-with-codeql-packs
- https://github.com/semgrep/semgrep-rules
- https://github.com/semgrep/semgrep
- https://slsa.dev/spec/v1.1/provenance
- https://slsa.dev/spec/v1.2/verification_summary
- https://github.com/slsa-framework/slsa
- https://github.com/slsa-framework/slsa-verifier
- https://github.com/guacsec/guac
- https://github.com/OpenLineage/OpenLineage
- https://backstage.io/docs/features/software-catalog/well-known-relations
- https://github.com/backstage/backstage
- https://github.com/bazelbuild/bazel
- https://github.com/nrwl/nx
- https://github.com/pantsbuild/pants
- https://github.com/google/deps.dev
- https://github.com/renovatebot/renovate
- https://github.com/Apicurio/apicurio-registry
- https://theupdateframework.github.io/specification/latest/
- https://github.com/theupdateframework/specification
- https://github.com/open-policy-agent/opa
- https://github.com/open-policy-agent/conftest
- https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
- https://github.com/open-telemetry/semantic-conventions-genai
- https://github.com/Arize-ai/openinference
- https://github.com/modelcontextprotocol/modelcontextprotocol
- https://github.com/a2aproject/A2A
- https://github.com/argoproj/argo-rollouts
- https://github.com/sigstore/cosign
- https://github.com/sigstore/rekor
- https://github.com/spdx/spdx-spec
- https://github.com/CycloneDX/specification
- https://github.com/UKGovernmentBEIS/inspect_ai
- https://inspect.aisi.org.uk/
- https://github.com/UKGovernmentBEIS/inspect_ai/blob/main/docs/metrics.qmd
- https://github.com/SWE-bench/SWE-bench
- https://github.com/harbor-framework/harbor
- https://github.com/harbor-framework/terminal-bench-1
- https://github.com/EleutherAI/lm-evaluation-harness
- https://github.com/stanford-crfm/helm
- https://github.com/lm-sys/FastChat
- https://github.com/promptfoo/promptfoo
- https://github.com/tatsu-lab/alpaca_eval
- https://github.com/openai/evals
- https://github.com/dora-team/fourkeys
