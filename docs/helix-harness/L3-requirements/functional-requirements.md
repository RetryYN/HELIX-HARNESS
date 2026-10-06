# HELIX-HARNESS L3 機能要件（Stage 1: HARNESS-L2-010/011/023）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 only; HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
owner: HELIX-HARNESS
paired_l10: ../L10-verification/functional-verification.md

この文書は固定されたStage 1の3親に対応する部分草稿である。対のL10総合検証は[functional-verification.md](../L10-verification/functional-verification.md)に置き、AC IDを共通にする。L3要件は未承認であり、実装・実行・releaseの許可を表さない。親の要求意味、範囲、owner、個別version_targetを変更しない。

## 親要求revision

親判断記録は[2026-09-28 PO判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md)（本文SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）を参照する。固定要求はmain `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2本文SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、対のL11本文SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`である。L2全文・L11全文は各々上記revisionの文書を参照。

| 親 | PO判断記録行・proposal ID | 固定L2行 / raw span SHA-256 | 固定L11行 / raw span SHA-256 | version_target |
|---|---|---|---|---|
| `HARNESS-L2-010` | #L39 / `MPR-RC-HARNESS-L2-010-001` | 340–351 / `5fae33b5001fb2b59c3a8a62cfb06d428480574d22c8872ef3f9d8fe440bb5b0` | 205 / `ee2d89c797d8d07d917b68fca55d386d487e67caac0e9cf0873fe674846e33cf` | 個別印なし |
| `HARNESS-L2-011` | #L40 / `MPR-RC-HARNESS-L2-011-001` | 352–362 / `65483ea9a44d880a894fe6e9b052594741e3fab29320c158fa95f0075af60090` | 206 / `483c86d30dbece9bce50732e5faf9480b6c70c93f6b625330d27cb7784a57188` | 個別印なし |
| `HARNESS-L2-023` | #L52 / `MPR-RC-HARNESS-L2-023-002` | 463–498 / `cacb50daf962d62f6454da1ecff7a8fd7a7ec41f0eda17eadc1c0d7edf845fc9` | 219–233 / `f505c8e6a2887ac0cf757a78de6617f9a9ee3f9e36084fee70b8a11915815a47` | `1.0` |

この一覧は親のidentityと固定revisionを特定する。PO判断記録上の登録提案metadataを独立した承認状態として解釈せず、L3本文の承認状態はこの文書headerのとおり未承認である。

## 要件とAC

### `FR-HARNESS-L3-010` — パックの境界（親: `HARNESS-L2-010`）

**保持／再導出**：固定L2:350が束ねる既存FRS-BR-001/002/003/005/009とL2-008の単体・接続・構成体の区別を追跡する。固定L2:320に従い、この束ね直しで既存条件の所在や意味を移さない。一つのbehavior contractまたは意味を保つ密結合contractをpackとして識別し、入力・出力・依存・検証範囲・owner・版、リリース単位への収載／非収載を明示する。依存は他のpack、component、core、外部実行接続の種別・identity・版を宣言し、宣言のない依存は実行時に利用しない。未検証または未適格のpackを暗黙に含めず、同じ宣言入力と版の成果物を再現可能にする。単一packの差し替えで他packの版と証拠を変えない。packの版と成熟度、release unitの版、統合製品の版を別々に保持する。packの成熟度昇格・成功・差し替えだけでrelease unitまたは統合製品の版・成熟度を昇格させず、上位の未完部分で適格packを隠さない。複数release unitで使う能力はcomponentまたはcoreに置く。全部を巨大packへ戻さず、交換・更新不能な大きさならDesign-refactorへ戻す。ownerはrelease unit・component・coreのいずれか一つであり、classと具体identityをともに宣言する。失敗時は直前の適格版または明示された置換先へ戻せることを確認する。

**入力**：pack identity/version/maturity、入力・出力contract、owner classと具体identity（release unit identity ①〜⑦／component identity／core identity）、依存の種別（他pack／component／core／外部実行接続）・identity・版／互換範囲、検証範囲とoracle、収載／非収載のrelease unitとその版、統合製品の版、差し替え対象、失敗時に戻す直前の適格pack identity・version・evidence、または明示replacement identity・version・evidence。

**出力**：packごとの宣言manifest、検証scopeと証拠参照、pack適格性、release unit／統合製品それぞれの版との対応、差し替え差分、失敗時の復帰結果と証拠。復帰後のpack identity・version・evidenceが直前の適格版または明示replacementに一致することを確認できるようにする。これらの出力単独ではrelease eligibility、release実行、上位版・成熟度の昇格、未採択候補または対象機能の成立を認可しない。

**境界・失敗時**：pack宣言の依存identity・区分・condition・version rangeの欠落／曖昧さはpack契約ownerへ、呼出し固有のoperation/source/scope/権限/receiptの不足または版不一致は呼出しownerへ理由と戻し先を返す。authority、安全条件、親scopeの不明・矛盾はauthority ownerまたはHARNESS-L1-005の利用境界の意味を持つPOへ戻す（固定L2:480）。複数packを意図して更新する操作は単一pack差し替えと区別する。固定L2-010から依存循環の独立した拒否条件は導出せず、依存closure条件は固定L2-023の範囲で扱う。交換・更新不能な巨大packはDesign-refactorへ戻す。旧PLAN graph schemaや旧gateは導入しない。

**受入条件**

- **`AC-HARNESS-L3-010-01` 宣言と収載（FR-HARNESS-L3-010）**：各packのidentity、version/maturity、入力・出力、必須依存の種別・identity・版、検証範囲／oracle、owner classと具体identityの組が一つだけであること、収載または非収載が追跡できる。release unit版と統合製品版はpack版と別fieldで照合する。複数release unitから使う能力はcomponentまたはcore所有である。依存manifestが完備していても実行時に宣言外の他pack、component、core、外部実行接続のいずれかを使う場合、owner identityが複数の場合、検証済みでも未適格または未検証のpackを暗黙収載した場合は不合格。pack宣言不備はpack契約ownerへ、呼出し固有の不成立は呼出しownerへ理由を返す。
- **`AC-HARNESS-L3-010-02` 単一pack差し替えの隔離（FR-HARNESS-L3-010）**：一つの対象packを置換した比較で、対象外packの版と証拠が完全に維持される。対象外の変化が一件でもあれば不合格。複数pack更新はこのACに混ぜない。
- **`AC-HARNESS-L3-010-03` 再現・版境界・分割可能性（FR-HARNESS-L3-010）**：同じ宣言入力とpack版から同じ宣言成果物を得る。失敗する差替えfixtureでは、失敗後のpack identity・version・evidenceが差替え直前の適格版または明示replacementと一致することを確認する。pack成熟度の昇格・成功・差し替えを個別に与えてもrelease unit／統合製品の版・成熟度は変わらない。上位release unit／製品が未完でも適格packを一覧から隠さず、巨大で交換・更新不能なpackは合格にせずDesign-refactorの戻り先を示す。pack契約に関する不成立はpack契約ownerへ、呼出し操作固有の不成立は呼出しownerへ返す。

- **`AC-HARNESS-L3-010-04` 関数／folder一覧の拒否（FR-HARNESS-L3-010）**：固定L11:205に基づき、関数またはfolder一覧だけをpack一覧として提示した入力を拒否し、pack identity/owner/release-unit単位と関数folder catalogを分離する。

### `FR-HARNESS-L3-011` — 画面・作業環境から切り離して呼べる条件（親: `HARNESS-L2-011`）

**保持／再導出**：packは画面、特定GUI、ローカルpath、AI provider、CI製品を前提とせず、宣言した入出力contract、能力名、contract版、依存版で実際に呼び出して機能を使える。L2-011が束ねるHARNESS-L2-006の「HELIX内部の管理対象や運用記録を持たなくても、明示された構成で提供機能を利用できる」条件（固定L2:361）も維持する。実行scopeは呼出し側が渡した権限とproject／tenant／環境の隔離境界に限る。権限方針とauthorityはHELIX-SECURITYが所有する。HARNESSは進行・結果・証拠を相関ID付きで呼出し元へ返す。呼出し元へ返した結果の保存・表示は呼出し元の責務であり、停止・再開用に途中stateを記録することはこの責務移管に当たらない。中断から記録済みstateと同じ冪等keyで再開し、期限切れや中断を成功にしない。再開は記録済みpack/contract/dependency版、operation、scope、適用authorityへ束縛し、不一致や期限切れを成功にしない。

**入力**：pack identity、能力名、contract版・依存版、宣言input、呼出し元の既存authority参照とscope/isolation、相関ID、冪等key、記録済み途中state、適用expiry。

**出力**：宣言contractに沿う進行state・result state・証拠参照、operationとの相関、未完／停止理由と再開可能性。権限やscopeを増やす判断、呼出し元の結果保存・表示、業務上の完了判断は出力しない。

**境界・失敗時**：必要なpack／能力identity、contract／dependency identity・版、呼出し元から渡されたscope、適用authorityまたは再開stateがmissing／unknown／stale／不一致なら、該当operationをsuccess扱いせず条件ごとの理由と戻し先を返す。pack宣言側の依存identity・区分・condition・version rangeの欠落／曖昧さはpack契約ownerへ、呼出し固有のoperation/source/scope/権限/receiptの不足または版不一致は呼出しownerへ、authority・安全条件・親scopeの不明／矛盾はauthority ownerまたはHARNESS-L1-005の利用境界の意味を持つPOへ戻す（固定L2:480）。入力自体が不足しoracleを判定できない試験は未評価と記録し、productの保留stateと混同しない。期限切れはsuccessにならない。未対応版の黙読替え、別scope、またはHELIX本体の稼働DB・鍵・内部統制を呼出し元と共有すること、画面・providerに結合した代替経路は認めない。権限の成立条件をHARNESS側で新設せず既存SECURITY契約へ戻す。

**受入条件**

- **`AC-HARNESS-L3-011-01` 呼出し独立性と版（FR-HARNESS-L3-011）**：画面・GUI・local path・provider・CI製品を与えない明示構成で宣言contractを使って機能を呼び出し、宣言出力を利用できる。HELIX内部の管理対象・運用記録がfixtureにない正常条件でも成立する。これらを必要とする変異は不合格。能力名・contract版・依存版を明示する。missing／unknown／stale／不一致のfixtureは、対象fieldと情報源を「pack宣言」または「呼出し入力」と明記する。pack宣言側のpack／能力identity、contract版、dependency identity・区分・condition・version rangeの欠落・unknown・曖昧さはpack契約ownerへ戻す。呼出し入力側のpack／能力identityの欠落・unknown・宣言との不一致、およびoperation固有のcontract/dependency版の欠落・unknown・stale・宣言との不一致は呼出しownerへ戻す。いずれも理由と戻し先をfield別に返しsuccess扱いしない。未対応版は同等扱いしない。local pathを必須条件にする変異は不合格。別provider構成と別tenant内の有効な呼出しも未見正常fixtureとして照合する。
- **`AC-HARNESS-L3-011-02` 受渡しscopeとowner境界（FR-HARNESS-L3-011）**：適用可能な既存authorityと呼出し元のscope/isolationをfixtureとして与え、authorityまたはscopeがmissing／unknown／stale／不一致ならsuccess扱いせず、field別の理由と既存authority ownerまたは呼出しownerへの戻し先を返すこと、およびpackの動作範囲が渡されたscopeを超えないことを確認する。HARNESS自身の要求はHARNESSの対象として扱う一方、この要求からWEBの要求・設計を導出しない。別tenant／未渡し権限の使用、およびHELIX本体の稼働DB・鍵・内部統制を呼出し元へ共有する変異は個別に不合格とする。pack自身の独立した内部stateの利用はこの反例に含めない。authorityの新規定義は本要件の範囲外。
- **`AC-HARNESS-L3-011-03` 相関付き結果（FR-HARNESS-L3-011）**：進行、終端または未完state、結果、証拠参照が同じ呼出しの相関IDで呼出し元へ返り、保存・表示や業務完了をHARNESSが代行しない。
- **`AC-HARNESS-L3-011-04` 停止・再開・期限（FR-HARNESS-L3-011）**：同じ論理operationを同じ冪等keyと記録済み途中stateから再開できる。HARNESSが再開時にkeyを変える変異は同一operationの継続とせず、不合格とする。呼出し元が別keyを渡す別operationは拒否しない。再開stateとpack/contract/dependency版、scope、適用authorityのmissing／unknown／stale／不一致を成功扱いしない。再開stateや呼出し固有の版・scope・receipt不足／不一致は呼出しownerへ、pack宣言側の依存契約欠落・曖昧さはpack契約ownerへ、authority・安全条件は既存authority ownerへ理由と戻し先を返す（固定L2:480）。SBC snapshotはpreflight、dispatch直前、dispatch直後に観測する。dispatch前にsnapshotが期限切れ・不成立ならeffectなしでblocked/heldとし、dispatch後に実行結果を確定できない場合はuncertain/unknownとしてsuccess扱いしない。preflight／dispatch直前／dispatch直後のsnapshot観測を照合するが、expiry期間やretry上限の値を上流指定とみなさない。

### `FR-HARNESS-L3-023` — 利用条件別の依存宣言（親: `HARNESS-L2-023`）

**保持／再導出**：各packの依存を次の4区分のいずれかにし、その条件とpack revisionへ束縛する。

1. 常時必須。
2. 特定operation時のみ必須。
3. 明示選択されたsource/providerに応じて必須。
4. 実行条件・成果・authorityを左右しない参照資料のみ。

入力条件から有効closureを決定し、同じ要求inputとrevisionで同じclosureと理由を再現する。未選択sourceは未観測とし、存在・不在・適格性・成功を推測しない。安全依存は該当条件下で必須のまま保持し、依存condition自体がunknownなら保留する。

**入力**：pack identity/source revision、HARNESS-L2-010/011のcontract revision、operation・target/scope、明示的source選択、依存identity・owner・contract版／rangeと条件、必要な既存権限・隔離・data-use識別子。

**出力**：依存ごとのclass・condition・version・ownerと、有効closure。必要、条件不成立による対象外、未選択／未観測、参照のみ、unknown/stale／保留を区別し、利用した依存の版・scope・理由をHARNESS-L2-011の相関付き結果／証拠へ結び付ける。この分類はtarget packの機能・owner・上位要求・版成熟度を変更せず、後続版依存を1.0へ強制せず、1.0で必要な安全依存を削らず、今回未選択の能力について1.0全体の完成義務を削除・延期しない。分類能力自身は全依存実装の存在を要件とせずmissing/unknownを出力でき、closure単独で未採択候補や利用対象機能の成立・実装許可を生成しない（固定L2:488,490）。

**境界・失敗時**：依存identity・区分・condition・version rangeの欠落／曖昧さ、条件の矛盾、unknown/stale、互換性不明、source選択状態のunknownでは、条件をfalse、参照のみ、未選択へ暗黙に読み替えず該当操作を保留する。依存の種別・identity・versionを実行時manifestと突き合わせ、宣言外のdependencyをclosureから黙って除かない。同一要求のclosure欠落を口頭の人代行、暗黙の別source、参照資料で迂回しない。宣言dependency同士の循環などにより固定条件に沿ったclosureを解決できない場合は、暗黙に依存を落とさずunknown/保留としpack契約ownerへ戻す。人が代行しても同じ権限・隔離・版照合・検証・記録とreceiptを要する。利用者が別sourceを明示選択した新入力は別要求としてclosureを再評価する。戻し先はpack契約owner、呼出しowner、authority ownerまたは上流L1/POのうち、欠落した意味を所有する者である。

**受入条件**

- **`AC-HARNESS-L3-023-01` 4分類と条件束縛（FR-HARNESS-L3-023）**：4分類、owner、版／range、適用condition、対象operation/sourceがpack revisionに結び付く。各fixtureで分類を別の分類へ暗黙変換しない。実行条件・成果・authority・検証oracle・安全制約を左右するsourceをreference-onlyへ偽装する変異は拒否し、pack契約ownerへ戻す（固定L2:474、L11:229）。
- **`AC-HARNESS-L3-023-02` 有効closureと状態区別（FR-HARNESS-L3-023）**：常時必須、成立したoperation条件、選択source条件だけを有効closureに含める。依存ごとの版・scope・判定根拠をHARNESS-L2-011の相関ID付き結果／証拠と結び付ける。条件不成立、未選択／未観測、参照のみ、unknown/staleは別状態として出す。未選択sourceについて存在・不在・適格性・成功を推測しない。source選択自体がunknownなら未選択へ読み替えず保留する。選択sourceの失敗から同じ入力のまま別sourceへ暗黙fallbackしない。利用者がsourceを明示再選択した新入力は別要求として再評価する。宣言された依存closureを解決できない循環はclosure欠落として保留する。未選択source・条件不成立の依存・無関係な能力全体の完成を有効closureまたは当該operationの保留条件に含めない。単体packのgreenだけではserviceの接続・構成体を成立扱いしない。
- **`AC-HARNESS-L3-023-03` 安全依存と決定性（FR-HARNESS-L3-023）**：依存区分はtarget packの機能・owner・上位要求・版成熟度を変更しない。依存closureの出力単独で未採択候補や利用対象機能の成立・実装許可を生成しない。該当条件下の安全依存は必須としてclosureに残し、unknownな条件は保留にする。人が代行する場合も既存の権限・隔離・版照合・検証・記録を省略せず、source／actor／revision／scope／受領／検証receiptを返す。口頭受領だけではclosure evidenceにならない。分類能力自体は全依存実装の存在を成立条件にせず、missing／unknown状態を出せる。後続版の依存を1.0へ強制せず、1.0で必要な安全依存を後続版扱いで削らない。同じinput・pack revisionの再評価でclosureと根拠が一致する。今回選択しなかった能力も、1.0全体に属する完成義務を削除・延期したことにはしない。



## 旧HELIX・FRSとの項目別照合

| 現行親・項目 | 旧sourceとasset | 扱い・保持点・変更理由 |
|---|---|---|
| L3区分とFR/AC→L10対応 | `LEGACY-ASSET-9A772391C7FB1298D45F`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`, SHA `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`; `LEGACY-ASSET-F542125805B777D8A56A`, `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–166`, SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | L10 pairは旧L00-L06:155–157を起点としてFR+ACと対検証のtrace構造を意味の上で再導出する。旧README:41,53のL12 pairは置換する。旧G3名、runtime、sub-gate構造は継承せず、現行L3/L10配置と通常のL3承認へ対応させる。現行配置と承認対象revisionは現行L2/L11と配置規則を正本とする。L00-L06:163–165のengineering discipline（no-code-first、許容complexity、最小modeling判断）は固定親の範囲外として除外する。 |
| HARNESS-L2-010 / FR-010 | `LEGACY-ASSET-B5B5E71B2AF1459D59A1`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:119–148` (FR-03), `149–172` (FR-04), SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`; `LEGACY-ASSET-1B92155F959D7905DD1E`, `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:60–66` (AT-FR-03/04), SHA `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | pair traceと失敗fixtureの形を部分再導出。FR-04の依存cycleの扱いは固定L2-010にないためここへ持ち込まず、宣言closureを解決できない場合に限って固定L2-023のunknown/保留条件へ照合する。旧4-artifact/12-edge数値、PLAN schema、requires/blocks graph、旧実行例・AT-IDは置換し移植しない。pack identity/owner/version等は固定L2から再導出。 |
| HARNESS-L2-011 / FR-011 | 旧SBC `source-boundary-contracts.md:60–70`（asset `LEGACY-ASSET-0327D0DF98618D3066FD`、full SHA `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`、raw span SHA `492ba0ba76271c7c39ee02035cfbc4834877519af6452cee317efbbb04434ebe`）と旧NFR-01 line 31、NFR-03 line 32、NFR-15 line 64（asset `LEGACY-ASSET-DB669724249A14A665F0`、full SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）を直接の比較起点とする。旧FR-03 `119–148`、FR-05 `173–196`、AT-FR-03 `60–63` / AT-FR-05 `67–69`（旧functional-requirements.md full SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`、旧L3-acceptance-test-design.md full SHA `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`）は比較対象である。FR-08 `257–280`、旧FR-09は `281–309`（310は次の旧FR-10見出し）であり、本Stage 1親には対応づけない。 | 固定L2-011の明示入出力、環境非依存、scope・authority、result return、stop/resume・expiryを中心に再導出する。SBCのsnapshot観測はpreflight、dispatch直前、dispatch直後（旧SBC:60–70、特に67）であり、expiry（68）は不成立理由の一つでsnapshot再観測の対象ではない。dispatch前のblockedとdispatch後に結果を確定できないuncertainの観点を部分再利用する。旧FR-03のV字双方向traceと旧FR-05の決定論的G3 gate／PO bypass成功動作はこの親への直接起点から外し、置換して移さない。署名issuer、file-system port、Node実装、旧timeout等の実装も移さない。旧NFR-01/03/15のOS matrix、AI mode一覧、local-only/server phase値は現行条件として継承せず、画面・path・provider・CI製品へ依存しないという固定L2の意味へ再導出する。authority policyは既決SECURITY責務へ残す。 |
| HARNESS-L2-023 / FR-023 | 上記旧FR-03 `119–148`、FR-04 `149–172`およびAT-FR-03/04 `60–66`（同一全文SHA）。 | 依存欠落とclosure未解決のnegative shapeを、固定L2-023の4分類・revision条件・矛盾/unknown/stale・人代行receiptへ限定して再導出する。cycle fixtureは宣言closureを解決できない場合だけunknown/保留とする。旧requires/blocks graphと12 PLAN-kind enumは置換。 |
| 010/023の隣接FRS根拠 | `LEGACY-ASSET-B75E46DBE77592351574`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:60–92,115–125` (010), `127–142,209–212` (023), SHA `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17`; `LEGACY-ASSET-201EED9C5D6D2FF4D41B`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23–46,64–67`, SHA `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20`; `LEGACY-ASSET-67ADFAB856D954B3C5D2`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:37–47,58,73–81`, SHA `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | 単一behavior contract・変更影響trace・安全閉包など近接する保持点だけ部分再導出。rollback/replacement (R-10) とimplicit promotion禁止 (R-11) はAC-010-03およびAC-010-01/03へ対応する。変更影響traceの保持点はAC-023-02（dependency版・scope・根拠を相関ID付き証拠へ結ぶ）とAC-023-03（同じinput/revisionでclosureと根拠を一致させる）へ対応する。R-13の検証義務を減らすための分割禁止は固定親の範囲外として置換し、新たな制約として移さない。旧Slice/Module/Bundle graph、owner enum、promotion義務、state/schema、候補AC/gateは現L2の意味を変えるため置換。これら旧候補は直接authorityでない。 |
| 旧business-detail 21–39 | `LEGACY-ASSET-A6E2C7F0565E5F804F06`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–39`, full SHA `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`, raw span SHA `ade5075e3df236216603e1e0d3fb83c8cdae007f7f319e49bd4af1c5d4efca5e` | 単一の正本への参照と適用範囲を分けて記録する文書構成だけを例として保持する。BR-21 / HM-08 / P2 Learning Engineの適用対象は固定親の範囲外として除外する。この範囲はSSoT参照・適用範囲・PLAN/skill/modelの評価単位と主担当指標を記す。評価指標の目標値は43–47行にある。 |
| 旧business-detail 84–104 | 同asset/path、full SHA `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`, raw span SHA `f79e52ce0ac3797d30c46573a61f8115656ece2f8485461c728cdcf50fa4b38f` | §4「改善アクション」の自動適用水準、人の判断点、skill廃止rating閾値、PO承認待ちとHM-08連携は置換し、現Stage 1の独立business requirement／owner／oracleへ移さない。導入判定閾値と呼ばない。 |

旧source本文はread-onlyで参照し、旧CLI/runtime/test/CIは実行していない。上記旧FRSは隣接候補資料であり、固定要求を上書きするauthorityではない。

## Stage 2b suffix — HARNESS-L2-012/013（1.0対象候補）

この追補は採択候補のHARNESS-L2-012〜016を対象とする。main 28b3d3645e6298c159758700c2edd3d396c336f5のStage 1本文をbyte単位で保持し、このStage 2b suffixだけを追加する。Stage 2a/2cの内容は取り込まず、IDも変更しない。固定L2はmain `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の同一文書SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、親行は012が363–370、013が371–378。固定L11は同mainのSHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`、受入行は012が207、013が208。PO判断記録 `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` のproposal rowはmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`の41–42行。G0順序・version intentは固定G0 addendum `docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.md` の `ef753a0e13c908ef1e02b6185bf371ad4eefadd1` Stage 2b行44–45、および対応JSON recordにある。両親は採択候補の1.0 targetだが、L3承認、実装、release inclusionは意味しない。L2本文に個別`version_target`印はないため、項目版はG0の記録に従い、1.0完成を宣言しない。

### 旧資産の項目別起点と扱い

| 現行親 | 旧source（archive相対path・行、asset、full SHA-256） | 再利用・再導出・置換 |
|---|---|---|
| L3区分・L3/検証対の配置 | `LEGACY-ASSET-9A772391C7FB1298D45F`, `root/docs/design/harness/L3-functional/README.md:16–56`, `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`; `LEGACY-ASSET-F542125805B777D8A56A`, `root/docs/process/forward/L00-L06-design-phase.md:148–166`, `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | FR/ACと対の検証設計を対応づける区分を再導出し、現行L3/L10・通常のL3承認に合わせる。旧番号・G3名・runtime・sub-gateを移さない。 |
| `HARNESS-L2-012` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605`, `root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:143`, `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; `LEGACY-ASSET-44DD86E3DEC09E65EF51`, `root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:100`, `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`; `LEGACY-ASSET-63DEDB3F6F768B251BC5`, `root/docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md:25–50`, `d72c002d485628ba059346b6af6a7233cead8bdf060a2630289d1c8148e0e26f` | 旧HR-FR-P1-04/HAT-P1-04とscreen-applicability testの、画面適用性・非UI判定・結果を要求へ返す発想を固定L2-012の条件へ再導出する。非適用の記録は固定L2が挙げる理由・判定者・HEAD・要求への影響・再評価条件に限る。旧receipt schema、S4/freeze gate、旧L7 test ID・runtimeは置換し、別承認や追加gateを作らない。 |
| `HARNESS-L2-013` | `LEGACY-ASSET-E78B8D68CC327AA00991`, `root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:42–67`, `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61`; `LEGACY-ASSET-AD746F4F3487103519F9`, `root/docs/test-design/helix/requirement-discovery-json-authority-acceptance.md:16–33`, `3462b3da8269668c848799b07305f2fe135d8902de02121c2048d5686d98dc0e` | L1・指示・根拠を混ぜず、欠落・矛盾・過剰解釈を検出し、候補と反例をL10へ結ぶ形を項目ごとに再導出する。固定L2:376が要求する要求エンジン（部品）とCOREの存在は保持するが、既存の採択済み契約で確認できない入力契約のpayload/schema/owner詳細はunknownとして残す。old strict JSON、append-only DB、G1/G3 freeze、24-contract schema、cutoverは固定L2-013の条件でないため置換し、設計・実装条件を導入しない。HARNESS-L2-008は採択済み前提にせず、親として追加しない。RDJ-FR/AC-003/007のpriority/iteration詳細は024が固定L2上で扱う別親の範囲へ残し、ここへ持ち込まない。 |

### `FR-HARNESS-L3-012` — PrototypeとPoCを分けた単体判定（親: `HARNESS-L2-012`）

**保持／再導出**：合意前のL2要求、screenの有無、技術的成立性の不確定要素を対象scopeとrevisionに結ぶ。screen prototypeの適用性とPoCの適用性・結果は別々の判定であり、片方からもう片方を推定しない。画面がないことだけをPoC非適用の根拠にせず、PoCが適用可能なtechnical uncertaintyも個別に判定する。①は②〜⑦なしで単独利用でき、screen prototypeの入力となる要求記述は②の出力、またはHARNESS-L2-019で持ち込まれた既存文書のどちらでもよい。入力条件はL2要求に記述された対象に限り、prototype／PoCの結果をDecide前にproduction成果へ昇格させない。screen prototypeの成果物形式は固定L2どおりHTMLとする。

**入力**：対象L2要求・対象revision/scope、screenの有無、prototype適用性の判定根拠、技術的不確定要素とPoC適用性の判定根拠、各判定者。①のscreen prototype入力となる要求記述は、②の出力またはHARNESS-L2-019で持ち込まれた既存文書のいずれでもよい。prototypeまたはPoCを非適用と判定する場合は固定L2どおり非適用理由・判定者・対象HEAD・要求への影響・再評価条件を記録する。

**出力**：screen prototypeの適用性とartifact/result、技術PoCの適用性と成立性evidence/resultを別々に返す。各々の結果と根拠を対象revision/scopeへtraceし、要求へ戻す候補を示す。候補や試作物から要求合意、Decide裁定、L3承認を生成しない。

**境界・失敗時**：prototype/PoCの適用性や結果が不明なら別々にunknown/未評価として保持する。非適用記録のいずれかの固定fieldが欠ければ、そのfieldと未解決理由をHARNESS要求ownerへ戻す。試作とPoCを同一resultとしてまとめる、試作だけで技術成立を主張する、結果を要求合意またはproductionへ昇格する、②〜⑦を単独利用の前提にすることを認めない。

**受入条件**

- **`AC-HARNESS-L3-012-01` 独立した適用判定と結果分離（FR-HARNESS-L3-012）**：screen prototypeとtechnical PoCの双方が適用可能な正常fixtureを使い、別々のscope/適用判定/evidence/resultを返す。Prototypeの成功からPoC成立を導く変異とPoCの成功からPrototype成立を導く変異は独立negativeとして拒否する。
- **`AC-HARNESS-L3-012-02` 非適用記録・Backflow（FR-HARNESS-L3-012）**：Prototype非適用・PoC適用の正常fixtureを置き、screenなしだけではPoC非適用を決めない。非適用理由、判定者、対象HEAD、要求への影響、再評価条件を一つずつ欠落させる独立negativeを置き、必要fieldと戻し先を示す。適用性や要求への影響を判定できないfixtureは製品成功/失敗へ丸めず未評価とする。
- **`AC-HARNESS-L3-012-03` Decide前の境界と①単独入力経路（FR-HARNESS-L3-012）**：①のみを導入する正常fixtureで、screen prototype入力の要求記述を②の出力から受け取る場合と、HARNESS-L2-019で持ち込まれた既存文書から受け取る場合を個別に確認する。どちらも②〜⑦を必須にせず、①単独の適用、結果とBackflow候補を確認する。Decide前に試作/PoC成果をproduction成果、要求合意、承認済み要件と表示する各変異を個別に拒否する。Decide後のproduction化条件や権限はこの親から追加しない。これはDecideやL3承認の新gateを作らず、固定L2の状態境界を確認する。

### `FR-HARNESS-L3-013` — 根拠付き要件対の1次・適用時2次形成（親: `HARNESS-L2-013`）

**保持／再導出**：Concept/L1、利用者の指示と根拠から1次要求候補を形成する。HARNESS-L2-012を適用した場合のみ、その試作/PoC結果をBackflowとして取り込む2次形成を行い、1次と2次の候補・根拠・意味差分を別々に示す。012を適用していない単体②の正常入力では2次形成を要求しない。単体・接続・構成体のidentityを分け、L2要求とL11受入の対、およびL3要件とL10総合検証の対を人の承認待ちで渡す。

**入力**：対象Concept/L1 revisionとscope/non-goal、利用者指示、その根拠のidentity/revision、012を適用した場合のscreen prototype/PoCの個別結果・evidence・Backflow差分、単体/接続/構成体の対象identityに加え、固定L2-013が必須とする要求エンジン（部品）とCOREの選択済み入力契約identity・revision・scopeを参照する。これはこの2依存の要求存在を確認する技術的候補であり、入力契約のpayload/schemaや未記載の契約内容を新設しない。固定L2や既存の採択済み契約から確定できない契約内容・ownerはunknownのまま保持する。入力の一部がなくても、得られたものを固定親の範囲で候補化するが、必須依存の契約tupleを解決できない範囲は完成した要件形成として扱わない。

**出力**：1次形成（常時）と、012を適用した場合の2次形成（条件時）を識別した要件候補と根拠、L2/L11およびL3/L10の対、欠落・矛盾・企画外追加・重複・過剰解釈・対象違い・scope/non-goal逸脱・変更影響の一覧を返す。解決に人の意味判断が必要な項目は判断主体・選択肢・影響が確認できる人間判断待ち候補として残す。候補の形成が完了し人へ渡せる状態と、人の判断・要件承認が完了した状態を区別する。

**境界・失敗時**：証拠または要求情報の欠落、矛盾、企画外の意味追加、scope/non-goal逸脱、単体/接続/構成体のidentity混同は成功扱いせず、原因項目と意味を持つL1/要求ownerへの戻し先を示す。必須の要求エンジン部品とCOREは別々の入力契約として扱い、それぞれのidentity・revision・scopeにmissing、unknown、stale、mismatchがある場合はその状態を個別に表示し、影響する形成範囲を未完として該当する既存契約ownerへ戻す。owner identityも参照元から特定できなければowner不明を保持し、架空のownerや契約内容で補わず上流要求ownerへ不足を示す。HARNESS-L2-008を採択済み親、依存、またはこの不明情報の補完元にしない。①、③〜⑦を一律の前提にすることとも区別する。012の結果が適用されていないのに2次形成済みと偽装しない。human decision pendingはAIの形成不備と混同せず保持するが、そのpending状態から要求合意、L3承認、操作権限を生成しない。要件候補を1回の出力で確定させる強制、新しい確認gate、固定回数・weight・thresholdは追加しない。

**受入条件**

- **`AC-HARNESS-L3-013-01` 1次形成と条件付き2次形成（FR-HARNESS-L3-013）**：Concept/L1・指示・根拠だけを持つ②単独の正常fixtureでは1次候補を返し、012を使わないことを理由に拒否しない。012結果を適用した正常fixtureでは、同じ対象の1次候補、別の2次候補、012結果から生じた意味差分をtraceする。1次と2次を同一出力・同一状態へ潰す変異、または未適用012の結果を使ったと偽る変異を拒否する。
- **`AC-HARNESS-L3-013-02` 不足・矛盾・逸脱の可視化（FR-HARNESS-L3-013）**：入力にある必須情報欠落、互いに矛盾する記述、L1範囲外の追加、重複、過剰解釈、対象違い、scope/non-goal逸脱、変更影響の各々を独立に一変数negativeとして与え、該当一覧・根拠・owner戻しを照合する。正常で未見の同scope指示/根拠組合せも与え、隠れた新意味を補わず、適用可能な入力情報を候補へ正確に反映する。
- **`AC-HARNESS-L3-013-03` identityと対の成果物（FR-HARNESS-L3-013）**：単体・接続・構成体を別identityとして形成する正常fixtureを確認する。二つ以上を一identityへ混ぜる、L2/L11対またはL3/L10対の片方を欠く、L2要求とL3要件を同一artifact扱いする変異を個別に拒否する。
- **`AC-HARNESS-L3-013-04` 人間意味判断・承認境界（FR-HARNESS-L3-013）**：候補・根拠・差分・欠落が揃い、人間判断が必要な選択だけpendingの正常fixtureを提示する。人がまだ意味を選んでいないことと、AIが要件を形成できない欠落を別状態で示す。AIが選択、要求合意、L3承認または操作許可を生成する変異を各々拒否する。判断用根拠がない場合は承認待ちに偽装せず不足項目へ戻す。
- **`AC-HARNESS-L3-013-05` 必須engine/CORE入力契約の識別と不足状態（FR-HARNESS-L3-013）**：要求エンジン（部品）とCOREを別の必須入力として扱い、各々についてfixtureが宣言する入力契約identity・revision・scopeを照合する。契約内容そのものはfixture仮定とし、固定L2が規定しないschemaや実製品値を採択しない。identity、revision、scopeの各fieldへmissing、unknown、stale、mismatchを一つずつ独立に導入し、影響範囲を未完としてその契約の参照元が示す既存ownerへ戻す。ownerが入力にない場合はowner不明も埋めずに示す。HARNESS-L2-008を採択済み依存・補完元にせず、①、③〜⑦を単独利用の一律必須依存にしない。①を適用した場合の結果入力は固定L2どおり保持し、engine/COREの不足を代替したとは扱わない。

旧RDJ-FR/ACは項目ごとの歴史的起点であり、現在のrequirement engineのJSON/runtime/承認設計として採用しない。今回の親に直接対応する再導出は次に限る。

| 旧要件／受入 | 対応する現行意味 | 処置と境界 |
|---|---|---|
| RDJ-FR-001 / RDJ-AC-001 | 利用者が提示したL1・指示・根拠と、未確定/不足の区別 | 根拠を保持し、未提示の意味をAIが埋めない点を再導出。旧initiative field集合を現行L2の追加入力として固定しない。 |
| RDJ-FR-002 / RDJ-AC-002 | 指示/根拠と、適用した場合の012結果を用いた1次/2次形成 | 形成段階と根拠差分のtraceを再導出。append-only event store、projection、replay/databaseの実装契約は固定L2-013にないため移植しない。 |
| RDJ-FR-003 | 欠落・重複条件を見落とさないこと | 重複の検出は固定L2-013に沿い再導出する。旧影響度×不確実性×cost×専決度のpriority式は固定L2-024側の別scopeであり、013へ追加しない。 |
| RDJ-FR-006 / RDJ-AC-006 | 過剰解釈をせず、人の判断・承認をAIが代行しないこと | 固定L2-013の「過剰解釈」と「人の承認なしに確定しない」範囲を再導出。旧implicit matrixや自動canonicalization architectureは移さない。 |
| RDJ-FR-007 / RDJ-AC-007 | 候補形成と人間判断/承認pendingの分離 | 人の判断待ちを承認済みにしない境界だけ再導出。旧P0/P1、prototype agreement全条件、直近2 iteration、score判定は固定L2-024または他の明示親へ残し、013の新条件にしない。 |
| RDJ-FR/AC-004/005/008–012 | surface/action state machine、reaction reducer、strict JSON/compiler/schema/cutover/parity/style | 固定L2-013の入力と責任範囲に明示されない専用契約なので、この2親の要件にしない。 |

RDJ-FR-003/007とAC-003/007の質問priority・固定iteration詳細は、親L2-024の独自範囲と混同しない。

## Stage 2b suffix — HARNESS-L2-014/015/016（1.0対象候補）

014〜016も固定L2 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` と対のL11同revisionの範囲だけを具体化する。authorityは固定L2/L11と該当する採択判断に限る。L11 G12の変更影響/制約oracle（同revision:274–280）とG13の品質優先・性能改善で回帰を相殺しない条件（:323–324）を含める。mainで承認済みのStage 1 HARNESS-L2-010/011/023の承認はmainのexact revisionだけに適用し、このStage 2b suffixの承認や他のStageの採択を意味しない。親ごとのL1責務、単位scope、入力・出力、工程契約とownerを保ち、未選択親を一律gateにしない。合成fixtureは試験設計上の仮定で、実際のL3承認、template、CORE contract、BRAIN connector、artifactやrevisionを生成しない。

### 旧HELIX資産の項目別起点と扱い

固定L2:385の旧Design Template条件、f6 L2:60およびPO確認revisionのL2-009を設計起点とする。旧 `LEGACY-ASSET-5CBA32E9DB5B0FE05589` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md`:60–70（full SHA-256 `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae`）から、要求family適用・source-kind不一致の識別を再導出する。旧 `LEGACY-ASSET-0861E1D3646C7A28AAD0` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-design-registry-requirement-family-acceptance-test-design.md`:28–45（`bf4d0f0aba62f66e82c0f58c7134765f6c1fb0bcb7f00bb2324e6b2f729a1e9c`）から、対応する正常／誤りfixtureの形のみ再利用する。registry/catalog/parser/loader/DBや旧approvalは移さず、固定L2が指定するDesign Template・CORE・BRAIN connectorへ置換する。templateは設計義務を導く入力であり、要求意味のauthorityではない。

旧 `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:152（full SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）および `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`:109（`df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`）から、V-pair欠落・coverageだけで完了にしない汎用形を再導出する。pillar FR:152はP3-01の旧箇所として位置を固定し、現行015/016の独自根拠にはせず、旧要件と現行親の意味差分を追跡するためsource pinへ記録する。015では同じassetの旧HR-NFR-P3-04（同文書:181）、旧HAT-N3-04（同じassetの受入文書:136）、旧LIT-N3-04（`LEGACY-ASSET-B7E240E4CE0263FDBDF6`の旧L5 test文書:77、full SHA `0bf20d470daba6a63b515ebd0d53509ee24c64df2c9e6bd6235e7874af23a8f5`）から、Red/oracle/Green/refactorの観測形だけを再利用する。固定L2-015に「理由付き代替oracle」の例外はないため、この例外経路は採らず、固定L2/L11のoracleで照合する。現行L2条件へ対応させ、旧P3 gate/runtime/CI手順は持ち込まない。誤locatorのpillar FR:152–156（P3/P4別要件）およびHAT:109–110（P3-01/02）は015/016の要件根拠として用いない。

旧HIL-16の意味・consumer/oracle保存と誤routeの指摘は再導出する。起点は `LEGACY-ASSET-02D897E62EF2FA267267` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:146–150（full SHA-256 `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`。旧区分行148–149を含む文脈bounded span）、`LEGACY-ASSET-0B5B38F146D9538C9A36` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md`:16–43（`f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`）、`LEGACY-ASSET-C7F0C3B79CBAA72960BF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:50,79（`8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`）、`LEGACY-ASSET-FA8C6E69463183D6A19B` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:48（`a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`）および `LEGACY-ASSET-7E16E3B80335D8EC6F35` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md`:16–40（`869d4494c8f5cfaea4d90f29392ee1a2c7c63cc2084712eb43e0c1d91cdeca60`）。これらは意味保存・consumer・回帰oracleと上流差戻しの旧failure/test例に限る。旧state machine、role catalog、function sequence、DB/receipt/fence、runtimeは移植しない。固定L2:395–402のBackflow先とPerformance測定条件に置換する。

### `FR-HARNESS-L3-014` — templateに基づく設計と対の検証設計（親: `HARNESS-L2-014`）

承認済みL3要件の正確なrevision/scopeと工程契約を受け取り、入力要件は②の出力またはL2-019で持ち込まれた既存要件のいずれでもよい。③単独の適用を保ち、②を一律の前提にしない。適用可能なDesign Template、CORE工程契約、必要なBRAIN connector入力を用いてL4基本設計・L5詳細設計・L6契約と対のL9/L8/L7検証設計を出す。要求kind・対象・構成・risk・domainに対応する義務と、その入力source/revisionを明示し、単体・接続・構成体固有の義務を区別する。下位設計の束ねだけを構成体義務の充足にしない。templateが要求する入力不足・不一致は質問/要求候補として要求ownerへBackflowし、templateから要求意味を決定しない。実際の承認状態や契約内容が入力にない場合は未完/unknownを維持する。

| AC ID | 受入条件 |
|---|---|
| `AC-HARNESS-L3-014-01` | ②の出力またはL2-019で持ち込まれた既存要件のいずれかを用いる正常fixtureで、承認済み要件のsource/revision/scopeおよび工程契約を設計sourceへ追跡し、kind・対象・構成・risk・domainに合うtemplate義務と要求制約を対応づける。template軸の不一致を一軸ずつ与えるnegativeでは誤templateを拒否する。 |
| `AC-HARNESS-L3-014-02` | unit/connection/composite義務を別々に設計・検証計画へ対応させ、接続固有義務の正常fixtureとその欠落negativeを含め、下位成果の存在だけで上位義務を成立扱いしない。 |
| `AC-HARNESS-L3-014-03` | templateが明示的に必要とする要求入力のmissing/unknown/conflictを識別し、要求ownerへのBackflow候補にする。templateは要求意味・approvalを決めない。 |
| `AC-HARNESS-L3-014-04` | 要求・隣接境界・対のverification designへの変更影響を適用可能な固定oracleと照合し、必要な検証設計が欠ける変異を、template/traceが存在しても不合格にする。 |

### `FR-HARNESS-L3-015` — 凍結設計に対するProvisional実装（親: `HARNESS-L2-015`）

凍結済みL6契約・L5詳細設計および対の検証を、各source/revision/scopeとともに受け取り、固定L2-015が別々に求めるCORE工程契約とCORE検証契約も、それぞれ独立したsource identity/revision/scope traceとして扱う。両契約は互いに代替せず、契約内容・schema・payload・ownerをこの要件から新設しない。限定された実装と設計・test間の双方向traceを作る。固定L2の範囲でcontract→implementation→Red→Green→意味保存の局所Refactor→atomic CIを閉じ、結果状態をProvisionalとする。局所Refactorでpublic contract、要求、architectureまたはstateの意味を変えない。ticketとの関係から選ぶPR前CIと省略検査の記録を保持するが、CIの構成・運転はHELIX-OS、利用者環境では利用者側の責務であり、HARNESSは検証契約を渡す。利用者CIの結果も同じatomic CI観測対象にでき、HELIX-OSの運転を一律必須にしない。CI実行主体が提供する結果/receiptを検証設計へ渡して閉鎖を観測するが、HARNESS自身はCIを運転しない。atomic CI green単独やコード存在だけからquality/effect success/Acceptedを推論せず、固定quality oracleを満たさない成果はProvisional以上へ進めない。

| AC ID | 受入条件 |
|---|---|
| `AC-HARNESS-L3-015-01` | 実装対象が凍結L6/L5および対の検証と同じrevision/scopeに結び、設計↔testの双方向traceを持つ。CORE工程契約とCORE検証契約は別々のsource identity/revision/scopeへtraceし、一方の存在で他方を代替しない。 |
| `AC-HARNESS-L3-015-02` | 固定された正常oracleでRed→Greenと局所意味保存Refactorを観測し、該当結果revisionをProvisionalとしてのみ出力する。固定quality oracleが不成立でも、費用/時間改善、atomic CI green、コード存在だけを理由に改善成功・Acceptedへしない。 |
| `AC-HARNESS-L3-015-03` | ticket関係から必要検査と選択したPR前CIの範囲を示し、省略検査を記録する。CIの組立/運転をHARNESS要件へ移さない。 |
| `AC-HARNESS-L3-015-04` | 内容oracleの不一致、public contract/要求/architecture/state意味の変異があれば、CI結果にかかわらず実装成果を拒否し、sourceが示す設計/要求ownerへ戻す。局所Refactorでpublic contractまたは要求意味を変える変異を個別に拒否する。 |
| `AC-HARNESS-L3-015-05` | CORE工程契約とCORE検証契約のidentity/revision/scopeを独立して確認し、いずれかのmissing/unknown/stale/mismatchを完成扱いせず、その依存ごとに理由とsourceが示す戻し先を保持する。sourceが戻し先を示さない場合はownerをunknownとし、新しいschema・契約内容・ownerを作らない。 |
| `AC-HARNESS-L3-015-06` | CI実行主体（HELIX-OSまたは利用者）が提供するatomic CI結果/receiptにより選択検査範囲と省略検査を照合し、結果がないのに閉鎖済みとする変異を拒否する。利用者CIだけの正常fixtureを認め、HELIX-OS CIを一律必須にしない。 |

### `FR-HARNESS-L3-016` — 意味保存Refactorと上流Backflow（親: `HARNESS-L2-016`）

⑤単位で受けた実装、paired design/contract、要求、構造を改善する理由を個別に扱う。paired design/contractがなければ、固定L2-019のreverse designから不足を補う。契約・要求・観測behaviorを保存する変更だけをRefactor候補とし、誤った詳細契約はL5、architecture/boundaryはL4、要求/acceptanceはL3/L2、価値はL1へ固定どおりBackflowする。Performance Refactorではbaseline・budget・workload・profile・statistical condition・regression oracleを測定前に特定し、比較可能な観測を要求する。L2の定めない閾値、改善率、工程④の完了を前提にしない。

| AC ID | 受入条件 |
|---|---|
| `AC-HARNESS-L3-016-01` | paired sourceがある場合、変更前後の要求・contract・observable behavior・consumer/oracleを比較し、同じ意味の変更だけをRefactor候補として残す。 |
| `AC-HARNESS-L3-016-02` | paired design/contractがない場合はL2-019 reverse designの必要性を示し、構造改善理由とそのsourceを保持したうえで⑤完了・Refactor済みと偽らない。④を一律の依存にしない。 |
| `AC-HARNESS-L3-016-03` | 構造改善理由とそのsourceを保持し、意味を変えるfailureは詳細contractをL5、architecture/boundaryをL4、要求/acceptanceをL3/L2、価値をL1の該当ownerへそれぞれ戻す。sourceが示す戻し先を使い、sourceが示さない場合はownerをunknownとして残す。右側の実装修正で要求authorityを書き換えない。 |
| `AC-HARNESS-L3-016-04` | Performance Refactorでは測定条件と全ての該当回帰oracleを事前固定し、プロファイル対象の比較可能な前後結果を示す。比較不能、予算違反、回帰または測定不能な改善主張は成功扱いしない。 |
## Stage 2a suffix — HARNESS-L2-022（1.0対象）

この追補はStage 2aで選択されたHARNESS-L2-022一親に限る。固定L2/L11とPO採択対象revisionを親とし、Stage 1の本文・ID・意味を変更しない。L3草稿は未承認であり、実装・実行・releaseを許可しない。Stage 1の承認記録は既存010/011/023の対象revisionに限り、本022の承認を生成しない。

### `FR-HARNESS-L3-022` — コアの検証・受入契約

**由来と処置**：旧G3/L3のFR+ACと対のverification designという構造、旧pillar文書のFR/AC trace形式、旧L10 test designの正常・反例・未見oracle構造を起点として再導出する。旧G3名称・freeze/sub-gate/runtime、旧ID・件数・集計完了規則、旧L10 UX限定の責務は置換し、現行の通常L3承認、HARNESS-L2-022の段階契約、対のL10 system verificationへ合わせる。旧L10-UXの実体はL11利用者受入であり、現行L10と混同しない。根拠のasset/path/span/full SHAは対応する時点監査記録へ収録する。

**固定source trace**：親はPO判断記録main `633bf12ea8f948db8ba3d6600179c4a9507377a7`（022 proposal `MPR-RC-HARNESS-L2-022-004`、登録metadata自体はauthorityではない）で採択された、L2 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のHARNESS-L2-022（L2:447-461、本文SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`）。対のL11同revisionは全文SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`（L11:217, 298-304, 317-325）。L11:317-325は各段階のquality/security/acceptance oracleと適用scope、provisional→Integrated→Verified→Acceptedの証拠を別々に結び、oracle/receipt不足の品質を未評価に保ち、lower-stage pass/CI green/evidence presenceのみの上位成立と改善scoreからの意思決定・要求承認生成を反例とする。PO判断記録main `633bf12ea8f948db8ba3d6600179c4a9507377a7` L51の採択registration `MPR-RC-HARNESS-L2-022-004` が束縛するreceipt `docs/governance/audits/requirement-registration/harness-effect-acceptance-coverage-receipt-2026-09-27.json`（f6 fixed-tree SHA `d67f3379cfc5c6884a7aa82497473267caf5f4bed309c3b84c4307ced927edb5`、authority_effect=none）は、過去L11 append SHA `ad983b6f278c057b3565fb3af56aa70300da5185c25f69c8d8b158e76f04d504` とG13の意味を記録する。fixed-tree時点のL11:317-325 span SHAは`b857ca0505004bf512cb163b23170ee0b25feda540a69c6c7e2112550c44cb22`。

同じ固定L2:461はHARNESS-L2-005の構成的保証と差分証明、およびFRS-BR-009も既存条件として束ねる。固定L2-005の該当説明は同revision `product-requirements.md:118`、FRS-BR-009の明示行は`:286`、対のL11で個別機能と組合せ全体を区別する句は`product-acceptance.md:186`。これらはstageごとの下位証拠と上位固有oracleの差分、組合せの統合・更新・復旧・運用検証を単体成功と混同しないtraceに限って対応させる。L11は022の1.0範囲を明示する。実装順序は`docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.md:54`（当該本文SHA `c30d5b2ca757952f9772573bffb95a03dfb8ccf686687b92bb70d2c93c956253`）でHARNESS-L2-022をStage 2aに割り当てる。Stage 1 #2572の承認を022へ継承せず、022の要求意味は固定L2/L11から導出する。

旧sourceの項目別処置：`LEGACY-ASSET-F542125805B777D8A56A`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-166`, SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）の148-154行から3区分とFR+AC形式を再利用する。process 155-157行はUX受入をL10 pairと記す一方、`LEGACY-ASSET-9A772391C7FB1298D45F`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:41,53`, full SHA `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）はL12 pairと記し、旧source間でpair layerが食い違う。この差異を旧番号やUX限定ごと継承せず、現行配置規則のL3/L10対と固定022から再導出する。process 163-165行の`engineering_discipline_required`、no-code-first、complexity/modeling判断は固定022の要求外なので継承しない。process 158-162行のG3 gate/freeze/role/AP-4も移さず、通常L3承認と現行trace要件へ置換する。`LEGACY-ASSET-EE5DBACC7F28F7D1F605`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:38-57,134-197,198-307`, SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）からFR/AC trace形式を再利用し、各義務を固定022から再導出する。旧51/102件、旧ID・aggregate completeness・P2/P7内容・旧runtime/CIは移さない。`LEGACY-ASSET-44DD86E3DEC09E65EF51`（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`, SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`）から条件別oracle・正常/反例/未見の対形式を再導出し、HAT/旧実行結果/L12経路は置換する。`LEGACY-ASSET-535EBA960C372C61F999`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L10-ux/ux-evidence-boundary.md:17-21,40-44`, SHA `92caa47dcd181fc790dec462820b063a1c8a6ed9c0b86410306ead9cb13e3f71`）はL11利用者受入とL10総合検証の責務分離のみを再利用し、旧physical path/layer表記とUX限定を現行責務へ移さない。各span raw SHAおよびsource本文の照合pinは時点監査用handoffへ記録する。

**対象・入力**：対象HARNESS artifactのrevisionとscope、Provisional成果物、対のL5詳細設計/L4基本設計、固定L2要求・L11条件、L3要件、L8/L9/L10の対の検証設計・oracle・結果・証拠を受ける。④を前提にせずCORE traceと対の設計を用いる。成果物は④出力またはHARNESS-L2-019経由で持ち込まれたものでもよい。

**状態と出力**：対象revision/scopeに結び、段階ごとの状態・判定理由・結果・証拠参照を出力する。Provisional→IntegratedはL8でL5、L9でL4をそれぞれScoped Reverseし、境界照合、必要なRefactor、結合証明が揃ったときに限る。Integrated→VerifiedはL10でL3を照合し、下位証拠に加えてシステム固有義務との差分が確認されたときに限る。Verified→AcceptedはL11条件（成功条件と反例）による内容判定と、同じrevision/scopeに対する利用者受入およびその記録を別々に満たしたときに限る。各段階の品質・security・acceptance oracleと適用scopeは別々に結び、設計・実装・refactorの各受入結果についてそのscope内で何を確かめたかを次段階へ引き継ぐ。oracle、適用scopeまたはreceipt不足で品質を確かめられない場合、その品質は未評価のままとする。各段階は別状態として保持し、未達部分を満たしたかのように昇格させない。効果比較や改善scoreは参照情報に留め、意思決定・要求承認・Acceptedを生成しない。

**不一致と戻し先**：振る舞い・契約・要求の意味を保てる不一致は右側をRefactorし、同じ段階の検証を再実施する。意味変更が必要な場合は発見した検証層だけで戻し先を決めず、HARNESS-L2-003/004に従って意味を所有する左側へBackflowする。L11で見つかった意味差は要求へ戻し、コードを直接変更して合わせない。上位oracleが欠落・失効・scope不一致、必要証拠欠落、またはrevision不一致なら、その上位stateを作らず、実際に満たした段階までを保持して未評価/保留理由を示す。

**責務境界**：この段階はservice①〜⑦の個別所有物にせず、HELIX-HARNESS COREが共通契約として提供する。HARNESSは何をどの対・証拠で照合しどこへ戻すかを定める。HELIX内のCI/test運転、ticket発行、検収はHELIX-OSの責務、利用者環境の実行と受入手段は利用者の責務であり、HELIX-OSを必須依存にしない。L10合格またはoracle成功だけでL11利用者受入記録を生成しない。

**外部成果物**：外部artifactも同じ対象revision、scope、対の設計、requirements、oracle、result、evidenceを照合し、条件を満たした段階までの状態だけを⑥へ渡す。存在や下位段階の証拠だけでVerified/Acceptedへ昇格しない。

#### 受入条件

- **`AC-HARNESS-L3-022-01` 段階別の正常遷移（FR-HARNESS-L3-022）**：同一artifact revision/scopeに対しL8/L5とL9/L4のScoped Reverse・境界・Refactor・結合証明からIntegrated、L10/L3とシステム固有義務差分の証明からVerified、L11内容oracleと別個の利用者受入記録からAcceptedへ、各stageのquality/security/acceptance oracle、適用scope、証拠を別々に追跡する。設計・実装・refactor各結果で確認した内容をそのscope付きで次stageへ引き継ぐ。
- **`AC-HARNESS-L3-022-02` 昇格条件と状態分離（FR-HARNESS-L3-022）**：段階飛ばし、L8/L9以下のみ、システム固有義務差分の欠落、L10結果のみ、L11 oracleのみ、L11内容oracle failure、quality oracle/receipt不足、対象revision/scopeの異なる利用者受入recordの各変異を個別に拒否し、上位stateを作らず実際に満たした段階を保つ。下位証拠を上位oracleの代替にせず、判定不能な品質は未評価のまま保持する。改善scoreは意思決定、要求承認またはAcceptedを生成しない。
- **`AC-HARNESS-L3-022-03` Refactor/Backflow規則（FR-HARNESS-L3-022）**：意味を保てる不一致の同stage再検証を行い、一律左戻しを拒否する。意味変更時は固定L2-003/004に従い、詳細の契約→L5、architecture/境界→L4、要求/受入→L3/L2、製品価値→L1へ戻す。各分類を一つずつ別の宛先へ誤routeする変異を拒否し、L11意味差をコード修正で隠さない。
- **`AC-HARNESS-L3-022-04` COREと実行側の境界（FR-HARNESS-L3-022）**：CORE契約としてservice①〜⑦のいずれにも段階を所有させない。段階所有をserviceへ移す、HARNESS/INTELLIGENCEがOS・利用者のCI/test実行・ticket・検収を代行する、L11利用者受入recordをCORE/service成果へ置く、の各変異を独立に拒否する。利用者環境では利用者手段で同じ契約を使え、OSを必須にしない。
- **`AC-HARNESS-L3-022-05` 外部artifactの段階移送（FR-HARNESS-L3-022）**：同一revision/scopeの対設計・requirements・oracle・result・evidenceが成立する外部artifactを正常に受け、実証済み段階だけを⑥へ渡す。存在だけ、revision違い、scope違い、対設計/requirement/oracle/result/evidenceの欠落、oracle失効を独立に与え、各々上位stateを拒否する。
- **`AC-HARNESS-L3-022-06` ④非依存と未見適用（FR-HARNESS-L3-022）**：④を使わないCORE traceと対設計による構成でも契約を適用できる。既存fixtureにない同scope artifactまたは外部持込を使い、revision/scope bindingと段階別oracleを再適用する。未宣言の新要求・owner・OS依存を加えない。
## Stage 2c suffix — HARNESS-L2-030/031/032（1.0対象候補）

この追補は固定親030/031/032のみを対象にし、最新mainの承認済みStage 1/2b/Stage 2a HARNESS-L2-022本文とIDをprefixとして保持する。それらの承認は本Stage 2c候補へ継承しない。3親はいずれもPO採択対象だが、`1.0`はversion_targetでありrelease収載を意味しない。固定L2はmain `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の同文書（全文SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`）607–689行、固定L11は同main（全文SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`）404–461行である。G18共通前置きと027〜033所属・利用境界を含む。PO採択の意味とversion_targetは採択記録main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の決定記録59–61行および所属決定66行に固定される（本文SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）。PO登録metadata自体は別のauthorityを作らず、本L3も未承認草稿である。

G0の順序案BはStage 2a後に2cを2bと並行する段階配置であり、030/031/032を支援・候補生成として扱う。G0のStage 2c全版対象は10件、うち1.0 subsetは8件であり、案Bの最初の1.0組6件（HARNESS 030/031/032、INTELLIGENCE 068、OS 028/029）から本追補はHARNESSの3親だけを扱う。別枠の1.0追加2親（INTELLIGENCE 075、SECURITY 031）を本対象へ加えない。030は010/014/022をStage prerequisiteとして記録し、031は010/022を記録する。032にG0のStage prerequisite IDはないため追加しない。これらstage prerequisiteと、各親の固定L2 operation時依存は別である。前stage全件完了、独立review、または未選択操作の実行を新たなgateにしない。承認済みStage 1の010/011/023本文、Stage 2b本文、Stage 2a HARNESS-L2-022本文は各承認済み固定revisionの範囲でprefixに保持するが、その承認だけで本Stage 2c候補全体を承認済みとはしない。Stage 2bおよび022の義務を本Stage 2cの対象へ追加しない。022承認済みsuffixはprefixの一部としてbyte単位で保持し、本追補の対象にはしない。

### `FR-HARNESS-L3-030` — 検証case提案の生成（親: `HARNESS-L2-030`）

**保持・再導出**：旧L3定義（`LEGACY-ASSET-F542125805B777D8A56A`, `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168`, SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）と旧functional requirement FR-02/03（`LEGACY-ASSET-B5B5E71B2AF1459D59A1`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:95–148`, SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`）、旧AT-FR-02/03（`LEGACY-ASSET-1B92155F959D7905DD1E`, `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:26–40,57–63`, SHA-256 `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`）から、FR/ACと対の検証trace、正常・反例・境界fixtureの形を項目ごとに再導出する。旧4-artifact/12-edge等の件数、G3/runtime/sub-gate、旧ID、実行例は置換し、今回のcase数や合格数に流用しない。旧README（`LEGACY-ASSET-9A772391C7FB1298D45F`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`, SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）のL3要件と対の検証設計という区分は再導出し、旧L12 pair表記は現行L3/L10配置へ置換する。項目別旧source処置と照合pinは本草稿の対の時点監査記録に収録する。

**固定L2起点の旧根拠**：判断記録（`docs/governance/decisions/test-reproduction-derivation-2026-09-27.md:34–40`, SHA-256 `332361d740294bb7f90a8114a00ab05c0b9aaac2f599dcef765a632f9c414cc1`）が保持する再現根拠として、`LEGACY-ASSET-EE5DBACC7F28F7D1F605`（旧pillar FR, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:147–156,174–184`, SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）、`LEGACY-ASSET-DA012A9B04D5BE9419CE`（旧CI synthesis FR, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md:37–90`, SHA `65400847881f1a72b273f0bdeff503a5ea302705cd0e71d7913fc7d0f8dd18fb`）、`LEGACY-ASSET-81FAB27053CEFFED01A3`（INV-028/029, `archive/legacy-generation-2026-09-14/root/docs/archive/intake/development-investment-stage-directives-source_v1.0.md:982–1026`, SHA `7b7d0600bccd9045aa1c11f9762886c982b38e9446197f9dcf00637116833b04`）を、独立oracle、stable identity/revision、bounded sanitized inputと二重副作用拒否の項目別根拠として再導出する。旧CI/runtime/schema/閾値は移植しない。
**責務・入力**：HARNESS-L2-030の採択所属はHELIX-HARNESS-COREであり、要求/契約owner境界を保つ。OS-020または利用者CIの実行責務を所有・代行しない。010/011 pack/call/version/dependency/scope/receipt境界とcase artifact identity/schemaは常時必須入力であり、014は対応設計、022は独立検証oracle/期待観測を担う。OS利用時のpacket接続は032を通す。対象artifact/API/state transitionのrevisionとscope、承認済みL3要件、対応014設計、適用可能な022 oracle、選択された外部contract/source版を受ける。必要な入力・oracle・権限・選択sourceのmissing/unknown/conflictは確定caseを作らず、該当ownerへ返す。

**出力・境界**：安定case identity/family、actor、precondition、operation順、再現入力/data、選択contract内に限るdouble、requirement/design/oracle/source/scope/版trace、seedまたは生成入力、未解決条件を返す。同じ入力/source版/scope/seedならcaseの意味を再現可能にする。generator自身をexpected-value oracleにせず、選択外source/provider/schemaの存在・挙動を推測しない。doubleは外部serviceを呼ばず、実サービス等価性を主張しない。case生成・件数・coverageだけで実行、品質、欠陥なし、承認、受入を主張しない。

**受入条件**

- **`AC-HARNESS-L3-030-01` 宣言範囲と意味trace（FR-HARNESS-L3-030）**：正常fixtureでtarget revision/scope、L3 requirement、014 paired design、022 oracle、選択contract/source版、生成case identity/family/actor/precondition/operation/data/double/seedまたは生成入力/traceを対応させる。正常submit・境界・権限・cancel・順序の各familyを、入力oracleに定義された操作だけ独立に照合する。宣言API/state domain内で既存fixtureにない正常caseも評価し、oracleが定める意味・期待観測が保持される。
- **`AC-HARNESS-L3-030-02` 未解決oracleと権限**：010/011 pack/call契約またはcase artifact identity/schemaの欠落・unknown、oracle欠落/矛盾、scope違い、選択権限/source不足、actor不適合、合成の利用禁止data class（secretを含む実値は使用しない）のfixture混入を各々独立に変異し、いずれも期待値・permission・境界を発明せず該当要求/契約ownerまたはsecurity/data ownerへ返す。旧test例だけ、または過去logだけを根拠としてexpected、permission、scopeをそれぞれ独立に決める変異は拒否する。承認済requirement、security permission、適用oracleの各々を個別にreference-onlyへ格下げし、期待値/permission/scopeを決める根拠から外す変異も拒否する。これら固定根拠は実際に該当する意味のauthorityとして保持する。要求意味の変更は003/004の経路を保つ。未宣言rangeを有効とみなさない。選択operationに必要なsource bindingの欠落・読取不能だけを該当候補の未解決条件とし、不要で未選択のsourceは未観測に保ち、その存在・receiptを要求しない。
- **`AC-HARNESS-L3-030-03` doubleと生成物の非実行性**：selected external contractのみを表すdoubleの正常fixtureと、実service呼出し、未選択provider/schemaの模擬、generator自身の自己oracle化、未承認actorを許可する候補、固定oracleにない取消/境界の発明、承認後編集の許容、oracleと逆のstate transitionを個別に与える。後者は各々不合格であり、さらに生成物からrun、pass、acceptance、approvalをそれぞれ独立に推論する変異も不合格とする。追加case数/coverageでこの矛盾を相殺する候補も独立に不合格とする。同じpackの複数サービスによる二重所有と、共有packの利用を理由に未選択サービスまたはOS内部構成を必須化する変異を不合格とする。未見のサービス／pack組合せでは、主owner候補、利用先、選択操作の依存閉包を別々に照合する。未宣言の組合せは受入を推定せずunknownとして該当packまたはservice ownerへ戻し、所属ラベルだけで互換性・内容oracleの検証を代替しない。
- **`AC-HARNESS-L3-030-04` 契約・oracle更新時の再trace**：010/011 pack/call/dependency/version contract、014 designまたは022 oracleのうち一つずつを旧revisionから変更し、影響caseを新revisionへtraceし再生成・再検証する。影響範囲外のcaseまで一律保留にせず、旧revisionのpass/receiptを新revisionに流用しない。選択実行操作があれば新revisionの対応receiptを取り直すが、提案生成開始の前提にはしない。

### `FR-HARNESS-L3-031` — 許可failure入力のreproduction/reduction提案（親: `HARNESS-L2-031`）

**保持・再導出**：旧FR-16/25（上記旧functional-requirements.md:454–477,574–612）と対応AT-FR-16（同旧test design:102–104）/AT-FR-25（同:121–126）からfailure履歴保持、再現候補、後続regression candidateの関係を再導出する。production incident限定、旧severity/time/coverage閾値、旧runner/CI/G7 gate（旧FR-16/25）は固定親に合わないため置換する。旧NFR taxonomy（`LEGACY-ASSET-DB669724249A14A665F0`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–24`, SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）は値・測定・判定を組で記す形のみ再導出する。旧business-detail 21–37（`LEGACY-ASSET-A6E2C7F0565E5F804F06`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`, SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）は対象・owner・oracleの根拠にならず、business outcome/KPIを移さない。旧source本文を読んだbounded pinsは対の時点監査記録へ収録する。

**責務・入力**：HARNESS-L2-031の採択所属はHELIX-HARNESSの共通部品であり、許可されたfailure input（開発・refactor・incidentを含みproductionに限定しない）の対象revision、bounded log/input/operation sequence、入力元identity、取得時刻またはrevision結合情報、redaction結果、取得・利用permissionとsanitization、外部side effect抑止、環境/dependency版やseed（得られる場合）、requirement/API/state contractと独立oracleを受ける。010/011の031 pack/call契約、対象revision関係、security/data handling contractは常時必須であり不明なら機微入力を処理せず保留する。incident入力を扱わないrunにincident reproductionを要求しない。入力元/security/data ownerは既存境界を保持し、oracle意味は該当requirement/API ownerに残す。期待挙動未決は003/004の意味ownerへ、権限/data-use不足はsecurity/data ownerへ戻す。同じpackの複数サービスによる二重所有、または共有packの利用を理由に未選択サービスやOS内部構成を必須化する解釈は不合格とする。未宣言のサービス／pack組合せは受入を推定せずunknownとして該当packまたはservice ownerへ戻し、所属ラベルだけで互換性・内容oracleを代替しない。

**出力・境界**：original failure identity/digest、sanitized input、reduction step列、再現recipe、oracleで観測したsymptom、不足証拠/status、regression candidateとrevision traceを返す。reduction runを選択したときだけ032のselected consumer/OS-020または利用者CIへ隔離run requestを渡し、各step結果のあと、同じoracle/scope/revision/environmentのreceiptが一致した場合だけ次stepをsame-failure候補として確認する。未選択runは未実施のまま候補生成できる。固定L11の例ではPATCHのapproved-state writeが期待409/no-changeに対し200/persisted noteとなる初期症状を保全し、metadata付きbodyから`{"note":"corrected"}`へ縮小、empty bodyで422/no-changeと症状が変わればcandidateをnote-only bodyへ戻す。oracleは独立した既存requirement/API/022から得る。candidate作成に将来fix後のpassは不要で、そのpassを得た場合も別revisionの後段証拠である。

**受入条件**

- **`AC-HARNESS-L3-031-01` permission・sanitizationとoriginal保持（FR-HARNESS-L3-031）**：010/011 pack-call契約、対象revision関係、security/data handling契約、input source identity、取得時刻またはrevision結合情報、redaction結果が揃う許可済みsanitized inputの正常fixtureからcandidateを出し、original failureを保持する。各必須項目のmissing/unknown/conflict/staleを適用可能な範囲で独立に変異し、permission欠落、sanitized inputに残るprotected field、明示bounded inputからの逸脱、副作用を伴う再送もそれぞれ独立に拒否し、機微入力を保留してreasonを返す。期待挙動未決は003/004の意味owner、権限/data-use不足はsecurity/data ownerへ戻す。同じpackの複数サービスによる二重所有、共有packの利用を理由に未選択サービスまたはOS内部構成を必須化する変異は不合格とする。未見のサービス／pack組合せでは、主owner候補、利用先、選択操作の依存閉包を別々に照合する。未宣言の組合せは受入を推定せずunknownとして該当packまたはservice ownerへ戻し、所属ラベルだけで互換性・内容oracleの検証を代替しない。
- **`AC-HARNESS-L3-031-02` step別receiptと同一failure判定**：PATCH例のinitial failing receipt、note-only reduction、empty-body 422 receipt、症状変化時のnote-only復帰を順に照合する。各stepのreceiptは同一oracle/scope/revision/environment/owner actor/endpointへ結ぶ。receiptなし、別scope/oracle/revision/owner actor/endpoint、200というstatusだけ同じだがresponse/body mutationが元症状と異なる入力、または症状変化後のsame-failure断定はそれぞれ拒否し、original failureを削除しない。
- **`AC-HARNESS-L3-031-03` regression candidateとfuture pass分離**：candidate proposalだけがある正常fixtureでfuture fix/pass receiptなしでも生成可能であることを確認する。修正前failureの実行receiptがないのに回帰成立とする変異、修正後passの実行receiptがないのに回帰成立とする変異、coverage数値だけで修正成功を主張する変異、future passを初期生成inputに必須とする変異、再実行成功で初期failureを消す変異、test skipまたはoracle弱化を個別に拒否する。coverage数値は矛盾する結果を相殺しない。candidate生成はregression successの証明ではない。
- **`AC-HARNESS-L3-031-04` 未見の許可failure**：宣言scopeと独立oracle内の未使用failure形式を未見正常fixtureとし、source/permission/sanitizationを再確認する。未知log形式、環境、inputまたはoracle不足はunreproduced/insufficient evidenceとし、根本原因を推定しない。
- **`AC-HARNESS-L3-031-05` pack/oracle更新とreceipt再取得**：010/011 pack/call/dependency version、022 oracle、または当該candidateが依存する014 designを一つずつ更新し、影響candidateを新revisionにtraceしrebind・再検証する。選択されたreduction operationは新pack/source/oracle revisionで各step receiptを再取得する。旧receipt/passを再利用せず、future fix passをcandidate生成の前提にも追加しない。

### `FR-HARNESS-L3-032` — 選択artifactからconsumerへのpacket handoff（親: `HARNESS-L2-032`）

**保持・再導出**：旧FR-03 trace、旧FR-17（旧functional-requirements.md:478–501）とAT-FR-17（同旧test design:105–107）、旧L8 fixture/mock境界（`LEGACY-ASSET-73B5C6C7D281E28EC541`, `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-integration-test-design.md:122–136`, SHA-256 `c8b287ee4e103255081f00439b7fb2f3dfd259e0fb35a2760b48ad583524fe15`）からidentity-bound traceとmock境界を限定再導出する。旧four-artifact pairing、G3、GHA/branch-protection/G7実行、旧adapter/CI contractは置換する。CONNECTはregistration/version/communication/retry/traceを担い、032の業務packet意味やrun/pass結果を担わない。旧source処置とbounded source pinは対の監査記録へ収録する。

**責務・入力**：HARNESS-L2-032の採択所属はHELIX-HARNESS-COREであり、OS-020または利用者CIの実行・隔離・結果回収責務を所有しない。CONNECTはregistration/version/communication/retry/traceを担うが、032のpacket業務意味やrun/pass結果を所有しない。明示選択されたcase/reproduction artifactとsource identity、oracle/contract版、target HEAD/revision/scope、必要runner capability/permission、選択consumer schema/version/互換範囲を受ける。G0は032のstage prerequisiteを定めない。初回packet handoffにconsumer receipt/resultを要求しない。

**出力・境界**：明示consumer schemaに適合したrun-input packet、artifact/oracle mapping、target/source binding、未解決compatibility/permissionとreceipt reference slotを返す。選択consumerの責任ownerへschema/互換不一致を理由付きで戻す。宣言range外revision、undeclared schema、unknown compatibilityは接続可能と推測せずunknown/not connectedを返す。handoffから実行、pass、ticket、承認、業務受入を推論しない。未選択consumerの存在・互換性・成功を未観測のまま保つ。

**受入条件**

- **`AC-HARNESS-L3-032-01` selected consumer packet**：normal fixtureでcase/source identity、oracle/contract版、HEAD/scope、選択schema/version/compatibility、runner permissionを明示し、schema適合packetとreceipt-reference slotを生成する。初回handoff前にresult receiptが不要であることも照合する。
- **`AC-HARNESS-L3-032-02` field別binding negative**：artifact identity、source identity、oracle、target HEAD、scope、consumer schema/version、permission、必要なdouble条件のmissing・unknown・stale・不一致を対象fieldごとに単独変異し、valid packetとして接続せず該当理由と責任ownerへの戻し先を返す。実provider呼出しを誘発する変異も拒否する。artifactが要求する場合に限りisolated execution/network-disabled/seed/timeoutのrunner capability各々のmissing/unknown/stale/mismatchも個別negativeに含め、未選択・不要条件を要求しない。
- **`AC-HARNESS-L3-032-03` 選択・未見互換境界**：明示選択済みschema compatibility range内の未使用consumer revisionを未見正常fixtureとしてpacket生成する。未選択consumerは未観測に保ち、その評価やreceiptを選択runへ要求しない。明示接続要求の未宣言range、unknown compatibility、range外revisionは個別にunknown/not connectedとし、presence/compatibility/successを推測しない。
- **`AC-HARNESS-L3-032-04` version/update時のrebind**：010/011 pack/call compatibility、または当該artifactへ適用される014 design/022 oracleを各々更新し、影響packet/candidateの新revision trace、regeneration/revalidationを照合する。選択されたreduction operationのreceiptが影響を受ける場合は新revision・scope・oracle・consumer contractで取り直す。旧pass/receiptは流用せず、receiptが初回packet生成の前提だとも扱わない。
- **`AC-HARNESS-L3-032-05` handoffとexecutionの分離**：正常なpacket delivery後にまだ実行receiptがない状態を正しく表し、deliveryをrun/pass/ticket/approval/acceptanceに変換する各変異、後続receiptなしのartifact state昇格変異、resume時に選択artifact/receipt stateを失う変異を個別に拒否する。実行・隔離・結果回収・再開は選択OS-020または利用者CIの責務に残し、HARNESSが実行主体にならない。同じpackを複数サービスが所有する変異は不合格とする。未見のサービス／pack組合せでは、主owner候補、利用先、選択操作の依存閉包を別々に照合する。未宣言の組合せから受入を推定せずunknownとして該当packまたはservice ownerへ戻し、所属ラベルだけで互換性・内容oracleの検証を代替しない。共有packを利用するという理由だけで未選択サービスまたはOS内部構成を必須化する変異も拒否する。

固定L2-033のfailure/reduction/run/composite traceは独立親である。033全周を030/031/032の受入にしない。independent reviewは草稿作成の工程であり、いずれの親の製品要件・生成結果でもない。

## Stage 4 suffix — HARNESS-L2-026/027/028/029（1.0対象）

このsuffixはmainの承認済みStage本文へ追記する、POが1.0対象として登録した4親のL3候補である。候補登録はL3承認、実装、releaseを許可しない。PO判断記録（main 633bf12、decision 19/66）が採択した所属は027/028が共通component、029がCOREであり、これらの意味・担当・版を変更しない。登録メタデータは `MPR-RC-HARNESS-L2-026-003`（`docs/governance/audits/requirement-registration/r2289-02-candidate-locator-correction-2026-10-03.json:1914–1921`）へ更新され、candidate semantic digest `d797f5d29526059783ea6e469f762b6d51373dbece7223f2941894130c73b880` は旧 `-002` と同一である。PO所属判断のdecision行19/66とPO登録表の対象candidate行55–58は異なる記録であり混同しない。027/028/029のcurrent登録-004（register:922–924）は採択-003と同semantic digestのmetadata後継であり、この更新から採択や承認を生成しない。Stage 4への配属は `docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.md:58–61`（source revision `59336627f11475456038db80ce6232ee39bbfa8f`）の順序記録に従うが、順序記録は採択根拠ではない。POの所属判断はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7` の `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:19,66` から読む。登録IDは別の管理metadataで確認する。各FRは対象product・parent revision・requirement revision・selected scopeを束縛し、unknownを成功や不存在へ読み替えない。

### 旧HELIX項目別起点

| 旧項目とsource | 扱い | 現行との差と理由 |
|---|---|---|
| stable identity、requirement/design relation、候補比較: `LEGACY-ASSET-F1F753F31DB8D874EF21` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:29–102` | identity・relationの意味を再利用し、026の固定親から再導出 | 旧REFACTORING workflow・置換lifecycle SYN-R-05・node/edge lifecycle fieldは現行scopeではないため移さない。 |
| pair identity/negative: `LEGACY-ASSET-BEAB5EE27CD04F5E866F` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/system-synthesis-acceptance.md:19–48` | 個別identityとnegative oracleの形を再利用 | 旧gate/runtime結果はauthorityにしない。 |
| template obligation: `LEGACY-ASSET-4F5A1F0739EC1111D91D` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:1–100` | trace/template obligationの起点として再導出 | 旧JSON schema、runtime、lifecycleは採用しない。 |
| UI/action/state/data/permission relationと対: `LEGACY-ASSET-335176749F6322C3CD8D` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:41–51`; `LEGACY-ASSET-879D95C07B789C9502CF` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:18–30` | semantic relation・UI適用時と非UIの分離・orphan negativeを再導出 | 固定026が求めるCORE/BRAIN connectorと通常のL3/L10へ置換し、旧UI専用gateを移さない。 |
| source-bound extraction、unknown/gap/return: `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:406–426`; paired AT-FR-14: `LEGACY-ASSET-1B92155F959D7905DD1E` `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:96–98` | 027–029のstatic observation・source-bound positive・missing型・gap-onlyの試験形状へ再導出 | R0–R4、`helix reverse` CLI、`.helix` artifact schemaは置換。019の入力/結果境界は保つが019完了receiptやsaved designを027の単独入力にしない。 |
| change-impact delta、source/digest結合、unknown authority/non-write: `LEGACY-ASSET-EB3700B0088F311C2295` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:50–78` | delta、affected exact set、unknown時の非書込を固定L2:601の範囲へ再導出 | 旧候補を承認根拠・現行schemaとは扱わず、L2-028/029で選択された範囲だけを残す。AAFD-R-07の重複抑止は選択範囲外として移さない。 |
| HIL-FR-04/HAT-HIL-04/HST-HIL-002/018（各assetとspanは時点監査pin） | hollow/skip/re-entryの隣接failure形だけを参照 | FR-14とは別identity。旧phase、gate、runtimeを本親へ移さない。 |

### `FR-HARNESS-L3-026` 要求から相互参照する具体設計を構成する（親: `HARNESS-L2-026`）

対象は指定product・L3/requirement revision・design scopeのunitである。026は交換可能な設計能力packとして交換・互換照合の対象となり、014は利用側service、026 packは交換対象である。026の常時契約はHARNESS-L2-009設計義務、承認済L3要件と対象revision、Design Template、COREおよびBRAIN connector、010/011 pack/call、022 paired verificationである。出力はimpactと参照契約版を保持する。CORE契約は026の依存契約であり、026の所属をCOREと定義しない。L4/L5/L6の設計と対のL9/L8/L7検証設計へ、requirement→state/flow→APIまたはcommand→actor permission→domain data invariant→適用oracleのidentity付き双方向relationを渡す。個別Patternは実際に選択したときだけ照合し、未選択は未観測である。UI対象ではUI agreement/screen evidenceを追加し、非UI対象へUI条件を強制しない。014の完了receiptなしで宣言済入力から構成できる。014との交換対象は026 packであり、入出力contract・scope・compatibilityとpairを再照合し、旧receiptを流用しない。

- `AC-HARNESS-L3-026-01` 固定要求「承認後は編集不可」を同一revisionでstate・API/command・actor・data invariant・oracleへ結ぶnormalと、同scopeの未見actor/競合更新normalを満たす。
- `AC-HARNESS-L3-026-02` 承認済L3要件/対象revision、HARNESS-L2-009設計義務、Template/CORE/BRAIN connector/010/011 pack契約、022 paired outputの常時依存を個別に欠落・unknown・stale・mismatchとして拒否し、要件意味不足はHARNESS-L2-008、L3 authority不足はそのauthority owner、TemplateはHARNESS-L2-009/template owner、CORE契約はCORE owner、BRAIN connector契約はCOREのBRAIN connector契約owner、PatternはBRAIN、設計契約/traceはHARNESS、pair/oracleはHARNESS-L2-022 ownerへ戻す。014 completion receiptは要求しない。
- `AC-HARNESS-L3-026-03` 選択PatternとUI適用条件を区別する。未選択Patternは未観測のまま正常成立し、選択Patternの版/互換/入力不備、対象scope/revisionに結び付くHELIXBRAIN-L2-030 connection receipt欠落と、UI対象でのagreement/screen欠落は個別保留する。選択Patternを使う場合だけ既存connection receiptを受入入力とし、未選択には要求しない。
- `AC-HARNESS-L3-026-04` UIが隠してもAPI更新を許す、actor permissionが残る、競合更新でinvariantを破る、または別revisionへtraceする各変異を不合格にし、要求意味はHARNESS-L2-008/authority owner、Template/design obligationはHARNESS-L2-009 owner、PatternはBRAIN owner、設計契約/traceはHARNESS、pair/oracleはHARNESS-L2-022 ownerへ返す。
- `AC-HARNESS-L3-026-05` 選択Pattern間のconstraint conflictでは競合条件・根拠・影響scopeを示し、固定invariantを満たす代替案を比較する。満たす案がないときは要求不足/矛盾としてL2-008へ返し、意味を変える案で埋めない。
- `AC-HARNESS-L3-026-06` 026を014とは別identityの交換可能な能力packとして識別し、014は026 packとの契約・互換性を照合する。026の所属はCOREと推測せず、交換pack契約はHARNESS-L2-010/011 ownerへ戻す。単体、接続、構成体の結果を別々に記録し、unknown/N/A、impact、unit/connection/compositeを一つに畳まない。BRAINは知識入力、HARNESS/COREは設計結果の責務を保つ。026を任意化する、026を第二の③製品として独立化する、014完了を026開始条件にする、025完了を要求する、非互換またはstaleな026で014を成功扱いする変異は不合格で、pack契約はHARNESS-L2-010/011 ownerへ戻す。交換後の旧receipt流用と出力scope不一致を各単独で拒否する。互換な出力scope変更は014影響scopeと025横断oracleを再評価し同じ固定oracleの再検証で成立し、未対応・非互換は保留する。
- `AC-HARNESS-L3-026-07` 026 design compositionの常時必要な010 pack contract、011 call/input contract、022 paired-verification contractを個別に照合する。いずれか一つの欠落・stale・scope mismatchでも設計結果を確定せず、それぞれ既存pack、call、verification ownerへ戻す。

### `FR-HARNESS-L3-027` 外部実物からsource-bound構造・挙動候補を抽出する（親: `HARNESS-L2-027`）

利用者が明示選択した静的code、DB定義/schema、API定義またはconfigと、そのsource identity/revision/digest/read scope/permissionから、根拠span付きの構造・branch・guard・limit・persist順候補、未対応/未知/矛盾を返す。選択source typeに対応する019の入力境界と結果handoff identityを保つが、019完了receiptやsaved design revisionを027単独の開始条件にしない。target/product/source-type/revision/digest/scope、010/011 contract、read authorization/data-useを選択操作に束縛し、適用されるfieldが欠ける場合は結果を保留する。これはsource observationでありruntime実測、要求正しさ、承認設計を主張しない。未選択sourceは未観測、unsupportedはunsupported、unknownはunknownを保つ。黙示parser fallbackや未選択sourceへの切替はしない。

- `AC-HARNESS-L3-027-01` 明示sourceを固定revision/digest/scopeで読み、コード構造と条件分岐・副作用順候補をspanへ結び、019 completion receiptやsaved designなしの正常抽出を示す。
- `AC-HARNESS-L3-027-02` 019 input target/product/source-type/revision/scopeとoutput result identity、source identity/revision/digest/scope/read permission/data-use、010 pack、011 call/input contract、選択type固有parser/version supportをそれぞれ独立変異し、missing/unknown/stale/mismatch/unsupportedを区別して該当source/契約ownerへ戻す。
- `AC-HARNESS-L3-027-03` 一度にguard、limit、persist順またはsource spanの一つだけを変えた正常対照・negativeを比較する。観測候補は変化したsourceどおりとなり、古い期待値で合格せず、runtime/customer data/writeのclaimをしない。
- `AC-HARNESS-L3-027-04` 未見schema field/API versionをsourceに加え、対応するspan付き観測とunknown/unsupportedを分離する。未選択typeの存在・不在を推論しない。source更新後は古いreceiptをstaleとし再抽出する。任意に添付された不一致の保存designを観測根拠へ混ぜず、027単独観測を保存designのauthorityで変更しない。
- `AC-HARNESS-L3-027-05` source digest/revision更新後のreceiptと旧observationを区別し、古い結果を現行として扱わない。HARNESS-L2-019への接続は同じ対象/source/scopeを保ち、019の完了receiptを027開始条件にしない。
- `AC-HARNESS-L3-027-06` 選択source typeごとに抽出可能な情報と適用限界を示す。既存code内のcustom processingはsource-boundな観測候補として識別し、位置・根拠を後続packへ渡す。これをruntime behaviorの観測事実と主張しない。静的範囲を越すbehavior検証は別scope・権限・oracleが揃うまで保留し、未対応construct、target version contract欠落、未許可data-useは該当source/contract ownerへ戻す。要求・既存設計を書き換えない。
- `AC-HARNESS-L3-027-07` 027の抽出能力packは採択済み共通component所属を一つの主ownerとして保ち、複数利用サービスを二重ownerにしない。
- `AC-HARNESS-L3-027-08` 未宣言のサービス組合せはunknownのまま当該pack/サービスownerへ戻し、各observation passにtarget revision・product・selected source・affected scopeを結び欠落・不一致はsource/input ownerへ戻す。結果は当該source/revision/scopeだけを示し、他製品への万能性やVersion 1全体の完成をclaimせず、過剰claimは027抽出packの単一主ownerへ戻す。

### `FR-HARNESS-L3-028` source observationを保存設計へ接続する（親: `HARNESS-L2-028`）

同じproduct/scopeのvalid 027 receiptを、identity・revision・authority状態が特定されたcurrent saved design/requirement revisionおよびL2-003/004のimpact/backflow境界へ比較し、既知traceからadd/change/delete候補、affected exact identity set、該当design/pair/test scope、推奨backflowを返す。design、source observation、そこから導出した解釈を別々に示し、外部custom logicを根拠なく削除しない。027/028は共通componentであり⑤専用ではない。常時必要な019 input/result boundary、010/011 contract、source identity/revision/digest/scope、source read authorization/data-useは比較に束縛する。CONNECTの共通通信と028の業務上の比較は別責務として保持する。operation固有API比較、DB migration影響、個別behavior/state比較はそのoperationが選択され、対応するdesign/oracle/data-ownership contractがある場合のみ行う。比較baselineを選ぶ場合はprior source/design revisionとdigestを特定し、未選択baselineは未観測とする。候補revisionは比較できるがapprovalではない。unknown/stale/conflicting authorityでは比較結果を確定せず、approval状態を生成しない。

- `AC-HARNESS-L3-028-01` 同一scope/source revisionのobservationとidentified saved design/requirementを比較し、external custom logicを保持したままaffected exact set、該当design/pair/test scope、recommended backflowを返すnormal。design / observed implementation / derived interpretationは区別する。027/028の共通component所属を保ち、028を⑤専用として他の変更先を塞ぐ変異を拒否する。
- `AC-HARNESS-L3-028-02` source receipt/source revision/design revision/requirement revision/product/scope/authority/known relationを各々単独変異し、stale/mismatch/unknownを保留し正しいsource/design/requirement ownerへ戻す。
- `AC-HARNESS-L3-028-03` 対象revisionに結び付く既存approval receiptがあるnormalと、receipt欠落または別revision receiptのままapprovedを主張する各negativeを分ける。approved状態は完全一致receiptがある既存状態としてのみ認識し、比較やL3候補から承認を生成しない。不一致・欠落時はapprovedを与えず、意味authorityの不足はHARNESS-L2-008/既存上流authority ownerへ戻す。
- `AC-HARNESS-L3-028-04` 未見helper/API edgeを加え、known traced edgeのみaffected、未表現edgeはunknownとする。類似名/pathだけでUnaffectedにしない。通常のbounded diffを全体reverseへ拡張しない。trace欠落はunknownとして全体Reverse/reobservation候補へ返し、意味変更をright-side patchへ隠す変異は該当層へのBackflowへ返す。
- `AC-HARNESS-L3-028-05` source observation更新後は新revisionへcompareを再束縛し、old comparison resultをstaleとして残す。L2-003/004 impact/backflowの既存契約を保持する。
- `AC-HARNESS-L3-028-06` 部分抽出、相反するdesign、custom-logic owner unknown、current saved-design revision不一致を個別に比較入力へ与え、unknown/conflict/staleを保ち既存meaning/design ownerへ戻す。prior baselineが選択された場合、その過去revisionであること自体は正常で、指定されたprior source/design revisionとdigestを照合する。baselineを選択しない場合は未観測として通常比較できる。API/migration/behavior-specific comparisonは選択operationの契約とoracleがある場合だけ成立する。
- `AC-HARNESS-L3-028-07` 028の共通component comparisonで010 pack contractだけ、次に011 call/input contractだけをmissingまたはstaleとする独立fixtureを設け、各々を該当pack/call ownerへ返す。両契約の欠落を一つの複合変異へまとめない。019 input/result boundary、source read authorization、data-useも各々単独変異し、その既存ownerへ戻す。
- `AC-HARNESS-L3-028-08` 028 comparisonは採択済み共通componentとして単一pack ownerを保ちservice利用先を二重ownerにしない。CONNECTの共通通信を028業務比較へ移す変異と、028比較業務をCONNECTへ移す逆方向の変異を個別に拒否し、責務移管の誤りは028 comparison packの単一主ownerへ戻す。未宣言service組合せはunknownのまま既存pack/service ownerへ戻す。

### `FR-HARNESS-L3-029` 差分に基づく往復改修proposalを束ねる（親: `HARNESS-L2-029`）

027/028の同じproduct/scope/source revisionに基づき、(1)対象を限定したdesign delta、(2)API repair proposal（選択時のみ）、(3)schema/data migration proposal（必要と判断して選択したときのみ）、(4)保持するcustom logicと理由、(5)backflow・verification・unknownを別要素として相互traceする。029はPOが採択したCORE所有のcompositeで⑤専用ではない。019 input/result boundaryと選択sourceのread authorization/data-useを保持し、CONNECTの共通通信を029の業務上のproposal生成と分ける。L11:387の `/orders/approve` と `normalizeSupplierCode` は通常fixtureの例であり、これ以外のAPIも選択operationとして明示された場合に限って扱う。API repair案は明示選択されたAPIだけを対象とする。current saved design/requirement revisionとproposal identity/scopeは識別するがapprovalを生成しない。migration proposalではsource/target schema、scope、precondition、effect、rollback可能性と各oracleを束ね、不明点はunknownのままにする。API/data未選択時にそれらのcontract/ownerを強制しない。proposalは非実行の候補であり、patch、migration、commit、releaseを実行しない。

- `AC-HARNESS-L3-029-01` CORE所有の029 compositeを保ち、各サービスは成果authorityを維持し、029を⑤専用として他の変更先を塞ぐ変異を拒否する。同じrevision/sourceから五要素を区別したbundleを作るnormal。APIまたはmigrationを選ばない場合もno-change理由を出し、custom logicを保持する。
- `AC-HARNESS-L3-029-02` proposal identityとscopeのbinding、対象requirement revisionとauthority state、027 receipt、028 receipt、source/destination revision、product/scope、saved design identity/authority、affected set、custom ownershipを各々個別にmissing/unknown/stale/mismatch化し、影響部分のみ保留して既存の該当ownerへ返す。approval receipt欠落または別revision receiptのままapprovedと主張する各変異も拒否し、candidate比較を承認へ昇格しない。
- `AC-HARNESS-L3-029-03` 選択API修復のAPI contract/oracleと、選択migrationのschema/data owner/source-target compatibility/loss/rollback oracleをそれぞれ単独で欠落させる。schema version assumptionを隠した場合もunknownとしてmigration部分を保留する。非選択operationの依存は要求しない。
- `AC-HARNESS-L3-029-04` custom logic削除、無関係API混入、migration data-loss隠し、cross-revision trace、candidateからの自動実行、candidateのapproved stateへの自動昇格を各々独立negativeとする。proposalや比較だけでsaved-design authority stateを変更しない。未見の第二custom processor/過去migrationはunknownとして依存proposalを保留する。
- `AC-HARNESS-L3-029-05` source edit後に027再抽出→028再比較→bundle再生成を行うnormalを設け、旧revision receipt流用を拒否する。戻し先は意味L2-008/upstream、設計L2-014/design owner、oracleL2-022、API/dataの既存ownerとし、新ownerを作らない。
- `AC-HARNESS-L3-029-06` selected operationごとにAPI validation oracle、target implementation revision、source/target schema contract、data-use permission、loss oracleを独立に照合する。oracle不足はHARNESS-L2-022 ownerへ、API behavior/design contract不明はHARNESS-L2-014/Designへ、target implementation revision staleはsource ownerへ027再抽出を戻し、schema/data-use契約不足は選択migrationの既存schema/data ownerへ、loss oracle不足はHARNESS-L2-022 ownerへ、data-loss riskまたはowner不明は選択sourceのauthority/source ownerへ該当field単位で返す。CORE ownerを新設せず、欠落・unknown・stale・mismatchを該当fieldに限定して保留する。これらの依存は未選択operationへ広げない。
- `AC-HARNESS-L3-029-07` 五要素はunit/connection/compositeの別結果を保持し、L11:387の`/orders/approve`と`normalizeSupplierCode`は通常fixtureで、API repairは明示選択されたAPIだけを対象にする。data移行完了と読み替えず、claimは選択product/revision/scopeのみに限定し、unitまたはconnection successからcomposite successを推論しない。selected-input scopeだけを観測し、未選択repository/branch/providerは未観測のまま保つ。unsupported DB/API/config/versionはunknown/unsupportedとして既存contract ownerへ戻し、silent fallbackしない。CASEにはL11:387の `/orders/approve` と `normalizeSupplierCode` のnormal、migration未選択時の「proposalなし＋理由」を含める。
- `AC-HARNESS-L3-029-08` 029共通proposalで010、011、003、004、022を各々単独にmissing/staleにするfixtureを対応させる。010/011はpack/call contract owner、003/004はrequirement impact/backflowの既存owner、022はHARNESS verification ownerへそれぞれ戻す。未選択API/migration依存を常時条件へしない。019 input/result boundary、source read authorization、data-useの各欠落またはunknownも個別に保留し、既存ownerへ戻す。
- `AC-HARNESS-L3-029-09` 未宣言のservice組合せをknown/適用可能と補完せずunknownとして維持し、COREの029 ownerと影響serviceの既存ownerへ戻す。
- `AC-HARNESS-L3-029-10` 保存design authorityをproposalから変更しない。変更を含む提案は拒否し、HARNESS-L2-008/対応する上流authority ownerへ戻す。

## Stage 2b 残件追補 — HARNESS-L2-017/018/019/020/024

status: draft_for_l3_review
approval: not_approved
scope: 本追補5親のみ / G0 version_class 1.0

本追補は未承認の5親のL3／L10起草である。先行する承認済み本文は変更しない。旧部分草稿revision `6b40b4c607396ca6bccd4d1286a5a1ff112cf491`の対応節を起点に、確定親の未被覆条件を再導出した。掲載順から実装順序や下流許可を生成しない。

### 固定親と採択記録

| 親 | PO判断記録 | 固定親revision／本文 | 行・raw span SHA-256 | semantic digest |
|---|---|---|---|---|
| `HARNESS-L2-017` (`MPR-RC-HARNESS-L2-017-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L46)、同上 | 同上 | 403–410、`a0f17d12b26f7dd7c5f4f52767ae06fae8b32c4f31c156d04d3538b77edba2fb` | `623b91b59a5cf09055e8604c3c84aebfe9428b86f950a0bcb2a9c1605d710d17` |
| `HARNESS-L2-018` (`MPR-RC-HARNESS-L2-018-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L47)、同上 | 同上 | 411–418、`97d4f669fb90eea59a8909a2c5b482a8b438018ab219dd6279e526ae49a89b17` | `3497158cd4b39bb9059c20f9cfe2c0a647181e3dd566ff0d247ad5f4d5fc4671` |
| `HARNESS-L2-019` (`MPR-RC-HARNESS-L2-019-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L48)、同上 | 同上 | 419–426、`0f50a16bcb31791e5d27f784a0d97f8142f41559d957b12713e19f1ab80d7609` | `7bd3d180259af1febe50e013eea5aa5609d5af3c28ce89191c4670f3e8c88000` |
| `HARNESS-L2-020` (`MPR-RC-HARNESS-L2-020-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L49)、同上 | 同上 | 427–437、`28980b6713714debd1aab0c83c83f025ca415209427e9f7a657e624af305b4b3` | `d68ecbe2512b45f6f4c09cf395bd05b164a8243997f954e5459d42b29c69de7d` |
| `HARNESS-L2-024` (`MPR-RC-HARNESS-L2-024-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L53) | 同上 | 499–525、`ec4ece6e411152941c16cd8dc25a1c43613dff5e6b5c3051ef675c66c8b9b2cc` | `b8e45ca6df9bd498f9a385d33b3c3dfb96e367d31fb91c434a23bf848e98b2a8` |

固定親L2全文SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、固定L11全文SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。上表の「同上」は全行で固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、`../L2-requirements/product-requirements.md`、2026-09-28判断記録を指す。後続metadataだけで採択revisionを変えない。

#### `FR-HARNESS-L3-017` — 単体製品のリリース契約（親: `HARNESS-L2-017`）

**入力**：HARNESS-L2-022に従いVerified/Acceptedとなった成果物、開発開始時から持つRelease Port条件、外部成果なら同じ受入条件のevidence。

**出力**：製品artifact identity、対象環境、依存・security条件、rollback、配備条件を含むrelease packetとRelease-eligible判定材料。

**不変条件**：必須Release Port条件を満たし、未回収検査がない対象だけをeligibleとする。同じ入力から再現可能な成果物と直前適格版へのrollbackを扱い、DeployedとObservedを区別する。HARNESS-L2-003のRelease Port・成果物状態、HARNESS-L2-005の省いた検査の回収、FRS-BR-005と「外部提供の条件」を束ねる。これは利用者製品のrelease機構で、HELIX自身の段階release runtimeではない。配備実行はHELIX管理環境ならOS、利用者環境なら利用者の配備手段が担う。

- **`AC-HARNESS-L3-017-01`**：Verified/Acceptedと開始時点のRelease Port条件が同じartifact revision/scopeへ結び付くpositive caseのみeligible候補となる。外部成果でも同じ証拠を提示できれば評価する。
- **`AC-HARNESS-L3-017-02`**：未回収検査、必須条件欠落、別revisionのevidence、成果物identity不一致、④のProvisional状態、HARNESS-L2-022の契約条件を満たさない外部成果はeligibleにせず、不足条件を特定する。不足時は⑥では受け取らず、満たした段階にとどめてL2-022の検証・受入へ回す。外部成果なら証拠の提供元へ不足を示す。ProvisionalをVerified/Acceptedへ読み替えない。対象は利用者製品であり、HELIX自身の実行環境（HELIX-INFRASTRUCTURE）を対象製品と混同しない。
- **`AC-HARNESS-L3-017-03`**：失敗時のrollback先と同一inputからのartifact再現性を比較し、配備済み状態から観測済み状態を推測しない。release packetは実際の配備を実行しない。

#### `FR-HARNESS-L3-018` — 単体製品の運用・保守要求接続（親: `HARNESS-L2-018`）

**入力**：配備済み製品、製品ownerが承認した運用品質要求（可用性、信頼性、性能、容量、費用、security、privacy、運用、保守、回復、observability）と各要求の適用／N/A／unknown／決定owner。

**出力**：要求revisionに対応したobservability、L12運用評価、観測結果から要求への再要求化/backflow経路。

**不変条件**：designed、implemented、verified、observed、operatedを別状態として扱う。文書・実装・CIの存在だけで運用状態にしない。可用性等の共通数値SLOを新設せず、運用要求の適用判断をHARNESSが所有者に代わって決めない。「運用品質を落とさない工程条件」、HARNESS-L2-003のObserved、Conceptの1.0土台「ログと証拠」「計測」を束ねる。HELIX内のruntime運転はOS、効果評価はLABO、利用製品固有基準は当該製品ownerに残す。

- **`AC-HARNESS-L3-018-01`**：配備済みrevisionとowner承認済み運用要求／適用性が対応付く場合だけ観測設計を評価し、欠落・unknownをsuccessへ変換しない。
- **`AC-HARNESS-L3-018-02`**：設計／実装／検証証拠だけを観測・運用済みとする入力を拒否し、観測値は対象revision、時点、要求ownerと結ぶ。5状態はそれぞれ固有の根拠を保持し、一つの証拠から残る状態を推測しない。
- **`AC-HARNESS-L3-018-03`**：要求を満たさない観測や要求自体の不足を該当ownerへの再要求化候補として返す。根拠のないSLO・保持期間・費用閾値を補わず、正常なowner定義の個別基準を一律閾値不在で拒否しない。品質の値、対象環境、RTO/RPO、保持期間、予算を全製品へ共通値として固定・上書きしない。L12観測と再要求化を同じ要求revisionで結び、①〜⑥を使わない正常な配備済み製品にもこの契約を適用する。OSの運転やLABOの効果評価の実行を本単体契約の成立に強制しない。

#### `FR-HARNESS-L3-019` — 既存成果からの逆方向要求形成（親: `HARNESS-L2-019`）

**入力**：任意のリリース単位から持ち込まれる既存要求、codeまたはPoCとその利用可能なsource/owner/revision情報。

**出力**：HELIX形式の要求・設計・検証pair候補とtrace、およびunknown・変換不能・矛盾する箇所とその理由。

**不変条件**：どのリリース単位からも既存内容を要求形成へ戻せる。単独成立依存はCOREであり、入った先のリリース単位や先行単位の実行を必須にしない。由来不明、旧資産、設計trace欠落からの復旧には全体のReverseを使い、既存資産という属性だけで拒否しない。正規pairへの変換は既存物の権威を推測せず、未確定内容をunknownとして残す。Conceptの「入口：フルリバース」とHARNESS-L2-003/004のScoped Reverse・全体のReverseを束ねる。変換結果は草稿であり、要求・設計・releaseの承認済状態を生成しない。

- **`AC-HARNESS-L3-019-01`**：各リリース単位からの入力例について、入力範囲・source・既知の親revisionを保ったpair候補とtraceを作る。入力が部分的でも変換可能部分を返す。COREだけを与えた未見リリース単位の入力でも、対象リリース単位の実行を追加要求しない。
- **`AC-HARNESS-L3-019-02`**：source/revision/owner/意味の欠落・矛盾を個別にunknownまたは変換不能として一覧化し、暗黙に補った成功出力を拒否する。選択変換scopeの対象一層が変換結果・理由付き非影響・変換不能/unknown一覧のすべてから脱落した出力も完了扱いせず、未分類部分と元traceを保持してHARNESS Reverse要求ownerへ返す。由来不明・旧資産・設計trace欠落の入力は全体Reverseで復旧候補を形成し、unknownと原入力traceを保持する。
- **`AC-HARNESS-L3-019-03`**：逆方向候補の完成・pair生成だけで既存要求や下流artifactを承認済み・release可能へ変更しない。

#### `FR-HARNESS-L3-020` — 隣接リリース単位間の接続契約（親: `HARNESS-L2-020`）

**入力**：開発方式の枠で隣り合う二リリース単位の出力／入力契約、契約版、対象artifact/revision、双方のowner、未完検査・未解決事項・unknown・人の判断待ち、および各契約に必要なevidence。

**出力**：互換性を照合したhandoff結果、契約差分、引継いだ未完義務、または該当ownerへ戻す変更候補。

**不変条件**：前stage出力が次stage入力の契約を満たすことを接続単位で確認する。契約版不一致や必須field欠落は暗黙解釈せず保留し、未完義務を次の単位へ引き継いでも完了にしない。前stageを使わない外部成果もHARNESS-L2-019と同じ入力契約で照合する。HARNESS-L2-002/005/008/009が束ねる開発方式の枠、検査回収、接続固有要求・設計義務を保持し、意味差の戻し先はHARNESS-L2-003/004の規則に従う。単体開発④のProvisional出力は⑥へ直結させず、⑥にはHARNESS-L2-022でVerified/Acceptedとなった成果か外部で同じ条件を満たした成果だけを渡す。意味差は意味が変わる最上流の層とそのownerへbackflowする。handoffは状態・authority・上流意味を書き換えず、release executionにもならない。stage番号の隣接だけで関連しない全stageの直列依存を追加しない。

- **`AC-HARNESS-L3-020-01`**：互換する隣接契約・同一artifact/revision・必要evidenceのpositive caseで、全入力fieldの対応とownerを記録してhandoff候補を出す。未完検査等は継続義務として保持され、引継ぎだけでは完了にしない。省いた検査、未解決事項、unknown、人間判断待ちを別identity・owner・状態で追跡し、合流先で各義務の回収証拠を照合する。単体passだけでは接続固有の照合が完了しない。
- **`AC-HARNESS-L3-020-02`**：版不一致、必須入力欠落、異なるartifact/revision、責務外ownerを一つずつ変異させ、各欠落／不一致を特定して保留する。HARNESS-L2-010が定める入力／出力契約の宣言とpackの所属条件を踏まえて、契約側の戻し先を再導出する（この文は要約であり原文引用ではない）。owner不一致は該当する前単位の出力契約ownerまたは次単位の入力契約ownerへ戻し、いずれの契約ownerかを確定できないときはownerを推測せずunknownを残して契約ownerの特定へ戻す。前stage未使用の外部成果でもHARNESS-L2-019と同じ入力契約を満たす正常caseは受け入れる。正規化可能な未知fieldは契約が許す範囲なら未見正常として受け入れる。
- **`AC-HARNESS-L3-020-03`**：④のProvisional成果を⑥へ渡すnegativeと、L2-022 Verified/Acceptedの同一条件を満たす成果を渡すpositiveを比較する。前者は止まり後者だけがrelease-unit受渡し候補になる。外部成果もHARNESS-L2-022と同じ検証・受入条件を満たした場合だけ⑥へ渡し、満たさない外部成果は⑥で受け取らず証拠の提供元へ不足を示す。前段を使わない外部成果も同じ入力契約で照合し、適合する外部成果は候補として扱い、不一致はAC-HARNESS-L3-020-02どおり保留して該当契約ownerへ返す。handoffで前後stageのauthority/stateを変更せず、意味差は意味が変わる最上流の層とそのownerへBackflowし、成功をreleaseや全段階完了に読み替えない。

#### `FR-HARNESS-L3-024` — 要求形成の質問優先と収束根拠（親: `HARNESS-L2-024`）

**入力**：engine／product pack revision、対象ConceptとL1 revision、指示・参照根拠のidentity/revision/scope、現在・prior candidate、既回答・訂正・defer・agreementとactor/owner、利用可能なiteration履歴と差分（固定件数を必須にしない）、矛盾・重複、actor/task、正常・取消・failure・timeout・recovery、P0/P1 surface、implicit requirement matrix、Prototype／非UIの適用性と、該当時にはHARNESS-L2-008の工程で得る合意・根拠、ならびに不確実性・影響・下流変更cost・人間専決区分。

**出力**：version/scope/sourceに結び付く要求candidateと意味差分、質問と既存open questionの状態、優先理由・影響範囲、矛盾・欠落・未確定事項、defer owner/re-entry、適用性と非適用根拠、残る人間判断の原文・選択肢・推奨・影響候補、収束判定と不足理由。候補は訂正・合意・採否待ちであり、approved requirement、L3承認、操作許可に昇格しない。

**不変条件**：同一target revision/scopeの既回答は再質問せず、既存open itemは同じidentity・owner・状態で継続する。再開時は新source/revisionまたはfinding、影響scope、意味差分を示し、影響項目だけをownerへ返す。質問順は影響・不確実性・下流変更cost・人間専決度の入力根拠を可視化し、同順位時はversioned pack inputに結び付くtie-breakを用いる。数値weight・固定質問数・固定iteration数を根拠なく設けない。必要な形成情報の不足と、人間確認・合意待ちを区別し、score、fixture score、質問数、訂正率、iteration数、無変更iteration、timeoutだけで収束や人間判断を成立させない。Prototype／非UI合意が適用対象で未了でもcandidateと未決packetを返せるが、合意状態を作らない。HARNESS-L2-008/013とREQENG-HARNESS-001〜007の既存engine・単独service・提案と人承認の境界を保持する。prototype/PoCの結果はL2-008へBackflowし、単体/connection/compositeのidentity、failure/timeout、trace、owner/re-entryを保持し、形成入力のmissing/unknown/staleはHARNESS要求ownerへ戻す。目的・scope・人が決める値の不明はHARNESS-L1-008または意味を持つPOへ戻し、操作・記録・採否実行はOS側既存consumerに残す。

- **`AC-HARNESS-L3-024-01` 優先順位と再現**：影響・不確実性・下流変更cost・人間専決度の根拠と同順位tie-breakを入力し、同じcandidate・既回答・revisionから質問と理由の順序を再現する。たとえば同一scopeで「data retentionの決定owner」が未確定で「表示ラベル」が未回答なら、前者のauthority/data-use影響を先に示し、既回答のactorを聞き直さない。影響・不確実性・下流変更cost・人間専決度の入力根拠がmissing/unknown/staleならHARNESS要求ownerへ不足を戻す。tie-break契約の未定義・多義はpack契約ownerへ返し、根拠不明の高低順位を補完しない。
- **`AC-HARNESS-L3-024-02` 重複・矛盾・再開**：同一scopeの既回答／open question、新根拠ありの合意再開、新根拠なしの再質問を比較する。回答のtarget L1 revisionまたはsource revisionが現在入力と異なる場合、旧回答をcurrentへ流用せず影響identityだけをownerへ戻し、差分が未確定ならunknownを保つ。既回答は重複せずopen itemを継続し、再開は影響identityだけをownerへ返す。理由なしの回答矛盾を黙って無視すること、自動解消、全面stale化はそれぞれ不合格。
- **`AC-HARNESS-L3-024-03` 形成不足と人間待ちの区別**：actor/task、normal/cancel/failure/timeout/recovery、P0/P1、contradiction/defer owner/re-entry、implicit matrix、利用可能な履歴差分、該当時Prototype／非UI合意を個別に変異する。必須形成情報unknownは不足として示し、整ったdecision packetの人間確認待ちは候補として提示する。score・fixture score・質問数・訂正率・iteration回数・無変更iteration・timeout・Issue/PR/CI/OS登録・engine candidate・相談・沈黙を単独根拠に承認・要件採択・操作許可を生成しない。履歴がない／少ないことのみを不足にしない。

- **`AC-HARNESS-L3-024-04` 領域状態と条件付き合意**：各要求領域を解決済み／明示保留／非適用／必須事項unknownに分ける。明示保留はownerとre-entry、非適用は理由・判断者・対象revision・再評価条件を保持する。actor/task、正常・取消・failure・timeout・recovery、P0/P1、矛盾、implicit matrix、利用可能履歴の差分が不足なら個別の形成資料不足を返す。既回答なしの初回は明示空履歴とし、既存記録の紛失と区別する。prototype／非UIが該当し合意前でもcandidateと未決packetを返して合意待ちを保持し、既存合意記録の紛失は別の資料不足とする。prototype agreementは対象revision/scopeに結び付け、旧revisionの合意を新revisionへ流用しない。
- **`AC-HARNESS-L3-024-05` timeoutと再開**：timeout時は進行を止め、actor、scope、対象revision、最後の確定revisionとevent、open itemのidentity・owner・状態、re-entry条件を保持する。timeoutそのものを成功・回答・合意・収束へ変換せず、条件が揃うまで回答や合意を生成しない。再開時は新eventを追記して影響差分を再評価する。対象source/revision/scope変更は影響項目へ限定し、影響範囲unknownを未影響へ変換しない。
- **`AC-HARNESS-L3-024-06` 補助計測と権限境界**：同じfixtureと未見fixtureにおいて質問量・訂正率・必須条件見逃しを、engine/pack revisionと比較母集団を固定して再測定可能にする。未観測訂正を0とせず、必要質問の省略を改善にせず、計測改善から必須未決・合意・freezeを生成しない。金額・権限・法務等の人間専決値を推定せず原文・選択肢・推奨・影響候補の判断待ちへ返す。OSへ要求意味の重複所有や別engineを作らない。HARNESS-L2-008/013を単独成立依存とし、REQENG-HARNESS-001〜007の抽出・意味差分・質問・影響処理、製品pack分離・決定論、提案と人承認の境界を保持する。別製品packの語彙・policy・質問・品質matrixをそれぞれ単独に混入させても対象製品の版付きpackへ漏らさず、混入をpack契約ownerへ示す。当該pack欠落や版不一致は別製品packで補わず未確定として同ownerへ返す。prototype/PoC結果はL2-008へBackflowし、単体/connection/compositeのidentity、failure/timeout、trace、owner/re-entryを保持する。PoC Backflowではfailure/timeout状態とowner/re-entryの欠落をそれぞれ独立に照合し、結果や宛先・再入条件を補完しない。記録・対象L1 revision・根拠source scope・actor/owner・適用matrixがmissing/unknown/staleならHARNESS要求ownerへ不足を戻す。上流の目的・scope・人が決める値が不明ならHARNESS-L1-008または意味を持つPOへ戻す。操作・記録・採否の実行はOS側既存consumerへ戻し、HARNESSに登録/承認権限を追加しない。

### 項目別旧資産の再導出・置換

| 現行親／FR・AC | 旧sourceと固定digest | 保持・変更・理由 |
|---|---|---|
| `HARNESS-L2-017` / `FR-HARNESS-L3-017`, `AC-017-01..03` | `LEGACY-ASSET-A2F6A697D7FFFD490B57` `docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:82–100,123–131` SHA `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c`, spans `e02b17fc5f52ea6c5b26d37ed65f52520153ac25ff40ebc697a27c210c308f6c` / `008e6a506cdca651baec2484f34d2ac964ed9949f4d5355e9afc190fc53c7f88`; `LEGACY-ASSET-35C7D2CCFBDA7AAD304D` `docs/test-design/helix/release-module-bundle-composition-acceptance.md:22–42` SHA `71600a710a31b47c1db3434d68fd6135366058f1c591df489a57a51732cd423b`, span `dffeae81102d651da3deac3ce8f1f3e05c6184fa1b0f80e6cb2ded558d3a24a8` | 同一inputのartifact再現、release後責務とrollbackの観測形を近接類例から再導出。旧Module/Bundle schema、initial fixed set、semver/channel、DevOS promotion、外部release gateを再利用せず、製品単体のRelease Port/eligible/Deployed対Observedへ置換。 |
| `HARNESS-L2-018` / `FR-HARNESS-L3-018`, `AC-018-01..03` | `LEGACY-ASSET-17C4BF78919578FEBB18` `docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:66–143,173–197` SHA `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`, spans `50d4c5e38f722eb52928f1d46b9c23a1786ce620fd323eadf0da236075954602` / `708296f405a8db744740d061f379b4d6a42eaa72532527c2e6fb5ee9d57675f1`; `LEGACY-ASSET-F46AB11BD14F2C0469F4` `docs/test-design/helix/product-lifecycle-operations-acceptance.md:22–47` SHA `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58`, span `9b8c3ce8ca0576117398150e5758e3dc66e5aa00dc46f0c15c221339156eee00` | lifecycle stageの明示、artifact/実状態の分離、観測欠落のnegative形を再導出。旧EnvironmentContract/DeploymentManifest/IncidentRecord schema、staged promotion、credential/infra権限、固定運用基準は移植せず現L2とowner境界に置換。 |
| `HARNESS-L2-019` / `FR-HARNESS-L3-019`, `AC-019-01..03` | `LEGACY-ASSET-02D897E62EF2FA267267` `docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:78–169` SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`, span `9a11817f29ed1c541c8259aede0b0e93df1a6f105e57b31bddfcda90a4a593dc`; `LEGACY-ASSET-0B5B38F146D9538C9A36` `docs/test-design/helix/universal-improvement-loop-acceptance.md:16–43` SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`, span `7c229fcaadeab4ea8d4156c2ae146dbf34b47ffaf8af79c6ca2deb713e3b0c3e` ; `LEGACY-ASSET-68D46138F1FA40748C52` `docs/process/modes/reverse.md:1–130` full SHA `459b0454d97a6d991be963703f20238e38f0eba6684b8035f067d54458032b83` | partial input、unknown保全、入力境界とresult traceの形を再導出。旧candidate schema、detector registry、state machine、DB projection/replay、AI-independent runtimeを移植せず、固定L2-019の任意stageからの逆方向形成と未承認境界へ置換。Reverseの既存検証対の観測・復元、不在の一覧化、復元候補から承認を生成しない保持点を採用する。旧R0〜R4 phase、routing enum、schema、gate、旧層番号とPO gateは移植せず現行層と固定L2/L11へ置換する。 |
| `HARNESS-L2-020` / `FR-HARNESS-L3-020`, `AC-020-01..03` | `LEGACY-ASSET-A2F6A697D7FFFD490B57` `docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:123–131` SHA `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c`, span `008e6a506cdca651baec2484f34d2ac964ed9949f4d5355e9afc190fc53c7f88`; `LEGACY-ASSET-B7E240E4CE0263FDBDF6` `docs/test-design/helix/L5-pillar-integration-test-design.md:20–60` SHA `0bf20d470daba6a63b515ebd0d53509ee24c64df2c9e6bd6235e7874af23a8f5`, span `af36a201fce44f0b5210efe7306dc18ae2d562b9d9354bd5950b6da8b1d035eb` | 採択coverage receiptのsource atomは0。旧RLS-R-13はrelease後のlifecycle責務分離、L5-pillarは量閉じとLIT traceの近接類例であり、handoff失敗の直接sourceとはしない。接続義務は固定L2-020から意味を再導出する。旧bundle構成・版graphを現L2-020へ移植せず、隣接単位の契約版照合、未解決義務の保持、state非書換えへ置換する。 |
| `HARNESS-L2-024` / `FR-HARNESS-L3-024`, `AC-024-01..06` | `LEGACY-ASSET-E78B8D68CC327AA00991` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:48,52` full SHA `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61`, span SHA `1ce3dae8056a97ff09bd954f0d3afaa20b679c3c682ed67372e5663eed9516a8` / `6ff1103782a2edde657b085c3130d78188f916fb86001e1dc29e822b2d967a85`; `LEGACY-ASSET-AD746F4F3487103519F9` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/requirement-discovery-json-authority-acceptance.md:22,26` full SHA `3462b3da8269668c848799b07305f2fe135d8902de02121c2048d5686d98dc0e`, span SHA `25e60c56118dfbb4bcc47acd42a0cb3355ad8be5138f22b6ff063c87a7abbe59` / `8699b50c5d42401d7f601b0443af4668eeb4722db255443728f3e5da58fbf9fd`; `LEGACY-ASSET-63DEDB3F6F768B251BC5` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md:30–43` full SHA `d72c002d485628ba059346b6af6a7233cead8bdf060a2630289d1c8148e0e26f`, span SHA `148579143b5a2d92b96a3d864343737a19fa5194d99f5eb63a7dd70fec5f9b03` | RDJ-FR-003の質問優先入力・重複拒否とRDJ-FR-007の収束項目を意味の起点として再導出。旧「直近2 iteration」を最低件数にせず、現在の固定L2/L11の利用可能履歴・差分条件へ置換。旧JSON正本、schema/compiler/runtime、G1/G3 gate、固定ID・数値weightは移植しない。Prototype test-designは適用性・合意の条件付き観測だけを参照し、Prototypeを全対象で必須化しない。 |

上のAC範囲に加え、024-04..06は固定L2:499–525とL11:240–260の領域状態、timeout、補助計測を再導出する。旧最低2 iterationや固定技術値を採用しない。旧資料は参照のみで、旧test/runtimeは実行しない。

## Stage 5 suffix — HARNESS-L2-021/025/033/035/037（1.0対象）

この追補は固定された5親の1.0対象に対応する未承認L3草稿であり、既存本文を置換しない。L2/L11、PO判断と実装順序台帳が定める親identity・scope・owner・version_targetを維持する。対の検証は[functional-verification.md](../L10-verification/functional-verification.md)の同一AC IDで行う。ここに記すcandidate、fixture、戻し先はL3承認、実装・実行許可、CI結果、L11受入を生成しない。Web条件付き・後続版の要求を1.0へ移さず、旧runtime/CLI/CIは起動しない。

### 固定親と旧sourceの適用範囲

| 親 | 固定L2 / L11 | 現行owner・適用範囲 | 旧sourceからの処置 |
|---|---|---|---|
| `HARNESS-L2-021` | L2 `product-requirements.md:438–446`、L11 `product-acceptance.md:216` | HARNESS構成体の端から端trace、構成体固有の横断NFR・統合版更新/rollback・L12運用検証。個別release unit成功とは別に評価し、LABO/OSが担う評価・提案・実行をHARNESSが代行しない。 | 旧FRS-BR-009とFRS-R-23/24から安全依存closure、Lite/Full単位の統合差分・rollback義務を再導出。旧FRS-AC-025/026とmappingからsource→要件→構成体検証→運用のtrace形を参照する。旧Lite/Full/L12値・旧unit分類を現行release-unit identityへそのまま移さず、旧完了/受入/運用gateを置換する。receiptが直接覆うのはFRS-BR-009の2 atomsのみで、旧全要件被覆を主張しない。 |
| `HARNESS-L2-025` | L2 `product-requirements.md:544–554`、L11 `product-acceptance.md:342–360` | 026設計unitと常時必須のBRAIN connector契約を束ねる汎用設計構成体。Patternを使う場合だけHELIXBRAIN-L2-030 receiptと選択Pattern条件を加える。CORE/Design Template/connector契約とscopeに従い、独立承認・受入・実装authorityを作らない。 | 旧multimodal-design-harness-authorityは近接するauthority/IR設計の比較例に限る。現行025に直接対応する旧L3要件またはpaired consumerは特定できず、直接再利用とはしない。旧source phrase検索はinventory記載語でarchive範囲を検索し0件だったが、これはarchive全体に意味的対応がない証明ではない。固定025から必要relation・双方向trace・invariant・normal/reject/failure pathを再導出する。 |
| `HARNESS-L2-033` | L2 `product-requirements.md:667–690`、L11 `product-acceptance.md:432–444,457` | COREのcase/repro/regression trace構成体候補。030/031と必要時032の選択operationに適用。case生成、reproduction、run receipt、修正前fail、選択時の修正後passを別stage/resultとして扱い、OS/利用者CIが実行、022が検証/受入契約を所有する。 | 旧FR-25とAT-FR-25の回帰trace/id対応を比較例として参照するが、incident由来minimized reproの直接系譜とはしない。旧runtime/testの実行や固定workflowは再利用せず、同一oracleの縮小前後failure・修正前fail・選択時の修正後passを固定033から再導出する。archive phrase検索はinventoryと追補readの範囲で直接incident-minimization相当の対応を確認できなかった。 |
| `HARNESS-L2-035` | L2 `product-requirements.md:719–729, 931–941`、L11 `product-acceptance.md:485–492,678–686` | COREの要求候補導出根拠・受入寄与・最小性/代替案/budget照合。操作・記録・ticketは選択時にOS側へ渡し、外部管理/CIをCORE成立の必須条件にしない。未知budgetはunknownのまま。 | 旧HIL-FR-38、HIL-NFR-07/23から上流根拠、受入寄与、代替案、budget根拠、導出循環の検出を再導出する。旧screening/authority gate、旧数値/運用を置換しない。coverage receiptの選択atomsはこれら3件だけであり、旧IR全文を網羅しない。旧HST-HIL-021/HAT-HIL-05は静的な根拠/受入対の形を参照し、旧実行は再利用しない。 |
| `HARNESS-L2-037` | L2 `product-requirements.md:777–833`、L11 `product-acceptance.md:527–573` | 2026-09-29 PO判断の最新採択行・registration `MPR-RC-HARNESS-L2-037-002`・G0 Stage5 1.0分類を採択状態の根拠とする。L2本文の歴史的「未採択」表現は判断前の候補記述として保持し、その箇所を現在の状態根拠にしない。L2-009が対象/templateに二段適用性を示す場合に限り、Phase 1一般systemからPhase 2 agent固有scopeへ合流するCORE能力。HARNESS自身には適用しない。 | 旧Concept A-74とFR-L1-28、旧L6 design/coverage、screen/acceptance rowsから二段の順序・成果pair・handoff意味を再導出する。旧`drive=agent`、phase YAML固定field、provider/runtime、旧layer番号とgateを移植せず、現行L2-009適用契約と各段L2/L3/L10/L11/L12 identityへ置換する。receiptの15 atomsは選択範囲であり、旧source全集合の被覆完了ではない。 |

旧source検索・inventoryの限界、full file/span pinと意味照合の違いはStage5監査に明記する。旧consumerの例を参照する場合も、旧test/runtime/CIを実行せず現行L2/L11と現行ownerへ置き換える。

### `FR-HARNESS-L3-021` — 構成体の端から端成立根拠

**入力**：対象構成体・revision/scope、該当するrelease-unit成果とsource、要件・設計・実装・022検証/受入oracle、構成体固有義務、統合版と更新前後のidentity、rollback対象/復元証拠、L12運用検証、LABO/OSが返す観測・評価・提案・要求への戻し結果。

**出力**：各必須relationの端から端trace、構成体固有義務と個別unit証拠の分離、統合版の差分/復元照合、運用観測と要求戻しのtrace、不足・unknown・stale・conflictと既存source/義務ownerへの戻し候補。評価・改善案は入力結果として保持し、HARNESS自身は改善を実行せず、提案を承認済要求にしない。

**不変条件・戻し先**：L2-007/005/008とFRS-BR-009の束ね条件、個別unitと接続/構成体固有義務、L12運用の区別を保つ。unit成功の和だけで構成体を成立としない。trace欠落/版ずれは当該artifact・relation提供ownerへ、構成体固有oracle不足は要求/設計ownerへ、rollback証拠不一致は統合変更のsource ownerへ戻す。評価/提案/実行の責務不足はLABO/OS側既存ownerへ返し、実績評価や改善実行をHARNESSへ割り当てない。

- **`AC-HARNESS-L3-021-01` 端から端trace**：選択scopeの要求形成から運用観測・要求への戻りまで、対象revisionを結んだnormal traceを確認する。構成体固有relationと横断NFRを別tupleで保持し、正しいが未見の構成体scopeも同じ契約内なら受け入れる。
- **`AC-HARNESS-L3-021-02` 構成体固有義務**：unitごとの成功receiptをすべて与えた上で、構成体専用traceまたは横断NFR oracleを一つ欠落させると構成体成立を保留する。unit成功だけで欠落を補わない。
- **`AC-HARNESS-L3-021-03` 統合版更新とrollback**：統合前後の構成体revisionを識別し、更新差分を対象scopeと結ぶ正常結果を確認する。適格な直前状態からのrollback証拠が対象版・scopeと一致するときだけ復元候補を確認する。不一致・旧revision証拠では復元成功を主張しない。release eligibility/実行状態と運用stateは別に保持し、unit/composite成功から自動生成しない。
- **`AC-HARNESS-L3-021-04` LABO/OS還流境界**：L12観測・LABO評価・改善提案・OSの提案/選択された実行receipt・HARNESS要求sourceへの戻りを別のsource/resultとして受け、要求ownerへの戻り先とreceiptをtraceする。戻しsourceまたはreceiptが欠落すれば還流trace未完を保持する。受信、ticket、改善提案だけで要求承認・変更実行・運用成功を生成しない。

### `FR-HARNESS-L3-025` — 設計構成体と対oracleの整合

**入力**：025固定L2の常時必須である対象L3 authority/revision、026設計unitとreceipt、CORE/Design Template/BRAIN connector契約のidentity/version/compatibility、scopeと022 oracle、選択時のみPattern receipt・required input/relation/version、画面/API/DB/permission/state要素とfailure path。

**出力**：要求→設計要素→oracleの双方向trace、unit/connection/composite relation、横断invariant、正常・拒否・failure pathの対検証設計、conflict/unknown/alternative/差戻し先を含む各条件の状態と既存ownerへの不足返却。025は026を生成せず、014を置換せず、採択・承認・実装・利用者受入を出さない。

**不変条件・戻し先**：BRAIN connector契約と026 unitは常時必須。Patternは明示選択された場合だけ、そのreceiptと全required input/relation/versionが必須であり、未選択Patternは未観測である。意味差はHARNESS-L2-008/上流owner、L3 authority/revision差は該当L3 owner、Pattern/relationの不足・衝突・version差はBRAIN connector/Pattern owner、設計要素/pair/oracleの形成不足はHARNESS-L2-026/022の形成へ返す。CORE connectorの版unknownまたは互換範囲外は不適合として保留し、固定L2にないconnector専用戻し先は作らない。Template適用差も互換範囲外なら保留し、設計/pair形成の不足がある場合のみ026/022形成へ返す。未特定のgeneric permission owner、CORE connector owner、Design Template ownerを新設しない。connector自体が無い場合もPattern利用で代替しない。固定L2に示す承認後編集禁止例では、申請→承認→編集要求→拒否の状態とpermission/data invariantを端から端で確認する。

HARNESS-L2-014が設計一式の整合を提供するscopeでは、そのscopeに対するHARNESS-L2-025の検査を常時必須とする。これは対象scope内の検査条件であり、別の承認・開始gateを追加しない。

- **`AC-HARNESS-L3-025-01` 常時必須契約**：026 unit、L3 revision/scope、CORE/Design Template/BRAIN connector契約と022 oracleを一致させるnormal compositeを確認する。Patternを選ばないfixtureではPattern receiptを要求せず、全Patternの知識を要求しない。
- **`AC-HARNESS-L3-025-02` 選択Pattern条件**：同じ正常compositeでPatternを一つ選択し、対応するHELIXBRAIN-L2-030 receipt・選択Patternのrequired relation/versionを結ぶ。receipt欠落、unknown、stale、scope mismatchを別CASEで保留し、別Patternへ暗黙fallbackしない。
- **`AC-HARNESS-L3-025-03` 構成体invariant**：申請から承認後編集拒否までのscreen/API/permission/state/data oracleを一つのtraceへ結び、単体・connection passのみでは合格にしない。反例は一つのrelationまたはoracle状態だけを変え、誤ったcomposite passを拒否する。
- **`AC-HARNESS-L3-025-04` authority非生成**：composite設計・検証設計が整っても、L3承認、実装済み、利用者受入済みを生成しない。
- **`AC-HARNESS-L3-025-05` 代替の意味保持**：固定L2:550のalternativeを出力し、L11:346に従い意味を保つ比較候補を示す。複数Patternの衝突時は意味保持案を比較可能に示し、意味変更案は採用せずL2-008/上流へ戻す。意味変更案しかない場合も同じ戻し先へ返す。
- **`AC-HARNESS-L3-025-06` 未見actor/遷移**：固定scopeに未見のactorまたはstate transitionを一つ追加したfixtureで同じscope義務・oracleを照合する。名称未見だけで拒否せず、transition oracle不足はL2-022形成へ、意味変更はL2-008/上流へ戻す。

### `FR-HARNESS-L3-033` — failure-to-regressionの段階別trace

**入力**：対象revision/scopeと022 oracle、通常caseではcontract-derived input、incident/reproを選択する場合は許可されたsanitized source・031契約・reduction step、030/031 unit identity/schema/version、選択された操作に必要な014対設計と032 run-request/consumer contract、選択executor（OS-020または利用者CI）のidentity/互換範囲、各段階後に返るisolated run result receipt。未選択operationは未実施として保つ。

**出力**：case/repro source→original failure→reduction candidate→選択時の隔離run request/result→同一failure比較→regression candidate→回帰成立を主張する操作だけに限る修正前failureと修正後pass→選択consumer packet/resultの、順序とsource/revision/scope/ownerを保つtrace。初期入力で将来receiptや修正後passを要求しない。通常case生成ではincident inputを不要とし、reproduction、run、修正後run、consumerを未選択のまま成功とも失敗とも数えない。

**不変条件・戻し先**：縮小前後は同一oracle・対象failureで照合する。033の固定範囲はL2:667–690、L11:432–444,457。pack、014対設計または022契約が更新されたら010/011を再照合し、影響するcase/oracle/repro/consumer packetを更新後revisionへ結び直す。旧receiptは新revisionへ流用しない。回帰candidateの生成だけなら修正後runを要求せず、修正後passを選択した回帰成立claimでのみ必要とする。安全な入力処理とsanitized incident inputを常時守り、未sanitized入力はsecurity/data ownerへ戻す。回帰成立claimでは縮小前後同一failure、修正前revisionのfail、修正後revisionのpassの全receiptが必要。修正後passを選択しないcase/repro生成は、そのreceipt未取得を理由に保留しない。回帰candidateのみの生成は修正後receiptなしで開始でき、開始を将来receiptの欠落だけで拒否しない。source許可不足はsecurity/data ownerへ、oracle不足は要求/設計ownerへ、unit契約差は該当030/031 ownerへ、選択consumer不整合はconsumer契約ownerへ返す。OSまたは利用者CIがrunする; HARNESSはrun/passを作らない。未選択consumerの実行結果を作らず、case/traceだけで022のProvisional/Integrated/Verified/Acceptedを進めない。pack交換後のstale evidenceは新revisionで再生成する。

- **`AC-HARNESS-L3-033-01` 通常case**：incident inputなしでcontract-derived case candidateを作り、source/oracle/revision/scopeとconsumer未選択を記録する。case候補をrun済みまたはregression成立にしない。
- **`AC-HARNESS-L3-033-02` incident reduction**：許可sourceを選択したfixtureでoriginal inputと各reduction candidateを保ち、隔離run receipt後の比較を段階別にする。縮小前後oracleが異なる、またはoriginal failureを欠く場合、同一failureと扱わない。
- **`AC-HARNESS-L3-033-03` 回帰成立の全証拠**：縮小前後同一failure、修正前revisionのfail、修正後revisionのpassの3種の後段証拠を別々に結び、揃わない限り成立claimを拒否する。
- **`AC-HARNESS-L3-033-04` 段階・authority分離**：result receiptの受信をcase/repro開始入力へ逆流させず、CI pass、consumer packet、022受入を同一状態に潰さない。選択されていない修正後runやconsumerを必須化しない。
- **`AC-HARNESS-L3-033-05` receiptとconsumerの選択**：修正前runはfail、選択された修正後runはpassとして対象revisionに結び、選択されていないconsumerを実行済みとしない。receiptの存在だけで結果を合格にしない。
- **`AC-HARNESS-L3-033-06` pack/contract更新**：pack更新時は010/011を再照合し、014対設計または022契約更新時は影響候補をstaleとして新revisionへ再生成する。古いreceiptを流用しない。
- **`AC-HARNESS-L3-033-07` sanitized input**：incident inputの安全処理を保持し、未sanitized入力は操作に使わずsecurity/data ownerへ戻す。

### `FR-HARNESS-L3-035` — 要求候補の根拠と寄与の照合

**入力**：候補identity・revision/scope、対象機能・目的/non-goal、原指示source/出所、Concept/L1/既存要求のauthorityとrevision、候補までの導出relation、寄与する受入条件、必要性・代替案、選択budgetと根拠またはunknown、適用時の複雑さ・公開面・運用負債の変更前後測定、履歴の種類。測定前の候補起草は可能とする。

**出力**：上流から候補までの導出path、各relationのauthority状態、受入寄与、必要性/代替案、scope逸脱・循環・unknown/conflict・budget状態、複雑さ・公開面・運用負債の変更前後測定状態を分けた照合結果と既存ownerへの戻し候補。測定不足は該当scope判定を未完にし、機能数や別観点の値で相殺しない。数式・閾値は固定しない。正常なFeedback循環、訂正履歴、実行反復は導出graph循環と区別する。candidateや相互参照するcandidate同士を唯一の上流根拠にしない。操作/記録/ticketが選択される場合は既存OS consumerへ渡し、COREはそれらを実行しない。

**不変条件・戻し先**：原文・上流revision不足はsource ownerへ、意味衝突・根拠循環・不要拡張は要求形成の訂正へ戻す。人が持つ要求意味を変える場合だけ、原文・選択肢・推奨・影響先を付けて既存の人間判断へ返す（固定L2:727）。新しい承認手続きを作らない。

- **`AC-HARNESS-L3-035-01` 根拠と受入寄与**：原指示または該当上流revisionから候補へ至るpathと受入条件への寄与を示すnormal fixtureで、候補自身を根拠にせず照合できる。正しい未見scopeも固定035の範囲内で受け入れる。L2-009/templateは本ACの適用条件に追加しない。
- **`AC-HARNESS-L3-035-02` 導出循環**：上流根拠がcandidate自身または同時生成candidateだけへ戻るedgeを一つ加えると根拠充足を拒否し、該当要求形成ownerへ戻す。別にFeedback履歴のみが循環しているfixtureは導出循環と誤判定しない。
- **`AC-HARNESS-L3-035-03` budget unknown**：budget根拠をunknownとした入力を0または無制限へ読み替えず、要求形成の不足として保つ。budgetを明示した場合も新しい人間承認を生成しない。
- **`AC-HARNESS-L3-035-04` scope最小性と代替**：原指示、Concept/L1/既存要求の対象revision・authority、purpose/non-goal/scope、受入条件への寄与、必要性relation、代替案relation、選択budget根拠を別fieldで照合し、いずれか一つの欠落/unknown/stale/mismatchを個別に保留する。budget unknownを0にも無制限にも読み替えない。根拠のある後続版/先行投資候補を初版の最小構成に入らないという理由だけで削除しない。technical-only差分は新approvalを作らず、意味/authority/scope差は上流へ返す。既存OS操作の実行結果を要求候補の採択証拠にしない。
- **`AC-HARNESS-L3-035-05` scope計測**：L2:931–941の三観点（複雑さ、外部公開面、運用負債）を変更前後で測るnormalを置き、追加機能数だけを用いて最小性を結論しない。起草開始時は測定未完を許容する。測定方法・条件が未定の場合もcandidateを起草できるが、該当計測契約または要求形成ownerへ不足を返し、unknownとscope判定未完を保持する。
- **`AC-HARNESS-L3-035-06` 欠測非相殺**：三観点それぞれの測定結果だけを欠落させる個別CASEで、残る観点と追加機能数が正常でもscope判定を未完にする。閾値を補わず、要求形成ownerへ戻す。
- **`AC-HARNESS-L3-035-07` 上流訂正後の再導出**：上流revisionを訂正した状態で旧導出receiptだけを与え、現revisionのcandidate根拠として受け入れない。該当要求形成/source ownerへ戻す。
- **`AC-HARNESS-L3-035-08` CORE/OS分離**：OS登録・ticket・実行receiptがなくてもCOREの意味照合を正常に行う。逆にOS登録だけから意味照合成立、人の合意、実行権限を作らない。

### Stage 5 Root検収追補 — scope計測の反例対応

AC-035-05はS5-027/028/042および035〜038（旧revision計測、機能数だけの最小性、根拠外閾値の許可と拒否をそれぞれ別CASE）、AC-035-06は029/041/034（複雑さ・運用負債・公開面の各欠測）、AC-035-08は031/032/039/040（CORE単体正常、OS登録非代替、未完候補からの合意生成と実行権限生成の各反例）へ結ぶ。固定035の意味・scope・owner・版は変更しない。

### `FR-HARNESS-L3-037` — 適用可能なW二段設計のtraceと合流

**入力**：対象system/product・revision/scope、L2-009の要求kind/target/構成/risk/domainと適用template/義務/契約版、各Phaseに適用されるL2合意・L3承認authorityとphase対象revision、Phase 1一般system設計とその後段L9 receipt、Phase 2固有目的/制約/受入・Phase 2対象scopeへ適用されるL2/L3判断・agent設計とその後段L9 receipt。identity文字列の一致/不一致だけでは可否を決めず、authority記録・適用scope・対象revision・decision evidenceを照合する。適用性unknownならPhase 2を開始済みにしない。

**出力**：二つのphaseごとのscope/authority記録/対象revision、source→L2→L3→L4設計→対L9 evidence trace、Phase 1からPhase 2へのhandoff、両方の条件充足後の合流候補、未完義務/差分/Backflow先。Phase 1 authorityをPhase 2へ複写しない。設計成果だけからL9 run receipt、L10 Verified、L11 Accepted、L12 Observedを作らず、OS/利用者が運転・実行する。

**不変条件・戻し先**：L2-009が適用を示す場合だけ二段scopeを扱う。Phase 1一般systemを先に確立し、必要なL9結果を後段入力としてからPhase 2固有要求/要件/設計へ進む。両phaseの適用L2合意・L3承認authority・設計とL9 evidenceはscope/revision/decision evidence別に照合する。L2 identity文字列が同じという理由だけで不合格にせず、Phase 1の合意/承認判断をphase2対象scope・revisionへ証拠なしに流用した場合を不合格とする。同一commit/IDの機械的一致・不一致をgateにしない。HARNESS自身適用は除外する。適用template不足はL2-009の義務形成へ、意味変更はL2-008/上流へ、oracle不足はL2-022形成へ、対象revision/運転記録はOS境界へ戻す。設計/receipt不足は当該phaseの既存artifactまたはresult source ownerへ戻す。上流変更は影響pairをstaleとして再照合し、未見変更も適用oracleに従って扱う。022結果から意味gapを閉じない。

- **`AC-HARNESS-L3-037-01` 適用性と開始入力**：009が二段適用を示すnormal fixtureでPhase 1のauthority/revision/templateだけから設計を開始でき、Phase 1/2の将来成果やL9結果を開始時に要求しない。適用性unknownおよびHARNESS自身scopeは別CASEで止める。
- **`AC-HARNESS-L3-037-02` phase分離とhandoff**：Phase 1設計に対するL9 receiptを得た後でのみ選択scopeをPhase 2へ渡し、対象・revision・oracle一致を確認する。Phase 1 approvalをPhase 2 approvalへ流用しない。
- **`AC-HARNESS-L3-037-03` 合流条件**：各phaseの固有L2/L3/design/L9 tupleが同一scopeにそろった場合だけ合流候補を返す。片方のreceipt・authority・scopeを一つずつ欠落/不一致にしたfixtureでは未完義務を保持する。
- **`AC-HARNESS-L3-037-04` 現行pair/状態境界**：旧phase.yamlや旧層番号を入力必須にせず、現行L3↔L10、L2↔L11、L1↔L12の別状態を保つ。設計の存在から実行・受入・観測を推定しない。利用者の選択executorを使うscopeに内部OS一式を要求せず、旧構造との差だけで不合格にせず、unknownだけから新人間承認を固定しない。


## Stage 3 親034の計測契約（version_target 1.0）

この追補は固定L2-034（693–717）と固定L11-034（465–483）の意味を、既存のStage 3文書へ親単位で戻す。L2-034は計測契約と完成判定の要件であり、HARNESS-L2-022の段階判定、CORE traceの意味、実行者の許可を置き換えない。実際の値はsourceにある候補fixture値としてのみ使い、実測・合意・承認済みの状態を主張しない。

### `FR-HARNESS-L3-034` — 対象別計測契約とcompletion evidence

**入力**：要求/NFR identityとrevision、適用scope、対の設計/受入、workload/environment/data、既決目標と根拠、測定結果とsource。

**出力**：metric IDごとに対象requirement/NFR identity、measurement target、condition、baseline、target/SLOまたはsourceに根拠を持つN/A、tolerance、sampling/window、tool/probe、evidence schema、judgement oracle、owner、execution layer、remeasure triggerを区別したcontract candidate、および各fieldのsource trace。未決値はunknownとして残し、別fieldで相殺しない。

**不変条件**：同revisionかつ同scopeの必須metricがunmeasured、stale、nonrepresentative、unmetなら対象system completionを成立させない。code/doc/test/CI successや別metricの好成績で相殺しない。実測結果から要求合意、利用者Accepted、実行permissionを生成しない。OSまたは利用者の選択実行手段が証拠を返す。LABO/INFRASTRUCTUREは選択された比較評価/HELIX本体資源観測に限る。

**戻し先**：field/contractの意味不足はHARNESS-L2-034の該当requirement/NFR owner、意味変更だけはL2-003/004へ戻す。execution/environment/result-source不足は選択された既存OS/利用者/LABO/INFRASTRUCTURE source ownerへ戻し、固定sourceで識別できなければunknown。CORE trace参照の欠落は、固定L2-034:695/703/704に基づきCOREの検証契約・traceに関する契約区分へ戻す。具体的なowner identityは固定sourceで識別できない場合にunknownとして保持し、戻し区分やCOREという依存先までunknownにしない。通信選択時だけCONNECT contractを照合し、非選択時のCONNECTを必須化しない。

| AC | 受入条件 | 主な単独CASE | 境界 |
|---|---|---|---|
| `AC-HARNESS-L3-034-01` | 全14項目、要求/NFR identity、CORE trace、条件付きCONNECT dependencyをsource/revision/scopeへ対応付ける。stable NFR identity・quality characteristic・source authority・対象surfaceと、通常target／error budget／hard limitの区別も保持する（固定L2:711）。 | 既存CASE-034-29/field casesに加え、Stage 3 r19の`CASE-HARNESS-L10-034-r19-two-requirements-complete-contracts`, `CASE-HARNESS-L10-034-r19-unseen-requirement-workload-environment-normal`, `CASE-HARNESS-L10-034-r19-measurement-method-design-normal`, `CASE-HARNESS-L10-034-r19-core-trace-missing`, `CASE-HARNESS-L10-034-r19-selected-connect-current-normal`, `CASE-HARNESS-L10-034-r19-selected-connect-contract-missing`。 追加の主CASE（同AC所属）：`CASE-HARNESS-L10-034-r20-infra-requirement-fit-claim`、`CASE-HARNESS-L10-034-r20-labo-requirement-fit-claim`、`CASE-HARNESS-L10-034-r20-product-uniform-target-value-claim`、`CASE-HARNESS-L10-034-r20-product-uniform-environment-claim`、`CASE-HARNESS-L10-034-r20-selected-operation-security-data-use-reference-missing`。 | CORE traceは常時dependency。CONNECTは通信選択時だけ要求し、owner不明はunknown。 |
| `AC-HARNESS-L3-034-02` | 同revision/代表条件の結果を別状態で照合し、欠測/stale/非代表/未達からcompletionを生成しない。別環境または別revisionにおける有効な結果を、対象metricの未測定の相殺に使わない（固定L2:700、L11:471）。 | 既存CASE-034-r05-root-metric-* と `CASE-HARNESS-L10-034-r19-current-representative-measurement-normal`。 追加の主CASE（同AC所属）：`CASE-HARNESS-L10-034-r20-infra-system-completion-claim`、`CASE-HARNESS-L10-034-r20-labo-system-completion-claim`、`CASE-HARNESS-L10-034-r20-stop-reason-missing`、`CASE-HARNESS-L10-034-r20-metric-success-completes-other-system-duty`、`CASE-HARNESS-L10-034-r21-other-environment-result-does-not-offset`、`CASE-HARNESS-L10-034-r21-other-revision-result-does-not-offset`。 | 候補fixtureを実測済み状態へ読み替えず、測定結果だけから要求合意・利用者Accepted・実行permissionを生成しない。別scope/revisionの結果自体はそのscope/revisionでは有効なまま保持する。 |
| `AC-HARNESS-L3-034-03` | 設計、fixture、局所/system検証、利用実態受入、時間軸評価を別段階として保持する。実測時系列を要求・release・regression・改善episodeへ結び、履歴と比較母集団を保ち、同じ因果関係をOS証拠記録とLABO改善評価へ渡す。起草開始に未来の実測・改善完了を要求しない（固定L2:715）。 | 主CASE（AC-03所属）：`CASE-HARNESS-L10-034-r09-001`、`CASE-HARNESS-L10-034-r09-002`、`CASE-HARNESS-L10-034-r09-003`、`CASE-HARNESS-L10-034-r09-004`、`CASE-HARNESS-L10-034-r09-019`、`CASE-HARNESS-L10-034-r19-real-use-acceptance-evidence-missing`。工程に関する他AC参照（AC-04所属・追加fixture計数ではない）：`CASE-HARNESS-L10-034-root-06-field-01`、`CASE-HARNESS-L10-034-root-06-field-02`、`CASE-HARNESS-L10-034-root-06-field-03`、`CASE-HARNESS-L10-034-root-06-field-04`、`CASE-HARNESS-L10-034-root-06-field-05`、`CASE-HARNESS-L10-034-root-06-field-06`、`CASE-HARNESS-L10-034-root-06-field-07`、`CASE-HARNESS-L10-034-24`、`CASE-HARNESS-L10-034-r09-011`。 追加の主CASE（同AC所属）：`CASE-HARNESS-L10-034-r20-infra-authority-claim`、`CASE-HARNESS-L10-034-r20-labo-authority-claim`、`CASE-HARNESS-L10-034-r20-causal-os-evidence-binding-missing`、`CASE-HARNESS-L10-034-r20-causal-labo-evaluation-binding-missing`、`CASE-HARNESS-L10-034-r20-causal-comparison-population-identity-changed`、`CASE-HARNESS-L10-034-r20-draft-blocked-by-unmeasured-result`、`CASE-HARNESS-L10-034-r20-create-blocked-by-unfinished-improvement`。 | 利用実態受入、Accepted、実行permissionを前段階や実測結果から生成しない。 |
| `AC-HARNESS-L3-034-04` | 13品質領域、適用条件/理由付き非適用、AI7、選択riskと個別非適用理由をscopeに応じて照合する。選択した保存方式に応じたdata量・query/projection・lock・縮退・再構築・archive/保守・並行性・soak条件（固定L2:713）と、権限/状態境界に応じたfault injection・race・soak・crash recoveryの適用条件（固定L2:714）を脱落させない。 | 他AC参照（追加fixture計数ではない）：r06品質領域4状態はAC-02所属、`CASE-HARNESS-L10-034-r06-metric-id-missing`・r07品質適用性2行・r18手法根拠6行および分類混在行はAC-01所属。主CASE（AC-04所属）は `CASE-HARNESS-L10-034-r19-quality-performance-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-performance-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-reliability-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-reliability-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-availability-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-availability-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-recoverability-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-recoverability-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-security-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-security-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-privacy-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-privacy-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-accessibility-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-accessibility-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-compatibility-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-compatibility-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-operability-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-operability-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-maintainability-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-maintainability-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-cost-resource-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-cost-resource-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-data-quality-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-data-quality-unsupported-na`, `CASE-HARNESS-L10-034-r19-quality-observability-applicability-unknown`, `CASE-HARNESS-L10-034-r19-quality-observability-unsupported-na`；risk手法別：`CASE-HARNESS-L10-034-r19-risk-property-based-nonapplication-rationale-missing`, `CASE-HARNESS-L10-034-r19-risk-model-based-state-machine-nonapplication-rationale-missing`, `CASE-HARNESS-L10-034-r19-risk-differential-nonapplication-rationale-missing`, `CASE-HARNESS-L10-034-r19-risk-mutation-nonapplication-rationale-missing`, `CASE-HARNESS-L10-034-r19-risk-fuzz-nonapplication-rationale-missing`, `CASE-HARNESS-L10-034-r19-risk-snapshot-compatibility-nonapplication-rationale-missing`。 | 適用性unknown/根拠なしN/Aは未完。AI7とrisk techniqueは適用scopeに限る。AC01所属CASEの他AC参照（別fixture定義・追加計数ではない）：`CASE-HARNESS-L10-034-r19-measurement-method-design-normal`。|


## Stage 3 親036の検証観点完全性・local/CI同一契約

### 固定親と出所

本候補はHELIX-HARNESS-COREの単体要件で、`version_target: 1.0`。2026-09-29 PO採択表41行は`HARNESS-L2-036`、`MPR-RC-HARNESS-L2-036-002`、L2 digest `7a18c20e22c0cf65e8edcd3b3ca7eca7996d72c0358c874591407d77dbba4bbb`、L11 digest `80e87d6469c45baa056fbc7415871725c3358f7392a87308c809d6bfe87f0ba4`を採択した。固定本文は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`のL2:730–775/L11:493–525。9/28の「未採択」記述は当時の時点文であり、PO採択行に従う。仮登録metadataの`authority_effect=none`は採択済み固定revisionを覆さない。L3本文は未承認候補であり、実装・実行・CI・release許可を生成しない。

### `FR-HARNESS-L3-036` — 選択scopeの検証完全性とgate契約

**入力**：対象revision/ticket/scope、HARNESS-L2-005で選択されたprofile・省略/回収先、設計成果・test design・test-level定義、screen適用性と合意済screen scope、選択gateのlocal/CI契約identity/content/version/settings、各面のresult/evidence、適用される要求・設計・段階oracle。

**出力**：適用scope内の観点抜け・level間重複、4 cross-detection観点の各findingと観測状態、選択gateの二面契約照合、画面対象の5軸別`DetectorResult`と証拠relation、省略された選択義務の理由・回収先を返す。gate実行・CI編成・state/log/result/receiptの保存はHELIX-OS、段階別oracle/利用者受入契約はHARNESS-L2-022の既存責務である。

**保証と原因別戻し先**：W gateは選択scope内で必要観点の抜け・同一観点のlevel間重複を静的にfail-closeし、適用対象のpass時に両方0件を保つ。4 cross-detection観点（依存漏れ・契約漏れ・接続欠損・デグレ）は別々に観測し、unknown/unobservedを0件としない。local/CIは選択された同じgate identity、content snapshot、contract version、settings、scopeと各対象revisionのresultを照合する。commit SHA差だけでは不一致にしない。editor failureはcommit前の局所修正へ戻す。全ticket・全段階・全環境の同時実行を追加しない。

画面ありかつ合意済みscreen scopeの対象は`mock-promotion`、`design-token-drift`、`a11y-regression`、`visual-regression`、`state-transition-drift`を各々評価する。一軸でもfail/input/schema/oracle/evidence欠落なら該当FE gate全体をfailまたは未評価/保留とし、N/A/passへ変換しない。根拠付き非画面のみFE 5軸の適用外となる。原因別の既存戻し先は、screen有無・適用性・合意scopeの不足がHARNESS-L2-003/008の既存requirement/design責務、ticket/profile選択・省略・回収がHARNESS-L2-005、契約入力・schema・要求意味がHARNESS-L2-008、段階oracleの意味/不足がHARNESS-L2-008/022、選択済みrun/result/receiptがHELIX-OSである。既存親にない024/025/026を戻し先にしない。

選択済み上位testを省略する場合はHARNESS-L2-005に従って理由と回収先ticketを保ち、未回収を完了と扱わない。gate pass、CI green、artifact存在、他scopeのresultからsystem completion、L10 Verified、L11 Accepted、利用者受入を生成しない。90%は運用KPIでありticket合否ではない。KPI D-02の適用母集団・期間・分母はL3で照合し、その要求意味を変更する場合はL2へ戻しPO判断を求める。判断前に新しい意味へ置換しない。

| AC | 受入条件と主fixture | 境界 |
|---|---|---|
| `AC-HARNESS-L3-036-01` | selected scopeのW抜け/重複と4 cross-detectionを別観測する。正常は`CASE-HARNESS-L10-036-r11-w-selected-scope-normal`と`CASE-HARNESS-L10-036-r11-cross-detection-complete-zero-normal`。既存negativeと索引は対L10 tableのcase行で識別する。 | W/cross-detectionの0件は適用scopeの観測結果。unobservedを0へ変換しない。KPIは運用集計として別母集団に記録する。 |
| `AC-HARNESS-L3-036-02` | selected local/CI gate契約と各面のresultを照合する。正常は`CASE-HARNESS-L10-036-r11-local-ci-full-contract-parity-normal`。既存のSHA差許容、field単独欠落/不一致、settings mismatch、editor failure/再評価を別CASEで保つ。 | 同一gateの条件一致を検証し、run/result/receiptはOSが担う。ticket/profileの追加義務を作らない。 |
| `AC-HARNESS-L3-036-03` | screen適用根拠のあるscopeで5軸を独立評価する。正常は`CASE-HARNESS-L10-036-r11-screen-five-axis-pass-normal`。各軸fail/unobserved、適用性unknown、screen scope欠落、追加後stale、non-screen PoCを既存CASEで区別し、r18 input/schema unknownは同一正常baselineから各一fieldだけ変異する。 | applicability/scopeは003/008、契約入力/schemaは008、段階oracleは022へ原因別に戻す。FE gate全体をholdし、N/A/passを生成しない。 |
| `AC-HARNESS-L3-036-04` | 選択済み省略・回収義務とgate/result/acceptance状態を分離する。未見正常を理由だけで拒否せず、未完の選択義務とsystem/user acceptanceの別oracleを保つ。 | 005の選択・回収を維持し、CI/resultからacceptanceを生成しない。 |

**旧sourceからの再導出**：`LEGACY-ASSET-6B6C5CB0E481BE01088B`の旧FR-L1-21/22（snapshot `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:52–53`、旧path `docs/design/harness/L1-requirements/functional-requirements.md:52–53`）からW抜け/重複fail-close、FE五軸、L2 mock/token/screenshots/transition入力と`DetectorResult`の意味を保持・再導出した。`LEGACY-ASSET-5429AA05B022E9F49B0A`のNFR-06/13（snapshot `.../L1-requirements/nfr.md:31,51`）から条件付きfail-close、同一selected gate local+CI、editor failure後の局所修正、4 cross-detection/Wの0件条件、≥90% KPIを保持した。旧`drive=fe`は現行triggerへ再利用せず、screen適用記録とticket/profileへ再導出した。旧hook/GHA/CLI/runtime/state/log pathは置換対象であり現行実行指示にしない。

旧L3配置定義`LEGACY-ASSET-9A772391C7FB1298D45F`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`）および旧FR定義`LEGACY-ASSET-B5B5E71B2AF1459D59A1`（`.../functional-requirements.md:22–40`）からFR+AC構造と機能/業務/NFR分離を再導出し、旧G3/L12実行構成や採番を流用しない。consumer `LEGACY-ASSET-6B6C5CB0E481BE01088B`の旧L6 `vmodel-pair-freeze.md:153–155`、`function-spec.md:245`、L7 `L7-unit-test-design.md:742–750`は必要なviewpointのpair不足・重複と決定論的evidenceのconsumer要件を示す。旧business-detail`LEGACY-ASSET-A6E2C7F0565E5F804F06`とold NFR `LEGACY-ASSET-DB669724249A14A665F0`は分類起点としてのみ参照し、BR-21等の事業意味、IPA値、旧閾値/CI/runtimeは本親へ移植しない。

| AC | 主CASE定義（index除外） | index CASE（参照行。fixture数ではない） |
|---|---|---|
| `AC-HARNESS-L3-036-01` | `CASE-HARNESS-L10-036-r04-all-environments-overreach`, `CASE-HARNESS-L10-036-r05-dependency-leak-finding`, `CASE-HARNESS-L10-036-r05-dependency-leak-unobserved`, `CASE-HARNESS-L10-036-r05-contract-leak-finding`, `CASE-HARNESS-L10-036-r05-contract-leak-unobserved`, `CASE-HARNESS-L10-036-r05-connection-missing-finding`, `CASE-HARNESS-L10-036-r05-connection-missing-unobserved`, `CASE-HARNESS-L10-036-r05-regression-finding`, `CASE-HARNESS-L10-036-r05-regression-unobserved`, `CASE-HARNESS-L10-036-r05-root-gap`, `CASE-HARNESS-L10-036-r05-root-overlap`, `CASE-HARNESS-L10-036-r05-root-population-unknown`, `CASE-HARNESS-L10-036-r11-w-selected-scope-normal`, `CASE-HARNESS-L10-036-r11-cross-detection-complete-zero-normal`, `CASE-HARNESS-L10-036-r11-operational-kpi-window-population-normal` | `CASE-HARNESS-L10-036-01`, `CASE-HARNESS-L10-036-04`, `CASE-HARNESS-L10-036-r04-036-dependency-leak`, `CASE-HARNESS-L10-036-r04-036-contract-leak`, `CASE-HARNESS-L10-036-r04-036-connection-missing`, `CASE-HARNESS-L10-036-r04-036-regression` |
| `AC-HARNESS-L3-036-02` | `CASE-HARNESS-L10-036-08`, `CASE-HARNESS-L10-036-root-05-field-01`, `CASE-HARNESS-L10-036-root-05-field-02`, `CASE-HARNESS-L10-036-root-05-field-03`, `CASE-HARNESS-L10-036-root-05-field-04`, `CASE-HARNESS-L10-036-root-05-field-05`, `CASE-HARNESS-L10-036-root-05-editor-failure`, `CASE-HARNESS-L10-036-root-05-reevaluation`, `CASE-HARNESS-L10-036-root-05-field-02-mismatch`, `CASE-HARNESS-L10-036-root-05-field-03-mismatch`, `CASE-HARNESS-L10-036-root-05-field-04-mismatch`, `CASE-HARNESS-L10-036-root-05-field-05-mismatch`, `CASE-HARNESS-L10-036-r05-result-mismatch`, `CASE-HARNESS-L10-036-r18-settings-mismatch`, `CASE-HARNESS-L10-036-r11-local-ci-full-contract-parity-normal` | `CASE-HARNESS-L10-036-02`, `CASE-HARNESS-L10-036-05`, `CASE-HARNESS-L10-036-r04-036-result-mismatch` |
| `AC-HARNESS-L3-036-03` | `CASE-HARNESS-L10-036-r06-axis-mock-promotion-unobserved`, `CASE-HARNESS-L10-036-r06-axis-design-token-drift-unobserved`, `CASE-HARNESS-L10-036-r06-axis-a11y-regression-unobserved`, `CASE-HARNESS-L10-036-r06-axis-visual-regression-unobserved`, `CASE-HARNESS-L10-036-r06-axis-state-transition-drift-unobserved`, `CASE-HARNESS-L10-036-r07-legacy-drive-field-absent`, `CASE-HARNESS-L10-036-r07-screen-applicability-unknown`, `CASE-HARNESS-L10-036-r07-added-screen-matrix-stale`, `CASE-HARNESS-L10-036-r07-non-screen-poc-misclassified`, `CASE-HARNESS-L10-036-r08-screen-agreement-record-missing`, `CASE-HARNESS-L10-036-r09-001`, `CASE-HARNESS-L10-036-r09-002`, `CASE-HARNESS-L10-036-r09-003`, `CASE-HARNESS-L10-036-r09-004`, `CASE-HARNESS-L10-036-r09-005`, `CASE-HARNESS-L10-036-r09-006`, `CASE-HARNESS-L10-036-r09-007`, `CASE-HARNESS-L10-036-r09-008`, `CASE-HARNESS-L10-036-r09-009`, `CASE-HARNESS-L10-036-r09-010`, `CASE-HARNESS-L10-036-r09-011`, `CASE-HARNESS-L10-036-r18-input-unknown`, `CASE-HARNESS-L10-036-r18-schema-unknown`, `CASE-HARNESS-L10-036-r11-screen-five-axis-pass-normal` | `CASE-HARNESS-L10-036-03`, `CASE-HARNESS-L10-036-06`, `CASE-HARNESS-L10-036-07` |
| `AC-HARNESS-L3-036-04` | `CASE-HARNESS-L10-036-12`, `CASE-HARNESS-L10-036-13`, `CASE-HARNESS-L10-036-14`, `CASE-HARNESS-L10-036-15`, `CASE-HARNESS-L10-036-16`, `CASE-HARNESS-L10-036-17`, `CASE-HARNESS-L10-036-18`, `CASE-HARNESS-L10-036-19`, `CASE-HARNESS-L10-036-20`, `CASE-HARNESS-L10-036-21`, `CASE-HARNESS-L10-036-22`, `CASE-HARNESS-L10-036-23`, `CASE-HARNESS-L10-036-r02-fe-oracle-unknown`, `CASE-HARNESS-L10-036-r02-unseen-normal`, `CASE-HARNESS-L10-036-root-r02-unseen-parity`, `CASE-HARNESS-L10-036-root-r02-unseen-unobserved`, `CASE-HARNESS-L10-036-r09-013`, `CASE-HARNESS-L10-036-r09-012`, `CASE-HARNESS-L10-036-r10-unselected-upper-test-not-run`, `CASE-HARNESS-L10-036-r10-selected-test-omission-reason-missing`, `CASE-HARNESS-L10-036-r10-selected-test-recovery-ticket-missing` | `CASE-HARNESS-L10-036-09`, `CASE-HARNESS-L10-036-10`, `CASE-HARNESS-L10-036-11`, `CASE-HARNESS-L10-036-r02x-nonapp-adjudicator`, `CASE-HARNESS-L10-036-r02x-nonapp-reason`, `CASE-HARNESS-L10-036-r02x-nonapp-revision`, `CASE-HARNESS-L10-036-r02x-nonapp-head`, `CASE-HARNESS-L10-036-r02x-nonapp-reevaluation` |

## Stage 3 親038

### 固定対象revisionの登録参照

| L2親 | metadata identity / semantic digest | 固定L2 source | 固定L11 semantic digest |
|---|---|---|---|
| `HARNESS-L2-038` | `MPR-RC-HARNESS-L2-038-001` / `dd5b5450801617bbd6cc1dfd2e522420399ec58fb7675a286221dd0d9415767c` | `318ec4a（固定L2/L11採択source）` | `dfa3b4c245af3987ee7738cc4a3aa758bb8f113b9d06079362d978ff63731297` |

### L3機能要件と受入条件

| 親 / FR | 要求と境界 | ACと判定条件 |
|---|---|---|
| `HARNESS-L2-038` / `FR-HARNESS-L3-038` | 明示選択されたsource/Full Reverse scopeに限りcapabilityと該当requirement/basic design/test/detector-gate endpointをsource identity/revision/oracleへ双方向traceする。未作成endpointは将来必須artifactとせず未完義務として保持する。全旧source一括走査、外部data取得、snapshot/watermark/entity mappingを追加しない。 | `AC-HARNESS-L3-038-01`: 選択scopeのsource根拠・観測契約・as-is設計/test・意図検証・差分/routing endpointを両方向から辿り、manifestのID集合と件数を照合する。unsupported/unknown capabilityをzero件や対象外に読み替えず閉包を未完とする。同じsource typeの未見fieldも固定契約と意味oracleが適合し根拠spanを返せる範囲では受け入れる。`AC-HARNESS-L3-038-02`: 片edge、aggregate-only、同digest複製、根拠なしN/A/no-finding、placeholderだけを完了根拠とする変異を個別に試し未完/unknownを返す。source根拠の未観測・不足はunknownとして選択sourceを再観測へ戻す。`AC-HARNESS-L3-038-03`: 後段未作成を未完義務として保持する。後段artifactが未作成であることだけを理由に初期観測を不合格にしない。checkpoint/budget停止を完了・却下へ読み替えず、残義務を分母から除外しない。 |

### 旧source・paired consumerと処置

| 現行親 | 旧起点（asset／path／行／file SHA） | 項目別処置・paired test consumer |
|---|---|---|
| 038 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:112,125` HIL-FR-22/35, SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`; `LEGACY-ASSET-AFE91778057B7E76BEEC` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:62` HOT-HIL-35, SHA `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576` | selected scope双方向closureとHIL-FR-35の段階意味を再導出。R0-R4 schema・全旧source gateは置換。HAT-HIL-09はHAT本文41行の`HR-FR-HIL-09`であり038の直接consumerではない。038の旧paired consumerはHST-HIL-011（`docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md:38`, full SHA `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705`）およびHST-HIL-018（同path:45、同SHA）である。HAT-HIL-09は直接対応として流用しない。 |

### 段階内容と原因別の既存戻し先

| 親 | 追加で明示する通常条件 | 独立に不成立とする条件・既存戻し先 |
|---|---|---|
| `HARNESS-L2-038` | selected manifest内の全capabilityについて、一意ID・件数・identityがsourceと一致することを確認する。完了claimの対象範囲では、(1) source根拠/scope map、(2) observation contract、(3) as-is design/test、(4) intent仮説と既存authorityによるPO検証状態、(5) gapとowner/routingの内容依存を保ち、source atomから該当endpointまで双方向にたどる。初期観測・要求形成では(3)以降を未完として示し、将来義務を保持する。 | unsupported/unknown capability、集合の欠落・余剰・重複・identity不一致は完了claimを止める。段階を飛ばす、順序を偽る、仮説をPO検証済みとする、残gap/owner/routingなしに完了claimする変異を拒否する。claimした段階に該当する内容だけを求め、budget/checkpoint停止も未完義務を保持する。source span/scope不足はunknownとして選択sourceを再観測へ戻す。要求形成はHARNESS-L2-008/024、trace/impact欠落はHARNESS-L2-003/004、designは014/028、oracleは004/022、必要な上流判断は既存authority ownerへ返す。 |

### ACから既存CASEへの参照

| 親 | AC | CASE参照 |
|---|---|---|
| 038 | `AC-HARNESS-L3-038-01` | `CASE-HARNESS-L10-038-01`, `CASE-HARNESS-L10-038-04`, `CASE-HARNESS-L10-038-r04-038-manifest-set`, `CASE-HARNESS-L10-038-r05-manifest-remove`, `CASE-HARNESS-L10-038-r05-manifest-add`, `CASE-HARNESS-L10-038-r05-manifest-duplicate`, `CASE-HARNESS-L10-038-r05-manifest-identity`, `CASE-HARNESS-L10-038-r05-root-requirement-forward-edge`, `CASE-HARNESS-L10-038-r05-root-requirement-reverse-edge`, `CASE-HARNESS-L10-038-r05-root-design-forward-edge`, `CASE-HARNESS-L10-038-r05-root-design-reverse-edge`, `CASE-HARNESS-L10-038-r05-root-test-forward-edge`, `CASE-HARNESS-L10-038-r05-root-test-reverse-edge`, `CASE-HARNESS-L10-038-r05-root-detector-gate-forward-edge`, `CASE-HARNESS-L10-038-r05-root-detector-gate-reverse-edge`, `CASE-HARNESS-L10-038-r05-root-capability-unsupported`, `CASE-HARNESS-L10-038-r05-root-capability-unknown`, `CASE-HARNESS-L10-038-r06-unseen-field-supported`, `CASE-HARNESS-L10-038-r09-011`, `CASE-HARNESS-L10-038-r09-018`, `CASE-HARNESS-L10-038-r09-019` |
| 038 | `AC-HARNESS-L3-038-02` | `CASE-HARNESS-L10-038-02`, `CASE-HARNESS-L10-038-r04-placeholder-only`, `CASE-HARNESS-L10-038-r05-root-one-edge`, `CASE-HARNESS-L10-038-r05-root-aggregate-only`, `CASE-HARNESS-L10-038-r05-root-digest-copy`, `CASE-HARNESS-L10-038-r05-root-no-finding-unbound`, `CASE-HARNESS-L10-038-r05-root-na-unreasoned` |
| 038 | `AC-HARNESS-L3-038-03` | `CASE-HARNESS-L10-038-03`, `CASE-HARNESS-L10-038-r04-later-artifact-not-created`, `CASE-HARNESS-L10-038-r09-006`, `CASE-HARNESS-L10-038-r11-checkpoint-incomplete-closed` |
| 038 | `AC-HARNESS-L3-038-04` | `CASE-HARNESS-L10-038-06`, `CASE-HARNESS-L10-038-07`, `CASE-HARNESS-L10-038-08`, `CASE-HARNESS-L10-038-09`, `CASE-HARNESS-L10-038-10`, `CASE-HARNESS-L10-038-11`, `CASE-HARNESS-L10-038-12`, `CASE-HARNESS-L10-038-13`, `CASE-HARNESS-L10-038-14`, `CASE-HARNESS-L10-038-15`, `CASE-HARNESS-L10-038-16`, `CASE-HARNESS-L10-038-17`, `CASE-HARNESS-L10-038-r09-012`, `CASE-HARNESS-L10-038-r11-reject-without-basis`, `CASE-HARNESS-L10-038-r11-absorb-without-target`, `CASE-HARNESS-L10-038-r11-unknown-as-adopted`, `CASE-HARNESS-L10-038-r11-redesign-as-approved`, `CASE-HARNESS-L10-038-r11-shared-oracle-normal`, `CASE-HARNESS-L10-038-r17-reinforced-adoption`, `CASE-HARNESS-L10-038-r17-false-rejection`, `CASE-HARNESS-L10-038-r17-reject-without-authority` |
| 038 | `AC-HARNESS-L3-038-05` | `CASE-HARNESS-L10-038-r09-013`, `CASE-HARNESS-L10-038-05`, `CASE-HARNESS-L10-038-r09-014`, `CASE-HARNESS-L10-038-r09-001`, `CASE-HARNESS-L10-038-r09-002`, `CASE-HARNESS-L10-038-r09-003`, `CASE-HARNESS-L10-038-r09-004`, `CASE-HARNESS-L10-038-r09-005`, `CASE-HARNESS-L10-038-r09-007`, `CASE-HARNESS-L10-038-r09-008`, `CASE-HARNESS-L10-038-r09-009`, `CASE-HARNESS-L10-038-r09-010`, `CASE-HARNESS-L10-038-r09-015`, `CASE-HARNESS-L10-038-r09-016`, `CASE-HARNESS-L10-038-r09-017`, `CASE-HARNESS-L10-038-r11-heading-stage-skip`, `CASE-HARNESS-L10-038-r11-as-is-before-observation-contract` |

### 段階別判定補足

| 親 | AC | 判定条件 |
|---|---|---|
| 038 | `AC-HARNESS-L3-038-04` | capabilityごとに既存義務への採用、強化、再設計候補、根拠とauthority付き却下/対象外、吸収先付き吸収、未決/unknownを区別する。空coverage、本文貼付をtraceとすること、複数能力への根拠ない複製、後段を前段から推定することを別々に拒否する。共有oracleの再利用自体は拒否理由にしない。 |
| 038 | `AC-HARNESS-L3-038-05` | 固定L11-038:612の5段階（source/scope map、observation contract、as-is design/test、intent/PO状態、gap/owner/routing）を順序とclaim scope付きで照合し、未claim後段は未完義務に保つ。各段階の主張はその段階に必要な内容だけを要求し、後段成果を初期観測/要求形成の前提にしない。 |


## Stage 3 親039 — Experience/UI/Frontend契約候補

### 固定対象・登録状態

| 固定L2親 | 登録識別子 | 固定L2/L11 source | 採択状態 |
|---|---|---|---|
| `HARNESS-L2-039` | `MPR-RC-HARNESS-L2-039-003` / candidate semantic digest `e2a71f7961a3e8c7c241c7d1ef3238382d5d709296db2fb7e57a9dd0cd9215a0` | `318ec4a`。L2 `product-requirements.md:891–929`、L11 `product-acceptance.md:638–676`。L11 semantic digest `63177feef3ec82d4e0a4bb5a56c7cfefdbe3666f0eb18f0a5d2934cfd1211746`。 | PO decision `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:44` はこの003と両固定digestの組を採択している。`version_target: 1.0`は保持する。現register後継004は同一semantic/source atom setのlocator-only更新（`authority_effect: none`）であり、採択状態を取り消さない。本文は採択済みL2/L11の意味を要件化するが、L3本文から実装許可・実行結果・下流完了を生成しない。 |

### 機能要件と受入条件

| FR / AC | 要件と判定条件 |
|---|---|
| `FR-HARNESS-L3-039` / `AC-HARNESS-L3-039-01` | 同一対象scope/revisionで、要求原子からUser Task、Business Outcome、scenario/context、success result、decision rationaleへの意味関係を保つ。UI/Frontend関係を持たないscopeでもExperience graphは維持し、意味のないfield貼付をrelation成立としない。要求意味が不足する場合はHARNESS-L2-008、質問・screen applicability・prototype agreementはHARNESS-L2-024の既存境界へ返す。 |
| `FR-HARNESS-L3-039` / `AC-HARNESS-L3-039-02` | 画面を持つ選択scopeでは、選択されたscreen/flow/interaction/action/state/component/token/contentとpermission/actor、command/API、data/state owner、不変条件、domain/analytics event、logging/error、設計・検証・受入oracleを同一scope/revisionで意味的に結ぶ。`implemented`は既存V-pairの実装・検証relation、`ux_verified`はその状態を主張するoperationに必要なL10–L12 evidenceとhuman evaluationとして分ける。非UI scopeは既存の根拠付きN/Aと再評価条件を保持し、必要証拠が空集合でも`ux_verified`を生成しない。候補形成・設計開始は未来のUX測定を前提にしない。 |
| `FR-HARNESS-L3-039` / `AC-HARNESS-L3-039-03` | 適用されたsource identity/revision/scope、prototypeと要求、design token/componentと描画実体、interactionとE2E、content/analytics成功条件、accessibility/responsive/motionのdriftを示す。変更影響はAffected/Unaffected/Unknownを分け、UnknownをUnaffectedへ変えない。risk根拠に応じて検証factorを選び、選外理由を残す。全組合せまたは全device機種の実行を一律要求しない。 |
| `FR-HARNESS-L3-039` / `AC-HARNESS-L3-039-04` | Discovery PoC、AI推奨、prototype agreement、未回答、時間経過は仮説・観測・提案として保持し、vision/brand/priority/prototype agreement/L3要求freeze/L11 acceptance/L12改善採否を自己承認しない。candidateの作成・比較は既存008/024の根拠・scope・状態のもとで可能だが、candidateの存在をadoption/authorityへ変換しない。PoCから`implemented`、`ux_verified`、production-readyを推定しない。 |
| `FR-HARNESS-L3-039` / `AC-HARNESS-L3-039-05` | 選択Full V/Scrum UI scopeのprototype agreement、screen ledger/profile、frontend binding、mission/oracle、UX evidence、change delta等は該当時に既存V-pairの層・receipt・owner・戻し先へ結び、未作成後段義務を保持する。後段証拠やreview/release合流は039候補の開始条件ではない。旧S0–S4/SR0–SR4を新工程、freeze、承認gateとして復元しない。 |

### 既存ownerへの原因別返却

要求意味・候補と採否境界はHARNESS-L2-008/024、screen applicability/prototype agreementは024、unit design relationは026、composite relationは025、risk別verification dutyは005、段階oracle/evidenceは022へ戻す。選択sourceの互換性・意味は固定sourceで識別できる選択ownerへ返し、個別identityを特定できないときはそのidentityをunknownのままにする。実行・ticket・結果記録は既存OS/利用者の責務、必要な情報配送はCONNECT、実測後の評価/改善提案はLABOの既存契約に従う。責務区分を新設せず、欠落原因を一つのgeneric ownerへまとめない。

### 旧資産からの再導出と差分

| 項目 | 旧source起点 | 処置 |
|---|---|---|
| Experience/UI/Frontend、backfill、PoC境界 | `LEGACY-ASSET-02319C2481B9E01698D5`; `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`; §4.5:265–277 | Experience、UI、Frontendの意味上のrelation、Full V/Scrum適用時のbackfill、PoC/状態差と非自己承認を固定L2/L11の現scopeへ再導出。旧211 inventory、旧ID/field/schema、runtime、旧工程名は移植しない。 |
| six DHR requirements | 同source §4.9:385–392 (`HR-FR-DHR-001–006`) | identity trace、UI適用性、screen-to-acceptance、risk-based pairwise、drift、Experience親graphを意味再導出する。旧schemaと実装方式は参照専用。 |
| paired consumers | `L3-infinity-loop-acceptance-test-design.md:41` HAT-HIL-09、および`:47` HAT-HIL-15; `L9-infinity-loop-platform-system-test-design.md:38–39,45,51` HST-HIL-011/012/018/024 | HAT-HIL-15とHST-HIL-012/024のscreen applicability/prototype walkthroughを関連consumerとして読み、旧consumer名・工程・実装結果を現行authorityへ昇格しない。HAT-HIL-09/HST-HIL-011/018のsource/reverse closureは関連資料であり、039のUX意味を単独で証明する直接対応とは扱わない。 |

旧sourceは保持するが、旧screen manifest・runtime/schema・固定工程を再利用しない。固定L2/L11-039の採択はPO decision行44に従い、`version_target: 1.0`を保持する。現L3差分は採択済み意味を変更せず、明示した受入・責務境界へ再導出する。

## Stage 3 親040の機能要件

固定親は318ec4aのL2:946–955/L11:689–697、PO57の45行MPR040002採択。旧HIL-FR-46/47と旧L3 FR040を起点に意味を再導出する。catalog契約はHARNESS、保存・snapshot/projection・ticket運転は既存OS契約に属する。025/026の完了を開始前提にしない。

| FR / AC | 要件と判定条件 |
|---|---|
| `FR-HARNESS-L3-040` / `AC-HARNESS-L3-040-01` | 同じ対象revisionでcanonical L1–L12のledger契約と6 canonical pairを列挙する。L0 charterはidentity・対象revision・sourceを持つ独立した層外authority anchor recordとし、layerや7番目pairにしない。一層・一組の欠落を残る層/pair/anchorで相殺しない。 |
| `FR-HARNESS-L3-040` / `AC-HARNESS-L3-040-02` | 各rowのstable subject ID、row revision、source span、semantic digest、status、owner、上流/下流edgeを同revisionで逆引きする。片方向edge、別revisionの混在、field不足やstaleを該当範囲の未完として示す。 |
| `FR-HARNESS-L3-040` / `AC-HARNESS-L3-040-03` | 未提示契約やunknownなauthority/scope/互換版を存在済みや対象外にせず未評価で保持する。契約不足はHARNESS L1/L2契約owner、authority不足は該当authority ownerへ返す。authority ownerをL0に限定しない。個別identityが不明でも既知の責務区分を保持する。catalogからL1承認/L2合意/L3承認/OS登録・実行/completionを生成しない。OS receipt不足は既存OS保存・実行ownerへ返し、HARNESS契約oracleを代用しない。HARNESS-L2-025/026の完了receiptは040評価の開始前提ではなく、040の候補採否や実装完了を生成する根拠にもならない。 |
| `FR-HARNESS-L3-040` / `AC-HARNESS-L3-040-04` | 対象revisionの有効契約からledger type・粒度・必須node/edge・authority参照・input/output・entry/exit gate・適用template版の項目集合を導き、layer snapshotとcoverageの全件・未完・staleを区別する。根拠のない固定件数を課さない。未見layer/template revisionの変更がcatalog/coverageに現れない範囲はstale/uncoveredとしてHARNESS L1/L2契約ownerへ返す。 |

## Stage 3 親042の機能要件候補

### FR-HARNESS-L3-042 — Design Refactor判定とepisode分離

**対象とauthority**：HARNESS-L2-042はPO採択済み（`MPR-RC-HARNESS-L2-042-001`）。本L3本文はその採択scopeを要件へ具体化する候補で、L3承認前である。親L1はHARNESS-L1-003/004/005/007、version_targetは親に固定された1.0を継承する。要求意味、scope、担当、版を変更しない。

**由来と処置**：旧requirements v1.3 §4.2 L119（`REQSRC-SUP-00089`）、同内容のbaseline `V13-BASE-6FAB-L0104`、旧L3 042/AC表とそのpaired consumerを起点にする。保持するのはDesign Refactorで意味・consumer・oracle・dependency graphを比較すること、名称だけで統合しないこと、変更前後の要求/契約/振舞いを保持すること、機能追加episodeの分離、対象scope/revisionの限定。Performance Refactorのbaseline/budget/workload/profile/statistical condition/regression oracleは採択済みHARNESS-L2-016に委譲し、この要件に複製しない。旧runtime/schema/workflowや数値閾値は移植しない。旧36 CASEの各literalとraw digestはこの候補監査source inventoryへ保持し、本文では意味を再導出する。名前一致だけの完全再利用とは扱わない。

**入力・出力**：対象artifact/revision/scope、対応設計・契約・要求、変更前後のsemantic relation、影響consumerと依存graph、既存oracle、機能追加有無を受け取る。入力元の版・適用範囲も固定する。scope/revision単位で、比較根拠、維持する契約、Design Refactorの可否と理由、拒否/Backflow、別episode化すべきfeature changeを出力する。

**受入基準**：

- **AC-HARNESS-L3-042-01**：同じscope/revisionに限り、既存の振舞い・公開契約・要求・persistent state意味をHARNESS-L2-016の保存oracleで照合し、対の設計または契約がない対象はHARNESS-L2-019 reverse入口へ返す。
- **AC-HARNESS-L3-042-02**：Design Refactorの統合判断にはsemantic similarity、関連consumer、oracle、dependency graphを用い、名称/ticketの一致だけで判定しない。各根拠のmissing/stale/unknownは個別にunknown/未評価とし、他根拠で相殺しない。
- **AC-HARNESS-L3-042-03**：Design Refactor/Performance Refactorと機能追加を同一episodeに混載しない。feature changeは別episodeに分離し、意味変更が判明した場合のみ既存のHARNESS-L2-003/004/016 Backflowへ返す。性能条件・測定不能・regressionはHARNESS-L2-016と対L11のoracleを使い、新しい数値閾値を設けない。
- **AC-HARNESS-L3-042-04**：結果を対象scope/revisionに限定し、別scope/revision、実行結果、要求採択、L3承認、実装、受入へ外挿しない。入力不足はその入力元ownerへ返す。L2-019は対の設計または契約がない対象のreverse入口とする。

**依存境界**：常時必要＝対象revision/scope、対の設計/契約/要求、既存oracle、HARNESS-L2-016の保存/Backflow契約。Design Refactor候補で選択した設計/consumer/graph sourceだけ版・scopeに応じ必要。Performance Refactorを実際に選ぶ場合のみ016の測定入力と対L11を使う。SR3 finding処理時のみL2-002/003 routeを使う。旧workflow/runtime、類似名称だけの候補、未選択改善案は参照資料に限る。

**不成立と戻し先**：semantic similarity、consumer、oracle、graphの未確認は未評価に保ち、出典ownerと設計・契約ownerへ不足を戻す。対の設計または契約がない対象はL2-019 reverse入口へ。公開契約/要求/persistent-state意味変更は該当するL2-003/004/016 Backflow。機能追加混載はepisode成立を拒否しfeatureを別episodeへ分離。missing/unknown/stale/conflictは補完せず未評価。文書、CASE、receipt、ticketからauthority、実行、採択、L3承認または受入を生成しない。

**L2-019境界**：019は逆向きに対の設計または契約の不在を明らかにする入口であり、全入力不足や責務不明を無差別に送る汎用戻し先ではない。入力不足はその入力を提供する元ownerへ戻す。019 reverseの結果も本要件のscopeを拡張しない。


## Stage 3 親041 — active template obligation extraction候補

### 固定親とlegacy起点

本suffixの現行PO authorityは、`docs/governance/decisions/po-decision-2026-09-29-11candidates.md:27`のHARNESS-L2-041採択 `MPR-RC-HARNESS-L2-041-003`である（判断記録blobを含むcommit `6b5de065c8bdf38b2ccf06d82bf2581824742e67`、decision file SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`、line 27 raw SHA-256 `3a8ce36e3ff309ba7a635a5f9b9469fd6cdbfe1da8e26d7a64ca4ab3fcf28a17`)。採択対象の固定内容は記録用main `5aa100319361b0cc86edd3c51815ec777d55410a`（full commit）にあり、L2 file SHA-256 `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108`、L2節digest `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`、L11 file SHA-256 `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7`、L11節digest `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b`、coverage receipt r3で固定する。L2節は`product-requirements.md:957–968`、L11節は`product-acceptance.md:699–714`。PO decisionはCORE単体・`version_target: 1.0`・既存scopeを維持し、追加されたL11 oracleを含むexact pairを採択している。

旧HELIX source起点は `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:136–137`（HIL-FR-46/47、full SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）。HIL-FR-46のlayer/ledger contract fieldとrow identity/source/digest/owner/edgeは041の抽出入力・候補照合元として意味再導出し、ledger contract ownerを041へ移さない。HIL-FR-47のchapter/field/row/rule/done-when/pair-contract atom、source digest、empty/TBD/unhandled/extractor-failure/duplicate finding、free completion禁止は意味を保持して再導出する。旧registry writeは候補出力へ変更し、実登録・採択・保存・snapshot・ticket executionは現行固定L2/L11のHARNESS/OS境界へ置換する。

旧HELIX L3定義は `LEGACY-ASSET-9A772391C7FB1298D45F` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`（SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）および `LEGACY-ASSET-C7F0C3B79CBAA72960BF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:51–53,72,80–82`（SHA-256 `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`）を読み、L3 functional requirement→AC→対verification traceの形とHIL-FR-18/HAC-HIL-18a/b/cのledger/atom/gap relationだけを再導出する。G3/G12 authority、old runtime/CLI、legacy layer numbering、旧5-pair・transaction/write方式は現行要件へ移さない。

前の現行L3草稿 `3fd20391f842310012d09c33f5383497898b3afe:docs/helix-harness/L3-requirements/functional-requirements.md:580` と旧L10 CASE literal inventory（同revision `functional-verification.md` full SHA-256 `94704ba448b00df43651ca1dfa01835472132ce3023d829ea5bb690926fa3f02`）を起点とする。input selection/scope、obligation atom/gap、digest/atomicityは保持・再導出する。旧38 CASE IDは保持し、MPR-RC-HARNESS-L2-041-002の採択は旧判断履歴として残す。後続decisionの-003は同じL2節digestを持つ一方、L11節に原子的obligation拒否と同一入力・同一extractor/versionの再抽出digest不一致という追加oracleを含む最新採択pairであり、本起草では-003の追加oracleをAC-03と既存の対応CASEへ反映する。これは別scopeの追加やversion_target変更ではない。r05の誤routeだけを現行入力/出力責務に合わせて改訂し、元literal/hashを時点inventoryへ残す。

### `FR-HARNESS-L3-041` — active templateからobligation候補を抽出しgapを示す

FR/ACと対のL10候補CASEは`functional-verification.md`に同じAC IDで置く。旧L3↔L12 pair/freezeは現行L3/L10へ置換し、承認やrelease gateを生成しない。

**入力**：固定HARNESS-L1 revision、HARNESS-L2-009で選択・適用されたtemplate identity/revision/applicability、対象layer/要求kind/scopeとsource span、対応する040相当ledger contract revision、extractor identity/version。これらの責務区分は個別owner identity不明で消さず、ownerが特定できない場合だけindividual identityをunknownとして保持する。

**出力**：各source obligationをsource span、template revision、applicability branch、obligation種別、semantic digest、extractor/version digest付きのatomまたは理由付きtyped gapへ対応付けた候補行とfinding。candidate rowは正本ledgerへの登録・採択を意味しない。

| AC ID | 受入条件 |
|---|---|
| `AC-HARNESS-L3-041-01` 入力選択と適用scope | 指定active template identity/revision・applicability・target scope・source inputが確定する範囲で抽出対象を評価する。入力template selection/applicability/scope/sourceがmissing/unknown/conflict/staleなら成功扱いにせず未評価へ保ち、HARNESS-L2-009または該当template ownerへ戻す。個別owner ID不明でも既知のtemplate/input責務をunknownで消さない。未選択templateの内容を選択結果から外挿しない。 |
| `AC-HARNESS-L3-041-02` obligation dispositionとgap | 各対象source obligationはatomまたは理由付きtyped gapへ個別対応する。empty/TBD等、template sourceの内容・必要inputの意味が不足するgapは値を補完せず、HARNESS-L2-009または対象template ownerへ戻す。template選択・active revision・適用scope/branch・必要要求inputの意味または適用性がmissing/unknown/conflict/staleなら抽出結果を確定せずAC-01の入力側routeに従う。これら入力がHARNESS-L2-009で確定した後に、抽出不能、未対応branch/obligation、source span/provenance欠落、重複、split/merge、自由補完が出力側で生じた場合はHARNESS-L2-041 HARNESS-CORE extraction-contract ownerへ戻し、scope/該当義務を未完に保つ。ledger contract incompatibilityは既存040相当contract ownerへ戻す。戻し先の個体owner identityがunknownでも、ここに示した既知の責務区分をunknownで置換しない。 必須要素の欠落、empty/TBD、ledger contract incompatibilityを含む版不一致、または出力側gap/errorは、原因別の戻し先を保ったままscopeと該当義務を未完に保ち、scope完了claimを拒否する。 LLM自由補完、隠れた欠落、aggregate parentだけのcovered claimを拒否する。 |
| `AC-HARNESS-L3-041-03` atomicityと出力provenance | obligation split/merge、source span/revision/applicability/digest/extractor versionと実抽出inputの不一致を照合する。異なる二つのobligationは、それぞれのsource spanに対応する個別atomで出力し、一つの複合atomへまとめた結果は原子性不一致として拒否しscopeを未解決に保つ。さらに同一active template bytes/revision、scope、applicability input、extractor identity/versionを固定して独立に再抽出した結果を比較し、semantic digestが異なる場合は非決定的抽出findingとしてscopeを未解決に保つ。同一digestはこの固定input/scopeに限る比較結果であり、他scopeや抽出器一般の決定性へ外挿しない。入力の選択・適用性が有効なまま抽出出力のsource revision/span/provenanceだけが欠ける・違う場合はHARNESS-L2-041抽出契約ownerへ戻す。入力選択/applicability自体がunknownなら009へ、ledger contract incompatibilityなら040相当contract ownerへ戻す。個体owner unknownでもknown responsibility classは維持する。 |
| `AC-HARNESS-L3-041-04` 非権威性と責務境界 | atom/gap/candidate rowからtemplate authority、canonical ledger registration/adoption、requirement agreement、design success、user acceptance、L3 approval、implementation completionを生成しない。OS registration/save/snapshot-projection/ticket-executionは別OS契約とreceiptに属し、候補出力から発生済みにしない。HARNESSが生成した誤ったauthority/status claimは041抽出契約ownerへ戻し、実OS receiptの不足は既存OS owner区分へ戻す。owner個体identity不明はunknownのまま残し責務区分を捨てない。 |
| `AC-HARNESS-L3-041-05` 025/026との境界 | L2-025/026の具体設計・pair oracle完了を041抽出の開始前提にしない。025/026 receiptで041抽出結果を代替・生成せず、041の候補出力から025/026設計/inspection結果を生成しない。041のinput contract内で得た結果に限る。 |

### 旧source・責務境界の項目別処置

| 項目 | 旧source / 保持点 | 処置・変更理由 |
|---|---|---|
| ledger contractとrow provenance | HIL-FR-46 | ledger type/粒度/node-edge/authority/input-output/gate/template版、row identity/revision/source/digest/status/owner/edgeは照合対象として再導出。041をregistry writerやcatalog authorityにしないのは固定L2-041/040のownership境界。 |
| template atomic obligations / gap | HIL-FR-47、HIL-FR-18 | atom種類、gap可視化、empty/TBD/failure/duplicate、自由補完禁止を再導出。legacy候補行のdirect ledger append/実行を現行候補＋別OS operationへ置換。 |
| L3/AC→対verification | legacy L3 README・HR-FR-HIL-18/HAC-HIL-18 | requirement/AC/verification traceを部分再利用。G3 freeze、L12 production acceptance代替、旧CLI/hard gateは移植しない。 |
| 直前L3草稿とCASE | `3fd20391...` L3 FR-041/L10-041 | input/scope, atom/gap, atomicity/digestを再導出、38旧IDを維持。旧r05の出力source revision mismatch→009誤routeを、入力selectionと041出力provenance mismatchの差に基づき修正。旧raw row/SHAはこの草稿のsource inventoryへ保存。 |

## Stage 3 親041の業務要件

HARNESS-L2-041から独立business requirement、business owner、ROI/KPI/商業閾値は導出しない。template atom/gap/candidate rowの存在、coverage、fixture数から事業価値・利用者受入・要求合意・承認を作らない。技術的な抽出contractとbusiness outcomeを混同しない。

## Stage 3 親047の機能要件候補

### FR-HARNESS-L3-047 — 専門Workerの必要性判断とruntime-neutral契約生成

**Authority・版**：HARNESS-L2-047はPO決定 `MPR-RC-HARNESS-L2-047-001` により条件付き採択、HARNESSが契約生成規範を所有するA配置である。L2/L11本文内の旧candidate metadata「PO未決／未採択」と配置Bの比較案は時点記録として残すが、現行状態はPO row 52を読む。親L1はHARNESS-L1-001/002/004、version_targetは固定親の1.0を継承する。本L3本文は候補であり、L3承認は生成しない。

**旧根拠と再導出**：旧HIL-BR-09/30、HIL-FR-59/60（`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`のsource line 61/82/149/150）とHR-FR-HIL-21、HAT-HIL-21、HOT-HIL-52/53を起点とする。保持する意味はtask/process/verificationに結んだ契約生成、専門化の測定可能なtask benefit、既存role十分性の比較、worker/verifierと権限分離、最小context、生成guard、停止/中断の追跡である。旧runtime固有schemaやprovider定義、旧W-agent team数は移植しない。担当境界は現行L2-047に沿ってHARNESS/OS/SECURITY/INTELLIGENCE/LABOへ分ける。

**必要性判断**：対象task/ticket identity・scope・revision、適用HARNESS process/task-kind/verification contractとoracle、対象domain/risk、版付きjudgment pack、既存single-worker roleとの比較、該当task classで適用可能なLABO evidence、必要時のINTELLIGENCE proposal、OS assignment/budget/deadline/stop、SECURITY authority/isolation制約を入力する。専門知識・独立context・並列性・blind verificationのうち当該taskに関係する比較可能な利益が示されるときだけ`muster`候補を返す。既存roleが十分なら`existing_role_sufficient`とし、比較結果または適用範囲が不明なら`unknown_or_defer`とする。このdefer記録には、理由、比較対象（identity/scope/revision）、参照evidence（identity/revision/scopeと評価状態）、不確実性、差戻し先の既存責務区分をそれぞれ保持する。task/process/oracle不足はHARNESSまたは要求owner、task適性proposal不足はINTELLIGENCE、適用scope/evidence不足はLABO、assignment/profile/lifecycle不足はOS、authority/isolation不足はSECURITYへ原因別に返す。個体owner identityが不明でも既知の責務区分を保持し、個体identityだけ別にunknownとする。共通数値thresholdも固定Worker数も新設しない。provider/model名、価格、Bench値単独はmuster理由にしない。

**runtime-neutral契約生成**：必要性判断がmuster候補の場合のみ、適用process phase/task-kind/design obligation/domain/risk/judgment pack/承認済み要求・verification oracleのrevisionへtraceできる候補契約を生成する。objective、成果物schema、tool guidance、task boundary、context selector、allowed/denied tool/path候補、model/effort class、budget、checkpoint、escalation、verification contractとinput/output digest、generation rationale、guard validation resultを含める。同一正規化入力とgenerator revisionでは意味内容/digestが再現可能である。provider/runtime固有設定や固定provider/model/team sizeを要求しない。

**独立性と担当境界**：worker/verifierのidentity、context、authorityは別々の軸で分離し、それぞれ独立に確認する。provider/modelは属性として記録する。同じprovider/modelであることだけで独立性を否定せず、provider/modelが異なることだけでも独立性を成立させない。HARNESSは契約意味・必要性判断・生成検証条件を所有する。INTELLIGENCE placement proposalとLABO水準/evidenceは選択入力で、割当を決めない。OSはruntime profile適格性、assignment、実行state、budget/deadline、projection、lease/fencing/revocation/retireとlifecycle evidenceを所有する。SECURITYはoperation authorityとisolationを所有する。tool/path候補、contract、digest、guard receipt、generation receiptからOS assignment・起動・SECURITY許可を生成しない。

**入力不足の戻し先**：task/process/oracle不足はHARNESSまたは要求source owner、task aptitude proposal不足はINTELLIGENCE、LABO適用scope/evidence不足はLABO、runtime profile/assignment/budget/deadline/lease/fencing/lifecycle不足はOS、operation authority/isolation不足はSECURITYへ戻す。各不足は原因別に単独表示し、他ownerの入力で補完しない。個体owner identityの特定有無にかかわらず既知の責務区分へ返し、個体ownerが不明ならunknownとして別に記録する。

**不成立と停止**：根拠なしmuster、existing-role-sufficientの無視、同一identity/context/authorityでの自己検証、適格runtime/lifecycle不明下での起動候補、cross-assignment credential/state leakage、SECURITY権限のHARNESS生成を拒否する。中断/予算上限/期限到達ではpartial contract、未完義務、判断根拠、再開条件を保持しsuccessにしない。contract generation aloneからverification result、independent-review result、adoption、completionを個別に生成しない。これらの拒否は固定L2-047のscopeに限り、別のapproval制度を追加しない。

### 受入基準候補

**AC-HARNESS-L3-047-01 — taskに適用する必要性判断**：対象task/scope/revisionに適用可能なHARNESS process・task-kind・verification oracle、既存single-worker roleとの比較、選択したLABO evidenceの適用scopeを同じ判断へ結ぶ。taskに関係する比較可能な利益が示された場合だけ`muster`候補とし、既存roleで十分なら`existing_role_sufficient`とする。比較結果または適用範囲が不明な`unknown_or_defer`では、理由、比較対象のidentity/scope/revision、evidenceのidentity/revision/scope・評価状態、不確実性、差戻し先の既存責務区分を個別に記録する。差戻しはtask/process/oracle不足をHARNESSまたは要求owner、task適性proposal不足をINTELLIGENCE、scope/evidence不足をLABO、assignment/profile/lifecycle不足をOS、authority/isolation不足をSECURITYへ原因別に返す。個体identity不明は責務区分の返却と分けて記録する。共通数値threshold、固定Worker数、価格/provider/model/Bench単独の根拠は追加しない。判断候補はOS assignment、Worker起動、SECURITY許可を生成しない。またcontract/digest/guardの存在だけからverification executionまたはindependent-review結果を生成しない。

**AC-HARNESS-L3-047-02 — runtime-neutral contractとtrace**：必要性判断が`muster`候補の場合だけ契約候補を生成する。workflow phase、task-kind、design obligation、domain object、risk、judgment pack、承認済み要求、verification oracleの各identity/revisionを、選択時のsource値と適用scopeに一致させて個別にtraceする。選択domain object/judgment packの適用revisionも同じ条件で照合する。contract field、input/output digest、generation rationale、guard validation結果も相互に追跡可能にする。同一正規化inputと生成規則revisionから同じ意味内容/digestを再現する。必要なsourceが揃った正常入力では各trace値がそのsource identity/revision/scopeと一致する。いずれか一つのsource revision traceが欠落または不一致なら契約候補を未完/unknownとして拒否し、欠落を推測補完しない。

**AC-HARNESS-L3-047-03 — worker/verifier分離と機構間境界**：workerとverifierのidentity、context、authorityをそれぞれ独立に照合する。同一provider/modelであることだけでは独立性不成立とせず、provider/modelが異なることだけでも独立性成立としない。runtime profile、assignment、実行/lifecycle状態はOS、operation authorityとisolationはSECURITYの既存責務へ保ち、HARNESS候補contract、digest、guard receipt、generation receiptやproposal/evidenceからこれらを生成・代替しない。

**AC-HARNESS-L3-047-04 — 不足・中断の保持と状態非生成**：選択入力のmissing/unknown/conflict/stale、比較材料や適用範囲の不明、profile/lifecycle/authority不足は原因別に`unknown_or_defer`/未完を保持し、固定L2-047の既存ownerへ返す。中断・budget上限・期限到達時は判断根拠、partial contract、未完義務、再開条件を保持しsuccessにしない。contract生成だけからassignment、permission、Worker起動、adoption、completionを生成しない。新しい承認手続き・数値閾値・ownerは設けない。

## Stage 3 親046の機能要件候補

起草候補。Stage 3、`version_target: 1.0`。対象は採択済みHARNESS-L2-046のFull V workflow条件と、明示的にProduction Scrumが選択・許可されたscopeのScrum slice/backfill条件に限る。候補文書・検証fixtureは採択済みL2/L11本文や運転結果を置換せず、releaseやruntime authorityを付与しない。

**固定親とPO根拠**：親L2は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`の `docs/helix-harness/L2-requirements/product-requirements.md:1025–1035`（全file SHA-256 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、対象span SHA-256 `47cc23b066cc970427a8b9193eda3be9cc06a43f19b7cb03e6f78a0116d6e01e`）。対L11は同revisionの `docs/helix-harness/L11-acceptance/product-acceptance.md:759–771`（全file SHA-256 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、span SHA-256 `a8e99f7df7166566c04b1113b045851d8417e17e8078c034f8f2a34ebfe4f37f`）。PO判断は `17a2f310358ee7fe209b9d37cddf4a927c740248` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:51`、file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、row SHA-256 `60fb90a139b313760ad5a259e2362e3c406e071aa1dfba8ed6d21d0cb9fb55a4`。POは`HARNESS-L2-046`を採択し、registrationは`MPR-RC-HARNESS-L2-046-001`。隣接row 52の`HARNESS-L2-047`は046へ混ぜない。

**旧source・保持／変更**：旧起点はv1.3 `LEGACY-ASSET-02319C2481B9E01698D5`。§4.4 L259はFull Vのsystem workflow/L1–L5段階freezeと12 workflow条件の検証（atom S1）およびProduction Scrumのslice delta先行・Scrum Reverse/backfill時点・SR4前release-ready不可（独立atom S2）を別条件として記述する。§10 L647は両者を要約する別atomで、第三の独立条件に数えない。6fabd125 baselineの同文companionも別revisionとして保持する。旧consumerのUWJ-FR-015とL4 boundaryは確認範囲に限定し、consumer全体網羅は主張しない。 L259の2文を各別FRへ再導出し、L647は要約関係だけ記録する。POの4方式定義・合成許可は2026-09-25判断`docs/governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md:51,61`に従う。旧FullVとScrum条件を混ぜない。

**FR-HARNESS-L3-046 — 共通参照group**：CASE表にあるsuffixなしの`FR-HARNESS-L3-046`は、本節の`FR-HARNESS-L3-046-01`〜`-04`をまとめて参照するtraceability groupであり、独立した機能要求・oracle・scopeを追加しない。各CASEの意味と判定には個別のsuffix付きFRおよびACを用いる。

**FR-HARNESS-L3-046-01 — Full V system workflow**：入力でstyle=`Full V`と対象system workflow revisionを明示する。選択scopeで適用されるL1–L5の設計資産を段階的に明確化・freezeし、対応V-pairでsystem全体のtransition、loop、terminal、exception、permission、timeout、notification、audit、data、switching、routing、resource allocationの12条件を検証する。条件または適用する層のapplicability/oracleが未確定ならclosureをunknown/未完とする。Full Vではslice delta、Scrum Reverse、SR0–SR4、SR4 receiptを要求しない。

**FR-HARNESS-L3-046-02 — Production Scrum slice/backfill**：input styleがProduction Scrumであるscope、またはPOが許可した方式合成のうちL2-002/003に従ってScrumを適用するscopeだけを対象とする。slice deltaの先行を許容し、既存triggerに従うsprint review時またはrelease合流前にScrum Reverseでsystem workflowと該当L1–L5設計資産へbackfillする。SR0〜SR4を要する既存checkpoint triggerが成立するscopeでは、各段階SR0/SR1/SR2/SR3/SR4と各receiptを別々に確認し、段階identity・target scope/revision・source receiptの対応と値の一致を照合する。これとは別に、Production Scrumが選択・合成適用されるscopeではSR4 pair-freeze receiptがmissing/unknownなら、trigger成立有無にかかわらずrelease-ready候補へ進めない。選択style、方式定義、合成許可、trigger条件、L3までの共通工程をこの要件が変更・推測しない。これらのsource値が正常な入力でも、候補がいずれか一項目を変更する出力を単独に拒否し、046自身の出力処理を訂正する。

**FR-HARNESS-L3-046-03 — scope/source状態と返却先**：style selection、方式合成を適用するscopeの合成許可、scope/revision、system workflow、applicability、oracle、必要なScrum checkpointがmissing/unknown/conflict/staleなら、他scopeや別revisionから補完せずunknown/未完にする。Full Vの義務不足はScrum条件へ置換しない。workflow/style意味または既存trigger適用条件の不足は、そのscope/revisionや具体source identityを特定できるかにかかわらずHARNESS-L2-002/003の既存責務区分へ返す。verification obligation/V-pair oracleの不足も、個別source identityを特定できるかにかかわらずHARNESS-L2-004/022の既存責務区分へ返す。不足対象の種類で既存責務区分を選び、具体owner identityのunknownは別に保持する。identityの不明を返却停止条件にしない。新しいownerや分類を作らない。

**FR-HARNESS-L3-046-04 — authority非生成**：候補／coverage receiptからL2/L11採択、要求合意、要件承認、OS ticket、OS workflow instance、OS保存state、OS runtime、実行結果、release許可、利用者受入を生成しない。OSはticket/workflow instance/state/runtimeの生成・記録・運転を所有し、候補は既存のOS保存state/runtimeを変更しない。

**AC-HARNESS-L3-046-01 — Full V正常・12条件**：baselineでFull V style、system workflow revision、適用L1–L5層と段階freeze、12条件各々のapplicability・対応V-pair/oracleを固定する。これらが同scope/revisionで確認できる場合に限り対象workflow coverageを閉じる。Scrum delta/reverse/SR0–SR4/SR4はbaselineにも必須条件にも含めない。

**AC-HARNESS-L3-046-02 — Scrum選択scope正常・backfill**：Production Scrumまたは許可合成内のScrum適用scopeを明示し、slice delta、system workflowと該当L1–L5資産へのbackfill、trigger条件、適用されるcheckpoint/SR4 receiptを同じscope/revisionで確認する。SR0〜SR4を要する既存triggerが成立するscopeでは、SR0/SR1/SR2/SR3/SR4の各段階identityとreceiptを別々に確認し、target scope/revision・source evidenceとの一致を照合する。trigger不成立ではtrigger由来の追加checkpointを要求しない。両方の適用範囲でSR4 receiptがmissing/unknownなら、trigger成立有無にかかわらずrelease-ready候補にせず、release authorityも生成しない。

**AC-HARNESS-L3-046-03 — 未見／誤scope／owner**：Full Vで一つの条件またはfreezeを欠落させればscope未完、Scrum scopeで一つのbackfill/SR4 fieldを欠落させれば該当scope未完。Full V fixtureにScrum artifactがないだけなら不合格にせずAC-01を評価する。workflow/style/trigger適用条件の不明はHARNESS-L2-002/003、verification obligation/V-pair oracleの不明はHARNESS-L2-004/022の既存責務区分へ返し、個別source/owner identityのunknownは別に保持する。一般化したownerや新しい分類を作らない。

**AC-HARNESS-L3-046-04 — authority出力の単独拒否**：採択、要求合意、要件承認、OS ticket、OS workflow instance、OS保存state、OS runtime、実行結果、release許可、利用者受入の各出力を個別fixtureで一つずつ生成させる変異を拒否し、他output fieldおよび既存OS-owned state/runtimeは変えない。
