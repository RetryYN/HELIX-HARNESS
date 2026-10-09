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

固定入力は対のL5本文SHA-256 `c52d39cfc4ad2bc7469725284db76ed300a9d78806bb05ebafe7ce171a622753`である。

L7 suite oracleの設計入力は`docs/helix-os/L7-unit-test-design/local-ci-unit-test-design.md`の本文SHA-256 `9c69ece956c58c94cd344c8774e02cccb42d2561f86610d97f4f5e36865055c4`に固定する。このpinはL7設計本文の同一性を示し、target tree上のsource参照を増やさず、fixture実行や合格も示さない。

## 1. Fixture規則

全fixtureは一時Git repository、合成UTF-8文書、stub command結果を用いる。旧CLI/hook/runtime/test/CIはfixtureにも含めない。各行は一つの条件だけを変更し、派生値（tree OID、digest、receipt digest、base/head）は変異に合わせ再計算する。受口は期待型まで指定し、unknown/unobservedを合格に読み替えない。

全量planのrequired setは順に`LC-SCF-001` → `LC-SCF-002` → `LC-GOV-001` → `LC-DIFF-001` → `LC-DESIGN-001` → `LC-STAGE1-L7-001`であり、各caseは一つのfieldを変えても他のrequired stepを保持する。一般`CiState` fold vocabularyに`skipped`があっても、この固定6件はselected requiredであるためreceipt schemaでfold前に拒否する。`skipped`を他stateへfoldしてlocal receiptを受理することはない。

## 2. API/receiptの検証fixture

| ID | L5契約 | 正常入力 | 一点の変異 | 期待結果 |
|---|---|---|---|---|
| `CASE-L8-LCI-01` | `resolve_target` | base/head commitとtreeが存在しclean | 必須head refを入力から欠落させる | `Rejected(missing_key)`、CI未実行 |
| `CASE-L8-LCI-02` | `check_clean_checkout` | index/worktree/untracked変更なし | staged fileを一つ追加 | `Stale`、check未開始 |
| `CASE-L8-LCI-03` | target比較 | 開始/終了時のHEAD/treeが一致 | 未開始stepがある時点でHEADを切替 | 未開始stepを`state=stale, started_at=null, finished_at=null, exit_code=null`として6行receiptに保持。第6 suite rowも未開始なら`suite_evidence`なし。既実行evidenceを残しaggregate `stale` |
| `CASE-L8-LCI-04` | `compile_plan` | 固定6 step IDとargvが指定順にある | `LC-DESIGN-001`を削除 | `Unknown(missing_input)`、success不可 |
| `CASE-L8-LCI-05` | `run_local_ci` | 6 fixed runnerすべてexit 0 | SCF validateをexit 1にする | SCF `fail`、他5 stepも実行、aggregate `fail` |
| `CASE-L8-LCI-06` | 固定checker argv境界 | fixed configから作ったargv list、`shell=False`、repo cwd | 呼出側のchecker argv一項へ`; touch ...`相当を追加する | spawn前に`Rejected(invalid_input)`、shellもcheckerも起動しない |
| `CASE-L8-LCI-07` | exit写像 | checkerがexit 0 | exit 2を返す | step `fail`、本文でなくstdout/stderr SHAを保存 |
| `CASE-L8-LCI-08` | supervisor外run中止 | 2 step完了、3つ目processは中止要求後に停止・reapできる状態で、後続stepは未開始 | run全体へのcancel要求だけを加える | 起動中process停止/reap確認後、未開始stepを`state=interrupted, reason=cancelled, started_at=null, finished_at=null, exit_code=null`で残し後続を起動しない。第6 suite rowも未開始なら`suite_evidence`なし。aggregate successなし |
| `CASE-L8-LCI-09` | current checker ref | scfctl/govcheck refがtree bytesと一致 | govcheck bytesを変更しdigest不一致にする | `Stale`、govcheckを起動しない |
| `CASE-L8-LCI-10` | 実行前後のchecker束縛 | 開始/終了のchecker digestが一致 | 最終step後にchecker digestだけを変える | 外側`Stale`、既実行evidenceは診断artifactへ保持、LocalCiReceiptを発行せずaggregateだけを上書きしない |
| `CASE-L8-LCI-11` | `SourceSnapshotReader` | treeから宣言blobを読む | pathをsymlinkへ置換 | `Unknown(conflict)`、link先を辿らない |
| `CASE-L8-LCI-12` | 固定corpus | 現行mainのCommon Kernel 6文書と3 pair PR統合後のlocal-CI 6文書、計12文書が登録済み | current doc pathを一つ欠落 | `Unknown(missing_input)`、全量検査を主張しない。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-13` | definition parser | IDを定義domainに一度、参照domainに別記 | 参照domainだけにIDを置く | `Unknown(missing_input)`、定義を作らない。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-14` | reference parser | referenceが一意なdefinitionへ解決 | definitionを二重化 | `Unknown(conflict)`。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-15` | 明示coverage | L4 invariant→L9 IV edgeとfixture定義がある | verifier IDの定義行を削除 | `Unknown(missing_input)`。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-16` | coverage意味 | L6 function→L7 oracle edgeが一意 | edge先IDを別fixtureへ差替え | `Unknown(conflict)`。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-17` | `U-LCI-01..04` unsupported disposition | 4件を理由付きscope外non-pass inventoryに記録 | `U-LCI-01`をpassへ変える | `Rejected(invalid_input)`。`pass`はUnsupportedItemの型にないためpreflightで拒否する。正常入力では他3件も別fieldのnon-passで保持し、範囲外残余のみで固定6 stepをfailにしない |
| `CASE-L8-LCI-18` | HistoricalPin | full-file hashと指定line-span hashを再計算 | sourceの1行だけ変えfull digestを据置 | full pin `Unknown(conflict)` |
| `CASE-L8-LCI-19` | HistoricalPin span照合 | 指定line bytesからspan digestを再計算 | partial line spanのdigestを全体file digestへ差替え | `Unknown(conflict)`、実際のspan bytesで判定 |
| `CASE-L8-LCI-20` | source kind | archive pin/audit snapshotをhistoricalとして記録 | archive pathをcurrent linkに昇格 | `Unknown(unregistered)` |
| `CASE-L8-LCI-21` | repository境界 | external temp pathがrepo root外 | repo配下をoutput pathにする | `Rejected(invalid_input)`、書込みなし |
| `CASE-L8-LCI-22` | canonical receipt | sorted UTF-8 JSON、LF、body外hash | 一行をCRLFへ変える | `Rejected(invalid_input)` |
| `CASE-L8-LCI-23` | 自己参照禁止 | receiptに自身のdigest fieldがない | `receipt_digest`を本文へ追加 | `Rejected(invalid_input)` |
| `CASE-L8-LCI-24` | formal receipt schema | current sourceからformal key inputsを構成し、receipt内にtarget/contract/config/manifest/checkers/runtime/6 steps/stateがある | receipt内`checker_refs` fieldだけを欠落 | `Rejected(invalid_input)`。formal key inputsは別に構成済みで、CLI診断にもK1結果classを付けない |
| `CASE-L8-LCI-25` | privacy | outputはSHA-256だけ、cwdは相対path | stdout本文fieldを追加 | `Rejected(invalid_input)` |
| `CASE-L8-LCI-26` | selected required state | 6件すべてsuccess、すべてplan-selected required | 一checkを`skipped`へ変えてreceipt validatorへ渡す | `Rejected(invalid_input)`、aggregate `skipped`を作らない |
| `CASE-L8-LCI-27` | config digest | 同じargv/selection/manifest versionから同digest | 同一target receiptのconfig fieldだけを変える | `Unknown(conflict)` |
| `CASE-L8-LCI-28` | result authority | 全static checkがsuccess | resultをmerge-allowedへ写す | `Negative`、authority昇格なし |
| `CASE-L8-LCI-43` | receiptのpath privacy | 外部cache/tempへreceiptを出力し、本文に絶対checkout pathを含めない | receipt内の一つのpath fieldだけを絶対checkout pathにする | `Rejected(invalid_input)`、receipt本文に絶対pathを残さない |
| `CASE-L8-LCI-44` | formal K1 key構成 | operation/version、current target SubjectRef、scope、全required source refsを既存K2型で構成 | formal API inputからtarget SubjectRefを一つ欠落 | `Rejected(missing_key)`、架空refやK1 receiptを作らない。CLI diagnostic outcomeはK1 resultと呼ばない |
| `CASE-L8-LCI-45` | formal K1 key後のsource read | formal APIでrequired refsを構成し固定target tree bytesを読める | 一つのGit blob readだけをunavailableにする | `Unknown(unreadable)`、未読sourceをsuccessにしない。CLIは読取診断のみを出す |
| `CASE-L8-LCI-46` | plan/execution分離 | plan state=`success`、execution state=`fail`、両者別field | plan stateだけをexecution `fail`へ変更する | formal receipt validator `Rejected(invalid_input)`、CLI診断はK1 classを主張しない |
| `CASE-L8-LCI-47` | isolated target snapshot | exact target必要blobs/minimal objectsとbaseline ancestorsだけのself-contained snapshot、credential-free private Git config、original checkout/`.git`なし | sandbox mount listへoriginal `.git/config`を加える | `denied`、checkerを起動しない。全6行は`started_at=null, finished_at=null, exit_code=null`、suite rowの`suite_evidence`不在でreceiptへ記録 |
| `CASE-L8-LCI-48` | network boundary | checkerはhostと共有しない専用network namespace内で起動し、外部接続性は無効 | 専用namespace分離を一つ取り除きhost network namespaceを共有する | preflight `denied`、checkerを起動しない。全6行は`started_at=null, finished_at=null, exit_code=null`、suite rowの`suite_evidence`不在でreceiptへ記録 |
| `CASE-L8-LCI-49` | fixed Python argv preflight | checker argvは設計固定の`python3 -B` | argvから`-B`だけを除く | `Rejected(invalid_input)` before spawn。readonly境界不成立とは推論しない |
| `CASE-L8-LCI-50` | child process timeout supervision | govcheckと`gen_rulebook.py --check` childを同じgroupで監視 | timeout後childだけを生存させる | `denied`、child停止/reap確認まで後続stepを開始しない。未開始stepはnull時刻/exitの行でreceiptへ保持し、第6 suite rowが未開始なら`suite_evidence`なし |
| `CASE-L8-LCI-51` | timeout完了 | checkerが300秒候補timeout前に正常終了でき、process treeの停止・reapを確認する | fixed checkerをtimeout超過まで実行させる | `state=interrupted, reason=timeout`、process tree停止/reap後に後続stepを実行しdiagnosticを保持。completeなsuite resultが無い場合はsuite_evidenceを省略しpartial diagnosticへ残す |
| `CASE-L8-LCI-52` | transitive checker ref | `govcheck.py`と`gen_rulebook.py`双方のdigestがcurrent targetと一致 | child checker bytesだけ変更 | `Stale`、govcheck未起動 |
| `CASE-L8-LCI-53` | known non-pass disposition | manifestは`RL-V1`/`RL-K3` not_exercised、`RL-D4`から`IV-RL-56`/`IV-RL-57`/`IV-RL-59`へのpartial edge、別fieldのD4 code-graph extraction scopeout、`RL-T3` partial edgeを記録 | `RL-D4`の`IV-RL-57` edgeを欠落 | `Unknown(missing_input)`、structure completeとしない。snapshot/planの構造preflightでrun全体の外側結果として返し、checker/execution/receiptは未作成 |
| `CASE-L8-LCI-54` | non-pass保持 | `RL-V1`/`RL-K3`は`not_exercised`、`RL-D4`の3件の設計edgeは`partial`で抽出scopeoutは別field、`RL-T3`はclassifier edgeだけの`partial`、U-LCI残余は別inventory | `RL-T3` dispositionだけを`pass`へ変える | `Rejected(invalid_input)`、CI構造successから契約passを生成しない |
| `CASE-L8-LCI-55` | dispatch envelope parse | workflow開始後、JSON envelope parserが構文を読める | envelope JSON構文だけを壊す | provider diagnostic `Unknown(unreadable)`、local receipt/aggregateを生成しない |
| `CASE-L8-LCI-56` | private snapshot write boundary | snapshot/minimal objectsはread-only、checker-writableはreceiptと分離したscratchだけ | snapshot mountだけをwritableにする | `denied`、checkerを起動しない。全6行はnull時刻/exit、第6 suite rowの`suite_evidence`不在でreceiptへ記録 |
| `CASE-L8-LCI-57` | receipt write authority | receipt/parent directoryはsandbox外で信頼側supervisorだけが書く | receipt parent directoryだけをsandboxへmountする | `denied`、checkerを起動しない。全6行はnull時刻/exit、第6 suite rowの`suite_evidence`不在でreceiptへ記録 |
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
| `CASE-L8-LCI-84` | 必須parent AC applicability記録 | `parent_ac_coverage`にOS-020-01/03が各一件あり、各state/reasonがL4 §1と一致 | `AC-OS-020-03` rowだけをlistから削除する | `Unknown(missing_input)`、LC-DESIGN-001非肯定、execution/receiptなし |
| `CASE-L8-LCI-85` | parent ACの非昇格 | 必須2行のID/state/reasonがL4 §1と一致 | `AC-OS-020-01.state`だけを`pass`へ変える | `Rejected(invalid_input)`、parent ACをpassにせずexecution/receiptなし |
| `CASE-L8-LCI-86` | Common Kernel L5 source locator | K1/K2/K3/K5/K4-G3の5 exact_heading locatorが各一件あり、required source inventoryは193件 | K2 locatorのdefinition rangeを一つ削除 | snapshot/plan preflightでrun全体の外側`Unknown(missing_input)`、checker/execution/receiptなし。section locatorを意味上のAPI IDへ変換しない |
| `CASE-L8-LCI-87` | Common Kernel L8 literal expansion | K1/K2のcase列literal expansionがそれぞれ111/53 fixture IDを定義し、各IDは同pairのraw rowへ一意に戻る | K1 expansionの一つの中間suffix IDだけを対応表から削除 | snapshot/plan preflightでrun全体の外側`Unknown(missing_input)`、省略記法を推測せずchecker/execution/receiptなし |
| `CASE-L8-LCI-88` | Common Kernel K1/K2 typed referencesとpair ownership | L8 K1/K2各rowの第2列L9 oracle、第3列L4 refsをtyped referenceに保ち、coverage sourceはexpected_pairの対応L5 locatorだけ | 一つのK1 rowの第3列展開先へK2 locatorを一つ指定 | snapshot/plan preflightでrun全体の外側`Unknown(conflict)`、L9/L4 referenceをL5 sourceへ昇格せずchecker/execution/receiptなし |
| `CASE-L8-LCI-89` | Common Kernel L5→L8 required edges | 2 L5 locatorから164展開fixture IDへ各一件の明示edgeがありdispositionが全edgeを参照 | 一つのK2 destination edgeと同edge IDのdisposition referenceを同時削除（同sourceの別edgeは残す） | snapshot/plan preflightでrun全体の外側`Unknown(missing_input)`、他edgeで代替せずchecker/execution/receiptなし |
| `CASE-L8-LCI-90` | Common Kernel OutcomeRef | expanded fixture IDがL8 definition tableの同じID列セルを持つraw rowへ一意に束縛され、K1/K2は5列目、K3は6列目、K5は4列目の非空cellを参照 | 一つのexpanded fixture IDのrow bindingだけを別raw rowへ変更 | snapshot/plan preflightでrun全体の外側`Unknown(conflict)`、期待結果を別行から流用せずchecker/execution/receiptなし |
| `CASE-L8-LCI-91` | Common Kernel L8 column 3 L4 typed references | `K1-I*`/`K2-I*`等の明記されたL4 invariantはL4 definitionへのreferenceとして保持し、L5→L8 sourceはsection locatorだけ | 一つの明記L4 invariant IDをL5→L8 `source_id`として登録 | snapshot/plan preflightでrun全体の外側`Unknown(conflict)`、既存L4→L9 source relationと混同せずchecker/execution/receiptなし |
| `CASE-L8-LCI-92` | K3/K5 locatorと固定inventory | K1/K2の164 IDを維持し、K3 locator/range/194 IDs、K5 locator/range/91 IDsを別々に宣言 | L5 K3 locatorの`range_id`だけを既存K5 locatorの`range_id`へ変更する | `Unknown(conflict)`、既存の一般重複range検査でrun-level preflight停止、execution/receiptなし。独立range削除は別負例で`Unknown(missing_input)`とする |
| `CASE-L8-LCI-93` | K3/K5 verifier IDの独立保持 | 各K3/K5 IDがraw L8 rowと独立固定inventoryに一致する | `L8-K5-17-CLOSED-PARTIAL-READ`のraw table row、対応coverage edge、disposition edge参照を同時に削除する。独立固定K5 inventoryは変更しない。K5のraw IDセルは全件直書きでliteral expansionはない | `Unknown(missing_input)`、独立K5 inventoryとの差としてrun-level preflightで停止 |
| `CASE-L8-LCI-94` | K3/K5 edge・typed reference・OutcomeRef | 各fixtureへ正しいL5 locatorのedgeがあり、第2/3列はtyped reference、OutcomeRefはrange固有の期待値列（K1/K2は5列目、K3は6列目、K5は4列目） | 一つのK3 fixture edgeのsource locatorだけをK5 locatorへ変更する | `Unknown(conflict)`、checker/execution/receiptなし。別pairやrowから補わない |
| `CASE-L8-LCI-95` | K3/K5 verifier IDの独立保持 | K3/K5全IDがraw L8 row、literal expansion、独立固定inventoryへ結び付く | `L8-K3-14-ROLE-ALIAS-COEXISTS`をmanifest literal expansionから除き、対応raw row、coverage edge、disposition edge参照も同時に削除する。独立固定K3 inventoryは変更しない | `Unknown(missing_input)`、独立K3 inventoryとの差としてrun-level preflightで停止 |

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


## 5. 開発source L7 suiteのreceipt/runner integration cases

各caseはtarget-tree内のsource-only inventoryを使う。registration状態は入力にも成功条件にも含めない。discovered identitiesとformal ID mappingは別々に検査する。

| Case ID | 契約 | 正常入力 | 一点の変異 | 期待結果 |
|---|---|---|---|---|
| CASE-L8-LCI-100 | Core source-only baseline | exact target treeに9 Core kernel source/test refs、505 formal-ID closure（495 callable mapping＋10 K6 not-exercised dispositions）、586 Core expected discovery identities（sorted-ID SHA-256 `aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d`）、runner identityがあり、pack declaration/registration recordは無い | 変異なし | inventory expected setと一致するdiscovered/executed IDsをfull external artifactへ保持しcompact summaryで束縛。passならcandidate suite row success、registered/usable claimなし。旧baselineの196件/count digestをcurrent expected値へ流用しない |
| CASE-L8-LCI-101 | current target source binding | implementation/test refsはhead tree bytes | test_k1.py blob refだけをtarget tree外sourceへ差し替 | Unknown(conflict)、runner前停止、cbce source fallbackなし |
| CASE-L8-LCI-102 | formal-to-callable and not-exercised closure | 505 formal IDsは495 fixed callable mapping rowsと10別dispositionへ分かれ、stub/partialをprimary coverageへ昇格しない | K6の`CK-K6-UT-035.coverage_kind`だけを`primary_callable`へ変更し、K6/full mapping digestを再計算 | runner起動後、discovery/execution前のfixed K6 inventory検査が`Unknown(conflict)`となる。F05はstep failとpartial diagnosticを保持し、complete evidenceを作らない。dispositionや別rowで補わない |
| CASE-L8-LCI-103 | actual discovery identity set | current inventory expected set/count/sorted-ID digestがexact source closureに束縛され、runner discovery IDsと一致 | runner後のdiscovered ID一件だけを別IDへ置換 | `Unknown(conflict)`診断を保持しF05がsuite `CheckExecution.state=fail`へ写す。complete resultを回収できずcompact `suite_evidence`なしで部分diagnosticを残す。outer Unknown receiptにしない。count一致だけでは受理しない |
| CASE-L8-LCI-104 | actual execution set | discovery/execution listsがcurrent inventory expected identitiesを各一度含む | spawned runnerのexecuted listから一identityだけを欠落させる | `CheckExecution.state=fail`、complete suite resultではないためcompact `suite_evidence`なしで部分diagnosticを保持する。IV-LCI-78と同じ実行後payload検証でsuite step failureとなる。success不可 |
| CASE-L8-LCI-105 | unittest skip | 全expected IDsがdiscovered | 一identityだけをskipにする | step fail、skip identityを保持 |
| CASE-L8-LCI-106 | unittest failure | 全expected IDsがdiscovered | 一identityだけをfailureにする | step fail、full artifactの`failed_ids`へ該当identityを保持 |
| CASE-L8-LCI-107 | runner/toolchain binding | fixed runner/toolchain refsはcurrent target/configに一致 | runner identity bytes digestだけをfixed source/config identityと不一致にする | `Unknown(conflict)` before spawn。version/profile非対応は別の`Unknown(unsupported)`境界 |
| CASE-L8-LCI-108 | full identity artifact | external artifactがactual discovery/execution IDsとtarget/source/mapping refsを保持 | discovered_test_idsだけを保存前payloadから除く | Unknown(conflict)、count/digestだけではfull evidenceにならない。F05はsuite step fail、compact summaryなし、partial diagnosticを保持する。providerは保存後artifactを再取得しない。 |
| CASE-L8-LCI-109 | partial coverage boundary | K1/K2/K3/K5/K6 candidate resultとother Stage 1 dispositionsは別field | candidate successをstage1_l7_complete=trueへ投影 | Negative、Stage 1全L7/OS-020/HARNESS passを生成しない |
| CASE-L8-LCI-110 | current-source missing | suite rowは固定formal IDsを参照、先行5 check evidenceを外部diagnosticに保持 | target treeからtest_k2.pyを欠落させる | run_local_ci外側Unknown(missing_input)、先行5件をdiagnosticへ保持、suite row/receiptなし、runner未起動、cbce/branch/host sourceを使わない |
| CASE-L8-LCI-111 | compact suite summary | receipt summaryはartifact SHA、discovery/execution count+ID-set digest、mapping digest、target/source refsを持つ | executed ID-set digest fieldだけを削除 | Rejected(invalid_input)、compact provider input不完全、positive不可 |
| CASE-L8-LCI-112 | full execution identity artifact | external artifactが実discovered/executed ID arraysとtarget/source/mapping refsを保持 | executed_test_ids配列だけを保存前payloadから除く | Unknown(conflict)、full evidence不完全、success receiptなし。F05はsuite step fail、compact summaryなし、partial diagnosticを保持する。providerは保存後artifactを再取得しない。 |
| CASE-L8-LCI-118 | K3 implementation source completeness | current target treeに`permission.py`のexact source refがある | exact target treeから`permission.py` blobだけを読めなくする | Unknown(missing_input)、先行5 checkのpartial diagnosticを保持し、第6 check spawn前に停止。他のsource blobで補わない |
| CASE-L8-LCI-119 | K3 test module completeness | current target treeに`test_k3.py`のexact source refがある | exact target treeから`test_k3.py` blobだけを読めなくする | Unknown(missing_input)、先行5 checkのpartial diagnosticを保持してrunner spawn前停止し、K1/K2 modulesのみを実行しない |
| CASE-L8-LCI-120 | target L7 formal ID completeness | target L7本文は固定K3 formal IDsを全て列挙する | target L7本文から`CK-K3-UT-001`の行だけを除く | Unknown(conflict)、target文書と固定inventoryの不一致としてsuite row起動前に停止。inventory source自体の欠落とは区別 |
| CASE-L8-LCI-121 | K3 formal mapping identity closure | 194 K3 formal mapping identitiesはfixed identity valuesに一致 | 一rowのunittest_identityだけをunknown IDへ置換し、mutation側mapping digestを再計算 | runner起動後のfixed inventory検査がUnknown(conflict)。unittest discovery/execution前のnoncomplete診断をF05がstep fail/partial diagnosticとして保持し、complete evidenceなし |
| CASE-L8-LCI-122 | K3 mapping uniqueness | K3 formal IDは一意なmapping rowへ結び付く | 一rowのformal_l7_idだけを別rowと重複させ、mutation側mapping digestを再計算 | runner起動後のfixed inventory検査がUnknown(conflict)。unittest discovery/execution前のnoncomplete診断をF05がstep fail/partial diagnosticとして保持し、complete evidenceなし |
| CASE-L8-LCI-123 | K3 discovery closure | fixed expected setに586件、うちK3が220件 | actual discoveryからK3 identity `test_k3.K3FormalFixtures.test_CK_K3_UT_001`だけを除く | Unknown(conflict)診断をF05がsuite step failへ写し、full/compact complete evidenceなしのpartial diagnosticを保持 |
| CASE-L8-LCI-124 | discovery identity uniqueness | actual discovery identity setは一意 | K3 identity `test_k3.K3FormalFixtures.test_CK_K3_UT_001`だけを重複させる | Unknown(conflict)、重複をdedupせずsuite step fail、complete evidenceなし |
| CASE-L8-LCI-125 | 結果frameの上限 | Core 586件だけの比較値はbody/capture/helper 90,514/90,515/121,474 bytes。現在の合成613 identities（Core 586＋補助27）を5つの排他的outcome familyへ分けた最大合法値は99,820/99,821/133,870 bytes。1/3/5 family形を比較する | 613件の最大合法bodyに1 byteを加え99,821 bytesにする | `Unknown(conflict)`の部分diagnosticを保持し、切詰め/overflowからcomplete artifact/compact suite evidenceを作らない。現在のscaffold runtime上限は`source_l7_runner.py` body 99,820 bytes、`runner.py` LF付きcapture 99,821 bytes、supervisor frame 134,000 bytes。586 Core-only比較時点の90,514/90,515/122,000 bytesは履歴値として保持する |
| CASE-L8-LCI-126 | K5 implementation source completeness | exact target treeに`journal.py` refがあり、固定SHA-256と一致 | `journal.py` blobだけをsource refsから除く | `Unknown(missing_input)`、先行5 check diagnosticを保持してsuite spawn前に停止。IV-LCI-86のmissing source境界に対応 |
| CASE-L8-LCI-127 | K5 test module completeness | exact target treeに`test_k5.py` refがあり、固定SHA-256と一致 | `test_k5.py` blobだけをsource refsから除く | `Unknown(missing_input)`、他moduleで代替せずsuite spawn前に停止。IV-LCI-86のmissing source境界に対応 |
| CASE-L8-LCI-128 | target L7 K5 formal ID completeness | target L7本文に固定K5 formal IDs 91件が存在 | `CK-K5-UT-001`の定義行だけをtarget L7から除く | `Unknown(conflict)`、target L7と固定inventoryの不一致。IV-LCI-94のK3 oracleをK5へ適用した同型確認 |
| CASE-L8-LCI-129 | K5 mapping coverage-kind binding | 91 K5 mapping rowsの全fieldがfixed mappingに一致 | `CK-K5-UT-001.coverage_kind`だけをstubへ変え、mutation側digestを再計算 | runner discovery前の`Unknown(conflict)`、主/fixture stub分類を読み替えない。IV-LCI-95のK3 mapping-value oracleをK5へ適用した同型確認 |
| CASE-L8-LCI-130 | suite summary identity migration | compact summaryのsuite_idはcurrent suite `stage1-l7-source` | suite_idだけをCore-only historical id `common-kernel-k1-k2-k3-k5-k6`へ変更 | `Rejected(invalid_input)`、旧suite summaryをK6-inclusive suite evidenceとして受け入れない。IV-LCI-84 compact summary schema boundary |
| CASE-L8-LCI-113 | K4/G3 fixed destination inventory | K4=51/G3=22の73 IDがraw L8 rowとK4/G3 L5 locator edgeへ一対一に結び付く | `L8-G3-04-RECORD-ONLY-NO-ACCEPTANCE-OUTPUT`のraw rowだけを除く | `Unknown(missing_input)`、隣接IDで補わずsuite実行/receiptなし。IV-LCI-87と同じdesign-manifest境界 |
| CASE-L8-LCI-114 | K4/G3 extra ID拒否 | raw definition setは固定73件と一致する | `L8-K4-EXTRA`行だけを追加 | `Unknown(conflict)`、固定inventory外IDを受け入れない。IV-LCI-88と同じdesign-manifest境界 |
| CASE-L8-LCI-115 | K4/G3 duplicate row拒否 | 各K4/G3 IDは一意なraw rowへbindする | `L8-K4-01-COMPLETE` raw rowだけを複製 | `Unknown(conflict)`、rowを選び分けない。IV-LCI-89と同じdesign-manifest境界 |
| CASE-L8-LCI-116 | K4/G3 edge pair ownership | edge sourceはK4/G3 locator、outcomeは同raw row第4列 | `L8-K4-01-COMPLETE` edge sourceだけをK5 locatorへ替える | `Unknown(conflict)`、他componentのedgeで代替しない。IV-LCI-90と同じdesign-manifest境界 |
| CASE-L8-LCI-117 | K4/G3 L5 locator/range completeness | K4/G3 locator、definition/reference ranges、73 edgesとdispositionが固定inventoryに一致 | K4/G3 L5 definition rangeだけをmanifestから除く | `Unknown(missing_input)`、suite実行/receiptなし。IV-LCI-91と同じdesign-manifest境界 |

CASE-L8-LCI-105/106のoutcome変異はerror、expected failure、unexpected successも個別に含む。full artifactに5 outcome組のID配列を保持し、compactには各countだけを保持する。CASE-L8-LCI-103/104はbool count、extra field、count/ID矛盾、過大frame、不正JSON、未開始結果、5 outcome空の非zero exitも個別に拒む。CASE-L8-LCI-102は未知placeholder値/余分なsuffixの拒否を含む。CASE-L8-LCI-108/112は作成前payloadの検証を対象とし、mode不正、symlink ancestor、repo内path、digest名collision、atomic link失敗は保存失敗としてpositiveを出さない。XDG未設定時はuid別固定private rootへ保存する。CASE-L8-LCI-101/110では準備段階のconflict/missing_input双方が先行5件のpartial diagnosticを保持し、suite行/receiptを生成しない。

### 5.1 3 partition identity cases

次のcasesは既存LC-STAGE1-L7-001内の補助partitionを検証する。Core 586 identities、505 formal IDs、495 mapping、10 K6 dispositionとそのdigestは既存契約のまま固定される。Supplemental identitiesはL5 §8.1の27件だけである。現main `eeb6ae71569837f914c145fb885193a8c5971b83`のsource-only設計候補では、SECURITY 10件、CONNECT 4件、Common Kernel K4/G3 14件を機構helper partitionへ置く。これらはformal fixture pass、owner接続、pack登録を意味しない。機構formal ID trace/status/owner-return locatorは実行IDやformal mappingとは別のsource-reference objectである。

| Case ID | 契約 | 正常入力 | 一点の変異 | 期待結果 |
|---|---|---|---|---|
| `CASE-L8-LCI-131` | Core/product/helper 3 partition baseline | exact target treeにCore 9 code/test refs+2 L6/L7 refs、product supplement 8 code/test refs+8 L6/L7 refsとhelper16 code/test refs+corpus全体で14 unique L6/L7 pathsがあり、Core586、product27、helper103が別digest/namespaceで固定される。三者のdisjoint unionは716件・SHA-256 `a673e0343f8f2b91f78bc1c13785b5d2d44f7efb6c8dbdbf65cd4af5ae34cad4`。formal locator・元status cell・owner return locatorは各機構L7の原文refsとして保持される | 変異なし | Core 586、製品補助27、機構helper103を別set/digestで照合し、三者のdisjoint union 716 identitiesを期待する。505 closure/495 mapping/K6 10 dispositionsと既存product27 digestは不変。formal L7 mappingの増加なし。これは設計候補であり実行成功ではない |
| `CASE-L8-LCI-132` | supplemental identity completeness | 上記27 supplement IDsがすべて一意 | `SUP-BRAIN-001`だけを固定expected setから除く | `Unknown(missing_input)`、機構を部分subsetへ縮退せず、suiteをcomplete/positiveとしない |
| `CASE-L8-LCI-133` | fixed supplemental closure | fixed setはBRAIN/LABO/HARNESS/INFRAの27件 | 既存SECURITY module内の未宣言class.method identityを一件だけ追加 | `Unknown(conflict)`、未登録mechanismをscan・自動追加しない |
| `CASE-L8-LCI-134` | supplement ID uniqueness | 各supplemental IDは一意 | `SUP-LABO-001` identity rowだけを重複させる | `Unknown(conflict)`、duplicateをdeduplicateして実行しない |
| `CASE-L8-LCI-135` | partition identity separation | Core 586 ID集合とSupplemental 27 ID集合は別partitionで互いに重ならない | `SUP-INFRA-001`の`unittest_identity`だけを既存Core identityに一致させる | `Unknown(conflict)`、重複identityを一度に畳まず、片方を黙って選択しない |
| `CASE-L8-LCI-136` | mechanism formal locator/status source binding | mechanism formal IDとその元L7 status cell refは固定source L7 rowを指す | BRAIN formal locator一件のstatus cell refだけを別rowへ差し替える | `Unknown(conflict)`、raw status/status literalを合成・正規化せず、formal IDから補助IDへのedgeを作らない |
| `CASE-L8-LCI-137` | owner return locator preservation | source L7 rowがowner return locatorを明記する場合、そのexact source cell refを保持する。明記しないrowは`NotDeclaredBySource`を保持する | 一件のdeclared owner return refだけを別L7 rowのlocatorへ差し替える | `Unknown(conflict)`、owner不明を解消済みへ変換せず、source refを固定する |
| `CASE-L8-LCI-138` | formal/supplemental type separation | SupplementalTestIdentityはL5 §8.1の閉じたfield setを持ち、formal IDは持たない | `SUP-HARNESS-001` rowへ`formal_l7_id` fieldだけを追加する | `Rejected(invalid_input)`、正式bindingを新設しない |
| `CASE-L8-LCI-139` | required supplemental source refs | helper16 implementation/test refsと14 unique L6/L7 pathsをexact target treeから読める | `test_resource_projection.py` helper refだけをtarget source setから除く | 既存pre-spawn `Unknown(missing_input)`、subset実行・suite row success・positive receiptなし |
| `CASE-L8-LCI-140` | closed supplemental target setは4機構27件で、CONNECTの4件を含めない | BRAIN/LABO/HARNESS/INFRAの27 supplemental IDsだけが固定setにある | 既存CONNECT module内の未宣言class.method identityを一件だけ固定setへ追加する | `Unknown(conflict)`、未宣言CONNECT methodをscan/登録しない |
| `CASE-L8-LCI-141` | closed supplemental target setは4機構27件で、Common Kernel K4/G3の14件を含めない | BRAIN/LABO/HARNESS/INFRAの27 supplemental IDsだけが固定setにある | 既存K4/G3 module内の未宣言class.method identityを一件だけ固定setへ追加する | `Unknown(conflict)`、未宣言K4/G3 methodをscan/登録しない |

| `CASE-L8-LCI-142` | helper103 identity completeness | Core586・製品補助27・helper103の固定set/digestがtarget bytesと一致する | helper `SUP-CK-K9-001` callable一件だけをinventoryから欠落させる | `Unknown(missing_input)`、subset execution/complete artifactなし |
| `CASE-L8-LCI-143` | helper source/test bytes binding | 16 helper source/test refsが固定SHAと一致する | `_private_resource_projection.py`のbytesだけを変更する | `Unknown(conflict)`、suite spawn前に停止 |
| `CASE-L8-LCI-144` | paired document closure | SECURITYを含む14 unique L6/L7 pathsがtarget treeにある | SECURITY L7 paired refだけをrequired refsから除く | `Unknown(missing_input)`、helper partitionを実行しない |
| `CASE-L8-LCI-145` | helper identity uniqueness | helper identity setは一意である | `SUP-CK-K10-001` identity rowだけを二重にする | `Unknown(conflict)`、deduplicateなし |
| `CASE-L8-LCI-146` | partition disjointness | Core586・製品補助27・helper103のsetは相互にdisjointである | helper identity一件だけをCore identityと同じ値にする | `Unknown(conflict)`、partition collisionとして停止 |
| `CASE-L8-LCI-147` | closed helper alias set | helper alias inventoryは103件で閉じている | K8 fixed moduleに未宣言method identityを一件だけ追加する | `Unknown(conflict)`、自動scanなし |
| `CASE-L8-LCI-148` | helper/formal type separation | helper identity schemaにformal ID fieldはない | `SUP-CK-K8-001`へ`formal_l7_id`だけを追加する | `Rejected(invalid_input)`、formal mappingなし |
| `CASE-L8-LCI-149` | complete result identity closure | expected/discovered/executed ID setは各partitionで一致する | helper executed ID arrayから一件だけを落とす | `Unknown(conflict)`、complete summary/positive receiptなし |
| `CASE-L8-LCI-150` | bounded 716 result frame | 最大合法body/capture/frameは134,755/134,756/180,450 bytes、候補上限は134,755/134,756/180,580 bytes | bodyだけを134,756 bytesへ1 byte増やす | `Unknown(conflict)`、truncated complete artifactなし |
| `CASE-L8-LCI-151` | fixed source paths | 8 helper familiesは16 source/test refsとcorpus全体で14 unique L6/L7 pathsで固定される | K4/G3 test path aliasだけを別module pathへ差し替える | `Unknown(conflict)`、unlisted pathを受け入れない |
| `CASE-L8-LCI-152` | basename collision isolation | LABO testはLABO固定sourceの`projection`をimportし、SECURITY testはSECURITY固定sourceの`projection`をimportする。loaderは各test import直前に対応source moduleだけを`sys.modules["projection"]`へ一時bindingし、test globalsへ束縛後に以前の当該entryだけを復元する | SECURITY test import時だけLABO source moduleを`sys.modules["projection"]`に残す | runner内module load/importが既存のF-LCI-10 suite executionでerrorになる。complete artifact/positive receiptなし。新しいformal IDやL7 coverage edgeは作らない |


各caseは固定inventoryの構造・source bindingだけを扱い、補助methodの実行成功から機構L7 formal fixtureの充足、owner接続、登録、L8/L9/L10合格を作らない。CASE-L8-LCI-131の716は候補期待集合であり、実discovery/execution結果ではない。CASE-L8-LCI-152は同じloader契約のintegration oracleであり、helper identityは増やさない。
