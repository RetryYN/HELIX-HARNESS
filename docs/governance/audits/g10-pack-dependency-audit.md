# G10 全件依存意味監査

- 日付: 2026-09-27
- 対象: `RetryYN/HELIX-HARNESS` のmain `c75b3b8c64ad2f209be76cf53ea87463149f1458`、seed 305 identity / 10 L2 source docs。
- 成果物JSON: [依存区分全件JSON](g10-pack-dependency-audit.json)（各identityの全依存項目、source path/SHA/行、依存原文を収録）。
- 監査対象revisionの既存本文を読み、依存条件を分類した。本文の追補候補はHARNESS-L2-023とHELIXLABO-L2-058として別に示す。旧runtime/CLI/hook/CI/testは実行しない。

## 旧FRSから保持・変更する意味

- 要求 `LEGACY-ASSET-B75E46DBE77592351574`（[FRS requirements](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md):89–92 R-06、134–142 R-13/14、190–194 R-20、209–217 R-23/24）: include/excludeをexactにし、unknown Slice、欠落依存、overlap、implicit inclusionを拒む。
- 受入 `LEGACY-ASSET-67ADFAB856D954B3C5D2`（[FRS acceptance](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md):39 AC-006、46–47 AC-013/014、55 AC-022、58 AC-025）とrequest `LEGACY-ASSET-201EED9C5D6D2FF4D41B`（[FRS request](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md):28–31 BR-002、38–41 BR-004、64–67 BR-009）: shared/authority/cross-slice/release経路を依存closureで検証し、unknown/ambiguous/staleをlocal greenへ丸めずfail-close。
- FRS-R-20は現責務・利用・検証・更新/rollbackから境界を導き、固定旧数を持ち込まずdependency cycleや未解決edgeを隠さない。R-23/24はtarget/operation/impactごとのauthorization/isolation/exclusivity/evidence/recovery closureを保ち、必要な安全依存をoptional化せず、composite受入を単体greenから分ける。
- 変更は旧Module/Bundle/Slice IDとruntimeを現行authorityにしないこと。現行L2/HARNESS pack契約に意味を再導出し、依存を常時/操作時/選択入力時/参照に分ける。四区分はPO指示を現行本文へ適用する分類であり、旧FRSに存在したとは主張しない。

## 判定規則

- `always_required`: 原文の依存・安全契約が常時要求する。該当性・版・充足がunknownなら未充足で停止し、条件付きや参照へ落とさない。
- `operation_conditioned`: 原文で名指しされた操作/構成が発火した時に必要。発火条件がunknownなら未充足として扱う。
- `selected_input_conditioned`: 選択/採択/提供されたsource/input/endpointだけに必要。未選択sourceは未観測のまま保持する。
- `reference_only`: sourceがそのIDをscope/provenance/traceの参照だけと明記した関係。候補/Vision/detailというauthority/kindは別軸であり、安全依存を落とす理由にならない。
- `ambiguous`: 原文が依存を述べるが、対象または条件が特定できない箇所。未解決のまま未充足で停止し、optionalにはしない。dependency fieldのない表行はこれに含めず、架空のmissing-edge findingを作らない。
- 入力contractが必要という判定とruntime実装が必要という判定は別である。ID依存は当該sourceが要求する契約・入力・記録義務を示し、参照先runtimeの稼働を自動で要求しない。代行入力を許す場合もproposal/schema、scope、receipt、oracle、元の安全義務を維持する。JSONでは各edgeに `implementation_requirement: not_inferred_from_dependency_classification` を付けた。

## 補強候補（意味変更ではなく明確化を優先）

1. LABO-001: L2-021..030は対応可能なsource connector候補の集合で、選ばれたsourceだけが当該観測の入力依存。Worker-only観測ならLABO-028を選び、他の接続を未観測として保持。031/032は各Web/Web-OS source contractの採択と選択後だけ。
2. G9初回経路: OS027の開始時入力/六つの低risk適格条件と、OS018/019/023の実行後記録・handoffを分ける。OS026はscope/依存境界の参照のみ。LABO057の027はprovenanceのみ。性能未評価だけでは許否を決めず、条件不明は停止、成功runもLABO実測評価まで未評価を維持。
3. CONNECT-001..007は機構間edge自体でなく単体/構成体能力。各本文で要求する登録/互換/receipt/SECURITY/HARNESS契約を保持。「他edge不要」は当該能力以外の辺を一律追加しない意味。
4. INFRA-009→OS014はHELIX自身のstage-releaseへ組み込む操作の時だけ。BRAIN-020/025/027→BRAIN-L2-INFRA-017はInfrastructure候補maturityを扱う時だけ。範囲とownerを原文に沿って維持。
5. HXT、旧表形式、Vision/detail identityは独立packへ変換しないが、authority/kindだけでdependencyをreference-onlyにしない。各原文行・detail義務はidentity別にJSONへ保持する。

## G8/G9への影響

- G8のsource bytesは変更していない。実際の収載表はLABO-001/028/055/054を含み、LABO-021..030を10個の別runtime packとして一律収載していない。G10での差分は既存収載から「46→37件削除」ではない。以前の一律展開が生んだ過剰な必須読みを解き、Worker-onlyなら028だけ選ぶと明確化し、残りは未観測・未選択の能力として保持する。001/028/055/054、安全・authority・receipt条件は維持。
- G8の実証不足は別に残る：候補採択/正確な互換contract・artifact revision、HARNESS oracle/receipt、OS promotion schema/receipt、SECURITY/INFRA/CONNECTの実適用と実行証拠、復旧証明。G10はこれらを充足済みにせず、runtime permissionも生成しない。G8条件と本追補のsourceは[G8 v0.1監査](g8-v0-1-scope-derivation.md)を参照。
- G9: 旧RLO-FR-040（asset `LEGACY-ASSET-50CA1C554747F12266D3`）だけでは初回assignment/runの入力・権限・検証・結果handoffは閉じず、別記RLO-AC-030（asset `LEGACY-ASSET-437A6A68F9A9E0AE1B9E`）も受入観点として対応づける。OS027の開始前入力と六条件、後段のOS018/019/023 record/handoff、LABO観測受入を区別する。OS020 CI実装は前提にせず、HARNESS-022 oracle検証証拠は必須（許容された人手検証を含む）。LABO-057はOS018/019/023＋LABO001/028/056と、CONNECT契約または同じ義務を満たす明示人手receiptを要し、OS027はprovenance参照のみ。INT066はINT010 proposal契約/schema本文を適用するがINT runtimeは要しない。
- G9は要件/契約であり、対象revisionの人間decision、実authority、稼働実版、実績、run receipt、Bench評価の証拠ではない。実証不足は未確認のまま、性能未評価と実行許可を分離し、成功初回runでもLABO評価までは未評価を維持する。

## 全identity一覧

| Identity | 出所 (path:line; SHAはJSON) | 既存分類 | 依存分類 |
|---|---|---|---|
| `HELIXBRAIN-L2-001` | `docs/helix-brain/L2-requirements/brain-requirements.md:84-94` | connection/compositeへ委譲されたunit |  |
| `HELIXBRAIN-L2-002` | `docs/helix-brain/L2-requirements/brain-requirements.md:95-105` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-003` | `docs/helix-brain/L2-requirements/brain-requirements.md:106-116` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-004` | `docs/helix-brain/L2-requirements/brain-requirements.md:117-127` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXBRAIN-L2-005` | `docs/helix-brain/L2-requirements/brain-requirements.md:128-138` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXBRAIN-L2-006` | `docs/helix-brain/L2-requirements/brain-requirements.md:139-149` | connection/compositeへ委譲されたunit | always_required 4 |
| `HELIXBRAIN-L2-007` | `docs/helix-brain/L2-requirements/brain-requirements.md:150-160` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-008` | `docs/helix-brain/L2-requirements/brain-requirements.md:161-171` | connection/compositeへ委譲されたunit | always_required 4 |
| `HELIXBRAIN-L2-009` | `docs/helix-brain/L2-requirements/brain-requirements.md:172-182` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-010` | `docs/helix-brain/L2-requirements/brain-requirements.md:183-193` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-011` | `docs/helix-brain/L2-requirements/brain-requirements.md:194-204` | connection/compositeへ委譲されたunit | always_required 4 |
| `HELIXBRAIN-L2-012` | `docs/helix-brain/L2-requirements/brain-requirements.md:205-215` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-018` | `docs/helix-brain/L2-requirements/brain-requirements.md:394-403` | 明示connection | always_required 2 |
| `HELIXBRAIN-L2-019` | `docs/helix-brain/L2-requirements/brain-requirements.md:404-413` | 明示connection | always_required 4 |
| `HELIXBRAIN-L2-020` | `docs/helix-brain/L2-requirements/brain-requirements.md:414-423` | 明示connection | always_required 4, operation_conditioned 1 |
| `HELIXBRAIN-L2-021` | `docs/helix-brain/L2-requirements/brain-requirements.md:424-433` | 明示connection | always_required 4 |
| `HELIXBRAIN-L2-022` | `docs/helix-brain/L2-requirements/brain-requirements.md:434-443` | 明示connection | always_required 4 |
| `HELIXBRAIN-L2-023` | `docs/helix-brain/L2-requirements/brain-requirements.md:444-453` | 明示connection | always_required 5 |
| `HELIXBRAIN-L2-024` | `docs/helix-brain/L2-requirements/brain-requirements.md:454-463` | connection条件を含むcomposite | always_required 7 |
| `HELIXBRAIN-L2-025` | `docs/helix-brain/L2-requirements/brain-requirements.md:464-473` | connection条件を含むcomposite | always_required 6, operation_conditioned 1 |
| `HELIXBRAIN-L2-026` | `docs/helix-brain/L2-requirements/brain-requirements.md:474-483` | 明示connection | always_required 3 |
| `HELIXBRAIN-L2-027` | `docs/helix-brain/L2-requirements/brain-requirements.md:484-493` | connection条件を含むcomposite | always_required 6, operation_conditioned 1 |
| `HELIXBRAIN-L2-028` | `docs/helix-brain/L2-requirements/brain-requirements.md:494-503` | 共通pack条件を含むunit | always_required 3 |
| `HELIXBRAIN-L2-INFRA-001` | `docs/helix-brain/L2-requirements/brain-requirements.md:220-229` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-INFRA-002` | `docs/helix-brain/L2-requirements/brain-requirements.md:230-239` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-INFRA-003` | `docs/helix-brain/L2-requirements/brain-requirements.md:240-249` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-INFRA-004` | `docs/helix-brain/L2-requirements/brain-requirements.md:250-259` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-INFRA-005` | `docs/helix-brain/L2-requirements/brain-requirements.md:260-269` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-INFRA-006` | `docs/helix-brain/L2-requirements/brain-requirements.md:270-281` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXBRAIN-L2-INFRA-007` | `docs/helix-brain/L2-requirements/brain-requirements.md:282-291` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-INFRA-008` | `docs/helix-brain/L2-requirements/brain-requirements.md:292-301` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-INFRA-009` | `docs/helix-brain/L2-requirements/brain-requirements.md:302-311` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-INFRA-010` | `docs/helix-brain/L2-requirements/brain-requirements.md:312-321` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-INFRA-011` | `docs/helix-brain/L2-requirements/brain-requirements.md:322-331` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-INFRA-012` | `docs/helix-brain/L2-requirements/brain-requirements.md:332-341` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXBRAIN-L2-INFRA-013` | `docs/helix-brain/L2-requirements/brain-requirements.md:342-351` | connection/compositeへ委譲されたunit | always_required 4 |
| `HELIXBRAIN-L2-INFRA-014` | `docs/helix-brain/L2-requirements/brain-requirements.md:352-361` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXBRAIN-L2-INFRA-015` | `docs/helix-brain/L2-requirements/brain-requirements.md:362-371` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXBRAIN-L2-INFRA-016` | `docs/helix-brain/L2-requirements/brain-requirements.md:372-381` | connection/compositeへ委譲されたunit | always_required 4 |
| `HELIXBRAIN-L2-INFRA-017` | `docs/helix-brain/L2-requirements/brain-requirements.md:382-391` | connection/compositeへ委譲されたunit | always_required 4 |
| `HARNESS-L2-001` | `docs/helix-harness/L2-requirements/product-requirements.md:52` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-002` | `docs/helix-harness/L2-requirements/product-requirements.md:53` | connection/compositeへ委譲されたunit |  |
| `HARNESS-L2-003` | `docs/helix-harness/L2-requirements/product-requirements.md:54` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-004` | `docs/helix-harness/L2-requirements/product-requirements.md:55` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-005` | `docs/helix-harness/L2-requirements/product-requirements.md:56` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-006` | `docs/helix-harness/L2-requirements/product-requirements.md:57` | unit/detail（接続非該当） | selected_input_conditioned 7 |
| `HARNESS-L2-007` | `docs/helix-harness/L2-requirements/product-requirements.md:58` | unit（接続条件はあるが独立edgeではない） | always_required 8 |
| `HARNESS-L2-008` | `docs/helix-harness/L2-requirements/product-requirements.md:59` | connection/compositeへ委譲されたunit |  |
| `HARNESS-L2-009` | `docs/helix-harness/L2-requirements/product-requirements.md:60` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-010` | `docs/helix-harness/L2-requirements/product-requirements.md:340-351` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-011` | `docs/helix-harness/L2-requirements/product-requirements.md:352-362` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-012` | `docs/helix-harness/L2-requirements/product-requirements.md:363-370` | unit/detail（接続非該当） | always_required 1 |
| `HARNESS-L2-013` | `docs/helix-harness/L2-requirements/product-requirements.md:371-378` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-014` | `docs/helix-harness/L2-requirements/product-requirements.md:379-386` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HARNESS-L2-015` | `docs/helix-harness/L2-requirements/product-requirements.md:387-394` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HARNESS-L2-016` | `docs/helix-harness/L2-requirements/product-requirements.md:395-402` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HARNESS-L2-017` | `docs/helix-harness/L2-requirements/product-requirements.md:403-410` | unit/detail（接続非該当） |  |
| `HARNESS-L2-018` | `docs/helix-harness/L2-requirements/product-requirements.md:411-418` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-019` | `docs/helix-harness/L2-requirements/product-requirements.md:419-426` | unit（接続条件はあるが独立edgeではない） |  |
| `HARNESS-L2-020` | `docs/helix-harness/L2-requirements/product-requirements.md:427-437` | 明示connection | selected_input_conditioned 1 |
| `HARNESS-L2-021` | `docs/helix-harness/L2-requirements/product-requirements.md:438-446` | connection条件を含むcomposite | always_required 8 |
| `HARNESS-L2-022` | `docs/helix-harness/L2-requirements/product-requirements.md:447-461` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HXT-CORE-01` | `docs/helix-harness/L2-requirements/product-requirements.md:313` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HXT-CORE-02` | `docs/helix-harness/L2-requirements/product-requirements.md:314` | 明示connection | always_required 2 |
| `HELIXINFRASTRUCTURE-L2-001` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:32-41` | connection/compositeへ委譲されたunit |  |
| `HELIXINFRASTRUCTURE-L2-002` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:42-51` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXINFRASTRUCTURE-L2-003` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:52-61` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXINFRASTRUCTURE-L2-004` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:62-71` | connection/compositeへ委譲されたunit | always_required 1, reference_only 1 |
| `HELIXINFRASTRUCTURE-L2-005` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:72-81` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HELIXINFRASTRUCTURE-L2-006` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:82-91` | connection/compositeへ委譲されたunit | always_required 1 |
| `HELIXINFRASTRUCTURE-L2-007` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:92-101` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXINFRASTRUCTURE-L2-008` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:104-113` | 明示connection | always_required 2 |
| `HELIXINFRASTRUCTURE-L2-009` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:114-123` | 明示connection | always_required 4, operation_conditioned 1 |
| `HELIXINFRASTRUCTURE-L2-010` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:126-135` | connection条件を含むcomposite | always_required 4 |
| `HELIXINFRASTRUCTURE-L2-011` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:138-147` | connection条件を含むcomposite | selected_input_conditioned 10 |
| `HELIXINFRASTRUCTURE-L2-012` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:152-161` | unit（接続条件はあるが独立edgeではない） | always_required 5 |
| `HELIXINFRASTRUCTURE-L2-013` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:162-171` | unit（接続条件はあるが独立edgeではない） | always_required 5 |
| `HELIXINFRASTRUCTURE-L2-014` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:172-181` | 明示connection | always_required 4 |
| `HELIXINFRASTRUCTURE-L2-015` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:182-191` | unit（接続条件はあるが独立edgeではない） | always_required 6 |
| `HELIXINFRASTRUCTURE-L2-016` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:192-201` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXINFRASTRUCTURE-L2-017` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:202-211` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXINFRASTRUCTURE-L2-018` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:212-221` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXINFRASTRUCTURE-L2-019` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:222-231` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXINFRASTRUCTURE-L2-020` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:232-241` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HELIXINFRASTRUCTURE-L2-021` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:242-251` | unit（接続条件はあるが独立edgeではない） | always_required 5 |
| `HELIXINFRASTRUCTURE-L2-022` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:252-263` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXINFRASTRUCTURE-L2-023` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:264-273` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXINFRASTRUCTURE-L2-024` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:274-284` | connection/compositeへ委譲されたunit | always_required 5 |
| `HELIXINFRASTRUCTURE-L2-025` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:287-296` | 明示connection | always_required 2 |
| `HELIXINFRASTRUCTURE-L2-026` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:299-308` | 明示connection | always_required 8 |
| `HELIXINTELLIGENCE-L2-001` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:48-53` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HELIXINTELLIGENCE-L2-002` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:54-59` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HELIXINTELLIGENCE-L2-003` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:60-65` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-004` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:66-71` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-005` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:72-77` | connection/compositeへ委譲されたunit | always_required 3 |
| `HELIXINTELLIGENCE-L2-006` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:78-83` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-007` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:84-89` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-008` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-95` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-009` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:96-101` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:102-107` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:108-113` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-012` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:114-119` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-013` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:120-125` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-014` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:126-131` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-015` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:132-137` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-016` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:138-143` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-017` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:202-207` | 明示connection | always_required 4 |
| `HELIXINTELLIGENCE-L2-018` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:144-149` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-019` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:150-155` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-020` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:156-161` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-021` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:162-167` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-022` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:168-173` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-023` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:174-179` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-024` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:180-185` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-025` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:186-191` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-026` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:192-197` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXINTELLIGENCE-L2-030` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:208-216` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-031` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:217-225` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-032` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:226-234` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-033` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:235-243` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-034` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:244-252` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-035` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:253-261` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-036` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:262-270` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-037` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:271-279` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-038` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:280-288` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-039` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:289-297` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-040` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:298-306` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-041` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:307-315` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-042` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:316-324` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-043` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:325-333` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-044` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:334-342` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-045` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:343-351` | 明示connection |  |
| `HELIXINTELLIGENCE-L2-060` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:354-359` | connection条件を含むcomposite |  |
| `HELIXINTELLIGENCE-L2-061` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:360-365` | connection条件を含むcomposite |  |
| `HELIXINTELLIGENCE-L2-062` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:366-371` | connection条件を含むcomposite |  |
| `HELIXINTELLIGENCE-L2-063` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:372-377` | connection条件を含むcomposite |  |
| `HELIXINTELLIGENCE-L2-064` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:378-383` | connection条件を含むcomposite |  |
| `HELIXINTELLIGENCE-L2-065` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:384-389` | connection条件を含むcomposite | always_required 6 |
| `HELIXLABO-L2-001` | `docs/helix-labo/L2-requirements/labo-requirements.md:69-76` | unit（接続条件はあるが独立edgeではない） | always_required 2, selected_input_conditioned 12 |
| `HELIXLABO-L2-002` | `docs/helix-labo/L2-requirements/labo-requirements.md:77-84` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXLABO-L2-003` | `docs/helix-labo/L2-requirements/labo-requirements.md:85-92` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXLABO-L2-004` | `docs/helix-labo/L2-requirements/labo-requirements.md:93-100` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXLABO-L2-005` | `docs/helix-labo/L2-requirements/labo-requirements.md:101-108` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXLABO-L2-006` | `docs/helix-labo/L2-requirements/labo-requirements.md:109-116` | unit（接続条件はあるが独立edgeではない） | always_required 6 |
| `HELIXLABO-L2-007` | `docs/helix-labo/L2-requirements/labo-requirements.md:117-124` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXLABO-L2-008` | `docs/helix-labo/L2-requirements/labo-requirements.md:125-132` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXLABO-L2-009` | `docs/helix-labo/L2-requirements/labo-requirements.md:133-140` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXLABO-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:141-149` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXLABO-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:163-166` | 明示connection | always_required 1 |
| `HELIXLABO-L2-012` | `docs/helix-labo/L2-requirements/labo-requirements.md:167-170` | 明示connection | always_required 1 |
| `HELIXLABO-L2-013` | `docs/helix-labo/L2-requirements/labo-requirements.md:171-174` | 明示connection | always_required 1 |
| `HELIXLABO-L2-014` | `docs/helix-labo/L2-requirements/labo-requirements.md:175-178` | 明示connection | always_required 1 |
| `HELIXLABO-L2-015` | `docs/helix-labo/L2-requirements/labo-requirements.md:179-182` | 明示connection | always_required 1 |
| `HELIXLABO-L2-016` | `docs/helix-labo/L2-requirements/labo-requirements.md:183-186` | 明示connection | always_required 1 |
| `HELIXLABO-L2-017` | `docs/helix-labo/L2-requirements/labo-requirements.md:187-190` | 明示connection | always_required 1 |
| `HELIXLABO-L2-018` | `docs/helix-labo/L2-requirements/labo-requirements.md:191-194` | 明示connection | always_required 1 |
| `HELIXLABO-L2-019` | `docs/helix-labo/L2-requirements/labo-requirements.md:195-198` | 明示connection | always_required 1 |
| `HELIXLABO-L2-020` | `docs/helix-labo/L2-requirements/labo-requirements.md:199-202` | 明示connection | always_required 2 |
| `HELIXLABO-L2-021` | `docs/helix-labo/L2-requirements/labo-requirements.md:203-206` | 明示connection |  |
| `HELIXLABO-L2-022` | `docs/helix-labo/L2-requirements/labo-requirements.md:207-210` | 明示connection |  |
| `HELIXLABO-L2-023` | `docs/helix-labo/L2-requirements/labo-requirements.md:211-214` | 明示connection |  |
| `HELIXLABO-L2-024` | `docs/helix-labo/L2-requirements/labo-requirements.md:215-218` | 明示connection |  |
| `HELIXLABO-L2-025` | `docs/helix-labo/L2-requirements/labo-requirements.md:219-222` | 明示connection |  |
| `HELIXLABO-L2-026` | `docs/helix-labo/L2-requirements/labo-requirements.md:223-226` | 明示connection |  |
| `HELIXLABO-L2-027` | `docs/helix-labo/L2-requirements/labo-requirements.md:227-230` | 明示connection |  |
| `HELIXLABO-L2-028` | `docs/helix-labo/L2-requirements/labo-requirements.md:231-234` | 明示connection |  |
| `HELIXLABO-L2-029` | `docs/helix-labo/L2-requirements/labo-requirements.md:235-238` | 明示connection |  |
| `HELIXLABO-L2-030` | `docs/helix-labo/L2-requirements/labo-requirements.md:239-242` | 明示connection |  |
| `HELIXLABO-L2-031` | `docs/helix-labo/L2-requirements/labo-requirements.md:243-246` | 明示connection |  |
| `HELIXLABO-L2-032` | `docs/helix-labo/L2-requirements/labo-requirements.md:247-250` | 明示connection |  |
| `HELIXLABO-L2-033` | `docs/helix-labo/L2-requirements/labo-requirements.md:251-254` | 明示connection |  |
| `HELIXLABO-L2-034` | `docs/helix-labo/L2-requirements/labo-requirements.md:255-258` | 明示connection | always_required 1 |
| `HELIXLABO-L2-035` | `docs/helix-labo/L2-requirements/labo-requirements.md:259-262` | 明示connection | always_required 2 |
| `HELIXLABO-L2-036` | `docs/helix-labo/L2-requirements/labo-requirements.md:263-266` | 明示connection |  |
| `HELIXLABO-L2-037` | `docs/helix-labo/L2-requirements/labo-requirements.md:267-270` | 明示connection |  |
| `HELIXLABO-L2-038` | `docs/helix-labo/L2-requirements/labo-requirements.md:271-274` | 明示connection |  |
| `HELIXLABO-L2-039` | `docs/helix-labo/L2-requirements/labo-requirements.md:275-278` | 明示connection |  |
| `HELIXLABO-L2-040` | `docs/helix-labo/L2-requirements/labo-requirements.md:279-282` | 明示connection |  |
| `HELIXLABO-L2-041` | `docs/helix-labo/L2-requirements/labo-requirements.md:283-286` | 明示connection |  |
| `HELIXLABO-L2-042` | `docs/helix-labo/L2-requirements/labo-requirements.md:287-289` | 明示connection |  |
| `HELIXLABO-L2-050` | `docs/helix-labo/L2-requirements/labo-requirements.md:298-303` | connection条件を含むcomposite | always_required 10, selected_input_conditioned 2 |
| `HELIXLABO-L2-051` | `docs/helix-labo/L2-requirements/labo-requirements.md:304-309` | connection条件を含むcomposite | always_required 2 |
| `HELIXLABO-L2-052` | `docs/helix-labo/L2-requirements/labo-requirements.md:310-315` | connection条件を含むcomposite | always_required 1 |
| `HELIXLABO-L2-053` | `docs/helix-labo/L2-requirements/labo-requirements.md:316-321` | connection条件を含むcomposite | always_required 1 |
| `HELIXLABO-L2-054` | `docs/helix-labo/L2-requirements/labo-requirements.md:290-295` | 明示connection | always_required 1 |
| `HELIXLABO-L2-055` | `docs/helix-labo/L2-requirements/labo-requirements.md:150-155` | unit（接続条件はあるが独立edgeではない） | always_required 2, operation_conditioned 1 |
| `HELIXOS-L2-001` | `docs/helix-os/L2-requirements/governance-requirements.md:54` | connection/compositeへ委譲されたunit |  |
| `HELIXOS-L2-002` | `docs/helix-os/L2-requirements/governance-requirements.md:55` | connection/compositeへ委譲されたunit |  |
| `HELIXOS-L2-003` | `docs/helix-os/L2-requirements/governance-requirements.md:56` | connection/compositeへ委譲されたunit |  |
| `HELIXOS-L2-004` | `docs/helix-os/L2-requirements/governance-requirements.md:57` | unit（接続条件はあるが独立edgeではない） |  |
| `HELIXOS-L2-005` | `docs/helix-os/L2-requirements/governance-requirements.md:58` | connection/compositeへ委譲されたunit |  |
| `HELIXOS-L2-006` | `docs/helix-os/L2-requirements/governance-requirements.md:59` | unit（接続条件はあるが独立edgeではない） |  |
| `HELIXOS-L2-007` | `docs/helix-os/L2-requirements/governance-requirements.md:60` | connection/compositeへ委譲されたunit |  |
| `HELIXOS-L2-008` | `docs/helix-os/L2-requirements/governance-requirements.md:61` | connection/compositeへ委譲されたunit |  |
| `HELIXOS-L2-009` | `docs/helix-os/L2-requirements/governance-requirements.md:62` | unit/detail（接続非該当） |  |
| `HELIXOS-L2-010` | `docs/helix-os/L2-requirements/governance-requirements.md:63` | connection/compositeへ委譲されたunit |  |
| `HELIXOS-L2-011` | `docs/helix-os/L2-requirements/governance-requirements.md:64` | connection/compositeへ委譲されたunit |  |
| `HELIXOS-L2-012` | `docs/helix-os/L2-requirements/governance-requirements.md:65` | unit/detail（接続非該当） |  |
| `HELIXOS-L2-013` | `docs/helix-os/L2-requirements/governance-requirements.md:66` | unit（接続条件はあるが独立edgeではない） |  |
| `HELIXOS-L2-014` | `docs/helix-os/L2-requirements/governance-requirements.md:619-635` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HELIXOS-L2-015` | `docs/helix-os/L2-requirements/governance-requirements.md:642-651` | unit（接続条件はあるが独立edgeではない） |  |
| `HELIXOS-L2-016` | `docs/helix-os/L2-requirements/governance-requirements.md:652-661` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HELIXOS-L2-017` | `docs/helix-os/L2-requirements/governance-requirements.md:662-671` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXOS-L2-018` | `docs/helix-os/L2-requirements/governance-requirements.md:672-681` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HELIXOS-L2-019` | `docs/helix-os/L2-requirements/governance-requirements.md:682-691` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HELIXOS-L2-020` | `docs/helix-os/L2-requirements/governance-requirements.md:692-701` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXOS-L2-021` | `docs/helix-os/L2-requirements/governance-requirements.md:702-711` | unit（接続条件はあるが独立edgeではない） | always_required 5, operation_conditioned 1 |
| `HELIXOS-L2-022` | `docs/helix-os/L2-requirements/governance-requirements.md:712-721` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXOS-L2-023` | `docs/helix-os/L2-requirements/governance-requirements.md:722-731` | 明示connection | always_required 6 |
| `HELIXOS-L2-024` | `docs/helix-os/L2-requirements/governance-requirements.md:732-741` | 明示connection | always_required 3 |
| `HELIXOS-L2-025` | `docs/helix-os/L2-requirements/governance-requirements.md:742-751` | connection条件を含むcomposite | always_required 10 |
| `HXT-FLOW-01` | `docs/helix-os/L2-requirements/governance-requirements.md:599` | 明示connection | always_required 2 |
| `HXT-FLOW-02` | `docs/helix-os/L2-requirements/governance-requirements.md:600` | 明示connection | always_required 2 |
| `HXT-FLOW-03` | `docs/helix-os/L2-requirements/governance-requirements.md:601` | 明示connection | always_required 1 |
| `HXT-FLOW-04` | `docs/helix-os/L2-requirements/governance-requirements.md:602` | 明示connection | always_required 1 |
| `HXT-FLOW-05` | `docs/helix-os/L2-requirements/governance-requirements.md:603` | 明示connection | always_required 3 |
| `HXT-FLOW-06` | `docs/helix-os/L2-requirements/governance-requirements.md:604` | 明示connection | always_required 3 |
| `HXT-FLOW-07` | `docs/helix-os/L2-requirements/governance-requirements.md:605` | 明示connection | always_required 2 |
| `HXT-FLOW-08` | `docs/helix-os/L2-requirements/governance-requirements.md:606` | 明示connection | always_required 2 |
| `HXT-FLOW-09` | `docs/helix-os/L2-requirements/governance-requirements.md:607` | 明示connection | always_required 2 |
| `HXT-RQ-01` | `docs/helix-os/L2-requirements/governance-requirements.md:558` | connection/compositeへ委譲されたunit |  |
| `HXT-RQ-02` | `docs/helix-os/L2-requirements/governance-requirements.md:559` | unit/detail（接続非該当） |  |
| `HXT-RQ-03` | `docs/helix-os/L2-requirements/governance-requirements.md:560` | unit/detail（接続非該当） |  |
| `HXT-RQ-04` | `docs/helix-os/L2-requirements/governance-requirements.md:561` | unit/detail（接続非該当） |  |
| `HXT-RQ-05` | `docs/helix-os/L2-requirements/governance-requirements.md:562` | unit/detail（接続非該当） |  |
| `HXT-RQ-06` | `docs/helix-os/L2-requirements/governance-requirements.md:563` | unit/detail（接続非該当） |  |
| `HXT-RQ-07` | `docs/helix-os/L2-requirements/governance-requirements.md:564` | unit（接続条件はあるが独立edgeではない） |  |
| `HXT-SYS-01` | `docs/helix-os/L2-requirements/governance-requirements.md:608` | connection条件を含むcomposite | always_required 4 |
| `HXT-TYPE-01` | `docs/helix-os/L2-requirements/governance-requirements.md:578` | connection/compositeへ委譲されたunit | always_required 1 |
| `HXT-TYPE-02` | `docs/helix-os/L2-requirements/governance-requirements.md:579` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HXT-TYPE-03` | `docs/helix-os/L2-requirements/governance-requirements.md:580` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-04` | `docs/helix-os/L2-requirements/governance-requirements.md:581` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-05` | `docs/helix-os/L2-requirements/governance-requirements.md:582` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-06` | `docs/helix-os/L2-requirements/governance-requirements.md:583` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-07` | `docs/helix-os/L2-requirements/governance-requirements.md:584` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HXT-TYPE-08` | `docs/helix-os/L2-requirements/governance-requirements.md:585` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-09` | `docs/helix-os/L2-requirements/governance-requirements.md:586` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-10` | `docs/helix-os/L2-requirements/governance-requirements.md:587` | unit/detail（接続非該当） | always_required 2 |
| `HXT-TYPE-11` | `docs/helix-os/L2-requirements/governance-requirements.md:588` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-12` | `docs/helix-os/L2-requirements/governance-requirements.md:589` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-13` | `docs/helix-os/L2-requirements/governance-requirements.md:590` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-14` | `docs/helix-os/L2-requirements/governance-requirements.md:591` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-15` | `docs/helix-os/L2-requirements/governance-requirements.md:592` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-16` | `docs/helix-os/L2-requirements/governance-requirements.md:593` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-17` | `docs/helix-os/L2-requirements/governance-requirements.md:594` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-18` | `docs/helix-os/L2-requirements/governance-requirements.md:595` | unit/detail（接続非該当） | always_required 1 |
| `HXT-TYPE-19` | `docs/helix-os/L2-requirements/governance-requirements.md:596` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HXT-TYPE-20` | `docs/helix-os/L2-requirements/governance-requirements.md:597` | unit/detail（接続非該当） | always_required 2 |
| `HXT-TYPE-21` | `docs/helix-os/L2-requirements/governance-requirements.md:598` | unit/detail（接続非該当） | always_required 2 |
| `HXT-USE-01` | `docs/helix-os/L2-requirements/governance-requirements.md:609` | connection/compositeへ委譲されたunit | always_required 2 |
| `HELIXSECURITY-L2-001` | `docs/helix-security/L2-requirements/security-requirements.md:70-79` | unit（接続条件はあるが独立edgeではない） |  |
| `HELIXSECURITY-L2-002` | `docs/helix-security/L2-requirements/security-requirements.md:80-89` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HELIXSECURITY-L2-003` | `docs/helix-security/L2-requirements/security-requirements.md:90-99` | unit（接続条件はあるが独立edgeではない） |  |
| `HELIXSECURITY-L2-004` | `docs/helix-security/L2-requirements/security-requirements.md:100-109` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HELIXSECURITY-L2-005` | `docs/helix-security/L2-requirements/security-requirements.md:110-119` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXSECURITY-L2-006` | `docs/helix-security/L2-requirements/security-requirements.md:120-129` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXSECURITY-L2-007` | `docs/helix-security/L2-requirements/security-requirements.md:130-139` | 明示connection | always_required 4 |
| `HELIXSECURITY-L2-008` | `docs/helix-security/L2-requirements/security-requirements.md:140-149` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXSECURITY-L2-009` | `docs/helix-security/L2-requirements/security-requirements.md:150-159` | connection条件を含むcomposite | always_required 5 |
| `HELIXSECURITY-L2-010` | `docs/helix-security/L2-requirements/security-requirements.md:160-169` | unit（接続条件はあるが独立edgeではない） | always_required 4 |
| `HELIXSECURITY-L2-011` | `docs/helix-security/L2-requirements/security-requirements.md:170-179` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HELIXSECURITY-L2-012` | `docs/helix-security/L2-requirements/security-requirements.md:180-189` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HELIXSECURITY-L2-013` | `docs/helix-security/L2-requirements/security-requirements.md:190-199` | unit（接続条件はあるが独立edgeではない） | always_required 2 |
| `HELIXSECURITY-L2-014` | `docs/helix-security/L2-requirements/security-requirements.md:200-209` | unit（接続条件はあるが独立edgeではない） | always_required 5 |
| `HELIXSECURITY-L2-015` | `docs/helix-security/L2-requirements/security-requirements.md:210-219` | unit（接続条件はあるが独立edgeではない） |  |
| `HELIXSECURITY-L2-016` | `docs/helix-security/L2-requirements/security-requirements.md:220-229` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HELIXSECURITY-L2-017` | `docs/helix-security/L2-requirements/security-requirements.md:230-239` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXSECURITY-L2-018` | `docs/helix-security/L2-requirements/security-requirements.md:240-249` | unit（接続条件はあるが独立edgeではない） | always_required 3 |
| `HELIXSECURITY-L2-019` | `docs/helix-security/L2-requirements/security-requirements.md:250-259` | unit/detail（接続非該当） | always_required 5 |
| `HELIXSECURITY-L2-020` | `docs/helix-security/L2-requirements/security-requirements.md:260-269` | unit（接続条件はあるが独立edgeではない） | always_required 1 |
| `HELIXSECURITY-L2-021` | `docs/helix-security/L2-requirements/security-requirements.md:272-281` | 明示connection | always_required 2 |
| `HELIXSECURITY-L2-022` | `docs/helix-security/L2-requirements/security-requirements.md:282-291` | connection条件を含むcomposite | always_required 5 |
| `HELIXSECURITY-L2-023` | `docs/helix-security/L2-requirements/security-requirements.md:292-301` | connection条件を含むcomposite | always_required 5 |
| `HELIXSECURITY-L2-024` | `docs/helix-security/L2-requirements/security-requirements.md:302-311` | 明示connection | always_required 5 |
| `HELIXSECURITY-L2-025` | `docs/helix-security/L2-requirements/security-requirements.md:312-321` | connection条件を含むcomposite | always_required 4 |
| `HELIXSECURITY-L2-026` | `docs/helix-security/L2-requirements/security-requirements.md:322-331` | 明示connection | always_required 2 |
| `HELIXSECURITY-L2-027` | `docs/helix-security/L2-requirements/security-requirements.md:332-341` | connection条件を含むcomposite | always_required 5 |
| `HELIXSECURITY-L2-028` | `docs/helix-security/L2-requirements/security-requirements.md:342-351` | 共通pack条件を含むunit | always_required 4 |
| `HELIXWEBOS-L2-001` | `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md:22` | Vision候補（補助） |  |
| `HELIXWEBOS-L2-002` | `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md:31` | Vision候補（補助） |  |
| `HELIXWEBOS-L2-003` | `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md:32` | Vision候補（補助） |  |
| `HELIXWEBOS-L2-004` | `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md:24` | Vision候補（補助） |  |
| `HELIXWEBOS-L2-005` | `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md:25` | Vision候補（補助） |  |
| `HELIXWEBOS-L2-006` | `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md:26` | Vision候補（補助） |  |
| `HELIXWEB-L2-001` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:38` | Vision候補（補助） |  |
| `HELIXWEB-L2-002` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:39` | Vision候補（補助） |  |
| `HELIXWEB-L2-003` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:30` | Vision候補（補助） |  |
| `HELIXWEB-L2-004` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:41` | Vision候補（補助） |  |
| `HELIXWEB-L2-005` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:31` | Vision候補（補助） |  |
| `HELIXWEB-L2-006` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:43` | Vision候補（補助） |  |
| `HELIXWEB-L2-007` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:44` | Vision候補（補助） |  |
| `HELIXWEB-L2-008` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:33` | Vision候補（補助） |  |
| `HELIXWEB-L2-009` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md:34` | Vision候補（補助） |  |
| `HELIXOS-L2-026` | `docs/helix-os/L2-requirements/governance-requirements.md:807-823` | added_since_G7 | always_required 1, selected_input_conditioned 3 |
| `HELIXOS-L2-027` | `docs/helix-os/L2-requirements/governance-requirements.md:824-845` | added_since_G7 | always_required 15, reference_only 2 |
| `HELIXCONNECT-L2-001` | `docs/helix-connect/L2-requirements/connect-requirements.md:56-66` | added_since_G7 | always_required 2 |
| `HELIXCONNECT-L2-002` | `docs/helix-connect/L2-requirements/connect-requirements.md:67-77` | added_since_G7 | always_required 3 |
| `HELIXCONNECT-L2-003` | `docs/helix-connect/L2-requirements/connect-requirements.md:78-88` | added_since_G7 | always_required 4 |
| `HELIXCONNECT-L2-004` | `docs/helix-connect/L2-requirements/connect-requirements.md:89-99` | added_since_G7 | always_required 5 |
| `HELIXCONNECT-L2-005` | `docs/helix-connect/L2-requirements/connect-requirements.md:100-110` | added_since_G7 | always_required 2 |
| `HELIXCONNECT-L2-006` | `docs/helix-connect/L2-requirements/connect-requirements.md:113-123` | added_since_G7 | always_required 2 |
| `HELIXCONNECT-L2-007` | `docs/helix-connect/L2-requirements/connect-requirements.md:126-136` | added_since_G7 | always_required 7 |
| `HELIXINTELLIGENCE-L2-066` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:454-464` | added_since_G7 | always_required 3, selected_input_conditioned 2 |
| `HELIXLABO-L2-056` | `docs/helix-labo/L2-requirements/labo-requirements.md:379-390` | added_since_G7 | always_required 3, reference_only 1 |
| `HELIXLABO-L2-057` | `docs/helix-labo/L2-requirements/labo-requirements.md:391-401` | added_since_G7 | always_required 6, reference_only 1 |

JSON添付の全件は各依存ごとの原文引用と行番号を含む。表中の曖昧分類は入力をoptionalにしない。本文に安全義務の発火条件が無い場合も安全依存はunknown/closedのままとする。

## 表とJSONの読み方

一覧表の件数はL2 identityを指す依存項目だけを数える。IDを持たない入力先・受領記録・安全条件はJSONの `non_l2_dependency_items`、入力契約は `required_input_contracts`、共通packの必須宣言項目は `contract_obligations` に、同じ四区分と原文引用で収録する。表の件数0は契約義務0を意味しない。たとえばHARNESS-L2-010には他L2への実行edgeを生成せず8つの共通契約義務を保持する。項目数は機能数・要求総数・実装数へ読み替えない。

## 今回追補した候補の自己照合

基準mainの305 identityとは別に、HARNESS-L2-023とHELIXLABO-L2-058の依存条件をJSONの `self_audit_of_appended_candidates` に収録する。原文の意味を移管せず、分類するための入力契約と実際のruntime実装を区別する。未選択の入力元を未観測として保持し、安全・契約版・authority・receiptの適用条件を落とさない。依存先が不明な場合は不足のまま返す。
