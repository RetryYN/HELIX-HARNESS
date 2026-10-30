# OS015 C0573–C0582 class correction audit

## 対象とsource

- 候補base: #3927 head `5d541f69ff86674e585311558ad2dac1972d42e4`
- L4 source: `docs/helix-os/L4-basic-design/management-authority-source-record.json` の固定 `diagnostic_contract` と `algorithm_python_document_text`
- L7 source: `docs/helix-os/L7-function-verification/management-authority-source-record.json` の各case `given.input`。file SHA-256=`b2a71c3d2a99c5268275e183f21c2b1bbc4b21ad79d577af42573a079e920a09`
- sourceをL4/L7だけに限定し、L7 `expected_proposal`、L8/L9のcase expected、checker出力は分類根拠に使わない。

## 導出規則

L4 algorithmは`phase == 'classify'`でactual/contextの`original_classification`を確認する。context側prior（変数`eo`）が`None`である場合だけ、new classificationの`prior_classification_ref`と`prior_classification_revision`のactual側比較をspecial-caseし、nullをsource findingにしない。context priorが非nullなら各fieldで通常の`cmp`を行う。actual/contextのnew-classification prior値はいずれもnullなので、2 field × 2 sideの4 distinct pointerへ`source_unresolved`を出す。

L4はfindingsを`(code, pointer, return_owner)`順でsortする。同じcodeのfindingもpointerが違えば別々に保持する。source finding 4件のpointer順はcontext ref、context revision、actual ref、actual revision。既存prior findingはcontext original pointerがactual original pointerより先になる。

source finding 4件の完全なpointer列:

1. `/context/records/target_a/new_classification/prior_classification_ref`
2. `/context/records/target_a/new_classification/prior_classification_revision`
3. `/records/target_a/new_classification/prior_classification_ref`
4. `/records/target_a/new_classification/prior_classification_revision`

## 固定入力との照合

全caseは`phase=classify`。replacementはL7 `given.input`の一部であり、未記載のfieldは同じfixed fixture valueを保つ。

| Case | original classification stimulus | new-classification prior fields | L4 ordered findings | 全体 / axis / state |
| --- | --- | --- | --- | --- |
| C0573 | actual known prior、context null | 両側prior ref/revisionはnullだがcontext nullのためskip | `first_classification_prior_present`, `original_classification_mutated` | violation / classification / violation |
| C0574 | context known prior、actual null | 両側prior ref/revisionはnull。context priorが非nullなので4件unknown | `first_classification_prior_present`, `original_classification_mutated`, `source_unresolved` ×4 | violation / classification / violation |
| C0575 | actual/context同じknown prior | 両側prior ref/revisionはnull。context priorが非nullなので4件unknown | `first_classification_prior_present` ×2, `source_unresolved` ×4 | violation / classification / violation |
| C0576 | actual `{}`、context null | null、context nullのためskip | `first_classification_prior_unresolved`, `original_classification_mutated` | violation / classification / violation |
| C0577 | context `{}`、actual null | 両側prior ref/revisionはnull。context priorが非nullなので4件unknown | `first_classification_prior_unresolved`, `original_classification_mutated`, `source_unresolved` ×4 | violation / classification / unknown |
| C0578 | actual/context `{}` | 両側prior ref/revisionはnull。context priorが非nullなので4件unknown | `first_classification_prior_unresolved` ×2, `source_unresolved` ×4 | unknown / classification / unknown |
| C0579 | actual `UNKNOWN-PRIOR`、context null | null、context nullのためskip | `first_classification_prior_unresolved`, `original_classification_mutated` | violation / classification / violation |
| C0580 | context `UNKNOWN-PRIOR`、actual null | 両側prior ref/revisionはnull。context priorが非nullなので4件unknown | `first_classification_prior_unresolved`, `original_classification_mutated`, `source_unresolved` ×4 | violation / classification / unknown |
| C0581 | actual/context `UNKNOWN-PRIOR` | 両側prior ref/revisionはnull。context priorが非nullなので4件unknown | `first_classification_prior_unresolved` ×2, `source_unresolved` ×4 | unknown / classification / unknown |
| C0582 | actual/context同じknown priorと新分類prior | 両側のprior ref/revisionがknownで一致 | `first_classification_prior_present` ×2 | violation / classification / violation |

## Corrected class grouping

- C0573の既存2-finding keyを維持し、C0574を追加4-finding別keyにする。
- C0576/C0579の既存2-finding keyを維持し、C0577/C0580を追加6-finding keyにする。
- C0582の既存2-finding keyを維持し、C0575を追加6-finding keyにする。
- C0578/C0581は既存prior finding 2件にsource finding 4件が加わる同じ6-finding keyへ更新する。

全体conditionは全facetのseverityで決まり、axis/stateは最初の非corresponding facetの局所severityで決まる。C0577/C0580の`original_classification_mutated`はhistory/violationだが、先に選択されるclassification facetのprior unresolvedと比較不明所見はunknownなので、全体はviolation、axis/stateはclassification/unknownとなる。C0578/C0581もunknown/classification/unknown。
