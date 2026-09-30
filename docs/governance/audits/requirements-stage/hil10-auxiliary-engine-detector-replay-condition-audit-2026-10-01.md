# HIL-10旧補助contractのengine/detector再現条件監査

## 対象と基準

対象は旧補助system contract `HR-FR-HIL-10`、対応する`HAC-HIL-10a/b/c`、`HAT-HIL-10`、および当該HATが参照する`HST-HIL-008/009`に限る。旧要求atomは`HIL-FR-25`、`HIL-FR-26`、`HIL-NFR-13`の3件である。24親contract全体、全旧source census、requirements stageの閉包は判定しない。

現行参照はorigin/main `d1dc6136f06c2fd89d6ba3d57fdd8d9156e2b44a`（2026-10-01）。HELIX-OS L2/L11-033のauthority状態は、2026-09-29の[57候補PO判断](../../decisions/po-decision-2026-09-29-57candidates.md)のline 56から読む。同記録は`MPR-RC-HELIXOS-L2-033-001`に対応するL2/L11-033の対を採択し、canonicalized section SHA-256をそれぞれ`580778c8ef3c0e4c4676d13de203c821f990893e9aa078d8d1d2f0b8901d2dbc`、`1d30394888b3bded49f8e517d7e0888a25130e123df945adf69c7db5588571b1`に固定した。L2/L11本文の現在のcandidate表記とMPRの`registered_proposal`は仮登録時のmetadataであり、このexact pairの採択を打ち消さない。旧HAT-HIL-10のstatusは引き続き`designed_not_implemented`で、採択は実装・実行・acceptance passを意味しない。

採択されたL2-033のMPR atom setは7件で、そのsource範囲は旧HIL-FR-25/26の2行と補助HR/AC/HAT-HIL-10の5行。旧HIL-NFR-13は同atom setに含まれない。また、legacy carry-forwardは旧FR-25/26、HR/AC/HATを`successor_requirement_ids: []`・未解決のまま保持する。このPO採択からHIL-10各source identityとのformal successor bindingやsource holding解除を推定しない。

既存の[旧補助contract再照合](legacy-auxiliary-contract-refinement-recheck-2026-09-28.md)はHIL-10とL2-033候補の関係を一覧上で指摘している。本記録では3つの旧atomからAC/HAT、supporting test、POが採択したL2/L11-033対へ結ぶ。本文のcandidate metadataに優先してdecision recordのexact revisionを採択状態の根拠とする。文書に記されたfixtureは受入設計であり、実行結果ではない。

## 旧sourceとidentity

| 役割 | identity・source pointer | SHA-256 / 状態 |
|---|---|---|
| 旧system contract | `HR-FR-HIL-10` rev 1、`archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-10` | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; `specified` |
| 旧acceptance | `HAC-HIL-10a/b/c` rev 1、同archive `requirements-ir/acceptance_cases.json#/HAC-HIL-10a`, `#HAC-HIL-10b`, `#HAC-HIL-10c` | `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`; positive / negative / boundary |
| 旧system test | `HAT-HIL-10` rev 1、同archive `requirements-ir/system_tests.json#/HAT-HIL-10` | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`; `designed_not_implemented` |
| 要求IR | `requirements-ir/requirements.json#/HIL-FR-25`, `#/HIL-FR-26`, `#/HIL-NFR-13` | `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` |
| 移行L1 source | `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:115-116,193` | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` |
| 旧L5 design | `docs/design/helix/L5-detail/engine-detector-execution.md`（`HDS-HIL-10`） | `72624b0d343dd9a107e5984666f018ccca348ae6bd868a714ece63d908f1c9a6` |
| 旧HAT consumer map | `docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:42` | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` |
| 旧integration consumer | `docs/test-design/helix/L5-engine-detector-execution-integration-test-design.md`（`IT-EDX-001..014`） | `0c9be638f310ba1f747bfdd63a1342906e82419aed30ed23d7ef5f32474849eb` |
| 旧unit consumer | `docs/test-design/helix/L6-engine-detector-execution-unit-test-design.md`（`U-EDX-001..020`） | `6f7c36d93a458c34655b6e108d77f9ee4301b2f281fe6072f2ec01a7f9cc65ed` |
| 旧system consumer | `docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md`（HST-008/009 entries） | `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` |

`HAT-HIL-10`は3つのHACすべてと`HST-HIL-008/009`を列挙する。scenarioはengine/detectorの同一snapshot再実行、必要証拠はversion/config/input/output、artifact/finding、rerun digest、negative boundaryはunknown・混同・nondeterminism・partialである。system test recordと旧test designは期待oracleを示すだけであり、実行receiptは含まない。

## 旧atomと受入oracle

| atom / direct source | 旧条件 | 対応するHAC/HATとconsumer |
|---|---|---|
| `HIL-FR-25`、L1 `:115`、IR `requirements.json#/HIL-FR-25` | build、agent metadata、assignment、schedule、trace、impact等のengine capabilityをversionedに分離登録し、入力snapshotごとのrun/artifact/digest/exit statusを記録する。 | `HAC-HIL-10a`は全engine/detectorの再現、`10b`はunknown・証拠欠落・partial拒否、`10c`はrerun差異のquarantineを扱い、すべて`HAT-HIL-10`へ接続。`HST-HIL-008`はZIP固定fixtureのbuild/trace/impact/assignment/scheduleをcapability別runとして扱い、決定的digestとsource provenanceを求める。 |
| `HIL-FR-26`、L1 `:116`、IR `requirements.json#/HIL-FR-26` | spec、schema、trace、consistency、file、metadata detectorをengineから独立させ、finding code/severity/location/subject/evidence/version、dedupe key、provenanceを永続化する。 | 同じ3 HAC/HAT。`HST-HIL-009`はschema/spec/trace/consistency detectorを同一snapshotで再実行し、dedupe key、version、期限切れsuppressionの扱いを確認する。 |
| `HIL-NFR-13`、L1 `:193`、IR `requirements.json#/HIL-NFR-13` | 同一source snapshot、engine/detector version、config digestのartifact/findingは決定的で、差異をnondeterminism findingにする。 | `HAC-HIL-10a/c`と`HAT-HIL-10`。`HST-HIL-008/009`のrerun digestとfinding fingerprintが決定性のconsumer evidence。 |

L5 design `HDS-HIL-10`は、engineがartifact、detectorがfindingを作り別authorityにすること、固定snapshotとversion/configで実行すること、workerをproposal producerに限ることを設計している。L5 integrationは`IT-EDX-001..014`でexact version解決、unknown version拒否、各engineの独立artifact、findingのdedupe、path/evidence拒否、partial commit 0、同一入力rerun差異のquarantine、projection境界を分ける。L6 unitは`U-EDX-001..020`でregistry descriptor、identity、artifact/finding validation、fingerprint、transaction、authority resolver/reconcileを対応づける。これらは旧設計に定義されたconsumerであり、実装・実行済みを意味しない。

## 現行L2/L11との照合

HELIX-OS L2/L11本文の最新main bytesはそれぞれSHA-256 `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`、`cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112`。2026-09-29 PO判断が採択したL2/L11-033 sectionのcanonicalized SHA-256は`580778c8ef3c0e4c4676d13de203c821f990893e9aa078d8d1d2f0b8901d2dbc`、`1d30394888b3bded49f8e517d7e0888a25130e123df945adf69c7db5588571b1`である。根拠となるdecision record `docs/governance/decisions/po-decision-2026-09-29-57candidates.md`のSHA-256は`c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。MPR register（SHA-256 `ada29e38e99bef16d1c68324129be1519723090cbcc910b50f4c5d47387c626a`）の`MPR-RC-HELIXOS-L2-033-001`はcandidate digestを同じL2 section hashに束縛し、source atom count 7を示す。Coverage receipt `os-quarantine-replay-coverage-receipt-2026-09-28.json`はSHA-256 `7cea1ab1c53275c5e87f4532f8b1837e86cc1e09aed9664de55360234e2cb1e5`、そのsource-lines ledgerは`5ce792baa327f7144974a333adbb4a5ed28021ddaf19527ed3d150d75c85b36d`。2026-09-28 OS decisionは当時のL2-001〜029一式を固定する別の記録であり、後発033の状態には2026-09-29 decisionを適用する。

| 現行箇所 | HIL-10との意味上の関係 | authority / 限界 |
|---|---|---|
| HELIX-OS L2-033、`governance-requirements.md:929-943` | engine/detectorの個別identity・owner・version/config、選択scope、source/input snapshot、OS-L2-020実行receipt、artifactとfindingの別receipt、全選択集合での同一version/config/input rerun、unknown・partial・provenance不足・差異の未完/拒否を具体化する。旧機能範囲と結果fieldを明示している。 | 57候補PO判断line 56で`MPR-RC-HELIXOS-L2-033-001`として採択。canonicalized section SHA `580778c8ef3c0e4c4676d13de203c821f990893e9aa078d8d1d2f0b8901d2dbc`。L2本文のcandidate metadataはdecision authorityを上書きしない。 |
| HELIX-OS L11-033、`governance-acceptance.md:524-537` | 正常・negative・unseen例と、全選択capabilityを比較する受入判定を記す。032/033、OS-020、HARNESS-L2-005の役割境界も記載する。 | 同じPO判断でL2と対になる受入本文を採択。canonicalized section SHA `1d30394888b3bded49f8e517d7e0888a25130e123df945adf69c7db5588571b1`。採択は実行receiptやacceptance passではない。 |
| 採択済みOS-L2-020とOS-L2-007（PO固定f6のL2-014〜029に含まれる） | L2-020は実行・隔離・run状態とreceipt回収、L2-007はprovenance保持という共通基盤へ意味を分担する。これはregistryのcapability別identity/owner/版、engine artifactとdetector findingの区別、選択scope全体のdeterministic replay要件を単独で同定するものではない。 | 既採択の実行/provenance契約を再利用する。L2-033の範囲をOS-020の受入から推定しない。HARNESS-L2-005が検証義務/oracleを持つというL11-033の境界を維持する。 |

### 差分の結論

- **意味保持／再導出**：engineとdetectorの能力分離、版・owner・入力snapshotをrunへ束縛すること、artifactとfindingの区別、provenance付き結果、同じ入力条件での再実行比較はL2/L11-033候補に具体化され、旧HIL-10の中心条件と整合する。OSをengine機能ownerまたはfinding意味判定者にせず、実行・証拠の管理に留める境界も保持している。
- **実装方式の変更**：旧sourceのZIP/Python実装と旧registry/runner形は現行の必須方式へ移していない。これは機能の意味を削った根拠ではなく、候補もruntime/language/CI製品名を実装依存にせずに旧capability範囲を扱う。
- **採択とrehomeの区別**：L2/L11-033 exact pairは2026-09-29 PO判断で採択されている。MPR `MPR-RC-HELIXOS-L2-033-001`の7 source atomsはHIL-FR-25/26およびHR-FR-HIL-10、HAC-HIL-10a/b/c、HAT-HIL-10の各補助source recordを含むが、HIL-NFR-13は含まない。HIL-FR-25/26のcarry-forwardも依然`successor_requirement_ids: []`であり、HIL-NFR-13は同じくpendingである。HR/AC/HATのsupplementary carry-forwardも`relation_status: unmapped`かつsuccessorなし。したがって033採択は重要な現行contract decisionだが、この個別監査対象の旧parent/atomすべてについてformal successor relationやholding解除が記録されたことを意味しない。
- **未実証**：旧HATは`designed_not_implemented`、旧L5/L6 testsもdraft/unimplemented。current CIも未構築であり、本監査にrun receiptやartifactはない。test design上の期待状態から合否を推定しない。

## 未解決条件と限定処置

1. **formal successor / source coverage residual**：2026-09-29 PO判断はL2/L11-033対を採択している。MPR `MPR-RC-HELIXOS-L2-033-001`（register row 500、register SHA-256 `ada29e38e99bef16d1c68324129be1519723090cbcc910b50f4c5d47387c626a`）のsource atom setは7件で、HIL-FR-25/26と補助HR/AC/HAT-HIL-10を含む。MPRはL2/L11採択の根拠だが、legacy carry-forwardへの正式successor ID書込みとは別である。`legacy-requirement-carry-forward.jsonl`（HIL-FR-25 row 58、HIL-FR-26 row 59）では両者が`successor_requirement_ids: []`のまま。supplementary manifest `docs/governance/legacy-migration/requirement/legacy-requirement-supplementary-source-carry-forward.jsonl`（SHA-256 `1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`）のREQSRC-SUP-00549/00550/00551/00617/00641も`preserved_pending_rehome`・`relation_status: unmapped`・`successor_requirement_ids: []`。加えて`HIL-NFR-13`は033の7-atom source setに含まれず、legacy requirement carry-forward row 115でpending/no successorのまま。従ってL2/L11-033は採択済みだが、本記録で扱う全旧atom・補助sourceへのformal successor binding、特にNFR-13の対応、またはsource holding解除は未記録。
2. **scope-complete replay evidence**：採択L11-033の受入契約は全選択engineとdetectorを同じsnapshot/version/configで比較する。現在その契約に対する実行receipt、artifact/finding pair、rerun digest/fingerprint、partial/unknown/difference拒否の結果は確認できない。代表capabilityだけ、test designだけ、OS-L2-020の一般receiptで代替しない。
3. **authority/provenance分離**：採択L2/L11-033はengine artifactとdetector findingの別receipt、owner/version/config/input provenanceを求める。このshapeで保存・比較した実記録は未提示。worker/executorによる直接current化や、OSがfinding意味を決めることを本条件から導かない。
4. **未見版・source/schema変更**：採択L11-033は明示compatibilityのない追加version/source/schemaを既存scopeへ併合せず未評価に保つ。未見fixtureの実行証拠はない。unknownを一般run全体への停止規則へ拡張せず、該当capabilityのstatusに限定して受入範囲を保留する。
5. **旧test未実装**：`HAT-HIL-10`の旧statusおよびconsumer設計はfailure/acceptance条件を示すだけで、旧test、runtime、CLI、hook、CIを起動していない。本記録もそれらを実行しない。

**限定処置**：2026-09-29 PO判断によるL2/L11-033の採択を認め、L2/L11本文のcandidate metadataよりdecision recordとcanonicalized section hashesをauthority根拠とする。一方、HIL-FR-25/26、HIL-NFR-13、HR-FR-HIL-10、HAC/HATのcarry-forwardに残るsuccessor未割当・unmapped状態は維持する。HIL-NFR-13は033の7-atom MPR source set外として明示的にpendingへ残す。この監査では旧sourceのformal successor binding、source holding解除、実装/実行/acceptance completionを割り当てない。これは要求の削減やOSへengine/detector機能所有を移す判断ではない。

## 静的検証範囲

確認対象は旧JSON pointerとID間参照、3 atomのL1/IR対応、HATからHAC/HSTへの参照、L5/L6 consumer ID、archive source SHA-256、現行L2/L11のrevision SHA-256、PO採択集合とsupplementary carry-forward行である。旧runtime、旧test、旧CLI、旧hook、旧CIは実行していない。設計・候補・source holdingの存在は実装、採択、実行、受入合格、親contract closureを示さない。
