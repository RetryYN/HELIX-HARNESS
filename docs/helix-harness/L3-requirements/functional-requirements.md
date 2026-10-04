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

**保持／再導出**：一つのbehavior contractまたは意味を保つ密結合contractをpackとして識別し、入力・出力・依存・検証範囲・owner・版、リリース単位への収載／非収載を明示する。依存は他のpack、component、core、外部実行接続の種別・identity・版を宣言し、宣言のない依存は実行時に利用しない。未検証または未適格のpackを暗黙に含めず、同じ宣言入力と版の成果物を再現可能にする。単一packの差し替えで他packの版と証拠を変えない。packの版と成熟度、release unitの版、統合製品の版を別々に保持する。packの成熟度昇格・成功・差し替えだけでrelease unitまたは統合製品の版・成熟度を昇格させず、上位の未完部分で適格packを隠さない。複数release unitで使う能力はcomponentまたはcoreに置く。全部を巨大packへ戻さず、交換・更新不能な大きさならDesign-refactorへ戻す。ownerはrelease unit・component・coreのいずれか一つであり、classと具体identityをともに宣言する。失敗時は直前の適格版または明示された置換先へ戻せることを確認する。

**入力**：pack identity/version/maturity、入力・出力contract、owner classと具体identity（release unit identity ①〜⑦／component identity／core identity）、依存の種別（他pack／component／core／外部実行接続）・identity・版／互換範囲、検証範囲とoracle、収載／非収載のrelease unitとその版、統合製品の版、差し替え対象、失敗時に戻す直前の適格pack identity・version・evidence、または明示replacement identity・version・evidence。

**出力**：packごとの宣言manifest、検証scopeと証拠参照、pack適格性、release unit／統合製品それぞれの版との対応、差し替え差分、失敗時の復帰結果と証拠。復帰後のpack identity・version・evidenceが直前の適格版または明示replacementに一致することを確認できるようにする。これらの出力単独ではrelease eligibility、release実行、上位版・成熟度の昇格、未採択候補または対象機能の成立を認可しない。

**境界・失敗時**：欠落・曖昧・unknown/staleな必須宣言や依存互換性不明は成功扱いせず、該当packまたは操作のownerへ理由と戻し先を返す。複数packを意図して更新する操作は単一pack差し替えと区別する。固定L2-010から依存循環の独立した拒否条件は導出せず、依存closure条件は固定L2-023の範囲で扱う。交換・更新不能な巨大packはDesign-refactorへ戻す。旧PLAN graph schemaや旧gateは導入しない。

**受入条件**

- **`AC-HARNESS-L3-010-01` 宣言と収載（FR-HARNESS-L3-010）**：各packのidentity、version/maturity、入力・出力、必須依存の種別・identity・版、検証範囲／oracle、owner classと具体identityの組が一つだけであること、収載または非収載が追跡できる。release unit版と統合製品版はpack版と別fieldで照合する。複数release unitから使う能力はcomponentまたはcore所有である。依存manifestが完備していても実行時に宣言外のcomponentまたは外部実行接続を使う場合、owner identityが複数の場合、検証済みでも未適格または未検証のpackを暗黙収載した場合は不合格。各不成立理由をpackまたはoperation ownerへ返す。
- **`AC-HARNESS-L3-010-02` 単一pack差し替えの隔離（FR-HARNESS-L3-010）**：一つの対象packを置換した比較で、対象外packの版と証拠が完全に維持される。対象外の変化が一件でもあれば不合格。複数pack更新はこのACに混ぜない。
- **`AC-HARNESS-L3-010-03` 再現・版境界・分割可能性（FR-HARNESS-L3-010）**：同じ宣言入力とpack版から同じ宣言成果物を得る。失敗する差替えfixtureでは、失敗後のpack identity・version・evidenceが差替え直前の適格版または明示replacementと一致することを確認する。pack成熟度の昇格・成功・差し替えを個別に与えてもrelease unit／統合製品の版・成熟度は変わらない。上位release unit／製品が未完でも適格packを一覧から隠さず、巨大で交換・更新不能なpackは合格にせずDesign-refactorの戻り先を示す。各不成立は該当packまたはoperation ownerへ返す。

- **`AC-HARNESS-L3-010-04` 関数／folder一覧の拒否（FR-HARNESS-L3-010）**：固定L11:205に基づき、関数またはfolder一覧だけをpack一覧として提示した入力を拒否し、pack identity/owner/release-unit単位と関数folder catalogを分離する。

### `FR-HARNESS-L3-011` — 画面・作業環境から切り離して呼べる条件（親: `HARNESS-L2-011`）

**保持／再導出**：packは画面、特定GUI、ローカルpath、AI provider、CI製品を前提とせず、宣言した入出力contract、能力名、contract版、依存版で実際に呼び出して機能を使える。HARNESS-L2-006が束ねる「HELIX内部の管理対象や運用記録を持たなくても、明示された構成で提供機能を利用できる」条件も維持する。実行scopeは呼出し側が渡した権限とproject／tenant／環境の隔離境界に限る。権限方針とauthorityはHELIX-SECURITYが所有する。HARNESSは進行・結果・証拠を相関ID付きで呼出し元へ返す。呼出し元へ返した結果の保存・表示は呼出し元の責務であり、停止・再開用に途中stateを記録することはこの責務移管に当たらない。中断から記録済みstateと同じ冪等keyで再開し、期限切れや中断を成功にしない。再開は記録済みpack/contract/dependency版、operation、scope、適用authorityへ束縛し、不一致や期限切れを成功にしない。

**入力**：pack identity、能力名、contract版・依存版、宣言input、呼出し元の既存authority参照とscope/isolation、相関ID、冪等key、記録済み途中state、適用expiry。

**出力**：宣言contractに沿う進行state・result state・証拠参照、operationとの相関、未完／停止理由と再開可能性。権限やscopeを増やす判断、呼出し元の結果保存・表示、業務上の完了判断は出力しない。

**境界・失敗時**：必要なpack／能力identity、contract／dependency identity・版、呼出し元から渡されたscope、適用authorityまたは再開stateがmissing／unknown／stale／不一致なら、該当operationをsuccess扱いせず条件ごとの理由と既存のpack contract owner／operation owner／呼出しowner／authority ownerへの戻し先を返す。入力自体が不足しoracleを判定できない試験は未評価と記録し、productの保留stateと混同しない。期限切れはsuccessにならない。未対応版の黙読替え、別scope、またはHELIX本体の稼働DB・鍵・内部統制を呼出し元と共有すること、画面・providerに結合した代替経路は認めない。権限の成立条件をHARNESS側で新設せず既存SECURITY契約へ戻す。

**受入条件**

- **`AC-HARNESS-L3-011-01` 呼出し独立性と版（FR-HARNESS-L3-011）**：画面・GUI・local path・provider・CI製品を与えない明示構成で宣言contractを使って機能を呼び出し、宣言出力を利用できる。HARNESS内部の管理対象・運用記録がfixtureにない正常条件でも成立する。能力名・contract版・依存版を明示する。必要なpack／能力identityまたはdependency identityがmissing／unknown／現入力との不一致、contract版またはdependency版がmissing／unknown／stale／現入力との不一致ならsuccess扱いせず、理由とpack contract ownerへの戻し先を返す。未対応版は同等扱いしない。local pathを必須条件にする変異は不合格。別provider構成と別tenant内の有効な呼出しも未見正常fixtureとして照合する。
- **`AC-HARNESS-L3-011-02` 受渡しscopeとowner境界（FR-HARNESS-L3-011）**：適用可能な既存authorityと呼出し元のscope/isolationをfixtureとして与え、authorityまたはscopeがmissing／unknown／stale／不一致ならsuccess扱いせず、field別の理由と既存authority ownerまたは呼出しownerへの戻し先を返すこと、およびpackの動作範囲が渡されたscopeを超えないことを確認する。HARNESS自身の要求はHARNESSの対象として扱う一方、この要求からWEBの要求・設計を導出しない。別tenant／未渡し権限の使用、およびHELIX本体の稼働DB・鍵・内部統制を呼出し元へ共有する変異は個別に不合格とする。pack自身の独立した内部stateの利用はこの反例に含めない。authorityの新規定義は本要件の範囲外。
- **`AC-HARNESS-L3-011-03` 相関付き結果（FR-HARNESS-L3-011）**：進行、終端または未完state、結果、証拠参照が同じ呼出しの相関IDで呼出し元へ返り、保存・表示や業務完了をHARNESSが代行しない。
- **`AC-HARNESS-L3-011-04` 停止・再開・期限（FR-HARNESS-L3-011）**：同じ論理operationを同じ冪等keyと記録済み途中stateから再開できる。HARNESSが再開時にkeyを変える変異は同一operationの継続とせず、不合格とする。呼出し元が別keyを渡す別operationは拒否しない。再開stateとpack/contract/dependency版、scope、適用authorityのmissing／unknown／stale／不一致を成功扱いしない。理由とfieldを所有する既存pack contract owner／operation owner／呼出しowner／authority ownerへの戻し先を返す。preflight・dispatch直前・dispatch直後のexpiryを照合し、期限切れまたは中断を成功としない。retry上限やexpiry期間の値は上流で指定されたと扱わない。

### `FR-HARNESS-L3-023` — 利用条件別の依存宣言（親: `HARNESS-L2-023`）

**保持／再導出**：各packの依存を次の4区分のいずれかにし、その条件とpack revisionへ束縛する。

1. 常時必須。
2. 特定operation時のみ必須。
3. 明示選択されたsource/providerに応じて必須。
4. 実行条件・成果・authorityを左右しない参照資料のみ。

入力条件から有効closureを決定し、同じ要求inputとrevisionで同じclosureと理由を再現する。未選択sourceは未観測とし、存在・不在・適格性・成功を推測しない。安全依存は該当条件下で必須のまま保持し、依存condition自体がunknownなら保留する。

**入力**：pack identity/source revision、HARNESS-L2-010/011のcontract revision、operation・target/scope、明示的source選択、依存identity・owner・contract版／rangeと条件、必要な既存権限・隔離・data-use識別子。

**出力**：依存ごとのclass・condition・version・ownerと、有効closure。必要、条件不成立による対象外、未選択／未観測、参照のみ、unknown/stale／保留を区別し、利用した依存の版・scope・理由をHARNESS-L2-011の相関付き結果／証拠へ結び付ける。

**境界・失敗時**：依存identity・区分・condition・version rangeの欠落／曖昧さ、条件の矛盾、unknown/stale、互換性不明、source選択状態のunknownでは、条件をfalse、参照のみ、未選択へ暗黙に読み替えず該当操作を保留する。依存の種別・identity・versionを実行時manifestと突き合わせ、宣言外のdependencyをclosureから黙って除かない。同一要求のclosure欠落を口頭の人代行、暗黙の別source、参照資料で迂回しない。宣言dependency同士の循環などにより固定条件に沿ったclosureを解決できない場合は、暗黙に依存を落とさずunknown/保留としpack契約ownerへ戻す。人が代行しても同じ権限・隔離・版照合・検証・記録とreceiptを要する。利用者が別sourceを明示選択した新入力は別要求としてclosureを再評価する。戻し先はpack契約owner、呼出しowner、authority ownerまたは上流L1/POのうち、欠落した意味を所有する者である。

**受入条件**

- **`AC-HARNESS-L3-023-01` 4分類と条件束縛（FR-HARNESS-L3-023）**：4分類、owner、版／range、適用condition、対象operation/sourceがpack revisionに結び付く。各fixtureで分類を別の分類へ暗黙変換しない。
- **`AC-HARNESS-L3-023-02` 有効closureと状態区別（FR-HARNESS-L3-023）**：常時必須、成立したoperation条件、選択source条件だけを有効closureに含める。依存ごとの版・scope・判定根拠をHARNESS-L2-011の相関ID付き結果／証拠と結び付ける。条件不成立、未選択／未観測、参照のみ、unknown/staleは別状態として出す。未選択sourceについて存在・不在・適格性・成功を推測しない。source選択自体がunknownなら未選択へ読み替えず保留する。選択sourceの失敗から同じ入力のまま別sourceへ暗黙fallbackしない。利用者がsourceを明示再選択した新入力は別要求として再評価する。宣言された依存closureを解決できない循環はclosure欠落として保留する。未選択source・条件不成立の依存・無関係な能力全体の完成を有効closureまたは当該operationの保留条件に含めない。単体packのgreenだけではserviceの接続・構成体を成立扱いしない。
- **`AC-HARNESS-L3-023-03` 安全依存と決定性（FR-HARNESS-L3-023）**：依存区分はtarget packの機能・owner・上位要求・版成熟度を変更しない。依存closureの出力単独で未採択候補や利用対象機能の成立・実装許可を生成しない。該当条件下の安全依存は必須としてclosureに残し、unknownな条件は保留にする。人が代行する場合も既存の権限・隔離・版照合・検証・記録を省略せず、source／actor／revision／scope／受領／検証receiptを返す。口頭受領だけではclosure evidenceにならない。分類能力自体は全依存実装の存在を成立条件にせず、missing／unknown状態を出せる。後続版の依存を1.0へ強制せず、1.0で必要な安全依存を後続版扱いで削らない。同じinput・pack revisionの再評価でclosureと根拠が一致する。今回選択しなかった能力も、1.0全体に属する完成義務を削除・延期したことにはしない。



## 旧HELIX・FRSとの項目別照合

| 現行親・項目 | 旧sourceとasset | 扱い・保持点・変更理由 |
|---|---|---|
| L3区分とFR/AC→L10対応 | `LEGACY-ASSET-9A772391C7FB1298D45F`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`, SHA `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`; `LEGACY-ASSET-F542125805B777D8A56A`, `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–166`, SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | FR+ACと対検証のtrace構造を再導出。旧G3名、runtime、sub-gate構造は継承せず、現行L3/L10配置と通常のL3承認へ対応させる。現行配置と承認対象revisionは現行L2/L11と配置規則を正本とする。 |
| HARNESS-L2-010 / FR-010 | `LEGACY-ASSET-B5B5E71B2AF1459D59A1`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:119–148` (FR-03), `149–172` (FR-04), SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`; `LEGACY-ASSET-1B92155F959D7905DD1E`, `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:60–66` (AT-FR-03/04), SHA `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | pair traceと失敗fixtureの形を部分再導出。FR-04の依存cycleの扱いは固定L2-010にないためここへ持ち込まず、宣言closureを解決できない場合に限って固定L2-023のunknown/保留条件へ照合する。旧4-artifact/12-edge数値、PLAN schema、requires/blocks graph、旧実行例・AT-IDは置換し移植しない。pack identity/owner/version等は固定L2から再導出。 |
| HARNESS-L2-011 / FR-011 | 同上の旧FR-03 `119–148`、FR-05 `173–196`、対AT-FR-03 `60–63` / AT-FR-05 `67–69`（上記同一全文SHA）。旧L6 `source-boundary-contracts.md:60–70`（asset `LEGACY-ASSET-0327D0DF98618D3066FD`、full SHA `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`、raw span SHA `492ba0ba76271c7c39ee02035cfbc4834877519af6452cee317efbbb04434ebe`）と旧NFR-01 line 31、NFR-03 line 32、NFR-15 line 64（asset `LEGACY-ASSET-DB669724249A14A665F0`、full SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）を比較起点として追加する。FR-08 `257–280`、旧FR-09は `281–309`（310は次の旧FR-10見出し）であり、本Stage 1親には対応づけない。 | 固定L2-011の明示入出力、環境非依存、scope・authority、result return、stop/resume・expiryを中心に再導出する。旧L6 source-boundaryのpreflight/dispatch前後expiry再観測とblocked/uncertain receiptの観点は部分再利用するが、署名issuer、file-system port、Node実装、旧timeout等の実装は現行へ移さない。旧NFR-01/03/15のOS matrix、AI mode一覧、local-only/server phase値は現行条件として継承せず、画面・path・provider・CI製品へ依存しないという固定L2の意味へ再導出する。authority policyは既決SECURITY責務へ残す。 |
| HARNESS-L2-023 / FR-023 | 上記旧FR-03 `119–148`、FR-04 `149–172`およびAT-FR-03/04 `60–66`（同一全文SHA）。 | 依存欠落とclosure未解決のnegative shapeを、固定L2-023の4分類・revision条件・矛盾/unknown/stale・人代行receiptへ限定して再導出する。cycle fixtureは宣言closureを解決できない場合だけunknown/保留とする。旧requires/blocks graphと12 PLAN-kind enumは置換。 |
| 010/023の隣接FRS根拠 | `LEGACY-ASSET-B75E46DBE77592351574`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:60–92` (010), `127–142,209–212` (023), SHA `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17`; `LEGACY-ASSET-201EED9C5D6D2FF4D41B`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23–46,64–67`, SHA `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20`; `LEGACY-ASSET-67ADFAB856D954B3C5D2`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:37–47,58,73–81`, SHA `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | 単一behavior contract・変更影響trace・安全閉包など近接する保持点だけ部分再導出。旧Slice/Module/Bundle graph、owner enum、promotion義務、state/schema、候補AC/gateは現L2の意味を変えるため置換。これら旧候補は直接authorityでない。 |
| 旧business-detail 21–39 | `LEGACY-ASSET-A6E2C7F0565E5F804F06`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–39`, full SHA `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`, raw span SHA `ade5075e3df236216603e1e0d3fb83c8cdae007f7f319e49bd4af1c5d4efca5e` | 単一の正本への参照と適用範囲を分けて記録する文書構成だけを例として保持する。BR-21 / HM-08 / P2 Learning Engineの適用対象、指標、導入判定閾値は固定親の範囲外として除外する。 |
| 旧business-detail 84–104 | 同asset/path、full SHA `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`, raw span SHA `f79e52ce0ac3797d30c46573a61f8115656ece2f8485461c728cdcf50fa4b38f` | 自動適用、rating閾値、削除提案、PO承認動作とHM-08連携は置換し、現Stage 1の独立business requirement／owner／oracleへ移さない。 |

旧source本文はread-onlyで参照し、旧CLI/runtime/test/CIは実行していない。上記旧FRSは隣接候補資料であり、固定要求を上書きするauthorityではない。
