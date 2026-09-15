# 旧委任要求文書のfile-blob保全inventory

status: preserved_pending_atomization
machine_ledger: `delegated-requirement-document-source-holding.jsonl`
ledger_sha256: `358ed9a50b5fac1b10cf49b401aa82a797c050ab58233f489859f0f18a0e135b`

## 対象と目的

旧requirements v1.3が意味を委ねる22文書のうち、既存のScrum Reverse行台帳に入っている2文書を除く20文書を
保持する。これに、委任文書から`pair_artifact`、`related_l3`、`related_l12`、`parent_design`を再帰的に辿って
到達する16文書と、Scrum Reverse confirmed親要件が対として指定する受入文書1件を加える。
37文書はarchive内の原文blob、元path、SHA-256へ束縛し、管理層の
`MPR-SH-DELEGATED-DOC-002`へ一括仮登録する。

v1.3が参照する`docs/migration/source-manifests/`の2 fileと1 directoryは、v1.3本文がprovenance input-onlyと
明記しているため本holdingの意味委任文書へ数えない。`docs/`外のconfig、src、workflow参照も、実装・設定sourceで
あることだけを理由に要求atomとして数えず、後続の要求または資産reviewで意味sourceと判明した時点にfile-blob
holdingへ先に登録する。

このholdingの単位は要求atomや非空行ではなく**文書file blob**である。内訳はconfirmed 16件、draft 17件、
proposed 2件、`current-authority` 1件、statusを持たないJSON 1件である。原statusを変更せず、全件を
`preserved_pending_atomization`、successor 0、人間decision 0、意味変更適用0として保持する。

## 後続PRとの境界

このPRでは37文書の要求追加、採否、意味分類、行分解、重複統合、責務配置、successor割当を行わない。
後続の要求整理PRがいずれかの文書を入力にするときは、先にその文書の要求・制約・受入・根拠を無損失な
atom集合へ分解し、同じfile SHA-256から導出した集合を新しい`source_holding`へ仮登録する。
file-blob holdingだけを分母にして要求候補を`coverage_result: no_loss`へ進めてはならない。

旧v1.3が参照するScrum Reverse entity要件と宣言oracleの2文書は、既存の
[Scrum Reverse行台帳](scrum-reverse-source-line-inventory.md)で保持済みであり、本37件へ重複計上しない。同台帳の
confirmed親要件1文書を加えると、v1.3直接委任と宣言relation closureは合計40文書（行保持3、file blob保持37）である。

`DELEGATED-DOC-020`と`021`はv1.3が直接指定するgovernance側の工学規律SSoTとL3進行contractである。
`DELEGATED-DOC-022..037`は、既に保持した委任文書からfrontmatter relationを再帰的に辿って到達する対受入、
関連L1／L3／L12、共通parent designである。直接参照または一段目だけでclosureを打ち切らず、委任文書を入力にする
要求PRでは、その文書が宣言するrelation先も同じsource集合として先にatom化する。
