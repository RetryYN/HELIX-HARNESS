# Retrofit preflightとconfig_drift承認に関するPO判断材料

## 対象revision・旧根拠

対象は未採択のOS候補 HELIXOS-L2-036／対L11。候補の現行authorityは承認済みでないため、以下はPO判断済みではない。

旧source `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md`（SHA-256 `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049`）の主要条件は、:30の「現状把握→影響評価→移行計画→段階移行→検証」、:36の高リスクupgrade時に影響評価で `helix doctor --preflight upgrade` を必須とする記載、:86のpreflight failならpassまで移行計画へ進まない記載である。旧Concept `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md`（SHA-256 `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c`）:445,470–479もupgrade高リスク時のpreflightを要求する。旧execution-policy-registry `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json`（SHA-256 `eeb30c1bb51f74798563b31b0802b301fb687d2e750c517061588969a7ff344f`）:141–155は `RETROFIT_STANDARD_SAFE` に `preflight_policy: required` を置く。これらはpreflightの具体的な検査内容、risk閾値、判定者を定義していない。

旧authority条件はpreflightと別に扱う。旧Retrofit本文:22,74,76,89は`config_drift`にTL単独の人間承認と記録を要求する。旧Concept:470–479も`config_drift Retrofit`のTL単独signoffを定める。これは役割・authorityの条件であり、OS036のpreflight接続へ暗黙に取り込まない。

## 推奨する限定再導出

- 全Retrofit upgradeのpreflightは影響評価中に行い、pass前に移行計画を確定しない。未確定plan draftや影響調査は続行できる。
- preflight fail/unknownは移行計画の確定を止める。OSはticket・scope・revision・結果状態を保持し、検査oracleはHARNESS/domain owner、適用権限は既存SECURITY/Worker境界に残す。
- 旧sourceの「高リスク」閾値が見つからないため、OS036候補で数値や分類規則を追加しない。既存risk情報で判定できなければunknownとして保持する。
- `doctor --preflight`という旧実装名、runtime、registry構造は再利用しない。旧Concept/registryから検査内容を「互換性判定」と限定できないので、候補本文でも中身を特定しない。
- config_driftのTL単独サインオフは別の上流authority判断として切り分ける。旧役職名`tl`を新authorityへ直輸入しない。

## config_driftに残る意味判断

原文条件：config drift時はTL単独の人間承認を必須とし、記録がなければ操作を行わない（旧Retrofit:22,74,76,89）。現在の新世代は対象revisionのauthorityを人間decisionへ束縛し、個別操作の権限は既決SECURITY契約から再利用する。旧TL役職を持ち込むと、新しい主体・承認面を作ることになる。一方、これを何の判断もなく除くと旧sourceの承認意味を退役させる。

**選択肢**

1. 旧条件を新しい意味で保全する：config driftの承認条件を現行authority/SECURITY主体へ対応付け、対象・scope・記録を人が判断する。旧`tl`という役職名は復活させない。
2. 旧TL単独サインオフを新世代で採用しない：既存authority境界を維持し、意味変更/retireとして対象revisionに記録する。
3. 保留：既存権限が旧conditionを満たすか確認できるまで、該当config-drift変更の上流条件を未解決のまま保持する。

**推奨**：選択肢1を判断候補とするが、現時点でauthority主体への対応を確定せず、OS036にも含めない。旧役職をそのまま移植するのではなく、対象revisionに対して人間が意味を選んでから既存SECURITY経路へ接続する。

**影響範囲**：HELIXOS-L2-036は、全Retrofit upgradeの義務・結果とplan stateの接続だけを扱う。config_drift一般承認を要求するか、誰が持つかの決定はOS036から独立。HARNESS oracle、SECURITYの既決authority、OS ticket境界を変更せず、採択・retireを推定しない。

## upgrade preflightのsource scope整理

旧requirements v1.3:624は、Retrofitへのroute条件`dependency_outdated`／`upgrade`／`config_drift`の記載中「upgradeはpreflight必須」とし、scopeをhigh-riskに限定していない。旧Concept:470–471の`requires_preflight`は「upgrade高リスク時」と述べるため、これは全upgrade必須のうち強調されたrisk-specific policyとして保持でき、`only high-risk`への限定を導かない。旧Retrofit process:36は高リスク時をimpact assessmentへ配置し、:86はpreflight fail時はpassまでmigration planへ進めない条件を示す。よって候補は全Retrofit upgradeにpreflightを要求し、計画確定前のpass確認を明示する。

execution-policy-registry.v1.json:141–155の`RETROFIT_STANDARD_SAFE`は`HELIX_DOCTOR`という`escalation_class: read_only` commandの`action_stage: verify`, `preflight_policy: required`を、安全条件（production/destructive/credential/backend impactがfalse）で束ねるoperation policyである。これはverify時のread-only policy出力であり、Retrofit全変更のapply authorityやapply前操作を意味しない。候補ではregistryの役割を意味範囲にとどめ、別A/B判断を作らない。

旧sourceはpreflightの具体的なchecker内容が互換性判定なのかscope/impact確認なのか定義していない。現行HARNESS-L2-005のoracle責務に具体化を戻し、未知なら未評価でHARNESS ownerへ返す。`doctor --preflight`という旧CLI/runtime/schemaは再利用しない。

## 対象revision

調査時点のHEAD `4e32651360504b7b206087960b37aefe27c4c1aa`。現行参照本文SHA-256：OS L1 `docs/helix-os/L1-planning/system-intent.md`=`2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`; OS L2 `docs/helix-os/L2-requirements/governance-requirements.md`=`5ef17f16cf6735758de953974756e1047d91c09c5e35a11b67a918d3eb0d7666`; OS L11 `docs/helix-os/L11-acceptance/governance-acceptance.md`=`59b6ac36d643294950da593153d1f26881d0f63a949a967696f6828fee811ed0`. 036候補は上記時点で各文書に未存在。
