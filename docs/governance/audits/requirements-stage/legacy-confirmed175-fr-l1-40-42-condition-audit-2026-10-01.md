# confirmed175 FR-L1-40〜42 条件照合監査（2026-10-01）

旧functional-requirementsのsource-qualified identity 3件を、旧source/consumerとf6固定L2/L11、および後発PO判断の対象範囲に照らしたread-only静的監査。作成基準mainは`479d5f95a0756a4a797a9ebaa4599352bf79790c`、固定L2/L11 revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。個票、source/consumer行SHA、target本文行SHA、decision/queue hashは[JSON](legacy-confirmed175-fr-l1-40-42-condition-audit-2026-10-01.json)に記録する。

全3件の旧source stateは`confirmed` / `preserved_pending_rehome`、比較状態は`open_partial_correspondence`。判断効果・formal successor・closureはいずれもない。旧source本文とholding snapshotのfile SHA-256は`a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`。資産明細台帳の対応assetは`LEGACY-ASSET-6B6C5CB0E481BE01088B`。

## 重複と入力状態

confirmed175 queueの3行はいずれも`not_individually_compared`、`evidence_artifacts: []`であり、full auditは「部分再導出／旧固有条件・反例・数値・出力の一部が未確認」としていた。requirements-stage配下のJSON/Markdownをsource-qualified identityで検索し、exact fixed-f6 condition auditがないことを確認した。full-audit/queue/population audit、FR-L1-06のcross-reference、FR-L1-41へのrouting参照、screen trace、NFR-15のcross-referenceは関連記録だが、当該identityの旧条件をfixed f6 L2/L11と個別比較していないため重複には数えていない。

固定targetはfull auditがf6時点で`po_fixed_candidate_adopted`として記録したrevision/identityに限る。2026-09-29の57候補・11候補PO判断はdecision本文を読み、対象IDとsource-qualified identityを照合した。いずれの判断表にも本件の旧identityまたはfixed target IDはなく、3件のsource状態・後継割当・closureを変更しない。対象決定記録のfile SHA、source revision、screen結果はJSONに固定した。

## 個票

### FR-L1-40 — drive別state分離

旧source line 71は`.helix/drive/<drive>/`のstate区画と`skip_sub_doc`機械強制を要求し、PLAN frontmatterのdrive種別とL層から区画・自動検証結果を出す。technical §4（line 116付近）は専門driveを`be/fe/db/fullstack/agent`の5種とする一方、HM-03 screen consumer（line 168）は「9 drive」と記す。source行自体はdrive数を固定せず、consumer間の個数も一致しない。

旧L3 FR-06 detail（lines 199–218）はdrive境界をまたぐstateのfail-closeと、明示されたskip対象sub-docの欠落を許し理由を記録する条件を置く。L3 carry（line 764）、L4機能境界（line 356）、L5 physical-data（lines 38, 55）、L6 function-spec（line 281）、OT-22/27（OT文書 lines 73, 78）は区画、enum、skip動作と代表検査を補強する。いずれも旧consumer条件として固定した。

f6のHELIXOS-L2-019/L11-019はevent provenance、checkpoint、欠落/stale/未実行と成功の区別、session/runtime交代後のscope・budget・未完義務保持を定める。HELIXOS-L2-026/L11-026は要求・依存・安全条件から段階構成と不足を導出する。HELIXSECURITY-L2-007/L11-007はWorker環境へwrite path等の制約を適用し、unknownをhost fallbackで迂回しない。これらはstate/evidence/scope境界に関連するが、旧physical path、drive集合、partition isolation、`skip_sub_doc` oracleは定めない。

**残差:** 旧physical schemaとdrive分類、旧technicalの5種対screenの9区画の不一致、越境汚染の検出oracle、skip許可・記録先・consumer挙動は未解決。HELIXOS-L2-019/026/SECURITY-007への参照だけでは旧条件を閉じない。

### FR-L1-41 — drive自動判定とrouting

旧source line 72はPLAN/コード/依存を入力に含め、PLAN内容とコード拡張子・パターンからdriveを自動分類し、`orchestration_mode` routingへ渡す。L3 FR-08（lines 259–262）はdrive判定結果をmode routing inputに加え、Recovery/Incident/Reverse/Refactorとkind PLAN起票につなぐ。L3 carry（line 765）、L4境界（line 357）、L6 `classifyDrive`（function-spec line 282）、OT-22（line 73）がconsumer。旧L6はconfidence付き分類を置き、low confidenceをfinding/confirmation needとし確定値を捏造しない。HM-03は判定結果の表示を担う。

HELIXINTELLIGENCE-L2-066/L11-066はticket/task属性、Worker capability/version、LABO evidenceまたは明示的未評価状態を入力に人手の配置案を同proposal schemaで受け取る接続契約で、配置決定やengineを与えない。HELIXOS-L2-018/L11-018はauthority・scope・期限・budget内のassignment/attempt、停止/handoffを担う。HELIXOS-L2-027/L11-027は限定された未評価Workerの初回実行条件を扱う。分類入力と割当authorityの境界は関連するが、コード拡張子・依存からdriveを推定してmodeを選択・起動する契約ではない。

旧sourceは閾値・feature weighting・拡張子表・同時一致時の優先規則を示さない。低confidence時のfinding/confirmationは自動確定を抑止する条件であり、OT-22の「frontmatter未指定時に推定・補完」は旧test期待として保持した。現行L2/L11にはこの自動推定・補完はない。

**残差:** 分類feature/拡張子/依存の意味、tie/conflict/unknown時の結果、mode routing全体、mode自動起動authority、FR-L1-08との接続条件は未解決。人手配置proposal、assignment、限定実行をdrive自動判定の代替や後継とは扱わない。

### FR-L1-42 — provider間handoff

旧source line 73はproviderをClaude↔Codexの2者に固定し、context・PLAN・budget evidence、`.helix/handover/provider/CURRENT.json`、mode.yaml、invocation_log、PLAN位置、package生成/検証、fresh session起動確認を記載する。同じ行がsession continuation SSoTとの分離とFR-L1-31 DB projectionへの分離も要求する。旧OT-28（OT文書 line 79）はprovider evidenceとPLAN/audit continuity、別のharness.db continuation projectionを確認し、session用CURRENTの生成を負例にする。

旧L4/L5/L6の後続consumerはprovider delegation evidenceをcontinuationとは別の監査型として保持する。一方、L5/L6のretirement設計はsession/prose handover・`CURRENT.json`・旧handover CLIを生成/読込せず、DB+memory continuationへ置換する境界を明記する。L3/L4に残る「implemented」表記は当時の履歴であり、現行実装の証拠にしない。

HELIXOS-L2-019/L11-019はevent/provenanceとsession/runtime交代後のscope・期限・budget・未完義務を保持し、provider memory/summaryだけを正本にしない。HELIXCONNECT-L2-001/L11-001は接続identity、両端契約revision、direction/scope、adapter/transport revisionの登録を扱い、登録は利用許可を意味しない。CONNECT-002〜007/L11は互換/stale照合、契約に束縛した通信、再送、追跡、片側交換、composite lineageをそれぞれ定める。接続・continuityの責務分離は保持点だが、Claude/Codex固定、旧CURRENT package、fresh session launch、旧PLAN registry continuityを規定しない。

**残差:** 固定provider間のcontext/PLAN/budget package schemaと状態検証、fresh session確認、旧PLAN registry/auditへの対応は未解決。session continuationは現行OS-019のevidence/continuity条件に限って参照できる。旧`harness.db` schemaや旧packageへsuccessorを割り当てない。CONNECT-001〜007の契約familyを見ても、旧provider handoff条件の閉包には至らない。

## 非主張と静的確認

3件とも旧条件と現行targetの部分接点・差分を記録した。`.helix/drive`、`skip_sub_doc`、固定Claude↔Codex handoff、旧session SSoTを現行契約に昇格していない。旧CLI/runtime/hook/test/CI/provider/DBを実行せず、実装・受入・採択・successor・source retirement・Step 5完了を主張しない。targetを含むf6固定4機構のL2/L11 file SHAと該当行SHA、旧consumer file/range line SHA、queueとPO decision hashesをJSONに記録した。
