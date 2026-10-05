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


## Stage 2b — HELIX-BRAIN Infrastructure L3/AC候補（001–017）
**状態：部分草稿・未承認。** 対象はPO採択された固定L2のINFRA-001〜017、各`version_target: 1.0`、G0上のStage 2bだけである。17親の起草を全28親完了条件へ広げない。これは通常のL3承認対象であり、実装・運用・release許可ではない。

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
- **BRAIN-INFRA-008-AC-02（負例）**：候補/field欠落、workload既知/unknown各fixtureで自動scalingの実行・操作能力を要件または出力へ含める、unknown workloadを適用許可へ変換、閾値創作を個別に試す。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（workload値・規模・SLOは製品要求、構造評価はLABO）を返し、適用・成功・完了へ丸めない。
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
- **BRAIN-INFRA-010-AC-02（負例）**：backupのみ、restore verificationありだがrequired recovery conditions欠落、recovery conditionsのみでrestore verification欠落、各状態の独立欠落、製品RTO/RPO創作を個別に試し、3条件が揃わなければCandidateにしない。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（実backup/restore実行と値は製品/Runtime、知識構造はHELIXBRAIN-L1-003/010）を返し、適用・成功・完了へ丸めない。
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
- **BRAIN-INFRA-012-AC-01（正常）**：Object Storage等の抽象PatternとS3/GCS/Azure Blob/MinIO等の実装identityを別に保ち、provider固有factごとに根拠と版を結び、implements/compatible_with/constraint_of関係を同じ親対象identityへ結び、固定L2/L11の必須意味を全て識別できる。明記のない製品値・実行結果はunknownとして残す。
- **BRAIN-INFRA-012-AC-02（負例）**：identity統合、provider固定、provider固有factの根拠欠落と版欠落を個別に試す。根拠のないcompatibilityおよび各relation欠落も独立fixtureとする。どの必須field/relationが欠けるか、unknown/stale/conflict状態、固定L2の戻し先（互換条件のownerまたは該当Pattern owner）を返し、適用・成功・完了へ丸めない。
- **旧source対応**：INFRA-001–017の原案sourceは`docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md:385–417`（1880c422311a7f8321dbb0e2b98fa12c69449201）であり、fixed L2採択意味の歴史的起点で独立authorityではない。NIO L3類例 `NIO-L3-01, NIO-L3-02`、NIO L10類例 `NIO-L10-03`。旧候補との比較：環境固有evidenceはprovider実装事実のscope類例に限る。NIO-L10-01/02はprovider compatibilityを定義しない。provider/source acceptanceを作らず根拠がなければcompatibilityはunknown。
- **L2/L11→L3→L10 trace**：固定L2 lines 332–341の受取・提供・保証・依存/版・戻し先と、固定L11 line 52の正常/不合格条件を`BRAIN-INFRA-012-FR-01 / AC-01, AC-02`へ対応付ける。`AC-01 → L10-BRAIN-INFRA-012-C01,C05`、`AC-02 → C02,C03,C04`。未見正常C05も通常条件と同じAC-01を用いる。

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
- **機能要件候補**：11例: SPOF, Shared Mutable Production State, Unbounded Retry/Queue/Resource Growth, Missing Timeout, Backup Without Restore Test, Monitoring Without Action, Manual-only Recovery, Hidden Dependency, Undocumented Egress。条件/兆候/safer alternative保持し、条件を外して全域禁止にしない。 BRAINは知識候補と根拠relationを扱い、実resource/actionまたは他ownerの決定を代行しない。
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
