# HELIX-HARNESS L3 機能要件（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 + Stage 2a + Stage 2b(HARNESS-L2-012..020, 024) + Stage 2c(HARNESS-L2-030..032) + Stage 3(HARNESS-L2-034,036,038,039,040,041,042,043,044,046,047,049,054) + Stage 4(HARNESS-L2-026..029) + Stage 5(HARNESS-L2-021,025,033,035,037) / version_class 1.0 draft scope per roster and PO adoption (021 has no item-level version_target; release inclusion undecided)
owner: HELIX-HARNESS
paired_l10: ../L10-verification/functional-verification.md

本書はStage 1、Stage 2a、Stage 2bのHARNESS-L2-012..020/024、Stage 2cのHARNESS-L2-030..032、Stage 3のHARNESS-L2-034/036/038/039/040/041/042/043/044/046/047/049/054、Stage 4のHARNESS-L2-026..029、Stage 5のHARNESS-L2-021/025/033/035/037に限る部分草稿である。対のL10総合検証設計は[functional-verification.md](../L10-verification/functional-verification.md)に置き、両文書で同じAC IDを使う。要求意味・範囲・owner・versionは固定親を越えて変更しない。これはHARNESS全体のL3、L3承認、実装・実行許可を表さない。ここでの1.0は274 rosterの推奨core IDとPO採択に基づく起草対象区分であり、個別`version_target`印の有無やリリース収載判断とは別である。

## 親要求revision

| 親 | PO判断記録 | 固定親revision／本文 | 行・raw span SHA-256 | semantic digest |
|---|---|---|---|---|
| `HARNESS-L2-010` (`MPR-RC-HARNESS-L2-010-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L39)、判断記録SHA `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23` | `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、`../L2-requirements/product-requirements.md`、全文SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | 340–351、`5fae33b5001fb2b59c3a8a62cfb06d428480574d22c8872ef3f9d8fe440bb5b0` | `9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4` |
| `HARNESS-L2-011` (`MPR-RC-HARNESS-L2-011-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L40)、同上 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、同上 | 352–362、`65483ea9a44d880a894fe6e9b052594741e3fab29320c158fa95f0075af60090` | `30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952` |
| `HARNESS-L2-023` (`MPR-RC-HARNESS-L2-023-002`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L52)、同上 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、同上 | 463–498、`cacb50daf962d62f6454da1ecff7a8fd7a7ec41f0eda17eadc1c0d7edf845fc9` | `32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03` |
| `HARNESS-L2-012` (`MPR-RC-HARNESS-L2-012-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L41) | `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、同上 | 363–370、`ed26f576f8ddd5d6b83d912abfec6ec346d6aa768d631909b72273fd144bd59b` | `ebdb183eee98909a5777eaf4602423bd43698669013b2d1538de8f29626728b2` |
| `HARNESS-L2-013` (`MPR-RC-HARNESS-L2-013-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L42)、同上 | 同上 | 371–378、`1cf32e08f16ebb09c7d24e731a33cb906f9ddcb4f869f427f8c49481873ed771` | `11dccf3f73803f4cd0950c51328c755b5492cdaa720ce86c0cd9aefcd2e11f49` |
| `HARNESS-L2-014` (`MPR-RC-HARNESS-L2-014-003`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L43)、同上 | 同上 | 379–386、`fb8557ae7b84b31b939093490e1571d17a7b2995c6db30a4060dda10c0e284b4` | `eca6896fa86d4a929ac767cdeb81453c733f42db0d772b416bef5d97a5937dc9` |
| `HARNESS-L2-015` (`MPR-RC-HARNESS-L2-015-004`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L44)、同上 | 同上 | 387–394、`4c7fb6b87c9dd4664dc0383cfd150d20a0bd53ef1e1ed0f7439ce4a95208ac5c` | `d528e724da205072383a97c4dadf6ece9fb95f2ff2152eb5a5d1bd416029f601` |
| `HARNESS-L2-016` (`MPR-RC-HARNESS-L2-016-004`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L45)、同上 | 同上 | 395–402、`084dd154969beffb5c67255adcce3be4f5a483e8e89822dabf83ab82ea974198` | `3abd8cdd1df5335a87848fcd7c232708dfd6611a5c0e78083962c33e41990e26` |
| `HARNESS-L2-017` (`MPR-RC-HARNESS-L2-017-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L46)、同上 | 同上 | 403–410、`a0f17d12b26f7dd7c5f4f52767ae06fae8b32c4f31c156d04d3538b77edba2fb` | `623b91b59a5cf09055e8604c3c84aebfe9428b86f950a0bcb2a9c1605d710d17` |
| `HARNESS-L2-018` (`MPR-RC-HARNESS-L2-018-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L47)、同上 | 同上 | 411–418、`97d4f669fb90eea59a8909a2c5b482a8b438018ab219dd6279e526ae49a89b17` | `3497158cd4b39bb9059c20f9cfe2c0a647181e3dd566ff0d247ad5f4d5fc4671` |
| `HARNESS-L2-019` (`MPR-RC-HARNESS-L2-019-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L48)、同上 | 同上 | 419–426、`0f50a16bcb31791e5d27f784a0d97f8142f41559d957b12713e19f1ab80d7609` | `7bd3d180259af1febe50e013eea5aa5609d5af3c28ce89191c4670f3e8c88000` |
| `HARNESS-L2-020` (`MPR-RC-HARNESS-L2-020-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L49)、同上 | 同上 | 427–437、`28980b6713714debd1aab0c83c83f025ca415209427e9f7a657e624af305b4b3` | `d68ecbe2512b45f6f4c09cf395bd05b164a8243997f954e5459d42b29c69de7d` |
| `HARNESS-L2-024` (`MPR-RC-HARNESS-L2-024-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L53) | 同上 | 499–525、`ec4ece6e411152941c16cd8dc25a1c43613dff5e6b5c3051ef675c66c8b9b2cc` | `b8e45ca6df9bd498f9a385d33b3c3dfb96e367d31fb91c434a23bf848e98b2a8` |

固定L2全文SHAは `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、対のL11全文SHAは `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。各L11の固定spanは、010 205行／`ee2d89c797d8d07d917b68fca55d386d487e67caac0e9cf0873fe674846e33cf`、011 206行／`483c86d30dbece9bce50732e5faf9480b6c70c93f6b625330d27cb7784a57188`、023 223行／`f209dace6dd361437dd2f37785216ff7cdc3e69ef298ce760e1574033c4beaf4`。親の採択状態は判断記録で確認し、固定本文内の候補表現や後続register metadataで変更しない。

## 要件とAC

### `FR-HARNESS-L3-010` — パックの境界（親: `HARNESS-L2-010`）

**保持／再導出**：一つのbehavior contractまたは意味を保つ密結合contractをpackとして識別し、入力・出力・依存・検証範囲・owner・版、リリース単位への収載／非収載を明示する。宣言のない依存は利用せず、未検証packを暗黙に含めず、同じ宣言入力と版の成果物を再現可能にする。単一packの差し替えで他packの版と証拠を変えない。packの版と成熟度、release unitの版、統合製品の版を別々に保持する。packの昇格だけで上位を昇格させず、上位の未完部分で適格packを隠さない。全部を巨大packへ戻さず、交換・更新不能な大きさならDesign-refactorへ戻す。ownerはrelease unit・component・coreのいずれか一つとし、失敗時は直前の適格版または明示された置換先を識別可能にする。

**入力**：pack identity/version/maturity、入力・出力contract、owner class（release unit／component／core）、依存identityと版／互換範囲、検証範囲とoracle、収載／非収載のrelease unitとその版、統合製品の版、差し替え対象、直前の適格版または明示置換先。

**出力**：packごとの宣言manifest、検証scopeと証拠参照、pack適格性、release unit／統合製品それぞれの版との対応、差し替え差分、失敗時に戻す対象の識別情報。これらの出力単独ではrelease eligibility、release実行、上位版の昇格を成立させない。

**境界・失敗時**：欠落・曖昧・unknown/staleな必須宣言、互換性不明、未解決の依存閉包は成功扱いせず、該当packまたは操作のownerへ戻す。複数packを意図して更新する操作は単一pack差し替えと区別する。明示依存から解決できない循環はclosureを成立扱いしない。交換・更新不能な巨大packはDesign-refactorへ戻す。旧PLAN graph schemaや旧gateは導入しない。

**受入条件**

- **`AC-HARNESS-L3-010-01` 宣言と収載（FR-HARNESS-L3-010）**：各packのidentity、version/maturity、入力・出力、必須依存と版、検証範囲／oracle、単一owner class（release unit／component／core）、収載または非収載が追跡できる。release unit版と統合製品版はpack版と別fieldで照合する。未宣言依存、二重owner、未検証packの暗黙収載が一つでもあれば不合格。
- **`AC-HARNESS-L3-010-02` 単一pack差し替えの隔離（FR-HARNESS-L3-010）**：一つの対象packを置換した比較で、対象外packの版と証拠が完全に維持される。対象外の変化が一件でもあれば不合格。複数pack更新はこのACに混ぜない。
- **`AC-HARNESS-L3-010-03` 再現・版境界・分割可能性（FR-HARNESS-L3-010）**：同じ宣言入力とpack版から同じ宣言成果物を得て、失敗時に直前の適格版または明示された置換先を特定できる。上位release unit／製品が未完でも適格packを一覧から隠さず、packの成功や差し替えから上位版の昇格を導かない。巨大で交換・更新不能なpackは合格にせずDesign-refactorの戻り先を示す。

### `FR-HARNESS-L3-011` — 画面・作業環境から切り離して呼べる条件（親: `HARNESS-L2-011`）

**保持／再導出**：packは画面、特定GUI、ローカルpath、AI provider、CI製品を前提とせず、宣言した入出力contract、能力名、contract版、依存版で呼び出せる。実行scopeは呼出し側が渡した権限とproject／tenant／環境の隔離境界に限る。権限方針とauthorityはHELIX-SECURITYが所有する。HARNESSは進行・結果・証拠を相関ID付きで呼出し元へ返す。呼出し元へ返した結果の保存・表示は呼出し元の責務であり、停止・再開用に途中stateを記録することはこの責務移管に当たらない。中断から記録済みstateと同じ冪等keyで再開し、期限切れや中断を成功にしない。

**入力**：pack identity、能力名、contract版・依存版、宣言input、呼出し元の既存authority参照とscope/isolation、相関ID、冪等key、記録済み途中state、適用expiry。

**出力**：宣言contractに沿う進行state・result state・証拠参照、operationとの相関、未完／停止理由と再開可能性。権限やscopeを増やす判断、呼出し元の結果保存・表示、業務上の完了判断は出力しない。

**境界・失敗時**：必要なcontract／dependency版、渡されたscope、適用authorityまたは再開stateがmissing／unknown／stale／不一致なら、該当operationを成功扱いせず理由と戻し先を返す。期限切れは成功にならない。未対応版の黙読替え、別scopeや内部DB／鍵／内部統制の共有、画面・providerに結合した代替経路は認めない。権限の成立条件をHARNESS側で新設せず既存SECURITY契約へ戻す。

**受入条件**

- **`AC-HARNESS-L3-011-01` 呼出し独立性と版（FR-HARNESS-L3-011）**：画面・GUI・local path・provider・CI製品を与えない入力でも宣言contractで呼び出せる。能力名・contract版・依存版を明示し、未対応版は同等扱いしない。
- **`AC-HARNESS-L3-011-02` 受渡しscope（FR-HARNESS-L3-011）**：適用可能な既存authorityと呼出し元のscope/isolationをfixtureとして与え、packの動作範囲がそれを超えないことを確認する。別tenant／未渡し権限／内部DB・鍵・内部統制を使う例は不合格。authorityの新規定義は本要件の範囲外。
- **`AC-HARNESS-L3-011-03` 相関付き結果（FR-HARNESS-L3-011）**：進行、終端または未完state、結果、証拠参照が同じ呼出しの相関IDで呼出し元へ返り、保存・表示や業務完了をHARNESSが代行しない。
- **`AC-HARNESS-L3-011-04` 停止・再開・期限（FR-HARNESS-L3-011）**：同じ論理operationを同じ冪等keyと記録済み途中stateから再開できる。expiry前・境界・経過後を区別し、期限切れまたは中断を成功としない。retry上限やexpiry期間の値は上流で指定されたと扱わない。

### `FR-HARNESS-L3-023` — 利用条件別の依存宣言（親: `HARNESS-L2-023`）

**保持／再導出**：各packの依存を次の4区分のいずれかにし、その条件とpack revisionへ束縛する。

1. 常時必須。
2. 特定operation時のみ必須。
3. 明示選択されたsource/providerに応じて必須。
4. 実行条件・成果・authorityを左右しない参照資料のみ。

入力条件から有効closureを決定し、同じ要求inputとrevisionで同じclosureと理由を再現する。未選択sourceは未観測とし、存在・不在・適格性・成功を推測しない。安全依存は該当条件下で必須のまま保持し、依存condition自体がunknownなら保留する。

**入力**：pack identity/source revision、HARNESS-L2-010/011のcontract revision、operation・target/scope、明示的source選択、依存identity・owner・contract版／rangeと条件、必要な既存権限・隔離・data-use識別子。

**出力**：依存ごとのclass・condition・version・ownerと、有効closure。必要、条件不成立による対象外、未選択／未観測、参照のみ、unknown/stale／保留を区別し、利用した依存の版・scope・理由をHARNESS-L2-011の相関付き結果／証拠へ結び付ける。

**境界・失敗時**：依存identity・区分・condition・version rangeの欠落／曖昧さ、条件の矛盾、unknown/stale、互換性不明では、条件をfalseや参照のみに読み替えず該当操作を保留する。同一要求のclosure欠落を口頭の人代行、暗黙の別source、参照資料で迂回しない。人が代行しても同じ権限・隔離・版照合・検証・記録とreceiptを要する。利用者が別sourceを明示選択した新入力は別要求としてclosureを再評価する。戻し先はpack契約owner、呼出しowner、authority ownerまたは上流L1/POのうち、欠落した意味を所有する者である。

**受入条件**

- **`AC-HARNESS-L3-023-01` 4分類と条件束縛（FR-HARNESS-L3-023）**：4分類、owner、版／range、適用condition、対象operation/sourceがpack revisionに結び付く。各fixtureで分類を別の分類へ暗黙変換しない。
- **`AC-HARNESS-L3-023-02` 有効closureと状態区別（FR-HARNESS-L3-023）**：常時必須、成立したoperation条件、選択source条件だけを有効closureに含める。条件不成立、未選択／未観測、参照のみ、unknown/staleは別状態として出す。未選択sourceの成功や利用可能性を推測しない。選択sourceの失敗から同じ入力のまま別sourceへ暗黙fallbackしない。利用者がsourceを明示再選択した新入力は別要求として再評価する。
- **`AC-HARNESS-L3-023-03` 安全依存と決定性（FR-HARNESS-L3-023）**：該当条件下の安全依存は必須としてclosureに残し、unknownな条件は保留にする。人が代行する場合も既存の権限・隔離・版照合・検証・記録を省略せず、source／actor／revision／scope／受領／検証receiptを返す。口頭受領だけではclosure evidenceにならない。分類能力自体は全依存実装の存在を成立条件にせず、missing／unknown状態を出せる。後続版の依存を1.0へ強制せず、1.0で必要な安全依存を後続版扱いで削らない。同じinput・pack revisionの再評価でclosureと根拠が一致する。

### `FR-HARNESS-L3-022` — 段階別検証・受入契約（親: `HARNESS-L2-022`）

**保持／再導出**：HARNESS-COREがProvisional→Integrated→Verified→Acceptedの段階別検証契約を持つ。L8/L9 pair evidenceはIntegrated、L10 system-specific obligations evidenceはVerified、L11 content oracleと当該revision/scopeへの利用者受入記録はAcceptedを支える。下位stage passやartifact/trace存在だけで上位へ進めず、意味変更が必要ならL2-003/004に従い左側へ戻す。OSまたは利用者環境がtest/CI実行、ticket、検収を担う。HELIX-OSを必須依存にせず、外部成果は同じrevision/pair/oracle/result/evidence条件を満たす段階まで持ち込む。

**入力**：対象artifact revision、対のL4/L5設計・L3要件・L2/L11条件、L8/L9/L10検証設計、各段階のoracle/result/evidence、L11利用者受入record。

**出力**：各状態と、その状態まで満たした段階別証拠、未評価/未完理由、差分の戻し先。出力は利用者受入recordやrelease decisionを生成しない。

**受入条件**

- **`AC-HARNESS-L3-022-01` 段階証拠の完全結束**：同一artifact revision/scopeについてL8/L9 evidenceでIntegrated、L10 system oracleと固有義務差分の照合でVerified、さらにL11内容oracleと利用者受入recordでAcceptedを別状態として確認する。
- **`AC-HARNESS-L3-022-02` 誤昇格の拒否**：下位単体/結合pass、CI green、artifact/trace/evidenceの存在だけでは固有義務不足を補えず、L10 passだけではAcceptedにならない。L11 record欠落/wrong revision/内容oracle failureでは実際に満たした段階に留める。
- **`AC-HARNESS-L3-022-03` 外部持込・差分戻し**：外部成果も同一revision・paired design/requirements/oracle/result/evidenceで段階評価し、不足は満たした段階に留める。振る舞いを保つ差分は同段階を再検証し、意味変更が要る差分はコードで合わせず親L2規則の戻し先へ返す。


#### 固定親・旧source locator

- 固定親 `docs/helix-harness/L2-requirements/product-requirements.md:447-462`、commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、全文SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、span SHA-256 `cdc55f82fe6c495c65285c170165c08de51477681adf097b62a5c8389deeb409`。PO判断 `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md`（基準main633bf12の全文SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`、行 51）。管理register `MPR-RC-HARNESS-L2-022-004` は追跡情報でauthority生成元ではない。
- 固定L11 `docs/helix-harness/L11-acceptance/product-acceptance.md:298-305`、全文SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`、span SHA-256 `e35f8ee929f5bfe2e57f1540856dcd6288d5f3d96f4438c9d86ef521d2967209`。
- 旧L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`、`LEGACY-ASSET-EE5DBACC7F28F7D1F605`、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`、行 38-57, 134-197, 198-307。旧test-design `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`、`LEGACY-ASSET-44DD86E3DEC09E65EF51`、SHA-256 `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`、行 32-90, 91-216。旧pillarのFR/AC量閉じとFR→AC trace構造は再利用し、段階別意味は現行L2から再導出。旧test-designのpositive/negative/boundary oracle形式を再利用するが、旧L10 UX、L12/HAT、CLI/CI/runtimeは移植しない。
- H022のL2はHARNESS-COREが状態遷移契約を所有し、実行/ticket/検収はOSまたは利用者環境、利用者受入recordはL11の責務とする。



### Stage 2b: 単体工程のL3要件（HARNESS-L2-012..020, 024）

各FRは固定L2の「受け取るもの」「提供するもの」「保証すること」「単独で成り立つための依存」をそのまま境界として展開する。前段のL2番号が小さいという理由だけで依存を追加せず、単体の工程を単独実施できる親では後続・先行の別工程を必須にしない。提案作成や検証設計はauthorityや実行許可を作らない。

#### `FR-HARNESS-L3-012` — 画面プロトと技術PoCの単体評価（親: `HARNESS-L2-012`）

**入力**：対象要求の範囲とrevision、画面の有無、技術的成立性の不確定事項、および各々の適用判断。要求はHARNESS-L2-013の出力に限らず、HARNESS-L2-019から取り込んだ既存文書でもよい。

**出力**：適用する画面PrototypeとPoCの結果を別々に記録し、要求へのbackflow候補と要求revisionへの影響を示す。適用しない場合は対象ごとにN/A、理由、判定者、HEAD、要求への影響、再評価条件を記録する。

**不変条件**：Prototype（画面の要求・見え方の合意）とPoC（技術成立性の証拠）を同一判定にしない。結果をbackflowし、必要な2次形成とDecideを経る前に要件へ進めず、試作／PoC成果をDecide前にproduction成果へ昇格させない。両方を常に必須とはせず、それぞれの適用性を判定する。

- **`AC-HARNESS-L3-012-01`**：UI適用対象ではPrototypeの対象要求・画面範囲・合意状態をPoCの技術結果と別に追跡し、Prototype結果がL2へのbackflowへ結び付く。
- **`AC-HARNESS-L3-012-02`**：非UI対象またはPoC不要の対象では各適用性を独立にN/Aとでき、理由・判定者・HEAD・影響・再評価条件のいずれか欠落を成功扱いしない。片方のN/Aを他方のN/Aへ伝播しない。
- **`AC-HARNESS-L3-012-03`**：適用したPrototype／PoCの結果に未解決事項がある状態で要件化・production昇格を試みると停止し、該当要求へのbackflow候補を示す。要求scopeに対象記述があればStage 2bの他工程を要求しない。

#### `FR-HARNESS-L3-013` — 要件定義の単体形成（親: `HARNESS-L2-013`）

**入力**：Concept・L1企画、利用者指示と根拠、Prototype／PoC結果（適用した場合のみ）、明示されたscope・non-goal。

**出力**：L2要求とL11受入の対、L3要件とL10総合検証の対を、未承認の草稿として提示する。単体・接続・構成体は別の要求identityにする。

**不変条件**：1次形成と結果を戻した2次形成を区別し、欠落、企画外追加、矛盾、重複、過剰解釈、対象違い、scope逸脱、変更影響を可視化する。人の承認なしに要件を確定せず、草稿から要求authorityや操作権限を作らない。入力がHARNESS-L2-019由来の既存文書でも同じ条件を適用する。

- **`AC-HARNESS-L3-013-01`**：入力scopeに必要な要素の欠落、矛盾、重複、企画外追加、non-goal逸脱を各々識別し、該当する入力箇所・影響先・backflow先を提示する。正常な未見要件は根拠が入力内にあれば排除しない。
- **`AC-HARNESS-L3-013-02`**：1次形成とPrototype／PoC結果を反映した2次形成を別revisionとして追跡し、前後差分と残存unknownを示す。結果が非適用の場合はN/Aの根拠を要求本文へ推測で補完しない。
- **`AC-HARNESS-L3-013-03`**：出力4文書（L2/L11、L3/L10）のpair identityと相互traceが揃っても、PO判断・承認・authority状態はpendingのまま。単体要求の形成に他工程を必須化しない。

#### `FR-HARNESS-L3-014` — Design Templateからの単体設計導出（親: `HARNESS-L2-014`）

**入力**：承認済みL3要件、工程契約、対象kind・構成・risk・domainと対応するDesign Template。必要入力に不足があれば不足箇所を特定する。

**出力**：L4基本設計、L5詳細設計、L6契約、および対応するL9/L8/L7検証設計を別々に追跡し、各設計義務を要件へ結ぶ。

**不変条件**：単体の設計義務を下位設計の束ねだけで満たしたことにせず、templateが要求入力を補う場合は質問またはbackflow候補を上流へ返す。TemplateやBRAIN connectorは要求の意味・authorityを決めない。

- **`AC-HARNESS-L3-014-01`**：同じkind・target・configuration・risk・domainの有効templateから単体設計義務と各対の検証設計が辿れ、template入力不足は未解決質問として示される。
- **`AC-HARNESS-L3-014-02`**：templateの要求意味を変える指示、単体要件を別kindへ流用する入力、下位義務だけで上位義務を充足させる入力を拒否し、根拠となる欠落／不一致とbackflow先を返す。
- **`AC-HARNESS-L3-014-03`**：connectorから得たtemplateまたは知識の出所・版が対応付く。connector出力だけでL3承認済みまたは設計確定にはならない。

#### `FR-HARNESS-L3-015` — 設計契約に基づく単体開発（親: `HARNESS-L2-015`）

**入力**：凍結済みL6契約、L5詳細設計、対の検証設計、ticketと検査項目の対応。

**出力**：契約へ双方向traceされたコードと検証証拠をProvisional状態で渡す。実施したCIおよびticket関係上省略した検査を区別して記録する。

**不変条件**：Red→Green→局所refactor→原子CIを契約ごとに閉じる。refactorはpublic contract、要求、architecture/stateの意味を変えない。原子CI成功を品質・システム成立・利用者受入・releaseへ昇格させない。CI組立・運転はHELIX-OS、外部利用者の環境では利用者のCIへ契約を渡す。Integrated以降はHARNESS-L2-022を参照する。

- **`AC-HARNESS-L3-015-01`**：実装変更には対応するL6契約、L7検証、Red失敗、Green成立、局所refactor安全性、原子CI結果が同一revisionで結び付く。正常な未見ケースは契約のoracleに合えば許容する。
- **`AC-HARNESS-L3-015-02`**：refactorが外部契約・要求・architecture/state意味を変更した場合、単体開発として閉じず適切な上流設計／要求へbackflowする。テスト追加やCI成功のみでその変更を隠さない。
- **`AC-HARNESS-L3-015-03`**：実行CIとticket上省略した検査を分け、未回収検査があれば状態をProvisionalのまま示す。実際のCI運転はOS／利用者環境へ委ね、HARNESSが実行authorityを主張しない。

#### `FR-HARNESS-L3-016` — 意味を保つ単体refactor（親: `HARNESS-L2-016`）

**入力**：実装済みコード、対の設計・契約、構造改善理由。Performance Refactorでは開始前にbaseline、budget、workload、profile、統計条件、回帰oracleを含める。

**出力**：外部境界と振る舞いを維持する改善差分、比較結果、または変更対象の適切なbackflow候補。

**不変条件**：契約・要求を保てる変更だけをrefactorとする。詳細契約差分はL5、architecture／境界はL4、要求／受入はL3/L2、製品価値はL1へ返す。右側変更で左側authorityを書き換えない。performance候補の具体値は測定可能な根拠・比較案とともに提示し、固定されていない数値を旧sourceから転記しない。

- **`AC-HARNESS-L3-016-01`**：通常refactor前後のpublic contract・要求・architecture/state意味を対比し、意味差分0の範囲だけをrefactorとして受理する。
- **`AC-HARNESS-L3-016-02`**：意味差分が見つかった場合は差分種別に応じL5/L4/L3・L2/L1へ返し、右側のみで上流内容を置換しない。変更なしの適格refactorを過剰に拒否しない。
- **`AC-HARNESS-L3-016-03`**：Performance Refactorはbaseline等6入力が実測可能な形で開始前に揃うことを確認し、いずれか欠落ならperformance比較を未評価として止める。L2にない特定thresholdは候補比較に残し、実測なしに達成扱いしない。

#### `FR-HARNESS-L3-017` — 単体製品のリリース契約（親: `HARNESS-L2-017`）

**入力**：HARNESS-L2-022に従いVerified/Acceptedとなった成果物、開発開始時から持つRelease Port条件、外部成果なら同じ受入条件のevidence。

**出力**：製品artifact identity、対象環境、依存・security条件、rollback、配備条件を含むrelease packetとRelease-eligible判定材料。

**不変条件**：必須Release Port条件を満たし、未回収検査がない対象だけをeligibleとする。同じ入力から再現可能な成果物と直前適格版へのrollbackを扱い、DeployedとObservedを区別する。これは利用者製品のrelease機構で、HELIX自身の段階release runtimeではない。配備実行はHELIX管理環境ならOS、利用者環境なら利用者の配備手段が担う。

- **`AC-HARNESS-L3-017-01`**：Verified/Acceptedと開始時点のRelease Port条件が同じartifact revision/scopeへ結び付くpositive caseのみeligible候補となる。外部成果でも同じ証拠を提示できれば評価する。
- **`AC-HARNESS-L3-017-02`**：未回収検査、必須条件欠落、別revisionのevidence、成果物identity不一致はeligibleにせず、不足条件を特定する。
- **`AC-HARNESS-L3-017-03`**：失敗時のrollback先と同一inputからのartifact再現性を比較し、配備済み状態から観測済み状態を推測しない。release packetは実際の配備を実行しない。

#### `FR-HARNESS-L3-018` — 単体製品の運用・保守要求接続（親: `HARNESS-L2-018`）

**入力**：配備済み製品、製品ownerが承認した運用品質要求と各要求の適用／N/A／unknown／決定owner。

**出力**：要求revisionに対応したobservability、L12運用評価、観測結果から要求への再要求化/backflow経路。

**不変条件**：designed、implemented、verified、observed、operatedを別状態として扱う。文書・実装・CIの存在だけで運用状態にしない。可用性等の共通数値SLOを新設せず、運用要求の適用判断をHARNESSが所有者に代わって決めない。HELIX内のruntime運転はOS、効果評価はLABO、利用製品固有基準は当該製品ownerに残す。

- **`AC-HARNESS-L3-018-01`**：配備済みrevisionとowner承認済み運用要求／適用性が対応付く場合だけ観測設計を評価し、欠落・unknownをsuccessへ変換しない。
- **`AC-HARNESS-L3-018-02`**：設計／実装／検証証拠だけを観測・運用済みとする入力を拒否し、観測値は対象revision、時点、要求ownerと結ぶ。
- **`AC-HARNESS-L3-018-03`**：要求を満たさない観測や要求自体の不足を該当ownerへの再要求化候補として返す。根拠のないSLO・保持期間・費用閾値を補わず、正常なowner定義の個別基準を一律閾値不在で拒否しない。

#### `FR-HARNESS-L3-019` — 既存成果からの逆方向要求形成（親: `HARNESS-L2-019`）

**入力**：任意のstageから持ち込まれる既存要求、codeまたはPoCとその利用可能なsource/owner/revision情報。

**出力**：HELIX形式の要求・設計・検証pair候補とtrace、およびunknown・変換不能・矛盾する箇所とその理由。

**不変条件**：どのstageからも既存内容を要求形成へ戻せる。正規pairへの変換は既存物の権威を推測せず、未確定内容をunknownとして残す。変換結果は草稿であり、要求・設計・releaseの承認済状態を生成しない。

- **`AC-HARNESS-L3-019-01`**：stage 1から後段各stageまでの入力例について、入力範囲・source・既知の親revisionを保ったpair候補とtraceを作る。入力が部分的でも変換可能部分を返す。
- **`AC-HARNESS-L3-019-02`**：source/revision/owner/意味の欠落・矛盾を個別にunknownまたは変換不能として一覧化し、暗黙に補った成功出力を拒否する。
- **`AC-HARNESS-L3-019-03`**：逆方向候補の完成・pair生成だけで既存要求や下流artifactを承認済み・release可能へ変更しない。

#### `FR-HARNESS-L3-020` — 隣接stage間の単体契約handoff（親: `HARNESS-L2-020`）

**入力**：開発方式の枠で隣り合う二stageの出力／入力契約、契約版、対象artifact/revision、双方のowner、未完検査・未解決事項・unknown・人の判断待ち、および各契約に必要なevidence。

**出力**：互換性を照合したhandoff結果、契約差分、引継いだ未完義務、または該当ownerへ戻す変更候補。

**不変条件**：前stage出力が次stage入力の契約を満たすことを接続単位で確認する。契約版不一致や必須field欠落は暗黙解釈せず保留し、未完義務を次の単位へ引き継いでも完了にしない。前stageを使わない外部成果もHARNESS-L2-019と同じ契約で照合する。単体開発④のProvisional出力は⑥へ直結させず、⑥にはHARNESS-L2-022でVerified/Acceptedとなった成果か外部で同じ条件を満たした成果だけを渡す。意味差は最上流の責任ownerへbackflowする。handoffは状態・authority・上流意味を書き換えず、release executionにもならない。stage番号の隣接だけで関連しない全stageの直列依存を追加しない。

- **`AC-HARNESS-L3-020-01`**：互換する隣接契約・同一artifact/revision・必要evidenceのpositive caseで、全入力fieldの対応とownerを記録してhandoff候補を出す。未完検査等は継続義務として保持され、引継ぎだけでは完了にしない。
- **`AC-HARNESS-L3-020-02`**：版不一致、必須入力欠落、異なるartifact/revision、責務外ownerを一つずつ変異させ、各欠落／不一致を特定して保留する。前stage未使用の外部成果でもHARNESS-L2-019と同じ入力契約を満たす正常caseは受け入れる。正規化可能な未知fieldは契約が許す範囲なら未見正常として受け入れる。
- **`AC-HARNESS-L3-020-03`**：④のProvisional成果を⑥へ渡すnegativeと、L2-022 Verified/Acceptedの同一条件を満たす成果を渡すpositiveを比較する。前者は止まり後者だけがrelease-unit受渡し候補になる。handoffで前後stageのauthority/stateを変更せず、意味差は該当上流ownerへ戻し、成功をreleaseや全段階完了に読み替えない。

#### `FR-HARNESS-L3-024` — 要求形成の質問優先と収束根拠（親: `HARNESS-L2-024`）

**入力**：engine／product pack revision、対象ConceptとL1 revision、指示・参照根拠のidentity/revision/scope、現在・prior candidate、既回答・訂正・defer・agreementとactor/owner、利用可能なiteration履歴と差分（固定件数を必須にしない）、矛盾・重複、actor/task、正常・取消・failure・timeout・recovery、P0/P1 surface、implicit requirement matrix、Prototype／非UIの適用性と、該当時にはHARNESS-L2-008の工程で得る合意・根拠、ならびに不確実性・影響・下流変更cost・人間専決区分。

**出力**：version/scope/sourceに結び付く要求candidateと意味差分、質問と既存open questionの状態、優先理由・影響範囲、矛盾・欠落・未確定事項、defer owner/re-entry、適用性と非適用根拠、残る人間判断の原文・選択肢・推奨・影響候補、収束判定と不足理由。候補は訂正・合意・採否待ちであり、approved requirement、L3承認、操作許可に昇格しない。

**不変条件**：同一target revision/scopeの既回答は再質問せず、既存open itemは同じidentity・owner・状態で継続する。再開時は新source/revisionまたはfinding、影響scope、意味差分を示し、影響項目だけをownerへ返す。質問順は影響・不確実性・下流変更cost・人間専決度の入力根拠を可視化し、同順位時はversioned pack inputに結び付くtie-breakを用いる。数値weight・固定質問数・固定iteration数を根拠なく設けない。必要な形成情報の不足と、人間確認・合意待ちを区別し、score、質問数、iteration数、timeoutだけで収束や人間判断を成立させない。Prototype／非UI合意が適用対象で未了でもcandidateと未決packetを返せるが、合意状態を作らない。

- **`AC-HARNESS-L3-024-01` 優先順位と再現**：影響・不確実性・下流変更cost・人間専決度の根拠と同順位tie-breakを入力し、同じcandidate・既回答・revisionから質問と理由の順序を再現する。順位根拠または必要tie-breakがない場合は未確定としてownerへ戻す。
- **`AC-HARNESS-L3-024-02` 重複・矛盾・再開**：同一scopeの既回答／open question、新根拠ありの合意再開、新根拠なしの再質問を比較する。既回答は重複せずopen itemを継続し、再開は影響identityだけをownerへ返す。理由なしの矛盾自動解消や全面stale化は不合格。
- **`AC-HARNESS-L3-024-03` 形成不足と人間待ちの区別**：actor/task、normal/cancel/failure/timeout/recovery、P0/P1、contradiction/defer owner/re-entry、implicit matrix、利用可能な履歴差分、該当時Prototype／非UI合意を個別に変異する。必須形成情報unknownは不足として示し、整ったdecision packetの人間確認待ちは候補として提示する。score・質問数・iteration回数・Issue/PR/沈黙から承認・要件採択・操作許可を生成しない。履歴がない／少ないことのみを不足にしない。

L3要件は親L2と異なる識別子を持ち、`FR-HARNESS-L3-<親番号>`から親へtraceする。対のAC IDは `AC-HARNESS-L3-<親番号>-<連番>` とする。L10 case IDは `CASE-HARNESS-L10-<親番号>-<連番>` とし、双方に機構prefixと親番号を含めて重複を避ける。AC本文は本書を正本とし、L10は同じAC IDを参照する。この採番は文書内trace用で、新しい承認・admission gateではない。


### Stage 3: 要求別計測・設計追跡・workflow・専門Worker

以下はfixed L2/L11の候補意味を機能条件・ACへ具体化する。source pinは`633bf12`のL2全文SHA `9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d`と各親のsemantic digestを基準にし、後続register metadataを承認根拠にしない。H041はe94838fのL11 699–715、semantic `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b`、H049はmain633 L11 802–816 semantic `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7`、H054はe94838f L11 865–876 semantic `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0`を使う。他10件は318ec4aの固定L11本文を参照する。L11全文SHAは318ec4aが`3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、e94838fが`216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7`、633bf12が`1f5c32b8ef8f50c1f3ca1780f0a25419e1d74034bb7827ff01d9725c1fd388c4`。候補はL3承認・実装・実行・releaseを生成しない。

| 親 | 固定L2登録・意味digest | 固定L11根拠 | L11意味digest |
|---|---|---|---|
| `HARNESS-L2-034` | `MPR-RC-HARNESS-L2-034-003` / `dee3a5ca82c62195e1ae7322e05c1dc624c9633a2abb77aa0ff1e943ae8c6156` | `318ec4a（固定L11）` | `391f640508944ba2f32b5751a2a9a17fbc9f89ef76f46953c1af68ba907a9fdf` |
| `HARNESS-L2-036` | `MPR-RC-HARNESS-L2-036-002` / `7a18c20e22c0cf65e8edcd3b3ca7eca7996d72c0358c874591407d77dbba4bbb` | `318ec4a（固定L11）` | `80e87d6469c45baa056fbc7415871725c3358f7392a87308c809d6bfe87f0ba4` |
| `HARNESS-L2-038` | `MPR-RC-HARNESS-L2-038-001` / `dd5b5450801617bbd6cc1dfd2e522420399ec58fb7675a286221dd0d9415767c` | `318ec4a（固定L11）` | `dfa3b4c245af3987ee7738cc4a3aa758bb8f113b9d06079362d978ff63731297` |
| `HARNESS-L2-039` | `MPR-RC-HARNESS-L2-039-003` / `e2a71f7961a3e8c7c241c7d1ef3238382d5d709296db2fb7e57a9dd0cd9215a0` | `318ec4a（固定L11）` | `63177feef3ec82d4e0a4bb5a56c7cfefdbe3666f0eb18f0a5d2934cfd1211746` |
| `HARNESS-L2-040` | `MPR-RC-HARNESS-L2-040-002` / `c349606d7798e3f4eb5e6cb31e0618a83dcfa05f9fc888b0ce618f6d160757df` | `318ec4a（固定L11）` | `366518f8e32ac4dda1e5f4ec88ef0cfed6bc363d597955ffffb1a82d706fc212` |
| `HARNESS-L2-041` | `MPR-RC-HARNESS-L2-041-003` / `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260` | `e94838f:699–715` | `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b` |
| `HARNESS-L2-042` | `MPR-RC-HARNESS-L2-042-001` / `7da6b3394cbc96bdf028a4738000554e1cf7a946595c4abf43504b24968f34eb` | `318ec4a（固定L11）` | `3ba00726800c61f1de165e48e6f62ea4359a368a50a9e9cd1517deb09df395f9` |
| `HARNESS-L2-043` | `MPR-RC-HARNESS-L2-043-002` / `da678d9181ebe76ae93084c27744d253c617ebe03b709d79f55b79d2abbc6666` | `318ec4a（固定L11）` | `583bfaf669729d3148e072be3ca74f1ef125997e933f6a1a94f08c732cb6f4b4` |
| `HARNESS-L2-044` | `MPR-RC-HARNESS-L2-044-002` / `690f2bfa866c778be47459baa99139905260d3ca569739a4d4707c61096212f2` | `318ec4a（固定L11）` | `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8` |
| `HARNESS-L2-046` | `MPR-RC-HARNESS-L2-046-001` / `47cc23b066cc970427a8b9193eda3be9cc06a43f19b7cb03e6f78a0116d6e01e` | `318ec4a（固定L11）` | `a8e99f7df7166566c04b1113b045851d8417e17e8078c034f8f2a34ebfe4f37f` |
| `HARNESS-L2-047` | `MPR-RC-HARNESS-L2-047-001` / `733201471492a400db194369980f54499faa7f7860e1e1465c18589a43daa9b9` | `318ec4a（固定L11）` | `8d92bb157dff9cffd87f72a43c2ce19977667a2fd928b5a3780f1f55912bdcb2` |
| `HARNESS-L2-049` | `MPR-RC-HARNESS-L2-049-003` / `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116` | `633bf12:802–816` | `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7` |
| `HARNESS-L2-054` | `MPR-RC-HARNESS-L2-054-001` / `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193` | `e94838f:865–876` | `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0` |

| 親／L3要件ID | 入力・出力・保証・境界 | AC IDと受入条件 |
|---|---|---|
| `HARNESS-L2-034` / `FR-HARNESS-L3-034` | 要求/NFR identity・revision、scope、対設計/受入、環境・workload/data、既決目標と根拠、測定結果/出所を受け、対象metricごとのmetric ID、対象、条件、baseline/target/許容差、sampling/window、probe、evidence、oracle、owner、実行layer、再測定triggerを区別したcontract candidateを返す。unknown値を既決扱いせず、必須metricの未測定/stale/非代表環境/未達を別completion状態で隠さない。測定実行はOSまたは利用者環境、選択時のみLABO/INFRASTRUCTUREが入力元となる。 | `AC-HARNESS-L3-034-01`: 適用metricの必須fieldと根拠を各々対応づけ、欠落を自由記述で相殺しない。`AC-HARNESS-L3-034-02`: 必須metricを未測定・stale・非代表・未達へ一つずつ変異しcompletion未完とする。他metric好成績やCI greenで相殺しない。`AC-HARNESS-L3-034-03`: 測定結果から要求合意、利用者受入、実行許可を生成せず、secret/PIIを必要としない測定境界を確認する。 |
| `HARNESS-L2-036` / `FR-HARNESS-L3-036` | ticket/revision/risk/profileで選択されたscopeの設計・test design・test-level定義を静的照合し、必要観点の抜け、level間重複、dev-local/CIのselected gate契約・版・scope差を個別に返す。L2-005の選択、省略、回収を保持し、実行・保存はOS、段階oracleは022が所有。合意済みscreen scopeがある画面対象では、`mock-promotion`（mockからの昇格）、`design-token-drift`（design token差分）、`a11y-regression`（accessibility退行）、`visual-regression`（表示退行）、`state-transition-drift`（状態遷移差分）の各DetectorResultを判定する。各軸の適用条件・oracle・入力・証拠を独立に照合し、根拠付き非画面だけを5軸適用外とする。 | `AC-HARNESS-L3-036-01`: 設計項目とselected profile観点を対応し、抜け/重複を個別に示す。unknownを0件にしない。`AC-HARNESS-L3-036-02`: 同一gate identity/content snapshot/version/scopeの正常系と片側のみ・旧版・別設定・別scopeの変異系を比較する。`AC-HARNESS-L3-036-03`: 5軸名を個別に追跡し、画面対象では各軸のoracle/input/evidenceを一つずつ除去またはfailへ変異する。どの一軸の欠落・failも該当scopeを保留またはfailにし、silent passしない。 |
| `HARNESS-L2-038` / `FR-HARNESS-L3-038` | 明示選択されたsource/Full Reverse scopeに限りcapabilityと該当requirement/basic design/test/detector-gate endpointをsource identity/revision/oracleへ双方向traceする。未作成endpointは将来必須artifactとせず未完義務として保持する。全旧source一括走査、外部data取得、snapshot/watermark/entity mappingを追加しない。 | `AC-HARNESS-L3-038-01`: 選択scopeのsource根拠・観測契約・as-is設計/test・意図検証・差分/routing endpointを両方向から辿る。`AC-HARNESS-L3-038-02`: 片edge、aggregate-only、同digest複製、根拠なしN/A/no-findingを変異し未完/unknownを返す。`AC-HARNESS-L3-038-03`: 後段未作成を未完義務として保持し、空欄/placeholder/checkpointで完了扱いしない。 |
| `HARNESS-L2-039` / `FR-HARNESS-L3-039` | 対象要求/screen/profile/source identity/revisionを用いExperience/UI/Frontend各契約、Full V/Scrum backfill適用性、PoC/implemented/ux_verified状態差、identity/screen-to-acceptance/risk-based pairwise/drift relationを提示する。FE実測結果は生成せず、必要時に036契約へ参照を渡す。旧field/schema/phase/runtimeを復元しない。 | `AC-HARNESS-L3-039-01`: 三契約とscope/revision/source identity、適用style branchを対応する。`AC-HARNESS-L3-039-02`: PoC・実装・UX evidenceを個別に変異し文書/実装存在だけで状態昇格しない。`AC-HARNESS-L3-039-03`: screen/acceptance relationと変更前後のdriftを比較し、stale/missingを示す。 |
| `HARNESS-L2-040` / `FR-HARNESS-L3-040` | HARNESS-L1のrevisionとcanonical pair表から、L1〜L12各層の台帳種別・記録粒度・node/edge構造・権限・出所・入出力・開始/終了条件・template契約候補、および独立したL0 authority anchorを列挙する。L0をlayerまたは7番目pairにしない。OSのwriter/snapshot/ticket運転は定めない。 | `AC-HARNESS-L3-040-01`: 12層、6つのcanonical pair、L0 anchorをそれぞれ識別する。`AC-HARNESS-L3-040-02`: sample rowのsource/revision/owner/statusと上下左右edgeを逆引きし、片edge/staleを未完とする。`AC-HARNESS-L3-040-03`: 未提示契約を存在済みとせず、catalogのみから承認/登録/実行/完了を生成しない。 |
| `HARNESS-L2-041` / `FR-HARNESS-L3-041` | L2-009で選択したactive template revision/scope、source span、ledger contract、extractor/versionから章/field/row/rule/done-when/pair-contractを原子的obligationまたは理由付きgapへ対応づける。HARNESSは抽出契約を持ち、template authority、writer、採択を持たない。 | `AC-HARNESS-L3-041-01`: 同一template/extractor inputから各対象obligationがatomまたはtyped gapへ個別対応しsource span/semantic digestを保持する。`AC-HARNESS-L3-041-02`: 空/TBD/未対応branch/extractor不能/重複/version-scopeずれを個別mutationしgapを提示する。`AC-HARNESS-L3-041-03`: 義務を分割または複数義務を束ねる変異でatomicityを失えば不合格。同一input/extractor semantic digestの一致を観測する。 |
| `HARNESS-L2-042` / `FR-HARNESS-L3-042` | 対象revision/scope、変更前後のdesign/contract/requirement/oracle、consumer、dependency graph、機能追加有無、rollback前提を用いDesign Refactor候補または既存Backflow先を返す。semantic evidence不足はunknown。機能追加をDesign/Performance Refactor episodeへ混ぜず、新gateやownerを作らない。 | `AC-HARNESS-L3-042-01`: 振る舞い保持変更positiveとpublic contract/要求/state意味変更negativeを比較し既存routeへ送る。`AC-HARNESS-L3-042-02`: name-only類似、consumer列挙不足、oracle/dependency missing/staleを個別に変異し成功候補を返さない。`AC-HARNESS-L3-042-03`: 同episode機能追加を拒み別episode候補へ分け、performance時は016契約を参照し閾値を新設しない。 |
| `HARNESS-L2-043` / `FR-HARNESS-L3-043` | active template/source revision、適用rule/branch分母、scope、oracle、risk根拠からrule/branchごとのpositive例とboundary-negative例、必要根拠があるrisk追加例をadequacy matrixへ結ぶ。例数だけで十分性を決めず、配置未決を新判断で解消しない。 | `AC-HARNESS-L3-043-01`: 各適用rule/branchにpositiveとboundary-negative、確認する条件/oracleを対応させる。`AC-HARNESS-L3-043-02`: branch、rule revision、risk根拠を個別mutationし、unknown分母をzero/N/Aにしない。`AC-HARNESS-L3-043-03`: scope内で根拠ある追加例を含めつつ、oracle適合の未見正常を拒否せず未選択scopeを混ぜない。 |
| `HARNESS-L2-044` / `FR-HARNESS-L3-044` | 選択scopeのrequirement atom/Design Obligation Graph/normative contract/対oracleと適用根拠からclass別割当、再利用/delta/new/根拠付きN/A、重複・未被覆を返す。025/026生成、041抽出、043例評価を置換せず、部品ownerを確定しない。 | `AC-HARNESS-L3-044-01`: 適用classごとのcontract traceを閉じ未被覆を識別する。`AC-HARNESS-L3-044-02`: 意味重複、根拠なしN/A、unknown/stale contractを変異し未完にする。`AC-HARNESS-L3-044-03`: 同義量産をfindingにする一方、単なる件数最小化で独立義務を落とさず、approval/writerを生成しない。 |
| `HARNESS-L2-046` / `FR-HARNESS-L3-046` | workflow revision/style/scope/pair evidenceからtransition/loop/terminal/exception/permission/timeout/notification/audit/data/switching/routing/resource obligationを照合する。Full Vでは対象system workflowを適用するL1〜L5設計層で段階的に明確化・freezeし、対応V-pairでsystem全体の条件を検証する。Production Scrum選択scopeまたは許可済み合成内のScrum部分だけにslice delta、Reverse/backfill、SR4 pair-freezeを適用し、他styleへ拡張しない。 | `AC-HARNESS-L3-046-01`: Full Vで適用するL1〜L5設計層のfreezeと各workflow obligationのpair/evidenceを対応する。freeze欠落を未完とする。`AC-HARNESS-L3-046-02`: Scrum適用/非適用を比較し、Full VはL1〜L5 freezeを要求する一方、Scrum非選択scopeへslice delta、Scrum Reverse、SR0〜SR4/SR4 receiptを追加しない。`AC-HARNESS-L3-046-03`: Scrum scopeのdelta→Reverse→L1〜L5 workflow/design backfill→必要なSR0〜SR4 checkpoint/SR4 freezeを順に照合する。 |
| `HARNESS-L2-047` / `FR-HARNESS-L3-047` | task/scope/revision/process/verification/oracle/domain/risk/judgment pack/single-worker comparison/LABO applicability evidenceからmuster candidate、existing role sufficient、unknown/deferを理由付きで区別し、必要時のみruntime-neutral contract candidateを作る。旧HIL-FR-59に沿いcontractはobjective、成果物schema、tool guidance、task boundary、context selectors、allowed/denied tool/path候補、model/effort class、budget、checkpoint、escalation、verification contractを持ち、input/output digest、generation rationale、guard validation結果に結ぶ。provider/model/worker数/共通閾値を定めない。 | `AC-HARNESS-L3-047-01`: benefitあり、single-worker十分、comparison unknownの3状態を理由付きで区別する。`AC-HARNESS-L3-047-02`: muster時だけ全contract fieldを生成し、各fieldの単独欠落/変更と同一入力・生成規則版の再生成を比較する。field coverage、input/output digest、generation rationale、guard結果の欠落や不整合はfindingとする。`AC-HARNESS-L3-047-03`: worker/verifier identity/context/authorityを分け、profile/lifecycle不明はdeferとする。同一provider/modelだけで独立性を判定しない。 |
| `HARNESS-L2-049` / `FR-HARNESS-L3-049` | fixed L11が定めるrenderable prototype、screen ID、target revision、利用許可、profile、device/view/viewportだけで測定候補を開始できる。対象checkはaccessibility、contrast、画面幅別の崩れ/はみ出し、empty/loading/error等の主要state、profileに基づく文言量である。各checkの結果型は個別のpass/fail/warning/unknownと根拠付き適用外で、未測定・適用外・unknownを区別する。prototype生成、Pattern選択、ID発番証拠、agreement、implemented/ux_verifiedは追加必須にしない。 | `AC-HARNESS-L3-049-01`: 最小入力と各表示条件を5種のcheckへ結ぶ。checkごとにoracle、手段/版、対象revision、結果型、証拠を返し、条件不足や未測定はunknownとする。`AC-HARNESS-L3-049-02`: accessibility、contrast、responsive崩れ/はみ出し、主要state、文言量を各別に変異し、既知positive/negative fixturesで誤検出・見逃しを計測する。精度未評価をpass根拠にしない。根拠なし文言上限を置かない。`AC-HARNESS-L3-049-03`: 上記最小入力の正常系と、生成/Pattern/ID証拠を余分に必須化する変異を比較する。測定結果でagreement/L3/L11 acceptanceを作らない。 |
| `HARNESS-L2-054` / `FR-HARNESS-L3-054` | 047 contract由来のtask/scope/revision、layer×drive/phase/task kind/verification pattern/oracle/risk/judgment packと必要なLABO/INTELLIGENCE evidence、既存OS assignment/profile/lifecycle、SECURITY authorityを適用条件に応じて結びtyped handoff候補を出す。HARNESSは割当・projection・budget/lease・起動を行わず未知軸はunknown/deferとする。 | `AC-HARNESS-L3-054-01`: muster/existing-role/unknownの入力と出力を対応し同一task/scope/revisionのOS既存assignmentへ照合する。`AC-HARNESS-L3-054-02`: layer/drive/phase/scope/revisionのmissing/conflict/stale mutationをunknown/deferへ返し新enum/mappingを発明しない。`AC-HARNESS-L3-054-03`: OS assignment/profile receipt missing/wrong scopeで未完とし、handoff/digest/受領からauthority・起動・検証を生成しない。 |

#### Stage 3 旧sourceの項目別対応

旧要件・受入設計は参照資料として読み、旧runtime/testを実行していない。旧L3のFR→AC→test trace骨格（HELIX pillar L3 `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、`docs/design/helix/L3-requirements/pillar-functional-requirements.md`全文SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）とpaired acceptanceの正常/反例/未見分離（`LEGACY-ASSET-44DD86E3DEC09E65EF51`、`docs/test-design/helix/L3-pillar-acceptance-test-design.md`全文SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`）は再利用する。旧HATのevidence列とnegative列もoracleの形として再利用し、旧ID・PO gate・layer番号・CLI/runtimeと固定数値は置換する。HAT対応は`docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`（全文SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`）の各行で確認し、現行親との完全一致を意味しない。

| 現行親 | 旧起点（asset／path／行／file SHA） | 項目別処置・paired test consumer |
|---|---|---|
| 034 | `LEGACY-ASSET-02319C2481B9E01698D5` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:245–252`、SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`; `LEGACY-ASSET-DB669724249A14A665F0` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34`、SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`には要求別計測契約の直接対応行がない。 | metric identity/condition/evidence/failure contractを再導出。IPA grade、旧率・timeout、DB/runtimeは置換。旧HATに同じ計測契約の直接対応行は確認できず、旧HARN `nfr-grade.md`とpaired acceptanceのoracle形式を参考にする。 |
| 036 | `LEGACY-ASSET-6B6C5CB0E481BE01088B` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:52` FR-L1-21、SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`; 同asset、同path`:53` FR-L1-22（5軸detector）、同SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`; `LEGACY-ASSET-5429AA05B022E9F49B0A` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:31,51` NFR-06/NFR-13、SHA `4853a43c5ea12354dc2dab20dc3a52b15ff6be075e49fdaf1bff26280e992122` | static gap/overlap fail-closeとscreen five-axis fail-closeを保持。`drive=fe`, hook, exit codeをticket-selected scopeへ再導出。旧HATにlocal/CI parityの直接対応は確認できず、旧HAT-HIL-15のapplicability/evidence形だけを参考にする。 |
| 038 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:112,125` HIL-FR-22/35, SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`; `LEGACY-ASSET-AFE91778057B7E76BEEC` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:62` HOT-HIL-35, SHA `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576` | selected scope双方向closureとHIL-FR-35の段階意味を再導出。R0-R4 schema・全旧source gateは置換。paired consumerの対応を`docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:45`（HAT-HIL-09、同ファイル全文SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`）で確認し、source/atom/coverageの形だけを参考にする。 |
| 039 | `LEGACY-ASSET-02319C2481B9E01698D5` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:265–277,385–392`, SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | Experience/UI/Frontend関係、Full V/Scrum backfill、state区別、identity/screen acceptance/driftの意味を再導出。旧registry/runtime/211-file intakeは除外。HAT-HIL-15（同旧acceptance設計:47行）のapplicability/walkthrough evidence構造を参考にする。 |
| 040 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:136` HIL-FR-46, SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | canonical 12層/6pair/L0 anchor契約を現行L1から再導出。旧registry/schema/DBを置換。HAT-HIL-18（同旧acceptance設計:50行）の片edge/stale/pair破壊をconsumer oracleの形として参照。 |
| 041 | 同asset `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:137` HIL-FR-47、同SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | active templateの原子的要素とgapを再導出。抽出器・storage schema・自動正本化を導入しない。HAT-HIL-17（同旧acceptance設計:49行）の`aggregate/TBD/N/A/stale` negativeを参考にし、採択済みL11-041 oracleはe94838f pinを使用。 |
| 042 | `LEGACY-ASSET-02319C2481B9E01698D5` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:119` §4.2 / `REQSRC-SUP-00089`, SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | design refactor semantic/consumer/oracle/dependency routingとfeature episode分離を再導出。old process schema/APIを置換。HAT-HIL-16（同旧acceptance設計:48行）の`lexical-only/誤route` negativeを参考にする。 |
| 043 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:145` HIL-FR-55、同SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | rule/branch別positive/boundary-negativeとrisk根拠を再導出。template例の固定冊数・schemaは置換。HAT-HIL-20（同旧acceptance設計:52行）のnegative欠落判定を参考にする。 |
| 044 | 同asset `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:144` HIL-FR-54、同SHA | obligation semantic class/portfolio coverageを再導出。old portfolio schemaと特定部品配置は決めない。HAT-HIL-20（同旧acceptance設計:52行）のcoverage/evidence/negativeの形を参考にする。 |
| 046 | `LEGACY-ASSET-02319C2481B9E01698D5` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:259,647` §4.4・§10、SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | workflow全体条件と選択時Scrum delta/backfillを現行L2-002/003に接続。旧ticket graph/runtime/schemaは置換。HAT-HIL-04（同旧acceptance設計:36行）のReverse/re-freeze negativeを参考にする。 |
| 047 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:61,82,149–150` HIL-BR-09/30, HIL-FR-59/60, SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | 必要時専門化、単一worker十分、runtime-neutral contract・guardを再導出。旧W-agent/TeamDefinition/provider固有schemaと数値thresholdを置換。HAT-HIL-21（同旧acceptance設計:53行）のovergrowth/self-verify negativeを参考にする。 |
| 049 | `LEGACY-ASSET-335176749F6322C3CD8D` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:49` VDH-FR-011, file SHA `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d`; legacy audit `LEGACY-ASSET-4E880D2FCD37879BA300` `archive/legacy-generation-2026-09-14/root/docs/governance/design-harness-assessment-audit-2026-07-19.md`全文SHA `9699f18b937dae6ec9edcbf18aba8d3d0854192baa217a02fee7ca67914cef56`. 別のHIL-FR-50（同旧L1:140行）はledger refactorを扱うため、049のsource atomとして扱わない。 | measurement-only scopeとstate/device/view evidenceを保持。精度fixture・文言量はcandidate測定で、新規固定thresholdなし。prototype generation/pattern/ID issuance evidenceは追加必須にしない。HAT-HIL-15（同旧acceptance設計:47行）のapplicability/evidence形を参考にするが、固定L11-049 main633 pinが優先する。 |
| 054 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:61,82,149–150` HIL-BR-09/30, HIL-FR-59/60、同SHA | 047のruntime-neutral contractとOS assignment handoffを責務別に再導出。OS profile/lifecycleは既存OS契約、HARNESSは割当/起動しない。HAT-HIL-21（同旧acceptance設計:53行）のguard/lifecycle receiptを参考にし、固定L11-054 e94838f pinを使う。 |

旧Functional L3/AC→paired acceptanceのID対応骨格（pillar FR/AC rows、asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`; paired source `LEGACY-ASSET-44DD86E3DEC09E65EF51`）だけを再利用し、各項目の現行意味は採択済みL2/L11から再導出した。HAT-HIL rowsはsupporting consumer/oracle資料であり、旧実装、approval/gate、旧test成功は引き継がない。

## 旧資産の項目別照合

行番号は`archive/legacy-generation-2026-09-14/root/`からの相対値。SHA-256はarchive本文の全文hash。旧test-designはsource上のconsumer／oracle資料として読んだのみで、旧test、CLI、runtimeは実行していない。

| 現行親とAC | 旧ID・path・行・全文SHA | 判断（再利用／再導出／置換） |
|---|---|---|
| HARNESS-L2-010／`AC-HARNESS-L3-010-01..03` | `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `docs/design/harness/L3-functional/functional-requirements.md:119–148` (FR-03), `149–172` (FR-04)、SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`; `LEGACY-ASSET-1B92155F959D7905DD1E` `docs/test-design/harness/L3-acceptance-test-design.md:60–66` (AT-FR-03/04)、SHA `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | FR-03のpair／trace欠落とFR-04の依存cycle negative shapeを再導出。pack identity・契約・owner・版の定義と宣言成果物は現行L2から具体化。旧4-artifact／12-edge数値、PLAN schema、実行例とAT-IDは置換し、移植しない。 |
| HARNESS-L2-011／`AC-HARNESS-L3-011-01..04` | 同じfunctional-requirements、FR-03 119–148行、FR-05 173–196行、および対のAT-FR-03 60–63行／AT-FR-05 67–69行。FR-08 257–280行（mode routing）とFR-09 281–310行（agent_mandatory／budget／lock）は非対応。全文SHAは上記functional／test-designと同一。 | trace/fail-closeのtest shapeのみ部分再導出し、呼出し境界は採択L2から具体化。旧CLI・mode routing・agent guardのpermission mechanism、bypass、timeout等の制限は本要件へ移植せず置換。authority policyはSECURITY ownerに残す。 |
| HARNESS-L2-022／`AC-HARNESS-L3-022-01..03` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:38–57,134–197,198–307`、SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90,91–216`、SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | FR/ACと段階別normal/negative/boundary oracleの構造は再利用し、現行L2の状態遷移・owner・evidence条件を再導出。旧51件/102AC・旧L10 UX/L12 HAT・旧runtime/CIは置換し移植しない。 |
| HARNESS-L2-023／`AC-HARNESS-L3-023-01..03` | functional-requirements FR-03 119–148行／FR-04 149–172行と、対のAT-FR-03/04 60–66行。上記2 assetと全文SHAは同じ。 | 旧FR-03/04の欠落・cycleをfailure patternとして再導出するが、`requires/blocks` graphと12 PLAN-kind enumは置換。4分類、条件束縛、未観測／unknown／stale／reference-onlyの意味は現行L2を直接の親とする。 |
| 方法・区分の起点 | `LEGACY-ASSET-9A772391C7FB1298D45F` `docs/design/harness/L3-functional/README.md:16–56`、SHA `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`; `LEGACY-ASSET-F542125805B777D8A56A` `docs/process/forward/L00-L06-design-phase.md:13–21,101,148–168`、SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`; `LEGACY-ASSET-B30F3C82B6B0FDC0D2A8` `docs/process/gates.md:41,64`、SHA `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`; `LEGACY-ASSET-6EBDB617A8104A7756D0` `CLAUDE.md:82–85`、SHA `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb` | FR+ACと対のtest-designを作る、functional／business／NFRを分ける、AC欠落を完了扱いしない、AIが起草し人がL3を承認する意味を保持。G3、旧UX L10、old CLI/runtimeによる承認・gate動作は移植しない。 |
| business/NFR scope確認 | `LEGACY-ASSET-A6E2C7F0565E5F804F06` `docs/design/harness/L3-functional/business-detail.md:21–39,84–104`、SHA `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`; `LEGACY-ASSET-DB669724249A14A665F0` `docs/design/harness/L3-functional/nfr-grade.md:21–34,58–81`、SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | BR-21の評価・着手条件は今回対象親の意味／ownerではないため再利用しない。NFRの測定可能性を記す骨格だけ再導出し、旧IPA grade、旧CI/runtime、placeholder、旧timeout・比率閾値は現行値にしない。 |

### Stage 2b 旧L3・test-designとの項目別対応

以下の旧資料は再構築の起点として読み、設計形・失敗類型・trace観点を必要範囲で再導出した。旧要求ID、旧schema、旧承認、旧runtime／CIの実行・権限、数値閾値は現行要件へ移植していない。source pathはarchive内の `root/` からの相対表記またはarchive prefix付きである。SHAはsource全体、raw span SHAは指定行の元bytesである。

| 現行親／FR・AC | 旧asset・source path・行・source SHA-256・raw span SHA-256 | 再利用／再導出／置換 |
|---|---|---|
| `HARNESS-L2-012` / `FR-HARNESS-L3-012`, `AC-012-01..03` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:143` SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`, span `92e81acddebb51ec40b38b06d6d783efdb2791679b18800eba1a9c2b808e7984`; `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:100` SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`, span `73b02fe42b055c094a9b314f2e8f7ff423649c897f068698e6745d6d782817ba`; `LEGACY-ASSET-63DEDB3F6F768B251BC5` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md:25–50` SHA `d72c002d485628ba059346b6af6a7233cead8bdf060a2630289d1c8148e0e26f`, span `45ba2ab8a9e13a15c78bea12407ef365c3523d45c06ac49d364affa6cff62455` | UI合意と非UI適用性receiptを区別するfailure shapeだけ部分再導出。現L2でPrototypeとPoCが独立しているため、旧L2.5一括必須化、old HAT/runtime、旧template IDは置換。 |
| `HARNESS-L2-013` / `FR-HARNESS-L3-013`, `AC-013-01..03` | `LEGACY-ASSET-E78B8D68CC327AA00991` `docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:42–67` SHA `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61`, span `2f7f1b7a91a6a3a010815024e890b78aac583d8c2be9b112daefee6762088611`; `LEGACY-ASSET-AD746F4F3487103519F9` `docs/test-design/helix/requirement-discovery-json-authority-acceptance.md:16–33` SHA `3462b3da8269668c848799b07305f2fe135d8902de02121c2048d5686d98dc0e`, span `d18a7f7febab4d92e0ab06cfd6d8b7b292de6640de915511fd49e75594fb82dc` | 欠落・矛盾・重複の指摘と1次／2次形成のtrace形を再導出。old strict JSON IR、append-only database、G1/G3 freeze、24-contract schema、legacy compiler stateは現行親の意味ではなく置換。 |
| `HARNESS-L2-014` / `FR-HARNESS-L3-014`, `AC-014-01..03` | `LEGACY-ASSET-5CBA32E9DB5B0FE05589` `docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:60–86` SHA `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae`, span `a829ca89909db20f52b388ff84c6d0cf4e15f0346af447fecaa3f15edf10a030`; `LEGACY-ASSET-0861E1D3646C7A28AAD0` `docs/test-design/helix/L3-design-registry-requirement-family-acceptance-test-design.md:28–45` SHA `bf4d0f0aba62f66e82c0f58c7134765f6c1fb0bcb7f00bb2324e6b2f729a1e9c`, span `e74821d0df3c2b209756df00c06ce53cfa32789e5dea2bc5df53a9a889522f68` | design obligationの分離、出所・kind照合、未登録／曖昧入力のnegativeを部分再導出。旧PO承認、family registry、loader、deprecated DB／runtime計画はauthorityを持たず、Design Template + BRAIN connectorの現親へ置換。 |
| `HARNESS-L2-015` / `FR-HARNESS-L3-015`, `AC-015-01..03` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `docs/design/helix/L3-requirements/pillar-functional-requirements.md:152–156` SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`, span `7f578d4094060ef80818228a59856e65c43109d351635c77665e5622684803be`; `LEGACY-ASSET-44DD86E3DEC09E65EF51` `docs/test-design/helix/L3-pillar-acceptance-test-design.md:109–110` SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`, span `ed59774fd92e816b4e4bca59369e00b14a00de2d9f2d19421f64066731540ada` | pair欠落とcoverage-only completionをnegative類例として再導出。旧L3-L7全gate、旧CI実行surface・旧runtimeを移植せず、現親のV谷、Provisional、OS/利用者CI責務を直接具体化。 |
| `HARNESS-L2-016` / `FR-HARNESS-L3-016`, `AC-016-01..03` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `docs/design/helix/L3-requirements/pillar-functional-requirements.md:152–156` SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`, span `7f578d4094060ef80818228a59856e65c43109d351635c77665e5622684803be`; `LEGACY-ASSET-B7E240E4CE0263FDBDF6` `docs/test-design/helix/L5-pillar-integration-test-design.md:20–60` SHA `0bf20d470daba6a63b515ebd0d53509ee24c64df2c9e6bd6235e7874af23a8f5`, span `af36a201fce44f0b5210efe7306dc18ae2d562b9d9354bd5950b6da8b1d035eb` | 上流設計／要求への戻し分離とintegration failure観点だけ近接類例として再導出。旧pillar資料に現行L2-016と一対一一致するperformance-refactor FRを確認できず、L2-016の必須baseline/workload/profile/statistical-condition/oracleから再導出。旧数値は根拠にしない。 |
| `HARNESS-L2-017` / `FR-HARNESS-L3-017`, `AC-017-01..03` | `LEGACY-ASSET-A2F6A697D7FFFD490B57` `docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:82–100,123–131` SHA `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c`, spans `e02b17fc5f52ea6c5b26d37ed65f52520153ac25ff40ebc697a27c210c308f6c` / `008e6a506cdca651baec2484f34d2ac964ed9949f4d5355e9afc190fc53c7f88`; `LEGACY-ASSET-35C7D2CCFBDA7AAD304D` `docs/test-design/helix/release-module-bundle-composition-acceptance.md:22–42` SHA `71600a710a31b47c1db3434d68fd6135366058f1c591df489a57a51732cd423b`, span `dffeae81102d651da3deac3ce8f1f3e05c6184fa1b0f80e6cb2ded558d3a24a8` | 同一inputのartifact再現、release後責務とrollbackの観測形を近接類例から再導出。旧Module/Bundle schema、initial fixed set、semver/channel、DevOS promotion、外部release gateを再利用せず、製品単体のRelease Port/eligible/Deployed対Observedへ置換。 |
| `HARNESS-L2-018` / `FR-HARNESS-L3-018`, `AC-018-01..03` | `LEGACY-ASSET-17C4BF78919578FEBB18` `docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:66–143,173–197` SHA `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`, spans `50d4c5e38f722eb52928f1d46b9c23a1786ce620fd323eadf0da236075954602` / `708296f405a8db744740d061f379b4d6a42eaa72532527c2e6fb5ee9d57675f1`; `LEGACY-ASSET-F46AB11BD14F2C0469F4` `docs/test-design/helix/product-lifecycle-operations-acceptance.md:22–47` SHA `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58`, span `9b8c3ce8ca0576117398150e5758e3dc66e5aa00dc46f0c15c221339156eee00` | lifecycle stageの明示、artifact/実状態の分離、観測欠落のnegative形を再導出。旧EnvironmentContract/DeploymentManifest/IncidentRecord schema、staged promotion、credential/infra権限、固定運用基準は移植せず現L2とowner境界に置換。 |
| `HARNESS-L2-019` / `FR-HARNESS-L3-019`, `AC-019-01..03` | `LEGACY-ASSET-02D897E62EF2FA267267` `docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:78–169` SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`, span `9a11817f29ed1c541c8259aede0b0e93df1a6f105e57b31bddfcda90a4a593dc`; `LEGACY-ASSET-0B5B38F146D9538C9A36` `docs/test-design/helix/universal-improvement-loop-acceptance.md:16–43` SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`, span `7c229fcaadeab4ea8d4156c2ae146dbf34b47ffaf8af79c6ca2deb713e3b0c3e` | partial input、unknown保全、入力境界とresult traceの形を再導出。旧candidate schema、detector registry、state machine、DB projection/replay、AI-independent runtimeを移植せず、固定L2-019の任意stageからの逆方向形成と未承認境界へ置換。 |
| `HARNESS-L2-020` / `FR-HARNESS-L3-020`, `AC-020-01..03` | `LEGACY-ASSET-A2F6A697D7FFFD490B57` `docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:123–131` SHA `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c`, span `008e6a506cdca651baec2484f34d2ac964ed9949f4d5355e9afc190fc53c7f88`; `LEGACY-ASSET-B7E240E4CE0263FDBDF6` `docs/test-design/helix/L5-pillar-integration-test-design.md:20–60` SHA `0bf20d470daba6a63b515ebd0d53509ee24c64df2c9e6bd6235e7874af23a8f5`, span `af36a201fce44f0b5210efe7306dc18ae2d562b9d9354bd5950b6da8b1d035eb` | adjacent release/lifecycle responsibility and integration handoff failure are analogous test shapes only. Old exact bundle composition and its version graph are not the L2-020 stage contract; adjacent-producer/consumer version agreement, unresolved mismatch and state non-mutation are newly derived from the fixed current parent. |

旧processの工程定義、旧L3のFR+AC／paired test-designの分離、旧gatesの「AC欠落を完了扱いしない」形、自律境界の「人は上流要求・要件承認、AIは要件起草以下を進める」点を、本Stage 2bの起草方法として保持する。旧番号を現L2に連番対応させず、旧acceptance designを現L10そのものとも呼ばない。旧asset/sourceの全文は記載SHAで固定され、旧資料やtest/runtimeは参照のみで実行していない。

旧Functional FR-05のdeterministic checkは説明可能な判定の参考にするが、旧G3・環境変数bypass・監査機構を置換対象とする。FR-08はmode routing、FR-09はagent-specific guardであり、HARNESS-L2-011の一般呼出しcontractの根拠にはしない。旧test-designのfrontmatterは`layer: L3`、`executed_at_layer: L12`である。このHARNESS旧paired test-designを旧L10と呼ばない。現行L10はL3↔L10対応を新しい総合検証として設計する。

### HARNESS-L2-024の旧source照合

| 現行親／旧ID | 旧source（asset／path／行／全文SHA-256） | 判断（再利用／再導出／置換） |
|---|---|---|
| `HARNESS-L2-024` / `FR-HARNESS-L3-024` | `LEGACY-ASSET-E78B8D68CC327AA00991` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:48,52` SHA `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61`; `LEGACY-ASSET-AD746F4F3487103519F9` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/requirement-discovery-json-authority-acceptance.md:22,26` SHA `3462b3da8269668c848799b07305f2fe135d8902de02121c2048d5686d98dc0e`; `LEGACY-ASSET-63DEDB3F6F768B251BC5` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md:30–43` SHA `d72c002d485628ba059346b6af6a7233cead8bdf060a2630289d1c8148e0e26f` | RDJ-FR-003の質問優先入力・重複拒否とRDJ-FR-007の収束項目を意味の起点として再導出。旧「直近2 iteration」を最低件数にせず、現在の固定L2/L11の利用可能履歴・差分条件へ置換。旧JSON正本、schema/compiler/runtime、G1/G3 gate、固定ID・数値weightは移植しない。Prototype test-designは適用性・合意の条件付き観測だけを参照し、Prototypeを全対象で必須化しない。 |

## 固定親が直接参照する旧FRS候補の照合

固定L2-023本文は旧FRSの`FRS-BR-004/005/009`、`FRS-R-12/13/14/23`、`FRS-AC-012/013/014/025`を明示的な保持点として挙げる。L2-010のpack境界にも、旧FRSが扱った単一behavior contractの所有・成熟度分離の隣接類例がある。旧FRS文書はarchive上では`version: 0.2.0`、`status: draft_candidate`のままであり、v0.2をformalizationへ進めるPO判断（`L3-PO-1494-002`）は候補内の明記である。現行のauthority・採択をそれらのファイルから継承しない。今回の固定親の判断は、固定L2/L11と現行PO decision recordから読む。

| 現行親 | 旧ID・path・行・全文SHA | 再利用／再導出／置換の判断 |
|---|---|---|
| HARNESS-L2-010／`FR-HARNESS-L3-010` | `LEGACY-ASSET-B75E46DBE77592351574` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:60–92`（FRS-R-01/02/04/05/06）、SHA `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17`; `LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23–36`（FRS-BR-001/003）、SHA `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20`; `LEGACY-ASSET-67ADFAB856D954B3C5D2` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:37–39`（FRS-AC-004/005）、SHA `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | 単一behavior contractを識別する考え、ownerを一意にしversion/maturityを上位構成から分ける観点を部分再導出する。現L2のpack owner区分（release unit／component／core）、pack・release unit・製品の版分離、適格packの可視性を正本とする。旧`Functional Release Slice`というModule／Bundle間の独立昇格単位、Slice schema/channel、exact Bundle profile、旧owner enumとpromotion義務は本親の意味として再利用せず置換する。候補の旧PO記載はcurrent authorityではない。 |
| HARNESS-L2-023／`FR-HARNESS-L3-023` | `LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:38–46,64–67`（FRS-BR-004/005/009）、上記SHA; `LEGACY-ASSET-B75E46DBE77592351574` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:127–142,209–212`（FRS-R-12/13/14/23）、上記SHA; `LEGACY-ASSET-67ADFAB856D954B3C5D2` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:45–47,58,73–81`（FRS-AC-012/013/014/025とtrace表）、上記SHA | 固定L2が名指す変更影響trace、local検証とdependent closureの両立、unknown／ambiguous／staleの安全処理、安全依存をoptional化しない観点を部分再導出する。現4分類・pack revisionへのcondition束縛・未観測source・人代行時の同義務とreceipt・後続版境界は現L2本文から具体化する。旧Module→Slice→Bundle graph、旧Slice単位のpromotion／verification profile、旧state/schema、候補ACとそのgateは移植しない。 |
| HARNESS-L2-010（artifact比較の類例のみ） | `LEGACY-ASSET-9B7682EBDEA171005D45` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:17–29,81–84`（旧`HR-FR-HYB-008`、DIST-LITE-R-03）、SHA `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`; `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:17–32,41–44`（ST-DIST-001/004/005/006, DIST-LITE-AC-004/005/007）、SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | 同じ固定source／artifact contractからのdigest比較と再生成に限る近接failure/oracle類例。旧document自身がdistribution/consumer packageと区別し、旧test-designはremote actionを実行対象外としていた。本L2-010の個別pack contractへdistribution repository、Lite profile、Node package、promotion channel、remote release authorityを追加する根拠にはしない。 |

この直接照合は、archive内の`docs/governance/candidates/functional-release-slice-{requirements,requests,acceptance}.md`と、distribution-package-releaseの旧L3／paired system test-designを全文readし、asset ledger行444、818–820、2806でasset IDと記録SHAを照合した結果である。上記5ファイルのarchive bytes SHAも実測し一致した。FRS名・IDの検索範囲は旧`docs/governance/candidates/`、`docs/design/helix/L3-requirements/`、`docs/test-design/helix/`であり、今回の固定親に対する直接参照先と隣接artifact類例を特定する調査である。archive内すべての旧要求・consumerを網羅したとの主張ではない。旧L3/L10はいずれもread-only参照であり、実行していない。

## Business範囲

Stage 1、Stage 2a、Stage 2bの固定親から独立したbusiness criterionを追加しない。012–020は工程・技術contractであり、売上・優先順位・投資条件など別の事業判断を定めない。旧business-detailのBR-21を移植せず、事業価値判断はL1／そのownerに残す。これはHARNESS-L3全体のbusiness要件を非適用とする判断ではない。

## PO承認依頼用要約（承認未取得）

この部分草稿の既存対象に加え、HARNESS-L2-012..020の単体工程を対のL3/L10へ展開する。PrototypeとPoCを分けた適用判定・backflow、1次/2次要求形成、Template由来設計とpaired verification、Provisionalまでの単体開発、意味保持refactor、製品固有releaseと運用観測、任意stageからのreverse形成、隣接stage handoffの各責務を固定親のscopeで具体化する。各工程の出力から承認・権限・release実行を生成せず、別ownerの責務と既存固定親の意味を維持する。

技術候補は、同じ宣言成果物のdigest一致（contractがmetadataを非意味として明示する場合のみ正規化を許す）、単一pack差替え時の対象外変更0件、同一key再開時の重複効果0件、期限後success 0件、同じinput/revisionからのclosure・理由の完全一致である。比較案とL10観測は[nfr-grade.md](nfr-grade.md)と[nfr-verification.md](../L10-verification/nfr-verification.md)に記載する。数値の根拠がない処理時間・retry上限・TTLは設定せず、L2意味の変更が必要になった場合だけ上流へ戻す。

## Stage 2c — HARNESS-L2-030／031／032（部分草稿追補）

この追補はStage 2cのHARNESS三親だけを対象とする。他機構・他Stageの未起草項目を完了扱いにせず、L3承認・実装・実行許可も表さない。要件IDは親IDと区別し、ACを本書の正本、L10を同じAC IDの総合検証設計とする。

### 固定親と版

3親は固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の `docs/helix-harness/L2-requirements/product-requirements.md` にある。全文SHA-256は `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`。

| 親 | PO判断／登録 | 固定spanとdigest | 旧sourceとの対応（再利用・再導出・置換） |
|---|---|---|---|
| `HARNESS-L2-030` | [判断L59](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L59)、`MPR-RC-HARNESS-L2-030-002` | 607–626、normalized SHA-256 `579043ac6abf9bff8712355ff96da3cd6287b286947074a11efc583c1f38e0a1` | 旧 `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md`（全文SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`）のFR-02（95–115）はTDDのRed→Green→refactor順序であり、生成caseの入力/出力traceの直接起点ではない。旧AC形式の前提・操作・期待結果という書き方のみ保持し、caseのmeaning/traceは現L2-030と014/022から再導出する。FR-03（119–148）は宣言pairの双方向traceと、不在下流義務の検出（absence-blind是正）の類例として限定参照する。旧test-design `LEGACY-ASSET-1B92155F959D7905DD1E` `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md`（全文SHA `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`）AT-FR-02（57–63）のpositive/negative/boundary構成は形式上参照するが、旧TDD oracleやgate意味は持ち込まない。テスト生成pack・014/022依存・外部contract限定doubleは現L2から再導出し、旧CLI、test runner、旧workflow gateを置換・移植しない。 |
| `HARNESS-L2-031` | [判断L60](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L60)、`MPR-RC-HARNESS-L2-031-002` | 627–646、normalized SHA-256 `ca1e113a5980df023bdb27bb461e1fc57137d14da060d26180e4d70abdf90611` | 旧FR-16（454–476）は本番incidentのrouting/hotfix/postmortemであり、reduction生成の直接起点ではないため業務意味を再利用しない。FR-25（574–610）と旧AT-FR-25（121–125）は回帰candidateの振る舞い比較という隣接例に限って照合し、現L2-031の許可log/input、sanitization、oracle、外部副作用抑止、同一failure再現条件を再導出する。旧incident command、coverage threshold、legacy DB、旧runnerは採用しない。 |
| `HARNESS-L2-032` | [判断L61](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L61)、`MPR-RC-HARNESS-L2-032-002` | 647–666、normalized SHA-256 `83967a4eb0b9671293bc0d6006652c0ca42648836e108f6093c01e55ff77c569` | 旧FR-02（95–115）はTDD順序でありartifact/oracle traceの直接起点ではない。ACの前提・操作・期待結果形式を参照し、case identity/oracle/consumer schema/版の意味は現L2-032から再導出する。FR-03（119–148）のpair traceと不在義務検出、およびFR-25（574–610）の回帰candidate比較は隣接例として照合する。旧CI、ticket、test実行・green判定を接続packへ持ち込まず置換する。 |

### 3親に共通する依存と不足時の戻し先

| 親 | 常時／選択時に必要な依存 | 不足・unknown・不一致時の処置とowner |
|---|---|---|
| `HARNESS-L2-030` | 常時、case生成packのidentity/version・依存契約（HARNESS-L2-010）と呼出しinput/scope/compatibility/receipt契約（HARNESS-L2-011）の採用済みrevisionを照合する。source利用権限と対象data class、target revision/scope、選択source/contractのidentity/versionも必要。 | 010 pack定義や011 call契約の不足・staleは該当契約ownerへ戻す。source利用権限/data class不明・不一致は該当sourceまたはSECURITY authority ownerへ戻し、そのcaseを保留する。 |
| `HARNESS-L2-031` | 常時、031 pack/callについて030と同じ010/011のidentity/version・scope・receipt契約、入力取得利用権限、security/data-handling・sanitization条件、対象revision/scopeおよび外部副作用抑止条件を確認する。 | 010/011契約の不備は契約ownerへ、取得範囲はsource ownerへ、permission/data class/security条件はSECURITY authority ownerへ戻す。どれか不足・unknownなら機微inputを処理せずcandidate生成を保留する。 |
| `HARNESS-L2-032` | HARNESS-L2-010/011と選択consumer（OS-020または利用者CI）の宣言schema/version/compatibility、必要runner capabilityと利用permissionを確認する。依存閉包は選択したconsumerに限る。 | 選択consumerまたは011 call契約の不足・版不一致は当該契約ownerへ、capability/permission不足は該当executor/permission ownerへ戻してhandoffを保留する。未選択consumer/sourceはunobservedのまま保持し必須依存にしない。 |

旧L3構造の形式根拠は `LEGACY-ASSET-9A772391C7FB1298D45F`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md`、全文SHA `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`、lines 16–56）と旧L3定義 `LEGACY-ASSET-F542125805B777D8A56A`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md`、全文SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`、lines 13–21, 101, 148–168）である。FR→AC対応とfunctional/business/NFR三分割の形を再利用し、旧gateは現行承認手続きへ移さない。旧test-design `LEGACY-ASSET-1B92155F959D7905DD1E` は受入oracleの参照に限り、実行していない。

### `FR-HARNESS-L3-030` — 検証caseとfixture候補の生成（親: `HARNESS-L2-030`）

承認済み要件、対象revision/scope、HARNESS-L2-014の対設計、HARNESS-L2-022の適用oracleを入力として、scenario/case family、actor・前提・操作列、再現可能なtest data、必要な限定external-service double、traceと未解決条件を候補として出す。期待値・権限・操作境界を入力contract/oracleにない形で作らない。生成caseは候補であり、実行結果・coverage・欠陥不存在の証拠ではない。doubleは明示選択した外部contractの限定stubであり、実serviceへの接続や全面同等性を主張しない。

**受入条件**

- **`AC-HARNESS-L3-030-01` 根拠とtrace**：各生成物が要件・対象revision/scope・L2-014設計・L2-022 oracle・選択source/contractのidentityと版へ追跡できる。同一固定入力と版を再評価しても、生成条件とcaseの意味を再現できる。欠けたsource identityは未観測として明示する。
- **`AC-HARNESS-L3-030-02` oracle非創作**：選択されたoperationとその入力oracleで定義されたnormal/boundary/permission/cancellation/ordering familyだけを候補化する。特定operationの選択や仕様がない取消・権限familyを各runの必須caseにしない。選択されたfamily内で仕様のない期待応答、permission、state transitionを補う場合はその候補を拒否または未確定にし、coverage数やcase数で矛盾を相殺しない。
- **`AC-HARNESS-L3-030-03` doubleの限定と非実行**：選択contractが定める応答・失敗・副作用条件に限るdoubleを生成し、実service接続を行わず、stubを実service全面同等と表示しない。生成物の存在を実行済み・合格と判定しない。
- **`AC-HARNESS-L3-030-04` 共通依存の適合**：HARNESS-L2-010 pack revision、HARNESS-L2-011 call revision、caseのsource利用permissionとdata classが揃う場合だけ該当caseを確定する。いずれかの不足・unknown・不一致はcaseを保留し、010/011契約ownerまたはsource/SECURITY permission ownerへ理由付きで戻す。未選択sourceはunobservedとして必須依存にしない。

### `FR-HARNESS-L3-031` — 許可入力からの最小再現・回帰候補（親: `HARNESS-L2-031`）

対象revisionとの関係・scope・取得利用許可・sanitization・独立oracle・外部副作用抑止条件を確かめたbounded log/inputから、reduction手順、sanitized reproduction candidate、回帰test candidateを作る。入力の再送で外部副作用を再実行しない。元failure identityと証拠を保持し、縮小後の同一failureは選択executorから後続receiptを得て同じoracle violationを確認するまで未確認とする。root causeがunknown、または再現に必要なenvironment evidenceが不足する場合はその状態と不足項目を保持し、cause/reproductionを確定済みとしない。修正後passは別revisionの後段証拠であり、候補作成の前提ではない。回帰candidateは本番incidentに限定しない。

**受入条件**

- **`AC-HARNESS-L3-031-01` 入力許可・副作用抑止とsanitization**：合成入力または同scopeの許可済み入力から、secret/PIIを露出しないsanitized candidateを作る。入力再生で外部call/状態変更を再発生させない。許可、target revision結合、副作用抑止、sanitizationのいずれかがunknownなら入力処理とcandidate確定を保留し、取得元/permissionまたはoperation ownerへ戻す。
- **`AC-HARNESS-L3-031-02` oracleを保つ縮小とunknown保持**：縮小前failure identity、各reduction段階、固定oracle、scope/source version、再現に必要なenvironment条件を記録する。後続の032経由executor receiptが同一対象で同じobservable failureを確認したときだけその段階を再現候補として確認済みにする。別failure・failureなし・oracle不一致は同一再現として扱わない。root causeがunknownでも根拠のあるreductionは候補として記録できるが、原因を補完しない。environment条件が不足する場合は未確認とし、不足証拠と戻し先を示す。
- **`AC-HARNESS-L3-031-03` 候補と後段resultの分離**：修正後result receiptなしでも回帰candidateを生成できるが、修正後passや回帰成立を主張しない。後段で別revisionを実行したresultを別証拠として結び、rerun greenで元failureを消去・skipしない。
- **`AC-HARNESS-L3-031-04` 共通依存の適合**：HARNESS-L2-010 pack revision、HARNESS-L2-011 call revision、入力取得permission、対象data classおよびsecurity/data-handling条件が一致する範囲だけを処理する。どれかが欠落・unknown・不一致なら機微inputを処理せず保留し、該当契約、sourceまたはSECURITY permission ownerへ戻す。未選択source/executorはunobservedとして必須依存にしない。

### `FR-HARNESS-L3-032` — 検証artifactの選択executor向けpacket化（親: `HARNESS-L2-032`）

case/reproduction artifactのidentity、適用oracle/検証義務、source version、target HEAD/revision/scope、選択consumerの宣言schema/version/compatibility、必要なrunner capabilityとその利用permissionを、選択したOS-020または利用者CIのrun-input packetへ写す。HARNESSはoracleと対象意味を保持し、executorは隔離実行・結果収集を所有する。受渡しreceiptはpacketのhandoff後に、その受渡しを記録する。run resultはexecutor実行後の結果であり、どちらも初回packet生成・handoffの前提ではない。

**受入条件**

- **`AC-HARNESS-L3-032-01` packet対応**：HARNESS-L2-010 pack revision、HARNESS-L2-011 call revision、選択consumerの宣言schema/版へ適合し、case identity、oracle参照、source version、target revision/scope、必要runner capabilityおよびその利用permissionが一致するpacketを作る。schema、revision/scope、oracle、個々のrunner capability、permissionのunknown/mismatchはいずれも保留し、別consumerや別scopeへ暗黙fallbackしない。未選択consumer/sourceはunobservedとして記録し必須依存にしない。
- **`AC-HARNESS-L3-032-02` 責務とreceiptの順序**：受渡し前に受渡しreceiptもrun resultも要求せずpacketを構成・送信できる。受渡しreceiptはhandoff後に渡した内容の事実だけを示し、run resultはexecutor実行後に返る。いずれもtest pass、HARNESS受入、OS ticket、完了を生成しない。隔離実行・結果は選択executorの責務であり、返却されたrun resultを別段階の入力／証拠として結ぶ。

このStage 2c追補のversion targetは固定L2の `1.0` 候補のままとする。親scope、owner、採択状態は変更しない。

## Stage 4 — HARNESS-L2-026..029（対の部分草稿）

各親の固定L2/L11はbase 633bf12の採択revisionで照合した。対象登録は追跡情報であり、承認の根拠は固定判断記録である。旧sourceは完全一致でなく項目別に部分再利用または再導出する。以下のIDは文書内traceで、新しいgateではない。

### FR-HARNESS-L3-026 — 設計artifact間のtrace（親 HARNESS-L2-026）

026はHARNESS-L2-014が選択する設計サービスの内部unit/packであり、第二の利用者向けserviceではない。入力は承認済みL3/対象revision/scopeとする。常時依存はHARNESS-L2-009設計義務、Design Template対応契約、HARNESS-L2-010 pack contract、HARNESS-L2-011 call contract、HARNESS-L2-022 paired verification contract、およびCOREとBRAIN connector各契約のidentity/version/compatibilityである。026は014の完了receiptを入力前提とせず、宣言されたL3と設計入力から構成できる。出力は要求からscreen/flow/state、API/command、permission/actor、domain data/DB invariant、oracleまでtraceされたL4/L5/L6と、対応するL9/L8/L7の対の設計であり、対応義務は省略しない。

個別BRAIN Patternはその知識を使う時だけ選択依存であり、BRAIN connector契約そのものは常時必須である。UIを扱う操作だけでprototype/非UI合意とscreen contractを依存に含める。個別oracleはUI/非UIを問わず各設計対象に適用される場合に必須とする。非UI操作にUI証拠を強制しない。競合Pattern制約は根拠、影響、代替候補と共に示し、解消を創作しない。026 pack交換時は014とのinput/output contract version、scope、compatibility、paired acceptanceを再照合し、不一致/staleなら014設計提供をholdする。

**受入条件**

- AC-HARNESS-L3-026-01: 正常fixtureは009/010/011/022、CORE contract、BRAIN connector contract、Template contract、承認済L3、対象revision/scopeを区別して結び、014内部unitとしてL4/L5/L6とL9/L8/L7の対応成果をすべて持つ。各設計対象で適用されるoracleを各verification設計へ結ぶ。例として「承認後は申請を編集できない」の要求から承認state遷移、API/command precondition、actor別permission、UI編集拒否、DB不変条件へtraceし、014完了receiptが未発行でも候補を構成できる。
- AC-HARNESS-L3-026-02: 各常時義務（009/010/011/022、CORE、BRAIN connector、template、各出力対のいずれか）を一つずつ欠落・stale・version不一致にする。該当必須義務がhold/uncoveredとなり、他義務で相殺しない。014 receipt欠落だけを理由にholdしてはならない。
- AC-HARNESS-L3-026-03: UI操作と非UI操作、Pattern選択と未選択を対にする。UI操作ではprototype/非UI合意とscreen contractを条件付きで照合するが、oracleはUI/非UIを問わず各対象設計に適用される場合必須とする。選択Patternはidentity/version/compatibility/applicability/required input/relation/counterexampleを全て照合し、未選択Patternは未観測のままにする。競合する選択Patternは制約・根拠・影響・代替を示し、代替も要求不変条件oracleを満たす。
- AC-HARNESS-L3-026-04: 026交換fixtureでは014 input/output version、scope、compatibility receipt、paired acceptanceを一つずつ欠落/stale/mismatchとする。014側提供をholdし、旧新contract混在や誤適合を成立扱いしない。要求や採否の変更を作らない。

旧Design Registryと旧pillar L3のartifact/requirement trace形式を部分再利用する。sourceの完全なpath・行・hashと再利用範囲は下記source mapに記す。旧設計意味、旧Pattern選択規則、旧runtimeは再利用しない。

### FR-HARNESS-L3-027 — 静的source observation（親 HARNESS-L2-027）

027はHARNESS-L2-019が選択するsource型の抽出unit/packである。019のintake/result boundaryは常時接続するが、019完了receiptおよびsaved design revisionを027単体の前提にしない。019が027対応source型を選んだ利用時は、019から対象/source type/scope/versionを結ぶinput contractを受け、027のobservation receiptを019のresult boundaryへ返す。010のpack identity/version/dependencyと011のcall input/scope/receipt契約、許可されたsource snapshot/digest/read boundaryは常時必須。対象は明示選択された静的code、DB/schema、API定義、configurationであり、source spanごとに抽出候補・unknown・unsupported・conflictを返す。挙動は観測候補であって、要求意味、承認設計、runtime実測とは表示しない。

**受入条件**

- AC-HARNESS-L3-027-01: fixtureのcodeがstatus != draftなら409で終了し、amount > maxなら422でpersistに到達せず、draftかつamount <= maxならpersist後200を返す構造を持つ場合、source revision/digest/scopeとread permissionを結び、guard、副作用順、各応答を根拠spanごとのobservation candidateとして出す。019 result-boundaryがない単独実装receipt、保存design、要求承認は入力に要求しない。
- AC-HARNESS-L3-027-02: status条件、amount/max条件、persist順序のいずれかを一つずつ欠落/逆転させる。sourceに書かれた挙動の候補は実際の分岐とpersist到達/非到達に合わせて正確に変化する。原形の拒否branchはpersistへ到達しない。変更sourceで記述が変わった挙動を隠す/原形の期待で上書きしない。候補を要求正しさやruntime実測と誤表示しない。
- AC-HARNESS-L3-027-03: 019 input contract/source type未選択、010/011 pack/call version不一致、source digest/scope/read permission missing/staleを独立に与える。必須入力はhold/unknown、未選択typeはunobservedとする。runtime、実顧客DB値、書込み、permission拡張は0。未対応構文・矛盾sourceはunsupported/conflictとして保持する。

旧UWJ/HILのsource identityとfailure-classは近接類例に限り、static extraction semanticsは現行L2から再導出する。下記source mapに直接・隣接根拠と検索限界を記録する。

### FR-HARNESS-L3-028 — observationと保存設計の照合（親 HARNESS-L2-028）

028は027 valid source receiptを、同一product/scopeのcurrent saved design/model revisionとrequirement traceへ接続する。比較候補に使うsaved revisionは対象revision/source/authority状態が特定できればよく、未承認でも比較候補にできる。approvedとの主張だけはそのrevisionに結び付くapproval receiptを必要とする。authority状態がunknown/staleならapprovedへ昇格せず、対象比較は保留する。常時依存は対象product/scope、current saved design/requirement revision、027 receipt、003/004 affected/unaffected/unknown/backflow contract、010/011 connection version contract。未選択baselineは未観測。known trace scope外、逆引きできないrelation、confidence/filename similarityだけの影響はunknownでありunaffectedにしない。Full Reverseは由来不明・trace欠落・比較不能の復旧時に限り、通常の狭い比較を置き換えない。新design delta proposalの事前承認は要求しない。

**受入条件**

- AC-HARNESS-L3-028-01: 027 valid receipt、現在のsaved design revision/source/known authority、requirement relation graphを与える。未承認でもcomparison candidateとして既知scopeを比較し、affected exact set、根拠edge、保存custom logic、unknown relationを出す。approved表示は当該revisionのapproval receiptがある場合だけ許す。
- AC-HARNESS-L3-028-02: 027 receipt、saved revision、authority stateを一つずつmissing/stale/unknownにする。対象比較はholdし、approved claimは必ず拒否する。known-currentで未承認の正常比較はapproval receipt不足だけでは拒否しない。
- AC-HARNESS-L3-028-03: 003/004で既知のaffected/unaffected scopeと、known reverse map外の未見helper/API relationを与える。known relationだけを分類し、未解決relationをunknownのまま残しunaffectedにしない。semantic changeは親L2へbackflowし、右側patchで隠さない。

旧L3/AAFDはsource receipt・exact-set・unknown/authority non-writeの類例として部分再利用し、現行のsaved-design connectionと影響判定は固定親から再導出する。

### FR-HARNESS-L3-029 — 差分に基づく往復改修案（親 HARNESS-L2-029）

029は027 extraction receipt、028 comparison receipt、そこで照合した対象revision/source/authority状態が既知のcurrent saved design/requirement revisionを常時受け取るcomposite candidateである。approved claimにはsaved revision対応のapproval receiptが必要だが、生成する新しいdesign delta proposalの事前承認は要求しない。010/011/003/004/022の適用契約、affected/backflow relation、proposal identity/scopeも常時必要とする。output bundleは相互traceされた5区分: (1)限定design delta、(2)関連APIだけのcode repair案、(3)必要時だけのdata/schema migration案、(4)対象外custom logicと保持理由、(5)backflow・verification obligations・unsupported/unknown一覧。API contractはAPI repairを選ぶ時のみ、source/target schema・data owner・loss/rollback/compatibilityはmigrationを選ぶ時のみ必要。どちらも選ばない操作ではno-change rationaleを出せる。proposalは実変更ではない。

**受入条件**

- AC-HARNESS-L3-029-01: 同一source/scope/revisionの027 raw observation receipt、028 comparison receipt、saved design/requirement revision、適用契約を結び、上記5 bundle区分を別々にtraceする。保存revisionは既知で常時必要。approved claimは対応approval receipt付きに限る。proposal事前承認なしでもcandidateを構成できる。
- AC-HARNESS-L3-029-02: API repairを選んだfixtureでは該当API contractのみを必須化する。migrationを選んだfixtureではsource/target schema、owner、loss/compatibility/rollback oracleを個別に欠落させholdする。どちらも選ばないoperationは関連依存なしでno-change rationaleを出し、migration案を創作しない。
- AC-HARNESS-L3-029-03: 単一API proposalの局所成立とcomposite全体成立を別状態にする。custom logicを保持し、unknown/stale、義務欠落、scope混在ではbundle全体をsuccessとしない。書込み、migration実行、承認、saved design authority変更は起こさず、意味変更を要すれば上流へ戻す。

旧FR-14 reverse、multimodal authority、AAFD差分sourceは隣接failure/identityの類例に限定し、029の5 bundle/composite意味は現行固定親から再導出する。詳細pinは下記source mapに記す。

### Stage 4 fixed-parent pins

固定親はmain 633bf12のPO採択revisionに固定する。後続register metadataはPO決定ではない。decision row SHAは行末LFを含むphysical row bytesで計算した。L2/L11 spanの行末LFを含むraw hashとsemantic digestはcapture済み根拠と一致する。

| 親 | 登録／採択判断row | L2 path・行・raw SHA・semantic digest | L11 path・行・raw SHA | 固定commit／decision・L2・L11 file SHA |
|---|---|---|---|---|
| HARNESS-L2-026 | MPR-RC-HARNESS-L2-026-002 / docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L55 / row 1d99dc64d0a60bc8235913cd08de8be6d24d3a2142d55c422bce601bdac2acfd | docs/helix-harness/L2-requirements/product-requirements.md:530–543 / 445574626f02ccd6ed198ac0f48241d9e667293dbff98375889e5d5e1676ddc5 / sha256:d797f5d29526059783ea6e469f762b6d51373dbece7223f2941894130c73b880 | docs/helix-harness/L11-acceptance/product-acceptance.md:332–341 / 4b93df3509eeadc3c6559bd4ab1d1d5e595ddead2fcca64a56db2804fd1bbca9 | 633bf12ea8f948db8ba3d6600179c4a9507377a7 / decision c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23 / L2 9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d / L11 1f5c32b8ef8f50c1f3ca1780f0a25419e1d74034bb7827ff01d9725c1fd388c4 |
| HARNESS-L2-027 | MPR-RC-HARNESS-L2-027-003 / docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L56 / row be4c2ce7a7115c4c04d6739e6dd2b45641575bf930ed1a5885d7facadd034b39 | docs/helix-harness/L2-requirements/product-requirements.md:559–572 / b474e7dfe6078ca7332c08ca3f6de76195f28295f71c38c7be84cf67b55d0990 / sha256:fb81f7e465ebd7db2f06a7115f14b6a651b2886ead17d493618475c61aa60032 | docs/helix-harness/L11-acceptance/product-acceptance.md:365–374 / 51a0376766f5c4286ede0ce1b63f5d5e569fd489be9d119797446f9c1b00ed11 | 633bf12ea8f948db8ba3d6600179c4a9507377a7 / decision c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23 / L2 9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d / L11 1f5c32b8ef8f50c1f3ca1780f0a25419e1d74034bb7827ff01d9725c1fd388c4 |
| HARNESS-L2-028 | MPR-RC-HARNESS-L2-028-003 / docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L57 / row 8e395792e3256c724d01a4639f3a247bb3f8b09c4b443a031b85340a26c701be | docs/helix-harness/L2-requirements/product-requirements.md:573–586 / ea6dc1d2839d5fc4eb376f7ef8549f8a136304db86918f159852b5d19a7c005c / sha256:2a53752750ef477ad34862966fbe220c9e0849bdbec05e101d0125de234fc174 | docs/helix-harness/L11-acceptance/product-acceptance.md:375–382 / 66bfaaeb98d93d670ee10674da23f98ec2d78aa6b42fbc332014725f139673b9 | 633bf12ea8f948db8ba3d6600179c4a9507377a7 / decision c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23 / L2 9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d / L11 1f5c32b8ef8f50c1f3ca1780f0a25419e1d74034bb7827ff01d9725c1fd388c4 |
| HARNESS-L2-029 | MPR-RC-HARNESS-L2-029-003 / docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L58 / row 1e813eccb7e66e0ccad549147313bc24c99116822c102bbe76fd3f2c6dee827b | docs/helix-harness/L2-requirements/product-requirements.md:587–602 / 962fd655dd41d81497dfea4fecb195b344804a1ef23b256bb019f84a23eea662 / sha256:6838658a8b4cf61e1b519675d87ea86ea68b66928af0990ee23a161d99d88e5b | docs/helix-harness/L11-acceptance/product-acceptance.md:383–392 / 4767c7ae3e5ea61306a96d2fe0cc4e6320aa8361cc1a25964105265fdb2aaac5 | 633bf12ea8f948db8ba3d6600179c4a9507377a7 / decision c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23 / L2 9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d / L11 1f5c32b8ef8f50c1f3ca1780f0a25419e1d74034bb7827ff01d9725c1fd388c4 |

PO判断根拠はdecision rowで、register IDは追跡用である。version target 1.0の候補はL3草稿の範囲に限り、release内容や実装許可を意味しない。

### 旧L3／test-designとのStage 4 source map

旧L3/test-designは項目ごとに部分再利用または再導出する。下表のasset ID・archive path・行は旧資産台帳と照合し、span hashは指定物理行の終端を含むraw bytesから算出した。旧test-designは参照のみで実行していない。

| 対象親 | 旧source asset | archive path・lines | full SHA-256 | raw span SHA-256 | 再利用・再導出・置換 |
|---|---|---|---|---|---|
| HARNESS-L2-026 | LEGACY-ASSET-5CBA32E9DB5B0FE05589 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:64–80 | 4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae | 82d55c6cccad2872c3527ba3e868fa0367d826ae067f74e8dd8dfcb9a79efed6 | requirements catalog→screen traceのsource identity/version trace形式を部分再利用。旧registry family、parser、lifecycle、承認済み判断は移植しない。 |
| HARNESS-L2-026 | LEGACY-ASSET-EE5DBACC7F28F7D1F605 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:134–197 | 7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544 | 747723b54908e79652e347ab529875943afc051fc9f9182d149481f01475e5a0 | 要求/成果relationとFR→AC閉包の形式を部分再利用。現行設計artifact・CORE/PATTERN責務は固定HARNESS-L2-026から再導出。 |
| HARNESS-L2-026 | LEGACY-ASSET-D11F51092619506417E4 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/multimodal-design-harness-authority.md:56–69 | baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2 | 6e641fd453f9e2d8556f2a73017d6f82f2cfe1423ba14cb0ad835655bcb5bd1b | design artifact/authorityの隣接類例として部分再利用。旧authority意味・実行契約は移植しない。 |
| HARNESS-L2-027 | LEGACY-ASSET-1E45495250B6F9793189 | archive/legacy-generation-2026-09-14/root/docs/research/mcp-external-verification-profile-research-2026-06-09.md:28–36 | 08801af5be5429204827c0ce2e0adcacaee74bf5fa72b07a9d1c403c16dc330b | 81dde9dea84226a83b9c557ab7e97eff5905dc70c8301f3ae7d8750f1af4c7fb | 外部verification profile情報のsource/identity要素を隣接類例として部分参照。旧probe安全性・実行可能性・permissionを継承しない。 |
| HARNESS-L2-027 | LEGACY-ASSET-DC0AE3267D63F3525BAE | archive/legacy-generation-2026-09-14/root/docs/governance/hybrid-engine-requirements-extraction-gap-audit-2026-07-19.md:14–14 | 345928addace631d97f902b391fe6656581c1ff2caea1f94587149e008a98e70 | e7058b243f55074b242dcdcd0c847a353cf890dac5554cf08dfa9bc2ce25dff4 | 旧検索時点のMCP profile L1/L3 hit 0という不在範囲の証拠。新要件の承認根拠にはせず、current static observationはL2から再導出。 |
| HARNESS-L2-028 | LEGACY-ASSET-EE5DBACC7F28F7D1F605 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:198–307 | 7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544 | 7f3326adfef43b9fbcc3542cf2351058a87af78e7952875c7bc95f0343f985d5 | requirement/source trace形式とfailure backflowの類例を部分再利用。保存designとの現行exact set照合は固定親から再導出。 |
| HARNESS-L2-028 | LEGACY-ASSET-44DD86E3DEC09E65EF51 | archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90 | df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6 | 0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228 | normal/negative/boundary oracleの構成形式を部分参照。旧HAT/L12/runtime/gateは移植しない。 |
| HARNESS-L2-029 | LEGACY-ASSET-17C4BF78919578FEBB18 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:74–84 | ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0 | 9786e0423a3a973e4c4d8265b965ac72cdd00b9445bb9dbde272fe9cb4078166 | release/deploymentとrollback contract境界の類例のみ部分参照。現行proposal生成・API/DBの条件依存は固定親から再導出。 |
| HARNESS-L2-029 | LEGACY-ASSET-23D3D9769B093AFDCC25 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:62–70 | f840e16cab80b88fa4e4730ed49f47f0afeee2050cad309a3d87da4cce057ec6 | 50e04feabdd91d74265cc8d0812b9a6c32fac1cfe6fa6e80c86afcb0e715367f | 統合sequenceと責務境界の類例を部分再利用。現行HARNESS proposal採択・実行意味には置換しない。 |
| HARNESS-L2-029 | LEGACY-ASSET-F46AB11BD14F2C0469F4 | archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:20–36 | 19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58 | b39cba60ebbd8080776a96ab23433a3a5dc8f5734fedb0ff820d3b7ea48eb6c6 | release/deployment分離のtest oracle類例を参照のみ。旧test/runtimeは実行せず、現行L10 oracleはHARNESS-L2-029から再導出。 |
| HARNESS-L2-027 | LEGACY-ASSET-B5B5E71B2AF1459D59A1 | archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:406–426 | a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a | b4421ef1da6769e4068c9d3dd8d4f656a39e5777b74ebaab734f271744caf8cb | Reverseの入力source/evidenceと候補出力という旧境界を部分参照。旧CLI、R0–R4、routing/gateは移植せず、static unit意味は現行親から再導出。 |
| HARNESS-L2-027 | LEGACY-ASSET-D11F51092619506417E4 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/multimodal-design-harness-authority.md:56–69 | baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2 | 6e641fd453f9e2d8556f2a73017d6f82f2cfe1423ba14cb0ad835655bcb5bd1b | 旧candidate/verified/approved/canonical lifecycleと状態非飛越の類例を部分参照。現行observationsもcandidateとしauthorityは生成しない。 |
| HARNESS-L2-027 | LEGACY-ASSET-D11F51092619506417E4 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/multimodal-design-harness-authority.md:128–140 | baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2 | 49a6c04341a9c2879ecd7f05fe2071e2575467f1681711ce2a4aac69dbe77a08 | reverse source tuple/digest/uncertainty/findingの類例を部分再利用。confidenceや旧extractor方式は現行挙動の根拠にしない。 |
| HARNESS-L2-028 | LEGACY-ASSET-D11F51092619506417E4 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/multimodal-design-harness-authority.md:56–69 | baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2 | 6e641fd453f9e2d8556f2a73017d6f82f2cfe1423ba14cb0ad835655bcb5bd1b | candidateとapprovedの別状態を保持する隣接類例。現行saved design comparison authorityはHARNESS-L2-028から再導出。 |
| HARNESS-L2-028 | LEGACY-ASSET-EB3700B0088F311C2295 | archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:50–78 | 685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a | 5544e2dcb2be5090f6a75fe2423953ca377b51de795b92456544af7c7f31a296 | source receipt、exact affected set、unknownとauthority non-writeの類例を部分再利用。AAFD future-state schema/runtimeは移植しない。 |
| HARNESS-L2-029 | LEGACY-ASSET-B5B5E71B2AF1459D59A1 | archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:406–426 | a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a | b4421ef1da6769e4068c9d3dd8d4f656a39e5777b74ebaab734f271744caf8cb | reverse evidenceとforward routingの候補境界を隣接例として参照。現行5区分composite bundleは固定親から再導出。 |
| HARNESS-L2-029 | LEGACY-ASSET-D11F51092619506417E4 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/multimodal-design-harness-authority.md:56–69 | baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2 | 6e641fd453f9e2d8556f2a73017d6f82f2cfe1423ba14cb0ad835655bcb5bd1b | candidateからapproved/canonicalへ自動昇格しない意味の部分類例。現行candidate approval条件は親L2から再導出。 |
| HARNESS-L2-029 | LEGACY-ASSET-EB3700B0088F311C2295 | archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:50–78 | 685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a | 5544e2dcb2be5090f6a75fe2423953ca377b51de795b92456544af7c7f31a296 | stable source receipt・exact delta set・unknown・authority non-writeを類例として部分再利用。現行proposal bundle所有や出力schemaには置換しない。 |
検索範囲は旧L3 asset台帳に結び付く上記L3とpaired test-design、旧MCP profile researchおよびそのgap auditに限定して記録した。旧sourceの不在は内容差分の理由ではなく、要求意味は採択済み現行L2/L11から起草した。


## Stage 5 — HARNESS構成体・導出・二段設計の部分草稿

固定親はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7` 時点の採択本文と判断記録で照合した。以下の文書内FR/AC番号はtrace用であり新しいgateではない。L2の意味、owner、scope、version targetを変えない。HARNESS-L2-021は274 rosterに基づく1.0起草対象だが、個別`version_target`印はなく、リリース収載もここでは決めない。025/033/035/037のversion targetと適用範囲は各固定親に従い、Stage 5という順序記録だけから適用を全対象へ広げない。

### FR-HARNESS-L3-021 — 統合したHARNESS構成体の端から端保証（親 `HARNESS-L2-021`）

一つの同一対象revision/scopeで、要求形成から設計、実装、検証・受入（022）、release、運用保守、L12観測・実績評価から要求へ戻る受け口までのtraceをつなぐ。構成体固有の端から端義務、横断NFR、統合版更新/rollback、L12運用検証を個別release unitの成功と別に観測し、各段階のownerと未完義務を保持する。LABO/OSは評価と改善案・実行を所有し、HARNESSは評価結果を要求へ戻す受け口を持つだけで、改善を実行しない。

**受入条件**
- `AC-HARNESS-L3-021-01`: 同じ対象revision/scopeに対する上流要求、L3/L10、L4/L9、実装・L8、L2/L11、release、L1/L12の対応と各ownerを示す。選択scopeで端から端traceが閉じ、段階別の未完・unknownも残る場合だけ構成体候補を成立とする。異なる対象revisionの証拠を混ぜない。
- `AC-HARNESS-L3-021-02`: release unit各々のpassだけがあるfixtureと、構成体固有trace・横断NFR・統合版更新/rollback・L12検証も揃うfixtureを比較する。unit passのみでは構成体成立にしない。必要fieldを一つずつ欠落/staleにした場合は該当義務を未完とする。
- `AC-HARNESS-L3-021-03`: 観測・評価結果に要求への受け口がある正常例と、受け口なし/評価結果をHARNESSが自動実行する反例を照合する。HARNESSは提案を受け取って要求へtraceできるが改善を実行せず、評価・実行ownerをLABO/OSへ保持する。未見の評価種別は根拠ある対応だけを受け入れ、適用範囲不明ならunknownとする。

### FR-HARNESS-L3-025 — 要求から整合した設計と対oracleの構成体（親 `HARNESS-L2-025`）

対象は一つの要求/L3 revisionと選択scopeに対する026設計unit出力の端から端整合である。026の個別unitを再生成せず、要求→画面/API/command/permission/state/domain data→適用oracleと対の検証設計を双方向に結び、要素間の横断invariant・failure pathを照合する。BRAIN connector契約は常時必須、選択Pattern利用時だけそのPatternのreceiptを追加する。選択されていない知識の実装完成を要求しない。UI証拠はUI scopeで条件付きだが、各設計対象に適用される個別oracleはUI/非UIを問わず必要。026は025の完了を待たず構成・出力でき、025は026結果を検査する。採択・承認・実装・利用者受入状態を生成しない。

**受入条件**
- `AC-HARNESS-L3-025-01`: 同じrevision/scopeで要求から設計要素、横断relation、不変条件、各適用oracleとverification designまで両方向traceできる正常例を照合する。026 receiptとBRAIN connector契約があり、Pattern非選択なら未観測を記録し、不要なPattern receiptを要求しない。
- `AC-HARNESS-L3-025-02`: 片方向trace、要素間のpermission/state/data矛盾、承認後編集経路の一つ残存、または適用oracle一件の欠落をそれぞれ変異する。該当scopeをuncovered/holdとしunit成功をcomposite成功へ集約しない。UI evidence欠落はUI scopeでのみ不合格、非UIにUI evidenceを要求しない。
- `AC-HARNESS-L3-025-03`: 026 receipt、常時BRAIN connector契約、対象revision/scopeの各欠落/staleを個別に与え、影響範囲をholdする。選択Patternを使う別fixtureではそのidentity/version/required relation/receiptを照合し、未選択知識は未観測とする。未知の設計要素でも既知の不変条件を保持すれば受け入れ、oracle/適用性が未定なら未評価とする。

### FR-HARNESS-L3-033 — failureから回帰候補までのtrace構成体（親 `HARNESS-L2-033`）

対象operationに応じ、030通常caseまたは031許可incident縮小の少なくとも一方を選び、必要時のみ032 consumerを接続する。初期入力は対象revision/scope、022 oracle、対設計または許可済みincident source、unit pack identity/version、選択consumerの互換情報。将来の生成receipt、run結果、修正後passを開始条件にしない。候補生成、縮小前後の同一failure確認、回帰candidate、修正前fail/修正後passの後段receiptを段階順にtraceし、「回帰成立」を主張するoperationは全後段条件を必要とする。実行はOSまたは利用者executorのownerで、HARNESSはfailure意味や実行authorityを所有しない。

**受入条件**
- `AC-HARNESS-L3-033-01`: 選択unit、対象revision、022 oracle、source identity/version/scopeを結び、通常caseを生成する。incident inputがない通常operationに031を必須化せず、後続resultがない候補を「回帰成立」と表示しない。
- `AC-HARNESS-L3-033-02`: incident operationでは許可/sanitization、副作用抑止、original failure identity、各reduction段階を保つ。別failure、oracle違い、同一failure未確認をそれぞれ変異し、再現確認を保留する。修正を選ぶfixtureだけ、別revisionの修正前failと修正後pass receiptを後段結果として加える。
- `AC-HARNESS-L3-033-03`: 032を選択した場合だけ選択consumer/schema/version/permissionを照合し、delivery receiptとrun resultを区別する。032未選択はunobserved。consumer不一致、選択unit欠落、oracle unknownは該当段階をholdし、単体greenやreceiptから022 acceptanceを生成しない。

### FR-HARNESS-L3-035 — 要求候補の根拠と受入寄与（親 `HARNESS-L2-035`）

各候補について原指示・上流revisionから候補への由来、選択scope、既存の受入criteriaへの寄与、必要性、代替案との差、適用予算の根拠を別々に記録する。candidate自身、同時に作成した候補、ID/台帳登録だけを唯一の根拠にする循環を検出し、不足・矛盾・unknownを候補の未解決情報として返す。budget未知を0とみなさない。後続版へ回す根拠ある候補を初版の最小構成から機械的に削除しない。出力は要求候補であり採択・実装許可を生成しない。

**受入条件**
- `AC-HARNESS-L3-035-01`: 原指示/上流revision、candidate、scope、受入criteriaへのtraceをpositive fixtureで対応づける。各候補に必要性・代替案・適用予算根拠を記載し、存在しないbudgetはunknownとして保持する。scope計測の数値や方法が必要だと判明した場合は候補として根拠・比較・測定条件を示し、固定親にない値や合否閾値を確定しない。
- `AC-HARNESS-L3-035-02`: candidate自身のみの根拠、相互根拠cycle、source revision違い、受入criteriaに寄与しない追加scopeを個別変異する。根拠充足とせず具体的不足へ戻す。正常なFeedback循環や訂正履歴を誤って導出cycle扱いしない。
- `AC-HARNESS-L3-035-03`: 必要な後続版候補と初版scopeの両方がある未見例を与える。初版へ無条件に混入せず、後続候補も理由なく消去せず、各々の根拠・version targetを保持する。固定親が求める由来、受入寄与、必要性、代替案、予算根拠の欠落を個別に不足として示し、別観点の好結果で相殺しない。候補完成やregister存在から承認済状態を作らない。

### FR-HARNESS-L3-037 — 適用scopeにおける二段system/agent設計の合流（親 `HARNESS-L2-037`）

現行HARNESS-L2-009が要求kind/target/configuration/risk/domainと版付きDesign Templateから二段scopeを導出した場合に限るHARNESS-CORE composite候補。旧`drive=agent`だけでは起動せず、HARNESS自身の開発にも適用しない。まずPhase 1の一般system合意済みL2・承認済みL3と設計入力からL4設計を作成し、その設計の後段L9対検証receiptを得てからPhase 2固有要求・要件の合意/承認とagent-specific設計へ渡す。各phaseのL4/L9成果、identity/revision/scope、contract versionを分離し、揃ったときだけ合流し、L3/L10のsystem oracleとL2/L11およびL1/L12への別traceを出す。後段receiptを開始時に要求しない。実行はOS/利用者環境、意味判断は既存ownerが担う。

**受入条件**
- `AC-HARNESS-L3-037-01`: 009の現行適用判定が二段scopeを選ぶ正常例で、Phase 1 inputだけからPhase 1 L4設計を生成できる。Phase 1結果前にPhase 2成果を要求せず、phase別要求/要件identityとauthorityを分離する。一般system-only scopeでは037を起動しない。
- `AC-HARNESS-L3-037-02`: Phase 1/2のL4成果、各々の後段L9 receipt、契約版、対象scopeのいずれかを欠落/stale/別revisionにする。該当段階または合流をholdし、片phaseだけをmergedとしない。既知の範囲内の未見agent構成は一律拒否しない。
- `AC-HARNESS-L3-037-03`: Phase 2がPhase 1 system invariantと一致する例、および意味変更・未解決gapを含む例を対比する。前者はtrace付き合流候補、後者は差分/unknownと戻し先を示し上流meaningを自動変更しない。合流結果はL3/L10検証、L2/L11受入、L1/L12観測を代行しない。

### Stage 5 固定親revision

以下は固定親・PO判断の追跡表であり、承認根拠は列記したPO判断記録である。表の後続register記録は採択を生成しない。

| 親 | 固定採択revision／PO判断 | 固定main 633 L2 raw span／semantic digest | 固定main 633 L11 acceptance span／raw SHA |
|---|---|---|---|
| HARNESS-L2-021 | MPR-RC-HARNESS-L2-021-001 / `helix-harness-requirements-po-decision-2026-09-28.md#L50` | `product-requirements.md:438–446` / `7ead08a9421e7b433ad54465ce880c5c31f79a180fac46a6032f7318748f0c31` / `c036a0a10beeb7c93587e3e71897c750c56c55a51df3850a1bb5ffb58dc446dc` | `product-acceptance.md:216` / `e4047883fe6bbda845bada035ec57d9a6b5b70b6d1cb370084209f17cc1a9d01` |
| HARNESS-L2-025 | MPR-RC-HARNESS-L2-025-002 / 同判断記録`#L54` | `product-requirements.md:544–554` / `452339e55022f3b8a15c509eb6f05a36c2c01fc10bcac616a1c757b4187df979` / 同左 | `product-acceptance.md:342–360` / `49386ce1cc397fb8a83191e9520160fdf9c3be86ca356b2cf99dad8acd45a0bd` |
| HARNESS-L2-033 | MPR-RC-HARNESS-L2-033-002 / 同判断記録`#L62` | `product-requirements.md:667–686` / `ce1c11a600e0f2a33d46dbd0794ea994e05249b2800fbe5ca65629c1594ae518` / `67e08069cb58f6f62c54d452e2d04c1587f1106f210254b2fc82ae00a10e10dd` | `product-acceptance.md:432–457` / `57bcd6628b0ce06db8aad6bb9d344db04cd91d1c32a64e62af7a7051916f4e3d` |
| HARNESS-L2-035 | MPR-RC-HARNESS-L2-035-002 / `po-decision-2026-09-29-57candidates.md#L40` | `product-requirements.md:719–729` / `1ceb111c98b785009febbade687cfdde04acbb354a2484e86b931405b0b0ec1e` / `4e37d81ee53b22319a316aa7090b30ccb94688d23ed6547551e914b2903a29c2` | `product-acceptance.md:485–491` / `65328061d5933e205a1ce1bf8689f19b1ab820623a2c637f13bb475477100670` |
| HARNESS-L2-037 | MPR-RC-HARNESS-L2-037-002 / 同判断記録`#L42` | `product-requirements.md:777–833` / `100f1f50b8e6ed72adf89cc2130110aa0f3b5463975f9074452464d31c260270` / `3dcead1bfe0ef30da76a4f781b3e3c0b4817672269e7055a18cb4b35781b95f2` | `product-acceptance.md:527–573` / `c7b24b6526978f062f322a447b35adaf5c9b195d771761b234b2a55a34322d38` |

固定main `633bf12ea8f948db8ba3d6600179c4a9507377a7`のL2全文SHA-256は`9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d`、L11全文SHA-256は`1f5c32b8ef8f50c1f3ca1780f0a25419e1d74034bb7827ff01d9725c1fd388c4`。L11の678–686は「未実行・未採択候補」と明示する追加追補であり、POが選択したL11-035 semantic digest `65328061d5933e205a1ce1bf8689f19b1ab820623a2c637f13bb475477100670` の範囲に含めない。そこで追加提案されるscope計測内容はこの草稿の受入義務へ持ち込まない。

### 旧L3/test-designとの項目別照合

以下のraw span SHA-256は指定した物理行の元の行末を含めて連結したbytesに対する値である。

| 親 | 旧source・保持点と分類 |
|---|---|
| 021 | `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:1–974` (full/raw SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`) と `LEGACY-ASSET-1B92155F959D7905DD1E` `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:1–247` (full/raw SHA `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`) をFR/ACとpaired testの形式として再利用。inventory-firstで参照した旧L3/test-design範囲内に現行L2-021と一対一の統合構成体FRは特定できず、端から端範囲・責務は親から再導出。旧gate/runtimeは置換。 |
| 025 | `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:1–974` (full/raw SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`) と`LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32–90` (full SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`, raw span `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228`)。旧L3/paired testのinput/output/invariant/AC・normal/negative/unseen形式を部分再利用し、複数要素の整合、conditional BRAIN/UI/oracleは現行親から再導出。 |
| 033 | `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:406–426` (full SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`, raw span `b4421ef1da6769e4068c9d3dd8d4f656a39e5777b74ebaab734f271744caf8cb`) はReverse R0–R4の入力source/evidence/routing境界の類例に限り、回帰やfailure reductionの根拠とはしない。同assetの`:574–599` (raw span `6a95dbb0f37ad051fb581cbd8f62b5deb66333f1c761ae846a7f8e487c5690a4`) と`LEGACY-ASSET-1B92155F959D7905DD1E` `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:121–124` (full SHA `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`, raw span `bf9b36c492dce685161702392c091a345e0818a2fa13e8b9750ee92b18d2c3d7`) はbefore/after invariant、regression、test_idを持つ隣接構造として部分再利用する。ただし現行failureの同一性、修正前fail/修正後pass、receiptの段階順序は固定L2/L11から再導出する。旧gate/runtimeは置換する。 |
| 035 | 同上に加え、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:128,203` (full SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`, raw spans `90f2931c10b9a821c7bb4dfbca14e91ccf0b1812098db113d50ee289dc8efa03`, `59bb3695045ffdbf8ef55b145ce542cfaec9570d40b916512af4857005661a91`) のHIL-FR-38/HIL-NFR-23にある根拠・必要性・代替案・budget・循環の保持点を再利用。旧L0番号・gateは現行L1/L2境界へ再導出。 |
| 037 | `LEGACY-ASSET-6B6C5CB0E481BE01088B` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:59` (full `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`, span `8186024e25dbf09ba7b7288b8df88a69ffaa4a960a4bd15e059f44fe170879db`)、`LEGACY-ASSET-3B905BB196962E2BE624` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:464` (full `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`, span `f1250ab44c078412cf875eefbb7f0a9104e7dd5326406d5eaa591d5834b55939`)、`LEGACY-ASSET-96CCD05C4CCA06F50D3D` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/technical-requirements.md:169` (full `3e105358418cb54af0bc2e414d0b06171715ab2a26ea3b44dd16f932bcbfef88`, span `484e1f0f52f6718fc5763a9c3e302590673166f0db6bfac2b69f077c8f2bad62`)、`LEGACY-ASSET-809D616D0D7D844F5720` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/function-spec.md:250` (full `f80b69a4d153d7775ecd789aa9e261c140baf2a443ac53a851de710cfce02b14`, span `234b96ee8aa737a0b8d79f56087ea8f928eeb574a96bef340a740dc3569986d4`)、`LEGACY-ASSET-978C267AADC50615A1E2` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/fr-unit-coverage.md:64` (full `477c95b229b4ddffd4c2ed76fdfb99d8f3a4e8241b21ae7e883ffa2607d39dbf`, span `54d0eb07cd769ca336cd8f332fcd5b04cb57901e50e443adcf82ee7d14e68588`) は固定L2記載の旧asset identityを保持。Phase 1/2、対成果、合流、L11/L12 traceを再利用・再導出し、旧drive/API/phase schemaは置換。旧source実行はしない。 |

旧L3の意味が直接同じであるとはみなさず、上記は対応する保持点だけの項目別再利用・再導出である。
