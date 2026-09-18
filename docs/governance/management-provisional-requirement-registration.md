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

## bootstrap source holding

現registerは32 revisionを持ち、十三のsource集合を十三の生存中`registered_source_holding`として保持する。
このうち十二は既に全量照合済みである。十三番目（`MPR-SH-LEGACY-RULE-004`。`-001`〜`-003`を訂正した生存中revision）は旧HELIXのAI向け指示・運用文書・機械強制codeから抽出した規則atom 7,622件で、対象file 632件のうち531件（atomを得た533件のうち530件＋規則なし申告1件）に二巡目を行った。二巡目でも新規が出ており、全量照合済みではなく「発見済み」の集合として保持する。atomの要求への対応づけは候補であり、holdingの保全対象は原文と出どころだけである。初回6 revisionのactor帰属と、続く7 revisionの記録時点は、原行を残した
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

この先の要求PRでは、対象atomの入力集合をこのholding recordの`registration_id`とatom IDで指定する。file blobまたはpath単位のholdingを入力にする場合は、同じsource digestから無損失なatom集合を先に作り、別の生存中`source_holding`へ仮登録する。file blob一件を一要求atomとして扱って`no_loss`にしてはならない。`no_loss` receiptは、その入力集合を「候補へ保持」「別の生存中仮登録へ保留」「人間decisionで意味変更・縮退・retire」の三集合へ完全分割する。holdingに原文が残っている事実だけでは、候補側の未計上を埋めたことにしない。

## bootstrap境界

管理登録runtimeは要求整理後にL3／L10から設計するため、現在はrepo-owned JSONL recordとread-afterで仮登録を行う。自動登録器が成立した後も同じ意味契約を維持し、GitHubを登録正本へ昇格させない。既存DB、旧hook、旧CIはbootstrap registerのwriterまたはoracleとして使用しない。
