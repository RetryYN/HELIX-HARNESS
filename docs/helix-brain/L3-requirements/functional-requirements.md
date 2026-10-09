# HELIX-BRAIN L3 機能要件

**状態：承認済み。** 本文はPOが採択した固定L2/L11 revisionのうち`HELIXBRAIN-L2-007/008/028`だけを具体化する。HELIX-BRAIN全体や他StageのL3完了を示さず、実装・実行許可を生成しない。対象3親の版印は各親どおり`version_target: 1.0`。後続版・Web条件付き内容を1.0へ前倒ししない。

旧HELIXのL3定義は `LEGACY-ASSET-F542125805B777D8A56A`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`、全文SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）を起点とする。旧定義からFR+ACと対の検証へ結ぶ意味を保持し、旧G3名、sub-gate、runtime、旧層番号は継承しない。旧L10定義は `LEGACY-ASSET-34DF3B535879CC73FA86`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`、全文SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）を起点に、L3 ACをsystem behaviorで照合する関係を保持する。通常のL3承認を超えるgateは追加しない。

3文書の旧配置・役割は `LEGACY-ASSET-9A772391C7FB1298D45F`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-56`、全文SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）も参照し、functional／business／NFRを分ける骨格だけを再導出する。旧画面/mode/runtimeや工程計画は移さない。

この起草では旧L3起点と各旧assetを親ごとに比較し、直接一致しないBRAIN意味は現行L2/L11から再導出した。旧test/runtime/CIは参照のみで実行していない。各親のPO-fixed revision、決定行、L2/L11 source、候補sectionのraw pinは、該当する静的監査記録へ収録する。

## BRAIN-007-FR-01 — HELIXBRAIN-L2-007

### 親revisionとauthority

- L2 parent: `HELIXBRAIN-L2-007` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L54); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`.
  - Source `docs/helix-brain/L2-requirements/brain-requirements.md:150-160`; full SHA-256 `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw inclusive-span SHA-256 `f96983fecc67fdb539d5ff143ed758a9c2ae799ae3f4fb6fa24bad2c381a6774`.
- Paired L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`; lines 35–35 raw SHA-256 `10d2eca8689ebae8e517fe59ec8ae5586b9410dc3acec5d70fa39e1b9a551a3f`.
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-007-002` / candidate semantic digest `sha256:9584e757b02bf75f698a055eedb9df6d72aa7bdc07e82808fd92d786861c24ee`。後続register metadataからPO承認を継承しない。

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

Pattern / Unit / Part候補を、source identity・revision、provenance、evidence、adopted reason、evaluated scope、counterexample、limitationおよびLABO評価対象revisionへ結び、由来から採用状態まで追跡可能にする。採否前はcandidateを保ち、親契約に適合する評価・登録・独立検証・採否根拠が揃った既採用recordも同じ由来へ遡れる。LABO評価、OS登録・振分け、BRAIN変更手続内の独立検証、採否はそれぞれ別状態とする。sourceまたは必須根拠が欠ける間はcandidate状態にとどまり、promotionしない。新しいpromotion thresholdは追加しない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。

**親の依存・版**：`HELIXBRAIN-L1-007`、`HELIXBRAIN-L2-011/025`、LABO→BRAIN `HELIXBRAIN-L2-020`を前提とし、`version_target: 1.0`の候補として扱う。評価・登録・独立検証・採否を分け、実績数やpromotion thresholdを追加しない。

### 受入条件（AC候補）

**必須groupは8つ**：source identity/revision、provenance、evidence、adopted reason、evaluated scope、counterexample、limitationの7 provenance groupに、LABO評価対象revisionを加える。source identityとsource revisionは同一provenance group内で別々に検査するatomic fieldであり、group数とatomic mutant数を混同しない。

- **BRAIN-007-AC-01 — 正常・追跡**：8つの必須groupが揃い、LABO対象revisionがcandidate revisionに一致する場合、採否前candidateの各owner stateを分離し由来を追跡する。既存契約に沿って採用済みの記録も、同じsource/evidenceからLABO評価、OS登録・振分け、独立検証および採否根拠まで辿れる。新しい判定閾値・actor承認は設けない。
- **BRAIN-007-AC-02 — 異常・境界**：8つの必須groupのいずれかの欠落・stale・不一致、source identity/revision各atomic fieldの個別欠落・stale・不一致、LABO評価未実施なのに評価済みとする入力、AI生成のみまたは実績一件のみでaccepted/matureとする入力は不成立。採用状態にしない理由と不足項目を示し、根拠欠落・staleはcandidateに保って未採用候補へ戻してpromotionを停止し、評価未実施・LABO対象revision不一致/欠落はLABOの既存評価契約へ、上流意味変更は該当L1へ戻す。LABO評価、OS登録・振分け、BRAIN独立検証、採否の4状態を相互に代用しない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力／trace：Pattern・Unit・Part候補と8必須group（7 provenance group＋LABO対象revision） | `BRAIN-007-FR-01 / BRAIN-007-AC-01` | `L10-BRAIN-007-C01,C02,C03,C05,C10` | 8 groupの被覆とLABO評価対象revision。source identity/revisionは同一group内で別atomic fieldとして照合 |
| 出力・責務：由来から採用状態まで追跡し、LABO評価、OS登録・振分け、BRAIN独立検証・採否は別状態 | `BRAIN-007-FR-01 / BRAIN-007-AC-01` | `L10-BRAIN-007-C01,C07,C08` | candidateと既採用record双方のsource-to-decision trace、各owner別state |
| 否定・失敗：AI生成だけまたは一件の実績だけではaccepted/matureにしない | `BRAIN-007-AC-02` | `L10-BRAIN-007-C04` | 誤昇格0 |
| 戻し先：source/evidence欠落時はcandidateへ戻しpromotionを止める。LABO評価未実施・対象revision欠落/不一致はLABOへ戻す。上流意味変更だけL1へ戻す | `BRAIN-007-AC-02` | `L10-BRAIN-007-C02,C03,C05,C10` | 不足field・停止状態・未採用候補／LABO／該当L1戻し先 |
| 依存・版：L1-007、L2-011/025、LABO→BRAIN `HELIXBRAIN-L2-020`、version 1.0 | `BRAIN-007-FR-01 / BRAIN-007-AC-01,AC-02` | `L10-BRAIN-007-C01,C05` | 依存revisionとcandidate/LABO対象revisionを照合し、version_targetを実装・採否と混同しない |
| L11正常・反例caseのAC/L10結合 | `BRAIN-007-AC-01, BRAIN-007-AC-02` | `L10-BRAIN-007-C01`〜`L10-BRAIN-007-C10` | 8 group coverage、source identity/revisionの別atomic変異、LABO対象revision欠落/不一致、scope/counterexample欠落、stale evidence、別owner receipt、採用済み記録を区別し、該当状態と戻し先を観測 |

LABOへ評価を返す出典は、同PO固定revisionの`docs/helix-brain/L2-requirements/brain-requirements.md:414-423`（L2-020、失敗時の戻し先421行）である。評価と対象revisionが結べない場合はunknown候補として止め、LABOへ評価を返す。007のsource/evidence不足は未採用候補へ戻してpromotion停止を保つ。

### 旧L3／対のテスト設計からの意味対応

旧HR-FR-HIL-07はverified completionからdurable knowledgeへ進む点とworker≠promoterだけを部分再利用する。旧`skill-mechanism-migration-requirements.md:25–63`と`orchestration-memory-runtime.md:14–50`は隣接参考であり、BRAIN-007の直接要件根拠ではない。これらを現行BRAINのmigration/runtime要件にしない。旧HAT-HIL-07およびMLP unit/integration設計のprovenance欠落・stale/dangling・self-promotion失敗類型をL10へ再導出する。旧memory JSONL/compaction、role tuple、size/byte閾値、shadow state machine、skill/detector/gate promotionは継承しない。現行のPattern/Unit/Part・LABO/OS/BRAIN境界を旧memoryモデルで具体化しない。直接対応する現行BRAIN source-to-decision要件は確認できず、調査した旧L3 `infinity-loop-functional-requirements.md:41`、旧HAT `L3-infinity-loop-acceptance-test-design.md:39`、MLP unit `L6-memory-learning-promotion-unit-test-design.md:31-49`およびintegration `L5-memory-learning-promotion-integration-test-design.md:38-56`の意味比較から再導出した。

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
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-008-002` / candidate semantic digest `sha256:90cc1f814eda48b0da887912b3a0862b94291e3264cd6c84225d14e19bc0900e`。後続register metadataからPO承認を継承しない。

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

各再利用可能構造のknowledge identity・exact revision・version・stateとsupersession relationを識別し、Product Coreが参照したexact版を解決できるようにする。BRAINが知識stateを保持し、実projectで使った版・状態の登録はOSへ委ねる。参照先がsupersededになった後も既存consumer参照は当時のexact revisionを指す。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。

**親の依存・版**：`HELIXBRAIN-L1-008`、`HELIXBRAIN-L2-028`、CORE/OS接続の`HELIXBRAIN-L2-018/019/025`を前提にし、`version_target: 1.0`の候補として扱う。

### 受入条件（AC候補）

- **BRAIN-008-AC-01 — 正常・追跡**：Product Coreが指定したknowledge identity/revisionを解決し、BRAIN state（current / superseded / deprecated / experimental / retired）とOS側project usage recordを別々に表示できる。
- **BRAIN-008-AC-02 — 異常・境界**：identity/revision不明、unknown state、参照競合の際はcurrentへの暗黙解決をせず候補利用を止める。BRAIN state変更でOSの利用履歴を書き換えず、OS記録でBRAINの知識lifecycleを変更しない。exact R参照へR2を返す置換と同revision R内容の書換えを拒否または検出し、候補利用を停止してBRAINへ戻す。知識の構造・version変更はBRAIN、project use状態はOSへ戻す。上流の意味の変更が必要ならL1-008へ戻す。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・出力：knowledge identity/revision/version/state、supersession relation、Product Core usage referenceから、参照したexact版を識別 | `BRAIN-008-FR-01 / BRAIN-008-AC-01` | `L10-BRAIN-008-C01` | identity・revision・state・Core referenceの一致 |
| 状態の識別：current/superseded/deprecated/experimental/retiredを別状態として扱う | `BRAIN-008-FR-01 / BRAIN-008-AC-01` | `L10-BRAIN-008-C07,C02` | 5 stateの個別識別、unknown stateは推定しない |
| 否定・責務：旧版を黙って置換せず、BRAINのknowledge stateとOSのproject-use/register stateを別正本にする | `BRAIN-008-FR-01 / BRAIN-008-AC-02` | `L10-BRAIN-008-C01,C04,C05,C08,C09` | 旧参照維持、BRAIN/OS別record |
| 失敗・戻し先：identity/version/use不明はcandidate use停止。構造変更はBRAIN、project stateはOSへ戻す | `BRAIN-008-AC-02` | `L10-BRAIN-008-C02,C04,C05` | 停止状態、BRAIN/OS戻し先 |
| 依存・版：L1-008、L2-028、CORE/OS接続L2-018/019/025、version 1.0 | `BRAIN-008-FR-01 / BRAIN-008-AC-01,AC-02` | `L10-BRAIN-008-C01,C02` | dependency identity/revisionとversion/stateを照合し、対象版を実版扱いしない |
| L11正常・反例caseのAC/L10結合 | `BRAIN-008-AC-01, BRAIN-008-AC-02` | `L10-BRAIN-008-C01`〜`L10-BRAIN-008-C09` | silent replacementの2変異、5状態、unknown/version_target、BRAIN state更新とOS履歴、OS利用更新とBRAIN stateを個別に照合 |

### 旧L3／対のテスト設計からの意味対応

旧distribution packageのprofile/version/digest compatibilityおよびSKAPPのtyped identity/versioned registryから、versioned object referenceとunknown fail-closeの意味だけ再利用・再導出する。旧package profile ID、skill taxonomy/status、migration runtimeは継承しない。BRAIN knowledge identity・revision・stateとconsumer revisionを揃えて定義する直接一致は確認できず、旧L3 `distribution-package-release-requirements.md:68-85`と`skill-applicability-authority.md:23-78`のversion/reference failure類型、旧system test design `distribution-package-release-system-test-design.md:22-32,38-45`を比較し、現行L2-008のstate語彙から再導出する。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-9B7682EBDEA171005D45` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md`:68–85 | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | 90cc931f2ff7c24e62958ef6fd080f45908b1a55e68fe5f907a48c26a75c4ead |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md`:22–32; 38–45 | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | f493570aa5d21ed24e5410b653c5cd53f7e899d5fdc733f73c9e22c8c02675ab; 830c6fbc4216d8fa37ef4810b79ee7d0142405d045450403d844321c4b43f0d8 |
| `LEGACY-ASSET-C6052714FB506FB6271E` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/skill-applicability-authority.md`:23–78 | `5598eea36f7e5a3635b22a9f8320f0b388f47d57ca1fbb01887eda5ccbe2be49` | 181b59d10347d0935a1da4fddc24c478406c7cc10bd2ca60c8240ff9c537a25e |
| `LEGACY-ASSET-3345D03D82B0A5E7D9A6` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/skill-mechanism-migration-requirements.md`:25–63 | `4b0d73bb7ad92a8377dd2ae72d58057c03d6e1fe732126c11059840d3d6533ab` | 7ff3e7d1423faeb3dc54e7ef9e48f4a22a3ff1d4aa6b9cc1807e62cad42cb246 |

## BRAIN-028-FR-01 — HELIXBRAIN-L2-028

### 親revisionとauthority

- L2 parent: `HELIXBRAIN-L2-028` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L87); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`.
  - Source `docs/helix-brain/L2-requirements/brain-requirements.md:494-503`; full SHA-256 `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw inclusive-span SHA-256 `0120989594637907eed4c8a63a2b17619187739e1dd34d916a1dc15cb80e72c1`.
- Paired L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`; lines 68–68 raw SHA-256 `fdf71fc826cce6edd4c669afefd546d3bf27e2093236cecdbe6cd6a972a23929`.
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-028-002` / candidate semantic digest `sha256:e3d58bda2215f1a5aeb846d7160f31d832c8e46866a8a53c5e8115664cd72df8`。後続register metadataからPO承認を継承しない。

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

BRAIN-L2-028が列挙するcapability descriptorのidentity/kind、contract version、artifact version、dependency identity/version、compatibility range、verification scopeを、BRAIN knowledge identity/revision/version/stateとは別の軸として照合する。採択済みHARNESS-L2-010/011は共通pack/call境界の依存として扱う。要求versionがdescriptorに宣言されたcompatibility range内にある場合だけexact knowledge revisionへの適用可能応答を返す。range自体が欠落・不明ならunknown/未評価とし、未定義のrange構文や運用規則を補わない。`version_target`は実版ではない。common exchange・rollback・unfinished-obligation lifecycleをBRAIN側で定義し直さない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。

**親の依存・版**：`HELIXBRAIN-L2-008`と、採択済みL2である`HARNESS-L2-010/011`のdescriptor contractを依存参照し、`version_target: 1.0`の候補として扱う。ここでHARNESSのL3本文を承認済みとして扱わない。

HARNESS-L2-010/011の根拠は、PO判断記録 `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:39-40` の採択候補行と、固定source revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の `docs/helix-harness/L2-requirements/product-requirements.md`（全文SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`）である。この採択済みL2契約をfixtureの根拠にし、未承認L3や別候補文書をauthorityとして扱わない。

### 受入条件（AC候補）

- **BRAIN-028-AC-01 — 正常・追跡**：有効なdescriptorとknowledge revisionを受け取り、descriptorに宣言されたcompatibility rangeの内側であることを確認した場合、descriptorのidentity/kind、contract/artifact version、dependency identity/version、declared compatibility range、verification scopeと、knowledge identity/revision/version/stateを独立照合し、照合対象のidentityとrevisionを保持した適用可能応答を返す。
- **BRAIN-028-AC-02 — 異常・境界**：descriptor kind、dependency identity、verification scope、knowledge version/stateを含む各fieldのunknown/mismatch/必要field欠落を止める。range外はnot-applicableまたはunknown、range欠落・解釈不能はunknown／未評価として適用を止める。BRAIN知識側のrevision/version/state不一致はBRAIN（L2-008）、descriptor contract/range側の不一致はHARNESSへ返す。旧版への黙った置換、互換range不明時のfallbackを拒否する。version_target代入やcommon exchange/update/rollback/unfinished-obligation義務のBRAINへの移管を受理しない。relation endpointやconflictの意味判定は本親の対象外とする。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力：descriptor identity/kind、contract/artifact version、dependency identity/version、declared compatibility range、verification scope、および別軸のBRAIN knowledge identity/revision/version/state | `BRAIN-028-FR-01 / BRAIN-028-AC-01` | `L10-BRAIN-028-C01,C02,C03,C04` | 各fieldを別々に照合する |
| 出力・成功：宣言range内のexact knowledge revisionだけをapplicableとし、不一致・unknownはnot-applicable/unknown | `BRAIN-028-FR-01 / BRAIN-028-AC-01,AC-02` | `L10-BRAIN-028-C01,C02,C03,C04` | range内のみapplicable、他は拒否/unknown |
| 否定：version_targetを実版とせず、descriptor versionとknowledge revision/stateを混同しない | `BRAIN-028-FR-01 / BRAIN-028-AC-02` | `L10-BRAIN-028-C05,C08` | version_targetの実版代用とcross-field substitutionを個別に拒否し、field・戻し先を特定 |
| 責務・戻し先：common exchange/update/rollback/unfinished-obligationはHARNESS所有。knowledge mismatchはBRAIN（L2-008）、descriptor/range mismatchはHARNESSへ戻す | `BRAIN-028-AC-02` | `L10-BRAIN-028-C03,C04,C06` | C03でknowledge mismatch→BRAIN（L2-008）、descriptor/range mismatch→HARNESSを別fixtureで照合し、common lifecycleを維持 |
| 依存・版：L2-008とHARNESS-L2-010/011 descriptor contract、version 1.0 | `BRAIN-028-FR-01 / BRAIN-028-AC-01,AC-02` | `L10-BRAIN-028-C01,C02,C06,C08` | descriptor contract revisionとknowledge revision/stateを別々に照合し、不一致ownerへ戻す |
| L11正常・反例caseのAC/L10結合 | `BRAIN-028-AC-01, BRAIN-028-AC-02` | `L10-BRAIN-028-C01`〜`L10-BRAIN-028-C08` | unknown identity、range欠落/外/解釈不能、field cross-substitution、共通lifecycleのownerを個別に照合 |

### 旧L3／対のテスト設計からの意味対応

旧distribution artifact/profile version-digestとWCC provider descriptor/schemaの境界類例を使い、version/range mismatchのoracleを再導出する。旧provider descriptor、package manifest、worker-context packet v1、schemaをBRAINへコピーしない。知識revision/stateと共通descriptorの二軸を独立定義する直接一致は確認できず、調査した旧L3 `distribution-package-release-requirements.md:68-85`、`worker-common-contract.md:53-64`（WCCの契約field表）および旧test design `distribution-package-release-system-test-design.md:22-32,38-45`、`worker-common-contract-acceptance.md:18-37`の範囲から二軸照合とunknown/mismatch failureを再導出する。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-9B7682EBDEA171005D45` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md`:68–85 | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | 90cc931f2ff7c24e62958ef6fd080f45908b1a55e68fe5f907a48c26a75c4ead |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md`:22–32; 38–45 | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | f493570aa5d21ed24e5410b653c5cd53f7e899d5fdc733f73c9e22c8c02675ab; 830c6fbc4216d8fa37ef4810b79ee7d0142405d045450403d844321c4b43f0d8 |
| `LEGACY-ASSET-9114D4E463E95B67DD0C` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md`:53–64 | `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `b9bdb1071e9bcdf83f762d68cb85a2d304b97bf6ceaadd7c37317006bb41e76a` |
| `LEGACY-ASSET-C6ADB99F1353965C5449` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md`:18–37 | `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | b6114f9e9fda413b29b97693836562e55efc2b084f4f199dc839cee78c106b7b |

### 旧sourceの追加照合（review指摘に対応）

旧 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:37-47` のRCLS-BR-004/006を直接照合した。段階的な独立検証とproposal/evidence境界を意味再導出の起点として保持する。旧cross-project検証、shadow enforcement、Mechanism昇格手順を007/008の追加条件にしない。現行4状態とBRAIN／OS責務は固定L2から導出する。旧candidate自体はauthorityではない。

旧 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/python-worker-runtime.md:107` も比較した。双方宣言rangeの共通最大minorとmajor不一致quarantineは調査済みだが、固定親028にない比較・隔離規則なので採らない。旧runtimeは実行しない。


## Stage 2b — HELIX-BRAIN Infrastructure L3/AC候補（001–017）
**状態：承認済み。** 対象はPO採択された固定L2のINFRA-001〜017、各`version_target: 1.0`、G0上のStage 2bだけである。17親の起草を全28親完了条件へ広げない。これは通常のL3承認対象であり、実装・運用・release許可ではない。

旧共通L3はFR+ACを対の検証へつなぐ骨格のみ再利用し、G3名・sub-gate・旧runtime/層番号は継承しない。旧L10は対の検証関係を再導出し、G10/UX UAT等のgateや旧工程順は移さない。旧READMEはfunctional/business/NFRの分離を再導出し、screen/mode/drive/roadmapを移さない。
旧候補NIOは未承認資料であり、その文言を新要件として採択しない。typed input/evidence/unknown/traceは対応する範囲で再利用または再導出し、NIO-07のoperation traceやNIO-08のruntime admission等、固定親にない能力は追加しない。固定source pinsとG0/PO行ごとの対応は本本文revisionに対する時点監査へ記録する。

### BRAIN-INFRA-001-FR-01 — Infrastructure Domain/Subdomain

- **親と版**：`HELIXBRAIN-L2-INFRA-001`（`HELIXBRAIN-L1-001`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-001-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-001（分類・変更境界）。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:220–229`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `fcddad5c8f225147186c49fa08da577ae04be86a89f84d112dccf18956e21d6b`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:41`（同revision、line SHA-256 `b632016e7b0fb5e3c0ac0e3080f86283eac8e4bb39bee246d9e8373086f5e5a1`）。
- **機能要件候補**：20初期subdomain（Compute, Network, Storage, Database Infrastructure, Cache, Queue/Messaging, Load Balancing, Service Discovery, Deployment, Scaling, Availability, Reliability, Backup/Restore, DR, Observability, Capacity, Cost Architecture, Infrastructure Security, Environment, Runtime/Execution Platform）を固定enum化せず、追加/分割/統合/退役可能にする。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-001-AC-01（正常）**：20初期subdomainを識別し、追加・分割・統合・退役を許容する分類候補として表す、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-001-AC-02（負例）**：列挙集合を固定enum化、未列挙領域を拒否、またはprovider accountや実resource stateを分類identityへ混ぜる、Domainを実Runtime resource一覧として固定する。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（実resource状態との混同はInfrastructure Runtime owner、分類意味はHELIXBRAIN-L1-001）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:39–71`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-01`、NIO L10類例 `該当oracleなし`。旧候補との比較：NIO-L3-01はtyped inputの広い類例に限り、workload/environment/failure fieldは20 domain taxonomyを定義しない。NIO-L10-01は閾値固有で、本親のoracleから除外する。
- **L2/L11→L3→L10 trace**：固定L2 lines 220–229の受取・提供・保証・依存/版・戻し先と、固定L11 line 41の正常/不合格条件を`BRAIN-INFRA-001-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-001-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-002-FR-01 — Infrastructure Pattern階層

- **親と版**：`HELIXBRAIN-L2-INFRA-002`（`HELIXBRAIN-L1-002`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-002-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-002、HELIXBRAIN-L2-INFRA-001。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:230–239`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `8aaa447b505de8ad93744994b01e5285fd496a7f11165912b14b83c9fdde7159`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:42`（同revision、line SHA-256 `3e262257957673c43a631480d175578b3cf9feb50f31230299ce1d5cd9c880a8`）。
- **機能要件候補**：Domain→Pattern→Design Unit→Partを表現。Availability Active/Passive、Blue-Greenの例と部品relationを保持しprovider-specific settingだけを一般Patternにしない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-002-AC-01（正常）**：Domain→Pattern→Design Unit→Part階層とActive/Passive・Blue-Green例の部品relationを同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-002-AC-02（負例）**：各階層、relation端点を独立に欠落させるほか、provider固有設定だけを一般Patternに見せる。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（一般Pattern階層はHELIXBRAIN-L1-002、provider固有設定はimplementation knowledge候補へ分離し、階層/一般性の判断はHELIXBRAIN-L1-002へ戻す）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:72–112`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-01, NIO-L3-02`、NIO L10類例 `該当oracleなし`。旧候補との比較：NIO-L3-01/02は分類・graphの広い類例に限る。NIO-L3-04 loggingおよびNIO-L10-01/04は階層と無関係なため除外する。
- **L2/L11→L3→L10 trace**：固定L2 lines 230–239の受取・提供・保証・依存/版・戻し先と、固定L11 line 42の正常/不合格条件を`BRAIN-INFRA-002-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-002-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-003-FR-01 — Infrastructure Pattern成立条件

- **親と版**：`HELIXBRAIN-L2-INFRA-003`（`HELIXBRAIN-L1-003`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-003-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-003、HELIXBRAIN-L2-INFRA-002。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:240–249`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `015454d12eb883ec17e4cd5752633486ebeb289378a7d00b24d2e8e2c6350f0b`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:43`（同revision、line SHA-256 `339434e6d8c6b7438f3c67efe7aa50788314c4fd6f1778fd557d7ff9e4759f6e`）。
- **機能要件候補**：problem, workload/load, availability, consistency, latency, capacity, scaling, failure/recovery, durability, network/security, operational complexity, cost, observability, applicability, negative, tradeoff, evidenceを条件群として扱い、一般的だから適用を拒否。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-003-AC-01（正常）**：20個のL2 atomic descriptor fieldと18個のL11列挙groupの双方、各fieldを同じ親対象identityで識別し、欠落fieldはunknownとして示し、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-003-AC-02（負例）**：20 atomic fieldそれぞれ、およびL11 18 groupとの対応それぞれの欠落/stale/対象違いを単独変異し、一般性だけによる適用や未知値の成功丸めを試す。これらとは独立に、根拠のないRTO/RPO等の数値をdescriptor条件として生成・確定する変異も試す。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（製品要求値はProduct Core、評価不足はLABO、知識field意味はHELIXBRAIN-L1-003）を返し、適用・成功・完了へ丸めない。根拠のない数値条件は不成立としてProduct Coreへ戻す。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:113–143`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-01, NIO-L3-02, NIO-L3-03`、NIO L10類例 `NIO-L10-01, NIO-L10-02, NIO-L10-03`。旧候補との比較：NIO-L3-01/02/03はtyped context、applicability、evidenceの類例。NIO-L10-01/02は創作値およびunknown/stale evidenceのnegative類例。NIO-L10-03はscope上の注意に限り、BRAINへproduction operationの証明を要求しない。
- **L2/L11→L3→L10 trace**：固定L2 lines 240–249の受取・提供・保証・依存/版・戻し先と、固定L11 line 43の正常/不合格条件を`BRAIN-INFRA-003-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-003-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。


#### INFRA-003：固定L2の20 atomic fieldとL11の18 groupを別々に追跡

L2は20 atomic field、L11は18列挙groupを持ち、trade-offとevidenceは別groupとして扱う。L3/L10はL2のfield identityを保持し、下表に従ってL11 groupにも対応付ける。L11の束ね方でL2 fieldを縮約せず、L10 C02は20 fieldの個別欠落を照合する。固定sourceはL2 lines 240–248（semantic section hash `4009bed040b56dae56d064690b489f9c71e3e3b4f54cec68d17f695c94be58f2`）とL11 line 43（line hash `339434e6d8c6b7438f3c67efe7aa50788314c4fd6f1778fd557d7ff9e4759f6e`）、いずれも`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

| 固定L2 atomic field | 固定L11 group |
|---|---|
| problem | problem |
| workload assumptions | workload assumptions |
| expected load | expected load |
| availability condition | availability |
| consistency requirement | consistency |
| latency requirement | latency |
| capacity condition | capacity |
| scaling condition | scaling |
| failure assumptions | failure/recovery |
| recovery condition | failure/recovery |
| data durability | durability |
| network requirement | network/security |
| security constraint | network/security |
| operational complexity | operational complexity |
| cost characteristic | cost |
| required observability | observability |
| applicability | applicability |
| negative case | negative case |
| trade-off | trade-off |
| evidence | evidence |

### BRAIN-INFRA-004-FR-01 — NFR→Pattern→Design Input relation

- **親と版**：`HELIXBRAIN-L2-INFRA-004`（`HELIXBRAIN-L1-003 / HELIXBRAIN-L1-005`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-004-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-003/005/022。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:250–259`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `d11834af6cc5a20da98d97ada275cd8bcdc17ec930daa1e8ce03b3b2d904bb84`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:44`（同revision、line SHA-256 `e78120ffe0c33badd64289c6b45c9d0b9010c23fc7b4f597be63deef04ccdbb0`）。
- **機能要件候補**：Availability/Performance/Capacity/Reliability/Recoverability/Security/Privacy/Observability/Maintainability/Cost等のNFR特性を関連Patternおよび必要Design Inputへ対応。要求値・製品NFR値はBRAINが設定しない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-004-AC-01（正常）**：10種の要求特性→関連Pattern→必要Design Input relationを同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-004-AC-02（負例）**：各relation/inputの欠落、unknown値の確定、BRAINによる閾値/RTO/RPO生成。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（要求値と設計義務はHARNESS／製品CORE。BRAINは閾値を創作しない）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:144–180`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-01, NIO-L3-02, NIO-L3-03`、NIO L10類例 `NIO-L10-01, NIO-L10-02`。旧候補との比較：NIO-L3-01/02はtyped inputとdesign obligationの広い類例、NIO-L3-03はmeasurement input/evidenceの類例でありNFR ownerを与えない。NIO-L10-01/02は裏付けのない値・欠落evidenceの境界類例に限り、製品値を生成しない。
- **L2/L11→L3→L10 trace**：固定L2 lines 250–259の受取・提供・保証・依存/版・戻し先と、固定L11 line 44の正常/不合格条件を`BRAIN-INFRA-004-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-004-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-005-FR-01 — Failure構造

- **親と版**：`HELIXBRAIN-L2-INFRA-005`（`HELIXBRAIN-L1-010`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-005-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-010、HELIXBRAIN-L2-INFRA-003。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:260–269`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `6421070da28271408c2276ea905ad647f4917e0a42a36d9aec81bc306540ff90`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:45`（同revision、line SHA-256 `027ec51b1800b025e0d7b8e4077316c8cadeea469e59638701e03548571833a8`）。
- **機能要件候補**：列挙13 failure例それぞれに想定failure/detection/impact/containment/recovery/residual riskを関係付け、failure patternを正常構成のPattern/Design Unitと同じknowledge identity・階層・relationで保持し、正常構成から辿れるようにする。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-005-AC-01（正常）**：13 failure例の各々についてexpected failure/detection/impact/containment/recovery/residual riskを正常構成と同じknowledge identity・階層・relationで結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-005-AC-02（負例）**：列挙failure例および6観点の個別欠落に加え、failureを別型/注記だけにして正常構成から辿れない変異を独立に試す。設計候補の存在を実incident証拠へ置換しない。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（実際のincident/測定値はLABO／Runtime、一般化範囲はHELIXBRAIN-L1-010）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:181–217`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-02, NIO-L3-03, NIO-L3-06`、NIO L10類例 `NIO-L10-02, NIO-L10-04, NIO-L10-05`。旧候補との比較：NIO-L3-02/06のobligation graphとrecovery procedureを直接のsource themeとして再導出し、NIO-L3-03はmeasurement/evidence観点の類例に限る。evidence loss、restore名だけの成功、rollbackと修正の混同を限定negativeに使う。NIO-L3-07の広いruntime traceは本親の必須要件にせず、NIO-L10-07 authority/admissionは除外する。
- **L2/L11→L3→L10 trace**：固定L2 lines 260–269の受取・提供・保証・依存/版・戻し先と、固定L11 line 45の正常/不合格条件を`BRAIN-INFRA-005-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-005-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-006-FR-01 — Recovery Pattern

- **親と版**：`HELIXBRAIN-L2-INFRA-006`（`HELIXBRAIN-L1-002 / HELIXBRAIN-L1-010`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-006-003`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-002、HELIXBRAIN-L2-INFRA-005。INFRA-010の成立待ちを前提にしない。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:270–281`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `3815313a4d7eb5d3ddbf42d7131f9a285cc865fb26105ba5b6cf64c27f221f23`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:46`（同revision、line SHA-256 `4d27eac75001098de566731352d2edf45c0f08c635044a26d1eaf83fab494d82`）。
- **機能要件候補**：Retry, Timeout, Circuit Breaker, Failover, Graceful Degradation, Rollback, Restore, Rebuild, Reconciliation, DRの10知識候補。防止と復旧を分離し、存在だけで成功を推定しない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-006-AC-01（正常）**：INFRA-010側の知識が未登録またはunknownでも、10 Recovery Pattern候補における予防と復旧の役割区別を同じ親対象identityへ結ぶ。INFRA-010へのrelationは未解決/unknownとして保持でき、互いの完成を前提にしない。固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-006-AC-02（負例）**：各Pattern名/復旧条件の欠落、予防だけのrecoverability結論、未実行を実行成功扱いを独立に試す。別変異ではINFRA-010の完成を006成立の前提にする。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（実行・rollbackは製品またはRuntime owner、復旧構造の意味はHELIXBRAIN-L1-010）を返し、適用・成功・完了へ丸めず、006を010完成待ちにしない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:218–240`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-06`、NIO L10類例 `NIO-L10-02, NIO-L10-04, NIO-L10-05`。旧候補との比較：NIO-L3-06のrecovery procedureを直接類例とし、NIO-L10-04/05のrestore/rollback主張の区別、NIO-L10-02のevidence uncertaintyだけを使う。NIO-L3-07のoperation trace ownershipは要求せず、NIO-L10-06/07は対象外。
- **L2/L11→L3→L10 trace**：固定L2 lines 270–281の受取・提供・保証・依存/版・戻し先と、固定L11 line 46の正常/不合格条件を`BRAIN-INFRA-006-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-006-C01,C05,C06`、`AC-02 → C02,C03,C04,C06`。C06ではunknown relationを保つ通常入力と、010完成待ちを強制する誤り変異の両方を照合する。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-007-FR-01 — Deployment Pattern

- **親と版**：`HELIXBRAIN-L2-INFRA-007`（`HELIXBRAIN-L1-004`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-007-003`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-004、HELIXBRAIN-L2-INFRA-003/006。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:282–291`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `79954786ae654f5969fcc002cfe57803966f0205f59305f90de56a7295ccb188`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:47`（同revision、line SHA-256 `8bcf9023a543c1772d888fabce7b4df40fb23c46e419475a52284be9aef0d2b2`）。
- **機能要件候補**：Rolling, Blue-Green, Canary, Immutable, In-place, Staged Rolloutをblast radius/rollback/duplication/availability/migration/observabilityで比較。BRAINはrelease/deploymentを実行しない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-007-AC-01（正常）**：6 deployment方式をblast radius/rollback/duplication/availability/migration/observabilityで比較を同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-007-AC-02（負例）**：方式・比較軸欠落、migration条件推測、release/deploymentの実行、段階前進またはrelease状態遷移をそれぞれ独立に試す。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（製品release semanticsはProduct Core/HARNESS、実進行はOS/Runtime）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:241–270`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-02, NIO-L3-06`、NIO L10類例 `NIO-L10-03, NIO-L10-05`。旧候補との比較：deployment適用性とrecoveryを類例とし、NIO-L10-03は環境固有主張のscope注意に限る。NIO-L10-05のrollback/permanent-fix区別は比較参照に留め、L3要件やAC/CASEへ追加しない。実deployment/runtime authorityを移さずNIO-L10-07は除外する。
- **L2/L11→L3→L10 trace**：固定L2 lines 282–291の受取・提供・保証・依存/版・戻し先と、固定L11 line 47の正常/不合格条件を`BRAIN-INFRA-007-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-007-C01,C05`、`AC-02 → C02,C03,C04,C06`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-008-FR-01 — Scaling/Capacity Pattern

- **親と版**：`HELIXBRAIN-L2-INFRA-008`（`HELIXBRAIN-L1-003`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-008-003`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-003、HELIXBRAIN-L2-INFRA-003/004。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:292–301`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `fd25f8a5431b39e11266b4cf65f056706d6a27932fb0af9fb5cf4ff703055fe8`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:48`（同revision、line SHA-256 `9c51887b271b926e70c837a48a05aa66e55f53ffb3f6337f53d613f4ae4de1f3`）。
- **機能要件候補**：Vertical Scaling, Horizontal Scaling, Queue-based Load Leveling, Sharding, Read Replica, Cache, Worker Pool, Backpressureの8候補とtrigger/bottleneck/limit/statefulness/sync cost/saturation behavior。負荷thresholdを創作しない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-008-AC-01（正常）**：8 scaling/capacity候補をtrigger/bottleneck/limit/statefulness/synchronization cost/saturation behaviorで記述を同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-008-AC-02（負例）**：候補/field欠落、workload既知/unknown各fixtureで自動scalingの実行・操作能力を要件または出力へ含める、unknown workloadを適用許可へ変換、根拠のない負荷閾値の創作、根拠のない特定規模値の創作をそれぞれ独立に試す。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（workload値・規模・SLOは製品要求、構造評価はLABO）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:271–300`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-01, NIO-L3-02, NIO-L3-03`、NIO L10類例 `NIO-L10-01, NIO-L10-02`。旧候補との比較：workload/capacity/evidenceをsource themeとし、NIO-L10-01/02は創作閾値と欠測からhealthyへの変換を避けるnegative類例。NIO-L10-03をproduction telemetry/evidence義務へしない。
- **L2/L11→L3→L10 trace**：固定L2 lines 292–301の受取・提供・保証・依存/版・戻し先と、固定L11 line 48の正常/不合格条件を`BRAIN-INFRA-008-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-008-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-009-FR-01 — Observability knowledge

- **親と版**：`HELIXBRAIN-L2-INFRA-009`（`HELIXBRAIN-L1-003`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-009-003`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-003、HELIXBRAIN-L2-INFRA-003/005。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:302–311`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `2286996c4a51098e495d602c94d5e641420d8f7110ba00a8ceed59e075f13f9c`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:49`（同revision、line SHA-256 `841445aa41dff273200edc6259212d00314c2058b2f9d6166a69a8fc64dc8693`）。
- **機能要件候補**：Metrics/Logs/Traces/Health/Dependency/Capacity/Saturation/Error/Latency/Deployment/Recoveryを設計観測点としてrelation付ける。BRAINは実telemetryを保持せず、未観測を正常にしない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-009-AC-01（正常）**：11設計観測点と関連Pattern/failureの関係。実telemetryはBRAIN外に置くを同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-009-AC-02（負例）**：各観測定義の欠落、raw telemetry混入、missing/stale/collector停止をhealthyへ写像。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（runtime evidenceはInfrastructure Runtime/LABO owner、設計観測点不足はHELIXBRAIN-L1-003）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:301–330`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-03, NIO-L3-04`、NIO L10類例 `NIO-L10-02`。旧候補との比較：measurement/logging evidenceは観測定義の類例。missing/staleをhealthyにしないことを限定negativeにする。秘密情報の専用要件は固定INFRA-009親の範囲外であり、raw telemetryを知識化しない境界で扱う。NIO-L3-05 alert routing、L3-07 operation trace、L3-09 lifecycle stateはINFRA-009へ追加せず、NIO-L10-03/04/05/06/07/09は直接oracleにしない。
- **L2/L11→L3→L10 trace**：固定L2 lines 302–311の受取・提供・保証・依存/版・戻し先と、固定L11 line 49の正常/不合格条件を`BRAIN-INFRA-009-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-009-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-010-FR-01 — Backup/Restore/Recoverability

- **親と版**：`HELIXBRAIN-L2-INFRA-010`（`HELIXBRAIN-L1-003 / HELIXBRAIN-L1-010`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-010-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-005、HELIXBRAIN-L2-INFRA-006。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:312–321`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `e3d673a5ec89eb201512750f9cdef510099a2a1c69ccf3e706effe63696de6a9`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:50`（同revision、line SHA-256 `0d82dcad9c63929ef29003277754ad41eb50d85bb54d93193f0de5dfbf839687`）。
- **機能要件候補**：backup strategy/retention/replication/restore/recovery validationを関係付ける。backupだけで復旧可能と結論せず、実RTO/RPOは製品要求に残す。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-010-AC-01（正常）**：backupのみ、restore verificationあり、required recovery conditions充足を別判定し、3条件が揃う時だけRecoverability Evidence Candidateと記録する（実復旧可能の確定ではない）。固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-010-AC-02（負例）**：backupのみ、restore verificationありだがrequired recovery conditions欠落、recovery conditionsのみでrestore verification欠落、各状態の独立欠落をそれぞれ試す。これらと独立に、根拠のない一律RTO/RPO値を生成・確定するfixtureを試す。3条件が揃わないfixtureではCandidateを成立扱いしない。RTO/RPO創作fixtureではその値を製品値またはCandidate根拠として受理せず不成立とし、固定L2の戻し先（実backup/restore実行と値は製品/Runtime、知識構造はHELIXBRAIN-L1-003/010）を示し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:331–364`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-02, NIO-L3-06`、NIO L10類例 `NIO-L10-02, NIO-L10-04, NIO-L10-05`。旧候補との比較：recovery procedureとrestore evidenceを直接類例とし、NIO-L10-04はbackup名だけの成功、L10-05はrollbackと修正の混同、L10-02はunknown evidence保持のnegativeに使う。実backup/dataやruntime authorizationは要求しない。
- **L2/L11→L3→L10 trace**：固定L2 lines 312–321の受取・提供・保証・依存/版・戻し先と、固定L11 line 50の正常/不合格条件を`BRAIN-INFRA-010-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-010-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-011-FR-01 — Cost characteristics

- **親と版**：`HELIXBRAIN-L2-INFRA-011`（`HELIXBRAIN-L1-004`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-011-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-004、HELIXBRAIN-L2-INFRA-003。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:322–331`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `ca1ab62c895b7cea2e8f92d29609affb34f3fc0163697ea9d7f814d4a9f60855`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:51`（同revision、line SHA-256 `865b51ab2c0cc7d3914201937ed583bfe61a13e1f5330038615fc71835fe048b`）。
- **機能要件候補**：7つのcost characteristic groupに含まれる8 atomic characteristic（fixed cost、variable cost、idle resource、scaling、redundancy、storage、network、operational cost）を区別して比較する。構造上のcost特性だけの記述を許容し、具体価格を提示するときに限りprovider・時点・sourceをその価格へ結び、構造的傾向とprovider/time依存の価格を分離する。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-011-AC-01（正常）**：7 cost characteristic groupと8 atomic characteristicを別々に識別し、固定L2/L11の必須意味を同じ親対象identityへ結ぶ。構造cost特性だけでも正常とする。具体価格を含む場合だけ、その価格値にprovider・時点・sourceを対応付ける。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-011-AC-02（負例）**：8 atomic characteristicの各欠落と7 group対応の各欠落を独立に試す。具体価格のprovider/time/source欠落、時点・出典付き価格を恒久characteristic/定数として保持・再提示する変異、source/timeなし価格の現行化、構造cost特性から具体価格/予算への変換も個別に拒否する。価格を提示しない構造比較は不成立にしない。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（具体価格/予算はProduct Core/OS owner、一般化cost characteristicはLABO評価）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:365–384`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-02, NIO-L3-03`、NIO L10類例 `NIO-L10-01, NIO-L10-02`。旧候補との比較：cost適用性とmeasurement provenanceを類例とし、NIO-L10-01はprovider/時点価格の創作回避、L10-02は欠落evidenceをunknownに保つnegativeに使う。L10-07のcost/billing action admissionはcost知識要件ではない。
- **L2/L11→L3→L10 trace**：固定L2 lines 322–331の受取・提供・保証・依存/版・戻し先と、固定L11 line 51の正常/不合格条件を`BRAIN-INFRA-011-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-011-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-012-FR-01 — Provider abstraction and implementation

- **親と版**：`HELIXBRAIN-L2-INFRA-012`（`HELIXBRAIN-L1-005 / HELIXBRAIN-L1-011`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-012-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-005/011、HELIXBRAIN-L2-INFRA-002。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:332–341`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `6321d9a2fa5685f623d8256c8aa156f6061b284694bfbbe1047b0f7b074e9c51`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:52`（同revision、line SHA-256 `4b9c41a61d3d6b032bacec1a588fe17e14026957888fdbba196cb14d38a55b07`）。
- **機能要件候補**：Object Storage等の抽象PatternとS3/GCS/Azure Blob/MinIOの実装例を別identityで保持しimplements/compatible_with/constraint_of関係を表現。未確認適合はunknown。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-012-AC-01（正常）**：Object Storage等の抽象Patternと固定4例の実装identityを別に保ち、provider固有factごとに根拠と版を結び、implements/compatible_with/constraint_of関係を同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。held-outのfixture-only実装identityは列挙外の実provider・compatibility確定として扱わず、抽象identityとrelationを保ちcompatibilityをunknownにできる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-012-AC-02（負例）**：identity統合、provider固定、provider固有factの根拠欠落と版欠落を個別に試す。根拠のないcompatibilityおよび各relation欠落も独立fixtureとする。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（互換条件のownerまたは該当Pattern owner）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:385–417`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-01, NIO-L3-02`、NIO L10類例 `NIO-L10-03`。旧候補との比較：環境固有evidenceはprovider実装事実のscope類例に限る。NIO-L10-01/02はprovider compatibilityを定義しない。provider/source acceptanceを作らず根拠がなければcompatibilityはunknown。
- **L2/L11→L3→L10 trace**：固定L2 lines 332–341の受取・提供・保証・依存/版・戻し先と、固定L11 line 52の正常/不合格条件を`BRAIN-INFRA-012-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-012-C01,C05,C06`、`AC-02 → C02,C03,C04`。未見正常C05とprovider入替えC06も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-013-FR-01 — Common resource abstraction

- **親と版**：`HELIXBRAIN-L2-INFRA-013`（`HELIXBRAIN-L1-001 / HELIXBRAIN-L1-002`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-013-003`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-001/002/024、HELIXBRAIN-L2-INFRA-012。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:342–351`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `915285630ae5080ac424fe09f181239d97410b0e9c6442a75c15ad3c33e38173`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:53`（同revision、line SHA-256 `87dab47321ea76f2ddd63ac283d420d153a7923e2d9960a80a2843424b009fb9`）。
- **機能要件候補**：Local/VPS/dedicated/cloud/GPU/distributed workerをprovider/環境非依存resource/capability model上で表す。実資源状態/credential/操作権限は所有しない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-013-AC-01（正常）**：Local/VPS/Dedicated/Cloud/GPU/Distributed workerのprovider非依存resource/capability表現を同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-013-AC-02（負例）**：cloud-only前提、特定provider（例：AWS）の必須化、特定計算機構成（例：GPU node）の必須化、knowledge identityとruntime stateの混同、credential/actionの知識化をそれぞれ独立に試す。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（実環境identity/stateはInfrastructure Runtime、security境界はSECURITY）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:418–438`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-01`、NIO L10類例 `NIO-L10-03`。旧候補との比較：typed environmentとenvironment-scoped evidenceはresource abstractionの類例。NIO-L10-03はproduction環境証明や特定provider/deviceをBRAINへ要求しない。
- **L2/L11→L3→L10 trace**：固定L2 lines 342–351の受取・提供・保証・依存/版・戻し先と、固定L11 line 53の正常/不合格条件を`BRAIN-INFRA-013-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-013-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-014-FR-01 — Infrastructure topology graph

- **親と版**：`HELIXBRAIN-L2-INFRA-014`（`HELIXBRAIN-L1-005`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-014-003`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-005、HELIXBRAIN-L2-INFRA-001/002。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:352–361`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `adc8d9d3b668980f2912b120e3d13889419670ed190ac7f78589d8f692d14479`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:54`（同revision、line SHA-256 `6d45f4349873d7a7365ad23af8a0a7e24a99755f7ed8d9feb33c96248663d28e`）。
- **機能要件候補**：topology relation depends_on/communicates_with/replicated_by/backed_up_by/monitored_by/failover_to/secured_by/deployed_on/scales_withを両端点・意味付きで表現。component一覧だけでは成立しない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-014-AC-01（正常）**：9 topology relationのtype/両endpoint/意味を同じ親対象identityへ結び、未定edgeは未定状態で明示保持し、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-014-AC-02（負例）**：各relation type/端点/meaningの単独欠落、未定edgeを確定edgeとして扱う変異、component listだけで成立、実状態の推定。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（topology実状態はRuntime、構造relation意味はHELIXBRAIN-L1-005）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:439–480`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-02`、NIO L10類例 `該当oracleなし`。旧候補との比較：obligation graphは広いgraph構造の類例に限り、9種のtopology relationやendpoint意味は与えない。NIO-L3-07/L10-08はrequirement-operation traceでtopologyと異なるため直接対応にしない。
- **L2/L11→L3→L10 trace**：固定L2 lines 352–361の受取・提供・保証・依存/版・戻し先と、固定L11 line 54の正常/不合格条件を`BRAIN-INFRA-014-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-014-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-015-FR-01 — Cross-domain relations

- **親と版**：`HELIXBRAIN-L2-INFRA-015`（`HELIXBRAIN-L1-005`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-015-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-005と関係先各Domain identity。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:362–371`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `11b9eff2eaac4b17aace22ac405581b9ceb7dab34b260320f246992b28f600af`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:55`（同revision、line SHA-256 `58e16ddb2d0ad5943173c42620ce1efba738620f464f2131dd2df242f7b5232f`）。
- **機能要件候補**：InfrastructureとAPI/Data/Security/Visual-UX等のaffects/constrains/may affectを方向/根拠/不確かさと共に保持し可能性を因果確定へしない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-015-AC-01（正常）**：InfrastructureとAPI/Data/Security/Visual-UX等のaffects/constrains/may affect方向・根拠・不確かさを同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-015-AC-02（負例）**：affects/constrains/causesを根拠なく確定する、may affectを根拠なく確定causesへ強める変異を個別に試す。may affectに根拠が無い場合は可能性とunknownを保持できる。endpoint/方向の欠落と他Domain ownerの判断代行も個別に検出する。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（関係先Domainの責務owner）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:481–514`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `該当oracleなし`、NIO L10類例 `該当oracleなし`。旧候補との比較：参照した候補表にaffects/constrains/may-affectのcross-domain意味へ直接対応するNIO L3/L10 oracleはない。NIO-L3-02は一般obligation graphであり、方向を持つdomain relationのsourceと同一視しない。
- **L2/L11→L3→L10 trace**：固定L2 lines 362–371の受取・提供・保証・依存/版・戻し先と、固定L11 line 55の正常/不合格条件を`BRAIN-INFRA-015-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-015-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-016-FR-01 — Infrastructure Anti-Pattern

- **親と版**：`HELIXBRAIN-L2-INFRA-016`（`HELIXBRAIN-L1-010`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-016-003`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-010、HELIXBRAIN-L2-INFRA-005/006/009。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:372–381`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `835303e5f143675783dbef7891d035b443472a05847cdaaecb199eb801c2b7c9`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:56`（同revision、line SHA-256 `54fc593f9197339f43229875d327cf4e78ca084c7b146f44c4c16157fd8a026f`）。
- **機能要件候補**：11例: SPOF, Shared Mutable Production State, Unbounded Retry/Queue/Resource Growth, Missing Timeout, Backup Without Restore Test, Monitoring Without Action, Manual-only Recovery, Hidden Dependency, Undocumented Egress。成立条件/failure manifestation/detection clue/safer alternativeを保持し、条件を外して全域禁止にしない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-016-AC-01（正常）**：11 anti-patternの成立条件/failure manifestation/detection clue/safer alternativeを同じ親対象identityへ結び、L11のsignalをmanifestationとdetection clueの両方へ対応させ、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-016-AC-02（負例）**：要素欠落、条件を外したuniversal ban、evidence不足の確定分類。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（検出証拠/適用状況が不明ならfindingをunknownとしてLABO評価へ）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:515–546`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-02, NIO-L3-06`、NIO L10類例 `NIO-L10-02, NIO-L10-04, NIO-L10-05, NIO-L10-06`。旧候補との比較：obligation/recovery sourceはanti-pattern成立条件の類例。NIO-L10-04/05は一致するrestore/rollback類例に限り、runtime admission/logging contractを追加しない。NIO-L10-06のsecret/PII扱いは固定親にないため個別要件として移さない。NIO-L10-07は明示的に除外する。
- **L2/L11→L3→L10 trace**：固定L2 lines 372–381の受取・提供・保証・依存/版・戻し先と、固定L11 line 56の正常/不合格条件を`BRAIN-INFRA-016-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-016-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

### BRAIN-INFRA-017-FR-01 — Pattern maturity

- **親と版**：`HELIXBRAIN-L2-INFRA-017`（`HELIXBRAIN-L1-007 / HELIXBRAIN-L1-008`）、PO登録 `MPR-RC-HELIXBRAIN-L2-INFRA-017-002`、version 1.0。G0のStage 2bは順序記録で、先行Stage完了gateを作らない。
- **固定依存**：HELIXBRAIN-L2-007/008/020/025。これは固定L2が示す知識参照であり、全BRAIN Stageや未採択候補の完了gateではない。
- **固定source**：L2 `docs/helix-brain/L2-requirements/brain-requirements.md:382–391`（f6dad2a33e24f000b87d7f09b8d40288257e74cc、span SHA-256 `d7e5a7a4d029db3bd92db437043b07c7dc4d6923c481a338815382e23c6f4795`）；L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:57`（同revision、line SHA-256 `9209db4b4e0810bad881e9a714120abaae22beb29bc0490e259d281423133420`）。
- **機能要件候補**：experimental/observed/validated/mature/deprecated/retiredのmaturity state、BRAIN knowledge version、projectで使った版を3つの別軸として記録し、対象revisionへ結ぶ。入力は利用実績、failure、反例、LABO評価の4種を保持する。単一内部Product成功をuniversal maturityへ昇格せず、failure発見と複数条件の評価結果を両方保持する。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
- **BRAIN-INFRA-017-AC-01（正常）**：maturity state、BRAIN version、project usage versionを別軸として対象revisionへ結び、利用実績/failure/反例/LABO評価の4入力を保持する。複数条件の評価結果とfailure発見が同時にある入力も保持し、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-017-AC-02（負例）**：maturity state/BRAIN version/project usage versionの混同、3軸それぞれの独立欠落またはrevision不一致、利用実績・failure・反例・LABO評価の各入力の独立欠落/不一致、単一内部successからuniversal/mature昇格、failure/適用限界の隠蔽をそれぞれ検出する。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（評価不足はexperimental/observed候補に留め、採用や昇格を推定しない）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:547–568`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-09`、NIO L10類例 `NIO-L10-02, NIO-L10-09`。旧候補との比較：NIO-L3-09はlifecycle/evidenceの類例でありmaturity語彙は同一視しない。NIO-L10-02/09は欠落evidenceや文書だけからhealthy/completionへしない注意として使う。NIO-L10-09は実consumer evidenceをBRAINのmaturity inputにせず、普遍適用の証明にも使わない。
- **L2/L11→L3→L10 trace**：固定L2 lines 382–391の受取・提供・保証・依存/版・戻し先と、固定L11 line 57の正常/不合格条件を`BRAIN-INFRA-017-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-017-C01,C05,C06,C07,C08`、`AC-02 → C02,C03,C04,C06,C08`。C06/C08では各通常入力を保持するoracleと、誤昇格・failure隠蔽変異を別々に照合する。未見正常C05も通常条件と同じAC-01を用いる。

### 旧項目ごとの再利用・再導出・置換記録

| 固定親 | 旧候補の対応と扱い |保持／変更理由 |
|---|---|---|
| `HELIXBRAIN-L2-INFRA-001` | NIO-L3-01。NIO-L3-01はtyped inputの広い類例に限り、workload/environment/failure fieldは20 domain taxonomyを定義しない。NIO-L10-01は閾値固有で、本親のoracleから除外する。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-002` | NIO-L3-01, NIO-L3-02。NIO-L3-01/02は分類・graphの広い類例に限る。NIO-L3-04 loggingおよびNIO-L10-01/04は階層と無関係なため除外する。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-003` | NIO-L3-01, NIO-L3-02, NIO-L3-03, NIO-L10-01, NIO-L10-02, NIO-L10-03。NIO-L3-01/02/03はtyped context、applicability、evidenceの類例。NIO-L10-01/02は創作値およびunknown/stale evidenceのnegative類例。NIO-L10-03はscope上の注意に限り、BRAINへproduction operationの証明を要求しない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-004` | NIO-L3-01, NIO-L3-02, NIO-L3-03, NIO-L10-01, NIO-L10-02。NIO-L3-01/02のtyped input/design obligationを広い類例、NIO-L3-03をmeasurement input/evidenceの類例とし、NFR ownerは与えない。NIO-L10-01/02は裏付けのない値・欠落evidenceの境界類例に限り、製品値を生成しない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-005` | NIO-L3-02, NIO-L3-03, NIO-L3-06, NIO-L10-02, NIO-L10-04, NIO-L10-05。NIO-L3-02/06はobligation graphとrecovery procedureの類例、NIO-L3-03はmeasurement input/evidenceの類例として再導出し、evidence loss、restore名だけの成功、rollbackと修正の混同を限定negativeに使う。NIO-L3-07の広いruntime traceは本親の必須要件にせず、NIO-L10-07 authority/admissionは除外する。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-006` | NIO-L3-06, NIO-L10-02, NIO-L10-04, NIO-L10-05。NIO-L3-06のrecovery procedureを直接類例とし、NIO-L10-04/05のrestore/rollback主張の区別、NIO-L10-02のevidence uncertaintyだけを使う。NIO-L3-07のoperation trace ownershipは要求せず、NIO-L10-06/07は対象外。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-007` | NIO-L3-02, NIO-L3-06, NIO-L10-03, NIO-L10-05。deployment適用性とrecoveryを類例とし、NIO-L10-03は環境固有主張のscope注意に限る。NIO-L10-05のrollback/permanent-fix区別は比較参照に留め、L3要件やAC/CASEへ追加しない。実deployment/runtime authorityを移さずNIO-L10-07は除外する。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-008` | NIO-L3-01, NIO-L3-02, NIO-L3-03, NIO-L10-01, NIO-L10-02。workload/capacity/evidenceをsource themeとし、NIO-L10-01/02は創作閾値と欠測からhealthyへの変換を避けるnegative類例。NIO-L10-03をproduction telemetry/evidence義務へしない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-009` | NIO-L3-03, NIO-L3-04, NIO-L10-02。measurement/logging evidenceは観測定義の類例。missing/staleをhealthyにしないこと、raw telemetryを知識化しない境界を扱う。独立したsecret/PII要件は追加しない。NIO-L3-05 alert routing、L3-07 operation trace、L3-09 lifecycle stateはINFRA-009へ追加せず、NIO-L10-03/04/05/06/07/09は直接oracleにしない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-010` | NIO-L3-02, NIO-L3-06, NIO-L10-02, NIO-L10-04, NIO-L10-05。recovery procedureとrestore evidenceを直接類例とし、NIO-L10-04はbackup名だけの成功、L10-05はrollbackと修正の混同、L10-02はunknown evidence保持のnegativeに使う。実backup/dataやruntime authorizationは要求しない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-011` | NIO-L3-02, NIO-L3-03, NIO-L10-01, NIO-L10-02。cost適用性とmeasurement provenanceを類例とし、NIO-L10-01はprovider/時点価格の創作回避、L10-02は欠落evidenceをunknownに保つnegativeに使う。L10-07のcost/billing action admissionはcost知識要件ではない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-012` | NIO-L3-01, NIO-L3-02, NIO-L10-03。環境固有evidenceはprovider実装事実のscope類例に限る。NIO-L10-01/02はprovider compatibilityを定義しない。provider/source acceptanceを作らず根拠がなければcompatibilityはunknown。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-013` | NIO-L3-01, NIO-L10-03。typed environmentとenvironment-scoped evidenceはresource abstractionの類例。NIO-L10-03はproduction環境証明や特定provider/deviceをBRAINへ要求しない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-014` | NIO-L3-02。obligation graphは広いgraph構造の類例に限り、9種のtopology relationやendpoint意味は与えない。NIO-L3-07/L10-08はrequirement-operation traceでtopologyと異なるため直接対応にしない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-015` | なし。参照した候補表にaffects/constrains/may-affectのcross-domain意味へ直接対応するNIO L3/L10 oracleはない。NIO-L3-02は一般obligation graphであり、方向を持つdomain relationのsourceと同一視しない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-016` | NIO-L3-02, NIO-L3-06, NIO-L10-02, NIO-L10-04, NIO-L10-05, NIO-L10-06。obligation/recovery sourceはanti-pattern成立条件の類例。NIO-L10-04/05は一致するrestore/rollback類例に限り、runtime admission/logging contractを追加しない。NIO-L10-06のsecret/PII扱いは固定親にないため個別要件として移さない。NIO-L10-07は明示的に除外する。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |
| `HELIXBRAIN-L2-INFRA-017` | NIO-L3-09, NIO-L10-02, NIO-L10-09。NIO-L3-09はlifecycle/evidenceの類例でありmaturity語彙は同一視しない。NIO-L10-02/09は欠落evidenceや文書だけからhealthy/completionへしない注意として使う。NIO-L10-09は実consumer evidenceをBRAINのmaturity inputにせず、普遍適用の証明にも使わない。 | 旧L3のFR→AC→対検証の関係と該当するtyped input/evidence/unknown patternのみ再利用・再導出。未承認NIO固有のowner/threshold/runtime/運用義務は置換・非継承。固定L2/L11の意味・責務・版を保つため。 |


### 旧source・paired validationの出自pin（閲覧のみ）

以下は`1880c422311a7f8321dbb0e2b98fa12c69449201`のbytesを読み、現行の要件authorityとは分離した。固定親の歴史的起点、項目類例、再利用/再導出/置換理由を辿るためにのみ記録する。

| 旧asset | 旧source path・物理行 | 全文SHA-256 | 対象範囲SHA-256 | 本起草で保持/変更する点 |
|---|---|---|---|---|
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:22–40` | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | `ba58e5280b8a372f2123b80561227bf0eaf27d9b4fb595768690a6300332e162` | 要件とACの構造のみ再導出。HARNESS固有screen/mode/workflow/承認をBRAINへ移さない。 |
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–39,84–104` | `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | `ade5075e3df236216603e1e0d3fb83c8cdae007f7f319e49bd4af1c5d4efca5e`; `f79e52ce0ac3797d30c46573a61f8115656ece2f8485461c728cdcf50fa4b38f` | business分離の骨格だけ比較し、BR-21/HM-08/Learning Engine成果・閾値・ownerはBRAINへ移さない。 |
| `LEGACY-ASSET-DB669724249A14A665F0` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74` | `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | `0392a485245f3de9165f2d3fc17f222b33ef0bbdfc059b3efe466b997576e007`; `74f6a44aeab7e88f1f97b615b6be52001e852f27f790cdba9f1cee4228f87268` | 測定可能性・判定の書式だけ再導出。IPA grade、旧値、pass条件、CI/runtimeは置換。 |
| `LEGACY-ASSET-1B92155F959D7905DD1E` | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:1–40` | `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | `e4c94d10c7fd3e6737048aaab38d75cfe1fa925e8cba00c7b3caa11916e2553f` | L3要件群からpaired validationへ対応する形を再導出。旧AT-ID・件数・L12実行設計は移さない。 |
| `LEGACY-ASSET-F542125805B777D8A56A` | `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | `e3458062d75fec1bb5ea1a71dc1f9988ead52879c228a6495b39ba04bfcba2f9` | FR+ACを対の検証へ対応する骨格を再利用。G3/sub-gate/runtime/旧層番号は置換。 |
| `LEGACY-ASSET-34DF3B535879CC73FA86` | `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162–170,195–207` | `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a` | `d8e3f0e9afaa03c20985808ccade01279952ea5366655e3d4e95ca9e97dd3df5`; `9a91c1d2094be6c1c0463b9f3af280f41abb15b0503f8520c7e72be12c27c75b` | ACをsystem behaviorで検証する対を再導出。G10/UX UAT/旧差戻しゲートは移さない。 |
| `LEGACY-ASSET-9A772391C7FB1298D45F` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56` | `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4` | `fbb50e1ed591235cba594d8b8a10d5f1c55be865e3df9c9daf75f3814a18ab6a` | functional/business/NFR区分を再導出。HARNESS固有screen/mode/drive/roadmap/gateは対象外。 |
| `LEGACY-ASSET-5D41345F55800F23AC38` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:7–15` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `e0991b48f7e63bf21e2dc348512899a420368a2b605ca37be92ae7347ce3ed05` | NIO-L3-01..09は未承認候補。上記親別表の該当analogのみ再導出し、他owner/runtime能力を追加しない。 |
| `LEGACY-ASSET-5166C9AB5D52E9926082` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l10-acceptance-candidates.md:7–15` | `009abecf1ef9bb6ac0d69da4bc472e15461481001d88df23ae172147cfedc620` | `41a49fb479bb3eac89ad0495a6236cc0ccdeb792dfaae92a4fab7057cc0cfd0d` | NIO-L10-01..09の各類例を親別crosswalkに限定。元の誤った4–12 pinに依存せず、実在する7–15を読んだ。 |
| `LEGACY-ASSET-E239B45CE3FFE8B34D2B` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:5–53,54–250` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `2817ef52fdf3f3531fedf5c1d91a0f6b722ba0ff8c6164aa58833ac3b70dc5b5`; `6190f76f66cc005a7564234e06fb6ad2e77ff24d111a6c0fa39f8330f285d379` | old owner/source/failure/consumer mapを比較資料として再導出。Issue/owner状態・runtime/operation規則は現行正本へ移さない。 |
| `LEGACY-ASSET-D429F3E84A5A04196209` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-handoff-under-4000-source_v0.1.md:1–56` | `0e77630d44fff35d587b0577941a35ebd10429a20f2b00f3098486552ede60e2` | 同左 | 旧handoffのscope/failure/consumer断面を照合。旧工程順は継承しない。 |
| `LEGACY-ASSET-C071238FD1055E96186F` | `archive/legacy-generation-2026-09-14/root/tests/infrastructure-operations-quality-intake.test.ts:1–60` | `833e5feee824ba480d86982e347fd7b79c22605030008775fbe96bd7cddee413` | 同左 | 旧test設計のcandidate ID/owner/authority境界だけを読んだ。実行していない。 |

旧NIO sourceは候補のため、固定L2/L11を上書きしない。上表と親ごとのdispositionはsource pin監査にも固定する。

## Stage 2b追補 — 採択済み001〜006
**状態：承認済み。** Stage 1 prefixはPO承認済みのbytesを保持し、既存INFRA Stage2b 17親suffixは最新main `4729c34ec29c2c72f345993958bbc94e1ed6f131`のbytesをそのまま保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

### BRAIN-001-FR-01 — 領域identityと進化

親：`HELIXBRAIN-L2-001`、registration `MPR-RC-HELIXBRAIN-L2-001-002`、semantic digest `sha256:e708841bf5f5560a96915866d68dd4d37cd663bb250e61084e1d19ebf2eb4abf`。PO decision main633 L48。固定L2 `brain-requirements.md:84–94`、固定L11 `brain-acceptance.md:29`と共通24–26。依存：HELIXBRAIN-L1-001 / Conceptの機構境界。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

設計知識のDomain identity・意味・状態とPattern参照を保持する。初期10領域を識別し、一覧を固定enumにせず追加・分割・統合・退役を表す。各変更後も既存relationの利用者と参照先を識別する。追加・分割・統合・退役の4操作を個別に表現できる。製品/projectをDomain化せず、追加候補6領域の初版充実を必須にしない。

- **BRAIN-001-AC-01 — 正常**：10初期領域を別identity/意味/状態で与え、各Patternの参照先を照合する。Visual DesignとUX / Interactionも初期集合に残る。追加・分割・統合・退役を各々独立に与え、操作後も既存参照先とrelation利用者を識別できることを確認する。
- **BRAIN-001-AC-02 — 反例**：初期10領域のいずれかの欠落・誤識別・意味対応不明を個別に不成立とする。製品/project名をDomainに固定する入力、追加可能6領域の初版充実を必須とする入力、既存relation利用者を消す入力もそれぞれ個別に拒否する。
- **BRAIN-001-AC-03 — 不明と戻し先**：領域の分類意味が重複または不明なら候補のまま停止し、意味差をHELIXBRAIN-L1-001へ返す。
- **BRAIN-001-AC-04 — 未見と責務境界**：未見Domainを初期enumにないことだけで拒否しない。意味と既存参照を照合し、追加/分割/統合/退役のいずれでも旧参照利用者を消さない。

旧sourceとの対応：RDJ-FR-009（旧source:54）のstable identityと、同文書§2.1（旧source:68–73）の未解決templateを隠さず保持する形を、別々の比較起点として再導出する。旧RDJのunknown enum拒否は現行の「固定enumにしない」と異なるため置換し、enum初版にないことだけで候補を拒否しない。Domainの10領域・4変化操作は旧RDJにあるとはせず、固定L2-001から再導出する。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。親句とCASEの固定対応は本書のStage 2b親句→FR/AC→CASE trace表（後段）と`../L10-verification/functional-verification.md`の各親別case表で照合する。

### BRAIN-002-FR-01 — 階層の意味と関係

親：`HELIXBRAIN-L2-002`、registration `MPR-RC-HELIXBRAIN-L2-002-002`、semantic digest `sha256:6ea1c1d2d7808649aaa553fbc6afcf814e72eeb24a0e83caf89c7d043fe70039`。PO decision main633 L49。固定L2 `brain-requirements.md:95–105`、固定L11 `brain-acceptance.md:30`と共通24–26。依存：HELIXBRAIN-L1-002 / HELIXBRAIN-L2-001。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

Domain→Pattern→Design Unit→Part以上の再利用構造を、各identity・包含/構成relation・責務・親を伴って辿れる。file、code snippet、UI componentの集合だけをPattern知識と誤認しない。具体の保存方式/クラス型を確定しない。

- **BRAIN-002-AC-01 — 正常**：Visual Design Domain→Dashboard Pattern→Navigation/KPI/Work Area Unit→Table/Filter/Status Partを、各段階のidentity/責務/親とrelation付きで辿る。
- **BRAIN-002-AC-02 — 反例**：fileのみ、code片のみ、UI component集のみをPatternとして返す各入力を不合格とする。identity欠落も項目別に検出する。孤立・誤種別はunknown／候補保留として保持し、HELIXBRAIN-L1-002へ返す。
- **BRAIN-002-AC-03 — 不明と戻し先**：階層または要素の意味を決められない項目、孤立項目、誤種別項目をunknown/候補保留として保持し、HELIXBRAIN-L1-002へ返す。
- **BRAIN-002-AC-04 — 未見と責務境界**：未見の正当な構成にも同じidentity/親/責務照合を適用する。例の名前だけから意味を推測しない。

旧sourceとの対応：VDH-FR-003/VDH-AC-003のsemantic identityとclass/file pathだけでは意味traceを代用しない点、Design Templateの意味identityを再導出。旧screen/region/slot/action/state/bindingやJSON方式は置換し、BRAIN4段階は固定L2-002から再導出。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。親句とCASEの固定対応は本書のStage 2b親句→FR/AC→CASE trace表（後段）と`../L10-verification/functional-verification.md`の各親別case表で照合する。

### BRAIN-003-FR-01 — Pattern成立条件

親：`HELIXBRAIN-L2-003`、registration `MPR-RC-HELIXBRAIN-L2-003-002`、semantic digest `sha256:0c9aa2e7b9c84e47147fc40fb2893ae58a7bbd08b5975dc925299a184824dc56`。PO decision main633 L50。固定L2 `brain-requirements.md:106–116`、固定L11 `brain-acceptance.md:31`と共通24–26。依存：HELIXBRAIN-L1-003 / HELIXBRAIN-L2-002。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

Pattern候補とsource、対象問題、前提、利用時inputを受け、12列挙要素を持つdescriptorへ結ぶ。各条件の充足/不充足/unknownを区別し、Patternの存在を今回の適用可能/採用に変換しない。

- **BRAIN-003-AC-01 — 正常**：fixture sourceが宣言する問題・前提・applicabilityとrequired inputを満たすPattern候補Pを受け、各descriptor値を元sourceへ辿り、当該scopeの条件充足を表示する。採用決定は返さない。
- **BRAIN-003-AC-02 — 反例**：descriptor各要素の欠落、negative/failure/evidence欠落、必要inputの一項目欠落、条件不充足、存在だけで採用する入力を個別に照合し、適用可能と断定しない。
- **BRAIN-003-AC-03 — 不明と戻し先**：条件の意味・必須inputが未定なら適用提案を停止し、HELIXBRAIN-L1-003または該当要求意味ownerへ返す。unknownを条件不充足や充足へ丸めない。
- **BRAIN-003-AC-04 — 未見と責務境界**：未見scopeでも同じ条件とsourceを照合する。互換性やmaturityの存在だけで採用せず、未入力の必須条件は未解決のまま返す。

旧sourceとの対応：旧Design Templateの適用条件・必須input/field・negative/evidenceとRDJ未解決templateの非捏造を意味再導出。旧typed predicate文法/JSON canonical/registry/strict enum/承認gateは置換し、12要素と適用/採用の分離は固定L2-003を根拠とする。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。親句とCASEの固定対応は本書のStage 2b親句→FR/AC→CASE trace表（後段）と`../L10-verification/functional-verification.md`の各親別case表で照合する。

### BRAIN-004-FR-01 — 候補比較と選択責務

親：`HELIXBRAIN-L2-004`、registration `MPR-RC-HELIXBRAIN-L2-004-002`、semantic digest `sha256:ea1ad035c22d4c34626ec52cea621e47f304c66f97c0f44507a01e1325a3686b`。PO decision main633 L51。固定L2 `brain-requirements.md:117–127`、固定L11 `brain-acceptance.md:32`と共通24–26。依存：HELIXBRAIN-L1-004 / HELIXBRAIN-L2-003/012。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

同じ問題に成立し得る複数Patternを、長所/短所/constraint/failure/cost/適用条件で並列に保持する。成立する候補を一つの絶対解で上書きせず、製品での選択をBRAINの決定として行わない。

- **BRAIN-004-AC-01 — 正常**：同問題のStrong Consistency、Eventual Consistency、Compensating Transactionを、fixture source別の6比較軸とsource/適用条件付きで併存させる。数値や長短は各入力sourceどおりで、BRAINが新規に事実を断定しない。
- **BRAIN-004-AC-02 — 反例**：候補一つだけを恒久正解とし他を上書き、稼働案件の採用をBRAINが確定、比較軸欠落を完全な比較と表示する各入力を個別に拒否する。
- **BRAIN-004-AC-03 — 不明と戻し先**：比較に必要な要求値/重みがなければ欠落を示して選択を保留し、HARNESS-CORE/INTELLIGENCE/人間の適切な判断先へ返す。
- **BRAIN-004-AC-04 — 未見と責務境界**：未見Patternを含む比較でも候補集合と制約を保持し、比較表示を採用決定に変えない。成立判定不明の候補を成立済みと捏造しない。

旧sourceとの対応：旧Design Templateのalternatives/trade-off説明を構造的意味と結ぶ部分を再導出。旧JSON正本への投影/choice plannerは移さず、3比較例とBRAIN非選択authorityは固定L2-004から再導出。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。親句とCASEの固定対応は本書のStage 2b親句→FR/AC→CASE trace表（後段）と`../L10-verification/functional-verification.md`の各親別case表で照合する。

### BRAIN-005-FR-01 — 方向と意味を伴うrelation

親：`HELIXBRAIN-L2-005`、registration `MPR-RC-HELIXBRAIN-L2-005-002`、semantic digest `sha256:120d16b39c985bd7f62efe6974a71849cad4cb0f234c395a509dc6793ddd9ff0`。PO decision main633 L52。固定L2 `brain-requirements.md:128–138`、固定L11 `brain-acceptance.md:33`と共通24–26。依存：HELIXBRAIN-L1-005 / HELIXBRAIN-L2-001/002。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

Pattern/Unit/Part間のrelationを種類、方向、意味、両端identity付きで参照できる。領域横断の関係を失わず、名前類似だけのedgeや未確認因果を確定relationとしない。7列挙例を固定enumの上限とはしない。

- **BRAIN-005-AC-01 — 正常**：Authentication→Session→Frontend State→UXとDatabase→Performance→Infrastructureの各edgeを、sourceが宣言したrelation種類/方向/意味/端点付きで辿る。7種類はそれぞれ独立fixtureで照合する。
- **BRAIN-005-AC-02 — 反例**：relation名だけ、unknown endpoint、未確認因果、名称類似だけのedgeを意味関係に確定する入力を個別に拒否する。領域横断edgeを脱落させない。
- **BRAIN-005-AC-03 — 不明と戻し先**：向きまたは意味が未定ならedgeを確定せずHELIXBRAIN-L1-005へ返す。既知の一方端点から他方を捏造しない。
- **BRAIN-005-AC-04 — 未見と責務境界**：未見だがsourceで正当に定義されたedgeも方向/意味/両端identityで照合する。requires等を一律対称関係へ変えない。

旧sourceとの対応：RDJのtyped traceとDesign Templateの関係identityを結ぶ意味を参考にするが、BRAIN7relationと端点/方向条件の直接一致はpin範囲で未確認。これらは固定L2-005/L11から再導出し、旧trace graph/registry/DB実装は移さない。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。親句とCASEの固定対応は本書のStage 2b親句→FR/AC→CASE trace表（後段）と`../L10-verification/functional-verification.md`の各親別case表で照合する。

### BRAIN-006-FR-01 — Visual/UXの再利用知識境界

親：`HELIXBRAIN-L2-006`、registration `MPR-RC-HELIXBRAIN-L2-006-002`、semantic digest `sha256:f031680bdd08d3b7c3286ebb1a5ecab68efb8c4bfed7b8f005a55ff9bb141900`。PO decision main633 L53。固定L2 `brain-requirements.md:139–149`、固定L11 `brain-acceptance.md:34`と共通24–26。依存：HELIXBRAIN-L1-006 / HELIXBRAIN-L2-001/002/003 / Visual Design HARNESS接続HELIXBRAIN-L2-023。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

製品横断のVisual/UX Pattern/Unit/Partと適用条件を15知識例へ結ぶ。Visual Designを装飾だけに縮めず、製品固有Visual Identity、screen、flow、design tokenは各製品COREへ残す。Visual Design HARNESSは画面の見た目と体験の生成/評価を担い、System Design自体を意味しない。

- **BRAIN-006-AC-01 — 正常**：15知識例の各要素を、source/適用条件とPattern/Unit/Partの意味に結んで識別する。製品固有のscreen/flow/tokenを汎用知識の値として取り込まない。
- **BRAIN-006-AC-02 — 反例**：15知識例のいずれかの欠落・識別不能・意味誤対応を個別に不成立とする。「黒背景・青accent」の製品Visual Identity、製品名、固定style、製品screen/flow/tokenを個別に汎用知識へ混入させる入力を拒否する。装飾だけとして構造や体験要素を落とす入力も不合格。
- **BRAIN-006-AC-03 — 不明と戻し先**：製品固有識別要素を切分け不能なら共有知識へ入れずVisual Design HARNESSまたは製品COREへ返す。
- **BRAIN-006-AC-04 — 未見と責務境界**：未見の正当な画面構造を汎用知識条件で照合し、製品Visual Identityや設計選択は代行しない。Visual Design HARNESSの生成/評価とSystem Designを混同しない。

旧sourceとの対応：VDH-FR-005/VDH-AC-005のPattern required/forbiddenとproduct固有値の共通pack非混入を再導出。UI profileのowner分離を参考にし、旧52entity/registry/profile schema/実測gateは置換。15知識例と製品CORE/Visual Design HARNESS境界は固定L2-006から再導出。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙fieldおよびL11反例はAC-02と各個別case、製品固有要素を分離できない境界caseの戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。親句とCASEの固定対応は本書のStage 2b親句→FR/AC→CASE trace表（後段）と`../L10-verification/functional-verification.md`の各親別case表で照合する。

## Stage 2b追補 — 採択済み009/010/011/012/029
**状態：承認済み。** 対象はPO採択registrationが1.0候補として固定するHELIXBRAIN-L2-009/010/011/012/029のみ。各親のPO固定revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`、採択registrationはmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0は最新main `4729c34ec29c2c72f345993958bbc94e1ed6f131`で全件Stage 2b。後続版、Web条件付き、保留・不採択を含めず、前Stage完了gateや実装・実行・release許可を作らない。現在有効なL2/L11判断を使い、新たな承認・fieldごとのPO確認を設けない。採択registrationのmetadata-only後継（本PRのStage 2b親001–006および009–012の各`-003`、029の`-002`）はsemantic digestを変更せず、本文の親意味を更新しない。本節は009–012/029の5親で、001–006は前節に収録する。Stage 1の007/008は本PRの対象に含めない。

旧L3定義`LEGACY-ASSET-F542125805B777D8A56A`（`docs/process/forward/L00-L06-design-phase.md:148-168`）と旧L3層README `LEGACY-ASSET-9A772391C7FB1298D45F`（`docs/design/harness/L3-functional/README.md:16-56`）から、FR+AC、business/NFRの区分、対の検証へtraceする形だけを再導出する。旧HELIXのBRAIN専用L3要件・対testは、archiveのdocs inventoryを`brain`で絞り、旧L3 functional FR/README/acceptance designとUI Domain Pattern Profile設計・testのPattern/failure/product/consumer関連範囲を検索した限り見つからなかった。これはその検索範囲の結果であり、旧資産全体の不存在を主張しない。旧HARNESS FR/AC、ATと旧UI profileを構造上の類例として参照し、BRAINの意味authorityにはしない。旧G3/runtime、UI固有schema/enum、旧ID、旧閾値・gate・実行結果は継承しない。各親別のsource、物理行、full/raw-LF pin、再利用・再導出・置換理由は対応する固定時点source-pins記録にある。

BRAINは知識identity/meaning/stateを保持する。LABOは評価、OSは登録・project use、HARNESS/COREは製品要求と利用設計、INTELLIGENCE等は既存の選択判断を担う。候補出力、receipt、レビューや候補の受領から採用・承認を生成しない。必要意味・適用範囲・owner・版を変更するなら親L2へ戻す。

### BRAIN-009-FR-01 — 構成Pattern候補

親`HELIXBRAIN-L2-009`（固定L2 `brain-requirements.md:172-182`、L11 `brain-acceptance.md:37`）。採択registration `MPR-RC-HELIXBRAIN-L2-009-002`、semantic digest `sha256:2357966979f49c70ea6881fddd664a9f121dc43849f8b2889768f931c5e89d01`（PO採択main 633）。L1-009とL2-005/007/025を前提とする。既存PatternのUnit、source/evaluation scope、新relation案から、両端identityと構成根拠が追跡できるcandidate Patternを返す。Unit自体またはrelation根拠のどちらかが不明な構成はcandidateとしても適用せず、該当するL1-009へ戻す。構成candidateの生成（L2-009）だけでは即時昇格しない。候補作成はLABO評価・OS登録・独立検証の完了を前提にせず、昇格はL2-025が定めるLABO評価→OS登録/振分け→BRAIN変更手続き内の独立検証→採否という既存経路にのみ従う。これらの状態・順序を分け、採否を新しいownerや条件へ移さない。

- **BRAIN-009-AC-01 — 正常**：異なるPattern A/Bに属するUnit A1/B1を有効なidentityとsource/versionで与え、source-backed relation案を加える。両端identity、scope、構成根拠をcandidate状態で保持し、候補生成だけでは昇格させない。別の正常fixtureではLABO評価・OS登録・BRAIN変更手続き内の独立検証と、既存L2-025経路の採否条件が全て同一candidate identity/revisionに結び付いた入力を与え、その既存経路が定める次状態を観測する。新しい遷移条件・approvalを加えない。
- **BRAIN-009-AC-02 — 個別反例**：relation端点欠落、relation意味の根拠欠落、必須Unit自体のsource/根拠欠落、選択source/versionの欠落または不一致をそれぞれ独立に検出する。LABO評価未完はLABO、OS登録/振分け未完はOS、BRAIN変更手続き内の独立検証未完はBRAIN change ownerへ（固定L2-025:469–471）戻す。採否だけが既存経路上で未完の場合も候補を維持し、その経路の既存ownerへ返す。各状態を他ownerの状態で代用しない。
- **BRAIN-009-AC-03 — unknownと戻し先**：relationまたは必須部品の意味・根拠が不明ならcandidateの適用可能性を作らず、未解決箇所を記録してBRAIN-L1-009へ返す。
- **BRAIN-009-AC-04 — 未見**：既知例と異なるがsourceで定義されたUnit組合せも同じidentity、端点、relation意味、scopeを照合する。fixture未定義条件はunknownとし、candidate状態を保つ。未見例をもって広範な知識網羅を保証しない。

旧source対応：旧L3のFR+AC構造とATの個別failure/consumer照合を再導出。専用BRAIN構成要件は上記探索範囲で未発見。隣接UI profileのtyped relation例は構造類例のみ。固定L2/L11のUnit・relation・昇格条件が現行の意味根拠であり、旧registry、runtime、ID、gateは置換する。

### BRAIN-010-FR-01 — 条件付き失敗知識

親`HELIXBRAIN-L2-010`（固定L2 `brain-requirements.md:183-193`、L11 `brain-acceptance.md:38`）。採択registration `MPR-RC-HELIXBRAIN-L2-010-002`、semantic digest `sha256:bb9b45219db15affd84fd2098e37930da414358e9170f42d9f308143a3090b2a`（PO採択main 633）。L1-010、L2-003/005/007に従う。Anti-Pattern、Failure Pattern、Invalid Combination、Context-dependent Failure、Regression caseのsource/evidenceを、成立条件・影響・反例・scopeと共に条件付きknowledgeとして保持し、代替候補を返す。L11の列挙はSingle Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region/Zone Failure、Deployment/Backup/Restore Failure、configuration drift等。L10では選択fixtureに合わせ、各列挙familyの正常な条件付きknowledgeを個別に照合する。名称だけから普遍禁止・普遍適用を導かない。

- **BRAIN-010-AC-01 — 正常**：sourceが定義するfailure種別の一例について、成立条件、影響、反例、source/evidenceとscopeを保持し、その条件内外を混同せず参照できる。
- **BRAIN-010-AC-02 — 個別反例**：他fieldを正常に保ち、(a)成立前提の削除、(b)条件付き禁止の常時禁止化、(c)条件付きfailureの常時適用化、(d)影響欠落、(e)反例欠落、(f)source/evidence/scopeの欠落またはstaleを別fixtureで試す。いずれもfailureの適用判定を成立扱いしない。列挙にない条件やfailure taxonomyを追加しない。
- **BRAIN-010-AC-03 — unknownと戻し先**：条件またはscopeが定められないfindingをunknown/未確定に保ち、固定L2の戻し先であるLABO評価へ返す。source不在からfailure不存在を推定しない。
- **BRAIN-010-AC-04 — 未見**：未見failure形態は、独立source/evidence、明示条件、scope、反例と判定oracleがある範囲だけ照合する。条件が不足する枝はunknownとし、普遍規則へ拡張しない。

旧source対応：旧L3 FR/ACとacceptance designのfailure条件・反例・consumer向け照合構造を再導出するが、旧failure名・runtime挙動・TDD/GHA・閾値は移さない。BRAIN固有意味は固定L2/L11から再導出する。

### BRAIN-011-FR-01 — 製品固有意味の分離

親`HELIXBRAIN-L2-011`（固定L2 `brain-requirements.md:194-204`、L11 `brain-acceptance.md:39`）。採択registration `MPR-RC-HELIXBRAIN-L2-011-002`、semantic digest `sha256:726a83d698826a4376d6cf8bb47be6a10de671776d27d0b219ada48a38b77091`（PO採択main 633）。L1-011、L2-007/018/020/025に従う。束ねる条件はPO原文§BRAIN-L1-011に限り、要件のownerや意味を新設しない。製品CORE由来のsource contextから、根拠のある汎用構造候補と製品固有残余を分離し、元sourceと由来を保つ。分離不能ならBRAINへ受入せず提供元COREまたはLABOへ戻す。共有範囲について人の意味判断が必要な場合は既存の判断点を使い、ownerを推測で新設しない。

- **BRAIN-011-AC-01 — 正常**：同一source内の再利用可能構造と製品固有残余を区別でき、一般化の根拠・scopeと製品固有sourceへのtraceを保持する。製品固有部分を消去または汎用事実化しない。
- **BRAIN-011-AC-02 — 個別反例**：他要素を正常に保ち、製品名、product requirement、製品固有画面、業務規則、利用者判断の各一要素だけを汎用候補へ漏らすfixtureを独立に拒否する。元source/provenanceだけを失うfixture、再利用条件の根拠範囲を超えた一般化、一般化候補を確立済み事実として扱う変異も、それぞれ別fixtureとして拒否する。
- **BRAIN-011-AC-03 — unknownと戻し先**：分離できない意味はunknownのまま受入を止め、固定親にある提供元COREまたはLABOへ戻す。共有範囲の決定が必要なsourceは人の既存判断点へ送り、既存ownerへの自動割当やCORE/LABO返却で代替しない。未指定のownerを補わない。
- **BRAIN-011-AC-04 — 未見**：未見の別製品sourceにも同じ根拠付き分離を適用する。一般化を支える条件がない場合はunknownを保持し、単一製品から普遍化しない。

旧source対応：旧L3/ATとUI Domain Pattern Profileのproduct/common境界、field別failure、source-to-consumer traceを構造の類例として再導出する。UI entity・product profile・namespaceや旧ルールはBRAINのauthorityへ移さず、固定L2/L11から意味・ownerを再導出する。

### BRAIN-012-FR-01 — 候補返却と採用authorityの分離

親`HELIXBRAIN-L2-012`（固定L2 `brain-requirements.md:205-215`、L11 `brain-acceptance.md:40`）。採択registration `MPR-RC-HELIXBRAIN-L2-012-002`、semantic digest `sha256:f574ca7fda5b129544983c786c5c5881fa7c479e00d96cdeaa60757b7964493f`（PO採択main 633）。L1-012、L2-019/021/022に従う。束ねる条件はPO原文§BRAIN-L1-012とConceptのBRAIN/INTELLIGENCE/OS境界に限る。利用要求/問い合わせのdesign contextと必要な知識領域を受け取り、必要知識領域inputが欠落した場合は不足として示す。sourceに存在するPattern candidate、required input、relation、alternative、constraint、evidenceおよび各版を返す。sourceにalternativeまたはrelationが存在しない場合は、その不在だけで不成立にしない。採用決定はHARNESS-CORE、INTELLIGENCE、人など該当する既存ownerに残り、BRAINは製品固有選択や案件のruntime判断を返さない。

- **BRAIN-012-AC-01 — 正常**：query側にdesign contextと必要知識領域inputが揃った場合、複数候補とsourceに存在する列挙返却情報を版・source付きで返す。sourceにrelation/alternativeがない場合は不在として表し、候補状態と採用未決を保つ。必要知識領域input欠落時はその不足を示し、candidate不足と問い合わせ側input不足を混同しない。
- **BRAIN-012-AC-02 — 個別反例**：他条件を正常に保ち、(a)採用済みlabel、(b)製品固有選択、(c)runtime/operation decisionのいずれか一つだけをBRAINが生成する入力を別々に拒否する。sourceが返却対象として示すrequired input、relation、alternative、constraint、evidence、version fieldの欠落はそれぞれ個別変異として不成立にする。sourceにrelation/alternativeがない正常例を欠落として扱わない。
- **BRAIN-012-AC-03 — unknownと戻し先**：要求意味または重みが不明なら選択せず、unknownと未決状態を保ち、既存の責任ある判断先へ返す。BRAINの知識不足を理由にauthorityを拡張せず、新しいownerや承認手順を作らない。
- **BRAIN-012-AC-04 — 未見**：未見または曖昧なqueryでは根拠ある候補と不足項目を返し、比較できない情報を補わず採用選択しない。

旧source対応：旧L3 FR/ACと対acceptanceのconsumerへの出力・失敗分離を再導出する。旧HARNESS business outcome、旧choice planner、採用workflowを移さず、返却範囲と判断ownerは固定L2/L11から再導出する。

### BRAIN-029-FR-01 — 製品設計に利用する構成candidate

親`HELIXBRAIN-L2-029`（固定L2 `brain-requirements.md:564-574`、L11 `brain-acceptance.md:87-95`）。採択registration `MPR-RC-HELIXBRAIN-L2-029-001`、semantic digest `sha256:fd3bd6eaf17c5dad916dec0793c28544816c8b785e98fa854b49df843b11382d`（PO採択main 633）。親L1 primaryは003/005/009、consumer contextはHARNESS-L1-009/001。`version_target: 1.0`のcandidateである。常時必須はL2-008のidentity/version/provenance、L2-003のapplicability/required input、L2-005のrelation意味。比較時だけL2-004、構成candidate生成時だけL2-009とそのrelation条件を使う。選択した製品CORE sourceにはL2-018、選択したLABO評価済みsourceにはL2-020のsource/scope/evaluation契約を適用する。未選択sourceは未観測、参照資料は背景に限る。L2-030のconnection receipt義務を本親へ取り込まない。

Pattern/Unit/Partのidentity・source/version、一般化された課題、applicability、required input、constraint、trade-off、negative/failure、relation候補を、端点と意味を保って構成candidateにする。relationの種類は`compatible_with`、`conflicts_with`、`alternative_to`、`depends_on`、`composed_of`を各々元sourceに沿って保持する。relationの根拠・方向・端点を捏造せず、unknownを互換や不成立に丸めない。汎用permission構造は候補として扱えるが、製品固有requirement値、製品固有screen/具体API名、製品固有permission値、採用設計、工程表を返さず、一候補を絶対解にしない。製品固有要件・screen・具体API・製品固有permission値の不足または汎用候補への混入は固定L2:573とL11:117の受取境界に従ってHARNESSへ返す。これとは区別し、選択したCORE sourceそのもののidentity/revision/provenanceがmissing、unknown、staleまたは不一致の場合だけ、固定L2-018:401に従って製品Core（HELIX-HARNESS-CORE）へ戻す。知識意味・適用条件・relationは固定親のprimary L1-003/005/009へ戻す（項目別に適用条件=003、relation=005、候補構成/source結合=009）。L2-008 identity/version/provenance、L2-004比較条件、L2-009構成条件の不足も、L11:117の「BRAINの該当親L1へ」という句に従って構成candidateを止め、primary L1-009へ返す。これはL2-029が構成candidateを主対象とし、primary L1に003/005/009を列挙する固定親文脈に基づく割当であり、L1-004/008を追加の戻し先にしない。製品固有要件の戻し先はCORE sourceの選択有無にかかわらずHARNESSであり、CORE sourceのidentity/revision/provenance不足だけを製品Coreへ返す。選択LABO-evaluated sourceのL2-020 condition不明は評価済み扱いせずcandidate適用を止め、該当するknowledge condition/source結合としてprimary L1-003/009へ戻す。

- **BRAIN-029-AC-01 — 正常**：L11の一般化課題「承認後は編集不可」に対し複数Pattern/Unit候補のproblem、applicability、required input、constraint、trade-off、negative case、汎用permission構造、source/versionを保ち、両端identity付き関係を追跡可能にする。構成はcandidateのまま。
- **BRAIN-029-AC-02 — 個別反例**：製品固有term/screen/具体API/製品固有permission値の混入、required input欠落、選択source/version欠落、不整合な関係の互換扱い、意味または端点のないrelation確定、一回の製品適用による昇格をそれぞれ独立に拒否する。具体APIは製品固有screen/permission/requirementと別の入力要素として照合し、いずれも汎用Patternの事実に混ぜない。候補構成が不成立の場合、知識意味・適用条件・relationの不足はBRAIN-L1-003/005/009へ、製品固有要件・screen・具体API・permission値はHARNESSへ返す。選択CORE sourceのidentity/revision/provenance不足または不整合だけは、固定L2-018:401に従い製品Core（HELIX-HARNESS-CORE）へ返す。
- **BRAIN-029-AC-03 — relation例**：5種類それぞれのsource-backed edgeを独立に照合し、`compatible_with`、`conflicts_with`、`alternative_to`、`depends_on`、`composed_of`を同じ意味へ潰さない。relation type、両端identity、意味、source/versionと必要inputを保持する。
- **BRAIN-029-AC-04 — unknownと戻し先**：required inputやrelation意味が不明なら適用可否をunknownのまま保持し、知識意味はBRAIN-L1-003/005/009、製品固有要件はHARNESSへ返す。未選択CORE/LABO sourceや説明資料から欠けた値を補わない。
- **BRAIN-029-AC-05 — 未見**：L11の別Domain組合せまたはrequired input欠落例で同じsource/condition/endpoint照合を適用する。oracleまたはscope未定は未評価/unknownとし、合格や全Domain保証を作らない。

旧source対応：旧L3定義と対testの正常・失敗・未見・consumer traceを再導出する。UI profileのtyped entitiesや製品/共通境界は構造類例に限定し、画面schema・固定enum・製品採用規則・旧runtimeを移さない。新しい構成意味は固定L2/L11にのみ基づく。

### 固定親句→FR/AC→CASE trace（Stage 2b 001–006）

| 固定親 | 親句・source pin | FR/AC | 照合CASE |
|---|---|---|---|
| HELIXBRAIN-L2-001 | L2:84–94 / L11:29（main 633 fixed bytes） | FR-01、AC-01〜04。状態・10領域、変更4操作、追加6領域の非必須、unknown戻し、未見拡張を区別 | C01–C21。初期領域欠落/誤識別はC02–C11、独立反例はC12/C19/C20/C21、不明はC13、未見はC14、4操作正常はC15–C18 |
| HELIXBRAIN-L2-002 | L2:95–105 / L11:30（main 633 fixed bytes） | FR-01、AC-01〜04。4階層、parent/責務、孤立/誤種別unknownを対応 | C01–C15。構成/項目反例はC02–C09、file/code/UI componentだけの反例はC10–C12、孤立/誤種別unknownはC13/C14、未見はC15 |
| HELIXBRAIN-L2-003 | L2:106–116 / L11:31（main 633 fixed bytes） | FR-01、AC-01〜04。descriptor12要素/required input/条件充足・不充足・unknown・不足を別対応 | C01–C23。12要素はC01–C13、独立不足/誤昇格はC14/C19–C23、不明はC18、不充足はC17、未見はC16、required input/条件未定戻しはC15 |
| HELIXBRAIN-L2-004 | L2:117–127 / L11:32（main 633 fixed bytes） | FR-01、AC-01〜04。並列候補/6比較軸/選択非委任/判断不能を分離 | C01–C12。6軸はC02–C07/C12、独立上書き・選択権否定はC08/C11、判断不能はC09、未見はC10 |
| HELIXBRAIN-L2-005 | L2:128–138 / L11:33（main 633 fixed bytes） | FR-01、AC-01〜04。7 relation種、2 relation chain、端点/方向/意味/unknownを保持 | C01–C13。7 relation種C01–C08、独立反例C09/C12/C13、不明C10、未見C11 |
| HELIXBRAIN-L2-006 | L2:139–149 / L11:34（main 633 fixed bytes） | FR-01、AC-01〜04。15知識例、製品固有要素、Visual Design HARNESSとの責務境界 | C01–C19。15例C01–C16、独立反例C17、戻し先C18、未見C19 |

各CASEのexpected oracleは同じStage 2b L10表のcase rowに記録する。CASE→ACのみで固定句の被覆を主張しない。

## Stage 4 — 採択済み親018/019/020/021/022/023/030
**状態：承認済み。** この追補は固定PO登録`MPR-RC-HELIXBRAIN-L2-018/019/020/021/022/023/030-002`とL2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の7親だけを対象にする。main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択記録とmain `0f3ae318af1730f37123667e3efd914dda38dbda`の実装順序G0を根拠に、各親の`version_target: 1.0`、Stage 4を記録する。POが採択した登録revisionは各親の`-002`であり、現行registerの`-003`はsemantic digest不変のmetadata-only revisionである。`-003`のmetadata更新から`-002`への承認を継承せず、対象authorityはPO採択`-002`のまま扱う。これは先行Stage完了gate、release収載、実装許可ではない。後続版、version未指定、Web、保留・不採択親および未承認candidateは依存authorityにしない。

旧L3起点は`LEGACY-ASSET-F542125805B777D8A56A`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168`）とfunctional/business/NFR三分割の`LEGACY-ASSET-9A772391C7FB1298D45F`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`）、旧L10定義`LEGACY-ASSET-34DF3B535879CC73FA86`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162–170,195–207`）を起点にする。共通のbusiness/NFR比較は`LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–39,84–104`）と`LEGACY-ASSET-DB669724249A14A665F0`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74`）に限る。旧L3のFR/AC/paired verificationの関係を再導出するが、旧G3名・runtime・gateを継承しない。親固有旧sourceのasset IDとspanは次表で親へ結ぶ。固定親にないschema、enum、閾値、承認手続きは置換または除外する。full/raw pinsとledger行はappend-only補正監査に記録する。

| 固定親 | 旧要求・対検証source（asset IDとphysical span） | 旧項目の扱い |
|---|---|---|
| `HELIXBRAIN-L2-018` | `LEGACY-ASSET-F1F753F31DB8D874EF21` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:42–67`); `LEGACY-ASSET-BEAB5EE27CD04F5E866F` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/system-synthesis-acceptance.md:27–35`) | source identity/provenanceと推測接続拒否の形を再導出。whole synthesis/承認runtimeは置換。 |
| `HELIXBRAIN-L2-019` | `LEGACY-ASSET-5EE032D657C221184B00` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:43–54`); `LEGACY-ASSET-6FFD7F4E58066D08B053` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:25–32`) | facts/candidates/policy constraints/counterevidence/unresolvedの判断記録区分とpaired acceptanceのfield欠落oracleを限定再導出。旧interview schema/score/承認階層は置換。 |
| `HELIXBRAIN-L2-020` | `LEGACY-ASSET-28FB139B26CD61CC51EE` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:37–74`); `LEGACY-ASSET-A952A3A175EB82A4781B` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:21–39`) | scope/method/evidence/failure/未評価境界を比較。benchmark値/provider/実行は移さない。 |
| `HELIXBRAIN-L2-021` | `LEGACY-ASSET-5EE032D657C221184B00` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:43–54`); `LEGACY-ASSET-6FFD7F4E58066D08B053` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:25–32`) | candidate/proposalとcounterevidence/unresolvedの分離だけを限定再導出。decision engine/承認gateは置換。 |
| `HELIXBRAIN-L2-022` | `LEGACY-ASSET-5CBA32E9DB5B0FE05589` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:60–69`); `LEGACY-ASSET-3F00F5BC5606801FD562` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L8-design-registry-unit-test-design.md:29–42`) | typed identity/edge・双方向traceの構造を再導出。registry実装/parser/runtimeは置換。 |
| `HELIXBRAIN-L2-023` | `LEGACY-ASSET-335176749F6322C3CD8D` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:39–47`); `LEGACY-ASSET-879D95C07B789C9502CF` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:19–24`) | common/product境界とrequired/forbiddenの形式を再導出。UI profile/token/runtimeは移さない。 |
| `HELIXBRAIN-L2-030` | `LEGACY-ASSET-F1F753F31DB8D874EF21` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:49–61`); `LEGACY-ASSET-BEAB5EE27CD04F5E866F` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/system-synthesis-acceptance.md:29–33`) | SYN-R-02決定的部分合成と欠落oracleだけを再導出。whole synthesis/自動authorityは置換。 |

### BRAIN-018-FR-01 — 製品Core由来candidateのintake
- **固定親・依存・戻し先**：HELIXBRAIN-L2-007/011とHELIX-HARNESS-COREの候補出力contractを照合する。分離不能・由来や製品固有意味不明は製品Coreへ返す。採否はL2-025に残し、本親で生成しない。

HELIX-HARNESS-COREから受け取る入力を、抽出済みの汎用Pattern/Unit/Part候補、source/provenance、source revision、製品固有要素との関係、受取側identityに限定する。利用者raw originalは入力にしない。候補と製品固有意味を分離し、candidate stateでintake receiptを返す。receiptはPatternの成立・成熟・採用を意味しない。原本のConcept上の扱いを保持するが、保持期限・破棄証拠を追加しない。

- **BRAIN-018-AC-01 — 正常**：抽出candidateが汎用部分と製品固有残余をsource付きで区別でき、受取側identityとsource revisionが対応する場合に限りcandidate receiptを作る。
- **BRAIN-018-AC-02 — 個別反例**：raw original添付、raw originalをBRAINへ保存、個別製品名、製品要求、画面、業務規則、利用者判断の各混入、source identity/revision/provenance、製品固有要素とgeneric candidateの関係、receiver identity、HELIX-HARNESS-CORE候補出力contractのidentity/versionの各単独欠落またはunknownを別々に拒否する。candidate receiptだけでPatternをaccepted/matureにする変異も独立に拒否する。分離不能・由来や製品固有意味が不明な場合は隔離し製品Coreへ返す。採否はL2-025の既存経路に残す。宣言済みcontract compatibility range不一致は別fixtureで呼出しを止める。
- **BRAIN-018-AC-03 — 未見正常/unknown**：未見製品scopeでも根拠を示せる汎用部分をcandidateとして受ける。分離不能な一部分だけunknown/隔離とし、製品Coreへ差し戻す。全体を確立済み汎用知識へ昇格しない。

旧Synthesisの安定source identity/revision/provenanceと推測接続拒否を再導出し、旧runtime/system synthesis能力は置換する。旧paired acceptanceのidentity/revision/digest/authority欠落を照合する形だけ再導出し、旧case/gateは実行・移植しない。raw original除外とcandidate-onlyは固定L2から起草する。

### BRAIN-019-FR-01 — Product Coreへの知識候補提供
- **固定親・依存・戻し先**：L2-003/004/008/012とHARNESS-CORE受領contractを対象scopeで照合する。query scope/required input不足はProduct Coreへ照会し、knowledge identity/source/version/meaning不足はBRAIN L2-003/008または親L1へ返す。候補選択は接続先に残す。

Product Coreの対象課題、required input、constraint、参照可能なknowledge identity/versionを受け、Pattern/Unit/Part候補ごとに適用条件、alternative、relation、trade-off、counterexample、evidence、maturity、exact versionを比較可能な判断材料として返す。複数成立候補を消さず、選択・採用はProduct Core等の既存接続先に残す。unknownは推薦へ変換しない。

- **BRAIN-019-AC-01 — 正常**：scopeとrequired inputを備えるqueryに対し、複数の成立候補を消さず、required input、適用条件、代替、relation、trade-off、反例、根拠、maturity、exact versionを候補ごとに比較可能な判断材料として返す。relationの種類はsourceが宣言する場合の例であり、conflicts_with/alternative_toを固定要件にしない。BRAINは候補を比較可能なまま保持し、選択・採用は既存接続先に残す。
- **BRAIN-019-AC-02 — 個別反例**：scope欠落、required input欠落、候補identity欠落、version/revision不一致、query constraint欠落、参照knowledge identity欠落、参照version欠落、HARNESS-CORE受領contract identity欠落、contract version unknownを個別に与え、不足queryはProduct Coreへ、knowledge identity/source/version/meaning不整合はBRAIN L2-003/008または親L1へ返す。alternative、relation、trade-off、counterexample、evidence、maturity、適用条件、required input、constraintの各field欠落、複数成立候補の消去、unknownの推薦化、候補返却の採用昇格をそれぞれ独立に拒否する。query scope/required input不足はProduct Core、候補知識identity/source/version/meaningの不整合はL2-003/008または親L1へ戻す。contract compatibility range不一致は別fixtureで呼出しを止める。
- **BRAIN-019-AC-03 — 未見正常/局所unknown**：未見課題でquery必須fieldがそろい、一候補の適用可否だけunknownのfixtureでは、既知候補の情報を保って当該候補だけ保留し、未知を不存在・適用可能と推定しない。

旧UWJのfacts/candidates/policy constraints/counterevidence/unresolvedの区分とpaired acceptanceのfield欠落oracleを再導出する。旧interview schema、score、固定質問、承認階層は現行candidate-only境界に置換し、provider固定・精度/性能閾値を追加しない。

### BRAIN-020-FR-01 — LABO評価のcandidateへの接続
- **固定親・依存・戻し先**：常時L2-007/008/009/010のgeneric provenance/identity/stateとLABO evaluation contractを照合する。Infrastructure candidate maturityを選択したときだけL2-INFRA-017 state/evidenceを同revisionで照合する。evaluation不足はLABO、選択INFRA state/evidenceを対象revisionに結べない場合はunknown候補として止めLABOへ評価を返し、OS登録state不足はOSへ返す。BRAIN内独立検証は未完として保持する。

LABO evaluation receiptの対象revisionとcandidate revision、scope、method、evidence、result、failure、counterexample、unassessed rangeを、source/version/evaluation identityに結んで候補入力として保持する。部分評価の範囲を保ち、単一成功、AI生成、評価resultのみでPattern確立・採用・成熟に進めない。OS登録・振分け、BRAIN内独立検証、採否を先取りしない。L2-INFRA-017はInfrastructure candidateのmaturityを扱う場合だけ参照する。

- **BRAIN-020-AC-01 — 正常**：対象revisionが一致するevaluation receiptの全列挙要素と未評価範囲をsource/version/evaluation identityに結び、candidate input receiptとして返す。Infrastructure candidateのmaturityを扱う場合だけINFRA-017 state/evidenceを同revisionへ対応付ける。
- **BRAIN-020-AC-02 — 個別反例**：target/candidate revision不一致、LABO evaluation contract identity欠落、contract version unknown、scope/method/evidence/result/failure/counterexample/unassessed range各単独欠落、単一成功だけの昇格、AI生成だけの昇格、receiptからOS登録stateを決める変異、評価resultだけの昇格、BRAIN内独立検証省略をそれぞれ個別に拒否する。L2-007/008のgeneric provenance/identity/state各単独欠落とsource/version/evaluation identity各単独欠落を不合格にし、evaluation/source evidence不足はLABOへ返す。Infrastructure candidateのmaturityを扱うときだけL2-INFRA-017 state/evidenceを同revisionへ照合し、不一致/欠落はunknown候補として止め、LABOへ評価を返す。OS登録未了はOSへ返し、BRAIN内独立検証未了なら採否・成熟状態を未完のまま保持する。contract compatibility range不一致は別fixtureで呼出しを止める。
- **BRAIN-020-AC-03 — 未見正常/未評価範囲**：未見scopeの測定済部分と未評価部分を区分し、同candidate revisionに結ぶ。未評価部分からscope全体へ一般化しない。

旧HELIX-Benchのscope/method/failure/missing保持とself-reported score拒否を類例として再導出する。旧benchmark数値、category、runner/provider、admission thresholdは置換し、runtimeは実行しない。

### BRAIN-021-FR-01 — INTELLIGENCEへのsource付き判断材料
- **固定親・依存・戻し先**：L2-003/004/008/012とINTELLIGENCE query/response contractを照合する。query/scope不足はINTELLIGENCEへ、knowledge identity/source/version/meaning不整合はBRAIN L1または当該知識ownerへ返す。

INTELLIGENCE query/scopeに対してBRAIN knowledge identity/version、candidate、required input、条件、alternative、constraint、counterexample、evidenceを判断材料として返す。BRAINはruntime結論・選択を確定せず、INTELLIGENCEはBRAIN knowledgeを暗黙に改変・昇格しない。

- **BRAIN-021-AC-01 — 正常**：有効なquery scopeとsource/versionに結ばれた候補および固定親列挙fieldを返し、runtime decisionとknowledge adoptionを行わない。
- **BRAIN-021-AC-02 — 個別反例**：query scope欠落/別対象、INTELLIGENCE query/response contract identity欠落、contract version unknown、knowledge source identity欠落、version欠落、stale、mismatchを個別に試す。required input、condition、alternative、constraint、counterexample、evidence各単独欠落、BRAINによるruntime結論、INTELLIGENCEによるBRAIN knowledgeの改変または採用確定をそれぞれ独立に拒否する。query scope不足はINTELLIGENCE、knowledge identity/source/version/meaning不整合はBRAIN L1または当該知識ownerへ戻す。contract compatibility range不一致は別fixtureで呼出しを止める。
- **BRAIN-021-AC-03 — 未見正常/局所unknown**：未見query種別でもscope/sourceが有効な範囲の候補情報を返し、未知の判断内容だけunknownに保つ。固定親外runtime actionを生成しない。
- **BRAIN-021-AC-04 — 個別反例**：INTELLIGENCEが候補を一般化済み知識へ昇格する変異を、knowledge内容の改変・個別採用とは別fixtureで拒否する。採否は既存経路に残す。knowledge identity/source/version/meaningの不足はBRAIN L1または当該知識ownerへ戻す。

旧UWJのcandidate/proposalとcounterevidence/unresolved分離を限定再導出し、旧workflow decision engine・承認gateを置換する。旧case形式を実行せず、一般的判断精度/latency値も設けない。

### BRAIN-022-FR-01 — required inputからHARNESS-L2-009設計義務へのtrace
- **固定親・依存・戻し先**：L2-003/005/008とHARNESS-L2-009 contractを照合する。knowledge field/meaning/definition不足はBRAIN L1-003/005、受取contract/mapping/義務受領不足はHARNESSへ返す。

Pattern required input、前提、constraint、関連Pattern/evidence、Unit/Part dependencyをHARNESS-L2-009 obligationへ対応付け、source knowledge identity/versionを保つforward traceと、obligationから同じ元revision/fieldへ戻るreverse traceを保持する。BRAINは製品固有値、設計選択、工程表、遷移図、実装優先順位を単独決定しない。定義済みfieldのunknown valueとfield定義欠落を分け、未充足義務をopenにする。

- **BRAIN-022-AC-01 — 正常**：既知required fieldとdependencyをHARNESS-L2-009 obligationへ結び、両方向traceのsource revision/fieldが一致する。値が一つunknownでもfield identityと理由を渡し義務をopenで保つ。
- **BRAIN-022-AC-02 — 個別反例**：required input欠落、dependency endpoint欠落、dependency誤revision、forward trace誤結合、reverse trace欠落、reverse trace誤field、製品固有値決定、製品設計選択、工程表/遷移図/優先順位の決定、未充足義務の完了化、required-field definition欠落、HARNESS-L2-009 contract identity欠落、contract version missing/unknownを別々に拒否する（field定義欠落は固定L2-022自身のrequired input/義務接続条件に基づく）。required input/knowledge meaning/definition不足はBRAIN L1-003/005、受領方法やreceiver contract/mapping/義務受領の不足はHARNESSへ返す。
- **BRAIN-022-AC-03 — 未見正常/unknown**：未見Patternでfield定義は存在し値一つだけunknownならreceiptとopen obligationを維持する。field定義そのものが欠ける別fixtureは値unknownと扱わずBRAINへ戻す。
- **BRAIN-022-AC-04 — contract failure**：HARNESS-L2-009 contract identity欠落、contract version missing、contract version unknownを各単独で与え、呼出しを止め、受領方法を確定せずHARNESSへ返す。宣言済compatibility range不一致でも呼出しを止め、unknownを保持してHARNESSへ返す。

Design Registryのtyped identity/edge、orphan検出、双方向traceを局所再導出する。旧registry implementation/ID/parser/runtimeは置換する。旧L3の他項目を流用しない。固定L2が指定するHARNESS-L2-009 obligationを独立に保持する。

### BRAIN-023-FR-01 — Visual Design/UX知識と製品固有設計の分離
- **固定親・依存・戻し先**：L2-006/007/009/011/012、Visual Design HARNESSおよびLABO connection contractを照合する。製品固有要素の混入は該当Product Coreへ戻す。利用結果がLABOを経由しない場合は候補昇格を止める。その他のcontract/適用/source不足は固定親に戻し先がないためunknownを保持し、ownerを推定しない。

Visual Design HARNESSの課題と製品scopeから、汎用Visual Design/UX Pattern/Unit/Part、条件、反例、required inputをcandidateとして渡す。利用・評価結果はLABOを経由したsource/evaluation relationとしてcandidateに戻す。Visual Identity、screen、flow、token等の製品固有設計は各Product Coreに残す。ここでは未承認Visual Design candidateをauthorityにしない。

- **BRAIN-023-AC-01 — 正常**：課題/source/scopeが識別され、根拠あるgeneric candidateと製品固有残余が区別される。利用・評価resultはLABO経由のsource relationを保ち、採用・昇格しない。
- **BRAIN-023-AC-02 — 個別反例**：Visual Identityのgeneric knowledgeへの混入、screenのgeneric knowledgeへの混入、flowのgeneric knowledgeへの混入、tokenのgeneric knowledgeへの混入、applicability欠落、required input欠落、counterexample欠落、Visual Design HARNESS/LABO contract identity欠落、contract version missing/unknownを各単独で拒否する。LABO routeなしのgeneric knowledge昇格、Product Coreとのscope relation欠落、source relation欠落も各独立に拒否する。製品固有要素の混入は該当Product Coreへ戻す。利用結果がLABOを経由しない場合は候補昇格を止める。その他のcontract/適用/source不足は戻し先を推定せずunknownで保持する。
- **BRAIN-023-AC-03 — 未見正常/未評価**：未見screen種・製品scopeから根拠あるgeneric部分だけをcandidateとして保持し、製品固有残余はProduct Coreへ、未評価部分はcandidate/未評価のまま残す。

- **BRAIN-023-AC-04 — contract failure**：Visual Design HARNESS/LABO contract identity欠落、contract version missing、contract version unknownを各単独で与え、候補受渡しを保留する。L2:451に戻し先の指定がないためunknownを保持し、ownerを追加しない。宣言済compatibility range不一致でも呼出しを止め、unknownを保持し、ownerを追加しない。


旧VDH Pattern Contractのrequired/forbiddenとcommon/product separationを限定再導出する。旧UI profile、screen ledger、token semantics/runtimeは移植しない。旧paired acceptanceはsemantic ID/source-to-evidence traceの形だけを参照する。

### BRAIN-030-FR-01 — BRAIN知識からHARNESS-COREへのconnection receipt
- **固定親・依存・戻し先**：常時必須のconnection contract identity/version/compatibility、query/receipt schema、scope/correlation identity、receiver HARNESS-L2-009 contractを照合する。選択knowledgeだけidentity/version/source/applicability/required field/relation/negative caseを照合し、未選択knowledgeは未観測、参照資料は背景のみとする。receiver scope/schema/mapping不足はHARNESSへ返し、fixed parentがownerを定めないcontract ownerは推測せずunknownに残す。

BRAIN→HARNESS-CORE query/receipt接続において、常時必須のconnection contract identity/version/compatibility、query schema、receipt schema、scope/correlation identity、receiver HARNESS-L2-009 contractを照合し、HARNESS-COREがBRAIN connectorを使う常時契約と、009の設計義務への対応付けを区別する。選択知識についてのみknowledge identity/version/source/applicability/required input/relation/negative caseを照合して設計義務材料receiptへ結び、未充足input/relationを保持する。適用条件unknownは適用可能に変換しない。定義済fieldの値unknownはreceipt可能だが義務はopen、field定義欠落は通常受領しない。未選択knowledgeは未観測、参照資料は背景のみである。receiptは義務充足・connection/design complete・implementation readyを意味しない。製品固有screen/API/DB/state/permission/design conclusionや設計選択は出力せず、HARNESS-L2-009 obligation receiptのidentityと未充足状態を保持する。receiptのみから設計義務充足、design complete、implementation readyを生成しない。

- **BRAIN-030-AC-01 — 正常**：常時contract群がそろったfixtureで、選択knowledgeなしを未観測として処理できる。別fixtureでは二つの成立候補のsource-declared conflicts_with/alternative_toを含むrelation、identity/version/sourceと全required fieldsをHARNESS-L2-009へ対応付け、HARNESSが両候補を保持できるreceiptを返す。BRAINは採用先を選ばず、未決fieldと未充足義務を残す。
- **BRAIN-030-AC-02 — 個別negative**：常時contractのidentity missing、version missing/stale/unknown、compatibility range自体のmissing、compatibility mismatch、query schema欠落、不一致、receipt schema欠落、不一致、scope/correlation identity欠落、不一致、receiver L2-009 contract欠落、不一致を個別変異する。各々呼出しを保留する。固定親で明示されたreceiver contract/scope/schema不整合はHARNESSへ戻す。connection contract自体の責任ownerが固定親で定まらない不足はunknownとして保持し、ownerを創作しない。
- **BRAIN-030-AC-03 — 選択knowledge negative**：選択knowledge identity、version、source、applicability、required-field definition、relation、negative caseの各単独欠落、knowledge versionのstale/mismatch、source identity不一致、field定義不一致、relation矛盾、参照資料だけでreceipt/required field/authorityを代替する変異を別々に試す。定義済required valueの未設定はAC-05の受領可能/open条件で扱い、field定義欠落と混同しない。定義欠落を値unknownとして受領せず、知識意味/field不足はBRAIN、receiver scope/schema/mappingはHARNESSへ返す。参照資料は背景に限り、要求field/receiptの代替としない。
- **BRAIN-030-AC-04 — traceと未完義務**：Pattern/Unit/Part/inputからHARNESS obligationへのforward trace、およびobligationから同じknowledge revision/fieldへのreverse traceをそれぞれ単独で欠落・誤結合させる。製品固有screen/API/DB/state/permission/design conclusionをBRAINが返す変異と、HARNESS-L2-009 obligation receipt identityまたは未充足状態を落とす変異を個別に拒否する。未充足義務を閉じる、receiptを設計完成/実装準備に昇格する、別Pattern成功で穴を相殺する変異も個別に拒否する。receiver obligation/receipt/trace不備はHARNESSへ返す。
- **BRAIN-030-AC-05 — unknown/未見**：選択knowledgeのfield定義がある値unknown fixtureではreceiptとfield identity/理由を保ち義務openとする。定義不在fixtureは受領不可としてBRAINへ返す。適用条件そのものがunknownなら適用可能を推定せず、当該適用を保留する。宣言済compatibility range内の未見pairは同じcontractで照合する。未見fixtureでは未公開Pattern pairまたは互換範囲外版を用い、required field・relationとunknownのreceipt保持を照合し、未宣言または範囲外の互換性を成立と推測しない。未選択knowledgeは常に未観測のままとする。

- **BRAIN-030-AC-06 — authority境界**：BRAIN出力をHARNESS要求authorityの上書きとして扱わず、候補の受渡し、BRAIN内候補の構成、LABO評価の存在のそれぞれからPattern採択・承認・実装を生成しない。成功の範囲は当該knowledge identity/versionとquery scopeに限る。


旧System Synthesisの`SYN-R-02`決定的部分合成とrequired verification省略拒否だけを局所再導出する。旧whole synthesis、CI completion、自動authority/runtimeは置換する。paired testの29–33行のうちSYN-AC-003/004（SYN-R-02）の決定性比較・verification omission拒否の形式だけを再導出する。SYN-AC-001/002（SYN-R-01）の接続identity・DB再構築とSYN-AC-005（SYN-R-03）の単発成功promotionは本親の再導出対象外の参照資料とし、実行しない。


## Stage 5 — HELIXBRAIN-L2-024/025 Infrastructure境界と知識採否

**状態：承認済み。** 親はPOが固定した `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2/L11で、両方 `version_target: 1.0`、G0登録はStage 5。G0登録のproposal metadataはauthorityを持たず、stage割当てをL3承認、実装・実行・昇格許可へ広げない。未採択・保留・不採択の親を新たに使用しない。

旧L3区分とFR+ACを対L10へ結ぶ配置は `LEGACY-ASSET-9A772391C7FB1298D45F`（旧 `docs/design/harness/L3-functional/README.md:16-56`）と `LEGACY-ASSET-F542125805B777D8A56A`（旧 `docs/process/forward/L00-L06-design-phase.md:148-168`）から形式を再導出する。L10側がL3のsystem behaviorを照合する関係は `LEGACY-ASSET-34DF3B535879CC73FA86`（旧 `docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`）から再導出する。旧G3/旧層番号やsub-gateは移さない。

### BRAIN-024-FR-01 — HELIXBRAIN-L2-024 Infrastructure設計知識と実績のCORE/LABO経由分離

固定L2-024の受渡しを、(a) Infrastructure設計知識から製品固有設計を導くHARNESS-CORE/HARNESS経由、(b) Runtime ownerが保持する実利用結果からLABO評価を経てBRAIN candidateへ戻る経路として分ける。BRAINはRuntime実データを直接read/write/learningせず、server/network/databaseの実状態、provider account、credential、操作権限、実log/metricsを保存・所有しない。Runtime実状態のownerはHELIX自身ならHELIX-INFRASTRUCTURE、対象製品ならそのRuntime ownerである。製品固有設計の採否はCore、評価はLABO、汎用Pattern意味はBRAINに残す。

**保持・変更**：旧RCLS-BR-006は学習機構が既存authorityを奪わず提案を出す意味として再導出する。旧RCLS-BR-004の段階・責務分離も候補状態／評価／登録／独立検証を分ける点で再導出する。旧RCLS sourceにInfrastructureの実server/network/database状態、provider account、credential、操作権限、実log/metrics・Core/LABO経路の直接対応はなく、現行固定L2-024、L2-INFRA-009/010/012/017、L2-019/020/022から固有のflowを再導出する。旧runtime、旧DB、古いshadow/cross-project運用は置換し、L2にないshadow期間やcross-project検証、人間承認を必須にしない。

**依存・版・戻し先**：固定L2-024:460が列挙するL2-INFRA-009/010/012/017、L2-019/020/022およびCORE/Runtime/LABO contractを依存traceとして照合する。通常armでは、選択したL2-INFRA-017の参照identityと対象revisionについて、入力source receiptの値とBRAIN出力を一致照合する。固定L2-020:420が定めるとおり、L2-INFRA-017固有のmaturity state/evidenceを照合するのはInfrastructure candidate maturityを扱う場合に限り、その場合も同じ対象revisionへ結ぶ。maturityを選ばない通常armにはmaturity判定を要求しない。maturity選択armではL2-INFRA-017に定義されたBRAIN version、project usage version、利用実績、failure、反例、LABO評価の各値もsource receiptとfield単位で一致照合する。固定親にないcompatibility relation/schema、state/evidence schema、owner、閾値を追加しない。実状態・操作・raw runtime dataはRuntime owner、評価source/scopeはLABO、製品設計はCore、汎用Pattern意味はBRAINへ返す。L2でownerが指定されない不整合はunknownを保持しownerを創作しない。`version_target: 1.0`。

- **BRAIN-024-AC-01 — 正常な二経路**：Infrastructure design candidateのsource/revisionをCore向け設計知識receiptとして追跡し、別のRuntime owner実利用結果はRuntime owner→LABO評価（source/scope/result/failure/反例/未評価範囲）→L2-020候補として追跡する。BRAIN側candidate/evaluation receiptのsource identity・source revision・candidate/target revision・scopeはsource値と一致させ、二経路の由来を保ち、Runtime実状態のowner記録を別identityで保持する。
- **BRAIN-024-AC-02 — 個別拒否・責務境界**：BRAINからの直接Runtime read、直接Runtime write、実績を受けた直接learningを別々に拒否する。さらにserver state、network state、database state、provider account、credential valueの保存、credential referenceの保存、操作権限、実log、実metricsをそれぞれ単独変異として拒否し、credential referenceの直接流入停止も保存拒否と分けて確認する。Core迂回、LABO迂回、owner identity移動も個別に拒否する。各拒否は実状態/操作をRuntime owner、製品設計をCore、評価をLABOへ返し、汎用知識意味だけBRAINへ戻す。

### BRAIN-025-FR-01 — HELIXBRAIN-L2-025 内部知識candidateの独立検証・採否

内部knowledge candidateの提案、LABO evaluation、OS registration/routing、BRAIN change手続き内のindependent verification、adoptionを、それぞれのowner・identity・対象revisionを保った別状態で扱う。AI生成、単一実績、LABO evaluation単独、OS ticket単独、文書存在単独はaccepted/matureを証明しない。失敗、反例、未評価範囲、hold/rejectを保持し、適切な不足ownerへ戻す。L2-025の候補中にInfrastructure maturityを扱う場合だけ、L2-INFRA-017の状態/evidenceを同じ対象revisionへ接続する。非Infrastructure候補にそのmaturity判定を強制しない。製品固有意味は該当Product Coreに残し、generic knowledgeへ混ぜない。

**保持・変更**：旧RCLS-BR-004の段階分離、旧RCLS-BR-006の提案と既存authorityの分離を再導出する。旧paired `RCLS-AC-004/007/019`のindependent verification、state transition/hold/revoke、authority語彙分離のoracle類型を意味比較の起点にする。旧 `RCLS-AC-017` が追加していたproject-to-cross-projectのhuman approvalは、現行L2-025/L1-007が置くOS登録振分け・LABO評価と「人の判断は上流意味に限る」というPO決定に合わないため採用しない。旧shadow enforcementを現行の必須状態にせず、旧runtime/schema/role tupleも移さない。意味変更を伴わない技術差分には新しいhuman approvalを設けない。

**依存・版・戻し先**：L2-007/008/009/011/012/020、必要な場合のみL2-INFRA-017、LABO/OS/BRAIN change contracts。source/evaluation不足はLABO、登録・進行はOS、BRAIN changeのindependent verificationはBRAIN change owner、知識意味は該当L1、製品固有意味はProduct Coreへ戻す。unknown/hold/rejectはaccepted/matureへ進めない。`version_target: 1.0`。

- **BRAIN-025-AC-01 — 正常な状態別trace**：内部candidateから始まり、source/provenance/revision、LABO evaluationの対象scope/method/result/failure/counterexample/unassessed range、OS registration/routing、BRAIN change revisionのindependent verificationと結果、最後の採否を個別owner・identity・対象revision付きで示す。全前提が固定契約どおり揃う場合に限りadoption stateへ進み、意味を変えない技術差分にhuman approvalを追加しない。提供する未完義務・finding・反例の各receiptについて、入力sourceにあるidentity・内容・担当owner・対象revisionが出力でも一致する。これらの残余を消去して採否完了とはしない。
- **BRAIN-025-AC-02 — 入力欠落・誤昇格**：source identity、provenance、candidate revision、LABO evaluation identity、evaluation scope、method、result、failure、counterexample、未評価範囲、OS registration/routing state、BRAIN change identity、BRAIN change revision、independent verification evidence、independent verification resultの各欠落を単独で与える。どれもsuccess/accepted/matureに丸めず、欠落fieldと担当ownerを示し、該当段階のまま保留する。AI生成のみ、単一成功のみ、LABO評価のみ、OS ticketのみ、文書存在のみからの昇格をそれぞれ独立に拒否する。
- **BRAIN-025-AC-03 — 順序・revision・owner**：各receiptが存在していても、LABO評価より前に記録されたOS登録、OS振分けより前に記録されたBRAIN検証、independent verificationより前に記録されたadoptionは順序不成立として拒否する。receiptの存在は保持し、欠落/unknownへ読み替えない。評価対象とcandidate revisionの不一致、評価後にcandidate revisionだけが変化した状態、OS/LABO/BRAINのownerまたはstate取り違え、verification subject revision不一致をそれぞれ独立に拒否する。状態は推測で補わずunknownまたは保留を返し、誤ったownerへ書き戻さない。
- **BRAIN-025-AC-04 — 正常なhold/rejectとmaturity適用条件**：根拠あるholdおよびrejectを正規終端状態として保持し、accepted/matureへ昇格させない。Infrastructure candidateでmaturityを扱うfixtureではL2-INFRA-017の状態/evidenceを対象revisionへ結ぶ。Infrastructureでない候補ではmaturity判定を不要とし、当該親の他の受入条件を満たす正常pathを認める。選択したmaturity state/evidence/revisionがunknownまたは不一致なら保留し、未選択candidateへ一律適用しない。maturity evidenceの不足・対象revision不一致はsource/evaluation不足としてLABOへ返す。L2-INFRA-017は参照契約であって返却ownerにはしない。
- **BRAIN-025-AC-05 — 製品固有意味の分離**：製品要求/業務規則/製品判断がcandidateに含まれるときgeneric BRAIN knowledgeへ昇格せず該当Product Coreへ返す。generic meaningとproduct-specific remainderを区別できる候補は、固定L2の他条件に従って評価を続ける。

- **BRAIN-025-AC-06 — 提供receiptの個別照合**：AC-01の他条件を保ち、finding・未完義務・反例の各receiptについて、欠落、内容改変、owner取り違え、対象revision不一致を一項目ずつ独立に与える。既知のreceipt分類は固定L2-025:471の戻し先へ対応させる：source/evaluationに属するfinding・反例はLABO、登録/進行に属する未完義務はOS、知識意味は該当L1、BRAIN変更検証はBRAIN change ownerへ戻す。元sourceの内容・owner・対象revisionは保持する。元owner自体がunknownならそのunknownを保ち推定しない。分類と戻し先もunknownなら進行を保留し完了させない。receiptの存在だけで残余解消や採否完了を生成しない。


| 親 | AC | 明示CASE trace |
|---|---|---|
| `HELIXBRAIN-L2-024` | `BRAIN-024-AC-01` | `L10-BRAIN-024-C01`, `L10-BRAIN-024-C02`, `L10-BRAIN-024-C40`, `L10-BRAIN-024-C46`, `L10-BRAIN-024-C50` |
| `HELIXBRAIN-L2-024` | `BRAIN-024-AC-02` | `L10-BRAIN-024-C03`–`L10-BRAIN-024-C39`（索引C10/C15を含む）、`L10-BRAIN-024-C41`–`L10-BRAIN-024-C45`、`L10-BRAIN-024-C47`–`L10-BRAIN-024-C49`、`L10-BRAIN-024-C51`–`L10-BRAIN-024-C54` |
| `HELIXBRAIN-L2-025` | `BRAIN-025-AC-01` | `L10-BRAIN-025-C01`, `L10-BRAIN-025-C33`, `L10-BRAIN-025-C46` |
| `HELIXBRAIN-L2-025` | `BRAIN-025-AC-02` | `L10-BRAIN-025-C02`, `L10-BRAIN-025-C03`, `L10-BRAIN-025-C04`, `L10-BRAIN-025-C05`, `L10-BRAIN-025-C06`, `L10-BRAIN-025-C10`, `L10-BRAIN-025-C11`, `L10-BRAIN-025-C12`, `L10-BRAIN-025-C13`, `L10-BRAIN-025-C14`, `L10-BRAIN-025-C15`, `L10-BRAIN-025-C16`, `L10-BRAIN-025-C17`, `L10-BRAIN-025-C18`, `L10-BRAIN-025-C19`, `L10-BRAIN-025-C20`, `L10-BRAIN-025-C21`, `L10-BRAIN-025-C22`, `L10-BRAIN-025-C35`, `L10-BRAIN-025-C36`, `L10-BRAIN-025-C50`, `L10-BRAIN-025-C51`, `L10-BRAIN-025-C52` |
| `HELIXBRAIN-L2-025` | `BRAIN-025-AC-03` | `L10-BRAIN-025-C07`, `L10-BRAIN-025-C08`, `L10-BRAIN-025-C09`, `L10-BRAIN-025-C23`, `L10-BRAIN-025-C24`, `L10-BRAIN-025-C25`, `L10-BRAIN-025-C26`, `L10-BRAIN-025-C34`, `L10-BRAIN-025-C37`–`L10-BRAIN-025-C45`, `L10-BRAIN-025-C67` |
| `HELIXBRAIN-L2-025` | `BRAIN-025-AC-04` | `L10-BRAIN-025-C27`, `L10-BRAIN-025-C28`, `L10-BRAIN-025-C29`, `L10-BRAIN-025-C30`, `L10-BRAIN-025-C47`, `L10-BRAIN-025-C48`, `L10-BRAIN-025-C49` |
| `HELIXBRAIN-L2-025` | `BRAIN-025-AC-05` | `L10-BRAIN-025-C31`, `L10-BRAIN-025-C32` |
| `HELIXBRAIN-L2-025` | `BRAIN-025-AC-06` | `L10-BRAIN-025-C53`–`L10-BRAIN-025-C66`, `L10-BRAIN-025-C68`–`L10-BRAIN-025-C70` |
