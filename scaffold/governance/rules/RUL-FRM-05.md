---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-FRM-05
group: 枠
product: HARNESS
atoms_primary: 155
atoms_secondary: 95
issue_projection: #1858
---

# RUL-FRM-05（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

検証の作り方を定める。test先行、境界値、正常系と異常系、仕込んだ欠陥を検出できる証拠、fixtureの隔離。

## 主として対応づいた規則（155件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-060` | QA担当は本番データをtestに使わず、匿名化seedを使用する。 | safety_security | prose | .claude/agents/qa-test.md:55-58 |
| `RA-224` | /test実行者はRed→Green→Refactorで進め、正しい理由の失敗を確認してRed evidenceをcommitしてから最小実装を書く。 | process_gate | prose | .claude/commands/test.md:14-19 |
| `RA-225` | /test実行者はRefactor中もtestをgreenに保ち、typecheckとlintを実行する。 | process_gate | prose／lint | .claude/commands/test.md:19-19 |
| `RA-228` | refactor実行者は既存behaviorを守るtest網を確認し、coverageが薄ければ構造変更前にcharacterization testを追加してgreenにする。 | process_gate | prose | .claude/commands/code-simplify.md:15-16 |
| `RA-237` | CLI・hook変更者は該当する場合、Windows PowerShellとPOSIX通路をsmoke testする。 | process_gate | prose | AGENTS.md:344-344 |
| `RA-256` | QAはreal behaviorをassertするtestだけをcoverage根拠とし、complex objectへのtoBeTruthyなど弱いoracleを検証済と数えない。 | evidence_claim | prose | .claude/agents/qa-test.md:24-25; .claude/commands/test.md:21-22; .claude/commands/sdd-review.md:17-18 |
| `RA-257` | test実装者はunit under testをmockせず、integration pathにはreal harness stateを使う。 | evidence_claim | prose | .claude/commands/test.md:21-22 |
| `RA-348` | QAはtest比率をUnit60%以上・Integration25%以下・E2E10%以下・Manual5%以下を目安として設計する。 | behavior_discipline | prose | .claude/agents/qa-test.md:31-37 |
| `RA-349` | QAはstatement80%以上・branch70%以上・critical path100%のcoverageを目標にする。 | behavior_discipline | prose | .claude/agents/qa-test.md:39-42 |
| `RA-350` | QAは正常・異常・境界値をP0、回帰をP1、性能をP2としてtest caseを分類する。 | behavior_discipline | prose | .claude/agents/qa-test.md:44-53 |
| `RA-351` | QAはfactoryでtest dataを生成し、setup/teardownでtest間独立性を保証する。 | behavior_discipline | prose | .claude/agents/qa-test.md:55-57 |
| `RA-352` | QAは性能baselineと変更後を比較し、k6またはArtilleryで負荷検証してp95 200ms未満・p99 500ms未満を目標にする。 | behavior_discipline | prose | .claude/agents/qa-test.md:60-63 |
| `RA-360` | test作成者は書く前に壊れ方を最低3通り言語化し、全testが初回からgreenなら検出力を疑う。 | behavior_discipline | prose | .claude/commands/test.md:9-10 |
| `RB0-046` | TDD担当者は意図した欠陥を検出するRed、最小実装のGreen、同じoracleがgreenを保つRefactorの証拠で工程を閉じる。 | evidence_claim | prose | docs/governance/ddd-tdd-rules.md:23-24; docs/governance/ddd-tdd-rules.md:150-150 |
| `RB0-050` | tdd_red_required付きconfirmed PLANの作成者はred_atとgreen_atを記録し、red_at以下にgreen_atが先行しない順序を守る。 | evidence_claim | lint／doctor／ci | docs/governance/ddd-tdd-rules.md:47-50; docs/governance/ddd-tdd-rules.md:137-137 |
| `RB0-051` | テスト作成者は具体的なexpect/assert oracleを記述し、実行だけやtruthinessだけを検証済みと数えない。 | evidence_claim | prose／lint／doctor／ci | docs/governance/ddd-tdd-rules.md:51-54; docs/governance/ddd-tdd-rules.md:138-138; docs/skills/judgment-core.md:127-128 |
| `RB0-052` | 結合テスト設計者はIT-*行をGiven/When/Thenで記述し、placeholder行を確認可能件数へ算入しない。 | evidence_claim | lint／doctor／ci | docs/governance/ddd-tdd-rules.md:55-58; docs/governance/ddd-tdd-rules.md:139-139; docs/governance/ddd-tdd-rules.md:153-153 |
| `RB0-053` | 単体テスト設計者はU-*-NNN行に実質的な期待behaviorを書き、linkや引用だけで済ませない。 | evidence_claim | lint／doctor／ci | docs/governance/ddd-tdd-rules.md:59-62 |
| `RB0-054` | confirmed TDD PLANの作成者はseeded defectをfailまたはkillしたmutation証拠を、一意に解決できるlocator付きで記録する。未解決ID・placeholder・未実測記述は受理しない。 | evidence_claim | lint／doctor／ci | docs/governance/ddd-tdd-rules.md:63-66; docs/governance/ddd-tdd-rules.md:77-83; docs/governance/ddd-tdd-rules.md:140-140; docs/governance/ddd-tdd-rules.md:152-152 |
| `RB0-136` | agentは着手前に依頼の各文に対するtest・command・実測による検証手段を決める。 | evidence_claim | prose | docs/skills/judgment-core.md:75-76 |
| `RB0-161` | AC作成者は作成前に要求を外す状況を最低三通り言語化し、できない場合は着手可能としない。 | evidence_claim | prose | docs/skills/acceptance-criteria-thinking.md:38-39 |
| `RB0-162` | 検証者は全ACが一回でgreenになった場合、故意に欠陥を入れてredになるACがあるか確認する。 | evidence_claim | prose | docs/skills/acceptance-criteria-thinking.md:40-41; docs/skills/judgment-core.md:85-86 |
| `RB0-163` | AC作成者は主観語を観測可能な結果・数値・操作・状態遷移へ落とし、満たさないACを書き直す。 | evidence_claim | prose | docs/skills/acceptance-criteria-thinking.md:47-51 |
| `RB0-164` | AC作成者はGiven/When/Thenで条件を固定し、どのデータ・権限・状態から始めるかを明示する。 | evidence_claim | prose | docs/skills/acceptance-criteria-thinking.md:52-53 |
| `RB0-165` | AC作成者は一つのACを一つの判定にし、独立する複数結果を含むACを分割する。 | evidence_claim | prose | docs/skills/acceptance-criteria-thinking.md:54-55 |
| `RB0-166` | 探索テストで壊れ方を発見した者はACへ昇格し、回帰testをgeneratesのtest_codeへ登録する。 | process_gate | prose | docs/skills/acceptance-criteria-thinking.md:80-81 |
| `RB04-035` | 実装者は設計・テスト設計のpair freeze後、本体コードより先に単体テストを具体化し、TDD Redを固定する。 | process_gate | prose／gate | docs/governance/helix-harness-concept_v3.1.md:335-335; docs/governance/helix-harness-concept_v3.1.md:367-373 |
| `RB04-085` | QAは実装後に発見した追加観点をfrozen test designへ混ぜず、独立追加テスト設計または差分PLANへ記録してから対応テストコードを書く。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:727-731 |
| `RB04-090` | UX検証はFE・fullstack・agentでは常に実施し、BE/DBではUIを持つ場合に実施する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:784-792 |
| `RB04-099` | 追加実装者は既存テストを変更せず新規テストを追加し、merge前に既存テスト全PASSをCIで確認する。 | process_gate | prose／ci | docs/governance/helix-harness-concept_v3.1.md:874-875 |
| `RB04-123` | 検証者はDDD不変条件を単体oracleへ接続し、TDD RedがGreen以前である証拠を確認する。 | evidence_claim | lint | docs/governance/helix-harness-concept_v3.1.md:1127-1128 |
| `RB04-124` | テスト作成者は実行確認だけでなく具体的assertionを備え、truthiness-onlyを弱いoracleとして扱う。 | evidence_claim | lint | docs/governance/helix-harness-concept_v3.1.md:1129-1129 |
| `RB04-125` | 結合テスト設計者は各IT行を前提・操作・期待結果の粒度で記述する。 | process_gate | lint | docs/governance/helix-harness-concept_v3.1.md:1130-1130 |
| `RB04-130` | 検証種別はtriageで必要な場合だけopt-in発動し、常に一律の検証cascadeを強制しない。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:1173-1175 |
| `RB04-162` | 実装者は仕様・テスト・実装の順で進め、依頼者は毎回テスト併設をAIへ指示し、AGENTS.mdにも明記する。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:93-99 |
| `RB04-189` | テスト追加の指示例では、AIはparameterized testを使い、mockを外部API依存箇所に限定し、一つのtestを一観点に絞る。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:448-464; docs/governance/ai-dev-team-operations_v1.1.md:639-641 |
| `RB04-195` | test設計者は全コードの静的解析とunit 60〜70%・integration 20〜30%・E2E 5〜10%を基本比率目標とする。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:580-591 |
| `RB04-196` | test設計者はcritical path、回帰、異常系、境界値、正常系、性能の順で優先する。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:593-605 |
| `RB04-198` | coverage目標はcritical pathを80%以上、一般機能を50〜70%とし、UIはE2Eで代替し、設定・boilerplateは対象外とする。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:622-631 |
| `RB04-209` | 回帰testの作成者は関数名にIssue/PR番号、docstringに背景と期待を記載し、削除時は理由をPR説明へ書く。 | evidence_claim | prose | docs/governance/ai-dev-team-operations_v1.1.md:744-750 |
| `RB04-243` | 開発者は仕様・テスト・実装の順に進め、mainと短命branchのGitHub Flowを標準とする。 | process_gate | prose | docs/governance/ai-dev-team-concept_v1.1.md:63-69 |
| `RB05-008` | 実装担当はrequired_testsからテストを作成して失敗を確認し、実装・テスト通過・リファクタリングの順に進める。 | behavior_discipline | prose | docs/governance/audit-framework.md:222-225 |
| `RB05-025` | 例示されたテスト規則では、機能変更時にテストを追加し、重要機能には正常系と異常系を用意する。 | behavior_discipline | prose | docs/governance/audit-framework.md:312-313 |
| `RB05-133` | assertion設計者はscenario familyを刺激とoracleごとに分割し、一行に複数刺激を入れない。 | behavior_discipline | prose | docs/governance/infinity-loop-system-assertion-cases.md:18-19 |
| `RB05-209` | prototypeのstate fixtureが8種しかない場合はready化を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:187-187 |
| `RB05-211` | Design Refactorは外部化で挙動維持、共通化で全consumer互換、オブジェクト化でownerとstate境界、internal renameでstable oracleとrollbackを検証する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:191-194; docs/governance/infinity-loop-system-assertion-cases.md:328-331 |
| `RB05-219` | internal symbolをrenameしてもobject・oracle IDを維持し、oracleをprivate symbolだけへ束縛するedgeを拒否する。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:216-219; docs/governance/infinity-loop-system-assertion-cases.md:394-394 |
| `RB05-301` | fixtureはproducer・input digest・generator版またはtested atom・assertionへ結び、producer不明なら失敗させ、binaryでもbytesとconsumer assertionを追跡する。 | evidence_claim | gate | docs/governance/infinity-loop-source-atomization-contract.md:231-240 |
| `RB06-092` | assertion台帳管理者は要求ごとに独立した反証可能assertionを一行で結び、ID省略を使わず、事前条件・刺激・観測値・failure codeが揃った場合だけ設計coverageを認める。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:18-20 |
| `RB06-156` | example校正はrule・branch・riskに対するpositiveまたはnegativeの不足を拒否する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:123-123 |
| `RB06-211` | prototypeはnormal・cancel・failure・timeoutの各flowを備える。 | process_gate | config | config/requirement-discovery-event-schema.json:168-168 |
| `RB06-311` | pair-agent TDDはsmart_test_authorから開始し、light実装前にRedとoracle markerを作り、light agent単独でcloseしない。 | lane_delegation | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:113-113 |
| `RB07-027` | 検証者は各画面で空・1件・多量・長文・読込中・エラー・権限なし・部分欠損・オフラインまたは低速の9状態を確認する。 | behavior_discipline | prose | docs/skills/browser-testing-and-screen-verification.md:53-67 |
| `RB07-028` | 検証者は幅・拡大・言語・テーマとの組合せでは、長文と狭幅など破綻しやすい交差を優先する。 | behavior_discipline | prose | docs/skills/browser-testing-and-screen-verification.md:69-70 |
| `RB07-031` | 検証者は操作要素のaccessible name、見出し順序、keyboard focus、動的変更の通知を確認し、console errorとwarningを0件にする。 | process_gate | prose | docs/skills/browser-testing-and-screen-verification.md:88-90 |
| `RB07-033` | 検証者は画像差分を意図した変更・環境差・真の退行に分類してから判定し、環境差を許容閾値の緩和で吸収しない。 | behavior_discipline | prose | docs/skills/browser-testing-and-screen-verification.md:95-100 |
| `RB07-034` | 担当者は画像baseline更新を差分レビューと一体で行い証跡を残し、変更画面で差分が出なければテスト対象の誤りを疑う。 | evidence_claim | prose | docs/skills/browser-testing-and-screen-verification.md:101-102 |
| `RB07-035` | 検証者はkeyboardのみ、色なし、screen readerの体験を確認し、色に形または文言を併記する。 | behavior_discipline | prose | docs/skills/browser-testing-and-screen-verification.md:104-110 |
| `RB07-036` | 検証者はコントラスト、44×44px以上のタッチ対象、200%拡大を測定し、機械測定可能な検査はaxe等の機械へ任せる。 | behavior_discipline | prose | docs/skills/browser-testing-and-screen-verification.md:112-114 |
| `RB07-066` | テスト作成者は作成前に壊れ方を最低3通り言語化し、できなければ設計文書へ戻る。 | behavior_discipline | prose | docs/skills/test-thinking.md:34-35 |
| `RB07-067` | 全テストが一度でgreenになった場合、作成者は故意のバグでredになることを確認してから成果を報告する。 | evidence_claim | prose | docs/skills/test-thinking.md:36-38; docs/skills/test-thinking.md:127-127 |
| `RB07-069` | テスト作成者は仕様の数値とその±1を検査し、判定に必要な数値がなければ仕様欠陥として指摘する。 | behavior_discipline | prose | docs/skills/test-thinking.md:46-49 |
| `RB07-070` | テスト作成者は操作順序の変更、中断、重複、同時操作、時間経過を試す。 | behavior_discipline | prose | docs/skills/test-thinking.md:50-52 |
| `RB07-071` | 状態遷移図がある場合、テスト作成者は記載されていない状態とイベントの組合せも検査する。 | behavior_discipline | prose | docs/skills/test-thinking.md:53-54 |
| `RB07-074` | 期待値が自明でない場合、作成者は仕様・独立計算・別実装・確定データから出所を先に決め、出所がなければ要件欠陥として報告する。 | evidence_claim | prose | docs/skills/test-thinking.md:62-65 |
| `RB07-075` | 検証者は不可逆操作、境界、障害履歴の多い箇所、新規で複雑な箇所の順に深さを配分する。 | behavior_discipline | prose | docs/skills/test-thinking.md:67-79 |
| `RB07-077` | 探索的テスト担当者は再現しない違和感も記録し、発見した不具合と同じパターンを他の箇所で探索する。 | behavior_discipline | prose | docs/skills/test-thinking.md:87-90 |
| `RB07-079` | 検証者はchecklistを済にする前に反例の構成を試み、反例を作れる間は済にせず、根拠を観測結果で記す。 | evidence_claim | prose | docs/skills/test-thinking.md:98-101 |
| `RB07-080` | 検証者はchecklistにない違和感を発見したら、先に行を追加してから診断する。 | behavior_discipline | prose | docs/skills/test-thinking.md:102-103 |
| `RB07-081` | 検証者は発見率が低下していない場合、直前に重大発見があった場合、不可逆領域に未探索が残る場合はテストを止めない。 | process_gate | prose | docs/skills/test-thinking.md:110-113 |
| `RB07-083` | 担当者はcoverage率を目標にせず未検査箇所の発見にのみ使い、flakyをretryで隠さず原因修正または隔離とPLAN起票を行う。 | behavior_discipline | prose | docs/skills/test-thinking.md:124-125 |
| `RB07-163` | 実装検証者はassertionが対向scenarioを実行すること、skip・todo・ts-ignoreに同じ行のPLAN根拠があること、DBのPLAN状態がreviewまたはcompletedであることを確認する。 | process_gate | prose | docs/skills/verification.md:77-80 |
| `RB07-164` | 結合・総合検証者は対向設計を参照する結合テスト設計を確認し、gateが違反fixtureでexit 1になることを確かめる。 | process_gate | prose | docs/skills/verification.md:82-85 |
| `RB07-222` | 結合test作成者はGiven-When-Thenで状態・呼出し・厳密な出力を記し、各blockをspecのpostcondition行へtraceする。 | evidence_claim | prose | docs/skills/spec-driven-development.md:71-80 |
| `RB07-224` | PoC担当者はS2でも目的・二択の検証質問・観測可能なdone条件を記し、coding前にfailing assertionを作ってS4で削除または正式昇格する。 | process_gate | prose | docs/skills/spec-driven-development.md:93-103 |
| `RB07-262` | 担当者はoracle実質を確認せずcoverage閾値を上げず、誤った値や欠けたwriteを捕捉できなければassertionを強める。 | evidence_claim | prose | docs/skills/testing.md:64-67; docs/skills/testing.md:78-83 |
| `RB07-263` | テスト担当者はfixtureをtests/fixturesに隔離し、本番stateを再利用せず、DBを自前で生成・破棄し、外部processへ制御済みproject rootを渡す。 | safety_security | prose | docs/skills/testing.md:69-76 |
| `RB07-264` | テスト作成者は非自明な期待値の独立した出所を先に確定し、実装出力をそのまま期待値へ貼らない。 | evidence_claim | prose | docs/skills/testing.md:85-88 |
| `RB07-265` | 結合testは実体のある隔離stateへ触れ、consoleだけでなくfile・DB・exit codeをassertし、全一時stateを破棄して設計からtest fileを参照する。 | process_gate | prose | docs/skills/testing.md:90-97 |
| `RB07-277` | 品質reviewerは各test fileの失敗path、設計の境界fixture、最小mockを確認し、結合pathでDB全mockを使わない。 | review_merge | prose | docs/skills/code-review-and-quality.md:66-72 |
| `RB07-326` | 修正担当者は元不具合を捕捉する回帰testがgreenかつcommit済みになるまで修正完了とせず、作業中に見つけた隣接不具合を別scope・commitにする。 | process_gate | prose | docs/skills/error-fix.md:21-23; docs/skills/error-fix.md:30-31 |
| `RB07-327` | 修正担当者はsource変更前にcurrent HEADで同じエラーにより失敗するtestを書き、回帰testとして先にcommitする。 | process_gate | prose | docs/skills/error-fix.md:35-45 |
| `RB08-013` | Refactor担当者は変更前に観測境界・テスト被覆・PLAN kindを確認し、被覆不足には先にcharacterisation testを作る。 | process_gate | prose | docs/skills/refactoring.md:31-41 |
| `RB08-014` | Refactor担当者はbaseline pass数を記録し、scope内のskip・todoを解除またはPLAN化して、回帰防壁が完全かつgreenになってから進む。 | process_gate | prose | docs/skills/refactoring.md:45-48 |
| `RB08-105` | 実装者は読めるL6テスト設計から単一挙動のテストを先に作り、実行してRedを確認する。変更前にpassする場合は空虚なassertionか既存機能かを調査する。 | process_gate | prose | docs/skills/test-driven-development.md:34-41; docs/skills/test-driven-development.md:81-82 |
| `RB08-106` | 実装者はfailing testを単独commitにし、PLAN review_evidenceへそのSHAを記録する。 | evidence_claim | prose | docs/skills/test-driven-development.md:42-43; docs/skills/test-driven-development.md:63-63 |
| `RB08-110` | テスト作成者は決定的な結果をexact valueまたは構造等価でassertし、複雑なobjectをtruthyだけで検証しない。 | evidence_claim | prose | docs/skills/test-driven-development.md:70-73 |
| `RB08-111` | テスト作成者はmockをI/O・network・DB等の境界に限定し、テスト対象自体をmockしない。integration testは実harness stateを使う。 | evidence_claim | prose | docs/skills/test-driven-development.md:74-77 |
| `RB08-127` | 移行検証者は件数一致・代表row一致・制約違反ゼロ・clean targetでの成功・rollback復元をテスト設計へ記録して検証する。 | process_gate | prose／doctor | docs/skills/data-migration.md:54-63 |
| `RB08-139` | 観測機構の検証者は正しいrow生成・row存在時pass・欠落時fail・rebuild決定性をintegration testで確認し、受入証拠にstatusとdoctorの出力を残す。 | evidence_claim | prose／doctor | docs/skills/harness-observability.md:76-84 |
| `RB08-146` | gate検証者は結果row記録・違反fixtureでexit 1・正常fixtureでexit 0をintegration test設計へ含め、unit testと別の設計成果物としてpair化する。 | process_gate | prose | docs/skills/ci-gate-design.md:77-84 |
| `RB08-160` | DBテスト設計者は正常insert/update、制約違反、migration冪等性をそれぞれ最低1経路覆う。 | process_gate | prose | docs/skills/db.md:60-61 |
| `RB08-208` | LLM実装者はmodel-call経路にanyを残さず、正常・API error/timeout・overflowをtestし、reviewにtelemetryを添える。費用spike対策ではmodel/tokenを記録してslot上限を設ける。 | process_gate | prose | docs/skills/llm-agent-routing.md:58-62; docs/skills/llm-agent-routing.md:69-69 |
| `RB08-234` | UI検証設計者はdevice・入力・role・言語・data量・利用回次・低速回線・競合・破壊操作・undo等を追加し、全直積ではなくrisk-based pairwiseでfixtureを選ぶ。 | process_gate | prose | docs/governance/design-harness-assessment-audit-2026-07-19.md:67-69 |
| `RC02-055` | doctorのddd-tdd-rules checkは、DDD/TDD厳格性検査が不合格、または検査不能の場合に失敗する。 | behavior_discipline | doctor | src/doctor/index.ts:1425-1444 |
| `RC02-158` | doctorのright-arm-verification-strategy checkは、右腕検証戦略検査が不合格、または検証文書読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:6575-6590 |
| `RC04-112` | pair-agentは、smart_test_author出力にRed証拠・oracle・Red実行command・非ゼロRed終了コードが揃わなければerrorにして実装へ進まない。 | evidence_claim | gate | src/orchestration/pair-agent.ts:383-397; src/orchestration/pair-agent.ts:550-558; src/orchestration/pair-agent.ts:644-647 |
| `RC04-160` | テスト証拠記録器は、test caseにoracle_idが無いものがあれば警告する。 | evidence_claim | gate | src/workflow/contracts.ts:173-179 |
| `RC04-182` | TDD適合分類器は、要求されたmodeに定義が無いものがあれば警告する。 | process_gate | gate | src/workflow/contracts.ts:828-842 |
| `RD00-093` | 延期義務の照合は、escaped defectが1件以上、またはmutation検出率が1未満の場合、安全性退行として失敗判定にする。 | process_gate | ci | src/runtime/ci-deferred-obligation-recovery.ts:340-350 |
| `RD01-230` | Git guardのテスト専用barrierは、5秒以内に2参加者が揃わなければ例外で失敗する。 | tooling_runtime | hook | src/runtime/git-command-guard-hook.ts:303-310 |
| `RD01-307` | ベンチdataset検証は、public taskの直列化内容にhidden oracleやprivate review情報を示す指定tokenがあれば拒否する。 | safety_security | gate | src/runtime/helix-bench-task-dataset.ts:148-156; src/runtime/helix-bench-task-dataset.ts:216-216 |
| `RD01-308` | ベンチdataset検証は、task IDに対応するfixtureがなければ拒否する。 | process_gate | gate | src/runtime/helix-bench-task-dataset.ts:225-228 |
| `RD01-310` | ベンチdataset検証は、task IDに対応するhidden oracleがなければ拒否する。 | process_gate | gate | src/runtime/helix-bench-task-dataset.ts:232-234 |
| `RD01-311` | ベンチdataset検証は、oracleが過去結果参照を1件でも持つ場合に拒否する。 | evidence_claim | gate | src/runtime/helix-bench-task-dataset.ts:254-256 |
| `RD02-009` | benchmark検証器は、試験ケース集合がclean_approve・seeded_blocker・tool_request・schema_drift・quota_switchと完全一致しない場合に拒否する。 | process_gate | gate | src/runtime/independent-review-fallback.ts:225-261 |
| `RD02-010` | benchmark検証器は、各ケースの観測結果が定義された期待結果と異なる場合に拒否する。 | process_gate | gate | src/runtime/independent-review-fallback.ts:225-231; src/runtime/independent-review-fallback.ts:263-270 |
| `RD02-011` | negative oracle検証器は、mutation集合が定義済み7件と完全一致しない場合に拒否する。 | process_gate | gate | src/runtime/independent-review-fallback.ts:273-305 |
| `RD05-032` | change-set-integrityは、source変更が未変更の依存元moduleに影響し、変更moduleまたは依存元moduleに対応する回帰テストが一つも変更されていない場合、失敗させる。 | process_gate | lint | src/lint/change-impact.ts:259-287 |
| `RD05-204` | ddd-tdd-rulesは、policy文書にL7 Redがない場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:103-103; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-212` | ddd-tdd-rulesは、confirmedかつtdd_red_required=trueのPLANでred_atまたはgreen_atが欠ける場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:420-435 |
| `RD05-213` | ddd-tdd-rulesは、対象TDD PLANのred_atがgreen_atより後の場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:436-442 |
| `RD05-224` | ddd-tdd-rulesは、confirmedかつRedまたはmutation oracle必須のPLANに、具体的な所在とfail/kill/red/mutationの結果語を備えたmutation証拠がない場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:636-705 |
| `RD05-225` | ddd-tdd-rulesは、直接のit/test callback本体にexpectまたはassertがない場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:708-746 |
| `RD05-226` | ddd-tdd-rulesは、テストのassertionがtoBeTruthy/toBeFalsyだけで構成されている場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:708-716; src/lint/ddd-tdd-rules.ts:747-754 |
| `RD05-227` | ddd-tdd-rulesは、L9統合テスト設計にIT-ID/Given/When/Thenの表headerがない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:778-791 |
| `RD05-228` | ddd-tdd-rulesは、統合GWT表に認識可能なIT-*行が一つもない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:792-802 |
| `RD05-229` | ddd-tdd-rulesは、統合GWT行のGiven・When・Thenのいずれかが空の場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:803-815 |
| `RD05-230` | ddd-tdd-rulesは、unit test-designの数値末尾U-*行で、IDとtarget以外のcellを結合した期待動作が6文字未満または骨格markerの場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:819-821; src/lint/ddd-tdd-rules.ts:832-854 |
| `RD05-235` | dependency-driftの回帰scope展開は、変更moduleに直接対応するテスト被覆がない場合、警告し結果okをfalseにする。 | evidence_claim | lint | src/lint/dependency-drift.ts:159-172; src/lint/dependency-drift.ts:343-364 |
| `RD06-043` | design-reality-binding lintは、指定oracle_idに対応する実行可能oracleの検出数がちょうど1件でない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:731-738 |
| `RD06-044` | design-reality-binding lintは、oracle本文にreason_codeがない、対象関数の呼び出し結果をそのreasonでassertしていない、または本文にtoContain呼び出しがある場合、prose_only_reachabilityとして失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:501-583; src/lint/design-reality-binding.ts:739-754 |
| `RD06-045` | design-reality-binding lintは、identity_post_check方式のfixture評価結果がexpected_reasonとreason_codeの両方に一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:652-671; src/lint/design-reality-binding.ts:755-759 |
| `RD06-046` | design-reality-binding lintは、identity_post_check方式で指定post-checkを除いた評価結果がmutationの期待値と異なる、または元の評価結果と同じ場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:760-763 |
| `RD06-047` | design-reality-binding lintは、identity_post_check以外でexecutable_oracle方式・一致する期待reason・RED_BY_ORACLE・実装内のmutation対象・実行テスト参照等の条件が揃わない場合、失敗させる。実行テストパス指定時にoracle IDまたはhelperが空の場合も拒否する。 | evidence_claim | lint | src/lint/design-reality-binding.ts:764-786 |
| `RD06-048` | design-reality-binding lintは、mutation実行テストを指定した場合、そのoracleが一意でなく、または対象・元oracleへのhelper呼び出しと書換え・実行・削除の構造を確認できなければ失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:585-649; src/lint/design-reality-binding.ts:787-801 |
| `RD06-069` | design-reality-binding lintは、宣言failure codeに空・非文字列・重複がある、witnessのreason_codeが重複する、または両集合が一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:1006-1025 |
| `RD06-071` | design-reality-binding lintは、failure codeと到達性証跡がともに空で、その文書がbaseline未登録の場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:1026-1046 |
| `RD06-093` | doc-consistency lintは、L7単体テスト設計に所定のv0.1.0からv0.1.4へのversion-up dry-runコマンドがない場合、不足として返す。 | tooling_runtime | lint | src/lint/doc-consistency.ts:24-26; src/lint/doc-consistency.ts:226-230 |
| `RD07-010` | g10-ux-workflowは、L10 visual-design本文に所定のUX workflowマーカーが一つでも欠ければ失敗する。 | process_gate | lint | src/lint/g10-ux-workflow.ts:38-48; src/lint/g10-ux-workflow.ts:95-111 |
| `RD07-012` | g10-ux-workflowは、L10 visual-designから抽出した一意なUXVケースが3件未満なら失敗する。 | process_gate | lint | src/lint/g10-ux-workflow.ts:98-100; src/lint/g10-ux-workflow.ts:115-119 |
| `RD07-014` | g10-ux-workflowは、全manifestのselected_item_ids集合がRENDER・A11Y・BLOCKERのいずれかのUXV familyを含まなければ失敗する。 | process_gate | lint | src/lint/g10-ux-workflow.ts:57-57; src/lint/g10-ux-workflow.ts:123-126 |
| `RD07-015` | g10-ux-workflowは、全manifestのmandatory_item_ids集合がRENDER・A11Y・BLOCKERのいずれかのUXV familyを含まなければ失敗する。 | process_gate | lint | src/lint/g10-ux-workflow.ts:57-57; src/lint/g10-ux-workflow.ts:127-130 |
| `RD07-050` | g8-integration-workflowは、全manifestのselected_it_ids集合がMODULEまたはSTATEのIT familyを含まなければ失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:83-83; src/lint/g8-integration-workflow.ts:365-368 |
| `RD07-051` | g8-integration-workflowは、全manifestのmandatory_it_ids集合がMODULEまたはSTATEのIT familyを含まなければ失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:83-83; src/lint/g8-integration-workflow.ts:369-372 |
| `RD07-056` | g9-system-workflowは、全manifestのselected_item_ids集合に必須の6種類のST familyのいずれかがなければ失敗する。 | process_gate | lint | src/lint/g9-system-workflow.ts:56-63; src/lint/g9-system-workflow.ts:129-132 |
| `RD07-057` | g9-system-workflowは、全manifestのmandatory_item_ids集合に必須の6種類のST familyのいずれかがなければ失敗する。 | process_gate | lint | src/lint/g9-system-workflow.ts:56-63; src/lint/g9-system-workflow.ts:133-136 |
| `RD08-086` | semantic consumer lintは、negative_oracle_idsが配列でない、または空の場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:355-356 |
| `RD08-100` | semantic consumer lintは、登録済みcapabilityのnegative_oracle_idsが固定期待集合と件数または包含関係で一致しない場合、失敗させる。 | process_gate | lint | src/lint/legacy-orchestration-semantic-consumers.ts:413-418 |
| `RD09-029` | plan-descentは、対象PLANのgeneratesとmodifiesの両方にtest_codeがない場合、baseline免除対象以外を失敗させる。 | process_gate | lint／gate | src/lint/plan-descent.ts:236-245; src/lint/plan-descent.ts:263-274 |
| `RD09-099` | proposal-document-coverageは、api-ifを期待するシナリオでcontract_testsがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | src/lint/proposal-document-coverage-policy.ts:50-50; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-112` | proposal-document-coverageは、test-designを期待するシナリオでoracle_matrixがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | src/lint/proposal-document-coverage-policy.ts:60-60; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-126` | proposal-document-coverageは、test-designを期待するシナリオでtest-design-coverage-reviewがrequired_gatesにない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage-policy.ts:74-74; src/lint/proposal-document-coverage.ts:169-178 |
| `RD11-200` | terminal fullbackのdoctor配線検査は、空の証拠からslice欠落・main read-after欠落・依存状態不一致の3failure codeがすべて得られなければ失敗する。 | process_gate | lint／doctor | src/lint/workflow-classification-terminal-fullback.ts:493-503; src/lint/workflow-classification-terminal-fullback.ts:556-576 |
| `RE01-011` | 実装者は設計とテスト設計を先に定め、TDDに従って実装する。 | behavior_discipline | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:220-220 |
| `RE01-050` | TDDの検証者は未実装によるテスト失敗だけをRed証拠とし、構文・import・fixtureの失敗をRedとして認めてはならない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.2.md:770-774 |
| `RE01-052` | QA担当者はQA設計をfreeze済みの設計と区別し、仕様不足を見つけた場合はadd-design/add-implと再freezeへ戻す。 | process_gate | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:817-831 |
| `RE01-053` | QA担当者は追加テストの設計とtraceを先に作り、レビュー指摘から直接テストコードだけを追加してはならない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:817-831 |
| `RE01-054` | テスト構成の検証者は、規定の上位観点が欠落した逆ピラミッド構成をP0とし、右腕で未freezeの新規テスト設計が発生した場合も進行を止める。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:837-853 |
| `RE01-076` | 作成者は早期にDraft PRを作り、TDDのRedをGreenと別commitにして証拠を残す。 | review_merge | prose | docs/governance/helix-harness-requirements_v1.2.md:1223-1229 |
| `RE01-137` | テスト作成者はdomain invariantをoracleにし、truthinessだけで成功を判定しない。integration testではGiven–When–Thenで条件と結果を明示する。 | behavior_discipline | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:1937-1946 |
| `RE01-229` | 検証設計者は承認・cutover・projection・GitHub・memory・feedbackの障害条件にfault injection、race、soak、crash等を適用し、riskに応じてproperty・model・differential・mutation・fuzz検証を選ぶ。手法数だけで完了としない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:373-375 |
| `RG09-011` | L6/L7担当者は、TDD工程で契約外のコードを追加してはならない。 | behavior_discipline | prose | docs/governance/ddd-tdd-rules.md:150-150 |
| `RG13-008` | authority検査の是正担当者は、旧本文の現行authority主張を検出できるようprocess・gate・schema consumerのnegative fixtureを追加する。 | process_gate | prose | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:42-42 |
| `RG19-012` | テスト担当者は、live runtimeがなくてもテスト実行を再現可能にする。 | behavior_discipline | prose | docs/skills/testing.md:71-72 |

## 副として対応づいた規則（95件）

`RA-227`、`RA-231`、`RA-325`、`RA-333`、`RA-343`、`RA-353`、`RA-354`、`RB0-040`、`RB0-049`、`RB0-055`、`RB0-062`、`RB0-102`、`RB04-030`、`RB04-054`、`RB04-070`、`RB04-190`、`RB04-194`、`RB04-199`、`RB04-208`、`RB05-086`、`RB05-117`、`RB05-186`、`RB05-192`、`RB05-230`、`RB06-187`、`RB07-030`、`RB07-076`、`RB07-078`、`RB07-082`、`RB07-087`、`RB07-107`、`RB07-182`、`RB07-194`、`RB07-214`、`RB07-219`、`RB07-223`、`RB07-237`、`RB07-255`、`RB07-260`、`RB07-266`、`RB07-291`、`RB07-302`、`RB07-307`、`RB07-332`、`RB07-342`、`RB08-107`、`RB08-108`、`RB08-112`、`RB08-126`、`RB08-137`、`RB08-141`、`RB08-142`、`RB08-163`、`RB08-185`、`RB08-189`、`RB08-206`、`RB08-207`、`RB08-240`、`RB08-247`、`RB08-281`、`RB08-294`、`RB08-316`、`RB09-023`、`RB09-024`、`RB09-025`、`RB09-029`、`RC0-094`、`RC02-016`、`RC02-025`、`RD01-198`、`RD01-199`、`RD01-305`、`RD01-309`、`RD01-312`、`RD02-146`、`RD05-027`、`RD05-193`、`RD05-211`、`RD05-253`、`RD06-036`、`RD07-011`、`RD07-046`、`RD07-048`、`RD07-052`、`RD07-054`、`RD09-148`、`RD11-061`、`RE01-138`、`RE01-170`、`RE01-216`、`RE01-231`、`RE01-272`、`RE01-279`、`RG14-011`、`RG16-016`
