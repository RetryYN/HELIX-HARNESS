# confirmed175 未照合2件の現行条件再照合（2026-10-02）

- 作成時base: `97826109918f1f9c7b24a3b91a6bb12aaba7b77d`。local candidate base commit: `0aacb3fddd239cabd785286242297b26614cfec5`。authority effect: `none`。静的文書・digest照合のみ。
- 最新main read-after: `d31a4c8500d131001dc349bfbdfde82fb0b46839`。HDEC-HELIXOS-REQUIREMENTS-PO-2026-09-28 line31 at d31a4c8 records the L1 SHA `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e` fixed by PO on f6dad2a (an ancestor of d31a4c8) and adopts that revision; `draft_candidate` frontmatter does not override that decision.これは作成時baseとは別のsnapshotである。以下の5対象ファイルは作成時と同じfull-file SHAで、L1/L2/L11/decision/registerの対象内容は変わっていない。local commit `0aac…` はこのHEADの祖先ではない。
- 最新main上ではPO採択済みpairはHELIXOS-L2/L11-111、decision row64、register line636 `MPR-RC-HELIXOS-L2-111-001` (LF-excluded line SHA `8fd6f2757862c5307faa28933eebab735697a1609af81c3791f4f8a322ace39a`)。HELIXOS-L2/L11-113と`MPR-RC-HELIXOS-L2-113-001`は最新mainに無く、このworktreeのdraft candidateである。
- latest-main file SHA: L1 `docs/helix-os/L1-planning/system-intent.md` `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`; L2 `docs/helix-os/L2-requirements/governance-requirements.md` `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`; L11 `docs/helix-os/L11-acceptance/governance-acceptance.md` `cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112`; decision `docs/governance/decisions/po-decision-2026-09-30-live26.md` `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`; register `docs/governance/management-provisional-requirement-register.jsonl` `ada29e38e99bef16d1c68324129be1519723090cbcc910b50f4c5d47387c626a`.
- 最新mainのL2/L11 section digestは111 pair `265d5e7d…` / `8efe5d58…`。row64はこのpairを抽象ANDの範囲に限定して採択。各latest-main file/section/row SHAはJSONの`/latest_main_read_after`に記録。
- 対象atom: `CONFIRMED-DAC-FR-009` と `CONFIRMED-3L-BR-007`。F6のno-exact-pair結果は歴史的比較として保持し、現行main authorityを決める根拠にしない。
- 詳細なsource/current file SHA、条件表、JSON pointer相当のfield、register行は同名JSONに記録。

## DAC-FR-009

旧line 56の三receipt分離、三つ全て明示passのAND、#206を第四receiptにしない境界、既存receipt internals/ownerを再定義しない境界を、現行`HELIXOS-L2-111`と`HELIXOS-L11-111`の各条件・oracleで照合した。PO decision `po-decision-2026-09-30-live26.md` row 64は両sectionのexact digestを指定し、抽象AND意味だけを採択している。receipt ID、issuer/owner、revision/scope mapping、operational usability、actual issuance/greenは未決であり、この要求段階の不足ではない。

旧MPR `MPR-RC-HELIXOS-L2-111-001`はdecision前の登録記録なので上書きせず、row 64を結ぶ`-002`訂正recordとauthority-aware crosswalk receiptをappendした。management stateは`registered_proposal`、authority effectは`none`。source holdingはliveのまま、formal successor、owner移管、source closureは主張しない。

## 3L-BR-007

旧source line 65が要求する三条件を別々に作成時mainおよび最新main d31a4c8へ照合した。既存のINTELLIGENCE-L2-073、INTELLIGENCE-L2-072、LABO-L2-071、OS-L2-018、HARNESS-L2-022は隣接scopeであり、三条件を満たす完全な採択済み後継ではない。旧L3 `3L-R-15/16/17`と旧acceptance `3L-AC-016/017/018`は細部とoracleの由来として記録し、旧経路は実行していない。

不足するL2保証（Node gateの決定性、評価済みmodelへのsemantic finding限定委譲、第四provider lane/別Control Planeの不生成）と静的L11 oracleを、提案target HELIX-OSの未採択`HELIXOS-L2-113`/`HELIXOS-L11-113`として起草し、作成時base上の仮登録案をlocal branchへ追記した。最新mainにはこのpair/register rowはまだ存在しない。L11の正常例はNode gate `deny`の保持に加え、`pass`だけを根拠に許可される処理要求をgateが拒否するoracleまで照合する。findingを記録するだけでは強制拒否の証拠にならない。これは現ownerの指定、採択、実行、L3承認、source closureを生成しない。

## PO判断材料：3L-BR-007のtargetとsource owner

旧3L-BR-007は「GitHub監査をHELIX capabilityとして所有する」と記すが、confirmed carry-forwardではcurrent target/ownerもsuccessorも未割当である。選択肢はJSONの`/po_decision_material/options`に対象revisionと影響要求を含めて記録した。

- **推奨A — HELIX-OSをintegration requirement targetにする**：OS L1-001は対象別requirement/adoption/source、L1-008はauthority/design/verification/runtime projection整合を扱う。OS L1の行21-26はproject-group governance、Worker割当、CI/test運転も記す。HARNESS-L1-004行34はverification obligation/oracleを定義し、HARNESS L1行59はproject-group governanceとCI運転をOS責務に置く。OS L1ファイルの`authority_status: draft_candidate`はhistorical metadataだが、HDEC-HELIXOS-REQUIREMENTS-PO-2026-09-28が固定SHA `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`のL1 bytesを確定・採択し、L2-001〜029に合意している。decision recordを正本とし、metadataから親採択を降格しない。HARNESS L1-004は選択肢Bのverification-contract根拠であり、現ownerとは断定しない。OS-L2/L11-113だけに三条件のintegration contractを置き、既存Node gateとmodel qualificationの実ownerは移さない。L2-015 (authority/source record)、L2-018 (assignment/execution)、L2-020 (verification/CI operation)、HARNESS-L1-004/L2-022のverification contract、INTELLIGENCE-L2-072/073、LABO-L2-071は各自の境界を維持する。
- **選択肢B — HARNESSをverification contract targetにする**：HARNESS-L1-004は対象revision/riskに応じた検証義務・反例・証拠・差戻し条件を定義する。選ぶ場合はHARNESS-L1-004からHARNESS L2/L11へ再導出し、OS-L2-018/020のassignment/execution境界と切り分ける。BR-007全体には監査capabilityの統合もあるため、検証契約だけに限定するscopeをPOが明示する必要がある。
- **選択肢C — 責務ごとに分割する**：OSの監査統合、HARNESSのverification oracle、INTELLIGENCE/LABOの評価資格を別candidateへ配置する。現在の単一atom receiptをそのまま分割証拠に転用できず、PO承認済みpartitionとcandidate間relationが先に必要。
- **選択肢D — 未割当のまま保留する**：confirmed source holdingと113 draftを維持する。BR-007のtarget/adoptionだけが未解決となり、無関係な要求整理や既採択pairの進行は続けられる。

推奨はAである。これは提案targetの選択であり、OSを現行runtime ownerにしたり、gate規則・model評価authority・source ownershipを移したりしない。POが選ぶのはsource atomのtargetと一件接続のまま保持するか分割するかであり、L2/L11-113採択、実行許可、formal successor、source closureは別判断として残る。

### line hashの定義

`d14d8aaa…`は旧2026-10-01監査で示されたline 65の物理行を末尾LF込みでhashした値で、実bytesと一致する。LFを除いた同じ行のdigestは`ec3533b3…`。従って旧pinに誤りはなく、receiptは両方式を明記する。identity line hashはLF除外方式で別に照合した。

## 次の扱い

- POへ上記選択肢A〜Dと推奨A、対象revision・影響要求を提示する。POがAを選んだ場合はcandidate 113のexact revisionを別途判断し、A以外ならcandidate parent/atom partitionを再導出する。
- DAC-FR-009の実receipt ID/issuer/scope対応は、権限ある既存sourceが明示したときだけ別途扱う。
- 両source holdingを、別の有効なdispositionができるまでliveに保持する。BR-007が未決でも、無関係なrequirements-stageの作業は続ける。
