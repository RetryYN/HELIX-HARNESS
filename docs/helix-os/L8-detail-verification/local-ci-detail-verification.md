---
title: "HELIX-OS Stage 1 local CI 詳細検証設計"
status: design_pair_defined
owner: HELIX-OS
paired_l5: ../L5-detail-design/local-ci-detail-design.md
stage: 1
version_target: 1.0
---

# HELIX-OS Stage 1 local CI 詳細検証設計

本書はL5 `local-ci-detail-design.md`のAPI、型、target束縛、receipt、provider入力を検証する統合fixture設計である。API型のcaseは将来のformal K1 projection契約を検証し、初期`scaffold/local-ci/` CLIは診断用JSONと外部receiptだけを出力する。CLIがK1 recordを作るとは主張しない。設計oracleでありL8の実行・合格、CI実行、上流承認を表さない。

固定入力は対のL5本文SHA-256 `63936d9facfb201a4d268877d643d35d4082a7493074e40cf47fd8ab77214b14`である。

## 1. Fixture規則

全fixtureは一時Git repository、合成UTF-8文書、stub command結果を用いる。旧CLI/hook/runtime/test/CIはfixtureにも含めない。各行は一つの条件だけを変更し、派生値（tree OID、digest、receipt digest、base/head）は変異に合わせ再計算する。受口は期待型まで指定し、unknown/unobservedを合格に読み替えない。

全量planのrequired setは順に`LC-SCF-001` → `LC-SCF-002` → `LC-GOV-001` → `LC-DIFF-001` → `LC-DESIGN-001`であり、各caseは一つのfieldを変えても他のrequired stepを保持する。一般`CiState` fold vocabularyに`skipped`があっても、この固定5件はselected requiredであるためreceipt schemaでfold前に拒否する。`skipped`を他stateへfoldしてlocal receiptを受理することはない。

## 2. API/receiptの検証fixture

| ID | L5契約 | 正常入力 | 一点の変異 | 期待結果 |
|---|---|---|---|---|
| `CASE-L8-LCI-01` | `resolve_target` | base/head commitとtreeが存在しclean | 必須head refを入力から欠落させる | `Rejected(missing_key)`、CI未実行 |
| `CASE-L8-LCI-02` | `check_clean_checkout` | index/worktree/untracked変更なし | staged fileを一つ追加 | `Stale`、check未開始 |
| `CASE-L8-LCI-03` | target比較 | 開始/終了時のHEAD/treeが一致 | 未開始stepがある時点でHEADを切替 | 未開始stepをstale行として5行receiptに保持、既実行evidenceを残しaggregate `stale` |
| `CASE-L8-LCI-04` | `compile_plan` | 固定5 step IDとargvが指定順にある | `LC-DESIGN-001`を削除 | `Unknown(missing_input)`、success不可 |
| `CASE-L8-LCI-05` | `run_local_ci` | 5 fixed runnerすべてexit 0 | SCF validateをexit 1にする | SCF `fail`、他4 stepも実行、aggregate `fail` |
| `CASE-L8-LCI-06` | 固定checker argv境界 | fixed configから作ったargv list、`shell=False`、repo cwd | 呼出側のchecker argv一項へ`; touch ...`相当を追加する | spawn前に`Rejected(invalid_input)`、shellもcheckerも起動しない |
| `CASE-L8-LCI-07` | exit写像 | checkerがexit 0 | exit 2を返す | step `fail`、本文でなくstdout/stderr SHAを保存 |
| `CASE-L8-LCI-08` | supervisor外run中止 | 2 step完了、3つ目processは中止要求後に停止・reapできる状態で、後続stepは未開始 | run全体へのcancel要求だけを加える | 起動中process停止/reap確認後、未開始stepを`state=interrupted, reason=cancelled`で残し後続を起動しない。aggregate successなし |
| `CASE-L8-LCI-09` | current checker ref | scfctl/govcheck refがtree bytesと一致 | govcheck bytesを変更しdigest不一致にする | `Stale`、govcheckを起動しない |
| `CASE-L8-LCI-10` | 実行前後のchecker束縛 | 開始/終了のchecker digestが一致 | 最終step後にchecker digestだけを変える | 外側`Stale`、既実行evidenceは診断artifactへ保持、LocalCiReceiptを発行せずaggregateだけを上書きしない |
| `CASE-L8-LCI-11` | `SourceSnapshotReader` | treeから宣言blobを読む | pathをsymlinkへ置換 | `Unknown(conflict)`、link先を辿らない |
| `CASE-L8-LCI-12` | 固定corpus | 現行main 4文書と3 pair PR統合後の今回6文書が登録済み | current doc pathを一つ欠落 | `Unknown(missing_input)`、全量検査を主張しない。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-13` | definition parser | IDを定義domainに一度、参照domainに別記 | 参照domainだけにIDを置く | `Unknown(missing_input)`、定義を作らない。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-14` | reference parser | referenceが一意なdefinitionへ解決 | definitionを二重化 | `Unknown(conflict)`。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-15` | 明示coverage | L4 invariant→L9 IV edgeとfixture定義がある | verifier IDの定義行を削除 | `Unknown(missing_input)`。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-16` | coverage意味 | L6 function→L7 oracle edgeが一意 | edge先IDを別fixtureへ差替え | `Unknown(conflict)`。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-17` | `U-LCI-01..04` unsupported disposition | 4件を理由付きscope外non-pass inventoryに記録 | `U-LCI-01`をpassへ変える | `Rejected(invalid_input)`。`pass`はUnsupportedItemの型にないためpreflightで拒否する。正常入力では他3件も別fieldのnon-passで保持し、範囲外残余のみで固定5 stepをfailにしない |
| `CASE-L8-LCI-18` | HistoricalPin | full-file hashと指定line-span hashを再計算 | sourceの1行だけ変えfull digestを据置 | full pin `Unknown(conflict)` |
| `CASE-L8-LCI-19` | HistoricalPin span照合 | 指定line bytesからspan digestを再計算 | partial line spanのdigestを全体file digestへ差替え | `Unknown(conflict)`、実際のspan bytesで判定 |
| `CASE-L8-LCI-20` | source kind | archive pin/audit snapshotをhistoricalとして記録 | archive pathをcurrent linkに昇格 | `Unknown(unregistered)` |
| `CASE-L8-LCI-21` | repository境界 | external temp pathがrepo root外 | repo配下をoutput pathにする | `Rejected(invalid_input)`、書込みなし |
| `CASE-L8-LCI-22` | canonical receipt | sorted UTF-8 JSON、LF、body外hash | 一行をCRLFへ変える | `Rejected(invalid_input)` |
| `CASE-L8-LCI-23` | 自己参照禁止 | receiptに自身のdigest fieldがない | `receipt_digest`を本文へ追加 | `Rejected(invalid_input)` |
| `CASE-L8-LCI-24` | formal receipt schema | current sourceからformal key inputsを構成し、receipt内にtarget/contract/config/manifest/checkers/runtime/5 steps/stateがある | receipt内`checker_refs` fieldだけを欠落 | `Rejected(invalid_input)`。formal key inputsは別に構成済みで、CLI診断にもK1結果classを付けない |
| `CASE-L8-LCI-25` | privacy | outputはSHA-256だけ、cwdは相対path | stdout本文fieldを追加 | `Rejected(invalid_input)` |
| `CASE-L8-LCI-26` | selected required state | 5件すべてsuccess、すべてplan-selected required | 一checkを`skipped`へ変えてreceipt validatorへ渡す | `Rejected(invalid_input)`、aggregate `skipped`を作らない |
| `CASE-L8-LCI-27` | config digest | 同じargv/selection/manifest versionから同digest | 同一target receiptのconfig fieldだけを変える | `Unknown(conflict)` |
| `CASE-L8-LCI-28` | result authority | 全static checkがsuccess | resultをmerge-allowedへ写す | `Negative`、authority昇格なし |
| `CASE-L8-LCI-43` | receiptのpath privacy | 外部cache/tempへreceiptを出力し、本文に絶対checkout pathを含めない | receipt内の一つのpath fieldだけを絶対checkout pathにする | `Rejected(invalid_input)`、receipt本文に絶対pathを残さない |
| `CASE-L8-LCI-44` | formal K1 key構成 | operation/version、current target SubjectRef、scope、全required source refsを既存K2型で構成 | formal API inputからtarget SubjectRefを一つ欠落 | `Rejected(missing_key)`、架空refやK1 receiptを作らない。CLI diagnostic outcomeはK1 resultと呼ばない |
| `CASE-L8-LCI-45` | formal K1 key後のsource read | formal APIでrequired refsを構成し固定target tree bytesを読める | 一つのGit blob readだけをunavailableにする | `Unknown(unreadable)`、未読sourceをsuccessにしない。CLIは読取診断のみを出す |
| `CASE-L8-LCI-46` | plan/execution分離 | plan state=`success`、execution state=`fail`、両者別field | plan stateだけをexecution `fail`へ変更する | formal receipt validator `Rejected(invalid_input)`、CLI診断はK1 classを主張しない |
| `CASE-L8-LCI-47` | isolated target snapshot | exact target必要blobs/minimal objectsとbaseline ancestorsだけのself-contained snapshot、credential-free private Git config、original checkout/`.git`なし | sandbox mount listへoriginal `.git/config`を加える | `denied`、checkerを起動しない |
| `CASE-L8-LCI-48` | network boundary | checkerはhostと共有しない専用network namespace内で起動し、外部接続性は無効 | 専用namespace分離を一つ取り除きhost network namespaceを共有する | preflight `denied`、checkerを起動しない |
| `CASE-L8-LCI-49` | fixed Python argv preflight | checker argvは設計固定の`python3 -B` | argvから`-B`だけを除く | `Rejected(invalid_input)` before spawn。readonly境界不成立とは推論しない |
| `CASE-L8-LCI-50` | child process timeout supervision | govcheckと`gen_rulebook.py --check` childを同じgroupで監視 | timeout後childだけを生存させる | `denied`、child停止/reap確認まで後続stepを開始しない |
| `CASE-L8-LCI-51` | timeout完了 | checkerが300秒候補timeout前に正常終了でき、process treeの停止・reapを確認する | fixed checkerをtimeout超過まで実行させる | `state=interrupted, reason=timeout`、process tree停止/reap後に後続stepを実行しdiagnosticを保持 |
| `CASE-L8-LCI-52` | transitive checker ref | `govcheck.py`と`gen_rulebook.py`双方のdigestがcurrent targetと一致 | child checker bytesだけ変更 | `Stale`、govcheck未起動 |
| `CASE-L8-LCI-53` | known non-pass disposition | manifestは`RL-V1`/`RL-K3` not_exercised、`RL-D4`から`IV-RL-56`/`IV-RL-57`/`IV-RL-59`へのpartial edge、別fieldのD4 code-graph extraction scopeout、`RL-T3` partial edgeを記録 | `RL-D4`の`IV-RL-57` edgeを欠落 | `Unknown(missing_input)`、structure completeとしない。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-54` | non-pass保持 | `RL-V1`/`RL-K3`は`not_exercised`、`RL-D4`の3件の設計edgeは`partial`で抽出scopeoutは別field、`RL-T3`はclassifier edgeだけの`partial`、U-LCI残余は別inventory | `RL-T3` dispositionだけを`pass`へ変える | `Rejected(invalid_input)`、CI構造successから契約passを生成しない |
| `CASE-L8-LCI-55` | dispatch envelope parse | workflow開始後、JSON envelope parserが構文を読める | envelope JSON構文だけを壊す | provider diagnostic `Unknown(unreadable)`、local receipt/aggregateを生成しない |
| `CASE-L8-LCI-56` | private snapshot write boundary | snapshot/minimal objectsはread-only、checker-writableはreceiptと分離したscratchだけ | snapshot mountだけをwritableにする | `denied`、checkerを起動しない |
| `CASE-L8-LCI-57` | receipt write authority | receipt/parent directoryはsandbox外で信頼側supervisorだけが書く | receipt parent directoryだけをsandboxへmountする | `denied`、checkerを起動しない |
| `CASE-L8-LCI-58` | host-side Git version boundary | fixed Git executable identity/digestと2.35.2以降のversionを確認してからreader probeする | versionだけを2.35.1に下げる | `Unknown(unsupported)`、reader Git probe/checkerを開始せず、`false`をhook pathnameとして起動しない |
| `CASE-L8-LCI-59` | host-side Git reader command boundary | global/system config無効、fsmonitor/hook無効、external diff/textconv無効のfixed argvとallowlisted envでclean/source probeを行う | fixed argvから`-c core.fsmonitor=false`を一つ除く | `Rejected(invalid_input)` before Git probe。任意fsmonitor commandを起動しない |
| `CASE-L8-LCI-60` | manifest/result整合 | receiptの`design_manifest_digest`が指すbytesの独立manifest検査が`structure_complete=true`で、`LC-DESIGN-001` execution rowはsuccess | receipt bodyを変えず、独立検査結果だけを`structure_complete=false`にする | 架空のreceipt fieldを要求せず、manifest digestで解決したbytesと検査結果を照合して`Rejected(invalid_input)` before aggregate fold。`Unknown`/aggregate failへ写さない |
| `CASE-L8-LCI-61` | formal target descriptor revision | 保存済みValueのtarget descriptor revision/digestがcurrent targetと完全一致 | head commit/treeは維持しbase_commitだけを別の存在するbaseへ変更する。merge_baseとcanonical descriptor revision/digestは変更後baseから再計算 | 既存K2 lookupの`Stale`。正当なbase変更を同revision異digestの`Unknown(conflict)`にしない |
| `CASE-L8-LCI-62` | bullet definition selector | 宣言range内に`- **K1-I1 label**`、range外と本文に参照tokenがある | range内の定義行だけを削除 | `Unknown(missing_input)`、本文やrange外から定義を補わずchecker/execution/receipt未作成 |
| `CASE-L8-LCI-63` | edge identity | 各edge_idは一意でdispositionから同source edgeへ解決 | 一つのedge_idだけを既存IDへ重複させる | `Unknown(conflict)`、構造preflight不成立、checker/execution/receipt未作成 |
| `CASE-L8-LCI-64` | disposition edge reference | edge_idsは実在する同source edgeを指す | 一つのedge_id参照だけを未登録IDへ変更 | `Unknown(missing_input)`、構造preflight不成立、checker/execution/receipt未作成 |
| `CASE-L8-LCI-65` | outcome locator | verifier path/range/IDと非空期待値columnが一意に解決 | outcome_columnだけをtable列数の外へ変更 | `Unknown(missing_input)`、構造preflight不成立、checker/execution/receipt未作成。期待値を本文から推測しない |
| `CASE-L8-LCI-66` | literal expansion | 略記literalにexact ID列の固定対応がある | そのliteralの対応表entryだけを削除 | `Unknown(missing_input)`、regexで補完せずchecker/execution/receipt未作成 |
| `CASE-L8-LCI-67` | child bytecode環境 | fixed argv `python3 -B`に加え親子envに`PYTHONDONTWRITEBYTECODE=1`がある | 固定envからその一項だけを除く | spawn前`Rejected(invalid_input)`、親checker/childとも起動しない。envで`-B`を代替しない |
| `CASE-L8-LCI-68` | section locator | exact_headingが既存見出し全文へ一意に戻り、section_locatorとして通常IDと分離される | 文書側の見出し一つだけを変更しmanifest literalを維持 | `Unknown(missing_input)`、番号やcode commentから合成IDを補わずchecker/execution/receipt未作成 |
| `CASE-L8-LCI-69` | `heading_id` selector | range内の一意な見出しliteralとmanifestのexact `literal_expansions` entryが既存ID一件へ対応する。fenced code内の同文は無視する | 同じheading literalをrange内の通常Markdown headingとして一行だけ複製する | `Unknown(conflict)`、先頭/末尾の一方を選ばずchecker/execution/receipt未作成 |
| `CASE-L8-LCI-70` | `heading_id` missing literal | manifestで要求したheading literalがrange内に一度だけ存在し、exact expansion entryもある | heading literalの行だけを削除する | `Unknown(missing_input)`、fenced codeやrange外から補わずchecker/execution/receipt未作成 |
| `CASE-L8-LCI-71` | `heading_id` undeclared mapping | range内にheadingがあり、必要な固定IDと他の構造定義は揃う | そのheading literalの`literal_expansions` entryだけをmanifestから除く | `Unknown(missing_input)`、heading本文からIDを推測せずchecker/execution/receipt未作成 |
| `CASE-L8-LCI-72` | `heading_id` empty expansion | manifest entryはあり、`ids`に必要な既存IDが一件ある | `ids`だけを空配列にする | `Unknown(missing_input)`、空集合を充足扱いせずchecker/execution/receipt未作成 |
| `CASE-L8-LCI-73` | `heading_id` duplicate expansion | 各literalが一意で、展開先の既存IDも相互に異なる | 一つの既存IDだけを別entryの`ids`にも追加する | `Unknown(conflict)`、重複定義を一件へ縮約せずchecker/execution/receipt未作成 |
| `CASE-L8-LCI-74` | role別Git identityと共通設定 | local `executables.git`とprovider `executables.provider_git`が各々の合成binary bytes/versionと一致し、同じtarget/config digest/DIFF argv/Git policyでstate success | 変異なしの独立正常baseline | local receiptにlocal identity、provider resultにprovider identityを保持し、state parityがtrue。identity相互同一性は要求しない |
| `CASE-L8-LCI-75` | provider Git初回identity preflight | trusted configの`provider_git`がexact pin済みで、provider入口のtrusted固定設定が解決した既存Gitのname/version/bytes SHAを読み取れる | provider pinだけを`null`にする | identity tupleだけを診断dataへ示す`Unobserved(not_run)`。target/source/status/diff Git operationなし、positive `ProviderResult`なし |
| `CASE-L8-LCI-76` | provider Git digest pin | provider binary bytes digestがtrusted `provider_git` pinと一致し、target/receiptが有効 | provider binary digestだけをpinと異ならせる | `Unknown(unsupported)`、target/source/status/diff probe前に停止しlocal Gitへfallbackしない |
| `CASE-L8-LCI-77` | provider Git version pin | provider binary name/version/digestがpinと一致 | provider versionだけをpinと異ならせる | `Unknown(unsupported)`、target/source/status/diff probe前に停止 |
| `CASE-L8-LCI-78` | shared config digest pin | local receiptとprovider config digestが同じrole pin mapに基づく | current configのprovider pinだけを更新し、旧local receiptを渡す | `Unknown(conflict)`、diffを起動せず新configのlocal receiptを要求 |
| `CASE-L8-LCI-79` | selected result parity | same config digest/target/argv/policyでlocalとproviderの`LC-DIFF-001` stateがsuccess | provider diff stateだけを`fail`にする | `selected_check_parity=false`、positive不可、stateを補正しない |
| `CASE-L8-LCI-80` | bwrap profile identity | 提供環境の既存`bwrap`がprofileのname、opaque version literal、全bytes SHA-256と一致する | 変異なしの独立正常baseline | sandbox preflight後にのみcheckerを起動。system package/upstream provenance保証は含めない |
| `CASE-L8-LCI-81` | bwrap executable bytes | 提供環境binary bytesがtrusted profile digestと一致する | bytes digestだけをpinと不一致にする | `denied`、checker未起動、install/host/別binary fallbackなし |
| `CASE-L8-LCI-82` | bwrap version literal | `--version`のliteral文字列がtrusted profile labelと一致する | version literalだけをpinと不一致にする | `denied`、checker未起動、semantic-version推論なし |
| `CASE-L8-LCI-83` | bwrap binary availability | trusted host-local settingからprofile pinned binaryを解決できる | binary availabilityだけを不成立にする | `denied`、checker未起動、package install/host/別binary fallbackなし |

## 3. GitHubのmerge単位fixture

| ID | L5契約 | 正常入力 | 一点の変異 | 期待結果 |
|---|---|---|---|---|
| `CASE-L8-LCI-29` | dispatch | workflowがdefault branchにあり、明示target/receiptを受ける | workflow未配置 | `Unobserved(not_run)` |
| `CASE-L8-LCI-30` | dispatch cadence | `workflow_dispatch`をmerge単位で一度実施 | `push` triggerを足す | L4の非対象trigger、`Negative` |
| `CASE-L8-LCI-31` | workflow permissions | contents readのみ | write permissionを足す | L4 scope違反、`Negative` |
| `CASE-L8-LCI-32` | dispatch input parsing | environmentからJSONをdataとしてparse | JSON receipt valueにshell metacharacterを含める | 値をdata stringとして保持し、shell評価/起動をしない |
| `CASE-L8-LCI-33` | target binding | event base/headとcheckout commit/treeが一致 | receipt `head_tree`だけを替える | `Stale`、verified claimなし |
| `CASE-L8-LCI-34` | provider limit | 25以下のfield、65,535 chars以下 | payloadを65,536 charsにする | input拒否、`Unobserved(not_run)` |
| `CASE-L8-LCI-35` | selected parity | local/Actions LC-DIFF-001が同base/head/config/settings | Actions側baseだけ別にする | `Unknown(conflict)`、parityなし |
| `CASE-L8-LCI-36` | local-only scope | SCF validate/stale、GOV、design checksはlocal only | Action receiptがいずれかをActions executedと宣言 | `Negative` |
| `CASE-L8-LCI-37` | receipt transport欠落 | compact receiptが提供されparse可能 | receipt inputを欠落 | `Unobserved(not_run)`、結果推定なし |
| `CASE-L8-LCI-38` | external evidence限界 | compact metadata/digests一致、full artifactは外部 | digestだけから実行者真正性をclaim | `Negative`、issuer authenticityは未証明 |
| `CASE-L8-LCI-39` | diff verifier | 同じmerge-base/headのdiff checkがpass | whitespace errorを追加 | `fail`、ローカル同一check結果と比較 |
| `CASE-L8-LCI-40` | branch protection変更禁止 | read-only verifierが完了 | required check setting changeを発行 | `Negative` |
| `CASE-L8-LCI-41` | `LC-SCF-002` stale check | `scfctl.py stale`はstale=0でexit 0 | synthetic upstream digestを変えstaleを一件検出 | step `fail`、他stepは継続、aggregate successなし |
| `CASE-L8-LCI-42` | canonical receipt | sorted UTF-8 JSON LF、body外hash | JSON key順だけを入れ替える | `Rejected(invalid_input)` |

## 4. 判定境界

Local receiptは作成側の報告ではなく、独立reviewとActions receipt verifierが読む証拠候補である。hash一致が証明するのはbytes identityだけであり、署名/issuer anchorがないため実行主体の真正性は証明しない。CI成功をL10/L11、L2採否、merge admission、releaseへ昇格させない。
