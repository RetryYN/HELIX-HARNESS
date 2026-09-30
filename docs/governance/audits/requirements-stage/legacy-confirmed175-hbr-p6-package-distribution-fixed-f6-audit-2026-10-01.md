# confirmed175 HBR-P6 配布・フルセットアップ固定f6照合監査（2026-10-01）

旧source-qualified identity `helix/L1-requirements/pillar-requirements.md::HBR-P6`について、外部配布package、consumer bootstrap、upgrade、および配布・公開条件を旧sourceとconsumerから再構成し、固定f6 L2/L11と条件単位で照合したread-only監査。基準mainは`cc51629faef95a61c5626db00b1cd877e1a61517`、固定L2/L11 revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。行・file SHA、固定pairのexact token section、PO decision、旧consumer、後発decision identity row94件（採択/承認88件と保留/未採択6件）の全量indexは[JSON](legacy-confirmed175-hbr-p6-package-distribution-fixed-f6-audit-2026-10-01.json)に記録した。

## source identityと範囲

旧sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md`（file SHA-256 `7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc`）55行、source line SHA-256 `17222607f0c9ea8f6f521f8e939e7a3c2a8bc4c2a5cf4706d4db85d6286c626b`。identity carry-forwardは`confirmed`、`preserved_pending_rehome`、変更権限`explicit_human_decision_only`、successorなし、decision recordなし。構造分類はCSC-129で`service_6_release` primary／`os_acceptance` secondary、要求と技術bindingの混合とする。product-routing候補はHARNESS/OSへのsplitだが、正式なsuccessor割当ではなく、公開・tag・promotion・cutoverの認可条件とHARNESS V1後の提供時期は未解決としている。

HBR-P6行にはgated push、PR cross-review、CI auto-fix-repush、tag版管理も混在する。本監査はそのうち外部提供物、配布、bootstrap、consumer条件だけを比較する。GitHub gate、PR/CI自動化はpackage条件へのsuccessor根拠にしない。HR-FR-P6-05のrelease-tool ADRは隣接する技術残差として記録するが、CI auto-fix閾値は対象外。

## 旧sourceとconsumerが要求する条件

source行55は要件v1.3 HR-FR-HYB-008/010、§4.6.1に接続すると明記する。柱要求§2.7の109–111行、旧L3 consumerのHR-FR-P6-03/04/06とHR-FR-HYB-008、v1.3 §4.6.1、HOT-P6が示すpackage/distribution条件は次の通り。

1. development repositoryを配布正本とし、source HEAD、requirements version/digest、package version、artifact digest、exact include/exclude set、generated index、first/third-party、license/attribution、build environmentをmanifestに束縛する。manifest外file、重複path、digest driftを拒否する。
2. development-only PLAN/design/test evidence、harness.db、`.helix` runtime/memory、credential、PII、machine absolute path、audit/handoverを除外する。consumer-safe assetは明示列挙し、除外によってdoctor/gateを縮退させない。
3. POSIXとPowerShell entrypointは同じNode artifactを実行する。Bunや旧Python/Bash/UT runtimeをconsumer実行authorityへ戻さず、旧behaviorは現行schema/Node境界へ再実装する。
4. `helix setup project`一回でfresh repoと既存repoの途中導入を扱い、repo-local hooks、Claude/Codex adapter、`.helix` baseline、memory/evidence/feedback、GitHub rulesets/required-check plan、consumer doctor baselineを用意する。既存docs/code/stateはimport reportとskip_sub_doc/段階移行を使い、未整備sub-docだけで即時blockしない。
5. consumer doctorはdogfood doctorではなく、setup投影済みadapter、VSCode task、`.helix` baselineを確認する。setup/updateはmanaged marker内に限定してidempotentに行い、consumer所有file、marker外、source/docs/tests/history、consumer-owned evidenceをupgrade/rollback/uninstall時も保持する。
6. README、LICENSE、third-party attribution、provenance、免責が必要。fresh Linux processでinstall→setup→status→consumer doctor→minimal delegated workflow dry-runを検証し、Windowsでは同じNode artifactとPowerShell entrypointをsmokeする。自己適用asset、未解決bare CLI、package script欠落、network/credential前提、非idempotent再実行を拒否する。
7. semverとimmutable tagへsource HEAD/artifact digestを束縛し、`canary → preview → stable`を同一artifact digestで一方向promotionする。criteria、観測window、stop/rollback trigger、receiptを持ち、rebuild差替えや段階skipを拒否する。
8. distribution repositoryへのsyncはdry-run diff、backup、restore rehearsal、consumer canary、post-promotion monitoringを持つ。失敗時は前のimmutable tagへ戻し、consumer repo自体ではなくengine pinとmanaged projectionを復旧する。
9. remote sync apply、tag、publish、promotion、正式配布先変更、identifier/state cutoverは、actor/tool/target/params、reviewed snapshot、expiry、rollback、monitoringを束縛したaction-binding approvalを要する。可逆なplan、dry-run、local smokeは自走可能。
10. package indexはcanonical sourceから生成し、first/third-party、provenance、license、disclaimer、digestを含む。手編集や未承認cutoverを拒否する。

旧v1.3 §4.6.1とL3 consumerはHOT-P6にも流れ、HOT-P6はsource HEAD・requirements digest・artifact digestの対応、fresh/existing導入、consumer doctor、非破壊更新、migration/rollback/idempotency、CI greenと公開権限の分離を要求する。HOT-P6は旧文書上「未実行」の受入案であり、実行証拠として扱わない。

## 固定f6 L2/L11とdecision

HARNESSのf6 HDECはL2 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`を固定し、OSのf6 HDECは`governance-requirements.md`と`governance-acceptance.md`を固定する。OS側はf6時点で現行のproduct-requirements/product-acceptanceファイル構成ではない。4 identityそれぞれのL2/L11全exact-token行、file digest、節digestはJSONにある。

| 固定pair | f6で確認できる条件 | 残るpackage/distribution差分 |
|---|---|---|
| HARNESS-L2/L11-006 | 外部利用者がサービス①〜⑦単位で提供範囲、版、依存、導入条件、release kanban状態を見て選択利用する。L11は単一選択サービスの利用、artifactから許諾版・対象asset・第三者通知・導入更新復旧条件へのtrace、収載/除外、同一入力からのmanifest/artifact再現とclean consumer利用を受け入れる。外部利用者にHELIX内部運用状態を要求しない。 | 外部サービスの条件・artifact・clean consumerに部分対応するが、packageのexact manifest全項目、自己適用除外とruntime boundary、setup投影内容、consumer doctor/import、全platform smoke、README/LICENSE publish gate、immutable tag/channel promotion、distribution sync/monitoring、action-binding、generated indexを閉じない。 |
| HELIXOS-L2/L11-006 | HARNESS提供版をfresh/既存repoへ導入・更新・復旧し、source・要求revision・artifactを辿り、既存成果消失、別artifact切替、未選択サービスの同時導入を拒否する。 | 実行・保全・provenanceの部分基盤。managed marker、生成内容、migration適用境界、doctor/import、package/version/channel/sync、公開approvalを特定しない。 |
| HARNESS-L2/L11-007 | Version 1完成について複数product、HELIX dogfood、7サービスそれぞれの単体成立・接続、およびConcept BASE 7項目の証拠を確認する。 | 製品群完成の受入条件であり、配布packageの内容・公開条件を定義しない。 |
| HELIXOS-L2/L11-007 | Worker/判断/操作/検証の共通証拠、provenance、revision参照、欠落/重複/staleの識別を行う。L11-005はHARNESS導入、release準備/artifact受渡し、deployment/observationを区別する。 | 一般的な証拠・handoff隣接であり、外部package manifest、consumer verification、channel/publish approvalのoracleではない。 |

HARNESS-L2/L11-006・007のbase rowsはHDECが固定した採用対象であり、MPR candidate登録をauthorityとしていない。MPR登録がないことを不採用や未承認の根拠にはしない。逆にpairの存在からHBR-P6 successorや旧条件全体のclosureも導かない。

## 後発near pairの全量screen

後発57候補・11候補・live26のPO決定表の全94 identity（57+11+26）をcompact indexとしてJSONへ収録し、decision原行・SHAとそれが指定する正確なMPR登録行・SHAを照合した。採択/承認88件（53+10+25）と保留/未採択6件（4+1+1）を区別する。11候補判断は採択表10行に加え、HARNESS-L2-049の現revision `-002`を未採択とする説明行を第11件として収録した。条件付き採択はraw decision rowと判断文のscope説明をピン留めし、選択条件と訂正後revisionに限定する。#2433/#2434のreviewで指摘されたadopted-only/selected-only screenの不足に対して、ここでは候補集団を省かず全94 identityを明示する。後発判断はf6に遡及適用しない。

内容上の近接または隣接候補は以下の通り。すべて別identityであり、HBR-P6へのsuccessor割当ではない。これらの近接screenは採択/承認88件だけから選び、6件の保留/未採択を近接pairや採用済み根拠に数えない。MPR登録行は各decision rowについて正確なregistration ID、version_target field有無、line SHAをJSONに固定した。Decision対象のMPR JSONLに`version_target` fieldはない。判断文で確認できる明示的な版指定はHELIXLABO-L2-062の2.0（P6対象外）で、11候補判断は未指定を1.0へ自動変更しない。HELIXOS-L2-045はversion_target等の明記待ちで保留。

| pair | 近接点 | 境界 |
|---|---|---|
| HARNESS-L2-046 | Scrum Reverse、slice delta、release-ready | 開発workflowでありpackage/channel/tag条件ではない。 |
| HARNESS-L2-051 | stage-exit evidence | stage evidenceでありexternal package条件ではない。 |
| HARNESS-L2-052 | command semantic identity、retry/idempotency | one-command setupと語彙上近いがsetup/distributionを要求しない。 |
| HARNESS-L2-053 | semantic asset identity/path/revisionとmerge/split | artifact identityに隣接するがdistribution manifest/contentではない。 |
| HARNESS-L2-057、HELIXOS-L2-054 | closure gate、証拠、OS handoff | authority境界に隣接するがexternal publish/tag/action approvalではない。 |
| HELIXOS-L2-108 | artifactからconsumerへのreverse relation | 選択scopeの関係でありpackage census/generator/startupを定めない。 |
| HELIXOS-L2-109 | source/generator/artifact/consumer revision・digestのprovenance | 選択chainの来歴でありwhole package manifest、runtime、generationを検証しない。 |
| HELIXOS-L2-110 | consumer pin/current epoch/staleness | release channelを定めない。 |

## 判定と限界

固定f6にはHARNESS側の外部提供条件・artifact trace・included/excluded scope・reproducibility/clean consumer、およびOS側の導入更新復旧・成果保持・source/requirement/artifact traceという部分的な保持がある。一方、旧consumerが明記するpackage manifest全体、自己適用とruntimeの境界、one-command setup生成物、consumer doctor/import、marker内非破壊ライフサイクル、文書/ライセンスのpublish gate、Linux/Windows smokeとnegative oracle、immutable tag/channel、distribution sync/rollback/monitoring、action-bound external publish、canonical generated indexは固定pairで閉じていない。HR-FR-P6-05のrelease-tool ADRも別途残る。

したがって旧HBR-P6のsource authorityや意味は変更せず、successor assignment、retire、atom closure、L3承認、実装・公開許可も発生させない。後発near pairは明示した部分的類似に留まり、非successorである。保留/未採択6件もsuccessorやclosureには数えない。特に11候補時点のHARNESS-L2-049 `-002`は未採択であり、live26の`-003`承認は訂正後の計測専用scopeに限る。`-002`の処置を継承せず、試作品生成・Pattern選択・screen ID発行も含めない。これはStep 5全体の完了を主張するものではない。

## 静的検証

archive source/consumerとholding copy、carry-forward identity、fixed f6 pair、HDEC、後発決定表、MPR行のSHA/line pinとJSON構文を静的に照合する。`scfctl`の現行scaffold静的検証と`git diff --check`のみ実施する。旧CLI、旧tests/hooks/runtime/CIは実行しない。
