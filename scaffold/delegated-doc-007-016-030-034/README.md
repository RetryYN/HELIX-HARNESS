# RDP-001 delegated-doc scaffold candidate（SCF-B-0017）

この候補は、RDP-001 delegated-doc holding の残分母から、既候補14文書／26 edgeと重複しない次のL3/L10 pairを2組、旧archiveの固定blobから読み取り専用で記録したものです。Bindingは `SCF-B-0017`、候補IDは `RDP-001-SCF-B-0017-DOC-007-016-030-034` です。`comparison.fixed_source_revision` はsource blobを固定した時点のcapture revision（`ec80948df480d144022ff5e510ff94f0839f8a7a`）であり、現行mainを常に一致させるgateにはしていません。source file SHA-256、archive blob、line span、atom exact textはvalidatorが固定値から再計算します。

対象は次の4文書と4 edgeです。

| pair | L3 | L10 | edge | source lines | atoms | AC定義／T→AC参照 | AC差分 |
|---|---|---|---|---:|---:|---:|---|
| `RDP-001-PAIR-DOC-007-016` | `DELEGATED-DOC-007` lifecycle-state-separation.md | `DELEGATED-DOC-016` lifecycle-state-separation-acceptance.md | `REF-0320`, `REF-0766` | 191 + 289 | 8 + 25 | 16 / 16 | `[]` |
| `RDP-001-PAIR-DOC-030-034` | `DELEGATED-DOC-030` infinity-loop-functional-requirements.md | `DELEGATED-DOC-034` L3-infinity-loop-acceptance-test-design.md | `REF-0316`, `REF-0739` | 95 + 63 | 48 + 24 | 72 / 72 | `[]` |

full blobは4文書で638行、atomは105、atom span unionは195行、未covered行は443行です。未covered行は文脈として明示的に保持し、意味採択や実装準備へ昇格させません。文書別の分母は `DOC-007=191/8/183`、`DOC-016=289/115/174`、`DOC-030=95/48/47`、`DOC-034=63/24/39`（source lines / covered / uncovered）です。各文書の原IDは固定blobから再計算し、`DOC-007=24`、`DOC-016=24`、`DOC-030=96`、`DOC-034=96`、合計240です。atomizedは240、unatomizedは0で、各 `unatomized_original_ids` は空配列です。validatorは原IDの全件、atomized集合、未atom化集合、件数を完全一致でgateします。

原source SHA、asset ID、phase候補、actor、authority条件、negative条件、owner候補（HELIX-HARNESS／HELIX-OS）、consumer候補、legacy implementation unknown、phase authority unconfirmed、consumer pending、legacy execution falseを保持しています。DOC-007には `docs/design/helix/L3-requirements/vmodel-docgen-fit.md:16`、DOC-030には `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:13`、DOC-034には `requirements-ir/manifest.json:18` の未解決cross-document referenceを残しています。採用、owner確定、consumer closure、phase authority、legacy implementation、L3/L10 freeze、acceptance completion、runtime/CI readinessは生成していません。

L10の各T行は固定blobから再計算したAC集合を明示的に参照します。validatorは両pairのL3定義集合とL10 T→AC集合を再計算し、差分集合、undefined reference、T行のAC個数、atom span内の明示ACを検査します。差分は両pairとも空集合で、selfcheckは `LSAC-01a` と `HAC-HIL-01a` のT→AC参照削除を負例としてfail-closeします。

closure guardは全9 fieldを完全一致で保持し、top-level `authority_effect`／`meaning_change_applied`／`successor_requirement_ids`／`human_decision_ref`、`equivalence_claim=null`との整合を検査します。`authority_effect=none`、`meaning_change_applied=false`、successor空、human decision null、adoptionなし、holding closure未実施です。

## 静的検証

```bash
python3 scaffold/delegated-doc-007-016-030-034/validate.py
python3 scaffold/delegated-doc-007-016-030-034/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals

git diff --check
```

`validate.py` はarchive内のruntime・test・CI・hookを実行せず、holding／ledger／固定blobを読み取り専用で照合します。`selfcheck.py` はclosure全field、top-level同値、固定blob digest、coverage gap／uncovered list、原ID partition、AC削除、edge drift、owner／consumer／phase／implementationの昇格、残分母変更など31負例を検査します。

holding分母は114文書／788 edge、既候補14文書／26 edgeを除いた本batch前は100文書／762 edge、今回4文書／4 edgeを除いた残りは96文書／758 edgeです。holdingのclosure、adoption、正式要求化は実施していません。変更は `scaffold/` 名前空間の候補artifactに限り、commit、push、PR、merge、Issue、外部作用は行いません。
