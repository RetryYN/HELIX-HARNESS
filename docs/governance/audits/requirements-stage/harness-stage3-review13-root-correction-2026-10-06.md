# HARNESS Stage3 review13 Root補正追補

作成側Rootの差分読解・固定親/旧source照合・過去監査訂正の時点記録。独立review・承認・全所見解消は未成立。旧記録は不変。

本文revision `faab11205c098c193c75dc94ba16e257bad99708`、main `6008fb947c73466c11084474b0e938d76e912fb7`、main統合 `d1d6fd3696fa2cfc57f43a424f7b30b72353aaee`。六本文SHA/main prefixと67固定/旧source full/span/bounds/literalをGit rawで再照合した。正式review13 6007218349とFable6007221835、前回6005914508/6005950336の原文byte/SHAをJSONに固定する。

## 現時点の処置

- **M1**: 041/042 AC-04定義行を復元し、既存CASE traceと条件を維持。 対象: AC-HARNESS-L3-041-04, AC-HARNESS-L3-042-04。
- **M2**: 044 AC-04の戻し先を固定L2-044要求ownerへ合わせた。 対象: FR/ACまたは過去監査訂正（JSON参照）。
- **M3**: 040完了根拠不足をauthority ownerへ戻し、特定不能時unknownを保持。 対象: CASE-HARNESS-L10-040-r10-completion-inference。
- **M4**: 041-r09-002を未見template revisionの無変異正常例へ戻した。 対象: CASE-HARNESS-L10-041-r09-002。
- **M5**: 046 exception CASEをexception条件だけの単一変異にし、oracleは保持。 対象: CASE-HARNESS-L10-046-r10-exception-missing。
- **M6**: 049のscreen ID/revision、prototype agreement、状態推定を原因別ownerへ分離。 対象: CASE-HARNESS-L10-049-05, CASE-HARNESS-L10-049-06, CASE-HARNESS-L10-049-08, CASE-HARNESS-L10-049-15, CASE-HARNESS-L10-049-root-screen-id-missing。
- **M7**: 049 permission不足を固定L2-049の既存境界へ揃え、owner不明はunknown。 対象: CASE-HARNESS-L10-049-r09-003, CASE-HARNESS-L10-049-r09-030。
- **M8**: 039 real-data evidence欠落を単独化し、人間評価CASEを別に保持。 対象: CASE-HARNESS-L10-039-r09-006, CASE-HARNESS-L10-039-root-05-axis-1-missing, CASE-HARNESS-L10-039-root-05-axis-7-missing。
- **m1**: 038の自己参照routeを除き、source再観測・段階未完・trace先を固定句へ。 対象: CASE-HARNESS-L10-038-r09-002, CASE-HARNESS-L10-038-r09-004, CASE-HARNESS-L10-038-r09-006, CASE-HARNESS-L10-038-15, CASE-HARNESS-L10-038-16, CASE-HARNESS-L10-038-r11-heading-stage-skip, CASE-HARNESS-L10-038-r11-as-is-before-observation-contract。
- **m2**: 038索引のIDを実在caseへ訂正し、AC-03/05の帰属を同期。 対象: CASE-HARNESS-L10-038-03, CASE-HARNESS-L10-038-r04-later-artifact-not-created, CASE-HARNESS-L10-038-r09-006。
- **m3**: 034-19をindexとし、continuity/unseen-normal主fixture参照を整理。 対象: CASE-HARNESS-L10-034-19, CASE-HARNESS-L10-034-28, CASE-HARNESS-L10-034-r11-result-continuity-after-method-change, CASE-HARNESS-L10-034-r11-unseen-provider-non-ai-normal。
- **m4**: 034-19/28の索引ACを保存11条件AC01と結果継続/未見正常AC04へ分け、FR trace同期。content-oracle/target-revisionをAC04へ同期。5列headerに合わせFR/ACを同一cellへ整形。 対象: CASE-HARNESS-L10-034-19, CASE-HARNESS-L10-034-28, CASE-HARNESS-L10-034-r10-content-oracle-missing, CASE-HARNESS-L10-034-r10-target-revision-missing。
- **m5**: 034-03を既存secret/PII/agreement/acceptance/execution CASEへの索引とし、存在しないgoal-change ID列挙を除いた。 対象: CASE-HARNESS-L10-034-03。
- **m6**: 039 UX evidenceの戻し先を条件別に揃え、UI-N/A変異を明確化。 対象: CASE-HARNESS-L10-039-root-05-axis-1-missing, CASE-HARNESS-L10-039-root-05-axis-2-missing, CASE-HARNESS-L10-039-root-05-axis-3-missing, CASE-HARNESS-L10-039-root-05-axis-4-missing, CASE-HARNESS-L10-039-root-05-axis-5-missing, CASE-HARNESS-L10-039-root-05-axis-6-missing, CASE-HARNESS-L10-039-root-05-axis-7-missing, CASE-HARNESS-L10-039-root-05-ui-na, CASE-HARNESS-L10-039-r10-axis-na, CASE-HARNESS-L10-039-r09-006。
- **m7**: 034/038のNV行に対応CASE IDを記録。 対象: CASE-HARNESS-L10-034-r11-condition-01-missing, CASE-HARNESS-L10-038-r11-reject-without-basis。
- **m8**: 040 L2 agreementの戻し先を一つにし、unknownを保持。 対象: CASE-HARNESS-L10-040-r10-l2-agreement-inference。
- **m9**: 040 ledger-contract route語句を固定L2:954へ統一。 対象: CASE-HARNESS-L10-040-r09-002, CASE-HARNESS-L10-040-r09-003, CASE-HARNESS-L10-040-r09-004, CASE-HARNESS-L10-040-r09-005, CASE-HARNESS-L10-040-r09-006, CASE-HARNESS-L10-040-r09-007, CASE-HARNESS-L10-040-r09-008, CASE-HARNESS-L10-040-r09-010, CASE-HARNESS-L10-040-r09-011, CASE-HARNESS-L10-040-r09-012, CASE-HARNESS-L10-040-r09-013, CASE-HARNESS-L10-040-r09-014, CASE-HARNESS-L10-040-r09-015, CASE-HARNESS-L10-040-r09-016, CASE-HARNESS-L10-040-r10-mixed-revision-coverage。
- **m10**: 044-r09-002のdesign contract revision欠落は固定L2:1010の既存design contract/pair oracle owner（026/022）へ返し、template/applicability不足の009と分ける。 対象: CASE-HARNESS-L10-044-r09-002。
- **m11**: NV-043-02へoracle-unboundの完全CASE IDを追加。 対象: CASE-HARNESS-L10-043-r04-oracle-unbound。
- **m12**: 040/041/043/044 indexのAC範囲と直接CASE参照をFR mapへ同期。 対象: CASE-HARNESS-L10-041-01, CASE-HARNESS-L10-041-02, CASE-HARNESS-L10-041-03, CASE-HARNESS-L10-041-04, CASE-HARNESS-L10-043-01, CASE-HARNESS-L10-040-02, CASE-HARNESS-L10-040-04, CASE-HARNESS-L10-044-02, CASE-HARNESS-L10-044-01, CASE-HARNESS-L10-044-04, CASE-HARNESS-L10-044-07。
- **m13**: 049-06をalternative-IDのAC-04へ戻し、FR mapを同期。 対象: CASE-HARNESS-L10-049-06。
- **m14**: 047/046 indexが中間indexでなくprimary fixtureを直接参照。 対象: CASE-HARNESS-L10-047-06, CASE-HARNESS-L10-047-44, CASE-HARNESS-L10-046-07, CASE-HARNESS-L10-046-r10-exception-missing。
- **m15**: 054-03の見出しをHARNESS assignment/start境界へ修正。 対象: CASE-HARNESS-L10-054-03, CASE-HARNESS-L10-054-r10-harness-assignment-start, CASE-HARNESS-L10-054-r11-harness-worker-start。
- **m16**: 054-02 indexと054-04 digest-missing参照をAC別に整理。 対象: CASE-HARNESS-L10-054-02, CASE-HARNESS-L10-054-r04-contract-digest-missing。
- **m17**: 047 field別戻し先と049 design ownerを固定L2へ揃え、unknownは保持。 対象: CASE-HARNESS-L10-047-r09-023, CASE-HARNESS-L10-047-r09-024, CASE-HARNESS-L10-047-r09-025, CASE-HARNESS-L10-047-r09-026, CASE-HARNESS-L10-047-r09-027, CASE-HARNESS-L10-047-r09-028, CASE-HARNESS-L10-047-r09-029, CASE-HARNESS-L10-047-r09-030, CASE-HARNESS-L10-047-r09-031, CASE-HARNESS-L10-047-r09-032, CASE-HARNESS-L10-047-r09-033, CASE-HARNESS-L10-047-r09-034, CASE-HARNESS-L10-049-r09-007。
- **m18**: 指定FV/NV行の英語説明を日本語化し条件は維持。 対象: CASE-HARNESS-L10-039-01, CASE-HARNESS-L10-039-02, CASE-HARNESS-L10-034-03, CASE-HARNESS-L10-047-r09-023, CASE-HARNESS-L10-047-r09-034, CASE-HARNESS-L10-047-r09-024, CASE-HARNESS-L10-047-r09-025, CASE-HARNESS-L10-047-r09-026, CASE-HARNESS-L10-047-r09-027, CASE-HARNESS-L10-047-r09-028, CASE-HARNESS-L10-047-r09-029, CASE-HARNESS-L10-047-r09-030, CASE-HARNESS-L10-047-r09-031, CASE-HARNESS-L10-047-r09-032, CASE-HARNESS-L10-047-r09-033。
- **m19**: 監査のreview12 evidence/change転記・過大な完全一致主張を新recordで訂正。 本新時点記録のhistorical_correctionsで具体訂正し、旧記録は不変。 対象: FR/ACまたは過去監査訂正（JSON参照）。
- **m20**: Rootが正式finding原文、個別の具体処置・実CASE行/SHA・固定source参照を記録した。旧定型dispositionの証拠性は撤回し旧bytes不変。 対象: FR/ACまたは過去監査訂正（JSON参照）。
- **m21**: 旧individual分類の過大解釈を撤回。現Stage3は1036定義、125索引候補、他911は個別または未分類と区別。索引参照欠落0/cycle0を構造だけとして記録。 対象: FR/ACまたは過去監査訂正（JSON参照）。
- **m22**: Fable追記の来歴と049既存owner境界を新記録へ引継ぎ。 本新時点記録のhistorical_correctionsで具体訂正し、旧記録は不変。 対象: FR/ACまたは過去監査訂正（JSON参照）。
- **m26**: 過去review11監査の未展開値は旧recordで保持し、実値は新追補にのみ記録。 本新時点記録のhistorical_correctionsで具体訂正し、旧記録は不変。 対象: FR/ACまたは過去監査訂正（JSON参照）。

## 過去記録の訂正

- **m19**: 旧review12_findingsのevidence/change分割は32件で末尾複写、M12/m25の矢印で誤分割。新記録では正式comment raw bodyとfinding全文行を保持し自動evidence/change分割を使わない。旧1036 CASE/AC対応の一致は定義行↔対応表の同型一致だけで、AC定義の存在/意味・索引参照実在を保証しなかった。AC04104/04204欠落と038danglingを見落とした。旧完全一致の意味被覆への過大解釈を撤回。
- **m20**: 旧source_text_case_ids空配列と全件定型dispositionは処置の具体証拠ではない。新所見別処置は実CASE/AC/source/pinと操作を記録し、作成側補正を独立closureとしない。
- **m21**: 旧selected_case_inventoryのindividual表記は索引/aliasを実行fixtureと誤分類。現1036定義を125索引候補と他911（個別または未分類）に分け、normal/単独変異の全分類・独立fixture数は主張しない。旧AC帰属とF-m34locatorを個別訂正する。
- **m22**: Fable6005950336 m38とreview12 m36の出典を新記録へ固定。049最小入力は固定L2:1078/1090、利用許可不足は要求意味の既存上流owner、設計/チェックoracle/profile不足は既存design owner、検査精度はLABO。prototype agreement不足だけ024。022/034の一般oracle/性能routeをこの最小入力へ追加しない。
- **m26**: 旧MD未展開placeholderを残したまま新追補に実値を固定。旧recordのbyteは変更しない。旧時点FV1567/六1619と現行件数を混同しない。

旧m21の054 assignment/start帰属はAC03のr10/r11で、05402はAC02 unknown/defer索引。旧F-m34の返却はL2:1049、無関係task並列は固定L11 5b8f4a7:780（781は昇格反例）。m26旧placeholderの実値はBODY db7c29731c52917bf74d94bb5961ffc8925d884a、WHEAD a9f6e4e8ba0c3e5b1ffbf28b37e2211379b5547b、BASE 190d23aac79ee24b78e3666aae5506a5d85a45b5、review11原文SHA772f1932bca3477b70a724dd9865af7683092f509cb15fc08696badf881a32d9/14753 bytes。旧1567/1619件は当時の範囲であり現件数へ継承しない。

## 件数・参照と限界

現FV全定義1755、Stage3対象13親1036、別NFR57。FVとNFRを合わせた定義数1812は独立fixture数ではない。Stage3索引候補は日本語「索引」106行と独立非計数表記19行の125候補。他911は個別または未分類。旧115は抽出漏れを含む旧値として保持し現125を明示ruleで訂正する。参照欠落0・循環0。044-01の中間索引参照を除き、044-04/07は実fixtureへ直接参照する。

Rootが初回差分28chunk、残差17chunk、header補正、循環補正を全Read。途中の6列記載は現5列へ追補訂正した。旧途中処置/SHAはhistorical欄に限定し、現在の1036行raw-LF/SHAと各所見の行pinを別欄に固定した。静的確認はgovcheck成功・scfctl147/0、stale0、residuals0、diffcheck成功。旧runtime/test/CI/Bun未使用。構造・hash・件数から意味被覆/実行/承認を生成しない。

詳細pin・正式原文・具体歴史訂正は隣接JSON（SHA-256 `8ae16c83cd100866b73fcd834e4c04f9d955e789fc29c5b73e78745e3a62e852`）へ固定する。
