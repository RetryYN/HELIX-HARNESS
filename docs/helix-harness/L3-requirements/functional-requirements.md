# HELIX-HARNESS L3 機能要件（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 / HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023 / version_class 1.0
owner: HELIX-HARNESS
paired_l10: ../L10-verification/functional-verification.md

本書はStage 1の3要求に限る部分草稿である。HARNESS全体のL3、他のStage 1要求、L3承認、実装・実行許可を表さない。対のL10総合検証設計は[functional-verification.md](../L10-verification/functional-verification.md)に置き、両文書で同じAC IDを使う。

## 親要求revision

| 親 | PO判断記録 | 固定親revision／本文 | 行・raw span SHA-256 | semantic digest |
|---|---|---|---|---|
| `HARNESS-L2-010` (`MPR-RC-HARNESS-L2-010-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L39)、判断記録SHA `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23` | `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、`../L2-requirements/product-requirements.md`、全文SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | 340–351、`5fae33b5001fb2b59c3a8a62cfb06d428480574d22c8872ef3f9d8fe440bb5b0` | `9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4` |
| `HARNESS-L2-011` (`MPR-RC-HARNESS-L2-011-001`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L40)、同上 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、同上 | 352–362、`65483ea9a44d880a894fe6e9b052594741e3fab29320c158fa95f0075af60090` | `30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952` |
| `HARNESS-L2-023` (`MPR-RC-HARNESS-L2-023-002`) | [2026-09-28判断](../../governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L52)、同上 | `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、同上 | 463–498、`cacb50daf962d62f6454da1ecff7a8fd7a7ec41f0eda17eadc1c0d7edf845fc9` | `32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03` |

固定L2全文SHAは `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、対のL11全文SHAは `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。各L11の固定spanは、010 205行／`ee2d89c797d8d07d917b68fca55d386d487e67caac0e9cf0873fe674846e33cf`、011 206行／`483c86d30dbece9bce50732e5faf9480b6c70c93f6b625330d27cb7784a57188`、023 223行／`f209dace6dd361437dd2f37785216ff7cdc3e69ef298ce760e1574033c4beaf4`。親の採択状態は判断記録で確認し、固定本文内の候補表現や後続register metadataで変更しない。

## 要件とAC

L3要件は親L2と異なる識別子を持ち、`FR-HARNESS-L3-<親番号>`から親へtraceする。対のAC IDは `AC-HARNESS-L3-<親番号>-<連番>` とする。L10 case IDは `CASE-HARNESS-L10-<親番号>-<連番>` とし、双方に機構prefixと親番号を含めて重複を避ける。AC本文は本書を正本とし、L10は同じAC IDを参照する。この採番は文書内trace用で、新しい承認・admission gateではない。

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

## 旧資産の項目別照合

行番号は`archive/legacy-generation-2026-09-14/root/`からの相対値。SHA-256はarchive本文の全文hash。旧test-designはsource上のconsumer／oracle資料として読んだのみで、旧test、CLI、runtimeは実行していない。

| 現行親とAC | 旧ID・path・行・全文SHA | 判断（再利用／再導出／置換） |
|---|---|---|
| HARNESS-L2-010／`AC-HARNESS-L3-010-01..03` | `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `docs/design/harness/L3-functional/functional-requirements.md:119–148` (FR-03), `149–172` (FR-04)、SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`; `LEGACY-ASSET-1B92155F959D7905DD1E` `docs/test-design/harness/L3-acceptance-test-design.md:60–66` (AT-FR-03/04)、SHA `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | FR-03のpair／trace欠落とFR-04の依存cycle negative shapeを再導出。pack identity・契約・owner・版の定義と宣言成果物は現行L2から具体化。旧4-artifact／12-edge数値、PLAN schema、実行例とAT-IDは置換し、移植しない。 |
| HARNESS-L2-011／`AC-HARNESS-L3-011-01..04` | 同じfunctional-requirements、FR-03 119–148行、FR-05 173–196行、および対のAT-FR-03 60–63行／AT-FR-05 67–69行。FR-08 257–280行（mode routing）とFR-09 281–310行（agent_mandatory／budget／lock）は非対応。全文SHAは上記functional／test-designと同一。 | trace/fail-closeのtest shapeのみ部分再導出し、呼出し境界は採択L2から具体化。旧CLI・mode routing・agent guardのpermission mechanism、bypass、timeout等の制限は本要件へ移植せず置換。authority policyはSECURITY ownerに残す。 |
| HARNESS-L2-023／`AC-HARNESS-L3-023-01..03` | functional-requirements FR-03 119–148行／FR-04 149–172行と、対のAT-FR-03/04 60–66行。上記2 assetと全文SHAは同じ。 | 旧FR-03/04の欠落・cycleをfailure patternとして再導出するが、`requires/blocks` graphと12 PLAN-kind enumは置換。4分類、条件束縛、未観測／unknown／stale／reference-onlyの意味は現行L2を直接の親とする。 |
| 方法・区分の起点 | `LEGACY-ASSET-9A772391C7FB1298D45F` `docs/design/harness/L3-functional/README.md:16–56`、SHA `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`; `LEGACY-ASSET-F542125805B777D8A56A` `docs/process/forward/L00-L06-design-phase.md:13–21,101,148–168`、SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`; `LEGACY-ASSET-B30F3C82B6B0FDC0D2A8` `docs/process/gates.md:41,64`、SHA `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`; `LEGACY-ASSET-6EBDB617A8104A7756D0` `CLAUDE.md:82–85`、SHA `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb` | FR+ACと対のtest-designを作る、functional／business／NFRを分ける、AC欠落を完了扱いしない、AIが起草し人がL3を承認する意味を保持。G3、旧UX L10、old CLI/runtimeによる承認・gate動作は移植しない。 |
| business/NFR scope確認 | `LEGACY-ASSET-A6E2C7F0565E5F804F06` `docs/design/harness/L3-functional/business-detail.md:21–39,84–104`、SHA `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`; `LEGACY-ASSET-DB669724249A14A665F0` `docs/design/harness/L3-functional/nfr-grade.md:21–34,58–81`、SHA `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | BR-21の評価・着手条件は本3親の意味／ownerではないため再利用しない。NFRの測定可能性を記す骨格だけ再導出し、旧IPA grade、旧CI/runtime、placeholder、旧timeout・比率閾値は現行値にしない。 |

旧Functional FR-05のdeterministic checkは説明可能な判定の参考にするが、旧G3・環境変数bypass・監査機構を置換対象とする。FR-08はmode routing、FR-09はagent-specific guardであり、HARNESS-L2-011の一般呼出しcontractの根拠にはしない。旧test-designのfrontmatterは`layer: L3`、`executed_at_layer: L12`である。このHARNESS旧paired test-designを旧L10と呼ばない。現行L10はL3↔L10対応を新しい総合検証として設計する。

## 固定親が直接参照する旧FRS候補の照合

固定L2-023本文は旧FRSの`FRS-BR-004/005/009`、`FRS-R-12/13/14/23`、`FRS-AC-012/013/014/025`を明示的な保持点として挙げる。L2-010のpack境界にも、旧FRSが扱った単一behavior contractの所有・成熟度分離の隣接類例がある。旧FRS文書はarchive上では`version: 0.2.0`、`status: draft_candidate`のままであり、v0.2をformalizationへ進めるPO判断（`L3-PO-1494-002`）は候補内の明記である。現行のauthority・採択をそれらのファイルから継承しない。今回の固定親の判断は、固定L2/L11と現行PO decision recordから読む。

| 現行親 | 旧ID・path・行・全文SHA | 再利用／再導出／置換の判断 |
|---|---|---|
| HARNESS-L2-010／`FR-HARNESS-L3-010` | `LEGACY-ASSET-B75E46DBE77592351574` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:60–92`（FRS-R-01/02/04/05/06）、SHA `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17`; `LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23–36`（FRS-BR-001/003）、SHA `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20`; `LEGACY-ASSET-67ADFAB856D954B3C5D2` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:37–39`（FRS-AC-004/005）、SHA `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | 単一behavior contractを識別する考え、ownerを一意にしversion/maturityを上位構成から分ける観点を部分再導出する。現L2のpack owner区分（release unit／component／core）、pack・release unit・製品の版分離、適格packの可視性を正本とする。旧`Functional Release Slice`というModule／Bundle間の独立昇格単位、Slice schema/channel、exact Bundle profile、旧owner enumとpromotion義務は本親の意味として再利用せず置換する。候補の旧PO記載はcurrent authorityではない。 |
| HARNESS-L2-023／`FR-HARNESS-L3-023` | `LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:38–46,64–67`（FRS-BR-004/005/009）、上記SHA; `LEGACY-ASSET-B75E46DBE77592351574` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:127–142,209–212`（FRS-R-12/13/14/23）、上記SHA; `LEGACY-ASSET-67ADFAB856D954B3C5D2` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:45–47,58,73–81`（FRS-AC-012/013/014/025とtrace表）、上記SHA | 固定L2が名指す変更影響trace、local検証とdependent closureの両立、unknown／ambiguous／staleの安全処理、安全依存をoptional化しない観点を部分再導出する。現4分類・pack revisionへのcondition束縛・未観測source・人代行時の同義務とreceipt・後続版境界は現L2本文から具体化する。旧Module→Slice→Bundle graph、旧Slice単位のpromotion／verification profile、旧state/schema、候補ACとそのgateは移植しない。 |
| HARNESS-L2-010（artifact比較の類例のみ） | `LEGACY-ASSET-9B7682EBDEA171005D45` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:17–29,81–84`（旧`HR-FR-HYB-008`、DIST-LITE-R-03）、SHA `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`; `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:17–32,41–44`（ST-DIST-001/004/005/006, DIST-LITE-AC-004/005/007）、SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | 同じ固定source／artifact contractからのdigest比較と再生成に限る近接failure/oracle類例。旧document自身がdistribution/consumer packageと区別し、旧test-designはremote actionを実行対象外としていた。本L2-010の個別pack contractへdistribution repository、Lite profile、Node package、promotion channel、remote release authorityを追加する根拠にはしない。 |

この直接照合は、archive内の`docs/governance/candidates/functional-release-slice-{requirements,requests,acceptance}.md`と、distribution-package-releaseの旧L3／paired system test-designを全文readし、asset ledger行444、818–820、2806でasset IDと記録SHAを照合した結果である。上記5ファイルのarchive bytes SHAも実測し一致した。FRS名・IDの検索範囲は旧`docs/governance/candidates/`、`docs/design/helix/L3-requirements/`、`docs/test-design/helix/`であり、今回の固定親に対する直接参照先と隣接artifact類例を特定する調査である。archive内すべての旧要求・consumerを網羅したとの主張ではない。旧L3/L10はいずれもread-only参照であり、実行していない。

## Business範囲

この部分草稿では独立したbusiness criterionを追加しない。3つの固定親はpack、呼出し、依存closureのsystem contractであり、売上・優先順位・投資条件など別の事業判断を定めていない。旧business-detailのBR-21を移植せず、事業価値判断はL1／そのownerに残す。HARNESS-L3全体のbusiness要件を非適用と判定したものではない。

## PO承認依頼用要約（承認未取得）

この部分草稿は、packが入力・依存・版と検証範囲を明示し、単一packの差し替えで他packの版と証拠を保つこと、同一入力・版の成果物を再現することを具体化する。画面・provider・CIに依存しない呼出し、渡された権限／隔離境界、相関付き結果、同じ冪等keyからの停止・再開、条件別dependency closureを要件と受入へ結ぶ。権限判断はSECURITY、結果の保存・表示は呼出し元が持ち、Web要求や実装方式を本書から追加しない。

技術候補は、同じ宣言成果物のdigest一致（contractがmetadataを非意味として明示する場合のみ正規化を許す）、単一pack差替え時の対象外変更0件、同一key再開時の重複効果0件、期限後success 0件、同じinput/revisionからのclosure・理由の完全一致である。比較案とL10観測は[nfr-grade.md](nfr-grade.md)と[nfr-verification.md](../L10-verification/nfr-verification.md)に記載する。数値の根拠がない処理時間・retry上限・TTLは設定せず、L2意味の変更が必要になった場合だけ上流へ戻す。
