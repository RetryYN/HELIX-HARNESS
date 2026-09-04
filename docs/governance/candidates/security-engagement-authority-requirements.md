---
title: "認可済みSecurity engagement要件候補"
layer: L3
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1523
parent_requirements: docs/governance/candidates/security-engagement-authority-requests.md
pair_artifact: docs/governance/candidates/security-engagement-authority-acceptance.md
---

# 認可済みSecurity engagement要件候補

## 正本境界

本書は#1523の未承認L3候補である。#679はoperation capability、physical target、provenance、data／sink、
impact、action bindingを判定する実行brokerを所有する。本書はその上流でSecurity engagementの認可、特権分離、
finding lifecycle、restricted evidence、revokeを所有する。broker判定を省略、上書き、別greenで相殺してはならない。

## 機能要件候補

| ID | 要件候補 |
|---|---|
| `SEA-FR-001` | `SecurityAuthorization`はauthorization ID、asset owner、source、authorized target exact set、allowed／forbidden action、environment、network／data scope、issued／expiry、human authority、provider access class、digestを別fieldで保持する。 |
| `SEA-FR-002` | authorization不在、期限切れ、target／scope／environment／provider class／digest不一致ではmodel、tool、network invocationを0件にする。 |
| `SEA-FR-003` | `NORMAL`と`PRIVILEGED_INTERNAL_SECURITY`のcredential、queue、lease、evidence、fallbackを分離し、通常taskから特権classへ到達不能にする。 |
| `SEA-FR-004` | `SECURITY_DEFENSIVE`、`SECURITY_VALIDATION`、`SECURITY_EXPLOIT_VALIDATION`をtyped profileとして保持し、自由式condition、近似binding、未登録commandを拒否する。 |
| `SEA-FR-005` | production、credential、destructive、external network、exploit reproduction、restricted artifact、High以上の自動修正、disclosureはtarget、operation、HEAD、policy digest、expiryへ束縛したaction-specific human authorityを要求する。 |
| `SEA-FR-006` | Security receiptはauthorization、target、scope、provider/runtime/model/session、source HEAD、finding、reproduction、patch、test、verifier、human authority、verdict、timeを値非表示で束縛し、episodeをreplay可能にする。 |
| `SEA-FR-007` | findingは`SUSPECTED`→`REPRODUCED`→`VALIDATED`→`PATCHED`→`INDEPENDENTLY_VERIFIED`→`REMEDIATED`を区別し、`FALSE_POSITIVE`、`INVALID`、`RETRACTED`、`SUPERSEDED`を別terminalにする。 |
| `SEA-FR-008` | worker自身または同一authorityだけでは`VALIDATED`以降へ遷移せず、candidate HEADとevidenceへ束縛した独立verifierを要求する。 |
| `SEA-FR-009` | raw secret、PII、customer data、非公開URL、未公開脆弱性、weaponizable artifactを通常DB、log、memory、Issue、PR、evidenceへ保存せず、restricted store、暗号化、access audit、retentionを適用する。 |
| `SEA-FR-010` | authorization／credential revoke、scope drift、incident時に新規配車、in-flight lease、provider credential、network fence、restricted artifact accessを停止し、terminal receiptを生成する。 |
| `SEA-FR-011` | `SECURITY.md`、`THREAT_MODEL.md`、operation policy、disclosure／provider boundaryはL1／L3／Security IRから生成し、手編集を意味正本にしない。 |
| `SEA-FR-012` | security decisionをOSS／Commercial／Private、license、channelから独立させ、credential、restricted finding、exploit artifact、runtime state、内部authorizationを配布しない。 |

## 非機能要件候補

- `SEA-NFR-001 Fail-close`: unknown、ambiguous、missing、stale、multi-target driftを推測しない。
- `SEA-NFR-002 Least privilege`: credentialとnetwork capabilityはengagement、target、operation、TTLの最小範囲に限定する。
- `SEA-NFR-003 Confidentiality`: receipt、error、telemetryにraw sensitive valueを出さない。
- `SEA-NFR-004 Independence`: verifierとworkerのauthority、session、evidence custodyを分離する。
- `SEA-NFR-005 Revocability`: revokeは新規処理だけでなくin-flight leaseとcredential capabilityへ伝播する。
- `SEA-NFR-006 Portability`: provider/model、visibility、license、distribution channelを判定identityにしない。

## 依存と責務

- `depends_on #679`: execution capability broker。Security profileはbrokerを通過して初めて実行候補になる。
- `depends_on #1172`: effective provider configurationとpersistent-state attestation。
- `requires #397 after freeze`: canonical source authorityからRequirement IRへ投影する。
- `related #659`: distribution exclusionとgenerated documentのconsumer境界。

## 実装順候補

Authority freeze → IR admission → authorization schema/admission → privileged isolation → profile/broker接続 →
制限付きevidenceとfinding lifecycle → revoke/kill switch → 生成projectionと配布除外 → 範囲限定canary。
特権provider接続は通常provider canary後の別PR・別credential・別action-specific authorityとする。
