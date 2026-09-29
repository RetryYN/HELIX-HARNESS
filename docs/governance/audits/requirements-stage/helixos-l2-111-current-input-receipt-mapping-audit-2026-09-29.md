# HELIXOS-L2-111 三入力receiptの現行mapping調査（2026-09-29）

基準tree: `159cfedcdc3cc9a2fff4fbd6a053cf412c2f2ae0`（2026-09-29時点の`origin/main`）。現行repository evidenceをread-onlyで照合し、HELIXOS-L2-111が参照する三入力receiptについて、現在のexact identity・owner・green status authority・revision/scope mappingを特定できるか記録する。

## 結論

**特定できない。** `#825`と`#1370`の歴史的Issue identity/title/body digestは現行projection inventoryに残るが、いずれも要求authorityではなく、現行receiptとしてのadoption refもない。Document Authority Censusについても現行の結果receipt identityが見つからない。したがって、三つすべてについてcurrent receipt identity、発行owner、greenを主張するstatus authority、対象revision/scope/provenanceのexact mappingは未特定である。

今回見つかった`dac-fr-009-three-receipt-coverage-receipt-2026-09-29.json`は、L2-111のsource atom coverageだけを記録する`candidate_static_scope_only`／`authority_effect: none`の候補receiptであり、三つのoperational input receiptのどれでもない。さらにreceipt内の`current_management_register_sha256`（`4103da51…`）は現行register fileのSHA-256（`ada29e38…`）と一致しない。

## 三入力の照合結果

| 入力役割 | pinできた旧identity | 現行exact receipt / owner / green authority / revision-scope | 結果 |
|---|---|---|---|
| 要求materialization監査 | Issue #825 | identity: 未特定 / owner: 未特定 / status authority: 未特定 / revision-scope: 未特定 | 旧Issue identityはpinできたが、現在のreceipt object、owner、green authority、revision/scope契約、exact adoption mappingは記録されていない。RAMG source familyは旧draft／再採否候補であり、このoperational receiptではない。 |
| startup projection | Issue #1370 | identity: 未特定 / owner: 未特定 / status authority: 未特定 / revision-scope: 未特定 | 旧Issue identityはpinできたが、現在のstartup projection receiptとstatusを生成するowner/revision/scope mappingは記録されていない。AIDOC-OSはより広い候補資料であり、その存在だけではexact output receiptや採択を示さない。 |
| Document Authority Census | 旧DAC-R-011が参照するCensus | identity: 未特定 / owner: 未特定 / status authority: 未特定 / revision-scope: 未特定 | 現行Census結果receiptのidentity、producer、status authority、対象revision/scopeは見つからなかった。DAC-FR-009候補coverage receiptはsource atomのcoverage記録であり、operational Census receiptではない。 |

## 根拠と読み分け

### 旧source・判断史

`LEGACY-ASSET-D201753B1A0CC6EA3980`のDAC-FR-009 line 56は、旧Issue #825 materialization audit、#1370 startup projection、#206旧surface責務をAND接続すると記す。DAC-R-011 line 66は#825、#1370、本Censusの三つが独立receiptを返し、三者すべてgreenのときだけaggregate greenとする。DAC-AC-017 line 42は#825または#1370の片方だけがgreenならCensusを含むaggregateはgreenにしない。現行atomizationはDAC-FR-009 line 56だけをcandidate inputとし、R-011/AC-017はcontext/oracle evidenceとして区別する。#206は第四receiptではない。

現行GitHub投影inventoryは、#825を「要求漏れ・IR未登録・trace孤児の監査」、#1370を「Effective Agent Startup ContractのIR/Workflow/Runtime policyへの収束」として同定し、それぞれのhistoric body digestを記録する。しかしProject 1の`Done`はproject-retirement前の投影status、issue inventoryの`closed/not_planned`はprojection closureである。両recordとも`semantic_disposition: unresolved`、`requirement_authority: false`、`local_adoption_ref: null`なので、現在のgreen receiptやadoptionへ変換できない。

### 現行候補との近接関係

- `requirements-authority-materialization`の旧source familyは、source auditでL1/L12 draftと評価され、L2D-S1-04も再採否待ち。旧#825の名前・旧project statusだけで現行materialization receipt ownerは決まらない。
- `AIDOC-OS-001..008`はAI可読文書のsource/revision/scopeと投影に関する幅広い候補だが、#1370の現行startup projection出力receipt、producer/status authority、target revision/scopeを対応づけない。
- scaffoldの`RUL-FRM-02:115`にはIssue #1370の数字が現れるが、exact-head reviewのprocess-gate参照であり、startup projection receiptやそのstatus根拠ではない。
- Census receiptについて、候補のCoverage Receipt以外に現行結果receipt object/identityや発行ownerを示す該当文書は見つからない。候補の親HELIXOS-L1、owner候補HELIX-OSという記載は入力receiptのowner移管・status authorityを定めない。

これらはexact mappingの代替ではない。三receiptのidentity・revision・scope・provenance・statusを別々に保つL2/L11案は存在するが、receipt内部schema、発行owner、green根拠とcurrent mappingは明示的に未定義である。候補本文はこの未定義を隠さず、Issue番号からcurrent identityを推定しない境界を置いている。

## PO向け選択肢と推奨

**推奨: 採択 — 抽象的な三receipt ANDの意味に限定する。** DAC-FR-009 line 56とDAC-R-011 line 66は三つの別々のreceiptと全件green条件を示し、DAC-AC-017 line 42はCensus抜きではaggregate greenにしない境界を補強する。現行L2/L11候補も三入力の状態・provenanceを保持し、Issue番号だけでcurrent identityやstatusを推定しないと明記している。したがって、current receipt mappingの不在は監査上の実欠落だが、候補が明示的に未確定として保つ範囲であり、抽象的な要求意味の採択を妨げる根拠にはしない。採択しても現行receipt identity・owner・status authorityは生成されず、mapping完了や運用開始を意味しない。三入力が特定されない間、実際のreceiptをgreenと扱ったり、aggregate greenを発行したりする根拠はない。

### #2348 packetの推奨案との関係

先行する[#2348の8候補impact追補](po-decision-packet-live-8-candidates-impact-followup-2026-09-29.md#helixos-l2-111--mpr-rc-helixos-l2-111-001)は、current receipt identity、各receiptのrevision/scope、明示greenのowner/authorityが不明であり、これらがAND各入力の意味を決める必須input contractだとして、採択前にmappingを求める保留を推奨した。この監査は旧推奨を誤りと断定せず、その具体的阻害認識を歴史資料として維持する。

今回の追加照合でも三つのcurrent receipt mappingは見つからず、missing identity自体は解消していない。一方、L2-111/L11-111本文はidentity・revision・scope・provenance・statusを独立に保持し、missing/stale/unknownをgreenにせず、status変換や優先順位も定めない。このcandidate semanticsを採択する判断と、具体receiptを束縛して実際のaggregate statusを運用する判断は分離できる。そこで、この監査では推奨案を「identity未特定を採択の前提条件とせず、抽象AND意味のみを採択」に更新する。更新はPOへの推奨変更であってPO判断の記録ではなく、具体mappingが得られない限り実receiptのgreenやaggregate greenを主張できない点は#2348の阻害認識と一致する。

- **採択（推奨）:** 三receiptが各々明示greenの場合だけaggregate greenとする抽象3入力AND意味を確定する。current receipt identity、owner、revision/scope mappingは生成せず、具体operandが未特定の状態を保持する。実運用に使う段階では現行receiptのexact mappingとstatus根拠が必要になるが、今回それを採択の追加条件にはしない。
- **保留:** POが三receiptの具体identityと既存owner/status authority/revision/scopeを先に対応付けることを、抽象意味の採択にも必要と判断する場合に選ぶ。これは候補本文が明示的に未確定としている情報である。Issue statusや候補coverage receiptをgreenへ読み替えず、175 source holding全体のclosureや新しいformal owner割当は要求しない。
- **不採択:** 三receipt conjunctionをHELIX-OS requirementに加えない。独立するaudit/Censusの既存責務は別に扱い、旧source holdingを維持する。

採択時も、三つのoperational receipt identity、owner、status authority、revision/scope mappingは未特定のまま残る。採択はreceipt発行、実装許可、現在のaggregate statusを意味しない。

## 検索範囲と欠落

読み取り対象は`docs/`、`scaffold/`、該当する旧archive文書。Markdown、JSON、JSONLのファイル名/本文を`#825`、`#1370`、`materialization audit`、`startup projection`、`Effective Agent Startup`、`Document Authority Census receipt`、`DAC-FR-009`で検索した。`docs/governance/decisions/`にこれらを現行receiptへ対応づけるdecision recordは見つからず、`docs/governance/audits/requirement-registration/`の名前・内容検索ではL2-111候補coverage receiptとsource atom setだけが該当した。正確なfile inventory、hashと行pinは[JSON](helixos-l2-111-current-input-receipt-mapping-audit-2026-09-29.json)にある。

Issue inventoryはremote上の現状の再取得ではなく、main内に保存されたretirement時点projectionである。本調査もlive GitHub receiptやruntime statusを確認していない。旧CLI/runtime/test/CIは起動していない。

## Exact pins

- Baseline: `159cfedcdc3cc9a2fff4fbd6a053cf412c2f2ae0`.
- MPR candidate: `636`行 `8fd6f2757862c5307faa28933eebab735697a1609af81c3791f4f8a322ace39a` (row SHA-256); `registered_proposal` / `authority_effect: none`.
- L2 section: `sha256:265d5e7d1a8c06919b21691ddbf15354e51dbc204f310f07a448a7b33dc8173b`; L11 section: `sha256:8efe5d58a4ebe0c4a7078aa7b311f3f2e1a7892b125b603d6a3e45ff4fc5ef14`.
- Current candidate coverage receipt file: `sha256:0893126ccf73b62b1750322a102f2049ef3b6ff51f75b428d832e973302820e1`; its status is `candidate_static_scope_only`, authority effect `none`. Its embedded register digest `sha256:4103da5113303e1db77c1c1c4eb384fae6e1d5ad91e7357592c1f7b3ecc887c3` differs from the current register digest `sha256:ada29e38e99bef16d1c68324129be1519723090cbcc910b50f4c5d47387c626a`.
- Legacy source spans: DAC-FR-009 line 56 (`sha256:881e9a2a…`), DAC-R-011 line 66 (`sha256:2c23e1ba…`), DAC-AC-017 line 42 (`sha256:ae85dc26…`); full digests/asset IDs in JSON.
- Prior #2348 impact follow-up SHA-256: `sha256:52b9fc80a972e59ef838a6000954c0b2d5273e3ccbd934a8ed93cfa3c3ec59b0`; it remains unchanged as historical audit evidence.

## 境界

この記録は照合・PO判断準備だけであり、PO判断、採択、保留登録、棄却、owner移管、receipt発行、実装許可、source holding closure、Stage 6完了を作らない。
