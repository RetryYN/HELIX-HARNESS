# G7 HELIX-CONNECT接続源棚卸監査

## 監査基準と母集団

- 調査基準commit：`680dcaa123591947679210ce2f1515794f3f14f3`。以下のL2本文とidentity一覧はすべてこのcommitの内容を指す。
- 対象は `docs/` と `helix-web/` の `L2-requirements/*.md` 全件。`rg --files docs helix-web | rg '/L2-requirements/.+\\.md$'` で9文書を得て、各文書のidentity/type表、要求本文、対応表、本文中のID、接続条件を走査した。見出しの形だけで対象を決めず、表だけのID、composite、inline flow、`##`配下も確認した。
- identity全体は [G7接続源identity一覧JSON](g7-connect-source-identity-inventory.json) に記録した。各行に所有文書、調査基準commit、文書SHA-256、identity、分類、本文出現行、本文条件の行、委譲先source identity、CONNECT候補ID、非該当理由を保持する。見出しidentityは次の同階層以上の見出しまで本文を確認する。見出しのない表/inline identityはID全出現行を確認し、本文全体をそのidentityへ誤結合しない。文書間参照IDは参照元文書の所有identityとして重複計上しない。
- 9文書に含まれるsource identity行は293件。内訳は、明示connection 79、接続条件を含むcomposite 23、共通pack descriptor条件を含むunit 2、その他unit/detail identity 174、Web系の補助的Vision候補15である。OSの `HXT-FLOW-01..09` は個別connection、`HXT-SYS-01` はcompositeとして計上した。
- HELIX-CONNECT自身のL2は調査基準commit時点では母集団に存在しなかった。現在のCONNECT案との対応は後節の候補対応表に記す。この記録は接続源の棚卸しであり、L2案の採択や接続先業務意味の変更を行わない。
- Web／WEB-OS L2文書はVision由来の補助資料であり未承認候補である。HELIX-Webの顧客向け要求とHELIX-WEB-OSのservice runtime条件は、内部の共通部品HELIX-CONNECTの機構要求として数えない。HELIX-WEB-CONNECTORも別の所属・要求である。

## 文書別の全件走査

SHA-256は調査基準commitにある各ファイル全体のSHA-256。source identityと出現行の全リストは付属JSONにある。

| 対象とsource文書 | SHA-256 | 明示connection / connection条件を含むcomposite | 所有機構に残す業務意味 |
|---|---|---|---|
| HARNESS — `docs/helix-harness/L2-requirements/product-requirements.md` | `a19c526832ee2d08544346dc386a6364e6ee3a0dae01ae6fb382a9190ae9121c` | `HARNESS-L2-020` connection、`HXT-CORE-02` connection（L314）、`HARNESS-L2-021` composite（L322–336、L427–446）。要求全体のunit/connection/composite分離はL178–183。 | 方式の中の隣接release unit間handoff、入出力契約・契約版照合、意味差のBackflow、未完義務/unknownの引継ぎ、検査回収、Verified/Accepted条件をHARNESSが所有する。CONNECTは工程意味・受入・release判断を持たない。 |
| HELIX-OS — `docs/helix-os/L2-requirements/governance-requirements.md` | `1c4d13fff300869fe66556c418be17247a41c6aa454a6da30cb64a2091e7ffd3` | `HELIXOS-L2-023/024` connection、`HELIXOS-L2-025` composite（L722–749）。表内connection `HXT-FLOW-01..09` とcomposite `HXT-SYS-01`（L599–608）。 | ticket発行・割当・進行・検収、authority/portfolio/evidence、改善候補登録とroutingをOSが所有する。handoffには対象revision/digest、causal ID、scope、証拠、停止理由、未完義務を束縛し、受信側の受領証跡前に元ticketを閉じない。各HXT flow固有の運用目的・判断経路もOSに残す。 |
| SECURITY — `docs/helix-security/L2-requirements/security-requirements.md` | `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` | connection `HELIXSECURITY-L2-007/021/024/026`（L40–65、L130–138、L272–280、L302–310、L322–330）。composite `-009/-022/-023/-025/-027`（L150–158、L282–300、L312–320、L332–340）。`-028`はpack descriptor/版互換を持つunit（L342–350）。 | SECURITYはpolicy、authorization、isolation、credential、egress、分類、deny/hold、revoke/quarantineを所有する。実enforcementはWorker/INFRASTRUCTURE、ticket/progressionはOS、意味判断/Bot発行はINTELLIGENCEに残る。外部data、operation authority、永続化promotionを単一の接続成功へ畳み込まない。 |
| INFRASTRUCTURE — `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` | `cab7225b5461ba9a071c1397e75f6ee9e60511719c25342ca85627109c953730` | connection `HELIXINFRASTRUCTURE-L2-008/-009/-014/-025/-026`（L104–122、L172–180、L285–307）。composite `-010/-011`（L126–146）。論理HELIX-CONNECT identityと物理経路の分離はL32–40。 | INFRASTRUCTUREは実資源・環境・runtime stateとphysical topologyを所有する。COREはapproved designの意味、OSはWork/Change、SECURITYはpolicy/authority、Workerは実行、INTELLIGENCEは判断候補、LABOはepisode評価を所有する。論理connector identityをsource/destination/protocol/endpoint/direction/purpose/security-boundary/dependencyを持つ物理経路と混同しない。 |
| BRAIN — `docs/helix-brain/L2-requirements/brain-requirements.md` | `1cda52776f6306f6006d50c06c622b71dd6e6b141e4411974d1401666d933560` | connection `HELIXBRAIN-L2-018..023/-026`（L70–80、L414–482）。composite `-024/-025/-027`（L76–79、L454–492）。`-028`は共通descriptor/版互換を照合するunit（L494–502）。 | BRAINは汎用のversioned knowledgeとcandidate stateを所有し、製品固有設計・runtime state・credential・操作authorityを所有しない。LABO評価、OS登録、BRAIN内部の独立検証・採否の各状態を分ける。INTELLIGENCEは判断材料として利用し、HARNESSは自らの設計契約に従って入力を導出する。 |
| LABO — `docs/helix-labo/L2-requirements/labo-requirements.md` | `d5d1c6591b54819b65b56ba13b18a912a161e2ee4bff2116f2ebaa55260b6144` | 個別connection `HELIXLABO-L2-011..042`（L39、L163–287）および `-054`（L44、L290–295）。composite `-050..053`（L298–320）。 | LABOは観測、相関、分解、比較、実験、assurance/fallback配分、一般化、評価、Feedback evidenceを所有する。Worker割当やticket発行、採否、BRAINへの直接promotionは所有しない。各connectionでsource/target、評価scope、evidence、反例、利用区分、未評価を維持する。 |
| INTELLIGENCE — `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | `0f70488daf707b6cbc8cf4b382aac807987da1ad22e4a92da07149c74d34e0b0` | connection横断境界 `HELIXINTELLIGENCE-L2-017` と個別connection `-030..045`（L31–36、L198–350）、composite `-060..065`（L352–388）。単体→関連connection/composite対応表はL390–423。 | INTELLIGENCEは根拠・revision・不確実性付き判断候補を所有し、要求・設計・state・knowledge・permission・ticket・execution authorityを持たない。限定修復は同一target revision/scopeのもとSECURITY許可、Worker実行、HARNESS検証、OS検収を接続する。LABO、BRAIN、OSのowner意味は置換しない。 |
| HELIX-Web補助候補 — `helix-web/docs/helix-web/L2-requirements/product-requirements.md` | `f5f69a92eb3c9e23f1c1d13995aa9ad708d1e55b26764a38582760335838fc1a` | Vision候補 `HELIXWEB-L2-001..009`（L27–46）。provider/data boundary `-004`、能力/contract version `-007`、WEB-OSからの改善export `-008`等を補助確認した。 | 顧客向け製品の環境選択、job、provider/data境界、採用能力の構成版、利用結果exportに関する案。HELIX-CONNECT内部機構要求とは別所属で、未採択。 |
| HELIX-WEB-OS補助候補 — `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md` | `07d91c27b469db6b7467aef40b38c96e19f6e7eecd5f9be77fd22b0b28e1fd35` | Vision候補 `HELIXWEBOS-L2-001..006`（L20–40）。HARNESS capability配布、job、provider/credential/data scope、projection、改善exportを補助確認した。 | WEB-OSはtenant/service/job/runtime state、配備・復旧、service logと制限付きexportを所有する。内部HELIX-OS stateとcredential・writer・release authorityを暗黙共有しない。HELIX-CONNECT内部機構要求とは別所属で、未採択。 |

## source identityからCONNECT候補への対応

以下はsource identityをCONNECT L2候補へ結ぶ案である。対応は技術handoffの責務だけを示し、元機構の目的・判断・承認をCONNECTへ移さない。全293 identityの分類と各identityの出現行は付属JSONにある。

| 元のconnection identity | CONNECT候補ID | 対応上の理由と元機構に残す条件 |
|---|---|---|
| `HARNESS-L2-020` | `HELIXCONNECT-L2-001/002/003/005/006` | release unit端点、入出力contract、版、受渡し結果を登録・照合・伝送・追跡・片側変更後に再照合する。工程・Backflow・検査回収・Verified/AcceptedはHARNESSに残す。composite `HARNESS-L2-021` は `HELIXCONNECT-L2-007` の候補対応。 |
| `HXT-CORE-02` | `HELIXCONNECT-L2-001/002/003/005/006` | HARNESS COREとOSのticket発行・検査接続を登録・版照合・伝送・追跡・片側変更後の再照合へ対応する。ticket意味と検査判断はHARNESS/OSに残す。sourceに再送条件はないため `-004` は対応義務に含めない。 |
| `HELIXOS-L2-023` | `HELIXCONNECT-L2-001..006` | 管理→推進→Worker→検収間のrevision/digest/scope/evidence/未完義務handoffと、receipt未確認の保留を技術接続に結ぶ。ticket/assignment/inspection/close判断はOSに残す。 |
| `HELIXOS-L2-024` | `HELIXCONNECT-L2-001/002/003/005/006` | HARNESS提供・運用→LABO評価→OS改善候補への受渡しとrevision・scope・data-useを追う。評価はLABO、登録/routing/ticketはOS、工程契約はHARNESSに残す。 |
| `HXT-FLOW-01..09` | 各flowを `HELIXCONNECT-L2-001/003/005` へ対応。全flowのversioned edgeは `-002`、境界再送を要求するsource rowだけ `-004`、片側更新を含むedgeだけ `-006` に対応する。 | 各flowの目的は表L599–607に記載の経路単位で保持。特にDecide、ticket発行、Incident評価、CI組立、因果判断、LABO評価、Training案の採否をCONNECTの判断へ移さない。`HXT-SYS-01` は `HELIXCONNECT-L2-007` と `HELIXOS-L2-025` の構成体対応候補。 |
| `HELIXSECURITY-L2-007/021/024/026` | 各IDを `HELIXCONNECT-L2-001/002/003/005/006` へ対応。`HELIXSECURITY-L2-021`はL277の「通信・再送・追跡」条件を `-004/-005` へ明示対応する。他IDへ再送条件は一律に追加しない。 | 接続先ごとのsecurity policy、credential、隔離・egress・分類、deny/hold/revoke、Bot発行、資源enforcementの意味はSECURITY/INFRASTRUCTURE/INTELLIGENCE/Workerに残す。`HELIXSECURITY-L2-009/022/023/025/027` の複数段boundaryは `-007` に関連付けるがcomposite固有acceptanceは元要求に残す。`-028` のsecurity-specific update acceptanceも元単体に残す。 |
| `HELIXINFRASTRUCTURE-L2-008/-009/-014/-025/-026` | 各IDを `HELIXCONNECT-L2-001/002/003/005/006` へ対応。`-014`の未送信event retentionは `-004/-005` の照合対象。source記述にないretryを `-009/-025/-026` へ要求として加えない。 | CORE設計、OS Work/Change、LABO episode、Workerと実resource、INTELLIGENCE候補の業務意味・state ownershipは各source ownerに残す。`HELIXINFRASTRUCTURE-L2-010/-011` の操作/機構構成体は `-007` と関連付け、操作authorityやInfrastructure acceptanceをCONNECTに移さない。 |
| `HELIXBRAIN-L2-018..023/-026` | 各IDを `HELIXCONNECT-L2-001/002/003/005/006` へ対応する技術edge候補として記録する。sourceに再送・冪等条件がなければ `-004` をsource義務として扱わない。 | knowledge identity/version/state、Pattern条件、required input、評価・汎用化・採否はBRAIN/LABO/OS/HARNESS/INTELLIGENCEのownerに残す。`HELIXBRAIN-L2-024/-025/-027` は `-007` に関連付ける。`-028` のknowledge compatibility responseはBRAIN固有の判断として残す。 |
| `HELIXLABO-L2-011..042` と `-054` | 各IDを `HELIXCONNECT-L2-001/002/003/005/006` へ対応。`HELIXLABO-L2-035/-037` は `001/002/003/005/006` に対応する。CONNECT向けfailure/trace/retry evidenceを明示する `HELIXLABO-L2-040` だけは、その対応に `-004` を追加する。`-054` は受領追跡を `-005` に対応し、再送の業務判断はLABO/INTELLIGENCEに残す。 | 各LABO engine/source/target間の意味ある評価処理、分類、因果と一般化の境界、Bench水準生成はLABOに残す。`-050..053` は `HELIXCONNECT-L2-007` に関連付けるが、improvement/training/evaluation cycleの完了判定はLABO/OS/INTELLIGENCEに残す。 |
| `HELIXINTELLIGENCE-L2-017` と `-030..045` | 各IDを `HELIXCONNECT-L2-001/002/003/005/006` へ対応。`-017/-036..039`の限定修復境界は同一target revision/scopeとoperation/attempt traceを `-004/-005` へ対応する。 | 判断候補、repair判断、SECURITY permission、Worker実行、HARNESS検証、OS検収、LABO効果評価、BRAIN knowledge、Product Core Backflowの意味は各ownerに残す。`-060..065` は `HELIXCONNECT-L2-007` に関連付けるがcomposite固有成立をCONNECTの通信完了で置換しない。 |

## 接続共通条件と現行候補の被覆照合

| 条件 | source根拠 | CONNECT候補 | 被覆上の判定 |
|---|---|---|---|
| 接続identity、両端、方向、目的、scope、契約owner | HARNESS-L2-020、OS-L2-023/024・HXT-FLOW、SECURITY-L2-021/024/026、INFRASTRUCTURE-L2-008/009/025/026、BRAIN-L2-018..023/026、LABO-L2-011..042/054、INTELLIGENCE-L2-017/030..045 | `HELIXCONNECT-L2-001`、技術送信先bindingは `-003` | 全てのsource flow identityに個別の登録identity/endpoint対応が必要。未棚卸の接続を本文例だけから追加しない。 |
| 契約/adapter/transport/dependency versionと互換範囲 | HARNESS-L2-020 L431、SECURITY-L2-028 L345–350、BRAIN-L2-028 L497–502、INTELLIGENCE-L2-030..045 L208–350 | `HELIXCONNECT-L2-001/002` | 候補に版照合はある。HARNESS-L2-010/011が所有するpack lifecycle、交換・rollback・未完義務state machineはCONNECTへ重複導入しない。 |
| revision変化によるstale、unknown、mismatch、影響範囲の再検証 | HARNESS-L2-020 L431–435、OS-L2-023 L727–729、SECURITY・INFRASTRUCTURE・BRAIN・INTELLIGENCE各connection本文 | `HELIXCONNECT-L2-002/005` | source側に個別のstale/mismatch failure条件あり。CONNECT候補のstale対象とrevalidation recordを各flowの両端revisionに結ぶ。 |
| 配送・receipt・再送・reconnect・duplicate effect・terminal/unknown追跡 | OS-L2-023 L725–730、HXT-FLOW-06/08/09、Infrastructure-L2-009/-014/-025、INTELLIGENCE-L2-017/-036..039、HELIXWEBOS-L2-003（補助候補） | `HELIXCONNECT-L2-003/004/005` | source別条件を同一operation/attempt traceへ対応。通信再送の可否と業務上の再実行判断を区別する。source記述にない再送を一律要求にしない。 |
| 部分完了、未完義務、復旧/返却、片側変更後の互換再確認 | HARNESS-L2-020 L432–435、OS-L2-023 L727–729、SECURITY-L2-009/022/023/027、INFRASTRUCTURE-L2-009/010/011/014/025/026、BRAIN-L2-020/024/025/027、INTELLIGENCE-L2-017/036..039/060..065 | `HELIXCONNECT-L2-005/006/007` | source固有のpartial/owner returnを保ちつつ、CONNECT候補の片側交換・stale・複数edge追跡へ結ぶ。CONNECTの技術的通信完了を上位業務/composite成立にしない。 |

## 旧HELIX資産の確認

以下は読取りのみ。旧adapter、workflow、CLI、test、runtimeは実行していない。現行archive bytesはすべて調査基準commit `680dcaa123591947679210ce2f1515794f3f14f3` で参照した。asset ledgerの該当行にはIDとdigestが記録されている。

| 旧asset ID / source | 調査基準commitとsource SHA-256 | 行と保持した意味・差分 |
|---|---|---|
| `LEGACY-ASSET-C3DE79BA9451172F3E43` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md` | `680dcaa123591947679210ce2f1515794f3f14f3`; `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04` | ledger L574。L31–39はversioned read-only境界とconnector/Python完了をprojection完了にしない条件、L41–57はregistry/coordinator/read connector/worker/policy/projection/quarantine各責務、L61–91はsource・schema・mapping・config identity、version変更時stale、CAS/reconcileを扱う。product-data固有のcursor/snapshot/DB投影は内部CONNECTへそのまま再利用せず、意味を再導出する。 |
| `LEGACY-ASSET-DD66C1B6B7BE234B37E6` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/product-data-connector.md` | 同上; `48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42` | ledger L704。L27–31はpure/adapter境界、外部auth/connection/write-backを本sliceに実装しない条件。L35–62はAPI/oracle、activationとreconcileの同一identity、異digest拒否を区別する。Node/Python/DB等の実装方式や旧testは実行・移植しない。 |
| `LEGACY-ASSET-BD13CC67526B48D461F9` — `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-003-runtime-adapter-boundary-subscription-cli.md` | 調査基準commit `680dcaa123591947679210ce2f1515794f3f14f3`; ledger記録source SHA-256 `ffbe51c4a34cdaf4c072393a0864d916c7a4e1d6eaf4788bb0260e8280291f37` | ledger L260。A-71 (L14)、failure再発防止の経緯（L31、L35–45）を読んだ。provider固有境界が固定されないとAPI-key認証前提が下位設計へ漏れるfailure。subscription/CLI/auth方式を新CONNECTの実装前提へ移さず、adapter境界漏出のfailureだけを再導出する。 |
| `docs/governance/legacy-asset-disposition.jsonl` | commit `680dcaa123591947679210ce2f1515794f3f14f3`; SHA-256 `cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c` | L260、L574、L704のasset行とpath/digestを確認。ledger上のhistorical/disposition状態を再利用判断や現行authorityへ読み替えない。 |

## 未被覆条件と責務境界

- CONNECT候補 `HELIXCONNECT-L2-001..007` の対応は技術的なregistration、互換照合、通信、再送/追跡、片側交換、複数edge追跡に限定する。接続先の業務意味と承認は元機構のL2に残す。
- 各source IDからCONNECT IDへの具体対応は上表のとおりだが、source L2は候補段階を含む。接続実数・端点・方向・採否は、各機構ownerの要求revisionに沿った後続整理で確定する。Web/WEB-OSは内部機構sourceとして混ぜない。
- 本監査では、CONNECT自身の要件案が全source identityを持つかではなく、source母集団の欠落がないかを調べた。元機構の条件をCONNECT候補が満たさない場合、元要求を編集せずG7 PRに差分として記録する。
- 接続登録、両端契約版互換、変更時staleと影響接続の再検証、通信attempt/receipt/retry trace、片側交換後の再照合、部分成功と未完義務の引継ぎをsource条件からCONNECT候補へ接続した。元文書で明示されない再送/交換の業務挙動は追加せず、CONNECT L2/L11側の技術条件候補として扱う。
- この文書は調査基準commit時点の監査証拠。L2本文、register、pins、CONNECT要件案は変更していない。
