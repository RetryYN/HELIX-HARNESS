# 旧委任要求文書のfile-blob保全inventory

status: preserved_pending_atomization
machine_ledger: `delegated-requirement-document-source-holding.jsonl`
ledger_sha256: `5cf3700bd334960893acc46e4646c8c5128be3311989ae6e0f3fddd9884c2f3f`

## 対象と目的

旧requirements v1.3が正本FR、関連要件、検証oracleとして参照する20文書のうち、既存のScrum Reverse行台帳に
入っていない18文書と、Scrum Reverse confirmed親要件が対として指定する受入文書1件を保持する。
19文書はarchive内の原文blob、元path、SHA-256へ束縛し、管理層の
`MPR-SH-DELEGATED-DOC-001`へ一括仮登録する。

このholdingの単位は要求atomや非空行ではなく**文書file blob**である。内訳はconfirmed 5件、draft 12件、
proposed 1件、statusを持たないJSON 1件である。原statusを変更せず、全件を
`preserved_pending_atomization`、successor 0、人間decision 0、意味変更適用0として保持する。

## 後続PRとの境界

このPRでは19文書の要求追加、採否、意味分類、行分解、重複統合、責務配置、successor割当を行わない。
後続の要求整理PRがいずれかの文書を入力にするときは、先にその文書の要求・制約・受入・根拠を無損失な
atom集合へ分解し、同じfile SHA-256から導出した集合を新しい`source_holding`へ仮登録する。
file-blob holdingだけを分母にして要求候補を`coverage_result: no_loss`へ進めてはならない。

旧v1.3が参照するScrum Reverse entity要件と宣言oracleの2文書は、既存の
[Scrum Reverse行台帳](scrum-reverse-source-line-inventory.md)で保持済みであり、本19件へ重複計上しない。
