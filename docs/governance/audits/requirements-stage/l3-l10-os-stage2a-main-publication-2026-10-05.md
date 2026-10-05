# HELIX-OS Stage 2a main-based publication cutout

## Scope

対象はHELIX-OS Stage 2aの `HELIXOS-L2-015/016/017/018/019/020/023/027`、`version_target: 1.0` の8親です。Stage2b-014は新たなStage2a親として加えず、Stage2c、版未指定要求、他Stageの本文も追加していません。Stage2aはL3未承認の候補、L10は未実行の設計です。

## Prefixと元候補からの移行

main `1fcd83982bbb93c0630951c80dfd076e98caa54c` の6 canonical bytesをそのままprefixとして保持しました。委任判断 [Stage2b-014 decision](../../decisions/helix-os-stage2b-l3-l10-po-decision-2026-10-05.md) は本文revision `6276adb92b3056b1e53055cd56f214ebc5d87158` の6文書を承認し、その記録はbaseにadmitされています。Stage2b prefixの承認を後続Stage2aへ継承していません。過去のStage2b source receiptは当時の `not present` statusを含め不変で保持し、後のadmitted decisionと混同しません。

旧Stage2a候補 `2cf89e02c345736f15e41a0df13ea98dc69fc07a` はbase `1880c422311a7f8321dbb0e2b98fa12c69449201` 上の6 standalone文書・456行でした。新cutoutはそのStage2a本文を6文書のprefix後へ追補し、standalone H1をStage2a見出しへ、旧H2をH3へ再配置しました。3 L3文書のstatus句だけを `PO L3承認前` から `L3未承認` へ改めました。6文書のline mappingで他の内容を旧候補と一致確認しています。

## Source・記録

旧監査に含まれた48 source pinsをGit bytesから再計算し、全文・LF込みspanとも48/48一致しました。旧Stage2a-only static-validation JSONとPO summaryは、元commit `648346ecfe3a9083f4d8fd6c9c6f259df3a62d14` のbytesをraw-copyして不変記録として同梱しました。これらの旧記録は新mainの現行canonical状態を表しません。HTTP fetchはしていません。HTTP 422のローカル観測をsource evidenceには使いません。

6本文のfull SHA、byte/line数、prefix SHA/byte数、追補span・raw SHA、追補全physical-line pinsは同名JSONにあります。そこにStage2b decision full/raw pin、承認済み6 SHA、48旧source pins、old records SHAも固定しています。

## 静的確認

Stage2aは28 unique AC、84 unique functional CASE、BR/BV参照の未解決0。Stage2b prefixとの合計は39 AC、106 CASEでID重複なし。`scfctl validate` は147件 / fail 0、`stale=0`、`residuals=0`、`git diff --check` pass。旧runtime/test/CI/BunおよびL10実行はしていません。

本文commit `f7c90233e957d71afef22a1b94f7bd5a404dfa27`、base `1fcd83982bbb93c0630951c80dfd076e98caa54c`。独立review、Stage2a L3承認、実行合格、release許可はこの記録から生成しません。pushなし。
