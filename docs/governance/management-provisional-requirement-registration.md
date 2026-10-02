# 管理層の要求仮登録契約

status: bootstrap_contract
owner: HELIX-OS management
normative_coverage_contract_owner: HELIX-HARNESS
machine_register: `management-provisional-requirement-register.jsonl`

## 目的

要求候補をGitHub IssueやPRだけに置かず、要求PRをmergeする前にHELIX-OS管理層のrepo-owned registerへ仮登録する。仮登録は要求候補と旧source atomの所在を失わないための管理状態であり、要求採用、人間承認、L2 authority、設計・実装許可を生成しない。

HARNESSは原source atom集合を無損失に分割・被覆するcontractを規定する。HELIX-OS管理は、そのcontractに従う要求候補、被覆receipt、未確定atomの生存先を仮登録する。推進は管理から渡された承認済み要求だけをticket化し、仮登録を実装可能状態へ読み替えない。

## 仮登録record

`management-provisional-requirement-register.jsonl`はappend-onlyとし、1行を一つの登録revisionにする。最初の要求PRが別の要求候補の登録待ちにならないよう、旧source集合を`source_holding`として先に仮登録する。後続の`requirement` PRは、対象要求候補と同じPRで`requirement_candidate` recordを追記する。

| field | 内容 |
|---|---|
| `registration_id` | 一意で安定した仮登録ID |
| `supersedes_registration_id` | 訂正対象。初回はnull |
| `registration_kind` | `source_holding`または`requirement_candidate` |
| `requirement_identity`／`requirement_kind` | `requirement_candidate`では一つの要求identityと`unit`／`connection`／`composite`。`source_holding`ではnull |
| `product_target` | `requirement_candidate`ではHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSのexact identity。未配置の`source_holding`では`unassigned_cross_product` |
| `candidate_source_path`／`candidate_semantic_digest` | `requirement_candidate`の本文と内容revision。Git commitの自己参照を避け、本文digestで束縛する。`source_holding`ではnull |
| `parent_concept_revision`／`parent_planning_revision` | 承認済み親revision |
| `source_atom_set_ref`／`source_atom_set_digest` | この要求再編で入力にした旧source atomの完全集合と集合digest |
| `source_atom_count` | `source_holding`が保全するsource item数（line、record、path等。集合scopeで単位を明記）、または要求候補が入力にしたatom数 |
| `source_collection_scope` | 集合の対象、単位、過包含・非網羅性を明記する。file blobを要求atomとして扱わない |
| `coverage_receipt_ref`／`coverage_result` | `source_holding`は`source_preserved_unassigned`、要求候補は`pending_coverage`または`no_loss`。merge可能値は`no_loss`だけ |
| `carried_atom_refs` | 当該要求revisionへ意味を保持したatom |
| `preserved_pending_registration_refs` | 今回含めないatomを失わず保持する、別の生存中仮登録recordへの参照 |
| `human_decision_disposition_refs` | 意味変更・縮退・retireを許した対象revision付き人間decision。該当なしは空配列 |
| `unaccounted_atom_refs` | 上記三集合のいずれにも属さないatom。merge時は空配列必須 |
| `management_state` | `management_registration_state`軸のregister field名。source保全は`registered_source_holding`、要求候補は`registered_proposal`。置換を伴わない終端だけ`stale`／`superseded`／`rejected_registration`を使う |
| `authority_effect` | 常に`none`。仮登録から要求採用を生成しない |
| `registered_by`／`registered_at` | 当該行をappendしたactorとworktree記録時点。commit時刻ではない |
| `evidence_refs` | read-after、対象HEAD、review、人間decision等への参照 |
| `correction_reason` | 訂正revisionでは必須。初回recordと、理由欄導入前に記録済みの旧訂正revisionでは省略可 |

上表をrecord keyの閉集合とする。既存recordにだけある省略可能fieldを追加必須へ変更するときは、旧行を上書きせず
訂正revisionで移行する。

同じ旧atomを複数要求へ分割する場合はrelationを明示し、単純な重複計上で`no_loss`にしない。複数atomを統合する場合も原identityを消さず、各atomの保持位置と意味差分を示す。要求候補本文、source atom集合、metadataを訂正する場合は旧recordを上書きせず、`supersedes_registration_id`を持つ新revisionを追記する。置換先を作らず登録を終端する場合も、対象を`supersedes_registration_id`で指すterminal revisionをappendする。`stale`は参照revisionの失効、`superseded`は別の有効recordへ置換済み、`rejected_registration`は登録拒否の人間decisionを記録する。

read-afterでは`supersedes_registration_id`の有向鎖を解決し、後続から参照されない末端recordのうち
`management_state`が`registered_source_holding`または`registered_proposal`のものだけを生存中とする。
terminal revisionと、そのrevisionが指す対象はいずれも生存先として使わない。鎖の循環、存在しない親、同じ親を訂正する複数の末端、同一`registration_id`の重複があればfail-closeする。

`source_holding`は旧source集合の保全位置を示すだけで、要求候補、successor割当、採否、配置決定ではない。複数inventoryに同じ原文意味が現れる場合があるため、各集合の件数を加算してHELIX要求総数にしない。要求PRの被覆receiptは、入力に選んだ名前空間内でatomを一度だけ計上し、別inventoryとの同一・包含・派生relationを明示する。

## 要求PRのmerge admission

`requirement` PRは次をすべて満たさなければmergeできない。

1. 対象要求候補の`candidate_semantic_digest`と仮登録recordが一致する。
2. 入力した旧source atom集合のdigestと、被覆receiptが同じ集合を指す。
3. `coverage_result: no_loss`で、`unaccounted_atom_refs`が空である。
4. 今回移さないatomは、`preserved_pending_registration_refs`が指す生存中の`source_holding`または別の`requirement_candidate` recordで管理層へ仮登録されている。
5. `management_state: registered_proposal`、`authority_effect: none`である。
6. 対象HEADでregisterをread-afterし、欠落、重複、`stale`、`superseded`、`rejected_registration`、wrong product、digest不一致がない。さらに入力atomの`source_path`、保持copy path、source file SHA-256を、`MPR-SH-PREISOLATION-*`が参照する333件の`source_path`、`archive_path`、`baseline_file_sha256`、`pre_isolation_file_sha256`へ照合する。
7. 条件6のいずれかが333件のrevision差分へ対応する場合、path表記が異なっていても、監査基準revisionと隔離直前revisionの両方をatom入力に含める。同値として一方へまとめる場合は、両digestへ束縛した人間decisionを持つ。保持copy pathだけを入力して本条件を回避してはならない。
8. 別条件として、対象revisionに対する人間decisionとGitHub ClaudeのBlocker／Major 0を満たす。

PR merge、Issue作成・close、review、CI、文書ファイルの存在だけでは仮登録や`no_loss`を生成しない。register recordが無い、古い、対象が違う、被覆集合が不明、未計上atomがある場合はfail-closeする。

## registerのbytes追記とPR前確認

registerはrecord単位だけでなくbytes単位でもappend-onlyとする。追加・訂正では、新しいUTF-8 JSON objectの行だけをEOFへ書く。既存file全体をparseしてserializeし直してはならない。既存recordの空白、key順、separator、行末を含むcommit済みprefixの各byteをそのまま保つ。追記前に対象base revisionのregister bytesを読み、LFで終わることを確認してから、LF終端のJSON object行を追記する。訂正も`supersedes_registration_id`を持つ新しい行とし、参照先の既存行は書き換えない。

書き込みはprepared recordを1行だけencodeしてbinary appendする。実際の登録値・ID重複・schemaを確認した後、writerは次の形で suffix を追加する。`register`全体をJSON arrayやlistとしてdumpして置き換える処理を使わない。

```python
line = json.dumps(record, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
assert register_path.read_bytes().startswith(base_bytes)
with register_path.open("ab") as stream:
    stream.write(line + b"\n")
```

書き込み後は、下記checkerで対象base bytesとのprefix一致とsuffixの行単位妥当性を確認する。

PR作成前に意図するbaseをfetchし、exact base commitを指定してread-only byte-prefix checkerを実行する。

```sh
git fetch origin
python3 docs/governance/tools/verify_management_register_append.py "$(git rev-parse origin/main)"
```

checkerは`git show`でbase側fileを取得し、worktreeのregister bytesと比較する。base全bytesが厳密なprefixでなければfailする。追記suffixもJSONLとしてparseし、空行・不正行・`registration_id`の欠落／重複・最後のLF欠落を拒否する。出力をPRの静的検証記録へ含める。baseが進んだ場合は対象mergeのexact baseを指定して再実行する。並行追記と衝突したら最新base bytesをprefixとして保ち、このPRの行だけを追加して再検査する。意味上のread-afterやdigest一致はbyte-prefix確認の代替にならない。

この補正は既存のappend-only登録意味を保ったまま、bytes単位の書込手順を明確にする。上記の現行契約と、旧`HIL-NFR-21`のappend-only原則（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:201`）を保持し、後続dispositionで原recordを削除・不可視化・終端化しない。2026-09-29のregister prefix指摘は、別候補の追加時に既存`MPR-SH-LEGACY-RULE-001`を再serializeしたことが原因だった。修正後はbaseの全bytesを保持し、新候補の行だけをappendする。

## bootstrap source holding

3df81ad時点のpre-append snapshot（`management-provisional-requirement-register-pre-append-3df81ad.jsonl`）は32 revision、13 source集合、13生存中`registered_source_holding`で固定する。現在のregisterはappend-onlyに33 revision、14生存中holdingとなり、追加行`MPR-SH-OUTSIDE67-001`はoutside-67の67 `path_revision_pair`を保全する。追加行は`unassigned_cross_product`、`source_preserved_unassigned`、`authority_effect: none`であり、要求atom、product owner、phase authority、semantic dispositionを生成しない。
以下の既存記述にある13集合の件数・状態は3df81ad時点のhistorical snapshotに束縛する。このうち十二は既に全量照合済みである。十三番目（`MPR-SH-LEGACY-RULE-004`。`-001`〜`-003`を訂正した生存中revision）は旧HELIXのAI向け指示・運用文書・機械強制codeから抽出した規則atom 7,622件で、対象file 632件のうち531件（atomを得た533件のうち530件＋規則なし申告1件）に二巡目を行った。二巡目でも新規が出ており、全量照合済みではなく「発見済み」の集合として保持する。atomの要求への対応づけは候補であり、holdingの保全対象は原文と出どころだけである。初回6 revisionのactor帰属と、続く7 revisionの記録時点は、原行を残した
訂正revisionで置換した。九つ目は監査基準からarchive隔離直前までにblobが変わった333 pathの基準revisionと隔離revisionを
両方保持し、意味同値を未確認のまま残す。`MPR-SH-PREISOLATION-002`は要求・検証source 2件のcategoryを訂正し、bytesと
意味状態は変えない。十番目は旧v1.3の直接委任22文書から意味frontmatter relation 265 edgeを再帰的に辿った117文書の
うち、Scrum Reverse行台帳3文書を除く114 file blobを保持する。`MPR-SH-DELEGATED-DOC-003`は4 keyに限っていた旧closureを
訂正し、`pair_group.members`、`tailoring_profile`、`definition_ledger`、`legacy_source`等から到達する77文書を追加した。
十一番目は同じ117文書から抽出したfrontmatter・本文参照788 edgeを、参照元行と対象blob digest付きで
`MPR-SH-DELEGATED-REF-001`へ保持する。参照候補を要求atomへ昇格せず、PLAN、process、migration、意味source候補を分類前に
消さない。十二番目はPOが提示した5大目標5件と七大原則7件のexact原文を12 atomとして
`MPR-SH-PO-GOALS-PRINCIPLES-001`へ保持する。5大目標は企画価値source、七大原則は行動規律sourceであり、
L1被覆判定や候補文書の説明から12要求を生成しない。各recordは台帳path、item数、file SHA-256へ束縛し、要求候補への移管を主張しない。台帳内容が変わった場合も
同じく新digestの訂正revisionをappendする。既存行の上書きは禁止する。

追加された`MPR-SH-OUTSIDE67-001`は、同じ67 pathについてpre-isolationとarchiveの両revisionを保持するsource holdingである。path itemを要求atomとして数えず、意味relation closure、product、phase、implementationのreview前に別のatom集合へ分解する。13集合のhistorical read-afterはsnapshotを読み、append後の14集合read-afterはcurrent registerを読む。過去captureのregister digestを書き換えて14集合だったことにする運用は禁止する。

最初の`requirement_candidate`は、2026-09-27にPR #2157がHARNESS-L2-010〜022の13件（`MPR-RC-HARNESS-L2-0NN-001`）として追記した。各行は候補本文の節digestと[被覆receipt](audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json)に束縛し、入力した旧atomは`MPR-SH-CANDIDATE-003`の行atomである。追記後のregisterは46 revisionで、生存中は`source_holding` 14件と`requirement_candidate` 13件である。source holdingの集合と件数は変わらない。続いて2026-09-27に、HELIXOS-L2-014（`MPR-RC-HELIXOS-L2-014-001`、[被覆receipt](audits/requirement-registration/helixos-l2-014-coverage-receipt-2026-09-27.json)）を追記した。その本文をreviewで直したため、訂正revision `MPR-RC-HELIXOS-L2-014-002`（[改訂receipt](audits/requirement-registration/helixos-l2-014-coverage-receipt-2026-09-27-r2.json)）を追記した。registerは48 revision、生存中の`requirement_candidate`は14件である。 PR #2159の初回候補追記で、HELIXOS-L2-015〜025の11件を追加し、59 revision、生存中の`requirement_candidate`は25件となった。14件の`source_holding`と既存revisionは保持する。独立review後の017／021／023を訂正revision -002として追加し、現在は62 revision、生存中の候補25件・holding 14件である。旧recordと初回receiptは履歴として保持する。 G2のSECURITY候補28件を追補した時点は90 revision、生存中の候補53件・holding 14件である。R2160-01/02訂正の014・021・027・028を追補した後は94 revision、生存中の候補53件・holding 14件である。 G3のINFRASTRUCTURE候補26件を追補し、120 revision、生存中の候補79件・holding 14件となった。 R2161-01の親L1追跡表記を訂正revisionとして追補し、146 revision、生存中の候補79件・holding 14件となった。 G4のBRAIN候補40件を追補し、186 revision、生存中の候補119件・holding 14件となった。 作成側検収で依存表記を訂正した7 revisionを追補し、193 revision、生存中の候補119件・holding 14件となった。 R2162-01で全40節の親ID表記を訂正し、233 revision、生存中の候補119件・holding 14件となった。旧revisionとreceiptは保持する。 G5のLABO候補48件を追補し、281 revision、生存中の候補167件・holding 14件となった。既存revisionと過去receiptは保持する。 G6のINTELLIGENCE候補48件を追補し、329 revision、生存中の候補215件・holding 14件となった。既存revisionと過去receiptは保持する。

この先の要求PRでは、対象atomの入力集合をこのholding recordの`registration_id`とatom IDで指定する。file blobまたはpath単位のholdingを入力にする場合は、同じsource digestから無損失なatom集合を先に作り、別の生存中`source_holding`へ仮登録する。file blob一件を一要求atomとして扱って`no_loss`にしてはならない。`no_loss` receiptは、その入力集合を「候補へ保持」「別の生存中仮登録へ保留」「人間decisionで意味変更・縮退・retire」の三集合へ完全分割する。holdingに原文が残っている事実だけでは、候補側の未計上を埋めたことにしない。

## bootstrap境界

管理登録runtimeは要求整理後にL3／L10から設計するため、現在はrepo-owned JSONL recordとread-afterで仮登録を行う。自動登録器が成立した後も同じ意味契約を維持し、GitHubを登録正本へ昇格させない。既存DB、旧hook、旧CIはbootstrap registerのwriterまたはoracleとして使用しない。


## 現行Conceptの対象identityと候補親の記録

上表の`product_target`には、現行Conceptの機構identityを記録する。対象は`HELIX-HARNESS`、`HELIX-OS`、`HELIX-BRAIN`、`HELIX-LABO`、`HELIX-INTELLIGENCE`、`HELIX-SECURITY`、`HELIX-INFRASTRUCTURE`、`HELIX-Web`、`HELIX-WEB-OS`である。根拠は[現行Conceptの機構表](../concept/helix-concept.md)と[作業入口の対象別L1と判断記録](new-generation-start-here.md)であり、4対象だけだった表へ機構ごとの追補を繰り返さない。既存の`HELIX-Web-OS`という綴りの履歴recordは書き換えず、訂正が必要な場合も通常の訂正revisionで扱う。

このfield名は対象identityを表す既存名であり、OS、SECURITY等に外販製品という属性を付けない。共通部品CONNECTは対象別L1がまだないため、この追補からL2候補の起草や承認を導かない。各対象の親revision・候補状態・authorityは独立して記録し、一対象の採択を別の対象へ継承しない。

`parent_concept_revision`／`parent_planning_revision`は、未採択候補を起草する場合にも実際に読んだ親のpath・commit・本文digestと候補状態を記録する。表の「承認済み親revision」は承認済みの入力を記録する場合の状態であり、候補親を承認済みと偽って書かない。[作業入口](new-generation-start-here.md)が許す候補起草と、承認済み要求からのticket化を分ける。親の候補状態、要求の採否待ち、必要な人間decisionはそのまま保持する。

この追補は既存の仮登録の対象表記を現在の機構と候補状態へ合わせる。旧`archive/legacy-generation-2026-09-14/root/CLAUDE.md`の「自律境界」（82〜85行）の、人が上流の意味を持ちAIが起草する分担を保持する。旧世代の層番号・DB・runtimeは継承せず、現行の層とrepo-owned registerへ記録する。承認前の登録から採択・下流許可を作らない境界、被覆・生存参照・訂正revisionの条件は変えない。


## HELIX-CONNECTの候補起草に伴う対象追加（2026-09-27）

G7ではPO原文と現行Conceptの共通部品の行を親に、HELIX-CONNECTのL1企画候補とL2／L11候補を起こす。上の「共通部品CONNECTは対象別L1がまだない」は追補時点の説明として保持し、今回の候補起草後は`product_target: HELIX-CONNECT`を記録できる。本fieldから外販製品属性を生成しない。対象別L1のrevision確認はPOに残し、候補親のpath・本文digest・候補状態を明示する。仮登録からL1の確認、要求の採択、実装許可を生成しない。

原文と判断記録の参照は今回のCONNECT候補に置く。この追補は既存の候補親の記録方法をCONNECTにも適用するものであり、被覆・生存参照・訂正revision・独立reviewの条件を変更しない。旧`archive/legacy-generation-2026-09-14/root/CLAUDE.md`82〜85行の「人が上流を持ち、AIが起草する」分担を保持し、旧層番号とruntimeを継承しない。


## HIL-FR-01 lifecycle path候補の仮登録（2026-09-29）

旧HIL-FR-01 line 91から7つのliteral facetを分け、HARNESS-L2-060へ入力revision/digest atom 1件、HELIXOS-L2-103へevent/state/causality atom 3件を候補登録した。旧`InfinityLoopEvent` intake、旧stage sequence、前段receipt必須化atomは`MPR-SH-IR-003#HIL-FR-01`へ保留し、全体を普遍的stage規則にしない。被覆receiptはこのsource lineの局所partitionのみを記録し、旧IR全体、関連system contract、consumerまたはformal successorのclosureを主張しない。

## confirmed175 DAC-FR-003限定候補の仮登録（2026-09-29）

`MPR-RC-HELIXOS-L2-106-001`は、confirmed175の`DAC-FR-003` source line 50を1 atomだけ入力したHELIXOS-L2/L11-106未採択候補である。candidate source-lines／coverage receiptは`docs/governance/audits/requirement-registration/dac-fr-003-authority-binding-source-lines-2026-09-29.jsonl`と`dac-fr-003-authority-binding-coverage-receipt-2026-09-29.json`。`no_loss`はこの限定atomのcandidate mappingに限り、formal successor、owner移管、適用範囲、状態semantics、採択または条件closureを示さない。生存中`MPR-SH-CONFIRMED-003`は変更せず、source holdingとして保持する。


## confirmed175 DAC-FR-007 ratchet限定候補の仮登録（2026-09-29）

`MPR-RC-HARNESS-L2-062-001`は旧DAC-FR-007 line 54一atomだけをHARNESS-L2/L11-062未採択候補へ対応する。source-lines／coverage receiptは`docs/governance/audits/requirement-registration/dac-fr-007-ratchet-source-lines-2026-09-29.jsonl`と`dac-fr-007-ratchet-coverage-receipt-2026-09-29.json`。`no_loss`は当該atomの限定candidate mappingであり、formal successor、source owner移管、baseline authority/revision/scope、分類規則・閾値・更新条件、採択、runtimeまたは条件closureを意味しない。`MPR-SH-CONFIRMED-003`を変更せず保持する。近接する採択済みHELIXOS-L2-037（57候補判断）は別の運転引継ぎ要求で、ratchet条件を定義しない。


## CIG-AC-001 event identity negative oracle限定候補（2026-10-02）

`MPR-RC-HELIXOS-L2-117-001`は、旧candidateのCIG-AC-001 line 14一atomだけをHELIXOS-L2/L11-117の未採択候補pairへ対応する。source-lines／coverage receiptは`docs/governance/audits/requirement-registration/ci-event-identity-negative-oracle-source-lines-2026-10-02.jsonl`と`ci-event-identity-negative-oracle-coverage-receipt-2026-10-02.json`。`no_loss`は一source atomの限定候補mappingを示す。採択済みOS-008/020に対する個別facet欠落・改変oracleの採択、旧source owner/適用scopeの確定、formal successor、runtime受入、source holding全体のclosureを示さない。既存NCI-OS-003/004候補の汎用binding条件やunadopted statusから採択を推定せず、PO選択肢A/Bと推奨はreceiptへ束縛する。`MPR-SH-CANDIDATE-003`を生存させる。

## IR153 HIL-FR-42 / HIL-FR-45限定候補（2026-10-02）

`HARNESS-L2-077`／`HARNESS-L2-078`はそれぞれ旧HIL-FR-42 line 132とHIL-FR-45 line 135の一atomだけを未採択候補pairへ対応する。source-linesと各coverage receiptをMPR行が固定する。`no_loss`は当該一atomの候補入力対応だけを示す。`MPR-SH-IR-003`は生存し、旧要求の正式successor、owner移管、対象scope/version、全HR/HIL condition closure、PO採択、L3承認、実装・実行を主張しない。旧runtime/schema/test/CIは移植または実行しない。

## HIL-BR-12 intake/style接続候補（2026-10-02）

`MPR-RC-HELIXOS-L2-121-001`は`management-provisional-requirement-register.jsonl`へ追記した`registered_proposal`である。選択atomは旧IR `requirements.json#/HIL-BR-12`（asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`）一件であり、旧L1 line 64（asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`）は同じstatementのcorroborationで別atomではない。source-linesとcoverage receiptは`docs/governance/audits/requirement-registration/hil-br12-intake-style-source-lines-2026-10-02.jsonl`および`helixos-l2-121-hil-br12-coverage-receipt-2026-10-02.json`。`no_loss`はこの一atomを四facet候補へ対応したことだけを示す。2026-09-28 OS decisionの固定L2-001〜029/paired L11は合意済みで、本候補はその対象revision外かつ未採択である。HARNESS-L2-023の依存意味はHELIX-HARNESS 9/28 exact decision revisionで採択済みと確認し、そのMPR frontmatter/register stateをauthority根拠にしない。`MPR-SH-IR-003#HIL-BR-12`は生存し、formal successor、owner/scope/version、旧HR/HAC/HAT全体closure、L3承認、runtime/test/CI実行を主張しない。旧sourceは読取専用で実行しない。

## 2026-10-02 HELIXOS-L2-122 仮登録

旧HIL-NFR-01の一IR atomに対する未採択OS connection候補を `MPR-RC-HELIXOS-L2-122-001` として追記した。候補はdelivery、Issue contract、job、PR headの各既存identityとowner効果を因果・既存receiptで結び、同一operationの重複効果、異payload conflict、部分失敗後の継続、unknown時の保留を扱う。LABO／INTELLIGENCE／BRAINの知識責務は移さず、採択済みOS 007/009/019およびHARNESS 023の範囲を超える保証を採択済みとは主張しない。source holding、formal successor、要求採否は未解決のまま維持する。詳細は [coverage receipt](audits/requirement-registration/helixos-l2-122-hil-nfr-01-idempotency-coverage-receipt-2026-10-02.json) を参照。

## 2026-10-02 HELIXOS-L2-123 仮登録

旧HIL-BR-14のIR identity statement一件を対象とする未採択候補を`MPR-RC-HELIXOS-L2-123-001`として追記した。source scopeはZIP、指定された前身repository exact 2件のcurrent advertised heads/tags/pull ref authority、現行HELIX source、atomic behavior分解と採否からrequirement/design/test/Gateへのtrace、およびauthority receiptから動的に導くref・unique tree entry・ref-entry edge分母である。source countは一IR atomだけで、L1 line 66は同じ文面のcorroboration、HR-FR-HIL-09/HAC-HIL-09a,b,c/HAT-HIL-09はconsumer/oracle contextであり追加atomではない。HATは未実装で実行していない。

候補はsource authority・receipt・traceのOS接続を提案し、各ownerの意味判断を移さない。採択済みOS L2-002/005/007は一般のtracking/provenance経路として参照したが、BR14固有のexact-two-repository ref authorityとreceipt-derived分母・全traceを被覆済みとは扱わない。HARNESS-L2-067は未採択の部分的なsource-atomization候補である。候補は外部remote操作、旧runtime/test/CI、全source closure、formal successorを主張しない。詳細は[source ledger](audits/requirement-registration/hil-br14-source-lines-2026-10-02.jsonl)と[coverage receipt](audits/requirement-registration/helixos-l2-123-hil-br14-coverage-receipt-2026-10-02.json)を参照。

## 2026-10-02 HELIXOS-L2-124 仮登録

旧HIL-NFR-08のIR identity atom一件を対象とする未採択候補を`MPR-RC-HELIXOS-L2-124-001`として追記した。sourceはPR監査、Issue Gate、agent registry、memory compaction、ZIP detectorの五roleそれぞれにfailure codeとprovenanceを要求し、proseだけの合格を禁じる。source atomは旧IR一件だけで、旧L1 line 188は同一文面のcorroboration、HR-FR-HIL-09/HAC-HIL-09a,b,c/HAT-HIL-09およびHST例はconsumer/oracle contextであり追加atomではない。HATは設計のみで実行していない。

現行採択pairはdecision revisionとexact section digestで照合した。OS-033の採択条件をZIP detectorに再利用し、新たな採択として重複させない。035/058/034/101のPR intake・分類・disposition、059/102のIssue intake、047のcapability contract、019のcontinuity等は隣接条件として範囲を限定し、五role全部のfailure-result保証へ一般化しない。候補は残差の静的接続を提案するだけで、実機能、旧runtime/test/CI、source closure、formal successor、実行済み受入を主張しない。詳細は[source ledger](audits/requirement-registration/hil-nfr-08-function-evidence-source-lines-2026-10-02.jsonl)、[coverage receipt](audits/requirement-registration/helixos-l2-124-hil-nfr-08-function-evidence-coverage-receipt-2026-10-02.json)、[L2 candidate](../helix-os/L2-requirements/governance-requirements.md#helixos-l2-124)、[L11 candidate](../helix-os/L11-acceptance/governance-acceptance.md#helixos-l11-124)を参照。


OS-122の採択関係を `MPR-RC-HELIXOS-L2-122-002` として訂正追補した。035は57-candidate decision row 58、HARNESS-059とOS-102はlive26 rows 44/55/70で採択済みであり、それぞれの限定scopeと122の未採択scopeを区別する。既存001行とreceiptは時点記録として保持し、source atom・候補意味・scopeは変えていない。最新の根拠は [訂正receipt r2](audits/requirement-registration/helixos-l2-122-hil-nfr-01-idempotency-coverage-receipt-2026-10-02-r2.json) とregister 002である。

## 2026-10-02 HELIXOS-L2-126 仮登録

旧HIL-NFR-18のIR identity atom一件を対象に、失効leaseとfencing token不一致時のtool call/artifact/completion拒否、およびcrash後の最後のdurable checkpointだけからの再開を、未採択候補`MPR-RC-HELIXOS-L2-126-001`として追補した。採択済みOS-009/018/019/032の一般停止・event/checkpoint保証、未採択115/118/120/125との範囲差を照合し、旧source atomとHAT/HSTのconsumer contextを区別した。source holdingとformal successorは未解決、旧HATは設計のみで実行していない。候補本文、source ledger、decision/pair pins、正常・負・unknown oracle、選択肢は[coverage receipt](audits/requirement-registration/helixos-l2-126-hil-nfr18-fencing-checkpoint-coverage-receipt-2026-10-02.json)と[source ledger](audits/requirement-registration/hil-nfr18-fencing-checkpoint-source-lines-2026-10-02.jsonl)を参照。
