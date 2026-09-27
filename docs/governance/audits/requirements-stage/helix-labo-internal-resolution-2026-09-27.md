# HELIX-LABO 機構内監査の消化（2026-09-27）

[機構内監査](helix-labo-internal-audit-2026-09-27.md)の055/056受入補強をL11へ追補した。L2本文・意味digest・既存受入条件・版を保持する。



対象は監査snapshot `e3b062ee7cdfa66848da8980158141795d456213`のL11受入補強候補2点。L2/L11は未採択候補であり、この文案は採択、実装、評価実施、合格を生成しない。L2-060とG20のcohort意味は変更しない。

| 根拠 | 内容・保持理由 |
|---|---|
| `docs/helix-labo/L1-planning/labo-intent.md:56,62`、SHA-256 `78b686adcefe6a6867134a17238b59acef19e6c52dc735989f47aa637ed309cc` | L1-005は、品質・success/failure・FP/FN・再作業・速度・費用・人介入・運用負荷等の条件付き比較を求める。L1-011は作業種類別のmodel class水準、未評価の明示、水準を配置材料に限定し、配置案はINTELLIGENCE、指定/割当はOSへ置く。 |
| `docs/helix-labo/L2-requirements/labo-requirements.md:150-154`、SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L2-055は許可済み履歴、task/model class別水準、評価範囲/source revisionを入力とし、不足/不整合なら水準を確定しない。未評価を評価済みへ変えず、割当/権限を変えない。 |
| 同 `:379-389` | L2-056は初回結果の観測取込と評価を分離する。評価済みには対象task/model class/scopeへの適用oracle revision、判定根拠、比較条件、結果/反例/unknownを要求し、oracle/scope/根拠不足は未評価維持。 |
| `docs/helix-labo/L11-acceptance/labo-acceptance.md:19-21,56,138-146`、SHA-256 `9f37f8c3ef0882724825433c6484d7ae4f73d24750962ebebe535c63e54e1060` | L11既存共通条件はunknownをpassにせず、未根拠の定量閾値を作らない。L2-055表行は「根拠・評価範囲・未評価」まで、056受入は初回結果・oracle条件を既に含むため、以下は分母/欠測/採点根拠と不一致negativeの例示に限定する。 |
| `docs/helix-os/sources/body-reinforcement-po-original-2026-09-27.md:11-17`、SHA-256 `cf45adb7212a35c496e420973be0933ec38d4c00175051811f6a9c0b2c06ac78` | PO第1点は、性能未評価と実行許可を分け、限定条件下の初回結果をBenchへ渡すことを求める。RLO-FR-040だけでは初回割当/実行条件が閉じないと明言。055/056は「評価可能な証拠」と「未評価」を扱い、OS割当・実行許可を所有しない。 |
| 旧HELIX `LEGACY-ASSET-28FB139B26CD61CC51EE` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:74,119-147`、SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | 旧R-02 failure/stale evidenceを分母・failure reasonへ残す。R-04 task snapshot、R-05 protocol比較可能条件、R-06 metricごとのnumerator/denominator/missing disposition/scoring provenance、R-08 scorer/task/oracle/protocol identityを保持する。現行055は作業種別/model class単位の水準生成であり、旧system/team benchmark全体をそのまま要求しない。 |
| 旧HELIX `LEGACY-ASSET-A952A3A175EB82A4781B` — `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:35-41`、SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | AC-008..014は再計算可能な根拠、重大failureの平均相殺拒否、accepted change基準の費用、費用欠測、scorer/oracle版とblind judge、historical resultの版scope、worker admissionとの責務分離を示す。現行受入では適用するscore/evidence範囲だけへ再導出し、固定rate/sample数・旧protocol repeat countを復活させない。 |
| 旧HELIX `LEGACY-ASSET-50CA1C554747F12266D3` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663-666`、SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`。対の `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` — `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:43`、SHA-256 `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | RLO-FR-040/AC-030の`provider_default_unbenchmarked`とscore単独でauthorityを導かない意味を保持する。POが指摘したように、これは初回assignment/execution契約の代替ではない。 |


## 消化した条件

- 055：metricとscopeごとの分母、算入/除外、欠測・失敗・unknown、採点版と再構成可能な根拠。
- 056：source/oracle/model/scopeの不一致を観測とともに保持し、該当範囲を未評価のまま扱う。
- 正常・誤り・未見の例を各IDへ対応させ、固定標本数・閾値・一律期限を追加しない。

## L2-060とG20の扱い

**060はNOCHANGE**。L2-060 `labo-requirements.md:441-455`は同一task/oracle、同一元Worker/model/provider/version/effortで支援有無だけを比較し、両receipt、独立review、支援/救援/人の時間と費用を含む。L11 `labo-acceptance.md:178-185`は正常・誤り・未見の比較oracleと費用範囲、両runが揃わない場合の未評価を既に定義する。G20の目的別cohort選択を060へ課したり、全cohortを一律必須としたり、重複文を足したりしない。

## 範囲と変更理由

旧Benchの分母、欠測/失敗の可視化、採点根拠・再計算可能性を保持し、現行055の対象である作業種別/model class/scopeの水準へ絞って受入可能な形にする。旧system/team evaluationの固定protocol一式を移植せず、現行L1/L2が定めない標本数、期限、数値閾値も追加しない。056は既存入力とoracle条件を繰り返すのではなく、source/oracle/model/scopeが不一致なら「観測は保持、評価は未評価」を具体例化する。元の共通L11条件、055/056の配置非決定・authority非変更、060の同一Worker比較条件は差し替えず保持する。

GPT6 Luna highの案をCodex executionが検収・統合した。旧sourceは静的参照のみで実行しない。独立reviewはClaude。
