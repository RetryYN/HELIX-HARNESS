---
title: "HELIX-SECURITY要求候補"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: requirements
status: draft
authority_status: draft_candidate
parent_concept: docs/concept/helix-concept.md
parent_planning: docs/helix-security/L1-planning/security-intent.md
pair_artifact: docs/helix-security/L11-acceptance/security-acceptance.md
source: docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md
decision_record: docs/governance/decisions/security-l1-idea-po-decisions-2026-09-26.md
---

# HELIX-SECURITY要求候補

本書は、HELIX Concept、HELIX-SECURITY L1企画案、2026-09-26のPO原文を親とする未採択のL2候補である。L1の対象revisionはPO確認待ちであり、この候補からL1の確認、要求採択、L3承認、実装許可、外部操作許可を生成しない。対応するL11受入候補は[security-acceptance.md](../L11-acceptance/security-acceptance.md)に置く。

候補IDの単位は交換・検証できる能力のまとまりとする。単体能力、機構間接続、構成体を別identityにし、単体の成功だけで接続・構成体を成立扱いしない。各候補は対象revision、入力、出力、保証、依存、検証範囲、`version_target`、失敗時の戻し先を明記する。異なる機構の役割をSECURITYへ吸収しない。

## 境界と共通条件

- HELIX-SECURITYは方針、authority、Trust Boundary、Asset Boundaryを持つ。Workerの実行環境は与えられた制約を強制し、HELIX-OSは割当てと進行、HELIX-INTELLIGENCEは判断と検出、HELIX-HARNESSは検証契約、HELIX-LABOは効果と退行の評価、HELIX-INFRASTRUCTUREは実資源と状態を持つ。
- SECURITYはHARNESS工程の意味、製品固有要求、開発計画、Workerの配置判断、長期改善評価、実行runtimeそのものを持たない。Security Botが必要な場合も、INTELLIGENCEの発行機構へ接続し、Bot自身に包括的権限を与えない。
- 外部情報、AI生成物、Tool出力、Issue、PR、Web、MCP、文書を信頼済み命令へ自動昇格させない。`Read ≠ Trust ≠ Instruction ≠ Authority ≠ Persist ≠ Learn`を保つ。Prompt Injectionの完全検出を要求せず、未信頼dataからauthorityへ直結する経路を主な防御対象にする。
- 欠落、未知、期限切れ、範囲不一致、identity/digest不一致、証明不能を成功・許可へ読み替えない。deny、隔離、停止、unknownのどれを返すかを明示する。
- 機密値・secret・credentialそのものを通常のAI context、ログ、成果物、監査receiptへ含めない。receiptは値ではなく分類、digest、判断、理由、状態を持つ。
- L1に数値がない時間、保持期間、閾値、容量等はここで新設しない。未決の非機能値はunknownのまま残し、値が必要な実装前に上流候補へ戻す。
- 1.0の能力を後の版のBotやWeb公開能力に依存させない。L1-015/016の資産識別・公開区分の土台は1.0に置けるが、1.xの実利用保護全体を1.0の完了条件へ移さない。
- 各機能パックは、要求IDとは別に、実行時の機能identity、契約版、成果物版、依存機能identityと必要版、互換範囲、検証範囲を宣言する。`version_target`は能力を成立させる目標版（1.0/1.x）であり、稼働中成果物の版、契約版、依存版を表さない。未採択候補には実版がまだない。
- 互換範囲外・未宣言の依存版は、黙った読替え、互換fallback、成功扱いをせずunknown/停止とする。交換・更新は宣言済み互換範囲内で行い、非互換更新は新しい候補・検証範囲へ送る。失敗時は最後の適格で互換な版へrollbackでき、既存のsecurity条件を落とさない。
- 更新・交換・rollbackをまたいで、未完の検査、未解決finding、unknown、人の判断待ち、期限切れ、未回収義務をidentity/revision/owner付きで引き継ぐ。引継ぎやrollbackだけで義務を完了にしない。

## 候補一覧

| 要求ID | 種類 | 親L1 | 対象 | `version_target` |
|---|---|---|---|---|
| HELIXSECURITY-L2-001 | unit | L1-001 | 外部入力の信頼・authority境界 | 1.0 |
| HELIXSECURITY-L2-002 | unit | L1-002 | 命令様dataとPrompt Injection境界 | 1.0 |
| HELIXSECURITY-L2-003 | unit | L1-003 | project・tenant・環境・assignment隔離 | 1.0 |
| HELIXSECURITY-L2-004 | unit | L1-004 | Agent・Hook・設定のintegrity | 1.0 |
| HELIXSECURITY-L2-005 | unit | L1-005 | Credential / Secret境界 | 1.0 |
| HELIXSECURITY-L2-006 | unit | L1-006 | Network / Egress境界 | 1.0 |
| HELIXSECURITY-L2-007 | connection | L1-007 | Worker実行環境への制約適用 | 1.0 |
| HELIXSECURITY-L2-008 | unit | L1-008 | 操作ごとのauthority | 1.0 |
| HELIXSECURITY-L2-009 | composite | L1-009 | revoke / quarantine伝播 | 1.0 |
| HELIXSECURITY-L2-010 | unit | L1-010 | 更新受入 | 1.0 |
| HELIXSECURITY-L2-011 | unit | L1-011 | Capability Drift | 1.0 |
| HELIXSECURITY-L2-012 | unit | L1-012 | Supply Chain provenance | 1.0 |
| HELIXSECURITY-L2-013 | unit | L1-013 | Artifact integrity | 1.0 |
| HELIXSECURITY-L2-014 | composite | L1-014 | Persistence / Memory promotion boundary | 1.0 |
| HELIXSECURITY-L2-015 | unit | L1-015 | HELIX Asset identityと分類基盤 | 1.0の土台、実利用保護は1.x |
| HELIXSECURITY-L2-016 | unit | L1-016 | Asset exposure classification | 1.0の区分基盤、公開時適用は1.x |
| HELIXSECURITY-L2-017 | unit | L1-017 | Semantic exfiltration境界 | 1.x |
| HELIXSECURITY-L2-018 | unit | L1-018 | Capability probing観測 | 1.x |
| HELIXSECURITY-L2-019 | unit | L1-019 | Core Asset Egress判定 | 1.x |
| HELIXSECURITY-L2-020 | unit | L1-020 | GuardとBotの責務境界 | Guard 1.0、Botは必要時 |
| HELIXSECURITY-L2-021 | connection | L1-001/002/014 | CONNECT・SECURITY・LABO・INTELLIGENCEの外部data接続 | 1.0の境界、対象別能力に従う |
| HELIXSECURITY-L2-022 | composite | L1-008 | INTELLIGENCE要求からOS割当て、Worker実行までのauthority接続 | 1.0 |
| HELIXSECURITY-L2-023 | composite | L1-010/011/012/013 | 更新候補からHARNESS検証、OS昇格まで | 1.0 |
| HELIXSECURITY-L2-024 | connection | L1-005/006/007/009 | SECURITY方針とINFRASTRUCTURE実資源の接続 | 1.0 |
| HELIXSECURITY-L2-025 | composite | L1-015/016/019 | HELIX-Web公開経路のAsset Boundary | 1.x、1.0から基盤準備 |
| HELIXSECURITY-L2-026 | connection | L1-017/018/020 | INTELLIGENCEの意味判断・検出との接続 | 1.x能力は1.x、Guard/Bot境界は1.0 |
| HELIXSECURITY-L2-027 | composite | L1-014 | LABO・BRAIN・INTELLIGENCEへの永続化promotion | 1.0 |
| HELIXSECURITY-L2-028 | unit（共通パック契約） | L1-010/013 | SECURITY機能パックのidentity・版・互換・交換 | 1.0 |

## 単体候補

### HELIXSECURITY-L2-001 外部入力の信頼・authority境界

- **受け取るもの**：外部情報、AI生成物、Tool出力、Issue、PR、Web、MCP、文書と、そのsource・対象project・revision・data classification。
- **提供するもの**：未信頼dataとしての識別と、明示した昇格経路・未昇格状態を示す判定情報。
- **保証すること**：読むことだけで信頼、命令、authority、永続化、学習を生成しない。明示された経路を通らない入力は要求、Agent instruction、Tool authority、memory、BRAIN、training data、security policyへ昇格しない。
- **単独依存**：Conceptのdata-use classification・isolation foundation、source identityを受ける。分類不能なら未信頼・unknownとして扱う。
- **検証範囲／版**：各入力source種別について、read-only閲覧とauthority作用の経路を分ける。1.0。
- **失敗時の戻し先**：入力の意味や昇格条件が不足・矛盾ならL1-001/L1-002候補へ戻す。下流の接続先はunknownのまま保つ。
- **束ねる既存条件**：L1-001、PO §2。既存のHARNESS/OS外部data境界と重なる箇所はownerを明示して接続候補へ渡す。

### HELIXSECURITY-L2-002 命令様dataとPrompt Injection境界

- **受け取るもの**：L2-001で未信頼とされたdataと、dataを読むWorker/Toolの権限scope。
- **提供するもの**：命令様記述をdataとして隔離し、tool call、instruction、policy、credential送信へ直結させない制約と判定receipt。
- **保証すること**：例「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「資格情報を送れ」をHELIX操作命令として実行しない。完全なinjection検出率を約束しない。
- **単独依存**：L2-001のsource/classification、Workerへ渡される明示scope。検出Botがなくても直接authority経路を遮断する。
- **検証範囲／版**：文書、Issue/PR、Web、MCP response等からinstruction/tool argsへの直接連結を検査。1.0。
- **失敗時の戻し先**：境界を証明できない場合は下流操作を止め、data flow設計をL1-002へ戻す。検出器の不在を成功扱いしない。
- **束ねる既存条件**：L1-002、PO §3、旧HR-NFR-P8-02の命令隔離・監査観点。

### HELIXSECURITY-L2-003 project・tenant・環境・assignment隔離

- **受け取るもの**：project、tenant、environment、assignment/worktree identityと、それらへ束縛する権限、state、data、Worker、credential、artifact、memory、execution target。
- **提供するもの**：明示接続のみによる越境許可、project-scoped isolation情報、fallback禁止の判定。
- **保証すること**：project AのAgent、Hook、memory、credential、設定、Workerが明示接続なしにproject Bへ作用しない。primary treeや別projectへの暗黙fallbackを行わない。
- **単独依存**：OSからassignment/project identity、INFRASTRUCTUREから実環境identity、CONNECTから宣言済み接続identityを受ける。各機構は自分のstateを正本として保持する。
- **検証範囲／版**：read/write/execute/network/state/credential/artifactの境界をproject・tenant・environment・worktreeごとに照合。1.0。
- **失敗時の戻し先**：identityが欠落、衝突、不明なら操作停止。identity構造の不足はL1-003へ、物理環境の不足は接続要求でINFRASTRUCTUREへ戻す。
- **束ねる既存条件**：L1-003、Conceptの隔離の単位、旧SEAのtarget/environment scoping。

### HELIXSECURITY-L2-004 Agent・Hook・設定のintegrity

- **受け取るもの**：AGENTS.md、CLAUDE.md、Agent定義、Hook、Skill、MCP設定、runtime設定、Sandbox方針、system instruction、model設定とproject identity、root、HEAD/revision、digest、owner、scope。
- **提供するもの**：採用可能な構成revisionと、未知・stale・他project由来の構成を特定する比較結果。
- **保証すること**：別project、古い版、未知のHook/設定を黙って採用しない。内容変更とauthority変更を識別する。
- **単独依存**：L2-003のidentityと、構成sourceのrevision/digest。Ownerが不明ならその不明を維持する。
- **検証範囲／版**：対象リストの全構成についてidentity/revision/digest/scope束縛を確認。1.0。
- **失敗時の戻し先**：対象のowner/scopeが不明ならL1-004へ戻し、実行を停止する。承認のない構成を推測採用しない。
- **束ねる既存条件**：L1-004、PO §5、Conceptの構成版固定と切戻し。

### HELIXSECURITY-L2-005 Credential / Secret境界

- **受け取るもの**：credential requestのactor、operation、target、environment、scope、expiry、目的とcredential classification。
- **提供するもの**：生値を露出しない、範囲・操作・期限付きのcredential-use capability、検査・失効状態。
- **保証すること**：raw secretをAI contextへ渡さない。credential storeをWorkerに直接見せない。repository混入と外部送信を検査し、revokeを伝播する。単一のsecret判定正本を使う。secret値は通常artifact/receiptに出さない。
- **単独依存**：L2-008 authority、L2-006 egress、Worker境界L2-007、INFRASTRUCTUREの安全な実資源境界。
- **検証範囲／版**：context、file/artifact、log、Tool result、外部sinkへの値露出と期限/operation mismatch。1.0。
- **失敗時の戻し先**：欠落scope、期限切れ、未知のcredential class、検査不能はdeny/stop。方針の不足はL1-005へ、保存・注入境界はL2-024へ戻す。
- **束ねる既存条件**：L1-005、PO §6、旧secret predicate一元化とCapability Leaseのscope/expiry。旧実装自体は復帰させない。

### HELIXSECURITY-L2-006 Network / Egress境界

- **受け取るもの**：送信元、destination、protocol、endpoint/path、data classification、送信量、purpose、authority、expiry。
- **提供するもの**：default denyを基準とした許可一覧、許可判断、計測値、data minimization結果。
- **保証すること**：必要な宛先のみ明示許可し、vendorのprivacy設定だけをHELIX側の保証にしない。許可範囲・目的・期限が一致しない送信を拒否する。
- **単独依存**：L2-005のsecret検査、L2-016の1.0分類基盤（data-use classificationとasset exposure classの記録だけ）、CONNECTの論理接続、INFRASTRUCTUREの実network経路。L2-019のCore Asset Egress GuardとL2-016の1.x sink enforcementは依存に含めない。
- **検証範囲／版**：外部通信の宛先・protocol・path・data classification・量・目的・authorityの対応。分類入力は1.0の分類基盤で扱い、asset-specific egress blockingはL2-019 (1.x)へ分ける。定量上限はL1にないため追加しない。1.0。
- **失敗時の戻し先**：宛先/分類/目的/authorityがunknownならdenyし、方針の意味差はL1-006へ戻す。物理経路の不明はL2-024へ。
- **束ねる既存条件**：L1-006、PO §7、旧brokerのdata/sink分類とunknown拒否。

### HELIXSECURITY-L2-007 Worker実行環境への制約適用（接続）

- **受け取るもの**：SECURITYが決めたscope/authority制約とOSのassignment identity、Worker実行環境のcapabilities。
- **提供するもの**：実行前に適用された制約、結果/証拠の回収状態、停止・rollback・再開可否。
- **保証すること**：許可された隔離環境だけでWorker/CLI/Agent/Toolを動かす。write path限定、network制限、credential遮断、environment variable最小化、timeout、resource limit、file差分検査、rollback、結果回収を検証対象とする。Workerは制約を自分で広げない。具体のenforcerはWorkerの実行環境でありSECURITYではない。
- **単独依存**：Concept/Worker実行契約、OS assignment、INFRASTRUCTURE実資源、L2-003/005/006/008。旧Runner/Sandbox actorを復活させない。
- **検証範囲／版**：制約ごとの要求→Worker実行環境への受渡し→適用証拠の対応。適用不能はhostへfallbackしない。1.0。
- **失敗時の戻し先**：未適用/未観測/unsupportedは実行停止・unknown。SECURITY方針不足はL1-007、物理enforcement欠落はINFRASTRUCTURE接続の候補へ戻す。
- **束ねる既存条件**：L1-007、PO §8、Worker統一判断。実装が利用可能であるとは主張しない。

### HELIXSECURITY-L2-008 操作ごとのauthority

- **受け取るもの**：actor、target、operation、revision、environment、scope、expiryと操作要求。
- **提供するもの**：operation-specific allow/deny/constrainの判断と判断理由。
- **保証すること**：read/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change等を別authorityとして扱う。「Agentを使える」から包括write/deployを生成しない。高影響操作は全tupleが一致する個別authorityを求める。
- **単独依存**：L2-003 identity、L2-004構成integrity、L2-005 credential、L2-006 egress、OSの進行。
- **検証範囲／版**：操作名、主体、対象、revision、環境、scope、expiryの一致と未知・欠落時の拒否。1.0。
- **失敗時の戻し先**：未認可、drift、expiry、unknownではdenyし、意味の変更はL1-008へ戻す。停止伝播はL2-009/022で検証。
- **束ねる既存条件**：L1-008、PO §9、旧SEAのaction-specific authorityとtarget/environment/scope/expiry拘束。

### HELIXSECURITY-L2-009 revoke / quarantine伝播（構成体）

- **受け取るもの**：失効、scope drift、不明な外部副作用、credential漏洩、異常通信、runtime逸脱のfindingと、該当するoperation/project/worker/credential/connection/artifact identity。
- **提供するもの**：該当先へ相関可能なrevoke/quarantine指示と、受領・適用・失敗・未観測状態。
- **保証すること**：OSは新規割当てを停止し、Worker実行環境は実行停止と途中成果物の隔離を行い、CONNECTは通信を停止し、credential使用とartifact accessを停止する。不明な状態をsuccessとして継続しない。SECURITYはpolicyと発火条件を持ち、各機構は自分のstateと実行を持つ。
- **単独依存**：L2-003/005/006/007/008、OS assignment、Worker実行環境、CONNECT、artifact access、INFRASTRUCTURE観測。
- **検証範囲／版**：各triggerごとに全該当recipientへの伝播、receipt、未達の明示、復旧可能な前状態への隔離。数値latencyはPO原文にないため作らない。1.0。
- **失敗時の戻し先**：recipient未応答・未観測・unknownの間は対象operation/新規割当てを止める。authority/policy意味差はL1-009へ、OS/Worker/CONNECT/INFRAのenforcement差はその接続先L1へ戻す。
- **束ねる既存条件**：L1-009、PO §10、旧SEAのrevoke/scope-drift停止条件。

### HELIXSECURITY-L2-010 更新受入

- **受け取るもの**：更新candidate。対象はsource code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configuration。各対象のsource/provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback可否を含む。
- **提供するもの**：SECURITYによるaccept/reject/unknownと、その根拠のセット。
- **保証すること**：新しいversionであることだけを更新理由にせず、未知の出所・権限・副作用・rollback欠落を黙って受け入れない。
- **単独依存**：L2-011能力差分、L2-012 supply-chain provenance、L2-013 artifact integrity、L2-008 authority。
- **検証範囲／版**：PO §11の15対象を個別に扱う: source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configuration。対象ごとにprovenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback可否を照合する。1.0。
- **失敗時の戻し先**：情報不足はunknown/reject、意味や必要な判定軸の差はL1-010へ戻す。実行/昇格はL2-023に従う。
- **束ねる既存条件**：L1-010、PO §11、Conceptの構成版固定と切戻し。

### HELIXSECURITY-L2-011 Capability Drift

- **受け取るもの**：更新前後の構成とファイル差分、read/write/shell/network等の能力記述。
- **提供するもの**：version diffからcapability diff、security impactへ辿る比較結果。
- **保証すること**：ファイル差分だけで能力変更を見落とさず、model/Agent/MCP/plugin等にも適用する。
- **単独依存**：L2-004の構成identity、L2-010のcandidate revision。比較不能はunknownとする。
- **検証範囲／版**：PO §12のread-onlyからread+write+shell+networkへの例と同等の能力変化。1.0。
- **失敗時の戻し先**：能力を分類できない変更は受け入れず、分類意味の不足をL1-011へ戻す。
- **束ねる既存条件**：L1-011、PO §12。

### HELIXSECURITY-L2-012 Supply Chain provenance

- **受け取るもの**：package/container image/GitHub repository/MCP/plugin/Skill/Agent package/model/binaryのsource、producer、version、digest、dependency、permission、network behavior、known risk、update delta、rollback。
- **提供するもの**：採用・保留判断へ使う完全なprovenanceと、未知項目の明示。
- **保証すること**：不明な供給元や実行能力を暗黙にtrustedへ昇格させない。
- **単独依存**：L2-010更新candidateとL2-013artifact identity。特定scanner/registry/providerを新規必須化しない。
- **検証範囲／版**：列挙された外部実行資産の各provenance fieldとdependency/risk/rollback。1.0。
- **失敗時の戻し先**：欠落または不一致はunknown/reject。対象範囲の変更はL1-012へ戻す。
- **束ねる既存条件**：L1-012、PO §13、旧source provenance、dependency、sink、rollbackの多軸分離。

### HELIXSECURITY-L2-013 Artifact integrity

- **受け取るもの**：生成・build・validation・配布・実行のartifact identity/version/digest/provenance/producer。
- **提供するもの**：同一artifactであることと各工程のtrace。
- **保証すること**：CIで検証した対象と実際に配布/実行した対象を食い違わせない。digest一致だけでsource authorityや検証合格を推定しない。
- **単独依存**：L2-010/012の更新・provenance、HARNESS verification receipt、OS promotion record。
- **検証範囲／版**：生成から利用までのidentity chainとdigest、producer、build、validationの結び付き。1.0。
- **失敗時の戻し先**：identity/digest mismatch、missing stepは昇格停止。意味や必要なidentityが不足ならL1-013へ戻す。
- **束ねる既存条件**：L1-013、PO §14、Conceptの構成版固定。

### HELIXSECURITY-L2-014 Persistence / Memory promotion boundary（構成体）

- **受け取るもの**：context、episode、product knowledgeのsource identity/classificationと、memory/training dataset/BRAINへの昇格候補。
- **提供するもの**：昇格境界、元sourceへのtrace、allow/deny/hold状態。
- **保証すること**：外部情報/Agent出力を無条件で永続化しない。Memory poisoning、Prompt Injection persistence、training contamination、BRAIN contaminationを抑える。LABOによる評価、INTELLIGENCEの運転時知識、BRAINの汎用構造蓄積の責務を混ぜない。
- **単独依存**：L2-001/002 source trust、L2-015/016の1.0 identity/classification foundation（asset protectionの1.x sink enforcementを要しない）、LABO/BRAIN/INTELLIGENCEの各保管・昇格interface。
- **検証範囲／版**：Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの3経路と拒否/保留の反例。1.0。
- **失敗時の戻し先**：provenance/classification欠落はhold/deny。意味や対象追加はL1-014へ戻し、各機構の接続はL2-027で扱う。
- **束ねる既存条件**：L1-014、PO §15。対応する旧要件は見つかっていないためPO原文からの新しい候補として明示する。

### HELIXSECURITY-L2-015 HELIX Asset identity基盤

- **受け取るもの**：PO §16の対象資産identity、owner、source、revision/digest: HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）。これは列挙された対象例の保全であり、列挙外資産を対象から除外する意味ではない。
- **提供するもの**：Asset inventoryの識別と、後続のexposure policyが参照できる安定identity。
- **保証すること**：資産が誰の何でどのrevisionか追跡できる。1.0ではidentity/provenanceと分類を参照する基盤だけを置き、1.xのWeb実利用保護を1.0要件へ前倒ししない。
- **単独依存**：各資産ownerからのidentity/provenanceとConceptのdata-use classification。
- **検証範囲／版**：PO §16に列挙された全資産を識別対象にできる。資産内容の開示やdumpは不要。identity基盤1.0、完全なasset protectionは1.x。
- **失敗時の戻し先**：owner/identityが不明ならunclassified/unknownとして保留し、範囲の不足をL1-015へ戻す。
- **束ねる既存条件**：L1-015、Concept「データの利用区分」。

### HELIXSECURITY-L2-016 Asset exposure classification基盤

- **受け取るもの**：L2-015 identity、公開範囲（public/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secret）。
- **提供するもの**：assetへ付与し、後続機能が参照する分類情報と、そのowner/source/revision。
- **保証すること**：1.0では分類語彙とassetへの分類記録を利用可能にする。未分類をpublicと推定しない。全Web/API/log/error/stack trace/debug/source map/Tool result/artifact/LLM contextへ強制する1.x公開境界は1.0完了条件ではなく、L2-019/025等で個別に受け入れる。
- **単独依存**：L2-015 Asset identity。分類の定義ownerはSECURITY。sink enforcementを必要としない。
- **検証範囲／版**：1.0は全6 classificationの定義・assetへの付与・unknown状態の保存。PO列挙sinkへの一律適用は1.x。
- **失敗時の戻し先**：未分類/unknownはunknownとして保持し、公開allowの根拠にしない。分類意味の変更はL1-016へ戻す。
- **束ねる既存条件**：L1-016、PO §17、Conceptのdata-use classification。

### HELIXSECURITY-L2-017 Semantic exfiltration境界

- **受け取るもの**：利用者要求、公開service contract、asset classification、system prompt/architecture/tool/BRAIN/API等の内部情報区分。
- **提供するもの**：公開contractの範囲内の応答可否と、超える要求に対する拒否または制限応答。
- **保証すること**：内部資産を直接file accessせず質問だけで抽出する誘導も境界対象にする。公開contractを超える情報を回答として生成しない。完全な攻撃検出を主張しない。
- **単独依存**：L2-015/016 identity/classificationとINTELLIGENCEの意味判断接続L2-026。
- **検証範囲／版**：system prompt表示、内部architecture全説明、hidden tool一覧、BRAIN全Pattern dump、internal API一覧の例。1.x。
- **失敗時の戻し先**：公開範囲を決められなければ回答保留/deny。公開contractの意味は対象L1へ戻し、SECURITYが製品固有contractを新設しない。
- **束ねる既存条件**：L1-017、PO §18。旧HR-NFR-P8-02のdata exfiltration誘導観点を、内部Asset保護へ拡張する。

### HELIXSECURITY-L2-018 Capability probing観測

- **受け取るもの**：internal endpoint/tool/filesystem/model/config/core等へのアクセスイベントとproject identity、authority、source/time metadata。
- **提供するもの**：観測記録と、繰返し/組合せをINTELLIGENCEが判断できる材料。
- **保証すること**：endpoint enumeration、hidden Tool探索、filesystem probing、model/config探索、Core dump要求、repeated unauthorized read、cross-project probing、debug誘発を観測対象にする。SECURITYはrisk判定・配置判断を所有しない。
- **単独依存**：L2-003/008 access/authority receipt、INTELLIGENCE判断接続L2-026。raw secret/PIIをlogへ出さない。
- **検証範囲／版**：PO §19の各行為でイベントを記録し、観測失敗を「異常なし」へ変えない。1.x。
- **失敗時の戻し先**：観測の不在/不明をunknownとし、観測責務の不足はL1-018またはINTELLIGENCE接続へ戻す。
- **束ねる既存条件**：L1-018。対応する旧要件は見つかっていないため新候補として明記する。

### HELIXSECURITY-L2-019 Core Asset Egress判定

- **受け取るもの**：資産identity/classification、sink、公開許可、送信目的、caller authority。
- **提供するもの**：機械的なblock/allow/unknown判定とredacted receipt。
- **保証すること**：HELIX-JSON、BRAIN raw dump、internal prompt/policy、training corpus、security policyを無条件にblockし、customer artifactと公開済HARNESS artifactを区分に従って通す。allow例は分類/authority条件を免除しない。
- **単独依存**：L2-015/016 Asset identity/classification、L2-005 secret、L2-006 network sink、L2-008 caller authority。
- **検証範囲／版**：PO §20のblock/allow例をpositive/negative oracleとして扱う。1.x。
- **失敗時の戻し先**：classification/sink/authority unknownはblock。公開物の意味が未定ならL1-019またはL1-016へ戻す。
- **束ねる既存条件**：L1-019、PO §20。旧secret-egressの考えをAssetへ広げるが、旧runtimeを移植しない。

### HELIXSECURITY-L2-020 GuardとBotの責務境界

- **受け取るもの**：決定規則で強制する制約、意味判断が必要な診断要求、Botが利用する明示authority。
- **提供するもの**：Security Guardの決定的enforcement contractと、必要時にINTELLIGENCEへ渡すSecurity Bot request contract。
- **保証すること**：Injection/Scope/Hook/Secret/Egress/Runtime/Permission/Core Asset Guardと意味判断/診断Botを分離する。Bot候補例はSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botである。この列挙は候補例であり、全Botの初版実装・運用を要求しない。Botの必要性は自動的に必須化せず、Botへ包括的write権限を与えない。Botは特定目的のWorkerとして、既存のWorker/INTELLIGENCE契約内で実行する。
- **単独依存**：L2-008 authority、Worker契約、INTELLIGENCE発行interface。
- **検証範囲／版**：規則で決まる事象をBot判断へ依存させずGuardで扱い、意味判断の要求は権限を限定して接続する。Guard 1.0、Bot capabilityは必要になった版。
- **失敗時の戻し先**：Guard未定義/不適用はenforcementのownerへ戻す。Botがいないことだけで1.0を不成立としない。境界意味の変更はL1-020へ戻す。
- **束ねる既存条件**：L1-020、PO §21、ConceptのBotは目的別Workerとの判断。

## 接続・構成体候補

### HELIXSECURITY-L2-021 外部dataの受渡し（接続）

- **親L1**：L1-001、002、014。
- **受け取るもの**：外部data、CONNECTのsource/contract/revision、SECURITYの分類・境界、LABO/INTELLIGENCEの受領契約。
- **提供するもの**：sourceを保った未信頼dataと、境界判断・provenanceを含む受渡しreceipt。
- **保証すること**：外部data→CONNECT→SECURITY boundary→LABO/INTELLIGENCEの経路を明示する。CONNECTの通信・再送・追跡とSECURITYのtrust判断を混ぜず、下流の受領だけで信頼昇格しない。
- **依存／検証範囲／版**：L2-001/002、CONNECT契約、LABO/INTELLIGENCE受領契約。入力・出力identity、contract版、分類、拒否/unknown時の伝播。1.0境界。
- **失敗時の戻し先**：接続契約 mismatchはCONNECT側の接続要求、trust policy差はL1-001/002、永続化経路はL2-014/027へ戻す。
- **束ねる既存条件**：PO §23 first flow、L1の責務分離。

### HELIXSECURITY-L2-022 操作authorityの受渡し（構成体）

- **親L1**：L1-008（関連L1-003/005/007/009）。
- **受け取るもの**：INTELLIGENCEのoperation request、OS ticket/assignment、SECURITYのallow/deny/constrain、Worker実行環境のcapability。
- **提供するもの**：OSが運転する許可済み作業と、Workerが適用したauthority/scope証拠。
- **保証すること**：INTELLIGENCEは案/要求を出し、SECURITYがoperation-specific判定を行い、OSが許可済み作業を進行、Worker実行環境が制約を強制する。SECURITYはticket/assignmentやWorker配置を決めず、operation requestだけで実行許可を作らない。
- **依存／検証範囲／版**：L2-003/005/007/008/009、OS assignment、INTELLIGENCE request。主体・対象・操作・revision・環境・scope・期限が全段で同一か、拒否/失効が実行前後へ伝わるか。1.0。
- **失敗時の戻し先**：意味差は最も早い該当L1、OS ticket/進行差はOS、実行制約差はWorker/INFRA接続へ戻す。authority欠落時は停止。
- **束ねる既存条件**：PO §23 second flow、Concept lines 223/230/234、旧SEA authority tuple（security engagement限定を全操作へ黙って昇格させない）。

### HELIXSECURITY-L2-023 更新審査から昇格まで（構成体）

- **親L1**：L1-010/011/012/013。
- **受け取るもの**：更新候補とprovenance、capability delta、SECURITY審査、Worker隔離実行の結果、HARNESS検証証拠、OS昇格要求。
- **提供するもの**：各段階の状態・receiptと、受け入れ/検証/昇格可否を別々に示す連続記録。
- **保証すること**：SECURITY admission→Worker実行→HARNESS verification→OS promotionを保つ。SECURITYのacceptanceだけで実行/昇格せず、HARNESS greenだけでSECURITY受入を代替せず、OSも不明な条件を昇格しない。
- **依存／検証範囲／版**：L2-007/010/011/012/013、HARNESS verification contract、OS promotion state。各段階のinput/output identity、revision、失敗状態と戻し先。1.0。
- **失敗時の戻し先**：provenance/capability/authority問題はSECURITY L1、実行環境失敗はWorker/INFRA、検証失敗はHARNESS対応pair、進行/昇格はOSへ戻し、途中状態を成功扱いしない。
- **束ねる既存条件**：PO §23 third flow、ConceptのHARNESS/OS/SECURITY/INFRA役割境界。

### HELIXSECURITY-L2-024 SECURITY方針とINFRASTRUCTURE実資源（接続）

- **親L1**：L1-005/006/007/009。
- **受け取るもの**：SECURITYのnetwork/credential/environment/project-isolation/operation-authority/update/egress policyと、INFRASTRUCTUREの資源・実環境・実際の状態。
- **提供するもの**：方針を資源上で実施した状態と、その観測・失敗・不明のreceipt。
- **保証すること**：SECURITYがpolicy/authority owner、INFRASTRUCTUREが実資源とruntime resource state owner、Worker実行環境がconstraint enforcerである。INFRASTRUCTUREはsecurity policyを作らず、credential値を通常資源状態・backup・snapshotへ無条件に保存しない。
- **依存／検証範囲／版**：Infrastructure L1-004/006/016/028/029、Security L2-005/006/007/008/009。policyと実際のenvironment/network/credential boundaryのtrace、未適用/unknownの観測。1.0。
- **失敗時の戻し先**：policy意味差はSECURITY L1、資源状態/実適用差はINFRASTRUCTURE L1/L2候補へ戻す。OSが持つ作業状態へ混ぜない。
- **束ねる既存条件**：Infrastructure L1-028/029、ConceptのSECURITY・INFRASTRUCTURE・Workerの分担。

### HELIXSECURITY-L2-025 Web公開経路のAsset Boundary（構成体）

- **親L1**：L1-015/016/019。
- **受け取るもの**：Web利用者request、HELIX-Web/WEB-OSのtenant/service identityと公開service contract、SECURITY Asset identity/classification、外向きsink。
- **提供するもの**：公開可能な応答/成果物と、block/redact/unknownの判断receipt。
- **保証すること**：HELIX-Web→HELIX-WEB-OS→SECURITY Asset Boundary→Internal HELIXの経路で、顧客tenant/job/credential/service stateと本体内部資産を暗黙に共有しない。1.x Web実利用条件を1.0へ誤って移さない。
- **依存／検証範囲／版**：L2-015/016/019、Web/WOSの候補contract、L2-006 egress。全PO列挙sinkでclassificationを維持し、HELIX-confidential以上を無条件に出さない。土台1.0、公開運用1.x。
- **失敗時の戻し先**：Web tenant/service contractはWeb/WOSの上流候補、資産分類/許可はSECURITY L1へ戻す。Web文書の存在を公開許可としない。
- **束ねる既存条件**：PO §23 fourth flow、ConceptのWeb製品群とWEB-OS、本体・Web資源境界。

### HELIXSECURITY-L2-026 INTELLIGENCEの意味判断・検出（接続）

- **親L1**：L1-017/018/020。
- **受け取るもの**：SECURITY Guardの観測・分類済みeventと、限定scope付きの意味判断依頼。
- **提供するもの**：INTELLIGENCEのsemantic judgement/diagnosisと、SECURITYが適用するdecision input。判断由来と確度を分ける。
- **保証すること**：決定規則で強制できる条件をBotへ委譲しない。Security Botは必要時にINTELLIGENCE機構が発行し、目的とauthorityを限定したWorkerであり、独立の包括的権限主体ではない。
- **依存／検証範囲／版**：L2-018/020、INTELLIGENCE L1/将来接続contract。SECURITYのGuard結果とINTELLIGENCEの判断・診断を区別。Guard 1.0、Semantic exfiltration/probing実利用とBotは1.xまたは必要な後続版。
- **失敗時の戻し先**：semantic判断不能はunknownとして出力/操作を制限。INTELLIGENCEの意味責務へ戻し、SECURITYが独自にmodel/routingを決めない。
- **束ねる既存条件**：PO §21/§23、ConceptのINTELLIGENCE判断・Bot発行責務。

### HELIXSECURITY-L2-027 永続化promotion（構成体）

- **親L1**：L1-014。
- **受け取るもの**：外部情報/Agent output、LABO episode、product knowledgeと各promotion request、source/provenance/classification。
- **提供するもの**：SECURITY境界を通過したpromotion receiptまたは拒否/保留状態を各所有機構へ返す。
- **保証すること**：Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINそれぞれを独立の昇格境界として扱う。LABOは評価、BRAINは汎用構造の蓄積、INTELLIGENCEは稼働時判断/後続モデル改善を担い、SECURITYは方針を持つ。どの機構の結果も単独で別機構へ昇格させない。
- **依存／検証範囲／版**：L2-001/002/014/015/016と各機構接続contract。3経路ごとのsource ID、分類、判断、保存先、失敗時の戻し先。1.0。
- **失敗時の戻し先**：source/provenance欠落は昇格前にhold。dataの意味差はSECURITY L1-014、評価・知識所有境界差は各機構L1へ戻す。
- **束ねる既存条件**：PO §15/§23、ConceptのLABO/BRAIN/INTELLIGENCEの責務分離。

### HELIXSECURITY-L2-028 機能パックのidentity・版・互換・交換（単体）

- **受け取るもの**：機能identityとkind（unit/connection/composite）、宣言した入力・出力contract、owner、dependency graph、要求検証範囲、`version_target`。
- **提供するもの**：個別に選択・検証・交換可能なSecurity function packのdescriptorと、呼出し側が判定できる互換・未完義務情報。
- **保証すること**：提供/実行されるpackは、機能identity、contract version、artifact version、各dependency identity/version、受入可能なcompatibility range、検証範囲、ownerを分けて記録する。`version_target`（能力が属する1.0/1.x）を実versionと混同しない。未採択候補には実artifact versionがまだない。互換range外の組合せを暗黙に使わない。pack交換・更新・rollbackで未完義務、finding、unknown、人判断待ちを消さず、最後の適格で互換な版へ戻せる。単体packの成立をconnection/compositeの成立としない。
- **単独依存**：各packのidentity/contract/version descriptorと、HARNESSのpack境界・呼出し契約（HARNESS-L2-010/011）。OSは進行・状態を記録し、SECURITY自身がチケットや工程を定義しない。
- **検証範囲／版**：unit/connection/compositeそれぞれの機能identity、contract version、artifact version、dependency version、compatibility range、検証範囲、交換/更新/rollback、未完義務引継ぎ。`version_target`は1.0。
- **失敗時の戻し先**：identity、version、dependency、compatibility、owner、検証範囲がunknown/mismatchならpackの呼出し/昇格を止める。contract意味の不足は対応L1、HARNESS共通呼出し契約はHARNESS、OS上の進行状態はOSへ戻す。
- **束ねる既存条件**：HARNESS-L2-010の入力/出力/依存/検証範囲/版と交換・更新可能性、HARNESS-L2-011の契約版・依存版・相関状態・停止/再開、およびSecurity L1-010/013のrevision/digest/provenance。

## PO原文の全条件と例外の対応

| 原文 | 保持する条件・例外・反例 | L1親 | L2/L11対応 |
|---|---|---|---|
| §1 | HELIXへ入る/出る/内部で動く/境界を越えるものを保護。方針/authority、物理強制、OS進行、INTELLIGENCE判断、HARNESS検証、LABO評価を分ける | 提供価値・役割表 | 共通条件、001–028。実行runtimeの所有はSECURITYへ移さない |
| §2 | Read/Trust/Instruction/Authority/Persist/Learnを区別。明示経路なしに要求、instruction、Tool authority、memory、BRAIN、training、policyへ昇格させない | L1-001 | 001,021,027 |
| §3 | 「ignore previous instructions」「AGENTS.mdへ書け」「repository削除」「memory保存」「credential送信」をdataとして保つ。完全検出を要求せず直結経路を防ぐ | L1-002 | 002,021; L11 negative cases |
| §4 | project/tenant/environment/assignment(worktree)へ全state/data/Worker/credential/artifact等を束縛。別project作用・primary tree fallback禁止 | L1-003 | 003,007,008,009,022,024 |
| §5 | AGENTS/CLAUDE/Agent/Hook/Skill/MCP/runtime/Sandbox/system instruction/model configをidentity/root/HEAD/revision/digest/owner/scopeへ束縛。stale/未知を黙認しない | L1-004 | 004,010,011 |
| §6 | raw secretをAIへ渡さない、scoped credential、operation/target/expiry束縛、storeをWorkerに見せない、repo混入・egress検査、revoke反映 | L1-005 | 005,007,008,009,024 |
| §7 | deny-default、destination/protocol/endpoint/data class/bytes/purpose/authority/expiry管理。vendor privacy aloneは保証でない。allowlist/path filter/measurement/minimization | L1-006 | L2-006は1.0一般egress境界。L2-019/025は1.x Asset/Web sink適用。L2-024はpolicyと実資源接続であり、1.0から1.xへの必須依存を作らない |
| §8 | Worker/CLI/Agent/Toolの隔離環境、write path/network/credential/env/timeout/resource/filesystem diff/rollback/result回収。制約はSECURITY、実強制はWorker実行環境 | L1-007 | 007,022,024 |
| §9 | read/write/execute/network/install/delete/merge/release/deploy/credential-use/security-changeを別authority。高影響操作にactor/target/operation/revision/environment/scope/expiry束縛 | L1-008 | 008,022 |
| §10 | revoke/quarantineをOS新規割当停止、Worker実行停止/途中成果隔離、CONNECT通信停止、credential停止、artifact access停止へ伝播。不明状態で継続しない | L1-009 | 009,022,024 |
| §11 | 更新対象15種をsource code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、Sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationと全列挙し、provenance/digest/dependency/permission/network/credential/hook-config delta/new executable/findings/rollbackを確認。new version aloneは理由でない | L1-010 | 010,011,012,013,023,028 |
| §12 | file diffをcapability diffへ。read-only→write/shell/networkの変化例、model/Agent/MCP/pluginにも適用 | L1-011 | 011,023 |
| §13 | package/container/GitHub repo/MCP/plugin/Skill/Agent/model/binaryのproducer/version/digest/dependency/permission/network/risk/update/rollback追跡。不明をtrusted化しない | L1-012 | 012,010,023 |
| §14 | code/package/model/config/policyのidentity/version/digest/provenance/producer/build/validationを結び、検証物と配布/実行物を一致 | L1-013 | 013,023 |
| §15 | Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINを別境界にし、poisoning/Prompt Injection persistence/training/BRAIN contaminationを防ぐ | L1-014 | 014,027 |
| §16 | HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns/Units/Parts/accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts/judgment configuration/specialist models/routing / diagnostic logic）、HELIX-LABO（episodes/evaluation corpus/training material）、HELIX-OS（authority/state/topology/operation records）、HELIX-SECURITY（policies/credentials）を全列挙して識別 | L1-015 | 015,016,019,025; 1.0は識別基盤のみ |
| §17 | six exposure classesを使い、confidential以上を全応答/log/error/trace/debug/source map/Tool/artifact/LLM contextへ無条件出力しない | L1-016 | 016,019,025 |
| §18 | prompt/architecture/hidden Tool/BRAIN dump/internal API等の意味的抜き取りと公開service contractの境界 | L1-017 | 017,026,025 |
| §19 | endpoint/tool/filesystem/model/config/core探索、反復unauthorized read、cross-project、debug誘発を観測し組合せ判断材料にする | L1-018 | 018,026,003 |
| §20 | HELIX JSON/BRAIN dump/internal prompt-policy/training/security policyをblockし、customer/public HARNESS artifactsを区分に沿って通す | L1-019 | 019,016,025 |
| §21 | deterministic Guard（Injection/Scope/Hook/Secret/Egress/Runtime/Permission/Core Asset）とsemantic Botを分離。Bot候補例5種（Security Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Bot）を列挙するが全Botの初版実装は必須化せず、INTELLIGENCEへ接続し包括Write権限を禁止 | L1-020 | 020,026 |
| §22 | HARNESS工程、Product固有要求、開発計画、Worker配置、長期改善評価、runtimeをSECURITYの所有にしない | L1-020・提供価値 | 共通条件, 007,020,022–027 |
| §23 | External→CONNECT→SECURITY→LABO/INTELLIGENCE; INTELLIGENCE request→SECURITY→OS→Worker; update→SECURITY→Worker→HARNESS→OS; Web→WEB-OS→Asset boundaryの4 flow。機構間=connection、複数機構能力=composite | 接続要求表 | 021–027 |
| §24 | 1.0のTrust/Isolation/Integrity/Credential/Egress/Runtime/Authority/Revoke/Update/Supply Chain/Artifact/Persistence。1.x Web開始前のAsset protection/exposure/semantic exfil/probing/core egress。ただしidentity/classification基盤は1.0 | L1-001〜020 | 全candidateの`version_target`と015/016/017–019/020/025/026/028の版境界 |

## 旧HELIX資産との対応

旧資産は意味を照合する資料としてのみ参照した。旧runtime、CLI、Hook、test、CIを実行せず、legacyのauthority status、approval、実装成功を現行authorityへ継承しない。

| 旧source（asset ID、行、SHA-256） | 保持する意味 | 変更・限定する意味 | 今回L2候補にしない/残置するもの |
|---|---|---|---|
| `LEGACY-ASSET-322CD23B625A08E2BFB3`; `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requests.md` lines 14–24, 33–44; SHA `c6d76cd77529eea34518c554a555ed255cff390a34faf679806e50450c4df447` | exact target/operation/environment/network-data scope/expiry、revoke/scope driftで停止、unknown継続禁止、sensitive evidence流出抑制 | scopeを限定security engagementから全HELIX操作のauthority境界へ広げる根拠はPO L1であり、旧候補の採択/plan gate/特権作業範囲は移さない | 無認可scan/exploit等の安全境界は旧candidate内の文脈を保ち、現行のsecurity engagement採択を本PRで決めない |
| `LEGACY-ASSET-B62E49D2E156232B8C63`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md` lines 30–80; SHA `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` | operation/target/provenance/data/sink/impact/approval/postcondition/rollback/expiryを一つのrisk値へ縮退させず、unknown/欠落を拒否する意味 | old current requirement v1.3.12、schema/implementation/runtime coverageを本書のauthorityや実装仕様として引き継がない。必要なL1意図だけを候補粒度に再導出 | 旧物理path/symlink/TOCTOU判定等の詳細は新L3候補の具体設計に残す |
| `LEGACY-ASSET-170112AB2FA2FFDBFEE9`; `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md` lines 18–30; SHA `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | unknown/omitted field、identity drift、credential/PII egress、rollback欠落、sandbox未対応をnegative oracleにする | 旧SEC-AC IDsや実装済みテストを新L11合格の証拠としない。必要な意味を新候補の受入例へ写すだけ | symlink/junction/mount/hardlink/mutation/canaryの具体test designは下流層へ残す |
| `LEGACY-ASSET-99C939E249CAF40935CB`; `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md` lines 61–64; SHA `f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2` | secret-like token predicateをsingle sourceにする | legacy module/code/APIをcopyしない。L1-005にあるcredential/context/artifact/egress/revoke境界へ意味を広げる | runtime implementation semantics remain archive; no reuse claim |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` lines 186, 297–300; SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`。関連filter source: `LEGACY-ASSET-B8BBC1D5A8C91E746405`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/pillar-basic-design.md` lines 145–146; SHA `d010289ee78b054642bb170164808144bf842be8e01454fb19d7a67fb309cc56` | injection/tool injection/exfil誘導の検出、分類、隔離/redaction/review/deny、audit evidenceをnegative oracleとして保つ | 検出器の完全性を主防御にせず、L1-001/002の「未信頼情報からauthorityへ直接届かない」を主防御にする | 旧検出/分類ruleとsecurity filter設計の技術詳細はL3以降に留保 |
| `docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md` §§15/19（L2-014/018） | — | PO原文に対応する旧要求sourceはL1調査で見つからなかった。PO原文からの新候補であると表示し、旧資産由来と偽らない | memory poisoning/persistence boundaryとinternal probing detectionの旧source不在を保持 |

旧candidate source atomsは`MPR-SH-CANDIDATE-003`の入力集合にある。対象の旧SEA requests/requirements/acceptance line atomsはそれぞれ `LEGACY-CAND-LINE-004341..004373`（33行、source lines 1–44）、`004374..004419`（46行、source lines 1–57）、`004308..004340`（33行、source lines 1–38）である。file SHAは前表のrequests `c6d76c…f447`、requirements `38a68e…b16`、acceptance `c8d332…ffc`。この行数は登録済み候補sourceの集合であり、意味を全件移管したという主張ではない。L2候補のreceiptで各atomを保持、別の生存中登録へ保留、または人間decisionのいずれかへ割り当てる。

## 人の判断が残る点

1. **SECURITY L1 parent revision** — 根拠: `security-intent.md` frontmatterは`draft_candidate`、本文line20はPOが対象revisionを確認すると明記し、sourceは2026-09-26 PO原文（sha256 `699a0a0df5e92cfe7367dded2ab4c1e1d1cc6f4d8b1bff0418cdfa58e4768c0c`）。選択肢: この正確なL1本文revisionを候補起草の親として受け取る／L1を修正してから再度候補を確認する。推奨: 本文の意味を変更せず、候補起草の入力revisionとして確認する。影響: HELIXSECURITY-L2-001〜028と対応L11全件。決定前もこのPRはdraft proposalに限り、採択・実装へ進まない。
2. **旧SEAの全操作authorityへの適用幅** — 根拠: 旧SEAは認可済みsecurity engagementのみ、現行L1-008/009はHELIX全操作へ広げる。選択肢: L1記載どおり全操作へ適用／security engagementに限定。推奨: L1を変えないならL2-008/009/022のscopeを全操作とし、旧SEA固有のsecurity engagement admissionは別扱いで残置する。影響: 操作authority、失効、OS/Worker/CONNECTへの停止伝播。全操作への一般化を人が確認していない場合、L1-008/009 revision確認は要求採択前に必要。

## authorityと状態

全候補と受入は未採択・未実行である。文書、coverage receipt、登録、review、CI相当の記録だけからrequirements agreement、L3 approval、runtime enforcement、Web公開許可、security certificationを生成しない。旧authority、legacy green、旧test、既存配置の存在で不足を相殺しない。
