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

本書は、旧HELIXのルールの対象fileを全件読ませて7113件の規則（atom）にし、それを57本の要求候補へ束ねたものである。旧hook、旧script、旧test、旧runtimeは1つも実行していない。旧実装は引き継がず、意味だけを引き継ぐ。

本書は要求の候補であり、採用・承認・完了を生成しない。現行のAGENTS.md、CLAUDE.md、hook、設定を書き換えない。

## 洗い出した範囲と方法

対象は `archive/legacy-generation-2026-09-14/root/` 配下の次の範囲である。test（`*.test.*`、`tests/`）、`docs/plans/`、`docs/design/`、要求文書（別に分類済み）は対象外とした。

| 系統 | 対象 | atom数 |
|---|---|---:|
| AI向けの指示 | `AGENTS.md`、`CLAUDE.md`、`.claude/`（CLAUDE.md、agents、commands、hooks、settings）、`.codex/`、`.helix/`の定義 | 370 |
| 運用の文書 | `docs/governance/`直下、`docs/skills/`、`config/`のうち規則を含む文書 | 1951 |
| 機械による強制 | `src/runtime`、`src/lint`、`src/doctor`、`src/policy`、`src/team`、`src/gate`、`src/guardrail`、`src/security`、`src/orchestration`、`src/workflow`、`config/`、`.github/` | 4269 |
| 再点検で追加（E／F／G系列） | 未読の残り、標本で漏れが見つかった系統、全fileの二巡目 | 523 |
| 計 | 533 file | 7113 |

対象file全632件の内訳は次のとおりである。この表と[出どころfile一覧](../legacy-rule-atom-source-files.jsonl)で、どのfileを読んで何を得たかを機械で照合できる。

| fileの状態 | 件数 |
|---|---:|
| atomを1件以上抽出した | 533 |
| 読んだが規則は無かった（申告） | 100 |
| いずれの申告も無い | 0 |

二巡目（全fileの再点検）は49分割中18分割（195 file）が完了し、残り312 file は一巡目の抽出だけである。

手順は次のとおりである。

1. 抽出：GPT-6 Astra（codex CLI、read-only）が対象を分割して全文を読み、「〜しなければならない／してはならない／〜を拒否する」という規則1つを1 atomとして、出どころのpathと行範囲付きで出力した。読み切れなかったfileは再分割して読ませた。その後、Astraの指摘で抽出漏れが見つかったため、対象file全件を「抽出済みatomに無い規則だけを出す」二巡目にかけ、さらにatomを足した。二巡目で出典が実在しない・行範囲が外れるatomは機械で捨てた。
2. 検証：全atomの出どころについて、pathの実在と行範囲がfileの行数に収まることを機械で確かめた（欠落0、逸脱0、IDの重複0）。AI向けの指示の系統から無作為に8件を取り、原文と突き合わせて一致を確かめた。
3. 対応づけ：要求の枠を起草し、Astraが各atomを主の要求1つと副の要求最大2つへ対応づけた。どの枠にも入らないatomは無理に入れず「不足」として出させ、そこから要求を11本追加した。最後まで残った22件は内容を読んで手で割り当てた（台帳の`mapped_by: claude_review`）。再点検で追加したatomの対応づけはClaude Opusが行った（`mapped_by: claude-opus`）。
4. 出どころの固定：atomが参照する全fileのSHA-256を[出どころfile一覧](../legacy-rule-atom-source-files.jsonl)に記録した。全atomは[規則atom台帳](../legacy-rule-atom-inventory.jsonl)にある。
5. 再判定：「旧実装に固有」とした140件を、旧名称と保持すべき意味を分けて読み直し、一般化すれば要求に寄与するものは要求へ戻した（残り36件は個別の除外理由を台帳の`legacy_only_reason`に持つ）。安全に関する69件は、義務・判定基準の定義（HARNESS、`RUL-FRM-09`）と適用・実行（OS、`RUL-OSA-07`）へ分けた。

## 確かめたことと、まだ確かめられていないこと

確かめたこと。

- 対象file全件について、atomを得たか、規則が無いと申告されたかが記録されていること（上の表）。
- 全atomの出どころのpathと行範囲が実在すること。
- 全7113件が、57本の要求または「旧実装に固有」のいずれかに対応づいていること（未対応0）。

まだ確かめられていないこと。

- 抽出の全件性。1つのmodel系統が読んで申告した結果である。二巡目の標本（24 file）では一巡目の取りこぼしが約2割あり、二巡目後も取りこぼしは残りうる。「全件洗い出した」ではなく「対象file全件を二度読ませた」と読む。
- 対応づけの正しさ。無作為に22件を読んだところ、明らかに別の要求が適切なものが2件あった。全体でも1割前後の置き違いがあると見込む。要求の文には影響しないが、要求ごとの件数は概数として読む。
- 「旧実装に固有」とした36件は再判定済みだが、その除外理由の妥当性は個別にreviewされていない。
- 本書の要求と、既存のL2・既存の要求候補（新世代CI、AI可読文書、旧資産退役、Scaffold等）との重複と包含。後続で関係を付ける。
- `RUL-COR-04`の1310件は、個々の入力検査の条件である。L2の要求としては1本で足り、個々の条件はL3以降の検査定義の入力として扱う。

## 集計

| 規則の種類 | 件数 |
|---|---:|
| 工程gate | 2053 |
| 証拠と主張 | 1772 |
| runtimeとtool | 770 |
| 安全 | 579 |
| reviewとmerge | 434 |
| 権限とescalate | 398 |
| memoryと継続 | 375 |
| レーンと委譲 | 359 |
| 行動規律 | 314 |
| 文書と言語 | 59 |

| 強制の手段（重複あり） | 件数 |
|---|---:|
| gate | 2389 |
| prose | 2188 |
| lint | 1885 |
| config | 325 |
| ci | 321 |
| doctor | 307 |
| hook | 278 |

文だけで定められ機械の強制が無い規則（`prose`のみ）は1861件である。

## 要求候補

各要求の件数は、主として対応づいたatomの数／副として対応づいたatomの数である。例は台帳から機械的に選んだ3件で、出どころへ辿れる。

### 枠

#### `RUL-FRM-01`（HARNESS）　288／214件

工程の順序とV-pairを守る。上流が未確定のまま下流へ進まず、対になる設計と検証を双方向traceで閉じてから次の層へ進む。

- 例 `RB07-162`：上流検証者は一意なFRとplaceholderでない対応機能仕様を確認し、設計・単体テスト設計の存在とscenario IDの実テスト対応を確認する。（`docs/skills/verification.md` 66-75行）
- 例 `RB04-131`：pair-freeze検査はdesign/test-designの双方向参照と孤児ゼロを確認し、pair_artifact:selfのmockは孤児扱いしない。（`docs/governance/helix-harness-concept_v3.1.md` 1191-1192行）
- 例 `RC02-157`：doctorのright-arm-gate-planning checkは、右腕gate計画検査が不合格、またはcarry文書読込不能の場合に失敗する。（`src/doctor/index.ts` 6560-6573行）

#### `RUL-FRM-02`（HARNESS）　228／260件

工程の開始・凍結・差戻し・再開・完了の条件と、人間が承認する層とAIが進める層の分担を定める。

- 例 `RB04-137`：検証cycleはdraftゼロ・pair孤児ゼロ・confirmed一件以上のfreeze完了で発火し、park済みplaceholderは妨げず、検証roadmapをForwardのdriverにしない。（`docs/governance/helix-harness-concept_v3.1.md` 1194-1201行）
- 例 `RC01-030`：gate-confirmは、confirmedの設計・テスト設計文書について、対応gateが台帳に存在しPASSでない場合、不合格にする。対応gateが台帳にない文書はこの検査では飛ばす。（`src/lint/gate-confirm.ts` 101-111行）
- 例 `RD10-062`：工程表はgate直前のspanが0件、または対応PLANの一つでもconfirmed／completedでない場合、そのgateを未到達とする。（`src/lint/roadmap-registry.ts` 87-103行）

#### `RUL-FRM-03`（HARNESS）　210／134件

変更の種類（新規、追加、修正、refactor、retrofit、reverse、PoC、research）ごとに進む経路を一つに決め、途中で意味の変更を検出したら正しい経路へ戻す。

- 例 `RC04-192`：D-CONTRACT検証器は、next参照に循環があれば失敗する。（`src/workflow/routing-contracts.ts` 310-318行）
- 例 `RC04-233`：workflow guide生成器は、指定されたdevelopment_style・case_driven_model・subrouteが対応axisのregistryに無ければ失敗する。（`src/workflow/workflow-guide.ts` 252-279行）
- 例 `RD10-097`：S4 lintはpivot判断のroute_impactがpivotに言及していなければ失敗させる。（`src/lint/s4-decision-readiness.ts` 506-511行）

#### `RUL-FRM-04`（HARNESS）　587／547件

完了・進捗・安全の主張は、固定した分母と、裏付けるtest・command・証拠の参照で示す。検査のgreenや文書の存在を内容の正しさの代わりにしない。

- 例 `RD06-203`：fr-roadmap-coverage lintは、closed項目のclosure証跡からtest参照パスを抽出できない場合、失敗させる。（`src/lint/fr-roadmap-coverage.ts` 131-136行）
- 例 `RC02-112`：doctorのtelemetry-closure checkは、telemetry closure検査が不合格、対象0件、またはmatrix読込不能の場合に失敗する。（`src/doctor/index.ts` 5044-5063行）
- 例 `RB06-206`：成熟度報告者は要件確定・設計pair・runtime実装・実行検証・運用観測を独立に表示し、上流状態から下流状態を導出しない。（`docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md` 168-179行）

#### `RUL-FRM-05`（HARNESS）　155／95件

検証の作り方を定める。test先行、境界値、正常系と異常系、仕込んだ欠陥を検出できる証拠、fixtureの隔離。

- 例 `RD06-047`：design-reality-binding lintは、identity_post_check以外でexecutable_oracle方式・一致する期待reason・RED_BY_ORACLE・実装内のmutation対象・実行テスト参照等の条件が揃わない場合、失敗させる。実行テストパス指定時にoracle IDまたはhelperが空の場合も拒否する。（`src/lint/design-reality-binding.ts` 764-786行）
- 例 `RA-348`：QAはtest比率をUnit60%以上・Integration25%以下・E2E10%以下・Manual5%以下を目安として設計する。（`.claude/agents/qa-test.md` 31-37行）
- 例 `RD00-093`：延期義務の照合は、escaped defectが1件以上、またはmutation検出率が1未満の場合、安全性退行として失敗判定にする。（`src/runtime/ci-deferred-obligation-recovery.ts` 340-350行）

#### `RUL-FRM-06`（HARNESS）　131／115件

設計の書き方を定める。component間の契約（事前条件・事後条件・不変条件）、依存の方向と強さ、ownerの単一性、用語集との同期。

- 例 `RD10-199`：telemetry closure lintはautomation ownerが空または空白だけなら失敗させる。（`src/lint/telemetry-closure.ts` 138-154行）
- 例 `RA-005`：code-reviewerはレビュー表現をHELIX用語と整合させる。（`.claude/agents/code-reviewer.md` 110-114行）
- 例 `RE01-036`：設計者は変更がなくても用語集差分の節を設け、新語を追加した場合は正本用語集へ戻して反映する。（`docs/governance/helix-harness-requirements_v1.2.md` 583-587行）

#### `RUL-FRM-07`（HARNESS）　40／15件

文書の言語と可読性を定める。人間向けの文は日本語、主語を明示、1文1主張、文字化けや不正な文字を検査する。

- 例 `RB08-067`：freeze担当者は文字化けがなく、目的が5文以下で、Scope/Non-goalsが存在し、裸のTODOにPLAN参照があることを確認する。（`docs/skills/documentation-and-adrs.md` 58-64行）
- 例 `RB08-050`：破壊的command変更の担当者は旧説明を黙って置換せず、Migration節に移行注記を追加する。（`docs/skills/documentation.md` 82-83行）
- 例 `RD05-130`：completion-decision-packetは、yamlLinesJaの本文に日本語文字がない場合、失敗させる。（`src/lint/completion-decision-packet.ts` 1161-1166行）

#### `RUL-FRM-08`（HARNESS）　29／12件

要求の書き方を定める。機能要求の必須属性と受入条件、非機能要求の分類と等級、優先度、識別子の欠番の扱い、原子化しても利用者価値を失わないこと、画面設計で作る成果物。

- 例 `RB04-061`：非機能要求作成者はIPAの6大項目に準拠し、全NFR-IDへIPA分類とISO 25010特性を付け、対象外特性の除外理由を記録する。（`docs/governance/helix-harness-concept_v3.1.md` 568-568行）
- 例 `RG08-001`：console設計者は、コントラスト基準をWCAG 2.1 AAとし、具体値をHigh-Fi層（canonical L11）で確定する。（`config/ui-domain/harness-console-bundle.json` 97-99行）
- 例 `RD06-176`：FR registry監査lintは、登録済み最大番号までの1始まり連番に欠番があり、carry・forwardによる説明もない場合、未説明欠番として返す。（`src/lint/fr-registry-audit.ts` 178-185行）

#### `RUL-FRM-09`（HARNESS）　26／1件

安全検証の義務と判定基準を定める。脅威modelを適用する工程と時期、脆弱性の重大度を実害への経路から決める基準、攻撃を試みた記録の要件、依存・供給網・licenseについて確認すべき事項。実行と証拠の管理はOSが担う（RUL-OSA-07）。

- 例 `RA-174`：security-auditはexploit経路のfile・行・再現条件からseverityを決め、実害につながる所見だけをCritical・Highにし、高リスク順で返す。（`.claude/agents/security-audit.md` 23-26行）
- 例 `RB08-001`：設計者はagent向けsurfaceの脅威モデルを、実装開始前のL2・L3で適用する。（`docs/skills/threat-model.md` 21-24行）
- 例 `RB07-073`：テスト作成者は依存先の遅延・停止・異常値・部分成功を想定し、エラー表示の情報漏洩と次行動の明確さも検査する。（`docs/skills/test-thinking.md` 58-61行）

### サービス④開発

#### `RUL-DEV-01`（HARNESS）　91／110件

実装の規律を定める。失敗を握りつぶさない、循環依存を作らない、修正は最小にして無関係な整理を混ぜない。

- 例 `RA-282`：エージェントは既存の命名・構造・test配置に合わせる。（`AGENTS.md` 149-149行）
- 例 `RB07-290`：関数bodyが推奨30行を超える場合、実装者はnamed helperを抽出し、新概念なら設計へ記録する。（`docs/skills/incremental-implementation.md` 74-75行）
- 例 `RG03-007`：実装者は、ADR-001のTypeScript strict方針を維持する。（`AGENTS.md` 95-95行）

#### `RUL-DEV-02`（HARNESS）　94／55件

役割別（API、業務logic、DB、画面、deploy）の製品実装の標準と、各役割が返す成果の形式を定める。

- 例 `RA-328`：DB担当はPKをUUIDまたはBIGSERIALとし、id・created_at・updated_atを必須にしてdeleted_atで論理削除を表す。（`.claude/agents/db-schema.md` 27-30行）
- 例 `RB07-046`：consoleのCLI copy patternは事前生成コマンド文字列をclipboardへ書き、一時的なコピー完了feedbackを表示する。（`config/ui-domain/harness-console-bundle.json` 61-68行）
- 例 `RD10-064`：lintはL7工程表にdatabase、service、frontend、uiの必須feature pack層が欠ける場合に失敗させる。（`src/lint/roadmap-registry.ts` 113-118行）

#### `RUL-DEV-03`（HARNESS）　13／3件

追加する前に、不要にできないか、再利用できないか、代替案は無いかを確かめる。複雑さが増える変更は根拠と撤去条件を示す。

- 例 `RB0-131`：提案者は採用案に最低一つの対案とtrade-off比較を付ける。（`docs/skills/judgment-core.md` 58-59行）
- 例 `RD05-219`：ddd-tdd-rulesは、add_codeまたはjustified_positiveを選んだPLANでcomplexity_justificationまたはremoval_triggerに実質的な値がない場合、違反にする。（`src/lint/ddd-tdd-rules.ts` 584-596行）
- 例 `RC01-177`：runtime-portabilityは、許可wrapperが空行・コメント以外で12行を超える、src/cli.ts参照がない、またはdist/helix参照がない場合、不合格にする。（`src/lint/runtime-portability.ts` 160-165行）

### 部品：リサーチ

#### `RUL-RSH-01`（HARNESS）　133／42件

外部の技術・OSS・SaaS・事例を調べて採否する手順を定める。成熟度、依存risk、代替案、反対意見を示し、そのまま導入せずHELIXの境界へ変換する。

- 例 `RD10-191`：verification source metadata検証はsourceUrl、latestOfficialStatus、sourceStatusDelta、adoptionDecision、adoptionDecisionDelta、workflowRouteImpactの各値が欠落またはplaceholderなら違反を返す。（`src/lint/source-ledger-freshness.ts` 98-112行）
- 例 `RE01-241`：外部実装の採用者はbehavior atomを抽出して採否を判断し、Grok等の実装を直接importしない。provider比較は共通契約・固定rubric・blind benchmarkで行い、重大な失敗を平均値で相殺しない。（`docs/governance/helix-harness-requirements_v1.3.md` 434-439行）
- 例 `RB08-097`：技術調査担当者はS1で既存ADRとの重複を確認し、S2で候補別証拠を集め、S3で推薦と要求・運用制約の対応を確認する。（`docs/skills/tech-selection.md` 69-76行）

### フルリバース

#### `RUL-REV-01`（HARNESS）　91／54件

既存の成果物を観測し、契約と設計へ写し、仮説を人間が確認してから通常の工程へ合流させる。上流の文面をそのまま採用せず、未接続の実装は部分的と分類する。

- 例 `RB08-071`：Reverse文書担当者はR2を観測された現状、R3をmoduleと要求の対応、R4をscope・受入・検証付き要求更新として書き、backfill文書もtrace-freeze前に可読性確認する。（`docs/skills/documentation-and-adrs.md` 79-83行）
- 例 `RB07-181`：担当者は上流文面をそのまま採用せずHELIX契約へ変換し、実装・testがない直接実装や未接続runtimeをpartialと分類する。（`docs/governance/helix-adoption-design-completion-audit-2026-06-30.md` 24-31行）
- 例 `RG10-005`：POはapproval_policyがpo_intentの場合、Reverse R3で復元した意図を確認する。（`docs/governance/drive-route-catalog.md` 70-70行）

### サービス⑥リリース

#### `RUL-REL-01`（HARNESS）　70／42件

配布・公開・本番反映の条件を定める。公開先の制限、環境ごとの承認者、自己承認の禁止、復旧先の特定。

- 例 `RB07-336`：data migrationなしのForward deployはrollingまたはdirect replace後すぐsmokeを行い、flag付き機能はflag-offでdeployして検証後に有効化する。（`docs/skills/ci-deploy-and-rollback.md` 48-54行）
- 例 `RD09-124`：proposal-document-coverageは、ops-release-migrationを期待するシナリオでops-release-migration-reviewがrequired_gatesにない場合、失敗させる。（`src/lint/proposal-document-coverage-policy.ts` 72-72行）
- 例 `RB08-182`：Incident担当者はproduction障害・回帰・hotfixを入口とし、本番変更前にon-call・TL・PMの承認を記録する。（`docs/skills/incident-runbook.md` 45-49行）

### コア

#### `RUL-COR-01`（HARNESS／OS）　142／187件

正本を一つに保つ。要求や設計の意味は正本からだけ読み、DB・projection・生成物・会話を第二の正本にしない。作業者は状態DBへ直接書かない。

- 例 `RB0-002`：要求対象を整理する者は製品責務決定を確認し、旧Conceptの対象混在記述を優先してはならない。（`docs/governance/README.md` 8-9行）
- 例 `RD09-150`：relation impact分析は、design catalog nodeがあるのにcatalogs edgeが1件未満の場合、missing-projection errorで失敗させる。（`src/lint/relation-graph.ts` 624-645行）
- 例 `RB05-227`：Requirement Translatorはcustody済み入力だけを処理し、atomとtyped mappingを提案として生成してactive正本を直接変更しない。（`docs/governance/infinity-loop-system-assertion-cases.md` 251-252行）

#### `RUL-COR-02`（HARNESS／OS）　413／338件

成果物と判断を対象revisionとdigestへ束縛し、対象が変わったら古い結果をstaleにする。digestの計算方法を版で固定する。

- 例 `RC00-246`：project hook authority解決器は、実行rootとloaderの物理identity不一致、session authority時のsession root不一致、またはroot digest不一致があれば失敗する。（`src/runtime/project-hook-authority.ts` 206-217行）
- 例 `RD05-017`：branch-kindは、working treeを含める検査で実branchがdetached HEADでも指定branchでもない場合、失敗させる。（`src/lint/branch-kind.ts` 539-545行）
- 例 `RD08-092`：semantic consumer lintは、形式が正しいledger.source_headでも固定LEDGER_SOURCE_HEADと異なる場合、失敗させる。（`src/lint/legacy-orchestration-semantic-consumers.ts` 87-87行）

#### `RUL-COR-03`（OS）　250／91件

状態の更新は、中断・再試行・担当の交代があっても、二重に実行されず、古い作業者の結果が新しい状態を上書きしない。同じ操作を繰り返しても結果が変わらない。実現の方式はL3以降で選ぶ。

- 例 `RD03-238`：Windows canary queue評価は、activeまたはwaitingの既存lease bindingに不正なものがある場合、不確実状態として拒否する。（`src/runtime/windows-lite-canary-admission.ts` 269-278行）
- 例 `RC04-062`：durable storeは、副作用へ渡されたstateが永続化済みstateと異なれば拒否する。（`src/orchestration/loop-store.ts` 292-296行）
- 例 `RB06-154`：Canonical化は全write setをcommitまたはrollbackし、fault後も部分currentをゼロにする。（`docs/governance/infinity-loop-assertion-coverage-ledger.md` 120-120行）

#### `RUL-COR-04`（OS）　1310／843件

入力・設定・schema・pathを検証し、不正・未知・検証不能はfail-closeで拒否する。fail-openにする箇所は意図を明示する。

- 例 `RD02-064`：中立receipt生成器は、障害観測より前に発行されたleaseを拒否する。（`src/runtime/independent-review-fallback.ts` 1575-1581行）
- 例 `RD06-108`：document-agent-metadata lintは、manifestのinclude root・exclude root・対象文書パスが空、先頭スラッシュ、バックスラッシュ、空・ドット・親移動segmentを含む場合、失敗させる。（`src/lint/document-agent-metadata.ts` 19-25行）
- 例 `RD03-236`：Windows canary lease binding検証は、expires_atがissued_at以下の場合、拒否する。（`src/runtime/windows-lite-canary-admission.ts` 245-247行）

#### `RUL-COR-05`（OS）　50／48件

toolchainと依存を固定し、clean環境とofflineで再現できるようにする。lockのずれ、部品表の欠落を失敗にする。

- 例 `RC04-278`：bubblewrap導入処理は、codenameがnoble以外なら失敗する。（`.github/scripts/install-bubblewrap.sh` 17-21行）
- 例 `RE01-098`：外部tool導入者は公式の信頼できる配布元とintegrityを確認し、登録・probeを満たしたtoolだけを実行する。（`docs/governance/helix-harness-requirements_v1.2.md` 1386-1402行）
- 例 `RC01-175`：runtime-portabilityは、srcまたは.claude/hooks配下にpy・sh・bash・js・mjs・cjsのruntimeファイルがある場合、不合格にする。（`src/lint/runtime-portability.ts` 28-28行）

#### `RUL-COR-06`（OS）　36／9件

作業者の実行環境を隔離する。通信は既定で拒否、最小権限、読取専用の領域、子processの回収、ホストの露出制限、対応OSの互換、外部入力に混入した命令を実行しない。

- 例 `RD02-258`：provider lifecycle制御器は、親process終了時にprovider process groupへSIGKILLを送る。（`src/runtime/provider-process-lifecycle.ts` 293-305行）
- 例 `RD02-205`：machine safety guardは、Docker volumeでhost rootを指定するpattern、または--mountのsource=/で始まるpatternをblockする。（`src/runtime/machine-safety-guard.ts` 303-308行）
- 例 `RE01-189`：command検証器はshell operator、command substitution、絶対パスの実行ファイルをcommand tokenとして拒否する。（`docs/governance/helix-harness-requirements_v1.3.md` 177-183行）

#### `RUL-COR-07`（HARNESS／OS）　17／11件

成果物と判断に恒久の識別子を持たせ、改名・移動・分割・統合をしても義務と意味と履歴を保存する。指示の原文は来歴付きで追記のみで保全し、設計判断の後継と廃止を管理する。

- 例 `RG18-018`：変更担当者はpublic CLI flagまたは.helix/のfieldをrenameする際、callerと設計文書を更新せずに進めてはならない。（`docs/skills/refactoring.md` 97-98行）
- 例 `RD06-018`：design-coverage lintは、itemのsourceがzip-に2桁または3桁の数字を続ける形式でない場合、失敗させる。（`src/lint/design-coverage.ts` 281-286行）
- 例 `RB06-150`：内部renameはstable oracle IDを維持する。（`docs/governance/infinity-loop-assertion-coverage-ledger.md` 108-108行）

#### `RUL-COR-08`（HARNESS／OS）　40／8件

要約・表示・引き継ぎ・提示するcommandは、元の意味を落とさない。要約は工程、現在位置、適用中のskillや判断の根拠を保持し、提示するcommandや値は正規の導出結果と一致する。正規の検証経路を、別の手軽な手段で代替しない。

- 例 `RB08-091`：検証担当者はnpm run testとBiome checkを使い、native runner直実行やbiome lint単体で正規検証を代替しない。（`docs/skills/gate-planning.md` 83-85行）
- 例 `RD06-090`：doc-consistency lintは、L6セットアップ設計にdecision-packetとversion-up、またはpacket preflightとversion-upを直接並べる所定の旧記述が残る場合、review-bundle欠落の旧記述として返す。（`src/lint/doc-consistency.ts` 195-204行）
- 例 `RD03-107`：summary surface監査は、project-frontierにworkflow_identity.target_axisが存在しない場合、semantic driftと判定する。（`src/runtime/summary-surface-audit.ts` 137-141行）

### チケット

#### `RUL-TKT-01`（OS）　54／36件

作業単位（旧PLAN）のidentityを一意にし、重複を作らず既存の延長を優先する。置き換えは後継と訂正を双方向に記録し、黙って上書きしない。

- 例 `RD03-033`：active PLAN更新は、canonical ID選択が不正と判定された場合、markerを書き換えない。commitから推定したIDが拒否された場合はwarning出力先があれば警告する。（`src/runtime/session-log.ts` 244-248行）
- 例 `RD09-085`：plan-supersessionは、supersedes先PLANのsuperseded_byに宣言元のexact plan_idがない場合、失敗させる。（`src/lint/plan-supersession.ts` 110-121行）
- 例 `RC03-002`：active PLAN選択処理は、要求IDがcanonical PLAN ID集合に完全一致しない場合、選択を拒否する。前方一致の候補は選択成立として扱わない。（`src/policy/active-plan-selection.ts` 21-27行）

#### `RUL-TKT-02`（OS）　131／149件

作業を始める前に、作業graph、依存、並列と直列、scope、予算、作業者へ渡すcontextの境界を確定する。境界の無い作業者を起動しない。

- 例 `RD02-129`：階層監査器は、open・activeのtaskまたはfindingで、子がなく、全blockerがclosedで、当該Issueにfindingがない場合だけready leafへ選出する。（`src/runtime/issue-hierarchy.ts` 1160-1172行）
- 例 `RB08-026`：見積担当者は選択したdevelopment styleのslice境界と正規V-pairを含めて採点し、Scrumを品質工程省略として減算しない。（`docs/skills/estimation.md` 62-63行）
- 例 `RD02-102`：階層・依存整合監査器は、双方のblocks集合が異なる場合に失敗とする。（`src/runtime/issue-hierarchy.ts` 652-660行）

#### `RUL-TKT-03`（OS）　77／114件

差戻し、持ち越し、後続Issueへの分離を記録し、検証の失敗を差戻しへ接続する。

- 例 `RD11-198`：terminal fullback監査は、依存Issue #204・#635・#188の状態がopenでない、または欠落している場合に失敗させる。（`src/lint/workflow-classification-terminal-fullback.ts` 134-134行）
- 例 `RD08-038`：left-arm carry lintは、凍結legacy例外以外の終端L7 impl/add-impl PLANにleft_arm_carry判断がない場合、失敗させる。（`src/lint/left-arm-carry-log.ts` 162-179行）
- 例 `RB07-209`：担当者は今直せないhardcodeを黙って残さず、debtとして起票して返済条件を書く。（`docs/skills/code-minimalism.md` 100-101行）

### OS管理

#### `RUL-OSM-01`（OS）　260／170件

人間の判断が必要な事項を限定して列挙し、その定義を所有する（目的と範囲の変更、要求の削除と縮小、安全の緩和、機微な領域、取り消せない操作、公開、license、要求の矛盾、権限が不明な場合など）。該当する事項は判断資料を作り、対象と範囲へ束縛した承認が出るまで実行しない。暫定の判断は期限と確定条件を持つ。

- 例 `RD11-057`：MCP inspectionは、allowExternalが真でない場合にrefusedを返す。（`src/lint/verification-profile.ts` 315-325行）
- 例 `RB06-231`：closure applyは承認scope digestとlimit・offsetを同じreview windowへ束縛し、承認前はread-only bundle・plan・表示に限定する。（`docs/governance/helix-objective-evidence-audit.md` 108-108行）
- 例 `RB09-072`：U-NIO-003の検証は、未承認の自動修復をREDにする。（`docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md` 27-27行）

#### `RUL-OSM-02`（OS）　111／108件

役割・agent・hook・adapterの登録と版を管理し、runtime間（Claude、Codex等）でguardと規則が乖離したら検出して止める。

- 例 `RC02-116`：doctorのcodex-hook-trust checkは、hook trust読込処理のokがfalseの場合に失敗する。（`src/doctor/index.ts` 5131-5134行）
- 例 `RG16-008`：agent定義者は、frontmatterのnameを空白なしのkebab-caseとし、filenameに一致させる。（`docs/skills/agent-design.md` 33-37行）
- 例 `RC01-056`：codex-hook-adapterは、SessionStartの対象commandにtimeoutが90秒以上の設定がない場合、不合格にする。（`src/lint/codex-hook-adapter.ts` 230-239行）

#### `RUL-OSM-03`（OS）　68／47件

memoryと引き継ぎを正本にしない。使う前に正本・履歴・診断と照合し、期限と保持を管理し、providerの記憶を混入させない。

- 例 `RD01-051`：continuation優先順位処理は、memoryが欠落している場合、DB情報を採用してfindingを返す。（`src/runtime/continuation.ts` 1239-1239行）
- 例 `RG10-023`：memory移管担当者は人間の申し送りを受けるtakeover layerにone-shot consumed lifecycleを設ける。（`docs/governance/handover-retirement-memory-audit-2026-07-11.md` 116-116行）
- 例 `RB0-159`：reviewerはsessionがruntime境界を越える場合、continuation projectionのactive PLANとnext actionをauthored sourceと照合する。（`docs/skills/adversarial-review.md` 90-91行）

#### `RUL-OSM-04`（OS）　82／45件

秘密・個人情報・認証情報を、文書・規則・例・log・証跡・AIへの入力に出さない。検出したら記録の前に拒否する。

- 例 `RD03-019`：secret egress hookは、指定の外部送信commandとcredential候補環境変数の参照が同じcommandに含まれる場合、broker外の送出として拒否する。（`src/runtime/secret-egress-hook.ts` 215-225行）
- 例 `RA-051`：security担当は秘密情報をログへ出力せず、mask処理を行う。（`.claude/agents/security-audit.md` 57-57行）
- 例 `RB08-006`：作業者は資格情報禁止対象のpathに触れるPLANをacceptする前にhelix guardrailを実行する。（`docs/skills/threat-model.md` 68-70行）

#### `RUL-OSM-05`（OS）　77／24件

破壊的な操作（履歴の書換え、強制push、一括削除、上書き）を既定で拒否する。例外は理由付き・一回限りとし、監査に残す。

- 例 `RG16-012`：guard迂回を行う担当者は、診断済みの緊急事態の場合だけHELIX_ALLOW_RAW_AGENT=1を使用する。（`docs/skills/agent-design.md` 68-70行）
- 例 `RG03-012`：git-command-guardは、破壊的Git操作のoverride markerをone-shotで消費した際、その記録をaudit logに残す。（`CLAUDE.md` 225-228行）
- 例 `RD02-190`：machine safety guardは、再帰flag付きrmをblockする。（`src/runtime/machine-safety-guard.ts` 249-259行）

#### `RUL-OSM-06`（OS）　52／34件

他の作業者や他runtimeの作業中の変更を保護する。未commitの変更や他者のcommitを、明示の指示なしに戻したり上書きしたりしない。

- 例 `RD04-033`：work guardは、未コミット対象に現セッションのtouch証拠が無く、bypassも無い場合に編集を拒否する。（`src/runtime/work-guard.ts` 71-91行）
- 例 `RA-084`：Claude設定はEdit・Write・MultiEditの直前にwork-guardをtimeout 30秒、blockOnFailure=trueで呼ぶ。（`.claude/settings.json` 17-28行）
- 例 `RD01-236`：Git command guardは、checkoutの作成・orphan・detach指定を除き、force、path区切り、対象欠落、または対象がrefだけと確認できない場合に拒否する。（`src/runtime/git-command-guard.ts` 302-311行）

#### `RUL-OSM-07`（OS）　241／183件

旧資産の退役と切替を管理する。旧の参照を0にしてから退出し、旧の成果や旧の識別子を現行の根拠へ再昇格させない。

- 例 `RB07-109`：担当者はBunをcurrent・target・fallback・rollback・test authorityに使わず、旧Bun surfaceを挙動観測に限定する。（`docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md` 22-23行）
- 例 `RA-066`：エージェントはlegacy commandやlegacy Python moduleをcurrentの実行通路として追加・説明しない。（`AGENTS.md` 211-211行）
- 例 `RD08-075`：semantic consumer lintは、自身を除くsrc/ファイルで、指定旧実行関数をconst・let・varの別名へ代入する記述を検出した場合、失敗させる。（`src/lint/legacy-orchestration-semantic-consumers.ts` 279-290行）

#### `RUL-OSM-08`（OS）　76／82件

GitHubを共有・作業・証拠の投影として使う。Issue、PR、templateの形式とownerの単一性を定め、GitHubの状態から要求や承認を作らない。

- 例 `RB04-177`：commit作成者はConventional Commits形式と指定typeを使い、AI生成commitにも同じ規約を適用する。（`docs/governance/ai-dev-team-operations_v1.1.md` 224-249行）
- 例 `RE01-156`：GitHub運用者は動的にCODEOWNERSを書き換えてroleを割り当てず、comment・label・review requestを使用する。（`docs/governance/helix-harness-requirements_v1.2.md` 2310-2325行）
- 例 `RE01-169`：要求管理者はIssueやPRの存在・closeから要求の意味や採否を追加・削除せず、DBでrepository上の正本とJSON契約を上書きしない。（`docs/governance/helix-harness-requirements_v1.3.md` 38-40行）

#### `RUL-OSM-09`（OS）　29／8件

repositoryの運用規約を定める。commit文面の形式、統合後のbranchの廃棄、命名、追跡する生成物の範囲、設定の置き場の集約、個人設定と共有規則の分離、文書から環境固有のpathを除く。

- 例 `RB04-161`：作業者はmainを常にデプロイ可能に保ち、壊れた場合は他作業を止めてでも最優先で修正する。（`docs/governance/ai-dev-team-operations_v1.1.md` 85-91行）
- 例 `RB07-227`：旧Git運用では複数行commit messageをBash heredocで渡し、PowerShell here-stringを使わない。（`docs/skills/git.md` 49-57行）
- 例 `RE01-072`：旧solo運用では規定のGit運用要件を例外扱いにできるが、team運用では必須とする。（`docs/governance/helix-harness-requirements_v1.2.md` 1187-1187行）

### OS推進

#### `RUL-OSP-01`（OS）　70／53件

レーンと役割（技術lead、実装、QA、調査、審査）の責務と、各役割が返す成果の形式を定める。役割の不在時の代行を定める。

- 例 `RB04-218`：P0/P1では発見者が状況・影響・時刻を投稿し、AI実装・保守が初動、QAが指揮、TLが技術対応、発注元が必要な顧客判断を行う。（`docs/governance/ai-dev-team-operations_v1.1.md` 853-867行）
- 例 `RB04-223`：通常相談は技術・仕様を#dev、品質を#qa、securityを#securityへ送り、それぞれTL・発注元・QA・TL/QAへ接続する。（`docs/governance/ai-dev-team-operations_v1.1.md` 933-942行）
- 例 `RB05-160`：musterはlayer・drive・task kind・verification patternから二段解決でworkerとverifierを決定し、同じ入力から同じteamとprojectionを再現する。（`docs/governance/infinity-loop-system-assertion-cases.md` 343-343行）

#### `RUL-OSP-02`（OS）　63／49件

作業の性質に応じてmodel・provider・推論の深さを割り当て、結果に応じて調整する。能力が足りない実行環境には割り当てず、上位modelの使用は許可を要する。

- 例 `RG16-002`：委譲者は、ADR作成、gate review、設計判断をprimary session modelへ割り当てる。（`docs/skills/agent-cost-design.md` 32-36行）
- 例 `RB06-059`：提案されたeffort可観測性では、未知modelのfallback使用時にwarningとeffort_source=fallbackのDB記録を残す。（`docs/governance/rule-enforcement-gap-audit-2026-08-12.md` 85-90行）
- 例 `RD09-132`：proposal-document-coverageは、routing文書にL7・L8・L9・L12・L14・LLM wording・coverage floorの必須markerがいずれか欠ける場合、失敗させる。（`src/lint/proposal-document-coverage-policy.ts` 80-88行）

#### `RUL-OSP-03`（OS）　151／118件

委譲には目的・出力形式・tool方針・境界を必ず付ける。許可された役割とmodelの組合せだけを起動し、検証できない状態では起動しない。

- 例 `RD09-115`：proposal-document-coverageは、agent-orchestrationを期待するシナリオでruntime_routingがrequired_evidenceにない場合、失敗させる。（`src/lint/proposal-document-coverage-policy.ts` 62-62行）
- 例 `RA-083`：Claude設定はAgent・Taskの直前にagent-guardをtimeout 5秒、blockOnFailure=trueで呼ぶ。（`.claude/settings.json` 4-16行）
- 例 `RD00-034`：agent guardは、要求modelからhaiku・sonnet・opus・fableのfamilyを一意に抽出できない場合、拒否する。allowRaw有効時は警告付きで許可する。（`src/runtime/agent-guard.ts` 63-71行）

#### `RUL-OSP-04`（OS）　22／19件

AIは、RUL-OSM-01が定める人間の介入点に当たらない作業を自走する。人間へ質問する前に、AI側で解決できる情報が残っていないかを確かめ、質問するときは判断に必要な材料を揃える。介入点の定義そのものは持たず、RUL-OSM-01を参照する。

- 例 `RD02-134`：質問gateは、preference質問にbypass理由がない場合に拒否する。（`src/runtime/legacy-adoption.ts` 285-288行）
- 例 `RB04-171`：質問者は事前にAGENTS.md/RUNBOOK.mdを確認し、実施内容・期待・結果・試行を記し、errorはテキスト、コードはcode blockで示す。（`docs/governance/ai-dev-team-operations_v1.1.md` 153-161行）
- 例 `RD05-041`：completion-decision-packetは、autonomousWorkBlockersが人間判断とworkflow状態以外のblockerをsortした列に一致しない場合、失敗させる。（`src/lint/completion-decision-packet.ts` 246-250行）

#### `RUL-OSP-05`（OS）　36／29件

作業者の行動規律を定める。失敗の出力を全部読む、根因を確定してから直す、推測で進めない、他の正本と矛盾したら止まる。

- 例 `RB04-206`：Flaky testは原因調査と再現確認を行い、再実行や無視で済ませない。（`docs/governance/ai-dev-team-operations_v1.1.md` 707-707行）
- 例 `RB07-252`：監査者は検索結果をそのまま修正件数にせず、4区分に分類してregistryとの意味差分を記録してから対象化する。（`docs/governance/route-classification-surface-inventory-2026-08-15.md` 109-110行）
- 例 `RA-094`：Claudeはnative tool-useだけを使い、XML風pseudo tool callを表示・修復・継続せず、native toolが使えない場合だけ人間向けcommandを示す。（`CLAUDE.md` 178-180行）

#### `RUL-OSP-06`（OS）　69／34件

複数agentの実行計画を検証する。並列の上限、直列化の依存、実行modeを確かめ、不整合な計画を実行しない。

- 例 `RF01-021`：チーム起動推薦器は、hybrid modeでproposal lane指定がなく、risk語に一致せず難易度がtrivialまたはsimpleの場合、チーム起動を推薦しない。（`src/team/launch-policy.ts` 214-261行）
- 例 `RD03-048`：dispatch admissionは、候補と実行中taskが同じbehavior contract IDを持つ場合、競合として拒否する。（`src/runtime/slot-scheduler-quota-handover.ts` 351-353行）
- 例 `RC02-147`：consumer doctorのconsumer-team-run-surface checkは、team schema不合格、nameがdefault-hybrid以外、Codex seまたはpmo/Claude tl・qa不足、hybrid実行計画不合格、dry-runでない、または両provider不足の場合に失敗する。（`src/doctor/index.ts` 6241-6266行）

#### `RUL-OSP-07`（OS）　36／5件

自律実行の停止条件と上限を定める。反復回数、実行時間、予算、変更量、進捗の停滞、利用枠の枯渇、再試行の上限で止め、段階的に停止して再開できるようにする。

- 例 `RF00-011`：予算判定器は、違反がある場合、overrunPolicyがversion_targetならkindをversion_target、escalateならblocker、それ以外ならstopにする。（`src/orchestration/loop-effort-budget.ts` 174-201行）
- 例 `RD04-126`：isolation実行器は、子processの出力bufferを8MiB、実行時間を10分に制限する。（`src/runtime/worker-isolation-broker.ts` 764-771行）
- 例 `RF00-010`：予算判定器は、使用量のoverrideが有限の非負数なら優先し、それ以外はbudget内の有限の非負数を使う。両方が不適合の場合は、反復数と費用をstateから、ツール呼出数と経過時間を0から補う。（`src/orchestration/loop-effort-budget.ts` 80-110行）

#### `RUL-OSP-08`（OS）　24／4件

作業に応じてskillと参照資料を選び、読み込む量を制限する。skillの起動条件、手順の厳密さ、検証loop、重複の排除を設計する。

- 例 `RB07-099`：複雑タスクのskillは3〜5個の小問題へ分解して順に解かせ、判定系では起草から独立した検証質問への回答で結論を照合する。（`docs/skills/skill-authoring.md` 65-69行）
- 例 `RB08-175`：skill管理者は通常sessionの半分未満にしか適用しないskillをstatic read orderから外し、動的にloadする。（`docs/skills/context-engineering.md` 78-82行）
- 例 `RA-010`：エージェントはmigration資料を通常startupで読まず、移行・gap監査・退行源調査が必要な場合だけ読む。（`AGENTS.md` 88-89行）

### OS検収

#### `RUL-OSA-01`（OS）　103／80件

作成と検証を分ける。別の作業者・別のsession・可能なら別のmodel系統で審査し、審査者は編集しない。同じproviderで検証した場合は理由を残す。

- 例 `RD01-291`：mixed authorshipのadmissionは、全有効receiptがmixed用で、所定runtime数と各reviewerの被覆が揃わなければ拒否する。（`src/runtime/github-cross-review-admission.ts` 654-675行）
- 例 `RD02-005`：admission検証器は、独立検証者がClaudeでない場合、または判定がadmitでない場合に拒否する。（`src/runtime/independent-review-fallback.ts` 187-201行）
- 例 `RD04-022`：親受入判定器は、受入評価者のidentity・session・context digestのいずれかがworkerまたはreviewerと一致する場合に拒否する。（`src/runtime/work-graph-receipt-acceptance.ts` 263-269行）

#### `RUL-OSA-02`（OS）　70／46件

審査の観点と報告の形式を定める。重大度の順、正しさ・可読性・構造・安全・性能の各観点、根拠となるfileと行、好みをblockerにしない。

- 例 `RB07-278`：品質reviewerは変更moduleの設計・test設計とPLAN traceを確認し、Refactor・Retrofitでは根拠なしassertion減少、設計節削除、suppression増加がないことを検査する。（`docs/skills/code-review-and-quality.md` 74-86行）
- 例 `RC04-111`：pair-agentは、smart_review出力にVERDICTマーカーが無ければerrorにする。（`src/orchestration/pair-agent.ts` 546-549行）
- 例 `RA-170`：code-reviewerは変更意図・影響範囲を確認し、testの有無と妥当性を先に評価してから横断reviewする。（`.claude/agents/code-reviewer.md` 59-64行）

#### `RUL-OSA-03`（OS）　34／37件

指摘の処分を定める。同じ責務で局所的に閉じるものは今の変更で直し、独立の責務だけ後続へ分ける。blockerは同じ対象について一括で返す。修正後の再判定は、新しい独立のblockerが実証されない限り一巡とし、実証された場合は再審査する。審査後に対象が変われば審査をstaleにする。

- 例 `RB08-229`：review担当者は現在契約blockerでない改善findingを後続Issueへ送り、現在PRを循環させない。（`docs/governance/drive-route-catalog.md` 85-85行）
- 例 `RB06-133`：監査担当者はfinding dispositionに証拠付き非終端receiptとappeal routeを残す。（`docs/governance/infinity-loop-assertion-coverage-ledger.md` 77-77行）
- 例 `RB04-205`：既存bugが顕在化した場合は別Issue・別PRで修正し、今回のPRへ含めない。（`docs/governance/ai-dev-team-operations_v1.1.md` 706-706行）

#### `RUL-OSA-04`（OS）　87／56件

統合の許可を定める。自動mergeを使わず、審査側が最新の対象・審査・CI・記録を照合して明示的に統合する。統合を妨げるのは未解消のblocker（正しさ、要求、安全、必須の検査に関わる指摘）であり、処分済みの任意改善と後続へ分けた事項は妨げない。

- 例 `RD02-068`：中立receipt検証器は、CI結論がsuccessでない証跡を拒否する。（`src/runtime/independent-review-fallback.ts` 1657-1662行）
- 例 `RB08-310`：review対応者は#519完了まで親#489をcloseせず、#514完了だけで別blockerを持つPR #506をReady/mergeせず、吸収済みPR #518をmergeしない。（`docs/governance/issue-514-cross-review-admission-symmetry-closure.md` 45-51行）
- 例 `RB0-019`：reviewerはtarget経路の型検査・lint・テスト・doctorがgreenになる前に承認してはならず、旧Bunのgreenで代替しない。（`docs/governance/coding-rules.md` 6-8行）

#### `RUL-OSA-05`（OS）　138／82件

CIの構成を定める。必須checkの集約、変更の種類ごとのfail-close、PR時と定期実行の監査範囲、検査の無効化やskipで違反を隠さない。

- 例 `RB04-200`：CIはcoverageが下がるPRを拒否し、全員合意なしのcoverage閾値引下げを禁止する。（`docs/governance/ai-dev-team-operations_v1.1.md` 643-643行）
- 例 `RB05-031`：PR Gateは機能変更にdocs・code・testsの三点一致を要求し、codeだけ、codeとtestsだけ、codeとdocsだけの変更をブロックする。（`docs/governance/audit-framework.md` 330-340行）
- 例 `RB0-100`：PR admissionはclosure graphのfocusから接続する依存componentを監査し、scheduled/手動runは全採用Issueを監査する。main pushでは全件監査を行わない。（`docs/governance/github-issue-hierarchy-rules.md` 69-73行）

#### `RUL-OSA-06`（OS）　210／806件

機械検査（診断、lint、gate）の各checkが何を不合格にするかを定義し、規則と検査の対応を保つ。

- 例 `RD02-136`：detector routerは、登録axisまたはそのworkflow routeがないfindingをunknown_axisとして処理経路へ流さない。（`src/runtime/legacy-adoption.ts` 306-313行）
- 例 `RA-363`：Refactor候補検出はliteral反復6回・長さ12以上、policy閾値5・最大branch40と、stage等の登録policy語彙を使う。（`.helix/config/requirements-binding.yaml` 10-27行）
- 例 `RD11-113`：activation phase検査は、指定された各phaseの出現回数が1回でない場合に違反にする。（`src/lint/version-up-readiness.ts` 1914-1922行）

#### `RUL-OSA-07`（OS）　39／35件

HARNESSが定めた安全検証の義務（RUL-FRM-09）を適用する。脅威modelの確認、脆弱性の審査、依存と供給網の検査を実行し、結果と証拠を対象revisionへ結び、未分類のlicenseや未解消の重大な指摘を承認要求へ回す。

- 例 `RC00-035`：taxonomy審査は、license riskがunknownまたはhighなら不合格とする。（`src/runtime/harness-taxonomy-curation-policy.ts` 70-76行）
- 例 `RB08-003`：設計者は未回答の脅威質問をopen threatとしてL3設計書に記録し、pair-freeze前に緩和PLANへリンクする。（`docs/skills/threat-model.md` 62-62行）
- 例 `RB04-251`：commit時はpre-commitでsecretを検出し、GPG/SSH署名を必須とし、credential関連fileをgitignoreへ登録する。（`docs/governance/ai-dev-team-concept_v1.1.md` 223-229行）

#### `RUL-OSA-08`（OS）　22／8件

時間・費用・性能を計測して予算で管理する。CIの時間上限、後続実行による旧実行の取消、実行時間の推定の鮮度、不安定なtestと性能の退行の検出、統計の母集団、審査の証拠の有効期間。

- 例 `RD11-096`：version-up lintは、外部境界を持つPLANのcost_guardrailsにPages・Workers・D1・KVのlimitとexceed_actionが欠ける場合に違反にする。（`src/lint/version-up-readiness.ts` 517-524行）
- 例 `RC04-164`：UT履歴投影器は、同じoracleにpassedとfailedが混在する場合、flake警告を記録する。（`src/workflow/contracts.ts` 254-259行）
- 例 `RD00-070`：CI schedulerは、cache状態がunknown、flake率が0.1超、またはvarianceがp95超の場合、品質上の保守的fallback理由を記録する。（`src/runtime/ci-critical-path-scheduler.ts` 298-305行）

### OS改善

#### `RUL-OSI-01`（OS）　101／93件

失敗、指摘、feedback、Issueの蓄積を、出どころを保ったまま改善候補へ還流する。feedbackの受付・分類・確認・解決を区別し、未確認の指摘を消さない。

- 例 `RC02-004`：doctorのuniversal-improvement-source-registry checkは、登録読込処理のokがfalseの場合に失敗し、その診断を返す。（`src/doctor/universal-improvement-source-registry-check.ts` 7-12行）
- 例 `RB04-078`：運用検証失敗では観点不足を次サイクルの要求/要件feedbackとし、重大NFR逸脱をIncidentまたは要求見直しへ接続する。（`docs/governance/helix-harness-concept_v3.1.md` 657-657行）
- 例 `RB05-118`：設計管理者はtemplateを要求系統とservice系統へ結び、表現不能な要求をTemplate Gap Issueとして改善loopへ戻す。（`docs/governance/infinity-loop-source-capability-ledger.md` 71-72行）

#### `RUL-OSI-02`（OS）　32／14件

skill、知識、判断の基準を版で管理し、agentとcommandの定義が現行の版を参照していることを確かめる。

- 例 `RB06-117`：template改善はshadow評価、独立監査、migration、rollback、role分離を満たすまでcandidateをactive化しない。（`docs/governance/infinity-loop-assertion-coverage-ledger.md` 112-112行）
- 例 `RC00-040`：skill効果検証は、証拠が揃っていても評価差分が正でなければ昇格を許可しない。（`src/runtime/skill-efficacy-evaluation.ts` 61-65行）
- 例 `RC00-042`：skill衛生検査は、呼出実績があり受入率が1未満の改善候補をallowed=falseとし、変更前後の評価と検証済みfailureまたはPO指示を要求する。（`src/runtime/skill-memory-hygiene.ts` 84-96行）

#### `RUL-OSI-03`（OS）　27／26件

driftの検出、振り返り、訓練を定期に運転し、未割当の資産や規則の乖離を工程へ戻す。

- 例 `RD06-027`：design-coverage lintは、実在する設計文書がどのitemのartifactにもbaselineにも登録されていない場合、失敗させる。（`src/lint/design-coverage.ts` 360-380行）
- 例 `RD07-002`：frontend-design-coverageは、FE設計slugがdocument-system-map本文に記載されていなければ失敗する。（`src/lint/frontend-design-coverage.ts` 125-131行）
- 例 `RB09-029`：#1035の担当者は、NOW実装を2 project以上で実測したことを入口条件としてobservation／pattern promotionを進め、終端証拠としてcounterexample、mutation、human approvalを揃える。（`docs/governance/system-synthesis-rollout-roadmap.md` 9-19行）

### 企画・探索

#### `RUL-PLN-01`（HARNESS）　5／7件

企画と探索の仮説を検証する。市場や利用者の仮説、機会の比較、利用者調査、探索活動の検証計画と成立条件を示す。

- 例 `RD09-098`：proposal-document-coverageは、ux-research-usabilityを期待するシナリオでusability_test_planまたはux_findings_traceがrequired_evidenceにない場合、失敗させる。（`src/lint/proposal-document-coverage-policy.ts` 49-49行）
- 例 `RB06-192`：カタログ設計者は成果物の要否をharness自身のCLI形状ではなく、他製品を開発する土台のmissionで判断する。（`docs/governance/document-system-map.md` 83-83行）
- 例 `RA-311`：marketing scoutはtarget segment・pain・urgency・差別化・導入摩擦・検証costで市場optionを比較する。（`.claude/agents/pdm-marketing-innovation.md` 22-24行）

### サービス⑦運用保守

#### `RUL-OPS-01`（HARNESS／OS）　25／11件

運用と障害対応を定める。重大度と対応期限、初動と封じ込めと復旧、運用手順書の必須内容、アクセス権と認証情報の最小権限・短期保持・失効、秘密が漏れたときの失効と影響調査、事業継続と復元。

- 例 `RB07-231`：workflow変更をpushする担当者は一時的なworkflow権限credentialを使い、push後すぐ削除してconfigや環境変数へ永続化しない。（`docs/skills/git.md` 96-101行）
- 例 `RB04-215`：Dependabot対応者はCriticalを24時間以内、Highを1週間以内、Mediumを1か月以内、Lowを次のmajor更新時に対応する。（`docs/governance/ai-dev-team-operations_v1.1.md` 823-830行）
- 例 `RB04-167`：全員は認証情報を1Passwordへ集約し、チーム外への共有は必要時の管理された共有機能に限定し、不要な認証情報を速やかに無効化する。（`docs/governance/ai-dev-team-operations_v1.1.md` 121-121行）

#### `RUL-OPS-02`（HARNESS／OS）　11／1件

体制の立上げと変化を定める。参加者の受入れと権限付与、退場時の失効と引継ぎ、当番と監視の導入条件、成熟度に応じた統制の段階導入、採用の順序、保険と規制。

- 例 `RB04-283`：運用が安定したらcoverage計測/gate・AI review・CodeQLを段階追加し、本番運用開始時にerror追跡を導入する。（`docs/governance/ai-dev-team-concept_v1.1.md` 679-691行）
- 例 `RB04-285`：採用は技術mentor、TL、QA/AI実装・保守、UI/UXの順を指針とし、判断量・並列AI数・顧客向け本格化に応じて増員する。（`docs/governance/ai-dev-team-concept_v1.1.md` 701-701行）
- 例 `RB04-284`：採用担当者は採用前に責任・評価指標・報告先を確定し、規則と運用手順をonboarding資料として準備し、基盤を確認可能な状態で迎える。（`docs/governance/ai-dev-team-concept_v1.1.md` 693-703行）

## 旧実装に固有とした規則（36件）

特定の旧Issue番号、旧PLAN番号、旧fileの件数上限、旧tableの個別仕様だけを述べ、一般化しても上の要求の意味に寄与しない規則である。台帳では`requirement_primary: LEGACY-ONLY`で引け、各行の`legacy_only_reason`に除外理由を持つ。要求にはしないが、削除もしない。

| atom | 規則 | 除外理由 |
|---|---|---|
| `RB03-002` | 本inventoryのエントリ数は、設定された最大件数951件を超えてはならない。 | 特定inventoryの件数を旧上限951件と比較するだけで、上限の根拠や一般的な予算管理の義務を定めていない。 |
| `RB06-295` | CODEOWNERS検査はteam数がゼロより多く三未満の場合にerrorとする。 | 所有team数の特定範囲だけを拒否する旧数値条件であり、ownerの単一性や権限の妥当性を検証する意味は示されていない。 |
| `RC01-073` | right-arm-gate-planningは、改善backlogにIMP-052がない場合、不合格にする。 | 特定の旧改善IDがbacklogに存在することだけを要求し、改善の受付や処分に関する一般条件を示していない。 |
| `RC01-086` | placeholder-depsは、対象文書がdedicated placeholder_deps doctor rule is implemented系の正規表現に一致する場合、 | 旧文書の特定英文patternを肯定・否定の区別なく拒否する検査であり、実装状態の意味を判定していない。 |
| `RC03-058` | historical V-pair移行分類処理は、候補reasonが「PLAN verification binding absent」と完全一致しない場合、admissionを拒 | 移行候補のreasonを旧固定文字列と完全一致で照合するだけで、受入れに必要な実質的条件を検証していない。 |
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
| `RD08-090` | semantic consumer lintは、ledgerのparent_planがPLAN-L7-729-legacy-orchestration-new-use-freeze | ledgerの親作業単位を特定の旧PLANへ固定するだけの検査である。 |
| `RD08-114` | semantic consumer revision検査は、issue_idが865でない場合、失敗させる。 | revision検査でIssue番号を旧865と照合するだけで、対象revisionとの実質的な対応を検査していない。 |
| `RD08-115` | semantic consumer revision検査は、parent_planがPLAN-L7-865-legacy-orchestration-semantic-consum | revision検査で親作業単位を特定の旧PLANへ固定するだけの条件である。 |
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
| `RF00-012` | ループ実行器はtick内の停止判定でexists・noProgress・customのprobeを常にfalseとし、これらのprobeによる停止を発生させない。 |  |
| `RF00-027` | 旧fileLoopStoreは、runSideEffectが呼ばれた場合、stateとpurposeを使った認可や重複実行検査を行わず、渡されたeffectを直接実行する。 |  |
| `RG10-016` | Issue #592の文書化PR担当者は、変更対象をdocs/governance/github-operation-rules.mdとCLAUDE.mdだけに限定する。 |  |
| `RG13-005` | 完全性チェックはKimiのPreToolUse hook登録を再追記する場合、timeoutを10に設定する。 |  |

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
