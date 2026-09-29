# 旧candidate次点条件12行の限定分類・route監査

- audit id: `legacy-candidate-next-conditions-2026-09-29`
- 基準main: `6e9e91d1a50acfb83ee64795e6ddbd1dfdff2485`
- authority effect: `none`。source、L2/L11、旧routing JSONL、過去auditは変更していない。
- 方法: source IDで4,755行routing snapshotとcarry-forward ledgerを引き、archiveの原文line/file bytesとSHA-256を照合。選択した12 IDは既存の個別audit/receiptとのexact-ID重複が0件。
- 全行は `historical_candidate` / `draft_candidate` / `preserved_pending_atomization`。condition分類は採択・current authority・formal successorを作らない。

## 範囲と分類

12行すべてrouting snapshotでは `explanation` / `non_requirement_source_structure_or_explanation` だが、本監査の構造分類・condition countでは12行すべてを `condition` に訂正する。その内訳は製品 `requirement_atom` subtype 7行、management/process condition 4行、歴史的Concept condition 1行。management/processとConceptの計5行もcondition件数には入るが、製品requirement atom件数には入れない。

`condition_kind` はconditionのsubtypeを表す。したがってdownstream recountでは全12行をcondition bucketへ計上し、製品requirement atom subtypeは7行として別集計する。

| Source ID | archive path:line | snapshot class / route | condition count bucket / subtype | 提案route |
|---|---|---|---|---|
| `LEGACY-CAND-LINE-000018` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:28` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `management_process_condition` | management/process condition; product L2/L11 route unassigned |
| `LEGACY-CAND-LINE-000028` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:42` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `management_process_condition` | management/process condition; product L2/L11 route unassigned |
| `LEGACY-CAND-LINE-000034` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:51` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `management_process_condition` | management/process condition; product L2/L11 route unassigned |
| `LEGACY-CAND-LINE-000052` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:17` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `product_requirement_atom` | unknown (related requirements do not establish exact adopted coverage) |
| `LEGACY-CAND-LINE-000140` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:41` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `product_requirement_atom` | unknown (related requirements do not establish exact adopted coverage) |
| `LEGACY-CAND-LINE-000180` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:109` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `product_requirement_atom` | unknown (related requirements do not establish exact adopted coverage) |
| `LEGACY-CAND-LINE-001067` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md:17` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `management_process_condition` | management/process condition; product L2/L11 route unassigned |
| `LEGACY-CAND-LINE-001661` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:409` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `product_requirement_atom` | unknown (related requirements do not establish exact adopted coverage) |
| `LEGACY-CAND-LINE-002205` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:74` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `product_requirement_atom` | unknown (related requirements do not establish exact adopted coverage) |
| `LEGACY-CAND-LINE-002426` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/harness-memory-coordination-boundary-requirements.md:38` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `product_requirement_atom` | unknown (related requirements do not establish exact adopted coverage) |
| `LEGACY-CAND-LINE-002861` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4.0.md:137` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `concept_condition` | unknown (related requirements do not establish exact adopted coverage) |
| `LEGACY-CAND-LINE-004084` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:43` | `explanation` / `non_requirement_source_structure_or_explanation` | `condition` / `product_requirement_atom` | unadopted candidate-only relation |

## #2341累積再集計の歴史的状態

- #2341の全4,755行route/classification再集計は、当時の履歴値（structure 926 / explanation 2,940 / condition 889 / route unknown 574 / total 4,755）を記録したもの。対象は [`legacy-candidate4755-current-classification-route-recount-2026-09-29.md`](legacy-candidate4755-current-classification-route-recount-2026-09-29.md)（SHA-256 `b04680c6108b37a7d8bf94ce0ceee9ce7e271f89c23a227e61d76cf246432696`）と[JSON](legacy-candidate4755-current-classification-route-recount-2026-09-29.json)（SHA-256 `074790b73e4f2aef1d8daf04600cb126f601c726dff0fe41ef9d63d23cad5cc0`）。
- #2341値は#2342で行った17件のcondition補正と、本監査の12件（condition 12、うちproduct requirement atom 7）より前の値であるため、後続補正後のeffective classificationについてhistorical/staleである。#2342のMD/JSON artifactとSHAは機械可読JSONに記録した。
- 本監査は新しい累積件数を主張しない。旧4,755件の全source rowと後続の全補正・route overlayを再列挙してreconcileするまでは、#2341値へ17件・12件を足した件数をcurrent totalとして扱わない。歴史的監査は書き換えていない。

## Authority basis

照合したcurrent L2/L11本文の採択状態は、各機構の2026-09-28 PO decision recordにあるexact identity/revisionから読む。decision record file digestsとcurrent L2/L11 file digestsはJSON `pinned_inputs`に固定した。近接する採択済み契約は関係根拠として挙げても、個別source条件の被覆とはせず、routeはunknownまたはunadopted candidate-onlyに留めた。

## Exact source identity and comparison

### LEGACY-CAND-LINE-000018

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:28`
- file SHA-256: `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`
- line SHA-256: `8d4eb68e08285455bdb07fcfb93e14930dbeeff751a0336f483318dc8ab6e2e5` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `Issue #1728の未承認候補である。既存ownerへの接続を先に行い、この候補だけでSLO値、production操作、`
- 条件として残す意味: 候補#1728について、既存ownerへ先に接続し、この候補だけからSLO値、本番操作、包括的な自動修復権限、実装/運用完了を成立させない。
- current L2/L11 comparison: 旧candidate READMEの個別候補取扱い条件。現行L2/L11 requirementへのrouteは割り当てない。
- proposed route: **management/process condition; product L2/L11 route unassigned**。coverage claim: `false`; formal successor: none.
- 残差: candidate#1728に限定したhistorical process boundary。現行management contractへの移管・有効性・owner・後続文書への接続は未確認。製品L2要件atomとして数えない。

### LEGACY-CAND-LINE-000028

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:42`
- file SHA-256: `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`
- line SHA-256: `0e85c51447058834213a09603f07cde3a9fbe839db276a4fd0c3315f36d186f0` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `正本化するときは、候補をこのdirectoryに残したままcurrentと二重authorityにしない。昇格先、`
- 条件として残す意味: 正本化時に旧候補をcurrentと二重authorityにせず、昇格先・compatibility/archive移動・参照更新を同一migrationで閉じる条件。
- current L2/L11 comparison: 現行のauthority/候補管理文書には近接原則があるが、本旧行のmigration条件を採択済みL2/L11 pairへ結ぶexact routeは確認できない。
- proposed route: **management/process condition; product L2/L11 route unassigned**。coverage claim: `false`; formal successor: none.
- 残差: 対象候補とmigrationの完了条件。現行のScaffold Binding/management registerのどれが後継か未照合。製品L2要件atomとして数えない。

### LEGACY-CAND-LINE-000034

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:51`
- file SHA-256: `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`
- line SHA-256: `1f186f89f029ac05595c2133ed4d1cda921046b5905e61f981a41891534f9121` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `候補文書だけで72件を承認・v1必須化・一括Issue化・実装済み扱いにしない。選択したINVごとに`
- 条件として残す意味: INV ID/P0-P4をRequirement ID等と混同せず、候補文書だけで72件を承認・v1必須化・一括Issue化・実装済み扱いせず、選択INVごとにownerと差分を解決する。
- current L2/L11 comparison: 現行の上流authority境界は候補とdecisionを区別するが、この歴史的72-item intake ruleに対する正確な後継L2/L11は確認できない。
- proposed route: **management/process condition; product L2/L11 route unassigned**。coverage claim: `false`; formal successor: none.
- 残差: 72-item母集団、INV個別選択、owner解決の適用範囲。製品L2要件atomとして数えず、現在の候補採否は生成しない。

### LEGACY-CAND-LINE-000052

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:17`
- file SHA-256: `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`
- line SHA-256: `e50c8b6e7d5d0ace1402cc202cbb32e65dca197cc3a4eeebdfcf78c5b5cfec31` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `| AAFD-AC-003 | AAFD-R-03 | AI自己評価、再現なしP0、duplicate、expired、counterevidenceありをverifiedへ昇格しない |`
- 条件として残す意味: AAFD-AC-003: AI自己評価、再現のないP0、duplicate、expired、counterevidenceのあるfindingをverifiedへ昇格しない。
- current L2/L11 comparison: 採択済みOS-L2-007のevidence/provenanceとINTELLIGENCEのfinding traceは関連する基盤。個別のnegative case集合とverified-state oracleを扱う採択済みL2/L11 pairは未確認。AAFDは旧draft candidate familyとして参照される。
- proposed route: **unknown (related requirements do not establish exact adopted coverage)**。coverage claim: `false`; formal successor: none.
- 残差: 独立再現、duplicate/expiry/counterevidence判定、verified遷移oracle。AAFDのhistorical candidate authorityを維持し、採択済みcoverageとはしない。

### LEGACY-CAND-LINE-000140

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:41`
- file SHA-256: `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`
- line SHA-256: `0e46c073ca7c854ba00923ca1d5804d470c8a3beea6c85713411e74be9ac101e` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `反証、expiry、supersessionをUIL-01〜04へ渡す。finding proposalとremediation proposalは別identity、別判定とする。`
- 条件として残す意味: AAFD-R-03: 反証・expiry・supersessionをUIL-01..04へ渡し、finding proposalとremediation proposalを別identity・別判定にする。
- current L2/L11 comparison: 現行INTELLIGENCE-L2はAAFD-R-01..15をold draft candidateとして記録し、UIL/TERのowner境界を保つ。これはsource familyの参照であり、この行の採択successorではない。
- proposed route: **unknown (related requirements do not establish exact adopted coverage)**。coverage claim: `false`; formal successor: none.
- 残差: 正確なUIL handoff、独立した失効/supersession処理、finding/remediationの異なるidentityに対する受入条件。coverage claimなし。

### LEGACY-CAND-LINE-000180

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:109`
- file SHA-256: `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`
- line SHA-256: `2a5f6c6fdeb935227cf06f85d055b111fe12eaa283308018e1345a0569e9caf7` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `Designを自動変更しない。昇格は#1035/#1384の独立VERIFY、counterexample、expiry、human gateへ従う。`
- 条件として残す意味: 単一model revisionのbenchmarkからrule/provider routing/Requirement/Designを自動変更しない。旧sourceの昇格は独立VERIFY、counterexample、expiry、人間gateへ従う。
- current L2/L11 comparison: 現行規則はauthority境界を保持し、上流意味の変更に人間判断を求める。旧#1035/#1384 gateはhistoricalであり、本監査はこれを反復承認gateにしない。
- proposed route: **unknown (related requirements do not establish exact adopted coverage)**。coverage claim: `false`; formal successor: none.
- 残差: 独立検証・counterexample・expiryのexact qualification contractと旧昇格条件の現在適用性が未確定。新しい承認手続きは提案しない。

### LEGACY-CAND-LINE-001067

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md:17`
- file SHA-256: `3cb6ee8a4d342b7f667c0960d08eb0a18fa44372ecb03bd85e0576e59baa4cca`
- line SHA-256: `9ae53bf307203724a1664b140b857e32d84e96d57ddb2ddf1bfca2c9ddce29cc` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `各候補は\`adopt / defer / reject / already_covered / needs_requirement_delta\`へ分類し、既存ownerを`
- 条件として残す意味: 各investment-stage候補をadopt/defer/reject/already_covered/needs_requirement_deltaへ分類し、既存ownerを再利用する。
- current L2/L11 comparison: product L2/L11へのrouteは割り当てない。これは歴史的investment directive intake上の候補処置区分である。
- proposed route: **management/process condition; product L2/L11 route unassigned**。coverage claim: `false`; formal successor: none.
- 残差: 5つの区分と現在のauthority dispositionとの意味/版関係、owner-resolution操作、現在の適用範囲。製品L2要件atomとして数えない。

### LEGACY-CAND-LINE-001661

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:409`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- line SHA-256: `2324729cebae1c327ed554e3d3529a2d37c561b2936c3028ac71e52e20b55f54` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `同一task内の反復を独立task数に水増ししない。比較方法、割当方法、minimum evidence、停止条件は事前定義する。shadowの選択bias、liveのrouting bias、時間依存のAPI変更を明示する。結果が弱い場合は\`inconclusive\`とする。`
- 条件として残す意味: 同一task内反復を独立task数に水増ししない。比較/割当/minimum evidence/停止条件を事前定義し、shadow selection bias/live routing bias/API time driftを示し、弱い結果をinconclusiveとする。
- current L2/L11 comparison: routing snapshotはHELIXOS-L2-004/007/008/009/010/011/014とのrelationを記録し、L2-014のみ採択済み。採択済みLABO-L2-059/L11-059には同scope比較の基盤がある。どちらのrelationもこの実験protocol全体がcoveredである証拠ではない。
- proposed route: **unknown (related requirements do not establish exact adopted coverage)**。coverage claim: `false`; formal successor: none.
- 残差: 独立task identity、割当/停止criteria、列挙されたbias/API drift、inconclusiveのexact oracleは採択済みL2/L11で未確認。route unknownを維持する。

### LEGACY-CAND-LINE-002205

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:74`
- file SHA-256: `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17`
- line SHA-256: `30c44b60f21c6e4136b99f2ed16bdb539ae4e6b041ac44594195f55803b653f3` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `candidate HEAD、artifact digest、受入receipt、独立review、rollback、前channelとの差分を束縛する。failure、expiry、security、`
- 条件として残す意味: Slice channelはshadow→preview→rc→stable→deprecated→retiredの一方向遷移。各遷移にSlice、candidate HEAD、artifact digest、受入receipt、独立review、rollback、前channel差分を束縛し、failure/expiry/security/provider driftで再検証または隔離へ戻す。文字列だけでpromotionしない。
- current L2/L11 comparison: 採択済みHARNESS Release Port/release/rollback契約は一般的に関係するが、旧channel sequenceと全遷移bindingを扱うexact adopted pairは確認できない。
- proposed route: **unknown (related requirements do not establish exact adopted coverage)**。coverage claim: `false`; formal successor: none.
- 残差: channel state machine/entry criteria、identity/digest binding、drift時の再検証/隔離oracle。旧候補channelを現行release authorityにしない。

### LEGACY-CAND-LINE-002426

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/harness-memory-coordination-boundary-requirements.md:38`
- file SHA-256: `421d8cbcdb12120c7bf97bdbae053d3e1dac0d73229418b4f74341a2dd182dbc`
- line SHA-256: `9a3c6d6a1df90844a3e541a7ad6b848c207e1337da9706784ab19823b8c4a148` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `  exactly-once配送を主張しない。受信側の冪等処理を受入条件とする。`
- 条件として残す意味: At-least-once deliveryを保持し、exactly-once配送を主張せず、受信側idempotencyを受入条件にする。
- current L2/L11 comparison: 採択済みHELIXOS-L2-009にdurable event/idempotent projectionとの関係はある。現行L11は旧exactly-once/duplicate/quarantine delivery条件がそのoracleの範囲外で未解決と明記する。
- proposed route: **unknown (related requirements do not establish exact adopted coverage)**。coverage claim: `false`; formal successor: none.
- 残差: transport delivery semanticsおよびreceiver idempotency oracleは隣接するprojection契約では閉じない。product target/owner/adoptionは未確定。

### LEGACY-CAND-LINE-002861

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4.0.md:137`
- file SHA-256: `8c492aae7a3c2f2c27dd24794d2ba4c7a9fc025737fa7ea61215b3b6658a5e59`
- line SHA-256: `5872f71e68f236e608e86f3b0a7b4eb0e16e27a09377dfd1d0d957c1f813094c` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `full auditはrisk、trigger、budget、cooldown、release／incident境界でadmitし、毎PR／毎晩の無条件実行にしない。`
- 条件として残す意味: Full-system auditをrisk/trigger/budget/cooldown/release・incident境界でadmitし、毎PR/毎晩の無条件実行にしない。
- current L2/L11 comparison: 旧HELIX Concept v4.0 candidate line。現行採択Concept v4.3への意味継承または採択済みL2/L11 pairへのrouteは確認できない。
- proposed route: **unknown (related requirements do not establish exact adopted coverage)**。coverage claim: `false`; formal successor: none.
- 残差: audit tier/admissionが現在の上流意味に残るか、そのscopeとsuccessor。歴史的Concept conditionとして保持し、現行runtime scheduleとしない。

### LEGACY-CAND-LINE-004084

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:43`
- file SHA-256: `c3d9f28a17ac8882f22b5cf86b6d0b16c457a996b3eb0682b6de1010d64ea29c`
- line SHA-256: `5802e6259a208bd94e976ea07177528180abb51309278bb250a19102e5b219a4` (content bytes without line terminator; exact physical line bytes are base64-pinned in JSON)
- snapshot class/route: `explanation` / `non_requirement_source_structure_or_explanation`
- 原文: `反例、authority revision、provider/model/version変更、expiry、security／license条件によりqualificationをstale、contradicted、revoked、revalidation requiredへ戻せる。`
- 条件として残す意味: 反例、authority revision、provider/model/version変更、expiry、security/licenseによりqualificationをstale/contradicted/revoked/revalidation-requiredへ戻す。
- current L2/L11 comparison: 現行LABO L2/L11はRCLS-BR-001..006をLABO candidate conditionとして明示し、expiry/revocation/revalidationを含める。これはunadopted candidate-only relationであり、採択済みL2/L11 acceptanceではない。
- proposed route: **unadopted candidate-only relation**。coverage claim: `false`; formal successor: none.
- 残差: RCLS owner identity、exact successor、採択/target version、詳細なL11証拠は未決。coveredに数えない。

## Count and closure boundary

本監査では4,755行のpopulation recountを行わない。12 source linesのうち7行をrequirement-atom相当のcondition、4行をmanagement/process condition、1行を旧Concept conditionとして識別した。unknown routeはconditionの存在を消さず、近接IDや一般契約からcoveredを生成しない。ここでの分類補正は全sourceの説明行を調べたことを意味せず、未調査explanationを0件としない。

旧candidate全体のno-loss意味閉包、全条件のsuccessor、採択/retire、全negative oracle照合、stage 5/6完了、L3移行は未証明のまま。特にold #1035/#1384のindependent VERIFY/counterexample/expiry/human gateはhistorical conditionとして保存し、current authority modelを越える反復human approvalへ移さない。

## 静的検証

JSON証跡の12 IDをbase routing JSONL/line ledgerへ照合し、各archive file digestおよびline content digestを再計算した。line ending込みのsource bytesはJSON `source_line_bytes_base64`に保持した。selected IDsと既存個別audit/receipt間のexact-ID overlapは0件。旧runtime/CLI/hook/test/CIは実行していない。
