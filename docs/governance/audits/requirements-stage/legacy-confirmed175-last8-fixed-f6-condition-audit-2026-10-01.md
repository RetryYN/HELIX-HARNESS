# Confirmed175 strict167残り8件 固定F6条件監査

- 監査基準: `50686b6762788574cb471967e8c24846d3dd56ae`、strict167 bundle `eda13daeab2abc3a53bc25f82693083d5cbcab5a` (historical source snapshot; its exact historical bytes are pinned by the unresolved-routing audit at revision `ea9e5cd0e8712036068c358fa2fe90faef063439`)
- 固定L2/L11 revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 選定: strict159補正overlayの残り16件のうちpositions 9–16。archive source、asset ledger、比較監査を突合し、source lineとF6ファイルSHAを再計算した。

## 集計

- 8件中6件が適格で、unique strict comparisonは167から173。DAC-FR-003とDAC-NFR-002は、固定F6に実在するOS-015および必要に応じHARNESS-011のpairを比較対象とする。
- HELIXOS-L2-106はDAC-FR-003の後発限定採択（PO row 59）として記録し、固定F6 target IDsには含めない。HELIXOS-L2-110はDAC-FR-010の後発限定採択（PO row 63）であり、DAC-NFR-002には関連候補としてのみ記録する。いずれも完全source atomのsuccessorではない。
- DAC-FR-009は空の固定target set、3L-BR-007はIntelligence target IDsが固定F6のL2/L11双方にないため未確認。空集合はpair確認済みを意味しない。
- 175 source atomsは `preserved_pending_rehome` のまま。formal successor 0、source closure 0、authority effectなし。

## 固定F6比較ファイルSHA

- HELIX-HARNESS L2 `docs/helix-harness/L2-requirements/product-requirements.md`: `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`
- HELIX-HARNESS L11 `docs/helix-harness/L11-acceptance/product-acceptance.md`: `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`
- HELIX-OS L2 `docs/helix-os/L2-requirements/governance-requirements.md`: `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`
- HELIX-OS L11 `docs/helix-os/L11-acceptance/governance-acceptance.md`: `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`
- HELIX-LABO L2 `docs/helix-labo/L2-requirements/labo-requirements.md`: `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`
- HELIX-LABO L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md`: `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`
- HELIX-BRAIN L2 `docs/helix-brain/L2-requirements/brain-requirements.md`: `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`
- HELIX-BRAIN L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md`: `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`
- HELIX-INTELLIGENCE L2 `docs/helix-intelligence/L2-requirements/intelligence-requirements.md`: `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`
- HELIX-INTELLIGENCE L11 `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md`: `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a`

Target IDs are counted as present only when each appears in both its fixed F6 L2 and L11 files. Global file hashes pin bytes; they do not make absent IDs present.

## ID別照合

| ID | Strict | 固定F6 target IDs | 比較結果・残差 |
|---|---:|---|---|
| `DAC-FR-003` | 適格 | OS-015, HARNESS-011 | 固定pairはprovenanceと選択callの版確認に隣接するが、authority binding参照先の全件再帰検査、revoked/compatibility/historical edge、cycle/dangling/dead-authority拒否を定めない。OS-106は後発候補として分離。 |
| `DAC-FR-009` | 未確認 | なし | 旧条件は#825、#1370、Censusの3 receiptを区別し、全てgreenの場合だけaggregate greenとする。固定F6の比較監査に同じreceipt構成のtarget pairがない。OS-111は後発の抽象AND近接であり、receipt/owner/scope/gateを定めない。 |
| `DAC-FR-010` | 適格 | OS-015, HARNESS-001, HARNESS-004 | provenance・変更影響に部分的に近接するが、semantic epoch、旧epoch active claim/consumer全量、scannerを定めない。OS-110はPO row 63でこのsource identityに限る限定採択。完全source atomのsuccessor・closureではない。 |
| `DAC-NFR-002` | 適格 | OS-015 | authority sourceとunresolved/stale状態に部分的に近接するが、compatibility/historical/referenceの存在を非欠陥としつつactive-decision利用を拒む条件はない。OS-110はDAC-FR-010由来の関連候補であり、DAC-NFR-002のreceipt・source・owner・scope・result証拠ではない。 |
| `DAC-NFR-003` | 適格 | OS-015, HARNESS-010, HARNESS-011 | それぞれの管理record/pack/call metadataは存在するが、Markdownのclass/consumerに応じた適用範囲や一律要求しない条件はない。 |
| `HBR-P6` | 適格 | HARNESS-006 | 外部サービス提供物への利用・traceabilityに部分的に近接する。旧条件のgated push、PR cross-review/auto-fix、tag/release配布、1-command bootstrap一式は揃わない。 |
| `S-BR-001` | 適格 | LABO-033/051, BRAIN-026/027 | 外部source provenance/knowledge candidate経路に部分的に近接するが、skill inventory、必要時だけの取得、context負荷、consumer移行、rollback/retirementは未定義。 |
| `3L-BR-007` | 未確認 | なし | 固定F6 Intelligence L2/L11のSHAは確認したが、旧auditが挙げるL2-072/073/074は両ファイルにない。別revision上のID参照だけでは固定F6 pair evidenceにならない。 |

## 非主張

- 要求採択、承認、formal successor割当、source atom closure/retirement、authority移転を主張しない。
- 文書に基づく静的照合であり、acceptanceを実行していない。archive runtime/test/CIは実行していない。
