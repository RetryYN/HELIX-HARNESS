# 旧candidate route unknown product atom先頭20件の限定照合（2026-09-29）

- 基準commit: `8b23be9cd996279617219fe06733c7e274b4bb0a`（#2348後の指定main）
- authority effect: `none`。原source、旧監査、分類snapshot、carry-forward台帳、現行requirements/registerは変更しない。
- 対象: #2345後の4,755-row cumulative recountから、effective `condition` / `product_requirement_atom` / route `unknown`をID昇順で選び、#2341/#2342/#2345の既監査overlay source IDを除外した先頭20件。
- この照合はcandidate route hypothesisを記録するbounded audit。採択、正式successor、旧source closure、L3承認、実装/受入許可は主張しない。

## 選定・route定義

除外集合は累積recount JSONの#2341 source classification/route IDs、#2342 20 crosswalk IDs、#2345 12 condition audit IDsの和集合（53 IDs）。選定はJSONの4,755 `row_state_records`をID昇順に走査し、effective classification/subtype/routeと突合して先頭20件を取った。

- `adopted_relevant_partial`: 採択済み現行L1/L2/L11とsource意味に限定的関係があるが、残余oracleや旧atom全体の被覆を意味しない。
- `unadopted_candidate_relation_only`: 現行の未採択candidateへのsource関係だけが確認でき、採択済みcoverageではない。
- `true_unknown`: このbounded readでsource atomを直接結ぶcurrent relationを特定できない。

## 現行authority comparison

HELIX-INTELLIGENCEの採択済み固定revision/候補集合は[2026-09-28 PO decision](../../decisions/helix-intelligence-requirements-po-decision-2026-09-28.md)をauthority根拠とした。L1-009/L2-009はaudit findingのexact HEAD/authority/producer/evidence/reproduction/falsification traceと自由文単独authority変更・UIL/TER/Future Synthesis重複実装の禁止、L1-011/L2-011は同一corpus/responsibility scope比較を定める。一方AAFD-BR/R/ACの詳細は[L2のsource table](../../../helix-intelligence/L2-requirements/intelligence-requirements.md#L427)がcandidate参照として明示し、全詳細は自動採択しない。L11の候補状態境界もAAFD-BR/Rを元candidateのままと記す。よってL2/L11との関係があることと旧詳細oracleの採択を区別した。

## 20行の結果

### LEGACY-CAND-LINE-000021 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:33` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:bf86a45298099c430e302e59df5135cd9027e87cd95ceb691ac42332999ad10c`
- **原文 (physical line bytes):**

```text
- `helix-concept-v4.1.md`: 最新のHARNESS／HELIX-OS／個別製品境界を反映した次revision候補。v4.0の承認対象bytesを変更せず、U1上流再整備の承認対象を分ける
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 旧READMEはConcept v4.1候補の参照更新・U1承認対象分離を述べる。現行Concept/L1の承認revisionにこのREADME行そのものを結ぶ条件routeは確認できず、同じ主題だけで被覆扱いしない。
- **未完条件:** 現行ConceptとHELIX-HARNESS/OS等の承認済みL1で、v4.1 candidateのどの意味条件が現行化されたか。READMEの参照行を要求atomとする分類妥当性も未検証。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000022 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:35` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:87496e4d9c1005c774b702938ad20b3fcfb61c92a3ee40c415bc37ff7251e140`
- **原文 (physical line bytes):**

```text
- `helix-concept-v4.0.md`: Verified Change Operating SystemへのConcept候補
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 旧READMEのVerified Change Operating SystemというConcept候補タイトル。現Concept v4.3や対象別L1との同一意味・後継関係はこの行だけから確定できない。
- **未完条件:** Concept候補の標語と現行Concept/L1の意味対応・残差。旧候補の後継/closureは未確定。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000023 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:36` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:ded8adfb295405ea4e8e0af8f9642038db0e709c8eeed302a38c8d3f5e0db99a`
- **原文 (physical line bytes):**

```text
- `helix-concept-v4-requests.md`: L1要求候補
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 旧READMEがConcept v4のrequests候補ファイルを指す。現行L1/L2に個別要求atomとしての同一性・移行先を示すsource relationなし。
- **未完条件:** requests候補の各要求を別atomで照合する必要。ファイルへの参照自体の要求価値もunknown。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000024 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:37` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:7704c350ce091c3215113b00e2ef0ec1d498ce210dd7ba228bc62ca424c62ab6`
- **原文 (physical line bytes):**

```text
- `helix-concept-v4-requirements.md`: L3要件候補
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 旧READMEがrequirements candidateを参照する。現行L3承認・要件はこのStage5 bounded audit対象外であり、L1/L2/L11とのrelationもこの参照行からは確定しない。
- **未完条件:** 候補L3の後続状態、個々の要件とのsource relation。L3の承認/受入を推定しない。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000025 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:38` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:7416a4ebf60be5195d25edf43298700b4a3ff595743ab2707d0a2565b6016b4d`
- **原文 (physical line bytes):**

```text
- `helix-concept-v4-acceptance.md`: L10受入候補
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 旧READMEがacceptance candidateを参照する。現行L11は別の対象revision・候補集合であり、このREADMEポインタ行を同一条件と見なせない。
- **未完条件:** 旧acceptance候補の意味atomと現行L11の限定条件の対応。受入実行・旧採否は不明。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000026 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:39` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:fed62dc2eb8bb7033568cc93b30c9d159bcbb4505dd1996ff4864f8979835ac6`
- **原文 (physical line bytes):**

```text
- `helix-concept-v4-capability-delta.md`: baseline capabilityとの実測差分
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 旧READMEのcapability delta参照。現行のConcept capability/対象L1または要件とのsource-edgeは特定されない。
- **未完条件:** baseline capability差分のどの要求条件を保持するか。差分が閉じたと推定しない。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000027 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:40` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:4e46c2cbbad130aa91ec6075bf3b7fc1049534b812f875f3d4478f56395655ad`
- **原文 (physical line bytes):**

```text
- `helix-concept-v4-readme-projection.md`: 人間向けREADME説明候補（非authority）
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 旧READMEの人間向けREADME projection（非authority）参照。現行docs/README類とのsource lineageは未確定。
- **未完条件:** projectionの要求意味、現行正本との関係、およびそもそも独立product requirement atomかどうか。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000031 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:47` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:8039315b98be37e9e130befcfec5e24e43c976cf2dbb8edb5760b471fd811a62`
- **原文 (physical line bytes):**

```text
- `development-investment-stage-directives-intake_v1.0.md`: 開発コスト削減・知能化に関する
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 物理行は開発投資stage directives候補へのポインタ/短い説明だけを含む。隣接するREADME行の注意書きをこのsource atom自体の意味へ混ぜず、現行L1/L2/L11の対象要求と結ぶexact routeは確認できない。
- **未完条件:** 参照先の個別投資条件と現行対象別L1/L2/L11の対応。ポインタ行自体を独立したproduct requirement atomとする分類も未検証。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000037 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:54` — `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`
- **SHA-256:** file `6ad0e2fbee65ee8ca556c8afbd3bfc7f55a4b710961343905ced07eb378ec49e`; physical line `sha256:237c6ccbe88f272922ff4b7e0918625cb896ffb5d745f672053763b9dfe2b261`
- **原文 (physical line bytes):**

```text
「INV-001〜072 個別実施カード」をその参照先として扱う。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** Concept/L1/L2/L11 pinned inputsを比較したがsource atomへ結ぶexact current routeなし
- **現行比較:** 旧READMEのINV候補入口・候補ID/P0-P4をRequirement等へ誤読しない、selected itemごとownerを再解決する条件。現行Concept/L1でinvestmentsまたはINV群に対応するexact target routeを確定できない。
- **未完条件:** INV intakeと現行5大目標/機構L1/候補のroute、選択・owner条件。これはprocess/meta条件の可能性も残る。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000051 — `unadopted_candidate_relation_only`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:16` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:8936ee3c03122a898b13a701aedf077e3ce5e65360a45f80cd9e7be0d86bda78`
- **原文 (physical line bytes):**

```text
| AAFD-AC-002 | AAFD-R-02 | wrong HEAD、worktree、authority、session、owner、evidenceの各mutationを個別reasonで拒否する |
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/candidates/audit-bounded-repair-requirements.md:60-65, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125
- **現行比較:** AAFD-AC-002はwrong HEAD/worktree/authority/session/owner/evidence mutationを個別理由で拒否する受入oracle。現行INTELLIGENCE候補audit-bounded-repairと旧AAFD系は関係するが、採択済みL2-009はtrace/source evidenceと自由文authority変更を対象にし、各mutation reason oracleまでは定義しない。
- **未完条件:** candidate acceptance detailと採択済みL2-009のtrace/boundary間の未採択分。対象となるproposal identity/session/worktreeのexact fieldsとowner範囲。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000054 — `unadopted_candidate_relation_only`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:19` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:036c027a10d1ed6f071b19a01026db2c5a15c94974749593ff5561510557ac71`
- **原文 (physical line bytes):**

```text
| AAFD-AC-005 | AAFD-R-05 | internal/UILとexternal/TERを正しく分離し、owner swap mutationを拒否する |
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/candidates/audit-bounded-repair-requirements.md:60-65, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125
- **現行比較:** AAFD-AC-005のUIL/internal対TER/external分離とowner swap拒否は、INTELLIGENCE候補のAAFD-BR-02および既存UIL/TER owner境界へ対応する。ただしL1/L2/L11の採択済み範囲にowner-swap mutationのoracleはない。
- **未完条件:** UIL/TERのsource class、owner、誤分類・swap拒否の具体的条件と採択対象範囲。候補参照を採択へ拡張しない。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000069 — `unadopted_candidate_relation_only`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:36` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:5b90a6b2a78dea5426bdb268c13f295c749d5f1500bdfb137301191ede9d3c8b`
- **原文 (physical line bytes):**

```text
- 既存PR監査用`AuditFindingProposalV1`をsystem audit contractへ再解釈する。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/candidates/audit-bounded-repair-requirements.md:60-65, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125
- **現行比較:** AAFD否定oracleは既存PR AuditFindingProposalV1をsystem audit contractへ再解釈することを拒む。採択済みL2-009はfindingからHEAD等へtraceし自由文authority変更を禁ずる部分関係だが、proposal schemaをsystem contractとして再利用しないoracleは現行採択文にない。
- **未完条件:** 提案schema reuseの拒否条件、UIL既存契約との互換境界。L2-009への限定relationはあるが、このexact oracleの採択は未確認。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000070 — `adopted_relevant_partial`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:37` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:65872dfecd7661a2c6edc1d83cf885340c310d4370523398ee8040c1748e348a`
- **原文 (physical line bytes):**

```text
- Fable等の修正案を直接実装authorityとして採用する。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 106, 121, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:96-101, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-70, 162
- **現行比較:** AAFD否定oracleはFable等の修正案をimplementation authorityとして採用することを拒む。採択済みHELIXINTELLIGENCE-L1-009/L2-009はfindingの根拠traceと自由文単独でauthorityを変えない境界を持ち、この拒否意味へ部分的に関係する。修正案一般の直接実装拒否手順までは同一視しない。
- **未完条件:** L2-009のsource/evidence traceと具体的な修正案の実行authority境界。どの既存authority routeでproposalを提示し、実装案の判断を担うか。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000071 — `adopted_relevant_partial`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:38` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:6c7b54162d74859a5f03398da13a3c208b420f6bab521faededa4c2c6aecfb2c`
- **原文 (physical line bytes):**

```text
- AI findingを独立再現なしでP0確定する。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 106, 121, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:96-101, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-70, 162
- **現行比較:** AAFD否定oracleは独立再現なしのAI findingをP0へ確定しない。採択済みL2-008/009はreproduction/counterexample/falsification traceを要求し、証拠不足をincomplete/owner照合へ戻すので部分関係がある。一方、P0 severityの定義やverification遷移は旧oracle固有。
- **未完条件:** P0 severity/independent reproductionの明示基準とL2-008/009のincomplete境界。閾値・review gateを新設しない。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000072 — `unadopted_candidate_relation_only`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:39` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:eac5fa0aa74c754967ceb8e2d8fe94ccec7358f0824274f3550c2bf7156863d3`
- **原文 (physical line bytes):**

```text
- external release検出だけでHELIX defectと確定する。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125
- **現行比較:** AAFD否定oracleはexternal release detectionだけでHELIX defectと確定することを拒む。現行INTELLIGENCEのAAFD-BR candidateは監査提案/外部変化を候補として扱うが、このspecific defect attribution oracleは未採択L2/L11本文にはない。
- **未完条件:** external release signalをHELIX defectへ帰属する条件、対象owner、反証証拠。候補familyとの関係のみで既採択 coverageにしない。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000073 — `unadopted_candidate_relation_only`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:40` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:52bf73f110d7e553eef81e041d9a0f07b009985ff98136dc10c503ecf5d32c2c`
- **原文 (physical line bytes):**

```text
- internal driftをTER、external driftをUILだけで閉じる。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/candidates/audit-bounded-repair-requirements.md:60-65, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125
- **現行比較:** AAFD否定oracleはinternal driftをTERだけで、external driftをUILだけで閉じることを拒む。INTELLIGENCE候補AAFD-BR-02はinternal UIL/external TER分離を明示。採択済みL2-009は重複実装を避けるが、分類oracleそのものはcandidate-only。
- **未完条件:** 対象別UIL/TERのclassify/owner boundaryとswap mutationの採択状態。L1-009の一般監査範囲へ具体oracleを読み込まない。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000074 — `unadopted_candidate_relation_only`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:41` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:d7e3ab53390a25c2c242d66cc90e79e8d6c3d7ffc6e5cc674f2fbccc602f737d`
- **原文 (physical line bytes):**

```text
- UIL／TERを飛ばしてFuture Synthesisへ自由文を投入する。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/candidates/audit-bounded-repair-requirements.md:60-65, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125
- **現行比較:** AAFD否定oracleはUIL/TERを飛ばしFuture Synthesisへfree textを投入することを拒む。INTELLIGENCE候補AAFD-BR-02は既存UIL/TERからFuture Synthesisへ接続するが、採択済みL2-009はUIL/TER/Future Synthesisの重複実装を拒むにとどまり、段階順序や受付oracleを明示しない。
- **未完条件:** owner handoffと接続順序の具体契約、自由文受領条件。新規workflow routeは推測しない。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000080 — `adopted_relevant_partial`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:47` — `LEGACY-ASSET-CAC0C64EB7540180B1FE`
- **SHA-256:** file `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`; physical line `sha256:6402553e2bf4436ba7eab08a9e65b860d009168ab5482d4f2ef9ce1a7289ef0e`
- **原文 (physical line bytes):**

```text
- model upgradeだけを理由にqualificationを自動継承する。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125, docs/helix-intelligence/L1-planning/intelligence-intent.md:53, 107, 122, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:108-113, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:72, 164
- **現行比較:** AAFD否定oracleはmodel upgradeだけを理由にqualificationを自動継承しない。採択済みHELIXINTELLIGENCE-L1-011/L2-011はsame corpus/responsibility scopeで比較し更新名だけで優位判定せず、条件違いを比較不能として戻すため部分的に関係する。qualification receipt/revalidationの全契約は現行L2-011の外側。
- **未完条件:** qualificationのowner、対象revision、適格範囲、失効・再検証receipt。モデル更新以外の既存資格継承条件。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000091 — `true_unknown`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requests.md:14` — `LEGACY-ASSET-8247A056F30FF91E4B8D`
- **SHA-256:** file `d78bbcc0ca184bfb87dc2bbc932291f97a58bf9f0fd703481489f15944be9b76`; physical line `sha256:2605c22e94c8558e4915cf03fb9aea89aed9397b134068972472545bc904b59d`
- **原文 (physical line bytes):**

```text
HELIXは内部変化をUIL、外部技術変化をTER、未来比較をFuture Synthesisで扱う。しかし、AI監査の自由文を
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/candidates/audit-bounded-repair-requirements.md:60-65, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125
- **現行比較:** AAFD-BRの背景行は、自由文監査を再現可能観測candidateへ変える入口と、UIL/TERで確定した変化をFuture Synthesisへ渡す契約がないという旧sourceの問題記述。現L1/L2は類似課題を持つが、この歴史的gap statementの現在妥当性/atom statusは未確定。
- **未完条件:** 背景の問題記述を現行未充足conditionとして扱うか、実際のrequired behaviorへ分解するか。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

### LEGACY-CAND-LINE-000103 — `adopted_relevant_partial`

- **旧source:** `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requests.md:33` — `LEGACY-ASSET-8247A056F30FF91E4B8D`
- **SHA-256:** file `d78bbcc0ca184bfb87dc2bbc932291f97a58bf9f0fd703481489f15944be9b76`; physical line `sha256:b60145271669e2cc56e730eadfa143beb507323dcd6b9eec32efb98413f14f7e`
- **原文 (physical line bytes):**

```text
再合成できなければならない。stale directiveからassignment、release、retireを実行してはならない。
```
- **検討した現行資料:** docs/concept/helix-concept.md:version scope and mechanism role; pinned file SHA, docs/helix-intelligence/L1-planning/intelligence-intent.md:51, 53, 106-107, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:90-113, 427-448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:69-72, 123, 161-164
- **現行参照:** docs/helix-intelligence/candidates/audit-bounded-repair-requirements.md:60-65, docs/helix-intelligence/L2-requirements/intelligence-requirements.md:433-435, 448, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123-125, docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:123
- **現行比較:** AAFD-BR-03は影響を受けるfuture projection/assumption/directiveだけをstale化・再合成し、stale directiveでassignment/release/retireしない条件。現行L11-acceptance.mdの候補状態境界はstale/unknown projectionのassignment/release/retire利用を禁じるため、この否定部分とは部分関係がある。採択済みL1/L2はaffected exact setの無効化・再合成までは定義しない。
- **未完条件:** stale/unknown結果を使わない境界を越え、affected exact setの決定・限定再合成・不affected保持をどの採択契約が担うか。candidate-onlyのFuture Synthesisを採択済みと扱わない。
- **状態境界:** source authority `historical_candidate` → target `draft_candidate`; `preserved_pending_atomization`。formal successor未設定。

## 静的検証と限界

- 選定IDは20件、一意、昇順。#2341/#2342/#2345のoverlay source IDsとは交差しない。
- 各物理archive lineのbytesからline SHA、archive file全体からfile SHAを再計算し、semantic-routing snapshot、carry-forward ledger、legacy asset dispositionの値と照合した。
- current relation参照は該当するHELIX-INTELLIGENCE L1/L2/L11とPO decisionを限定的に示す。候補文書の表示状態だけから採択状態を推定していない。
- 原source行は全て`historical_candidate`/`draft_candidate`/`preserved_pending_atomization`のまま。formal successor, atom coverage closure, source-family closureはunknown。
- 92文書全体の再監査ではなく、selected 20行だけのroute再評価である。

機械可読詳細: `legacy-candidate-unknown-product-atoms-first20-route-audit-2026-09-29.json`.
