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

## config_driftの既決境界と残る原文処置

原文条件：config drift時はTL単独の人間承認を必須とし、記録がなければ操作を行わない（旧Retrofit:22,74,76,89）。この原文はsource snapshotに保持する。

**既決事項**：[2026-09-28 SECURITY判断](../../decisions/helix-security-requirements-po-decision-2026-09-28.md)の20行・70行で、POは次のA案を採用した。

> SECURITYはA案を採用する。全操作のauthority境界を適用するが、有効な既決権限を再利用し、通常作業の毎回の人間承認は追加しない。

したがって、通常のconfig drift変更についても、有効な対象operation/revision/scope・期限に合う既決権限を再利用し、変更・失効時は再照合する。変更ごとの人間承認は追加しない。この点は再質問しない。旧`tl`役職も復活させない。人が持つ上流意味・承認済み範囲を変える場合は、既存authority境界による人の判断へ戻す。

**残る原文の処置案**：旧TL signoffの意味を、既決A案との対応としてどの範囲まで保持するかを記録する。毎回承認の復活を選択肢にしない。

1. **standing authorityへ再導出（推奨）**：旧条件の「対象への権限とその記録」をSECURITY-L2-008の対象・scope・期限・記録へ対応付け、通常変更では有効な既決権限の再利用により満たす。旧TL役職と変更ごとの新規signoffは既決A案に沿って置換する。上流意味を変える場合は既存の人間判断へ戻す。
2. **旧signoff条件の適用範囲を上流変更に限定して記録**：旧TL固有signoffを通常変更には引き継がず、上流意味・承認済み範囲を変えるconfig driftに限り既存の人間判断へ対応付ける。通常変更の権限・記録は既決SECURITY契約に従う。原文の適用範囲を狭める意味変更として記録する。

いずれも既決A案を変更せず、通常作業の毎回の人間承認を導入しない。推奨1は操作の許可要求ではなく、旧条件の意味・記録の移管案である。旧conditionの個別処置は最終原文照合の判断材料へ残し、この監査記録から新しい人間decisionを生成しない。

**影響範囲**：HELIXOS-L2-036は全Retrofit upgradeの自動検証義務・結果とplan stateの接続を扱い、config drift一般の承認規則を変更しない。原文処置の参照先は既決SECURITY-L2-008/009/022とOS ticket記録であり、HARNESS oracleや実操作許可は補作しない。

## upgrade preflightのsource scope整理

旧requirements v1.3:624は、Retrofitへのroute条件`dependency_outdated`／`upgrade`／`config_drift`の記載中「upgradeはpreflight必須」とし、scopeをhigh-riskに限定していない。旧Concept:470–471の`requires_preflight`は「upgrade高リスク時」と述べるため、これは全upgrade必須のうち強調されたrisk-specific policyとして保持でき、`only high-risk`への限定を導かない。旧Retrofit process:36は高リスク時をimpact assessmentへ配置し、:86はpreflight fail時はpassまでmigration planへ進めない条件を示す。よって候補は全Retrofit upgradeにpreflightを要求し、計画確定前のpass確認を明示する。

execution-policy-registry.v1.json:141–155の`RETROFIT_STANDARD_SAFE`は`HELIX_DOCTOR`という`escalation_class: read_only` commandの`action_stage: verify`, `preflight_policy: required`を、安全条件（production/destructive/credential/backend impactがfalse）で束ねるoperation policyである。これはverify時のread-only policy出力であり、Retrofit全変更のapply authorityやapply前操作を意味しない。候補ではregistryの役割を意味範囲にとどめ、別A/B判断を作らない。

旧sourceはpreflightの具体的なchecker内容が互換性判定なのかscope/impact確認なのか定義していない。現行HARNESS-L2-005のoracle責務に具体化を戻し、未知なら未評価でHARNESS ownerへ返す。`doctor --preflight`という旧CLI/runtime/schemaは再利用しない。

## 対象revision

調査時点のHEAD `4e32651360504b7b206087960b37aefe27c4c1aa`。現行参照本文SHA-256：OS L1 `docs/helix-os/L1-planning/system-intent.md`=`2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`; OS L2 `docs/helix-os/L2-requirements/governance-requirements.md`=`5ef17f16cf6735758de953974756e1047d91c09c5e35a11b67a918d3eb0d7666`; OS L11 `docs/helix-os/L11-acceptance/governance-acceptance.md`=`59b6ac36d643294950da593153d1f26881d0f63a949a967696f6828fee811ed0`. 036候補は上記時点で各文書に未存在。
