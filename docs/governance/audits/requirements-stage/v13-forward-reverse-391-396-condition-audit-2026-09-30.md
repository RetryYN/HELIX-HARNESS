# 旧v1.3 §5 Forward/Reverse 6条件監査

status: `six-condition-comparison-only`
authority_effect: `none`
created_against_revision: `03edd59de8d0488a797480ac23a6fc1a24f569b1`

## 範囲と選定

旧archive v1.3の§5から、Forward/Reverseの方向・routing・refactor・横断loopを記す連続6行（物理行507–512）だけを比較した。source identityは `REQSRC-SUP-00391`〜`00396`。archive file SHA-256は `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、assetは `LEGACY-ASSET-02319C2481B9E01698D5`。各IDのline text・line SHA-256・queue status/ref countは[JSON](v13-forward-reverse-391-396-condition-audit-2026-09-30.json)にsource-qualified tupleで記録した。

6行はqueueで全て `condition_status=unresolved`、`primary_residual`、`unresolved_for_closure_work`、既存個別監査ref 0。#2411 §6の17件（`REQSRC-SUP-00398`, `00399`, `00400`, `00403`–`00405`, `00407`, `00409`–`00411`, `00414`, `00418`, `00421`, `00424`, `00430`–`00432`）、#2413 §2の12件（`REQSRC-SUP-00034`–`00045`）、旧v1.3 §4.6.1 package-consumer residual 11条件の個別監査（source physical lines 300, 318–333から、`REQSRC-SUP-00225`, `00242`–`00246`, `00248`–`00249`, `00251`, `00255`–`00256`）と重複しない。既存focused v1.3監査群とのidentity overlapも0件。#2415でmainへ入った開発style 11条件監査（JSON SHA-256 `ce2aa162b917c281f78e27ccb5a67f04da484d2648b932aae753cfb25036cf75`、対象ID `REQSRC-SUP-00055`, `00056`, `00057`, `00059`–`00063`, `00065`, `00068`, `00069`の11件）もmain `03edd59de8d0488a797480ac23a6fc1a24f569b1`上で照合し、この6 IDとの重複は0件。

旧consumerとして、archive `process/modes/README.md` lines 29–47、`process/modes/reverse.md`、`process/modes/scrum.md`を読んだ。READMEはForwardを主線とする分類索引、Reverseは旧R0–R4とrouting/pair-freeze、Scrum文書はSR0–SR4とstyle/slice条件を記述する。各file SHAと参照役割はJSONに記録した。archive source/consumerは読取資料としてのみ使い、実行していない。

## 固定L2/L11と後発採択pair

基準はPO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。HARNESS L2/L11、HELIX-OS L2/L11のfile SHAと照合行のline SHAはJSONの `comparison_baselines.po_fixed_revision` に保持した。

固定OS L2 `HELIXOS-L2-010` とL11/HXT-TYPE-09は、Forwardを各開発方式の主線とし、Reverseを実装事実から設計へ戻してForwardの該当層へ合流するticketとしている。Refactor、Design-refactor、Redesignは別ticket型とrouteを持つ。固定HARNESS L2 `HARNESS-L2-002/003` とL11は方式別工程、凍結・差戻し・backflowを保持し、L2 line 105にScrum適用scopeだけのSR0→SR4、pair-freeze、Forward reentry、receiptとrelease-ready条件を記載する。

後発57判断と11判断は別recordとして読んだ。57判断record SHA-256は `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`（source repository revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`）。別の11判断record SHA-256は `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`（source repository revision `5aa100319361b0cc86edd3c51815ec777d55410a`、decision basis `909c8015326f35f8d42ce12e3c388923de411d1f`）。decision record自体と、recordが固定するpair source revisionは別pinである。

- 採択 `HARNESS-L2-038`（`MPR-RC-HARNESS-L2-038-001`）は、選択source scopeにおける根拠・観測・as-is design/test・intent/authority・gap/routingの内容oracleに限定して近接比較した。R0–R4の固定label/schema/enumを採択したものではなく、旧段階名の後継・全source coverage・全4020資産への一括適用ではない。
- 採択 `HARNESS-L2-046`（`MPR-RC-HARNESS-L2-046-001`）はFull VとProduction Scrum適用scopeの枝を分けた。Full V枝にSR4やScrum slice deltaを要求しない。ここで近接するのはProduction Scrumまたは合成方式のうち実際にScrumを適用するscopeに対するslice delta、workflow/L1–L5へのbackfill、必要なSR4 receipt/reentryだけである。Hybrid全体には外挿しない。
- 別11判断で採択された `HARNESS-L2-051`（`MPR-RC-HARNESS-L2-051-001`）は、stage進行/終了のclaimに限り、stage/scope/goal、canonical/paired layer、owner、required output、oracle、target revision/HEAD、evidence参照、未完条件を結び、下位stage passだけから上位exitを推定しない。pair source revision `5aa100319361b0cc86edd3c51815ec777d55410a`でL2 section lines 1112–1128のSHA-256は `e023408a45afa40bb674aebf53fcc870d6c4d9f8da155ce282b9fe5b69818f9b`、L11 lines 828–838のSHA-256は `3f14cb4463fa67a69d82827040d249c93cb905b5ac6934769b15e1b9cf701300`。decision row line 31 SHA-256は `49ee147e98f82a02a9f49328e94996e7bdaab00219ff7de044fc521129c23712`。decision record SHA-256は `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`で、57判断record SHA `c3904...`とは別。051は一般的なstage-exit evidence oracleであり、R0–R4またはScrum SR0–SR4の定義・後継ではない。参照先のPHCAP-08 25 atomは別assetでholdingに保全され、`carried_atom_refs`は空である。

採択されたpair revision自体を比較しているだけであり、どの旧source lineにもsuccessorを割り当てない。f6固定pair、後発57+11 decision/pair、current-input pinsは別のrevisionとして保持した。

## 条件別比較

### `REQSRC-SUP-00391` — Forwardを正方向とする

OSのForward主線・他ticketのForward合流、Reverseの該当層returnが意味上の保持点。現行ではstyle axisとticket/workflow axisを分け、Reverseを突発またはcheckpoint条件で起動する。全ての作業を一律Forward-onlyにする趣旨ではない。

反例はReverse結果を恒久的な横道にし、Forward適用や合流を省くこと。逆に全ticketに独立Reverse/Forward ticketを強制する根拠もない。残差は対象scope/revisionに対する起動とForward再入のreceipt・再開条件をこの旧source line単位で結ぶこと。

### `REQSRC-SUP-00392` — ReverseでR0〜R4を閉じてからForwardへ合流

OSのReverse目的・routingは保持される。採択038は選択source scopeで段階内容を証明する近接比較だが、旧R0–R4の固定段階名を継承しない。採択051はstage exit claimを対象revision・scope・pair/oracle/evidence・未完条件に結ぶ一般受入oracleとして近接するだけで、R0–R4の各段階を定義・列挙しない。051が参照するPHCAP-08 atomは別assetで保全中、`carried_atom_refs`は空であり、本source lineへのcarry/successorを示さない。HARNESSのSR0–SR4はScrum専用routeであり、generic ReverseのR0–R4とは別である。どちらも5段階という数値だけでは同一性にならない。

反例はSR段階をR段階の完全同義語とすること、038を全Reverse/all-assetsへ広げること、または選択source・target revisionなしに段階完了を主張すること。残差は対象別の段階適用性、gap/routing、必要なForward pair closureとreceiptをtarget revisionに束縛する点。採択051を使えるのはstage-exit evidence対応の範囲であり、generic R0–R4の内容対応は未解消である。

### `REQSRC-SUP-00393` — 確定設計変更にはRedesignを先行し、その後Forward実装

現行OSはRedesignを外部約束・要求・受入条件の変更routeとして保持し、要求意味が変わるときはDecideを通してForwardへ戻す。外部意味を保つ修正はRefactor/Design-refactorへ分けるため、旧「確定設計変更」の範囲を現行Redesignと同一視できない。

反例はpublic promiseやacceptanceを変えながらDesign-refactorで閉じること。残差は「確定設計変更」が内部設計だけか外部contract/要求変更かを判定するoracle、およびRedesign→Forwardのtarget revision receipt。

### `REQSRC-SUP-00394` — 外部挙動不変の構造改善をDesign Refactorにし、機能追加と混載しない

現行OSにはDesign-refactor ticketがあり、意味変更を伴う場合はRedesign等へrouteする。一方、小さな局所refactorは既存Forward ticket内に置け、独立・大規模・横断的な構造改善は別ticketとするため、分離粒度が変化している。

反例はfeatureを加えながらDesign-refactorとして意味変更を隠すこと、または局所的な小修正まで常に独立ticket化すること。残差は同一ticketで機能追加と構造改善が混ざらないこと、外部挙動/public surface/DB semantics/要求に差分がないことを対象revisionごとに確かめるoracle。

### `REQSRC-SUP-00395` — Infinity Loopの3軸を通じて最終的にForward正本へ収束

OSはHARNESS工程部品の動的workflow合成と途中結果での差戻しを持つ。HARNESSは検証義務・gate・pairを定め、OSのCI合成・運転は別責務である。しかし固定pairは「監査/改善 ⇔ gate ⇔ 自動走行」の横断loopとして一体の意味・受入条件を明示しない。

反例は監査またはgateの記録だけで自動走行loop完了とすること、OS workflow合成だけでHARNESS検証義務を追加・削除できるとすること。残差は三軸間trigger、責務/receipt、改善結果が採択されたForward revisionへ戻るoracleと対象revision。ここから新しいauthorityや承認段階は導入しない。

### `REQSRC-SUP-00396` — Scrum Reverseで実装・実測をV資産へ戻しSR4後にForwardへ再合流

固定HARNESS L2 line 105にはScrum専用の5段階、checkpoint trigger、4 entity、SR4 publish条件、provisional非canonical、receiptなしのrelease-ready拒否、finding routeがある。採択051は、SR4を含むstage exitを主張する際のscope/revision/paired layer/oracle/evidence/未完条件の一般照合には近接するが、Scrum固有の段階・trigger・receipt・Forward reentryを規定しない。L2/L11は方式合成時もScrumを実際に適用する部分に限る。OSのHXT-TYPE-09はReverseの目的・checkpoint・Forward該当層への合流を確認する。

採択046のScrum枝は、Production Scrum適用scopeのslice deltaをsystem workflowとL1–L5設計へbackfillし、必要なSR4 receiptを要求する比較点である。別枝のFull VにはScrum delta/SR4を要求しない。したがって、旧§5の短い要約、旧§4/§4.1のL3後slice条件、旧Hybrid全体、各L4/L5/V-pair evidenceを同一条件にしない。

反例はFull V枝にSR4を必須化すること、Scrum適用scopeでslice delta/backfill/SR4を欠いてrelease-readyにすること、またはHybrid全体へScrum条件を外挿すること。残差は、実際にScrumを適用するslice scope/source revision、checkpoint、4 entity/evidence、SR4 receiptとForward reentryを一つの対象条件へ束縛すること。採択051だけではこれらのScrum固有意味は閉じない。051由来のPHCAP-08 atomは別assetで保全中、`carried_atom_refs`は空であり、v1.3 §5 line 512へのsuccessorを示さない。§4/§4.1のsource identityは別行として残す。

## 結果と静的検証

6行の比較statusは `covered: 0 / partial: 6 / missing: 0`。これはこの比較群内の意味評価であり、queueのstatusを書き換えるものではない。正式successor 0、採択主張なし、authority effectなし、L11実行/受入主張なし、stage completion/closure主張なし。

current-input SHA-256とqueue basis commitはmain `03edd59de8d0488a797480ac23a6fc1a24f569b1`に更新し、旧archive source、固定f6 L2/L11、後発318ec/5aa100 decision/pair pinsは固定した。#2415の開発style 11条件artifactをSHA-256付きで重複走査へ追加し、選択6 IDとの重複0件を確認した。JSON構文、ID tuple/source line SHA、queue status/ref count、non-overlap、固定/後発/current input hashを静的確認する。旧CLI/runtime/test/CIは実行しない。
