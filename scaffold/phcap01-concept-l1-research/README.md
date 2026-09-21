# PHCAP-01 Concept／L1企画 静的research Scaffold

本Scaffoldは、現行`origin/main`のPHCAP-01（Concept／L1企画）について、四製品の責務・接続候補、旧assetのphase／product候補、実装・縮退・未実装を断定できない範囲を、read-onlyの証拠として保持する。対象はHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSである。

現行Concept v4.1と4対象L1は、`concept-v4.1-and-four-l1-approval-2026-09-17.md`のexact SHA承認記録によって「承認済みrevision」として参照する。ただし各L1文書のfrontmatterが`draft`／`awaiting_parent_approval`であること、承認記録がL2／L11採否、L3／L10、実装、受入、release、deploymentを成立させないことを同時に記録する。したがって本ScaffoldはL2／L11適用、正式runtime、authority、owner、successorを生成しない。

旧assetはarchiveのbytes、manifest SHA、静的な行範囲だけを参照する。旧workflow、runtime、test、CI、hook、adapter、sourceは実行せず、旧記述を現行のimplementation、degraded、unimplemented、failure、consumer closureへ読み替えない。phase inventoryのPHCAP-01候補45件は、29件の`multi_phase_candidate`と16件の`unresolved_with_candidate`、product候補26件の`candidate_needs_semantic_review`と19件の`unresolved`として再集計した。

四製品unitは候補上の意味整理であり、connectionは候補関係の記述である。HARNESS→OSの要求登録・管理、OS→Webの管理、Web-OS→OSの許可観測改善loopを記録するが、いずれも接続authority・runtime writer・実装契約として採用しない。旧assetのsource preservation decision（18F）はsourceの保持と後続atom化のための履歴であり、product adoptionではない。

## 使い方

```text
python3 -B scaffold/phcap01-concept-l1-research/validate.py
python3 -B scaffold/phcap01-concept-l1-research/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

validatorはphase／asset ledger、現行文書SHA、archive source SHA・行数・anchor digest、decision履歴、候補unit／connection、unknown境界に加え、禁止推論の本文・順序と入れ子の項目構造を静的に再照合する。selfcheckはbaseline greenとno-opを先に確認し、authority昇格、旧実装・実行・failure・consumer closureの捏造、現行実装／L2／L11の昇格、archive digest改変、四製品責務・接続意味の反転、禁止推論と入れ子項目の改変など43件の期待error code付き負例を検査する。

この成果物は`SCF-B-0047`に束縛されたcandidateである。formal runtimeへのreplacementは人間判断後のL2／L11以降の別作業として保留する。
