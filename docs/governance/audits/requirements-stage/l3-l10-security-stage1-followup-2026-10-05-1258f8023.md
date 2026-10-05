# SECURITY Stage 1 追補修正記録

status: ローカル追補候補。root semantic inspection と修正後exact HEADのClaude独立reviewは未完了。

本文commit `1258f80230a5d90978a592493fb23cefc1198747` は、前body `375dd460655d6085dd2f83880bcd3c9c5dbae532` の上にFR/FV 2文書だけを追補した。先行の不変監査 `l3-l10-security-stage1-claude-review-correction-2026-10-05-15910e2.json` はSHA-256 `a711e975c5ece8ca269aad2a2bcfe9b7238d3c104d38621d06a6bfce6ec78192` のまま保持した。既存記録を書き換えず、旧responseの3 findingでL10に不足していた証拠を補足する。

- **004-3:** CASE-004にConcept構成版と切戻し候補のsource/revision/evidenceを記録する正常例を追加した。owner欠落はunknownのまま停止してL1-004へ戻す。切戻し候補の根拠が欠落・stale・他project由来なら承認済みの切戻し先とみなさない。
- **005-2:** CASE-005へ実secretではない合成markerによるrepository混入fixtureを独立追加した。一般file/artifact露出と別に判定し、marker値・file内容を証拠へ複写しない。
- **007-3:** CASE-007に停止・rollback・再開可否を同一assignment/policy revision/実適用観測へ束縛する正常出力fixtureと、再開可否unknownだけを変異したnegativeを追加した。unknown時は他のgreenから再開を推定せず、revision・不足根拠・owner戻し先を保持する。

FRの固定source注記を日本語化し、FV対応表の015/016/020の版説明も日本語にした。版や要求意味は変えていない。

固定sourceはf6dad2a `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2/L11の関連span・raw-LF SHA、全6 canonicalの更新後SHA、19 AC/19 CASE参照、静的検証結果は同名JSONに記録した。検証は `git diff --check`、現行 `scfctl validate` 147件/fail 0、stale 0、residuals 0、govcheck 7,622 atoms/57 requirements/58 files PASS。旧runtime/test/CI/Bunは実行していない。

この追補は独立review、POのL3承認、Ready、merge admission、実装・実行許可を生成しない。push/PR/mailboxは行っていない。
