---
title: "認可済みSecurity engagement受入候補"
layer: L10
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1523
pair_artifact: docs/governance/candidates/security-engagement-authority-requirements.md
---

# 認可済みSecurity engagement受入候補

| ID | 対応要件 | oracle |
|---|---|---|
| `SEA-AC-001` | `SEA-FR-001..002` | authorization不在、期限切れ、wrong target／scope／environment／provider class／digest、第三者targetでmodel・tool・network invocationが0件になる。 |
| `SEA-AC-002` | `SEA-FR-003` | 通常customer／tenant taskから特権credential、queue、lease、evidenceを選択できず、fallbackでも境界を越えない。 |
| `SEA-AC-003` | `SEA-FR-004` | unknown profile、自由式condition、raw shell、未登録command、近似bindingを個別reasonでfail-closeする。 |
| `SEA-AC-004` | `SEA-FR-005` | action-specific authorityのtarget、operation、HEAD、policy digest、expiryの各欠落・driftでhigh-impact操作を拒否する。 |
| `SEA-AC-005` | `SEA-FR-006` | authorizationからremediationまで同一episodeをreplayでき、raw secret、PII、個人absolute pathをreceiptへ出さない。 |
| `SEA-AC-006` | `SEA-FR-007..008` | same worker／same authorityだけの自己検証、wrong HEAD／session／verifier／evidenceで`VALIDATED`以降とcloseを拒否する。 |
| `SEA-AC-007` | `SEA-FR-009` | plaintext secret、restricted finding、weaponizable artifactの通常surface永続化を拒否またはredactし、restricted storeだけがaudit／retentionを持つ。 |
| `SEA-AC-008` | `SEA-FR-010` | revokeまたはscope drift後、新規assignmentが0件となり、in-flight lease、credential、network、artifact accessが停止してterminal receiptが残る。 |
| `SEA-AC-009` | `SEA-FR-011` | generated security documentのsource digest driftと手編集を検出し、文書からrequirementsへ逆流しない。 |
| `SEA-AC-010` | `SEA-FR-012` | OSS／Commercial／Privateまたはchannel変更前後で同一authority入力のdecisionが一致し、restricted dataをartifactへ含めない。 |
| `SEA-AC-011` | `SEA-FR-004..005` | exploit validationはsandbox外networkを拒否し、production deny-defaultを維持する。 |
| `SEA-AC-012` | `SEA-FR-001..012` | #679 broker failure、#1172 attestation failure、legacy guard greenを同時入力し、canonical failureをgreenで相殺しない。 |

## mutation条件

- expiry、target exact set、provider access classのいずれかを判定から削除すると`SEA-AC-001`がredになる。
- privileged fallbackを通常provider fallbackへ結合すると`SEA-AC-002`がredになる。
- boolean approvalでhigh-impact操作を許可すると`SEA-AC-004`がredになる。
- worker receiptだけでfindingを確定すると`SEA-AC-006`がredになる。
- sensitive valueを通常log／DB／GitHub／memoryへ出すと`SEA-AC-007`がredになる。
- revokeを新規queueだけへ適用してin-flight leaseを残すと`SEA-AC-008`がredになる。
- visibilityまたはlicenseをdecision inputへ加えると`SEA-AC-010`がredになる。

本候補の文書greenはruntime capabilityの完成を意味しない。実機Security operation、credential設定、external access、
exploit validation、production接続、disclosure、publishは別のaction-specific authorityなしに実行しない。
