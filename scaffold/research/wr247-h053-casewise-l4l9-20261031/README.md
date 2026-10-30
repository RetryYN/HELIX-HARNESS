# WR247 H053 L4/L9 casewise projection

status: scaffold（PR-Aの行別設計根拠。authority_effectはnone）

authority_effect: none

base: `756cac0ebdf02d38d0703566bae24c8de20b3275`

WR239（#3510 comment 6533432579）とWR242（#3510 comment 6534090409）のfixed blindは変更せず読み、各38行のcasewise根拠とsource leafを確認した。WR242 R1 addendumは、#3955/#3968のHARNESS011先例に沿ったcasewise投影を可能とし、比較PRで実施しなかったことを「不可能」と扱う旧結論を撤回している。ここではformal class membershipを作らない。

L4 `failure_classifications` の38行に`change`と`expected`を追加した。`change`は各行の既存`conditions[0]`を保持してsingular fieldへ写した。`expected`はWR239のsource leaf（一意に対応づくsource leafがない10行は固定されたL3/L10要件・検証行）と既存L4の期待軸・effectから行別に組み立てた。固定L9の`expected`は導出元にせず、checkerが照合する不変targetとして一致を確認した。行別source pointer・blind candidateへの対応・根拠は[`casewise-design-record.json`](casewise-design-record.json)に記録する。

既存の`conditions`・`effect`および期待軸/stateは維持した。L9、L5、L8、固定blindは編集せず、新しいblindやnegative class markerも作成していない。

旧HELIXとの対応はWR239 fixed auditから継承：`LEGACY-ASSET-A4DD57E39031B1402494` (`archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/data.md:44,183`)、`LEGACY-ASSET-310E87378AFE8095809C` (`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/physical-data.md:256-292`)、`LEGACY-ASSET-36AC5308AB06DEF9DE4B` (`archive/legacy-generation-2026-09-14/root/docs/reference/system-review-triage-2026-07-12.md:26`, IMP-002)、`LEGACY-ASSET-CCA6C60FBB1D735EC38E`（同failure record crosswalk）。旧本文・規則は現行へ複製せず、固定source-only調査で識別されたasset IDsと対応差分のみ引き継ぐ。

`scfctl validate/stale`とstatic `check-child`の前後実測は`verification-summary.json`に記録する。check-childは文書間照合のみで、実動作・要求採択・承認・完了を意味しない。L4 algorithm、runtime、test、CI、旧CLI/hook/runtime/CIは起動しない。
