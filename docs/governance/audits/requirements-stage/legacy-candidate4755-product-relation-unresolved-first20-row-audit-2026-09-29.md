# 旧candidate product relation未解決行の先頭20件・限定照合（2026-09-29）

- 基準tree: `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`（#2352 merge後 origin/main）。
- authority effect: `none`。20 source行の現行relationと残差を記録する限定監査であり、採択・coverage・formal successor・source closure・実装/受入許可を生成しない。
- scope: #2347の歴史的4,755行censusで`source_relation_coverage_unresolved`とされたproduct atom 141件のID昇順先頭20件。全件censusは今回再実施していないため141/336/577は現行件数として扱わない。
- #2350のroute-unknown product先頭20とは別集合。ID intersectionは0件。#2350はroute未知、本監査は記録済source relationのcoverage残差を扱う。
- 旧source、routing/carry/asset台帳、MPR register、既存監査は変更しない。旧CLI/runtime/test/CIは実行していない。

## relation判定の境界

MD+JSONに旧archive path・asset・physical line・file/line SHAと、現行L2/L11・decision・receipt・MPR relationを記録した。broad source table relation、未採択candidate reference、選択span receiptを旧atom全体のcoverageに昇格させない。

AAFD acceptance 6行はHARNESS-L2-028/-029のsource-bound observation、unknown/stale拒否、proposal-onlyの意味と部分関係がある。一方MPR receiptのsource_atom_countは0、authority_effectはnone。行ごとの差分を以下に限定する。

AAFD requirements 2行はOS-L2-005/007の改善登録、証拠provenance、owner splitに関係する。既存OS auditはprobe schema、独立再現、delta invalidation等を未採択詳細と記す。個々の条件と保持先のmappingを残す。

Execution Ticket 12行はcurrent OS L2 source crosswalkで複数L2に広く関連づけられるが、crosswalkはatom-level assignmentや完全traceを主張しない。PO採択済みHELIXOS-L2-014はstage-releaseの意味であり、Ticket詳細の採択を示さない。OPS-O1/O2 r4はTicket line 101の一部fragmentとline 102 sentenceを限定選択したproposalで、authority effectはnone。

## 20行の照合

### LEGACY-CAND-LINE-000057 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:22` / `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- asset ledger row 787 SHA-256 `0e3015a8f72de5dbbbc40e89d56d9011d88a60dab849d285507518916f81566c`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`
- physical line SHA-256: `sha256:1fbbf05f1c152a77fd8b56e2bd67b0ea7935393571959bbebb77bda7d07a0305`
- 旧source bytes: `| AAFD-AC-008 | AAFD-R-08 | unknown→0/unchanged/observed mutationとdeltaからのRequirement direct writeを拒否する |`
- current route snapshot IDs: `['HARNESS-L2-004']`; adopted current IDs: `[]`
- 現行relation: AAFD-AC-008/R-08はunknown→0等への変換とdeltaからRequirementへのdirect writeを拒む。現HARNESS-L2-004のrouting relationは一般の割当/独立review境界を示すが、当該source IDのadopted requirement IDなし。
- 行ごとの未完条件: HARNESS-L2-004はroutingに出るがadopted_current_requirement_idsは空。unknown→0等のconversionとdeltaからRequirementへ直書きする拒否条件について、current adopted L2/L11のどのoracleが同じmutationsを拒むかを特定する。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-000075 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:42` / `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- asset ledger row 787 SHA-256 `0e3015a8f72de5dbbbc40e89d56d9011d88a60dab849d285507518916f81566c`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`
- physical line SHA-256: `sha256:7d50011aa393e8ec509658d7bf71faaf25c81e3379b2650b309ae04ce2f53697`
- 旧source bytes: `- unknownを0、neutral、unchanged、observedへ変換する。`
- current route snapshot IDs: `['HARNESS-L2-028', 'HARNESS-L2-029']`; adopted current IDs: `[]`
- 現行relation: AAFD-AC-016相当の「unknownを0/neutral/unchanged/observedへ変換」拒否。HARNESS 028/029はunknownを非承認とする一般意味関係。列挙された全変換先の個別negative oracleは確認できない。
- 行ごとの未完条件: unknownの4つの変換先（0/neutral/unchanged/observed）を個別に与えた場合の拒否oracleと、HARNESS-L2-028/029のunknown-not-approved境界との一致は未確認。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-000076 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:43` / `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- asset ledger row 787 SHA-256 `0e3015a8f72de5dbbbc40e89d56d9011d88a60dab849d285507518916f81566c`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`
- physical line SHA-256: `sha256:7000eed2475515520044bb46df43fd7393b26de4e213b767b9ff99851b6c661e`
- 旧source bytes: `- stale projectionまたはdirectiveを再利用する。`
- current route snapshot IDs: `['HARNESS-L2-028', 'HARNESS-L2-029']`; adopted current IDs: `[]`
- 現行relation: AAFD-AC-017相当のstale projection/directive再利用拒否。HARNESS 028/029とL11のrevision/stale境界は関係するが、この旧mutationに対するexact test oracleは未確認。
- 行ごとの未完条件: stale projectionとstale directiveの再利用を別々に試す採択済みnegative oracleは未確認。L2/L11のrevision/stale境界との同値範囲を特定する。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-000077 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:44` / `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- asset ledger row 787 SHA-256 `0e3015a8f72de5dbbbc40e89d56d9011d88a60dab849d285507518916f81566c`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`
- physical line SHA-256: `sha256:5e9af37e29ad6d515d1e4f98a6ad9cd257e293f552021145269acffb69582535`
- 旧source bytes: `- deltaからRequirement、Design、Release、Assignmentを直接変更する。`
- current route snapshot IDs: `['HARNESS-L2-028', 'HARNESS-L2-029']`; adopted current IDs: `[]`
- 現行relation: AAFD-AC-018相当のdeltaからRequirement/Design/Release/Assignmentへのdirect write拒否。proposal-only/authority境界は関係するが、列挙された4対象別の拒否証拠は未確認。
- 行ごとの未完条件: Requirement/Design/Release/Assignmentへの書込み先4種ごとの拒否oracleは未確認。proposal-only境界が各成果物へのwriteを禁止する関係を個別に確かめる。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-000078 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:45` / `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- asset ledger row 787 SHA-256 `0e3015a8f72de5dbbbc40e89d56d9011d88a60dab849d285507518916f81566c`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`
- physical line SHA-256: `sha256:ec1bc62c3f014602f5ed4005e699cd2a74581ef0a9ca2c43d3f4ea73a784b224`
- 旧source bytes: `- historical model receiptをcurrent revisionへ書き換える。`
- current route snapshot IDs: `['HARNESS-L2-028', 'HARNESS-L2-029']`; adopted current IDs: `[]`
- 現行relation: AAFD-AC-019相当のhistorical model receiptをcurrent revisionへ書き換える拒否。revision-bound observationと履歴保持は関係するが、receipt mutationを直接試す採択済みoracleは未確認。
- 行ごとの未完条件: 過去revisionのmodel receiptを書換えるmutationをcurrent adopted L2/L11が拒むか未確認。保存・revision-bound observationとreceipt immutabilityの関係を特定する。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-000079 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:46` / `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- asset ledger row 787 SHA-256 `0e3015a8f72de5dbbbc40e89d56d9011d88a60dab849d285507518916f81566c`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`
- physical line SHA-256: `sha256:575548b04c5bd84053ae12bd538e70b634727c39dc59bde5846da11e0099dbbf`
- 旧source bytes: `- duplicate finding/deltaを別episodeとして無限生成する。`
- current route snapshot IDs: `['HARNESS-L2-028', 'HARNESS-L2-029']`; adopted current IDs: `[]`
- 現行relation: AAFD-AC-020相当のduplicate finding/deltaでepisodeを無限生成しない拒否。source-bound proposal/影響scopeの関係はあるが、idempotency・episode identityのexact adopted oracleは未確認。
- 行ごとの未完条件: 同一finding/delta再入力時のepisode identity/idempotency oracleは未確認。proposal scope relationだけで無限episode防止を満たすとはしない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-000134 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:31` / `LEGACY-ASSET-EB3700B0088F311C2295`
- asset ledger row 789 SHA-256 `64ade03f3caed823f572e07b263fa6eb231ba8a179ccaff7bd80912a541739f6`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`
- physical line SHA-256: `sha256:32d48b40393347e88cfd853e9c738ce724ccb759c7770aa2e2dd81b7252e1c9a`
- 旧source bytes: `reproduction recipe、counterevidence、confidence、expiry、finding advisory、remediation advisory、proposal digestを持つ。`
- current route snapshot IDs: `['HELIXOS-L2-005', 'HELIXOS-L2-007']`; adopted current IDs: `[]`
- 現行relation: AAFD-R要求はreproduction recipe, counterevidence, confidence, expiry, finding/remediation advisory, proposal digestを要求。OS L2-005/007の改善source/provenance・共通証拠へのowner relationを確認。OS infra connect auditはprobe schema、独立再現、delta invalidation詳細を未採択と明記。
- 行ごとの未完条件: recipe、counterevidence、confidence、expiry、finding advisory、remediation advisory、proposal digestの各fieldについて、採択済みOS requirement/L11の保持先・owner・不在時挙動を対応づける。audit記録はprobe schemaと独立再現等を未採択詳細と記す。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-000151 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:59` / `LEGACY-ASSET-EB3700B0088F311C2295`
- asset ledger row 789 SHA-256 `64ade03f3caed823f572e07b263fa6eb231ba8a179ccaff7bd80912a541739f6`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`
- physical line SHA-256: `sha256:7c942afd939ddff22a9d224c5b59f654f98915354047966d17dede7fa21bb2ca`
- 旧source bytes: `仮定exact set、再合成要否、差分digestを持つ。`
- current route snapshot IDs: `['HARNESS-L2-028', 'HARNESS-L2-029', 'HELIXOS-L2-005', 'HELIXOS-L2-007']`; adopted current IDs: `[]`
- 現行relation: AAFD-R要求は仮定exact set、再合成要否、差分digestを保持。OS L2-005/007とsource/scope/disposition責務へ部分関連するが、exact setのschema、recomposition判定、digest invalidationは未採択/未trace。
- 行ごとの未完条件: 仮定exact set、再合成要否、差分digestのschema・producer・比較規則と、どの変更で再合成/invalidationとなるかを特定する。L2-005/007へのbroad relationでは条件確定にならない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001410 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:20` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:6e57857eba84850055add5f3ce3e9ce6217f73fc6dd89f7c68311cff51d9cb79`
- 旧source bytes: `- 現行AssignmentのIssue／PLAN択一は未切替scopeで存続する。Ticket採用scopeは新schema versionで一つの導出契約へ束縛し、三つを同時にscope authorityにしない。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: 旧TicketはAssignmentのIssue/PLAN択一を未切替scopeで存続させ、新schema version内の単一導出契約を要求。
- 行ごとの未完条件: 新schema version内のsingle derivation contractがどの採択済みrequirementで維持され、未切替scopeのAssignment Issue/PLAN択一とどのように併存するかをexact revision/scopeで対応づける。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001411 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:21` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:a8ef45f339625bd500fab0df91378d451fc360e69ac22792821d8194f79d2468`
- 旧source bytes: `- Ticket内allowed/forbidden pathsは計画上の制約であり、physical identityと実行時targetの解決は既存broker／Assignmentが担う。自由文字列pathを実行許可にしない。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: allowed/forbidden pathsはplanning constraintで、実行先identity/runtime targetは既存broker/Assignmentが決める。Ticket自身に自由なpath execution authorityを持たせない。
- 行ごとの未完条件: allowed/forbidden pathの制約と実行先identityを既存broker/Assignmentが保持する境界について、採択済みrequirement/L11の具体的oracleと現行責任者を特定する。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001412 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:22` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:b04d474fb45239237c53451271500362ef3097d0dd9e85acc190296404da7f5b`
- 旧source bytes: `- 異なるTicket revision間も同一logical workの旧変更Assignmentをfenceしてから新revisionをclaimする。revision別一writerだけで旧新二重writerを許さない。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: 同一論理作業の旧Assignmentと新Ticket revision claim間にcross-revision fenceを要求。
- 行ごとの未完条件: 旧Assignmentと新Ticket revision claimを跨ぐ同一作業について、fence対象identity、発火条件、拒否/隔離結果を現行adopted oracleへ対応づける。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001413 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:23` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:85ee66549e9454bafe274ef6255c465475222306bcb12ad5bcce215edc27d52b`
- 旧source bytes: `- L3承認・canonical freeze・IR admission前に本候補を実行判定へ使用しない。既存BenchのPLAN confirmedと文書draftの不一致は自動昇格せず#251で解決する。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: L3承認/canonical freeze/IR admission前にcandidateをexecution judgementへ使わず、PLAN/doc draft不一致を自動解決しない。
- 行ごとの未完条件: L3 approval/canonical freeze/IR admission各gateの順序と、PLAN confirmed対doc draft不一致の非自動解決を現行authority/sourceで確認する。過去のIssue参照やcandidate文を現行決定扱いしない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001414 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:24` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:666fb295081589730b8683d45140b239cb0d444ad9eb2026efd3649f561fc2ed`
- 旧source bytes: `- HXT/HXBは本候補内追跡ID。既存FRとの同義重複はtraceの再利用先へ接続し、current FRを二重定義しない。登録／改版はcanonical化時に行う。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: HXT/HXBはcandidate-local tracking IDで、既存FRをtraceし重複登録せず、canonicalization時に登録/revisionする。
- 行ごとの未完条件: HXT/HXBをcandidate-local IDに留め、既存FRへtraceしcanonicalization時に登録するという各段階の重複防止規則が現行採択要件にあるかを特定する。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001415 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:25` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:18effe3a9f0be472f34bba5a7f4cf08f5537f77f9294e09342888930b4ef51c9`
- 旧source bytes: `- measurement modeはworkflow identityやexecution modeとは別軸。Ticket revisionとscorer／policy revisionを混同しない。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: measurement modeとworkflow/execution modeを分離し、Ticket revisionとscorer/policy revisionを別identityにする。
- 行ごとの未完条件: measurement mode/workflow/execution mode、およびTicket revision/scorer-policy revisionの独立identity・join条件を現行採択要件とL11で対応づける。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001416 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:26` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:171d43daec92697677410cef54ff27ab1437fe9eaf7520c4e9cf5016f8a0981c`
- 旧source bytes: `- 本取込は新規API、課金、認証設定、公開、production操作、旧engine切替を実施しない。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: このintakeは新API、billing、auth、public/prod ops、old-engine switchを実装しない。
- 行ごとの未完条件: 非対象（API/billing/auth/public-prod/old-engine switch）の行はintake境界を示す。現行の対応する権限外範囲/対象scopeを特定し、旧candidateの否定形から新規制約を作らない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001477 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:99` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:a485e05cbaa15a72e09e2b1f1f7aa82ac9710425054c138a1bf271a828d9d9ef`
- 旧source bytes: `1. 切替済みの通常開発経路では、admitted Ticket・有効Assignment・必要なlease/fenceなしに変更実行しない。bootstrap、read-only診断、formal/shadowは別の明示的実行profileで扱い、抜け道にしない。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: admitted Ticket・valid Assignment・required lease/fenceを通常開発の前提とし、bootstrap/read-only/formal/shadow profilesを区別する。
- 行ごとの未完条件: admitted Ticket、valid Assignment、lease/fenceを要する条件と4つのprofile区別について、現行source/authority revisionとL11各profile oracleを特定する。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001478 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:100` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:825ad366a28f909fc91dd318544b912e854bdacdce5030a59e494c797fcbbe74`
- 旧source bytes: `2. Ticketは要求・要件へ遡及する導出契約であり、要求・要件正本を置き換えない。PLANのatomic change規律をTicket細分化で弱めない。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: Ticketはrequirements/Design/PLANから導出され、それらを置換せずPLANのatomic-change ruleを弱めない。
- 行ごとの未完条件: requirements/Design/PLANの導出元・非置換関係とPLAN atomic-change規則を弱めない条件について、現行採択文とL11 oracleのexact mappingを特定する。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001479 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:101` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:bc3891c6ee1b2982656eea46dfedc9b59f73cb90ab3740200b65cf736467ca71`
- 旧source bytes: `3. Ticketはimmutable/revisioned。exactly-one primary responsibilityとbehavior contractを持つ。曖昧な分解は候補・backflowに留める。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: immutable/revisioned Ticketにexactly-one primary responsibilityとbehavior contractを要求し、曖昧な分割はproposal/backflowへ残す。OPS-O1/O2 r4 receiptはTicket物理line 101の短いimmutable fragmentだけを限定採取し、この行全体のcoverage/採択ではない。
- 行ごとの未完条件: r4の採取spanはline 101内の「Ticketはimmutable/revisioned。」だけ。exactly-one responsibility、behavior contract、曖昧分割時backflowの3条件が現行採択要件/L11のどこで保持されるか未解決。r4 MPRはregistered proposal・authority none。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001480 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:102` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:6fb892ab97f097535a18fd3940948ff171a5c8a5d270ac9c42c464d9de4155e0`
- 旧source bytes: `4. actor、provider、model、session、branch、worktree、lease、現時点の優先順位・進捗・measurement値はTicket本文へ入れない。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: actor/provider/model/session/branch/worktree/lease/priority/progress/measurementをTicket bodyから除く。OPS-O1/O2 r4は旧物理line 102をexact selected spanとして記録するが、候補はregistered_proposal/authority noneでありPO採択/旧atom closureではない。
- 行ごとの未完条件: line 102は完全sentenceを選択spanとしてreceiptに持つが、r4はregistered proposal・authority none。各実行属性のTicket外配置先と禁止oracleが採択済みかは未解決。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

### LEGACY-CAND-LINE-001481 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:103` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- asset ledger row 814 SHA-256 `90c173b94c91cd1d6f1000c5867b5b88aaed133fb5c1b11803a233d913ea200e`: product target `unresolved`, authority `historical`, disposition `unresolved`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- physical line SHA-256: `sha256:d7f629f704280284f176115129af6a5c038b7d97b9dd7dad96c6cdaa1cbc0e65`
- 旧source bytes: `5. Ticket revision、Assignment revision、Attempt、treatment、replicate、event IDは別identityとする。`
- current route snapshot IDs: `['HELIXOS-L2-004', 'HELIXOS-L2-007', 'HELIXOS-L2-008', 'HELIXOS-L2-009', 'HELIXOS-L2-010', 'HELIXOS-L2-011', 'HELIXOS-L2-014']`; adopted current IDs: `['HELIXOS-L2-014']`
- 現行relation: Ticket revision, Assignment revision, Attempt, treatment, replicate, event IDを別identityに保つ。
- 行ごとの未完条件: Ticket revision/Assignment revision/Attempt/treatment/replicate/event IDを別identityとして保ち、相互joinするcurrent schema/oracleの対応づけが未確認。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`。

## 結果と静的検証

- 選定20行の旧物理source file/line bytesをcarry ledgerとarchive sourceで照合し、各SHA-256を確認した。3つの旧source assetに属する。
- HARNESS-L2-028/-029のstage-review receiptは旧source atom 0件、authority effect none。OS-L2-014 receiptの6 atomsも異なるscopeでありTicket coverageではない。HELIXOS-L2-047 r4 receiptは5 selected source atomsのregistered proposalで、採択/旧atom closureではない。
- Ticket line 101 row (001479)はr4で「Ticketはimmutable/revisioned。」fragmentのみを採取し、行全体のexactly-one responsibility、behavior contract、曖昧分割backflowへ拡張しない。line 102 (001480)はsentence全体が選択されるが、proposal登録のためPO採択やauthority効果はない。
- #2347のhistoric route/classification countsは変更しない。残り121件のrelation residualも本限定監査の対象外。
- 旧source closure、formal successor、L3遷移、Stage 5/6完了、実装許可、受入実行は主張しない。

## 静的検証

- JSON parse、20 IDの昇順/期待集合、物理line SHA、input file SHA pin、#2350集合とのintersection、MD/JSONのID・比較・未完条件一致、`git diff --check`を検証する。
