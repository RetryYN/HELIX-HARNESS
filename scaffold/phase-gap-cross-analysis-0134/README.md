# SCF-B-0134 held30 phase-gap cross analysis

これは `phase-status-taxonomy-0105` が `held` とした旧IR 30 unit の再現可能な横断分析である。目的は、直接phase根拠が無い理由を、原文・Wave 1–50・RDP holding・PHCAP-20・四製品L1 decisionの固定バイトから再導出し、次の人間判断に必要な証拠を明示することに限る。`#2082` と `#2084` の成果物は入力、oracle、集計元として使用していない。

各行は research-only であり、formal phase、product owner、実装成立、未実装、縮退、failure receipt、consumer closure、L2/L11 successorを生成しない。`phase_non_applicability.status=not_proven`、`excluded_phase_ids=[]`、`pending_phase_ids=PHCAP-01..20` を30行すべてに固定している。旧世代資産は意味・判断史・failure・consumerの静的参照だけで、旧archiveのsource/runtime/test/hook/adapter/CIは実行していない。

## 固定入力

- BASE: `5562f04da0f3205f9aa58205ec0d478419fc4f2e`（main、required ancestor）。
- taxonomy commit: `78e23a622bc9c40183269e22a59c566d22b93435`。
- taxonomy source: `scaffold/phase-status-taxonomy-0105/units.jsonl`、blob `c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f`、SHA-256 `e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4`。
- taxonomy inventory: `scaffold/phase-status-taxonomy-0105/inventory.json`、blob `e3430907c65b3c74cf3f799875ca0f1c34fdc35e`、SHA-256 `89ddd6361743d37e809b2e5cd7aba217886770b5688787822426f6aa3bd123d2`。
- `inventory.json` の `input_snapshot` が、固定BASEから読んだIR、Wave 1–50、RDP、PHCAP、product-boundary、HDEC、四製品L1の全64 pathをbytes digest付きで列挙する。taxonomy sourceの保存snapshotは `phase-status-taxonomy-0105.units.jsonl` である。

## 集計結果

| 項目 | 再導出値 |
|---|---:|
| held unit | 30 |
| 製品候補 | HELIX-OS 24 / HELIX-HARNESS 6 |
| taxonomy status | `CROSS_CUTTING_PHASE_REVIEW_PENDING` 20 / `UNRESOLVED_SOURCE_OR_HUMAN_REVIEW` 10 |
| matrix rule | `M-CROSS-CONSTRAINT-REVIEW` 20 / `M-WAIT-PHCAP-BOUNDARY` 8 / `M-WAIT-SOURCE-AUTHORITY` 2 |
| Wave入力 | 50 files / 598 rows |
| semantic edge | 66 |
| unique old asset | 38 |
| direct phase evidence | 0 |
| formal phase candidate | 0 |
| phase非適用を立証 | 0 |
| excluded phase | 0 |
| PHCAP-01..20 pending | 30（全unitで20件保留） |

`direct phase evidence=0` はWave edge上の文字列やasset digestをphase証拠として数えないことを意味する。`formal phase candidate=0` は権限を変更しない境界であり、phase gapが解消したという意味ではない。
`inventory.scope.full_phcap_boundary_review.status` はtaxonomyと同じ `pending_all_20`、`non_applicability_proven=false` で、30 unitすべての20 phase保留を表す。

## 直接phase根拠が0となる4類型

### `SOURCE_AUTHORITY_CUSTODY_GAP`（2）

要求定義authorityまたはsource custodyのcurrent contractが閉じず、原文の責務主語をphaseへ接続できない。

- `IRUNIT-HIL-BR-14-HELIX-OS`
- `IRUNIT-HIL-BR-24-HELIX-OS`

次に必要なのはRDP source atomization、current contract、authority receipt、product/unit boundary decisionである。

### `PHCAP_BOUNDARY_GAP`（8）

prototype、re-entry、ingestion、canonicalization、L4 write authorityなどの境界が複数PHCAPにまたがり、原文だけでは直接責務を決められない。

- `IRUNIT-HIL-FR-17-HELIX-OS`
- `IRUNIT-HIL-FR-18-HELIX-OS`
- `IRUNIT-HIL-FR-19-HELIX-HARNESS`
- `IRUNIT-HIL-FR-20-HELIX-OS`
- `IRUNIT-HIL-FR-24-HELIX-OS`
- `IRUNIT-HIL-FR-31-HELIX-OS`
- `IRUNIT-HIL-NFR-30-HELIX-OS`
- `IRUNIT-HIL-TR-07-HELIX-OS`

次に必要なのは候補phaseと競合PHCAPのcurrent boundary contract、phase reviewer判断、consumer closureである。

### `CROSS_PHASE_COMPETITION`（10）

横断制約だが、PHCAP-01..15の具体能力との意味接続候補がある。したがって「PHCAP-20を直接要求しない」ことからphase非適用は導けない。

- `IRUNIT-HIL-FR-21-HELIX-OS`
- `IRUNIT-HIL-FR-23-HELIX-OS`
- `IRUNIT-HIL-FR-33-HELIX-HARNESS`
- `IRUNIT-HIL-FR-46-HELIX-OS`
- `IRUNIT-HIL-FR-52-HELIX-OS`
- `IRUNIT-HIL-FR-53-HELIX-OS`
- `IRUNIT-HIL-NFR-02-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-03-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-06-HELIX-OS`
- `IRUNIT-HIL-TR-08-HELIX-HARNESS`

次に必要なのはshared capability、connection、phaseの全PHCAP境界比較と、product/phase authorityによるhuman decisionである。

### `CROSS_PHASE_UNRESOLVED`（10）

横断制約として読めるが、PHCAP-16..20を含む全20境界の除外も直接責務も立証できない。

- `IRUNIT-HIL-FR-33-HELIX-OS`
- `IRUNIT-HIL-NFR-05-HELIX-OS`
- `IRUNIT-HIL-NFR-07-HELIX-OS`
- `IRUNIT-HIL-NFR-11-HELIX-OS`
- `IRUNIT-HIL-NFR-12-HELIX-OS`
- `IRUNIT-HIL-NFR-23-HELIX-OS`
- `IRUNIT-HIL-NFR-31-HELIX-OS`
- `IRUNIT-HIL-NFR-32-HELIX-OS`
- `IRUNIT-HIL-TR-04-HELIX-HARNESS`
- `IRUNIT-HIL-TR-04-HELIX-OS`

次に必要なのはPHCAP-01..20の直接責務・除外sourceの確認であり、phase非適用は保留したままhuman reviewへ送る。

## 正式phase判断の最低条件

1. current source contractが責務主語、対象product、input/output、acceptance、failure/recovery、revision/digestを固定する。
2. PHCAP-01..20の競合境界を直接照合し、candidate、connection、shared capability、非適用の理由を原文anchorで分離する。
3. product ownerとphase authority reviewerがunit/connection/composite、target product、L2/L11 successorを明示決定する。
4. 名前付きcurrent consumerのreceipt/read-after、failure/recovery、stale/re-entry、rollback/retention境界でclosureする。

これらが揃うまで、taxonomyのunresolved statusとauthority noneを保持する。

## 検証と成果物

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

独立validatorは`generate.py`をimportせず、固定BASEとtaxonomy commit/blob/digest、30 ID/status/rule/anchor、66 edge、38 asset、phase/product authority境界を再導出する。taxonomy全値と30行の分析テキストは独立期待値digestで固定し、selfcheckは42 negative casesで各改変の期待error codeを照合する。共通scfctlは旧archiveを固定root内の通常ファイルに限るupstream static evidenceとして、正規の`静的read-only参照のみ` note、明示的な旧archive非実行句、digest一致、resolve後のroot containment、symlink（root内へ解決するものを含む）、directory／non-regular file、backslash／Windows-absolute pathを69 casesで検査する。symlink fixtureは解決先bytes、directory／FIFO fixtureは決定的なobject-kind digestを宣言値と照合し、case44〜46は`symlink`／`non_regular`の拒否分岐到達を直接検査するため、該当returnを削除するとdigest一致後にselftestが失敗する。否定noteのfixtureは`非静的read-only参照のみ`を使い、正規句のsubstring通過を許さない。scfctlと共有evidence/caseの変更はSCF-B-0001所有の共通検証依存としてBinding artifactsに含めず、0134の成果物・入力digest・負例集合・authority noneだけをこのBindingに固定する。

成果物は `inventory.json`（集計・全入力digest）、`analysis.jsonl`（unit別anchor・Wave edge・asset・不足証拠・判断待ち）、taxonomy保存snapshot、generator、validator、selfcheck、README、PR-DRAFT、Bindingである。
