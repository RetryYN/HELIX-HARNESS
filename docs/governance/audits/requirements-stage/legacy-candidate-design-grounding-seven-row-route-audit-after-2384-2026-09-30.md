# 旧Design Grounding要求候補7行の採択predicate route監査（2026-09-30）

- audit id: `legacy-candidate-design-grounding-seven-row-route-audit-after-2384-2026-09-30`
- 基準main: `f280900fc97c5dfed4bc6ae59e1332abb555045f`（#2385 merge後）。`authority_effect: none`。
- 選定: requests 1行（001021）とrequirements 6行（001050–001055）。#2353全行recordは全件 `condition / product_requirement_atom / unknown`。#2356〜#2369、#2381、#2385のclassification overlayとID交差0。
- #2381 recountと#2382/#2383/#2384は履歴として保持。#2384までroute unionは all-route 364（product-targeted 334、HMC 30含む）、pool intersection 305。#2385のeffective poolは471、同 intersection 305、未監査166。今回の7 IDは現poolに残り、先行route selectionとの交差はない。
- 別source IDのDGH residual-24 semantic auditは比較資料であり、route unionには加算しない。route案は `partial=6 / unknown=1`。

## 旧sourceとinventory

| source | asset | file SHA-256 | selected IDs |
|---|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/design-grounding-human-convergence-requests.md` | `LEGACY-ASSET-154018C4C6B5E3AB9C63` | `f2c18a50e5c5476c0b3278adfcac7721db32e197c123c5fa4e6d53ad32a794e3` | 001021 |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/design-grounding-human-convergence-requirements.md` | `LEGACY-ASSET-2D530EE7717B7A1E9218` | `41e5cabf6b0e9401169699f2ca748a8c6851ce942f158fadf9b686be0ce11687` | 001050–001055 |

各行のline digest / physical-line SHAはcarry-forward inventoryと#2353 baselineに照合し、JSONへ記録した。旧asset ledgerはhistorical/unresolved、implementation unknown、formal successorなし。

## 固定採択比較

比較revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2/L11本文とPO decision-record SHAはJSONにpinした。OS DGH-BR-02本文はOS L2:429–445とpaired L11:209–216。HARNESS DGH節はL2:193–198、paired L11:120–122。比較は採択predicateの限定的な意味重なりだけを示す。DGH draft記述や旧candidate metadataから採用・successor・coverageは主張しない。

Locator略記: `H2` = `docs/helix-harness/L2-requirements/product-requirements.md`; `H11` = `docs/helix-harness/L11-acceptance/product-acceptance.md`; `O2` = `docs/helix-os/L2-requirements/governance-requirements.md`; `O11` = `docs/helix-os/L11-acceptance/governance-acceptance.md`. 各IDのpaired L2/L11行および specific clause はJSONに完全なpathで記録した。

## 行別route

| Source ID / source line | route | 直接重なる採択predicate（L2 / paired L11） | 残差 |
|---|---|---|---|
| `001021` / requests:15 | partial | `HARNESS-L2-003` H2:54 / H11:23; clause H2:193 / H11:88,120–122. `HELIXOS-L2-001` O2:54 / O11:21; clause O2:434 / O11:211–212. | ADR判断、scope付き採否・認可証拠、期限付き作業連絡memoryの保存先・寿命分離。 |
| `001050` / requirements:31 | partial | `HELIXOS-L2-001` O2:54 / O11:21; DGH clause O2:429–438 / O11:209–213. `HELIXOS-L2-007` O2:60 / O11:27; clause O2:443–445 / O11:214. | 人間原文のproject-owned保管・別digest/ref、memory/profileへの非永続化、機密原文のaccess controlとIssue/log複製禁止。 |
| `001051` / requirements:32 | partial | `HARNESS-L2-003` H2:54 / H11:23; clause H2:193–194,196 / H11:120–122. `HARNESS-L2-005` H2:56 / H11:25; clause H2:196 / H11:122. `HELIXOS-L2-001` O2:54 / O11:21; DGH clause O2:429–438 / O11:209–213. `HELIXOS-L2-007` O2:60 / O11:27; clause O2:443–445 / O11:214. | objective greenとhuman preference rejectの同時schema、approved profile scope/revision/revocation、未委任の美観・ブランド・表現の判断境界。 |
| `001052` / requirements:33 | partial | `HARNESS-L2-003` H2:54 / H11:23; L2.5 prototype/PoCを使う条件。 | existing contractの範囲、候補からimplementation authorityへ越境しない全条件、budget/repetition/deadline exhaustion時のunresolved terminal。 |
| `001053` / requirements:34 | partial | `HARNESS-L2-004` H2:55 / H11:24; clause H2:195 / H11:121–122. `HARNESS-L2-026` H2:530–543 / H11:332–341. `HARNESS-L2-025` H2:544–558 / H11:342–360. `HELIXOS-L2-002` O2:55 / O11:22; clause O2:440–445 / O11:213–216. `HELIXOS-L2-007` O2:60 / O11:27; clause O2:443–445 / O11:214–216. | Issue階層と形成状態、Design problem identity、scoped hold/stale replacement refusalを含む全trace schemaと終端条件。 |
| `001054` / requirements:35 | partial | `HARNESS-L2-003` H2:54 / H11:23; `HARNESS-L2-004` H2:55 / H11:24; `HELIXOS-L2-002` O2:55 / O11:22. 要求・prototype・design・verificationの一部追跡に限る。 | 候補→承認→canonical L1/L3/L10→IR→design/runtime→verification/dogfood→revisionの全順序、dogfood後canonical化是正、#397 IR連携。 |
| `001055` / requirements:36 | unknown | 同一predicateなし。関連のみ: `HARNESS-L2-007` H2:58 / H11:27 (Web completion exclusionはFull/Lite acceptance predicateではない)。 | FullとLiteの別acceptance、およびLiteへの自動昇格・公開禁止。 |

## 先行DGH意味監査との関係

先行 `legacy-candidate-design-grounding-residual-24-route-audit-2026-09-30` は別intake IDs（000980/000982/000991/000992等）を比較している。意味上の先行評価は参考にしたが、今回のsource identityへroute labelを継承していない。監査union membershipとsemantic reviewは別軸。

## authority境界

この監査は旧候補の採用、formal successor、source全体coverage、acceptance execution、implementation、Stage 5完了を示さない。旧PLAN-L3-91 status、Issue/PR、approval metadataは現行decision・predicate・実行証拠へ昇格しない。archive workflow、CLI、hook、adapter、test、CI、runtimeは実行せず、静的なrevision・ID・digest・route・authority境界のみ確認した。
