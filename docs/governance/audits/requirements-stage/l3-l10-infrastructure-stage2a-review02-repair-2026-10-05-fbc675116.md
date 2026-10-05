# INFRA Stage 2a #2590 review02 修正記録

- 修正本文: `fbc6751165d547c911b80fe9b728ff7010dcaa92`。review exact base: `f5d2b2defa4c9287410f3108ba03019cdd6dec90`、対象HEAD: `bdaaf660bfe7c1909bf9d3dbdfd178abcd15c9a3`。
- 固定L2/L11 revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。PO採択記録revision: `633bf12ea8f948db8ba3d6600179c4a9507377a7`。
- 対象親: HELIXINFRASTRUCTURE-L2-003/004/005/009/010。Stage 2a FR 20、AC 21、CASE 74、技術NFR候補6、独立BR/business CASEは0。
- Stage 1/2bの6 canonical prefixは基準mainのbytesと完全一致。変更はL3 functionalとL10 functionalのStage 2a範囲に限定した。

## 所見対応

| 所見 | 対応 |
|---|---|
| M1 | 条件付きstageの正常case 009-02で同一stage構成証拠・必要Infrastructure依存・更新/rollback evidenceを照合。部分更新・rollback失敗・未完operationを009-08/09/10へ個別negativeとして追加しOS/INFRA ownerへ戻す。 |
| M2 | credential保存を固定L2/L11に合わせて修正。normal resource stateは無条件に拒否し、backup/snapshotはSECURITY条件なしの無条件保存を拒否、条件不明はSECURITYへ返す。旧OPSの無限定なsecret非保持との違いを項目別旧source記述に明記。 |
| M3 | read-only宣言だけでwrite禁止証跡がないcase 010-20と、対象before/after証跡がないcase 010-21を独立negativeとして追加。SECURITY/OSへ戻す。 |
| N1–N2 | FR-004に原因を推測確定しないことを追加。CASE-004-02/05に観測source/collector ownerへの戻し先を記録。 |
| N3–N4 | CASE-005-10でstate owner不明を未解決保留にし、005-11でrecovery design owner/OSへの戻し先を明記。適用recovery requirement欠落/unknownの独立case 005-14を追加。 |
| N5 | CASE-003-18の戻し先をOS/INTELLIGENCE decision ownerに統一。 |
| N6 | 全体stage release完成待ちをCASE-009-07へ独立negative化。旧監査の誤ったclosed扱いはこの追補で訂正。 |
| N7 | authority revocationをexpiryと別のnegativeとしてFR/AC/CASE-010-03へ追加。 |
| N8 | CASE-010-11/13/17にSECURITY/OSの戻し先を追加。 |
| N9 | normal routeのstop/recoveryはstateと未完義務をOSへ返すだけとし、復旧後syncは独立routeのFR/AC-03に限定。CASE-010-19は独立routeのみを明記。 |
| N10 | 旧review01 Markdown内の`{fixed}`/`{po}`は変更せず、今回のappend-only JSONへ固定L2/L11・PO revision、全文/範囲pinを明記。 |

## 検証

- 固定L2/L11の10 clause pin、PO決定pin、legacy OPS-R-01/OPS-AC-001の2 pinを指定git objectから再計算し、full-file SHAとbounded raw-LF span SHAが一致。
- 6 canonicalの全文SHA、承認済prefix SHA/byte length、Stage 2a suffix SHA、792件のcurrent physical-line pinをJSONへ収録。
- 旧review01 repair、followup、trace correctionの6記録は各byte length/SHAを記録し、変更していない。
- `scfctl validate`: bindings=147/fail=0、`stale=0`、`residuals=0`、`govcheck`: atoms=7622/requirements=57/files=58、`git diff --check`: PASS。旧runtime/test/CIは起動していない。
- 本記録は作成側の修正証拠であり、独立reviewではない。正確な修正revisionへの独立再reviewとPO承認は未了。pushなし。

詳細なfinding対応、全current line literal/hash、fixed-parent/legacy source literalとpin、immutable prior-record hashesは隣接JSONに記録する。
