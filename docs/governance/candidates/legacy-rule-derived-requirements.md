---
title: "旧HELIXのルール群から導いた要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-18
product_targets:
  - HELIX-HARNESS
  - HELIX-OS
---

# 旧HELIXのルール群から導いた要求候補

## これは何か

旧HELIXには、AIと人がどう動くか、機械が何を拒否するかを定めたルールが大量にあった。AI向けの指示書、運用の方針文書、そしてコードに埋め込まれた検査である。新世代は旧要求153件の意味を引き継いだが、これらのルールは引き継いでいなかった。その結果、新世代のsessionでAIが素の既定動作へ戻り、何でも確認を求める、reviewが何周もする、統合を判断できない、という実害が出た（Issue #1864）。

本書は、旧HELIXのルールの対象file 632件を一巡目で読ませ、atomを得たfile全件に二巡目を行って7622件の規則（atom）にし、それを57本の要求候補へ束ねたものである。旧hook、旧script、旧test、旧runtimeは1つも実行していない。旧実装は引き継がず、意味だけを引き継ぐ。

本書は要求の候補であり、採用・承認・完了を生成しない。現行のAGENTS.md、CLAUDE.md、hook、設定を書き換えない。規則atom 7622件は管理層の`source_holding`（`MPR-SH-LEGACY-RULE-003`）として仮登録し、台帳のdigestで固定している。各atomの要求への対応づけは候補であり、確信度は出どころ（強い）、atomの存在（強い）、要求候補57本（有望）、各atomの所属（候補。標本で1割前後の置き違いを見込む）の順に下がる。57本の一括採否は行わず、システム群ごとに既存L2・旧要求との関係（重複・包含・依存・接続）を付けてから対象別L2へ流す。

## 洗い出した範囲と方法

対象は `archive/legacy-generation-2026-09-14/root/` 配下の次の範囲である。test（`*.test.*`、`tests/`）、`docs/plans/`、`docs/design/`、要求文書（別に分類済み）は対象外とした。

| 系統 | 対象 | atom数 |
|---|---|---:|
| AI向けの指示 | `AGENTS.md`、`CLAUDE.md`、`.claude/`（CLAUDE.md、agents、commands、hooks、settings）、`.codex/`、`.helix/`の定義 | 370 |
| 運用の文書 | `docs/governance/`直下、`docs/skills/`、`config/`のうち規則を含む文書 | 1951 |
| 機械による強制 | `src/runtime`、`src/lint`、`src/doctor`、`src/policy`、`src/team`、`src/gate`、`src/guardrail`、`src/security`、`src/orchestration`、`src/workflow`、`config/`、`.github/` | 4269 |
| 再点検で追加（E／F／G系列） | 未読の残り、標本で漏れが見つかった系統、二巡目（atomを得た全file） | 1032 |
| 計 | 533 file | 7622 |

対象file全632件（`.helix/`は定義file 2件だけを対象に含めた。test、plans、design、要求文書は除外）の内訳は次のとおりである。[出どころfile一覧](../legacy-rule-atom-source-files.jsonl)は対象file全件を`status`（`atoms`／`no_rule_declared`／`no_declaration`）と`second_pass`（二巡目を読ませたか）付きで持ち、この表はそこから機械集計している。

| fileの状態 | 件数 |
|---|---:|
| atomを1件以上抽出した | 533 |
| 読んだが規則は無かった（申告） | 99 |
| いずれの申告も無い | 0 |

二巡目（全fileの再点検）は49分割中49分割が完了し、二巡目を読ませたfileは531件（出どころfile一覧の`second_pass: true`）、残り101 file は一巡目の抽出だけである（うち98件は一巡目で規則なしと申告されたfile、3件は一巡目でatomを得たが二巡目の分割に含めなかったfile）。

手順は次のとおりである。

1. 抽出：GPT-6 Astra（codex CLI、read-only）が対象を分割して全文を読み、「〜しなければならない／してはならない／〜を拒否する」という規則1つを1 atomとして、出どころのpathと行範囲付きで出力した。読み切れなかったfileは再分割して読ませた。その後、Astraの指摘で抽出漏れが見つかったため、対象file全件を「抽出済みatomに無い規則だけを出す」二巡目にかけ、さらにatomを足した（二巡目の18分割はGPT-6 Astra、残り31分割はClaude Opusが読んだ）。二巡目のatomは出典pathの実在と行範囲を機械で検証してから取り込んだ。
2. 検証：全atomの出どころについて、pathの実在と行範囲がfileの行数に収まることを機械で確かめた（欠落0、逸脱0、IDの重複0）。AI向けの指示の系統から無作為に8件を取り、原文と突き合わせて一致を確かめた。
3. 対応づけ：要求の枠を起草し、Astraが各atomを主の要求1つと副の要求最大2つへ対応づけた。どの枠にも入らないatomは無理に入れず「不足」として出させ、そこから要求を11本追加した。対応づけ後に手で直したもの（残った22件、reviewで見つかった置き違い、「other」とされた7件、fail-open挙動2件）は台帳の`mapped_by: claude_review`で引ける（35件）。再点検で追加したatomの対応づけはClaude Opusが行った（`mapped_by: claude-opus`）。
4. 出どころの固定：atomが参照する全fileのSHA-256を[出どころfile一覧](../legacy-rule-atom-source-files.jsonl)に記録した。全atomは[規則atom台帳](../legacy-rule-atom-inventory.jsonl)にある。
5. 再判定：「旧実装に固有」とした140件を、旧名称と保持すべき意味を分けて読み直し、一般化すれば要求に寄与するものは要求へ戻した（残り34件は個別の除外理由を台帳の`legacy_only_reason`に持つ）。安全に関する69件は、義務・判定基準の定義（HARNESS、`RUL-FRM-09`）と適用・実行（OS、`RUL-OSA-07`）へ分けた。

## 確かめたことと、まだ確かめられていないこと

確かめたこと。

- 対象file全件について、atomを得たか、規則が無いと申告されたかが記録されていること（上の表）。
- 全atomの出どころのpathと行範囲が実在すること。
- 全7622件が、57本の要求または「旧実装に固有」のいずれかに対応づいていること（未対応0）。

まだ確かめられていないこと。

- 抽出の全件性。1つのmodel系統が読んで申告した結果である。二巡目の標本（24 file）では一巡目の取りこぼしが約2割あり、二巡目後も取りこぼしは残りうる。「全件洗い出した」ではなく「対象file全件を一度、atomを得たfileを二度読ませた」と読む。二巡目で合計688件が新たに見つかっており、三巡目以降で見つかる規則が残る可能性はある。
- 対応づけの正しさ。無作為に22件を読んだところ、明らかに別の要求が適切なものが2件あった。全体でも1割前後の置き違いがあると見込む。要求の文には影響しないが、要求ごとの件数は概数として読む。
- 「旧実装に固有」とした34件は再判定済みだが、その除外理由の妥当性は個別にreviewされていない。
- 本書の要求と、既存のL2・既存の要求候補（新世代CI、AI可読文書、旧資産退役、Scaffold等）との重複と包含。後続で関係を付ける。
- `RUL-COR-04`の1365件は、個々の入力検査の条件である。L2の要求としては1本で足り、個々の条件はL3以降の検査定義の入力として扱う。

## 集計

| 規則の種類 | 件数 |
|---|---:|
| 工程gate | 2151 |
| 証拠と主張 | 1880 |
| runtimeとtool | 850 |
| 安全 | 677 |
| reviewとmerge | 465 |
| 権限とescalate | 419 |
| memoryと継続 | 397 |
| レーンと委譲 | 373 |
| 行動規律 | 337 |
| 文書と言語 | 73 |

| 強制の手段（重複あり） | 件数 |
|---|---:|
| gate | 2440 |
| prose | 2408 |
| lint | 2051 |
| ci | 363 |
| config | 346 |
| doctor | 334 |
| hook | 318 |

文だけで定められ機械の強制が無い規則（`prose`のみ）は2062件である。

## 要求候補

各要求の件数は、主として対応づいたatomの数／副として対応づいたatomの数である。例は台帳から機械的に選んだ3件で、出どころへ辿れる。

### 枠

#### `RUL-FRM-01`（HARNESS）　294／224件

工程の順序とV-pairを守る。上流が未確定のまま下流へ進まず、対になる設計と検証を双方向traceで閉じてから次の層へ進む。

- 例 `RB07-162`：上流検証者は一意なFRとplaceholderでない対応機能仕様を確認し、設計・単体テスト設計の存在とscenario IDの実テスト対応を確認する。（`docs/skills/verification.md` 66-75行）
- 例 `RG25-007`：descent-obligationは、source／testのtrace keyを@helix-trace注釈による明示引用からのみ採り、本文中のFR範囲展開を実装側のtraceとして認めない。（`src/lint/descent-obligation.ts` 25-25行）
- 例 `RB04-131`：pair-freeze検査はdesign/test-designの双方向参照と孤児ゼロを確認し、pair_artifact:selfのmockは孤児扱いしない。（`docs/governance/helix-harness-concept_v3.1.md` 1191-1192行）

#### `RUL-FRM-02`（HARNESS）　233／264件

工程の開始・凍結・差戻し・再開・完了の条件と、人間が承認する層とAIが進める層の分担を定める。

- 例 `RB06-195`：FE本文作成者は層別design PLANを起票して必須節をその時に定義し、frozen層にはowning PLANをconfirmedにしてから本文を置く。（`docs/governance/document-system-map.md` 134-138行）
- 例 `RB04-137`：検証cycleはdraftゼロ・pair孤児ゼロ・confirmed一件以上のfreeze完了で発火し、park済みplaceholderは妨げず、検証roadmapをForwardのdriverにしない。（`docs/governance/helix-harness-concept_v3.1.md` 1194-1201行）
- 例 `RC01-030`：gate-confirmは、confirmedの設計・テスト設計文書について、対応gateが台帳に存在しPASSでない場合、不合格にする。対応gateが台帳にない文書はこの検査では飛ばす。（`src/lint/gate-confirm.ts` 101-111行）

#### `RUL-FRM-03`（HARNESS）　216／138件

変更の種類（新規、追加、修正、refactor、retrofit、reverse、PoC、research）ごとに進む経路を一つに決め、途中で意味の変更を検出したら正しい経路へ戻す。

- 例 `RG05-003`：Discovery経路を扱う処理は、作業kindをpocに限定する。（`config/drive-route-catalog.json` 59-63行）
- 例 `RC04-192`：D-CONTRACT検証器は、next参照に循環があれば失敗する。（`src/workflow/routing-contracts.ts` 310-318行）
- 例 `RC04-233`：workflow guide生成器は、指定されたdevelopment_style・case_driven_model・subrouteが対応axisのregistryに無ければ失敗する。（`src/workflow/workflow-guide.ts` 252-279行）

#### `RUL-FRM-04`（HARNESS）　624／589件

完了・進捗・安全の主張は、固定した分母と、裏付けるtest・command・証拠の参照で示す。検査のgreenや文書の存在を内容の正しさの代わりにしない。

- 例 `RD06-203`：fr-roadmap-coverage lintは、closed項目のclosure証跡からtest参照パスを抽出できない場合、失敗させる。（`src/lint/fr-roadmap-coverage.ts` 131-136行）
- 例 `RC02-112`：doctorのtelemetry-closure checkは、telemetry closure検査が不合格、対象0件、またはmatrix読込不能の場合に失敗する。（`src/doctor/index.ts` 5044-5063行）
- 例 `RB06-206`：成熟度報告者は要件確定・設計pair・runtime実装・実行検証・運用観測を独立に表示し、上流状態から下流状態を導出しない。（`docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md` 168-179行）

#### `RUL-FRM-05`（HARNESS）　162／101件

検証の作り方を定める。test先行、境界値、正常系と異常系、仕込んだ欠陥を検出できる証拠、fixtureの隔離。

- 例 `RD06-047`：design-reality-binding lintは、identity_post_check以外でexecutable_oracle方式・一致する期待reason・RED_BY_ORACLE・実装内のmutation対象・実行テスト参照等の条件が揃わない場合、失敗させる。実行テストパス指定時にoracle IDまたはhelperが空の場合も拒否する。（`src/lint/design-reality-binding.ts` 764-786行）
- 例 `RA-348`：QAはtest比率をUnit60%以上・Integration25%以下・E2E10%以下・Manual5%以下を目安として設計する。（`.claude/agents/qa-test.md` 31-37行）
- 例 `RD00-093`：延期義務の照合は、escaped defectが1件以上、またはmutation検出率が1未満の場合、安全性退行として失敗判定にする。（`src/runtime/ci-deferred-obligation-recovery.ts` 340-350行）

#### `RUL-FRM-06`（HARNESS）　135／118件

設計の書き方を定める。component間の契約（事前条件・事後条件・不変条件）、依存の方向と強さ、ownerの単一性、用語集との同期。

- 例 `RD10-199`：telemetry closure lintはautomation ownerが空または空白だけなら失敗させる。（`src/lint/telemetry-closure.ts` 138-154行）
- 例 `RA-005`：code-reviewerはレビュー表現をHELIX用語と整合させる。（`.claude/agents/code-reviewer.md` 110-114行）
- 例 `RE01-036`：設計者は変更がなくても用語集差分の節を設け、新語を追加した場合は正本用語集へ戻して反映する。（`docs/governance/helix-harness-requirements_v1.2.md` 583-587行）

#### `RUL-FRM-07`（HARNESS）　46／18件

文書の言語と可読性を定める。人間向けの文は日本語、主語を明示、1文1主張、文字化けや不正な文字を検査する。

- 例 `RB08-067`：freeze担当者は文字化けがなく、目的が5文以下で、Scope/Non-goalsが存在し、裸のTODOにPLAN参照があることを確認する。（`docs/skills/documentation-and-adrs.md` 58-64行）
- 例 `RB08-050`：破壊的command変更の担当者は旧説明を黙って置換せず、Migration節に移行注記を追加する。（`docs/skills/documentation.md` 82-83行）
- 例 `RD05-130`：completion-decision-packetは、yamlLinesJaの本文に日本語文字がない場合、失敗させる。（`src/lint/completion-decision-packet.ts` 1161-1166行）

#### `RUL-FRM-08`（HARNESS）　35／14件

要求の書き方を定める。機能要求の必須属性と受入条件、非機能要求の分類と等級、優先度、識別子の欠番の扱い、原子化しても利用者価値を失わないこと、画面設計で作る成果物。

- 例 `RB05-077`：Update identityとP0/P1/P2 priorityは直交させ、証拠によるpriority変更を認め、P3=Updateという固定対応を正本にしない。（`docs/governance/l3-rebaseline-g3-freeze-packet.md` 381-382行）
- 例 `RE01-045`：画面設計者はBR・UXから画面、画面から要求へのtraceを用意する。P0のFRに必要な画面traceがなければ失敗とし、P1/P2の不足は警告する。（`docs/governance/helix-harness-requirements_v1.2.md` 591-600行）
- 例 `RB04-055`：企画者は社内システム・開発基盤の企画段階でROI/KGI/KPI定量化を強制せず、定量指標と受入条件を要求・要件層で定める。（`docs/governance/helix-harness-concept_v3.1.md` 552-552行）

#### `RUL-FRM-09`（HARNESS）　30／3件

安全検証の義務と判定基準を定める。脅威modelを適用する工程と時期、脆弱性の重大度を実害への経路から決める基準、攻撃を試みた記録の要件、依存・供給網・licenseについて確認すべき事項。実行と証拠の管理はOSが担う（RUL-OSA-07）。

- 例 `RA-174`：security-auditはexploit経路のfile・行・再現条件からseverityを決め、実害につながる所見だけをCritical・Highにし、高リスク順で返す。（`.claude/agents/security-audit.md` 23-26行）
- 例 `RB08-001`：設計者はagent向けsurfaceの脅威モデルを、実装開始前のL2・L3で適用する。（`docs/skills/threat-model.md` 21-24行）
- 例 `RB07-073`：テスト作成者は依存先の遅延・停止・異常値・部分成功を想定し、エラー表示の情報漏洩と次行動の明確さも検査する。（`docs/skills/test-thinking.md` 58-61行）

### サービス④開発

#### `RUL-DEV-01`（HARNESS）　94／114件

実装の規律を定める。失敗を握りつぶさない、循環依存を作らない、修正は最小にして無関係な整理を混ぜない。

- 例 `RA-282`：エージェントは既存の命名・構造・test配置に合わせる。（`AGENTS.md` 149-149行）
- 例 `RB07-290`：関数bodyが推奨30行を超える場合、実装者はnamed helperを抽出し、新概念なら設計へ記録する。（`docs/skills/incremental-implementation.md` 74-75行）
- 例 `RG03-007`：実装者は、ADR-001のTypeScript strict方針を維持する。（`AGENTS.md` 95-95行）

#### `RUL-DEV-02`（HARNESS）　99／56件

役割別（API、業務logic、DB、画面、deploy）の製品実装の標準と、各役割が返す成果の形式を定める。

- 例 `RA-328`：DB担当はPKをUUIDまたはBIGSERIALとし、id・created_at・updated_atを必須にしてdeleted_atで論理削除を表す。（`.claude/agents/db-schema.md` 27-30行）
- 例 `RB07-046`：consoleのCLI copy patternは事前生成コマンド文字列をclipboardへ書き、一時的なコピー完了feedbackを表示する。（`config/ui-domain/harness-console-bundle.json` 61-68行）
- 例 `RD10-064`：lintはL7工程表にdatabase、service、frontend、uiの必須feature pack層が欠ける場合に失敗させる。（`src/lint/roadmap-registry.ts` 113-118行）

#### `RUL-DEV-03`（HARNESS）　14／5件

追加する前に、不要にできないか、再利用できないか、代替案は無いかを確かめる。複雑さが増える変更は根拠と撤去条件を示す。

- 例 `RB0-131`：提案者は採用案に最低一つの対案とtrade-off比較を付ける。（`docs/skills/judgment-core.md` 58-59行）
- 例 `RD05-219`：ddd-tdd-rulesは、add_codeまたはjustified_positiveを選んだPLANでcomplexity_justificationまたはremoval_triggerに実質的な値がない場合、違反にする。（`src/lint/ddd-tdd-rules.ts` 584-596行）
- 例 `RC01-177`：runtime-portabilityは、許可wrapperが空行・コメント以外で12行を超える、src/cli.ts参照がない、またはdist/helix参照がない場合、不合格にする。（`src/lint/runtime-portability.ts` 160-165行）

### 部品：リサーチ

#### `RUL-RSH-01`（HARNESS）　141／46件

外部の技術・OSS・SaaS・事例を調べて採否する手順を定める。成熟度、依存risk、代替案、反対意見を示し、そのまま導入せずHELIXの境界へ変換する。

- 例 `RD10-191`：verification source metadata検証はsourceUrl、latestOfficialStatus、sourceStatusDelta、adoptionDecision、adoptionDecisionDelta、workflowRouteImpactの各値が欠落またはplaceholderなら違反を返す。（`src/lint/source-ledger-freshness.ts` 98-112行）
- 例 `RE01-241`：外部実装の採用者はbehavior atomを抽出して採否を判断し、Grok等の実装を直接importしない。provider比較は共通契約・固定rubric・blind benchmarkで行い、重大な失敗を平均値で相殺しない。（`docs/governance/helix-harness-requirements_v1.3.md` 434-439行）
- 例 `RB08-097`：技術調査担当者はS1で既存ADRとの重複を確認し、S2で候補別証拠を集め、S3で推薦と要求・運用制約の対応を確認する。（`docs/skills/tech-selection.md` 69-76行）

### フルリバース

#### `RUL-REV-01`（HARNESS）　94／56件

既存の成果物を観測し、契約と設計へ写し、仮説を人間が確認してから通常の工程へ合流させる。上流の文面をそのまま採用せず、未接続の実装は部分的と分類する。

- 例 `RB08-071`：Reverse文書担当者はR2を観測された現状、R3をmoduleと要求の対応、R4をscope・受入・検証付き要求更新として書き、backfill文書もtrace-freeze前に可読性確認する。（`docs/skills/documentation-and-adrs.md` 79-83行）
- 例 `RB07-181`：担当者は上流文面をそのまま採用せずHELIX契約へ変換し、実装・testがない直接実装や未接続runtimeをpartialと分類する。（`docs/governance/helix-adoption-design-completion-audit-2026-06-30.md` 24-31行）
- 例 `RG10-005`：POはapproval_policyがpo_intentの場合、Reverse R3で復元した意図を確認する。（`docs/governance/drive-route-catalog.md` 70-70行）

### サービス⑥リリース

#### `RUL-REL-01`（HARNESS）　70／44件

配布・公開・本番反映の条件を定める。公開先の制限、環境ごとの承認者、自己承認の禁止、復旧先の特定。

- 例 `RB07-336`：data migrationなしのForward deployはrollingまたはdirect replace後すぐsmokeを行い、flag付き機能はflag-offでdeployして検証後に有効化する。（`docs/skills/ci-deploy-and-rollback.md` 48-54行）
- 例 `RD09-124`：proposal-document-coverageは、ops-release-migrationを期待するシナリオでops-release-migration-reviewがrequired_gatesにない場合、失敗させる。（`src/lint/proposal-document-coverage-policy.ts` 72-72行）
- 例 `RB08-182`：Incident担当者はproduction障害・回帰・hotfixを入口とし、本番変更前にon-call・TL・PMの承認を記録する。（`docs/skills/incident-runbook.md` 45-49行）

### コア

#### `RUL-COR-01`（HARNESS／OS）　166／205件

正本を一つに保つ。要求や設計の意味は正本からだけ読み、DB・projection・生成物・会話を第二の正本にしない。作業者は状態DBへ直接書かない。

- 例 `RB0-002`：要求対象を整理する者は製品責務決定を確認し、旧Conceptの対象混在記述を優先してはならない。（`docs/governance/README.md` 8-9行）
- 例 `RD09-150`：relation impact分析は、design catalog nodeがあるのにcatalogs edgeが1件未満の場合、missing-projection errorで失敗させる。（`src/lint/relation-graph.ts` 624-645行）
- 例 `RG00-003`：code-reviewerの定義では、レビュー5軸の正本をdocs/skills/judgment-core.md §4.1とし、その内容をagent定義へ複製しない。（`.claude/agents/code-reviewer.md` 39-42行）

#### `RUL-COR-02`（HARNESS／OS）　438／355件

成果物と判断を対象revisionとdigestへ束縛し、対象が変わったら古い結果をstaleにする。digestの計算方法を版で固定する。

- 例 `RD05-150`：completion-review-bundleは、bundleDigestがbundleDigest自身を除くbundle全体のSHA-256に一致しない場合、失敗させる。（`src/lint/completion-decision-packet.ts` 2066-2103行）
- 例 `RB05-368`：route projectionはHEAD・contract・owner・dependency frontierの変更やevidence期限切れでstaleにし、再入にはこれらと右腕証拠のcurrent性を要求する。（`config/drive-route-catalog.json` 263-275行）
- 例 `RC00-246`：project hook authority解決器は、実行rootとloaderの物理identity不一致、session authority時のsession root不一致、またはroot digest不一致があれば失敗する。（`src/runtime/project-hook-authority.ts` 206-217行）

#### `RUL-COR-03`（OS）　271／102件

状態の更新は、中断・再試行・担当の交代があっても、二重に実行されず、古い作業者の結果が新しい状態を上書きしない。同じ操作を繰り返しても結果が変わらない。実現の方式はL3以降で選ぶ。

- 例 `RD01-092`：ingestとcheckpoint scope選択は、既存log内にevent IDの重複があれば失敗する。（`src/runtime/event-projection-checkpoint-replay.ts` 279-281行）
- 例 `RC03-092`：feedback操作処理は、lockや追記などで例外が発生し、journal再読込による所定の回復条件も成立しない場合、ok=falseを返す。（`src/policy/feedback-lifecycle.ts` 372-395行）
- 例 `RD01-137`：feedback記録処理は、session・PLAN・attention・summary・reasonが既存記録と同じ場合に追記を省略する。（`src/runtime/forced-stop.ts` 76-79行）

#### `RUL-COR-04`（OS）　1365／884件

入力・設定・schema・pathを検証し、不正・未知・検証不能はfail-closeで拒否する。fail-openにする箇所は意図を明示する。

- 例 `RD06-108`：document-agent-metadata lintは、manifestのinclude root・exclude root・対象文書パスが空、先頭スラッシュ、バックスラッシュ、空・ドット・親移動segmentを含む場合、失敗させる。（`src/lint/document-agent-metadata.ts` 19-25行）
- 例 `RD03-236`：Windows canary lease binding検証は、expires_atがissued_at以下の場合、拒否する。（`src/runtime/windows-lite-canary-admission.ts` 245-247行）
- 例 `RD06-143`：drive-route-catalog lintは、同一routeのphasesに重複がある場合、失敗させる。（`src/lint/drive-route-catalog.ts` 244-250行）

#### `RUL-COR-05`（OS）　63／58件

toolchainと依存を固定し、clean環境とofflineで再現できるようにする。lockのずれ、部品表の欠落を失敗にする。

- 例 `RG03-002`：Issue metadata監査CIは、ubuntu-latest runner上でjobを実行する。（`.github/workflows/issue-metadata-audit.yml` 12-14行）
- 例 `RG33-004`：runtime-portability loaderは、gitが使えない場合でもfilesystem走査へfallbackし、検査面をpackage.jsonとtsconfig.jsonだけに縮退させずsrc・.claude/hooks・scriptsを被覆する。（`src/lint/runtime-portability.ts` 292-327行）
- 例 `RE01-098`：外部tool導入者は公式の信頼できる配布元とintegrityを確認し、登録・probeを満たしたtoolだけを実行する。（`docs/governance/helix-harness-requirements_v1.2.md` 1386-1402行）

#### `RUL-COR-06`（OS）　63／27件

作業者の実行環境を隔離する。通信は既定で拒否、最小権限、読取専用の領域、子processの回収、ホストの露出制限、対応OSの互換、外部入力に混入した命令を実行しない。

- 例 `RC04-284`：CI設定は、workflow tokenの権限を列挙されたread権限に限定する。（`.github/workflows/harness-check.yml` 22-26行）
- 例 `RD02-258`：provider lifecycle制御器は、親process終了時にprovider process groupへSIGKILLを送る。（`src/runtime/provider-process-lifecycle.ts` 293-305行）
- 例 `RD02-205`：machine safety guardは、Docker volumeでhost rootを指定するpattern、または--mountのsource=/で始まるpatternをblockする。（`src/runtime/machine-safety-guard.ts` 303-308行）

#### `RUL-COR-07`（HARNESS／OS）　19／16件

成果物と判断に恒久の識別子を持たせ、改名・移動・分割・統合をしても義務と意味と履歴を保存する。指示の原文は来歴付きで追記のみで保全し、設計判断の後継と廃止を管理する。

- 例 `RG45-018`：finding IDは、root cause・scope authority・baseline revision・invariant・trigger kind・detector・event集合・source evidence集合・recurrence lineageから決定論的に導出する。（`src/runtime/universal-improvement-finding-qualification.ts` 223-245行）
- 例 `RG10-012`：文書作成者はbareな未登録IDトークンを本文へ直接記載してはならない。（`docs/governance/gate-design.md` 188-188行）
- 例 `RG18-018`：変更担当者はpublic CLI flagまたは.helix/のfieldをrenameする際、callerと設計文書を更新せずに進めてはならない。（`docs/skills/refactoring.md` 97-98行）

#### `RUL-COR-08`（HARNESS／OS）　45／14件

要約・表示・引き継ぎ・提示するcommandは、元の意味を落とさない。要約は工程、現在位置、適用中のskillや判断の根拠を保持し、提示するcommandや値は正規の導出結果と一致する。正規の検証経路を、別の手軽な手段で代替しない。

- 例 `RD05-089`：completion-decision-packetは、補助summaryのrunnableScopedCommandが正規scopedコマンドのrunnable変換結果に一致しない場合、失敗させる。（`src/lint/completion-decision-packet.ts` 747-755行）
- 例 `RG08-003`：consoleは、次の行動を表示するときにnext authorityを明示する。（`config/ui-domain/harness-console-bundle.json` 79-80行）
- 例 `RB08-091`：検証担当者はnpm run testとBiome checkを使い、native runner直実行やbiome lint単体で正規検証を代替しない。（`docs/skills/gate-planning.md` 83-85行）

### チケット

#### `RUL-TKT-01`（OS）　55／45件

作業単位（旧PLAN）のidentityを一意にし、重複を作らず既存の延長を優先する。置き換えは後継と訂正を双方向に記録し、黙って上書きしない。

- 例 `RD01-175`：Forward／Reverse予約処理は、両PLAN IDの意味slugが異なれば拒否する。（`src/runtime/forward-reverse-terminal-reservation.ts` 99-102行）
- 例 `RB06-278`：PLAN管理者はsupersededをarchiveで隠さず後継・errata・traceで扱い、archived遷移には人間承認とrejectionまたはretirement理由を要求する。（`docs/governance/repository-structure.md` 116-116行）
- 例 `RD03-033`：active PLAN更新は、canonical ID選択が不正と判定された場合、markerを書き換えない。commitから推定したIDが拒否された場合はwarning出力先があれば警告する。（`src/runtime/session-log.ts` 244-248行）

#### `RUL-TKT-02`（OS）　132／153件

作業を始める前に、作業graph、依存、並列と直列、scope、予算、作業者へ渡すcontextの境界を確定する。境界の無い作業者を起動しない。

- 例 `RD02-126`：階層監査器は、親Issueの子が100件を超える場合に失敗とする。（`src/runtime/issue-hierarchy.ts` 1123-1131行）
- 例 `RD02-129`：階層監査器は、open・activeのtaskまたはfindingで、子がなく、全blockerがclosedで、当該Issueにfindingがない場合だけready leafへ選出する。（`src/runtime/issue-hierarchy.ts` 1160-1172行）
- 例 `RB08-026`：見積担当者は選択したdevelopment styleのslice境界と正規V-pairを含めて採点し、Scrumを品質工程省略として減算しない。（`docs/skills/estimation.md` 62-63行）

#### `RUL-TKT-03`（OS）　77／116件

差戻し、持ち越し、後続Issueへの分離を記録し、検証の失敗を差戻しへ接続する。

- 例 `RD08-014`：L14 close audit lintは、closed以外の指定監査行でnextActionが「なし」またはnoneの場合、失敗させる。（`src/lint/l14-close-audit.ts` 214-219行）
- 例 `RD11-198`：terminal fullback監査は、依存Issue #204・#635・#188の状態がopenでない、または欠落している場合に失敗させる。（`src/lint/workflow-classification-terminal-fullback.ts` 134-134行）
- 例 `RD08-038`：left-arm carry lintは、凍結legacy例外以外の終端L7 impl/add-impl PLANにleft_arm_carry判断がない場合、失敗させる。（`src/lint/left-arm-carry-log.ts` 162-179行）

### OS管理

#### `RUL-OSM-01`（OS）　277／184件

人間の判断が必要な事項を限定して列挙し、その定義を所有する（目的と範囲の変更、要求の削除と縮小、安全の緩和、機微な領域、取り消せない操作、公開、license、要求の矛盾、権限が不明な場合など）。該当する事項は判断資料を作り、対象と範囲へ束縛した承認が出るまで実行しない。暫定の判断は期限と確定条件を持つ。

- 例 `RB06-051`：AIはtyped NFR registryの正式authority昇格時に、POのauthority receiptを取得する。（`docs/governance/rule-enforcement-gap-audit-2026-08-12.md` 43-44行）
- 例 `RD11-057`：MCP inspectionは、allowExternalが真でない場合にrefusedを返す。（`src/lint/verification-profile.ts` 315-325行）
- 例 `RG15-017`：コマンド実行など安全境界に触れる脆弱性を発見した作業者は、schemaとadapter境界の対策を実施したうえで、エスカレーション規則に従いPOへescalateする。（`docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md` 109-111行）

#### `RUL-OSM-02`（OS）　119／120件

役割・agent・hook・adapterの登録と版を管理し、runtime間（Claude、Codex等）でguardと規則が乖離したら検出して止める。

- 例 `RB05-155`：agent管理者はfailedからverifiedへの遷移と、verification_pendingからのreleaseを拒否する。（`docs/governance/infinity-loop-system-assertion-cases.md` 59-60行）
- 例 `RE01-109`：runtime実装者はAI runtimeをoptionalにし、未導入でもstandaloneの機械検証を利用可能にする。（`docs/governance/helix-harness-requirements_v1.2.md` 1542-1551行）
- 例 `RB06-088`：完全性チェックはKimi CLIのversion変化を記録し、yoloMode=trueを検出した場合は手動確認ALERTを出す。（`docs/governance/kimi-code-extension-security-audit-2026-08-06.md` 159-165行）

#### `RUL-OSM-03`（OS）　76／58件

memoryと引き継ぎを正本にしない。使う前に正本・履歴・診断と照合し、期限と保持を管理し、providerの記憶を混入させない。

- 例 `RG18-019`：共有memoryの管理者はbreadcrumbにprovenanceとTTLを持たせる。（`docs/skills/requirements-handover.md` 34-36行）
- 例 `RD07-135`：handover退役棚卸しは、provider_evidenceまたはoperations_transitionにsession continuation操作の記述が混入し、許可provider操作でも否定された記述でもない場合に失敗する。（`src/lint/handover-retirement.ts` 62-67行）
- 例 `RD01-051`：continuation優先順位処理は、memoryが欠落している場合、DB情報を採用してfindingを返す。（`src/runtime/continuation.ts` 1239-1239行）

#### `RUL-OSM-04`（OS）　96／48件

秘密・個人情報・認証情報を、文書・規則・例・log・証跡・AIへの入力に出さない。検出したら記録の前に拒否する。

- 例 `RD03-021`：secret egress hookは、引数なしenv/setによる環境表示またはprintenvに一致するcommandを拒否する。（`src/runtime/secret-egress-hook.ts` 239-249行）
- 例 `RG44-015`：secret egress hookは、git addのpathspecがオプション様・カレント全体・glob・展開を含むかquoteが閉じないため確定できない場合、限定走査へ縮退せず作業tree全体の変更を走査する。（`src/runtime/secret-egress-hook.ts` 77-134行）
- 例 `RA-049`：BE API担当はrequest・responseログのPIIをmaskする。（`.claude/agents/be-api.md` 63-64行）

#### `RUL-OSM-05`（OS）　102／32件

破壊的な操作（履歴の書換え、強制push、一括削除、上書き）を既定で拒否する。例外は理由付き・一回限りとし、監査に残す。

- 例 `RD02-203`：machine safety guardは、killallまたはpkillへの指定patternの9/KILL flagをblockする。（`src/runtime/machine-safety-guard.ts` 299-300行）
- 例 `RC0-024`：Override処理は、markerの消費に失敗した場合、操作を拒否する。監査の補償処理にも失敗しても拒否を維持する。（`src/runtime/guard-override-transaction.ts` 61-71行）
- 例 `RD01-227`：Git guard hookは、override markerの読取またはnonce用stat取得に失敗した場合、元の拒否を維持する。（`src/runtime/git-command-guard-hook.ts` 281-300行）

#### `RUL-OSM-06`（OS）　62／34件

他の作業者や他runtimeの作業中の変更を保護する。未commitの変更や他者のcommitを、明示の指示なしに戻したり上書きしたりしない。

- 例 `RD04-163`：session touch証拠取得器は、別worktreeの相対path、正規化後も絶対pathまたは..を含むpath、壊れたJSON行を所有証拠に数えない。（`src/runtime/worktree-state.ts` 59-84行）
- 例 `RG40-010`：文書report書込器は、公開を同一directory内のhard linkで行い、既存fileがあればEEXISTを専用の既存エラーへ変換して上書きしない。（`src/runtime/document-report-write-port.ts` 144-155行）
- 例 `RD04-029`：work-guard hookは、環境変数によるoverrideでも監査transactionのstatusがallowedでなければブロックを解除しない。（`src/runtime/work-guard-hook.ts` 102-123行）

#### `RUL-OSM-07`（OS）　259／185件

旧資産の退役と切替を管理する。旧の参照を0にしてから退出し、旧の成果や旧の識別子を現行の根拠へ再昇格させない。

- 例 `RD08-079`：semantic consumer lintは、指定旧関数の直接呼出marker数がpath別固定上限を超える場合、未登録直接呼出として失敗させる。未登録pathの上限は0とする。（`src/lint/legacy-orchestration-semantic-consumers.ts` 231-239行）
- 例 `RB08-195`：cutover担当者は未backfill実装を削除する場合Reverse PLANで削除内容と理由を残し、Reverse義務がopenの間はacceptedにしない。（`docs/skills/deprecation-cutover.md` 69-74行）
- 例 `RB08-194`：削除担当者はtypecheck成功を確認し、旧pathを参照するtestを更新または理由付き削除して、merge前にreview証跡を残す。testを黙ってskipしない。（`docs/skills/deprecation-cutover.md` 65-67行）

#### `RUL-OSM-08`（OS）　84／88件

GitHubを共有・作業・証拠の投影として使う。Issue、PR、templateの形式とownerの単一性を定め、GitHubの状態から要求や承認を作らない。

- 例 `RD09-088`：PR scope preflightは、PLANのconfirmed昇格等でlive snapshotがbaseと同一になる場合、snapshotのExpected宣言を外すよう案内する。（`src/lint/pr-scope-preflight.ts` 126-139行）
- 例 `RB04-278`：基盤担当者はGitHub組織を作成し、repository命名とmember roleを定義して既存repositoryを移管する。（`docs/governance/ai-dev-team-concept_v1.1.md` 605-613行）
- 例 `RB0-023`：PR作成者は一つのbehavior contractと一つの責務ownerを単位に変更し、独立merge可能なbehaviorや複数ownerを混載しない。（`docs/governance/coding-rules.md` 29-31行）

#### `RUL-OSM-09`（OS）　37／13件

repositoryの運用規約を定める。commit文面の形式、統合後のbranchの廃棄、命名、追跡する生成物の範囲、設定の置き場の集約、個人設定と共有規則の分離、文書から環境固有のpathを除く。

- 例 `RB07-227`：旧Git運用では複数行commit messageをBash heredocで渡し、PowerShell here-stringを使わない。（`docs/skills/git.md` 49-57行）
- 例 `RG40-008`：文書report書込器は、出力先をrepository配下の固定artifact root（.helix/artifacts/document-diff）に限定する。（`src/runtime/document-report-write-port.ts` 93-96行）
- 例 `RG40-021`：orchestration eventのjournalとcheckpointは、repository配下の固定path（.helix/audit/orchestration-events.jsonl と .helix/state/orchestration-checkpoint.json）に置く。（`src/runtime/event-projection-checkpoint-transaction.ts` 106-112行）

### OS推進

#### `RUL-OSP-01`（OS）　70／55件

レーンと役割（技術lead、実装、QA、調査、審査）の責務と、各役割が返す成果の形式を定める。役割の不在時の代行を定める。

- 例 `RA-302`：project explorerはcurrent repository treeとtracked contextだけを調べ、再利用候補を新規実装案より先に返し、探索だけのtaskでは実装変更を最小にする。（`.claude/agents/pmo-project-explorer.md` 16-16行）
- 例 `RB04-246`：AI実装・保守はalert初動・修正指示・test不足発見・escalation・監視を担当し、UI/UXは画面設計・design system維持・TLへの仕様橋渡しを担当する。（`docs/governance/ai-dev-team-concept_v1.1.md` 162-179行）
- 例 `RD03-089`：specialist team選択は、要求された検証axisについて指定driveを担当できるverifierがいない場合、失敗する。（`src/runtime/specialist-agent-registry.ts` 283-296行）

#### `RUL-OSP-02`（OS）　65／52件

作業の性質に応じてmodel・provider・推論の深さを割り当て、結果に応じて調整する。能力が足りない実行環境には割り当てず、上位modelの使用は許可を要する。

- 例 `RE01-119`：委譲者は高価なfrontier modelを判断作業へ集中し、routine作業へ一律に使用しない。（`docs/governance/helix-harness-requirements_v1.2.md` 1555-1614行）
- 例 `RE01-148`：旧委譲処理はhybrid modeだけで実行し、standaloneでは実行せずguidanceを提供する。（`docs/governance/helix-harness-requirements_v1.2.md` 2092-2092行）
- 例 `RG16-002`：委譲者は、ADR作成、gate review、設計判断をprimary session modelへ割り当てる。（`docs/skills/agent-cost-design.md` 32-36行）

#### `RUL-OSP-03`（OS）　155／124件

委譲には目的・出力形式・tool方針・境界を必ず付ける。許可された役割とmodelの組合せだけを起動し、検証できない状態では起動しない。

- 例 `RC00-205`：worker risk admissionは、benchmark receiptの封緘されたriskを取得できなければ拒否する。（`src/runtime/worker-risk-admission.ts` 222-225行）
- 例 `RD09-115`：proposal-document-coverageは、agent-orchestrationを期待するシナリオでruntime_routingがrequired_evidenceにない場合、失敗させる。（`src/lint/proposal-document-coverage-policy.ts` 62-62行）
- 例 `RA-083`：Claude設定はAgent・Taskの直前にagent-guardをtimeout 5秒、blockOnFailure=trueで呼ぶ。（`.claude/settings.json` 4-16行）

#### `RUL-OSP-04`（OS）　25／22件

AIは、RUL-OSM-01が定める人間の介入点に当たらない作業を自走する。人間へ質問する前に、AI側で解決できる情報が残っていないかを確かめ、質問するときは判断に必要な材料を揃える。介入点の定義そのものは持たず、RUL-OSM-01を参照する。

- 例 `RC00-199`：相談Stop gateは、escalationを検出しreceiptが存在せず、有効なone-shot overrideもなければ停止をblockする。（`src/runtime/escalation-consult-gate.ts` 167-184行）
- 例 `RG40-013`：エスカレーション意図の検出は、fenced/inline codeとblockquote行、gate自体を指すmeta名詞句、否定・非該当表現を先に除去してから判定し、それらをエスカレーション宣言として扱ってはならない。（`src/runtime/escalation-consult-gate.ts` 35-61行）
- 例 `RD02-134`：質問gateは、preference質問にbypass理由がない場合に拒否する。（`src/runtime/legacy-adoption.ts` 285-288行）

#### `RUL-OSP-05`（OS）　38／29件

作業者の行動規律を定める。失敗の出力を全部読む、根因を確定してから直す、推測で進めない、他の正本と矛盾したら止まる。

- 例 `RA-290`：エージェントは各層の設計・curationで旧HELIX repositoryの再利用可能機能を確認し、既存を見ずに新規案だけを起こさない。（`AGENTS.md` 117-120行）
- 例 `RG17-002`：移行担当者は、主観的な不安だけを理由にrollbackしてはならない。（`docs/skills/data-migration.md` 78-80行）
- 例 `RG17-006`：設計者は、判断が規約準拠とarchitecture選択のどちらに属するか判別できない場合、既存方式を踏襲する。踏襲で問題が生じる証拠が揃ってから、architecture判断としてADRを起こす。（`docs/skills/design-tailoring.md` 88-93行）

#### `RUL-OSP-06`（OS）　72／36件

複数agentの実行計画を検証する。並列の上限、直列化の依存、実行modeを確かめ、不整合な計画を実行しない。

- 例 `RC03-095`：チーム実行計画の依存関係検査は、serialize_afterの依存先を辿って循環が見つかった場合、計画を不適格とする。（`src/team/run.ts` 265-300行）
- 例 `RD04-010`：委譲判定器は、必須依存edgeのいずれかがlane ready receiptの完了集合に無い場合に拒否する。（`src/runtime/work-graph-receipt-acceptance.ts` 331-334行）
- 例 `RC0-110`：Team runnerは、hybrid teamにClaudeとCodexの両方が含まれない場合、不合格にする。（`src/team/run.ts` 324-333行）

#### `RUL-OSP-07`（OS）　41／8件

自律実行の停止条件と上限を定める。反復回数、実行時間、予算、変更量、進捗の停滞、利用枠の枯渇、再試行の上限で止め、段階的に停止して再開できるようにする。

- 例 `RF00-009`：予算上限の導出器は、サイズ別基準値にsmart_review_agentは1.1、light_implementation_agentは0.8、workerとtlは1、verifierは0.7、fast_checkerは0.35を掛ける。反復数・ツール呼出数・経過時間は切捨て後に最低1を適用し、費用は小数点以下4桁に丸める。（`src/orchestration/loop-effort-budget.ts` 71-78行）
- 例 `RD02-039`：ACP実行器は、制限時間に達した場合にprotocol失敗とし、子processへSIGTERMを送る。（`src/runtime/independent-review-fallback.ts` 1019-1030行）
- 例 `RG02-002`：Claude設定は、Stop時のclaude-memory-wake hookに7230秒のtimeoutを適用する。（`.claude/settings.json` 78-85行）

#### `RUL-OSP-08`（OS）　28／7件

作業に応じてskillと参照資料を選び、読み込む量を制限する。skillの起動条件、手順の厳密さ、検証loop、重複の排除を設計する。

- 例 `RD10-182`：skill quality lintはfrontmatter除去後の本文が1200文字未満、または「## 」見出しが2節未満なら失敗させる。（`src/lint/skill-quality.ts` 230-239行）
- 例 `RB0-124`：agentは作業開始時にstatusとskill推奨順位を確認して上位packを読み、PLANがない場合はtrigger表から選ぶ。（`docs/skills/SKILL_MAP.md` 24-30行）
- 例 `RD10-179`：skill quality lintは正規化本文の16文字shingle共有率が小さい側の集合に対して0.35を超える場合に失敗させる。（`src/lint/skill-quality.ts` 103-126行）

### OS検収

#### `RUL-OSA-01`（OS）　114／88件

作成と検証を分ける。別の作業者・別のsession・可能なら別のmodel系統で審査し、審査者は編集しない。同じproviderで検証した場合は理由を残す。

- 例 `RC04-020`：ループ実行器は、hybridで反対providerのverifierが利用できなければworkerを起動せず停止する。（`src/orchestration/cross-verifier.ts` 9-14行）
- 例 `RD00-260`：review pair検証は、mixed authorでauthor modelのproviderが認識可能な独立runtimeでない場合、拒否する。（`src/runtime/claude-pr-convergence.ts` 527-530行）
- 例 `RG15-008`：敵対reviewの運用者は、これを人間確認（抜き打ち）の代替ではなく人間が見る件数を減らすフィルタとして扱う。（`docs/skills/adversarial-review.md` 42-43行）

#### `RUL-OSA-02`（OS）　74／52件

審査の観点と報告の形式を定める。重大度の順、正しさ・可読性・構造・安全・性能の各観点、根拠となるfileと行、好みをblockerにしない。

- 例 `RB08-209`：単一runtimeのreview担当者は各checklist項目をpass・fail・n-aで判定し、n-aにも証拠を付け、template証拠欄を実際の文書・test・source・runtime・依存・再利用・workflow確認へ置換する。（`docs/skills/review-checklist.yaml` 32-61行）
- 例 `RC03-126`：単一runtimeの判断ゲートは、COD checkがfail、またはn-aなのに非空のevidenceがない場合、失敗する。（`src/gate/review-tier.ts` 89-99行）
- 例 `RB08-018`：Refactor担当者はpublic export signatureを触る場合、reviewで下流破壊がないことを確認する。（`docs/skills/refactoring.md` 67-68行）

#### `RUL-OSA-03`（OS）　35／40件

指摘の処分を定める。同じ責務で局所的に閉じるものは今の変更で直し、独立の責務だけ後続へ分ける。blockerは同じ対象について一括で返す。修正後の再判定は、新しい独立のblockerが実証されない限り一巡とし、実証された場合は再審査する。審査後に対象が変われば審査をstaleにする。

- 例 `RA-161`：AI-Bは同一HEADのblockerを一括返却し、新たな独立blockerの実証がなければ修正後HEADを一巡だけ再判定する。（`AGENTS.md` 327-328行）
- 例 `RG39-007`：PR review依頼に埋め込む収束方針は、current behavior contract違反・correctness/security/data loss・必須CI/DB/oracle red・虚偽/過大claimをblockerとしてcurrent PR内で閉じ、non-blockerはIssueへ分離し、mergeはcurrent HEADの独立review receipt・CI・DB convergenceを再照合した明示mergeに限ると定める。（`src/runtime/claude-memory-wake.ts` 566-571行）
- 例 `RD00-047`：atomic slice評価は、登録されたblocker分類のdispositionがcurrent_blocker以外の場合、current_blocker_deferredとして拒否する。（`src/runtime/atomic-slice-admission.ts` 292-295行）

#### `RUL-OSA-04`（OS）　94／62件

統合の許可を定める。自動mergeを使わず、審査側が最新の対象・審査・CI・記録を照合して明示的に統合する。統合を妨げるのは未解消のblocker（正しさ、要求、安全、必須の検査に関わる指摘）であり、処分済みの任意改善と後続へ分けた事項は妨げない。

- 例 `RD01-285`：現在Claude receiptの候補検証は、記載CI世代のrun ID・attempt・conclusionが実CIと一致しなければ拒否する。（`src/runtime/github-cross-review-admission.ts` 556-568行）
- 例 `RD03-070`：frontier再計算は、dispatcherがmerge順序の決定を要求した場合、他の判定に進まず拒否する。（`src/runtime/slot-scheduler-quota-handover.ts` 583-593行）
- 例 `RA-165`：旧main運用はstrictなharness-checkとadminへの保護を要求し、人間approveを不要とする一方、force-pushとbranch削除を禁止する。（`AGENTS.md` 317-319行）

#### `RUL-OSA-05`（OS）　152／90件

CIの構成を定める。必須checkの集約、変更の種類ごとのfail-close、PR時と定期実行の監査範囲、検査の無効化やskipで違反を隠さない。

- 例 `RC00-191`：CI preflight集約は、l12_authorityがsuccessでなければ不合格とし、skipも許可しない。（`src/runtime/preflight-gate-aggregation.ts` 178-196行）
- 例 `RC00-178`：CI preflight集約は、repo_guard_preflightがsuccessでなければ不合格とし、skipも許可しない。（`src/runtime/preflight-gate-aggregation.ts` 178-196行）
- 例 `RG02-013`：旧HELIXの検証運用では、ローカルhookを早期検知に限定し、全量テストと回帰確認をGitHub Actionsで実行する。（`.github/workflows/harness-check.yml` 1-3行）

#### `RUL-OSA-06`（OS）　243／822件

機械検査（診断、lint、gate）の各checkが何を不合格にするかを定義し、規則と検査の対応を保つ。

- 例 `RD07-047`：g8-integration-workflowは、gates.mdに所定のG8定義マーカーが一つでも欠ければ失敗する。（`src/lint/g8-integration-workflow.ts` 76-81行）
- 例 `RB06-060`：提案されたtrace lintでは、HR-FR-HYB-001〜010の各IDに最低一箇所のcitationを要求する。（`docs/governance/rule-enforcement-gap-audit-2026-08-12.md` 101-103行）
- 例 `RG24-006`：ddd-tdd-rulesは、engineering discipline契約の適用閾値を作成日2026-07-25のみとし、それ以前に作成されたPLANは契約を宣言していても検証対象とせず遡及的な記入要求を発生させない。（`src/lint/ddd-tdd-rules.ts` 448-448行）

#### `RUL-OSA-07`（OS）　40／16件

HARNESSが定めた安全検証の義務（RUL-FRM-09）を適用する。脅威modelの確認、脆弱性の審査、依存と供給網の検査を実行し、結果と証拠を対象revisionへ結び、未分類のlicenseや未解消の重大な指摘を承認要求へ回す。

- 例 `RB04-201`：PRはlint・format・型・unit・integration・coverage閾値・SAST/SCA・secret・license・buildの全検査が通るまでmergeできない設定にする。（`docs/governance/ai-dev-team-operations_v1.1.md` 645-669行）
- 例 `RD11-107`：security checklist検査は、statusをpresentとしたevidenceが未完了表現を含むか具体的locatorを持たない場合に違反にする。（`src/lint/version-up-readiness.ts` 1810-1815行）
- 例 `RB08-009`：設計者は脅威モデルを版管理された設計成果物として保存し、pair-freeze前にPLANのreview_evidenceから参照する。（`docs/skills/threat-model.md` 78-90行）

#### `RUL-OSA-08`（OS）　32／20件

時間・費用・性能を計測して予算で管理する。CIの時間上限、後続実行による旧実行の取消、実行時間の推定の鮮度、不安定なtestと性能の退行の検出、統計の母集団、審査の証拠の有効期間。

- 例 `RC03-068`：historical migration review検証処理は、現在時刻がreviewed_atより前、またはexpires_at以後である場合、受理を拒否する。（`src/policy/historical-vpair-migration-authority.ts` 222-230行）
- 例 `RC04-131`：AI判断提案検証器は、quality・latency・cost・queue・failure・fallback_rate・misjudgment・human_override・driftの測定項目が揃わなければ拒否する。（`src/workflow/ai-decision-proposal.ts` 9-19行）
- 例 `RC04-164`：UT履歴投影器は、同じoracleにpassedとfailedが混在する場合、flake警告を記録する。（`src/workflow/contracts.ts` 254-259行）

### OS改善

#### `RUL-OSI-01`（OS）　111／97件

失敗、指摘、feedback、Issueの蓄積を、出どころを保ったまま改善候補へ還流する。feedbackの受付・分類・確認・解決を区別し、未確認の指摘を消さない。

- 例 `RB0-101`：管理側はgate漏れ・admission欠落・監査所見・運用再発をIssue化してS0-S4で収束し、採用時は正規VモデルへScrum Reverseする。（`docs/governance/management-scrum-product-forward.md` 12-14行）
- 例 `RD02-159`：学習feedback判定器は、review_stateがunreviewedの場合に採用をdeferする。（`src/runtime/legacy-adoption.ts` 530-530行）
- 例 `RB0-041`：外部化telemetryのwarningを受けた者は、外部化するか意図的に固定するかを明示してtriageし、放置しない。（`docs/governance/coding-rules.md` 133-134行）

#### `RUL-OSI-02`（OS）　37／17件

skill、知識、判断の基準を版で管理し、agentとcommandの定義が現行の版を参照していることを確かめる。

- 例 `RC00-042`：skill衛生検査は、呼出実績があり受入率が1未満の改善候補をallowed=falseとし、変更前後の評価と検証済みfailureまたはPO指示を要求する。（`src/runtime/skill-memory-hygiene.ts` 84-96行）
- 例 `RC00-039`：skill効果検証は、regression指定または評価差分が負なら隔離候補として警告し、昇格を許可しない。（`src/runtime/skill-efficacy-evaluation.ts` 61-78行）
- 例 `RB05-230`：template candidateはdraftのままactive Gateへ束縛せず、shadow sample不足ならauditへ進めず、既存oracle退行時はrollbackする。（`docs/governance/infinity-loop-system-assertion-cases.md` 262-264行）

#### `RUL-OSI-03`（OS）　27／32件

driftの検出、振り返り、訓練を定期に運転し、未割当の資産や規則の乖離を工程へ戻す。

- 例 `RD10-202`：telemetry closure lintは所定の9計測要求について、有効なstatusを持つ表行が欠ける場合に失敗させる。（`src/lint/telemetry-closure.ts` 45-55行）
- 例 `RC04-149`：command catalog生成器は、文書のcommandがCLI surfaceに無ければ警告する。（`src/workflow/contracts-extras.ts` 257-275行）
- 例 `RB04-286`：安定後はTL主導でharnessを改善し、QA主導で知識を整備し、incident訓練と定例retroを継続する。（`docs/governance/ai-dev-team-concept_v1.1.md` 705-717行）

### 企画・探索

#### `RUL-PLN-01`（HARNESS）　5／7件

企画と探索の仮説を検証する。市場や利用者の仮説、機会の比較、利用者調査、探索活動の検証計画と成立条件を示す。

- 例 `RB06-192`：カタログ設計者は成果物の要否をharness自身のCLI形状ではなく、他製品を開発する土台のmissionで判断する。（`docs/governance/document-system-map.md` 83-83行）
- 例 `RD09-117`：proposal-document-coverageは、discoveryを期待するシナリオでhypothesisがrequired_evidenceにない場合、失敗させる。（`src/lint/proposal-document-coverage-policy.ts` 63-63行）
- 例 `RA-267`：marketing scoutは市場claimを証拠で裏付け、不確実性を明示し、各仮説に最小検証stepとdecision criteriaを付ける。（`.claude/agents/pdm-marketing-innovation.md` 15-16行）

### サービス⑦運用保守

#### `RUL-OPS-01`（HARNESS／OS）　26／12件

運用と障害対応を定める。重大度と対応期限、初動と封じ込めと復旧、運用手順書の必須内容、アクセス権と認証情報の最小権限・短期保持・失効、秘密が漏れたときの失効と影響調査、事業継続と復元。

- 例 `RB04-219`：封じ込め担当者は機能故障をflag無効化、特定ユーザー影響を対象制限、deploy起因をrollback、攻撃疑いをWAF等、secret漏洩を全関連credential rotationで処置する。（`docs/governance/ai-dev-team-operations_v1.1.md` 869-877行）
- 例 `RB04-254`：運用担当者はDAST・WAF/IDS/IPS・監査logと異常検知を整備し、incident手順を定期訓練する。（`docs/governance/ai-dev-team-concept_v1.1.md` 253-261行）
- 例 `RB08-049`：runbook作成者はtrigger・影響・期待出力付き手順・検証・人間へ判断を渡す停止点を記載する。（`docs/skills/documentation.md` 68-74行）

#### `RUL-OPS-02`（HARNESS／OS）　11／1件

体制の立上げと変化を定める。参加者の受入れと権限付与、退場時の失効と引継ぎ、当番と監視の導入条件、成熟度に応じた統制の段階導入、採用の順序、保険と規制。

- 例 `RB04-266`：監視toolはaccess増加時にAPM、本番URL保有時に稼働監視、24時間体制が必要な時にon-callを追加する。（`docs/governance/ai-dev-team-concept_v1.1.md` 372-378行）
- 例 `RB04-283`：運用が安定したらcoverage計測/gate・AI review・CodeQLを段階追加し、本番運用開始時にerror追跡を導入する。（`docs/governance/ai-dev-team-concept_v1.1.md` 679-691行）
- 例 `RE01-160`：旧Phase 0Bの受入者は認証・管理権限・scopeとteam matrixの確認を含む追加条件、および全14項目とpre-pushの成功を確認してから完了とする。（`docs/governance/helix-harness-requirements_v1.2.md` 2475-2509行）

## 旧実装に固有とした規則（34件）

特定の旧Issue番号、旧PLAN番号、旧fileの件数上限、旧tableの個別仕様だけを述べ、一般化しても上の要求の意味に寄与しない規則である。台帳では`requirement_primary: LEGACY-ONLY`で引け、各行の`legacy_only_reason`に除外理由を持つ。要求にはしないが、削除もしない。

| atom | 規則 | 除外理由 |
|---|---|---|
| `RB03-002` | 本inventoryのエントリ数は、設定された最大件数951件を超えてはならない。 | 特定inventoryの件数を旧上限951件と比較するだけで、上限の根拠や一般的な予算管理の義務を定めていない。 |
| `RB06-295` | CODEOWNERS検査はteam数がゼロより多く三未満の場合にerrorとする。 | 所有team数の特定範囲だけを拒否する旧数値条件であり、ownerの単一性や権限の妥当性を検証する意味は示されていない。 |
| `RC01-073` | right-arm-gate-planningは、改善backlogにIMP-052がない場合、不合格にする。 | 特定の旧改善IDがbacklogに存在することだけを要求し、改善の受付や処分に関する一般条件を示していない。 |
| `RC01-086` | placeholder-depsは、対象文書がdedicated placeholder_deps doctor rule is implemented系の正規表現に一致する場合、不合格にする。実装の正規表現はnotまたは未の有無を問わない。 | 旧文書の特定英文patternを肯定・否定の区別なく拒否する検査であり、実装状態の意味を判定していない。 |
| `RC03-058` | historical V-pair移行分類処理は、候補reasonが「PLAN verification binding absent」と完全一致しない場合、admissionを拒否する。 | 移行候補のreasonを旧固定文字列と完全一致で照合するだけで、受入れに必要な実質的条件を検証していない。 |
| `RD00-041` | slot管理は、SubagentStop用の処理でagent_guard由来の実行中かつ未releaseのslotから有効時刻が最古の1件だけをcompletedにする。 | 識別子のない旧停止eventを最古のslotへ近似対応させる救済仕様であり、対象を正確に特定して解放する一般条件は保持していない。 |
| `RD00-348` | CLI-R00 supporting context検証は、CLI pathがsrc/cli.tsでない場合、拒否する。 | CLIのpathを旧単一fileへ固定するだけで、改名や分割後も残すべき契約を示していない。 |
| `RD00-356` | CLI-R00 artifact検証は、behavior contract IDがCLI-R00-THROUGHPUT-BASELINE-001でない場合、失敗する。 | behavior contract IDを特定の旧IDと照合するだけで、契約の内容や一般的な束縛条件を検査していない。 |
| `RD00-357` | CLI-R00 artifact検証は、Issue IDが1687でない場合、失敗する。 | Issue番号1687との一致だけを検査する旧成果物専用条件である。 |
| `RD00-359` | CLI-R00 artifact検証は、slice IDがCLI-R00でない場合、失敗する。 | slice IDを旧CLI-R00へ固定するだけで、一般的な作業境界の条件を示していない。 |
| `RD01-181` | 回帰shard生成処理は、bulk shard数が3以外なら失敗する。 | 回帰shard数を3に固定するだけで、並列上限の根拠や分割の妥当性を検証していない。 |
| `RD01-190` | 回帰shard検証は、shard ID集合がbulk-1・bulk-2・bulk-3・statefulと一致しなければ失敗する。 | 旧4shardの名前集合との一致だけを検査し、状態隔離や網羅性の条件を示していない。 |
| `RD06-086` | doc-consistency lintは、L6セットアップ設計でconsumer doctor以降に「11 行」の記載がない場合、不足として返す。 | 旧診断出力の行数を示す固定文言の存在だけを検査し、診断内容や網羅性を確認していない。 |
| `RD06-095` | doc-consistency lintは、setup実装にtargetTag: "v0.1.4"の記載がない場合、不足として返す。 | setup実装に旧targetTagの固定値が書かれていることだけを検査し、現行targetの導出や妥当性を確認していない。 |
| `RD07-004` | frontend-design-coverageは、document-system-mapに§1cマーカーがなければ失敗する。 | 旧文書の節markerの存在だけを検査し、画面設計の成果物やcoverageの内容を確認していない。 |
| `RD07-059` | 証拠コマンド検査は、evidence_pathが.vitest.logで終わらなければ違反とする。 | 証拠pathの旧拡張子との一致だけを検査し、証拠の実在・内容・対象との対応を確認していない。 |
| `RD08-089` | semantic consumer lintは、ledgerのissue_idが865でない場合、失敗させる。 | ledgerのIssue番号を旧865へ固定するだけの検査である。 |
| `RD08-090` | semantic consumer lintは、ledgerのparent_planがPLAN-L7-729-legacy-orchestration-new-use-freezeでない場合、失敗させる。 | ledgerの親作業単位を特定の旧PLANへ固定するだけの検査である。 |
| `RD08-114` | semantic consumer revision検査は、issue_idが865でない場合、失敗させる。 | revision検査でIssue番号を旧865と照合するだけで、対象revisionとの実質的な対応を検査していない。 |
| `RD08-115` | semantic consumer revision検査は、parent_planがPLAN-L7-865-legacy-orchestration-semantic-consumer-ledgerでない場合、失敗させる。 | revision検査で親作業単位を特定の旧PLANへ固定するだけの条件である。 |
| `RD08-168` | objective evidence auditは、必須marker groupのいずれかの文字列が監査本文にない場合、失敗させる。 | 過去の日付・HEAD・承認件数の固定markerを要求する旧snapshot専用検査であり、現在の証拠の正しさを判定しない。 |
| `RD08-193` | objective evidence auditは、外部source ledger各列に固定期待値が含まれない場合、失敗させる。 | 外部source ledgerに過去の観測値・版・採否文の固定値を要求するだけで、再調査後の判断にも適用できる条件がない。 |
| `RD10-136` | frontier整合lintはL3文書にconfirmed 51件をconfirmed_currentへ写像する固定記述がなければ失敗させる。 | 過去のconfirmed件数と旧分類名を結ぶ固定記述だけを要求し、現行の分類条件や分母を検証していない。 |
| `RD11-009` | triage lintは、catalog.doneのID集合が固定された3件と一致しない場合に違反にする。 | 完了済みID集合を旧3件へ固定するだけで、完了条件や新しい成果の検証を定めていない。 |
| `RD11-011` | triage lintは、固定done項目のcatalog statusがdoneでない場合に違反にする。 | 旧固定3項目の状態をdoneへ固定するだけで、完了を裏付ける条件を確認していない。 |
| `RD11-013` | triage lintは、system-test-designのstatusがtodoでない場合に違反にする。 | 特定の旧設計項目をtodoのままに固定する過去状態の検査であり、状態遷移の条件を定めていない。 |
| `RD11-016` | triage lintは、verified_idsが固定14件と重複なく一致しない場合に違反にする。 | 検証済みID集合を過去の14件へ固定する検査であり、重複検査もその固定snapshotの一致確認に閉じている。 |
| `RD11-017` | triage lintは、固定verified集合の各backlog statusがverifiedでない場合に違反にする。 | 旧固定集合の状態をverifiedへ固定するだけで、検証済みと判断する証拠条件がない。 |
| `RD11-019` | triage lintは、IMP-118のbacklog statusがtriagedでない場合に違反にする。 | 特定の旧改善IDの状態をtriagedへ固定するだけで、分類・確認・解決の一般条件を示していない。 |
| `RD11-029` | triage lintは、固定列挙10件の各backlog statusがimplementedでない場合に違反にする。 | 過去に列挙した固定10項目の状態をimplementedへ固定するだけで、実装を確認する条件がない。 |
| `RD11-083` | version-up lintは、discovery PLANにactivation note (2026-06-30)がない場合に違反にする。 | 特定の旧探索PLANに過去日付付きmarkerを要求するだけで、有効化の判断内容や承認条件を確認していない。 |
| `RD11-199` | terminal fullback監査は、証拠のissueNumberが694でない場合に失敗させる。 | 証拠のIssue番号を旧694へ固定するだけの専用検査であり、一般的な証拠の対象束縛条件を示していない。 |
| `RG10-016` | Issue #592の文書化PR担当者は、変更対象をdocs/governance/github-operation-rules.mdとCLAUDE.mdだけに限定する。 | 旧Issue #592の文書化PRに限った変更対象の限定。一般化すると「PRの変更範囲を限定する」だが、それはRUL-DEV-01（無関係な整理を混ぜない）で既に被覆され、この行自体は旧Issue固有の指定だけである |
| `RG13-005` | 完全性チェックはKimiのPreToolUse hook登録を再追記する場合、timeoutを10に設定する。 | 旧Kimi拡張のhook登録に固有のtimeout値（10）の指定。一般化しても特定値の再追記手順だけで、要求の意味に寄与しない |

## 既存の作業との関係

- Issue #1864（旧HELIXのAIレーン設定の引き継ぎ）の11項目は、本書の`RUL-OSA-01`／`03`／`04`、`RUL-OSM-01`／`03`／`06`、`RUL-OSP-02`／`03`／`04`、`RUL-FRM-04`に含まれる。
- `RUL-OSM-03`は現行OS L2の「有期限通知とmemoryの責務」と同じ向きである。memoryは、標準memoryもharness memoryも、判断や要求を書き溜める場所ではない。持つのは期限のある通知と正本へのpointerだけである。
- `RUL-OSM-01`が人間の介入点の定義を所有し、`RUL-OSP-04`はそれを参照して適用する。両者は採否順序の`L2D-S1-01`（authority語彙）の適用と接続する。
- `RUL-FRM-09`（安全検証の義務と基準）は`HARNESS-L1-004`の「根拠・安全検証はHARNESS、外部実行はOS」に対応し、`RUL-OSA-07`がその適用側である。
- `RUL-OSA-03`は、修正後の再審査を一巡に限る一方、新しい独立blockerが実証された場合の再審査を認める。`RUL-OSA-04`で統合を止めるのはblockerだけであり、処分済みの任意改善は止めない。
- `RUL-COR-08`（要約・表示・引き継ぎの意味保持）は、当初「旧実装に固有」に落ちていた要約系の規則を再判定して立てた。人間の判断が要る事項を限定し、それ以外をAIが自走することが、開発に詳しくない人でも使えるという目的の前提である。
- システム群ごとのIssue（#1852〜#1861）へ、対応する要求を入力として渡す。

## 現在の停止条件

- 本候補の記載で、L2の合意や人間承認を成立させない。
- 旧hook、旧lint、旧doctor、旧CI、旧runtimeを実行も復活もしない。
- 本候補から、現行のAGENTS.md、CLAUDE.md、hook、設定を直接書き換えない。L3以降の実装を開始しない。
