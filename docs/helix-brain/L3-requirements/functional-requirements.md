# HELIX-BRAIN L3 機能要件 — Stage 1（007/008/028）

**状態：部分草稿・未承認。** 本文はPOが採択した固定L2/L11 revisionのうち`HELIXBRAIN-L2-007/008/028`だけを具体化する。HELIX-BRAIN全体や他StageのL3完了を示さず、実装・実行許可を生成しない。対象3親の版印は各親どおり`version_target: 1.0`。後続版・Web条件付き内容を1.0へ前倒ししない。

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

- **BRAIN-007-AC-01 — 正常・追跡**：完全なsource/evidenceとscopeがあり、LABO対象revisionがcandidate revisionに一致する場合、採否前candidateの各owner stateを分離し由来を追跡する。既存契約に沿って採用済みの記録も、同じsource/evidenceからLABO評価、OS登録・振分け、独立検証および採否根拠まで辿れる。新しい判定閾値・actor承認は設けない。
- **BRAIN-007-AC-02 — 異常・境界**：source identity/revision、provenance、evidence、adopted reason、evaluated scope、counterexample、limitationのいずれか欠落・stale・不一致、LABO評価を未実施なのに評価済みとする入力、LABO対象revisionの不一致、AI生成のみまたは実績一件のみでaccepted/matureとする入力は不成立。採用状態にしない理由と不足項目を示し、根拠欠落・staleはcandidateに保って未採用候補へ戻してpromotionを停止し、評価未実施・対象revision不一致はLABOの既存評価契約へ、上流意味変更は該当L1へ戻す。LABO評価、OS登録・振分け、BRAIN独立検証、採否の4状態を相互に代用しない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力／trace：Pattern・Unit・Part候補とsource、provenance、evidence、採用理由、evaluated scope、counterexample、limitation、LABO対象revision | `BRAIN-007-FR-01 / BRAIN-007-AC-01` | `L10-BRAIN-007-C01,C02,C03,C05` | 全field、source/revision、scope、LABO評価対象revision |
| 出力・責務：由来から採用状態まで追跡し、LABO評価、OS登録・振分け、BRAIN独立検証・採否は別状態 | `BRAIN-007-FR-01 / BRAIN-007-AC-01` | `L10-BRAIN-007-C01,C07,C08` | candidateと既採用record双方のsource-to-decision trace、各owner別state |
| 否定・失敗：AI生成だけまたは一件の実績だけではaccepted/matureにしない | `BRAIN-007-AC-02` | `L10-BRAIN-007-C04` | 誤昇格0 |
| 戻し先：source/evidence欠落時はcandidateへ戻しpromotionを止める。上流意味変更だけL1へ戻す | `BRAIN-007-AC-02` | `L10-BRAIN-007-C02,C03,C05` | 不足field・停止状態・未採用候補／LABO／該当L1戻し先 |
| 依存・版：L1-007、L2-011/025、LABO→BRAIN `HELIXBRAIN-L2-020`、version 1.0 | `BRAIN-007-FR-01 / BRAIN-007-AC-01,AC-02` | `L10-BRAIN-007-C01,C05` | 依存revisionとcandidate/LABO対象revisionを照合し、version_targetを実装・採否と混同しない |
| L11正常・反例caseのAC/L10結合 | `BRAIN-007-AC-01, BRAIN-007-AC-02` | `L10-BRAIN-007-C01`〜`L10-BRAIN-007-C09` | scope/counterexample欠落、revision mismatch、stale evidence、別owner receipt、採用済み記録を各fixtureで区別し、該当状態と戻し先を観測 |

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

## Stage 2b追補 — 採択済み001〜006の部分草稿

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixは最新main `a7ae47c0bd97cd53298594086923c73dfb2a712b`で承認済みのbytesを保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

### BRAIN-001-FR-01 — 領域identityと進化

親：`HELIXBRAIN-L2-001`、registration `MPR-RC-HELIXBRAIN-L2-001-002`、semantic digest `sha256:e708841bf5f5560a96915866d68dd4d37cd663bb250e61084e1d19ebf2eb4abf`。PO decision main633 L48。固定L2 `brain-requirements.md:84–94`、固定L11 `brain-acceptance.md:29`と共通24–26。依存：HELIXBRAIN-L1-001 / Conceptの機構境界。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

設計知識のDomain identity・意味・状態とPattern参照を保持する。初期10領域を識別し、一覧を固定enumにせず追加・分割・統合・退役を表す。各変更後も既存relationの利用者と参照先を識別する。製品/projectをDomain化せず、追加候補6領域の初版充実を必須にしない。

- **BRAIN-001-AC-01 — 正常**：10初期領域を別identity/意味/状態で与え、各Patternの参照先を照合する。Visual DesignとUX / Interactionも初期集合に残る。
- **BRAIN-001-AC-02 — 反例**：初期10領域のいずれかの欠落・誤識別・意味対応不明を個別に不成立とする。製品/project名をDomainに固定する入力、追加可能6領域の初版充実を必須とする入力、既存relation利用者を消す入力もそれぞれ個別に拒否する。
- **BRAIN-001-AC-03 — 不明と戻し先**：領域の分類意味が重複または不明なら候補のまま停止し、意味差をHELIXBRAIN-L1-001へ返す。
- **BRAIN-001-AC-04 — 未見と責務境界**：未見Domainを初期enumにないことだけで拒否しない。意味と既存参照を照合し、追加/分割/統合/退役のいずれでも旧参照利用者を消さない。

旧sourceとの対応：RDJ-FR-009のstable identityと未解決情報を隠さない意味を再導出。Domainの10領域・4変化操作は旧RDJにあるとはせず、固定L2-001から再導出する。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。各完全CASE IDは対の表に固定し、監査で親句対応を再照合する。

### BRAIN-002-FR-01 — 階層の意味と関係

親：`HELIXBRAIN-L2-002`、registration `MPR-RC-HELIXBRAIN-L2-002-002`、semantic digest `sha256:6ea1c1d2d7808649aaa553fbc6afcf814e72eeb24a0e83caf89c7d043fe70039`。PO decision main633 L49。固定L2 `brain-requirements.md:95–105`、固定L11 `brain-acceptance.md:30`と共通24–26。依存：HELIXBRAIN-L1-002 / HELIXBRAIN-L2-001。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

Domain→Pattern→Design Unit→Part以上の再利用構造を、各identity・包含/構成relation・責務・親を伴って辿れる。file、code snippet、UI componentの集合だけをPattern知識と誤認しない。具体の保存方式/クラス型を確定しない。

- **BRAIN-002-AC-01 — 正常**：Visual Design Domain→Dashboard Pattern→Navigation/KPI/Work Area Unit→Table/Filter/Status Partを、各段階のidentity/責務/親とrelation付きで辿る。
- **BRAIN-002-AC-02 — 反例**：fileのみ、code片のみ、UI component集のみをPatternとして返す各入力を不合格とする。identity欠落・孤立・誤種別も項目別に検出する。
- **BRAIN-002-AC-03 — 不明と戻し先**：階層または要素の意味を決められない項目をunknown/候補保留とし、HELIXBRAIN-L1-002へ返す。
- **BRAIN-002-AC-04 — 未見と責務境界**：未見の正当な構成にも同じidentity/親/責務照合を適用する。例の名前だけから意味を推測しない。

旧sourceとの対応：VDH-FR-003/VDH-AC-003のsemantic identityとclass/file pathだけでは意味traceを代用しない点、Design Templateの意味identityを再導出。旧screen/region/slot/action/state/bindingやJSON方式は置換し、BRAIN4段階は固定L2-002から再導出。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。各完全CASE IDは対の表に固定し、監査で親句対応を再照合する。

### BRAIN-003-FR-01 — Pattern成立条件

親：`HELIXBRAIN-L2-003`、registration `MPR-RC-HELIXBRAIN-L2-003-002`、semantic digest `sha256:0c9aa2e7b9c84e47147fc40fb2893ae58a7bbd08b5975dc925299a184824dc56`。PO decision main633 L50。固定L2 `brain-requirements.md:106–116`、固定L11 `brain-acceptance.md:31`と共通24–26。依存：HELIXBRAIN-L1-003 / HELIXBRAIN-L2-002。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

Pattern候補とsource、対象問題、前提、利用時inputを受け、12列挙要素を持つdescriptorへ結ぶ。各条件の充足/不充足/unknownを区別し、Patternの存在を今回の適用可能/採用に変換しない。

- **BRAIN-003-AC-01 — 正常**：fixture sourceが宣言する問題・前提・applicabilityとrequired inputを満たすPattern候補Pを受け、各descriptor値を元sourceへ辿り、当該scopeの条件充足を表示する。採用決定は返さない。
- **BRAIN-003-AC-02 — 反例**：descriptor各要素の欠落、negative/failure/evidence欠落、必要inputの一項目欠落、条件不充足、存在だけで採用する入力を個別に照合し、適用可能と断定しない。
- **BRAIN-003-AC-03 — 不明と戻し先**：条件の意味・必須inputが未定なら適用提案を停止し、HELIXBRAIN-L1-003または該当要求意味ownerへ返す。unknownを条件不充足や充足へ丸めない。
- **BRAIN-003-AC-04 — 未見と責務境界**：未見scopeでも同じ条件とsourceを照合する。互換性やmaturityの存在だけで採用せず、未入力の必須条件は未解決のまま返す。

旧sourceとの対応：旧Design Templateの適用条件・必須input/field・negative/evidenceとRDJ未解決templateの非捏造を意味再導出。旧typed predicate文法/JSON canonical/registry/strict enum/承認gateは置換し、12要素と適用/採用の分離は固定L2-003を根拠とする。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。各完全CASE IDは対の表に固定し、監査で親句対応を再照合する。

### BRAIN-004-FR-01 — 候補比較と選択責務

親：`HELIXBRAIN-L2-004`、registration `MPR-RC-HELIXBRAIN-L2-004-002`、semantic digest `sha256:ea1ad035c22d4c34626ec52cea621e47f304c66f97c0f44507a01e1325a3686b`。PO decision main633 L51。固定L2 `brain-requirements.md:117–127`、固定L11 `brain-acceptance.md:32`と共通24–26。依存：HELIXBRAIN-L1-004 / HELIXBRAIN-L2-003/012。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

同じ問題に成立し得る複数Patternを、長所/短所/constraint/failure/cost/適用条件で並列に保持する。成立する候補を一つの絶対解で上書きせず、製品での選択をBRAINの決定として行わない。

- **BRAIN-004-AC-01 — 正常**：同問題のStrong Consistency、Eventual Consistency、Compensating Transactionを、fixture source別の6比較軸とsource/適用条件付きで併存させる。数値や長短は各入力sourceどおりで、BRAINが新規に事実を断定しない。
- **BRAIN-004-AC-02 — 反例**：候補一つだけを恒久正解とし他を上書き、稼働案件の採用をBRAINが確定、比較軸欠落を完全な比較と表示する各入力を個別に拒否する。
- **BRAIN-004-AC-03 — 不明と戻し先**：比較に必要な要求値/重みがなければ欠落を示して選択を保留し、HARNESS-CORE/INTELLIGENCE/人間の適切な判断先へ返す。
- **BRAIN-004-AC-04 — 未見と責務境界**：未見Patternを含む比較でも候補集合と制約を保持し、比較表示を採用決定に変えない。成立判定不明の候補を成立済みと捏造しない。

旧sourceとの対応：旧Design Templateのalternatives/trade-off説明を構造的意味と結ぶ部分を再導出。旧JSON正本への投影/choice plannerは移さず、3比較例とBRAIN非選択authorityは固定L2-004から再導出。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。各完全CASE IDは対の表に固定し、監査で親句対応を再照合する。

### BRAIN-005-FR-01 — 方向と意味を伴うrelation

親：`HELIXBRAIN-L2-005`、registration `MPR-RC-HELIXBRAIN-L2-005-002`、semantic digest `sha256:120d16b39c985bd7f62efe6974a71849cad4cb0f234c395a509dc6793ddd9ff0`。PO decision main633 L52。固定L2 `brain-requirements.md:128–138`、固定L11 `brain-acceptance.md:33`と共通24–26。依存：HELIXBRAIN-L1-005 / HELIXBRAIN-L2-001/002。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

Pattern/Unit/Part間のrelationを種類、方向、意味、両端identity付きで参照できる。領域横断の関係を失わず、名前類似だけのedgeや未確認因果を確定relationとしない。7列挙例を固定enumの上限とはしない。

- **BRAIN-005-AC-01 — 正常**：Authentication→Session→Frontend State→UXとDatabase→Performance→Infrastructureの各edgeを、sourceが宣言したrelation種類/方向/意味/端点付きで辿る。7種類はそれぞれ独立fixtureで照合する。
- **BRAIN-005-AC-02 — 反例**：relation名だけ、unknown endpoint、未確認因果、名称類似だけのedgeを意味関係に確定する入力を個別に拒否する。領域横断edgeを脱落させない。
- **BRAIN-005-AC-03 — 不明と戻し先**：向きまたは意味が未定ならedgeを確定せずHELIXBRAIN-L1-005へ返す。既知の一方端点から他方を捏造しない。
- **BRAIN-005-AC-04 — 未見と責務境界**：未見だがsourceで正当に定義されたedgeも方向/意味/両端identityで照合する。requires等を一律対称関係へ変えない。

旧sourceとの対応：RDJのtyped traceとDesign Templateの関係identityを結ぶ意味を参考にするが、BRAIN7relationと端点/方向条件の直接一致はpin範囲で未確認。これらは固定L2-005/L11から再導出し、旧trace graph/registry/DB実装は移さない。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙field/relationおよびL11反例はAC-02と各個別case、不明/失敗戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。各完全CASE IDは対の表に固定し、監査で親句対応を再照合する。

### BRAIN-006-FR-01 — Visual/UXの再利用知識境界

親：`HELIXBRAIN-L2-006`、registration `MPR-RC-HELIXBRAIN-L2-006-002`、semantic digest `sha256:f031680bdd08d3b7c3286ebb1a5ecab68efb8c4bfed7b8f005a55ff9bb141900`。PO decision main633 L53。固定L2 `brain-requirements.md:139–149`、固定L11 `brain-acceptance.md:34`と共通24–26。依存：HELIXBRAIN-L1-006 / HELIXBRAIN-L2-001/002/003 / Visual Design HARNESS接続HELIXBRAIN-L2-023。依存は採択L2の意味契約を参照し、未承認L3をauthorityにしない。

製品横断のVisual/UX Pattern/Unit/Partと適用条件を15知識例へ結ぶ。Visual Designを装飾だけに縮めず、製品固有Visual Identity、screen、flow、design tokenは各製品COREへ残す。Visual Design HARNESSは画面の見た目と体験の生成/評価を担い、System Design自体を意味しない。

- **BRAIN-006-AC-01 — 正常**：15知識例の各要素を、source/適用条件とPattern/Unit/Partの意味に結んで識別する。製品固有のscreen/flow/tokenを汎用知識の値として取り込まない。
- **BRAIN-006-AC-02 — 反例**：15知識例のいずれかの欠落・識別不能・意味誤対応を個別に不成立とする。「黒背景・青accent」の製品Visual Identity、製品名、固定style、製品screen/flow/tokenを個別に汎用知識へ混入させる入力を拒否する。装飾だけとして構造や体験要素を落とす入力も不合格。
- **BRAIN-006-AC-03 — 不明と戻し先**：製品固有識別要素を切分け不能なら共有知識へ入れずVisual Design HARNESSまたは製品COREへ返す。
- **BRAIN-006-AC-04 — 未見と責務境界**：未見の正当な画面構造を汎用知識条件で照合し、製品Visual Identityや設計選択は代行しない。Visual Design HARNESSの生成/評価とSystem Designを混同しない。

旧sourceとの対応：VDH-FR-005/VDH-AC-005のPattern required/forbiddenとproduct固有値の共通pack非混入を再導出。UI profileのowner分離を参考にし、旧52entity/registry/profile schema/実測gateは置換。15知識例と製品CORE/Visual Design HARNESS境界は固定L2-006から再導出。 旧sourceのasset ID・full/raw-LF SHAは本追補の静的監査へ固定する。旧実行、旧test、旧CIは現行の合格証拠にしない。

親句→AC→L10の対応：正常入力/提供構造はAC-01とC01、列挙fieldおよびL11反例はAC-02と各個別case、製品固有要素を分離できない境界caseの戻し先はAC-03、未見適用とauthority境界はAC-04へ結ぶ。各完全CASE IDは対の表に固定し、監査で親句対応を再照合する。

## Stage 2b追補 — 採択済み009/010/011/012/029の部分草稿

**状態：候補のみ（独立review／L3承認前）。** 対象はPO採択registrationが1.0候補として固定するHELIXBRAIN-L2-009/010/011/012/029のみ。各親のPO固定revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`、採択registrationはmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0は最新main `a7ae47c0bd97cd53298594086923c73dfb2a712b`で全件Stage 2b。後続版、Web条件付き、保留・不採択を含めず、前Stage完了gateや実装・実行・release許可を作らない。現在有効なL2/L11判断を使い、新たな承認・fieldごとのPO確認を設けない。

旧L3定義`LEGACY-ASSET-F542125805B777D8A56A`（`docs/process/forward/L00-L06-design-phase.md:148-166`）と旧L3層README `LEGACY-ASSET-9A772391C7FB1298D45F`（`docs/design/harness/L3-functional/README.md:16-56`）から、FR+AC、business/NFRの区分、対の検証へtraceする形だけを再導出する。旧HELIXのBRAIN専用L3要件・対testは、archiveのdocs inventoryを`brain`で絞り、旧L3 functional FR/README/acceptance designとUI Domain Pattern Profile設計・testのPattern/failure/product/consumer関連範囲を検索した限り見つからなかった。これはその検索範囲の結果であり、旧資産全体の不存在を主張しない。旧HARNESS FR/AC、ATと旧UI profileを構造上の類例として参照し、BRAINの意味authorityにはしない。旧G3/runtime、UI固有schema/enum、旧ID、旧閾値・gate・実行結果は継承しない。各親別のsource、物理行、full/raw-LF pin、再利用・再導出・置換理由は対応する固定時点source-pins記録にある。

BRAINは知識identity/meaning/stateを保持する。LABOは評価、OSは登録・project use、HARNESS/COREは製品要求と利用設計、INTELLIGENCE等は既存の選択判断を担う。候補出力、receipt、レビューや候補の受領から採用・承認を生成しない。必要意味・適用範囲・owner・版を変更するなら親L2へ戻す。

### BRAIN-009-FR-01 — 構成Pattern候補

親`HELIXBRAIN-L2-009`（固定L2 `brain-requirements.md:172-182`、L11 `brain-acceptance.md:37`）。L1-009とL2-005/007/025を前提とする。既存PatternのUnit、source/evaluation scope、新relation案から、両端identityと構成根拠が追跡できるcandidate Patternを返す。relation meaningが明らかでない場合はcandidateとしても適用せず、L1-009へ戻す。構成candidateの生成を確立済みPatternへの昇格と同一視しない。LABO評価・OS登録・BRAIN独立検証とL2-025 promotion経路は、candidate作成を阻止する前提条件ではなく、昇格時に満たす既存条件である。

- **BRAIN-009-AC-01 — 正常**：異なるidentityとsource/versionを持つ既存Unit二つへsource-backed relation案を加え、両端identity、scope、構成根拠とcandidate状態を保つ。成立したrelationの採用・Pattern昇格は返さない。
- **BRAIN-009-AC-02 — 個別反例**：relation端点欠落、relation意味の根拠欠落、選択source/versionの欠落または不一致をそれぞれ独立に検出する。LABO評価前、OS登録前、BRAIN独立検証／L2-025経路前の昇格要求も各々独立に拒否し、他ownerの状態で代用しない。
- **BRAIN-009-AC-03 — unknownと戻し先**：relationまたは必須部品の意味・根拠が不明ならcandidateの適用可能性を作らず、未解決箇所を記録してBRAIN-L1-009へ返す。
- **BRAIN-009-AC-04 — 未見**：既知例と異なるがsourceで定義されたUnit組合せも同じidentity、端点、relation意味、scopeを照合する。fixture未定義条件はunknownとし、candidate状態を保つ。未見例をもって広範な知識網羅を保証しない。

旧source対応：旧L3のFR+AC構造とATの個別failure/consumer照合を再導出。専用BRAIN構成要件は上記探索範囲で未発見。隣接UI profileのtyped relation例は構造類例のみ。固定L2/L11のUnit・relation・昇格条件が現行の意味根拠であり、旧registry、runtime、ID、gateは置換する。

### BRAIN-010-FR-01 — 条件付き失敗知識

親`HELIXBRAIN-L2-010`（固定L2 `brain-requirements.md:183-193`、L11 `brain-acceptance.md:38`）。L1-010、L2-003/005/007に従う。Anti-Pattern、Failure Pattern、Invalid Combination、Context-dependent Failure、Regression caseのsource/evidenceを、成立条件・影響・反例・scopeと共に条件付きknowledgeとして保持し、代替候補を返す。L11の列挙はSingle Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region/Zone Failure、Deployment/Backup/Restore Failure、configuration drift等。L10では選択fixtureに合わせ、各列挙familyの正常な条件付きknowledgeを個別に照合する。名称だけから普遍禁止・普遍適用を導かない。

- **BRAIN-010-AC-01 — 正常**：sourceが定義するfailure種別の一例について、成立条件、影響、反例、source/evidenceとscopeを保持し、その条件内外を混同せず参照できる。
- **BRAIN-010-AC-02 — 個別反例**：他fieldを正常に保ち、(a)成立前提の削除、(b)条件付き禁止の常時禁止化、(c)条件付きfailureの常時適用化、(d)影響欠落、(e)反例欠落、(f)source/evidence/scopeの欠落またはstaleを別fixtureで試す。いずれもfailureの適用判定を成立扱いしない。列挙にない条件やfailure taxonomyを追加しない。
- **BRAIN-010-AC-03 — unknownと戻し先**：条件またはscopeが定められないfindingをunknown/未確定に保ち、固定L2の戻し先であるLABO評価へ返す。source不在からfailure不存在を推定しない。
- **BRAIN-010-AC-04 — 未見**：未見failure形態は、独立source/evidence、明示条件、scope、反例と判定oracleがある範囲だけ照合する。条件が不足する枝はunknownとし、普遍規則へ拡張しない。

旧source対応：旧L3 FR/ACとacceptance designのfailure条件・反例・consumer向け照合構造を再導出するが、旧failure名・runtime挙動・TDD/GHA・閾値は移さない。BRAIN固有意味は固定L2/L11から再導出する。

### BRAIN-011-FR-01 — 製品固有意味の分離

親`HELIXBRAIN-L2-011`（固定L2 `brain-requirements.md:194-204`、L11 `brain-acceptance.md:39`）。L1-011、L2-007/018/020/025に従う。製品CORE由来のsource contextから、根拠のある汎用構造候補と製品固有残余を分離し、元sourceと由来を保つ。分離不能ならBRAINへ受入せず提供元COREまたはLABOへ戻す。共有範囲について人の意味判断が必要な場合は既存の判断点を使い、ownerを推測で新設しない。

- **BRAIN-011-AC-01 — 正常**：同一source内の再利用可能構造と製品固有残余を区別でき、一般化の根拠・scopeと製品固有sourceへのtraceを保持する。製品固有部分を消去または汎用事実化しない。
- **BRAIN-011-AC-02 — 個別反例**：他要素を正常に保ち、製品名、product requirement、製品固有画面/具体API、業務規則、利用者判断の各一要素だけを汎用候補へ漏らすfixtureを独立に拒否する。元source/provenanceだけを失うfixtureも別に拒否する。
- **BRAIN-011-AC-03 — unknownと戻し先**：分離できない意味はunknownのまま受入を止め、固定親にある提供元COREまたはLABOへ戻す。未指定のownerを補わない。共有範囲の意味変更は上流へ返す。
- **BRAIN-011-AC-04 — 未見**：未見の別製品sourceにも同じ根拠付き分離を適用する。一般化を支える条件がない場合はunknownを保持し、単一製品から普遍化しない。

旧source対応：旧L3/ATとUI Domain Pattern Profileのproduct/common境界、field別failure、source-to-consumer traceを構造の類例として再導出する。UI entity・product profile・namespaceや旧ルールはBRAINのauthorityへ移さず、固定L2/L11から意味・ownerを再導出する。

### BRAIN-012-FR-01 — 候補返却と採用authorityの分離

親`HELIXBRAIN-L2-012`（固定L2 `brain-requirements.md:205-215`、L11 `brain-acceptance.md:40`）。L1-012、L2-019/021/022に従う。返却はPattern candidate、required input、relation、alternative、constraint、evidenceおよび各版に限る。採用決定はHARNESS-CORE、INTELLIGENCE、人など該当する既存ownerに残り、BRAINは製品固有選択や案件のruntime判断を返さない。

- **BRAIN-012-AC-01 — 正常**：複数候補と列挙された返却情報を版・source付きで返し、候補状態と採用未決を保つ。
- **BRAIN-012-AC-02 — 個別反例**：他条件を正常に保ち、(a)採用済みlabel、(b)製品固有選択、(c)runtime/operation decisionのいずれか一つだけをBRAINが生成する入力を別々に拒否する。required input、relation、alternative、constraint、evidence、versionの各欠落も個別変異として不成立にする。
- **BRAIN-012-AC-03 — unknownと戻し先**：要求意味または重みが不明なら選択せず、unknownと未決状態を保ち、既存の責任ある判断先へ返す。新しいownerや承認手順を作らない。
- **BRAIN-012-AC-04 — 未見**：未見または曖昧なqueryでは根拠ある候補と不足項目を返し、比較できない情報を補わず採用選択しない。

旧source対応：旧L3 FR/ACと対acceptanceのconsumerへの出力・失敗分離を再導出する。旧HARNESS business outcome、旧choice planner、採用workflowを移さず、返却範囲と判断ownerは固定L2/L11から再導出する。

### BRAIN-029-FR-01 — 製品設計に利用する構成candidate

親`HELIXBRAIN-L2-029`（固定L2 `brain-requirements.md:564-574`、L11 `brain-acceptance.md:87-95`）。親L1は003/005/009、consumer contextはHARNESS-L1-009/001。`version_target: 1.0`のcandidateである。常時必須はL2-008のidentity/version/provenance、L2-003のapplicability/required input、L2-005のrelation意味。比較時だけL2-004、構成candidate生成時だけL2-009とそのrelation条件を使う。選択した製品CORE sourceにはL2-018、選択したLABO評価済みsourceにはL2-020のsource/scope/evaluation契約を適用する。未選択sourceは未観測、参照資料は背景に限る。L2-030のconnection receipt義務を本親へ取り込まない。

Pattern/Unit/Partのidentity・source/version、一般化された課題、applicability、required input、constraint、trade-off、negative/failure、relation候補を、端点と意味を保って構成candidateにする。relationの種類は`compatible_with`、`conflicts_with`、`alternative_to`、`depends_on`、`composed_of`を各々元sourceに沿って保持する。relationの根拠・方向・端点を捏造せず、unknownを互換や不成立に丸めない。汎用permission構造は候補として扱えるが、製品固有requirement値、製品固有screen/具体API名、製品固有permission値、採用設計、工程表を返さず、一候補を絶対解にしない。製品固有要件はHARNESSへ、知識意味・条件・relation不明はBRAIN-L1-003/005/009へ戻す。

- **BRAIN-029-AC-01 — 正常**：L11の一般化課題「承認後は編集不可」に対し複数Pattern/Unit候補のproblem、applicability、required input、constraint、trade-off、negative case、汎用permission構造、source/versionを保ち、両端identity付き関係を追跡可能にする。構成はcandidateのまま。
- **BRAIN-029-AC-02 — 個別反例**：製品固有term/具体API/製品固有permission値の混入、required input欠落、選択source/version欠落、不整合な関係の互換扱い、意味または端点のないrelation確定、一回の製品適用による昇格をそれぞれ独立に拒否する。
- **BRAIN-029-AC-03 — relation例**：5種類それぞれのsource-backed edgeを独立に照合し、`compatible_with`、`conflicts_with`、`alternative_to`、`depends_on`、`composed_of`を同じ意味へ潰さない。relation type、両端identity、意味、source/versionと必要inputを保持する。
- **BRAIN-029-AC-04 — unknownと戻し先**：required inputやrelation意味が不明なら適用可否をunknownのまま保持し、知識意味はBRAIN-L1-003/005/009、製品固有要件はHARNESSへ返す。未選択CORE/LABO sourceや説明資料から欠けた値を補わない。
- **BRAIN-029-AC-05 — 未見**：L11の別Domain組合せまたはrequired input欠落例で同じsource/condition/endpoint照合を適用する。oracleまたはscope未定は未評価/unknownとし、合格や全Domain保証を作らない。

旧source対応：旧L3定義と対testの正常・失敗・未見・consumer traceを再導出する。UI profileのtyped entitiesや製品/共通境界は構造類例に限定し、画面schema・固定enum・製品採用規則・旧runtimeを移さない。新しい構成意味は固定L2/L11にのみ基づく。
