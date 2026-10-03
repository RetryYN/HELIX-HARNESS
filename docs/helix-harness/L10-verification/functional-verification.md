# HELIX-HARNESS L10 機能総合検証設計（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 + Stage 2a + Stage 2b(HARNESS-L2-012..020, 024) + Stage 2c(HARNESS-L2-030..032) + Stage 3(HARNESS-L2-034,036,038,039,040,041,042,043,044,046,047,049,054) + Stage 4(HARNESS-L2-026..029) / version_class 1.0
paired_l3: ../L3-requirements/functional-requirements.md
execution_status: designed_only_not_executed

本書は[対のL3機能要件](../L3-requirements/functional-requirements.md)が定義したStage 1/2a/2b/2c/3のACを、固定revision・宣言scopeでシステムとして照合する設計である。これは実施結果ではなく、L3承認、実装、実行、releaseまたは利用者acceptanceを生成しない。L3にないACや新しい要求を本書から追加しない。

## 照合対象revision

- L2/L11固定親：`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- L2全文SHA-256：`aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`。
- L11全文SHA-256：`09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。
- L3をPO承認対象とする場合は、L3文書と本L10の同じexact revisionを指定してから判定する。承認recordや実装証拠はまだない。

Stage 2b parent-to-source pin（633bf12時点の固定PO決定。後続register metadataは採択・承認を追加しない）：

| 親 | L2固定span | L11固定span | PO決定位置 |
|---|---|---|---|
| `HARNESS-L2-012` | 363–370 / `ed26f576f8ddd5d6b83d912abfec6ec346d6aa768d631909b72273fd144bd59b` | 207 / `37367ceafecde02c85371205b5cb76bb8b443e32fbc2d414ab7f531ddb818f77` | 2026-09-28 判断記録 #L41、registration `MPR-RC-HARNESS-L2-012-001`、semantic `ebdb183eee98909a5777eaf4602423bd43698669013b2d1538de8f29626728b2` |
| `HARNESS-L2-013` | 371–378 / `1cf32e08f16ebb09c7d24e731a33cb906f9ddcb4f869f427f8c49481873ed771` | 208 / `38617c490b55cc9b454e06826d180730405eae38e0be13be828b462d96ebdde2` | 判断記録 #L42、`MPR-RC-HARNESS-L2-013-001`、`11dccf3f73803f4cd0950c51328c755b5492cdaa720ce86c0cd9aefcd2e11f49` |
| `HARNESS-L2-014` | 379–386 / `fb8557ae7b84b31b939093490e1571d17a7b2995c6db30a4060dda10c0e284b4` | 209 / `0e4c38f8d57ace3c270459b5523add19e0ed2a5285d848d17d0d16ae698c0491`; 274–281 / `7dda1fcb2426ed0e7139014aebd5b66d96f26897b81dfbbedf969d343d0c3822` | 判断記録 #L43、`MPR-RC-HARNESS-L2-014-003`、`eca6896fa86d4a929ac767cdeb81453c733f42db0d772b416bef5d97a5937dc9` |
| `HARNESS-L2-015` | 387–394 / `4c7fb6b87c9dd4664dc0383cfd150d20a0bd53ef1e1ed0f7439ce4a95208ac5c` | 210 / `1511994df9b3b53d62ab501d2fd0d18be14f54fb7389999f37cc3e1b58c29697`; 282–289 / `650a26dbc3432f820aba6ae026a80bf6a3e4f7ac606a43ec12abeb36010dd6b0` | 判断記録 #L44、`MPR-RC-HARNESS-L2-015-004`、`d528e724da205072383a97c4dadf6ece9fb95f2ff2152eb5a5d1bd416029f601` |
| `HARNESS-L2-016` | 395–402 / `084dd154969beffb5c67255adcce3be4f5a483e8e89822dabf83ab82ea974198` | 211 / `e3504f1082accfe91305568a552939628333db0a1c7d28f1d709082b281d3639`; 290–297 / `373e8f1cbbb8d431ea9f11af3ddff097ddaa8d063abd3387e561364452967873` | 判断記録 #L45、`MPR-RC-HARNESS-L2-016-004`、`3abd8cdd1df5335a87848fcd7c232708dfd6611a5c0e78083962c33e41990e26` |
| `HARNESS-L2-017` | 403–410 / `a0f17d12b26f7dd7c5f4f52767ae06fae8b32c4f31c156d04d3538b77edba2fb` | 212 / `dd093988f8f43e946d56f3837c6fac2753b2d40f1a8f5bfcfb8a494d43dd4f5d` | 判断記録 #L46、`MPR-RC-HARNESS-L2-017-001`、`623b91b59a5cf09055e8604c3c84aebfe9428b86f950a0bcb2a9c1605d710d17` |
| `HARNESS-L2-018` | 411–418 / `97d4f669fb90eea59a8909a2c5b482a8b438018ab219dd6279e526ae49a89b17` | 213 / `95a19c6b40416224eb1ba001d975ef1a13a49f20e106b2ac1c759d5268ba8a7c` | 判断記録 #L47、`MPR-RC-HARNESS-L2-018-001`、`3497158cd4b39bb9059c20f9cfe2c0a647181e3dd566ff0d247ad5f4d5fc4671` |
| `HARNESS-L2-019` | 419–426 / `0f50a16bcb31791e5d27f784a0d97f8142f41559d957b12713e19f1ab80d7609` | 214 / `272a6649b26e16d38a8679a36832e3aa621a46373b6beb73c9847969d5a1af89` | 判断記録 #L48、`MPR-RC-HARNESS-L2-019-001`、`7bd3d180259af1febe50e013eea5aa5609d5af3c28ce89191c4670f3e8c88000` |
| `HARNESS-L2-020` | 427–437 / `28980b6713714debd1aab0c83c83f025ca415209427e9f7a657e624af305b4b3` | 215 / `4f46adcdb07a0f5a2cb2c0ac54e39a6a6856b9e908570e3826dc4ddaa9204a3d` | 判断記録 #L49、`MPR-RC-HARNESS-L2-020-001`、`d68ecbe2512b45f6f4c09cf395bd05b164a8243997f954e5459d42b29c69de7d` |
| `HARNESS-L2-024` | 499–525 / `ec4ece6e411152941c16cd8dc25a1c43613dff5e6b5c3051ef675c66c8b9b2cc` | 240 / `2d467ab867ac41999f53f70055f15ad1a129a44e2a04724074bcf7ae7584bf9e` | 判断記録 #L53、`MPR-RC-HARNESS-L2-024-001`、`b8e45ca6df9bd498f9a385d33b3c3dfb96e367d31fb91c434a23bf848e98b2a8` |

## L10共通の試験設計

各caseは合成fixtureを用い、固定L2/L11、L3 AC ID、pack identity/version、dependency/contract版、入力scope、期待oracleを事前に結ぶ。正常系、誤りを含む系、unknown/staleまたは未観測系を分ける。出力fieldやtraceの存在だけでは合格にしない。実測不能、親revision不一致、入力不足、oracle不一致は成功へ丸めず「未評価／保留」または不合格の理由を記録する。

外部通信、実credential、実データ、DB変更、deploy/release、実Worker dispatchを実施する設計ではない。将来実行時も各fixtureに適用する既存SECURITY authorityとscopeを入力として照合する。HARNESSは権限を発行せず、OS ticket/assignmentや利用者受入を代行しない。

## AC別の総合検証

### Stage 2b AC別の総合検証

各caseは合成fixtureによる設計oracleであり、旧runtime/testや外部targetを実行しない。正常・反例・未見正常を同じ親契約の範囲で比較し、未提示入力は勝手に補完せずunknown／未評価へ置く。親が単独利用を認める工程に他工程の起動を前提条件として足さない。

| L10 case ID | L3 FR ID | AC ID（L3正本） | fixture・観測点 | 合格材料 | 反例／未評価の扱い |
|---|---|---|---|---|---|
| `CASE-HARNESS-L10-012-01` | `FR-HARNESS-L3-012` | `AC-HARNESS-L3-012-01` | UI要求と別の技術不確定点を入力し、Prototype成果・合意とPoC証拠・成立結果を個別に変更する。 | 各結果が異なる要求backflowと同revisionへ結ばれ、片方の結果で他方を完了扱いしない。 | Prototypeだけ／PoCだけの欠落をもう片方で補えば不合格。対象契約を固定できない場合は未評価。 |
| `CASE-HARNESS-L10-012-02` | `FR-HARNESS-L3-012` | `AC-HARNESS-L3-012-02` | 非UI＋PoC適用、UI適用＋PoC不要、両方不要の3 fixtureを用意し、各N/Aから理由・判定者・HEAD・影響・再評価条件を一つずつ除く。 | 適用性は独立して記録され、完全なN/A receiptがある場合のみその評価を省ける。 | UI非適用をPoC非適用へ連鎖、または欠落receiptを暗黙N/Aとすれば不合格。 |
| `CASE-HARNESS-L10-012-03` | `FR-HARNESS-L3-012` | `AC-HARNESS-L3-012-03` | 結果に未解決要求を残したfixtureと、backflow→2次形成→未決Decideのfixtureを入力し、要件化／production昇格を試す。 | 未解決状態では停止し、Decide前にproduction成果を生成しない。L2-019由来の既存要求でも同じ判断をする。 | 段階番号だけで他の工程を追加要求したら不合格。 |
| `CASE-HARNESS-L10-013-01` | `FR-HARNESS-L3-013` | `AC-HARNESS-L3-013-01` | scopeを満たす正常な未知requirementと、欠落・矛盾・重複・企画外追加・non-goal逸脱を個別に投入する。単体・接続・構成体の3入力は別identityとすべき例も与える。 | 正常な未見内容は入力根拠から形成し、異常はそれぞれ対象箇所・影響・戻し先を示す。3 requirement kindが別identityに保たれる。 | 複数異常を一般errorへ潰す、または3 kindを一つのidentityへ混合すれば不合格。 |
| `CASE-HARNESS-L10-013-02` | `FR-HARNESS-L3-013` | `AC-HARNESS-L3-013-02` | 1次形成からPrototype/PoC結果反映後への差分、N/A結果、未知を与えて要求版と残存unknownを照合する。 | 形成段階・入力結果・影響が別版へ追跡され、未知を推測で補わない。 | 1次形成を2次形成として扱う、またはN/A根拠を捏造すれば不合格。 |
| `CASE-HARNESS-L10-013-03` | `FR-HARNESS-L3-013` | `AC-HARNESS-L3-013-03` | L2/L11とL3/L10各pairが揃う入力に、別途承認recordがない状態を与える。 | pair/traceは確認されてもapproval/authorityはpendingのまま。単体要求である親の依存範囲を保つ。 | pair生成から自動承認を出せば不合格。 |
| `CASE-HARNESS-L10-014-01` | `FR-HARNESS-L3-014` | `AC-HARNESS-L3-014-01` | kind/target/configuration/risk/domainに合うtemplateと各L4/L5/L6・L9/L8/L7出力、template必須入力の欠落を与える。 | 義務が要件へ遡れ、検証設計も各設計出力と対応し、欠落は質問として出る。 | 義務・検証対がtemplate/要件へ遡れない場合不合格。 |
| `CASE-HARNESS-L10-014-02` | `FR-HARNESS-L3-014` | `AC-HARNESS-L3-014-02` | templateの要求意味変更、kind違いの再利用、下位義務だけで上位義務を満たす変異を一つずつ入力する。 | 変異箇所を特定し上流backflowを返す。 | templateやBRAIN connectorが要求を確定した場合不合格。 |
| `CASE-HARNESS-L10-014-03` | `FR-HARNESS-L3-014` | `AC-HARNESS-L3-014-03` | connector由来templateのsource/revisionあり・欠落を比較し、template本文のみからL3承認を要求する。 | source/revisionは追跡され、templateのみでは承認状態が変わらない。 | source不明を信頼済み扱い、または承認生成なら不合格。 |
| `CASE-HARNESS-L10-015-01` | `FR-HARNESS-L3-015` | `AC-HARNESS-L3-015-01` | L6契約の正常ケースと契約境界の未見正常を選び、Red失敗→Green→局所refactor→原子CI evidenceを一つずつ追跡する。 | 各証拠が同じ変更revisionに対応し、契約oracleを満たす正常な未見入力も許容する。 | sequence/evidence欠落または親oracle違反は不合格。 |
| `CASE-HARNESS-L10-015-02` | `FR-HARNESS-L3-015` | `AC-HARNESS-L3-015-02` | refactor時にpublic contract、要求、architecture、state意味の各々を一箇所ずつ変える。 | 意味差分をrefactor成功へ隠さず対応する設計／要求ownerへ戻す。 | local refactorの名目で差分を保持すれば不合格。 |
| `CASE-HARNESS-L10-015-03` | `FR-HARNESS-L3-015` | `AC-HARNESS-L3-015-03` | ticketに関係する検査を全実施するfixtureと一部省略するfixture、CI passのみのfixtureを比較する。 | 省略分が記録されProvisionalを超えず、CI運転のownerがOSまたは利用者環境のまま。 | CI passのみで品質／Accepted／releaseへ昇格したら不合格。 |
| `CASE-HARNESS-L10-016-01` | `FR-HARNESS-L3-016` | `AC-HARNESS-L3-016-01` | refactor前後のcontract、要求、architecture/stateの意味項目を対応比較する。 | 全意味項目が保持された差分だけ通常refactor候補となる。 | 観測不能な項目は成功でなく未評価。 |
| `CASE-HARNESS-L10-016-02` | `FR-HARNESS-L3-016` | `AC-HARNESS-L3-016-02` | L5契約、L4境界、L3/L2要求、L1製品価値を別々に変更する入力を用意する。 | 各差分を対応するbackflow先へ分類し上流authorityを保持する。 | 一律にHARNESS内で書き換える、または正常な意味保持refactorを拒絶すれば不合格。 |
| `CASE-HARNESS-L10-016-03` | `FR-HARNESS-L3-016` | `AC-HARNESS-L3-016-03` | performance fixtureでbaseline・budget・workload・profile・統計条件・回帰oracleを一つずつ欠落させ、全て揃うcaseと比較する。 | 欠落時は比較未評価、揃った場合は候補thresholdと実測を区別して判断する。 | 根拠のない数値を旧sourceから転記、または数値候補一律禁止なら不合格。 |
| `CASE-HARNESS-L10-017-01` | `FR-HARNESS-L3-017` | `AC-HARNESS-L3-017-01` | 同revision/scopeでVerified/Accepted、Release Port条件を満たす通常成果と外部持込成果を与える。 | 両入力とも必要証拠が揃えば同一criteriaでeligible候補となる。 | 出所だけで正常外部成果を拒否すれば不合格。 |
| `CASE-HARNESS-L10-017-02` | `FR-HARNESS-L3-017` | `AC-HARNESS-L3-017-02` | 未回収検査、条件欠落、revisionずれ、artifact identityずれを一項目ずつ変異する。 | それぞれ停止し、不足または不一致の特定項目を返す。 | CI greenや別artifactのevidenceで補えば不合格。 |
| `CASE-HARNESS-L10-017-03` | `FR-HARNESS-L3-017` | `AC-HARNESS-L3-017-03` | 同じ入力を再構成しartifactを比較。rollback先を欠落させるcase、およびDeployedだがObserved evidenceのないcaseを与える。 | 再現性とrollback条件を区別し、Observedへ自動昇格しない。 | harness L2-017をHELIXの内部stage runtimeへ結びつけるか、配備実行を要求するなら不合格。 |
| `CASE-HARNESS-L10-018-01` | `FR-HARNESS-L3-018` | `AC-HARNESS-L3-018-01` | owner承認済み運用要求と適用/N/A/unknown各状態、配備済みrevisionを与え、owner/evidenceを一つずつ欠く。 | 適用状態と観測設計がrevision・ownerへ結び付き、欠落unknownを明示する。 | 文書だけで運用済み、またはunknownをsuccessなら不合格。 |
| `CASE-HARNESS-L10-018-02` | `FR-HARNESS-L3-018` | `AC-HARNESS-L3-018-02` | designed/implemented/verified/observed/operatedの証拠を個別に入替え、同じstageへ縮約する入力を試す。 | 状態と時点を区別し、実観測だけが観測状態を裏付ける。 | artifact/CI存在だけでObserved/Operatedとすれば不合格。 |
| `CASE-HARNESS-L10-018-03` | `FR-HARNESS-L3-018` | `AC-HARNESS-L3-018-03` | requirement不適合をownerへ戻す正常caseと、固定共通SLOがないがowner基準のあるcase、未指定基準のcaseを比較する。 | 不足はowner backflow、owner基準は保持、未指定のみunknown。 | 数値がないことだけで基準を否定または新SLOを補えば不合格。 |
| `CASE-HARNESS-L10-019-01` | `FR-HARNESS-L3-019` | `AC-HARNESS-L3-019-01` | 各stage由来の十分なsource/revision付き成果を与え、少なくとも一つの未見stage入力も含める。 | 変換可能範囲をpair/traceへ変換し、未見入力も親の入力条件を満たせば処理する。 | 最初のstage経由を強制、または無根拠な全面拒否は不合格。 |
| `CASE-HARNESS-L10-019-02` | `FR-HARNESS-L3-019` | `AC-HARNESS-L3-019-02` | source/revision/owner/意味を一つずつ欠落・矛盾させる。 | 変換不能箇所と理由を分けてunknownとして保持する。 | 暗黙補完し正常要求化したら不合格。 |
| `CASE-HARNESS-L10-019-03` | `FR-HARNESS-L3-019` | `AC-HARNESS-L3-019-03` | 完成したpair候補にapproval, implementation, release status入力を与えず、各権威状態を問う。 | 草稿状態のままで既存artifactのauthorityは不変。 | reverse変換が承認・releaseを生成したら不合格。 |
| `CASE-HARNESS-L10-020-01` | `FR-HARNESS-L3-020` | `AC-HARNESS-L3-020-01` | 隣接するproducer/consumer契約の互換版、同一artifact/revision、双方ownerとrequired evidenceを与える。未完検査・unknown・人判断待ちも一件ずつ含める。 | field対応とhandoff責務が追跡可能で、未完義務が同じ項目とownerで下流へ保持され、完了扱いされない。 | unrelated stageを直列必須化、未完義務を落とす、引継ぎだけで閉じれば不合格。 |
| `CASE-HARNESS-L10-020-02` | `FR-HARNESS-L3-020` | `AC-HARNESS-L3-020-02` | contract versionずれ、必須field欠落、artifact/revisionずれ、許容未知fieldを比較する。別fixtureでは前stage実行なしの外部成果にL2-019相当のcontract入力を与える。 | 各不一致の具体位置を示して保留し、許された未見fieldと同契約を満たす外部成果は拒否しない。 | 暗黙version変換、単一汎用errorで差異消失、正常未見fieldまたは条件適合外部成果拒否はいずれも不合格。 |
| `CASE-HARNESS-L10-020-03` | `FR-HARNESS-L3-020` | `AC-HARNESS-L3-020-03` | source/consumer authority-stateを比較し、④ Provisional成果を⑥へ渡すnegative、HARNESS-L2-022 Verified/Acceptedに至った成果のpositive、上流意味変更fixtureを与える。 | Provisionalは停止し、L2-022条件を満たす成果だけが受渡し候補。状態不変で意味変更はbackflow ownerへ返す。 | handoff成功をrelease/全stage完了とすれば不合格。 |

case IDは `CASE-HARNESS-L10-<親番号>-<連番>`。AC IDはL3正本の `AC-HARNESS-L3-<親番号>-<連番>` をそのまま参照する。両IDの機構prefix・親番号を一致させ、ACの再定義はしない。

| L10 case ID | L3 FR ID | AC ID（L3正本） | fixture・観測点 | 合格材料 | 反例／未評価の扱い |
|---|---|---|---|---|---|
| `CASE-HARNESS-L10-010-01` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-01` | pack宣言にidentity、version/maturity、input/output contract、依存identity/版、verification scope/oracle、単一owner class（release unit／component／core）、収載／非収載、release unit版、統合製品版を用意。欠落依存、複数owner、未検証packの反例も与える。 | pack・release unit・製品の版が別々に追跡され、ownerと収載が一意。未完の上位構成が適格packを隠さず、宣言外依存や暗黙収載もない。 | 宣言欠落・複数owner・版の混同は不合格。比較不能はunknownとして未評価。 |
| `CASE-HARNESS-L10-010-02` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-02` | 基準pack集合のうち一つだけを別revisionへ差替え、前後の全pack identity/version/evidenceを比較。 | 対象packだけが予定どおり変化し、対象外packの版・証拠差分0件。 | 対象外差分が一件以上なら不合格。意図した複数pack更新は単一pack比較に混ぜない。 |
| `CASE-HARNESS-L10-010-03` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-03` | 同一input・pack版から成果物を再生成し、失敗fixtureでは直前の適格版／明示replacementを与える。上位構成未完のまま適格packが見える状態と、交換不能な巨大packも観測。 | 成果物が一致し、復帰先を特定できる。適格packは上位未完でも示され、pack成功から上位昇格は起きない。巨大packはDesign-refactorへ戻される。 | 差分、復帰先不明、packからの上位昇格、または巨大packを交換可能と誤判定すれば不合格。 |
| `CASE-HARNESS-L10-011-01` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-01` | GUI、特定画面、local path、特定provider、CI製品を入力環境から除いたcontract call fixture。能力名とcontract/dependency版を明示し、未対応版も与える。 | 宣言contractのみで呼出しが記述でき、対応版で出力形が一致。未対応版を黙って読み替えない。 | 特定UI／provider／CIが必須なら不合格。未対応版の自動代替も不合格。環境条件が未提示なら未評価。 |
| `CASE-HARNESS-L10-011-02` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-02` | 有効な既存SECURITY authorityとproject／tenant／environment scopeをfixtureとして与え、同じ入力でscope外targetと未渡し権限の反例も与える。実credentialや実targetは使わない。 | 結果が入力されたscope内に制限され、authorityの発行・拡張をHARNESSが行わない。 | scope外アクセス、未渡し権限、内部DB／鍵／内部統制の共有を許すなら不合格。authority条件自体が不明なら該当operationを未評価／保留。 |
| `CASE-HARNESS-L10-011-03` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-03` | 複数progress update、終端／未完state、result/evidenceを与え、相関と呼出し元への返却、resumeに必要な内部state記録を観測。 | 全結果・証拠が同一operationへ相関し呼出し元へ返る。途中state記録はresume用に許されるが、呼出し元の結果保存・表示責務をHARNESSが引き取らない。 | 相関欠落／交差、結果未返却、呼出し元の結果保存・表示責務の移管は不合格。resume用内部state記録だけは不合格にしない。 |
| `CASE-HARNESS-L10-011-04` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-04` | operationを途中stateで停止し、同じ冪等keyで再開。expiryの前・境界・経過後の同一operation fixtureを別々に照合する。 | resumeが記録済みstateと同じlogical operationへ結び付き、再送で重複効果がなく、expiry後／中断をsuccessにしない。 | key変更による別operation扱い、途中stateの欠落を完了扱い、expired successはいずれも不合格。固定TTL・retry回数が未指定でも測定は停止しない。 |
| `CASE-HARNESS-L10-023-01` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-01` | 4 dependency class、owner、version/range、pack revision、operation/source conditionの宣言fixtureを評価。未実装依存を含むclassification-only fixture、分類欠落・曖昧の反例も与える。 | 4区分とrevision結束が保たれ、dependency implementationが未存在でもmissing/unknown分類を出力できる。 | 別区分への暗黙変換、未宣言条件の推測、missing依存をsuccess扱いすれば不合格。 |
| `CASE-HARNESS-L10-023-02` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-02` | operation条件true/false、selected/unselected source、reference-only、unknown/staleを別fixtureにする。さらにsource選択を明示的に変更した新入力を別fixtureにし、closure/state/reasonを観測。 | 必須closureと4種状態を区別。未選択sourceは未観測。選択sourceが失敗しても同じ要求のまま別sourceへ移らず、明示再選択された新入力では新しいsourceの条件を再評価する。 | unknownをfalse／optional／reference-onlyへ丸める、暗黙fallback、未選択sourceの成功推測は不合格。明示再選択を理由に拒否しない。 |
| `CASE-HARNESS-L10-023-03` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-03` | 権限・隔離・版・検証・記録が必要なsourceを人が代行するfixture、口頭のみの受領反例、後続版依存、1.0安全依存、依存unknown fixtureを評価し同じinput/revisionを反復する。 | 人代行でもsource/actor/revision/scope/受領/検証receiptが返り、口頭のみは閉包根拠にならない。分類自体はmissing/unknownを出せる。後続版を1.0へ強制せず、1.0安全依存は必須。同一評価のclosure/reason差分0。 | 必要な義務・receipt欠落、安全依存削除、unknown実行可能扱い、再評価差分は不合格。authority定義は新設しない。 |

#### HARNESS-L2-024 AC別の総合検証

| L10 case ID | L3 FR ID | AC ID（L3正本） | fixture・観測点 | 合格材料 | 反例／未評価の扱い |
|---|---|---|---|---|---|
| `CASE-HARNESS-L10-024-01` | `FR-HARNESS-L3-024` | `AC-HARNESS-L3-024-01` | 影響・不確実性・下流変更cost・人間専決度の根拠を持つ候補と、同順位項目を与える。pack revisionに結んだtie-breakあり／なしを比較し、同じ入力を再評価する。 | 順序と理由が再現され、tie-break欠落時は決定論的な順序を捏造せず未確定を返す。 | 高影響の不確実な項目を低影響表現より後にする、または入力にないweightを作る場合は不合格。十分な未知正常項目は親scope内で受け入れる。 |
| `CASE-HARNESS-L10-024-02` | `FR-HARNESS-L3-024` | `AC-HARNESS-L3-024-02` | 同一revision/scopeの既回答とopen question、新根拠のあるagreement再開、同じ質問を別表現にした新規送出をfixture化する。 | 既回答を再質問せず同じopen identityを継続し、新根拠の再開は影響itemとownerだけへ戻す。 | 新根拠なしの再質問、理由なし矛盾解消、無関係agreementまでstale化した場合は不合格。 |
| `CASE-HARNESS-L10-024-03` | `FR-HARNESS-L3-024` | `AC-HARNESS-L3-024-03` | actor/task、failure/cancel/timeout/recovery、P0/P1、defer owner/re-entry、matrix領域、iteration履歴の各条件を一つずつ欠落・unknownにし、全情報が揃い人間判断だけが残るfixtureも比較する。Prototype／非UI合意は適用あり／適用なし／適用あり未了を分ける。 | 必須形成不足は具体項目を示し、整ったdecision packetは人間確認待ちcandidateとして返す。履歴なし・少数だけで拒否せず、適用未了でもcandidate形成を返し合意pendingを保持する。 | score、質問数、iteration数、timeout、Issue/PR、OS registrationから収束・合意・承認を生成する場合は不合格。 |

### Stage 3 AC別の総合検証

| L10 case ID | FR ID | AC ID（L3正本） | 入力・正常fixture | 変異・反例 | oracle／失敗・未評価 |
|---|---|---|---|---|---|
| `CASE-HARNESS-L10-034-01` | `FR-HARNESS-L3-034` | `AC-HARNESS-L3-034-01` | L2/L11固定scopeの要求と適用metricを用意し必須field一式を対応づける。 | metric target根拠、workload、owner、probe、triggerを一つずつ欠落。 | fieldごとのtraceを照合し相殺を許さない。適用性がunknownならそのmetricは未評価。 |
| `CASE-HARNESS-L10-034-02` | `FR-HARNESS-L3-034` | `AC-HARNESS-L3-034-02` | 既決条件下の全必須metricを同revision・代表条件で測る候補packet。 | 未測定、stale、非代表環境、未達を各一つ適用。 | 欠落対象を未完に保つ。他metric greenで相殺したら不合格。正常な未見metricは根拠があれば許容。 |
| `CASE-HARNESS-L10-034-03` | `FR-HARNESS-L3-034` | `AC-HARNESS-L3-034-03` | synthetic measurement planにauthority/result recipientを結ぶ。 | secret/PIIの露出、measurementからagreement/acceptance/executionを自動作成。 | 秘密を露出せず状態を既存ownerへ返す。authority生成または秘密露出なら不合格。 |
| `CASE-HARNESS-L10-036-01` | `FR-HARNESS-L3-036` | `AC-HARNESS-L3-036-01` | selected ticket/profile内のdesign itemとtest-level観点を対応づける。 | 一観点の対応を欠落、同じ観点を別levelでも重複計上、coverage母集団不明。 | gapとoverlapを別々に列挙しunknownをzeroにしない。 |
| `CASE-HARNESS-L10-036-02` | `FR-HARNESS-L3-036` | `AC-HARNESS-L3-036-02` | localとCIで同じgate/content/version/scopeの結果を比較。 | CI側だけ欠落、旧snapshot、設定違い、別scopeへ変更。 | 適用契約不一致を同一condition passにしない。実行自体は設計対象外。 |
| `CASE-HARNESS-L10-036-03` | `FR-HARNESS-L3-036` | `AC-HARNESS-L3-036-03` | 合意済みscreen scope、L2 prototype/screen scope、design-token SSOT、screenshots、state transition定義を入力し、mock-promotion、design-token-drift、a11y-regression、visual-regression、state-transition-driftの5軸別DetectorResultを照合。 | 各軸の適用条件、oracle、入力、CI evidence relationを独立に欠落/failへ変異。 | 5軸各々のpass/failと詳細を照合し、一軸のfail/証拠欠落もscopeをfail/保留にする。画面ありでは一軸もN/A不可、画面適用性unknownは全体保留、根拠付き非画面のみ5軸適用外。 |
| `CASE-HARNESS-L10-038-01` | `FR-HARNESS-L3-038` | `AC-HARNESS-L3-038-01` | 明示選択source scopeのsource atomから現存requirement/design/test/oracleまでを上下両方向に追う。 | endpoint側からの逆引きを欠落、対象revision違い。 | 全該当endpointへの双方向relationを確認。scope外sourceを分母へ足さない。 |
| `CASE-HARNESS-L10-038-02` | `FR-HARNESS-L3-038` | `AC-HARNESS-L3-038-02` | positive closureと根拠付きN/Aを与える。 | 片edge、aggregateだけの閉包、同digest複製、根拠なしno-finding/N/Aを個別投入。 | 該当義務を未完/unknownにし、placeholderを閉包扱いしない。 |
| `CASE-HARNESS-L10-038-03` | `FR-HARNESS-L3-038` | `AC-HARNESS-L3-038-03` | source endpointが存在し後段設計/testが未作成の途中stageを与える。 | checkpoint/budget停止を完了または却下に読み替える。 | 後段を未完義務として保持し、HIL-FR-35の段階内容を飛ばせば不合格。 |
| `CASE-HARNESS-L10-039-01` | `FR-HARNESS-L3-039` | `AC-HARNESS-L3-039-01` | Experience/UI/Frontendのsource identity, scope, revisionと選択styleを与える。 | relationを一つ欠落、wrong target revision、style branch不明。 | 契約ごとのsource/target関係を照合し欠落はunknown。 |
| `CASE-HARNESS-L10-039-02` | `FR-HARNESS-L3-039` | `AC-HARNESS-L3-039-02` | PoC、implemented、ux_verifiedの各状態を別evidenceで示す正常例。 | 各証拠を個別に除去または別revisionにする。 | 後状態を推測せず、不足状態へ留める。画面適用性unknownをN/Aにしない。 |
| `CASE-HARNESS-L10-039-03` | `FR-HARNESS-L3-039` | `AC-HARNESS-L3-039-03` | screen-to-acceptance relationとscope内pairwise/drift sourceを用意する。 | relation missing/staleまたは変更後のidentityを旧revisionのままにする。 | drift/missingを報告し、旧registry schemaを要求せず正常な未見relationを受け入れる。 |
| `CASE-HARNESS-L10-040-01` | `FR-HARNESS-L3-040` | `AC-HARNESS-L3-040-01` | L1〜L12の各層、6つのcanonical pair、別recordにしたL0 anchorを与える。 | 層の欠落、L0を第7 pairまたはlayerとして数える誤りを個別に投入する。 | 12層・6 pair・独立anchorが一致しない場合はcoverage未完。 |
| `CASE-HARNESS-L10-040-02` | `FR-HARNESS-L3-040` | `AC-HARNESS-L3-040-02` | 各rowのrevision・source・status・ownerと上下左右edgeを逆引き可能にする。 | edge片側の欠落、古いsource revision、誤ったownerを個別に投入する。 | 逆引き欠落とstaleを未完にし、OS writerをoracleにしない。 |
| `CASE-HARNESS-L10-040-03` | `FR-HARNESS-L3-040` | `AC-HARNESS-L3-040-03` | catalog candidateのみを入力し未提示層契約をunknownにする。 | catalog存在からapproval、OS registration/execution/completionを推定。 | 推定を拒否し該当契約をunknownとして出す。 |
| `CASE-HARNESS-L10-041-01` | `FR-HARNESS-L3-041` | `AC-HARNESS-L3-041-01` | e948固定L11-041のatomic obligationを含むactive template/extractor/scope input。 | source spanまたは一obligation atom/gap対応を除去。 | すべての対象obligationを個別対応し、同input/extractor version semantic digestが一致する。 |
| `CASE-HARNESS-L10-041-02` | `FR-HARNESS-L3-041` | `AC-HARNESS-L3-041-02` | active template内の空/TBD、適用branch、抽出可能/不能要素を分ける。 | 空/TBDを自由補完、重複atom、version/scope mismatch。 | 各々typed gap。candidate rowや抽出だけで解消・採択としない。 |
| `CASE-HARNESS-L10-041-03` | `FR-HARNESS-L3-041` | `AC-HARNESS-L3-041-03` | one obligation/one atom-or-gap正常系を同一inputで反復。 | 一obligationを二atomへ分割、二obligationを一atomへ束ねる。 | 個別obligation identityを保持し、atomicity driftを検出する。 |
| `CASE-HARNESS-L10-042-01` | `FR-HARNESS-L3-042` | `AC-HARNESS-L3-042-01` | 同じbehavior/contractを保つ構造整理candidateと完全なconsumer/oracle evidence。 | 公開contract、要求、persistent state semanticを変更。 | positiveだけrefactor candidate、意味変更は既存backflow先へ返す。 |
| `CASE-HARNESS-L10-042-02` | `FR-HARNESS-L3-042` | `AC-HARNESS-L3-042-02` | scope内semantic signature、全consumer、dependency/oracle snapshotを与える。 | lexical-only類似、consumer不明、snapshot missing/stale。 | successを返さずunknown/未評価。 |
| `CASE-HARNESS-L10-042-03` | `FR-HARNESS-L3-042` | `AC-HARNESS-L3-042-03` | feature追加とstructure-only/performance changeを別episodeに分ける。 | feature additionを同一refactor episodeへ混入。 | 混在を拒み別episodeへ分離候補。性能閾値は016に委ねる。 |
| `CASE-HARNESS-L10-043-01` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-01` | 適用branch/ruleごとにpositive/boundary-negativeとoracleを結ぶ。 | 任意rule/branchでいずれかの例を削除。 | 欠けたbranch/例条件を明示し全体coverageを閉じない。 |
| `CASE-HARNESS-L10-043-02` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-02` | branch分母/rule revision/risk根拠を固定する。 | applicability unknown、risk根拠削除、active revision stale。 | denominator unknownを0やN/Aにせず未評価。 |
| `CASE-HARNESS-L10-043-03` | `FR-HARNESS-L3-043` | `AC-HARNESS-L3-043-03` | risk未被覆が示された状態/failure/security/migration差の追加例と未見正常例。 | 根拠なく他scope/未選択templateを含める、または正常未見例を拒否。 | 対象scope・risk根拠に限ったcandidate matrixを返す。 |
| `CASE-HARNESS-L10-044-01` | `FR-HARNESS-L3-044` | `AC-HARNESS-L3-044-01` | selected obligation classとnormative contractのsource/coverage map。 | 適用classからcontract relationを除去。 | 未被覆を列挙し、uncovered 0候補を主張しない。 |
| `CASE-HARNESS-L10-044-02` | `FR-HARNESS-L3-044` | `AC-HARNESS-L3-044-02` | reuse/delta/new/justified N/Aの各枝を別々に与える。 | duplicated semantic contract、N/A根拠なし、unknown/stale source。 | class毎のoverlap/missingを返し曖昧なcaseは未完。 |
| `CASE-HARNESS-L10-044-03` | `FR-HARNESS-L3-044` | `AC-HARNESS-L3-044-03` | 意味上独立した2契約と同義重複文書を比較する。 | 片方を件数最小化だけで落とす、candidateを設計承認へ昇格。 | 重複findingは出すが必要義務を維持しauthorityを作らない。 |
| `CASE-HARNESS-L10-046-01` | `FR-HARNESS-L3-046` | `AC-HARNESS-L3-046-01` | scope内workflow obligation群をstyle/pair/evidenceへ対応させる。 | 任意のtransition/exception/oracle relationを欠落。 | 欠落を示し、見出し存在だけで閉包しない。 |
| `CASE-HARNESS-L10-046-02` | `FR-HARNESS-L3-046` | `AC-HARNESS-L3-046-02` | Production Scrum、許可済み合成内のScrum部分、Full Vのみを選択したscopeを比較する。 | Scrum非選択にslice delta/Reverse/SR4 receiptを付与、またはFull Vに適用L1〜L5 freezeを求めない変異。 | Scrum条件は選択scopeのみ。Full VはL1〜L5 freezeが必要だがScrum delta/Reverse/SR0〜SR4不要。非選択scopeへScrum条件を課したら過剰適用として不合格。 |
| `CASE-HARNESS-L10-046-03` | `FR-HARNESS-L3-046` | `AC-HARNESS-L3-046-03` | Production Scrum選択scopeのslice delta、既存trigger、Scrum Reverseによるsystem workflowと該当L1〜L5資産へのbackfill、SR4 pair-freeze。 | slice delta/backfill/必要checkpoint/SR4 receiptを一つずつ除去または別revisionへ差し替える。 | 必要trigger時のbackfillとSR4が欠ければScrum scopeはrelease-ready候補にならない。旧ticket/runtimeを要求しない。 |
| `CASE-HARNESS-L10-047-01` | `FR-HARNESS-L3-047` | `AC-HARNESS-L3-047-01` | measured applicable benefit、single-worker role sufficient、LABO evidence unknownの各例。 | unknownをmusterへ昇格、十分なexisting roleを無視。 | 3状態を区別し根拠のないmusterを不合格にする。 |
| `CASE-HARNESS-L10-047-02` | `FR-HARNESS-L3-047` | `AC-HARNESS-L3-047-02` | muster candidateと、objective、成果物schema、tool guidance、task boundary、context selectors、allowed/denied tool/path候補、model/effort class、budget、checkpoint、escalation、verification contractを備えるcontractを入力する。 | 上記fieldを一つずつ欠落/変更し、さらにinput/output digest、generation rationale、guard validation結果を個別に欠落または矛盾させる。 | 全fieldと各traceが揃う時だけcontract candidateを照合済みとし、missing/contradictory fieldはfinding。同一正規化inputとgenerator revisionで意味内容/digestが一致する。proposalからassignment/authority/起動を作らない。 |
| `CASE-HARNESS-L10-047-03` | `FR-HARNESS-L3-047` | `AC-HARNESS-L3-047-03` | worker/verifier別identity/context/authorityと既存lifecycle/profileをfixtureする。 | 同一provider/modelだけでindependence偽、lifecycle/profile missingを許可。 | identity separationを観測し不足はdefer。 |
| `CASE-HARNESS-L10-049-01` | `FR-HARNESS-L3-049` | `AC-HARNESS-L3-049-01` | 固定L11最小入力: renderable prototype、screen ID、target revision、利用許可、profile、device/view/viewport。各checkはaccessibility、contrast、画面幅別崩れ/はみ出し、empty/loading/error等主要state、profile基準の文言量。 | 各checkの表示条件、oracle/手段版、既知fixtureまたは表示証拠を一つずつ欠落。 | checkごとにpass/fail/warning/unknown/根拠付き適用外を返す。条件欠落・未測定はunknown、適用外は理由を別記し、他checkで相殺しない。最小入力は保ち、生成/Pattern/ID発番証拠を追加必須にしない。 |
| `CASE-HARNESS-L10-049-02` | `FR-HARNESS-L3-049` | `AC-HARNESS-L3-049-02` | 5 checkそれぞれの既知positive/negative fixtureと期待分類・観測結果を入力する。 | TP/FP/FN/TNを各check別に変異し、分母0・不足fixture・別scope/revision結果の流用を確認。 | check別precision=TP/(TP+FP)、recall=TP/(TP+FN)と件数を示す。分母0、適用条件不明、fixture不足は数値を捏造せず未評価/warningとする。 |
| `CASE-HARNESS-L10-049-03` | `FR-HARNESS-L3-049` | `AC-HARNESS-L3-049-03` | minimum inputのみで測定する正常例。 | prototype生成、Pattern選択、screen ID発番証拠を追加必須inputとして要求。 | 固定L11にない追加条件で正常入力を拒否したら不合格。結果でagreement/acceptanceを生成しない。 |
| `CASE-HARNESS-L10-054-01` | `FR-HARNESS-L3-054` | `AC-HARNESS-L3-054-01` | 047 contract/task/scope/revisionを結ぶmuster/existing-role/unknown handoff各例。 | OS assignmentが別task/revisionへ結ばれる。 | 同一identityのみ対応し、wrong assignmentを未完にする。 |
| `CASE-HARNESS-L10-054-02` | `FR-HARNESS-L3-054` | `AC-HARNESS-L3-054-02` | layer/drive/phase/task-kind等が定義された入力。 | field missing/conflict/staleを個別変異。 | unknown/deferを返しenum/mappingを推測しない。 |
| `CASE-HARNESS-L10-054-03` | `FR-HARNESS-L3-054` | `AC-HARNESS-L3-054-03` | handoffとOS assignment/profile evidenceが同scope/contract revisionで一致。 | receipt missing/wrong scope、digestのみでauthority/launch主張。 | assignment未完を維持しhandoffから起動・権限を作らない。 |


## 技術候補の計測への接続

測定候補値と比較案は[NFR候補](../L3-requirements/nfr-grade.md)を参照する。ここでは既存L3 ACのoracleに沿って、同一宣言成果物の差分、単一差し替えによる対象外差分数、同一keyの重複効果、expiry後success、同一dependency input/revisionでのclosure／理由差分を観測する。候補の値は後続のL3承認対象であり、現時点で実測値・達成・承認を主張しない。

旧test-designのAT-FR-03/04/05はnegative fixtureの出所確認だけに使った。旧test/runtime、旧CLI、旧CIを実行せず、そのgreen状態を現行の合格根拠にしない。



## H022のAC別総合検証

| L10 case ID | L3 FR ID | AC ID（L3正本） | fixture・観測点 | 合格材料 | 反例／未評価の扱い |
|---|---|---|---|---|---|
| `CASE-HARNESS-L10-022-01` | `FR-HARNESS-L3-022` | `AC-HARNESS-L3-022-01` | 同一revision/scopeの段階証拠を用意し、各stageに対応するpair/oracle/result/evidenceを段階ごとに与える。 | Integrated/Verified/Acceptedが別状態で観測され、AcceptedにはL11 content oracleと利用者受入recordがともに結び付く。 | 欠落証拠、wrong revision/scope、L11 recordなしは当該状態へ昇格しない。 |
| `CASE-HARNESS-L10-022-02` | `FR-HARNESS-L3-022` | `AC-HARNESS-L3-022-02` | 下位passのみ、CI green、artifact存在のみ、固有義務差分未照合、L10 passのみ、L11失敗/別revisionのnegative fixtureを個別投入。 | いずれも未充足段階で止まり、誤昇格0件。 | status投影やtrace存在をoracleの代用にした場合は不合格。 |
| `CASE-HARNESS-L10-022-03` | `FR-HARNESS-L3-022` | `AC-HARNESS-L3-022-03` | 外部持込の同一条件positiveと、revision/pair/oracle/result/evidenceを一つずつ欠いたfixture、意味不一致fixtureを与える。 | 正常入力は満たすstageまで評価し、不足は段階を進めず、意味変更が要る差分はbackflow先を示す。 | 外部CI green/artifact存在だけは未評価。意味差を右側変更で隠せば不合格。 |

## Stage 2c — HARNESS-L2-030／031／032の対検証設計

対象固定revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全文SHA-256は `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`。各L10 caseは[Stage 2c L3要件](../L3-requirements/functional-requirements.md)の同じAC IDを参照し、未実行の合成fixture設計である。

| L10 case ID | L3 FR / AC | fixtureと観測 | 合格oracle | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-030-01` | `FR-HARNESS-L3-030` / `AC-HARNESS-L3-030-01,04` | 承認済requirement、014設計、022 oracle、010 pack revision、011 call revision、target revision/scope、選択source revision・利用permission・data classが揃うpositiveを2回評価する。 | 各caseに根拠locator・選択source・pack/call版が結び付き、同一入力から意味と条件が再現する。 | 選択source不明はunobserved、必要な入力が揃わないcaseは確定しない。 |
| `CASE-HARNESS-L10-030-02` | 同上 / `AC-HARNESS-L3-030-02` | oracle定義済みnormal/boundary caseと、未定義permission・取消・状態結果の反例を個別に与える。 | 定義済み分だけ候補化し、oracleがない期待値は拒否またはunknownで保持する。 | 無根拠期待値、case countでの相殺は不合格。 |
| `CASE-HARNESS-L10-030-03` | 同上 / `AC-HARNESS-L3-030-03` | 選択済みexternal contractの応答・failure・副作用だけを持つdoubleを生成し、未選択providerと実service接続の試行を対照にする。 | doubleが選択contractに限られ、実service呼出しなし。生成を実行済みとしない。 | 未選択provider推測、実接続、全面同等claimは不合格。 |
| `CASE-HARNESS-L10-030-04` | `FR-HARNESS-L3-030` / `AC-HARNESS-L3-030-02` | 取消・権限条件のない通常operationを与え、両operation familyを選択しないpositiveとする。対照では仕様・permissionのある取消または権限operationだけを選択する。 | 通常operationは取消/権限caseを必須化せず生成できる。選択したfamilyはそのcontractに定義されたcaseだけを生成する。 | 未選択familyを全run必須化、または仕様外permission/stateを創作すれば不合格。 |
| `CASE-HARNESS-L10-030-05` | `FR-HARNESS-L3-030` / `AC-HARNESS-L3-030-04` | 同じcase inputで011 call revisionを一つだけ欠落・staleにしたfixtureと一致版positiveを比較する。 | 一致版だけ確定可能。call版欠落/staleは理由付きholdで011契約ownerへ戻る。 | 欠落/staleをcurrentとして確定したら不合格。 |
| `CASE-HARNESS-L10-030-06` | `FR-HARNESS-L3-030` / `AC-HARNESS-L3-030-04` | それ以外を同一にし、選択source利用permissionだけをmissing/unknownにしたfixtureを与える。 | 該当caseの処理を保留しsourceまたはSECURITY permission ownerへ返す。 | permissionを推定・迂回してcaseを確定したら不合格。 |
| `CASE-HARNESS-L10-030-07` | `FR-HARNESS-L3-030` / `AC-HARNESS-L3-030-04` | permissionと版は有効のまま、対象data classだけを欠落または許可条件と不一致にする。 | data class不足/不一致を理由付きで保留し該当source/SECURITY ownerへ戻す。 | classを既定値で補い処理したら不合格。 |
| `CASE-HARNESS-L10-030-08` | `FR-HARNESS-L3-030` / `AC-HARNESS-L3-030-04` | 011 callとsource条件を固定し、010 pack revisionだけをmissing/staleにする。 | pack contract ownerへ戻し、caseを確定しない。 | pack版を推定または旧版のまま成功扱いしたら不合格。 |
| `CASE-HARNESS-L10-031-01` | `FR-HARNESS-L3-031` / `AC-HARNESS-L3-031-01,04` | 合成secret markerを含むbounded inputで、010 pack版・011 call版・取得permission・data class・sanitization/security条件が一致するpositiveを与え、出力先のmarker有無を観測する。 | 有効な条件下でsanitized candidateに進み、raw marker露出0。 | 必要条件が揃わない場合は下記個別caseどおり処理を保留する。 |
| `CASE-HARNESS-L10-031-02` | 同上 / `AC-HARNESS-L3-031-02` | 元failureと縮小候補を同一oracle・revisionで選択executorへ順に渡し、後続receiptを同一/異なるfailure/未返却に分ける。 | 同一oracle violationのreceiptが得られた段階だけconfirmed reproductionとする。 | 別failureやreceipt前のconfirmed表示は不合格。未返却は未完。 |
| `CASE-HARNESS-L10-031-03` | 同上 / `AC-HARNESS-L3-031-03` | 修正後resultなしでcandidateを生成するfixtureと、別revisionの後段pass/fail receipt fixtureを分ける。 | 前者はcandidateのみ、後者は別証拠として結ばれ元failureを保持する。 | candidate生成に後段passを要求、または元failureを上書きすれば不合格。 |
| `CASE-HARNESS-L10-031-04` | `FR-HARNESS-L3-031` / `AC-HARNESS-L3-031-01` | 副作用のあるexternal-call記録を含む許可済みbounded inputを、reduction時に再生する操作と記録参照だけにする操作で比較する。 | 記録参照で再現候補を作り、external call/state changeの再発生は0。 | 副作用を再送、または抑止条件を確認できない場合は保留/owner return。 |
| `CASE-HARNESS-L10-031-05` | `FR-HARNESS-L3-031` / `AC-HARNESS-L3-031-02` | (a)root cause unknownだが独立oracleと必要environment evidenceが揃うfixture、(b)environment dependency/seed/versionが欠け同一oracle確認不能なfixtureを与える。 | (a)根因を断定せず根拠あるreduction candidateを返す。(b)未確認として不足条件と戻し先を示し、同一再現確認済みにはしない。 | unknownを無根拠な原因へ埋める、または証拠十分なfixtureを未見だけでunknownにする場合は不合格。 |
| `CASE-HARNESS-L10-031-06` | `FR-HARNESS-L3-031` / `AC-HARNESS-L3-031-04` | bounded input以外は同一にし、011 call revisionだけをmissing/staleにする。 | 機微inputを処理せず保留し011契約ownerへ戻す。 | invalid call contract下でreductionを開始したら不合格。 |
| `CASE-HARNESS-L10-031-07` | `FR-HARNESS-L3-031` / `AC-HARNESS-L3-031-01,04` | 取得permissionだけをmissing/unknownにするfixtureと、data class/security handlingだけをmissing/不一致にするfixtureを別々に与える。 | それぞれsource permission owner、またはSECURITY/data handling ownerへ返し、機微input処理を開始しない。 | permission/data class/security条件を推定・省略してsanitizationへ進めたら不合格。 |
| `CASE-HARNESS-L10-031-08` | `FR-HARNESS-L3-031` / `AC-HARNESS-L3-031-04` | input/executorの一方をunselectedと明示し、selected bounded inputの条件だけが揃うpositiveを与える。 | 選択していないinput source/executorはunobservedのまま必須条件にならない。 | 未選択sourceを存在・不在いずれかと推測して失敗/成功を付けたら不合格。 |
| `CASE-HARNESS-L10-031-09` | `FR-HARNESS-L3-031` / `AC-HARNESS-L3-031-04` | 011 callとsource/security条件を固定し、010 pack revisionだけをmissing/staleにする。 | inputを処理せずpack contract ownerへ戻す。 | stale packを利用してcandidate生成したら不合格。 |
| `CASE-HARNESS-L10-032-01` | `FR-HARNESS-L3-032` / `AC-HARNESS-L3-032-01` | 010 pack版、011 call版、明示選択されたOS-020または利用者CIのschema/version/compatibility、case/oracle/source/target revision/scope、runner capability/permissionが揃うpositiveを与える。 | 選択consumerとの適合packetだけを作り各identity・版・scopeを保持。 | 未選択consumerを条件に加えず、selected consumerの不足はhold。 |
| `CASE-HARNESS-L10-032-02` | 同上 / `AC-HARNESS-L3-032-02` | packetはhandoff前にreceipt/resultなしで作成し、handoff後のdelivery receiptと実行後resultを順に与える。ticket/passが付加される反例も与える。 | 初回packetがreceipt/resultなしで成立し、handoff receiptはdelivery後、run resultはexecutor実行後に分離して記録する。 | handoff前のreceipt要求、delivery receiptからrun result/pass/ticket/acceptance生成は不合格。 |
| `CASE-HARNESS-L10-032-03` | `FR-HARNESS-L3-032` / `AC-HARNESS-L3-032-01` | 選択runnerが必要とする各capability（隔離、network制約、external double等）とpermissionを一つずつ欠落/不一致にし、schema/revision/scopeが一致するpositiveを対照にする。 | positiveだけpacket化し、各欠落/不一致は個別理由付きで保留する。 | capability/permission不一致を暗黙充足、別executor/scopeへfallbackしたら不合格。 |
| `CASE-HARNESS-L10-032-04` | `FR-HARNESS-L3-032` / `AC-HARNESS-L3-032-01` | OS-020を選択consumer、利用者CIをunselected consumerとしたfixtureを与え、選択済OS-020の必要契約だけを満たす。逆の選択も別fixtureで行う。 | 選択consumerだけについてpacket適合を判定し、未選択consumerはunobservedで必須依存にならない。 | 未選択consumerのschema/availability欠如だけで失敗させたら不合格。 |
| `CASE-HARNESS-L10-032-05` | `FR-HARNESS-L3-032` / `AC-HARNESS-L3-032-01` | 010 pack版または011 call版を一つずつmissing/staleにし、その他条件が一致するfixtureと比較する。 | 不正なpack/call contractでhandoffせず、該当010/011 ownerへ戻す。 | version mismatchを適合としてpacket化したら不合格。 |

この検証設計は生成・packet化・receiptの存在を実行成功やL3承認に読み替えない。実際のexecutor実行、外部通信、実credential/dataの利用を含まない。

## Stage 4 — HARNESS-L2-026..029 L10 oracle

固定L2/L11は633bf12の採択revision。ここでは静的fixtureと期待oracleを定義し、設計生成・source実行・実装・承認は行わない。各caseはfunctional-requirements.mdの同一AC IDを参照する。

### HARNESS-L2-026（FR-HARNESS-L3-026）

- CASE-HARNESS-L10-026-01（AC-HARNESS-L3-026-01）: 009/010/011/022、CORE、BRAIN connector、Template、承認済L3/対象revision/scopeを入力し、014内部unitとしてL4/L5/L6とL9/L8/L7各出力対を照合する。014完了receiptは未発行とする。oracleは全出力対と全traceが成立し、receipt不存在を理由にholdしないこと。
- CASE-HARNESS-L10-026-02（AC-HARNESS-L3-026-02）: 009、010、011、022、CORE、BRAIN connector、Template、L4、L5、L6、L9、L8、L7の各常時入力/出力を別個のmutationとして一つずつ欠落またはstaleにする。期待結果は該当義務のhold/uncovered、他義務を維持、欠落義務の相殺0。
- CASE-HARNESS-L10-026-03（AC-HARNESS-L3-026-03）: UI対象ではscreen contract/prototype/非UI合意/oracleの各一つを欠落させholdを確認する。非UI対象の並行fixtureではそれらを与えなくても合格。個別Patternを選択した場合はidentity/version/compatibility/applicability/required input/relation/counterexampleの各欠落を独立に検出し、未選択Patternは未観測とする。UIでない設計対象にも適用oracleを与え、これを欠落させるとholdする。UI artifactだけはUI選択時に必須。競合Pattern fixtureは両constraintと代替を併記し、各代替を固定不変条件oracleで検証する。
- CASE-HARNESS-L10-026-04（AC-HARNESS-L3-026-04）: 026交換前後の014 input/output version、scope、compatibility、paired acceptanceをそれぞれmissing/stale/mismatchとする。どれも014提供をholdし、旧新contract混在は不合格。全一致fixtureのみ候補を通す。
- CASE-HARNESS-L10-026-05（AC-HARNESS-L3-026-01,03）: approved requirement「承認後は申請を編集できない」をstate/API/command/actor/UI/DB設計と個別oracleに結ぶ正常fixtureを通す。反例fixtureでは (a) UIだけ編集不可だがAPIは更新を受理、(b) 権限のある別actorが迂回、(c) 同時更新でstate/DB不変条件が破れる、(d) Pattern代替が不変条件を破る、をそれぞれ独立に入力する。画面traceの存在で合格にせず、該当経路のoracleが違反を検出すること。親意味変更要求はL2-008へbackflow。

### HARNESS-L2-027（FR-HARNESS-L3-027）

- CASE-HARNESS-L10-027-01（AC-HARNESS-L3-027-01）: 明示選択code sourceのstatic snapshotにstatus != draft → 409、amount > max → 422、otherwise persist(amount) → 200を置き、revision/digest/scope/read permissionを結ぶ。期待oracleは三分岐の順序とsource span、persist到達/非到達をcandidateとして記録し、runtime実測や要求正しさを主張しない。
- CASE-HARNESS-L10-027-02（AC-HARNESS-L3-027-02）: status guard、amount comparison、persist orderingを一つずつ逆転/除去したsource variantと、原形を与える。抽出結果だけがそのsource変更に応じて変わり、拒否branchがpersistへ到達したら不合格。
- CASE-HARNESS-L10-027-03（AC-HARNESS-L3-027-03）: HARNESS-L2-019の対象/source-type/scope/version input contract、010 pack version、011 call revision/scope/receipt、source digest、read permissionのそれぞれを単独欠落/staleにする。該当入力hold、未選択source unobserved、019完了receiptやsaved designが無くてもvalid raw observationは成立。
- CASE-HARNESS-L10-027-04（AC-HARNESS-L3-027-03）: unsupported config construct、同一scopeで矛盾する二source、runtime-only field、実顧客DB値を別fixtureで与える。unsupported/conflict/unknownを区別し、顧客DB・runtimeアクセスとwriteは0。

### HARNESS-L2-028（FR-HARNESS-L3-028）

- CASE-HARNESS-L10-028-01（AC-HARNESS-L3-028-01）: 027 valid receiptとsource/authority状態が既知のcurrent saved design/requirement revisionを与える。approval receiptなし・未承認状態でもcomparison candidateを作り、known relationのaffected exact set/custom logic/unknownを返す。
- CASE-HARNESS-L10-028-02（AC-HARNESS-L3-028-02）: 同じcurrent designをapprovedと主張するfixtureではrevisionに結び付くapproval receiptを外す、wrong revisionにする、または正しいreceiptを加える。前二つはapproved claimを拒否、最後だけclaimを許す。比較候補とapproved claimを同じ結果fieldへ混同したら不合格。
- CASE-HARNESS-L10-028-03（AC-HARNESS-L3-028-03）: 003/004既知trace内のaffected/unaffected edgeとknown reverse map外のhelper/API relationを同時に入れる。既知edgeのみ分類し、外側relationはunknownに留める。unknownをunaffectedへ置換、構造類似だけでimpact確定は不合格。
- CASE-HARNESS-L10-028-04（AC-HARNESS-L3-028-02,03）: 027 receipt、saved design revision、authority stateを個別にmissing/staleにする。対象比較をholdし、approval状態の推定、意味変更のright-side patchを許さない。

### HARNESS-L2-029（FR-HARNESS-L3-029）

- CASE-HARNESS-L10-029-01（AC-HARNESS-L3-029-01）: 027 raw observation receipt、028 comparison receipt、同一対象のcurrent saved design/requirement revision、010/011/003/004/022契約を一組にする。相互traceされた五つのbundle区分（design delta、関連APIだけのrepair候補、必要時migration、保持custom logicと理由、backflow/verification/unsupported/unknown obligations）を全て照合する。
- CASE-HARNESS-L10-029-02（AC-HARNESS-L3-029-02）: API repair選択時はAPI contractを一項目ずつ欠落、migration非選択のno-change caseではDB ownership等を要求しない。別fixtureではmigrationを選択しschema/owner/loss/compatibility/rollback oracleをそれぞれ欠落させholdする。条件外dependency混入またはmigration創作は不合格。
- CASE-HARNESS-L10-029-03（AC-HARNESS-L3-029-03）: 一つの関連API案のみ成立する場合と5 bundle全てが閉じる場合を比較し、局所proposal successとcomposite successを別状態にする。custom logicは保持され、unknown/stale/義務欠落は全体successを止める。
- CASE-HARNESS-L10-029-04（AC-HARNESS-L3-029-03）: source/designへwrite、migration実行、candidateの事前承認要求、unknownの確定を試みる反例。副作用0、proposal未承認、既存revision不変でなければ不合格。
