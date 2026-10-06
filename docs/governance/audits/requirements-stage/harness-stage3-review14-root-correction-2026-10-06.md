# HARNESS Stage 3 review14 Root補正検収記録

authority_effect: none

本文revision `75b7979c04d3258098015b5bfd948a21f0f03f19`、base `6008fb947c73466c11084474b0e938d76e912fb7`。13親を対象に正式comment 6008134657のMajor 1／Minor 14を補正した。修正後exact HEADの独立再レビューは未了。

- **M1**：044-01既存index IDを保持し、class identity/contract/oracle/applicabilityはcurrentのままclass→contract relationだけを欠落させる単独fixture CASE-HARNESS-L10-044-r14-class-contract-relation-missingを追加。044-04からoracle欠落CASEとrelation欠落CASEを別個に直接参照。FR AC-044-01 censusへ追加。戻し先の新設なし。
- **m1**：038-r09-006のFR traceをAC-038-03へ一致。FVの038-03索引へ実fixtureを追加し、038-05索引から除去。CASE ID保持。
- **m2**：040のledger/pair契約不足・stale・混在revisionは固定L2:954のHARNESS L1/L2契約owner表記へ統一。authority-reference/L2合意/L3 approval不足だけをauthority ownerへ送り、identity不明時unknownを維持。
- **m3**：044 contract revision欠落を固定L2:1010のHARNESS-L2-026既存設計契約ownerへ一本化。022宛先の併記を除き、日本語化。
- **m4**：041-01 indexがAC-01のactive-version staleとtarget-scope stale実fixtureを直接列挙。元CASE不変。
- **m5**：054-02見出しから実ID列挙に含まれないHARNESS assignment境界を除去。assignment/起動境界は054-03に保持。
- **m6**：旧review13監査で空だったAC-HARNESS-L3-044-04定義pinを、review14対象本文faab112のFR:704と修正本文75b7979のFR:704から再計算し、旧監査を変更せず本記録へ固定する。
- **m7**：review11 Markdownの未展開8箇所と派生差分値を対象git objectから再計算。本記録の実値を使用し、旧Markdownを変更しない。旧時点selected1036と現時点1037を区別する。
- **m8**：039-r09-006を039-root-05-axis-1-missing（real-data evidence単独欠落）の別名索引として保持し、独立変異・coverage countに数えない。039-02 indexラベルとFR AC-039-02 traceを同期。
- **m9**：047 source/contract/obligation不足の戻し先を固定L2:1049のHARNESSまたは要求ownerへ統一し、入力source owner identityを明記。特定不能時unknownを保持。OS-owned restart conditionsはOS ownerに残す。
- **m10**：prototype operability・walkthrough scope/revision不一致はHARNESS-L2-024既存agreement routeへ戻す。selected verification duty/pair oracleそれ自体の別欠陥のみ005/022へ戻す。
- **m11**：046 exception単独変異のbaselineにexception conditionとそのoracleが適用中であることを明記。他11条件/oracleもcurrentのまま、mutationはexception conditionだけ。
- **m12**：L2-041の要素別obligation対応、固定L11:705の誤抽出例、L11:713 MPR-RC-HARNESS-L2-041-003の複合atom拒否oracleを区別してAC-041-04へ記載。誤locatorと705への原子性誤帰属を訂正。
- **m13**：034-01 primary indexからindexである034-04を除去。047-03 primary indexからsame-worker-verifier alias indexを除去し、既に列挙されたidentity/context/authority各単独fixtureを保持。
- **m14**：054-01のtask/assignment crosswalk見出しとidentity/revision mismatch labelを日本語にした。変異軸と参照先は保持。

Root検収で戻した4残差（047 task/process/oracleの21行、039 trace重複、044の2oracleの区別、041の固定L11根拠）も補正済み。詳細のCASE/FR pin・原句・SHAは同名JSONへ固定する。

旧監査は変更しない。旧FR:704空pinとreview11 Markdownの未展開8箇所は対象revisionの実値で補う。歴史対象FV1567／selected1036／非選択531と、現本文FV1756／Stage3選択1037を区別する。

6本文はmain prefixにbyte一致。CASE定義1813件は一意（FV1756/NFR57）。Stage3FV1037件、既存ID削除0、追加1。索引候補126件、索引参照循環0、欠落参照0。これらは被覆数・独立fixture数・実行結果ではない。固定source既読67pinのfull/span/literalを再計算し、追加4spanを再読・固定した。

静的検証：govcheck 7622/57/58、scfctl validate147/fail0、stale0、residuals0、diff-check成功。旧runtime/test/CIは実行していない。L3承認・実装許可・merge admissionは生成しない。
