# DELEGATED-DOC-006/015 と REF-0308/0424/0425/0765 のatom候補

このdirectoryは、RDP-001の次の独立文書pairを、要求採用・意味同値・責務配置へ昇格させずに静的レビューへ束ねるscaffold candidateである。

- `DELEGATED-DOC-006`: `docs/design/helix/L3-requirements/github-security-admission-requirements.md`（旧L3 requirement、status `draft`）
- `DELEGATED-DOC-015`: `docs/test-design/helix/github-security-admission-system-test-design.md`（旧L10 test design、status `draft`）
- `DELEGATED-REF-0308` / `DELEGATED-REF-0765`: pair artifactの往復edge
- `DELEGATED-REF-0424` / `DELEGATED-REF-0425`: `helix-harness-requirements_v1.3.md`からのinbound body reference

既候補のDOC-003/028、DOC-008/017（merged Binding `SCF-B-0005`／`SCF-B-0006`）とはsource document ID・reference edge IDを重複させない。正本holding全体は114 source document、788 reference edgeのまま保持し、既候補8 edgeと本候補4 edgeを差し引いた残分母を108 document／776 edgeとして記録する。

選定pairは合計111行で、複合coverage span 8件（DOC-006が5、DOC-015が3）と意味分類用atom 11件（原ID 7、metadata/evidence 4）を分けて保持する。原IDは`GH-FR-029`、`GH-NFR-019..022`、`GH-AC-041`、`GH-T-041`である。各atomはexact source span、actor、authority条件、negative条件、owner候補、consumer候補、未確認のphase／legacy implementation／consumer状態を持つ。

DOC-006の受入ID集合とDOC-015の参照ID集合は固定blobから再計算し、双方とも`GH-AC-041`で差分は空である。差分が生じた場合はvalidatorがfail-closeし、テスト行からACの意味・owner・authority・acceptance・parityを推測しない。

製品候補はHARNESS（V-model、要求・設計・検証contract）とHELIX-OS（GitHub／CI／state／credential／artifact運転）を分けて保持する。混合責務は`unresolved`へ残し、採用ownerではない。旧assetはHistorical／unresolved、phase authority未確認、legacy implementation unknown、consumer pending、legacy execution falseを維持する。

```text
python3 scaffold/delegated-doc-006-015/validate.py
python3 scaffold/delegated-doc-006-015/selfcheck.py
python3 scaffold/tools/scfctl.py validate
```

validatorは正本台帳、固定Git archive blob、製品境界source、旧asset／phase metadata、reference edge、line coverage、actor／authority／negative条件を読み取り専用で照合する。旧runtime／test／CI、GitHub、DBは実行・更新しない。検証合格はatom化完了、意味同値、要求採用、L2／L3／L10 freeze、implementation、consumer closure、acceptance、releaseを示さない。
