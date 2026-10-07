# HARNESS-L2-039 UX軸の適用性・証拠scope/revision補完監査

- 基準main: `9229f59edc36b8396ea99bde5f6f903b35c1ccdf`。固定親の判断帰属は`633bf12`のPO採択decision row 44。
- 対象: HELIX-HARNESS Stage 3、`HARNESS-L2-039`、`version_target: 1.0`。
- 変更対象: `functional-requirements.md`の039 AC-02、および`functional-verification.md`の039 AC-02 CASE。business/NFR、他親、他Stageは変更していない。
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:650` と `docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:631`。原文・file SHA・line SHAはJSONに記録。

## 固定要求との照合

PO decision row 44は`MPR-RC-HARNESS-L2-039-003`と固定L2/L11のsemantic digestを採択している。判断の対象revisionは`633bf12`のL2:891–930/L11:670–676で、現行本文内の当時の候補metadataは採択帰属を上書きしない。固定L2:897はUI契約適用性unknownをN/Aへ変えず、:929は七軸の適用性unknownで`ux_verified`を拒否し、同じ対象scope/revisionの全軸current evidenceを要求する。対L11:674–676も同じ境界を述べる。固定本文の全file/span digestはJSONへ保存した。

旧v1.3:650とbaseline:631から、`implemented`/`ux_verified`を分け、current evidenceがなければUX完成を拒否する意味を保持した。適用性unknownと対象scope/revisionのbindingはfixed L2/L11から再導出しており、旧sourceにない閾値・owner・gateは追加していない。旧layer/workflow/schema/runtimeは移植しない。

## 補完内容

L3 AC-02で、七軸それぞれの適用性状態とevidenceを独立照合し、証拠を主張対象と同一scope/revisionへ束縛する条件を明記した。これは固定親の明示条件をACに反映したもの。親の意味、owner、version target、 authorityは変えていない。NFR文書は独立NFR CASEなし・機能AC-02へ委譲と明記しており、追加変更不要と判断した。

L10の正常baseline `CASE-HARNESS-L10-039-05` を用い、各軸を一要素だけ変える21件を追加した。各CASEは`ux_verified`だけを拒否し、`implemented/current`、候補形成、設計開始を維持する。

- `real-data`: `CASE-HARNESS-L10-039-r19-applicability-unknown-real-data` / `CASE-HARNESS-L10-039-r19-evidence-scope-mismatch-real-data` / `CASE-HARNESS-L10-039-r19-evidence-revision-mismatch-real-data`
- `responsive`: `CASE-HARNESS-L10-039-r19-applicability-unknown-responsive` / `CASE-HARNESS-L10-039-r19-evidence-scope-mismatch-responsive` / `CASE-HARNESS-L10-039-r19-evidence-revision-mismatch-responsive`
- `motion`: `CASE-HARNESS-L10-039-r19-applicability-unknown-motion` / `CASE-HARNESS-L10-039-r19-evidence-scope-mismatch-motion` / `CASE-HARNESS-L10-039-r19-evidence-revision-mismatch-motion`
- `accessibility`: `CASE-HARNESS-L10-039-r19-applicability-unknown-accessibility` / `CASE-HARNESS-L10-039-r19-evidence-scope-mismatch-accessibility` / `CASE-HARNESS-L10-039-r19-evidence-revision-mismatch-accessibility`
- `performance`: `CASE-HARNESS-L10-039-r19-applicability-unknown-performance` / `CASE-HARNESS-L10-039-r19-evidence-scope-mismatch-performance` / `CASE-HARNESS-L10-039-r19-evidence-revision-mismatch-performance`
- `continuity`: `CASE-HARNESS-L10-039-r19-applicability-unknown-continuity` / `CASE-HARNESS-L10-039-r19-evidence-scope-mismatch-continuity` / `CASE-HARNESS-L10-039-r19-evidence-revision-mismatch-continuity`
- `human-evaluation`: `CASE-HARNESS-L10-039-r19-applicability-unknown-human-evaluation` / `CASE-HARNESS-L10-039-r19-evidence-scope-mismatch-human-evaluation` / `CASE-HARNESS-L10-039-r19-evidence-revision-mismatch-human-evaluation`

既存CASE-039-05 indexの「残余」表記は、新しい各単独CASEが条件ごとに区別する記述へ同期した。旧134 definition ID保持の歴史注記は変更していない。

## 検証と限界

JSONにはL3/L10/business/NFRの6本文全SHA、固定633親およびPO rowのfull/span SHA、legacy source原文のfile/span SHA、変更span SHA、全追加IDを保存した。静的確認は、ID一意性、7軸×3変異の集合、全行のFR/AC/baseline binding、state preservation、差分範囲、`git diff --check`を行う。旧runtime・test・CI・CLI・hook、L10実行、Opus/Fable独立review、PO事後確認は行っていない。authority effectはnone。

JSON: `docs/governance/audits/requirements-stage/harness-stage3-parent039-ux-axis-binding-repair-2026-10-08.json`
