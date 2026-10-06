# HELIX-OS Stage 5 4親 fixture補完監査

- 対象: HELIXOS-L2-025/026/031/047（Stage 5、version_class 1.0）。本記録のauthority effectはnone。
- 本文commit: `362e2f7607ec7a03daef2d8936492cca6ff97a07`（開始HEAD `f912ec0efe42656d7a83f770714db7af2bef21e1`、6正本のみ）。対象6ファイルのbase prefixは6/6 byte一致。
- L10個別CASE: 140件（025=21、026=30、031=63、047=26）、ID重複0。全定義はJSONにliteral、LF込みspan SHA、AC IDで保存。
- 固定L2/L11はsource commit `5acae384305b01d10e88eeb2e6406f847baf66df` のfull-file SHA、拡張section span raw-LF SHAとliteralで個別pin。従前の026/031 L11 heading-only pinを親節全spanへ補った。
- PO decision、G0 Stage 5/version_class 1.0 sequence records、現行MPR metadataは別々にpinし、登録metadataを採択やauthorityと同一視しない。
- 旧source pins: 10ファイル、各full SHAと指定span raw-LF SHA/literal。旧sourceは読むだけで、runtime/test/CI/Bunは実行していない。
- 旧025はL00-L06 L3 phase formと限定phrase searchのみ。`統合運転`等3語は指定docs treeで0件。旧専用requirement/paired consumer不在をarchive全体へ一般化しない。
- 旧026は3件のFRS sourceとpaired acceptance、旧031はCI performance/atomic/synthesis/test-design、旧047はticket requirement/acceptanceの指定spanのみを対象とし、全archive closureを主張しない。
- 031の旧60秒/3分は旧environment/profile/population-bound comparison valuesとして保持し、current universal SLOにはしない。
- 既存監査: 開始HEAD時点の1878 tracked governance audit pathsをmanifest化。変更/欠落: 0。
- `git diff --check` pass。latest-main統合stale/residual checkはRoot担当で未実施。

## 補完した意味範囲

- 025: 7サービスそれぞれのunit正常、選択connection/composite正常、部分未見正常、unknown/stale/未許可/human-wait、後続版前倒し・OS外部製品化・LABO移管戻しの反例。
- 026: source/revision、HARNESS contract版/compatibility、復旧、permission、owner、人の許容工程、通常/安全dependency各missing/unknown/stale/conflict、空集合unknown、安全省略、未決pack、未撤去working tree、別stage bootstrap cycle、一層削除のみのminimum誤導出。
- 031: measurement field個別欠落・不一致、4種のAC03弱化、escaped defect/mutation/flake、cache/HEAD/budget/review/reverification、lease/fence/parallel、artifact field binding、telemetry/quota/DAG fallback、cancelled success、exactly-once、causal trace。
- 047: reason/evidence/root revision欠落、Assignment/Attempt/result/authority非継承、target/returner/source/scope/relation unknown、provider-only identity、Ticketとartifact両方向参照、旧証拠と新revision state分離、split/scope/backflow既存owner。

JSONには固定sourceと旧source各literal/hash、6正本full/prefix/suffix pin、CASE個別inventory、未確認範囲を収録。Stage全件approval gateや新owner/graph/thresholdは作っていない。
