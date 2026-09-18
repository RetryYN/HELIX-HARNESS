---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 9d0c95976a9295bccdaf7df223c5f15cd4cae4295ad84d4f54afb9aeda34016c
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-DEV-02
group: サービス④開発
product: HARNESS
atoms_primary: 94
atoms_secondary: 55
issue_projection: #1854
---

# RUL-DEV-02（サービス④開発／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

役割別（API、業務logic、DB、画面、deploy）の製品実装の標準と、各役割が返す成果の形式を定める。

## 主として対応づいた規則（94件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-048` | BE API担当は本番エラーレスポンスにstack trace、DB内部エラーコード、内部file pathを含めない。 | safety_security | prose | n/a | — | — | .claude/agents/be-api.md:68-73 | A／gpt-6-astra |
| `RA-053` | security担当は入力を許可patternで制限し、HTML escapeとSQL parameter化でsanitizeする。 | safety_security | prose | n/a | — | — | .claude/agents/security-audit.md:49-51 | A／gpt-6-astra |
| `RA-054` | security担当はupload fileのtype・sizeを制限し、実行を防止する。 | safety_security | prose | n/a | — | — | .claude/agents/security-audit.md:52-52 | A／gpt-6-astra |
| `RA-055` | security担当はContent-Typeを検証する。 | safety_security | prose | n/a | — | — | .claude/agents/security-audit.md:53-53 | A／gpt-6-astra |
| `RA-056` | security担当はCSPをdefault-src 'self'を基準として設計する。 | safety_security | prose | n/a | — | — | .claude/agents/security-audit.md:60-61 | A／gpt-6-astra |
| `RA-057` | security担当はCORSの許可originを明示し、wildcardを使わない。 | safety_security | prose | n/a | — | — | .claude/agents/security-audit.md:62-62 | A／gpt-6-astra |
| `RA-058` | security担当はX-Frame-OptionsをDENYに設定する。 | safety_security | prose | n/a | — | — | .claude/agents/security-audit.md:63-63 | A／gpt-6-astra |
| `RA-059` | security担当はX-Content-Type-Optionsをnosniffに設定する。 | safety_security | prose | n/a | — | — | .claude/agents/security-audit.md:64-64 | A／gpt-6-astra |
| `RA-062` | DevOps担当はcontainerを非rootユーザーで実行する。 | safety_security | prose | n/a | Docker | — | .claude/agents/devops-deploy.md:28-28 | A／gpt-6-astra |
| `RA-063` | DevOps担当はnetwork policyを最小権限で設計する。 | safety_security | prose | n/a | — | — | .claude/agents/devops-deploy.md:71-71 | A／gpt-6-astra |
| `RA-240` | DB担当はup/down作成、local up→test→down→再up、staging適用、整合性確認、本番maintenance window適用の順でmigrationする。 | process_gate | prose | n/a | — | `RUL-REL-01` | .claude/agents/db-schema.md:47-54 | A／gpt-6-astra |
| `RA-259` | DevOps担当は監視・alert提案に反証可能な閾値と検証commandを付ける。 | evidence_claim | prose | n/a | — | `RUL-FRM-04` | .claude/agents/devops-deploy.md:18-18 | A／gpt-6-astra |
| `RA-313` | BE API担当は複数形resource URLと用途に対応するHTTP method・statusを使い、paginationにpage・limitとLink header、filter・sort queryを設ける。 | behavior_discipline | prose | n/a | /api/v1/{resource}、旧API規約 | — | .claude/agents/be-api.md:26-32 | A／gpt-6-astra |
| `RA-314` | BE API担当は入力層で型・必須項目、business層でdomain規則、DB層でUNIQUE・FK・CHECKを検証する。 | behavior_discipline | prose | n/a | — | — | .claude/agents/be-api.md:47-50 | A／gpt-6-astra |
| `RA-315` | BE API担当はJWT Bearerをmiddlewareで検証してreq.userへ設定し、RBACとHttpOnly refresh-token cookieを用いる。 | behavior_discipline | prose | n/a | JWT/RBAC認証pattern | — | .claude/agents/be-api.md:52-56 | A／gpt-6-astra |
| `RA-316` | BE API担当はCORS→Rate Limit→Auth→Validation→Handler→Error Handlerのmiddleware順を設計する。 | behavior_discipline | prose | n/a | 旧middleware pipeline | — | .claude/agents/be-api.md:58-61 | A／gpt-6-astra |
| `RA-317` | BE API担当はエラーを統一形式にし、500はINTERNAL_ERRORと一般的messageを返し、stack詳細は開発環境だけに付ける。 | behavior_discipline | prose | n/a | error.code/message/details | — | .claude/agents/be-api.md:34-45; .claude/agents/be-api.md:71-73 | A／gpt-6-astra |
| `RA-318` | BE API担当はエラー率・latency・slow queryを監視対象にする。 | behavior_discipline | prose | n/a | — | — | .claude/agents/be-api.md:65-66 | A／gpt-6-astra |
| `RA-319` | BE API担当はendpoint実装・validation schema・middleware設定・integration testを成果として返す。 | behavior_discipline | prose | n/a | — | — | .claude/agents/be-api.md:75-79 | A／gpt-6-astra |
| `RA-320` | BE logic担当はController→Service→Repository→DB/外部の依存方向を守り、Domain Modelを依存なしにする。 | behavior_discipline | prose | n/a | layered architecture | `RUL-FRM-06` | .claude/agents/be-logic.md:27-34 | A／gpt-6-astra |
| `RA-321` | BE logic担当はconstructor注入を優先し、実装でなくinterfaceに依存してtest時にmock交換可能にする。 | behavior_discipline | prose | n/a | — | `RUL-FRM-06` | .claude/agents/be-logic.md:36-39 | A／gpt-6-astra |
| `RA-322` | BE logic担当はService層でtransaction境界を管理し、Unit of Workと楽観・悲観lockを用いる。 | behavior_discipline | prose | n/a | Unit of Work、SELECT FOR UPDATE | — | .claude/agents/be-logic.md:41-44 | A／gpt-6-astra |
| `RA-323` | BE logic担当はdomain errorをServiceでapplication errorへ変換し、Controllerでresponseへ変換し、独自例外にcode・message・detailsを持たせる。 | behavior_discipline | prose | n/a | — | — | .claude/agents/be-logic.md:46-52 | A／gpt-6-astra |
| `RA-324` | BE logic担当は1 Serviceを1use case群にし、純粋logicと副作用を分離してguard節を先に置き、domain objectの不変性を優先する。 | behavior_discipline | prose | n/a | — | `RUL-FRM-06` | .claude/agents/be-logic.md:54-58 | A／gpt-6-astra |
| `RA-325` | BE logic担当はService testでRepositoryをmockし、Domain Modelはmockなしの純粋関数testにする。 | behavior_discipline | prose | n/a | — | `RUL-FRM-05` | .claude/agents/be-logic.md:60-62 | A／gpt-6-astra |
| `RA-326` | BE logic担当はService・Repository・Domain Model・DTO・unit test・error classを成果として返す。 | behavior_discipline | prose | n/a | — | — | .claude/agents/be-logic.md:64-68 | A／gpt-6-astra |
| `RA-327` | DB担当はrollback手順のないschema変更を提案しない。 | behavior_discipline | prose | n/a | — | `RUL-REL-01` | .claude/agents/db-schema.md:16-16 | A／gpt-6-astra |
| `RA-328` | DB担当はPKをUUIDまたはBIGSERIALとし、id・created_at・updated_atを必須にしてdeleted_atで論理削除を表す。 | behavior_discipline | prose | n/a | 旧table標準 | — | .claude/agents/db-schema.md:27-30 | A／gpt-6-astra |
| `RA-329` | DB担当は3NFを基本にし、非正規化は性能要件に基づいて判断する。 | behavior_discipline | prose | n/a | — | — | .claude/agents/db-schema.md:31-31 | A／gpt-6-astra |
| `RA-330` | DB担当は全参照にFK制約を設け、削除時は既定RESTRICT・子CASCADE・任意参照SET NULLを使って孤立recordを防ぐ。 | behavior_discipline | prose | n/a | FK ON DELETE規約 | — | .claude/agents/db-schema.md:33-36 | A／gpt-6-astra |
| `RA-331` | DB担当はWHERE・FK・sortにB-TREE、重複防止にUNIQUE、全文検索にGIN/GiSTを対応させる。 | behavior_discipline | prose | n/a | 旧DB index選定表 | — | .claude/agents/db-schema.md:38-45 | A／gpt-6-astra |
| `RA-332` | DB担当はEXPLAIN ANALYZEでplanを確認し、N+1をJOIN・batchで解消し、connection poolingと定期VACUUM/ANALYZEを設定する。 | behavior_discipline | prose | n/a | PostgreSQL系運用command | — | .claude/agents/db-schema.md:56-60 | A／gpt-6-astra |
| `RA-333` | DB担当は開発seedをfaker/factoryで生成し、master dataをmigrationで投入し、test seedを前投入・後cleanupする。 | behavior_discipline | prose | n/a | — | `RUL-FRM-05` | .claude/agents/db-schema.md:62-65 | A／gpt-6-astra |
| `RA-334` | DB担当はup/down DDL・Mermaid ER図・index定義・seed scriptを成果として返す。 | behavior_discipline | prose | n/a | — | — | .claude/agents/db-schema.md:67-71 | A／gpt-6-astra |
| `RA-335` | DevOps担当はmultistage build・.dockerignore・HEALTHCHECK・軽量base imageを使ってcontainerを設計する。 | behavior_discipline | prose | n/a | Docker、Alpine/Distroless | — | .claude/agents/devops-deploy.md:26-31 | A／gpt-6-astra |
| `RA-338` | DevOps担当はdevにseed、stagingに匿名化した本番copy、prodに本番dataを使って環境を分離する。 | behavior_discipline | prose | n/a | — | — | .claude/agents/devops-deploy.md:41-46 | A／gpt-6-astra |
| `RA-339` | DevOps担当は/healthで生存、/readyで依存接続を確認し、timeout 5秒・間隔30秒・失敗閾値3でhealth checkする。 | behavior_discipline | prose | n/a | 旧health check固定値 | — | .claude/agents/devops-deploy.md:48-51 | A／gpt-6-astra |
| `RA-340` | DevOps監視はerror率1%超・p95 500ms超でSlack通知、CPU80%超でautoscale、memory85%超でalert、disk90%超で緊急対応する。 | behavior_discipline | prose | n/a | 旧監視閾値・Slack | — | .claude/agents/devops-deploy.md:59-66 | A／gpt-6-astra |
| `RA-342` | DevOps担当はcontainer構成案・CI/CD設定・health check・監視dashboard設定・rollback手順書を成果として返す。 | behavior_discipline | prose | n/a | — | `RUL-REL-01` | .claude/agents/devops-deploy.md:73-78 | A／gpt-6-astra |
| `RA-343` | fe-uiはsemantic HTML・ARIA・keyboard操作・contrastのaccessibility要件を守り、unit/component testを作る。 | behavior_discipline | prose | n/a | — | `RUL-FRM-05` | .claude/agents/fe-ui.md:27-30 | A／gpt-6-astra |
| `RA-344` | fe-leadは構成・状態管理・割当・review所見・受入判断・UX相談反映を返し、fe-uiは実装とtest、設計差分・残課題を返す。 | behavior_discipline | prose | n/a | FE roster出力契約 | `RUL-OSP-01` | .claude/agents/fe-lead.md:39-42; .claude/agents/fe-ui.md:37-39 | A／gpt-6-astra |
| `RB04-092` | UIが完全にないBE/DBはL2全省略を許容し、FE・fullstack・agentはL2の4 sub-docをすべて作成する。 | process_gate | prose | n/a | 旧L2、drive分類 | `RUL-FRM-02` | docs/governance/helix-harness-concept_v3.1.md:798-804 | B04／gpt-6-astra |
| `RB04-227` | DB migrationは前進・後退両方のscriptを用意し、列削除等の破壊変更を数release後の削除まで段階化する。 | safety_security | prose | n/a | 旧migration運用 | `RUL-REL-01` | docs/governance/ai-dev-team-operations_v1.1.md:1001-1003 | B04／gpt-6-astra |
| `RB04-250` | 実装者は生SQL・文字列展開によるcommand実行・機密logを禁止し、parameterized query・入力検証・認可checkを使用する。 | safety_security | prose | n/a | 生SQLの旧一律禁止表現 | `RUL-COR-04`、`RUL-OSM-04` | docs/governance/ai-dev-team-concept_v1.1.md:217-219 | B04／gpt-6-astra |
| `RB05-017` | 例示された型規則では、実装者はDB由来型とUI表示型を混在させない。 | behavior_discipline | prose | n/a | coding-rules.mdの例示 | — | docs/governance/audit-framework.md:298-298 | B05／gpt-6-astra |
| `RB05-019` | 例示されたフロント規則では、実装者はUIに業務ロジックを置かず、APIアクセスを専用hookまたはservice経由にする。 | behavior_discipline | prose | n/a | coding-rules.mdの例示 | `RUL-FRM-06` | docs/governance/audit-framework.md:303-304 | B05／gpt-6-astra |
| `RB05-020` | 例示されたフロント規則では、実装者は表示状態と保存状態を混在させず、エラー表示を省略しない。 | behavior_discipline | prose | n/a | coding-rules.mdの例示 | `RUL-DEV-01` | docs/governance/audit-framework.md:303-304 | B05／gpt-6-astra |
| `RB05-021` | 例示されたサービス規則では、実装者は業務ロジックをservice層に置き、外部APIをadapter経由で呼び出す。 | behavior_discipline | prose | n/a | coding-rules.mdの例示 | `RUL-FRM-06` | docs/governance/audit-framework.md:306-307 | B05／gpt-6-astra |
| `RB05-023` | 例示されたDB規則では、schema変更に文書更新を伴わせ、履歴が必要なデータにはログ設計を明記する。 | process_gate | prose | n/a | coding-rules.mdの例示 | — | docs/governance/audit-framework.md:309-310 | B05／gpt-6-astra |
| `RB05-376` | screen design workflowはscreen一覧・flow・wireframe・UI要素・prototypeまたはno-UI receiptを要求し、L2/L11 pairとagreementまたはno-UI判断のcurrent性を終了条件とする。 | process_gate | config | fail_close | 互換screen_design specialist workflow | `RUL-FRM-01`、`RUL-FRM-02` | config/drive-route-catalog.json:353-360 | B05／gpt-6-astra |
| `RB05-377` | frontend design workflowはvisual・tokens・a11y・VRT・UX reviewを要求し、L3/L10 pairと実装証拠がcurrentの場合だけ終了する。 | process_gate | config | fail_close | 互換frontend_design specialist workflow | `RUL-FRM-01`、`RUL-FRM-02` | config/drive-route-catalog.json:363-370 | B05／gpt-6-astra |
| `RB06-139` | prototype生成者は起動可能artifact、全trace、digest、起動手順を生成し、walkthroughでは観測・delta・反映先・再作成判断を版ごとに残す。 | evidence_claim | prose | fail_close | 未実装PrototypeBuilder/WalkthroughLoop | `RUL-FRM-04`、`RUL-COR-02` | docs/governance/infinity-loop-assertion-coverage-ledger.md:86-87 | B06／gpt-6-astra |
| `RB06-191` | 設計者はproduct選択成果物を該当製品だけに起票し、非該当時はskip_sub_docのreasonで省略する。 | process_gate | prose | n/a | report・batch・notification・code-value等 | — | docs/governance/document-system-map.md:73-83 | B06／gpt-6-astra |
| `RB06-201` | 工程専門はscreen-designにscreen・flow・wireframe・UI要素とagreementまたはno-UI receipt、frontend-designにvisual・token・a11y・VRT・UX reviewと実装後実測を要求する。 | process_gate | prose | fail_close | L2↔L11、L10↔L3 | `RUL-FRM-01` | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:61-68 | B06／gpt-6-astra |
| `RB07-046` | consoleのCLI copy patternは事前生成コマンド文字列をclipboardへ書き、一時的なコピー完了feedbackを表示する。 | tooling_runtime | config | n/a | PTN-cli-copy | — | config/ui-domain/harness-console-bundle.json:61-68 | B07／gpt-6-astra |
| `RB07-048` | consoleは次の行動、状態異常、生データ詳細の順で情報を優先し、サマリのみの表示にしない。 | tooling_runtime | config | n/a | UX-03／CC3 | — | config/ui-domain/harness-console-bundle.json:79-82 | B07／gpt-6-astra |
| `RB07-049` | consoleは宣言されたpatternとtokenを使用し、desktop専用の固定最小幅と高密度時の横スクロールを採用する。 | tooling_runtime | config | n/a | PRF-harness-consoleのallowlist／desktop-only | — | config/ui-domain/harness-console-bundle.json:84-91 | B07／gpt-6-astra |
| `RB07-050` | consoleはmotionを200ms以内とし、prefers-reduced-motionではアニメーションを省略して即時に状態を切り替える。 | tooling_runtime | config | n/a | motion budget_ms=200 | — | config/ui-domain/harness-console-bundle.json:93-95 | B07／gpt-6-astra |
| `RB07-051` | consoleは上部nav、breadcrumb、filter、main、next actionの順にfocusを移し、copyとfilterをTabおよびEnter・Spaceで操作可能にする。 | tooling_runtime | config | n/a | RGN-*／CMP-* | — | config/ui-domain/harness-console-bundle.json:97-104 | B07／gpt-6-astra |
| `RB07-052` | consoleは状態を色だけに依存させずiconまたはlabelを併記し、keyboard focus ringを常時可視に保つ。 | tooling_runtime | config | n/a | — | — | config/ui-domain/harness-console-bundle.json:100-104; config/ui-domain/harness-console-bundle.json:120-122 | B07／gpt-6-astra |
| `RB07-053` | consoleは画面状態をquery stringから復元可能にし、emptyとloadingを区別して描画する。 | tooling_runtime | config | n/a | query-string | — | config/ui-domain/harness-console-bundle.json:121-123 | B07／gpt-6-astra |
| `RB07-054` | consoleは30秒pollingで更新しWebSocketを使わず、light themeと日本語を固定し、本文は可読日本語font、コードとCLIは等幅にする。 | tooling_runtime | config | n/a | S2=b／Q30／Q31 | `RUL-FRM-07` | config/ui-domain/harness-console-bundle.json:44-44; config/ui-domain/harness-console-bundle.json:107-110 | B07／gpt-6-astra |
| `RB07-206` | 実装者は環境依存の接続先・path・portを設定へ出し、releaseなしで変えたい業務値をコードへ固定せず出所をPLAN・設計traceへ残す。 | behavior_discipline | prose | n/a | — | `RUL-FRM-06` | docs/skills/code-minimalism.md:49-51; docs/skills/code-minimalism.md:86-93 | B07／gpt-6-astra |
| `RB07-208` | 実装者は表示文言を既存定義へ寄せ、特定tenant・顧客名の分岐を見つけたら立ち止まり、時刻・locale前提を注入可能にする。 | behavior_discipline | prose | n/a | — | `RUL-DEV-01` | docs/skills/code-minimalism.md:94-98 | B07／gpt-6-astra |
| `RB07-343` | DB変更担当者はcolumn renameをexpand-contractで段階化し、NOT NULL前にbackfillし、大規模backfillをinlineでなくbackgroundで行う。 | safety_security | prose | n/a | add→dual-write→read new→drop old | `RUL-REL-01` | docs/skills/ci-deploy-and-rollback.md:89-91 | B07／gpt-6-astra |
| `RB08-128` | 移行実装者はmigration codeをTypeScript/Nodeで実装し、ad-hoc shell・Pythonを使わない。 | tooling_runtime | prose | n/a | migrationの言語固定 | — | docs/skills/data-migration.md:65-67 | B08／gpt-6-astra |
| `RB08-129` | 移行実装者は再実行を安全にし、row failureを黙ってskipせずrow IDを記録してsummaryまで継続する。 | behavior_discipline | prose | n/a | — | `RUL-DEV-01` | docs/skills/data-migration.md:68-70 | B08／gpt-6-astra |
| `RB08-159` | DB設計者はL3でentityと不変条件、L4でER図・column契約・順序付きDDL、L5でindex・query・制約と破壊的変更のrollbackを定義する。 | process_gate | prose | n/a | 旧L3/L4/L5配置 | `RUL-FRM-06`、`RUL-REL-01` | docs/skills/db.md:48-58 | B08／gpt-6-astra |
| `RB08-161` | DB変更担当者は全schema変更を欠番のない単調な番号付きmigrationとして出荷し、追加後にdoctor成功を確認する。 | process_gate | prose／doctor | fail_close | src/state-db/migrations/NNN_description.sql | — | docs/skills/db.md:65-66; docs/skills/db.md:71-72 | B08／gpt-6-astra |
| `RB08-196` | API設計者はL3でcallerから見えるtrigger・actor・outcome、L4でmethod・path・入出力・error・version、L5でserialization・auth・rate limit・paginationを定義する。 | process_gate | prose | n/a | 旧L3/L4/L5配置 | `RUL-FRM-06` | docs/skills/api.md:32-43 | B08／gpt-6-astra |
| `RB08-199` | API担当者はpublic routeに/v<N>/を付け、field削除・型変更・status変更にはnew versionを割り当て、判断を設計書へ記す。 | tooling_runtime | prose | n/a | path versioning、API Versioning節 | `RUL-FRM-06` | docs/skills/api.md:48-54 | B08／gpt-6-astra |
| `RB08-200` | API担当者はdeprecated versionに設計上のsunset dateを設定し、Deprecation response headerを返す。 | tooling_runtime | prose | n/a | Deprecation: <date> | `RUL-OSM-07` | docs/skills/api.md:55-56 | B08／gpt-6-astra |
| `RB08-205` | LLM設計者はpair-freeze前にcall別context・token budget・overflow処置・retrieval単位と閾値を定義する。 | memory_context | prose | fail_close | L4/L5 | — | docs/skills/llm-agent-routing.md:43-49 | B08／claude_review |
| `RB08-233` | Design HARNESS設計者はBE寄りdomain modelとは別に、画面・flow・navigation・component・interaction・token・content・feedback・各状態・analyticsのUI型を設ける。 | process_gate | prose | n/a | UI domain model追加方針 | `RUL-FRM-06` | docs/governance/design-harness-assessment-audit-2026-07-19.md:64-66 | B08／gpt-6-astra |
| `RB09-050` | deploymentの実装者は、workflow、Environment、deployment history、concurrencyを正式な操作面とし、HELIX CLIからは同じworkflowだけを起動・監視する。 | tooling_runtime | prose | n/a | GitHub deployment操作面、HELIX CLI | `RUL-FRM-06` | docs/governance/devops-external-source-research-2026-07-23.md:22-22 | B09／gpt-6-astra |
| `RB09-055` | schema変更の担当者は、後方互換性のあるexpand→deploy→contractを標準手順とする。 | process_gate | prose | n/a | — | — | docs/governance/devops-external-source-research-2026-07-23.md:27-27 | B09／gpt-6-astra |
| `RC01-040` | l1-l2-consistencyは、screen-listの画面に対応するui-element行がない場合、不合格にする。 | process_gate | lint | fail_close | ui-element.mdの画面別行 | `RUL-OSA-06` | src/lint/l1-l2-consistency.ts:76-79 | C01／gpt-6-astra |
| `RC01-041` | l1-l2-consistencyは、ui-elementが参照する画面IDがscreen-listにない場合、不合格にする。 | process_gate | lint | fail_close | dangling-ui-element-screen | `RUL-COR-04` | src/lint/l1-l2-consistency.ts:80-82 | C01／gpt-6-astra |
| `RC01-042` | l1-l2-consistencyは、wireframeの画面見出しに現れるIDがscreen-listにない場合、不合格にする。 | process_gate | lint | fail_close | dangling-wireframe-screen | `RUL-COR-04` | src/lint/l1-l2-consistency.ts:83-85 | C01／gpt-6-astra |
| `RC01-043` | l1-l2-consistencyは、screen-flowが参照する画面IDがscreen-listにない場合、不合格にする。 | process_gate | lint | fail_close | dangling-flow-screen | `RUL-COR-04` | src/lint/l1-l2-consistency.ts:86-88 | C01／gpt-6-astra |
| `RC01-149` | sub-doc-section-structureは、archived以外のreport・batch・notification・code-value PLANについて、その種類の必須節名がh2見出し群に欠ける場合、不合格にする。 | process_gate | lint | fail_close | STANDARD_DELIVERABLE_SECTIONSの4種類の節catalog | `RUL-OSA-06` | src/lint/sub-doc-section-structure.ts:20-32; src/lint/sub-doc-section-structure.ts:59-74 | C01／gpt-6-astra |
| `RC04-172` | frontend drift検出器は、mock_root・token_root・a11y・vrtの各証拠が無ければ警告する。 | evidence_claim | gate | warn | — | `RUL-FRM-04` | src/workflow/contracts.ts:689-700 | C04／gpt-6-astra |
| `RD09-097` | proposal-document-coverageは、screen-uiを期待するシナリオでscreen_traceがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | screen-ui → screen_trace | `RUL-FRM-01` | src/lint/proposal-document-coverage-policy.ts:48-48; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-100` | proposal-document-coverageは、data-dbを期待するシナリオでmigration_planがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | data-db → migration_plan | `RUL-REL-01` | src/lint/proposal-document-coverage-policy.ts:51-51; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-101` | proposal-document-coverageは、batch-reportを期待するシナリオでidempotencyがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | batch-report → idempotency | — | src/lint/proposal-document-coverage-policy.ts:52-52; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-102` | proposal-document-coverageは、report-outputを期待するシナリオでoutput_layoutがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | report-output → output_layout | — | src/lint/proposal-document-coverage-policy.ts:53-53; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-103` | proposal-document-coverageは、async-job-flowを期待するシナリオでretry_dead_letter_policyがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | async-job-flow → retry_dead_letter_policy | — | src/lint/proposal-document-coverage-policy.ts:54-54; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-104` | proposal-document-coverageは、notification-messageを期待するシナリオでrecipient_rulesがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | notification-message → recipient_rules | — | src/lint/proposal-document-coverage-policy.ts:55-55; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-107` | proposal-document-coverageは、error-observability-auditを期待するシナリオでaudit_log_schemaがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | audit_log_schema | — | src/lint/proposal-document-coverage-policy.ts:57-57; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD09-119` | proposal-document-coverageは、screen-uiを期待するシナリオでscreen-design-workflowがrequired_gatesにない場合、失敗させる。 | process_gate | lint | fail_close | screen-design-workflow | `RUL-FRM-02` | src/lint/proposal-document-coverage-policy.ts:67-67; src/lint/proposal-document-coverage.ts:169-178 | D09／gpt-6-astra |
| `RD09-123` | proposal-document-coverageは、error-observability-auditを期待するシナリオでerror-observability-audit-reviewがrequired_gatesにない場合、失敗させる。 | process_gate | lint | fail_close | error-observability-audit-review | `RUL-FRM-02` | src/lint/proposal-document-coverage-policy.ts:71-71; src/lint/proposal-document-coverage.ts:169-178 | D09／gpt-6-astra |
| `RD09-130` | proposal-document-coverageは、軽微な画面変更だからwireframeを省略するという入力に対し、分類器がllm-shrinkage-ignoredを返さないかwireframeを必須設計文書から落とす場合、失敗させる。 | behavior_discipline | lint | fail_close | 固定英語入力、llm-shrinkage-ignored、wireframe | `RUL-OSA-06` | src/lint/proposal-document-coverage.ts:182-194 | D09／gpt-6-astra |
| `RD10-064` | lintはL7工程表にdatabase、service、frontend、uiの必須feature pack層が欠ける場合に失敗させる。 | process_gate | lint | fail_close | L7と固定4責務層、packのspan数は合否条件外 | `RUL-TKT-02` | src/lint/roadmap-registry.ts:113-118; src/lint/roadmap-registry.ts:220-244 | D10／gpt-6-astra |
| `RG08-002` | consoleは、状態色をok＝緑、warn＝黄、error＝赤、empty＝灰に対応させる。 | behavior_discipline | config | n/a | TOK-state-colorの状態別配色 | `RUL-FRM-08` | config/ui-domain/harness-console-bundle.json:109-109 | G08／claude-opus |

## 副として対応づいた規則（55件）

`RA-049`、`RA-050`、`RA-140`、`RA-241`、`RA-336`、`RA-337`、`RA-341`、`RB04-246`、`RB05-012`、`RB05-014`、`RB05-022`、`RB05-079`、`RB05-217`、`RB05-253`、`RB06-106`、`RB06-138`、`RB06-145`、`RB06-149`、`RB06-193`、`RB06-194`、`RB06-195`、`RB06-211`、`RB06-224`、`RB06-273`、`RB07-031`、`RB07-035`、`RB07-036`、`RB07-047`、`RB07-060`、`RB07-336`、`RB07-341`、`RB07-344`、`RB08-100`、`RB08-127`、`RB08-134`、`RB08-160`、`RB08-162`、`RB08-163`、`RB08-186`、`RB08-197`、`RB08-198`、`RB08-201`、`RB08-202`、`RB08-234`、`RB08-235`、`RD09-099`、`RD09-121`、`RE01-013`、`RE01-027`、`RE01-133`、`RE01-276`、`RG03-010`、`RG08-001`、`RG08-003`、`RG18-002`
