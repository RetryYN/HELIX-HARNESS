# 現行17候補のPO判断準備追補（候補別選択肢と影響）

基準commit: `6e9e91d1a50acfb83ee64795e6ddbd1dfdff2485`（origin/main）。本追補は既存17件worksheetの候補別decision-readinessを補う。PO判断記録ではない。17件のMPR状態は `registered_proposal` / `authority_effect:none` のまま扱い、採択・保留・不採択はいずれも未選択である。

機械可読版: [`po-decision-packet-live-17-options-supplement-2026-09-29.json`](po-decision-packet-live-17-options-supplement-2026-09-29.json)。各行のMPR exact row hash、L2/L11 section・whole-file SHA-256、source receipt SHA-256、source atom refsはJSONに固定した。

## 判断共通ルール

- 採択方向はworksheet上のPO判断案であり、採択状態を生成しない。候補registrationおよび選んだL2/L11 bytesだけを判断対象とし、実装・L3承認・旧source全体の被覆やunrelated holding解消を意味しない。
- 保留は、意味・責務境界・親authorityに実質的な未解決点がある場合に限って方向として示す。source残余の存在またはPO未確認のみを保留理由にしない。
- 不採択はexact candidate revisionのみを対象とし、source holdingのretireやsuccessor割当を自動生成しない。
- 限定atom candidateは、receiptで選択した意味sliceだけを採択し、残余を既存holdingで維持する選択が可能である。この扱いは[HARNESS-L2-063 PO worksheet / PR #2344](https://github.com/RetryYN/HELIX-HARNESS/pull/2344)の3-atom限定採択推奨と整合する。導入版未指定時は[11候補判断](../../decisions/po-decision-2026-09-29-11candidates.md#L42)に従い機能意味のみを選び、1.0を新設しない。

## 候補別の選択肢・方向性

### `HARNESS-L2-049` — `MPR-RC-HARNESS-L2-049-003`

候補意味: prototypeを生成せず、利用許可のある表示可能prototypeをprofile/oracle条件で計測する。

- **採択の影響:** 採択: `-003`と訂正済みL11 oracleの組だけを選ぶ。prototype生成能力・Pattern選択・screen ID発行を追加せず、計測責務を固定する。
- **保留の影響:** このexact corrected measurement candidateを選ばず、旧 -002の処置から結果を継承しない。POに残すのは、現 -003の意味に異論がある場合の具体論点である。
- **不採択の影響:** 不採択: このexact measurement revisionを選ばない。source holdingは維持し、生成機能のsuccessorを自動指定しない。
- **方向性:** 採択を推奨。現行MPR -003と訂正済L11 oracleの計測専用意味に限る。POが選ぶ対象はこのexact revision。旧-002に対する不採択は継承しない。
- **根拠:** 11候補判断は旧 HARNESS-L2-049 -002 / 旧L11 oracleを採択せず、訂正後exact revisionを求めた。現 -003はその訂正済み測定専用oracleで、画面ID・revision・利用許可・profile・測定条件があれば生成工程の証拠なしで計測できる。 選択sourceはVDH-FR-011の一atomであり、prototype生成やPattern選択を含めない。MPR-SH-VDH-O10-001を維持すれば残余は独立して保全される。 [11候補判断](../../decisions/po-decision-2026-09-29-11candidates.md)のexact revision境界に従い、-002の不採択を-003へ自動継承しない。
- **未解決owner/meaning:** この候補の機能/owner境界には保留相当の未解決点を認めない。POは訂正済み exact -003とL11 oracleを選ぶ。旧 -002の判断は別revisionのまま。
- **source/receipt:** `docs/governance/audits/requirement-registration/o10-visual-design-harness-source-lines-2026-09-29.jsonl#candidate_input=true`; `docs/governance/audits/requirement-registration/o10-visual-design-harness-coverage-receipt-2026-09-29-r3.json#HARNESS-L2-049`
- **exact bytes:** L2 `docs/helix-harness/L2-requirements/product-requirements.md#sha256:a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md#HARNESS-L11-049 sha256:f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7

### `HARNESS-L2-055` — `MPR-RC-HARNESS-L2-055-001`

候補意味: HIL-FR-48の隣接layer双方向trace gate結果を報告する。receipt対象外のstale revision/NFR-29/IR条件はholding。

- **採択の影響:** 採択: 選択済みFR-48 gate atomに限って候補意味を選び、残余holdingを解除しない。
- **保留の影響:** この限定HIL-FR-48意味を選ばない。related source holdingは独立して残るが、それ自体を保留理由にはしない。
- **不採択の影響:** 不採択: FR-48候補revisionのみを選ばず、別案やFR-49を代替採択しない。
- **方向性:** 採択を推奨。HIL-FR-48に由来する選択gate意味とこのexact L2/L11だけ。
- **根拠:** 旧HIL-FR-48 line 138と対応assertionから、隣接layerの双方向trace結果・粒度・aggregate等の不成立意味を限定再導出している。 candidate自身が評価アルゴリズム/schemaを下流設計へ残し、OSのledger登録やwriter責務を生成しない。NFR-29/stale/IR条件は別holdingとして維持可能。
- **未解決owner/meaning:** 選択したHARNESS trace意味のowner境界はHARNESS/OS間で明記済み。NFR-29、stale、IR残余はholdingに残り、この限定candidateの阻害条件ではない。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr48-49-gate-source-lines-2026-09-29.jsonl#HARNESS-L2-055`; `docs/governance/audits/requirement-registration/hil-fr48-49-gate-outcome-coverage-receipt-2026-09-29.json`
- **exact bytes:** L2 `docs/helix-harness/L2-requirements/product-requirements.md#sha256:9f1e63176242d81d93a89a0c3823d3fbe689b8ebd0ae0de2f5a786b88e8787b5`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md#HARNESS-L2-055 sha256:f1b9332d75fc5e07158165b0dbb0d037983ab1df0219dc5e519ceef3583aa96a

### `HARNESS-L2-056` — `MPR-RC-HARNESS-L2-056-001`

候補意味: HIL-FR-49の6 canonical V-pairを不可分に扱い、欠落evidence/oracleがあるpairを未完とする。

- **採択の影響:** 採択: 選択FR-49 atomに限る。NFR-29/snapshot/IR条件を採択したことにはしない。
- **保留の影響:** この限定HIL-FR-49 V-pair意味を選ばない。NFR-29/snapshot条件は別holdingとして維持し、本候補の評価対象へ混ぜない。
- **不採択の影響:** 不採択: このpair候補のみを選ばず、FR-48候補へ判断を伝播させない。
- **方向性:** 採択を推奨。6 canonical V-pair別の成立/未完表示とfeedback意味だけ。
- **根拠:** 旧HIL-FR-49 line 139と対応assertionから、6つの既定V-pair単位でoracle/evidenceの成立・欠落を局所表示する意味を導出している。 採択済HARNESS-L2-040のpair catalogを変更せず、実装/schema/保存は下流へ残す。異snapshot/NFR-29/IRはcandidate外で維持できる。
- **未解決owner/meaning:** 選択した6 V-pair受入意味のowner境界はHARNESS/OS間で明記済み。NFR-29、異snapshot、IR残余はholdingに残る。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr48-49-gate-source-lines-2026-09-29.jsonl#HARNESS-L2-056`; `docs/governance/audits/requirement-registration/hil-fr48-49-gate-outcome-coverage-receipt-2026-09-29.json`
- **exact bytes:** L2 `docs/helix-harness/L2-requirements/product-requirements.md#sha256:993283110e6faba06d7811df397179743b22a3f666e8a2e002da91c794eeade0`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md#HARNESS-L2-056 sha256:9a8406bc5c2051eb0bed0bc57571f1e139c856d3559072dee8de3a019111a047

### `HARNESS-L2-057` — `MPR-RC-HARNESS-L2-057-001`

候補意味: HIL-FR-07のHARNESS側gate outcome意味とclose適格条件を定める。

- **採択の影響:** 採択: HARNESS gate意味/close適格条件のみを選び、OS handoff運転は別判断に残す。
- **保留の影響:** HARNESS closure-gate selected meaningを選ばず、OS-054の運転責務も推定しない。POが8 selected conditions自体に具体的異論を持つ場合に保留する。
- **不採択の影響:** 不採択: このHARNESS gate候補だけを選ばず、OS-054の処分も推定しない。
- **方向性:** 採択を推奨し、OS-054と依存するclosure handoffを別候補として同時に選ぶ案。HARNESS gate semanticsとOS運転を分離する。
- **根拠:** 旧HIL-FR-07 line 97のclosure gate入力をHARNESS所有の意味/oracleへ分け、指定scopeと対象revisionでのみ評価する。 候補本文はmemory compactionを未判定holdingとして表示しつつ、それを理由に今回の選択条件評価を停止しない。OS-054がclosure receipt/close運転を別ownerとして担う。
- **未解決owner/meaning:** 選択したclosure gate meaningはHARNESS、証拠/close運転はOS。memory compaction atomは未判定holdingとして候補内に明示され、selected conditionsの意味を未解決にしない。OS-054は別候補として併せて選ぶ。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr07-closure-source-lines-2026-09-29.jsonl#HARNESS-L2-057`; `docs/governance/audits/requirement-registration/hil-fr07-closure-coverage-receipt-2026-09-29.json`
- **exact bytes:** L2 `docs/helix-harness/L2-requirements/product-requirements.md#sha256:2c487f5408d31f0f982ab210be3df4d1d824bd75169b96bd1321cb0edd2a23ac`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md#HARNESS-L2-057 sha256:8cc4692c5b2eb356809f30b47a3addb9206c0c4e0f4c11d9f505426cf7fe83e1

### `HARNESS-L2-058` — `MPR-RC-HARNESS-L2-058-002`

候補意味: PR findingを6区分に分類し、current/successor scopeを判定する。accepted_risk条件はOS-034 `-003`に連動。

- **採択の影響:** 採択: 6分類をexact revisionで選択し、accepted_riskをOS-034 `-003`のaction-binding receipt要件に揃える。
- **保留の影響:** finding分類意味を選ばず、OS-034 Bを選ばない場合は058/101 accepted_risk条件を合わせて現状維持または修正する。
- **不採択の影響:** 不採択: この分類revisionを選ばず、旧directive-disposition holdingは別途維持する。
- **方向性:** OS-034 -003およびOS-101 -002と一体で採択を推奨。accepted_risk条件をaction-binding PO receipt＋独立reviewに揃える。
- **根拠:** 旧HIL-FR-09 line 99の六分類・current/successor境界と旧L5 §3/L4 §4.2/HIL-NFR-21の証拠条件に対応し、accepted_riskをaction-binding PO receiptと独立reviewへ束縛する。 現HARNESS-058 / HELIXOS-101 correction_reasonはOS-034 -003と同じexact PO選択を要求する。三候補を一体選択すればclassification meaning・evidence receipt・directive dispositionの境界が整合する。余分な旧FR09/IR条件は保持される。
- **未解決owner/meaning:** 候補内meaningは定義済み。POの判断はOS-034 -003 BとOS-101 -002を含むbundleで行い、accepted_risk conditionを他2候補から切り離さない。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr09-disposition-source-atoms-2026-09-29.jsonl#HARNESS-L2-058`; `docs/governance/audits/requirement-registration/hil-fr09-disposition-coverage-receipt-2026-09-29-r3.json`
- **exact bytes:** L2 `docs/helix-harness/L2-requirements/product-requirements.md#sha256:c50e2183bb1186bb585fbb80b924d628be74aaaf363515f047c74ef906d71bc3`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md#HARNESS-L2-058 sha256:5dfc18281d1ab48e2d0cf81d4c9cfb6f3d7f035a38a5955cfcedc33d0f1875c9

### `HARNESS-L2-059` — `MPR-RC-HARNESS-L2-059-001`

候補意味: 11-field Issue contract意味と欠落時扱いをHARNESS側で定義する。

- **採択の影響:** 採択: 11-field意味をHARNESS所有として選び、OS-102との接続互換性を個別に確認する。
- **保留の影響:** 11-field contract意味を選ばず、OS-102側の保存がfield意味/requirednessを生成しないまま保持する。
- **不採択の影響:** 不採択: このcontract revisionを選ばず、OS-102からfield意味を推定しない。
- **方向性:** OS-102と一体で採択を推奨。HARNESSが11-field意味を所有し、OSは同一contract revision/digestの接続だけを担う。
- **根拠:** 旧HIL-FR-03 line 93は11意味fieldの別個存在とversioned contract＋digest出力を起点とし、個別field omissionを受入oracleとしている。 HARNESSがfield meaningを所有し、OS-102は同じcontract revision/digestを保持するだけという候補境界が明記されている。schema encoding等の詳細と他IR条件はholdingに残せる。
- **未解決owner/meaning:** field presence/meaningとrequirednessはHARNESS所有として定義済み。schema/value encodingは意味の未決でなく候補外の下流設計。durable handoffはOS-102と対で選ぶ。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr03-issue-contract-source-lines-2026-09-29.jsonl#FR03-ISSUE-CONTRACT-FIELDS-L0093`; `docs/governance/audits/requirement-registration/hil-fr03-issue-contract-coverage-receipt-2026-09-29.json#HARNESS-L2-059`
- **exact bytes:** L2 `docs/helix-harness/L2-requirements/product-requirements.md#sha256:9ebafbcc5b738dbaccaa53bfaff0b5843b0dd5fba30cc68beb51fe1dbe2e267f`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md#HARNESS-L11-059 sha256:830646bc2f5bafcce50d20c88fb3d657ad7f5e2353dcf148628151a7c0992198

### `HARNESS-L2-060` — `MPR-RC-HARNESS-L2-060-001`

候補意味: 工程入力commit/tree revisionとscopeをstage evidenceへ結び、別revision evidenceを読めないようにする。

- **採択の影響:** 採択: 適用契約で確定したstageの入力revision結合に限定する。全工程の順序/predecessor receipt義務を付加しない。
- **保留の影響:** 保留: #2316で報告されたA/B意味のどちらかを正式確認するまで保持。
- **不採択の影響:** 不採択: この入力結合候補のみ選ばず、OS-103のevent/projection意味へ判断を伝播しない。
- **方向性:** 保留を推奨。保留根拠は残余IRではなく、worksheetが報告するA/B（適用契約で確定したstageのみ／旧工程列・predecessor receiptを全対象へ要求）の入力stage意味が未選択であること。
- **根拠:** 旧HIL-FR-01 line 91の入力commit/tree revision結合atomを選び、candidate自身は既存適用契約が定めるstageだけに意味を限定している。 一方でworksheetが#2316由来としてA/B二案を報告し、普遍stage列とpredecessor receipt義務を導入する意味変更を明示する。一次issueと選択結果がrepo内で検証されていないため保留する。
- **未解決owner/meaning:** POがA/Bどちらのinput-stage contractを選ぶか。#2316一次本文/decision状態は本repoで検証されていないので選択肢を推測しない。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr01-harness-source-atoms-2026-09-29.jsonl`; `docs/governance/audits/requirement-registration/hil-fr01-path-coverage-receipt-2026-09-29.json#HARNESS-L2-060`
- **exact bytes:** L2 `docs/helix-harness/L2-requirements/product-requirements.md#sha256:d4f0419f2095828ac041a28ca906f45d4dd79b5bfa83000097111f5d13235c30`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md#HARNESS-L11-060 sha256:d4714dd28d70de6e7bc4a1c8ca4fe18784d825507ebd019ee2c6c716306b35b5

### `HARNESS-L2-061` — `MPR-RC-HARNESS-L2-061-001`

候補意味: 文書のみのread-only quality reviewの起動条件、4観点、未起動時fail-closed、記録付きPO例外を定める。

- **採択の影響:** 採択: この限定review責務を選び、既存review routingとの相互作用を確認する。
- **保留の影響:** 保留: PO例外の意味、4観点/起動条件の十分性、専用triggerを既存reviewへ重ねる条件が決まるまで保持。
- **不採択の影響:** 不採択: この専用candidate revisionを選ばず、一般のexact-head review運用を変えない。
- **方向性:** 保留を推奨。専用doc-only trigger、4 review軸、fail-closed、PO例外を現行exact-head review routingへ加える意味は既存監査sourceから自動的に決まらない。
- **根拠:** 旧BR-08 line 48とFR-L1-45 line 76からdoc-only review trigger、4観点、fail-closed、PO例外をcandidateとして導出している。 関連監査は現在のexact-head reviewを維持し新しいdedicated gateを自動追加しない方針を示す。candidate専用triggerの既存routingへの意味/責務境界をPOが確定する必要がある。
- **未解決owner/meaning:** POが専用trigger/4観点/PO例外の意味を選ぶか、既存review契約内の責務として扱うか。記録された既存review保持のsource recommendationを越えて推測しない。
- **source/receipt:** `docs/governance/audits/requirement-registration/doc-quality-review-source-lines-2026-09-29.jsonl`; `docs/governance/audits/requirement-registration/doc-quality-review-coverage-receipt-2026-09-29.json#BR08-FR45-DOC-REVIEW-COVERAGE-2026-09-29`
- **exact bytes:** L2 `docs/helix-harness/L2-requirements/product-requirements.md#sha256:c44ffb80fec07ed6c0fe68e95bbd68358d87632b28d77caad96d28f231badb1a`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md#HARNESS-L2-061 sha256:2323039d4fce66098d165d290c7bba20eadd59a86ff1f28069115ae45c82919a

### `HELIXLABO-L2-070` — `MPR-RC-HELIXLABO-L2-070-001`

候補意味: 補助telemetry scorecardに待ち時間、escaped defects、rollback/recovery、observer overhead、freshnessを示し限定metricを併記。

- **採択の影響:** 採択: 9 selected atomsだけをscope付きscorecardにし、既採択LABO候補を置換しない。
- **保留の影響:** 9 selected telemetry atomsをscorecard意味として選ばない。既存指標は維持し、特定のmetric負担/意味への異論がある場合に該当する項目を特定する。
- **不採択の影響:** 不採択: このscorecard revisionだけを選ばず、残る意味未解決atomも自動retireしない。
- **方向性:** 限定機能意味の採択を推奨。version_target 1.0を含む現行exact candidateで、選択9 measurement atomsのscorecardに限る。
- **根拠:** 旧execution-ticket-requirements.md line 399のうちreceiptで特定された9 measurement atomsだけを選択し、各値をscope/source/receipt付き観測として定義する。 candidateはthreshold、採否、rollback操作、計測許可を新設せず、既存LABO指標を置換しない。unresolved coverage/旧指標relation atomsは明示してholdingに残せる。
- **未解決owner/meaning:** 選択metric群のscope/unknown動作/責務は候補に記載済み。既存LABO指標を置換せず、未選択coverage atomsもholdingに残す。計測負担を受け入れるかがPOの実質choice。
- **source/receipt:** `docs/governance/audits/requirement-registration/labo-supplemental-telemetry-coverage-receipt-2026-09-29.json#HELIXLABO-L2-070`; `docs/governance/audits/requirement-registration/labo-supplemental-telemetry-coverage-receipt-2026-09-29.json`
- **exact bytes:** L2 `docs/helix-labo/L2-requirements/labo-requirements.md#sha256:07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`; L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md#HELIXLABO-L2-070 sha256:c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1

### `HELIXOS-L2-034` — `MPR-RC-HELIXOS-L2-034-003`

候補意味: 指示/finding処分証拠を保持し、`-003`はaccepted_riskに独立reviewとaction-binding PO receiptを要求。

- **採択の影響:** 採択(B): exact `-003`とHARNESS-058/OS-101条件を同時に選ぶ。独立review+action-binding receiptを要求し人の確認負担を増す。
- **保留の影響:** 現 -003/Bを選ばず、既存採択 -002の意味を維持する。HARNESS-058/OS-101のaccepted_risk条件もその状態と整合させる。
- **不採択の影響:** 不採択(A): exact `-003`を選ばず`-002`意味を維持。`-003`だけの不採択でsource holdingや関連候補を処分しない。
- **方向性:** HARNESS-058 -002 / HELIXOS-101 -002と併せて現 -003のB採択を推奨。旧L5 §3/L4 §4.2/NFR-21のaccepted_risk根拠をaction-binding receiptへ反映する。これは判断案でありPO決定ではない。
- **根拠:** 旧L5 §3, L4 §4.2, HIL-NFR-21のfinding accepted_risk条件から、独立reviewとaction-binding PO receiptを要求する現 -003のBを既存worksheetが明示推奨している。 この機能意味は、HARNESS-058の分類oracleとOS-101のevidence/appeal receiptに同じaccepted_risk条件を適用する必要がある。三候補を同時にexact revisionで選ぶ案として提示する。directive source residualはMPR-SH-DIRECTIVE-DISPOSITION-002のまま保持。
- **未解決owner/meaning:** Bのmeaningは旧sourceと既存worksheetで方向付けられている。POはBをHARNESS-058 -002 / OS-101 -002と同時に選ぶか、現行採択 -002を保つかを決める。
- **source/receipt:** `docs/governance/audits/requirement-registration/os-directive-disposition-coverage-receipt-2026-09-28-r2.json#HELIXOS-L2-034`; `docs/governance/audits/requirement-registration/os-directive-disposition-coverage-receipt-2026-09-28-r3.json`
- **exact bytes:** L2 `docs/helix-os/L2-requirements/governance-requirements.md#sha256:6b019294047fce2e1c8b5d1b5e8d379fa9111f5912274f6dca918ffd81c0e1e8`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L2-034 sha256:b89f63d709b38de1ddc8b7ca7d51de595b9cae587da320e027aefed67a3a4e4b

### `HELIXOS-L2-054` — `MPR-RC-HELIXOS-L2-054-001`

候補意味: OS側でclosure evidence参照を照合し、PR/CI/audit/merge方式/child Issue/closure receiptのclose handoffを運転する。

- **採択の影響:** 採択: OS handoff運転のみ選び、HARNESS-057のgate意味・merge admissionを代替しない。
- **保留の影響:** 限定OS closure-evidence handoffを選ばない。HARNESS-057のgate meaning/close eligibilityからOSの運転を推定しない。
- **不採択の影響:** 不採択: OS handoff候補だけを選ばず、HARNESS gate判断を代替しない。
- **方向性:** HARNESS-057と併せた限定採択を推奨。OSは既存 closure evidenceを照合しhandoffを運転し、HARNESS gate meaning/close eligibilityは定義しない。
- **根拠:** 旧HIL-FR-07 line 97の選択OS運転/evidence spansをclosure receipt照合・close handoffへ割り当てる。 HARNESS-057が意味/oracle、OS-054が証拠参照と運転を担う分割はcandidate本文とsource receiptに一致し、どちらかが他方やmerge admissionを代替しない。memory atomは別holdingとして残せる。
- **未解決owner/meaning:** HARNESS-057が意味/oracle、OS-054が証拠照合/運転という責務分割は定義済み。依存候補HARNESS-057と一体で選ぶ。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr07-closure-source-lines-2026-09-29.jsonl#HELIXOS-L2-054`; `docs/governance/audits/requirement-registration/hil-fr07-closure-coverage-receipt-2026-09-29.json`
- **exact bytes:** L2 `docs/helix-os/L2-requirements/governance-requirements.md#sha256:a9c1561ab310399fa27d5aca8bd9ebca8264176516357470157526df8c297eef`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L2-054 sha256:1021d37a8c3a94113c94aa1b92d3e8a79ae758f274aa40b570b5d151f7233aac

### `HELIXOS-L2-055` — `MPR-RC-HELIXOS-L2-055-001`

候補意味: 実装開始前のready Issue claim/leaseと工程・authority照合結果を記録する。

- **採択の影響:** 採択: claim/lease/output atomに限定し、保留中のuniform reverse/redesign/pair-freeze gateを追加しない。
- **保留の影響:** 保留: claim適用範囲と既存authority/gate条件の再利用関係が決まるまで保持。
- **不採択の影響:** 不採択: このclaim/lease候補revisionだけを選ばず、旧FR-08全体を閉じない。
- **方向性:** 保留を推奨。単なる旧source残余でなく、このcandidateが旧一律gateを適用stage限定へ狭めるmeaning deltaを含む。source receiptは旧一律gate atomを別holdingに明記する。
- **根拠:** 旧HIL-FR-08からready Issue claimとclaim lease/blocked outputのselected spansだけを切り出している。 ただしcandidateは旧sourceの一律Reverse/Redesign/pair-freeze条件を「適用契約で確定したstage」に狭めており、MPRもこの意味差をsource holdingへ明記する。これは単なる未解決残差でなく、claim eligibility意味の実質変更に当たるため、scopeのどちらを選ぶかをPO判断へ残す。
- **未解決owner/meaning:** POがこのscope delta自体を選ぶのか、old uniform reverse/redesign/pair-freeze conditionを維持するのか。選ばれた側をexactly記録する。
- **source/receipt:** `docs/governance/audits/requirement-registration/helixos-fr08-ready-claim-source-lines-2026-09-29.jsonl`; `docs/governance/audits/requirement-registration/helixos-fr08-ready-claim-coverage-receipt-2026-09-29.json`
- **exact bytes:** L2 `docs/helix-os/L2-requirements/governance-requirements.md#sha256:6d23a405ce2c0c6d56a65a4b02d9c39ead8533db3064058dcd7027b641fb9052`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L11-055 sha256:6bc639b45df952b7cf6cb7433ba3e2bfad978265681ac4ef0fbf03bdc4eb33a2

### `HELIXOS-L2-101` — `MPR-RC-HELIXOS-L2-101-002`

候補意味: HARNESS finding意味を裁定せず、PR disposition receiptを永続化してappealを証拠へ連結する。accepted_riskはOS-034 `-003`と結合。

- **採択の影響:** 採択: receipt/appeal接続を選択し、accepted_risk条件はOS-034 `-003`と一体化する。
- **保留の影響:** このOS evidence/appeal receipt意味を選ばない。034/058が採択される場合のaccepted_risk表示を未解決にしないよう、同じbundleの選択を保留する。
- **不採択の影響:** 不採択: このOS evidence/appeal revisionのみを選ばず、HARNESS意味判断をOSへ移さない。
- **方向性:** HELIXOS-034 -003およびHARNESS-058 -002と一体で採択を推奨。OSはreceipt/appeal evidenceを保持し、finding meaningはHARNESS所有。
- **根拠:** 旧HIL-FR-09 line 99とL5/L4/NFR-21証拠条件に対応したOS receipt/appeal参照だけを担い、HARNESSの分類oracleを所有しない。 accepted_risk用receipt条件はOS-034 -003とHARNESS-058 -002の同一PO判断に明示的に依存するため、三候補を一体で選択する案とする。
- **未解決owner/meaning:** receipt/appealのOS責務は定義済み。accepted_risk条件のみOS-034 -003 / HARNESS-058 -002と同じPO選択に束縛され、独立選択しない。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr09-disposition-source-atoms-2026-09-29.jsonl#HELIXOS-L2-101`; `docs/governance/audits/requirement-registration/hil-fr09-disposition-coverage-receipt-2026-09-29-r3.json`
- **exact bytes:** L2 `docs/helix-os/L2-requirements/governance-requirements.md#sha256:03ee1bbc860f879b9362eccc024f1cfa056b8cc3e364c16b4683ed18fe9598b5`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L2-101 sha256:bea9231cf52c1491768397621ecb9fd42f54f07b3eb323a3cfaa68aff08d818a

### `HELIXOS-L2-102` — `MPR-RC-HELIXOS-L2-102-001`

候補意味: source identity、11-field表現、contract revision/digestを保持し、HARNESS contractをdurableにintake/projection/handoffする。

- **採択の影響:** 採択: durable接続責務に限定し、field意味はHARNESS-059に従属させる。
- **保留の影響:** このOS durable handoffを選ばない。HARNESS-059意味とOS接続責務を別状態で保持する。
- **不採択の影響:** 不採択: 接続候補だけを選ばず、HARNESS-059の意味を代替しない。
- **方向性:** HARNESS-059と一体で限定採択を推奨。same-source/contract revision/field identity/digestのdurable intake/projection/handoffに限る。
- **根拠:** 旧HIL-FR-03 line 93のversioned contract＋digest出力spanを、同一identity/revision/digestのdurable intake/projection/handoffへ限定再導出する。 HARNESS-059が11-field意味を所有し、OS-102が保存/接続する分離は明記済み。両exact candidateを同時に選ぶ場合、OSが意味を拡張しない明確な契約となる。
- **未解決owner/meaning:** OSはHARNESS field meaningを改変せずexact revision/digestを運ぶ。候補境界はHARNESS-059と同時選択で成立する。schema詳細は下流設計に残す。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr03-issue-contract-source-lines-2026-09-29.jsonl#FR03-VERSIONED-CONTRACT-DIGEST-OUTPUT-L0093`; `docs/governance/audits/requirement-registration/hil-fr03-issue-contract-coverage-receipt-2026-09-29.json#HELIXOS-L2-102`
- **exact bytes:** L2 `docs/helix-os/L2-requirements/governance-requirements.md#sha256:5d020c09b0e5686e01876e3c52d2ce10e8aded44a799a9f6374542d31de31218`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L11-102 sha256:0bfce78875f0e59ded0a2f2ecd31f39e795e043105d33c762d38e15251ea8459

### `HELIXOS-L2-103` — `MPR-RC-HELIXOS-L2-103-001`

候補意味: exact scope/revisionに対するappend-only stage event、current projection、parent/cause lineageを相互参照可能にする。

- **採択の影響:** 採択: event/projection/lineage接続のみを選び、HARNESS-060で決まるstage入力意味に従う。
- **保留の影響:** 保留: HARNESS-060入力scopeと#2316 A/Bが未解決のため保持。
- **不採択の影響:** 不採択: OS event/projection候補のみを選ばず、stage順序やpredecessor条件を決めない。
- **方向性:** 保留を推奨。上流のHARNESS-060入力stage scopeのA/Bと一次根拠が未解決で、どのstage event/outputを記録するかが確定しない。
- **根拠:** 旧HIL-FR-01からappend-only event/current-state/parent-cause outputを選択し、fixed legacy stage schema/sequenceを移さない。 ただし入力stage scopeを担うHARNESS-060の#2316 A/Bはworksheetの二次報告で、一次issue本文と選択状態を確認できない。OS event/output contractはどちらの入力意味を記録するかに依存するためholdする。
- **未解決owner/meaning:** HARNESS-060のstage input meaningをPOが確定した後、OS-103でevent/projection/parent-cause outputのみ判断する。#2316 choice/resultはrepo内で未検証。
- **source/receipt:** `docs/governance/audits/requirement-registration/hil-fr01-os-source-atoms-2026-09-29.jsonl`; `docs/governance/audits/requirement-registration/hil-fr01-path-coverage-receipt-2026-09-29.json#HELIXOS-L2-103`
- **exact bytes:** L2 `docs/helix-os/L2-requirements/governance-requirements.md#sha256:6115a7190bad6a5ff449574a3150116dcdcd31e69f70e6a5b1625a59e171c7dc`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L11-103 sha256:b9d2360893edeb64152899f8a8bf71afa3ab3d9ec387300c8358885dfca823a0

### `HELIXOS-L2-104` — `MPR-RC-HELIXOS-L2-104-001`

候補意味: SECURITY authority、worker-isolation観測、HARNESS quality acceptanceの3 owner結果をoperation/scope/revisionに連結する。

- **採択の影響:** 採択: 親L1 exact revision authorityを別途確認後、3 owner結果の連結だけを選ぶ。新gate/deny authorityは加えない。
- **保留の影響:** 保留: `draft_candidate; exact parent approval not claimed`の親planning revisionを確認するまで保持。
- **不採択の影響:** 不採択: この候補revisionを選ばず、既存owner contractに代わる権限を生成しない。
- **方向性:** 保留を推奨。candidate MPR自身が親L1を `draft_candidate; exact parent approval not claimed` としており、親authorityが成立した根拠がない。
- **根拠:** 旧Concept crosswalk line 14の一atomから、SECURITY/Worker/HARNESS各owner結果を代用せず関連付ける管理接続を導出している。 registerのparent_planning_revisionが `draft_candidate; exact parent approval not claimed` と明示している。候補の親authorityが明確になるまで採択推奨は出さない。
- **未解決owner/meaning:** OS L1 owner/POが対象parent L1のexact revision authorityを確認すること。旧crosswalk残差は保留根拠ではない。
- **source/receipt:** `docs/governance/audits/requirement-registration/legacy-candidate-line-000603-source-atoms-2026-09-29.jsonl#LEGACY-CAND-LINE-000603`; `docs/governance/audits/requirement-registration/legacy-candidate-line-000603-three-checks-coverage-receipt-2026-09-29.json#HELIXOS-L2-104`
- **exact bytes:** L2 `docs/helix-os/L2-requirements/governance-requirements.md#sha256:a6346a95c796b0d1c2e72e5f24e150767ced6329b9f6137a9547370e82ad502d`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L11-104 sha256:b899b8da8d4bb85c5972b7e116e2f3837e61dd20a337018baeadb2a2a5dfe90f

### `HELIXOS-L2-105` — `MPR-RC-HELIXOS-L2-105-001`

候補意味: 限定incident episodeのrecovery-check/source revisionをprocedure/rollback記録へ結び、rollback未実施も明示。記録充足だけを報告。

- **採択の影響:** 採択: 2選択atomと限定episode記録責務だけを選ぶ。incident close/health/release authorityは含めない。
- **保留の影響:** 二つのPHCAP-17 episode evidence relationを選ばない。既存incident/recovery owner手順は変更せず、record completenessからclose/releaseを生成しない。
- **不採択の影響:** 不採択: このexact episode candidateを選ばず、PHCAP17 holdingやHIL-FR-16を自動retireしない。
- **方向性:** 限定機能意味の採択を推奨。現行2 source spansに基づくsame-incident recovery evidence correlation / record completenessだけで、incident close/health/release/authorityを含めない。
- **根拠:** 旧PHCAP-17 incident.md line 43の回復確認とprocedure/rollback記録spanのみを、同一incident episodeの証拠関係へ限定再導出している。 OSは証拠の対応と記録上の充足だけを報告し、回復oracle、incident close、health、release、追加承認を作らない。PHCAP17残余とHIL-FR-16をholdingに残して機能意味だけを選べる。
- **未解決owner/meaning:** 記録上のepisode evidence correlationだけを対象にし、既存incident identity/owner oracleを使用する。incident close/release/approvalは範囲外で、候補内のowner境界に未解決点なし。
- **source/receipt:** `docs/governance/audits/requirement-registration/phcap17-incident-episode-source-lines-2026-09-29.jsonl`; `docs/governance/audits/requirement-registration/phcap17-incident-episode-coverage-receipt-2026-09-29.json`
- **exact bytes:** L2 `docs/helix-os/L2-requirements/governance-requirements.md#sha256:81e6de13e8876410f69cf586f8aba014765864664d11ec68305d0fede366ad4c`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L11-105 sha256:5d075dc35360a2fe87839d2bb2acba4bdee6e6295fdcdbc6e64b60a85a5fcef2

## 依存候補の同時判断

- **HARNESS-057 + OS-054:** 採択を推奨する場合、HARNESSのgate意味/oracleとOSのreceipt照合/close運転を別責務のexact candidateとして併せて選ぶ。
- **OS-034 -003 + HARNESS-058 -002 + OS-101 -002:** 既存のsource-based B推奨に沿い、accepted_riskをaction-binding PO receiptと独立reviewへ揃える3候補の同時採択案。POがBを選ばない場合は旧-002の意味を維持し、058/101の条件を034から切り離さない。
- **HARNESS-059 + OS-102:** HARNESSの11-field contract意味とOSの同一revision/digest接続を、ownerを保って同時選択する案。

## 不確実性・authority状態

- HARNESS-060 / HELIXOS-103のA/Bは元17件worksheetがIssue #2316で提示済みと報告する選択肢。本repositoryからIssue一次本文/選択結果は検証できず、選択済みとは扱わない。入力stageの意味と下流event projectionのつながりが未確定なので両者は保留方向とした。
- HARNESS-061は専用doc-only trigger、4軸、未起動時fail-closed、PO例外の意味を現行exact-head review routingへ適用する点が未解決。`confirmed175-three-condition-meaning-delta-2026-09-28.md:31-41`は現行reviewを保ち新gateを自動追加しない根拠であり、この専用triggerの採択推奨には使わない。
- HELIXOS-055は旧HIL-FR-08の一律Reverse/Redesign/pair-freeze条件から、適用stageが確定した場合に限るclaim条件へmeaningを狭める候補。旧uniform gateは登録上holdingに保たれているが、その選択意味変更は別途PO判断が必要である。
- HELIXOS-104の登録は親planning revisionを`draft_candidate; exact parent approval not claimed`と記録する。親authority確認前は保留方向とした。
- HARNESS-049の現 -003は訂正済みのL11 measurement oracle。旧 -002に対する不採択記録を継承せず、exact -003を今回POが判断する。
- すべての方向性はPO decisionではなく、本JSONの`po_decision`はnullのまま。

## 固定した一次参照

- MPR register: `docs/governance/management-provisional-requirement-register.jsonl` SHA-256 `ada29e38e99bef16d1c68324129be1519723090cbcc910b50f4c5d47387c626a`
- 元17件worksheet: `docs/governance/audits/requirements-stage/po-decision-packet-live-17-candidates-2026-09-29.md` SHA-256 `507858288483e5fafed5fe50c7a96986b9057b0430bd6171eec5f52a7166d018`
- 候補別source atom set、receipt、L2/L11 file pins、registration row pins: 同梱JSONの各candidate record。
