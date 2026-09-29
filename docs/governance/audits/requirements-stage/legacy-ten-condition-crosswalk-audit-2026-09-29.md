# 旧candidate 条件10行の現行L2/L11照合監査

- audit id: `legacy-ten-condition-crosswalk-2026-09-29`
- 基準commit: `f3cfb6dfe4cfda4815ef5e884d2b1c2dbe6afc99`
- 方式: append-only / read-only condition crosswalk
- authority effect: none
- scope: overlayで条件へ再分類された10 source lineのみ

## 結果

本監査は条件意味を既存の対象別L2/L11および採択判断と比較した記録であり、要求・後継・採択・retire・L2/L11変更を生成しない。旧asset inventoryは92文書・4,755非空行をsource identity/digest付きで保持し、旧candidate authorityは歴史候補のままである。

有効分類countは入力のまま `structure=926 / explanation=2947 / condition=882 / condition_route_unknown=586 / total=4755`。ここで記録する類似・候補対応はcondition route coverageを登録せず、586は未変更である。

| ID | source line | 処置 | 対象/判断の要点 |
|---|---|---|---|
| `LEGACY-CAND-LINE-003505` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:22` | 部分対応・残条件あり | RTG-AC-003: 各triggerと単一metricのみのadmission禁止。一般的なHARNESS変更・LABO測定基盤との重なりに限る。 |
| `LEGACY-CAND-LINE-003504` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:21` | 部分対応・残条件あり | RTG-AC-002: policy閾値/window等の個別oracleは再導出待ち。 |
| `LEGACY-CAND-LINE-003514` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:31` | 部分対応・残条件あり | RTG-AC-012: LABO比較基盤はあるが、旧列挙metric全てとadoption ruleは未対応。 |
| `LEGACY-CAND-LINE-003612` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md:37` | 部分対応・残条件あり | RFA-AC-16: OS-046が一行限定候補として存在するがPO未採択。既存運用条件を跨ぐsuccessorなし。 |
| `LEGACY-CAND-LINE-001588` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:278` | 部分対応・残条件あり | execution-ticket:278: HELIX internal stage releaseとLABO比較条件は部分的。製品Release/SLO receipt binding未確認。 |
| `LEGACY-CAND-LINE-001558` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:218` | 部分対応・残条件あり | execution-ticket:218: OS assignment/workflow/planningは近接するがready setとdispatch projectionは分離されていない。 |
| `LEGACY-CAND-LINE-001656` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399` | 部分対応・残条件あり | execution-ticket:399: 067/068の選択subatomは未採択候補。他telemetry・指標関係は残る。 |
| `LEGACY-CAND-LINE-001548` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:198` | 部分対応・残条件あり | execution-ticket:198: HARNESS-024は要求形成の再現性の一部。compiler byte/digest、unknown-field拒否、外部bindingは未確認。 |
| `LEGACY-CAND-LINE-001709` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:486` | 未解決 | execution-ticket:486: OS-014は内部stage release。migration段階、consumer-zero、dual-write禁止を閉じない。 |
| `LEGACY-CAND-LINE-003614` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md:39` | 未解決 | RFA-AC-18: OS workflowとGitHub運用は部分工程だが、調査からL12までの一体acceptanceなし。 |

## LEGACY-CAND-LINE-003505

- 旧asset: `LEGACY-ASSET-AE48728497244121EEC3`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:22`
- file SHA-256: `66609d952094050336a3e29abf088c18178590fb5998dbbd06dc1fecb4b79251`
- line SHA-256: `d1a17300c71dc7c67a78a1eb308ba683a471da3ba2b3b55fc98e8cde6de0b98c`
- 原文:
  > | RTG-AC-003 | RTG-R-02 | hard trigger、threshold、trend、recurrence、release boundary、provider change、safety-netを別々に実証する | 単一metric、LOC、file size、Issue数、AI評価だけでadmitしない |
- 処置: **部分対応・残条件あり** (`partial`)
- 判定: HARNESS-L2-004等は意味保存・影響・再検証の一般責務を、LABO-L2-006/059は測定比較の一般基盤を採択済みだが、RTGのtrigger各種を個別に判定する採択済みL11 oracleはない。source-crosswalkもAC-003/004をoracle_atom_candidateとして再導出待ちに置く。formal successorは未確認。

### 条件比較

**対応を確認した点**

- HARNESSの採択済み変更条件はmeaning-preserving changeと意味変更等の区別、影響と再検証を扱う。
- LABO-L2-006/059は同条件比較とfalse-positive/negativeを評価材料にできる。

**相違・不足として確認した点**

- 個々のhard trigger、trend、recurrence、release boundary、provider change、安全網をtriggerとして同定し別判定するoracleは確認できない。
- 単一metric等によるrefactoring admission禁止を当該scopeの受入条件として結ぶ採択済みpairがない。

**残っている条件**

- trigger identityと個別判定oracle
- 各triggerの必要証拠と境界
- single-metric等だけでadmitしない反例を持つ対象別L11

**次のowner/PO境界**: 構造改善の利用者価値と対象別L1は既存PO境界。L2/L11への再採否と owner は要求側が既存 authority の範囲で整理し、意味・対象・採択条件を変える候補を出す場合だけPO判断へ。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/governance/audits/source-rebaseline/new-generation-refactoring-trigger-source-crosswalk.md` | 旧trigger区分と単一metric禁止の再採否表 | 30–30 | `cfdc15344bc6353af2458d4ec3c47d508dc4b24e58ab17d347f43fec2732acf2` |
| `docs/helix-harness/L2-requirements/product-requirements.md` | HARNESS採択済み変更意味保存・影響・再検証責務 | 43–43 | `09c5c0c6ae5285132478536115ae3a0eb26ffe6cdef53bfbf42b096060afa039` |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | LABO採択済み同条件の実験比較・false positive/negative評価 | 34–34 | `e68a35f931ccca116cff5ca5b962122064f87f8434fef0d9680f30668fe78c51` |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | LABO採択済み比較評価（L2-059） | 416–440 | `5ead2e790e1d138c633770851687b0e5f91e9dc15d0c4c525c322ba81fd30e08` |

**判断参照**

- `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` (採択されたHARNESS候補24件と対象revision): 採択済みL2/L11の候補集合に旧RTG-AC-003固有oracleなし; file SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`
- `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` (採択されたHELIXOS-L2-014..029集合): OSの構造改善候補を採択した記録ではない; file SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`

## LEGACY-CAND-LINE-003504

- 旧asset: `LEGACY-ASSET-AE48728497244121EEC3`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:21`
- file SHA-256: `66609d952094050336a3e29abf088c18178590fb5998dbbd06dc1fecb4b79251`
- line SHA-256: `d34da3c2ae88839bb7b3f38ae5b2f305db3b2536f2d22d54f84813b9810efe67`
- 原文:
  > | RTG-AC-002 | RTG-R-01 | threshold、window、minimum sample、hysteresis、cooldown、expiryを一件ずつ別判定する | stale policy、wrong baseline、window無視を拒否 |
- 処置: **部分対応・残条件あり** (`partial`)
- 判定: 採択済みHARNESSの変更条件とLABO-059の適用scope/revision/比較可能性・unknown保持は周辺基盤に限って関係する。一方、RTG crosswalkはAC-001/002をoracle_rederivation_requiredとし、旧threshold/window policyは移さない。個別 trigger-policy 条件の採択済みsuccessorはない。

### 条件比較

**対応を確認した点**

- LABO-059は同一scope/revisionに限る比較と、指標定義/priority/toleranceが不明な場合のunknownを保つ。
- HARNESS-L2-004は影響する要求と再検証範囲を欠落させない。

**相違・不足として確認した点**

- threshold/window/minimum sample/hysteresis/cooldown/expiryの個別判定はLABO測定比較の汎用性から導けない。
- stale policy/wrong baseline/window無視の具体的拒否ケースを持つ採択済みRTG acceptanceはない。

**残っている条件**

- trigger policyのownerと版/baseline/window
- 個別閾値・hysteresis/cooldown/expiry判定
- stale/baseline/window negative oracle

**次のowner/PO境界**: 構造改善の必要性・利用者scopeを先に確定する既存上流境界。数値/threshold policyを新設せず、必要性が選択されれば対象owner候補とPO選択肢を要求整理側が示す。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/governance/audits/source-rebaseline/new-generation-refactoring-trigger-source-crosswalk.md` | stale/window/sample/期限のoracle再導出表 | 29–29 | `d9213c96a0a697813ad62d2e41c38da2337256ef85dad319ec43b9d39fb934d0` |
| `docs/helix-harness/L2-requirements/product-requirements.md` | HARNESS採択済み変更意味保存・影響・再検証責務 | 43–43 | `09c5c0c6ae5285132478536115ae3a0eb26ffe6cdef53bfbf42b096060afa039` |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | LABO採択済み比較評価（L2-059） | 416–440 | `5ead2e790e1d138c633770851687b0e5f91e9dc15d0c4c525c322ba81fd30e08` |

**判断参照**

- `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` (採択されたHARNESS候補24件と対象revision): 旧RTG-AC-002個別threshold/window oracleの採択なし; file SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`
- `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` (採択されたHELIXOS-L2-014..029集合): RTG trigger候補不在; file SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`

## LEGACY-CAND-LINE-003514

- 旧asset: `LEGACY-ASSET-AE48728497244121EEC3`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:31`
- file SHA-256: `66609d952094050336a3e29abf088c18178590fb5998dbbd06dc1fecb4b79251`
- line SHA-256: `3ac63a4cfa41777d940bed5e6ee011c04aa00f487bed296cfb1c2a74aad55477`
- 原文:
  > | RTG-AC-012 | RTG-R-06 | false-positive、missed-trigger、duplicate、coverage、lead time、rework、CI costをbefore／after比較する | 単一改善値だけでadoptionを確定しない |
- 処置: **部分対応・残条件あり** (`partial`)
- 判定: LABO-L2-006/059とL11 scorecardは比較可能性、FP/FNを含む評価、品質優先、総費用/時間/手戻りの一般基盤を採択済み。ただし旧行列挙のmissed-trigger/duplicate/coverage/lead time/CI costの各測定定義・分母を一括して持つ採択済み条件はない。source-crosswalkはAC-011/012をlifecycle_oracle_rewriteに分類。formal successorは未確認。

### 条件比較

**対応を確認した点**

- 同条件での比較、FP/FN、手戻り、速度、CI/Worker時間等はLABO-L2-006の比較対象に含まれる。
- LABO-L2-059は品質を先に判定し、費用/時間/介入等の優先関係を再利用し、単一 score から万能順位を生成しない。

**相違・不足として確認した点**

- 旧行の全metricが、旧refactor-trigger scopeの同一before/after receiptで個別測定される保証はない。
- adoption/admissionを一つの改善値から成立させないRTG固有ruleは採択済みでない。

**残っている条件**

- missed-trigger/duplicate/coverage/lead time/CI costの定義、分母、window、source receipt
- 個別改善値だけでadoptionしないtrigger採否条件

**次のowner/PO境界**: LABOは測定方法・比較証拠の責務を持つ。改善candidateのadmission/authorityはHELIX-OSと対象ownerへ残る。対象scopeやmetric意味の変更が必要ならPOへ選択肢を提示。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/governance/audits/source-rebaseline/new-generation-refactoring-trigger-source-crosswalk.md` | 複数効果比較のoracle再導出表 | 34–34 | `97eb190433a0ee0e22f56ff6be38262613e53f773ed20ea5d525f2adbaf14301` |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | LABO採択済み同条件比較・FP/FN・手戻り等 | 34–34 | `e68a35f931ccca116cff5ca5b962122064f87f8434fef0d9680f30668fe78c51` |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | LABO採択済み比較評価（L2-059） | 416–440 | `5ead2e790e1d138c633770851687b0e5f91e9dc15d0c4c525c322ba81fd30e08` |
| `docs/helix-labo/L11-acceptance/labo-acceptance.md` | LABO scorecard受入例。条件付きの計測一般で、旧RTG個別指標の全量対応ではない | 249–255 | `43267b4d3629a089f162e6bd2e13f1433b1726a6f7af2b861a748b1af6060794` |

**判断参照**

- `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` (採択されたHELIXLABO候補53件（L2-059を含む）): 旧RTG-AC-012固有metric集合・adoption ruleの採択なし; file SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`

## LEGACY-CAND-LINE-003612

- 旧asset: `LEGACY-ASSET-00C7DF9250F8A9A25B24`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md:37`
- file SHA-256: `c3f62478904e620eced270996360274e2840f9d94eca117d838d0e6dfeda7a86`
- line SHA-256: `bafb2bae38d5e4363a90e58405e44e1e4544e85adfaa2b318bef2425a873065c`
- 原文:
  > | RFA-AC-16 | RFA-GH-02 | dispatch/実行/ready/mergeが同authority/HEAD/scopeを照合。docs path免除・探索mergeの実装許可化・required skipを拒否 |
- 処置: **部分対応・残条件あり** (`partial`)
- 判定: 採択済みOS-004/007/008/010/011およびGitHub上流運用モデルは既存authority/evidence/CI/review/merge admissionの局所条件を保持する。さらにOS-046候補はこの旧行だけを限定入力として接続条件化し、candidate receiptも1 source row mappingを明記する。しかしL2-046/L11-046は未採択で、OS PO decisionの明示採用集合にない。既存条件を跨ぐ一つのadopted successorはない。

### 条件比較

**対応を確認した点**

- 採択済み運用はexact HEAD/base/scope、独立review、stale、required verification、現行merge admissionを別々に照合する。
- 未採択OS-046はauthority/HEAD/scope継続と同じ行に列挙された迂回拒否を限定scopeで記述する。

**相違・不足として確認した点**

- 未採択046候補から採択・運用許可・正式後継は生じない。
- OS-046は新しいrequired listやCIを定義せず、旧RFA行全体や他AC条件のclosureも主張しない。

**残っている条件**

- 046 exact L2/L11採否についてPO decision
- 移行条件・他RFA rowsを含むsource closure。現行既存contractのowner単位の条件はそのまま維持

**次のowner/PO境界**: OSの既存運用責務を跨ぐ候補046の採否はPO境界（既存packetのA/B/C）。HARNESSはverification duty、SECURITYは操作authority、OSは運転/統合を既存採択条件のまま所有。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS割当/authorityの要求行 | 41–41 | `3400c34e30c058cb8382a7eff22bb8346929601f7928b722c08c8761ffbe90d4` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS evidence/staleの要求行 | 44–44 | `2cfe130f93494c92e0ad2a01612d9ef069a6cdd921d12db19bf0ec7a14ab38d1` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS verification運転の要求行 | 45–45 | `4c47c322435c0ff4f9f144f974d0dac1d324c94428a18f43c7eda07292eab8db` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS workflow/ticket責務の要求行 | 47–47 | `5318810e799741f6865a1717e8cbaa251db98fd5087d03022cb1567216dcbedd` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS integration plan責務の要求行 | 48–48 | `3fc90c36c74e07d256d6f2dcf12f9539493ea0f49ee23ea33da85904ab0d6fb0` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | OS-046 L2接続候補本文 | 1177–1184 | `65ebd519831b293afacb839c4d632107614352ad0169c38fc2bdfb8e289f85fe` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | OS-046 L11受入候補本文 | 794–801 | `ed33de642ef395a5372dd7d186a809ec67cb634934df174a1bd03131851285a1` |

**判断参照**

- `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` (採用する明示候補集合 (L48)): HELIXOS-L2-046は採択集合外。PO decision pending; file SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`
- `docs/governance/audits/requirements-stage/post-confirmation-25-po-decision-packet-2026-09-28.json` (HELIXOS-L2-046 entry): A recommended but unresolved; 046 remains unadopted; file SHA-256 `a6c0bcbc2732713f7f184351c300decace672ec21ed18bfc81303902ee922f90`

## LEGACY-CAND-LINE-001588

- 旧asset: `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:278`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- line SHA-256: `4b9879f54e6dfe42569fb43355c3daab8338c104050f637e0c023bea4cd63a1a`
- 原文:
  > Release側がTicket exact set、system acceptance、compatibility、Bundle/Module/version、rollback、配布artifactを評価する。Ticket closeやBench scoreだけでqualifiedにしない。性能SLOが明示されたReleaseのみ、鮮度・coverage・比較可能性を満たすmeasurement receiptをrelease obligationに束縛する。
- 処置: **部分対応・残条件あり** (`partial`)
- 判定: 採択済みOS-014はHELIX自身の段階releaseについて同じpack/依存、範囲受入、証拠、rollbackと1.0判定分離を持つため一部のstage/acceptance/rollback意味が関連する。LABO-059は比較証拠を扱う。ただしOS-014は個別製品Releaseと明確に別identityで、performance-SLO時のmeasurement receiptをrelease obligationに束縛する条件、旧行のticket exact set/compatibility/artifact qualification全体のsuccessorを構成しない。

### 条件比較

**対応を確認した点**

- OS-014/L11-014は段階単位の構成、依存、受入証拠、切戻し条件を一組にし、成立を1.0到達判定と分ける。
- LABO-059は適用scopeにおける比較可能な測定receipt、鮮度/欠測/比較不能の保持に近い比較証拠基盤を持つ。

**相違・不足として確認した点**

- OS-014はHELIX内部のstage releaseでありHARNESS製品/対象Releaseのqualificationに転用できない。
- 性能SLOがある場合のみmeasurement receiptを当該Release obligationへ束縛する明示条件が確認できない。
- Ticket closeまたはBench score単独を無効化するrelease-specific qualification oracleは確認できない。

**残っている条件**

- product Releaseのexact ticket set/system acceptance/compatibility/Bundle-Version/rollback/artifactを結ぶL2/L11
- SLO適用時のfreshness/coverage/comparability receipt binding
- ticket close/Bench scoreだけによるqualified判定を拒否する具体oracle

**次のowner/PO境界**: 対象がHARNESS提供サービスかHELIX自身のstageかを既存製品責務境界で分ける。Release contractはHARNESS/OSの担当境界内で具体化し、version/scopeや採択範囲の意味を選ぶ場合はPO判断。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みHELIX自身の段階release要求 | 619–641 | `f2c3fbfa39b2bd199e9c9f638668f6ef4822c40ca6a1cf93ac93fc544525cb35` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | HELIX自身の段階release受入行 | 317–317 | `4151a53da492df9e4809195f08cc6fe2794faa4774dac122bc061437bd156769` |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | 採択済みLABO比較評価（L2-059） | 416–440 | `5ead2e790e1d138c633770851687b0e5f91e9dc15d0c4c525c322ba81fd30e08` |
| `docs/helix-labo/L11-acceptance/labo-acceptance.md` | LABO scorecard条件。性能SLO時のRelease obligation束縛条件は明示されない | 249–255 | `43267b4d3629a089f162e6bd2e13f1433b1726a6f7af2b861a748b1af6060794` |

**判断参照**

- `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` (採用する明示候補集合): HELIXOS-L2-014採択。製品Release条件を決めたものではない; file SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`
- `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` (採用する明示候補集合): LABO-L2-059採択。generic comparison basis only; file SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`

## LEGACY-CAND-LINE-001558

- 旧asset: `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:218`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- line SHA-256: `df44d56eb5da247d1f38a24e3a75ba1a08d559168f735cc52f10e089741ede27`
- 原文:
  > admitted current contract、解決済み必要依存・gate・acceptance・riskを満たす集合を導出する。優先順位、現在capacity、競合lease、予算、capability freshnessによるdispatch可否は別projectionとし、取得不能をREADY/dispatch可へ推測しない。既存Work Graph/schedulerを使用する。
- 処置: **部分対応・残条件あり** (`partial`)
- 判定: 採択済みOS-004はassignment上限/依存/予算/review待ちとauthorityを、OS-010/011はticket workflowと統合計画/replanを、OS-007/008は証拠/verificationを分担する。しかし、要求適格な集合と時点ごとのdispatch可能projectionを明示分離し、列挙全条件・unknown refusal・Work Graph/scheduler境界を備えた同一successorは確認できない。

### 条件比較

**対応を確認した点**

- OS-004は依存/予算/review capacity、割当・進行をOSへ置き、担当・authority境界を分ける。
- OS-010/011は必要工程、依存、統合順序、検証義務の計画と変更時の再計画を保つ。OS-007/008はevidence/verification不足を完了へ変換しない。

**相違・不足として確認した点**

- work eligibility集合とpriority/capacity/lease/budget/freshness由来のdispatch projectionを分離する定義は採択済みL2/L11に確認できない。
- 取得不能の状態が明示的にREADYでないこと、既存Work Graph/schedulerを使う制約はそのまま見つからない。

**残っている条件**

- eligibility集合とcurrent dispatch permission projectionの独立したidentity/receipt
- risk/gate/acceptance/contract/dependency resolutionを含むready set derivation
- capacity/lease/budget/freshness unknown時の個別拒否条件

**次のowner/PO境界**: OSがassignment、ticket、統合計画、resource/dispatch運転の既存責務を持つ。作業意味・eligibilityを再定義せず、具体化proposalが既存L2の範囲変更を含む時だけPO境界へ戻す。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS assignment制約行 | 41–41 | `3400c34e30c058cb8382a7eff22bb8346929601f7928b722c08c8761ffbe90d4` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS evidence/stale行 | 44–44 | `2cfe130f93494c92e0ad2a01612d9ef069a6cdd921d12db19bf0ec7a14ab38d1` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS verification operation行 | 45–45 | `4c47c322435c0ff4f9f144f974d0dac1d324c94428a18f43c7eda07292eab8db` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS workflow/ticket行 | 47–47 | `5318810e799741f6865a1717e8cbaa251db98fd5087d03022cb1567216dcbedd` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS planning/replan行 | 48–48 | `3fc90c36c74e07d256d6f2dcf12f9539493ea0f49ee23ea33da85904ab0d6fb0` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | 採択済みOS assignment受入行 | 24–24 | `2c3954ea845306a2120f9119ea3b6503ba4957b5eab2b23b946a2f04cc5a19a1` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | 採択済みOS verification受入行 | 28–28 | `4c4f5724cc7f6e47fa28521308443a724459fd0b372d4815d230bd81b87c8532` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | 採択済みOS workflow受入行 | 30–30 | `280df448004d7af7267689fdb949a470be685980cabd674f858e972f342dafbf` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | 採択済みOS planning受入行 | 31–31 | `0c5bb9cc3befb8c9629b1f6da14e21afd3bf89d81888081c66c34c14f76c520f` |

**判断参照**

- `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` (L2-001..029対象本文の合意と明示候補集合): L2-004/007/008/010/011 adopted; no exact old readiness projection replacement; file SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`

## LEGACY-CAND-LINE-001656

- 旧asset: `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- line SHA-256: `58be97d309362b845682602ae352b1954ed433fbc4b6552791f89be07d70db4f`
- 原文:
  > 追加するのは、first-pass acceptance、Attempt count、repair rounds、queue/active/review/Human待ち時間、escaped defects、rollback/Recovery、coverage、observer overhead、evidence freshnessなどである。これらは既存12指標のsilent renameではない。First-passの「初回」は最初のeligible candidateとし、内部で何度も修正した後の提出を隠さないためAttempt/repair回数を併記する。
- 処置: **部分対応・残条件あり** (`partial`)
- 判定: 採択済みLABO-059は比較基準のみ。局所source auditは旧行の2 subatomをL2/L11-067候補、総Attempt countをL2/L11-068候補へ切り分け、個別receiptはselected atomのみをcandidate scopedで対応づける。両候補ともPO未採択・L11未実行であり、行の他telemetry/既存12指標差/開放列挙tailは残る。

### 条件比較

**対応を確認した点**

- 候補067はfirst-eligible boundaryと同一Attempt内repair-round visibilityを明示する。
- 候補068はOSのdistinct Attempt identity数を完全記録が確認できる場合だけ返し、065/067から換算しない。
- 採択済み059との意味境界を保持し、059の測定基準が個別telemetryを満たすとはしていない。

**相違・不足として確認した点**

- 067/068の存在・receipt・registerは採択や正式successorを成立させない。
- 旧line399の他telemetry（各待ち時間、escaped defects、rollback/recovery、coverage、observer overhead、freshness等）、silent rename禁止と「など」のtailをこのsource-line coverageが解決しない。

**残っている条件**

- POによる067/068採否およびfirst-pass定義整合選択
- source line 399の全列挙telemetry/既存12 metric差/併記条件の個別処置
- open-ended「など」の未確定tail

**次のowner/PO境界**: LABOは計測・比較証拠の責務、OSはassignment/Attempt event、task/要求ownerはeligibility/oracleを持つ。候補067/068の採否・意味変更/retireは既存PO packetの選択肢に限定。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/helix-labo/L2-requirements/labo-requirements.md` | 採択済みLABO比較評価（L2-059） | 416–440 | `5ead2e790e1d138c633770851687b0e5f91e9dc15d0c4c525c322ba81fd30e08` |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | 未採択LABO first-eligible/repair候補 | 529–540 | `bf545a7b5e4714f442c4f96cec498ac07056f314b13765fc05ad049b69a8c188` |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | 未採択LABO Attempt count候補 | 541–551 | `fc2b03eb022dd91a46cee3ab49d2e9b297d053ab3f5201ca0794bb9ecfcfa1d4` |
| `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 未実行LABO-067受入候補 | 269–277 | `7b3e55cbeeb4fb0f2ae322b3ea439b63ea6acfcaabf2753a642aee158f378a16` |
| `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 未実行LABO-068受入候補 | 278–287 | `376c8f24a39275b944e8b41eaa84b8aa4a247a98f301e8ec00d216adf422202f` |

**判断参照**

- `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` (採用する明示候補集合): 059 adopted; 067/068 not included; file SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`
- `docs/governance/audits/requirements-stage/post-confirmation-25-po-decision-packet-2026-09-28.json` (HELIXLABO-L2-067 entry): A/B/C and D1/D2/D3 unresolved; recommendation is not PO choice; file SHA-256 `a6c0bcbc2732713f7f184351c300decace672ec21ed18bfc81303902ee922f90`
- `docs/governance/audits/requirements-stage/post-confirmation-25-po-decision-packet-2026-09-28.json` (HELIXLABO-L2-068 entry): unadopted candidate scope only; file SHA-256 `a6c0bcbc2732713f7f184351c300decace672ec21ed18bfc81303902ee922f90`

## LEGACY-CAND-LINE-001548

- 旧asset: `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:198`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- line SHA-256: `12da676f826da1ea6bed76202f42039fcfd540b88f396f482114c67cb2c4b903`
- 原文:
  > 確定したRequirement IR、Design/PLAN、Responsibility、Verification Obligationとcompiler policyから同一入力に同一byte/digestのcandidateを生成する。AIによる分解案は候補であり、未確定objective/scope/acceptance/dependencyをcompilerが推測しない。Release配置・可変priority・measurement policyは生成物への外部bindingとする。
- 処置: **部分対応・残条件あり** (`partial`)
- 判定: 採択済みHARNESS-024/L11-024は同一engine/pack/target revision/scopeで候補と質問順等を再現し、人間専決値を推測で補完せず、proposalから採択/authorityを作らない。これは要求形成レベルの限定意味であり、IR/Design/Responsibility/Verification Obligationからのcandidate byte/digest再現、未確定field compiler禁止、Release/priority/measurement external bindingを採択済みpairは定めていない。REQENG Python coreは別の未採択候補である。

### 条件比較

**対応を確認した点**

- HARNESS-024/L11-024は同一入力revisionの再現性とunknown/合意待ちの分離を保持する。
- HARNESS-024はcandidateや対話から要求採択・操作権限を生成しない。

**相違・不足として確認した点**

- 要求形成の候補/質問順の再現性は同一byte/digestでのcompiler artifact保証と同値ではない。
- 未確定objective/scope/acceptance/dependencyをcompilerが推測しない要件と外部bindingは採択済みL2/L11に確認できない。
- REQENG Python coreはPOが採択したHARNESS候補24件には含まれない。

**残っている条件**

- 確定入力とcompiler policyのdigest-bound deterministic artifact contract
- 未確定semantic fieldを推測しない負例/unknown handling
- Release/priority/measurement policyの外部binding境界

**次のowner/PO境界**: HARNESS要求engineのprovider責務は候補文書にあるが候補自体は未採択。要求engine capabilityの採否とその上流scope変更はPO境界で判断し、OSへ要求意味正本を移さない。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/helix-harness/L2-requirements/product-requirements.md` | 採択済みHARNESS要求形成要求 | 499–529 | `8247ac039f334292e44237cafea1b2544c578d7648063b29c86de67eae2116d7` |
| `docs/helix-harness/L11-acceptance/product-acceptance.md` | 採択済みHARNESS-024受入 | 235–265 | `8ea4beb6f1830d073f8aae4faaff724dfd517fc6095faa11edad0659918c2ad6` |
| `docs/helix-harness/candidates/requirement-engine-python-core-requirements.md` | Requirement Engine Python core候補。採択済みL2/対L11ではない | 1–80 | `0b032dbc7e6d36a734bde3775ac07fc3f4ebcf7fbd99fc9896b5ed48cda45b2d` |

**判断参照**

- `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` (採択する明示候補集合): HARNESS-L2-024 adopted; requirement-engine candidate absent from explicit 24 set; file SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`

## LEGACY-CAND-LINE-001709

- 旧asset: `LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:486`
- file SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- line SHA-256: `7d8bec078693bcd37d9a1a34ed2aa61401596d19365575894cc534853693f870`
- 原文:
  > inventory-only → shadow_compile → dual-read/比較 → bounded canary → cutover → rollback window → consumer-zeroの条件を定義する。実験mode shadowとは命名を分ける。恒久dual-writeを作らない。
- 処置: **未解決** (`unresolved`)
- 判定: 採択済みOS-014はHELIX自身の段階releaseと前段への切戻しを扱うが、migration lifecycleやconsumer-zero終了、dual-read/canary/cutover段階、dual-write禁止は定めず、別identity/1.0 scopeへの転用はできない。旧移行行に対応する現行adopted migration L2/L11またはpending candidateへの一行mappingは確認できない。

### 条件比較

**対応を確認した点**

- OS-014は段階別の能力/構成/受入/rollbackを保ち、単一release成功を1.0達成へ拡張しない。これは一般の段階境界の参照のみ。

**相違・不足として確認した点**

- 移行固有の段階順序、shadow_compileと実験shadowの区別、dual-read比較、bounded canary、consumer-zero、permanent dual-write禁止を満たす採択済み条件はない。
- OS-014は明示的にHELIX internal releaseであり、旧migration contractのsuccessorではない。

**残っている条件**

- 対象migrationとversion scope/ownerの特定
- 各移行段階のentry/exit/rollback criteriaとconsumer-zero証拠
- 恒久dual-write禁止およびshadow方式の識別条件

**次のowner/PO境界**: 現行対象・対象製品・版・適用範囲が未確定のため候補ownerを固定しない。対象と必要意味のL1/L2位置を要求整理で特定し、意味・1.0適用範囲の選択はPOへ。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みHELIX自身の段階release要求 | 619–641 | `f2c3fbfa39b2bd199e9c9f638668f6ef4822c40ca6a1cf93ac93fc544525cb35` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | HELIX自身の段階release受入行 | 317–317 | `4151a53da492df9e4809195f08cc6fe2794faa4774dac122bc061437bd156769` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS dependency/replan責務行 | 48–48 | `3fc90c36c74e07d256d6f2dcf12f9539493ea0f49ee23ea33da85904ab0d6fb0` |

**判断参照**

- `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` (採用する明示候補集合): OS-L2-014 adopted but only HELIX internal stage-release semantics; migration-specific condition remains outside its scope; file SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`

## LEGACY-CAND-LINE-003614

- 旧asset: `LEGACY-ASSET-00C7DF9250F8A9A25B24`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md:39`
- file SHA-256: `c3f62478904e620eced270996360274e2840f9d94eca117d838d0e6dfeda7a86`
- line SHA-256: `bc7a92b5e25c9d81c38c1d138b4dd278eb0d647ca431109a63ac8278455002ad`
- 原文:
  > | RFA-AC-18 | RFA-RF-01..04, RFA-RC-01..05, RFA-GH-01..03 | 限定調査→候補→独立検証→scope再freeze→IR→許可作業→main read-after→L12までE2E。候補保存だけの完了主張を拒否 |
- 処置: **未解決** (`unresolved`)
- 判定: 採択済みOS-010/011とGitHub運用モデルはticket/workflow planning、review/merge/read-after等のそれぞれの責務を持つが、旧RFA-AC-18の段階を一つの対象scopeで調査開始からL12まで連結し、候補保存を不完了と判定するaccepted L2/L11 conditionは見当たらない。候補/現行process参照もこの旧行のexact input mappingやformal successorではない。

### 条件比較

**対応を確認した点**

- 現行運用モデルとOS-010/011はissueではなく対象scopeに応じたticket/workflow/replan、独立review、merge admissionとpost-merge read-afterの各境界を保つ。

**相違・不足として確認した点**

- 限定調査/独立検証/scope再freeze/IR/許可作業/L12をE2E一系列で検収する条件を確認できない。
- candidate saved stateから要求・工程stage完了を作らない原則はあるが、RFA-AC-18全条件への逐語・atom対応は設定されていない。

**残っている条件**

- 対象ごとの工程段階とstage owner/entry-exit evidence
- scope再freeze・IR・許可作業を一つのrevision lineageに結ぶ条件
- main read-afterからL12までのclosure oracle
- 候補保存だけでは全体完了にならない受入例

**次のowner/PO境界**: OSはproject/ticket/workflow運転、HARNESSは工程・verification契約、対象機構ownerは要求/受入の意味を持つ。対象L1/L2/L11に跨る完了scopeと既存上流判断を確定する必要がある場合はPOへ返す。

**対象section digest**

| 対象path | section / locator | 行 | SHA-256 |
|---|---|---:|---|
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS workflow/ticket責務行 | 47–47 | `5318810e799741f6865a1717e8cbaa251db98fd5087d03022cb1567216dcbedd` |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 採択済みOS integration planning行 | 48–48 | `3fc90c36c74e07d256d6f2dcf12f9539493ea0f49ee23ea33da85904ab0d6fb0` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | 採択済みOS workflow acceptance行 | 30–30 | `280df448004d7af7267689fdb949a470be685980cabd674f858e972f342dafbf` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | 採択済みOS planning acceptance行 | 31–31 | `0c5bb9cc3befb8c9629b1f6da14e21afd3bf89d81888081c66c34c14f76c520f` |
| `docs/governance/github-upstream-operating-model.md` | 現行GitHub lane / review / merge運用。要求形成からL12までの一括completion oracleではない | 1–120 | `e4d1c5061762fcd45cb79ad4f22fc00881f6b7bf14943e974d9ccbfa08029844` |

**判断参照**

- `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` (採択範囲と未完引継ぎ): L2/11 fixed revision does not decide full source-to-L12 old RFA chain; file SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`

## 範囲と検証

- `covered_limited`は採択済みL2/L11が旧条件の一部を明示的に保持するときに限る。本監査で該当なし。
- `partial`は採択済み一般条件との一部重複、またはscope限定の未採択候補を記録する。正式successorを意味しない。
- `unresolved`は対応する採択済み条件や限定候補を確認できず、一般的類似を閉包にしない場合。
- 10 IDはoverlayの列挙と完全一致し、旧archive source file/lineのbytesからfile SHA-256とline SHA-256を再計算した。section/file digestは各path・範囲から計算した。
- current effective count JSONの`condition_route_unknown=586`を保持した。本文・register・PO判断、source snapshot、count artifactは変更していない。
- 本監査は採択・後継・retire・実装・実行・受入・requirements-stage完了を主張しない。旧CLI/runtime/test/CIは実行していない。
