# RDP-001 DELEGATED-DOC-001 semantic atom candidate

`DELEGATED-DOC-001`（`ai-vision-design-harness-engine.md`）を、旧sourceの意味を減らさずに静的なsemantic atom候補へ展開する仮束である。旧要求の採否、successor割当、現行authority化、L2/L11合意、L3/L10凍結、実装、受入を成立させない。

比較対象は merge済みPR #1964とWave24を含む `origin/main` exact HEAD `2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c` の `scaffold/rdp001-delegated-doc003-unprocessed8/report.json` に記録された旧archive blobで、固定source revisionは `569d7373c32287bbafadeec6043472563937c5c7`。sourceは126行・11,150 bytes、SHA-256は `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d` である。

PR #1964でDOC-001のreport行数欄は126へ訂正され、固定archive blobのUTF-8 `splitlines()`、bytes、SHA-256、各exact spanと一致する。候補は訂正済みreportの126行を使用し、旧行数値を残余の分母や不確実性として扱わない。

このworktreeのbaseは、merge済みPR #1964とWave24を含む `origin/main` exact HEAD `2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c` である。source captureはreportに記録された `569d7373c32287bbafadeec6043472563937c5c7`、archive objectは同source revisionのread-only blobである。mainの後続merge、source digest再確認が済むまで `validate.py` の結果はこのworktree内の静的証拠に限る。

全source行を coverage し、76 atom候補へ分けた。

- VDH-FR-001〜019: 19 requirement atoms
- HBR-DH-001〜029の対応: 29 relation atoms
- frontmatter・見出し: 7 metadata atoms
- 入力裁定: 1 premise atom
- 入力裁定・Hybrid経路: 5 constraint atoms
- L1〜L12配置: 12 layout atoms
- 完了式: 3 acceptance atoms

合計は `19 + 29 + 7 + 1 + 5 + 12 + 3 = 76` atomsである。

現行4製品の境界は候補分類として参照した。VDHのnormative V-model・Design HARNESS責務は `HELIX-HARNESS` 候補、登録・projection・Worker・CI・状態・改善運転は `HELIX-OS` consumer／connection候補として分けた。mixedなFRと完了式は `unresolved` を保持する。`HELIX-Web` と `HELIX-Web-OS` の固有責務をDOC-001から直接確定できる証拠はないため未割当であり、不要という判断ではない。

旧asset `LEGACY-ASSET-335176749F6322C3CD8D` は `Historical`／`unresolved`、旧implementationは `unknown`、旧実行は `false`、consumer refsは空、consumer closureは pending である。phase/product bootstrapの文書レベル候補は PHCAP-01／06／16／18／19 と4製品だが、atom単位のphase・product採否は未確定である。degraded／failureは構造化台帳に無く、各atomで `unknown` とした。reportの語彙出現数は実装・degraded・failure・consumerの成立証拠ではない。

```text
python3 -B scaffold/rdp001-delegated-doc001-atom-030/build.py
python3 -B scaffold/rdp001-delegated-doc001-atom-030/validate.py
python3 -B scaffold/rdp001-delegated-doc001-atom-030/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
```

validatorは固定Git archive blob、holding／asset／phase台帳、source span・SHA-256、全126行のcoverage、4製品語彙、unknown境界、successor不在をread-onlyで検査する。旧archiveのworkflow、CLI、hook、adapter、source、test、CI、runtimeは実行しない。

検証合格は、atom化の人間review完了、要求採用、product owner確定、phase admission、意味同値、実装、consumer closure、L11受入、canonical promotionを意味しない。正式な代替成果物が成立したら、Scaffold Bindingのreplacement手順に従って差し替える。
