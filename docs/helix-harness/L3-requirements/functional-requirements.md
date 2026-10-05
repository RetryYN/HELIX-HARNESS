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
- **`AC-HARNESS-L3-030-03` doubleと生成物の非実行性**：selected external contractのみを表すdoubleの正常fixtureと、実service呼出し、未選択provider/schemaの模擬、generator自身の自己oracle化、未承認actorを許可する候補、固定oracleにない取消/境界の発明、承認後編集の許容、oracleと逆のstate transitionを個別に与える。後者は各々不合格であり、さらに生成物からrun、pass、acceptance、approvalをそれぞれ独立に推論する変異も不合格とする。追加case数/coverageでこの矛盾を相殺する候補も独立に不合格とする。同じpackの複数サービスによる二重所有と、共有packの利用を理由に未選択サービスまたはOS内部構成を必須化する変異を不合格とする。未宣言のサービス／pack組合せは受入を推定せずunknownとして該当packまたはservice ownerへ戻し、所属ラベルだけで互換性・内容oracleを代替しない。
- **`AC-HARNESS-L3-030-04` 契約・oracle更新時の再trace**：010/011 pack/call/dependency/version contract、014 designまたは022 oracleのうち一つずつを旧revisionから変更し、影響caseを新revisionへtraceし再生成・再検証する。影響範囲外のcaseまで一律保留にせず、旧revisionのpass/receiptを新revisionに流用しない。選択実行操作があれば新revisionの対応receiptを取り直すが、提案生成開始の前提にはしない。

### `FR-HARNESS-L3-031` — 許可failure入力のreproduction/reduction提案（親: `HARNESS-L2-031`）

**保持・再導出**：旧FR-16/25（上記旧functional-requirements.md:454–477,574–612）と対応AT-FR-16（同旧test design:102–104）/AT-FR-25（同:121–126）からfailure履歴保持、再現候補、後続regression candidateの関係を再導出する。production incident限定、旧severity/time/coverage閾値、旧runner/CI/G7 gate（旧FR-16/25）は固定親に合わないため置換する。旧NFR taxonomy（`LEGACY-ASSET-DB669724249A14A665F0`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–24`, SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）は値・測定・判定を組で記す形のみ再導出する。旧business-detail 21–37（`LEGACY-ASSET-A6E2C7F0565E5F804F06`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`, SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）は対象・owner・oracleの根拠にならず、business outcome/KPIを移さない。旧source本文を読んだbounded pinsは対の時点監査記録へ収録する。

**責務・入力**：HARNESS-L2-031の採択所属はHELIX-HARNESSの共通部品であり、許可されたfailure input（開発・refactor・incidentを含みproductionに限定しない）の対象revision、bounded log/input/operation sequence、入力元identity、取得時刻またはrevision結合情報、redaction結果、取得・利用permissionとsanitization、外部side effect抑止、環境/dependency版やseed（得られる場合）、requirement/API/state contractと独立oracleを受ける。010/011の031 pack/call契約、対象revision関係、security/data handling contractは常時必須であり不明なら機微入力を処理せず保留する。incident入力を扱わないrunにincident reproductionを要求しない。入力元/security/data ownerは既存境界を保持し、oracle意味は該当requirement/API ownerに残す。期待挙動未決は003/004の意味ownerへ、権限/data-use不足はsecurity/data ownerへ戻す。同じpackの複数サービスによる二重所有、または共有packの利用を理由に未選択サービスやOS内部構成を必須化する解釈は不合格とする。未宣言のサービス／pack組合せは受入を推定せずunknownとして該当packまたはservice ownerへ戻し、所属ラベルだけで互換性・内容oracleを代替しない。

**出力・境界**：original failure identity/digest、sanitized input、reduction step列、再現recipe、oracleで観測したsymptom、不足証拠/status、regression candidateとrevision traceを返す。reduction runを選択したときだけ032のselected consumer/OS-020または利用者CIへ隔離run requestを渡し、各step結果のあと、同じoracle/scope/revision/environmentのreceiptが一致した場合だけ次stepをsame-failure候補として確認する。未選択runは未実施のまま候補生成できる。固定L11の例ではPATCHのapproved-state writeが期待409/no-changeに対し200/persisted noteとなる初期症状を保全し、metadata付きbodyから`{"note":"corrected"}`へ縮小、empty bodyで422/no-changeと症状が変わればcandidateをnote-only bodyへ戻す。oracleは独立した既存requirement/API/022から得る。candidate作成に将来fix後のpassは不要で、そのpassを得た場合も別revisionの後段証拠である。

**受入条件**

- **`AC-HARNESS-L3-031-01` permission・sanitizationとoriginal保持（FR-HARNESS-L3-031）**：010/011 pack-call契約、対象revision関係、security/data handling契約、input source identity、取得時刻またはrevision結合情報、redaction結果が揃う許可済みsanitized inputの正常fixtureからcandidateを出し、original failureを保持する。各必須項目のmissing/unknown/conflict/staleを適用可能な範囲で独立に変異し、permission欠落、sanitized inputに残るprotected field、明示bounded inputからの逸脱、副作用を伴う再送もそれぞれ独立に拒否し、機微入力を保留してreasonを返す。期待挙動未決は003/004の意味owner、権限/data-use不足はsecurity/data ownerへ戻す。同じpackの複数サービスによる二重所有、共有packの利用を理由に未選択サービスまたはOS内部構成を必須化する変異は不合格とする。未宣言のサービス／pack組合せは受入を推定せずunknownとして該当packまたはservice ownerへ戻し、所属ラベルだけで互換性・内容oracleを代替しない。
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
- **`AC-HARNESS-L3-032-05` handoffとexecutionの分離**：正常なpacket delivery後にまだ実行receiptがない状態を正しく表し、deliveryをrun/pass/ticket/approval/acceptanceに変換する各変異、選択済み後続実行receiptに基づくartifact state昇格を無根拠に行う変異、resume時に選択artifact/receipt stateを失う変異を個別に拒否する。実行・隔離・結果回収は選択OS-020または利用者CIの契約へ残す。同じpackを複数サービスが所有する変異は不合格とする。未宣言のサービス／pack組合せから受入を推定せずunknownとして該当packまたはservice ownerへ戻し、所属ラベルだけで互換性・内容oracleを代替しない。

固定L2-033のfailure/reduction/run/composite traceは独立親である。033全周を030/031/032の受入にしない。independent reviewは草稿作成の工程であり、いずれの親の製品要件・生成結果でもない。
