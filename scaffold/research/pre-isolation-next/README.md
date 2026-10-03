# RDP-001 PREISOLATION 次候補 6 path / 24 hunk

このdirectoryは、`GUI-1934-REVIEW-02`で扱った6 path（9 hunk）と重複しない次の6 pathについて、
`6fabd12512a3659fff4a956692cdd61faeeb16ce`（baseline）から
`2d4991042be55268bac30a8bbcdac45b3865030a`（pre-isolation）までのrevision差分を、
要求・制約・provenance・generated metadataの候補として静的に保持するscaffoldである。

## 対象範囲

| 台帳ID | source path | 変更hunk | source category |
|---|---|---:|---|
| `PREISO-REV-000003` | `docs/design/harness/L1-requirements/business-requirements.md` | 2 | requirement_or_prototype_source |
| `PREISO-REV-000004` | `docs/design/harness/L1-requirements/nfr.md` | 2 | requirement_or_prototype_source |
| `PREISO-REV-000005` | `docs/design/harness/L1-requirements/technical-requirements.md` | 1 | requirement_or_prototype_source |
| `PREISO-REV-000006` | `docs/design/harness/L3-functional/nfr-grade.md` | 3 | requirement_or_prototype_source |
| `PREISO-REV-000007` | `docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-remediation-delta.md` | 4 | requirement_or_prototype_source |
| `PREISO-REV-000008` | `docs/design/helix/L1-requirements/pillar-requirements.md` | 12 | requirement_or_prototype_source |

6 pathは全400 file／492 hunkの一部であり、今回の候補は24 hunkだけを対象にする。今回単独の未処理範囲は394 file／468 hunk、#1934の既レビュー範囲を合わせた未処理範囲は388 file／459 hunkである。残りのsourceを意味・採否・ownerの候補から推測して補完しない。

## 旧資産・phase・責務境界

6 pathは旧資産明細台帳とphase分類台帳へsource pathで再照合した。assetはsource snapshot preservationまたはHistorical／unresolved、implementationは`non_executable_read_only_source`または`unknown`、consumer closureは`pending`、legacy executionは全件`false`である。phaseは全件`multi_phase_candidate`で、候補phase／productは未確定のまま保持する。

`HELIX-HARNESS`はV-model、要求・設計・検証contractの候補、`HELIX-OS`はCI・GitHub・state・証跡のconsumer候補として記録した。hybrid remediationとpillar requirementsは複数責務を含むためsource ownerを`unresolved`へ保持した。いずれも正式owner、authority、実装、consumer closureを確定しない。

## 候補分類

semantic diff inventoryの24 fragmentは、requirement 7、constraint 8、provenance 7、generated metadata 2、unresolved classification 0に分類している。この数値はGit diffの**hunk-level classificationの件数**であり、意味要求7件などのsemantic atom件数ではない。`unresolved_meaning`と`possible_conflicts`は各fragmentに残し、分類の正しさや意味同値を自動判定しない。baseline／pre-isolationのexact source span、UTF-8 SHA-256、Git diff hunk集合をvalidatorが再抽出して照合する。

### hunk分類とsemantic atomの境界

24件はhunk-level classification onlyであり、semantic atomizationは未完、semantic atom countは0である。全fragmentを`compound_hunk_hold`へ保持し、atom化完了、要求採否、意味同値、closure、adoptionは主張しない。`RDP001-NEXT-DIFF-010`、`014`、`015`、`016`、`022`には原文lineへ接地した15件の`semantic_subunits`をreview-onlyの分解候補として記録したが、これらはsemantic atom coverageを確立しない。残り19 fragmentはsubunit未分解であり、24 hunk全体が非原子のままレビュー待ちである。subunitもowner、candidate kind、否定条件、実装、consumer適用を未確定のまま保持する。

## 静的検証

```text
python3 scaffold/pre-isolation-next/validate.py
python3 scaffold/pre-isolation-next/selfcheck.py
```

validatorはholding／asset／phase台帳、固定Git object、archive snapshot bytes、製品境界source、全体diff分母、選定hunk、hunk-level fragment分類、compound hold、review-only subunitのsource grounding、owner候補、否定条件をread-onlyで確認する。selfcheckはdigest drift、phase実装済み化、owner単一化、authority昇格、旧実行、hunk欠落・span改竄、分類改竄、semantic atom化完了の偽装、subunit owner／source span改竄を一時JSONでfail-close確認する。

検証合格は意味同値、要求採否、L2／L3／L10 freeze、authority昇格、実装、受入、closure、releaseを示さない。旧archiveのruntime／test／CI／hookは実行していない。
