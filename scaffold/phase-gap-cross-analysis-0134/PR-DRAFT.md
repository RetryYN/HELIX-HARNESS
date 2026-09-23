# held30 phase gap cross-analysis を research-only Scaffold として固定

## 目的

旧IR 218 unitから `phase-status-taxonomy-0105` が unresolved とした30 unitを、固定BASEのIR原文・Wave 1–50・RDP holding・PHCAP-20・四製品L1 decisionから独立再導出する。#2082/#2084の成果物はoracleにせず、正式phase/product/implementation authorityを変更しない。

## 結果

- 対象: 30 unit（HELIX-OS 24、HELIX-HARNESS 6）
- taxonomy status: `CROSS_CUTTING_PHASE_REVIEW_PENDING` 20、`UNRESOLVED_SOURCE_OR_HUMAN_REVIEW` 10
- Wave: 50 files / 598 rowsから66 semantic edges、38 unique old assets
- direct phase evidence: 0、formal phase candidate: 0、phase非適用立証: 0、excluded: 0
- PHCAP-01..20 pending: 30（全unitで全20 phaseを保留）
- 不足類型: source authority/custody 2、PHCAP boundary 8、cross phase competition 10、cross phase unresolved 10

各unitは原文anchor、原文statement digest、taxonomy status/rule、Wave edge、old asset、required source/human/consumer evidenceを持つ。phase候補が無いこととphase非適用を分離し、全行の`authority_boundary`はformal crosswalk/phase/product authority、implementation/degradation/failure/consumer closure/successorをfalseに固定する。
`inventory.scope.full_phcap_boundary_review` は `status=pending_all_20`、`non_applicability_proven=false` としてtaxonomyの境界状態を保存する。

## 固定入力と再現性

BASEは`5562f04da0f3205f9aa58205ec0d478419fc4f2e`、taxonomyはcommit `78e23a622bc9c40183269e22a59c566d22b93435`、source blob `c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f`、source SHA-256 `e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4`、inventory blob `e3430907c65b3c74cf3f799875ca0f1c34fdc35e`、inventory SHA-256 `89ddd6361743d37e809b2e5cd7aba217886770b5688787822426f6aa3bd123d2`である。`inventory.json`の64 input snapshot digestが、IR、Wave、RDP、PHCAP、boundary、decision、L1を固定する。

## 判断待ち

phase配置判断に必要な証拠は、current authoritative source/custodyとatomic source contract、原文anchorに基づくPHCAP-01..20全境界の比較、product owner/phase authorityによるunit・connection・product・phase・L2/L11 successorのhuman decisionである。receipt/read-after、failure/recovery、stale/re-entry、rollback/retentionを含むimplementation/acceptance/consumer closureは配置判断後の別証拠として扱う。両段階とも未完了のため、候補をformal phaseへ昇格せず、unresolved 30を保持する。

## 検証

独立validatorはgeneratorをimportせず、30 IDの欠落・重複・余分、taxonomy commit/blob/digest/ancestor、BASE ancestor、全input digest、source anchor、66 edge、38 asset、status/rule、4不足類型、authority境界を検査する。taxonomyのcandidate_statement等全フィールドと30行の分析テキストを独立期待値digestで固定し、selfcheckは45負例を最初の期待error codeと照合する。scfctlの旧archive static evidence guardと共有selftest/case更新はSCF-B-0001所有の共通検証依存として差分に含めるが、0134 Binding artifactsには含めない。static upstreamは固定root、正規note `静的read-only参照のみ`／非実行句、digest、resolve後のroot containment、root内解決を含むsymlink、directory／non-regular file、backslash／Windows-absolute pathを69 casesで検査し、case44〜46はsymlink先bytes／directory・FIFO object-kind digestを一致させた上で、`symlink`／`non_regular` returnの到達を直接検査する。否定note `非静的read-only参照のみ`のsubstring通過も拒否する。次を実行済みとして提出する。

```text
python3 -B scaffold/phase-gap-cross-analysis-0134/generate.py
python3 -B scaffold/phase-gap-cross-analysis-0134/validate.py
python3 -B scaffold/phase-gap-cross-analysis-0134/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py selftest
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

本修正の静的確認: generator再生成はbyte一致、SCF-B-0134 independent validator PASS（30 units, 66 edges, 38 assets; direct phase evidence 0; formal phase 0）、selfcheck 45負例PASS、`scfctl validate` は132 bindings / fail=0、`scfctl selftest` は69 cases / fail=0、`stale=0`、`residuals=0`、対象JSONの構文確認と`git diff --check`もPASS。旧archive内コードは実行していない。

旧archiveの実行、既存crosswalk・PHCAP・authorityの変更、merge/closeは行わない。
