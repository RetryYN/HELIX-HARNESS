# 旧委任要求文書のfile-blob保全inventory

status: preserved_pending_atomization
machine_ledger: `delegated-requirement-document-source-holding.jsonl`
ledger_sha256: `23d1df9c24b579c78c5836390d4c62c345e483eca42a9452742fad28d1e787fd`
reference_ledger: `delegated-requirement-document-reference-holding.jsonl`
reference_ledger_sha256: `627a764420d54dd13df0b340605c25b9f977d36a31954ead35a94cccba0e54f7`

## 対象と目的

旧requirements v1.3が意味を委ねる22文書を起点に、文書がfrontmatterで宣言する意味relationを再帰的に辿る。
closureは117文書で収束する。内訳は、既存のScrum Reverse行台帳で保持する3文書と、本台帳でarchive内の原文blob、
元path、SHA-256へ束縛する114文書である。直接委任22文書に対し、95文書が宣言relationから追加で到達する。

114 file blobの元statusはconfirmed 81件、draft 22件、proposed 2件、placeholder 2件、
`current-authority` 1件、`reviewed` 1件、`draft-reviewed-by-codex` 1件、statusなし4件である。原statusを変更せず、
全件を`preserved_pending_atomization`、successor 0、人間decision 0、意味変更適用0として保持する。

## closure規則

起点文書から次の意味relation keyを辿り、到達した文書にも同じ規則を適用して固定点まで反復した。

- pair／V-model: `pair_artifact`、`pair_group.members`、`operational_test_design`、`system_test_design`、
  `related_l7_oracles`
- 上下流設計: `parent_design`、`related_l0`、`related_l1`、`related_l3`、`related_l4`、`related_l5`、
  `related_l6_function_spec`、`related_l6_edge_case`、`related_l5_operation_scope`、`related_l12`、`related_br`、
  `related_requirements`、`requirement_source`、`system_requirements`、`basic_design`
- authority／意味台帳: `authority`、`l3_progression_authority`、`definition_ledger`、
  `requirement_definition_ledger`、`authority_binding`、`source_ledger`、`requirements`、`assertions`
- 適用・出典: `tailoring_profile`、`legacy_source`、`independent_review`

この規則で宣言relationは265 edgeである。`plan`、PLANを指す`parent_doc`、`v2_import`は、工程履歴またはmigration
provenanceであり、それだけを理由に要求意味closureへ昇格させない。ただし無視せず、本文参照とともに
[参照候補holding](delegated-requirement-document-reference-inventory.md)へ出典行と対象blob digestを保持する。

## 参照候補との分離

117文書から見つかるfrontmatterと本文の参照788件は、別の機械台帳へ保持した。内訳は意味relation 265件、
その他frontmatter参照52件、本文参照471件である。参照先は241文書で、意味closure内117文書と、archiveにだけ保持する
分類待ち124文書に分かれる。後者には`docs/governance/coding-rules.md`、L3 functional文書、PLAN、process、migration、
skill等を含む。参照される事実だけで要求atomへ昇格させず、分類前に参照または対象blobを消さない。

## 後続PRとの境界

このPRでは114文書および788参照の要求追加、採否、意味分類、行分解、重複統合、責務配置、successor割当を行わない。
後続の要求整理PRがいずれかの文書または参照候補を入力にするときは、先にその要求・制約・受入・根拠を無損失な
atom集合へ分解し、同じsource digestから導出した集合を新しい`source_holding`へ仮登録する。
file-blob holdingまたは参照件数だけを分母にして`coverage_result: no_loss`へ進めてはならない。

旧v1.3が直接参照するScrum Reverse entity要件と宣言oracleの2文書、およびentity要件のconfirmed親文書は、既存の
[Scrum Reverse行台帳](scrum-reverse-source-line-inventory.md)で保持済みであり、本114件へ重複計上しない。
全117文書と265 relation edgeを同じclosureとして照合し、行保持とfile-blob保持の境界で到達文書を落とさない。
