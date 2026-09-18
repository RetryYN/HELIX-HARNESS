---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-FRM-01
group: 枠
product: HARNESS
atoms_primary: 288
atoms_secondary: 214
issue_projection: #1858
---

# RUL-FRM-01（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

工程の順序とV-pairを守る。上流が未確定のまま下流へ進まず、対になる設計と検証を双方向traceで閉じてから次の層へ進む。

## 主として対応づいた規則（288件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-011` | エージェントはverification roadmapを通常startupで読まず、Forward freeze後のverification cycleで読む。 | memory_context | prose | AGENTS.md:91-93; CLAUDE.md:37-38 |
| `RA-185` | エージェントは正規層をL1-L12、pairをL1↔L12からL6↔L7とし、L0を層外anchorとして扱う。 | process_gate | prose | AGENTS.md:69-70; CLAUDE.md:25-26; .claude/CLAUDE.md:26-27 |
| `RA-191` | エージェントはForwardを一層ずつ進め、層に合う粒度で旧機能を選別し、機能一覧と名称を更新して登録する。 | process_gate | prose | AGENTS.md:115-116; CLAUDE.md:65-70 |
| `RA-192` | エージェントはForwardをplan→pair-freeze→implement→trace-freeze→review→acceptの順で進める。 | process_gate | prose | AGENTS.md:156-156; CLAUDE.md:293-293 |
| `RA-206` | test新設・移動時はPLAN.generatesへtest_codeとして同時登録する。 | process_gate | prose | .claude/CLAUDE.md:58-58 |
| `RA-207` | 既存source・testの修正はgeneratesに重複記載せず、modifiesへpathとtypeを記録し、testはV-pair・oracleへ接続する。 | process_gate | prose | .claude/CLAUDE.md:59-61 |
| `RA-217` | /specの旧指示ではL5/L6設計節とL6/L8 test設計を1対1対応させる。 | process_gate | prose | .claude/commands/spec.md:16-16 |
| `RA-220` | 実装者はspecとpaired test designがfreezeされてから実装へ進む。 | process_gate | prose／gate | .claude/commands/spec.md:20-21 |
| `RA-221` | /build実行者はparent_designが既存L5/L6設計を指し、plan lint成立とpaired L6 test設計が揃わなければ停止してdesign gapを解消する。 | process_gate | prose／lint | .claude/commands/build.md:12-14 |
| `RA-222` | 実装者は新規fileすべてをPLAN.generates経由で設計artifactへtraceし、新規file発生時にgeneratesを更新する。 | process_gate | prose | .claude/commands/build.md:21-22 |
| `RA-365` | L1/L2表示観点の検査者は表示dataの出所となるFRまたはdata要件がL1に存在するか確認する。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:35-38 |
| `RA-368` | L1/L2状態遷移観点の検査者は異常系を含む画面遷移がscreen-flowとL1要求の双方に存在するか確認する。 | behavior_discipline | config | .helix/config/requirements-binding.yaml:47-50 |
| `RB0-005` | 層を扱う者はL1-L12と六つの正規V-pairを使用し、L0 charterを層外anchorとして扱う。 | tooling_runtime | prose | docs/governance/README.md:29-32 |
| `RB0-049` | domain invariantの宣言者は各不変条件に明示的なU-* oracleを対応させる。 | evidence_claim | lint／doctor／ci | docs/governance/ddd-tdd-rules.md:43-46; docs/governance/ddd-tdd-rules.md:136-136; docs/governance/ddd-tdd-rules.md:155-159 |
| `RB0-062` | 設計者はL4/L9でdomain境界とsystem/integration oracleを、L5/L8で条件・不変条件・失敗・edge caseと単体・結合oracleを対で固定する。 | process_gate | prose | docs/governance/ddd-tdd-rules.md:146-148 |
| `RB0-102` | product担当者は要求・設計・実装をcanonical Forwardで進め、管理上の緊急性を理由にV-pair・上下edge・TDD・review・acceptanceを省略しない。 | process_gate | prose | docs/governance/management-scrum-product-forward.md:16-17 |
| `RB0-158` | reviewerは新functionのtest-designが欠ける場合、codeが存在していてもopen obligationとして記録する。 | evidence_claim | prose | docs/skills/adversarial-review.md:88-89 |
| `RB04-029` | 作業者は設計・実装コード・テスト設計・テストコードを独立成果物として分離し、双方向参照で結ぶ。 | process_gate | prose／lint | docs/governance/helix-harness-concept_v3.1.md:301-311; docs/governance/helix-harness-concept_v3.1.md:735-741 |
| `RB04-030` | 設計者は左腕で対応テスト設計を同時凍結し、検証者は対応する環境・データ実在性で設計が成立するか検証する。 | process_gate | prose／gate | docs/governance/helix-harness-concept_v3.1.md:323-337; docs/governance/helix-harness-concept_v3.1.md:1211-1211 |
| `RB04-033` | AIエージェントシステムを構築する場合だけHELIX Wを適用し、一般システム仕様確定後にエージェント構築のVを進める。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:343-352 |
| `RB04-036` | 実装完了gateは4成果物の双方向traceを凍結し、実装前に実装コードをfreezeした扱いにしない。 | process_gate | gate | docs/governance/helix-harness-concept_v3.1.md:369-388 |
| `RB04-037` | gateは設計・実装が存在してもテスト設計・テストコードが欠落または不完全ならfail-closeする。 | process_gate | gate | docs/governance/helix-harness-concept_v3.1.md:390-392; docs/governance/helix-harness-concept_v3.1.md:1214-1214 |
| `RB04-058` | 要求作成者はL1の業務要求とL3のシステム機能要件・受入条件を分離し、FRをBRへ双方向traceし、ACなしでG3を通さない。 | process_gate | prose／lint／gate | docs/governance/helix-harness-concept_v3.1.md:554-556; docs/governance/helix-harness-concept_v3.1.md:742-744 |
| `RB04-067` | L1の全sub-docは冒頭にSSoT参照・件数と確定根拠・L3接続規約を明示し、pair・parent・該当するrelated参照を備える。 | process_gate | lint／doctor | docs/governance/helix-harness-concept_v3.1.md:606-615 |
| `RB04-070` | 実装者はTDD Red・本体実装・設計/テスト設計/実装の3点レビュー・テスト追加・実施・修正の順で進め、矛盾があれば設計工程へ差し戻す。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:635-637 |
| `RB04-071` | 実装PLANの起票者は対応する機能設計docをparent_designに指定する。 | process_gate | prose／lint | docs/governance/helix-harness-concept_v3.1.md:637-637; docs/governance/helix-harness-concept_v3.1.md:743-743 |
| `RB04-080` | 検証者は右側工程でpair未凍結の通常テスト設計を後付けせず、対応する左側で凍結済みの設計を使用する。 | process_gate | prose／lint | docs/governance/helix-harness-concept_v3.1.md:659-659; docs/governance/helix-harness-concept_v3.1.md:745-745 |
| `RB04-081` | 総合レビュー/UAT担当者は業務要求・要件と実装・テスト結果を全体突合し、ユーザーfeedbackを要求・要件へ巻き取る。 | review_merge | prose | docs/governance/helix-harness-concept_v3.1.md:663-665 |
| `RB04-083` | G1-traceは指定BR/UXの13件および全15画面の関連付け欠落をブロックする。 | process_gate | lint／gate | docs/governance/helix-harness-concept_v3.1.md:718-721 |
| `RB04-089` | 設計者はdrive別の設計・実装順・freeze条件を適用し、FEではmockからAPI契約を導出し、fullstackではBE・FE・接続契約を揃えて凍結する。 | process_gate | prose／gate | docs/governance/helix-harness-concept_v3.1.md:766-782 |
| `RB04-093` | High-Fi mockを外部へ依頼する場合、作業者は要件へのback-propagationを考慮してG1-traceを再検証する。 | process_gate | prose／gate | docs/governance/helix-harness-concept_v3.1.md:799-799 |
| `RB04-094` | Scrum担当者はS0 backlog・S1計画・S2 PoC・S3検証・S4判断の順で進め、aimが実装、TLがconfirmed/rejected/pivotを判断する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:822-833 |
| `RB04-131` | pair-freeze検査はdesign/test-designの双方向参照と孤児ゼロを確認し、pair_artifact:selfのmockは孤児扱いしない。 | process_gate | lint | docs/governance/helix-harness-concept_v3.1.md:1191-1192 |
| `RB04-133` | 検査機構は上流要件と層隣接matrixから必要な下流/pair成果物を導出し、未宣言の欠落もfail-closeで検出する。 | process_gate | lint | docs/governance/helix-harness-concept_v3.1.md:1195-1195 |
| `RB04-134` | src/testが実装済みなのに対応設計・テスト設計のdeferが未解消なら、検査機構は違反としdeferで免責しない。 | process_gate | lint | docs/governance/helix-harness-concept_v3.1.md:1196-1196 |
| `RB04-152` | 検査機構は全FRを機能仕様・unit contract・U-* oracleへ接続して単体粒度の100%被覆を確認する。 | process_gate | lint | docs/governance/helix-harness-concept_v3.1.md:1249-1249 |
| `RB04-172` | 開発者は要件受領・仕様化・テスト設計・AI実装・CI・AIレビュー・最終確認・merge・staging・QA gate・発注元承認の順で進める。 | process_gate | prose | docs/governance/ai-dev-team-operations_v1.1.md:166-192 |
| `RB05-003` | 監査工程はDocument、Domain、Test、Implementation、Coding Rule、PR、Mergeの順に判定する。 | process_gate | gate | docs/governance/audit-framework.md:42-60 |
| `RB05-009` | テスト作成者はテストを機能IDに結び付け、テストファイルにfeature_idとtargetを明記する。 | evidence_claim | prose／gate | docs/governance/audit-framework.md:228-245 |
| `RB05-070` | G3後はL4/L9、L5/L8の順に責務を閉じ、再集計で要求全件と既知責務全件が証明された責務だけをL6/L7へ進める。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:315-321 |
| `RB05-072` | 各責務のL4/L9 PRをmergeしてからL5/L8 PRを別に作り、後段を混載せず、各PRでsame-HEAD review・CI・DB receiptを取得する。 | review_merge | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:338-342 |
| `RB05-074` | 原子的開発の5責務は既存GitHub責務へ混載せず、責務ごとにL4/L9、L5/L8、L6/L7の3段へ分離する。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:356-368 |
| `RB05-120` | 各L1–L12に連鎖台帳を設け、層外L0 anchorを保持し、上下隣接pairと左右V-pairの双方を必須にする。 | process_gate | prose／gate | docs/governance/infinity-loop-source-capability-ledger.md:74-74 |
| `RB05-220` | Design Obligation Gateはrequirement・capability・service・domain object・template・obligation・test oracle・gateの必要edgeと逆到達が全てcurrentでない限りfreezeを許可しない。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:221-227; docs/governance/infinity-loop-system-assertion-cases.md:243-247; docs/governance/infinity-loop-system-assertion-cases.md:356-356 |
| `RB05-237` | Layer Ledgerはcanonical L1–L12の型・粒度・authority・entry/exitと層外L0 anchorを登録し、layer entryやtype欠落時は生成を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:290-291; docs/governance/infinity-loop-system-assertion-cases.md:397-397 |
| `RB05-238` | Template Obligation Extractorは全章・field・table・done-when・pair契約をprovenance付きproposalまたはgap findingへ分岐し、source span欠落・複数義務混在・重複抽出を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:292-293; docs/governance/infinity-loop-system-assertion-cases.md:299-299; docs/governance/infinity-loop-system-assertion-cases.md:398-398 |
| `RB05-240` | layer coverageはaggregate親のdischargeでは成立せず、全atomic obligationが上下・左右の双方向へ閉じ、同じrevision/snapshotと実行証拠を持つ場合だけcoveredにする。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:300-300; docs/governance/infinity-loop-system-assertion-cases.md:359-359; docs/governance/infinity-loop-system-assertion-cases.md:437-437 |
| `RB05-241` | Vertical Pair Gateはderived_fromとbackpropの双方向edgeを要求し、隣接層の飛越や親より粗いchild obligationを拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:301-306 |
| `RB05-243` | Horizontal Pair GateはL1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7およびL12→層外L0 feedbackの必要edge欠落を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:309-316 |
| `RB05-244` | Horizontal Pair Gateは片方向edge、oracle ID不一致、snapshot不一致、実行receipt欠落のpairをgreenにしない。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:317-321; docs/governance/infinity-loop-system-assertion-cases.md:400-400 |
| `RB05-286` | adopt・harden・redesignのdecisionにはHIL、design、assertion、gateへの全joinを要求し、代表的な説明文で中間接続を省略しない。 | process_gate | gate | docs/governance/infinity-loop-source-atomization-contract.md:70-70; docs/governance/infinity-loop-source-atomization-contract.md:78-90 |
| `RB05-315` | Production ScrumはL3 freeze後に要件単位でslice化し、V設計＋Scrum実装はL1〜L5 freeze後にL6以降をslice実装する。 | process_gate | config | config/workflow-classification-catalog.v1.json:27-41 |
| `RB05-347` | 互換Forward経路はrequired pairが閉じ、右腕証拠がcurrentになった場合だけ終了する。 | process_gate | config | config/drive-route-catalog.json:18-20 |
| `RB05-353` | top-down Add-featureはimpact・add-design・add-impl・test・V-model整合の順で進み、delta pairとG7 traceが閉じるまで終了しない。 | process_gate | config | config/drive-route-catalog.json:93-105 |
| `RB05-365` | Operation Verificationは単体・結合・総合・受入・運用の順で証拠を作り、本番resourceや外部適用はaction ownerから別途承認を得る。 | escalation_authority | config | config/drive-route-catalog.json:229-240 |
| `RB06-045` | 台帳生成者は全edgeを完全なIDで記録し、range・slash・代表scenarioによる省略を使わない。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-coverage-ledger.md:18-20 |
| `RB06-047` | 昇格判断者はcoverage台帳・HOT・assertionの双方向edge差分ゼロと、同一requirementを含むHST familyへの到達を要求する。 | process_gate | prose | docs/governance/infinity-loop-requirement-coverage-ledger.md:259-262 |
| `RB06-048` | 昇格判断者は全要求のrequirement・親HST・atomic case・failure code一致と、全component候補のstable ID解決を要求する。 | process_gate | prose | docs/governance/infinity-loop-requirement-coverage-ledger.md:263-264 |
| `RB06-119` | Layer Ledgerの完了評価は原子的義務が上下・左右双方向に閉じ、同一revision・oracle・snapshotで実行済みのpairだけをcovered・greenにする。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:55-55; docs/governance/infinity-loop-assertion-coverage-ledger.md:116-117; docs/governance/infinity-loop-assertion-coverage-ledger.md:187-187 |
| `RB06-132` | 実行adapterはReverse・Redesign・pair-freezeのいずれかが未完了なら、tool起動前に実装claimを拒否してblocked reasonを返す。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:76-76 |
| `RB06-189` | 設計者は下位仕様未確定でtest設計を書けない場合、確定層と依存条件をplaceholderに残し、仕様確定後に対応pairへback-fillする。 | process_gate | prose | docs/governance/document-system-map.md:39-39 |
| `RB06-190` | back-fill管理は最終的に全pair・孤児ゼロへ収束させ、placeholder未解消・pair欠落・逆ピラミッドをfail-closeで検出する。 | process_gate | doctor／lint／gate | docs/governance/document-system-map.md:41-41 |
| `RB06-194` | FE設計者は層別文書集合の定義からslot・起票・作成・実装の順で進め、各設計段階を飛ばさない。 | process_gate | prose | docs/governance/document-system-map.md:101-103; docs/governance/document-system-map.md:123-147 |
| `RB06-262` | 駆動成果の合流時はForwardの該当層gateを改めて通し、cross-checkをForward・駆動双方へ適用する。 | process_gate | prose | docs/governance/gate-design.md:78-80 |
| `RB06-264` | gate監査者はDoD全件、上流孤児ゼロ、pair実在・相互参照、sub-doc無矛盾を検査し、blockerとPO escalation・carryを分離記録する。 | process_gate | prose／gate | docs/governance/gate-design.md:116-126 |
| `RB06-281` | 作成者は設計文書・実装コード・test設計・testコードを別directoryに置き、双方向traceで結んで混在させない。 | process_gate | prose | docs/governance/repository-structure.md:122-131 |
| `RB07-025` | UI変更の担当者は実ブラウザ検証をL10 gateで行い、L2/L10画面文書を省略せず、passing結果を記録してからtrace-freezeへ進む。 | process_gate | prose／gate | docs/skills/browser-testing-and-screen-verification.md:20-23; docs/skills/browser-testing-and-screen-verification.md:42-43 |
| `RB07-045` | UI bundle作成者はHigh-Fi層へ委譲されたhex・px等の具体値を持ち込まず、SA-UDP-01到達前にgraph sectionを宣言しない。 | process_gate | config | config/ui-domain/harness-console-bundle.json:3-3 |
| `RB07-162` | 上流検証者は一意なFRとplaceholderでない対応機能仕様を確認し、設計・単体テスト設計の存在とscenario IDの実テスト対応を確認する。 | process_gate | prose／lint | docs/skills/verification.md:66-75 |
| `RB07-165` | 検証者は対向artifact欠落を違反として扱い、lintが見逃す場合は改善を起票し、単体テストだけを理由に結合設計を省略しない。 | process_gate | prose／lint | docs/skills/verification.md:87-91; docs/skills/verification.md:117-118 |
| `RB07-219` | 実装者はtest前に読めるspecを用意し、merge前にtestをgreenにし、各実装単位をspecとtest designへtrace可能にする。 | process_gate | prose | docs/skills/spec-driven-development.md:28-31; docs/skills/spec-driven-development.md:40-49 |
| `RB07-220` | PLANは対向する設計・テスト設計が両方存在してreadabilityを通るまでpair-freezeを越えず、存在しない設計へのrequiresをlintで拒否する。 | process_gate | prose／lint | docs/skills/spec-driven-development.md:52-54 |
| `RB07-242` | 設計者はID廃止などtraceabilityを壊す選択肢を提示しない。 | behavior_discipline | prose | docs/skills/design-tailoring.md:111-111 |
| `RB07-256` | reviewerは証跡で引用された全FRの下流traceと対向artifact・新用語glossaryを確認し、下流のないFRを未完義務とする。 | review_merge | prose | docs/skills/code-review.md:62-72 |
| `RB07-260` | テスト作成者はunitだけでなく全levelでtest codeより先に対応test designを用意する。 | process_gate | prose | docs/skills/testing.md:33-44 |
| `RB07-270` | R4担当者は不足pairを全件列挙し、該当がなくても空listを残して、合流先がpair-freezeを越える前にtest-design PLANを用意する。 | process_gate | prose | docs/skills/reverse-r4.md:52-56; docs/skills/reverse-r4.md:92-93 |
| `RB07-274` | Reverse終了後も、担当者は合流先pair-freeze gateを通過するまで下流実装を開始しない。 | process_gate | prose | docs/skills/reverse-r4.md:105-107 |
| `RB07-283` | 実装者は全sourceを対向設計とtest設計へtraceし、片方でも欠ければコードを書く前に停止して設計gapを解決する。 | process_gate | prose | docs/skills/incremental-implementation.md:31-42 |
| `RB07-303` | 下流queueはG1/G3 freeze後にのみ有効化し、queue_idを不変予約として保持してG3後に生成したPLAN IDを追記する。 | process_gate | config | docs/governance/l3-downstream-queue.json:8-9 |
| `RB07-325` | 担当者は進行中Codex作業の着地後にHEADを基準として正規Forward工程で実装し、対応する設計文書も更新する。 | process_gate | prose | docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md:70-71; docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md:94-94 |
| `RB08-019` | Refactor担当者はmodule構造を変更した場合、対になる設計書・テスト設計書を新構造へ追従させる。 | process_gate | prose | docs/skills/refactoring.md:70-74 |
| `RB08-035` | 要件引継ぎ担当者は各FRへ一意で安定したIDを付け、実装が必要なFRに対応PLANまたは延期理由付きdraftを用意する。 | process_gate | prose | docs/skills/requirements-handover.md:43-47 |
| `RB08-036` | 要件担当者は曖昧なFRにclarification_pendingとreview_evidence内の質問リンクを付け、未解決のまま後継者へL3 PLANを渡さない。 | process_gate | prose | docs/skills/requirements-handover.md:48-49; docs/skills/requirements-handover.md:91-92 |
| `RB08-099` | 設計者は対象にAI agent層がある場合、一般system Vの出力を土台にagent system Vを行う。外向けagent層のないharness自己開発にはsingle Vを適用する。 | process_gate | prose | docs/skills/system-design-sizing.md:33-44 |
| `RB08-134` | projection追加担当者はL5でtableと用途を設計し、L6で入力からrow生成を検証する設計を作ってからprojection writerへ実装する。 | process_gate | prose | docs/skills/harness-observability.md:44-49 |
| `RB08-155` | Reverse担当者はR4後も宛先pair-freeze成立前に下流実装を開始せず、各phase境界でPLAN lintとdoctorを実行する。 | process_gate | prose／lint／doctor | docs/skills/reverse-analysis.md:52-53; docs/skills/reverse-analysis.md:65-65 |
| `RB08-167` | L4設計者はL3 interface pointを具体的module境界へ解決し、元のinterface名を参照する。 | evidence_claim | prose／lint | docs/skills/api-and-interface-design.md:60-65 |
| `RB08-197` | API設計者はpair-freeze前にL4とintegration-test設計、L5とunit-test設計を対応させる。 | process_gate | prose | docs/skills/api.md:38-43; docs/skills/api.md:60-64 |
| `RB08-198` | API実装者はL4契約へ完全に一致させ、差分がある場合はmerge前に設計更新と再pair-freezeを行う。 | process_gate | prose | docs/skills/api.md:45-46 |
| `RB08-210` | 残余test owner処置担当者はAI Vision・Universal Workflowのbinding testをG3後にL4/L9・L5/L8へ降下させ、ownershipを正規化する。 | process_gate | config | docs/governance/feedback-test-owner-disposition-residual.json:6-26 |
| `RB08-211` | 残余test owner処置担当者はdocument semantic diffとchange reportをadditive pairでL5/L8 oracle・L6/L7 ownershipへ結び付ける。 | process_gate | config | docs/governance/feedback-test-owner-disposition-residual.json:28-46 |
| `RB08-212` | authority testの処置担当者はG3後のauthority gate設計でL5/L8・L6/L7 ownershipを閉じ、runtime authority testも対応するruntime設計で閉じる。 | process_gate | config | docs/governance/feedback-test-owner-disposition-residual.json:48-96 |
| `RB08-232` | Design HARNESS再編担当者は分散sliceをProduct・Experience・System・Governanceの4層へ統合し、共通Design Registryで要求から操作・API・計測・受入まで結線する。 | process_gate | prose | docs/governance/design-harness-assessment-audit-2026-07-19.md:52-63 |
| `RB08-237` | Design HARNESS着手者はinventory-firstで既存draftのconfirmを先行させ、L6設計とtest-design pairなしにL7を起票しない。 | process_gate | prose | docs/governance/design-harness-assessment-audit-2026-07-19.md:85-86 |
| `RB08-244` | 工程設計者はL1〜L12とL1/L12・L2/L11・L3/L10・L4/L9・L5/L8・L6/L7を新規要求・設計・trace・gateの正とし、旧L0〜L14を互換投影に限定する。 | process_gate | prose | docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:10-13; docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:26-41 |
| `RB08-245` | 工程設計者は本番releaseをL11/L12間のmilestone、画面mockをL2内の要求引出し手段とし、独立層を新設しない。 | process_gate | prose | docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:43-48 |
| `RB08-247` | 工程担当者はtest設計を下降側L5までに整え、実行を上昇側L8以降で行い、domain・UX・複数clientのriskに応じてtest先・prototype先・契約先を選ぶ。 | process_gate | prose | docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md:49-50 |
| `RB08-271` | Recovery担当者は事象ごとに正常化に必要な最小reopen pointを選び、そこからtop-downで必要範囲を直してpair/traceを再整合し、Forwardへ戻す。 | process_gate | prose | docs/governance/recovery-workflow.md:36-38; docs/governance/recovery-workflow.md:40-52 |
| `RB08-281` | 未完了機構の実装者は別責務を監査PRへ混載せず、G3凍結後にL4/L5で既存ownerへ統合してL6/L7でTDDする。 | process_gate | prose | docs/governance/operations-rule-audit-2026-07-26.md:61-71 |
| `RB08-320` | RLO承認後の担当者はIssue再編、IR admissionとL3登録、PLAN confirmed化、最初のsliceからのForward進行の順を守る。 | process_gate | prose | docs/governance/rlo-819-approval-packet-2026-08-20.md:49-53 |
| `RB08-323` | NFR改善担当者は検証手法追加より先にNFR正本と測定契約を整理し、台帳・DB性能等・故障注入等・authorityとPO承認を要する正本化の順に進める。 | process_gate | prose | docs/governance/nfr-consolidation-improvement-audit-2026-07-19.md:34-40 |
| `RB08-325` | closure test owner処置担当者は指定6 testをG3後・L6正規化前に、additive L5/L8 oracle backpropとL6/L7 ownership bindingで閉じる。 | process_gate | config | docs/governance/feedback-test-owner-disposition-closure.json:4-48 |
| `RB08-345` | 要件freeze担当者は追加要求のL4降下をG3 freeze後のForward事項とし、下流詳細設計を要件freezeの前提へ混入しない。 | process_gate | prose | docs/governance/infinity-loop-requirements-definition-review-2026-07-19.md:43-43 |
| `RB09-004` | test ownershipの後継担当者は、tests/document-agent-metadata.test.tsについて、G3後・L6正本化前にadditive L5/L8 oracle backpropとL6/L7 test ownership bindingを完了する。 | process_gate | config | docs/governance/feedback-test-owner-disposition-direct.json:8-16 |
| `RB09-005` | test ownershipの後継担当者は、tests/infinity-loop-strict-design-contract.test.tsについて、G3後・L6正本化前にadditive L5/L8 oracle backpropとL6/L7 test ownership bindingを完了する。 | process_gate | config | docs/governance/feedback-test-owner-disposition-direct.json:19-28 |
| `RB09-006` | test ownershipの後継担当者は、tests/slow/source-boundary-headless.test.tsについて、G3後のL4/L9 pair closure段階でL4/L9 integration ownership bindingとL6/L7 PLAN projectionを完了する。 | process_gate | config | docs/governance/feedback-test-owner-disposition-direct.json:31-39 |
| `RB09-027` | #1041の担当者は、#1038のterminal成立を入口条件としてV-pair／Scrum DoD接続を進め、終端証拠としてpair traceとseparate PR admissionを揃える。 | process_gate | prose | docs/governance/system-synthesis-rollout-roadmap.md:9-17 |
| `RB09-084` | document-agent-metadataの適用処理は、design-declarationsとvpair-bindingを必須gateとする。 | process_gate | config／gate | config/document-agent-metadata-scope.json:15-19 |
| `RB09-085` | recognition test ownershipの後継担当者は、G3後・L6正本化前にtests/l12-hybrid-recognition.test.tsのadditive L5/L8 recognition oracle設計とL6/L7 test ownership bindingを完了する。 | process_gate | config | docs/governance/feedback-test-owner-disposition-recognition.json:4-16 |
| `RC01-031` | impl-plan-traceは、srcのTypeScriptファイルがPLANのgeneratesまたは本文で参照されず、既知baselineにもない場合、不合格にする。 | process_gate | lint | src/lint/impl-plan-trace.ts:19-29; src/lint/impl-plan-trace.ts:45-50; src/lint/impl-plan-trace.ts:64-85 |
| `RC01-038` | l1-l2-consistencyは、画面設計が存在する場合、L1画面IDがL2 screen-listにないと不合格にする。 | process_gate | lint | src/lint/l1-l2-consistency.ts:63-75 |
| `RC01-039` | l1-l2-consistencyは、L2 screen-listの画面IDがL1要求にない場合、不合格にする。 | process_gate | lint | src/lint/l1-l2-consistency.ts:76-77 |
| `RC01-044` | l1-l2-consistencyは、画面設計が存在してmockのpair_artifactが空の場合、不合格にする。selfを含め非空の値は充足と扱う。 | process_gate | lint | src/lint/l1-l2-consistency.ts:67-70; src/lint/l1-l2-consistency.ts:89-91 |
| `RC01-085` | placeholder-depsは、対象文書にwaiting_layer=L7のplaceholder_depsが残る場合、不合格にする。L1〜L6待ちは件数報告だけで失敗させない。 | process_gate | lint | src/lint/placeholder-deps.ts:89-100 |
| `RC01-090` | oracle-test-traceは、draft・archived以外のテスト設計で宣言された対象oracle IDがtestsのTypeScriptに引用されずbaselineにもない場合、不合格にする。status欠落・未知値の文書も対象とする。 | evidence_claim | lint | src/lint/oracle-test-trace.ts:23-44; src/lint/oracle-test-trace.ts:64-107 |
| `RC01-137` | screen-impl-pair-freezeは、画面設計が存在し実装済み画面を宣言している場合、next_pair_freezeが非nullなのに到達していなければ不合格にする。next_pair_freeze未宣言はこの実装では拒否しない。 | process_gate | lint | src/lint/screen-impl-pair-freeze.ts:50-68; src/lint/screen-impl-pair-freeze.ts:84-112 |
| `RC02-033` | doctorのpropagation checkは、Conceptとrequirementsのsignal集合が一致しない、または正本文書を読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:777-802 |
| `RC02-034` | doctorのpair-freeze checkは、設計とテスト設計のpair欠落・参照未解決・trace孤児、または読込失敗で失敗する。 | process_gate | doctor | src/doctor/index.ts:804-827 |
| `RC02-045` | doctorのdescent-obligation checkは、trace・隣接層・defer台帳の検査後、FR unit coverage oracleで実体確認済みadvisoryを除いた結果が不合格、または読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:1154-1180 |
| `RC02-099` | doctorのplan-descent checkは、PLANとdescent baselineの検査が不合格、またはlint不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4782-4804 |
| `RC02-103` | doctorのplaceholder-deps checkは、placeholder依存検査が不合格、または設計・テスト設計を読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4872-4891 |
| `RC02-104` | doctorのG1-trace checkは、全PLANのG1-trace gateが不合格、root不在、またはtrace検査不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4893-4911; src/doctor/index.ts:7397-7397 |
| `RC02-105` | doctorのG3-trace checkは、全PLANのG3-trace gateが不合格、root不在、またはtrace検査不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4893-4911; src/doctor/index.ts:7398-7398 |
| `RC02-120` | doctorのl6-fr-coverage checkは、L6 FR被覆検査が不合格、またはmatrix読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5285-5304 |
| `RC02-126` | doctorのimpl-plan-trace checkは、sourceがPLAN generatesまたはbaselineで被覆されないなどtrace検査が不合格、または読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5431-5451 |
| `RC02-129` | doctorのscreen-impl-pair-freeze checkは、画面実装宣言が検証pairの段階順に違反するなど検査が不合格、またはscreen-list読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5497-5517 |
| `RC02-130` | doctorのl1-l2-consistency checkは、画面要求と画面設計の双方向ID被覆検査が不合格、または文書読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5519-5539 |
| `RC02-134` | doctorのoracle-test-trace checkは、oracle宣言と実test引用の突合が不合格、またはテスト設計・testを読めない場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:5620-5640 |
| `RC02-138` | doctorのverification group checkは、pair孤児とPLAN証拠から計算したgroupがverificationGroupsOkを満たさない、または検査不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5777-5799 |
| `RC02-155` | doctorのfr-registry-audit checkは、FR未登録・説明のない欠番・属性孤児・件数不一致・画面被覆孤児のいずれか、または文書読込不能で失敗する。 | process_gate | doctor | src/doctor/index.ts:6477-6513 |
| `RC02-157` | doctorのright-arm-gate-planning checkは、右腕gate計画検査が不合格、またはcarry文書読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:6560-6573 |
| `RC02-177` | doctorのsemantic-frontier-consistency checkは、semantic frontier整合検査が不合格、または文書・outstanding状態を読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:7196-7211 |
| `RC02-181` | doctorのg8-integration-workflow checkは、L8テスト設計・gates入力を読めない、またはG8 workflow検査が不合格・例外の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:7274-7295 |
| `RC02-182` | doctorのg9-system-workflow checkは、L9テスト設計・境界・gates入力を読めない、またはG9 workflow検査が不合格・例外の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:7297-7318 |
| `RC02-183` | doctorのg10-ux-workflow checkは、L10 visual design・gates入力を読めない、またはG10 workflow検査が不合格・例外の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:7320-7339 |
| `RC02-185` | full doctorは、PLAN固有V-pair binding checkのokがfalseの場合、総合判定を失敗にする。 | process_gate | doctor | src/doctor/index.ts:7390-7390; src/doctor/index.ts:7588-7588; src/doctor/index.ts:7692-7719 |
| `RC03-024` | closure authority backfill処理は、各PLAN bindingのoracle_id、parent_design、test_pathと完全一致するL8行がない場合、needs_designとする。 | process_gate | gate | src/policy/closure-authority-backfill.ts:350-362 |
| `RC03-025` | closure authority backfill処理は、PLAN bindingと完全一致するL8行が複数ある場合、候補をinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:363-368 |
| `RC03-026` | closure authority backfill処理は、一致したL8行のparent_design_statusがconfirmedでない場合、候補をinvalidとする。 | process_gate | gate | src/policy/closure-authority-backfill.ts:369-374 |
| `RC03-137` | G1またはG1-TRACEのpair checkは、L1のfreeze対象設計subdocが0件、confirmed/placeholder以外が存在、または同層のorphanが存在する場合、失敗する。 | process_gate | gate | src/gate/static.ts:78-120; src/gate/static.ts:230-235 |
| `RC03-138` | G1またはG1-TRACEは、G1-traceとして実行するPLAN lintが不合格の場合、失敗する。 | process_gate | gate | src/gate/static.ts:128-134; src/gate/static.ts:230-235 |
| `RC03-139` | G2のpair checkは、L2のfreeze対象設計subdocが0件、confirmed/placeholder以外が存在、同層のorphanが存在、またはpairArtifact=selfのwireframe.mdがない場合、失敗する。 | process_gate | gate | src/gate/static.ts:78-120; src/gate/static.ts:237-239 |
| `RC03-140` | G3またはG3-TRACEのpair checkは、L3のfreeze対象設計subdocが0件、confirmed/placeholder以外が存在、または同層のorphanが存在する場合、失敗する。 | process_gate | gate | src/gate/static.ts:78-120; src/gate/static.ts:240-245 |
| `RC03-141` | G3またはG3-TRACEは、G3-traceとして実行するPLAN lintが不合格の場合、失敗する。 | process_gate | gate | src/gate/static.ts:128-134; src/gate/static.ts:240-245 |
| `RC03-142` | G4のpair checkは、L4のfreeze対象設計subdocが0件、confirmed/placeholder以外が存在、または同層のorphanが存在する場合、失敗する。 | process_gate | gate | src/gate/static.ts:78-120; src/gate/static.ts:247-247 |
| `RC03-143` | G5のpair checkは、L5のfreeze対象設計subdocが0件、confirmed/placeholder以外が存在、または同層のorphanが存在する場合、失敗する。 | process_gate | gate | src/gate/static.ts:78-120; src/gate/static.ts:248-248 |
| `RC03-144` | G6のpair checkは、L6のfreeze対象設計subdocが0件、confirmed/placeholder以外が存在、または同層のorphanが存在する場合、失敗する。 | process_gate | gate | src/gate/static.ts:78-120; src/gate/static.ts:249-249 |
| `RC03-146` | G7は、pair freeze検査が不合格の場合、失敗する。 | process_gate | gate | src/gate/static.ts:184-186; src/gate/static.ts:201-210 |
| `RC03-148` | G7は、implementationとPLANのtrace検査が不合格の場合、失敗する。 | evidence_claim | gate | src/gate/static.ts:194-194; src/gate/static.ts:204-210 |
| `RC03-149` | G7は、oracleとtestのtrace検査が不合格の場合、失敗する。 | evidence_claim | gate | src/gate/static.ts:195-195; src/gate/static.ts:205-210 |
| `RC04-168` | Forward順序検証器は、先行gateがpassedまたはconfirmed以外なら進行を拒否する。 | process_gate | gate | src/workflow/contracts.ts:641-654 |
| `RC04-183` | FE要求抽出器は、画面のbackend capabilityとtraceの双方から根拠を得られなければ警告し、その画面の候補を生成しない。 | evidence_claim | gate | src/workflow/design-elicitation.ts:179-190 |
| `RC04-185` | FE設計gap検出器は、候補があるL3・L5・L6 slotに設計本文が無ければ警告する。 | process_gate | gate | src/workflow/design-elicitation.ts:232-250 |
| `RC04-215` | 派生trace検証器は、artifactまたはtraceが存在しないsource transitionを参照すれば失敗する。 | process_gate | gate | src/workflow/derived-requirement-trace.ts:301-302; src/workflow/derived-requirement-trace.ts:406-412 |
| `RC04-217` | 派生trace検証器は、artifactのoracle IDがsource transitionから定まるIDと違えば失敗する。 | evidence_claim | gate | src/workflow/derived-requirement-trace.ts:307-308 |
| `RC04-219` | 派生trace検証器は、各transitionにfunctional requirement・acceptance criterion・test scenarioが各1件なければ失敗する。 | process_gate | gate | src/workflow/derived-requirement-trace.ts:18-22; src/workflow/derived-requirement-trace.ts:318-325 |
| `RC04-220` | 派生trace検証器は、各transitionの8種のderived systemが各1件でなければ失敗する。 | process_gate | gate | src/workflow/derived-requirement-trace.ts:8-17; src/workflow/derived-requirement-trace.ts:327-334 |
| `RC04-221` | 派生trace検証器は、transitionのreverse traceが1件でない、またはforward artifact集合と完全一致しなければ失敗する。 | evidence_claim | gate | src/workflow/derived-requirement-trace.ts:335-349 |
| `RC04-222` | 派生trace検証器は、transitionごとのL1〜L12各層のplacementが欠落または複数なら失敗する。 | process_gate | gate | src/workflow/derived-requirement-trace.ts:351-358 |
| `RC04-223` | 派生trace検証器は、placementのID・obligation ID・oracle IDがtransitionとlayerに対応しなければ失敗する。 | evidence_claim | gate | src/workflow/derived-requirement-trace.ts:359-365 |
| `RC04-224` | 派生trace検証器は、transitionごとのcanonical V-pair edgeが欠落または複数なら失敗する。 | process_gate | gate | src/workflow/derived-requirement-trace.ts:37-44; src/workflow/derived-requirement-trace.ts:368-386 |
| `RC04-225` | 派生trace検証器は、pair edgeのID・obligation・左右placement・oracleが対応するtransitionとpairに一致しなければ失敗する。 | evidence_claim | gate | src/workflow/derived-requirement-trace.ts:387-395 |
| `RC04-226` | 派生trace検証器は、canonical集合に無い左右layerのpair edgeを拒否する。 | process_gate | gate | src/workflow/derived-requirement-trace.ts:398-403 |
| `RD05-026` | change-impactは、srcのTS/TSX変更に設計またはPLANの更新がない場合、okをfalseにして不足を通知する。 | process_gate | lint | src/lint/change-impact.ts:80-88; src/lint/change-impact.ts:159-173 |
| `RD05-027` | change-impactは、srcのTS/TSX変更にテストまたはテスト設計の更新がない場合、okをfalseにして不足を通知する。 | process_gate | lint | src/lint/change-impact.ts:95-99; src/lint/change-impact.ts:159-173 |
| `RD05-028` | change-set-integrityは、source・design・testのうち一分類だけが変更された場合、対応成果物がないと警告する。 | process_gate | lint | src/lint/change-impact.ts:191-199 |
| `RD05-029` | change-set-integrityは、source・design・testに属する変更があり三分類が揃っていない場合、不足分類を警告する。 | process_gate | lint | src/lint/change-impact.ts:201-226 |
| `RD05-031` | change-set-integrityは、適格な変更PLANのすべてで親設計・pair artifact・変更テスト証拠のいずれかが欠ける場合、失敗させる。 | process_gate | lint | src/lint/change-impact.ts:145-156; src/lint/change-impact.ts:242-255 |
| `RD05-184` | db-projection-coverageは、設計が要求するtableがDB schemaにない場合、失敗させる。 | process_gate | lint | src/lint/db-projection-coverage.ts:116-121; src/lint/db-projection-coverage.ts:167-173 |
| `RD05-185` | db-projection-coverageは、設計が指定するprimary keyが実schemaと一致しない場合、失敗させる。 | process_gate | lint | src/lint/db-projection-coverage.ts:122-130 |
| `RD05-186` | db-projection-coverageは、設計が要求するcolumnがschemaに欠ける場合、失敗させる。 | process_gate | lint | src/lint/db-projection-coverage.ts:131-139 |
| `RD05-187` | db-projection-coverageは、設計が要求するindexがschemaにない場合、失敗させる。 | process_gate | lint | src/lint/db-projection-coverage.ts:142-148 |
| `RD05-188` | db-projection-coverageは、indexのcolumn列が設計と順序を含め一致しない場合、失敗させる。 | process_gate | lint | src/lint/db-projection-coverage.ts:149-156 |
| `RD05-197` | ddd-tdd-rulesは、policy文書にWorkflow Placementがない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:94-96; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-198` | ddd-tdd-rulesは、policy文書にForward L6がない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:97-97; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-200` | ddd-tdd-rulesは、policy文書にL4/L9がない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:99-99; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-201` | ddd-tdd-rulesは、policy文書にL5/L8がない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:100-100; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-211` | ddd-tdd-rulesは、policyのDDD-INVが引用するoracle IDがL7テスト設計本文にない場合、違反にする。 | evidence_claim | lint | src/lint/ddd-tdd-rules.ts:393-406 |
| `RD05-236` | descent-obligationの既定規則は、activeなL1成果物があるtraceにL3成果物へのdescent義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:110-112; src/lint/descent-obligation.ts:297-319; src/lint/descent-obligation.ts:383-409 |
| `RD05-237` | descent-obligationの既定規則は、activeなL3成果物があるtraceにL4成果物へのdescent義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:113-113; src/lint/descent-obligation.ts:297-319; src/lint/descent-obligation.ts:383-409 |
| `RD05-238` | descent-obligationの既定規則は、activeなL4成果物があるtraceにL5成果物へのdescent義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:114-120; src/lint/descent-obligation.ts:297-319; src/lint/descent-obligation.ts:383-409 |
| `RD05-239` | descent-obligationの既定規則は、activeなL5成果物があるtraceにL6成果物へのdescent義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:121-127; src/lint/descent-obligation.ts:297-319; src/lint/descent-obligation.ts:383-409 |
| `RD05-240` | descent-obligationの既定規則は、activeなL6成果物があるtraceにL8へのpair義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:128-134; src/lint/descent-obligation.ts:297-319; src/lint/descent-obligation.ts:383-409 |
| `RD05-241` | descent-obligationの既定規則は、同一traceにactiveな実装とL5成果物がある場合、L9へのpair義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:135-141; src/lint/descent-obligation.ts:321-331 |
| `RD05-242` | descent-obligationの既定規則は、同一traceにactiveな実装とL3成果物がある場合、L12へのpair義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:142-148; src/lint/descent-obligation.ts:321-331 |
| `RD05-243` | descent-obligationの既定規則は、activeな実装があるtraceにL4成果物の存在義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:149-155; src/lint/descent-obligation.ts:321-331 |
| `RD05-244` | descent-obligationの既定規則は、activeな実装があるtraceにL5成果物の存在義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:156-162; src/lint/descent-obligation.ts:321-331 |
| `RD05-245` | descent-obligationの既定規則は、activeな実装があるtraceにL6成果物の存在義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:163-169; src/lint/descent-obligation.ts:321-331 |
| `RD05-246` | descent-obligationの既定規則は、activeな実装があるtraceにL8成果物の存在義務を生成する。 | process_gate | config／lint | src/lint/descent-obligation-types.ts:170-176; src/lint/descent-obligation.ts:321-331 |
| `RD05-248` | descent-obligationは、入力成果物のtraceKeyが空の場合、解析対象から除外しuntraceable違反で失敗させる。 | evidence_claim | lint | src/lint/descent-obligation.ts:347-359; src/lint/descent-obligation.ts:488-492 |
| `RD05-249` | descent-obligationは、sourceまたはtestでtraceKey・layer・roleが同じ成果物を異なるpathが宣言した場合、duplicate-key違反で失敗させる。 | evidence_claim | lint | src/lint/descent-obligation.ts:361-378; src/lint/descent-obligation.ts:488-492 |
| `RD05-251` | descent-obligationは、義務の対象層に同一traceのactive成果物がなく、実装未着手の有効deferにも該当しない場合、unmetとして失敗させる。 | process_gate | lint | src/lint/descent-obligation.ts:383-409; src/lint/descent-obligation.ts:488-492 |
| `RD05-252` | descent-obligationは、active実装があるtraceにL4・L5・L6・L8の有効な未解除deferが残り、その層が既にunmetとして報告されていない場合、impl-ahead違反で失敗させる。 | process_gate | lint | src/lint/descent-obligation.ts:28-28; src/lint/descent-obligation.ts:411-433; src/lint/descent-obligation.ts:488-492 |
| `RD06-051` | design-reality-binding lintは、planned_new資産の下流PLANが存在しない、または実パスがリポジトリ外の場合、失敗させる。 | process_gate | lint | src/lint/design-reality-binding.ts:830-832 |
| `RD06-052` | design-reality-binding lintは、planned_new資産のplanned_artifactが下流PLANのgeneratesにない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:833-842 |
| `RD06-068` | design-reality-binding lintは、有効なfrontmatterを持ち、binding記載済み・導入後変更済み・導入日以降更新のconfirmed L4/L5設計のいずれかに該当する文書で、所定のbinding構造がない場合、失敗させる。 | process_gate | lint | src/lint/design-reality-binding.ts:911-918; src/lint/design-reality-binding.ts:979-999 |
| `RD06-074` | design-reality-binding lintは、通常全体走査で導入後変更されたconfirmedのL4/L5 add-design PLANに、対象となるL4/L5設計成果物がない場合、失敗させる。 | process_gate | lint | src/lint/design-reality-binding.ts:85-103; src/lint/design-reality-binding.ts:1071-1087 |
| `RD06-075` | design-reality-binding lintは、通常全体走査で導入後変更されたconfirmed add-design PLANが生成する対象設計にbinding markerがない場合、失敗させる。設計ファイル不在も同じ違反になる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:1071-1094 |
| `RD06-079` | doc-consistency lintは、L3機能文書の純L4 carry宣言にあるFR-L1が詳細表にない場合、孤立参照として返す。Phase B・直接詳細化・委譲を含む行は対象外とする。 | process_gate | lint | src/lint/doc-consistency.ts:86-109 |
| `RD06-080` | doc-consistency lintは、L1機能一覧で参照する画面IDが画面要求文書内にない場合、孤立参照として返す。 | evidence_claim | lint | src/lint/doc-consistency.ts:111-128 |
| `RD06-085` | doc-consistency lintは、L6セットアップ設計のverificationMatrix[]以降にcompletion-review-bundleがない場合、不足として返す。 | process_gate | lint | src/lint/doc-consistency.ts:168-172; src/lint/doc-consistency.ts:202-204 |
| `RD06-172` | forward-convergence lintは、kind=implでconfirmedまたはcompletedのPLANがForwardに接続せず、有効な集約免除もReverse参照もなく、既知負債集合にもない場合、失敗させる。 | process_gate | lint／doctor | src/lint/forward-convergence.ts:115-125; src/lint/forward-convergence.ts:143-150; src/lint/forward-convergence.ts:166-235 |
| `RD06-175` | FR registry監査lintは、画面要求またはL3機能文書で参照されるFR-L1がL1機能一覧に未登録で、carry・forwardによる説明もない場合、登録漏れとして返す。 | process_gate | lint | src/lint/fr-registry-audit.ts:165-176 |
| `RD06-179` | FR registry監査lintは、機能要求の出典docが空の場合、属性不足として返す。 | evidence_claim | lint | src/lint/fr-registry-audit.ts:193-198 |
| `RD06-183` | FR registry監査lintは、対応画面欄が空の要求を属性不足として返し、P0要求の場合は画面被覆不足にも計上する。 | process_gate | lint | src/lint/fr-registry-audit.ts:197-198; src/lint/fr-registry-audit.ts:220-223 |
| `RD07-005` | frontend-design-coverageは、document-system-mapにFE下降鎖のマーカーsrc/webがなければ失敗する。 | process_gate | lint | src/lint/frontend-design-coverage.ts:153-158 |
| `RD07-006` | g1-traceは、抽出した業務・UX要求に画面への対応が一件もなければ失敗する。 | process_gate | lint | src/lint/g1-trace.ts:95-104; src/lint/g1-trace.ts:128-170 |
| `RD07-007` | g1-traceは、抽出した画面に業務・UX・機能要求への参照が一件もなければ失敗する。 | process_gate | lint | src/lint/g1-trace.ts:106-116; src/lint/g1-trace.ts:128-170 |
| `RD07-008` | g1-traceは、P0機能要求に画面への対応が一件もなければ失敗する。 | process_gate | lint | src/lint/g1-trace.ts:118-125; src/lint/g1-trace.ts:128-170 |
| `RD07-009` | g1-traceは、画面要求PLANまたはrelated_l1_screenに言及するL3 PLANが、指定されたL1の業務・機能・画面要求PLANのいずれかを含まなければ失敗する。 | process_gate | lint | src/lint/g1-trace.ts:24-28; src/lint/g1-trace.ts:139-170 |
| `RD07-018` | g3-traceは、L1機能要求に同番号のL3機能要求もcarry宣言もなければ失敗する。 | process_gate | lint | src/lint/g3-trace.ts:155-162; src/lint/g3-trace.ts:195-204 |
| `RD07-019` | g3-traceは、各L3機能要求に対応するACが最低一件なければ失敗する。 | process_gate | lint | src/lint/g3-trace.ts:155-162; src/lint/g3-trace.ts:206-212 |
| `RD07-020` | g3-traceは、各ACについて直接対応または末尾2桁を除いた候補に前方一致するATがなければ失敗する。 | process_gate | lint | src/lint/g3-trace.ts:155-162; src/lint/g3-trace.ts:214-227 |
| `RD07-021` | g3-traceは、AT-FR-NN-MM形式の受入テストに完全対応するAC-FR-NN-MMがなければ失敗する。 | process_gate | lint | src/lint/g3-trace.ts:155-162; src/lint/g3-trace.ts:229-236 |
| `RD07-022` | g3-traceは、固定リストのL1非機能要求がL3 nfr-gradeで一件でも被覆されていなければ失敗する。 | process_gate | lint | src/lint/g3-trace.ts:105-112; src/lint/g3-trace.ts:238-242 |
| `RD08-020` | L6 completion判定器は、pair_artifactが指定形式でない、読込済み単体テスト設計集合にない、または専用pairのPAIR_PATH markerが結合本文にない場合、freezeInputReadyとreadyをfalseにする。 | process_gate | lint | src/lint/l6-completion.ts:40-45; src/lint/l6-completion.ts:111-121; src/lint/l6-completion.ts:143-162 |
| `RD08-021` | L6 completion判定器は、単体テスト設計の結合本文にL6文書のbasenameがない場合、freezeInputReadyとreadyをfalseにする。 | process_gate | lint | src/lint/l6-completion.ts:122-125; src/lint/l6-completion.ts:143-162 |
| `RD08-027` | L6 completion loaderは、単体テスト設計本文からPAIR_PATH markerを取得できない場合、例外で読込を失敗させる。 | tooling_runtime | lint | src/lint/l6-completion.ts:211-216 |
| `RD08-028` | L6 FR coverage lintは、入力FR集合の要件に対応するcoverage行がない場合、ok=falseと警告を返す。 | process_gate | lint | src/lint/l6-fr-coverage.ts:111-115; src/lint/l6-fr-coverage.ts:170-176; src/lint/l6-fr-coverage.ts:209-212 |
| `RD08-029` | L6 FR coverage lintは、coverage行に入力FR集合にないIDがある場合、ok=falseと警告を返す。 | process_gate | lint | src/lint/l6-fr-coverage.ts:116-119; src/lint/l6-fr-coverage.ts:170-176; src/lint/l6-fr-coverage.ts:214-217 |
| `RD08-030` | L6 FR coverage lintは、coverage行のl6_specが空の場合、不完全行として失敗させる。 | process_gate | lint | src/lint/l6-fr-coverage.ts:125-136; src/lint/l6-fr-coverage.ts:170-176 |
| `RD08-031` | L6 FR coverage lintは、unit_contractが空、またはバッククォート付き契約識別子を1件も抽出できない場合、不完全行として失敗させる。 | process_gate | lint | src/lint/l6-fr-coverage.ts:44-46; src/lint/l6-fr-coverage.ts:125-136 |
| `RD08-032` | L6 FR coverage lintは、unit_oracleにU-*形式の識別子がない場合、不完全行として失敗させる。 | process_gate | lint | src/lint/l6-fr-coverage.ts:125-136 |
| `RD08-033` | L6 FR coverage lintは、空でないunit_oracleがU-に当該fr_idを連結した値と一致しない場合、失敗させる。 | process_gate | lint | src/lint/l6-fr-coverage.ts:40-42; src/lint/l6-fr-coverage.ts:130-135 |
| `RD08-034` | L6 FR coverage lintは、repoRootが指定され、l6_specがdocs/で始まる場合、その設計ファイルを読み取れなければ失敗させる。 | evidence_claim | lint | src/lint/l6-fr-coverage.ts:55-59; src/lint/l6-fr-coverage.ts:138-141 |
| `RD08-035` | L6 FR coverage lintは、読み取れたL6仕様本文にunit_contractから抽出した契約名が含まれない場合、失敗させる。 | process_gate | lint | src/lint/l6-fr-coverage.ts:142-150 |
| `RD08-060` | left-arm carry lintは、解消PLANのgeneratesに現行test-design集合の成果物が1件も含まれない場合、失敗させる。 | process_gate | lint | src/lint/left-arm-carry-log.ts:383-390 |
| `RD09-024` | plan-descentは、archivedとPLAN-DISCOVERY-*を除くimpl/add-impl PLANにparent_designがない場合、baseline免除対象以外を失敗させる。 | process_gate | lint／gate | src/lint/plan-descent.ts:189-196; src/lint/plan-descent.ts:250-275 |
| `RD09-025` | plan-descentは、対象PLANのparent_designが実在するdocs/design/配下のL6-*設計文書でない場合、baseline免除対象以外を失敗させる。 | process_gate | lint／gate | src/lint/plan-descent.ts:170-172; src/lint/plan-descent.ts:197-203; src/lint/plan-descent.ts:258-274 |
| `RD09-026` | plan-descentは、対象PLANがconfirmedまたはcompletedなのに親設計がconfirmedでない場合、baseline免除対象以外を失敗させる。add-implかつroute_mode=add-featureは除外する。 | process_gate | lint／gate | src/lint/plan-descent.ts:204-217; src/lint/plan-descent.ts:263-274 |
| `RD09-027` | plan-descentは、対象PLANのpair_artifactがdocs/test-design/配下の実在pathでない場合、baseline免除対象以外を失敗させる。 | process_gate | lint／gate | src/lint/plan-descent.ts:219-225; src/lint/plan-descent.ts:263-274 |
| `RD09-028` | plan-descentは、created未記入または2026-07-08以降の対象PLANで、pair_artifactが許可されたL7/L8単体テスト設計に該当しない場合、baseline免除対象以外を失敗させる。 | process_gate | lint／gate | src/lint/plan-descent.ts:174-186; src/lint/plan-descent.ts:226-234; src/lint/plan-descent.ts:263-274 |
| `RD09-050` | plan-specific-vpair-bindingは、archived以外のimpl/add-impl/recovery PLANでverification_bindingsが未定義または空配列の場合、違反とする。有効な未解消baseline fingerprintに一致する違反だけを免除する。 | process_gate | lint | src/lint/plan-specific-vpair-binding.ts:789-793; src/lint/plan-specific-vpair-binding.ts:830-837; src/lint/plan-specific-vpair-binding.ts:1002-1013 |
| `RD09-052` | plan-specific-vpair-bindingは、generatesに宣言されたtest_codeのpathが有効なverification bindingに含まれない場合、違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:558-572; src/lint/plan-specific-vpair-binding.ts:859-866 |
| `RD09-054` | plan-specific-vpair-bindingは、bindingのparent_designがPLAN自身のparent_designと一致しない場合、違反とする。 | process_gate | lint | src/lint/plan-specific-vpair-binding.ts:872-879 |
| `RD09-056` | plan-specific-vpair-bindingは、bindingのoracle_idがpair_artifactのeligible表に存在しない場合、違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:881-893 |
| `RD09-057` | plan-specific-vpair-bindingは、bindingのoracle_idに一致するeligible表の行が複数ある場合、違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:891-894 |
| `RD09-058` | plan-specific-vpair-bindingは、一意に見つかったoracle行のtest citationにbindingのtest_pathが含まれない場合、違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:895-903 |
| `RD09-059` | plan-specific-vpair-bindingは、bindingのtest_pathがPLANのgeneratesまたはmodifiesのtest_codeとして宣言されていない場合、違反とする。 | process_gate | lint | src/lint/plan-specific-vpair-binding.ts:558-576; src/lint/plan-specific-vpair-binding.ts:904-905 |
| `RD09-061` | plan-specific-vpair-bindingは、テスト本文に境界付きのexact PLAN ID citationがない場合、違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:910-912 |
| `RD09-062` | plan-specific-vpair-bindingは、テスト内にbindingのoracle_idで始まる実行可能なit/test caseがexactに1件ない場合、違反とする。静的な「oracle_id: 」形式のtitleと関数callbackを持つ呼出しだけを数える。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:485-530; src/lint/plan-specific-vpair-binding.ts:913-917 |
| `RD09-063` | plan-specific-vpair-bindingは、同じoracle_idが複数の異なるtest_pathへbindingされている場合、関係するPLANを違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:919-937 |
| `RD09-094` | proposal-document-coverageは、各シナリオのrequired_test_docsに所定IDとpathのcross-layer routing文書がない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage.ts:120-133 |
| `RD09-095` | proposal-document-coverageは、分類patternが複数あるのにrequired_evidenceにcross_artifact_traceがない場合、失敗させる。 | evidence_claim | lint | src/lint/proposal-document-coverage.ts:135-144 |
| `RD09-096` | proposal-document-coverageは、分類器が必須として返した設計文書またはテスト文書のpathが存在しない場合、失敗させる。 | process_gate | lint | src/lint/proposal-document-coverage.ts:146-155 |
| `RD09-113` | proposal-document-coverageは、test-designを期待するシナリオでrequirements_traceabilityがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | src/lint/proposal-document-coverage-policy.ts:60-60; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-133` | proposal-document-coverageは、routing文書にDOCROUTE-U-01〜08、DOCROUTE-IT-01〜03、DOCROUTE-ST-01のいずれかがない場合、失敗させる。 | evidence_claim | lint | src/lint/proposal-document-coverage-policy.ts:90-103; src/lint/proposal-document-coverage.ts:215-223 |
| `RD09-147` | relation graph投影は、DB tableにupstream参照がない場合、orphan-table警告を返す。 | evidence_claim | lint | src/lint/relation-graph.ts:279-293 |
| `RD09-148` | relation impact分析は、変更sourceに解決可能なcovered-byのsibling testがない場合、missing-test-coverage警告と被覆追加actionを返す。 | evidence_claim | lint | src/lint/relation-graph.ts:431-432; src/lint/relation-graph.ts:460-471 |
| `RD10-140` | frontier整合lintは確定機能catalogのL1 parent markerがL1文書に独立tokenとして存在しなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:307-311; src/lint/semantic-frontier-consistency.ts:526-528 |
| `RD10-142` | frontier整合lintは確定機能catalogが要求するL3要求IDの表行が欠ける場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:318-322 |
| `RD10-143` | frontier整合lintは確定機能catalogが要求するL12受入IDの表行が欠ける場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:323-327 |
| `RD10-144` | frontier整合lintはL3要求表に確定意味catalogが被覆しないIDがある場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:329-338 |
| `RD10-145` | frontier整合lintはL12受入表に確定意味catalogが被覆しないIDがある場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:339-348 |
| `RD10-151` | frontier整合lintは確定機能recordに期待するL1 parentが欠ける場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:384-388 |
| `RD10-152` | frontier整合lintは確定機能recordに期待するL3要求IDが欠ける場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:389-395 |
| `RD10-153` | frontier整合lintは確定機能recordに期待するL12受入IDが欠ける場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:396-402 |
| `RD10-156` | frontier整合lintは対象のL3〜L6および対応検証文書に規定のfrontier markerが欠ける場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:96-103; src/lint/semantic-frontier-consistency.ts:415-430 |
| `RD10-161` | frontier整合lintは実在する期待frontierに対応するL3 markerが欠ける場合に失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:468-473 |
| `RD11-158` | WCC trace lintは、ACが未定義FRを参照した場合に失敗する。 | evidence_claim | lint | src/lint/wcc-trace.ts:167-167; src/lint/wcc-trace.ts:203-205 |
| `RD11-159` | WCC trace lintは、HATが未定義FRを参照した場合に失敗する。 | evidence_claim | lint | src/lint/wcc-trace.ts:168-168; src/lint/wcc-trace.ts:206-208 |
| `RD11-160` | WCC trace lintは、HATが未定義ACを参照した場合に失敗する。 | evidence_claim | lint | src/lint/wcc-trace.ts:169-169; src/lint/wcc-trace.ts:209-211 |
| `RD11-161` | WCC trace lintは、どのACにも被覆されないFRがある場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:170-170; src/lint/wcc-trace.ts:213-217 |
| `RD11-162` | WCC trace lintは、どのHATにも被覆されないFRがある場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:171-171; src/lint/wcc-trace.ts:215-218 |
| `RD11-163` | WCC trace lintは、どのHATにも被覆されないACがある場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:172-172; src/lint/wcc-trace.ts:216-219 |
| `RD11-164` | WCC trace lintは、対応FRがないACがallowlist外の場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:26-26; src/lint/wcc-trace.ts:173-173; src/lint/wcc-trace.ts:221-225 |
| `RD11-165` | WCC trace lintは、対応FRがないHATがallowlist外の場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:27-27; src/lint/wcc-trace.ts:174-174; src/lint/wcc-trace.ts:226-229 |
| `RD11-166` | WCC trace lintは、FRなしACのallowlist項目が実在しない、または実際にはFRを持つ場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:175-175; src/lint/wcc-trace.ts:231-234 |
| `RD11-167` | WCC trace lintは、FRなしHATのallowlist項目が実在しない、または実際にはFRを持つ場合に失敗する。 | process_gate | lint | src/lint/wcc-trace.ts:176-176; src/lint/wcc-trace.ts:235-237 |
| `RD11-168` | WCC trace lintは、HATが直接参照するFRが、そのHATの参照AC群に対応するFR和集合に含まれない場合に失敗する。 | evidence_claim | lint | src/lint/wcc-trace.ts:177-177; src/lint/wcc-trace.ts:239-246 |
| `RD11-169` | WCC trace lintは、L10のoracle表とtrace表のHAT ID集合が一致しない場合に失敗する。 | evidence_claim | lint | src/lint/wcc-trace.ts:178-178; src/lint/wcc-trace.ts:248-256 |
| `RE01-003` | 作業者はL1–L12と六つの正規V-pairを使用し、旧層番号を新規判断へ混在させてはならない。 | process_gate | prose | docs/governance/helix-harness-requirements_v1.2.md:26-31 |
| `RE01-007` | 実装PLANの検証者は、必要な親設計PLANが存在しない場合に実装の進行を拒否する。 | process_gate | lint | docs/governance/helix-harness-requirements_v1.2.md:93-93; docs/governance/helix-harness-requirements_v1.2.md:358-358; docs/governance/helix-harness-requirements_v1.2.md:411-413 |
| `RE01-010` | 作業者は物理パスから層のauthorityを推定せず、L3.5・L3.8・L4.5やreleaseを独立したVモデル層として追加してはならない。 | process_gate | prose | docs/governance/helix-harness-requirements_v1.2.md:192-216 |
| `RE01-019` | 追加実装の担当者は対応する設計・検証pairへの双方向参照を用意し、doctorは参照不足を検出する。 | process_gate | doctor | docs/governance/helix-harness-requirements_v1.2.md:417-429 |
| `RE01-028` | PLAN作成者は必須のpair・関連要求・freeze情報を欠落させず、sub-documentの重複や理由のないskipを許してはならない。 | process_gate | lint | docs/governance/helix-harness-requirements_v1.2.md:493-508 |
| `RE01-048` | 実装者は対応する設計とテスト設計のpairをfreezeしてから実装へ進み、freeze不足を回避してはならない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:751-766 |
| `RE01-051` | trace検証器は必須八方向の参照についてパスを正規化し、対象の実在と逆参照を確認する。残る規定四方向の不足は警告する。 | process_gate | lint／gate | docs/governance/helix-harness-requirements_v1.2.md:778-804 |
| `RE01-162` | L3進行の判断者はrebaseline文書と現行契約を併せて参照し、互換資料だけをfreeze根拠にしてはならない。 | process_gate | prose | docs/governance/helix-harness-requirements_v1.3.md:1-4 |
| `RE01-165` | 作業者はL1–L12と六つの正規pairを使用し、旧層番号を新規PLAN・template・generator・DB・進捗・tagの判断へ出力しない。 | process_gate | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:16-21; docs/governance/helix-harness-requirements_v1.3.md:59-61; docs/governance/helix-harness-requirements_v1.3.md:593-598 |
| `RE01-170` | L6実装者はL5で定めた範囲内で実装し、scopeを追加せず、TDDと対応する双方向の追跡を閉じる。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:44-57 |
| `RE01-200` | UI変更担当者は不足する上流のbackfill receiptを揃えてからreview・releaseへ進む。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:271-271 |
| `RE01-252` | 安全機能の実装者は規定の五sliceを順序どおり進め、各sliceでL4/L5とL8/L9/L10、mutation、DB receipt、独立review、main read-afterを揃える。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:492-503 |
| `RE01-272` | 設計者はG3でno-code判断・owner・複雑性をfreezeし、L4/L9でDDD境界、L5/L8でDbC、L6/L7でRed・最小Green・Refactorを対応づける。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:550-555 |
| `RE01-283` | freeze判断者は未解決の分岐を残さず、全transitionをFR・AC・test・source・対応pairへ結び付ける。schema gapがある状態でactivationしない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:637-664 |
| `RG09-010` | Forward L6担当者は、L7実装の開始前にdomain boundary・invariant・rule IDを定義または更新する。 | process_gate | prose | docs/governance/ddd-tdd-rules.md:149-149 |
| `RG14-009` | 配置担当者は、未実体化targetについて、対応するpair-freeze／Forward PLANに至るまでdirectory自体を作成してはならない。 | process_gate | prose | docs/governance/repository-structure.md:99-100 |
| `RG18-001` | 実装者はcoding前にL5設計書を読み、実装上の疑問に答える内容があることを確認する。 | process_gate | prose | docs/skills/incremental-implementation.md:41-42 |

## 副として対応づいた規則（214件）

`RA-196`、`RA-212`、`RA-213`、`RA-216`、`RA-218`、`RA-223`、`RA-232`、`RA-364`、`RB0-057`、`RB0-108`、`RB0-134`、`RB0-157`、`RB0-166`、`RB04-034`、`RB04-035`、`RB04-054`、`RB04-056`、`RB04-065`、`RB04-068`、`RB04-075`、`RB04-082`、`RB04-084`、`RB04-100`、`RB04-103`、`RB04-137`、`RB04-153`、`RB04-162`、`RB04-243`、`RB05-010`、`RB05-031`、`RB05-038`、`RB05-066`、`RB05-078`、`RB05-094`、`RB05-105`、`RB05-107`、`RB05-113`、`RB05-118`、`RB05-119`、`RB05-132`、`RB05-137`、`RB05-140`、`RB05-141`、`RB05-179`、`RB05-219`、`RB05-225`、`RB05-228`、`RB05-233`、`RB05-242`、`RB05-245`、`RB05-247`、`RB05-287`、`RB05-288`、`RB05-313`、`RB05-340`、`RB05-349`、`RB05-352`、`RB05-369`、`RB05-376`、`RB05-377`、`RB06-003`、`RB06-026`、`RB06-029`、`RB06-049`、`RB06-060`、`RB06-071`、`RB06-092`、`RB06-093`、`RB06-097`、`RB06-107`、`RB06-115`、`RB06-118`、`RB06-121`、`RB06-122`、`RB06-201`、`RB06-263`、`RB06-268`、`RB06-271`、`RB06-284`、`RB07-015`、`RB07-044`、`RB07-063`、`RB07-108`、`RB07-114`、`RB07-130`、`RB07-137`、`RB07-158`、`RB07-164`、`RB07-174`、`RB07-178`、`RB07-179`、`RB07-211`、`RB07-213`、`RB07-222`、`RB07-225`、`RB07-236`、`RB07-265`、`RB07-268`、`RB07-275`、`RB07-278`、`RB07-280`、`RB07-292`、`RB07-304`、`RB07-310`、`RB07-317`、`RB07-321`、`RB07-324`、`RB07-328`、`RB08-001`、`RB08-026`、`RB08-040`、`RB08-088`、`RB08-101`、`RB08-109`、`RB08-115`、`RB08-118`、`RB08-120`、`RB08-146`、`RB08-156`、`RB08-164`、`RB08-169`、`RB08-213`、`RB08-223`、`RB08-228`、`RB08-231`、`RB08-240`、`RB08-246`、`RB08-257`、`RB08-301`、`RB08-303`、`RB08-304`、`RB08-313`、`RB08-335`、`RB09-039`、`RB09-071`、`RB09-076`、`RC0-088`、`RC0-089`、`RC0-090`、`RC0-091`、`RC0-092`、`RC0-093`、`RC0-095`、`RC00-113`、`RC00-139`、`RC00-140`、`RC01-087`、`RC02-053`、`RC02-076`、`RC02-107`、`RC02-153`、`RC03-021`、`RC03-022`、`RC03-027`、`RC03-028`、`RC03-147`、`RC04-120`、`RC04-184`、`RC04-212`、`RC04-213`、`RC04-216`、`RD04-228`、`RD05-247`、`RD06-030`、`RD06-039`、`RD06-050`、`RD06-053`、`RD06-100`、`RD06-106`、`RD06-190`、`RD06-194`、`RD08-022`、`RD08-025`、`RD08-047`、`RD08-059`、`RD08-063`、`RD09-029`、`RD09-051`、`RD09-053`、`RD09-055`、`RD09-060`、`RD09-075`、`RD09-097`、`RD09-149`、`RD09-156`、`RD10-044`、`RD10-062`、`RD10-120`、`RD10-150`、`RD10-155`、`RD11-060`、`RD11-072`、`RD11-155`、`RD11-156`、`RD11-157`、`RE01-011`、`RE01-029`、`RE01-045`、`RE01-049`、`RE01-057`、`RE01-062`、`RE01-065`、`RE01-105`、`RE01-166`、`RE01-167`、`RE01-172`、`RE01-175`、`RE01-197`、`RE01-198`、`RE01-235`、`RG09-017`、`RG10-015`、`RG12-005`、`RG16-018`
