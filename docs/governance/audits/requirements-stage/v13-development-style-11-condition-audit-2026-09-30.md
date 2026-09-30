# v1.3 §4 development-style/Discovery route 11-condition audit

基準main/作成時点: `a3d9f7e205a3d766280c9de4936551f0fef16143`。旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:73-90`、file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、asset `LEGACY-ASSET-02319C2481B9E01698D5`。

## 範囲と除外

対象は下記11個のsource-qualified condition identityだけ。queue上で全件`primary_residual`、`unresolved_for_closure_work`、既存個別監査ref 0件を確認した。identityは旧source path、file SHA-256、物理行、line SHA-256を含むtupleで照合した。

除外: #2411 §6の17件（REQSRC-SUP-00398, REQSRC-SUP-00399, REQSRC-SUP-00400, REQSRC-SUP-00403, REQSRC-SUP-00404, REQSRC-SUP-00405, REQSRC-SUP-00407, REQSRC-SUP-00409, REQSRC-SUP-00410, REQSRC-SUP-00411, REQSRC-SUP-00414, REQSRC-SUP-00418, REQSRC-SUP-00421, REQSRC-SUP-00424, REQSRC-SUP-00430, REQSRC-SUP-00431, REQSRC-SUP-00432）、#2413 §2の12件（REQSRC-SUP-00034, REQSRC-SUP-00035, REQSRC-SUP-00036, REQSRC-SUP-00037, REQSRC-SUP-00038, REQSRC-SUP-00039, REQSRC-SUP-00040, REQSRC-SUP-00041, REQSRC-SUP-00042, REQSRC-SUP-00043, REQSRC-SUP-00044, REQSRC-SUP-00045）、およびqueue上で既存個別監査refがあるID全件。

## 旧consumer・現行比較・判断scope

- 旧consumer: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:25-28,80`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:44,46`（FR-L1-13/15）、`archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-requirement-definition-ledger.md:65`（HIL-BR-28）。旧v1.3 lines 287–288にHR-FR-HYB-003/HR-AC-HYB-003がある。
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2-001/L11-001はL1–L12・6 pair、L2-002/L11-002はstyle、L2-003/L11-003は工程/差戻し境界を照合。file/line pinsはJSONに記録した。
- 57件decision: L2-040はledger構造だけ。L2-046/L11-046の採択pair、L2/L11 file SHA・section digest、decision row hashをJSONへ固定した。L2-046にはFull Vを選択したscopeのworkflow freeze/pair枝と、Production Scrumを選択したscopeのslice-delta/backfill/SR4枝がある。後者は許可された方式合成内でScrumを実際に適用する部分にも限定して関係するが、合成全体や新Hybrid全体へ外挿しない。追加11件decisionにも選択source identityへのsuccessor指定はない。
- 旧Hybridから現行Hybridへの意味差は、[2026-09-25 PO判断](../../decisions/po-optimal-draft-po-decisions-2026-09-25.md)の行51/54/64でpinした。保持点・変更点・理由とline digestはJSONに記録した。
- current main `a3d9f7e205a3d766280c9de4936551f0fef16143` のqueue、#2413 audit SHA、pair bytes/line pinsをread-after inputとして更新した。f6固定pairと318ec4/5aa100 decision/pair revision pinsは保持した。
- 11行すべて`partial`。formal successor 0、source closureなし、実装/受入完了なし、authority effectなし。

## 条件別照合

### REQSRC-SUP-00055 — FULL_L1_L12_V適用条件

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:73`; line SHA-256 `sha256:7f500077383219412d8731e6d990e10bad8107ece5779cdf7ed46e2f74721f31`.
- 原文: | `FULL_L1_L12_V` | 本格system、高リスク、複数境界、規制、未知または分類衝突 | L1〜L12を完全実施 |
- 意味: FULL_L1_L12_Vを高リスク・複数境界・規制・未知または分類衝突向けstyleとし、L1〜L12を実施する。
- 保持点: 固定L2-001/L11-001は現行L1–L12と6 pairを定義し、L2-002はV-modelを選択可能方式に含める。後発L2-046/L11-046はFull V workflow freeze/pair契約を採択した。
- 数値・例外: L1〜L12の12層。高リスク等の数値閾値は旧sourceにもない。
- 反例: L2-046適用だけで案件の規制/高リスク判定や全層実施を済みとする。
- 未解消残差: 適用条件の閾値・例外oracleはfixed pairにない。L2-046のFull V枝はFull V選択scopeだけで、案件判定や全層受入を閉じない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00056 — PRODUCTION_SCRUM適用とslice条件

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:74`; line SHA-256 `sha256:6cc5bb17907b5caef32dd1529b6198f7bcffc86bcae8c5d7f0e1de9357dbf662`.
- 原文: | `PRODUCTION_SCRUM` | 小規模、継続成長、高feedback、段階release、境界既知 | L3 freeze後に要件単位でslice化し、各sliceの正規L4/L5設計、実装、V-pair evidenceを閉じる |
- 意味: PRODUCTION_SCRUMを小規模・継続成長・高feedback・段階release・境界既知に適用し、L3 freeze後に要件slice化し、各sliceのL4/L5設計とV-pair evidenceを閉じる。
- 保持点: 固定L2-002/L11-002はScrumを選択可能方式に含め、L1–L3、人の要件承認、V-pair/品質条件を保つ。L2-003/L11-003は工程・差戻し条件を扱う。
- 数値・例外: L3後slice化。slice数・size・release cadenceは数値化なし。
- 反例: L3承認前にslice実装を始める、または複数sliceの合算を個別slice evidenceとする。
- 保持する後発近接: 採択HARNESS-L2-046/L11-046はFull V枝とは別に、Production Scrum選択scopeのslice-delta、Scrum Reverseによるworkflow/設計資産へのbackfill、およびSR4 pair-freeze前のrelease-ready禁止を定める。許可された方式合成では、そのscopeでScrumを実際に適用する部分に限りこの枝が関係する。これは旧source行を後継化しない。
- 未解消残差: 適格性oracle、L3 freeze後の要件単位sliceの最小性、各slice固有の正規L4/L5設計とV-pair evidenceを同一source-row条件として結ぶ方法は固定pairおよびL2-046で未確認。L2-046のScrum枝を合成全体へ外挿せず、旧各sliceのL4/L5/V-pair evidence条件と同じ扱いにしない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00057 — V_DESIGN_SCRUM_IMPLEMENTATION適用とslice条件

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:75`; line SHA-256 `sha256:d96b88cd63bed3b1630563b73360f7d53f86531c80c2280b4e067befabc788a6`.
- 原文: | `V_DESIGN_SCRUM_IMPLEMENTATION` | 大規模・複雑だが段階releaseが適し、system境界を先に固定できる | L1〜L5を凍結後にL6以降をslice実装し、release candidateごとに全V-pairへ再収束する |
- 意味: V_DESIGN_SCRUM_IMPLEMENTATIONを大規模・複雑・段階release適合・先行してsystem境界を固定可能な対象に適用し、L1〜L5 freeze後にL6以降をslice化し、release candidateごとに全V-pairへ再収束する。
- 保持点: 固定L2-002は方式合成を許容し、L2-001/L11-001は6 pairを定義する。L2-046/L11-046のScrum slice/backfill/SR4枝は、許可された合成で対象scopeの作業にScrumを実際に適用する場合に限って関連する。
- 数値・例外: 旧sourceはL1〜L5とL6以降を区切る。slice数等の数値なし。
- 反例: 旧HybridのL5後routeが変更後も自動保持されたと推定する。
- 未解消残差: 現行L2-002はHybridの意味をV-model基盤の複数unit拡張・core/複数製品を最後に結合へ変更（2026-09-25 PO判断）。旧L5 freeze、L6以降slice、candidateごとの全pair再収束が新意味へ一括保持された根拠はない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00059 — Discovery/PoCの別軸起動

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:78`; line SHA-256 `sha256:e0933d016055fa0d9622ade6b9a0a85a40612174203b412e0c226dce683bd32a`.
- 原文: `DISCOVERY_POC`はこれらと同列のstyleではなく、案件の不確実性、仮説、実現性を検証するため
- 意味: DISCOVERY_POCをproduction styleと別軸のcase-driven routeとして、不確実性・仮説・実現性検証に起動する。
- 保持点: 固定L2-002/003と旧HR-FR-HYB-003はDiscovery/PoCをproduction styleと分離し、ticket/Decide接続を記す。
- 数値・例外: case-by-case。起動件数や数値閾値なし。
- 反例: Discovery/PoCを第4のproduction style、Scrum phase、production完了根拠にする。
- 未解消残差: 不確実性の検出oracle、起動owner、複数条件時の優先順はこのsource rowとfixed pairで閉じない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00060 — case-driven route identity

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:79`; line SHA-256 `sha256:55e175c92c2fa3fc5c52aa4c6ae9c4e13040ab032256ef74d89e52a16eea1fff`.
- 原文: case-by-caseで発動するcase-driven route identityである。DiscoveryとPoCをScrumのphase、
- 意味: Discovery/PoCはcase-by-caseのroute identityであり、Scrumのphase・variant・内包要素ではない。
- 保持点: 固定L2-002/003、HR-FR-HYB-003、HIL-BR-28はcase-driven routeをproduction style/Scrumから分ける。
- 数値・例外: 隣接S0–S4の5段階を参照。case数制限なし。
- 反例: PoCをsprint phaseへ入れ、production slice完了数へ含める。
- 未解消残差: 状態保存先、ticket schema、Scrum sliceと併用する場合のstate/evidence joinはfixed pairに特定されない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00061 — Scrum非内包とPoC S0–S4

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:80`; line SHA-256 `sha256:9f0badf1a50bc0813771c2b61009f92b18ec8c852a9c63e8c051c5d2ad56f900`.
- 原文: variant、内包要素として扱わない。PoCは`poc` kindで非production検証を実行し、S4決定前に
- 意味: Discovery/PoCをScrum内包にせず、PoCはpoc kindの非production検証とし、S4 decision前にproduction Forwardへ昇格させない。
- 保持点: 固定L2-002/003はticket/Backflow/Decide境界を持つ。HR-FR-HYB-003/HR-AC-HYB-003はS4 receiptなしのproduction claimを拒否対象とする。
- 数値・例外: S0→S4の5段階。S4決定前は昇格不可。
- 反例: S3 verify passやIssue closeをS4 receiptとみなしてproduction Forwardへ進む。
- 未解消残差: S0/S1/S2/S3/S4のstate I/O/receiptとproduction昇格oracleは全量fixed pairへ固定されたとは確認できない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00062 — S4前のproduction昇格禁止

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:81`; line SHA-256 `sha256:22a9dadc2bd6cc03c9909ffba95fa94210b6f17557dc501db563297a5cd47a7d`.
- 原文: production Forwardへ昇格しない。
- 意味: PoCはS4 decision前にproduction Forwardへ昇格しない。
- 保持点: 固定L2-002/003はPoC/Discovery結果をDecide/Backflowで扱い、検証成功だけで採用にしない。
- 数値・例外: S4という一つのdecision boundary。
- 反例: S3 pass、Issue close、試作物の存在をS4判断にする。
- 未解消残差: S4のconfirmed/rejected/pivot別に戻る条件、authority/source receipt identity、全遷移条件は確定していない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00063 — 共通L1–L3とstyle合意

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:83`; line SHA-256 `sha256:1d161c0f89d23f25e136a0aad1132db19aa3dc79ee1b7c3fb0bec7a155960bb1`.
- 原文: 全production styleはL1〜L3とユーザー要件承認を共通必須とし、L3 freeze時にstyleを同時合意する。
- 意味: すべてのproduction styleでL1〜L3とuser requirement approvalを共通必須とし、L3 freeze時にstyleを合意する。
- 保持点: 固定L2-002 detail line 100は、全production styleでL1–L3と人の要件承認を共通必須とし、L3凍結時にstyleを合意すると明記する。line SHA-256 `7c94885350f99f133b23e4520954f46f061ad48ddbf6e36b5ad86e47f3c9311d`。2026-09-25判断は方式合成を許す一方、L1–L3/approval/pair/qualityを維持する。
- 数値・例外: L1〜L3の3層。旧exactly-oneから後発判断で合成可へ変更。
- 反例: 方式合成可能を、要件承認前の進行またはL3 style合意省略の根拠にする。
- 未解消残差: style合意要件自体はfixed L2-002 line 100にある。source-rowに即したstyle合意のtarget revision/receipt、合成する方式の適用境界、およびstyle/境界変更時に再合意を要する条件・oracleはこの固定pairから特定できない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00065 — slice化とfail-close route

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:85`; line SHA-256 `sha256:23e48e8c2cabe8028ddcd9e126d352acdcf7016dba57733a2d0f29cf83dcf6c3`.
- 原文: slice化なしは`FULL_L1_L12_V`とする。unknown、複合、Scrum不適格は`FULL_L1_L12_V`へfail-closeする。
- 意味: sliceなしはFULL_L1_L12_V。unknown・複合・Scrum不適格はFull Vへfail-closeする。
- 保持点: 固定L2-002は未選択/適用条件不成立のfail-closeを保持し、2026-09-25 PO判断で方式合成を許す。
- 数値・例外: 旧3 style、現行L2-002は4方式＋合成。risk/size閾値なし。
- 反例: 適格性不明を解決せず合成で進行する、または旧Full V defaultで現行の合成判断を上書きする。
- 未解消残差: unknown/複合をFull Vへ送る旧defaultと方式合成可の適用境界が未固定。固定L2-002から複合時の一律Full V routeは確認できない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00068 — Scrumで省略しない品質条件

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:88`; line SHA-256 `sha256:d9bc831c20f6dbd0b163b64fdce36553ec4fa09ba4d2ed70e2115ab06dfbda92`.
- 原文: TDD、Reverse、受入条件、migration、rollback、security、release evidence、L12運用を省略しない。
- 意味: Scrumを品質工程の省略に使わず、TDD、Reverse、受入条件、migration、rollback、security、release evidence、L12運用を省略しない。
- 保持点: 固定L2-002/003/005は方式横断の品質条件、工程証拠、検証義務、Release境界を持つ。後発L2-034は適用範囲内のmeasurement contractだけ。採択L2-046/L11-046のScrum枝はProduction Scrumを選んだscope、または許可された合成内でScrumを実際に適用する部分に限り、Scrum Reverseによるworkflow/L1–L5へのbackfillとSR4 pair-freeze前のrelease-ready禁止を定め、Reverseとrelease evidenceの非省略に近接する。
- 数値・例外: 8義務領域を列挙。各案件で全項目の全作業が常時適用とは限定されない。
- 反例: 短いsliceを理由にmigration/rollback/security/release evidence/L12を一括免除する。
- 未解消残差: L2-046のScrum枝はTDD、受入条件、migration、rollback、security、L12運用の残りの義務領域を閉じない。列挙義務のslice適用条件、非適用判断、各個別oracleも一括して閉じていない。
- 結果: `partial`; formal successorなし。

### REQSRC-SUP-00069 — 個人開発のScrum tailoring

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:90`; line SHA-256 `sha256:cd727ede39b8bb8fa14d31554bfd4bac20c3e77d9b13c657b0774c8c25ecfd63`.
- 原文: HELIXは個人開発を前提とするため、Scrumのteam ceremony、velocity競争、複数人role分担は必須にしない。backlog、slice、DoR/DoD、review、retro、段階releaseだけを必要粒度で使う。
- 意味: 個人開発前提でteam ceremony・velocity競争・複数人role分担を必須にせず、backlog/slice/DoR/DoD/review/retro/段階releaseを必要粒度で使う。
- 保持点: Concept/L1とfixed L2-002はsolo/AI委任と方式・品質条件を扱う。
- 数値・例外: 3種のteam practiceは非必須。remaining practicesは必要粒度で、閾値ではない。
- 反例: soloを理由にreview/DoD/release evidenceを一括免除、またはteam ceremonyを全件必須化。
- 未解消残差: 必要粒度の選択者、practiceの必須/optional、N/A記録、案件規模と証拠義務の対応はsource-row単位でfixed pairにない。
- 結果: `partial`; formal successorなし。

## 静的検証

- queueと旧source line text/line SHA、source-qualified IDs、既存個別監査ref、#2411/#2413除外集合を照合。selected 11件でtuple mismatch 0、prior individual audit ref 0、duplicate ID 0。
- 固定f6 pair pins、後発57件/11件decision hashes/scope、最新main pair pins、#2413 merged audit SHAをJSONに記録。Markdown見出しIDとJSON condition IDsは同じ11件。
- `git diff --check`で空白差分を確認した。旧CLI、runtime、workflow、adapter、test、CIは実行していない。

この監査はv1.3全条件の閉包、要求採択、successor、実装、実行または受入完了を主張しない。
