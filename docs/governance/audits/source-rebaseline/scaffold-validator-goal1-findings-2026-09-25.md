# Scaffold研究検査の修復・意味不一致一覧（2026-09-25）

status: research_premise_candidate
authority_effect: none
scope: Codex目標1、`8e37e3c94`で失敗していた`scaffold/**/validate.py`

## 照合範囲

起点`8e37e3c94`と#2131 merge後の`d4e8ebb47`で、PHCAP、pre-isolation、RDP-001、legacy分類、delegated-docの対象validatorを走らせ、同じ47件が失敗することを確認した。旧archiveはbytes・行・sourceとして読むだけにし、旧runtime、test、CI、hook、adapterは実行していない。作業ブランチでは固定行、本文、digestを現行sourceへ再照合し、必要なbindingは全依存、role、obligation、connection、operation、artifact、verification、replacementを読み直してからnote付きでrebindした。

以下の意味不一致は検査条件を変更していない。参照更新後にvalidatorがgreenでも、意味条件が現行判断に合うことを示すものとして扱わない。

## 意味不一致

| 対象検査 | 現行sourceとの食い違い | 処置 |
|---|---|---|
| `phcap04-05-requirement-acceptance-research` | 検査とinventoryはHELIX-Web／Web-OSのL2・L11を`draft`として保持する。現行4文書のfront matterは2026-09-24のPO判断に基づき`vision_material`を示す。 | 現行行・本文・digestは付け直した。draft条件を維持し、この条件を意味不一致として扱う。 |
| `phcap07-web-verification-l10` | Web／Web-OSのL2・L11をdraftとする前提が現行`vision_material`分類と一致しない。さらに`CUR-BOUNDARY`のbase-pinned meaningは独立Web-OS authorityと許可証拠接続だが、現行本文はLABO評価とOS登録の責務を記す。 | 現行spanのみ再固定しmeaning条件はbase値へ復元。両meaning差を条件変更なしで記録。 |
| `phcap06-design-research` | `CUR-06-WEB-L2`のrelationはWeb L2をdraftとするが、現行statusは`vision_material`で要求層ではない。 | refを現行sourceへ再固定し、draft relationは変えず意味不一致として残す。 |
| `phcap10-11-worker-ci-static` | `CUR-WEB-L2-BOUNDARY`と`CUR-WEBOS-L2-BOUNDARY`はWeb／Web-OS L2をcurrent boundaryとしているが、両文書は`vision_material`で要求根拠ではない。 | 現行refを再固定。隣接接続を要求authorityへ昇格させない。 |
| `phcap16-operations-monitoring` | `CUR-WEBOS-L2-SERVICE`はVision素材で現行要求ではない。`CUR-PRODUCT-BOUNDARY`の固定meaningはOS／Web-OSの独立authorityと許可された改善接続だが、source64–71行はLABO評価とOS登録へ責務を分ける。 | meaningは書き換えず、L2 relationと境界責務差の両方を意味不一致として記録。 |
| `phcap19-learning-research` | Web／Web-OSの旧要求・受入relationは現行`vision_material`と不一致。`CUR-BOUNDARY` relation「product ownership and OS improvement loop boundary」も、source34–71行がLABO評価／OS登録へ分ける現在責務と一致しない。 | refはsource spanを保持。meaning/relation条件を変更せず、両差を意味不一致として記録。 |
| `phcap20-memory-research` | Web／Web-OS refsは非対象connectionだが、現行statusは`vision_material`。`CUR-BOUNDARY`のbase-pinned meaningは製品境界とbounded improvement接続で、所有表の現在位置35–45行はOS側改善責務を示す一方、後段68–71行はLABO評価／OS登録へ責務を分ける。 | meaning条件をbase値へ戻し、refを所有表の位置へ付け直す。責務差は意味不一致に残す。 |
| `phcap08-09-wbs-ticket-static` | inventory説明にWeb／Web-OSのL2・L11をdraft/freeze-blockingと読む記述があるが、現行文書はVision材料である。 | 既存`generate.py`からinventoryを再生成し現行本文を記録した。意味前提は不一致として残す。 |
| `phcap14-release-research` | Web／Web-OSの隣接L2・L11をdraft候補とする検査・inventory記述が現行Vision分類と一致しない。 | 隣接refの現行本文とdigestを更新した。draft解釈は変更しない。 |
| `phcap17-incident-research` | `CUR-WEBOS-01`をWeb-OS L2の`direct_current_ref`としている。現行L2はVision材料で、要求根拠ではない。 | ref本文とdigestを付け直した。direct classificationは変更せず、意味不一致として残す。 |
| `phcap15-deploy-*` 8件 | `draft_requirement`／Web-OS L2の要求前提が9/24のVision分類と一致しない。 | PR #2135の意味不一致監査としてmainへ記録済み。 |
| legacy product classification 6件 | 旧4製品L1を現行の承認済み要求境界として扱うvalidator契約が、9/24判断後のWeb／Web-OS Vision境界と一致しない。 | PR #2134の意味不一致監査としてmainへ記録済み。 |
| `delegated-doc-003-028`, `delegated-doc-008-017` | 固定source SHAはproduct-boundary `097f…e038`（commit `0c45ea3`）、HARNESS L1 `a49d…ee04`（`0e17dad`）、OS L1 `0f7f…9ca8`（`7c02a45`）。現行差分では、product-boundaryがOSの「管理・統制」から管理・推進・検収へ責務を分け、LABO／Intelligenceを導入し、Webを外部提供product属性に加えた。HARNESS L1は1.0土台7項目を追加し、OS責務をticket・CI/test最適化、LABO評価、Intelligence改善へ分けた。OS L1はL1-011/012をLABOへ移し、L1-006を独立評価とOS改善登録へ分割した。よって固定sourceに基づく旧atom owner候補は現行配置と同じとはいえない。 | owner/atom条件を変更しない。現行revisionの意味再評価が必要な不一致として残す。 |
| `pre-isolation`, `pre-isolation-next` | 固定したproduct-boundary、HARNESS README/L1、OS L1のsourceは上記と同じ責務再配置を含む。HARNESS L1はPO判断で旧本文を採用した上で1.0土台を追記するrevisionへ移り、OS L1では技術調査と横断診断の担当がOSからLABOへ移った。 | 旧captureの候補製品・責務routeを現在の意味へ自動転記しない。current sourceで関係を再導出する対象として残す。 |
| `pre-isolation-outside-l1-semantic` | この候補は`CURRENT_HEAD=3df81ad`のHARNESS/OS/Web/Web-OS L1を「承認済み」と扱い、Web/Web-OSを含む4件の`exact`/`partial` relation、行anchor、2026-09-17 decision SHAを固定する。現行Web/Web-OS L1はVision材料へ再分類され要求根拠ではない。HARNESS/OS L1も親Conceptと内容が更新され、OS要求L1-011/012はLABOへ移管された。validatorはrelation数、CURRENT SHA、generator SHA、inventory SHAを独立固定している。 | historical captureを維持する。旧relationを現行承認L1のrelationと読み替えず、現行revisionに対する別のsemantic comparisonが必要な不一致として残す。 |
| `pre-isolation-outside-holding-67-migration` | 固定capture SHA `9face795…f0c`の`phase-capability-inventory.json`は、現行`2ffa4114…f6c2`と異なる。差分はPHCAP-01の`approved_current`から`approved_historical_revision_current_l1_draft`へのauthority状態変更と、parent path `helix-concept-v4.1.md`から`helix-concept.md`への変更である。READMEはこのphase inventoryをhistorical Wave verifier固定入力として保持する契約を記録する。 | capture値を現行SHAへ書き換えない。過去captureと現在revisionの明示的な二時点関係を再baselineする対象として残す。 |
| `rdp001-delegated-doc001-atom-030` | `docs/concept/helix-concept-v4.1.md`は現行pathに存在せず、4製品L1の固定digestもstaleである。 | authority evidence pathとrevisionの再導出が必要なため、条件を保留。 |
| `phcap15-17-orphan-asset-links` | pinned provenanceはphase inventory `9face795…`、product-boundary `097f273…`、crosswalk-status `f1431d…`。現行はphase inventory `2ffa411…`（PHCAP-15 `draft_requirement`／Web-OS含有、PHCAP-17 `thin_candidate`）、product-boundary `9268e357…`（OSの管理・推進・検収、LABO評価、Intelligence改善）、crosswalk-statusは現行改訂である。phase inventory・境界・crosswalkの三つともdigest mismatch。 | 固定snapshotと現行判断の同一性を推測せず、検査条件を変更しない。phase/product attribution、unreferenced-assetの意味と判断時期を再導出するまで不一致として残す。 |
| `rdp001-outside67-followup-069` | validatorがcounterpartに固定するPATH-052/056の`docs/governance/candidates/{ai-readable-authority-requirements,next-generation-ci-requirements}.md`は、現行repoに存在しない。`rg --files docs`で同basenameを検索するとHARNESS配下とOS配下に各2件ある。現行要件対応表は候補の所属先と所有責務を分離しており、旧単一候補pathとどの現行文書が同一identityか、固定pathだけからは特定できない。 | 旧pathをどちらかの同名候補へ推測で付け替えない。候補不在とidentity未確定を意味不一致として残す。 |
| `rdp001-web-webos-vision-coverage-0091` | coverage検査のproduct-boundary inputは、旧4対象/旧責務表から8機構・2共通部品、HARNESS/Webの外部提供属性、OS・LABO・Intelligenceの分担を含む現行Concept接続へ変わった。旧coverage countは現行のVision素材と製品境界の集合を数えた値ではない。 | 旧coverage countをcurrent判定へ使わず、現行入力で再導出する対象として残す。 |
| `rdp001-outside67-web-webos-l1-anchor-0121` | 固定した旧4対象境界のdigestが現行`product-boundary.md`と一致しない。現行境界は対象の列挙だけでなく、OSの管理・推進・検収、LABO評価、Intelligence改善、HARNESS/Webの製品属性を分けるため、旧L1 anchorのowner／責務を現行boundaryへ機械的に移せない。 | 固定L1 anchorの意味を再導出するまでdigest条件を維持する。 |
| `rdp001-web-webos-vision-asset-semantic-0124` | 旧#2073のWeb L1 6件・Web-OS L1 5件anchorと、Vision 35候補・legacy asset 12件のrelationを固定する。9/24 PO判断でWeb／Web-OSのL1/L2/L11はVision材料に再分類され、要求根拠ではない。固定anchorからの現行asset semantic relationをそのまま要求接続とみなせない。 | 現行Vision素材のrelationを再導出する対象として残す。 |
| `rdp001-web-webos-vision-semantic-atoms-0088` | `SCF-B-0080`は9/24 PO判断でWeb／Web-OS L2のstatusを`vision_material`とし、本文のsource digestとnoteを変更した（commit `a0e56c4cd52301d3e569c7b815d6a9e461fb1f53`）。0088は9 spanの旧Vision atom候補で、そのlineage digestがこの意味変更を含むB0080を固定する。 | lineage digestを単純更新して現行要求候補と扱わず、Vision素材としてrelationの再評価が必要な不一致に残す。 |
| `rdp001-web-webos-vision-source-0080` | 0080は現行Web L2 9件・Web-OS L2 6件のsource relationを要求候補として調べる。PO判断により該当L2は要求層から外れ`vision_material`となった。検査のcurrent-source前提が現行authority状態と異なる。 | 要求sourceとしてのcurrent relationを再baselineするまで条件を維持する。 |

## 修復した参照

- PHCAP 02/03、04/05、06、07、08/09、10/11、12/13、14、16、17、19、20は、同一範囲の現行source本文・行・digestへ再照合した。PHCAP-08/09はREADME記載のgeneratorから再生成した。PHCAP-12/13のSCF-B-0003 context digestも現行binding bytesに再照合した。
- PHCAP-15/17 membership edge検査はPHCAP-15/17 phase recordが`8e37e3c94`と現行で一致することを確認し、phase inventory provenance digestだけを更新した。
- `rdp001-delegated-doc002-semantic-atom-048`は、既存SCF-B-0010全体を確認し役割・義務・接続・操作・成果物・検証・置換先が不変と確かめたうえで、PO判断注記に伴うB0010 SHA参照のみをinventoryとSCF-B-0048へnote付きで再束縛した。validatorとselfcheckはgreen。
- RDP-001 outside67 boundary evidence/followup 066、073、074、083、076は、記録済みcounterpart pathの現行bytes digestとlengthを再取得した。counterpartの関係・意味は変更していない。
- 上記に伴うSCF Bindingは全依存を再確認し、変更sourceのdigestをnote付きでrebindした。検査条件、authority、scope、admissionは変えていない。

## 追加の不一致

PHCAP-16/19/20の一部current refsは再固定後のvalidatorがgreenだが、これは参照整合のみを示す。Web/Web-OSのL2/L11を要求根拠またはdraftとする他のcandidate記述が見つかった場合は、9/24判断との意味照合を別に行う。

## 独立review #5820610471への対応

対象はbase `1f330f245ff7034dcc606a56c96f6c11ee012a8b`に対する92個のcurrent source refs（`current_refs`と`current_evidence.refs`）。比較はinventory配列ごとに`ref_id`を対応させ、各base `exact_text`の現行source内出現数、current spanのline slicing結果、line SHA、source SHAを照合した。修正前HEADでは92件中87件の`exact_text`フィールドが置換されていた。その87件中35件は旧固定本文が現行sourceに残り、52件は旧固定本文が消失していた。35件はbaseの固定文へ戻し、5件の本文不変・source SHA変更も合わせ、現行sourceに残る計40件を正しいspanへ再固定した。52件は現行後継または意味不一致として下表へ個別記録。修正後、旧本文が現行sourceに残るのに別節へ固定された件数は0件。

旧本文が消失した52件は、同じ現行source内にある現行参照（`exact_text`）を後継候補として照合した。次表の「同節後継」はanchorが指す責務節を保った参照・文言更新、「意味不一致」はPO判断または責務移管で旧sourceの前提と現在の意味が異なり、検査条件を変えないまま残すものを示す。IDはbase inventoryの配列単位で列挙する。

| inventory / ref IDs | 現行の後継・差分 | disposition |
|---|---|---|
| `phcap04-05`: `CUR-OS-L2` | HELIX-OS L2候補のfront matterと要求本文が現行のPO判断・candidate配置に合わせて更新された。 | 同節後継。本文SHAとline SHAを現行spanへ固定。 |
| `phcap04-05`: `CUR-WEB-L2`, `CUR-WEBOS-L2`, `CUR-WEB-L11`, `CUR-WEBOS-L11` | 各文書の冒頭に9/24 PO判断による`vision_material`注記が追加され、要求・受入のauthority前提が変わった。 | 意味不一致。旧draft要求前提は保持し、現行Vision材料へは意味昇格させない。 |
| `phcap06`: `CUR-06-HARNESS-L1`, `CUR-06-HARNESS-L2`, `CUR-06-OS-L1` | HARNESS L1は親Concept参照とVersion 1土台を反映。HARNESS L2はticket／工程・要求条件の現行候補へ更新。OS L1は管理・推進・検収の分担と9/25移管を反映。 | 同節後継。ただしOS L1-011/012とLABO移管は下段の意味不一致表にも計上。 |
| `phcap06`: `CUR-06-WEB-L1`, `CUR-06-WEB-L11`, `CUR-06-WEBOS-L1`, `CUR-06-WEBOS-L2`, `CUR-06-WEBOS-L11` | L1/L2/L11本文冒頭がPO判断でVision材料へ再分類された。 | 意味不一致。旧要求・受入前提を維持。 |
| `phcap07`: `CUR-BOUNDARY` | product-boundary 64–71行を指す。固定meaningはbaseどおり「independent Web-OS authority and permitted evidence connection」。現行本文はLABO評価／OS登録を記し、責務が旧固定meaningから変化している。 | meaning条件は変更せず、責務差を意味不一致に記録。 |
| `phcap08-09`: `BOUNDARY-IDENTITY-LOOP` | product-boundaryの同じ対象別入口・identity節を現行行境界で再固定した。 | 同節後継。 |
| `phcap08-09`: `OS-L2` | HELIX-OS要求候補は現行PO判断・candidate配置に合わせて更新された。 | 同節後継。 |
| `phcap08-09`: `WEB-L2`, `WEBOS-L2`, `WEB-L11`, `WEBOS-L11` | 9/24判断でL2/L11を要求層から外し、文書冒頭にVision材料と記録された。 | 意味不一致。 |
| `phcap10-11`: `CUR-BOUNDARY-FOUR`, `CUR-BOUNDARY-OWNERSHIP` | product-boundaryの対象表・所有境界は現行の8機構・共通部品、外部提供属性、各機構責務に更新された。 | 同節後継。ただしscopeの旧4対象固定は現行構成を意味しない。 |
| `phcap10-11`: `CUR-OS-L2-WORKER-CI` | HELIX-OS L2-004等の責務・配置記述は、9/25のOS推進／LABO評価／Intelligence改善の分担と現行候補へ更新された。 | 意味不一致。旧Worker/CI固定責務の検査条件は変更しない。 |
| `phcap12-13`: `BOUNDARY-UNIT-CONNECTION` | product-boundaryの同じPO由来要求境界・接続節を、現行表見出しを含むspanへ再固定した。 | 同節後継。 |
| `phcap12-13`: `OS-REVIEW-HANDOFF`, `GITHUB-UPSTREAM-MODEL` | review handoff／upstream operationの節は現行の独立review通路・作成側／review側契約に更新された。 | 同節後継。旧文言をreview条件の根拠として扱わない。 |
| `phcap12-13`: `OS-L2`, `WEB-L2`, `WEBOS-L2`, `WEB-L11`, `WEBOS-L11` | 現行要求文書・Vision分類により旧固定本文は置換された。Web/Web-OSは9/24判断で要求層から外れた。 | OSは同節後継。Web/Web-OSは意味不一致。 |
| `phcap14`: `CUR-OS-L2-14` | OS L2 Worker・運用要求行が現行candidate本文に更新された。 | 同節後継。 |
| `phcap14`: `CUR-WEB-L1-14` | HELIX-Webの利用者価値・1.x提供範囲が、HARNESS Version 1後のサービス提供単位を示す現行候補へ更新された。 | 意味不一致。旧dashboard中心scopeを現行決定として扱わない。 |
| `phcap14`: `CUR-WEB-L11-14`, `CUR-WEBOS-L1-14`, `CUR-WEBOS-L11-14` | L1/L11冒頭のVision材料注記で要求／受入authorityが変わった。 | 意味不一致。 |
| `phcap16`: `CUR-PRODUCT-BOUNDARY` | 固定meaning「OS/Web-OS independent authority and permitted improvement connection」。現在のsource64–71行はLABOが証拠を評価しOSが採択候補を登録する責務を明記。 | meaningは変更せず、LABO評価／OS登録への責務差を意味不一致として記録。 |
| `phcap17`: `CUR-HARNESS-L1-01` | HARNESS L1の親Concept案内、1.0土台、L1-001〜009と接続条件を17–41行で照合。 | 同節後継。L1-009を含む対象表へspanを延長。 |
| `phcap17`: `CUR-OS-L1-01` | OS L1のauthority・推進・検収・LABO/Intelligence分担が9/25判断で更新された。 | 意味不一致。 |
| `phcap17`: `CUR-BOUNDARY-01`, `CUR-BOUNDARY-02` | `CUR-BOUNDARY-01`は4入口表（33–40行）、`CUR-BOUNDARY-02`は所有表・feedback境界（55–71行）を指す。`CUR-OS-L2-01`はNIO本文301–315行。 | 同節後継。OS-L2 refはbase exact_textを保持し、見出し299行を含めない。 |
| `phcap19`: `CUR-OS-L1` | OS L1-011/012はLABO候補への案内へ変わり、OSの学習責務が現行分担へ更新された。 | 意味不一致。 |
| `phcap19`: `CUR-HARNESS-L1`, `CUR-HARNESS-L2`, `CUR-WEB-L1` | HARNESS L1を22–61行で固定し、元本文の対象外境界（OS等のWorker・CIをHARNESSに含めない）を含めた。HARNESS L2はcandidate path再配置、Web L1は1.x提供範囲を反映。 | HARNESSは同節後継。Webは意味不一致。 |
| `phcap19`: `CUR-BOUNDARY` | relationは「product ownership and OS improvement loop boundary」。source34–71行はLABO評価とOS登録へ責務を分ける。 | meaning/relationを変更せず、責務差を意味不一致として記録。 |
| `phcap20`: `CUR-OS-L1` | OS L1-011/012のLABO移管とOSの現在責務を反映。 | 意味不一致。 |
| `phcap20`: `CUR-OS-L2-MEMORY` | 現行の「有期限通知とmemoryの責務」332–357行へ再固定。NIO候補は別節であり対象外。PO判断でmemoryはCodex／Claude連携に限定し、規則・知識保持をLABO／Intelligenceへ分けた。 | 意味不一致。旧memory責務を保持し、現行の正しいspanへ固定。 |
| `phcap20`: `CUR-BOUNDARY` | base固定meaningは「product boundary and bounded improvement connection; not PHCAP-20 target expansion」。参照は現行所有表35–45行へ位置のみ修正。現行本文はOS管理・改善の責務を記す一方、feedback節68–71行はLABOが評価しOSが候補登録する分担を記し、責務差がある。 | 固定meaning・参照対象を保持し、責務差を意味不一致に記録。 |
| `phcap20`: `CUR-HARNESS-L1`, `CUR-HARNESS-L2`, `CUR-WEB-L1` | HARNESS L1追記、HARNESS L2の工程条件を見出し込み161–169行で固定、Web L1の1.x範囲を反映。 | HARNESSは同節後継。Webは意味不一致。 |

この52件の内訳は、表のref ID単位で「同節後継」24件、「意味不一致」28件。後者は上のvalidator意味不一致一覧にも含め、参照状態と検査結果を混同しない。

### 所見番号ごとの処置

| Claude所見 | 処置・検証 |
|---|---|
| Blocker 1: exact_textの誤span | 修正前HEADの92 refをbase inventoryと配列・ID単位で比較。87 text field置換中、旧本文残存35、消失52。現存40件（35件復元+本文不変でSHAのみ異なる5件）を同一本文の現行spanへ修正し、誤位置0をline slicingで確認。消失52件は上表にID単位で後継／意味不一致を記録。 |
| Major 1: PHCAP責務・authority差 | `phcap04-05` Web/Web-OS L2/L11、`phcap06` Web/Web-OS L1/L2/L11とOS L1、`phcap12-13` Web/Web-OS L2/L11、`phcap14` Web L1・Web-OS L1/L11、`phcap17` OS L1、`phcap19/20` OS L1を上の意味不一致表へ明記。Vision材料・LABO移管を条件変更でgreenにしない。 |
| Major 2: PATH-038 hash主張 | `content_hash_matches_archive=false`へ訂正し、current `c897…` / 9884 bytes と archive `24ef…` / 5659 bytes のdriftを明記。validator条件を変更せず、対象検査は`E_COUNTERPART:OUTSIDE67-PATH-038`と`E_CURRENT_COUNTERPART_RELATION`でfail。 |
| Major 3: binding rebind note | 28 upstream noteを27 binding（SCF-B-0014/0016/0020/0025/0028/0030/0031/0034/0039/0040/0041/0042/0046/0101/0105/0109–0116/0119/0130/0131/0134）で個別に更新。各noteに当該bindingのrole、対象obligations、verification scope、replacement target/status、変化したinventory/sourceと意味影響を記録。特にB-0020はmemory節の責務変更とOS L1 LABO移管、B-0039/0041はWeb/Web-OS Vision材料分類、B-0041はgenerator・validator・inventoryのline 13–30同期を明記。 |
| Minor 1: PHCAP02/03 historical capture | validatorのcurrent phase dataは現行 `2ffa…` をpinし、outside67 migration READMEがhistorical capture `9face…` を保持する契約は変更しない。別々の時点・契約として照合。 |
| Minor 2: 不一致の重複計上 | 現在のbaseline 47件は18 green／29 fail。PATH-038のfalse/drift修正で、従来greenと数えていた1件を検査条件不一致としてfailへ戻した。意味不一致一覧の各行とvalidator exitは一対一ではなく、少なくとも5件はgreen参照修復と重複するため、一覧行数をbaseline fail数に加算しない。 |
| Minor 3: `base.worktree`履歴値 | `scaffold/phcap02-03-registration-classification-audit/inventory.json`は`/home/tenni/.helix-worktrees/outside67-migration`へ復元済み。 |

## 2回目Claude review #5821182959への対応

| 所見 | 処置・検証 |
|---|---|
| Blocker: PHCAP-20 `CUR-OS-L2-MEMORY` | NIO節を指していた300–318行spanをmemory責務節332–357行へ移した。次節は359行から始まり、continuationは別の会話継続候補377–393行へ固定する。memory節の有期限通知、Codex／Claude連携限定、LABO／Intelligenceへの知識責務分離を一つの責務範囲として含め、NIOは参照外とした。B-0020、B-0101/0105/0109–0116/0119/0130/0131/0134のnoteも二つの節を区別する。 |
| Major 1: exact spanの位置・見出し・終端 | base/currentの本文が残るか消失したかによらず、sourceの節・表境界とcurrent spanを再照合。4入口表は33–40、所有表＋feedback境界は55–71、PHCAP-17 HARNESS L1は17–41、OS L1は21–42、PHCAP-19/20 HARNESS L1は22–61、HARNESS L2は161–169、PHCAP-19 boundaryは34–71へ固定。PHCAP-12/13のGitHub modelは112–177、4入口表は12–45。PHCAP-08/09はgenerator・inventory・validatorのpinを同期。 |
| Major 2: Web／Web-OS Vision差の未記載ref | `phcap06` Web L2、`phcap10-11` Web/Web-OS L2、`phcap16` Web-OS L2 service、`phcap19/20` Web/Web-OS L1/L2/L11のref IDを意味不一致表へ追加。`vision_material`とvalidator側のdraft／要求前提を並記し、検査条件は維持。 |
| Minor 1: Web／Web-OS参照span | `phcap06` Web L11/Web-OS L1/L2/L11と`phcap14` Web L11/Web-OS L1/L11を、Vision注記・親接続文・元の対象節終端を含む現在のspanへ再固定。 |
| Major 2: validator meaningを書き換えた参照 | PHCAP-07 `CUR-BOUNDARY`とPHCAP-20 `CUR-BOUNDARY`のmeaningはbase値へ戻し、PHCAP-20 refは所有表35–45行へ戻した。LABO評価／OS登録の責務差は意味不一致表へ記録し、検査条件は変えない。 |
| Minor 3: PATH-038の残存equal claim | 083の`documents[3]`と`evidence-scan.json`をcurrent `c8977e9d…`／9884 bytes、`content_hash_matches_archive=false`へ同期。archive `24ef4fbd…`／5659 bytesを維持し、`E_COUNTERPART`と`E_CURRENT_COUNTERPART_RELATION`を条件変更せず残す。 |
| Minor 4: B-0048 noteの曖昧さ | DOC-002 inventory SHA `9056f522…`は`existing_candidate_connection.binding_sha256`をSCF-B-0010の現SHAへ更新したもの。atom/source/authority/connection/obligations/replacementは不変と追記。B-0048は083 PATH-038 bindingではないため関連を混同しない。 |

## 3回目Claude review #5821766648への対応

| 所見 | 処置・検証 |
|---|---|
| Major 1: PHCAP-19/20 HARNESS L1末尾 | 参照を22–61行へ延長し、L1本文末尾とOS Worker/CI等の対象外境界を含めた。 |
| Major 1: PHCAP-12/13 GitHub model終端 | `GITHUB-UPSTREAM-MODEL`を112–177行へ延長し、手順5の途中で切れないよう固定。BOUNDARY-UNIT-CONNECTIONは12–45行、Web/Web-OS L2/L11はVision注記後の終端まで延長。 |
| Major 2: meaning/参照先を変えたPHCAP-07/20 | PHCAP-07とPHCAP-20のmeaningをbase値へ戻した。PHCAP-20 `CUR-BOUNDARY`は所有表35–45行へ位置だけ付け直す。現行責務差は条件変更せず上の意味不一致表に記録。 |
| Major 3: PATH-038 failure code | `E_COUNTERPART`に加え、evidence-scanの一致ID一覧と現行relationのずれで出る`E_CURRENT_COUNTERPART_RELATION`も固定契約との差として列挙。 |
| Minor: Web/Web-OS終端 | PHCAP-06/19/20 Web L1、PHCAP-04/05・08/09・12/13 Web/Web-OS L2/L11の元本文末尾を含むよう終端行を延長。 |
| Minor: binding／説明記録 | B-0020 noteのcontinuation開始行を377へ訂正。B-0048 noteにDOC-002 inventoryのbinding_sha256更新元・先と不変のatom/source/authority/connection/obligation/replacementを記録（083 bindingとは別）。 |

## 4回目Claude review #5822003201への対応

| 所見 | 処置・検証 |
|---|---|
| Minor: PHCAP-16/19 boundary meaning/relation | meaning/relationを書き換えず、PHCAP-16 `CUR-PRODUCT-BOUNDARY`とPHCAP-19 `CUR-BOUNDARY`を意味不一致表へ追加。既存PHCAP16/19行の「同節後継」判定もmeaning mismatchへ訂正。 |
| Minor: PHCAP-17 `CUR-OS-L2-01` exact_text | 301–315行へ戻し、base exact_textを維持。見出し299行と空行は参照へ加えない。validatorはPASS。 |
| Info: ref exact_textの先頭空行 | phcap14 `CUR-WEB-L1-14`、phcap19/20 HARNESS/Web L1 refsの先頭空行はbase exact_textの一部として維持。source本文のidentityは変更しない。 |

## 最終照合と検証結果

`8e37e3c94`時点で失敗していた47 validatorを、現在の修復結果・意味不一致記録へ照合した。18件は参照修復後にgreen、29件は検査条件を維持した意味不一致として残る。内訳はmainへmerge済みの#2134記録6件、#2135記録8件、および本記録で更新したPHCAP/RDP意味差（PATH-038の事実訂正を含む）。複数の現行参照が同じ意味差を共有するため、validator数と意味差記録の行数は別に数える。

DOC-002-048の参照修復を含む現在の作業treeで `scaffold/**/validate.py` 全137件を並列実行し、91 pass／46 failを確認した。failのうち29件が上記47 baseline対象に残る意味不一致、残る17件はbaseline対象外である（`legacy-implementation-residual-0126`、`legacy-overlap-reconciliation-0144`、`legacy-test-design-worker-workflow-0148`、`legacy-semantic-review-wave37`〜`wave50`）。よって全137件のpass数と、baseline 47件の処置数は別の分母として報告する。

`scfctl stale`は0件、`scfctl validate`は142 bindings pass、`scfctl residuals`は0、`scfctl selftest`は69 cases pass。`git diff --check`もpassした。旧archive内runtime・test・CI・hook・adapterは実行していない。
