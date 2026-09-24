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
| `phcap07-web-verification-l10` | Web／Web-OSのL2・L11をdraftとする前提が現行`vision_material`分類と一致しない。 | 現行refを再固定した。検査条件は変更しない。 |
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
| `phcap15-17-orphan-asset-links` | product-boundaryではOSの管理・統制を管理・推進・検収へ分け、LABO評価とIntelligence改善を追加した。crosswalk-statusでは全量crosswalk／全asset評価を一律の開始前提とする記述を、選択unitに必要な関係assetだけをL3で調べる判断時期へ変更した。両方とも六旧assetのroute／coverage解釈へ影響する。 | product attributionとunreferenced-asset意味を再照合するまで入力digest・意味条件を変更しない。 |
| `rdp001-outside67-followup-069` | validatorがcounterpartに固定するPATH-052/056の`docs/governance/candidates/{ai-readable-authority-requirements,next-generation-ci-requirements}.md`は、現行repoに存在しない。`rg --files docs`で同basenameを検索するとHARNESS配下とOS配下に各2件ある。現行要件対応表は候補の所属先と所有責務を分離しており、旧単一候補pathとどの現行文書が同一identityか、固定pathだけからは特定できない。 | 旧pathをどちらかの同名候補へ推測で付け替えない。候補不在とidentity未確定を意味不一致として残す。 |
| `rdp001-web-webos-vision-coverage-0091` | coverage検査のproduct-boundary inputは、旧4対象/旧責務表から8機構・2共通部品、HARNESS/Webの外部提供属性、OS・LABO・Intelligenceの分担を含む現行Concept接続へ変わった。旧coverage countは現行のVision素材と製品境界の集合を数えた値ではない。 | 旧coverage countをcurrent判定へ使わず、現行入力で再導出する対象として残す。 |

## 修復した参照

- PHCAP 02/03、04/05、06、07、08/09、10/11、12/13、14、16、17、19、20は、同一範囲の現行source本文・行・digestへ再照合した。PHCAP-08/09はREADME記載のgeneratorから再生成した。PHCAP-12/13のSCF-B-0003 context digestも現行binding bytesに再照合した。
- PHCAP-15/17 membership edge検査はPHCAP-15/17 phase recordが`8e37e3c94`と現行で一致することを確認し、phase inventory provenance digestだけを更新した。
- RDP-001 outside67 boundary evidence/followup 066、073、074、083、076は、記録済みcounterpart pathの現行bytes digestとlengthを再取得した。counterpartの関係・意味は変更していない。
- 上記に伴うSCF Bindingは全依存を再確認し、変更sourceのdigestをnote付きでrebindした。検査条件、authority、scope、admissionは変えていない。

## 追加の不一致

PHCAP-16/19/20の一部current refsは再固定後のvalidatorがgreenだが、これは参照整合のみを示す。Web/Web-OSのL2/L11を要求根拠またはdraftとする他のcandidate記述が見つかった場合は、9/24判断との意味照合を別に行う。
