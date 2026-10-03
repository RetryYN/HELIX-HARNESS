# HELIX-BRAIN L3 機能要件（部分草稿）

**状態：部分草稿・未承認。** この文書は割当済みStage 1、Stage 2b、Stage 4、Stage 5の対象項目だけを具体化し、機構全体のL3を完了扱いにしない。実装方式・runtime・新しい承認gateを確定しない。通常のPO L3承認前である。対象版は各親L2が明示する`version_target: 1.0`であり、1.0の実装・release許可を意味しない。

## 起点と作成方法

旧HELIXのL3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168`（旧source whole SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`、`LEGACY-ASSET-F542125805B777D8A56A`）が示すFR+ACと対応検証の意味、およびfunctional-requirement／business-requirement／nfr-gradeの3区分を保持する。旧`archive/legacy-generation-2026-09-14/root/docs/process/gates.md:41,64`（`LEGACY-ASSET-B30F3C82B6B0FDC0D2A8`、全文SHA-256 `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`）が示すFRとACを対応させ、要件と検証設計の対が揃わなければ完了としない意味を保つ。旧工程名やruntime/sub-gate構成は持ち込まない。旧自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、全文SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）は人がL3を承認しAIが起草する責任分担の起点。対となる旧L10/test designは実行せず、failure classとtraceの考えだけを現行L2/L11へ再導出する。

以下の各itemに現行PO承認対象のexact parent revisionと、旧assetのidentity/path/line/full SHA/raw span SHAを記録した。候補値は根拠と比較理由付きで示し、旧数値を自動継承しない。意味・scope・owner・version変更は含まない。

## BRAIN-007-FR-01 — HELIXBRAIN-L2-007

### 親revisionとauthority

- L2 parent: `HELIXBRAIN-L2-007` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L54); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`.
  - Source `docs/helix-brain/L2-requirements/brain-requirements.md:150-160`; full SHA-256 `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw inclusive-span SHA-256 `f96983fecc67fdb539d5ff143ed758a9c2ae799ae3f4fb6fa24bad2c381a6774`.
- Paired L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`; lines 35–35 raw SHA-256 `10d2eca8689ebae8e517fe59ec8ae5586b9410dc3acec5d70fa39e1b9a551a3f`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

Pattern / Unit / Part候補を、source identity・revision、provenance、evidence、adopted reason、evaluated scope、counterexample、limitationおよびLABO評価対象revisionへ結び、由来から採用状態まで追跡可能にする。採否前はcandidateを保ち、親契約に適合する評価・登録・独立検証・採否根拠が揃った既採用recordも同じ由来へ遡れる。LABO評価、OS登録・振分け、BRAIN変更手続内の独立検証、採否はそれぞれ別状態とする。sourceまたは必須根拠が欠ける間はcandidate状態にとどまり、promotionしない。新しいpromotion thresholdは追加しない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。



**親の依存・版**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L2-011/025`、`LABO→BRAIN HELIXLABO-L2-020`を前提とし、`version_target: 1.0`の候補として扱う。評価・登録・独立検証・採否を分け、実績数やpromotion thresholdを追加しない。

### 受入条件（AC候補）

- **BRAIN-007-AC-01 — 正常・追跡**：完全なsource/evidenceとscopeがあり、LABO対象revisionがcandidate revisionに一致する場合、採否前candidateの各owner stateを分離し由来を追跡する。既存契約に沿って採用済みの記録も、同じsource/evidenceからLABO評価、OS登録・振分け、独立検証および採否根拠まで辿れる。新しい判定閾値・actor承認は設けない。
- **BRAIN-007-AC-02 — 異常・境界**：source identity/revision、provenance、evidence、evaluated scope、counterexample、limitationのいずれか欠落・stale・不一致、LABO対象revisionの不一致、AI生成のみまたは実績一件のみでaccepted/matureとする入力は不成立。採用状態にしない理由と不足項目を示し、該当source/evidenceまたはL1意味へ戻す。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力／trace：Pattern・Unit・Part候補とsource、provenance、evidence、採用理由、evaluated scope、counterexample、limitation、LABO対象revision | `BRAIN-007-FR-01 / BRAIN-007-AC-01` | `L10-BRAIN-007-C01,C02,C03,C05` | 全field、source/revision、scope、LABO評価対象revision |
| 出力・責務：由来から採用状態まで追跡し、LABO評価、OS登録・振分け、BRAIN独立検証・採否は別状態 | `BRAIN-007-FR-01 / BRAIN-007-AC-01` | `L10-BRAIN-007-C01,C07,C08` | candidateと既採用record双方のsource-to-decision trace、各owner別state |
| 否定・失敗：AI生成だけまたは一件の実績だけではaccepted/matureにしない | `BRAIN-007-AC-02` | `L10-BRAIN-007-C04` | 誤昇格0 |
| 戻し先：source/evidence欠落時はcandidateへ戻しpromotionを止める。上流意味変更だけL1へ戻す | `BRAIN-007-AC-02` | `L10-BRAIN-007-C02,C03,C05` | 不足field・停止状態・source/evidenceまたはL1戻し先 |
| 依存・版：L1-007、L2-011/025、LABO→BRAIN L2-020、version 1.0 | `BRAIN-007-FR-01 / BRAIN-007-AC-01,AC-02` | `L10-BRAIN-007-C01,C05` | 依存revisionとcandidate/LABO対象revisionを照合し、version_targetを実装・採否と混同しない |

### 旧L3／対のテスト設計からの意味対応

旧HR-FR-HIL-07はverified completionからdurable knowledgeへ進む点とworker≠promoterだけを部分再利用する。旧HAT-HIL-07およびMLP unit/integration設計のprovenance欠落・stale/dangling・self-promotion失敗類型をL10へ再導出する。旧memory JSONL/compaction、role tuple、size/byte閾値、shadow state machine、skill/detector/gate promotionは置換対象として継承しない。現行のPattern/Unit/Part・LABO/OS/BRAIN境界を旧memoryモデルで具体化しない。直接対応する現行BRAIN source-to-decision要件は確認できず、調査した旧L3 `infinity-loop-functional-requirements.md:41`、旧HAT `L3-infinity-loop-acceptance-test-design.md:39`、MLP unit `L6-memory-learning-promotion-unit-test-design.md:31-49`およびintegration `L5-memory-learning-promotion-integration-test-design.md:38-56`の意味比較から再導出した。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:41–41 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | 1c457ace3161002377923fbe293326f079020354829a5f0ed3d1b578aa42aef4 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:39–39 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | 95a791c99b1d700b677a4628cca06754952dd18a0458763fb639925793149feb |
| `LEGACY-ASSET-1B990E15398E929D29BD` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-memory-learning-promotion-unit-test-design.md`:31–49 | `54b69856ccc617f81b31fbc918424cf3b12f4c0ca382586f8ea8db1e291a40a9` | 9d04526c786d9f585a623ea3133dc661e7ca151aa1882da61d6cb5029ac3618b |
| `LEGACY-ASSET-B1F8D6CA3685EBF0F322` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-memory-learning-promotion-integration-test-design.md`:38–56 | `0e84cdc06c0e88205a4948136c7506c307ef8d7d27fa1324a4d32f4cf90c4b5f` | 57018911a3eaa4ec8cfffc522b98b6d81db8286028a8009653cf1a4b2126d56b |
| `LEGACY-ASSET-3345D03D82B0A5E7D9A6` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/skill-mechanism-migration-requirements.md`:25–63 | `4b0d73bb7ad92a8377dd2ae72d58057c03d6e1fe732126c11059840d3d6533ab` | 7ff3e7d1423faeb3dc54e7ef9e48f4a22a3ff1d4aa6b9cc1807e62cad42cb246 |
| `LEGACY-ASSET-8FECCE93E3996E8AAAFF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/orchestration-memory-runtime.md`:14–50 | `c4fae09ac57f335a572b1d86ad353e7985551caa364f991a08e15d24d603c857` | 6ca6a61afc1b9a5fd247f79c93c92b1abac5544a06c10ef9e10f09411fa2241f |

## BRAIN-008-FR-01 — HELIXBRAIN-L2-008

### 親revisionとauthority

- L2 parent: `HELIXBRAIN-L2-008` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L55); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`.
  - Source `docs/helix-brain/L2-requirements/brain-requirements.md:161-171`; full SHA-256 `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw inclusive-span SHA-256 `8982f6583ed81151b3519a26ba2ae858566650fdbc2cca43cfda29632dce7f87`.
- Paired L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`; lines 36–36 raw SHA-256 `28e9f53fbd07098f7ffbf66216d59c7a58eb5e773083894b0451152ffb69ee3e`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

各再利用可能構造のknowledge identity・exact revision・version・stateとsupersession relationを識別し、Product Coreが参照したexact版を解決できるようにする。BRAINが知識stateを保持し、実projectで使った版・状態の登録はOSへ委ねる。参照先がsupersededになった後も既存consumer参照は当時のexact revisionを指す。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。



**親の依存・版**：`HELIXBRAIN-L1-008`、`HELIXBRAIN-L2-028`、CORE/OS接続の`HELIXBRAIN-L2-018/019/025`を前提にし、`version_target: 1.0`の候補として扱う。

### 受入条件（AC候補）

- **BRAIN-008-AC-01 — 正常・追跡**：Product Coreが指定したknowledge identity/revisionを解決し、BRAIN state（current / superseded / deprecated / experimental / retired）とOS側project usage recordを別々に表示できる。
- **BRAIN-008-AC-02 — 異常・境界**：identity/revision不明、unknown state、参照競合の際はcurrentへの暗黙解決をせず候補利用を止める。BRAIN state変更でOSの利用履歴を書き換えず、OS記録でBRAINの知識lifecycleを変更しない。構造変更はBRAIN、project状態はOSへ戻す。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・出力：knowledge identity/revision/version/state、supersession relation、Product Core usage referenceから、参照したexact版を識別 | `BRAIN-008-FR-01 / BRAIN-008-AC-01` | `L10-BRAIN-008-C01` | identity・revision・state・Core referenceの一致 |
| 状態の識別：current/superseded/deprecated/experimental/retiredを別状態として扱う | `BRAIN-008-FR-01 / BRAIN-008-AC-01` | `L10-BRAIN-008-C01,C02` | 5 stateの個別識別、unknown stateは推定しない |
| 否定・責務：旧版を黙って置換せず、BRAINのknowledge stateとOSのproject-use/register stateを別正本にする | `BRAIN-008-FR-01 / BRAIN-008-AC-02` | `L10-BRAIN-008-C01,C04,C05` | 旧参照維持、BRAIN/OS別record |
| 失敗・戻し先：identity/version/use不明はcandidate use停止。構造変更はBRAIN、project stateはOSへ戻す | `BRAIN-008-AC-02` | `L10-BRAIN-008-C02,C04,C05` | 停止状態、BRAIN/OS戻し先 |
| 依存・版：L1-008、L2-028、CORE/OS接続L2-018/019/025、version 1.0 | `BRAIN-008-FR-01 / BRAIN-008-AC-01,AC-02` | `L10-BRAIN-008-C01,C02` | dependency identity/revisionとversion/stateを照合し、対象版を実版扱いしない |

### 旧L3／対のテスト設計からの意味対応

旧distribution packageのprofile/version/digest compatibilityおよびSKAPPのtyped identity/versioned registryから、versioned object referenceとunknown fail-closeの意味だけ再利用・再導出する。旧package profile ID、skill taxonomy/status、migration runtimeは継承しない。BRAIN knowledge identity・revision・stateとconsumer revisionを揃えて定義する直接一致は確認できず、旧L3 `distribution-package-release-requirements.md:68-85,93-97`、`skill-applicability-authority.md:23-78`、`skill-mechanism-migration-requirements.md:25-63`および旧system test design `distribution-package-release-system-test-design.md:22-32,38-45`のversion/reference failure類型だけを比較し、現行L2-008のstate語彙から再導出する。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-9B7682EBDEA171005D45` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md`:68–85; 93–97 | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | 90cc931f2ff7c24e62958ef6fd080f45908b1a55e68fe5f907a48c26a75c4ead; ecbf11f2463ec20064f91cbd7dc31924a1c8107c758c3a411171d4f0fe08421a |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md`:22–32; 38–45 | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | f493570aa5d21ed24e5410b653c5cd53f7e899d5fdc733f73c9e22c8c02675ab; 830c6fbc4216d8fa37ef4810b79ee7d0142405d045450403d844321c4b43f0d8 |
| `LEGACY-ASSET-C6052714FB506FB6271E` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/skill-applicability-authority.md`:23–78 | `5598eea36f7e5a3635b22a9f8320f0b388f47d57ca1fbb01887eda5ccbe2be49` | 181b59d10347d0935a1da4fddc24c478406c7cc10bd2ca60c8240ff9c537a25e |
| `LEGACY-ASSET-3345D03D82B0A5E7D9A6` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/skill-mechanism-migration-requirements.md`:25–63 | `4b0d73bb7ad92a8377dd2ae72d58057c03d6e1fe732126c11059840d3d6533ab` | 7ff3e7d1423faeb3dc54e7ef9e48f4a22a3ff1d4aa6b9cc1807e62cad42cb246 |

## BRAIN-028-FR-01 — HELIXBRAIN-L2-028

### 親revisionとauthority

- L2 parent: `HELIXBRAIN-L2-028` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L87); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`.
  - Source `docs/helix-brain/L2-requirements/brain-requirements.md:494-503`; full SHA-256 `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw inclusive-span SHA-256 `0120989594637907eed4c8a63a2b17619187739e1dd34d916a1dc15cb80e72c1`.
- Paired L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`; lines 68–68 raw SHA-256 `fdf71fc826cce6edd4c669afefd546d3bf27e2093236cecdbe6cd6a972a23929`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

HARNESS-L2-010/011のBRAIN capability descriptorに含まれるidentity/kind、contract version、artifact version、dependency identity/version、宣言されたcompatibility range、verification scopeを、BRAIN knowledge identity/revision/version/stateとは別の軸として照合する。要求versionが共通HARNESS contractの宣言rangeに含まれる場合だけexact knowledge revisionへの適用可能応答を返す。`version_target`は実版ではない。common exchange・rollback・unfinished-obligation lifecycleをBRAIN側で定義し直さない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。



**親の依存・版**：`HELIXBRAIN-L2-008`と`HARNESS-L2-010/011` descriptor contractを前提にし、`version_target: 1.0`の候補として扱う。

### 受入条件（AC候補）

- **BRAIN-028-AC-01 — 正常・追跡**：有効なdescriptorとknowledge revisionを受け取り、契約に定めたrangeの内側であることを確認した場合、照合対象のidentityとrevisionを保持した適用可能応答を返す。
- **BRAIN-028-AC-02 — 異常・境界**：unknown/mismatch/range外/必要field欠落/range解釈未確定をnot-applicableまたはunknownとして止め、BRAIN知識側の不一致はBRAIN、descriptor contract/range側はHARNESSへ返す。version_target代入やrollback義務のBRAINへの移管を受理しない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力：descriptor identity/kind、contract/artifact version、dependency identity/version、declared compatibility range、verification scope、および別軸のBRAIN knowledge identity/revision/version/state | `BRAIN-028-FR-01 / BRAIN-028-AC-01` | `L10-BRAIN-028-C01,C02,C03,C04` | 各fieldを別々に照合する |
| 出力・成功：宣言range内のexact knowledge revisionだけをapplicableとし、不一致・unknownはnot-applicable/unknown | `BRAIN-028-FR-01 / BRAIN-028-AC-01,AC-02` | `L10-BRAIN-028-C01,C02,C03,C04` | range内のみapplicable、他は拒否/unknown |
| 否定：version_targetを実版とせず、descriptor versionとknowledge revision/stateを混同しない | `BRAIN-028-FR-01 / BRAIN-028-AC-02` | `L10-BRAIN-028-C05` | cross-field substitutionなし |
| 責務・戻し先：common exchange/update/rollback/unfinished-obligationはHARNESS所有。knowledge mismatchはBRAIN、descriptor/range mismatchはHARNESSへ戻す | `BRAIN-028-AC-02` | `L10-BRAIN-028-C03,C04,C06` | 返却ownerとcommon lifecycle維持 |
| 依存・版：L2-008とHARNESS-L2-010/011 descriptor contract、version 1.0 | `BRAIN-028-FR-01 / BRAIN-028-AC-01,AC-02` | `L10-BRAIN-028-C01,C02,C06` | descriptor contract revisionとknowledge revision/stateを別々に照合し、不一致ownerへ戻す |

### 旧L3／対のテスト設計からの意味対応

旧distribution artifact/profile version-digestとWCC provider descriptor/schemaの境界類例を使い、version/range mismatchのoracleを再導出する。旧provider descriptor、package manifest、worker-context packet v1、schemaをBRAINへコピーしない。知識revision/stateと共通descriptorの二軸を独立定義する直接一致は確認できず、調査した旧L3 `distribution-package-release-requirements.md:68-85,93-97`、`worker-common-contract.md:26-45,47-64`および旧test design `distribution-package-release-system-test-design.md:22-32,38-45`、`worker-common-contract-acceptance.md:18-37,39-64`の範囲から二軸照合とunknown/mismatch failureを再導出する。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-9B7682EBDEA171005D45` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md`:68–85; 93–97 | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | 90cc931f2ff7c24e62958ef6fd080f45908b1a55e68fe5f907a48c26a75c4ead; ecbf11f2463ec20064f91cbd7dc31924a1c8107c758c3a411171d4f0fe08421a |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md`:22–32; 38–45 | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | f493570aa5d21ed24e5410b653c5cd53f7e899d5fdc733f73c9e22c8c02675ab; 830c6fbc4216d8fa37ef4810b79ee7d0142405d045450403d844321c4b43f0d8 |
| `LEGACY-ASSET-9114D4E463E95B67DD0C` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md`:26–45; 47–64 | `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | da0c7c2017143bd6128e0d84227c341fbcaedb9027276d427de11e51f706974f; 50e699ca98ad0abee1b680cb996a66e9c3b446fa5e2894b9c9311bd563214459 |
| `LEGACY-ASSET-C6ADB99F1353965C5449` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md`:18–37; 39–64 | `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | b6114f9e9fda413b29b97693836562e55efc2b084f4f199dc839cee78c106b7b; ea7c842d97f64693f2a9242209f79805f2b0aff9f0fc1f84371634296ae89473 |


## Stage 2b: BRAIN shared-design knowledge requirements

以下28件（基本11件・Infrastructure 17件）はmain633で採択されたStage 2b / 1.0 candidateである。固定親の意味を具体化した部分草稿で、通常のL3承認前。各項目の旧asset起点と限定利用は各節およびgrounding inventoryに記録する。

## BRAIN-001-FR-01 — `HELIXBRAIN-L2-001`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-001` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L48)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:84–94` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `0cf2064672270ac0848848a6907e42b8abdab3f417fb1f0a9b550cef7cf5f259`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:29–29` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `ec39e3a80fddc529db9431b6124817f0eef9d5b0cdf291ff4bcfa8926add1834`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-001-002` / candidate semantic digest `sha256:e708841bf5f5560a96915866d68dd4d37cd663bb250e61084e1d19ebf2eb4abf`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

Domain identity・意味・状態とPattern関係を識別し、Domainの追加・分割・統合・退役後も既存relationの参照先を保持する。1.0 schemaで扱うSoftware Architecture、Application Architecture、Backend、Frontend、API / Integration、Data / Database、Infrastructure、Security、Visual Design、UX / Interactionを識別する一方、Reliability / Recovery、Performance、Observability、Testing / Quality、Operations / Maintenance、Accessibility等を全て初版で充実させる義務はない。製品名・project名をDomainにしない。依存: BRAIN L1-001とConceptの機構境界。

**入力**：Domain候補・操作種別・既存relation利用者。

**出力・責務**：候補Domainのmeaning/stateと変更案の影響、既存relation利用者を識別する。

**否定・境界**：製品/project名、重複・不明なmeaning、既存利用者を消す分割・退役案は確定しない。meaning不明ならcandidateで止めL1-001へ戻す。 意味不明時に候補で停止し、L1-001へ戻す。

### 受入条件（AC候補）

- **BRAIN-001-AC-01 — 正常**：候補Domainのmeaning/stateと変更案の影響、既存relation利用者を識別する。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-001-AC-02 — 否定・失敗**：製品/project名、重複・不明なmeaning、既存利用者を消す分割・退役案は確定しない。meaning不明ならcandidateで止めL1-001へ戻す。 意味不明時に候補で停止し、L1-001へ戻す。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: Domain候補・操作種別・既存relation利用者 | `BRAIN-001-FR-01 / AC-01` | `L10-BRAIN-001-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: 候補Domainのmeaning/stateと変更案の影響、既存relation利用者を識別する。 | `BRAIN-001-FR-01 / AC-01` | `L10-BRAIN-001-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: 製品/project名、重複・不明なmeaning、既存利用者を消す分割・退役案は確定しない。meaning不明ならcandidateで止めL1-001へ戻す。 | `AC-02` | `L10-BRAIN-001-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: 意味不明時に候補で停止し、L1-001へ戻す。 | `AC-02` | `L10-BRAIN-001-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-001、Concept機構境界。PO束ね条件: §BRAIN-L1-001、§初期Domain候補、Visual Designの1.0回答。 | `FR-01 / AC-01,02` | `L10-BRAIN-001-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-001-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-001-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出が主。Domainの追加・分割・統合・退役と利用者保全は現L2固有。旧typed identity/source traceは隣接再利用。 調査済み旧起点: `LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-5CBA32E9DB5B0FE05589`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228` | parent FR/AC→normal/negative/boundary oracleの表現形式のみ。旧gateは継承しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-002-FR-01 — `HELIXBRAIN-L2-002`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-002` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L49)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:95–105` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `eaf7e9caf32537bd81df68203b5fd40150a05e419ef1519d03756a09e0d22665`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:30–30` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `7d42d53aa64d43765a52521af16a924cfaf74a8e232f102161869c767cb82756`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-002-002` / candidate semantic digest `sha256:6ea1c1d2d7808649aaa553fbc6afcf814e72eeb24a0e83caf89c7d043fe70039`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

設計知識をDomain→Pattern→Design Unit→Partの意味階層で識別する。単なるfile/snippet/UI component集とPattern知識を区別し、Dashboard Pattern、Navigation/KPI/Work Area Unit、Table/Filter/Status Partのような構造例を表現する。依存: L1-002、L2-001。

**入力**：各候補のkind/identityと親要素。

**出力・責務**：各段階のidentity・責務・親と包含/構成relationを辿れる。

**否定・境界**：孤立要素、誤種別、階層を跨ぐidentity代入、単なるfile/snippet/component集は確定せずunknown/candidateとする。階層意味を決められなければL1-002へ戻す。 階層またはkind不明はunknownで止めL1-002へ戻す。

### 受入条件（AC候補）

- **BRAIN-002-AC-01 — 正常**：各段階のidentity・責務・親と包含/構成relationを辿れる。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-002-AC-02 — 否定・失敗**：孤立要素、誤種別、階層を跨ぐidentity代入、単なるfile/snippet/component集は確定せずunknown/candidateとする。階層意味を決められなければL1-002へ戻す。 階層またはkind不明はunknownで止めL1-002へ戻す。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: 各候補のkind/identityと親要素 | `BRAIN-002-FR-01 / AC-01` | `L10-BRAIN-002-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: 各段階のidentity・責務・親と包含/構成relationを辿れる。 | `BRAIN-002-FR-01 / AC-01` | `L10-BRAIN-002-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: 孤立要素、誤種別、階層を跨ぐidentity代入、単なるfile/snippet/component集は確定せずunknown/candidateとする。階層意味を決められなければL1-002へ戻す。 | `AC-02` | `L10-BRAIN-002-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: 階層またはkind不明はunknownで止めL1-002へ戻す。 | `AC-02` | `L10-BRAIN-002-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-002、L2-001。PO束ね条件: §BRAIN-L1-002。 | `FR-01 / AC-01,02` | `L10-BRAIN-002-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-002-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-002-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出が主。Domain→Pattern→Design Unit→Partは現L2の意味階層。旧UI hierarchyやrefactoring object modelを構造として移植しない。 調査済み旧起点: `LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-7453222BF98E95199D46`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-7453222BF98E95199D46` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/ui-domain-pattern-profile.md:35–85` | `c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678` | `311e708e950ff459e7bf4daf7fe25d2105f3e69d8c3d4261cd1a5a7c832156c7` | Pattern contractと製品境界の類例。UI固有schemaやprofile semanticsは継承しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228` | parent FR/AC→normal/negative/boundary oracleの表現形式のみ。旧gateは継承しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-003-FR-01 — `HELIXBRAIN-L2-003`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-003` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L50)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:106–116` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `8d4111686c3a35c5ca8e2980bbc7a613faebe784e539e986769c2383a2010b97`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:31–31` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `6d275b94b4e42f48730dd934f7ee025f357ff64fb4aaa479ca06919a0c543156`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-003-002` / candidate semantic digest `sha256:0c9aa2e7b9c84e47147fc40fb2893ae58a7bbd08b5975dc925299a184824dc56`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

Pattern descriptorにproblem、前提、applicability、required input、constraint、trade-off、negative case、failure mode、compatible/incompatible Pattern、evidence、maturityを保持する。Patternの存在を今回のapplicable/adoptedと同一視せず、required inputが欠落またはunknownなら適用可能と断定しない。依存: L1-003、L2-002。

**入力**：Pattern候補・source・対象problem/context・必須inputs。

**出力・責務**：条件充足・不充足・unknownを区別し、required inputが全て解決したscope内でのみ候補の適用可能性を示す。

**否定・境界**：input欠落・適用条件不明・failure/negative/evidence/maturity不足を推測補完せず停止する。 意味・必須inputが未定ならL1-003または要求ownerへ返す。

### 受入条件（AC候補）

- **BRAIN-003-AC-01 — 正常**：条件充足・不充足・unknownを区別し、required inputが全て解決したscope内でのみ候補の適用可能性を示す。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-003-AC-02 — 否定・失敗**：input欠落・適用条件不明・failure/negative/evidence/maturity不足を推測補完せず停止する。 意味・必須inputが未定ならL1-003または要求ownerへ返す。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: Pattern候補・source・対象problem/context・必須inputs | `BRAIN-003-FR-01 / AC-01` | `L10-BRAIN-003-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: 条件充足・不充足・unknownを区別し、required inputが全て解決したscope内でのみ候補の適用可能性を示す。 | `BRAIN-003-FR-01 / AC-01` | `L10-BRAIN-003-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: input欠落・適用条件不明・failure/negative/evidence/maturity不足を推測補完せず停止する。 | `AC-02` | `L10-BRAIN-003-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: 意味・必須inputが未定ならL1-003または要求ownerへ返す。 | `AC-02` | `L10-BRAIN-003-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-003、L2-002。PO束ね条件: §BRAIN-L1-003、旧DST-HARNESS-002のtemplate意味契約。 | `FR-01 / AC-01,02` | `L10-BRAIN-003-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-003-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-003-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出。Patternの入力・制約・負例・failure・evidence・maturity全体は旧sourceに直接一致なし。contract/failure条件の形だけ部分再利用。 調査済み旧起点: `LEGACY-ASSET-335176749F6322C3CD8D`、`LEGACY-ASSET-7453222BF98E95199D46`、`LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-879D95C07B789C9502CF`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-335176749F6322C3CD8D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:41–43` | `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` | `b75a90583c2e87f9f8bb2ddbae123e70d2ef8a5591b507d70ee62acd40444fb8` | semantic identity、Pattern contract、製品固有意味分離の隣接意味。旧UI/Design-HARNESS権限・実装は移植しない。 |
| `LEGACY-ASSET-7453222BF98E95199D46` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/ui-domain-pattern-profile.md:35–85` | `c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678` | `311e708e950ff459e7bf4daf7fe25d2105f3e69d8c3d4261cd1a5a7c832156c7` | Pattern contractと製品境界の類例。UI固有schemaやprofile semanticsは継承しない。 |
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-879D95C07B789C9502CF` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:10–30` | `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191` | `4ebd3c1ad8a9d3469fe76020a956a3656fa6fe45630f3f8124e00cc225eea89a` | contract/profile/isolation等の正常・拒否oracle形だけ。UI実装と旧self-approval/gateは移植しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-004-FR-01 — `HELIXBRAIN-L2-004`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-004` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L51)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:117–127` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `193100e6119ce9c87cce9edfbc29813337368b840d159c1cc09aa50aa5fa41fa`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:32–32` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `7d5f1bc00d42a6a0d0582a43f6db0d86f037c4c875fcaf0d805e3e57f35c14ac`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-004-002` / candidate semantic digest `sha256:ea1ad035c22d4c34626ec52cea621e47f304c66f97c0f44507a01e1325a3686b`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

同一problemに対して成立可能な複数Patternを長所、短所、constraint、failure、cost、適用条件で比較可能にする。BRAINは一つの絶対解または今回の製品の採用を決めない。依存: L1-004、L2-003/012。

**入力**：同一problemの複数候補・適用条件・requirement/weight。

**出力・責務**：Strong Consistency、Eventually Consistent、Compensating Transaction等の同一problemに成立し得る候補を併存させ、差と欠落する比較軸を示す。

**否定・境界**：requirements/weightsが欠ける、または候補選定を求める場合は既知の差分比較は保持したまま選択のみ保留し、HARNESS-CORE/INTELLIGENCE/人間の適切な判断先へ返す。 BRAINは採用決定しない。要求値・重みの責任ownerへ戻す。

### 受入条件（AC候補）

- **BRAIN-004-AC-01 — 正常**：Strong Consistency、Eventually Consistent、Compensating Transaction等の同一problemに成立し得る候補を併存させ、差と欠落する比較軸を示す。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-004-AC-02 — 否定・失敗**：requirements/weightsが欠ける、または候補選定を求める場合は既知の差分比較は保持したまま選択のみ保留し、HARNESS-CORE/INTELLIGENCE/人間の適切な判断先へ返す。 BRAINは採用決定しない。要求値・重みの責任ownerへ戻す。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: 同一problemの複数候補・適用条件・requirement/weight | `BRAIN-004-FR-01 / AC-01` | `L10-BRAIN-004-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: Strong Consistency、Eventually Consistent、Compensating Transaction等の同一problemに成立し得る候補を併存させ、差と欠落する比較軸を示す。 | `BRAIN-004-FR-01 / AC-01` | `L10-BRAIN-004-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: requirements/weightsが欠ける、または候補選定を求める場合は既知の差分比較は保持したまま選択のみ保留し、HARNESS-CORE/INTELLIGENCE/人間の適切な判断先へ返す。 | `AC-02` | `L10-BRAIN-004-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: BRAINは採用決定しない。要求値・重みの責任ownerへ戻す。 | `AC-02` | `L10-BRAIN-004-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-004、L2-003/012。PO束ね条件: §BRAIN-L1-004。 | `FR-01 / AC-01,02` | `L10-BRAIN-004-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-004-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-004-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出。複数Patternを比較し、選定しないこと、条件不足ならownerへ戻すことは現L2に従う。旧environment reconciliationの決定権限は持ち込まない。 調査済み旧起点: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228` | parent FR/AC→normal/negative/boundary oracleの表現形式のみ。旧gateは継承しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-005-FR-01 — `HELIXBRAIN-L2-005`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-005` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L52)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:128–138` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `2c6d2f6c24076429749a2303fe59dffe9c91f1a64fa0f8716bbf4740cbd917fa`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:33–33` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `e147986e41c25adbfa95ad2c395658058922f921fd9214b5a08cb802ca1c1917`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-005-002` / candidate semantic digest `sha256:120d16b39c985bd7f62efe6974a71849cad4cb0f234c395a509dc6793ddd9ff0`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

Pattern/Unit/Part間のrequires、depends_on、compatible_with、conflicts_with、affects、alternative_to、composed_of等を方向・両endpoint identity・relation type/meaning付きtyped graphとして保持する。cross-domain edgeを失わず、name similarityだけでrelationと断定しない。依存: L1-005、L2-001/002。

**入力**：Pattern/Unit/Part endpoints・typed relation・source。

**出力・責務**：Authentication→Session→Frontend State→UX、Database→Performance→Infrastructure等のrelationをsourceとともに追跡する。

**否定・境界**：unknown endpoint、根拠のないtype/meaning/name-only edgeは確定しない。方向・意味が決められない場合L1-005へ戻す。 unknown endpoint/meaningはunknownとして関係ownerへ戻す。

### 受入条件（AC候補）

- **BRAIN-005-AC-01 — 正常**：Authentication→Session→Frontend State→UX、Database→Performance→Infrastructure等のrelationをsourceとともに追跡する。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-005-AC-02 — 否定・失敗**：unknown endpoint、根拠のないtype/meaning/name-only edgeは確定しない。方向・意味が決められない場合L1-005へ戻す。 unknown endpoint/meaningはunknownとして関係ownerへ戻す。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: Pattern/Unit/Part endpoints・typed relation・source | `BRAIN-005-FR-01 / AC-01` | `L10-BRAIN-005-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: Authentication→Session→Frontend State→UX、Database→Performance→Infrastructure等のrelationをsourceとともに追跡する。 | `BRAIN-005-FR-01 / AC-01` | `L10-BRAIN-005-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: unknown endpoint、根拠のないtype/meaning/name-only edgeは確定しない。方向・意味が決められない場合L1-005へ戻す。 | `AC-02` | `L10-BRAIN-005-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: unknown endpoint/meaningはunknownとして関係ownerへ戻す。 | `AC-02` | `L10-BRAIN-005-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-005、L2-001/002。PO束ね条件: §BRAIN-L1-005。 | `FR-01 / AC-01,02` | `L10-BRAIN-005-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-005-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-005-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出＋typed relation表現を部分再利用。跨Domain edge保持と名前類似からの推論拒否はBRAIN固有。 調査済み旧起点: `LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-7E16E3B80335D8EC6F35`、`LEGACY-ASSET-FF7403E1E40E539FCE45`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-7E16E3B80335D8EC6F35` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md:17–39` | `869d4494c8f5cfaea4d90f29392ee1a2c7c63cc2084712eb43e0c1d91cdeca60` | `e738afbdd787952d6ebbf6d2791fa444e3ddbce56e319793bccc5799fad11091` | typed edge/error/unknown検査形だけ。旧L5 integrationを実行・移植しない。 |
| `LEGACY-ASSET-FF7403E1E40E539FCE45` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L7-design-catalog-relation-projection-unit-test-design.md:21–32` | `f8277863f22243231009a02efb36acd933f78e3357f8ee0fe48971d22d93c8d6` | `db9ad2bcea2e39860b1a6efb5e60ed986a2d51e916b30be283416f57980fbec4` | typed relation/projection/stale sourceの類例としてのみ。L7 runtime/algorithmを移植しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-006-FR-01 — `HELIXBRAIN-L2-006`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-006` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L53)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:139–149` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `b0047df45ccdd705ebf1eae090a70184a07fe107ab649b4c5d69ca152ba3be8e`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:34–34` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `afd2970a8b0cf6ba6c990baea59f6768ffec47d2388ebd4a741d11dc2bf136a9`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-006-002` / candidate semantic digest `sha256:f031680bdd08d3b7c3286ebb1a5ecab68efb8c4bfed7b8f005a55ff9bb141900`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

製品横断のVisual Design/UX Pattern, Unit, Partと条件としてIA、Visual Hierarchy、Layout、Grid、Spacing/Density、Typography、Navigation、Component Composition、Form、Feedback、Empty/Loading/Error State、Responsive Design、Dashboard、Content Hierarchy、Accessibility等を構造化する。製品固有Visual Identity/screen/flow/design tokenはProduct Coreに残し、Visual Design HARNESSの画面体験生成・評価をSystem Designへ拡張しない。依存: L1-006、L2-001/002/003、Visual Design HARNESS接続L2-023。

**入力**：visual candidate・適用条件・product/source context。

**出力・責務**：shared knowledgeとproduct-specific source contextを分離して候補を出す。

**否定・境界**：製品名や固定styleを汎用知識へ混入する、または製品固有fieldを切り分けられない候補は共有知識にせずVisual Design HARNESSまたはProduct Coreへ戻す。 分離不能は候補に入れずsource ownerへ戻す。

### 受入条件（AC候補）

- **BRAIN-006-AC-01 — 正常**：shared knowledgeとproduct-specific source contextを分離して候補を出す。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-006-AC-02 — 否定・失敗**：製品名や固定styleを汎用知識へ混入する、または製品固有fieldを切り分けられない候補は共有知識にせずVisual Design HARNESSまたはProduct Coreへ戻す。 分離不能は候補に入れずsource ownerへ戻す。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: visual candidate・適用条件・product/source context | `BRAIN-006-FR-01 / AC-01` | `L10-BRAIN-006-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: shared knowledgeとproduct-specific source contextを分離して候補を出す。 | `BRAIN-006-FR-01 / AC-01` | `L10-BRAIN-006-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: 製品名や固定styleを汎用知識へ混入する、または製品固有fieldを切り分けられない候補は共有知識にせずVisual Design HARNESSまたはProduct Coreへ戻す。 | `AC-02` | `L10-BRAIN-006-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: 分離不能は候補に入れずsource ownerへ戻す。 | `AC-02` | `L10-BRAIN-006-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-006、L2-001/002/003、Visual Design HARNESS接続L2-023。PO回答: 1.0から扱う、Visual Design HARNESS連携。 | `FR-01 / AC-01,02` | `L10-BRAIN-006-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-006-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-006-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

意味の再導出。Visual Design/UXの共有知識を保持しつつProduct Coreの固有identity/screen/flow/tokenへ境界を引く。旧UI実装・prototype権限は移植しない。 調査済み旧起点: `LEGACY-ASSET-335176749F6322C3CD8D`、`LEGACY-ASSET-879D95C07B789C9502CF`、`LEGACY-ASSET-7453222BF98E95199D46`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-335176749F6322C3CD8D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:41–43` | `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` | `b75a90583c2e87f9f8bb2ddbae123e70d2ef8a5591b507d70ee62acd40444fb8` | semantic identity、Pattern contract、製品固有意味分離の隣接意味。旧UI/Design-HARNESS権限・実装は移植しない。 |
| `LEGACY-ASSET-879D95C07B789C9502CF` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:10–30` | `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191` | `4ebd3c1ad8a9d3469fe76020a956a3656fa6fe45630f3f8124e00cc225eea89a` | contract/profile/isolation等の正常・拒否oracle形だけ。UI実装と旧self-approval/gateは移植しない。 |
| `LEGACY-ASSET-7453222BF98E95199D46` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/ui-domain-pattern-profile.md:35–85` | `c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678` | `311e708e950ff459e7bf4daf7fe25d2105f3e69d8c3d4261cd1a5a7c832156c7` | Pattern contractと製品境界の類例。UI固有schemaやprofile semanticsは継承しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-009-FR-01 — `HELIXBRAIN-L2-009`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-009` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L56)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:172–182` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `ee09a8532ea8f1340c016c54098d90dffe7b2f8cd8e41401f7968362a44f7c7f`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:37–37` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `e547ea632dbfa78b7cbc732642ad6c860ee072dfa4e6a73c8a3053533d627817`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-009-002` / candidate semantic digest `sha256:2357966979f49c70ea6881fddd664a9f121dc43849f8b2889768f931c5e89d01`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

既存PatternのUnitとrelation、新しいrelation案、source/evaluation scopeからCandidate Patternを構成し、構成根拠を辿れるようにする。LABO評価・OS登録と振分け・BRAIN独立検証が終わる前はcandidate stateを維持し、確立Patternへ即時昇格せずL2-025 promotion経路を保つ。依存: L1-009、L2-005/007/025。

**入力**：既存unit・relation・source/evaluation scope。

**出力・責務**：Pattern AのUnit A1とPattern BのUnit B1を新relationで組む例等を、候補stateとcomponent/relation source付きで示す。

**否定・境界**：component/relationの根拠不明、適用条件不明、候補を確立済みにする入力は停止する。 不足根拠はsource ownerへ、構成meaning不明は固定親のBRAIN L1-009へ戻す。昇格には既存評価/promotion経路のみ適用。

### 受入条件（AC候補）

- **BRAIN-009-AC-01 — 正常**：Pattern AのUnit A1とPattern BのUnit B1を新relationで組む例等を、候補stateとcomponent/relation source付きで示す。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-009-AC-02 — 否定・失敗**：component/relationの根拠不明、適用条件不明、候補を確立済みにする入力は停止する。 不足根拠はsource ownerへ、構成meaning不明は固定親のBRAIN L1-009へ戻す。昇格には既存評価/promotion経路のみ適用。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: 既存unit・relation・source/evaluation scope | `BRAIN-009-FR-01 / AC-01` | `L10-BRAIN-009-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: Pattern AのUnit A1とPattern BのUnit B1を新relationで組む例等を、候補stateとcomponent/relation source付きで示す。 | `BRAIN-009-FR-01 / AC-01` | `L10-BRAIN-009-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: component/relationの根拠不明、適用条件不明、候補を確立済みにする入力は停止する。 | `AC-02` | `L10-BRAIN-009-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: 不足根拠はsource ownerへ、構成meaning不明は固定親のBRAIN L1-009へ戻す。昇格には既存評価/promotion経路のみ適用。 | `AC-02` | `L10-BRAIN-009-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-009、L2-005/007/025。PO束ね条件: §BRAIN-L1-009。 | `FR-01 / AC-01,02` | `L10-BRAIN-009-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-009-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-009-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出。既存unit/relationからのcomposite pattern候補は直接一致なし。候補性と未採用状態のoracle形のみ類例。 調査済み旧起点: `LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-7453222BF98E95199D46`、`LEGACY-ASSET-7E16E3B80335D8EC6F35`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-7453222BF98E95199D46` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/ui-domain-pattern-profile.md:35–85` | `c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678` | `311e708e950ff459e7bf4daf7fe25d2105f3e69d8c3d4261cd1a5a7c832156c7` | Pattern contractと製品境界の類例。UI固有schemaやprofile semanticsは継承しない。 |
| `LEGACY-ASSET-7E16E3B80335D8EC6F35` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md:17–39` | `869d4494c8f5cfaea4d90f29392ee1a2c7c63cc2084712eb43e0c1d91cdeca60` | `e738afbdd787952d6ebbf6d2791fa444e3ddbce56e319793bccc5799fad11091` | typed edge/error/unknown検査形だけ。旧L5 integrationを実行・移植しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-010-FR-01 — `HELIXBRAIN-L2-010`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-010` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L57)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:183–193` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `1abd7a70802d2c58110fb869adf9d78b686c2dd6cb078edb0b38710d0ac1eace`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:38–38` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `885d2a34d5c05c01e6c192f12c1add9b7e35f505d4722c3c0e59af6d9cc4a650`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-010-002` / candidate semantic digest `sha256:bb9b45219db15affd84fd2098e37930da414358e9170f42d9f308143a3090b2a`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

Anti-Pattern、Failure Pattern、Invalid Combination、Context-dependent Failure、Regression caseをsource/evidenceと結び、Single Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region/Zone Failure、Deployment/Backup/Restore Failure、configuration drift等の成立条件・影響・反例を参照可能にする。成功だけをknowledgeとして固定せず、失敗を全条件へ一般化しない。依存: L1-010、L2-003/005/007。

**入力**：failure observation・context/condition・impact・alternative・source/evidence。

**出力・責務**：成功・反例・条件依存・退行の例を個別scope/contextで候補化する。

**否定・境界**：condition/source/evidenceや代替根拠なしの否定を適用せず、scope不明findingをuniversal prohibitionにしない。評価scopeを定められないfindingはLABOへ返す。 不明条件はLABO評価へ返し、普遍禁止を作らない。

### 受入条件（AC候補）

- **BRAIN-010-AC-01 — 正常**：成功・反例・条件依存・退行の例を個別scope/contextで候補化する。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-010-AC-02 — 否定・失敗**：condition/source/evidenceや代替根拠なしの否定を適用せず、scope不明findingをuniversal prohibitionにしない。評価scopeを定められないfindingはLABOへ返す。 不明条件はLABO評価へ返し、普遍禁止を作らない。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: failure observation・context/condition・impact・alternative・source/evidence | `BRAIN-010-FR-01 / AC-01` | `L10-BRAIN-010-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: 成功・反例・条件依存・退行の例を個別scope/contextで候補化する。 | `BRAIN-010-FR-01 / AC-01` | `L10-BRAIN-010-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: condition/source/evidenceや代替根拠なしの否定を適用せず、scope不明findingをuniversal prohibitionにしない。評価scopeを定められないfindingはLABOへ返す。 | `AC-02` | `L10-BRAIN-010-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: 不明条件はLABO評価へ返し、普遍禁止を作らない。 | `AC-02` | `L10-BRAIN-010-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-010、L2-003/005/007。PO束ね条件: §BRAIN-L1-010、DST-HARNESS-005 negative oracle。 | `FR-01 / AC-01,02` | `L10-BRAIN-010-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-010-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-010-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出。条件付きのfailure/anti-patternと代替・provenanceを保ち、成功/失敗条件を普遍化しない。旧failure handling実装は移植しない。 調査済み旧起点: `LEGACY-ASSET-335176749F6322C3CD8D`、`LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`、`LEGACY-ASSET-879D95C07B789C9502CF`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-335176749F6322C3CD8D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:41–43` | `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` | `b75a90583c2e87f9f8bb2ddbae123e70d2ef8a5591b507d70ee62acd40444fb8` | semantic identity、Pattern contract、製品固有意味分離の隣接意味。旧UI/Design-HARNESS権限・実装は移植しない。 |
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |
| `LEGACY-ASSET-879D95C07B789C9502CF` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:10–30` | `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191` | `4ebd3c1ad8a9d3469fe76020a956a3656fa6fe45630f3f8124e00cc225eea89a` | contract/profile/isolation等の正常・拒否oracle形だけ。UI実装と旧self-approval/gateは移植しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-011-FR-01 — `HELIXBRAIN-L2-011`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-011` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L58)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:194–204` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `c85e5ab4be064db02eef9d05ef174f2754446afba55c99946ac5220c8c6ee198`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:39–39` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `0f6702b067bacfd28d5ceca6cd3c046edae2deb10cd4ed701647aac37a1e93c8`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-011-002` / candidate semantic digest `sha256:726a83d698826a4376d6cf8bb47be6a10de671776d27d0b219ada48a38b77091`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

Product Core由来の候補、製品名/要求/screen/business rule/user decision source contextと再利用可能構造を分離する。製品固有文をそのままgeneral knowledgeへ昇格せず、一般化候補として出す場合もproduct sourceを失わず事実扱いしない。依存: L1-011、L2-007/018/020/025。

**入力**：Product Core source context・候補knowledge・一般化根拠。

**出力・責務**：製品識別子を含むsourceから独立したreusable conditionを提示し、source/provenanceを保持する。

**否定・境界**：一般化がProduct Core固有meaningを変える、または未分離要素を含む場合採用しない。共有範囲の人間判断が必要な場合は既存判断先へ送る。 分離不能は提供元CORE/LABOへ戻す。

### 受入条件（AC候補）

- **BRAIN-011-AC-01 — 正常**：製品識別子を含むsourceから独立したreusable conditionを提示し、source/provenanceを保持する。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-011-AC-02 — 否定・失敗**：一般化がProduct Core固有meaningを変える、または未分離要素を含む場合採用しない。共有範囲の人間判断が必要な場合は既存判断先へ送る。 分離不能は提供元CORE/LABOへ戻す。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: Product Core source context・候補knowledge・一般化根拠 | `BRAIN-011-FR-01 / AC-01` | `L10-BRAIN-011-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: 製品識別子を含むsourceから独立したreusable conditionを提示し、source/provenanceを保持する。 | `BRAIN-011-FR-01 / AC-01` | `L10-BRAIN-011-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: 一般化がProduct Core固有meaningを変える、または未分離要素を含む場合採用しない。共有範囲の人間判断が必要な場合は既存判断先へ送る。 | `AC-02` | `L10-BRAIN-011-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: 分離不能は提供元CORE/LABOへ戻す。 | `AC-02` | `L10-BRAIN-011-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-011、L2-007/018/020/025。PO束ね条件: §BRAIN-L1-011。 | `FR-01 / AC-01,02` | `L10-BRAIN-011-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-011-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-011-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出。product-specific source contextとreusable knowledge分離が親の意味。旧product/UI profileの分類方法は転用しない。 調査済み旧起点: `LEGACY-ASSET-335176749F6322C3CD8D`、`LEGACY-ASSET-7453222BF98E95199D46`、`LEGACY-ASSET-5CBA32E9DB5B0FE05589`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-335176749F6322C3CD8D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:41–43` | `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` | `b75a90583c2e87f9f8bb2ddbae123e70d2ef8a5591b507d70ee62acd40444fb8` | semantic identity、Pattern contract、製品固有意味分離の隣接意味。旧UI/Design-HARNESS権限・実装は移植しない。 |
| `LEGACY-ASSET-7453222BF98E95199D46` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/ui-domain-pattern-profile.md:35–85` | `c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678` | `311e708e950ff459e7bf4daf7fe25d2105f3e69d8c3d4261cd1a5a7c832156c7` | Pattern contractと製品境界の類例。UI固有schemaやprofile semanticsは継承しない。 |
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-012-FR-01 — `HELIXBRAIN-L2-012`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-012` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L59)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:205–215` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `3a2b615ba985a12eaf601fb470c8974d9b2c51f68d7f10cfcc5913dcd22b32f2`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:40–40` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `f332f7974002d1d73fe5bc5b12c24d988913fd66717e4d6915dacc6eea238a27`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-012-002` / candidate semantic digest `sha256:f574ca7fda5b129544983c786c5c5881fa7c479e00d96cdeaa60757b7964493f`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

問い合わせcontextと必要domainからPattern候補、required inputs、relation、alternatives、constraints、evidenceと各版を提供する。BRAINは「この製品で採用」と決めず、Product Core、INTELLIGENCE、人間判断等の接続先authorityと別状態にする。依存: L1-012、L2-019/021/022。

**入力**：design context・knowledge domain・versioned candidates。

**出力・責務**：必要input不足・複数候補・判断不能のとき候補・不足・代替・evidenceを分離して返す。

**否定・境界**：候補応答を採用済み/製品固有判断へ読み替える受け手を拒否する。要求意味/weight不明は適切なdecision ownerへ戻す。 BRAIN authorityを拡張せず採否ownerへ返す。

### 受入条件（AC候補）

- **BRAIN-012-AC-01 — 正常**：必要input不足・複数候補・判断不能のとき候補・不足・代替・evidenceを分離して返す。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-012-AC-02 — 否定・失敗**：候補応答を採用済み/製品固有判断へ読み替える受け手を拒否する。要求意味/weight不明は適切なdecision ownerへ戻す。 BRAIN authorityを拡張せず採否ownerへ返す。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: design context・knowledge domain・versioned candidates | `BRAIN-012-FR-01 / AC-01` | `L10-BRAIN-012-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: 必要input不足・複数候補・判断不能のとき候補・不足・代替・evidenceを分離して返す。 | `BRAIN-012-FR-01 / AC-01` | `L10-BRAIN-012-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: 候補応答を採用済み/製品固有判断へ読み替える受け手を拒否する。要求意味/weight不明は適切なdecision ownerへ戻す。 | `AC-02` | `L10-BRAIN-012-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: BRAIN authorityを拡張せず採否ownerへ返す。 | `AC-02` | `L10-BRAIN-012-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: BRAIN L1-012、L2-019/021/022。PO束ね条件: §BRAIN-L1-012およびConceptのBRAIN/INTELLIGENCE/OS境界。 | `FR-01 / AC-01,02` | `L10-BRAIN-012-C01,C02` | dependency identity/sourceと戻し先を明示 |
| 未見条件/追加candidateへの一般化境界 | `AC-01,AC-02` | `L10-BRAIN-012-C03` | sourceにない意味はunknown/未評価として保持 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-012-C01,C02` | candidate versionを実装/release authorizationと混同しない |

### 旧L3／対テスト設計の再利用・再導出

再導出。BRAINは候補と必要inputを提供するが採用authorityは持たない。旧AI visionの特定承認/Gate文言を持ち込まない。 調査済み旧起点: `LEGACY-ASSET-335176749F6322C3CD8D`、`LEGACY-ASSET-879D95C07B789C9502CF`、`LEGACY-ASSET-5CBA32E9DB5B0FE05589`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-335176749F6322C3CD8D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:41–43` | `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` | `b75a90583c2e87f9f8bb2ddbae123e70d2ef8a5591b507d70ee62acd40444fb8` | semantic identity、Pattern contract、製品固有意味分離の隣接意味。旧UI/Design-HARNESS権限・実装は移植しない。 |
| `LEGACY-ASSET-879D95C07B789C9502CF` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:10–30` | `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191` | `4ebd3c1ad8a9d3469fe76020a956a3656fa6fe45630f3f8124e00cc225eea89a` | contract/profile/isolation等の正常・拒否oracle形だけ。UI実装と旧self-approval/gateは移植しない。 |
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |

旧runtime・schema・algorithm・gateは移植しない。

## BRAIN-029-FR-01 — `HELIXBRAIN-L2-029`

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-029` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L88)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:564–574` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `79ed972f758fddbe5d6488a67de19bd951562d4eccbc9c45ab86027d87493259`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:87–95` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `b5355a8dc68d145c5154bc0aadfd46fbbc914ee0a2d23d5e36053d372d623acf`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-029-001` / candidate semantic digest `sha256:fd3bd6eaf17c5dad916dec0793c28544816c8b785e98fa854b49df843b11382d`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

### 要件候補

BRAIN unit candidateとして、generalized problem typeとPattern/Unit/Part identity/source/version、applicability、required inputs、constraints、trade-off、negative/failure、互換/競合/代替/依存/構成relation候補から、製品設計で評価可能な構成候補を作る。出力は構成relation trace・採用条件・必要input・限界・source/versionであり、product-specific requirement value、screen/API名、採用設計、工程表は含めない。候補と確立Pattern、knowledge candidateと今回product applicabilityを別stateとし、矛盾/unknownをapplicableに読み替えない。依存: primary BRAIN L1-003/005/009、consumer HARNESS L1-009/001。常時 BRAIN L2-008/003/005、構成時 L2-009、比較時 L2-004、選択入力元に応じProduct Core L2-018、LABO-evaluated candidateならL2-020。

**入力**：generalized problem、Pattern/Unit/Part identity/source/version、applicability/inputs/relations。

**出力・責務**：承認後編集禁止というgeneralized problemについてimmutable record/state transition/API command guard/permission/data invariant等の複数candidateを構成し、適合・矛盾・必要inputを示す。ただし製品の申請設計・確立Patternとしない。

**否定・境界**：unknown endpoint、required input欠落、product-specific screen/API rule混入、競合Patternをcompatibleとする、または一件のproduct useだけで採用済みにする入力は不成立。meaningはBRAIN L1-003/005/009、product requirementはHARNESSへ戻す。 不足はBRAIN meaning ownerまたはHARNESS product requirement ownerへ戻す。

### 受入条件（AC候補）

- **BRAIN-029-AC-01 — 正常**：承認後編集禁止というgeneralized problemについてimmutable record/state transition/API command guard/permission/data invariant等の複数candidateを構成し、適合・矛盾・必要inputを示す。ただし製品の申請設計・確立Patternとしない。 固定L2のscopeとownerを越えず、参照source/revisionを追跡できること。
- **BRAIN-029-AC-02 — 否定・失敗**：unknown endpoint、required input欠落、product-specific screen/API rule混入、競合Patternをcompatibleとする、または一件のproduct useだけで採用済みにする入力は不成立。meaningはBRAIN L1-003/005/009、product requirementはHARNESSへ戻す。 不足はBRAIN meaning ownerまたはHARNESS product requirement ownerへ戻す。
- **BRAIN-029-AC-03 — 未見境界**：試験側に伏せた別Domainの組合せまたはrequired input欠落で、conditionによる適用可否、`conflicts_with` relation、unknownの保持を照合する。domain/oracle scopeが定まらない条件は未評価とし、未評価をpassへ置き換えない。全Domain網羅を主張しない。

### 固定親句の被覆

| 親L2/L11の要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| 入力・identity・source: generalized problem、Pattern/Unit/Part identity/source/version、applicability/inputs/relations | `BRAIN-029-FR-01 / AC-01` | `L10-BRAIN-029-C01` | 入力fieldとsource/revision保持 |
| 正常出力・意味: 承認後編集禁止というgeneralized problemについてimmutable record/state transition/API command guard/permission/data invariant等の複数candidateを構成し、適合・矛盾・必要inputを示す。ただし製品の申請設計・確立Patternとしない。 | `BRAIN-029-FR-01 / AC-01` | `L10-BRAIN-029-C01` | 正常候補/状態/出力が親のmeaningに一致 |
| 否定・failure: unknown endpoint、required input欠落、product-specific screen/API rule混入、競合Patternをcompatibleとする、または一件のproduct useだけで採用済みにする入力は不成立。meaningはBRAIN L1-003/005/009、product requirementはHARNESSへ戻す。 | `AC-02` | `L10-BRAIN-029-C02` | 不正/不足がcandidate/unknown/holdとなり誤成功しない |
| owner・戻し先: 不足はBRAIN meaning ownerまたはHARNESS product requirement ownerへ戻す。 | `AC-02` | `L10-BRAIN-029-C02` | 停止理由と固定親ownerへ返す先 |
| 依存・束ね条件: primary BRAIN L1-003/005/009、consumer HARNESS L1-009/001。常時L2-008/003/005、構成時L2-009、比較時L2-004、source選択に応じCORE L2-018、LABO-evaluated inputならL2-020。PO固定G15束ね条件はL11 source spanに従う。 | `FR-01 / AC-01,02` | `L10-BRAIN-029-C01,C02` | dependency identity/sourceと戻し先を明示 |
| version / 1.0 | `FR-01 / AC-01,02` | `L10-BRAIN-029-C01,C02` | candidate versionを実装/release authorizationと混同しない |
| 未見fixture・適用条件の評価状態 | `AC-03` | `L10-BRAIN-029-C03` | 未知/未定scopeをunknownまたは未評価として保つ |

### 旧L3／対テスト設計の再利用・再導出

再導出。unit candidateとして製品設計で使えるpattern relationの構成候補。旧G15直接L3なし。G15 L11本文をPO固定した上で候補性とL2-029境界を守る。 調査済み旧起点: `LEGACY-ASSET-5CBA32E9DB5B0FE05589`、`LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-7E16E3B80335D8EC6F35`、`LEGACY-ASSET-FF7403E1E40E539FCE45`。path・行・全体SHA・該当raw span SHAと利用制限は次のとおり。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-7E16E3B80335D8EC6F35` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md:17–39` | `869d4494c8f5cfaea4d90f29392ee1a2c7c63cc2084712eb43e0c1d91cdeca60` | `e738afbdd787952d6ebbf6d2791fa444e3ddbce56e319793bccc5799fad11091` | typed edge/error/unknown検査形だけ。旧L5 integrationを実行・移植しない。 |
| `LEGACY-ASSET-FF7403E1E40E539FCE45` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L7-design-catalog-relation-projection-unit-test-design.md:21–32` | `f8277863f22243231009a02efb36acd933f78e3357f8ee0fe48971d22d93c8d6` | `db9ad2bcea2e39860b1a6efb5e60ed986a2d51e916b30be283416f57980fbec4` | typed relation/projection/stale sourceの類例としてのみ。L7 runtime/algorithmを移植しない。 |

旧runtime・schema・algorithm・gateは移植しない。


## Stage 2b: Infrastructure設計知識要件

以下17件はmain633採択のStage 2b / version 1.0 candidateであり、部分草稿・通常L3承認前。実resource inventory、credentials、runtime state、operation/release authorizationを定義しない。

## BRAIN-INFRA-001-FR-01 — `HELIXBRAIN-L2-INFRA-001`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-001`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L60), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-001-002` / semantic digest `sha256:9bd664fbf1d0b04f627fb4bc562a7ef63c19ac61813c12c5afe381481075ed60`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:220–229` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `fcddad5c8f225147186c49fa08da577ae04be86a89f84d112dccf18956e21d6b`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:41–41` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `b632016e7b0fb5e3c0ac0e3080f86283eac8e4bb39bee246d9e8373086f5e5a1`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

初期Infrastructure SubdomainとしてCompute、Network、Storage、Database Infrastructure、Cache、Queue / Messaging、Load Balancing、Service Discovery、Deployment、Scaling、Availability、Reliability、Backup / Restore、Disaster Recovery、Observability、Capacity、Cost Architecture、Infrastructure Security、Environment、Runtime / Execution Platformを識別可能にする。Subdomain集合は固定せず、追加/分割/統合/退役を扱う。実環境・provider account・実resourceはDomainでない。

**入力**: 候補Domain/Subdomain identity・意味・parent・source。

**出力・責務**: 設計知識のdomain/subdomain candidateと意味・sourceを返す。

**否定・戻し先**: provider resource実在情報・credential・live inventoryをDomainとして確定しない。実resource状態との混同はInfrastructure Runtime ownerへ、分類意味が重複/不明ならcandidateのままL1-001へ戻す。追加・分割・統合・退役の各操作で既存relation利用者のreferenceを保持し、resource状態を推測しない。

### 受入条件（AC候補）

- **BRAIN-INFRA-001-AC-01 — 正常**: 設計知識のdomain/subdomain candidateと意味・sourceを返す。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-001-AC-02 — 否定・境界**: provider resource実在情報・credential・live inventoryをDomainとして確定しない。domain意味が重複/不明ならcandidateで止め、BRAIN L1 meaning ownerへ戻す。 全項目を候補として保持でき、resource状態を推測しない。 失敗時戻し先: 実resource状態との混同はInfrastructure Runtime ownerへ、分類意味はL1-001へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: 候補Domain/Subdomain identity・意味・parent・source | `FR-01 / AC-01` | `L10-BRAIN-INFRA-001-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: 設計知識のdomain/subdomain candidateと意味・sourceを返す。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-001-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: provider resource実在情報・credential・live inventoryをDomainとして確定しない。domain意味が重複/不明ならcandidateで止め、BRAIN L1 meaning ownerへ戻す。 失敗時戻し先: 実resource状態との混同はInfrastructure Runtime ownerへ、分類意味はL1-001へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-001-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 初期例にないsource付きSubdomain案と別の追加/統合履歴を伏せて投入し、open-listでidentity/referenceを保てるか確認。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-001-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 実resource状態との混同はInfrastructure Runtime ownerへ、分類意味はL1-001へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-001-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-001; 常時 BRAIN L2-001の分類・変更境界。PO束ね条件 Infrastructure PO原文 INFRA-001。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-001-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-001-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-001-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。Infrastructure domain/subdomainは知識分類であり実資源inventoryではない。 起点asset: `LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-5CBA32E9DB5B0FE05589`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |

## BRAIN-INFRA-002-FR-01 — `HELIXBRAIN-L2-INFRA-002`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-002`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L61), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-002-002` / semantic digest `sha256:367891a1596fc2be0e2eac038d4f385e5163ae7d368fe29460f3a483863ae7f2`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:230–239` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `8aaa447b505de8ad93744994b01e5285fd496a7f11165912b14b83c9fdde7159`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:42–42` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `3e262257957673c43a631480d175578b3cf9feb50f31230299ce1d5cd9c880a8`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Availability→Active/Passive→Primary/Standby/Health Detection/Failover、およびDeployment→Blue-Green→Active/Candidate/Traffic Switch/RollbackをPattern hierarchyとして表現する。Cloud provider固有設定だけをPatternにしない。

**入力**: Pattern candidate・抽象kind・provider example/source。

**出力・責務**: 抽象Patternの親子・適用範囲とprovider実装例の違いを示す。

**否定・戻し先**: Domain→Pattern→Design Unit→Partのlevel/type/parentが欠ける、入れ替わる、またはprovider-specific settingだけの候補は確定しない。一般性のない設定はimplementation knowledge候補へ分離し、階層・分類意味はL1-002へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-002-AC-01 — 正常**: 抽象Patternの親子・適用範囲とprovider実装例の違いを示す。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-002-AC-02 — 否定・境界**: provider-specific settingだけを抽象Patternとして登録する、kind/parent不明の候補を確定しない。 構造不明はunknown/holdとし、知識ownerへ戻す。 失敗時戻し先: 一般性のないprovider-specific設定はimplementation knowledge候補へ分離し、階層・分類意味はL1-002へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: Pattern candidate・抽象kind・provider example/source | `FR-01 / AC-01` | `L10-BRAIN-INFRA-002-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: 抽象Patternの親子・適用範囲とprovider実装例の違いを示す。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-002-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: provider-specific settingだけを抽象Patternとして登録する、kind/parent不明の候補を確定しない。 失敗時戻し先: 一般性のないprovider-specific設定はimplementation knowledge候補へ分離し、階層・分類意味はL1-002へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-002-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 未見のprovider implementation exampleを抽象pattern hierarchyへつなぎ、抽象kindとimplementation identityを維持。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-002-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 一般性のないprovider-specific設定はimplementation knowledge候補へ分離し、階層・分類意味はL1-002へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-002-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-002; 常時 BRAIN L2-002/INFRA-001。INFRA-002の例の階層型とprovider implementation distinction。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-002-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-002-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-002-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

部分類例のみ。階層的pattern概念は再導出し、旧UI pattern hierarchyをprovider/infra schemaに転用しない。 起点asset: `LEGACY-ASSET-7453222BF98E95199D46`、`LEGACY-ASSET-603D0E8D8193914F4AC0`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7453222BF98E95199D46` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/ui-domain-pattern-profile.md:35–85` | `c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678` | `311e708e950ff459e7bf4daf7fe25d2105f3e69d8c3d4261cd1a5a7c832156c7` | Pattern contractと製品境界の類例。UI固有schemaやprofile semanticsは継承しない。 |
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |

## BRAIN-INFRA-003-FR-01 — `HELIXBRAIN-L2-INFRA-003`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-003`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L62), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-003-002` / semantic digest `sha256:4009bed040b56dae56d064690b489f9c71e3e3b4f54cec68d17f695c94be58f2`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:240–249` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `015454d12eb883ec17e4cd5752633486ebeb289378a7d00b24d2e8e2c6350f0b`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:43–43` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `339434e6d8c6b7438f3c67efe7aa50788314c4fd6f1778fd557d7ff9e4759f6e`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Pattern descriptorはproblem、workload assumptions、expected load、availability condition、consistency requirement、latency requirement、capacity condition、scaling condition、failure assumptions、recovery condition、data durability、network requirement、security constraint、operational complexity、cost characteristic、required observability、applicability、negative case、trade-off、evidenceを持つ。「一般的」だけではapplicabilityを導けず、input/condition欠落はunknownとする。

**入力**: Pattern candidate/contextと親L2列挙field。

**出力・責務**: descriptor各fieldとsource/evidenceを扱い、required fieldが未入力ならapplicabilityをunknownにする。

**否定・戻し先**: 数値や制約を推測して埋める、negative/failure/evidence欠落のまま一般適用するケースは停止する。要求値は製品COREへ、欠落評価はLABOへ、descriptor fieldの意味はL1-003へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-003-AC-01 — 正常**: descriptor各fieldとsource/evidenceを扱い、required fieldが未入力ならapplicabilityをunknownにする。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-003-AC-02 — 否定・境界**: 数値や制約を推測して埋める、negative/failure/evidence欠落のまま一般適用するケースは停止する。 未指定値はunknownとして不足input ownerへ返す。 失敗時戻し先: 要求値は製品COREへ、欠落評価はLABOへ、descriptor fieldの意味はL1-003へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: Pattern candidate/contextと親L2列挙field | `FR-01 / AC-01` | `L10-BRAIN-INFRA-003-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: descriptor各fieldとsource/evidenceを扱い、required fieldが未入力ならapplicabilityをunknownにする。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-003-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: 数値や制約を推測して埋める、negative/failure/evidence欠落のまま一般適用するケースは停止する。 失敗時戻し先: 要求値は製品COREへ、欠落評価はLABOへ、descriptor fieldの意味はL1-003へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-003-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 未知workloadを持つ伏せたPatternを投げ、required inputがunknownのまま適用可能としない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-003-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 要求値は製品COREへ、欠落評価はLABOへ、descriptor fieldの意味はL1-003へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-003-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-003; 常時 BRAIN L2-003/INFRA-002。列挙全descriptor fieldと欠落時unknown。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-003-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-003-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-003-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。親のapplicability descriptor項目を各々扱う。旧contract形式のみ類例。技術値は後の要件起草で根拠・比較・計測と候補表示が可能。 起点asset: `LEGACY-ASSET-335176749F6322C3CD8D`、`LEGACY-ASSET-7453222BF98E95199D46`、`LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-335176749F6322C3CD8D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:41–43` | `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` | `b75a90583c2e87f9f8bb2ddbae123e70d2ef8a5591b507d70ee62acd40444fb8` | semantic identity、Pattern contract、製品固有意味分離の隣接意味。旧UI/Design-HARNESS権限・実装は移植しない。 |
| `LEGACY-ASSET-7453222BF98E95199D46` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/ui-domain-pattern-profile.md:35–85` | `c451807ea2ed2303fe8eefac0b2258f67829e6708c302879f0026d816fd14678` | `311e708e950ff459e7bf4daf7fe25d2105f3e69d8c3d4261cd1a5a7c832156c7` | Pattern contractと製品境界の類例。UI固有schemaやprofile semanticsは継承しない。 |
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |

## BRAIN-INFRA-004-FR-01 — `HELIXBRAIN-L2-INFRA-004`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-004`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L63), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-004-002` / semantic digest `sha256:87d85b0d9999a9446560dd137911e6c75d29b74c468c2ca80d5c62d6a4d08d39`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:250–259` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `d11834af6cc5a20da98d97ada275cd8bcdc17ec930daa1e8ce03b3b2d904bb84`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:44–44` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `e78120ffe0c33badd64289c6b45c9d0b9010c23fc7b4f597be63deef04ccdbb0`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Availability、Performance、Capacity、Reliability、Recoverability、Security、Privacy、Observability、Maintainability、Costの各要求特性から関連Infrastructure Patternとrequired Design Inputへの意味relationを辿る。BRAIN自身は要求値を決めず、inputなしは要求/設計側へ戻す。

**入力**: product-supplied NFR/context・Pattern候補・required input。

**出力・責務**: 各product NFR source/revisionから関連Pattern候補とrequired input、mapping rationaleを辿れる。

**否定・戻し先**: NFR値なしにproduct targetを補う、mappingを確定可能なcause/choiceと誤認する、sourceなし関連を作る入力は不成立。 欠落した要求値・設計義務はHARNESS／製品COREへ戻し、BRAINは閾値を創作しない。

### 受入条件（AC候補）

- **BRAIN-INFRA-004-AC-01 — 正常**: 各product NFR source/revisionから関連Pattern候補とrequired input、mapping rationaleを辿れる。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-004-AC-02 — 否定・境界**: NFR値なしにproduct targetを補う、mappingを確定可能なcause/choiceと誤認する、sourceなし関連を作る入力は不成立。 欠落した要求値・設計義務はHARNESS／製品COREへ戻し、BRAINは閾値を創作しない。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: product-supplied NFR/context・Pattern候補・required input | `FR-01 / AC-01` | `L10-BRAIN-INFRA-004-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: 各product NFR source/revisionから関連Pattern候補とrequired input、mapping rationaleを辿れる。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-004-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: NFR値なしにproduct targetを補う、mappingを確定可能なcause/choiceと誤認する、sourceなし関連を作る入力は不成立。 失敗時戻し先: 欠落した要求値・設計義務はHARNESS／製品COREへ戻し、BRAINは閾値を創作しない。 | `AC-02` | `L10-BRAIN-INFRA-004-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 伏せた別NFR特性またはinput不足を加え、既知relationと未知mappingを区分する。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-004-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 要求値と設計義務はHARNESS／製品COREへ戻し、BRAINは閾値を創作しない。 | `AC-02` | `L10-BRAIN-INFRA-004-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-003/005; 常時 BRAIN L2-003/005/022。列挙10 NFR特性relationとunknown input。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-004-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-004-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-004-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。NFR→related pattern/required inputs relationは旧L3に直接一致なし。BRAINは製品値を決めない。 起点asset: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。 追加起点はNIO-L3/L10候補とintakeの該当項であり、全てcandidate/unapprovedの旧候補である。項目別のtyped inputs/evidence/unknown/restore-state distinctionだけを意味照合し、NIO全体のoperational obligation/admission/owner設計は継承しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228` | parent FR/AC→normal/negative/boundary oracleの表現形式のみ。旧gateは継承しない。 |
| `LEGACY-ASSET-5D41345F55800F23AC38` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:7` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `6b7272555c6ee856b3e42cf4e0c3beb0f64665a8877c9e5397cecf0379365963` | NIO-L3-01の対象・環境・workload等の型付き入力とunknown保持。候補段階の意味照合に限り、承認・実装authorityは継承しない。 |
| `LEGACY-ASSET-E239B45CE3FFE8B34D2B` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:54–73` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `99abdeca3aa64241059acec904e9b5885ed2c8d6b0881b1fa8c1a43b55f5c19a` | NIO-CAND-01の対象・環境・owner・evidence stateを型で分ける背景。未採択intakeであり権限根拠にしない。 |
| `LEGACY-ASSET-5166C9AB5D52E9926082` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md:7–8` | `009abecf1ef9bb6ac0d69da4bc472e15461481001d88df23ae172147cfedc620` | `08ee8b1f2fdceef18ece1e372ec08dfab89f0b7246145c5c1b1b04f501a693d8` | NIO-L10-01/02の根拠のないthreshold禁止とmissing/stale evidenceをhealthyへ写さない候補oracle。 |

## BRAIN-INFRA-005-FR-01 — `HELIXBRAIN-L2-INFRA-005`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-005`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L64), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-005-002` / semantic digest `sha256:8d75a00e618b3102fcb5953350a12071462f46bb247a3fc0bfacc50cff789dd3`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:260–269` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `6421070da28271408c2276ea905ad647f4917e0a42a36d9aec81bc306540ff90`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:45–45` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `027ec51b1800b025e0d7b8e4077316c8cadeea469e59638701e03548571833a8`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Single Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region / Zone Failure、Deployment Failure、Backup Failure、Restore Failure、Configuration Driftを、expected failure、detection、impact、containment、recovery、residual riskと結ぶ。構造fieldが欠けるものは完成扱いしない。

**入力**: failure condition/sourceと親L2の6要素。

**出力・責務**: failure event候補の各要素と条件を個別に照合し、分からない要素をunknownとして保持する。

**否定・戻し先**: 一要素の記載から他の要素を推定する、conditionを落として全環境failureとする、residual riskを隠す入力は不成立。 incidentの実測値はLABO／Runtimeへ、failure一般化範囲はL1-010へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-005-AC-01 — 正常**: failure event候補の各要素と条件を個別に照合し、分からない要素をunknownとして保持する。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-005-AC-02 — 否定・境界**: 一要素の記載から他の要素を推定する、conditionを落として全環境failureとする、residual riskを隠す入力は不成立。 incidentの実測値はLABO／Runtimeへ、failure一般化範囲はL1-010へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: failure condition/sourceと親L2の6要素 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-005-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: failure event候補の各要素と条件を個別に照合し、分からない要素をunknownとして保持する。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-005-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: 一要素の記載から他の要素を推定する、conditionを落として全環境failureとする、residual riskを隠す入力は不成立。 失敗時戻し先: incidentの実測値はLABO／Runtimeへ、failure一般化範囲はL1-010へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-005-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 未見failure categoryと不完全oracleを投入し、known fieldsから残りを推測しない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-005-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: incidentの実測値はLABO／Runtimeへ、failure一般化範囲はL1-010へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-005-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-010; 常時 BRAIN L2-010/INFRA-003。全failure exampleとoracle field。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-005-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-005-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-005-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。expected failure/detection/impact/containment/recovery/residual riskの条件構造。旧rollbackや運用手順を移植しない。 起点asset: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`、`LEGACY-ASSET-879D95C07B789C9502CF`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。 追加起点はNIO-L3/L10候補とintakeの該当項であり、全てcandidate/unapprovedの旧候補である。項目別のtyped inputs/evidence/unknown/restore-state distinctionだけを意味照合し、NIO全体のoperational obligation/admission/owner設計は継承しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |
| `LEGACY-ASSET-879D95C07B789C9502CF` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:10–30` | `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191` | `4ebd3c1ad8a9d3469fe76020a956a3656fa6fe45630f3f8124e00cc225eea89a` | contract/profile/isolation等の正常・拒否oracle形だけ。UI実装と旧self-approval/gateは移植しない。 |
| `LEGACY-ASSET-5D41345F55800F23AC38` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:8` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `922d2577cdd46808d3d2f8d01bb0ac829d73a96ac4dd74be719c0862ce80b3e9` | NIO-L3-02の設計義務適用性候補。義務graph全体やauthorityを移さない。 |
| `LEGACY-ASSET-E239B45CE3FFE8B34D2B` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:75–94` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `fb5b5201bc32e0a0738dcb9a9280b77d4013628489be5cc401e67029982ce990` | NIO-CAND-02のsource・condition・counterexampleとrule候補の流れ。自動検証やrule採択を継承しない。 |
| `LEGACY-ASSET-5166C9AB5D52E9926082` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md:8–8` | `009abecf1ef9bb6ac0d69da4bc472e15461481001d88df23ae172147cfedc620` | `1bf5aa9f1444209c1a59b9934d776baffe6c1f42492d9c487271379a237fe4b9` | NIO-L10-02のmissing/stale evidenceをdegraded/unknown/failureに保つ候補oracle。 |

## BRAIN-INFRA-006-FR-01 — `HELIXBRAIN-L2-INFRA-006`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-006`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L65), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-006-003` / semantic digest `sha256:3815313a4d7eb5d3ddbf42d7131f9a285cc865fb26105ba5b6cf64c27f221f23`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:270–281` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `3815313a4d7eb5d3ddbf42d7131f9a285cc865fb26105ba5b6cf64c27f221f23`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:46–46` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `4d27eac75001098de566731352d2edf45c0f08c635044a26d1eaf83fab494d82`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Retry、Timeout、Circuit Breaker、Failover、Graceful Degradation、Rollback、Restore、Rebuild、Reconciliation、Disaster RecoveryのRecovery Patternを、failure conditionと適用条件へ結び付ける。予防策だけの「落ちない構成」と復旧を含む候補を区別し、実行成功を知識だけから推定しない。INFRA-010のBackup/Restore知識は別であり、本項目の成立の前提にしない。

**入力**: pattern/source/condition・requested operation distinction。

**出力・責務**: recovery pattern candidate・適用条件・必要input・failure relationを提示する。

**否定・戻し先**: BRAIN知識応答をrecovery実施・権限・完了statusと誤認しない。 実行・rollbackは製品またはRuntime ownerへ、recovery構造の意味はL1-010へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-006-AC-01 — 正常**: recovery pattern candidate・適用条件・必要input・failure relationを提示する。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-006-AC-02 — 否定・境界**: BRAIN知識応答をrecovery実施・権限・完了statusと誤認しない。 実行・rollbackは製品またはRuntime ownerへ、recovery構造の意味はL1-010へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: pattern/source/condition・requested operation distinction | `FR-01 / AC-01` | `L10-BRAIN-INFRA-006-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: recovery pattern candidate・適用条件・必要input・failure relationを提示する。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-006-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: BRAIN知識応答をrecovery実施・権限・完了statusと誤認しない。 失敗時戻し先: 実行・rollbackは製品またはRuntime ownerへ、recovery構造の意味はL1-010へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-006-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 伏せたfailure conditionへrecovery候補を渡し、意味不定はunknown、Backup itemの完成待ちを要求しない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-006-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 実行・rollbackは製品またはRuntime ownerへ、recovery構造の意味はL1-010へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-006-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-002/010; 常時 BRAIN L2-002/INFRA-005。INFRA-010 Backup/Restoreと相互参照してよいが成立前提にしない。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-006-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-006-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-006-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。Recovery knowledge patternのみ。TERのrollbackはtransaction/reconciliation文脈の隣接例であり回復技術catalogの根拠ではない。 起点asset: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。 追加起点はNIO-L3/L10候補とintakeの該当項であり、全てcandidate/unapprovedの旧候補である。項目別のtyped inputs/evidence/unknown/restore-state distinctionだけを意味照合し、NIO全体のoperational obligation/admission/owner設計は継承しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228` | parent FR/AC→normal/negative/boundary oracleの表現形式のみ。旧gateは継承しない。 |
| `LEGACY-ASSET-5D41345F55800F23AC38` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:12` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `c0035f65772024d1d666e733ca4ad98ecaffef0ecd91fd7c0d7fb3ea8e2fac44` | NIO-L3-06の復旧procedure・fault evidence候補。実操作permissionは継承しない。 |
| `LEGACY-ASSET-E239B45CE3FFE8B34D2B` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:162–183` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `48a62cc6a731fd1bc8c5f79ea3368ab7c9395fd2571ecfd084be31b2684be585` | NIO-CAND-06のincident/recovery区別と終端evidence。実行authorityではない。 |
| `LEGACY-ASSET-5166C9AB5D52E9926082` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md:10–11` | `009abecf1ef9bb6ac0d69da4bc472e15461481001d88df23ae172147cfedc620` | `abdc4c5376120a9da965ea5b33502771fbf7238002fa196d222717f04762c0b4` | NIO-L10-04/05のbackup名やrollbackだけではrestore/recovery完了としない候補oracle。 |

## BRAIN-INFRA-007-FR-01 — `HELIXBRAIN-L2-INFRA-007`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-007`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L66), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-007-003` / semantic digest `sha256:6139e9c45d889da03b67d37437c39f361592a6a19bb2651b46397c6ddce31684`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:282–291` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `79954786ae654f5969fcc002cfe57803966f0205f59305f90de56a7295ccb188`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:47–47` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `8bcf9023a543c1772d888fabce7b4df40fb23c46e419475a52284be9aef0d2b2`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Rolling Deployment、Blue-Green、Canary、Immutable Deployment、In-place Update、Staged Rolloutをblast radius、rollback characteristics、required duplication、availability impact、migration constraint、observability requirementで比較する。BRAIN自身はrelease/deploymentを進行しない。

**入力**: architecture problem・pattern candidates・criteria/source。

**出力・責務**: deployment pattern候補の比較情報・根拠・未確定inputを提示する。

**否定・戻し先**: 実環境へdeploy/release、provider状態変更、製品のarchitecture採用確定を行う入力は拒否/owner返却。 製品release semanticsはProduct Core／HARNESSへ、実進行はOS／Runtimeへ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-007-AC-01 — 正常**: deployment pattern候補の比較情報・根拠・未確定inputを提示する。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-007-AC-02 — 否定・境界**: 実環境へdeploy/release、provider状態変更、製品のarchitecture採用確定を行う入力は拒否/owner返却。 製品release semanticsはProduct Core／HARNESSへ、実進行はOS／Runtimeへ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: architecture problem・pattern candidates・criteria/source | `FR-01 / AC-01` | `L10-BRAIN-INFRA-007-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: deployment pattern候補の比較情報・根拠・未確定inputを提示する。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-007-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: 実環境へdeploy/release、provider状態変更、製品のarchitecture採用確定を行う入力は拒否/owner返却。 失敗時戻し先: 製品release semanticsはProduct Core／HARNESSへ、実進行はOS／Runtimeへ戻す。 | `AC-02` | `L10-BRAIN-INFRA-007-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 未知のdeployment methodを比較候補に加え、評価軸が不明な部分をunknownとして保持し、実actionなし。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-007-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 製品release semanticsはProduct Core／HARNESSへ、実進行はOS／Runtimeへ戻す。 | `AC-02` | `L10-BRAIN-INFRA-007-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-004; 常時 BRAIN L2-004/INFRA-003/INFRA-006。6 deployment方式・比較軸、実action禁止。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-007-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-007-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-007-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。deployment architecture比較知識。distribution/release、外部環境変更、実deploy権限の意味は持ち込まない。 起点asset: `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`、`LEGACY-ASSET-7F8960532611D89D03E1`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:134–197` | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | `747723b54908e79652e347ab529875943afc051fc9f9182d149481f01475e5a0` | FR/ACの親追跡・検証構造のみ。BRAIN具体意味の根拠にはしない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228` | parent FR/AC→normal/negative/boundary oracleの表現形式のみ。旧gateは継承しない。 |
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |

## BRAIN-INFRA-008-FR-01 — `HELIXBRAIN-L2-INFRA-008`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-008`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L67), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-008-003` / semantic digest `sha256:6fbd7f1527b50a7c46cd201dbad52d7584616a7cb6f41cb2867cda550e1ad67a`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:292–301` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `fd25f8a5431b39e11266b4cf65f056706d6a27932fb0af9fb5cf4ff703055fe8`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:48–48` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `9c51887b271b926e70c837a48a05aa66e55f53ffb3f6337f53d613f4ae4de1f3`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Vertical Scaling、Horizontal Scaling、Queue-based Load Leveling、Sharding、Read Replica、Cache、Worker Pool、Backpressure候補とtrigger、bottleneck、limit、statefulness、synchronization cost、expected saturation behaviorを結ぶ。特定load thresholdや規模を創作しない。

**入力**: workload/capacity source・pattern・condition。

**出力・責務**: 条件と観測要素に基づくcandidate patternを示し、specific thresholdのsourceを明示する。

**否定・戻し先**: scope不明のthresholdを作る、観測値からresource mutationを実行する、saturation conditionを一般化する入力は不成立。 workload値・SLOは製品要求へ、構造評価はLABOへ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-008-AC-01 — 正常**: 条件と観測要素に基づくcandidate patternを示し、specific thresholdのsourceを明示する。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-008-AC-02 — 否定・境界**: scope不明のthresholdを作る、観測値からresource mutationを実行する、saturation conditionを一般化する入力は不成立。 workload値・SLOは製品要求へ、構造評価はLABOへ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: workload/capacity source・pattern・condition | `FR-01 / AC-01` | `L10-BRAIN-INFRA-008-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: 条件と観測要素に基づくcandidate patternを示し、specific thresholdのsourceを明示する。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-008-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: scope不明のthresholdを作る、観測値からresource mutationを実行する、saturation conditionを一般化する入力は不成立。 失敗時戻し先: workload値・SLOは製品要求へ、構造評価はLABOへ戻す。 | `AC-02` | `L10-BRAIN-INFRA-008-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: holdout workload/bottleneck組合せを使い、threshold不足をapplicableへ変換せずunknownのままにする。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-008-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: workload値・SLOは製品要求へ、構造評価はLABOへ戻す。 | `AC-02` | `L10-BRAIN-INFRA-008-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-003; 常時 BRAIN L2-003/INFRA-003/INFRA-004。列挙8 patternと6 descriptor axes。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-008-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-008-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-008-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。scaling/capacityのtrigger/bottleneck/limits/state/synchronization/saturationを知識として扱う。実loadや運用実行ではない。 起点asset: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-7E16E3B80335D8EC6F35`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-7E16E3B80335D8EC6F35` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md:17–39` | `869d4494c8f5cfaea4d90f29392ee1a2c7c63cc2084712eb43e0c1d91cdeca60` | `e738afbdd787952d6ebbf6d2791fa444e3ddbce56e319793bccc5799fad11091` | typed edge/error/unknown検査形だけ。旧L5 integrationを実行・移植しない。 |

## BRAIN-INFRA-009-FR-01 — `HELIXBRAIN-L2-INFRA-009`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-009`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L68), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-009-003` / semantic digest `sha256:0e2af1c81611096da7b50401d9c8f9342f585b89180fe1353fadda177c9d9ef9`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:302–311` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `2286996c4a51098e495d602c94d5e641420d8f7110ba00a8ceed59e075f13f9c`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:49–49` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `841445aa41dff273200edc6259212d00314c2058b2f9d6166a69a8fc64dc8693`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Metrics、Logs、Traces、Health、Dependency status、Capacity、Saturation、Error、Latency、Deployment state、Recovery stateの観測pointとmeaningをPattern候補へ結ぶ。構成を作っただけで成立とせず、actual logs/metricsはBRAINに保存しない。

**入力**: observability pattern・source・設計対象。

**出力・責務**: 設計対象・観測点と必要inputをcandidateとして返す。

**否定・戻し先**: actual logs/metrics/secrets/user-dataを知識recordへ入れる、または観測設計をlive telemetryとして表す入力は停止。 runtime evidenceはInfrastructure Runtime／LABO ownerへ、設計上の観測点不足はL1-003へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-009-AC-01 — 正常**: 設計対象・観測点と必要inputをcandidateとして返す。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-009-AC-02 — 否定・境界**: actual logs/metrics/secrets/user-dataを知識recordへ入れる、または観測設計をlive telemetryとして表す入力は停止。 runtime evidenceはInfrastructure Runtime／LABO ownerへ、設計上の観測点不足はL1-003へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: observability pattern・source・設計対象 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-009-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: 設計対象・観測点と必要inputをcandidateとして返す。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-009-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: actual logs/metrics/secrets/user-dataを知識recordへ入れる、または観測設計をlive telemetryとして表す入力は停止。 失敗時戻し先: runtime evidenceはInfrastructure Runtime／LABO ownerへ、設計上の観測点不足はL1-003へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-009-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 伏せたfailure signal/design targetを投入し、point designは候補にできてもlive valuesは取得/保存しない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-009-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: runtime evidenceはInfrastructure Runtime／LABO ownerへ、設計上の観測点不足はL1-003へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-009-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-003; 常時 BRAIN L2-003/INFRA-003/INFRA-005。各観測pointからpattern/failure trace。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-009-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-009-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-009-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。観測点の設計知識であり実log/metric値保管とは区別。旧evidence/provenanceの記録形のみ類例。 起点asset: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`、`LEGACY-ASSET-5CBA32E9DB5B0FE05589`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。 追加起点はNIO-L3/L10候補とintakeの該当項であり、全てcandidate/unapprovedの旧候補である。項目別のtyped inputs/evidence/unknown/restore-state distinctionだけを意味照合し、NIO全体のoperational obligation/admission/owner設計は継承しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |
| `LEGACY-ASSET-5D41345F55800F23AC38` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:9` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `9174666dbd02a290fc26d2629a0fe3e8da79243b5a4b2ec1158258a4d3274ea4` | NIO-L3-03のmeasurement evidence項目候補。live telemetryの保存やRuntime ownerは移さない。 |
| `LEGACY-ASSET-E239B45CE3FFE8B34D2B` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:140–160` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `d9311d8f2e319da3bc2b0cdbbeec6745bf7e98173a4cf18a2390c8902d990f28` | NIO-CAND-05のobservabilityとcollector unknown条件。候補のevidence設計に限る。 |
| `LEGACY-ASSET-5166C9AB5D52E9926082` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md:8–8` | `009abecf1ef9bb6ac0d69da4bc472e15461481001d88df23ae172147cfedc620` | `1bf5aa9f1444209c1a59b9934d776baffe6c1f42492d9c487271379a237fe4b9` | NIO-L10-02 collector stop/missing/stale is not healthy; candidate oracle only. |

## BRAIN-INFRA-010-FR-01 — `HELIXBRAIN-L2-INFRA-010`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-010`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L69), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-010-002` / semantic digest `sha256:c1980982ae72265e879e460146c829aed253594de05f1a072f1913fe22264ddf`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:312–321` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `e3d673a5ec89eb201512750f9cdef510099a2a1c69ccf3e706effe63696de6a9`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:50–50` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `0d82dcad9c63929ef29003277754ad41eb50d85bb54d93193f0de5dfbf839687`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Backup strategy、retention pattern、replication、restore pattern、recovery validationを相互relationで結ぶ。Backup単独ではRecoverability Evidence Candidateとせず、Backup + Restore verification + required recovery conditionsを別candidateにする。actual RTO/RPOはproduct requirements owner。

**入力**: product target source/revision・recovery patterns。

**出力・責務**: recoverability knowledgeとproduct-supplied target/sourceを別fieldで関連づける。

**否定・戻し先**: BRAINがRTO/RPOやbackup retentionを補完してproduct targetとして提示する、rollback類似をbackup guaranteeとみなす入力は不成立。 実際のbackup／restore実行とtarget値は製品／Runtimeへ、知識構造はL1-003／010へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-010-AC-01 — 正常**: recoverability knowledgeとproduct-supplied target/sourceを別fieldで関連づける。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-010-AC-02 — 否定・境界**: BRAINがRTO/RPOやbackup retentionを補完してproduct targetとして提示する、rollback類似をbackup guaranteeとみなす入力は不成立。 実際のbackup／restore実行とtarget値は製品／Runtimeへ、知識構造はL1-003／010へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: product target source/revision・recovery patterns | `FR-01 / AC-01` | `L10-BRAIN-INFRA-010-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: recoverability knowledgeとproduct-supplied target/sourceを別fieldで関連づける。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-010-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: BRAINがRTO/RPOやbackup retentionを補完してproduct targetとして提示する、rollback類似をbackup guaranteeとみなす入力は不成立。 失敗時戻し先: 実際のbackup／restore実行とtarget値は製品／Runtimeへ、知識構造はL1-003／010へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-010-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 未見restore conditionを加え、verification欠落/target source missingをrecoverability proof扱いしない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-010-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 実際のbackup／restore実行とtarget値は製品／Runtimeへ、知識構造はL1-003／010へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-010-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-003/010; 常時 BRAIN L2-005/INFRA-006。Backup/Restore/recoverability relation。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-010-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-010-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-010-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。backup/restore/recoverability関係。実際のRTO/RPOは製品要求側。旧rollbackをbackup/restore要件へ拡張しない。 起点asset: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。 追加起点はNIO-L3/L10候補とintakeの該当項であり、全てcandidate/unapprovedの旧候補である。項目別のtyped inputs/evidence/unknown/restore-state distinctionだけを意味照合し、NIO全体のoperational obligation/admission/owner設計は継承しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228` | parent FR/AC→normal/negative/boundary oracleの表現形式のみ。旧gateは継承しない。 |
| `LEGACY-ASSET-5D41345F55800F23AC38` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:15` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `b597885c64469f1adba640edf8e28d898df9134039850f37f0094848480d93a7` | NIO-L3-09のevidenceに基づくstateとmissing/stale区別の候補。工程gateは継承しない。 |
| `LEGACY-ASSET-E239B45CE3FFE8B34D2B` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:118–136` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `acbcf22a3d045ee71cabad733742f2db10734f7c816e1bcf7d1bb51bedfda2af` | NIO-CAND-04のrestore設計とverificationの区別。設計義務を示す候補で、Runtime成功evidenceではない。 |
| `LEGACY-ASSET-E239B45CE3FFE8B34D2B` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:229–249` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `7718a8c095e033a1a65215bb8f7aa8205203d6af3a104ce4bb9958e088559869` | NIO-CAND-09のdefined/designed/verified/operated evidence stateの区別。新たな完了gateは設けない。 |
| `LEGACY-ASSET-5166C9AB5D52E9926082` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md:10–11` | `009abecf1ef9bb6ac0d69da4bc472e15461481001d88df23ae172147cfedc620` | `abdc4c5376120a9da965ea5b33502771fbf7238002fa196d222717f04762c0b4` | NIO-L10-04/05 existence or rollback alone is not restore/recovery completion; candidate oracle only. |

## BRAIN-INFRA-011-FR-01 — `HELIXBRAIN-L2-INFRA-011`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-011`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L70), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-011-002` / semantic digest `sha256:b54444968964df01a18e94c416d2c99fa2ad84a969c5714fccacb65913cea8a5`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:322–331` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `ca1ab62c895b7cea2e8f92d29609affb34f3fc0163697ea9d7f814d4a9f60855`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:51–51` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `865b51ab2c0cc7d3914201937ed583bfe61a13e1f5330038615fc71835fe048b`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

fixed/variable cost tendency、idle resource cost、scaling cost、redundancy cost、storage cost、network cost、operational costをtrade-offとして比較する。provider/time依存価格と抽象cost characteristicを区別する。

**入力**: cost characteristic・provider/source/time/effective context。

**出力・責務**: 候補比較にcost characteristicと前提/effective contextを含め、source更新可能性を保持する。

**否定・戻し先**: provider/time/source/contextを外して単価を一般化する入力は不成立。 具体価格・budgetはProduct Core／OS ownerへ、一般化cost characteristicはLABO評価へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-011-AC-01 — 正常**: 候補比較にcost characteristicと前提/effective contextを含め、source更新可能性を保持する。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-011-AC-02 — 否定・境界**: provider/time/source/contextを外して単価を一般化する入力は不成立。 具体価格・budgetはProduct Core／OS ownerへ、一般化cost characteristicはLABO評価へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: cost characteristic・provider/source/time/effective context | `FR-01 / AC-01` | `L10-BRAIN-INFRA-011-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: 候補比較にcost characteristicと前提/effective contextを含め、source更新可能性を保持する。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-011-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: provider/time/source/contextを外して単価を一般化する入力は不成立。 失敗時戻し先: 具体価格・budgetはProduct Core／OS ownerへ、一般化cost characteristicはLABO評価へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-011-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 新しい時点/provider price sourceを伏せ、abstract cost relationとtime-bound price factを混同しない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-011-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 具体価格・budgetはProduct Core／OS ownerへ、一般化cost characteristicはLABO評価へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-011-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-004; 常時 BRAIN L2-004/INFRA-003。source/time-dependent price handling。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-011-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-011-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-011-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。cost特性・tradeoffは扱うがprovider/time依存priceを定数化しない。旧costを候補評価軸の隣接としてのみ扱う。 起点asset: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。


| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |

## BRAIN-INFRA-012-FR-01 — `HELIXBRAIN-L2-INFRA-012`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-012`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L71), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-012-002` / semantic digest `sha256:3004b829636d79c4e4a50198df61e72d37839c99c3177bdf9b7daac0d1f91889`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:332–341` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `6321d9a2fa5685f623d8256c8aa156f6061b284694bfbbe1047b0f7b074e9c51`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:52–52` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `4b9c41a61d3d6b032bacec1a588fe17e14026957888fdbba196cb14d38a55b07`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Object Storageの抽象PatternとS3、GCS、Azure Blob、MinIO等のimplementation exampleをimplements、compatible_with、constraint_of等でrelationする。provider固有事実にsource/versionを付け、compatibility未確認はunknownのままにする。

**入力**: provider-neutral pattern・implementation identity・compatibility source。

**出力・責務**: 抽象Pattern候補とprovider-specific realization/exampleを別々に参照する。

**否定・戻し先**: provider exampleをuniversal pattern/compatible as trueとする、またはunknown compatibilityを適合扱いする入力は拒否。 compatibility conditionのownerまたは該当Patternへ戻し、根拠のない互換宣言をしない。

### 受入条件（AC候補）

- **BRAIN-INFRA-012-AC-01 — 正常**: 抽象Pattern候補とprovider-specific realization/exampleを別々に参照する。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-012-AC-02 — 否定・境界**: provider exampleをuniversal pattern/compatible as trueとする、またはunknown compatibilityを適合扱いする入力は拒否。 compatibility conditionのownerまたは該当Patternへ戻し、根拠のない互換宣言をしない。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: provider-neutral pattern・implementation identity・compatibility source | `FR-01 / AC-01` | `L10-BRAIN-INFRA-012-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: 抽象Pattern候補とprovider-specific realization/exampleを別々に参照する。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-012-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: provider exampleをuniversal pattern/compatible as trueとする、またはunknown compatibilityを適合扱いする入力は拒否。 失敗時戻し先: compatibility conditionのownerまたは該当Patternへ戻し、根拠のない互換宣言をしない。 | `AC-02` | `L10-BRAIN-INFRA-012-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 未見provider exampleのcompatibility evidenceなし状態を渡し、identityは抽象軸を維持し適合はunknown。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-012-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: compatibility conditionのownerまたは該当Patternへ戻し、根拠のない互換宣言をしない。 | `AC-02` | `L10-BRAIN-INFRA-012-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-005/011; 常時 BRAIN L2-005/011/INFRA-002。抽象Patternとimplementation例を別identity軸にする。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-012-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-012-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-012-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。provider-neutral patternとimplementation identityを分離し、互換性unknownを維持。旧provider inventoryをpattern identityにしない。 起点asset: `LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-30FFE84409079C9B06D1`、`LEGACY-ASSET-5CBA32E9DB5B0FE05589`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。


| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |

## BRAIN-INFRA-013-FR-01 — `HELIXBRAIN-L2-INFRA-013`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-013`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L72), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-013-003` / semantic digest `sha256:c80cb45639d03361769fe42b75d0917d7c58c2e4478ea327c2ce06053720601d`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:342–351` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `915285630ae5080ac424fe09f181239d97410b0e9c6442a75c15ad3c33e38173`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:53–53` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `87dab47321ea76f2ddd63ac283d420d153a7923e2d9960a80a2843424b009fb9`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Local machine、VPS、Dedicated server、Cloud、GPU node、Distributed worker node等をResource/Capability modelに結ぶprovider/environment-neutralな抽象知識を扱う。Cloudや特定computer構成を必須にしない。

**入力**: abstract resource/capability identity/meaning。

**出力・責務**: resource/capability concept identity、meaning、relationをabstract levelで返す。

**否定・戻し先**: credential/state/operation permission/live resource recordを抽象知識recordへ混入しない。 実環境identity/stateはInfrastructure Runtimeへ、security境界はSECURITYへ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-013-AC-01 — 正常**: resource/capability concept identity、meaning、relationをabstract levelで返す。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-013-AC-02 — 否定・境界**: credential/state/operation permission/live resource recordを抽象知識recordへ混入しない。 実環境identity/stateはInfrastructure Runtimeへ、security境界はSECURITYへ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: abstract resource/capability identity/meaning | `FR-01 / AC-01` | `L10-BRAIN-INFRA-013-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: resource/capability concept identity、meaning、relationをabstract levelで返す。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-013-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: credential/state/operation permission/live resource recordを抽象知識recordへ混入しない。 失敗時戻し先: 実環境identity/stateはInfrastructure Runtimeへ、security境界はSECURITYへ戻す。 | `AC-02` | `L10-BRAIN-INFRA-013-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 未見実行基盤型をabstract modelへ投入し、Cloud前提や実resource discoveryなしでcandidateに留める。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-013-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 実環境identity/stateはInfrastructure Runtimeへ、security境界はSECURITYへ戻す。 | `AC-02` | `L10-BRAIN-INFRA-013-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-001/002; 常時 BRAIN L2-001/002/INFRA-012/024。abstract resource/capability、live state/authorityなし。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-013-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-013-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-013-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出


再導出。common abstract resource/capabilityは知識モデル。credential/state/operation authorityは対象外。 起点asset: `LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-5CBA32E9DB5B0FE05589`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |

## BRAIN-INFRA-014-FR-01 — `HELIXBRAIN-L2-INFRA-014`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-014`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L73), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-014-003` / semantic digest `sha256:e3484392ff5b91fa1b8c697282d133a6425141c87a1d5cbe145c3d21ec172cbe`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:352–361` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `adc8d9d3b668980f2912b120e3d13889419670ed190ac7f78589d8f692d14479`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:54–54` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `6d45f4349873d7a7365ad23af8a0a7e24a99755f7ed8d9feb33c96248663d28e`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Web→Load Balancer→Application→Database→Backup、およびApplication→Queue→Worker等のtopologyを表し、depends_on、communicates_with、replicated_by、backed_up_by、monitored_by、failover_to、secured_by、deployed_on、scales_withを両endpoint identityと意味付きにする。component listだけではtopology成立としない。

**入力**: topology design candidate・node/edge identity・source。

**出力・責務**: nodes/edgesをsource・typed semanticsとともに識別し、unknown endpointを保持する。

**否定・戻し先**: endpoint欠落/name-only edge/unsupported causal link/runtime state claimを確定しない。 topology実状態はRuntimeへ、構造relationの意味はL1-005へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-014-AC-01 — 正常**: nodes/edgesをsource・typed semanticsとともに識別し、unknown endpointを保持する。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-014-AC-02 — 否定・境界**: endpoint欠落/name-only edge/unsupported causal link/runtime state claimを確定しない。 topology実状態はRuntimeへ、構造relationの意味はL1-005へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: topology design candidate・node/edge identity・source | `FR-01 / AC-01` | `L10-BRAIN-INFRA-014-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: nodes/edgesをsource・typed semanticsとともに識別し、unknown endpointを保持する。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-014-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: endpoint欠落/name-only edge/unsupported causal link/runtime state claimを確定しない。 失敗時戻し先: topology実状態はRuntimeへ、構造relationの意味はL1-005へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-014-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 伏せた別component topologyとunknown endpoint relationを投入し、未確定endpointをruntimeで解決しない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-014-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: topology実状態はRuntimeへ、構造relationの意味はL1-005へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-014-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-005; 常時 BRAIN L2-005/INFRA-001/002。typed endpoint relation graph。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-014-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-014-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-014-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出


部分類例＋再導出。typed topology graph endpoint/semanticsは設計関係で、runtime topology/stateではない。 起点asset: `LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-7E16E3B80335D8EC6F35`、`LEGACY-ASSET-FF7403E1E40E539FCE45`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-7E16E3B80335D8EC6F35` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md:17–39` | `869d4494c8f5cfaea4d90f29392ee1a2c7c63cc2084712eb43e0c1d91cdeca60` | `e738afbdd787952d6ebbf6d2791fa444e3ddbce56e319793bccc5799fad11091` | typed edge/error/unknown検査形だけ。旧L5 integrationを実行・移植しない。 |
| `LEGACY-ASSET-FF7403E1E40E539FCE45` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L7-design-catalog-relation-projection-unit-test-design.md:21–32` | `f8277863f22243231009a02efb36acd933f78e3357f8ee0fe48971d22d93c8d6` | `db9ad2bcea2e39860b1a6efb5e60ed986a2d51e916b30be283416f57980fbec4` | typed relation/projection/stale sourceの類例としてのみ。L7 runtime/algorithmを移植しない。 |

## BRAIN-INFRA-015-FR-01 — `HELIXBRAIN-L2-INFRA-015`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-015`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L74), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-015-002` / semantic digest `sha256:72fb876a117134621b30cba2884641d273bbd16351b2045bdf98abc2d5f75f49`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:362–371` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `11b9eff2eaac4b17aace22ac405581b9ceb7dab34b260320f246992b28f600af`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:55–55` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `58e16ddb2d0ad5943173c42620ce1efba738620f464f2131dd2df242f7b5232f`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

API→Network→Latency / Availability、Data→Storage / Database→Backup / Recovery、SecurityがNetwork / Runtime / Credentialを制約、Visual / UXがFrontend Delivery / CDN / Performanceに影響し得る例を、affects、constrains、may_affect等のscope付きrelationとして保持する。因果/constraintを無根拠に断定しない。

**入力**: cross-domain source/evidence・relation claim。

**出力・責務**: relation type・direction/scope・evidenceを保持して他Domain patternへtraceする。

**否定・戻し先**: 相関やname similarityからcauseを断定する、scope/sourceのないeffectを確定する入力は不成立。 関係先Domainの責務ownerへ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-015-AC-01 — 正常**: relation type・direction/scope・evidenceを保持して他Domain patternへtraceする。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-015-AC-02 — 否定・境界**: 相関やname similarityからcauseを断定する、scope/sourceのないeffectを確定する入力は不成立。 関係先Domainの責務ownerへ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: cross-domain source/evidence・relation claim | `FR-01 / AC-01` | `L10-BRAIN-INFRA-015-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: relation type・direction/scope・evidenceを保持して他Domain patternへtraceする。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-015-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: 相関やname similarityからcauseを断定する、scope/sourceのないeffectを確定する入力は不成立。 失敗時戻し先: 関係先Domainの責務ownerへ戻す。 | `AC-02` | `L10-BRAIN-INFRA-015-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 未見Security/UX cross-domain claimで根拠不足を含め、may-affect以上を因果確定しない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-015-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 関係先Domainの責務ownerへ戻す。 | `AC-02` | `L10-BRAIN-INFRA-015-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-005; 常時 BRAIN L2-005と各Domain identity/source。cross-domain scope/evidence。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-015-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-015-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-015-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。cross-domain relationはaffects/constrains/may affectと根拠を区別し、因果を推定しない。 起点asset: `LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-7E16E3B80335D8EC6F35`、`LEGACY-ASSET-FF7403E1E40E539FCE45`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-7E16E3B80335D8EC6F35` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md:17–39` | `869d4494c8f5cfaea4d90f29392ee1a2c7c63cc2084712eb43e0c1d91cdeca60` | `e738afbdd787952d6ebbf6d2791fa444e3ddbce56e319793bccc5799fad11091` | typed edge/error/unknown検査形だけ。旧L5 integrationを実行・移植しない。 |
| `LEGACY-ASSET-FF7403E1E40E539FCE45` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L7-design-catalog-relation-projection-unit-test-design.md:21–32` | `f8277863f22243231009a02efb36acd933f78e3357f8ee0fe48971d22d93c8d6` | `db9ad2bcea2e39860b1a6efb5e60ed986a2d51e916b30be283416f57980fbec4` | typed relation/projection/stale sourceの類例としてのみ。L7 runtime/algorithmを移植しない。 |

## BRAIN-INFRA-016-FR-01 — `HELIXBRAIN-L2-INFRA-016`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-016`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L75), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-016-003` / semantic digest `sha256:a9b3694a104e24453025ca1bbefc2bdb0683078c5653ad1489a5c9c810ed1c8b`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:372–381` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `835303e5f143675783dbef7891d035b443472a05847cdaaecb199eb801c2b7c9`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:56–56` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `54fc593f9197339f43229875d327cf4e78ca084c7b146f44c4c16157fd8a026f`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

Single Point of Failure、Shared mutable production state、Unbounded Retry、Unbounded Queue、Missing Timeout、Backup Without Restore Test、Monitoring Without Action、Manual-only Recovery、Hidden Dependency、Undocumented Egress、Unbounded Resource Growthを、成立condition、failure manifestation、detection clue、safer alternativeへ結ぶ。例示を全状況の禁止へ一般化しない。

**入力**: anti-pattern/failure/source/context/alternative。

**出力・責務**: negative patternと成立範囲、反例、代替、sourceを候補として返す。

**否定・戻し先**: condition削除、all-context prohibition、source/evidenceなしのrisk claimを確定しない。 検出証拠・適用状況が不明ならfindingをunknownとしてLABO評価へ戻す。

### 受入条件（AC候補）

- **BRAIN-INFRA-016-AC-01 — 正常**: negative patternと成立範囲、反例、代替、sourceを候補として返す。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-016-AC-02 — 否定・境界**: condition削除、all-context prohibition、source/evidenceなしのrisk claimを確定しない。 検出証拠・適用状況が不明ならfindingをunknownとしてLABO評価へ戻す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: anti-pattern/failure/source/context/alternative | `FR-01 / AC-01` | `L10-BRAIN-INFRA-016-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: negative patternと成立範囲、反例、代替、sourceを候補として返す。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-016-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: condition削除、all-context prohibition、source/evidenceなしのrisk claimを確定しない。 失敗時戻し先: 検出証拠・適用状況が不明ならfindingをunknownとしてLABO評価へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-016-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: 別contextのheld-out conditionとcounterexampleを渡し、anti-patternを全scope banへしない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-016-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 検出証拠・適用状況が不明ならfindingをunknownとしてLABO評価へ戻す。 | `AC-02` | `L10-BRAIN-INFRA-016-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-010; 常時 BRAIN L2-010/INFRA-005/006/009。各列挙条件/兆候/代替。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-016-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-016-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-016-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出


再導出。条件付きantipatternを表す。旧failure例を普遍禁止や一律gateにしない。 起点asset: `LEGACY-ASSET-335176749F6322C3CD8D`、`LEGACY-ASSET-7F8960532611D89D03E1`、`LEGACY-ASSET-879D95C07B789C9502CF`、`LEGACY-ASSET-30FFE84409079C9B06D1`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-335176749F6322C3CD8D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:41–43` | `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` | `b75a90583c2e87f9f8bb2ddbae123e70d2ef8a5591b507d70ee62acd40444fb8` | semantic identity、Pattern contract、製品固有意味分離の隣接意味。旧UI/Design-HARNESS権限・実装は移植しない。 |
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–69` | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `6b13fd9b425c11d0925cfc0299638083bef985c56c749bd0b2d0493234da0792` | 条件・比較・evidence・unknown・rollbackの隣接形。外部環境変更、provider/config authorityは移植しない。 |
| `LEGACY-ASSET-879D95C07B789C9502CF` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:10–30` | `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191` | `4ebd3c1ad8a9d3469fe76020a956a3656fa6fe45630f3f8124e00cc225eea89a` | contract/profile/isolation等の正常・拒否oracle形だけ。UI実装と旧self-approval/gateは移植しない。 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:20–37` | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `57e7e0588d791b3c9f69618e678d5104e58cad90ca0fa086b302283865de0b6e` | unknown/stale/source/failureのoracle形の参考のみ。旧実行・rollback操作を移植しない。 |

## BRAIN-INFRA-017-FR-01 — `HELIXBRAIN-L2-INFRA-017`

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-017`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L76), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-017-002` / semantic digest `sha256:191b4c13d075cd3a9cfbd938bf5d0a961615936e30a9266a904dc633c28fa348`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:382–391` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `d7e5a7a4d029db3bd92db437043b07c7dc4d6923c481a338815382e23c6f4795`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:57–57` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `9209db4b4e0810bad881e9a714120abaae22beb29bc0490e259d281423133420`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
### 要件候補

experimental、observed、validated、mature、deprecated、retired等のmaturityと根拠relationを保持し、BRAIN versionとprojectでの利用版を区別する。内部Productで一度成功しただけでuniversal Patternに昇格しない。

**入力**: maturity claim・evidence/source・scope/version。

**出力・責務**: evidenceごとのsource/scope/version/結果とmaturity claimをtraceし、範囲を超えるclaimを限定する。

**否定・戻し先**: 一回のinternal successまたはscope違いを普遍maturity根拠にする入力は不成立。 評価不足はexperimental／observed candidateに留め、LABO評価へ戻し、採用を推定しない。

### 受入条件（AC候補）

- **BRAIN-INFRA-017-AC-01 — 正常**: evidenceごとのsource/scope/version/結果とmaturity claimをtraceし、範囲を超えるclaimを限定する。 固定parent owner/版を越えず、source・revision・scopeが追跡可能。
- **BRAIN-INFRA-017-AC-02 — 否定・境界**: 一回のinternal successまたはscope違いを普遍maturity根拠にする入力は不成立。 評価不足はexperimental／observed candidateに留め、LABO評価へ戻し、採用を推定しない。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input/source: maturity claim・evidence/source・scope/version | `FR-01 / AC-01` | `L10-BRAIN-INFRA-017-C01` | 入力identity/source/revision/scopeを照合 |
| Guarantee/output: evidenceごとのsource/scope/version/結果とmaturity claimをtraceし、範囲を超えるclaimを限定する。 | `FR-01 / AC-01` | `L10-BRAIN-INFRA-017-C01` | 親の指定field・状態・責務を観測 |
| Negative/failure: 一回のinternal successまたはscope違いを普遍maturity根拠にする入力は不成立。 失敗時戻し先: 評価不足はexperimental／observed candidateに留め、LABO評価へ戻し、採用を推定しない。 | `AC-02` | `L10-BRAIN-INFRA-017-C02` | 不足/矛盾/unknownを成功や確定へ丸めない |
| Held-out boundary: held-out scope/versionのevidenceと単一内部成功を用い、claim範囲を超えるmaturityを付けない。 | `AC-01,AC-02` | `L10-BRAIN-INFRA-017-C03` | source/condition scope外をunknown/未評価に保つ |
| Owner/backflow: 評価不足はexperimental／observed candidateに留め、LABO評価へ戻し、採用を推定しない。 | `AC-02` | `L10-BRAIN-INFRA-017-C02` | stop reasonとparent ownerを観測 |
| Dependencies/PO bundling: 親L1-007/008; 常時 BRAIN L2-007/008/020/025。evidence/scope/versionとproject-use state分離。 | `FR-01 / AC-01,02` | `L10-BRAIN-INFRA-017-C01,C02` | dependency identity/sourceと戻し先を照合 |
| Version candidate: 1.0 / Stage 2b | `AC-01,AC-02` | `L10-BRAIN-INFRA-017-C01,C02` | release/implementation authorizationと混同しない |
| L11例・否定case | 親L11固定spanに記載 / AC-01,AC-02 | `L10-BRAIN-INFRA-017-C01,C02` | 正常・invalid conditionで行動oracleを検証 |

### 旧L3／対test-designからの再利用・再導出

再導出。maturityとevidenceを関連付け、単一内部成功を普遍的成熟度にしない。旧registry lifecycleは成熟度意味と別。 起点asset: `LEGACY-ASSET-5CBA32E9DB5B0FE05589`、`LEGACY-ASSET-603D0E8D8193914F4AC0`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`。file path/line/full SHA/raw-span SHAを下表へ明記。旧schema・runtime・algorithm・CLI・旧gateを実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲 |
|---|---|---|---|---|
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6` | 識別子・source provenance・trace・状態分離の隣接形だけ。BRAIN知識モデル／登録実装には継承しない。 |
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md:45–83` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` | `986ca8baec1dfd0ed53f3204dcc06895fb14a8b072a4d7893106b25f4254c5f7` | typed object/relationの形だけ。refactoring固有catalogや役割をBRAINへ流用しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228` | parent FR/AC→normal/negative/boundary oracleの表現形式のみ。旧gateは継承しない。 |



## Stage 4 — connection候補の部分草稿（未承認）

対象はPO固定revisionで採択された1.0の7 identity `HELIXBRAIN-L2-018/019/020/021/022/023/030`（G0 Stage 4）だけである。保留・不採択候補を親にせず、後続版を1.0へ前倒ししない。下記はL2/L11に定めるconnection境界の要件候補で、接続実装やruntimeを決めない。

## BRAIN-018-FR-01 — `HELIXBRAIN-L2-018`（Stage 4、候補）

### 親revisionとauthority

- PO採択根拠: [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L77`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L77), decision full SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`; exact adopted registration `MPR-RC-HELIXBRAIN-L2-018-002` (main `633bf12` decision row only; later register metadata is not approval)。L2固定本文: `docs/helix-brain/L2-requirements/brain-requirements.md:394–403` raw span SHA-256 `9dccc78beb510714efbeb09534aa18619abdfd672df1f9fd44088718a3b3dc4d`, full SHA-256 `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`。L11固定本文: `docs/helix-brain/L11-acceptance/brain-acceptance.md:58–58` raw span SHA-256 `028fea2baa9ee9a199c8207ec22e0fd9344a525460ed1db29b5214cb730152b9`, full SHA-256 `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`。version_target `1.0`、G0 sequence `Stage 4`。後続のregister metadataから承認を継承しない。
- 依存: L1-007/011、L2-007/011、HARNESS-CORE候補出力contract。

### 要件候補

製品HELIX-HARNESS-COREが原本を解体して抽出した汎用Pattern/Unit/Part候補だけを、候補source/provenance/revisionおよび製品固有要素との関係とともに受領する。raw originalは受け取らず、製品名・要求・画面・業務規則・利用者判断を汎用Patternとして確定/保存しない。receiptはcandidate intakeを示し、成立・成熟・採用を意味しない。原本の保持期限や破棄証拠を新設しない。

### 受入条件（AC候補）

- **BRAIN-018-AC-01 — 正常**: CORE抽出candidateにsource/provenance、source revision、抽出候補と製品固有要素とのrelationを添え、raw originalを含めずreceiptを発行する。 列挙されたsource、revision、原本/抽出候補の区別、製品固有要素とのrelation、受取identityの5 relation coverage 100%とraw original受領/誤promotion 0件を候補値にする。 これは根拠付き測定候補で、PO承認値・実測値ではない。
- **BRAIN-018-AC-02 — 否定・境界**: raw original、製品固有screen/business rule/user decision、source/revision欠落、または受領だけでaccepted/matureとする変異を個別および併発で投入し、隔離/CORE返却、採用state不変を判定する。 由来または製品固有意味を分離できない候補は隔離し、製品Coreへ返す。採用判定はL2-025へ委ねる。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input・版・範囲 | `BRAIN-018-FR-01` / `BRAIN-018-AC-01` | `L10-BRAIN-018-C01` | 固定L2/L11と一致するrevision/scopeを記録 |
| 保証・出力: HELIX-HARNESS-CORE再利用候補intake | `BRAIN-018-FR-01` / `BRAIN-018-AC-01` | `L10-BRAIN-018-C01` | 全必須field・receipt・状態を維持 |
| 否定条件・失敗時の戻し先 | `BRAIN-018-AC-02` | `L10-BRAIN-018-C02` | 不足をunknown/holdにし、不足先をownerへ戻す |
| 未見入力の境界 | `BRAIN-018-AC-01,BRAIN-018-AC-02` | `L10-BRAIN-018-C03` | 十分な未見入力は同契約で評価し、不足箇所だけunknown |
| 依存と版 | `BRAIN-018-FR-01` | `L10-BRAIN-018-C01,L10-BRAIN-018-C02` | L1-007/011、L2-007/011、HARNESS-CORE候補出力contract。 版1.0 / Stage 4 |
| PO固定L11の例 | 固定L11全例 | `L10-BRAIN-018-C01,L10-BRAIN-018-C02,L10-BRAIN-018-C03` | 否定条件・停止・戻し先も個別照合 |

### 旧L3／対test-designからの再利用・再導出

旧System Synthesisのstable source identityと推測接続拒否の意味を隣接起点として再導出。完全一致再利用はなく、raw original除外、candidate-only、CORE ownerはPO固定L2から導出。 完全一致移植はしない。旧runtime・schema・algorithm・CLI・testは実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲・判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-F1F753F31DB8D874EF21` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:42–67` | `69c8a47a4b67729fceabb3df85ecd1c2caa0b9faa5e5b7d958eff48517fdbd79` | `bb4718ba90454dd16d3a1ecd3c3295d3da999f7f8dcf64199af820c366a9faf2` | 定型接続graph、source identity/revision/provenanceと候補・確定状態の分離を隣接起点として再導出。旧composition capabilityや実行authorityは移植しない。 |
| `LEGACY-ASSET-BEAB5EE27CD04F5E866F` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/system-synthesis-acceptance.md:27–35` | `ed09b52fd9f0b0ed95e924730bc9132c375588520ad7041777188c726d994c16` | `88ba206fda8fc988743331694258694393a9b990b8264892b667bd79f593b0c8` | identity/provenance欠落・推測接続拒否のoracle形式だけを再導出し、旧case/gateを持ち込まない。 |


## BRAIN-019-FR-01 — `HELIXBRAIN-L2-019`（Stage 4、候補）

### 親revisionとauthority

- PO採択根拠: [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L78`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L78), decision full SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`; exact adopted registration `MPR-RC-HELIXBRAIN-L2-019-002` (main `633bf12` decision row only; later register metadata is not approval)。L2固定本文: `docs/helix-brain/L2-requirements/brain-requirements.md:404–413` raw span SHA-256 `e410ff28aaf5e2f5368441b407ab7044829a94e57cbd747d029a21e2fac916b5`, full SHA-256 `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`。L11固定本文: `docs/helix-brain/L11-acceptance/brain-acceptance.md:59–59` raw span SHA-256 `bd35e9df0c69f1cbf061193c67cbb44ac991a484cf6b143155f61eabe6319152`, full SHA-256 `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`。version_target `1.0`、G0 sequence `Stage 4`。後続のregister metadataから承認を継承しない。
- 依存: L1-003/004/012、L2-003/004/008/012、HARNESS-CORE受領contract。

### 要件候補

Product Coreの対象課題・required input・constraints・参照可能なBRAIN knowledge identity/versionに対し、candidate Pattern/Design Unit/Part、required input、適用条件、alternative、relation、trade-off、counterexample、根拠、maturity、exact knowledge versionを返し、複数成立候補を比較可能なまま保持する。候補の存在/maturityを製品採用へ変換しない。

### 受入条件（AC候補）

- **BRAIN-019-AC-01 — 正常**: scopeとrequired inputがそろうqueryに、二つの候補、条件、alternatives, relation, tradeoff, counterexample, evidence, maturity, exact versionを別々に返し、採用選択なしを観測する。 全10 応答分類 (Pattern/Unit/Part, required input, conditions, alternative, relation, trade-off, counterexample, evidence, maturity, version)のtrace coverage 100%、根拠のない推薦/採用0件を候補値にする。 これは根拠付き測定候補で、PO承認値・実測値ではない。
- **BRAIN-019-AC-02 — 否定・境界**: required input欠落、version/meaning conflict、反例/根拠欠落を個別/併発で投入し、不足を照会・矛盾をownerへ戻し、unknownでは候補推薦を出さない。候補の一つを採用済みにしない。 不足inputはProduct Coreへ照会し、knowledge meaning/version矛盾はBRAIN L1-003/008または知識ownerへ返す。unknownは推薦なし。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input・版・範囲 | `BRAIN-019-FR-01` / `BRAIN-019-AC-01` | `L10-BRAIN-019-C01` | 固定L2/L11と一致するrevision/scopeを記録 |
| 保証・出力: Product Core知識query | `BRAIN-019-FR-01` / `BRAIN-019-AC-01` | `L10-BRAIN-019-C01` | 全必須field・receipt・状態を維持 |
| 否定条件・失敗時の戻し先 | `BRAIN-019-AC-02` | `L10-BRAIN-019-C02` | 不足をunknown/holdにし、不足先をownerへ戻す |
| 未見入力の境界 | `BRAIN-019-AC-01,BRAIN-019-AC-02` | `L10-BRAIN-019-C03` | 十分な未見入力は同契約で評価し、不足箇所だけunknown |
| 依存と版 | `BRAIN-019-FR-01` | `L10-BRAIN-019-C01,L10-BRAIN-019-C02` | L1-003/004/012、L2-003/004/008/012、HARNESS-CORE受領contract。 版1.0 / Stage 4 |
| PO固定L11の例 | 固定L11全例 | `L10-BRAIN-019-C01,L10-BRAIN-019-C02,L10-BRAIN-019-C03` | 否定条件・停止・戻し先も個別照合 |

### 旧L3／対test-designからの再利用・再導出

UWJのfacts/candidate/constraint/counterevidenceは隣接起点として再導出。旧interview schema/scoringと人承認gateは置換。 完全一致移植はしない。旧runtime・schema・algorithm・CLI・testは実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲・判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-5EE032D657C221184B00` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:43–54` | `e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b` | `04b90844a6a745018b0366b5019fbf687e3215d47a74097695d29711fb712889` | facts/candidate/condition/alternative/counterevidenceを含む提案の隣接意味を再導出。旧schema・採点・承認階層は置換。 |
| `LEGACY-ASSET-6FFD7F4E58066D08B053` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:25–32` | `1c4e07263eba5254cfe66b920c4baf46227e0e07cb47ff60ac2e854740645db3` | `2a56a119a949c64b4344c37c9bf6c97d543c00edf027f6c3041de33fcf05c4fd` | 候補・根拠・未解決要素の欠落oracleを部分再利用し、旧workflow/testを実行しない。 |


## BRAIN-020-FR-01 — `HELIXBRAIN-L2-020`（Stage 4、候補）

### 親revisionとauthority

- PO採択根拠: [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L79`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L79), decision full SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`; exact adopted registration `MPR-RC-HELIXBRAIN-L2-020-002` (main `633bf12` decision row only; later register metadata is not approval)。L2固定本文: `docs/helix-brain/L2-requirements/brain-requirements.md:414–423` raw span SHA-256 `28d2b53bfdd0db2353942c4e880a4cc9d48069d302ecffc0cded0f94cc08fbc6`, full SHA-256 `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`。L11固定本文: `docs/helix-brain/L11-acceptance/brain-acceptance.md:60–60` raw span SHA-256 `a2e14b5a11026650f650dcc5d622fae8b5526342c7a198f7a80bb258ed45f3a4`, full SHA-256 `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`。version_target `1.0`、G0 sequence `Stage 4`。後続のregister metadataから承認を継承しない。
- 依存: L1-007/009/010、L2-007/008/009/010、LABO evaluation contract。Infrastructure maturity扱い時のみL2-INFRA-017。

### 要件候補

LABOが結んだ対象revision・候補revision・scope・method・evidence・result・failure・counterexample・unassessed rangeを保持してBRAIN候補入力とsource/version/evaluation identityをreceiptで結ぶ。単一実績・AI生成・evaluation resultだけでestablished Patternとせず、scope/limitationを保持し、OS登録・振分けとBRAIN内独立検証後の採否/成熟を先取りしない。Infrastructure候補のmaturityを扱う場合だけINFRA-017 evidenceを同revisionへ結ぶ。

### 受入条件（AC候補）

- **BRAIN-020-AC-01 — 正常**: 候補revision一致のLABO評価receiptにscope/method/evidence/result/failure/counterexample/unassessed rangeを全て含め、evaluation identityとsource/versionを結びcandidate inputへ登録する。resultは未成熟candidateのまま。 8評価relation (target rev, candidate rev, scope, method, evidence, result, failure/counterexample, unassessed range)を完全traceし、対象不一致または部分評価からの誤昇格0件を候補値にする。 これは根拠付き測定候補で、PO承認値・実測値ではない。
- **BRAIN-020-AC-02 — 否定・境界**: 対象revision不一致、failure/counterexample/unassessed rangeいずれか欠落、評価resultだけの昇格を個別/併発で投入し、LABOへ返しOS state/BRAIN adoptionを変えない。 対象revision不一致/評価部分欠落はunknown candidateとして止めLABOへ返す。OS登録stateの正本はOS。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input・版・範囲 | `BRAIN-020-FR-01` / `BRAIN-020-AC-01` | `L10-BRAIN-020-C01` | 固定L2/L11と一致するrevision/scopeを記録 |
| 保証・出力: LABO評価結果の候補接続 | `BRAIN-020-FR-01` / `BRAIN-020-AC-01` | `L10-BRAIN-020-C01` | 全必須field・receipt・状態を維持 |
| 否定条件・失敗時の戻し先 | `BRAIN-020-AC-02` | `L10-BRAIN-020-C02` | 不足をunknown/holdにし、不足先をownerへ戻す |
| 未見入力の境界 | `BRAIN-020-AC-01,BRAIN-020-AC-02` | `L10-BRAIN-020-C03` | 十分な未見入力は同契約で評価し、不足箇所だけunknown |
| 依存と版 | `BRAIN-020-FR-01` | `L10-BRAIN-020-C01,L10-BRAIN-020-C02` | L1-007/009/010、L2-007/008/009/010、LABO evaluation contract。Infrastructure maturity扱い時のみL2-INFRA-017。 版1.0 / Stage 4 |
| PO固定L11の例 | 固定L11全例 | `L10-BRAIN-020-C01,L10-BRAIN-020-C02,L10-BRAIN-020-C03` | 否定条件・停止・戻し先も個別照合 |

### 旧L3／対test-designからの再利用・再導出

HELIX-Benchのscope/method/failure/欠測保持と自己申告score拒否の意味を部分再導出。旧benchmark値/runner/provider/admission/thresholdは置換。 完全一致移植はしない。旧runtime・schema・algorithm・CLI・testは実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲・判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:37–74` | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | `9713abaef57d82c85feea42de8189cb531ba8fdc0789bfa8a5409408fcfcc56f` | 対象snapshot・評価軸・失敗と欠測を保持する意味を再導出。旧benchmark値、runner、provider、admission判断は置換。 |
| `LEGACY-ASSET-A952A3A175EB82A4781B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:21–39` | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `b26c073b9441042e8e47e7014a0c12eeca9bfe012262f69ca7da5861f378746a` | 対象revision・scope・failure/欠測・自己申告拒否のoracle形だけを再導出し、旧数値や件数を移さない。 |


## BRAIN-021-FR-01 — `HELIXBRAIN-L2-021`（Stage 4、候補）

### 親revisionとauthority

- PO採択根拠: [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L80`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L80), decision full SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`; exact adopted registration `MPR-RC-HELIXBRAIN-L2-021-002` (main `633bf12` decision row only; later register metadata is not approval)。L2固定本文: `docs/helix-brain/L2-requirements/brain-requirements.md:424–433` raw span SHA-256 `439be1b0d6f2ab9cdb9c17ed3c3f3dab19c40885cd95d5800b8419b7815dfa1b`, full SHA-256 `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`。L11固定本文: `docs/helix-brain/L11-acceptance/brain-acceptance.md:61–61` raw span SHA-256 `b2049bccaa192a54e930af64845a43a504e53b7a71a4a55650002bcdac60444f`, full SHA-256 `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`。version_target `1.0`、G0 sequence `Stage 4`。後続のregister metadataから承認を継承しない。
- 依存: L1-003/004/012、L2-003/004/008/012、INTELLIGENCE query/response contract。

### 要件候補

INTELLIGENCEのquery/scopeへBRAIN knowledge identity/version、candidate、required input、条件、alternative、constraints、counterexample、evidenceを判断材料として返す。BRAINはruntime結論/選択を確定せず、INTELLIGENCEはBRAIN knowledgeを暗黙変更・昇格しない。推薦材料と稼働中判断を分離する。

### 受入条件（AC候補）

- **BRAIN-021-AC-01 — 正常**: 対象query scopeに一致した知識候補をsource/version・条件・根拠込みで返し、response statusをcandidate informationとして記録する。 返却のknowledge identity/version/candidate/input/conditions/alternative/constraint/counterexample/evidence全field coverage、BRAIN mutation/runtime conclusion 0件を候補とする。 これは根拠付き測定候補で、PO承認値・実測値ではない。
- **BRAIN-021-AC-02 — 否定・境界**: runtime選択/結論を要求、BRAIN knowledge書換えを行う、scope/source versionが欠ける変異を投入し、決定・mutationなし、対象条件不足はINTELLIGENCE、意味/版不整合はBRAINへ返す。 対象条件不足はINTELLIGENCEへ返し、knowledge意味/版不整合はBRAIN L1またはknowledge ownerへ返す。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input・版・範囲 | `BRAIN-021-FR-01` / `BRAIN-021-AC-01` | `L10-BRAIN-021-C01` | 固定L2/L11と一致するrevision/scopeを記録 |
| 保証・出力: INTELLIGENCE判断材料の受渡し | `BRAIN-021-FR-01` / `BRAIN-021-AC-01` | `L10-BRAIN-021-C01` | 全必須field・receipt・状態を維持 |
| 否定条件・失敗時の戻し先 | `BRAIN-021-AC-02` | `L10-BRAIN-021-C02` | 不足をunknown/holdにし、不足先をownerへ戻す |
| 未見入力の境界 | `BRAIN-021-AC-01,BRAIN-021-AC-02` | `L10-BRAIN-021-C03` | 十分な未見入力は同契約で評価し、不足箇所だけunknown |
| 依存と版 | `BRAIN-021-FR-01` | `L10-BRAIN-021-C01,L10-BRAIN-021-C02` | L1-003/004/012、L2-003/004/008/012、INTELLIGENCE query/response contract。 版1.0 / Stage 4 |
| PO固定L11の例 | 固定L11全例 | `L10-BRAIN-021-C01,L10-BRAIN-021-C02,L10-BRAIN-021-C03` | 否定条件・停止・戻し先も個別照合 |

### 旧L3／対test-designからの再利用・再導出

UWJ proposal-only、counterevidence、unresolvedと自己承認拒否は隣接起点。INTELLIGENCE runtime決定との現行分離はPO固定L2から再導出し旧workflow/gateを置換。 完全一致移植はしない。旧runtime・schema・algorithm・CLI・testは実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲・判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-5EE032D657C221184B00` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:53–60` | `e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b` | `ed972693c1c685d412cb9fa6facd8690255882fda29ac8bb96009bab0dc01fbc` | facts/candidate/constraint/counterevidence/unresolvedとproposal境界の隣接起点のみを再導出。INTELLIGENCE向け現authority境界はL2固定文から起草。 |
| `LEGACY-ASSET-6FFD7F4E58066D08B053` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:25–32` | `1c4e07263eba5254cfe66b920c4baf46227e0e07cb47ff60ac2e854740645db3` | `2a56a119a949c64b4344c37c9bf6c97d543c00edf027f6c3041de33fcf05c4fd` | proposal欠落・自己承認の拒否oracleを限定参照し、旧workflow承認動作は置換。 |


## BRAIN-022-FR-01 — `HELIXBRAIN-L2-022`（Stage 4、候補）

### 親revisionとauthority

- PO採択根拠: [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L81`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L81), decision full SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`; exact adopted registration `MPR-RC-HELIXBRAIN-L2-022-002` (main `633bf12` decision row only; later register metadata is not approval)。L2固定本文: `docs/helix-brain/L2-requirements/brain-requirements.md:434–443` raw span SHA-256 `590abf50787f50c3d1fd640e34e75bd337d52829aff9cea9474f2601f7ef4a42`, full SHA-256 `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`。L11固定本文: `docs/helix-brain/L11-acceptance/brain-acceptance.md:62–62` raw span SHA-256 `0ce688f2e9115c2ae76f188a209862ed2a64088cdda85c930f4c828236f70258`, full SHA-256 `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`。version_target `1.0`、G0 sequence `Stage 4`。後続のregister metadataから承認を継承しない。
- 依存: L1-003/005/012、L2-003/005/008、HARNESS-L2-009 contract。

### 要件候補

BRAIN Patternのrequired input・前提・constraint・関連Pattern・evidenceを受け、HARNESS-L2-009の設計義務へ対応づけた設計inputとPattern/Unit/Part・dependency relation・source knowledge identity/versionを返す。HARNESS-CORE/HARNESSが工程表・遷移図・実装優先順位を導く材料を提供するが、BRAINは製品要求値や設計選択、工程表/遷移図/優先順位を決めない。required input/dependencyを落とさず双方向traceする。

### 受入条件（AC候補）

- **BRAIN-022-AC-01 — 正常**: Pattern/Unit/Partのrequired inputとdependenciesをHARNESS-L2-009 obligationへforward traceし、obligationから同じsource knowledge revision/fieldへreverse traceする。 required input/dependencyからobligationへのforward edgeと逆edgeの完全性100%、orphan/wrong revision/product-value decisions 0件を候補にする。 これは根拠付き測定候補で、PO承認値・実測値ではない。
- **BRAIN-022-AC-02 — 否定・境界**: required input/dependencyの一つを落とす、逆trace先を別revisionへ結ぶ、BRAINが製品値/導出結果を決める変異で未完義務を維持し、各ownerへ返す。 意味関係不明→BRAIN L1-003/005。受取側設計義務の識別/受領欠落→HARNESS。欠落inputは完了扱いしない。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input・版・範囲 | `BRAIN-022-FR-01` / `BRAIN-022-AC-01` | `L10-BRAIN-022-C01` | 固定L2/L11と一致するrevision/scopeを記録 |
| 保証・出力: required inputからHARNESS設計義務へのtrace | `BRAIN-022-FR-01` / `BRAIN-022-AC-01` | `L10-BRAIN-022-C01` | 全必須field・receipt・状態を維持 |
| 否定条件・失敗時の戻し先 | `BRAIN-022-AC-02` | `L10-BRAIN-022-C02` | 不足をunknown/holdにし、不足先をownerへ戻す |
| 未見入力の境界 | `BRAIN-022-AC-01,BRAIN-022-AC-02` | `L10-BRAIN-022-C03` | 十分な未見入力は同契約で評価し、不足箇所だけunknown |
| 依存と版 | `BRAIN-022-FR-01` | `L10-BRAIN-022-C01,L10-BRAIN-022-C02` | L1-003/005/012、L2-003/005/008、HARNESS-L2-009 contract。 版1.0 / Stage 4 |
| PO固定L11の例 | 固定L11全例 | `L10-BRAIN-022-C01,L10-BRAIN-022-C02,L10-BRAIN-022-C03` | 否定条件・停止・戻し先も個別照合 |

### 旧L3／対test-designからの再利用・再導出

Design Registryのtyped identity/edge/trace closureとtest-designのorphan/bidirectional trace oracleを局所再導出。Registry runtime/IDsは置換。 完全一致移植はしない。旧runtime・schema・algorithm・CLI・testは実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲・判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-5CBA32E9DB5B0FE05589` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:60–69` | `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae` | `3ef129d29f2bf57fd7210e55c7ba1d14da251c72e781a945f39b4755ee503342` | 要求identityからtrace edgeへの結合意味を隣接再導出。旧registry family/catalog implementationは継承しない。 |
| `LEGACY-ASSET-3F00F5BC5606801FD562` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L8-design-registry-unit-test-design.md:29–42` | `c7ed0988535906636c4cc93627814e35f408cbbad9051f779d7b39860ab5fe57` | `7bcc01887ba81d395d0bd71d48c457acb4b7662574c0f65dc33f3239d84af3b4` | 端点・edge・双方向traceの失敗oracle形を参照。L8 testやregistry runtimeは実行・移植しない。 |


## BRAIN-023-FR-01 — `HELIXBRAIN-L2-023`（Stage 4、候補）

### 親revisionとauthority

- PO採択根拠: [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L82`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L82), decision full SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`; exact adopted registration `MPR-RC-HELIXBRAIN-L2-023-002` (main `633bf12` decision row only; later register metadata is not approval)。L2固定本文: `docs/helix-brain/L2-requirements/brain-requirements.md:444–453` raw span SHA-256 `63d27178ddfbf23ab2797099ae56de52515bebb2577e0e05e03e2a3620cb5c12`, full SHA-256 `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`。L11固定本文: `docs/helix-brain/L11-acceptance/brain-acceptance.md:63–63` raw span SHA-256 `c4624e7d223c1af7bab59c6203ad21dbcb00adf26a70ac8c84191befad6dcf55`, full SHA-256 `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`。version_target `1.0`、G0 sequence `Stage 4`。後続のregister metadataから承認を継承しない。
- 依存: L1-006/007/009、L2-006/007/009/011/012、Visual Design HARNESS及びLABO connection contract。

### 要件候補

BRAINからVisual Design HARNESSへの汎用知識の提供は、Visual Design HARNESSの既存受領contractに従って独立して成立する。利用・評価結果をBRAINへ戻す場合や知識を昇格する場合だけLABO評価経路を通し、未評価結果は未評価candidateまたは昇格停止として保持する。汎用Visual Design/UX Pattern/Unit/Part、適用条件、反例、required inputを候補として扱う。製品固有Visual Identity/screen/flow/tokenは製品Coreが所有する。

### 受入条件（AC候補）

- **BRAIN-023-AC-01 — 正常**: Visual Design HARNESSの汎用知識query/返却が既存受領contractだけで成立する例と、別の利用・評価結果に同scope/source revisionのLABO evaluation receiptが結び付く例を分けて観測する。汎用candidateと条件/反例/input、製品固有fieldを分離し、LABO receiptが必要な昇格ではprovenance edgeをtraceする。generic/product-specific境界fieldの対応率100%・誤混入/誤昇格0件を根拠付き候補値とする（未承認・未実測）。
- **BRAIN-023-AC-02 — 否定・境界**: screen/flow/token/Visual Identityをgeneric patternに混入する変異、ならびにLABOを飛ばした利用・評価結果の昇格変異を別々に投入する。製品固有要素は該当Product Coreへ返す。LABO経路のない結果は未評価candidateのまま保持して昇格を停止し、LABOへ戻す。単なる汎用知識提供までLABO receipt必須にしない。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input・版・範囲 | `BRAIN-023-FR-01` / `BRAIN-023-AC-01` | `L10-BRAIN-023-C01` | 固定L2/L11と一致するrevision/scopeを記録 |
| 保証・出力: Visual Design HARNESSの汎用知識接続 | `BRAIN-023-FR-01` / `BRAIN-023-AC-01` | `L10-BRAIN-023-C01` | 全必須field・receipt・状態を維持 |
| 否定条件・失敗時の戻し先 | `BRAIN-023-AC-02` | `L10-BRAIN-023-C02` | 不足をunknown/holdにし、不足先をownerへ戻す |
| 未見入力の境界 | `BRAIN-023-AC-01,BRAIN-023-AC-02` | `L10-BRAIN-023-C03` | 十分な未見入力は同契約で評価し、不足箇所だけunknown |
| 依存と版 | `BRAIN-023-FR-01` | `L10-BRAIN-023-C01,L10-BRAIN-023-C02` | L1-006/007/009、L2-006/007/009/011/012、Visual Design HARNESS及びLABO connection contract。 版1.0 / Stage 4 |
| PO固定L11の例 | 固定L11全例 | `L10-BRAIN-023-C01,L10-BRAIN-023-C02,L10-BRAIN-023-C03` | 否定条件・停止・戻し先も個別照合 |

### 旧L3／対test-designからの再利用・再導出

VDH Pattern Contract required/forbiddenとcommon/product value separationを限定再導出。旧UI profile/ledger/tokenの製品固有値とruntimeは継承せず、汎用知識の提供と製品Core所有の境界を現行L2から再導出する。LABOを経ない利用・評価結果の直接昇格は拒否するが、既存contractによる汎用知識提供は独立して扱う。完全一致移植はしない。旧runtime・schema・algorithm・CLI・testは実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲・判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-335176749F6322C3CD8D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:39–47` | `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` | `21db2fb01827e87c2980bcc1cbc1da2ea04183c1438706900327863d9c883e6f` | Pattern Contractとproduct-specific値隔離の隣接意味を限定再導出。UI profile, screen ledger, design runtimeは移植しない。 |
| `LEGACY-ASSET-879D95C07B789C9502CF` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:19–24` | `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191` | `65a760062b26e32501611779c272ee8008a8058318bfdce3afe90f92fd02d333` | semantic identity、Pattern constraint、source-to-evidence traceのoracle形式を限定再導出。Visual Design HARNESSの直接昇格系は採らない。 |


## BRAIN-030-FR-01 — `HELIXBRAIN-L2-030`（Stage 4、候補）

### 親revisionとauthority

- PO採択根拠: [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L89`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L89), decision full SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`; exact adopted registration `MPR-RC-HELIXBRAIN-L2-030-002` (main `633bf12` decision row only; later register metadata is not approval)。L2固定本文: `docs/helix-brain/L2-requirements/brain-requirements.md:575–586` raw span SHA-256 `a69172ac364108dd9d81f93ff86dd7673a47f993e81055a20e18bc3b2cdf12ee`, full SHA-256 `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`。L11固定本文: `docs/helix-brain/L11-acceptance/brain-acceptance.md:97–114` raw span SHA-256 `bfb1d656431e49066bca208ecf52ffeff9d0bd88d7d85b939b185d66128115c4`, full SHA-256 `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`。version_target `1.0`、G0 sequence `Stage 4`。後続のregister metadataから承認を継承しない。
- 依存: L1-003/005/012、HARNESS-L2-009, CORE/HARNESS connector contract。常時: contract/version/compatibility, scope/query/receipt schema, receiver contract。選択knowledge適用時のみ: applicability/required input/relation/negative case。

### 要件候補

BRAIN→HARNESS-CORE query/receipt接続で、connection contract identity/version/compatibility、query/receipt schema、scope/correlation identity、HARNESS-L2-009 contractを常時照合する。選択された知識のみidentity/version/source/applicability/required input/relation/negative caseを照合し、HARNESS-L2-009義務材料receiptに未充足input/relationを保持する。Pattern/Unit/Part/input identityから受取義務identityへ、義務から同じ知識revision/fieldへ双方向traceする。知識receiptの受領は義務充足・接続完了・設計完成・実装準備を意味しない。製品固有API/state/permission/design conclusionを返さない。

### 受入条件（AC候補）

- **BRAIN-030-AC-01 — 正常**: 二つの選択Patternとrelation/conflict、required fieldの既知値と一つの未決値をqueryし、知識receiptは受領可能だが対応義務はopen、設計完了/実装準備はfalseであること、双方向trace、contract範囲を照合する。 常時必須4 contract groupと選択知識の全required field/relationについてforward/reverse trace coverage 100%、join-only/undefined-field acceptance/wrong scope/false completion 0件を候補とする。 これは根拠付き測定候補で、PO承認値・実測値ではない。
- **BRAIN-030-AC-02 — 否定・境界**: connection contract missing/stale/unknown、compatibility範囲外、receipt/query schema違い、選択Pattern field定義欠落、unknownを適用可能へ変換、義務identity/逆trace違い、未充足義務を閉じる変異を個別/併発で投入。BRAIN/HARNESSへ適切に返し、別Pattern成功で穴を埋めない。 contract missing/unknown/stale→connection保留。selected knowledge field/meaning欠落/矛盾→BRAIN。receiver scope/schema/obligation mapping欠落→HARNESS。

### 固定親句の被覆

| 親L2/L11要素 | 要件／AC | 対応L10 | 観測oracle |
|---|---|---|---|
| Input・版・範囲 | `BRAIN-030-FR-01` / `BRAIN-030-AC-01` | `L10-BRAIN-030-C01` | 固定L2/L11と一致するrevision/scopeを記録 |
| 保証・出力: BRAIN knowledgeからHARNESSへの単一接続 | `BRAIN-030-FR-01` / `BRAIN-030-AC-01` | `L10-BRAIN-030-C01` | 全必須field・receipt・状態を維持 |
| 否定条件・失敗時の戻し先 | `BRAIN-030-AC-02` | `L10-BRAIN-030-C02` | 不足をunknown/holdにし、不足先をownerへ戻す |
| 未見入力の境界 | `BRAIN-030-AC-01,BRAIN-030-AC-02` | `L10-BRAIN-030-C03` | 十分な未見入力は同契約で評価し、不足箇所だけunknown |
| 依存と版 | `BRAIN-030-FR-01` | `L10-BRAIN-030-C01,L10-BRAIN-030-C02` | L1-003/005/012、HARNESS-L2-009, CORE/HARNESS connector contract。常時: contract/version/compatibility, scope/query/receipt schema, receiver contract。選択knowledge適用時のみ: applicability/required input/relation/negative case。 版1.0 / Stage 4 |
| PO固定L11の例 | 固定L11全例 | `L10-BRAIN-030-C01,L10-BRAIN-030-C02,L10-BRAIN-030-C03` | 否定条件・停止・戻し先も個別照合 |

### 旧L3／対test-designからの再利用・再導出

System Synthesis stable identity/provenance graphとpartial acceptance oracleを隣接意味として再導出。旧whole-system synthesis/CI completion/auto-authorityは置換。 完全一致移植はしない。旧runtime・schema・algorithm・CLI・testは実行/移植しない。

| 旧asset ID | 旧source path・行 | file SHA-256 | raw span SHA-256 | 使用範囲・判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-F1F753F31DB8D874EF21` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:40–61` | `69c8a47a4b67729fceabb3df85ecd1c2caa0b9faa5e5b7d958eff48517fdbd79` | `a530edfbe85a1deea9dd5670dadbcb8d34618aa00ef0e496f5e939f763884333` | stable identity/revision/provenance接続とproposal/authority分離を隣接起点として再導出。旧system synthesis能力やruntimeは実装しない。 |
| `LEGACY-ASSET-BEAB5EE27CD04F5E866F` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/system-synthesis-acceptance.md:27–33` | `ed09b52fd9f0b0ed95e924730bc9132c375588520ad7041777188c726d994c16` | `c4642c513392285c6205790858c7aad1d9e6e4849c9872e202014dc301631af6` | exact identity・source-evidence欠落・単一成功の過剰昇格拒否のoracle形式を限定参照。旧合成engine/testは実行しない. |


## Stage 5 — BRAIN-024/025 対の部分草稿

この追補は採択済みmain633 L2/L11の固定意味からL3/L10候補を再導出する。Stage 5は9/27実装順序記録上の配置であり、新しい前段完了gate、実装・release許可を作らない。各FR/AC IDは親IDと対応する本文内trace用であり、親L2 IDやauthorityを置換しない。2件とも独立business outcomeは確認できず、業務分類はfunctional要件のまま扱う。

### BRAIN-024-FR-01 — Infrastructure設計知識と実績の経路分離（HELIXBRAIN-L2-024）

BRAINは設計知識をL2-019/022の契約に従って製品HELIX-HARNESS-CORE/HARNESSへ渡す。Runtime実績はRuntime ownerからLABOへ送り、LABO評価とL2-020 candidate contractを通る経路でだけBRAINへ戻す。各経路は対象identity/revision/scope、source owner、境界receiptを保持し、設計知識の引渡しと評価済み実績candidateを異なるflowとして追跡する。Runtime生データ自体はBRAINの入力・保存・学習materialにしない。

**責務と失敗時の戻し先**：Runtime実状態・操作・server/network/database state・provider account・credential・raw log/metricsはHELIX自身ならINFRASTRUCTURE、他製品なら当該Runtime ownerが保持する。LABOは実績source/scopeの評価を行い、BRAINは汎用Pattern意味を保持する。境界receipt、source/scope、revisionまたはLABO評価が欠ける場合は該当flowをcandidate/unknownのまま止め、Runtime owner、LABO、製品CORE、BRAINの該当責務へ戻す。COREで採用した設計はBRAINの設計出力の事実化を意味しない。

**固定親**：`HELIXBRAIN-L2-024` / `MPR-RC-HELIXBRAIN-L2-024-002`、PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7` decision row `helix-brain-requirements-po-decision-2026-09-28.md#L83` (decision full SHA `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`), register row SHA `79a4fc757198ce6e484454c58399b6d8ecb0440ca28b628f31bcfb0ad8ca17a2`, candidate semantic digest `sha256:95fb926670e7db28687782db8b0e373fbf3abf13519c42b20b0cb1c9e5315473`。L2 `brain-requirements.md:454–463` full SHA `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`, raw span SHA `c91976bfc0f128dd8628b8d3448ddac57af0e4531f8d54f996ed094cd3b018c3`; L11 `brain-acceptance.md:64` full SHA `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`, raw span SHA `aff2c5df94b1b823fa92d879ae7625c791d623f28eed0851ed7d4d585fa6f440`.

**受入条件**

- **BRAIN-024-AC-01 — 設計知識の正常flow**：L2-019/022境界と製品CORE/HARNESS宛先が結ばれ、設計Patternと対象scope/revisionが渡る。Runtime実績や直接Runtime接続のreceiptはこのflowに混ぜない。
- **BRAIN-024-AC-02 — 実績の正常flow**：Runtime owner→LABO評価→L2-020 candidate接続を同一source/scope/revisionでtraceする。受領状態は評価candidateとして保持し、単独で汎用知識採用・maturity・Runtime成功事実へ昇格しない。
- **BRAIN-024-AC-03 — 迂回・情報境界の拒否**：BRAIN↔Infrastructure Runtime直接read/write/learning、またはserver/network/database state、provider account、credential、operation permission、raw log/metricsの保存・受領を試みるfixtureは拒否またはholdする。BRAINはRuntime状態を正本化せず、Runtime ownerへ戻す。
- **BRAIN-024-AC-04 — missing/stale/誤結合**：Infrastructure L2-009/010/012/017、BRAIN L2-019/020/022、およびCORE/Runtime/LABO契約のidentity/revisionを、適用する知識・flowとの対応ごとに個別にmissing/stale/wrong-scopeにする。owner boundary receipt、source identity、LABO評価、L2-020 candidate receipt、target revision/scopeの欠落・誤結合もそれぞれ照合する。該当flowだけunknown/holdとし、他flowや候補状態で相殺せず、対応ownerへ戻す。全知識の実装完了は要求しない。

### BRAIN-024 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力：L2-019/022設計契約、Runtime owner→LABO→L2-020実績評価契約、各境界receipt | `BRAIN-024-FR-01 / AC-01,02` | `L10-BRAIN-024-C01,C02` | source owner・exact revision・scope・boundary receipt |
| 提供：設計知識はCORE/HARNESS、実績のみLABO評価後L2-020 candidate | `AC-01,02` | `L10-BRAIN-024-C01,C02` | 二つのflow経路と別state、宛先 |
| 否定：BRAIN↔Runtime直接read/write/learningなし。実状態/account/credential/操作権限/log/metricsを保存しない | `AC-03` | `L10-BRAIN-024-C03` | 直接接続・raw/runtime field流入0、Runtime owner保持 |
| failure/backflow：実状態/操作→Runtime owner、評価→LABO、採用設計→CORE、Pattern意味→BRAIN | `AC-03,04` | `L10-BRAIN-024-C03,C04` | missing boundaryごとのholdとowner |
| dependency/version：INFRA L2-009/010/012/017、BRAIN L2-019/020/022、CORE/Runtime/LABO契約、1.0 | `FR-01 / AC-01..04` | `L10-BRAIN-024-C01..04` | 列挙契約のidentity/revisionを適用する知識・flowへ結び、該当flowの境界・互換を照合する。全知識の実装完了を成立条件にしない |

### BRAIN-025-FR-01 — 内部知識candidateの独立検証・採否状態分離（HELIXBRAIN-L2-025）

製品Core由来または構成候補、source/provenance、LABO評価、OS登録・振分け、BRAIN change candidateおよび独立検証結果を対象revisionに結び、提案・評価・登録・独立検証・採否を別owner・別状態として追跡する。要求された順序は`candidate → LABO evaluation → OS registration/routing → BRAIN change independent verification → adoption`であり、各遷移はその段階の根拠・対象revision・ownerを保持する。製品固有意味をgeneric knowledgeへ写さない。

AI生成、単一実績、LABO評価、OS ticket、文書存在のどれも単独ではaccepted/mature/adoptedを立証しない。独立検証findingや反例、未完義務がある場合はcandidate/hold/rejected状態と戻し先を保持し、意味を変えない技術差分だけを理由に追加の人間approvalを要求しない。Infrastructure candidate maturityを扱う場合に限りL2-INFRA-017のstate/evidenceを入力に使い、全候補へ一律に要求しない。

**固定親**：`HELIXBRAIN-L2-025` / `MPR-RC-HELIXBRAIN-L2-025-002`、PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7` decision row `helix-brain-requirements-po-decision-2026-09-28.md#L84` (decision full SHA `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`), register row SHA `e9dbfb53722da101d8a9e1f561f01b06e5a0eaa5b65fdff017c55cbbc8cbb44d`, candidate semantic digest `sha256:dad26c150491fb7b31b6297acffd119b6390a675d79d2feedcc61fc0d857db12`。L2 `brain-requirements.md:464–473` full SHA `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa`, raw span SHA `a65af00d769a3e2ef3dbe5fedc6034ab67e1c4e44d5e2baa8b8d8ad381df6be5`; L11 `brain-acceptance.md:65` full SHA `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5`, raw span SHA `820a9905a103a6993004f6db6bfad8222091898c704a56eb51e865c75a81b895`.

**受入条件**

- **BRAIN-025-AC-01 — 正常sequence**：source/provenanceと対象revisionを持つcandidateをLABOが評価し、OS登録/振分け後、BRAIN change ownerが独立検証結果を保存し、その結果に対応する採否stateを返す。各状態・receipt・ownerを一つのtraceから辿れる。
- **BRAIN-025-AC-02 — 単独根拠による誤昇格拒否**：AI生成のみ、実績一件のみ、LABO評価のみ、OS ticketのみ、文書存在のみを単独投入する。どれもaccepted/mature/adoptedにしない。
- **BRAIN-025-AC-03 — finding/hold/rejection**：independent verification finding、反例、unknown、対象revision mismatchを含む入力は未完義務とowner付きでcandidate/hold/rejectedに留まり、accepted/matureへ進めない。不足評価はLABO、登録/進行はOS、意味は該当L1、変更検証はBRAIN change ownerへ戻す。
- **BRAIN-025-AC-04 — scope・approval境界**：製品固有意味のgeneric化を拒否する。意味を変えない技術差分には親が要求していない人間approvalを追加せず、意味・scope・owner・版変更が必要な場合のみL2へ戻す。Infrastructure maturityは該当候補の時だけ017 source/evidenceで照合する。

### BRAIN-025 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力：Core/構成candidate、provenance、LABO評価、OS登録/振分け、BRAIN candidate/独立検証 | `BRAIN-025-FR-01 / AC-01` | `L10-BRAIN-025-C01,C02` | source/revision、各receipt、owner、sequence |
| 出力：proposal/evaluation/registration/verification/adoptionを分離したknowledge revision/owner付きreceipt | `AC-01,03` | `L10-BRAIN-025-C01,C03` | 各stage identity/stateと未完義務 |
| 否定：AI、単一実績、LABO、OS ticket、文書単独でgeneric promotionしない | `AC-02` | `L10-BRAIN-025-C02` | accepted/mature/adopted誤遷移0 |
| 失敗戻し先：LABO, OS, L1, BRAIN change owner。未知/差戻しはaccepted/matureにならない | `AC-03` | `L10-BRAIN-025-C03` | reasonとowner付き戻し、state保持 |
| version/dependency：L2-007/008/009/011/012/020、必要時INFRA-017、1.0 | `FR-01 / AC-01..04` | `L10-BRAIN-025-C01..04` | 適用依存のみ照合、版・採否・releaseを混同しない |

### Stage 5 旧sourceとの項目別対応

旧RCLSは段階的昇格、候補とverification/adoptionの分離、自己promotion拒否を部分再利用する。旧RCLSの全lifecycle、特定schema、memory DB、promotion actor構成は導入しない。BRAIN-024のCORE/LABO/Runtime flow境界とBRAIN-025の現行owner/sequenceは固定L2/L11から再導出する。旧Infrastructure operations quality候補は現行L2-024/025に直接一致するBRAIN業務条件ではなく、unknown/証拠や実行結果の扱いを調べる隣接候補として限定参照する。

| 親 | 旧asset ID／path／行 | source full SHA-256 | raw span SHA-256 | 対応分類と保持範囲 |
|---|---|---|---|---|
| BRAIN-024/025 | `LEGACY-ASSET-F542125805B777D8A56A` / `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,101,148–168` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | lines 13–21 `d16597b2119b4b6d89a48c97777397f983d404059799ab440e76d02f821e1a69`; 101 `9a48e962ded1a655d4d467b146034189604c8545efe963446a06d5230e32889c`; 148–168 `e3458062d75fec1bb5ea1a71dc1f9988ead52879c228a6495b39ba04bfcba2f9` | FR+ACと3-subdoc/paired verificationの文書形を保持。旧工程名/runtimeは移植しない。 |
| BRAIN-024 | `LEGACY-ASSET-5841D44AE1255A061667` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md:34–38` | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `e79af639aeb840886ec71de9c9534760aa9e33dca0590fef7785808ee047323c` | evidence/provenance・runtime_judgmentを分離する隣接点のみ。raw Runtime data流入禁止とCORE/LABO経路は固定親から再導出。 |
| BRAIN-025 | `LEGACY-ASSET-5841D44AE1255A061667` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md:48–52` | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `7787b88b50767904ae5d36f52c98ff1be94a47407f3bda0bc0da5c82d32f227f` | progressive promotion・縮退の概念を部分再利用。現行5段階owner sequenceは固定親から再導出し、旧長大state machineは持ち込まない。 |
| BRAIN-025 | `LEGACY-ASSET-B1F192F46FC3AC336094` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:24–40` | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `9792fb64ef6e1a0332e501a86976c1c49ed4c966d4558e48faff938bf9405b74` | self-promotion/単一根拠の否定類型とowner separationのtest発想のみ部分再利用。旧全件green gateは置換。 |
| BRAIN-025 | `LEGACY-ASSET-F2C2755C8809C2C0DEAD` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:35–49` | `c3d9f28a17ac8882f22b5cf86b6d0b16c457a996b3eb0682b6de1010d64ea29c` | `f78913a58898483d3159cfb07706f0b1b6e4ad733a9c04fb765edcd5fb73bac2` | project evidenceとowner分離の起点。旧機能集合・promotion semanticsは移植しない。 |
| BRAIN-024 | `LEGACY-ASSET-5D41345F55800F23AC38` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:7–22` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `ed31b101da8555b2e44fa352f3192e7d127accc853f97aea1ed2de5b4cdee36e` | 旧Infrastructure qualityのtyped source/owner境界を隣接調査。現行BRAINへの性能/運用責務やowner移管はせず、直接一致なしとして固定親から再導出。 |
| BRAIN-024 | `LEGACY-ASSET-5166C9AB5D52E9926082` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md:7–17` | `009abecf1ef9bb6ac0d69da4bc472e15461481001d88df23ae172147cfedc620` | `8a1584bec58aea152f236a2f19e6c9c4f7dc701fdb3d148f5fd38a6c432d1d9c` | stale/unknown/secret boundaryのfailure類型だけ隣接参照。旧oracleやruntime/testは実行しない。 |

業務分類とNFR適用分類・候補値は同じStage 5 parent IDで対応する別正本に追記する。

旧sourceのinventory searchは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/`、旧L1 design requests、および`docs/governance/candidates/`のBRAIN/RCLS・Infrastructure sourceに限定して確認し、BRAIN-024/025と直接一致する旧BRAIN L3条項は見つからなかった。RCLSは関連する知識/verification昇格の隣接概念であり、現行のCORE/LABO/OS owner境界やPO採択を裏付けるsourceではない。`version_target: 1.0`は対象版であり実装/release許可ではない。


## 未承認事項

各候補の採否は本L3と対のL10を一体として通常のPO L3承認へ渡す。パラメーターごとの承認質問は作らない。親L2の意味・scope・owner・versionに変更が必要だと判明した場合だけL2へ戻す。
