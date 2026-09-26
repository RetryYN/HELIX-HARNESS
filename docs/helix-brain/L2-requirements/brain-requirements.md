---
title: "HELIX-BRAIN要求候補"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: requirement
status: draft
authority_status: draft_candidate
freeze_blocking: true
parent_concept: docs/concept/helix-concept.md
parent_planning: docs/helix-brain/L1-planning/brain-intent.md
pair_artifact: docs/helix-brain/L11-acceptance/brain-acceptance.md
sources:
  - docs/helix-brain/sources/brain-l1-idea-po-original-2026-09-26.md
  - docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md
  - docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md
  - docs/governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md
---

# HELIX-BRAIN要求候補

本書は、[HELIX Concept](../../concept/helix-concept.md)と[HELIX-BRAIN L1企画案](../L1-planning/brain-intent.md)を親にし、POの2026-09-25・09-26記録と旧HELIX資産を起点にしたL2候補である。L1本文は`draft_candidate`で対象revisionのPO確認待ちであり、本書も未採択である。文書、ID登録、L11、review、mergeから要求合意、L3承認、実装・昇格・運用許可を作らない。L1またはPO原文の意味を変更する項目は、本候補内で確定せず「人の判断が残る点」に具体案を示す。

本書は単体、機構間接続、複数機構の構成体を別要求にする。単体packの受入だけで接続または構成体を成立扱いしない。各要求は独立した機能identity、入出力、保証、依存、検証範囲、version_target、失敗時の戻し先を持つ。項目のversion_targetは能力の目標版であり、未採択の実artifact版・契約版ではない。

## 共通境界とパック契約

- HELIX-BRAINは、製品横断で再利用できる設計知識の構造を持つ。製品固有の要求・設計・判断、稼働するInfrastructure状態、実ログ／metrics、provider account、credential、実行操作を持たない。製品固有の意味・採用判断は各製品のHELIX-HARNESS-COREと適切な接続先、実状態はそれぞれのownerに残す。
- BRAINのknowledge promotionは、提案、LABO評価、OSによる登録・振り分け、BRAIN変更手続きの独立検証、採否状態を別々に扱う。AI生成、実績一件、LABOの単独評価、OS ticket、本文の存在だけで汎用知識へ昇格しない。意味の上流変更を要しない技術的差分に新しい人間承認gateを足さない。
- 機能pack共通のidentity/kind、入出力contract、契約版、実artifact版、依存版、互換範囲、検証範囲、交換・更新・rollbackと未完義務の引継ぎはHARNESS-L2-010/011の共通契約に従う。本書は共通pack lifecycleを再定義・所有しない。BRAIN固有の知識identityとversion/stateはL2-008で定める。
- BRAINの利用側はdescriptorにある機能identity、必要契約版、成果物版、依存identity/version、compatibility rangeを照合し、unknownまたはrange不一致で呼出しを止める。`version_target`（1.0/2.0等）は能力目標であり、実版ではない。候補に実版はまだない。
- 版境界: BRAINの初期内部実績・seed、12のL1機能、Infrastructureの17要求と1.0接続は`version_target: 1.0`。外部情報の対象を決め打ちせず、LABOでの分解・比較・評価を経て知識候補として扱う経路は`version_target: 2.0`。1.0で2.0 capabilityを必須にせず、2.0候補も保留表だけにせず本書とL11に独立要求として置く。

## 候補一覧

番号について：一般系列のHELIXBRAIN-L2-013〜017は未使用の欠番で、予約・要求の省略・延期を表さない。起草時にInfrastructureを既存の別系列HELIXBRAIN-L2-INFRA-001〜017へ分け、接続以降の一般系列018〜028を保持したためである。INFRA系列と一般系列は別identityであり、欠番から新たな要求を生成しない。

| 要求ID | 種類 | 親L1 | 対象能力 | version_target |
|---|---|---|---|---|
| HELIXBRAIN-L2-001 | unit | L1-001 | 領域の識別・追加・分割・統合・退役 | 1.0 |
| HELIXBRAIN-L2-002 | unit | L1-002 | Domain→Pattern→Design Unit→Partの構造 | 1.0 |
| HELIXBRAIN-L2-003 | unit | L1-003 | Pattern適用条件・根拠・失敗情報 | 1.0 |
| HELIXBRAIN-L2-004 | unit | L1-004 | 複数成立Patternの比較可能性 | 1.0 |
| HELIXBRAIN-L2-005 | unit | L1-005 | 構造間の意味relation | 1.0 |
| HELIXBRAIN-L2-006 | unit | L1-006 | Visual Design・UX再利用構造 | 1.0 |
| HELIXBRAIN-L2-007 | unit | L1-007 | provenanceと昇格状態 | 1.0 |
| HELIXBRAIN-L2-008 | unit | L1-008 | knowledge identity/version/state | 1.0 |
| HELIXBRAIN-L2-009 | unit | L1-009 | Pattern構成候補 | 1.0 |
| HELIXBRAIN-L2-010 | unit | L1-010 | Anti-Patternと失敗知識 | 1.0 |
| HELIXBRAIN-L2-011 | unit | L1-011 | 製品固有知識の混入境界 | 1.0 |
| HELIXBRAIN-L2-012 | unit | L1-012 | 候補提供と採用authorityの分離 | 1.0 |
| HELIXBRAIN-L2-INFRA-001 | unit | L1-001 | Infrastructure Domain / 20 subdomain例 | 1.0 |
| HELIXBRAIN-L2-INFRA-002 | unit | L1-002 | Infrastructureの共通階層 | 1.0 |
| HELIXBRAIN-L2-INFRA-003 | unit | L1-003 | Pattern成立条件 | 1.0 |
| HELIXBRAIN-L2-INFRA-004 | unit | L1-003/005 | NFRからPatternと設計inputへのrelation | 1.0 |
| HELIXBRAIN-L2-INFRA-005 | unit | L1-010 | Failure構造 | 1.0 |
| HELIXBRAIN-L2-INFRA-006 | unit | L1-002/010 | Recovery Pattern | 1.0 |
| HELIXBRAIN-L2-INFRA-007 | unit | L1-004 | Deployment Pattern比較 | 1.0 |
| HELIXBRAIN-L2-INFRA-008 | unit | L1-003 | Scaling・Capacity Pattern | 1.0 |
| HELIXBRAIN-L2-INFRA-009 | unit | L1-003 | Observability知識 | 1.0 |
| HELIXBRAIN-L2-INFRA-010 | unit | L1-003/010 | Backup・Restore・Recoverability | 1.0 |
| HELIXBRAIN-L2-INFRA-011 | unit | L1-004 | Cost characteristic | 1.0 |
| HELIXBRAIN-L2-INFRA-012 | unit | L1-005/011 | Provider abstractionとimplementation例 | 1.0 |
| HELIXBRAIN-L2-INFRA-013 | unit | L1-001/002 | Runtime resource abstraction | 1.0 |
| HELIXBRAIN-L2-INFRA-014 | unit | L1-005 | Infrastructure topology graph | 1.0 |
| HELIXBRAIN-L2-INFRA-015 | unit | L1-005 | Domain横断relation | 1.0 |
| HELIXBRAIN-L2-INFRA-016 | unit | L1-010 | Infrastructure Anti-Pattern | 1.0 |
| HELIXBRAIN-L2-INFRA-017 | unit | L1-007/008 | Pattern maturity | 1.0 |
| HELIXBRAIN-L2-018 | connection | L1-007/011 | HELIX-HARNESS-CORE→BRAIN候補入力 | 1.0 |
| HELIXBRAIN-L2-019 | connection | L1-003/004/012 | BRAIN→HELIX-HARNESS-CORE候補提供 | 1.0 |
| HELIXBRAIN-L2-020 | connection | L1-007/009/010 | LABO→BRAIN評価済み候補 | 1.0 |
| HELIXBRAIN-L2-021 | connection | L1-003/004/012 | BRAIN↔INTELLIGENCE知識・判断材料 | 1.0 |
| HELIXBRAIN-L2-022 | connection | L1-003/005/012 | BRAIN→HARNESS設計input | 1.0 |
| HELIXBRAIN-L2-023 | connection | L1-006/007/009 | BRAIN↔Visual Design HARNESS | 1.0 |
| HELIXBRAIN-L2-024 | composite | L1-007/008/010 | Infrastructure設計知識と実績のCORE/LABO経由分離 | 1.0 |
| HELIXBRAIN-L2-025 | composite | L1-007/008/009/011 | 内部知識提案から独立検証・状態確定まで | 1.0 |
| HELIXBRAIN-L2-026 | connection | L1-007/009/010 | 外部情報→LABO→BRAIN入力境界 | 2.0 |
| HELIXBRAIN-L2-027 | composite | L1-007/009/010/011 | 外部sourceの分解・評価・登録・知識候補化 | 2.0 |
| HELIXBRAIN-L2-028 | unit | L1-008 | BRAIN知識pack descriptorへの版・互換適用 | 1.0 |

## BRAIN単体要求

### HELIXBRAIN-L2-001 領域の識別と進化

- **親L1**：`HELIXBRAIN-L1-001`。

- **受け取るもの**：設計知識の領域定義と追加・分割・統合・退役案。製品名や個別project名を領域にしない。
- **提供するもの**：領域identity、意味、状態、Patternとの関係を識別できる分類構造。
- **保証すること**：領域一覧を固定enumにせず追加・分割・統合・退役できる。1.0でschemaが扱う初期領域はSoftware Architecture、Application Architecture、Backend、Frontend、API / Integration、Data / Database、Infrastructure、Security、Visual Design、UX / Interaction。Visual DesignとUX / InteractionはPO回答により1.0へ加える。Reliability / Recovery、Performance、Observability、Testing / Quality、Operations / Maintenance、Accessibility等は追加可能な候補であり、初版に全領域を充実させる義務にしない。
- **依存・検証／版**：BRAIN L1-001とConceptの機構境界。追加・分割・統合・退役のそれぞれで既存参照先を識別し、製品／projectをDomain化する例を拒否する。1.0。
- **失敗時の戻し先**：分類意味が重複・不明ならDomain候補のまま停止し、意味差をL1-001へ戻す。既存relationの利用者を消さない。
- **束ねる条件**：PO原文§BRAIN-L1-001、§初期Domain候補、Visual Designの1.0回答。

### HELIXBRAIN-L2-002 構造階層

- **親L1**：`HELIXBRAIN-L1-002`。

- **受け取るもの**：Domain、Pattern、Design Unit、Partのidentityと包含・構成relation。
- **提供するもの**：`Domain → Pattern → Design Unit → Part`以上の構造を辿れる再利用知識。
- **保証すること**：単なるfile、code snippet、UI component集をPattern知識と誤認しない。各段階の責務と親を識別し、Visual Design例のDashboard Pattern、Navigation / KPI / Work Area Unit、Table / Filter / Status Partのような構成を表せる。
- **依存・検証／版**：L1-002、L2-001。階層の各identityと関係を検証し、孤立・誤種別をunknownにする。1.0。
- **失敗時の戻し先**：階層を決められない項目は候補として保留し、要素の意味をL1-002へ戻す。
- **束ねる条件**：PO原文§BRAIN-L1-002。

### HELIXBRAIN-L2-003 Patternの成立条件

- **親L1**：`HELIXBRAIN-L1-003`。

- **受け取るもの**：Pattern候補とsource、対象問題、前提、利用時に必要なinput。
- **提供するもの**：問題、前提、applicability、required input、constraint、trade-off、negative case、failure mode、compatible / incompatible pattern、evidence、maturityを持つPattern descriptor。
- **保証すること**：「Patternが存在する」ことを「今回適用できる／採用すべき」と同一視しない。必須条件が未入力またはunknownなら適用可能と断定しない。
- **依存・検証／版**：L1-003、L2-002。条件充足・不充足・unknownの各fixtureと必要inputの欠落を別々に確認する。1.0。
- **失敗時の戻し先**：条件の意味・必須inputが未定なら適用提案を止め、L1-003または該当する要求意味のownerへ返す。
- **束ねる条件**：PO原文§BRAIN-L1-003、旧DST-HARNESS-002のtemplate意味契約。

### HELIXBRAIN-L2-004 複数Patternの比較

- **親L1**：`HELIXBRAIN-L1-004`。

- **受け取るもの**：同じ問題に対する複数の成立可能なPatternと各適用条件。
- **提供するもの**：長所、短所、constraint、failure、cost、適用条件を並べて比較できる候補集合。
- **保証すること**：成立する選択肢を一つの絶対解に上書きせず、選択をBRAINの決定として行わない。比較軸が欠ければ欠落を示す。
- **依存・検証／版**：L1-004、L2-003/012。Strong Consistency、Eventual Consistency、Compensating Transactionの例で複数候補が残り、どれを今回採るかをBRAINが決めないことを確認する。1.0。
- **失敗時の戻し先**：比較に必要な要求値や重みがない場合は選択を保留し、HARNESS-CORE／INTELLIGENCE／人間の適切な判断先へ返す。
- **束ねる条件**：PO原文§BRAIN-L1-004。

### HELIXBRAIN-L2-005 構造間relation

- **親L1**：`HELIXBRAIN-L1-005`。

- **受け取るもの**：Pattern、Unit、Partと、領域内外の意味relation。
- **提供するもの**：requires、depends_on、compatible_with、conflicts_with、affects、alternative_to、composed_of等を参照可能なrelation graph。
- **保証すること**：領域をまたぐ関係を失わず、名称が似ているだけのedgeを意味関係と断定しない。relationの種類と両端identityを保持する。
- **依存・検証／版**：L1-005、L2-001/002。Authentication→Session→Frontend State→UX、Database→Performance→Infrastructure例のrelationを辿り、未知endpointを成功扱いしない。1.0。
- **失敗時の戻し先**：関係の向きや意味が決まらない場合はedgeを確定せず、L1-005へ戻す。
- **束ねる条件**：PO原文§BRAIN-L1-005。

### HELIXBRAIN-L2-006 Visual DesignとUXの再利用知識

- **親L1**：`HELIXBRAIN-L1-006`。

- **受け取るもの**：画面の見た目・体験に関する製品横断のPattern、Unit、Partと適用条件。
- **提供するもの**：Information Architecture、Visual Hierarchy、Layout、Grid、Spacing / Density、Typography、Navigation、Component Composition、Form、Feedback、Empty / Loading / Error State、Responsive Design、Dashboard、Content Hierarchy、Accessibility等の構造化知識。
- **保証すること**：Visual Designを装飾だけに縮めず、製品固有のVisual Identity（例: 黒背景と青のアクセント）、screen、flow、design tokenは各製品のHELIX-HARNESS-CORE側へ残す。Visual Design HARNESSは画面の見た目と体験の生成・評価を担い、System Design自体を意味しない。
- **依存・検証／版**：L1-006、L2-001/002/003、Visual Design HARNESS接続L2-023。各列挙例を知識要素として保持し、製品名や固定styleを汎用知識に混入させない。1.0。
- **失敗時の戻し先**：製品固有の識別要素を切り分けられない候補は共有知識に入れず、Visual Design HARNESSまたは製品COREへ戻す。
- **束ねる条件**：PO原文§BRAIN-L1-006とPO回答（1.0から扱う、Visual Design HARNESS連携）。

### HELIXBRAIN-L2-007 出所・根拠・知識promotion

- **親L1**：`HELIXBRAIN-L1-007`。

- **受け取るもの**：Pattern / Unit / Part候補、source、provenance、evidence、adopted reason、evaluated scope、counterexample、limitation。
- **提供するもの**：由来と評価範囲から採用状態まで追跡できる知識記録。
- **保証すること**：AI生成だけで汎用知識に昇格しない。LABO評価結果、OSの登録・振分け、BRAIN変更手続き内の独立検証、採否を別状態として保持する。
- **依存・検証／版**：L1-007、L2-011/025、LABO→BRAIN L2-020。source無し、scope無し、counterexample無し、評価未実施の候補を採用済みにしない。1.0。
- **失敗時の戻し先**：欠けたsource/evidenceは未採用候補へ戻し、promotionを停止する。上流意味変更が必要なら該当L1へ戻す。
- **束ねる条件**：PO原文§BRAIN-L1-007/009、旧RCLS-BR-004/006の段階的独立検証と提案境界。

### HELIXBRAIN-L2-008 identity・版・状態

- **親L1**：`HELIXBRAIN-L1-008`。

- **受け取るもの**：再利用構造の機能identity、版、状態、supersession relationとProduct Core利用参照。
- **提供するもの**：current、superseded、deprecated、experimental、retired等を区別し、どの製品COREがどの構造版を参照したか辿れる識別情報。
- **保証すること**：古いPatternを無言で新しいものへ置換しない。構造の版と状態はBRAINが持ち、実projectで使った版・状態の登録はOSへ委ねる。
- **依存・検証／版**：L1-008、L2-028、CORE/OS接続L2-018/019/025。参照先版を固定した履歴とsupersession後の旧参照を追跡する。1.0。
- **失敗時の戻し先**：版・利用identityが不明なら候補利用を停止し、構造変更はBRAIN、project状態はOSへ戻す。
- **束ねる条件**：PO原文§BRAIN-L1-008、DST-OS-001のBRAIN/OS責務分割。

### HELIXBRAIN-L2-009 構成Pattern候補

- **親L1**：`HELIXBRAIN-L1-009`。

- **受け取るもの**：既存PatternのUnitとrelation、新しいrelation案、sourceと評価範囲。
- **提供するもの**：既存部品を組み合わせたCandidate Patternと構成根拠。
- **保証すること**：構成候補を確立済みPatternへ即時昇格しない。LABO等の評価とL2-025のpromotion経路を通す。
- **依存・検証／版**：L1-009、L2-005/007/025。Pattern AのUnit A1とPattern BのUnit B1を新relationで組む候補が、候補状態に留まり評価後だけ次状態へ移ることを確認する。1.0。
- **失敗時の戻し先**：部品またはrelationの根拠が不明な構成はcandidateとしても適用せず、L1-009へ戻す。
- **束ねる条件**：PO原文§BRAIN-L1-009。

### HELIXBRAIN-L2-010 Anti-Pattern・失敗知識

- **親L1**：`HELIXBRAIN-L1-010`。

- **受け取るもの**：Anti-Pattern、Failure Pattern、Invalid Combination、Context-dependent Failure、Regression caseとそのsource/evidence。
- **提供するもの**：条件付きで使ってはいけない構造、失敗条件、関係する代替候補を返すknowledge entry。
- **保証すること**：成功例だけをknowledgeとして保持せず、「この条件では何を使ってはいけないか」を検索・参照できる。失敗を全条件へ一般化しない。
- **依存・検証／版**：L1-010、L2-003/005/007。成功・反例・条件依存・退行の各例を正負oracleとして確認する。1.0。
- **失敗時の戻し先**：条件や根拠のない否定は適用しない。scopeを定められないfindingは未確定としてLABO評価へ返す。
- **束ねる条件**：PO原文§BRAIN-L1-010、DST-HARNESS-005 negative oracle。

### HELIXBRAIN-L2-011 製品固有意味との分離

- **親L1**：`HELIXBRAIN-L1-011`。

- **受け取るもの**：製品CORE由来候補と製品固有名、要求、画面、業務規則、利用者判断のsource context。
- **提供するもの**：製品横断に再利用可能な構造候補と、汎用化できない要素の未分離状態。
- **保証すること**：製品固有文を汎用knowledgeとしてそのまま昇格しない（「RetryYN管理画面では左側にこのmenu」ではなく、根拠があれば「高密度管理画面のpersistent navigation pattern」等の一般化候補）。製品固有元sourceを失わず、一般化を事実扱いしない。
- **依存・検証／版**：L1-011、L2-007/018/020/025。製品識別子を含むsourceと独立な再利用条件を比較し、過度一般化と未分離の両方を不合格とする。1.0。
- **失敗時の戻し先**：意味分離できない候補をBRAINへ採用せず、提供元COREまたはLABOへ返す。上流の共有範囲決定が必要なら人の判断点へ送る。
- **束ねる条件**：PO原文§BRAIN-L1-011。

### HELIXBRAIN-L2-012 提供候補と採用authorityの分離

- **親L1**：`HELIXBRAIN-L1-012`。

- **受け取るもの**：利用要求または問い合わせのdesign contextと必要な知識領域。
- **提供するもの**：Pattern候補、required input、relation、alternative、constraint、evidenceと各版。
- **保証すること**：BRAINは「この製品でPattern Xを採用する」という製品固有の確定判断を行わない。採用を、Product Core、INTELLIGENCE、人間判断等の接続先の責務と状態から分離する。
- **依存・検証／版**：L1-012、L2-019/021/022。必要input欠落、複数候補、判断不能の例でBRAINが候補を返し、決定を生成しないことを確認する。1.0。
- **失敗時の戻し先**：要求意味や重みが不明なら採用提案を停止し、責任を持つ判断先へ戻す。BRAINの知識不足を理由にauthorityを拡張しない。
- **束ねる条件**：PO原文§BRAIN-L1-012、ConceptのBRAIN/INTELLIGENCE/OS境界。

## Infrastructure Domain要求（初期版）

以下17要求は、PO原文のID・例・列挙・非機能条件をそのまま識別可能にし、要求候補ファイルの要約で置き換えない。対象L1は同じHELIX-BRAIN L1の対応項目であり、Infrastructure Runtime自体の要求ownerをBRAINへ移さない。

### HELIXBRAIN-L2-INFRA-001 Infrastructure DomainとSubdomain

- **親L1**：`HELIXBRAIN-L1-001`。
- **受け取るもの**：Infrastructure設計知識の領域・下位領域案。
- **提供するもの**：Compute、Network、Storage、Database Infrastructure、Cache、Queue / Messaging、Load Balancing、Service Discovery、Deployment、Scaling、Availability、Reliability、Backup / Restore、Disaster Recovery、Observability、Capacity、Cost Architecture、Infrastructure Security、Environment、Runtime / Execution Platformを扱えるDomain構造。
- **保証すること**：Subdomain一覧を固定しない。追加・分割・統合・退役ができ、実環境や製品固有provider accountをDomainにしない。
- **依存・検証／版**：L2-001の分類・変更境界。列挙した全初期Subdomainと未列挙の追加候補を識別し、固定一覧以外を拒まない。1.0。
- **失敗時の戻し先**：実resource状態との混同はInfrastructure Runtime ownerへ、分類意味はL1-001へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-001。

### HELIXBRAIN-L2-INFRA-002 Infrastructure Pattern階層

- **親L1**：`HELIXBRAIN-L1-002`。
- **受け取るもの**：InfrastructureのDomain、Pattern、Design Unit、Part候補。
- **提供するもの**：一般のBRAIN階層に従うInfrastructure Pattern構造。
- **保証すること**：Availability→Active/Passive→Primary/Standby/Health Detection/Failover、Deployment→Blue-Green→Active/Candidate/Traffic Switch/Rollbackの例を表現し、cloud provider固有設定だけをPatternと扱わない。
- **依存・検証／版**：L2-002/INFRA-001。例の階層が型を保ち、providerの実装例と抽象Patternを区別する。1.0。
- **失敗時の戻し先**：一般性のない設定はimplementation knowledge候補へ分離し、L1-002へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-002。

### HELIXBRAIN-L2-INFRA-003 Infrastructure Pattern成立条件

- **親L1**：`HELIXBRAIN-L1-003`。
- **受け取るもの**：Infrastructure Patternと設計コンテキスト。
- **提供するもの**：problem、workload assumptions、expected load、availability condition、consistency requirement、latency requirement、capacity condition、scaling condition、failure assumptions、recovery condition、data durability、network requirement、security constraint、operational complexity、cost characteristic、required observability、applicability、negative case、trade-off、evidenceを持つdescriptor。
- **保証すること**：「一般的」だけを適用根拠にしない。input/conditionの欠落はunknownのまま示す。
- **依存・検証／版**：L2-003/INFRA-002。全列挙fieldが保持され、欠落fieldが成功へ丸められないことを確認する。1.0。
- **失敗時の戻し先**：要求値は製品CORE、欠落評価はLABO、知識fieldの意味はL1-003へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-003。

### HELIXBRAIN-L2-INFRA-004 非機能要求からPatternとinputへの関係

- **親L1**：`HELIXBRAIN-L1-003`、`HELIXBRAIN-L1-005`。
- **受け取るもの**：Availability、Performance、Capacity、Reliability、Recoverability、Security、Privacy、Observability、Maintainability、Costの要求特性。
- **提供するもの**：特性→関連Infrastructure Pattern→必要Design Inputをたどれる意味relation。
- **保証すること**：BRAIN自身は要求値を決めない。入力がなければそれを要求・設計側へ返す。
- **依存・検証／版**：L2-003/005/022。列挙した全NFR特性の経路とunknown inputの反例を確認する。1.0。
- **失敗時の戻し先**：要求値と設計義務はHARNESS／製品COREへ戻し、BRAINが閾値を創作しない。
- **束ねる条件**：Infrastructure PO原文INFRA-004、旧NIO-L3-01/02のtyped input・design obligation観点。

### HELIXBRAIN-L2-INFRA-005 Failure構造

- **親L1**：`HELIXBRAIN-L1-010`。
- **受け取るもの**：正常構成とFailure Pattern候補。
- **提供するもの**：Single Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region / Zone Failure、Deployment Failure、Backup Failure、Restore Failure、Configuration Driftと、expected failure、detection、impact、containment、recovery、residual risk。
- **保証すること**：failure構造を正常構成と同じ知識モデルで保持し、想定・影響・復旧・残余riskを欠いたものを完成扱いしない。
- **依存・検証／版**：L2-010/INFRA-003。列挙例全てを識別し、failure oracleの欠落を検出する。1.0。
- **失敗時の戻し先**：実際のincidentや測定値はLABO／Runtimeへ、一般化範囲はL1-010へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-005、旧NIO-L3 failure/measurement観点。

### HELIXBRAIN-L2-INFRA-006 Recovery Pattern

- **親L1**：`HELIXBRAIN-L1-002`、`HELIXBRAIN-L1-010`。
- **受け取るもの**：failure conditionと復旧候補。
- **提供するもの**：Retry、Timeout、Circuit Breaker、Failover、Graceful Degradation、Rollback、Restore、Rebuild、Reconciliation、Disaster Recovery Pattern。
- **保証すること**：「落ちない構成」だけで成立とせず、障害後に戻す設計を持つ。実行成功をBRAINの知識のみから推定しない。
- **依存・検証／版**：`HELIXBRAIN-L2-002`、`HELIXBRAIN-L2-INFRA-005`。予防策だけの構成と復旧を含む候補を別判定する。1.0。
- **失敗時の戻し先**：実行・rollbackは製品またはRuntime ownerへ、復旧構造の意味はL1-010へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-006、旧NIO-L3-06。


Backup/Restoreとの関係はHELIXBRAIN-L2-INFRA-010で表し、同節の成立をRecovery Pattern単体の前提にはしない。RecoveryとBackupの知識間の参照を、互いの完成待ちにしない。
### HELIXBRAIN-L2-INFRA-007 Deployment Pattern

- **親L1**：`HELIXBRAIN-L1-004`。
- **受け取るもの**：提供・更新条件とDeployment候補。
- **提供するもの**：Rolling Deployment、Blue-Green、Canary、Immutable Deployment、In-place Update、Staged Rollout Pattern。
- **保証すること**：blast radius、rollback characteristics、required duplication、availability impact、migration constraint、observability requirementを比較し、BRAIN自身はrelease/deploymentを進行しない。
- **依存・検証／版**：`HELIXBRAIN-L2-004`、`HELIXBRAIN-L2-INFRA-003`、`HELIXBRAIN-L2-INFRA-006`。全列挙方式の差分比較と、BRAINが実actionを起こさない反例を確認する。1.0。
- **失敗時の戻し先**：対象製品のrelease semanticsはProduct Core/HARNESSへ、実進行はOS/Runtimeへ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-007。

### HELIXBRAIN-L2-INFRA-008 Scaling・Capacity Pattern

- **親L1**：`HELIXBRAIN-L1-003`。
- **受け取るもの**：WorkloadとResource制約。
- **提供するもの**：Vertical Scaling、Horizontal Scaling、Queue-based Load Leveling、Sharding、Read Replica、Cache、Worker Pool、Backpressureの候補と、trigger、bottleneck、limit、statefulness、synchronization cost、expected saturation behavior。
- **保証すること**：特定の負荷閾値や規模を創作せず、欠けたworkloadを明示する。
- **依存・検証／版**：`HELIXBRAIN-L2-003`、`HELIXBRAIN-L2-INFRA-003`、`HELIXBRAIN-L2-INFRA-004`。列挙Patternと各fieldを照合し、load不明を適用許可としない。1.0。
- **失敗時の戻し先**：workload値・SLOは製品要求、構造の評価はLABOへ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-008。

### HELIXBRAIN-L2-INFRA-009 Observability知識

- **親L1**：`HELIXBRAIN-L1-003`。
- **受け取るもの**：Infrastructure Patternと成立を検証する観測ニーズ。
- **提供するもの**：Metrics、Logs、Traces、Health、Dependency status、Capacity、Saturation、Error、Latency、Deployment state、Recovery stateの観測点と意味。
- **保証すること**：構成を作っただけで成立としない。BRAINには設計上の観測定義を置き、実際のlogs/metricsを保存しない。
- **依存・検証／版**：`HELIXBRAIN-L2-003`、`HELIXBRAIN-L2-INFRA-003`、`HELIXBRAIN-L2-INFRA-005`。各観測例と対応Pattern/失敗のtrace、実データ非保存を確認する。1.0。
- **失敗時の戻し先**：runtime evidenceはInfrastructure Runtime/LABOのownerへ、設計観測点の不足はL1-003へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-009、旧NIO-L3-03/09。

### HELIXBRAIN-L2-INFRA-010 Backup・Restore・Recoverability

- **親L1**：`HELIXBRAIN-L1-003`、`HELIXBRAIN-L1-010`。
- **受け取るもの**：Backup/Restore設計候補、保持・複製・復旧条件。
- **提供するもの**：backup strategy、retention pattern、replication、restore pattern、recovery validationを相互relationで結ぶ設計知識。
- **保証すること**：BackupとRestoreを分離して成立扱いせず、Backup + Restore verification + required recovery conditionsをRecoverability Evidence Candidateとして区別する。実際のRTO/RPO値は製品要求が所有する。
- **依存・検証／版**：L2-005/INFRA-006。backupのみ、restore検証あり、要求条件充足を別々に判定する。1.0。
- **失敗時の戻し先**：実際のbackup/restore実行と値は製品/Runtime、知識構造はL1-003/010へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-010、旧NIO-L3-06。

### HELIXBRAIN-L2-INFRA-011 Cost characteristic

- **親L1**：`HELIXBRAIN-L1-004`。
- **受け取るもの**：Infrastructure Patternの費用特性と比較条件。
- **提供するもの**：fixed / variable cost tendency、idle resource cost、scaling cost、redundancy cost、storage cost、network cost、operational costのtrade-off情報。
- **保証すること**：具体価格を恒久知識とせず、provider・時点依存の数値と構造上のcost characteristicを区別する。
- **依存・検証／版**：L2-004/INFRA-003。全cost例が比較対象になり、価格の時点/出典欠落を現行価格として表示しない。1.0。
- **失敗時の戻し先**：具体価格や予算はProduct Core/OSのownerへ、一般化cost characteristicはLABO評価へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-011。

### HELIXBRAIN-L2-INFRA-012 Provider抽象と実装例

- **親L1**：`HELIXBRAIN-L1-005`、`HELIXBRAIN-L1-011`。
- **受け取るもの**：provider非依存Patternとprovider別実装知識。
- **提供するもの**：Object Storage等の抽象PatternとS3、GCS、Azure Blob、MinIO等のimplementation例をimplements、compatible_with、constraint_of等で接続する知識。
- **保証すること**：汎用PatternをAWS等の一providerへ固定しない。provider固有の事実は根拠と版を伴う実装知識に留める。
- **依存・検証／版**：L2-005/011/INFRA-002。providerを入替えて抽象identityを維持し、適合性が未確認ならunknownを返す。1.0。
- **失敗時の戻し先**：互換条件のownerまたは該当Patternへ戻し、無根拠な互換宣言をしない。
- **束ねる条件**：Infrastructure PO原文INFRA-012。

### HELIXBRAIN-L2-INFRA-013 実行基盤の共通resource抽象

- **親L1**：`HELIXBRAIN-L1-001`、`HELIXBRAIN-L1-002`。
- **受け取るもの**：Local machine、VPS、Dedicated server、Cloud、GPU node、Distributed worker node等の設計知識候補。
- **提供するもの**：Resource / Capability modelに結び付くprovider・環境非依存の知識構造。
- **保証すること**：Cloudのみを前提にせず、特定providerやcomputer構成をBRAINの前提にしない。対象資源の実状態・credential・操作権限を所有しない。
- **依存・検証／版**：`HELIXBRAIN-L2-001`、`HELIXBRAIN-L2-002`、`HELIXBRAIN-L2-INFRA-012`、`HELIXBRAIN-L2-024`。列挙実行基盤を抽象上で識別し、特定構成を必須にしない。1.0。
- **失敗時の戻し先**：実環境のidentity/stateはInfrastructure Runtime、security境界はSECURITYへ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-013。

### HELIXBRAIN-L2-INFRA-014 Infrastructure topology graph

- **親L1**：`HELIXBRAIN-L1-005`。
- **受け取るもの**：複数Infrastructure componentと構成・通信関係。
- **提供するもの**：Web→Load Balancer→Application→Database→Backup、Application→Queue→Worker等のtopologyとdepends_on、communicates_with、replicated_by、backed_up_by、monitored_by、failover_to、secured_by、deployed_on、scales_with relation。
- **保証すること**：component一覧だけで構成済みとせず、relationの端点・意味を保持する。
- **依存・検証／版**：`HELIXBRAIN-L2-005`、`HELIXBRAIN-L2-INFRA-001`、`HELIXBRAIN-L2-INFRA-002`。全relation名と両端を辿り、未定のedgeを明示する。1.0。
- **失敗時の戻し先**：topologyの実状態はRuntime、構造relationの意味はL1-005へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-014。

### HELIXBRAIN-L2-INFRA-015 Domain横断relation

- **親L1**：`HELIXBRAIN-L1-005`。
- **受け取るもの**：InfrastructureとAPI、Data、Security、Visual / UX等の他DomainのPattern候補。
- **提供するもの**：affects、constrains、may affect等の横断relation。
- **保証すること**：API→Network→Latency / Availability、Data→Storage / Database→Backup / Recovery、SecurityがNetwork / Runtime / Credentialを制約、Visual / UXがFrontend Delivery / CDN / Performanceに影響し得る例を表現する。因果や制約を無根拠に断定しない。
- **依存・検証／版**：L2-005、各Domain identity。例のrelationと方向、意味の不確かさを保持する。1.0。
- **失敗時の戻し先**：関係先Domainの責務ownerへ返す。
- **束ねる条件**：Infrastructure PO原文INFRA-015。

### HELIXBRAIN-L2-INFRA-016 Infrastructure Anti-Pattern

- **親L1**：`HELIXBRAIN-L1-010`。
- **受け取るもの**：Infrastructure特有の反例・失敗構造。
- **提供するもの**：Single Point of Failure、Shared mutable production state、Unbounded Retry、Unbounded Queue、Missing Timeout、Backup Without Restore Test、Monitoring Without Action、Manual-only Recovery、Hidden Dependency、Undocumented Egress、Unbounded Resource GrowthのAnti-Patternと、成立条件、failure manifestation、detection clue、safer alternatives。
- **保証すること**：例示を保持し、条件を外して全状況の禁止事項へ一般化しない。
- **依存・検証／版**：`HELIXBRAIN-L2-010`、`HELIXBRAIN-L2-INFRA-005`、`HELIXBRAIN-L2-INFRA-006`、`HELIXBRAIN-L2-INFRA-009`。各列挙例の条件・兆候・代替を対で確認する。1.0。
- **失敗時の戻し先**：検出証拠や適用状況が不明ならfindingをunknownとしLABO評価へ戻す。
- **束ねる条件**：Infrastructure PO原文INFRA-016。

### HELIXBRAIN-L2-INFRA-017 Pattern maturity

- **親L1**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L1-008`。
- **受け取るもの**：Patternの利用実績、failure、反例、LABO評価。
- **提供するもの**：experimental、observed、validated、mature、deprecated、retired等の成熟度と根拠relation。
- **保証すること**：内部Productで一度成功しただけでuniversal Patternへ昇格しない。maturity状態とBRAIN version、projectでの利用版を分ける。
- **依存・検証／版**：L2-007/008/020/025。1回だけの成功、複数条件の評価、failure発見の例で状態遷移を区別する。1.0。
- **失敗時の戻し先**：評価不足はexperimental/observed候補に留め、採用を推定しない。
- **束ねる条件**：Infrastructure PO原文INFRA-017。

## 機構間接続・構成体要求

### HELIXBRAIN-L2-018 製品Coreからの再利用候補入力（connection）

- **親L1**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L1-011`。
- **受け取るもの**：製品のHELIX-HARNESS-COREから、原本を解体して抽出した汎用Pattern/Unit/Part候補、source/provenance、revision、製品固有情報との関係。利用者が作ったraw original自体は入力にしない。
- **提供するもの**：製品固有の意味を汎用知識と混同せず、候補状態でBRAIN intakeへ渡したconnection receipt。
- **保証すること**：個別製品名、要求、画面、業務規則、利用者判断や原本そのものを汎用Patternとして確定・保存しない。HELIX側で原本からPatternだけを取り込んだ後に原本を破棄するというConcept上の扱いを保ち、本要求は原本の保持期限・破棄証拠等の内部要件を追加しない。candidate intakeはPattern成立・成熟・採用を意味しない。
- **依存・検証／版**：L2-007/011、HELIX-HARNESS-COREの候補出力contract。候補のsource/revision、原本と抽出候補の区別、製品固有要素と再利用候補の分離、受取側identityを照合する。1.0。
- **失敗時の戻し先**：由来や製品固有意味が分離できない場合は候補を隔離し、製品Coreへ差し戻す。採用判定はL2-025に委ねる。
- **束ねる条件**：BRAIN L1-007/011、L1の「Product-specific→HELIX-HARNESS-CORE」分離。

### HELIXBRAIN-L2-019 BRAIN知識候補の製品Coreへの提供（connection）

- **親L1**：`HELIXBRAIN-L1-003`、`HELIXBRAIN-L1-004`、`HELIXBRAIN-L1-012`。
- **受け取るもの**：製品Coreの対象課題、必要inputと制約、参照可能なBRAIN knowledge identity/version。
- **提供するもの**：候補Pattern、Design Unit、Part、必要input、適用条件、代替、relation、trade-off、反例、根拠、maturityとexact version。
- **保証すること**：候補の存在やmaturityを今回案件への採用判断に変換しない。複数成立するPatternを消さず比較可能にし、今回の選択は製品Core等の接続先が行う。
- **依存・検証／版**：L2-003/004/008/012、HARNESS-CORE受領contract。提供identity/versionと参照revisionが一致し、required input/制約/反例を欠落させず返す。1.0。
- **失敗時の戻し先**：不足inputは製品Coreへ照会し、knowledge meaning/versionの矛盾はL2-003/008または親L1へ戻す。unknownは推薦なしとして扱う。
- **束ねる条件**：BRAIN L1-003/004/008/012。

### HELIXBRAIN-L2-020 LABO評価結果の知識候補への接続（connection）

- **親L1**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L1-009`、`HELIXBRAIN-L1-010`。
- **受け取るもの**：LABOが評価対象・評価scope・方法・evidence・結果・反例を紐付けた構造候補。
- **提供するもの**：評価結果を保持したBRAIN候補入力と、対象のsource/version/evaluation identityを結ぶreceipt。
- **保証すること**：単一実績、AI生成、評価resultのみで確立Patternとしない。candidateの評価scopeと限界を保ち、OSの登録・振分けとBRAIN内独立検証の後まで採否・成熟状態を先取りしない。
- **依存・検証／版**：L2-007/008/009/010のgeneric provenance/identity/state、Infrastructure candidateのmaturityを扱う場合に限りL2-INFRA-017、およびLABO評価contract。候補revisionと評価対象revision、成功・failure・反例・未評価範囲の対応を確認する。1.0。
- **失敗時の戻し先**：評価と対象revisionが結べないときはunknown候補として止め、LABOへ評価を返す。OS登録状態の正本はOSへ戻す。
- **束ねる条件**：BRAIN L1-007/009/010、HELIX-LABOの評価責務。

### HELIXBRAIN-L2-021 BRAINとINTELLIGENCEの知識・判断材料接続（connection）

- **親L1**：`HELIXBRAIN-L1-003`、`HELIXBRAIN-L1-004`、`HELIXBRAIN-L1-012`。
- **受け取るもの**：INTELLIGENCEからの対象課題、案件状態に関するqueryと必要scope。
- **提供するもの**：BRAINの知識identity/version、候補、必要input、条件、alternative、制約、反例、根拠を含む判断材料。
- **保証すること**：BRAINはruntime案件の結論・選択を確定せず、INTELLIGENCEはBRAIN knowledgeを暗黙に改変・昇格しない。推薦材料と稼働中判断を区別する。
- **依存・検証／版**：L2-003/004/008/012、INTELLIGENCE query/response contract。情報source/versionと対象scopeを追い、候補回答が決定と誤認されないことを確認する。1.0。
- **失敗時の戻し先**：対象条件不足はINTELLIGENCEへ返し、知識意味・版の不整合はBRAIN L1または当該知識ownerへ返す。
- **束ねる条件**：BRAIN L1-003/004/012、2026-09-25 POの稼働中判断分離。

### HELIXBRAIN-L2-022 BRAINのrequired inputからHARNESS設計義務への接続（connection）

- **親L1**：`HELIXBRAIN-L1-003`、`HELIXBRAIN-L1-005`、`HELIXBRAIN-L1-012`。
- **受け取るもの**：BRAIN Patternが要求する設計input、前提、constraint、関連Patternと根拠。
- **提供するもの**：HARNESS-L2-009へ対応付けられた設計input、Pattern/Unit/Partとdependency relation、元knowledge identity/versionへのtrace。接続先が工程表・遷移図・実装優先順位を導くための構造材料。
- **保証すること**：Patternのrequired inputとdependencyを設計義務へ落とさず渡すが、BRAINが製品固有の要求値や設計選択、工程表、遷移図、実装優先順位を単独で決めない。HARNESS-CORE/HARNESSは自らの要求・設計契約に従って導出・管理する。
- **依存・検証／版**：L2-003/005/008、HARNESS-L2-009 contract。Pattern inputから受入側義務まで双方向traceし、値未定と未充足を区別する。1.0。
- **失敗時の戻し先**：意味関係不明はBRAIN L1-003/005へ、設計義務の受領方法はHARNESSへ戻す。欠落は完了扱いしない。
- **束ねる条件**：2026-09-25 POのBRAIN/Core指示「設計ユニット・パーツと依存から工程表・遷移図・実装優先順位を導く」、Concept「HARNESS-COREは製品固有の意味と設計、Pythonで要求導出」。L2-022はその入力構造の受渡しを担い、導出の所有はHARNESS-CORE/HARNESSに置く。

### HELIXBRAIN-L2-023 BRAINとVisual Design HARNESSの知識接続（connection）

- **親L1**：`HELIXBRAIN-L1-006`、`HELIXBRAIN-L1-007`、`HELIXBRAIN-L1-009`。
- **受け取るもの**：Visual Design HARNESSの課題とscreen/flowの製品scope、およびLABOを経た利用結果・評価候補。
- **提供するもの**：Visual Design/UXの再利用Pattern・Unit・Part、適用条件、反例、必要input。Visual Design HARNESSからは利用・評価結果をLABO経由で候補として戻す。
- **保証すること**：BRAINは製品固有Visual Identity, screen, flow, design tokenを所有せず、Visual Design HARNESSから直接BRAINの汎用知識へ昇格させない。
- **依存・検証／版**：L2-006/007/009/011/012、Visual Design HARNESSおよびLABO connection contract。汎用知識の提供、製品固有物の分離、評価結果がLABO経由であることを追う。1.0。
- **失敗時の戻し先**：製品固有要素混入は該当製品Coreへ戻す。利用結果がLABOを経由しない場合は候補昇格を止める。
- **束ねる条件**：2026-09-26 PO判断記録「Visual Design HARNESSとの連携」、旧v1.3 §4.5。

### HELIXBRAIN-L2-024 Infrastructure設計知識と実績のCORE/LABO経由分離（composite）

- **親L1**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L1-008`、`HELIXBRAIN-L1-010`。
- **受け取るもの**：BRAIN→製品COREの設計知識契約（L2-019/022）、Runtime owner→LABO→BRAINの実績評価契約（L2-020）、および各ownerの境界receipt。Runtime実データそのものをBRAINが直接受け取らない。
- **提供するもの**：設計知識はL2-019/022に従い製品HELIX-HARNESS-CORE/HARNESSへ渡し、実績はRuntime owner→LABO評価→L2-020の候補接続としてのみBRAINへ戻す分離したflow contract。
- **保証すること**：BRAINとInfrastructure Runtime間に直接のread/write/learning connectionを作らない。BRAINは実server/network/database状態、provider account、credential、操作権限、実log/metricsを保存・所有しない。Runtimeの実状態はHELIX自身ならHELIX-INFRASTRUCTURE、対象製品なら当該Runtime ownerに残る。製品で採用した設計はCOREを通り、実績はLABO評価を通る。
- **依存・検証／版**：L2-INFRA-009/010/012/017、L2-019/020/022およびCORE/Runtime/LABO contract。Infrastructure設計知識の受渡し先がCOREであること、実績のsource/scopeがLABO評価を経てcandidateへ結ばれること、BRAINへ直接Runtime dataが流れないことを確認する。1.0。
- **失敗時の戻し先**：実状態・操作はRuntime owner、評価はLABO、製品固有の採用設計はCORE、汎用Pattern意味はBRAINへ戻す。credential/raw runtime dataの直接流入やLABOを迂回した昇格があれば受領を止める。
- **束ねる条件**：Infrastructure candidate「持ち手」表・接続表、Concept HELIX-INFRASTRUCTURE境界。

### HELIXBRAIN-L2-025 内部知識候補の独立検証・採否（composite）

- **親L1**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L1-008`、`HELIXBRAIN-L1-009`、`HELIXBRAIN-L1-011`。
- **受け取るもの**：製品Core由来または構成候補、source/provenance、LABOの評価結果、OSの登録・振分け状態、BRAINの変更candidateと独立検証結果。
- **提供するもの**：提案・評価・登録・独立検証・採否状態を分離したBRAIN knowledge revisionと、未完義務・finding・反例のowner付きreceipt。
- **保証すること**：AI生成、単一実績、LABO評価、OS ticket、文書存在のいずれだけでも汎用知識へ昇格させない。L1-007が定めるLABO評価→OS登録/振分け→BRAIN変更手続き内の独立検証→採否の順序と責務を保持する。製品固有意味を汎用化しない。意味を変えない技術差分に新たな人間approvalを足さない。
- **依存・検証／版**：L2-007/008/009/011/012/020、Infrastructure候補のmaturity状態を扱う場合はL2-INFRA-017、LABO/OS/BRAIN change contracts。各state・owner・対象revisionを照合し、candidateと採用済みの識別、独立検証結果、rejection/holdの戻しを確認する。1.0。
- **失敗時の戻し先**：source/evaluation不足はLABO、登録/進行状態はOS、知識意味は該当L1、BRAIN変更検証はBRAIN change ownerへ戻す。未知・差戻しはaccepted/matureへ進めない。
- **束ねる条件**：BRAIN L1-007/009、旧RCLS-BR-004/006の保持点と、2026-09-26 PO判断（OSが登録・振分け、LABOは評価）。

### HELIXBRAIN-L2-026 外部情報のLABO経由候補入力（connection）

- **親L1**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L1-009`、`HELIXBRAIN-L1-010`。
- **受け取るもの**：OSS、設計資料、論文、Issue、PR等の外部source identity/version、CONNECT等が取得したuntrusted data、LABOの分解・比較・評価結果。
- **提供するもの**：外部sourceと評価scopeを保持した、BRAINへ渡すknowledge candidate。
- **保証すること**：外部での成功例をBRAINの適用済み成功として扱わず、出所を確認しLABOで分解・比較・実験した候補だけを接続する。対象となる外部情報classは上流が挙げた例を保持しつつ、列挙を全種の確定範囲としない。
- **依存・検証／版**：LABO external-information contract、CONNECT acquisition identity、L2-007/009/010。source、取得revision、LABO評価対象revisionのchainと未評価条件を確認する。2.0。
- **失敗時の戻し先**：出所不明・権利/適用条件unknown・評価欠落はLABOへ戻し、BRAINへの候補受渡しを止める。
- **束ねる条件**：Concept 2.0、2026-09-26 LABO判断記録「外の情報」。

### HELIXBRAIN-L2-027 外部知識候補の分解・評価・取込み（composite）

- **親L1**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L1-009`、`HELIXBRAIN-L1-010`、`HELIXBRAIN-L1-011`。
- **受け取るもの**：L2-026経由の外部source候補、LABOの分解・比較・評価結果、OSの登録/振分け状態、BRAIN内変更candidateと独立検証結果。
- **提供するもの**：外部由来を保持したknowledge candidateまたはaccepted revisionと、採否状態・根拠・適用条件・反例・未完義務のtrace。
- **保証すること**：外部の成功を自環境での成功へ置き換えない。source確認、LABOの分解・比較・実験と評価、OS登録、BRAIN内の独立検証、採否を各ownerの契約どおり分離し、どの段階の結果も後段の成功と同一視しない。1.0内部seedの成立を外部情報能力に依存させない。
- **依存・検証／版**：L2-007/008/009/010/011/026、Infrastructure candidateのmaturity状態を扱う場合はL2-INFRA-017、およびLABO/OS/BRAIN change contracts。外部source→評価対象→BRAIN candidate/revisionのidentity chain、実験限界、反例、未決の適用scopeを追う。2.0。
- **失敗時の戻し先**：source provenanceはCONNECT/LABO、評価不足はLABO、登録状態はOS、知識意味と変更検証はBRAIN ownerへ戻す。unknownは候補保留に留める。
- **束ねる条件**：Concept 2.0およびLABO PO判断「外で成功した方式をそのままBRAINへ入れない」。

### HELIXBRAIN-L2-028 BRAIN知識pack descriptorの版・互換適用（unit）

- **親L1**：`HELIXBRAIN-L1-008`。
- **受け取るもの**：HARNESS-L2-010/011に従うBRAIN capability descriptor（identity/kind、contract version、artifact version、dependency identity/version、compatibility range、verification scope）と、BRAIN knowledge revision identity/version/state。
- **提供するもの**：要求元に対し、exact knowledge revision/versionとdescriptor互換性を照合した適用可能/不適用/unknown response。
- **保証すること**：BRAINのknowledge identity/version/state（L2-008）と共通pack identity/contract/artifact/dependencyの各versionを混同しない。required versionが宣言compatibility range内である場合のみ参照を許し、`version_target`を実版とみなさない。HARNESS-L2-010/011の共通交換、更新、rollback、未完義務のlifecycleを再定義しない。
- **依存・検証／版**：L2-008、HARNESS-L2-010/011 descriptor contract。descriptor identity/version、knowledge revision/version/state、dependency rangeが一致し、unknown/mismatchで利用拒否されることを確認する。1.0。
- **失敗時の戻し先**：知識revision/stateはL2-008、共通pack boundary/compatibilityはHARNESS ownerへ戻す。古い版への黙った置換は禁止。
- **束ねる条件**：BRAIN L1-008、HARNESS-L2-010/011共通pack契約。

## 親L1全12件の受け先

同じIDのL11行が各L2と対になる。1.0の義務を2.0の外部知識経路へ延期しない。Infrastructureの知識は設計の候補を表せる能力であり、HELIX-INFRASTRUCTUREの後続版runtime機能の実装を1.0依存にしない。

| 親L1 | 1.0のL2/L11 | 2.0外部情報による拡張 |
|---|---|---|
| `HELIXBRAIN-L1-001` | `HELIXBRAIN-L2-001`、`HELIXBRAIN-L2-002`、`HELIXBRAIN-L2-003`、`HELIXBRAIN-L2-004`、`HELIXBRAIN-L2-005`、`HELIXBRAIN-L2-006`、`HELIXBRAIN-L2-007`、`HELIXBRAIN-L2-008`、`HELIXBRAIN-L2-009`、`HELIXBRAIN-L2-010`、`HELIXBRAIN-L2-011`、`HELIXBRAIN-L2-012`、`HELIXBRAIN-L2-INFRA-001`、`HELIXBRAIN-L2-INFRA-002`、`HELIXBRAIN-L2-INFRA-003`、`HELIXBRAIN-L2-INFRA-004`、`HELIXBRAIN-L2-INFRA-005`、`HELIXBRAIN-L2-INFRA-006`、`HELIXBRAIN-L2-INFRA-007`、`HELIXBRAIN-L2-INFRA-008`、`HELIXBRAIN-L2-INFRA-009`、`HELIXBRAIN-L2-INFRA-010`、`HELIXBRAIN-L2-INFRA-011`、`HELIXBRAIN-L2-INFRA-012`、`HELIXBRAIN-L2-INFRA-013`、`HELIXBRAIN-L2-INFRA-014`、`HELIXBRAIN-L2-INFRA-015`、`HELIXBRAIN-L2-INFRA-016`、`HELIXBRAIN-L2-INFRA-017`、`HELIXBRAIN-L2-018`、`HELIXBRAIN-L2-019`、`HELIXBRAIN-L2-020`、`HELIXBRAIN-L2-021`、`HELIXBRAIN-L2-022`、`HELIXBRAIN-L2-023`、`HELIXBRAIN-L2-024`、`HELIXBRAIN-L2-025`、`HELIXBRAIN-L2-028` | `HELIXBRAIN-L2-026`、`HELIXBRAIN-L2-027` |
| `HELIXBRAIN-L1-002` | `HELIXBRAIN-L2-002`、`HELIXBRAIN-L2-INFRA-002`、`HELIXBRAIN-L2-INFRA-006`、`HELIXBRAIN-L2-INFRA-013` | — |
| `HELIXBRAIN-L1-003` | `HELIXBRAIN-L2-003`、`HELIXBRAIN-L2-INFRA-003`、`HELIXBRAIN-L2-INFRA-004`、`HELIXBRAIN-L2-INFRA-008`、`HELIXBRAIN-L2-INFRA-009`、`HELIXBRAIN-L2-INFRA-010`、`HELIXBRAIN-L2-019`、`HELIXBRAIN-L2-021`、`HELIXBRAIN-L2-022` | — |
| `HELIXBRAIN-L1-004` | `HELIXBRAIN-L2-004`、`HELIXBRAIN-L2-INFRA-007`、`HELIXBRAIN-L2-INFRA-011`、`HELIXBRAIN-L2-019`、`HELIXBRAIN-L2-021` | — |
| `HELIXBRAIN-L1-005` | `HELIXBRAIN-L2-005`、`HELIXBRAIN-L2-INFRA-004`、`HELIXBRAIN-L2-INFRA-012`、`HELIXBRAIN-L2-INFRA-014`、`HELIXBRAIN-L2-INFRA-015`、`HELIXBRAIN-L2-022` | — |
| `HELIXBRAIN-L1-006` | `HELIXBRAIN-L2-006`、`HELIXBRAIN-L2-023` | — |
| `HELIXBRAIN-L1-007` | `HELIXBRAIN-L2-007`、`HELIXBRAIN-L2-INFRA-017`、`HELIXBRAIN-L2-018`、`HELIXBRAIN-L2-020`、`HELIXBRAIN-L2-023`、`HELIXBRAIN-L2-024`、`HELIXBRAIN-L2-025` | `HELIXBRAIN-L2-026`、`HELIXBRAIN-L2-027` |
| `HELIXBRAIN-L1-008` | `HELIXBRAIN-L2-008`、`HELIXBRAIN-L2-INFRA-017`、`HELIXBRAIN-L2-024`、`HELIXBRAIN-L2-025`、`HELIXBRAIN-L2-028` | — |
| `HELIXBRAIN-L1-009` | `HELIXBRAIN-L2-009`、`HELIXBRAIN-L2-020`、`HELIXBRAIN-L2-023`、`HELIXBRAIN-L2-025` | `HELIXBRAIN-L2-026`、`HELIXBRAIN-L2-027` |
| `HELIXBRAIN-L1-010` | `HELIXBRAIN-L2-010`、`HELIXBRAIN-L2-INFRA-005`、`HELIXBRAIN-L2-INFRA-006`、`HELIXBRAIN-L2-INFRA-010`、`HELIXBRAIN-L2-INFRA-016`、`HELIXBRAIN-L2-020`、`HELIXBRAIN-L2-024` | `HELIXBRAIN-L2-026`、`HELIXBRAIN-L2-027` |
| `HELIXBRAIN-L1-011` | `HELIXBRAIN-L2-011`、`HELIXBRAIN-L2-INFRA-012`、`HELIXBRAIN-L2-018`、`HELIXBRAIN-L2-025` | `HELIXBRAIN-L2-027` |
| `HELIXBRAIN-L1-012` | `HELIXBRAIN-L2-012`、`HELIXBRAIN-L2-019`、`HELIXBRAIN-L2-021`、`HELIXBRAIN-L2-022` | — |

## 原文・旧資産との対応

| 上流条件 | 保持する条件・例外 | L2候補 | 対受入 |
|---|---|---|---|
| BRAIN L1-001〜006 (`docs/helix-brain/sources/brain-l1-idea-po-original-2026-09-26.md`, SHA-256 `d2b9f970fe40253c865b1ae52b1b0657da6f9668611c1b17e54723b69b6101e0`) | 可変Domain、Domain→Pattern→Design Unit→Part、Patternのapplicability/input/constraint/trade-off/negative/failure/relation/evidence/maturity、複数解、横断relation、Visual DesignとUXの1.0対象例すべて | 001〜006、INFRA-001〜004/012/014/015 | 同IDの単体受入。§16のVisual Design列挙を漏れなくcheck |
| BRAIN L1-007〜012 | provenance/根拠/反例/評価範囲、LABO評価→OS登録・振分け→BRAIN独立検証→採否、identity/version/state、構成候補、Anti-Pattern、製品意味分離、候補と採用判断分離 | 007〜012、INFRA-005/016/017、018/019/020/025/028 | 同IDのunit/connection/compositeを分離判定 |
| Existing candidate `docs/helix-brain/candidates/design-template-system-requirements.md` | DST-HARNESS-002 template意味契約、DST-HARNESS-005 seedのprovenance/範囲/限界/negative case、DST-OS-001の汎用knowledge版/state | 003/007/008/010/011/012/019/028 | 製品のtemplate適用・設計義務生成はHARNESS、projectで使った版の登録はOSに残し、BRAIN対象を再利用知識に限定 |
| BRAIN L1「接続の要求」 | Product Core→BRAIN候補、LABO→BRAIN評価済み候補、BRAIN→Core知識、BRAIN↔INTELLIGENCE、BRAIN→HARNESS-L2-009、BRAIN↔Visual Design HARNESS、2.0外部→LABO→BRAIN | 018〜024、026/027 | 同IDの接続と構成体受入を対で実施 |
| Infrastructure PO INFRA-001〜017 (`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md`, SHA-256 `09fcc8b0d41c26fcd51a3f0fa6b54a041f9605904c7048c1b564a9ca6366e72b`) | 20 subdomain例、structure/conditions/examples, NFR-input path, failure list, recovery/deploy/scaling/observation/backup-restore/cost/provider/resource/topology/relation/anti-pattern/maturity examples | INFRA-001〜017 | 同ID、候補source `infrastructure-domain-requirements.md` の全列挙と照合 |
| Existing Infrastructure candidate `docs/helix-brain/candidates/infrastructure-domain-requirements.md` の「持ち手」「接続」表 | BRAINは設計知識だけを持ち、Runtime実状態/credential/provider account/操作権限を持たない。候補上のBRAIN↔Runtime案をそのまま直接経路にせず、設計知識はProduct Core経由、実績はRuntime owner→LABO→BRAIN候補接続に分ける | INFRA-009/010/012/017, 019/020/022/024 | L2-024のcompositeでdirect BRAIN↔Runtime pathなし、両owner routeを個別に受入 |
| 2026-09-25 PO BRAIN/Core direction (`docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md`, SHA-256 `f61155bf27e0563988b7ed2e652f894a3b11ab7eedf6e28fba204d98647e3657`) とConcept §§267–272 | Product-specific meaning/designはHELIX-HARNESS-CORE、HELIX-JSON/Pythonで要求導出、BRAINからPattern/Unit/Partを得て、required inputを要求段階で質問し、Unit/Part/dependencyから工程表・遷移図・実装優先順位を導く | 002/003/005/008/019/022 | L2-022で構造と依存をHARNESSへ渡し、導出物と製品固有意味のownerをCORE/HARNESSに残す |
| 2026-09-25 PO user-original direction (`docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md`, same SHA) とConcept §278 | HELIXは利用者成果物の原本を保有し、後で解体してPatternだけ取り込み、原本を破棄する。利用規約表記は「HARNESSの改善に利用することがあります」程度とし、追加の内部分解・破棄要件は立てない | 011/018/025 | BRAINにはraw originalではなく汎用候補だけを受け渡す。原本lifecycleの条件を本L2へ拡張せず、BRAINでの原本保存/無断昇格を受け入れない |
| 2026-09-26 BRAIN L1 decision (`docs/governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md`, SHA-256 `698a27758421909f5a16068ebdeb0c65a162858779964392ac56cd895d777e33`) とConcept §§90, 271–272 | Visual Design/UXを1.0 schema対象に追加しVisual Design HARNESSへ接続。2.0外部sourceをLABOで分解/比較/評価し、外の成功を自環境の成功にしない | 001/006, 023, 026/027 | 1.0/2.0境界とVisual Design接続を受け入れ、実artifact版と目標版を分ける |
| 旧Hybrid source ZIP (`archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`, SHA-256 `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3`) | design templateからstructured spec、required input、traceability、dependency、V-model pair/acceptanceを導くsource material。採用matrix HVM-ADOPT-01〜05の保持条件と、HVM-REJECT-01〜03（generator/runtimeや全53文書一律必須を採用しない） | 002/003/005/007/008/022、INFRA-003/004 | ZIPはread-only reference。旧generator/runtimeを実行せず、各source documentを一律必須化しない。201件/22分類（scratchpad）とZIP実査179件/22分類の差はsource noteであり、どちらも要求件数にしない |

## 旧資産との保持・変更

| 旧資産 | source identity | 保持・再導出 | 変更・移管 |
|---|---|---|---|
| 旧分類catalog | `archive/legacy-generation-2026-09-14/root/docs/design/design-catalog.yaml:9-40`, `LEGACY-ASSET-EC07511FF3E241F15359`, SHA-256 `4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864` | 設計成果物を分類し所在を辿るinventoryの役割を保持 | file/artifact inventoryをBRAINの再利用knowledge DomainやPattern authorityと同一視しない |
| 旧V-model採用matrix | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md`, `LEGACY-ASSET-24A3D981F1ED04404AA5`, SHA-256 `6cb8fb254a82918ac472fb381268340a6d3c8f5c252f52ef8a58447ddac661f5` | typed source、traceability/impactとtailoring判断を歴史的根拠として参照 | V-model docgen採用範囲をBRAINの要求や完成条件に転用しない |
| 旧Design Template JSON authority | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` (`LEGACY-ASSET-4F5A1F0739EC1111D91D`, SHA-256 `e254d995d1d9fbbcc74bb53b3356b4499ac20cca2280eeafde1412d08630c4cb`); related detailed design `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md` | versioned template identity、applicability、required input、owner、trace、negative oracle、measurement、completionの構造 | 旧schema/algorithm/runtimeを再実行・現行authority化せず、適用条件・必要input・反例・根拠の意味を知識Patternへ再導出 |
| 旧RCLS-BR-004/006 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:37-47`, asset ledger `LEGACY-ASSET-F2C2755C8809C2C0DEAD`, SHA-256 `c3d9f28a17ac8882f22b5cf86b6d0b16c457a996b3eb0682b6de1010d64ea29c` | 独立検証を経ること、提案だけでauthorityを変更しない | 登録と振分けをOS、効果評価をLABO、汎用knowledge revisionをBRAINへ分離 |
| Existing DST-OS-001 candidate | current candidate `docs/helix-brain/candidates/design-template-system-requirements.md`（このcandidate自体にlegacy asset IDは付いていない）。関連する旧L4 JSON authority assetは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md`, `LEGACY-ASSET-4F5A1F0739EC1111D91D`, SHA-256 `e254d995d1d9fbbcc74bb53b3356b4499ac20cca2280eeafde1412d08630c4cb`。これはDST-OS-001自体のasset IDではない | seed/candidate/accepted/retiredの状態差、projectが使ったexact versionを追跡 | BRAINは知識のrevision/state、OSはprojectで使った版と登録状態を担当 |
| 旧NIO Infrastructure requirements | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:7-47`, `LEGACY-ASSET-5D41345F55800F23AC38`, SHA-256 `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | Failure/recovery, observability, backup/restore, rollback, typed inputの要求を対応行で再導出 | 工程と実行義務はHARNESS/Runtime、BRAINは再利用設計知識とrequired inputを持つ |
| 旧要求v1.3 §4.5/§4.9 | source `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:67,265-275,379-393`; preserved snapshot `docs/governance/requirements-source/helix-requirements_v1.3.md`; `LEGACY-ASSET-02319C2481B9E01698D5`, SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | Visual Design HARNESSの画面/UX生成評価との接続 | Design HARNESSのSystem Design領域まで含めず、Visual Design HARNESSは見た目・体験に限定 |
| 機構間connectorの比較根拠 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67,113`、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | 旧HIL-BR-15/FR-23のsourceごとの版付きconnector、由来・schema・authority・資格情報参照の境界を比較の起点にする | 旧はproduct-dataの取込み。機構間の接続ごとにconnectorを置くのは2026-09-26 LABO PO判断による拡張であり、旧sourceに同じ規則があったとはしない。旧DB/runtimeは採用しない |

## 人の判断が必要な点

| 該当する原文 | 選択肢 | 推奨 | 影響する候補 |
|---|---|---|---|
| BRAIN L1企画案frontmatter `authority_status: draft_candidate` と本文「POが対象revisionを確認」 | このL1本文revisionをL2候補の親としてPOが確認する／上流の意味を直してから候補を再照合する | 意味変更がなければこのL1 revisionを親として確認し、要求候補は未採択のまま扱う | L2/L11全候補の親revision |

ZIP source catalogはscratchpad記載の201件/22分類と保持ZIP内の179件/22分類に件数差がある。差分はsource突合注記に限り、いずれの件数もBRAIN要求の固定件数条件にしない。ZIP内の全資産再調査を本候補の開始条件としない。
