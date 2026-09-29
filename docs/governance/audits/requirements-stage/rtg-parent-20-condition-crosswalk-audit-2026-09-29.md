# RTG-R-01〜06 親要件20行の現行L2/L11条件照合監査

- 監査ID: `rtg-parent-20-condition-crosswalk-2026-09-29`
- 基準commit: `ee8152770667d69cccac2a7eca06f7e989b256f8`（#2341 merge/read-after後）
- 記録種別: Stage 5 read-only、`authority_effect: none`。
- 対象: 旧要件sourceの非空本文20行（`LEGACY-CAND-LINE-003549`等）。台帳snapshotの17 explanationと3 requirement_atom/unknownを、採択済み現行HARNESS/OS L2/L11条件および拒否oracleと照合した。
- 原source file SHA-256: `4776830ec12a6a464732db56e6ff8d93f89e8e89a6dcb8c175728a82482cc754`。全20行の本文、line SHA、routing snapshot分類、target pinは同名JSONに保持する。
- 本監査は意味上の条件行分類だけを扱う。17行をeffective `requirement_atom`へ補正し、既存3行の`requirement_atom/unknown`は維持する。これは要求の採択・被覆・successor assignmentではない。

## 判定と件数の境界

- 20行中17行は「束縛する」「別扱いする」「保持する」「行わない」「拒否する」等の規範条件を直接記す。説明見出し・補助文ではなく個別要求atomとして有効分類を補正した。3行はrouting snapshot上すでに`requirement_atom`でroute `unknown`のため補正しない。
- #2341の全量再集計値（structure 926 / explanation 2,940 / condition 889 / route unknown 574 / total 4,755）は、今回の17補正より前の値であり、この監査がmainへ入った後はeffective classificationに対してhistorical staleとなる。#2341 JSONは変更せず、本監査では4,755行全体を再集計しない。
- 全20行の現行対応結果は `adopted_relevant_partial`。現行のHARNESS-L2-004/005は変更影響・必要な再検証を、OS-L2-001/002/003/005/007および構造改善条件は観測・finding・候補・scope・根拠・状態分離・採否・再検証を一般責務として含む。RTG固有oracleの成立までは示さない。
- HARNESS/OSのPO判断記録はL2/L11のexact bytesを対象revisionで採択するが、RTG-Rのsource item IDをformal successorに割当てた記録ではない。#2338/#2339のAC auditsも、関連する子受入行の照合であり、親RTG-R source line自体のcoverageを意味しない。

## 行別判定

| Source item / line | 旧条件または拒否oracle | 採択済みL2/L11との関係 | 残差 | 分類 |
|---|---|---|---|---|
| `LEGACY-CAND-LINE-003549` / 40 | UILで正規化されたeventとfindingからRF0候補を導出する規則を、version、authority digest、source／detector identity、 | OS-L2-005とL11は出典・適用範囲付きの観測から改善候補を登録し、採否・変更・再検証へ追跡する一般関係を採択済み。 | RTG固有のevent/finding identity、policy導出、candidate生成の境界と入力exactnessは採択pairにない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003550` / 41 | baseline revision、比較演算、threshold source、観測window、minimum sample、hysteresis、cooldown、expiry、severity、 | OS-L2-007/L11はsource・revision・evidence provenanceを追跡し、OS-L2-005は出典・適用範囲を保持する。 | 列挙したRTG policy field一体契約と個別negative oracleはない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003551` / 42 | counterevidence、unknown dispositionへ束縛する。source registryの定義を複製せず、policy値をruntimeへ重複hardcodeしない。 | HARNESS-L2-005/L11は変更・riskに応じた検証義務とevidence identityを一般的に扱う。 | source registry ownershipとruntime hardcode禁止のRTG-specific oracleは採択pairにない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003553` / 46 | invariant違反、再発、metric budget超過、悪化傾向、structural drift、release boundary、provider change、 | OS-L2-005/007は観測、finding、候補、provenanceを分けて登録する。 | このtrigger enum/identity集合と各triggerの独立判定oracleは再採択されていない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003554` / 47 | scheduled safety-netを別trigger identityとして扱う。LOC、file size、Issue数、AI評価、単一瞬間値だけでは候補をadmitしない。 | OS-L2-005の固定L2節とOS-L11構造改善条件は単一metric、AI評価、file size、Issue数、定期scanだけから採択・実行を生成しないとする。 | 旧admission/RF0の個別oracleや信号組合せ基準はない。 | `requirement_atom` → `requirement_atom` |
| `LEGACY-CAND-LINE-003555` / 48 | 蓄積評価はversioned windowとminimum sampleを満たし、lifecycle boundaryは評価契機であって悪化証拠なしにrefactorを強制しない。 | OS-L2-005/L11は候補・採否・効果を分け、単一/定期観測だけによる採択・実行を拒む。 | versioned window/sampleとlifecycle-triggerの具体条件は採択pairにない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003556` / 49 | scheduled safety-net単独ではsubstantive findingを作らず、評価実施receiptだけを残す。 | OS-L2-005/L11は定期scanだけでは候補を採択・実行しない。 | coverage receipt schemaとsafety-net-onlyのfinding suppression oracleはRTG個別条件としてない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003558` / 53 | UIL candidateからRF0へ渡すadmissionはcandidate／finding／trigger evidenceのexact identityとdigest、source registry、 | OS-L2-005/007は候補・根拠・出典の記録、HARNESS-L2-004/005はtraceと検証義務を扱う。 | 旧UIL/RF0に接続するexact tuple/digest admissionは継承せず、現行pairにも対応oracleなし。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003559` / 54 | trigger policy、baseline、primary scopeはexactly one、related scope、semantic parity、route candidate、suppression、 | OS-L2-001/002/003/005/007は要求・責務・scope・provenance・影響を一般的に管理し、HARNESS-L2-004/005は必要再検証を導く。 | 列挙tuple、単一primary scope、route/suppression/expiryのRTG-specific exact oracleはない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003560` / 55 | required verification、expiryを保持する。意味変更はREFACTORINGへadmitせずREDESIGN／Requirement Re-entryへ、 | HARNESS-L11は意味保存、意味変更、実装故障、外部環境変化を個別に与えて影響・再検証・差戻し先を区別する。 | 旧REFACTORING/REDESIGN/RECOVERY/Technology Environment route名とrouting policyを新規採択したわけではない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003561` / 56 | 実装故障はRECOVERYへ、外部技術driftはTechnology Environment Reconciliationへ送る。unknownを推測配車しない。 | OS-L2-001/002/003とL11のowner・trace欠落/unknown条件、HARNESS-L11のUnknown保持・再検証境界が関連する。 | RTG-specific dispatch/refusal oracleと旧route集合は採択pairにない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003563` / 60 | 現行9 scopeをexact setとし、primary scopeはexactly one、関連影響はrelated scopesへ分離する。複数ownerを一原子変更で | OS-L2-001/002/003とL11はowner、責務、scope、影響範囲と複数owner/trace欠落を一般的に区別する。 | current 9 scopeは明示的に継承対象外。exactly-one/分割/escalationのRTG-specific oracleもなし。 | `requirement_atom` → `requirement_atom` |
| `LEGACY-CAND-LINE-003564` / 61 | 閉じられない候補は分割するかSystem Synthesisへ昇格する。`requirement`／`definition` scopeはIssue #1170のL3/L10が | OS-L11のHCV4-L11-002はowner欠落/複数ownerを別状態で表示する。 | 分割可否とSystem Synthesisへのhandoff先/条件は現行採択pairにない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003565` / 62 | mainで再freezeされるまで`authority_pending`とし、現行exact setへ暗黙追加しない。 | OS-L2-001/003とL11は決定source・revision・scopeを確認し、未承認操作を止める。 | 旧authority_pending enum、Issue #1170、再freeze gate/current 9 scopeは採択されていない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003567` / 66 | current scopeごとにlast evaluated revision、source exact set、policy digest、finding countを持つcoverage receiptを生成する。 | OS-L2-002/007およびL11は対象trace、source/revision/evidenceの一般基盤を採択する。 | 全scope coverage receiptと4-field一体schemaは採択pairにない。 | `requirement_atom` → `requirement_atom` |
| `LEGACY-CAND-LINE-003568` / 67 | 期限超過、source欠落、partial scan、stale policyを全scope評価済みとして扱わない。異常なしはterminal `no_action`と混同せず、 | OS-L2-002/005/007 L11は未評価、unknown、stale、partialを個別に保持して相互補完しない。 | RTG-specific scope-completeness、期限超過、source exact-set判定はない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003569` / 68 | 「評価済み・substantive findingなし」として候補未生成の事実を保持する。 | OS-L11は未評価/unknown/stale/partial/findingなし/no actionを個別に確認し相互補完しない。 | RTG固有candidate lifecycleとterminal遷移条件はない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003571` / 72 | UIL-04〜06がcurrent mainへ到達するまではtrigger evidence、finding、shadow admission projectionに限定し、RF0自動実行、 | OS-L2-005/L11は観測から直接採択・実行やauthority変更を作らず、意味変更を上流へ返す。 | 旧UIL gate値、shadow admission state、RF0への段階遷移は新世代へ移管されていない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003572` / 73 | Issue自動起票、PLAN生成、authority writeを行わない。導入前後でmissed-trigger proxy、false-positive、duplicate candidate、 | OS-L2-005/007とL11は候補採否を区別し、直接authorityを書き換えず、projectionから要求意味を逆生成しない。 | 旧shadow phase/RF0を含む具体的なadmission milestoneは採択pairにない。 | `explanation` → `requirement_atom` |
| `LEGACY-CAND-LINE-003573` / 74 | coverage、finding→RF0 lead time、rework／rollback、CI costを測定し、悪化時はadoptionを確定しない。 | OS-L2-005/L11は改善効果/退行をLABOが評価し、登録件数やlog量を改善達成にしない。 | 列挙metricの定義/分母/baselineと悪化判定によるadoption gateは採択pairにない。 | `explanation` → `requirement_atom` |

## #2338/#2339の位置づけ

- #2338（`legacy-ten-condition-crosswalk-2026-09-29`）はRTG-AC-002/003/012を含む受入条件10行の監査。#2339（`rtg-nine-row-condition-crosswalk-2026-09-29`）はRTG-AC-001/004〜011を含む9行の監査である。各AC行には別の`LEGACY-CAND-LINE` identity、原文行、line hashがある。
- 親source行とAC行は対応する要件/受入関係にあるため条件テーマと未解決oracleを参照した。ただしAC行を親行のcoverage証拠へ転用していない。17件の分類補正は親行の意味そのものを読んだ結果である。

## Pinと限界

- Adopted target: HARNESS/OSの2026-09-28 PO decisionが指定する対象commit `f6dad2a...` とL2/L11 SHAをJSONに固定した。main上の現在の同ファイルSHAも併記し、変更後bytesと採択revisionを区別する。
- HELIX-OS L11の構造改善条件（L11本文96–100行）は「全件未実行」と明示される。この監査も実行・受入結果を主張しない。
- 旧candidate本文のfrontmatter／歴史上の「approved candidate」はarchive時点の履歴である。現authorityは`historical_candidate`のまま保持する。
- 旧RTG policy/route/UIL/RF0/current 9 scope/trigger enum、coverage receipt、shadow admission gate、metric採用基準を新世代へ持ち込まない。
- formal successor、L3移行、要求stage完了、実装・実行許可、retirementを生成しない。旧source、routing snapshot、採択済みL2/L11、PO判断は変更しない。

機械可読の20行source/line hashes、target pins、行別分類訂正と残差は[JSON監査](rtg-parent-20-condition-crosswalk-audit-2026-09-29.json)を参照。
