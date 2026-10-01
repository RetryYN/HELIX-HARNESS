# Confirmed175 strict167残り8件 固定F6条件監査

- 監査基準: `50686b6762788574cb471967e8c24846d3dd56ae`、strict167 bundle `eda13daeab2abc3a53bc25f82693083d5cbcab5a`
- 固定L2/L11 revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 選定: strict159補正overlayの残り16件のうちpositions 9–16。archive source、asset ledger、既存比較監査を突合し、source lineとfile hashを再計算した。

## 集計

- 8件中6件で、同一IDのarchive source line SHA、identity-local residual、固定F6の比較対象L2/L11 file SHAがそろった。unique strict comparisonは167から173。
- DAC-FR-009は固定F6に対応するexact three-receipt pairがない。3L-BR-007は固定F6のIntelligence L2/L11ファイルにidentity-specific target IDがないため、2件を未確認のまま残す。
- 175 source atomsは `preserved_pending_rehome` のまま。正式successor 0、source closure 0、authority effectなし。

## 固定F6の比較ファイルSHA

- HELIX-HARNESS `docs/helix-harness/L2-requirements/product-requirements.md`: `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`
- HELIX-HARNESS `docs/helix-harness/L11-acceptance/product-acceptance.md`: `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`
- HELIX-OS `docs/helix-os/L2-requirements/governance-requirements.md`: `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`
- HELIX-OS `docs/helix-os/L11-acceptance/governance-acceptance.md`: `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`
- HELIX-LABO `docs/helix-labo/L2-requirements/labo-requirements.md`: `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`
- HELIX-LABO `docs/helix-labo/L11-acceptance/labo-acceptance.md`: `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`
- HELIX-BRAIN `docs/helix-brain/L2-requirements/brain-requirements.md`: `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`
- HELIX-BRAIN `docs/helix-brain/L11-acceptance/brain-acceptance.md`: `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`
- HELIX-INTELLIGENCE `docs/helix-intelligence/L2-requirements/intelligence-requirements.md`: `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`
- HELIX-INTELLIGENCE `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md`: `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a`

## identity別照合

| ID | Strict | 旧sourceの意味と現在の直接証拠・残差 |
|---|---:|---|
| `DAC-FR-003` | 適格 | OS-015/106とHARNESS-011に近接条件がある。すべてのauthority binding参照先を再帰検査し、失効・compatibility・historical targetへのcurrent edgeやcycle/dangling/dead authorityを拒否する条件はない。L2-106は明示的に選ばれたbindingだけを扱う候補で、後継ではない。 |
| `DAC-FR-009` | 未確認 | #825要求materialization監査、#1370 startup projection、Censusという独立3 receiptを区別し、3つ全てgreenでaggregate greenとする条件。固定F6比較監査に同一の三receipt targetは見つからない。後発OS-111は抽象ANDに限られ、receipt/owner/scope/実gateを特定しない。 |
| `DAC-FR-010` | 適格 | OS-015とHARNESS-001/004はprovenance、変更影響に隣接するが、semantic epoch、旧epoch active claim/consumerの全列挙、scannerを定めない。epoch/scope/consumerが欠ける場合はunknownを保持する。 |
| `DAC-NFR-002` | 適格 | OS-015/110はauthority provenanceと限定されたnonfinding contextを扱うが、compatibility/historical/reference文書が存在するだけでは欠陥でなく、active decision利用を拒否するという条件はない。存在のみからseverityや削除所見を出さない。 |
| `DAC-NFR-003` | 適格 | OS-015の記録項目とHARNESS-010/011のpack/call metadataは各々の対象に限られる。Markdownのclass/consumerごとの適用範囲や、全Markdownへ同一metadata/Requirement IDを要求しない条件はない。 |
| `HBR-P6` | 適格 | HARNESS-006と対のL11は外部サービス提供物への利用・traceabilityを扱う。旧条件のgated push、PR cross-review/auto-fix、tag/release distribution、1-command full bootstrap一式は固定pairに揃っていない。内部運用記録を外部提供要求へ移さない境界を保持する。 |
| `S-BR-001` | 適格 | LABO-033/051とBRAIN-026/027に、外部source provenanceやknowledge candidateの限定的な経路がある。skill inventory/disposition、必要時だけの取得、context負荷・重複の結果、consumer移行、rollback、retirementは未定義。 |
| `3L-BR-007` | 未確認 | 旧sourceはHELIXがGitHub監査capabilityを持つ意味を記録する。固定F6のIntelligence L2/L11 file SHAは得られたが、旧auditが示すHELIXINTELLIGENCE-L2-072/073/074は固定ファイル内にない。比較対象identityのpair evidenceがなく、strict閾値に加えない。 |

## 3L-BR-007の未確認理由

固定F6のIntelligence L2/L11ファイルSHAは再計算したが、過去のauditにある target ID はどちらの固定ファイルにも存在しない。対象identityを比較するF6 pair evidenceがないため、該当IDは未確認のままとする。

## 非主張

- 要求採択、承認、formal successor割当、source atom closure/retirement、authority移転を主張しない。
- 文書に基づく静的照合であり、acceptanceを実行していない。archive内runtime/test/CIは実行していない。
