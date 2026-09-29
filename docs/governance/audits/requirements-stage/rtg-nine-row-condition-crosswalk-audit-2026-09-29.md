# RTG旧受入条件9行の現行L2/L11照合監査

- audit id: `rtg-nine-row-condition-crosswalk-2026-09-29`
- 基準commit: `3eed8fdbf4cb195e413bfe4f65fca11da6739273`
- 記録種別: Stage 5 read-only source audit。`authority_effect: none`。
- 旧asset: `LEGACY-ASSET-AE48728497244121EEC3`。旧source file SHA-256: `66609d952094050336a3e29abf088c18178590fb5998dbbd06dc1fecb4b79251`。
- 対象は未照合の9 ID `003503`, `003506`–`003513`。AC-002/003/012等、先行10行監査の対象を再計上しない。
- 方法: source line台帳のID・本文・digestと旧原文を照合し、positive conditionとnegative oracleを採択済み現行L2/L11に比較。条件列とnegative oracle列を持つ7行はexplanationからrequirement_atomへeffective correctionし、元分類と理由を保持する。累積件数差分は全populationの再pin/recountなしに主張しない。formal successor・authority・受入実行を推定しない。

## 結果一覧

| Source item | 旧AC | 台帳route | 比較結果 | 主な残差 |
|---|---|---|---|---|
| `LEGACY-CAND-LINE-003503` | RTG-AC-001 | `explanation` → `requirement_atom` | partial | 同じtrigger input tupleからのtrigger evidence exact set/digest決定性、event permutation/retry不変性の現行の採択済みpairには、trigger evidence exact set/digestの決定性とevent順序/retry不変性を扱うRTG個別oracleを確認できない。現行の採択済みpairには、runtime hardcode・event順序・retry不変性を扱うRTG個別oracleを確認できない。 |
| `LEGACY-CAND-LINE-003506` | RTG-AC-004 | `requirement_atom` (維持) | partial | safety-net単独時にcoverage-onlyとなる条件、substantive findingとRF0 admissionを禁止する現行の採択済みpairには、safety-net単独時のcoverage-onlyとsubstantive finding/RF0 admission拒否を扱う個別oracleを確認できない。 |
| `LEGACY-CAND-LINE-003507` | RTG-AC-005 | `explanation` → `requirement_atom` | partial | 現行の採択済みpairには、旧tuple全項目のexact match、unknown scopeのfallback拒否、RF0へのadmissionを扱うRTG個別oracleを確認できない。 |
| `LEGACY-CAND-LINE-003508` | RTG-AC-006 | `explanation` → `requirement_atom` | partial | 現行の採択済みpairには、旧三route・provider drift分類・REFACTORING route名を固定する個別oracleを確認できない。 |
| `LEGACY-CAND-LINE-003509` | RTG-AC-007 | `explanation` → `requirement_atom` | partial | 採択済みpairには、primary scopeが一つである条件や複数primary/unknown owner/related scope欠落を判定する個別negative oracleを確認できない。 |
| `LEGACY-CAND-LINE-003510` | RTG-AC-008 | `explanation` → `requirement_atom` | partial | 現行crosswalkは旧authority_pending enum・再freeze条件・current 9 scopeを固定せず、採択済みpairにもこれらを扱う個別oracleを確認できない。 |
| `LEGACY-CAND-LINE-003511` | RTG-AC-009 | `requirement_atom` (維持) | partial | 現行の採択済みpairには、全scopeの列挙、source exact set/policy digest/finding countの一体契約、partial/stale scanのRTG個別negative oracleを確認できない。 |
| `LEGACY-CAND-LINE-003512` | RTG-AC-010 | `explanation` → `requirement_atom` | partial | 現行L11に状態分離はあるが、採択済みpairには評価済みfindingなしからterminal no_actionへの遷移条件や、scan実行がcandidateを終端させない個別oracleを確認できない。 |
| `LEGACY-CAND-LINE-003513` | RTG-AC-011 | `explanation` → `requirement_atom` | partial | 採択済みpairにはshadow admission状態・UIL-04〜06 gate・RF0実行禁止を一体化した現行段階/side-effect oracleを確認できない。Issue/PLAN/authorityへの遷移は現行OS/authority境界から別途導く。 |

## 共通の現行根拠と境界

- HARNESS-L2-004/005と対応L11は、変更意味・影響・必要検証の一般責務を扱う。本文の対象行とdigestはJSONの`target_refs.harness_change_contract`に固定した。旧RTG trigger tuple/routeの個別oracleは含まない。
- HELIXOS-L2-001/002/003/005/007と対応L11は、scope・影響・観測候補・source/provenance・状態欠落の一般責務を扱う。構造改善L11の状態分離と境界は現行本文にあるが「全件未実行」と明記される。該当行・digestはJSONの`target_refs.os_structure_contract`に固定した。
- HARNESSおよびOSの2026-09-28 PO decisionは採択済みL2/L11 revisionを固定するが、この9 source itemまたはRTG固有acceptance oracleを採択・割当した記録ではない。各decision本文SHAはJSONの`decision_refs`に固定した。
- RTG対応表は各ACを再導出候補として接続し、旧event/route/schema/UIL/RF0/current 9等を固定しない。表自体が採択やcoverageを生まない。
- 2026-09-29 PO decision境界に従い、部分対応の近接IDをformal successor/coveredへ昇格させず、旧source closureを生成しない。

## 行別照合

### LEGACY-CAND-LINE-003503 — RTG-AC-001

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:20` (line SHA-256 `db55cfb04ae0b247da9d90e26649245f085ac4485c10a9faad1019c8e659e0ce`)
- 原文: | RTG-AC-001 | RTG-R-01 | 同一event exact set、baseline、policy versionから同一trigger evidence exact set／digestを返す | runtime hardcode、event順序、retryで結果を変えない |
- positive condition: 同一event exact set・baseline・policy versionから同一trigger evidence exact set/digestを返す。
- negative oracle: runtime hardcode・event順序・retryで結果を変えない。
- 台帳route: `explanation` / `non_requirement_source_structure_or_explanation`。この監査でrequirement_atomへeffective correctionし、条件とnegative oracleの双方を保存する。累積件数差分は全populationの再pin/recount前には主張しない。
- 現行との関係: HELIXOS-L2-007の出典・revision・証拠参照、L2-009のdurable event/idempotent projection等は再現可能な記録の土台として関係する。
- 不足・残差: 同じtrigger input tupleからのtrigger evidence exact set/digest決定性、event permutation/retry不変性の現行の採択済みpairには、trigger evidence exact set/digestの決定性とevent順序/retry不変性を扱うRTG個別oracleを確認できない。現行の採択済みpairには、runtime hardcode・event順序・retry不変性を扱うRTG個別oracleを確認できない。
- 次owner / PO境界: trigger identityとevidence derivationの現行ownerを要求整理で特定し、必要なら決定性・順序・再送のnegative oracleをL11候補に分ける。
- 結果: **partial**。formal successorなし、authority effectなし。

### LEGACY-CAND-LINE-003506 — RTG-AC-004

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:23` (line SHA-256 `52f42c3a4924076688772540d1ead57094980044abadc0ebef903d6c7bbfebf5`)
- 原文: | RTG-AC-004 | RTG-R-02 | safety-net単独ではscan coverageだけを記録する | substantive finding／RF0 admissionを生成しない |
- positive condition: safety-net単独ではscan coverageだけを記録する。
- negative oracle: substantive finding/RF0 admissionを生成しない。
- 台帳route: `requirement_atom` / `unknown`。分類変更なし。
- 現行との関係: HELIXOS-L2-005/007とL11の構造改善境界は観測・finding・候補・採否を分離し、単一metricや定期scanだけによる候補採択/実行を拒否する。
- 不足・残差: safety-net単独時にcoverage-onlyとなる条件、substantive findingとRF0 admissionを禁止する現行の採択済みpairには、safety-net単独時のcoverage-onlyとsubstantive finding/RF0 admission拒否を扱う個別oracleを確認できない。
- 次owner / PO境界: 観測・findingの責務ownerはOS要求側、refactoring findingの意味はHARNESS要求側で整理する。legacy RF0を前提にせず、対象価値が選ばれた場合のみPO境界へ意味選択を上げる。
- 結果: **partial**。formal successorなし、authority effectなし。

### LEGACY-CAND-LINE-003507 — RTG-AC-005

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:24` (line SHA-256 `ac560ebe72a9257f3cedc77d461f44654cddad2fe04df2318f30191f3efd032a`)
- 原文: | RTG-AC-005 | RTG-R-03 | candidate、finding、evidence、policy、baseline、scope、routeのexact一致時だけRF0へadmitする | unknown scopeを`code_clean`へfallbackしない |
- positive condition: candidate・finding・evidence・policy・baseline・scope・routeのexact一致時だけRF0へadmitする。
- negative oracle: unknown scopeをcode_cleanへfallbackしない。
- 台帳route: `explanation` / `non_requirement_source_structure_or_explanation`。この監査でrequirement_atomへeffective correctionし、条件とnegative oracleの双方を保存する。累積件数差分は全populationの再pin/recount前には主張しない。
- 現行との関係: HARNESS-L2-004/005は変更影響・検証範囲を保持し、HELIXOS-L2-002/007はscope・provenance・欠落/staleを扱う。
- 不足・残差: 現行の採択済みpairには、旧tuple全項目のexact match、unknown scopeのfallback拒否、RF0へのadmissionを扱うRTG個別oracleを確認できない。
- 次owner / PO境界: 要求意味とverification obligationはHARNESS、finding/scope/provenance stateはOSの既存責務で要求側が分解する。意味・scope選択を変えるときだけPOへ。
- 結果: **partial**。formal successorなし、authority effectなし。

### LEGACY-CAND-LINE-003508 — RTG-AC-006

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:25` (line SHA-256 `7b4e8be4ee7a95a8f4c26bcc4d8ae0d515db3936f44cefb6b57ac868d842e2eb`)
- 原文: | RTG-AC-006 | RTG-R-03 | semantic changed／unknown、実装故障、provider driftを別route／decisionへ送る | 非refactorをREFACTORINGへ丸めない |
- positive condition: semantic changed/unknown・実装故障・provider driftを別route/decisionへ送る。
- negative oracle: 非refactorをREFACTORINGへ丸めない。
- 台帳route: `explanation` / `non_requirement_source_structure_or_explanation`。この監査でrequirement_atomへeffective correctionし、条件とnegative oracleの双方を保存する。累積件数差分は全populationの再pin/recount前には主張しない。
- 現行との関係: HARNESS-L2-004/005は意味保存、影響、必要再検証を、OS-L2-003/005は変更影響伝播と候補還流を扱う。
- 不足・残差: 現行の採択済みpairには、旧三route・provider drift分類・REFACTORING route名を固定する個別oracleを確認できない。
- 次owner / PO境界: HARNESS要求側が意味変更と故障時の検証責務を扱い、provider/environmentのsource ownerとOS側route境界を要求整理で特定する。旧routeを再導入する意味判断はPO境界。
- 結果: **partial**。formal successorなし、authority effectなし。

### LEGACY-CAND-LINE-003509 — RTG-AC-007

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:26` (line SHA-256 `ee4b4f763243cbbc49526876477b2279c7d4eee20e7e1737aa1a7d06c79205d5`)
- 原文: | RTG-AC-007 | RTG-R-04 | primary scope exactly oneとrelated scopesを保持する | primary複数、owner不明、related欠落をgreenにしない |
- positive condition: primary scope exactly oneとrelated scopesを保持する。
- negative oracle: primary複数・owner不明・related欠落をgreenにしない。
- 台帳route: `explanation` / `non_requirement_source_structure_or_explanation`。この監査でrequirement_atomへeffective correctionし、条件とnegative oracleの双方を保存する。累積件数差分は全populationの再pin/recount前には主張しない。
- 現行との関係: HELIXOS-L2-001/002は対象・正本・revisionへのtraceとscope間の欠落/競合/未検証の非相殺を要求し、L2-005は出典付きscopeを扱う。
- 不足・残差: 採択済みpairには、primary scopeが一つである条件や複数primary/unknown owner/related scope欠落を判定する個別negative oracleを確認できない。
- 次owner / PO境界: 影響対象を所有するOS/product owner候補は要求側が既存L1と責務境界から特定する。新scopeやprimary所有意味を選択する場合はPO判断へ。
- 結果: **partial**。formal successorなし、authority effectなし。

### LEGACY-CAND-LINE-003510 — RTG-AC-008

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:27` (line SHA-256 `789ef8d0c4df4fbe8ad526dbe9a0d019eb00636002f2bfa29e305d18c78bafdb`)
- 原文: | RTG-AC-008 | RTG-R-04 | requirement／definitionをauthority再freeze前はauthority_pendingにする | current9 scopeへ暗黙追加しない |
- positive condition: requirement/definitionをauthority再freeze前はauthority_pendingにする。
- negative oracle: current 9 scopeへ暗黙追加しない。
- 台帳route: `explanation` / `non_requirement_source_structure_or_explanation`。この監査でrequirement_atomへeffective correctionし、条件とnegative oracleの双方を保存する。累積件数差分は全populationの再pin/recount前には主張しない。
- 現行との関係: 現行authority modelとHELIXOS-L2-001/003は対象revision・共通統制とproduct scopeを区別する。source crosswalkは旧pending状態とcurrent 9 scopeを固定しないと明記する。
- 不足・残差: 現行crosswalkは旧authority_pending enum・再freeze条件・current 9 scopeを固定せず、採択済みpairにもこれらを扱う個別oracleを確認できない。
- 次owner / PO境界: 既存authority state modelに照らして未知/未確定の状態を保持し、scope/authority意味を増減する候補だけPO境界へ。要求側は旧enumを現行契約と仮定しない。
- 結果: **partial**。formal successorなし、authority effectなし。

### LEGACY-CAND-LINE-003511 — RTG-AC-009

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:28` (line SHA-256 `cd34917d6e1c795eabeeb2a42449875c2c3eb2012292c8d6617974656af311ac`)
- 原文: | RTG-AC-009 | RTG-R-05 | 全scopeのrevision、source exact set、policy digest、finding countを記録する | missing source、partial scan、stale policyを全評価済みにしない |
- positive condition: 全scopeのrevision・source exact set・policy digest・finding countを記録する。
- negative oracle: missing source・partial scan・stale policyを全評価済みにしない。
- 台帳route: `requirement_atom` / `unknown`。分類変更なし。
- 現行との関係: HELIXOS-L2-002/007とL11は評価の未完/欠落/stale/partialを保持し、source/provenanceとrevisionを追える一般基盤を持つ。
- 不足・残差: 現行の採択済みpairには、全scopeの列挙、source exact set/policy digest/finding countの一体契約、partial/stale scanのRTG個別negative oracleを確認できない。
- 次owner / PO境界: OS要求側が評価scopeと証拠状態を既存契約へ割り付け、HARNESSが必要な判定oracleの意味を定める。policy/digest schemaを新設する意味選択はPOへ。
- 結果: **partial**。formal successorなし、authority effectなし。

### LEGACY-CAND-LINE-003512 — RTG-AC-010

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:29` (line SHA-256 `cb4f8e26294f175014bb93d36e5813a16bfa2d9591cc4f54adbd106eb16dca33`)
- 原文: | RTG-AC-010 | RTG-R-05 | findingなし評価とterminal no_actionを別状態にする | scan実行をcandidate終端へ丸めない |
- positive condition: findingなし評価とterminal no_actionを別状態にする。
- negative oracle: scan実行をcandidate終端へ丸めない。
- 台帳route: `explanation` / `non_requirement_source_structure_or_explanation`。この監査でrequirement_atomへeffective correctionし、条件とnegative oracleの双方を保存する。累積件数差分は全populationの再pin/recount前には主張しない。
- 現行との関係: HELIXOS-L2-005/007およびL11は未評価・unknown/stale/partial・findingなし・no actionを相互に補完しない状態として保持する。
- 不足・残差: 現行L11に状態分離はあるが、採択済みpairには評価済みfindingなしからterminal no_actionへの遷移条件や、scan実行がcandidateを終端させない個別oracleを確認できない。
- 次owner / PO境界: OS要求側が状態遷移・終端条件を、HARNESS要求側がfinding意味を整理する。terminal意味を変える場合は既存POの要求意味判断へ。
- 結果: **partial**。formal successorなし、authority effectなし。

### LEGACY-CAND-LINE-003513 — RTG-AC-011

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:30` (line SHA-256 `940813c4082c9a041352390b4b0c239b194ccad6a49a828b3bc261e05952aafc`)
- 原文: | RTG-AC-011 | RTG-R-06 | UIL-04〜06未到達時はshadow admissionだけを生成する | RF0実行、Issue／PLAN／authority writeを行わない |
- positive condition: 旧UIL-04〜06未到達時はshadow admissionだけを生成する。
- negative oracle: RF0実行・Issue/PLAN/authority writeを行わない。
- 台帳route: `explanation` / `non_requirement_source_structure_or_explanation`。この監査でrequirement_atomへeffective correctionし、条件とnegative oracleの双方を保存する。累積件数差分は全populationの再pin/recount前には主張しない。
- 現行との関係: HELIXOS-L2-005とL11は観測・候補・採否・有効化を分け、観測だけ・旧UIL/RF0/CIだけから候補採択や実行を生成しない。
- 不足・残差: 採択済みpairにはshadow admission状態・UIL-04〜06 gate・RF0実行禁止を一体化した現行段階/side-effect oracleを確認できない。Issue/PLAN/authorityへの遷移は現行OS/authority境界から別途導く。
- 次owner / PO境界: OS要求側が候補状態と許可済み既存workflowへのhandoffを整理し、HARNESSが検証義務を定義する。旧UIL/RF0段階や新しいauthority手続きは作らず、要求意味変更だけPOへ。
- 結果: **partial**。formal successorなし、authority effectなし。

## 限界

この記録は指定された9 source lineの読み取り比較であり、他の旧source、全要求atom、全受入negative oracleの全量closureを示さない。構造改善L11は未実行。要求stage 5/6完了、L3移行、実装・実行許可、旧source retirementは生成しない。

JSONは同じ9行のsource/target/decision pin、行別比較、owner境界を機械照合用に保持する。
