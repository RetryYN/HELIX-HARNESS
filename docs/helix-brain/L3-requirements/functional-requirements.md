# HELIX-BRAIN L3 機能要件（部分草稿）

**状態：部分草稿・未承認。** この文書は割当済みStage 1およびStage 2b項目だけを具体化し、機構全体のL3を完了扱いにしない。実装方式・runtime・新しい承認gateを確定しない。通常のPO L3承認前である。対象版は各親L2が明示する`version_target: 1.0`であり、1.0の実装・release許可を意味しない。

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

以下11件はmain633で採択されたStage 2b / 1.0 candidateである。固定親の意味を具体化した部分草稿で、通常のL3承認前。各項目の旧asset起点と限定利用は各節およびgrounding inventoryに記録する。

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

## 未承認事項

各候補の採否は本L3と対のL10を一体として通常のPO L3承認へ渡す。パラメーターごとの承認質問は作らない。親L2の意味・scope・owner・versionに変更が必要だと判明した場合だけL2へ戻す。
