# confirmed175 residual: current-main559 disposition

基準HEAD: `559ae3ba4bfe660d666a57f227466d7dcdd440d9`（2026-09-28）。read-only照合。旧sourceは参照のみで、旧コード・runtime・testは実行していない。現行L2/L11の以下のSHA-256はこのHEADの実ファイルbytes。

## 固定PO判断の適用

- HELIX-HARNESS decision `HDEC-HARNESS-REQUIREMENTS-2026-09-28` は固定L1/L2/L11を確定し、明示候補24件 HARNESS-L2-010〜033 を採用。決定本文の「旧source未完引継ぎを保持」は自動採用・retireや未記載の機能追加ではない。固定L2/L11 bytesは元revision f6dad2a上のSHAをdecisionが指定し、HEAD559の後続監査追記は別revisionとして読む。
- HELIX-OS decision `HDEC-HELIXOS-REQUIREMENTS-PO-2026-09-28` はL2-001〜029/L11を確定し、候補014〜029を採用。両decisionは旧sourceのデグレ照合を要求するが、未確認source atomの意味判断を代行しない。
- LABO/INTELLIGENCEの2026-09-28固定判断でHELIXLABO-L2-055/059とHELIXINTELLIGENCE-L2-010/011を含む候補は採用済み（LABO decision `:58,99`、INTELLIGENCE decision `:57–58`）。該当する現行一般契約は有効だが、GitHub監査専用のtask classや資格失効基準を採用した記録は確認できない。

## 1. dashboard / readiness visibility

**旧source identityとbytes**

| ID | 元source path:line | Asset ID | file SHA-256 / line SHA-256 | 意味 |
|---|---|---|---|---|
| BR-06 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:46` | `LEGACY-ASSET-9F48ADEEB477DCA54039` | `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / `922b879b38c92d8b9a0e6ff3ccd2e0f6b0f2dd6470dd5b54c4180f5ba750b033` | 複数projectの進捗をリアルタイム横断表示する専用UI dashboard |
| UX-02 | 同上 `:56` | 同上 | 同file SHA / `de4ade69721a60cd79706e3f08a67c25e7c200a8e1accc02b5b8f92e4ce644f6` | PO/rosterが進捗・blocker・phaseを把握するdashboard体験 |
| FR-L1-35 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:66` | `LEGACY-ASSET-6B6C5CB0E481BE01088B` | `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008` / `7bff35b2a785e51c8eeebeded9e93ac720efd2f9ca8315552e14d8d6ea66be90` | 検証・test・検出基盤を「実装済み／設計済み・未実装／未設計」の3区分で一覧するreadiness inventory。BR-06/UX-02と同義ではない。 |

**現行照合（HEAD559）**: `docs/helix-os/L2-requirements/governance-requirements.md` SHA `db2b119daa7fbc47b79b1652beba72149fb0d6969af7bb400c1650d77464f2b5`。015 `:642–650` は正本・authority記録、016 `:652–660` は複数対象のportfolio traceとstate。対応L11 SHA `86b7949cf7700300588e8dc2ccb4448e31111223d2f1cace81109533452d551e` の016 `:331–337` は二つ以上のprojectの要求・関係・実装・検証・提供stateとunknown/staleの区別を受け入れる。019 `:682–690`、023 `:722–730`とそのL11 `:352–357,380–385`はevent/continuityとhandoffを扱う。専用UI、リアルタイム表示、PO向けdashboard oracleはない。HARNESSの固定L1/L2/L11（decision `f6dad2a` SHA指定）もdashboardを明示しない。FR-L1-35に対する現行の3値 readiness一覧oracleも見つからない。

**分類**: BR-06/UX-02はPOが製品価値として保持するか、OSのauthority/portfolio projectionで置換し専用dashboardを求めないかの**未決意味判断**。FR-L1-35はこれと分ける**別の未決意味判断**（infra readiness inventoryの価値を残すか、OS状態記録への置換で足りるか）。現行OSのportfolio recordsは一部のデータ意味を保持するが、専用画面や一覧能力を代替したとは言えない。真の現行要求欠陥とはまだ確定しない。

**PO A/B（意味を決める必要がある場合）**:
- A: BR-06/UX-02の利用者向け横断状態可視化をHARNESS/OSの責務境界内で保持する（UI・即時性は要求の意味として必要な範囲を明示）。FR-L1-35も別途、3区分のinfra readiness inventoryとして保持する。
- B: 専用dashboardとinfra readiness一覧の旧価値をretire/置換し、OSの正本・portfolio state記録だけを現行能力とする。

## 2. document-specific read-only quality review

**旧source**: BR-08 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:48` (`LEGACY-ASSET-9F48ADEEB477DCA54039`, file SHA `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`, line SHA `45c182bcd3eb0eb9261eb2de58c12dca8c1a4e1de60f4d4c0263fa4ccc631c2f`)。FR-L1-45 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:76` (`LEGACY-ASSET-6B6C5CB0E481BE01088B`, file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`, line SHA `c88465a7d0f5f2f881791256b0d45ba182573df4e1919f13d80b20ba1e0505d7`)。BR-08は大規模doc改定/gate evidence/pair freeze前のdoc専用read-only reviewer召喚。FR-L1-45は4軸（整合・網羅・一貫・明確）での要件/設計/実装doc review。

**現行照合**: HARNESS L2 SHA `1e4e5b9be4258bfe5e3ab6a4c6911a7cab380617a01d50fa5ac5472adb849c99`。L2-005 `:112–121`とL11 SHA `6262609e08a80b493d14cbbd9205befaff61e8046bc567128b37445f2b825974` `:25,48–51`はticket/riskからの検証義務、oracle、failure、差戻しを定める。L2-014 `:379–393`は承認済みL3から設計義務と対検証設計を導く。OS L2-018 `:672–680` / L11 `:345–350`は作成Workerと独立review担当を分ける。GitHub上流運用モデル `:114,136–138`はexact-head PR reviewを定める。これらは一般review/検証を採択済みだが、doc専用reviewer、前述trigger、4軸のoracleの同値性は明示しない。

**分類**: 一般PR reviewがあることだけでFR-L1-45/BR-08の全意味を被覆したとは言えず、同時に専用reviewerを現行必須機能とも確定できない。これはPOが専用能力として残すか一般reviewで置換するかを決める意味判断候補。固定HARNESS/OSの2026-09-28候補採用集合に専用doc-reviewer要求はない。

**PO A/B**:
- A: doc専用read-only reviewを保持し、対象triggerと4軸の受入oracleを既存review境界内で明記する。
- B: 既存の独立exact-HEAD PR reviewを十分な置換とし、専用reviewer/固定trigger/4軸契約を要求しない。

## 3. KPI D-01〜D-09

**旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:192–204`（単一asset `LEGACY-ASSET-9F48ADEEB477DCA54039`、file SHA `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`）。D-01..09 line SHA順: `7a64579a7cf085b81d2d7306ea672943f0b222f144f61dac159502818d37ba31`, `bb5adc7a3bbb3bebf67cd03691f770b65e546c4f1d4849e394c0ef3c23d6f79a`, `01eba392cbe0511496b5a0fd51b05f01387669f39a48dda4914cb875c389dd76`, `b02f2f37342ef167a26a4cdfd213197641a026b642277e86964987278f6868bd`, `2dbedc2052c3e3fece7feeae67e88906681f77f05e09f1ed9904734179c93500`, `af85a9b45b798a26c57653d44c86e10b12c636d2b52d39363d6cde22f2be6d16`, `459333adac014e170188f49bfd6365e770381db86413410078654a4a9560300d`, `5995c913ddb84305c9045fd6bd2f32819b774704f40c20a7c5c0f87c5323fab6`, `9cd4358f9d4b13991945ccb88c72cec3f2203b0cf443671cb595269664847557`。旧PO承認値はPLAN ≥1/sprint、gate pass ≥90%、工程順違反0、回帰検出 ≥80%、4-artifact trace ≥95%、bypass 0、委譲時間 ≥70%、override ≤2/sprint、再開成功 ≥95%。

**現行照合**: 基本のHARNESS/OS固定decisionは、これら9数値を要求として一括採択していない。HARNESS-L2-005/L11-005は選択されたrisk別検証義務を採択。D-02の≥90%のみ、HEAD559のHARNESS L2 `:750`およびL11 `:514`に「運用目標として保持、母集団/期間/分母をL3で照合」と記載されるが、これはHARNESS-L2-036補強の候補節。固定HARNESS判断の採用集合は010–033で036を含まず、当該追補は**未採択候補**。従って90%を固定PO decisionで採択済みとも、他のD値と同じく完全不在とも扱わない。OS L2/L11は017/019/020等に記録・実行状態の一般契約を持つが、旧値全件のmetric/acceptanceはない。

**分類**: D-01、D-03〜09は保持・置換・退役の意味判断が未決。D-02は候補本文には保持案があるがauthority/adoption未成立。9値全てを現行要件欠陥と数えない。HARNESSの2026-09-28判断では個別値を対象にしていない。指標の算式/母集団/欠測/計測源は、意味を残すPO判断後のL3具体化事項。

**PO A/B**:
- A: 旧9指標を製品運用目標として保持する（必要なら個別に保持範囲を指定）。計測定義はL3で作り、90%を個別ticket pass閾値にしない。
- B: 旧数値目標をretire/置換し、現行のhard verification/authority義務だけを残す。D-02の未採択候補記述もその選択に従って扱う。

## 4. incident hotfix前の即時releaseと後続backfill

**旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:47` (`FR-L1-16`, `LEGACY-ASSET-6B6C5CB0E481BE01088B`; file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`; line SHA `c68d0f29aaf2ad024f3a0ea37892eb84b7ffb54568e0726299f4b648115ddc7a`)。意味はproduction incidentの検出→hotfix→即release→収束→current L1–L12へのbackfill。

**現行照合**: HARNESS L2 SHA `1e4e5b9be4258bfe5e3ab6a4c6911a7cab380617a01d50fa5ac5472adb849c99` L2-003 `:112–113`は工程開始時のRelease Portと必要証明・対象環境・依存・security・rollback・受入条件を要求する。HARNESS L11 SHA `6262609e08a80b493d14cbbd9205befaff61e8046bc567128b37445f2b825974` `:23,57`は同条件を受け入れる。OS L2 SHA `db2b119daa7fbc47b79b1652beba72149fb0d6969af7bb400c1650d77464f2b5` 017 `:662–670`, 019 `:682–690`, 020 `:692–700`, 023 `:722–730`とOS L11 SHA `86b7949cf7700300588e8dc2ccb4448e31111223d2f1cace81109533452d551e` `:338–365,380–385`はincident後のticket/continuity/検証/受渡しに使える。即時release例外を定める現行L2/L11はない。

**分類**: これは明確な運転・release authority境界の意味差で、候補採用状態だけでは閉じない。現行Release Port条件と旧immediate-release保証のどちらを製品意味とするかの**PO判断候補**。旧exceptionをそのまま戻すと現在のrelease条件を弱めるため、先に扱いを決める。

**PO A/B**:
- A: incident固有のrelease例外を保持する。例外発動に必要な最低条件・authorityと、収束後backfillの責務を明示し、旧CLI/旧runtimeは引き継がない。
- B: 即時release例外はretireし、hotfixにも現行Release Port条件を適用する。incident後のbackfill/continuityだけをOS ticketとして保持する。

## 5. GitHub監査task class・重大miss/model更新による資格失効

**旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md:63–67`、`3L-BR-007` (`LEGACY-ASSET-A6926200F28B26300432`; file SHA `e96a70f02c517f33d9cbdc43d92e6d7b36ded7bbf023226f1cc4f63b5f7c2765`; line SHA `170537a10b1df263fd6af5265bc2ee88ae2a618f35203f768695ff828d37dba9`) と `3L-BR-008` (`:67`; same file SHA; line SHA `d4d4e772fe334d81af99c5aa5856f07e0c2fd6d2107a01812264907941c9cfc0`)。3L-BR-007 (`:63,65`) はGitHub監査をHELIX capabilityとして所有し、決定規則とsemantic findingの委譲を分離。3L-BR-008 (`:67,69`) はtask class別/model revision別評価、称号・資格・権限・assignment roleの分離、重大missまたはmodel更新で資格失効を求める。元の要求は特定provider/laneの追加を要求しない。

**現行照合**: LABO L2 SHA `c34b87dde7c94eecb7d4aa83146cf2f3de1b50c278bd0e99cbf9e96a01145f71` L2-055 `:150–155`はtask class/model class別Bench水準、evidence範囲、未評価保持、scoreによる割当/authority変更禁止。L2-059 `:416–429`はsame-task/scope比較、quality gate、既決優先関係とtoleranceを使う。LABO L11 SHA `119fa43bce6753bdb0fed5420641617b9665907a7b1c3b2e6def590098e7442d` `:191–196,168–176`は分母/欠測/失敗/重大quality failureと未評価を扱う。INTELLIGENCE L2 SHA `39e31f6a18385c8ca37f57fcaac4076d55c5fba2c49f47eadbaf48be5ef48d6d` L2-010/011 `:102–116`は一般task/work scopeのplacement/evaluation比較。OS L2-018 `:672–680`とL11 `:345–350`はassignment、handoff、expiry後の未完義務継承。SECURITYはcredential permission/expiry/revocation authorityを所有し、INTELLIGENCE L11 `:99,266,273`は実行時点の許可・期限切れ・revokeを区別する。

専用GitHub audit task classの登録、GitHub review用major-miss rubric、model revision更新時のBench qualification失効条件は、採択済み一般Bench/OS/SECURITY契約に明示されない。permission/credential expiryは既存SECURITY意味にあり、3L-BR-008の資格失効とは別物。したがってgeneric Benchを理由に3L-BR-007/008全体を採択済みにしない。一方、旧三lane実装や固定providerを復活させる根拠にもならない。

**分類**: GitHub audit固有評価/資格の意味を保持するか、一般task-class Benchと既存SECURITY/OS authorityの組合せで置換・retireするかの**PO判断候補**。一般Bench、モデル比較、credential revocationといった一部条件は既採択/現行であり、それらを新規承認として重複させない。

**PO A/B**:
- A: GitHub auditをBenchのtask classとして保持し、重大missのqualification consequenceとmodel revision更新時の失効/再評価条件を既存LABO/OS/SECURITY責務内で明示する。
- B: GitHub audit専用資格をretireし、一般task-class評価・現行permission expiry/revocation・通常の独立reviewで置換する。専用のmajor-miss資格運用は要求しない。

## 結論

5群とも、固定済みL2/L11の確定要求欠陥とは判定しない。dashboard、read-only review、旧KPI、incident immediate-release、GitHub audit資格は、未採択候補またはsource意味の保持/置換/retireを決める候補である。HARNESS/OS fixed decisionsは旧source引継ぎとregression auditを要求するが、この5群の意味を選んでいない。POに提示する場合は各A/Bをsource identity付きで問う。FR-L1-35はdashboard identityへ併合しない。
