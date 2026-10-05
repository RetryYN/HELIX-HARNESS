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

## Stage 2a suffix — HARNESS-L2-022（1.0対象）

この追補はStage 2aで選択されたHARNESS-L2-022一親に限る。固定L2/L11とPO採択対象revisionを親とし、Stage 1の本文・ID・意味を変更しない。L3草稿は未承認であり、実装・実行・releaseを許可しない。Stage 1の承認記録は既存010/011/023の対象revisionに限り、本022の承認を生成しない。

### `FR-HARNESS-L3-022` — コアの検証・受入契約

**由来と処置**：旧G3/L3のFR+ACと対のverification designという構造、旧pillar文書のFR/AC trace形式、旧L10 test designの正常・反例・未見oracle構造を起点として再導出する。旧G3名称・freeze/sub-gate/runtime、旧ID・件数・集計完了規則、旧L10 UX限定の責務は置換し、現行の通常L3承認、HARNESS-L2-022の段階契約、対のL10 system verificationへ合わせる。旧L10-UXの実体はL11利用者受入であり、現行L10と混同しない。根拠のasset/path/span/full SHAは対応する時点監査記録へ収録する。

**固定source trace**：親はPO判断記録main `633bf12ea8f948db8ba3d6600179c4a9507377a7`（022 proposal `MPR-RC-HARNESS-L2-022-004`、登録metadata自体はauthorityではない）で採択された、L2 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のHARNESS-L2-022（L2:447-461、本文SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`）。対のL11同revisionは全文SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`（L11:217, 298-304, 317-325）。L11:317-325は各段階のquality/security/acceptance oracleと適用scope、provisional→Integrated→Verified→Acceptedの証拠を別々に結び、oracle/receipt不足の品質を未評価に保ち、lower-stage pass/CI green/evidence presenceのみの上位成立と改善scoreからの意思決定・要求承認生成を反例とする。PO判断記録main `633bf12ea8f948db8ba3d6600179c4a9507377a7` L51の採択registration `MPR-RC-HARNESS-L2-022-004` が束縛するreceipt `docs/governance/audits/requirement-registration/harness-effect-acceptance-coverage-receipt-2026-09-27.json`（f6 fixed-tree SHA `d67f3379cfc5c6884a7aa82497473267caf5f4bed309c3b84c4307ced927edb5`、authority_effect=none）は、過去L11 append SHA `ad983b6f278c057b3565fb3af56aa70300da5185c25f69c8d8b158e76f04d504` とG13の意味を記録する。fixed-tree時点のL11:317-325 span SHAは`b857ca0505004bf512cb163b23170ee0b25feda540a69c6c7e2112550c44cb22`。

同じ固定L2:461はHARNESS-L2-005の構成的保証と差分証明、およびFRS-BR-009も既存条件として束ねる。固定L2-005の該当説明は同revision `product-requirements.md:118`、FRS-BR-009の明示行は`:286`、対のL11で個別機能と組合せ全体を区別する句は`product-acceptance.md:186`。これらはstageごとの下位証拠と上位固有oracleの差分、組合せの統合・更新・復旧・運用検証を単体成功と混同しないtraceに限って対応させる。L11は022の1.0範囲を明示する。実装順序は`docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.md:54`（当該本文SHA `c30d5b2ca757952f9772573bffb95a03dfb8ccf686687b92bb70d2c93c956253`）でHARNESS-L2-022をStage 2aに割り当てる。Stage 1 #2572の承認を022へ継承せず、022の要求意味は固定L2/L11から導出する。

旧sourceの項目別処置：`LEGACY-ASSET-F542125805B777D8A56A`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-166`, SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）の148-154行から3区分とFR+AC形式を再利用する。process 155-157行はUX受入をL10 pairと記す一方、`LEGACY-ASSET-9A772391C7FB1298D45F`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:41,53`, full SHA `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）はL12 pairと記し、旧source間でpair layerが食い違う。この差異を旧番号やUX限定ごと継承せず、現行配置規則のL3/L10対と固定022から再導出する。process 163-165行の`engineering_discipline_required`、no-code-first、complexity/modeling判断は固定022の要求外なので継承しない。process 158-162行のG3 gate/freeze/role/AP-4も移さず、通常L3承認と現行trace要件へ置換する。`LEGACY-ASSET-EE5DBACC7F28F7D1F605`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:38-57,134-197,198-307`, SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）からFR/AC trace形式を再利用し、各義務を固定022から再導出する。旧51/102件、旧ID・aggregate completeness・P2/P7内容・旧runtime/CIは移さない。`LEGACY-ASSET-44DD86E3DEC09E65EF51`（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`, SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`）から条件別oracle・正常/反例/未見の対形式を再導出し、HAT/旧実行結果/L12経路は置換する。`LEGACY-ASSET-535EBA960C372C61F999`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L10-ux/ux-evidence-boundary.md:17-21,40-44`, SHA `92caa47dcd181fc790dec462820b063a1c8a6ed9c0b86410306ead9cb13e3f71`）はL11利用者受入とL10総合検証の責務分離のみを再利用し、旧physical path/layer表記とUX限定を現行責務へ移さない。各span raw SHAおよびsource本文の照合pinは時点監査用handoffへ記録する。

**対象・入力**：対象HARNESS artifactのrevisionとscope、Provisional成果物、対のL5詳細設計/L4基本設計、固定L2要求・L11条件、L3要件、L8/L9/L10の対の検証設計・oracle・結果・証拠を受ける。④を前提にせずCORE traceと対の設計を用いる。成果物は④出力またはHARNESS-L2-019経由で持ち込まれたものでもよい。

**状態と出力**：対象revision/scopeに結び、段階ごとの状態・判定理由・結果・証拠参照を出力する。Provisional→IntegratedはL8でL5、L9でL4をそれぞれScoped Reverseし、境界照合、必要なRefactor、結合証明が揃ったときに限る。Integrated→VerifiedはL10でL3を照合し、下位証拠に加えてシステム固有義務との差分が確認されたときに限る。Verified→AcceptedはL11条件（成功条件と反例）による内容判定と、同じrevision/scopeに対する利用者受入およびその記録を別々に満たしたときに限る。各段階の品質・security・acceptance oracleと適用scopeは別々に結び、設計・実装・refactorの各受入結果についてそのscope内で何を確かめたかを次段階へ引き継ぐ。oracle、適用scopeまたはreceipt不足で品質を確かめられない場合、その品質は未評価のままとする。各段階は別状態として保持し、未達部分を満たしたかのように昇格させない。効果比較や改善scoreは証拠として扱い、意思決定・要求承認・Acceptedを生成しない。

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
