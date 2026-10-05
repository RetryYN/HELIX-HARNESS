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

## Stage 2c suffix — HARNESS-L2-030/031/032（1.0対象候補）

この追補は固定親030/031/032のみを対象にし、Stage 1/2aの既存本文・IDを変更しない。3親はいずれもPO採択対象だが、`1.0`はversion_targetでありrelease収載を意味しない。固定L2はmain `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の同文書（全文SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`）607–666行、固定L11は同main（全文SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`）408–431行である。PO採択の意味とversion_targetは採択記録main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の決定記録59–61行に固定される（本文SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）。PO登録metadata自体は別のauthorityを作らず、本L3も未承認草稿である。

G0の順序案BはStage 2a後に2cを2bと並行する段階配置であり、030/031/032を支援・候補生成として扱う。G0のStage 2c全版対象は10件、うち1.0 subsetは8件であり、案Bの最初の1.0組6件（HARNESS 030/031/032、INTELLIGENCE 068、OS 028/029）から本追補はHARNESSの3親だけを扱う。別枠の1.0追加2親（INTELLIGENCE 075、SECURITY 031）を本対象へ加えない。030は010/014/022をStage prerequisiteとして記録し、031は010/022を記録する。032にG0のStage prerequisite IDはないため追加しない。これらstage prerequisiteと、各親の固定L2 operation時依存は別である。前stage全件完了、独立review、または未選択操作の実行を新たなgateにしない。承認済みStage 1の010/011/023本文は各固定revisionの範囲で参照できるが、その承認だけで本Stage 2c候補全体を承認済みとはしない。Stage 2a/2bの文書や結果は本cutoutへ混入せず、参照する場合は各々の現行authority状態と固定親の明示条件に従う。

### `FR-HARNESS-L3-030` — 検証case提案の生成（親: `HARNESS-L2-030`）

**保持・再導出**：旧L3定義（`LEGACY-ASSET-F542125805B777D8A56A`, `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168`, SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）と旧functional requirement FR-02/03（`LEGACY-ASSET-B5B5E71B2AF1459D59A1`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:95–148`, SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`）、旧AT-FR-02/03（`LEGACY-ASSET-1B92155F959D7905DD1E`, `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:26–40,57–63`, SHA-256 `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`）から、FR/ACと対の検証trace、正常・反例・境界fixtureの形を項目ごとに再導出する。旧4-artifact/12-edge等の件数、G3/runtime/sub-gate、旧ID、実行例は置換し、今回のcase数や合格数に流用しない。旧README（`LEGACY-ASSET-9A772391C7FB1298D45F`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`, SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）のL3要件と対の検証設計という区分は再導出し、旧L12 pair表記は現行L3/L10配置へ置換する。項目別旧source処置と照合pinは本草稿の対の時点監査記録に収録する。

**責務・入力**：HELIX-HARNESS-CORE所属とownerは候補として扱い、新しいownerを採択しない。010/011はpack/call/version/dependency/scope/receipt境界、014は対応する設計、022は独立検証oracle/期待観測を担う。対象artifact/API/state transitionのrevisionとscope、承認済みL3要件、対応014設計、適用可能な022 oracle、選択された外部contract/source版を受ける。必須oracle・権限・選択sourceがmissing/unknown/conflictなら確定caseを作らず、未解決条件を出す。

**出力・境界**：安定case identity/family、actor、precondition、operation順、再現入力/data、選択contract内に限るdouble、requirement/design/oracle/source/scope/版trace、seedまたは生成入力、未解決条件を返す。同じ入力/source版/scope/seedならcaseの意味を再現可能にする。generator自身をexpected-value oracleにせず、選択外source/provider/schemaの存在・挙動を推測しない。doubleは外部serviceを呼ばず、実サービス等価性を主張しない。case生成・件数・coverageだけで実行、品質、欠陥なし、承認、受入を主張しない。

**受入条件**

- **`AC-HARNESS-L3-030-01` 宣言範囲と意味trace（FR-HARNESS-L3-030）**：正常fixtureでtarget revision/scope、L3 requirement、014 paired design、022 oracle、選択contract/source版、生成case identity/family/actor/precondition/operation/data/double/seedまたは生成入力/traceを対応させる。正常submit・境界・権限・cancel・順序の各familyを、入力oracleに定義された操作だけ独立に照合する。宣言API/state domain内で既存fixtureにない正常caseも評価し、oracleが定める意味・期待観測が保持される。
- **`AC-HARNESS-L3-030-02` 未解決oracleと権限**：oracle欠落、矛盾、scope違い、選択権限/source不足、actor不適合、合成の利用禁止data class（secretを含む実値は使用しない）のfixture混入を各々独立に変異し、いずれも期待値・permission・境界を発明せず未解決として返す。未宣言rangeを有効とみなさない。選択operationに必要なsource bindingの欠落・読取不能だけを該当候補の未解決条件とし、不要で未選択のsourceは未観測に保ち、その存在・receiptを要求しない。
- **`AC-HARNESS-L3-030-03` doubleと生成物の非実行性**：selected external contractのみを表すdoubleの正常fixtureと、実service呼出し、未選択provider/schemaの模擬、generator自身の自己oracle化を個別に与える。後三者は不合格であり、生成物からrun/pass/acceptance/approvalを推論しない。
- **`AC-HARNESS-L3-030-04` 契約・oracle更新時の再trace**：010/011 pack/call/dependency/version contract、014 designまたは022 oracleのうち一つずつを旧revisionから変更し、影響caseを新revisionへtraceし再生成・再検証する。影響範囲外のcaseまで一律保留にせず、旧revisionのpass/receiptを新revisionに流用しない。選択実行操作があれば新revisionの対応receiptを取り直すが、提案生成開始の前提にはしない。

### `FR-HARNESS-L3-031` — 許可failure入力のreproduction/reduction提案（親: `HARNESS-L2-031`）

**保持・再導出**：旧FR-16/25（上記旧functional-requirements.md:454–477,574–612）と対応AT-FR-16（同旧test design:102–104）/AT-FR-25（同:121–126）からfailure履歴保持、再現候補、後続regression candidateの関係を再導出する。production incident限定、旧severity/time/coverage閾値、旧runner/CI/G3 gateは固定親に合わないため置換する。旧NFR taxonomy（`LEGACY-ASSET-DB669724249A14A665F0`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–24`, SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）は値・測定・判定を組で記す形のみ再導出する。旧business-detail 21–37（`LEGACY-ASSET-A6E2C7F0565E5F804F06`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`, SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）は対象・owner・oracleの根拠にならず、business outcome/KPIを移さない。旧source本文を読んだbounded pinsは対の時点監査記録へ収録する。

**責務・入力**：許可されたfailure input（開発・refactor・incidentを含みproductionに限定しない）の対象revision、bounded log/input/operation sequence、取得・利用permissionとsanitization、外部side effect抑止、環境/dependency版やseed（得られる場合）、requirement/API/state contractと独立oracleを受ける。入力元・security/data ownerは既存source/permissionの境界を保持し、oracle意味は該当requirement/API ownerに残す。

**出力・境界**：original failure identity/digest、sanitized input、reduction step列、再現recipe、oracleで観測したsymptom、不足証拠/status、regression candidateとrevision traceを返す。reduction runを選択したときだけ032のselected consumer/OS-020または利用者CIへ隔離run requestを渡し、各step結果のあと、同じoracle/scope/revision/environmentのreceiptが一致した場合だけ次stepをsame-failure候補として確認する。未選択runは未実施のまま候補生成できる。固定L11の例ではPATCHのapproved-state writeが期待409/no-changeに対し200/persisted noteとなる初期症状を保全し、metadata付きbodyから`{"note":"corrected"}`へ縮小、empty bodyで422/no-changeと症状が変わればcandidateをnote-only bodyへ戻す。oracleは独立した既存requirement/API/022から得る。candidate作成に将来fix後のpassは不要で、そのpassを得た場合も別revisionの後段証拠である。

**受入条件**

- **`AC-HARNESS-L3-031-01` permission・sanitizationとoriginal保持（FR-HARNESS-L3-031）**：許可されたsanitized inputの正常fixtureからcandidateを出し、source/revision/scope/permission/oracleとoriginal failureを保持する。permission欠落、未sanitized protected data、bounded input外の取得、副作用再送は独立negativeとし、処理/出力をholdして元evidenceを保つ。
- **`AC-HARNESS-L3-031-02` step別receiptと同一failure判定**：PATCH例のinitial failing receipt、note-only reduction、empty-body 422 receipt、症状変化時のnote-only復帰を順に照合する。各stepのreceiptは同一oracle/scope/revision/environmentへ結ぶ。receiptなし、別scope/oracle/revision、200というstatusだけ同じだがresponse/body mutationが元症状と異なる入力、または症状変化後のsame-failure断定はそれぞれ拒否し、original failureを削除しない。
- **`AC-HARNESS-L3-031-03` regression candidateとfuture pass分離**：candidate proposalだけがある正常fixtureでfuture fix/pass receiptなしでも生成可能であることを確認する。future passを初期生成inputに必須とする変異、再実行成功で初期failureを消す変異、test skipまたはoracle弱化を個別に拒否する。candidate生成はregression successの証明ではない。
- **`AC-HARNESS-L3-031-04` 未見の許可failure**：宣言scopeと独立oracle内の未使用failure形式を未見正常fixtureとし、source/permission/sanitizationを再確認する。未知log形式、環境、inputまたはoracle不足はunreproduced/insufficient evidenceとし、根本原因を推定しない。
- **`AC-HARNESS-L3-031-05` pack/oracle更新とreceipt再取得**：010/011 pack/call/dependency version、022 oracle、または当該candidateが依存する014 designを一つずつ更新し、影響candidateを新revisionにtraceしrebind・再検証する。選択されたreduction operationは新pack/source/oracle revisionで各step receiptを再取得する。旧receipt/passを再利用せず、future fix passをcandidate生成の前提にも追加しない。

### `FR-HARNESS-L3-032` — 選択artifactからconsumerへのpacket handoff（親: `HARNESS-L2-032`）

**保持・再導出**：旧FR-03 trace、旧FR-17（旧functional-requirements.md:478–501）とAT-FR-17（同旧test design:105–107）、旧L8 fixture/mock境界（`LEGACY-ASSET-73B5C6C7D281E28EC541`, `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-integration-test-design.md:122–136`, SHA-256 `c8b287ee4e103255081f00439b7fb2f3dfd259e0fb35a2760b48ad583524fe15`）からidentity-bound traceとmock境界を限定再導出する。旧four-artifact pairing、G3、GHA/branch-protection/G7実行、旧adapter/CI contractは置換する。CONNECTはregistration/version/communication/retry/traceを担い、032の業務packet意味やrun/pass結果を担わない。旧source処置とbounded source pinは対の監査記録へ収録する。

**責務・入力**：明示選択されたcase/reproduction artifactとsource identity、oracle/contract版、target HEAD/revision/scope、必要runner capability/permission、選択consumer schema/version/互換範囲を受ける。HARNESS COREの共有能力とbusiness meaningは候補のままで、追加ownerを割り当てない。選択OS-020または利用者CIが隔離実行と結果回収を担う。G0は032のstage prerequisiteを定めない。初回packet handoffにconsumer receipt/resultを要求しない。

**出力・境界**：明示consumer schemaに適合したrun-input packet、artifact/oracle mapping、target/source binding、未解決compatibility/permissionとreceipt reference slotを返す。選択consumerの責任ownerへschema/互換不一致を理由付きで戻す。宣言range外revision、undeclared schema、unknown compatibilityは接続可能と推測せずunknown/not connectedを返す。handoffから実行、pass、ticket、承認、業務受入を推論しない。未選択consumerの存在・互換性・成功を未観測のまま保つ。

**受入条件**

- **`AC-HARNESS-L3-032-01` selected consumer packet**：normal fixtureでcase/source identity、oracle/contract版、HEAD/scope、選択schema/version/compatibility、runner permissionを明示し、schema適合packetとreceipt-reference slotを生成する。初回handoff前にresult receiptが不要であることも照合する。
- **`AC-HARNESS-L3-032-02` field別binding negative**：artifact identity、source identity、oracle、target HEAD、scope、consumer schema/version、permission、必要なdouble条件のmissing・unknown・stale・不一致を対象fieldごとに単独変異し、valid packetとして接続せず該当理由と責任ownerへの戻し先を返す。実provider呼出しを誘発する変異も拒否する。
- **`AC-HARNESS-L3-032-03` 選択・未見互換境界**：明示選択済みschema compatibility range内の未使用consumer revisionを未見正常fixtureとしてpacket生成する。未選択consumerは未観測に保ち、その評価やreceiptを選択runへ要求しない。明示接続要求の未宣言range、unknown compatibility、range外revisionは個別にunknown/not connectedとし、presence/compatibility/successを推測しない。
- **`AC-HARNESS-L3-032-04` version/update時のrebind**：010/011 pack/call compatibility、または当該artifactへ適用される014 design/022 oracleを各々更新し、影響packet/candidateの新revision trace、regeneration/revalidationを照合する。選択されたreduction operationのreceiptが影響を受ける場合は新revision・scope・oracle・consumer contractで取り直す。旧pass/receiptは流用せず、receiptが初回packet生成の前提だとも扱わない。
- **`AC-HARNESS-L3-032-05` handoffとexecutionの分離**：正常なpacket delivery後にまだ実行receiptがない状態を正しく表し、deliveryをrun/pass/ticket/approval/acceptanceに変換する各変異を個別に拒否する。実行・隔離・結果回収は選択OS-020または利用者CIの契約へ残す。

固定L2-033のfailure/reduction/run/composite traceは独立親である。033全周を030/031/032の受入にしない。independent reviewは草稿作成の工程であり、いずれの親の製品要件・生成結果でもない。
