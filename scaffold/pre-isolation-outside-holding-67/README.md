# PREISO holding外67 path監査（findings only）

この候補は、PR #1957で示された baseline→pre-isolation の全Git差分400 pathから、既存pathの333件 holdingに含まれない新規追加67 pathを、静的・read-onlyで確認した記録です。対象は [report.json](./report.json) に固定し、path、差分status、Git objectの所在、現行mainの状態、旧asset catalogの記録有無、およびpath由来の製品・層分類を収録しています。

## 判定

67件はholdingの分母漏れと確定できません。holdingは既存pathのbyte差分を収録する契約で、67件は全件Git status `A` の新規pathです。archive commitには67件のsource-path objectがありますが、現行 `archive/legacy-generation-2026-09-14/root` には0件です。archive commitとpre-isolationのblobが同一なのは39件、異なるのは28件でした。現行mainは8件のみ同じpathを持ち、同一blob2件・変更6件、59件は不在です。

旧asset catalogとのpath一致は0件でした。したがって旧資産のphase/product/implementation分類を根拠にできず、path構造から新世代のdraft/upstream文書面を候補分類しました。67件に実装sourceのpath証拠はなく、authority・要求atom・完了を確定する根拠もありません。

## 状態

- `status`: `findings_only`
- `binding_created`: `true` (SCF-B-0023, registered)
- `authority_effect`: `none`
- `old_archive_execution`: `false`
- path set SHA-256: `sha256:fdcc60e7354a32d77b2ca563461a26737867a8f07ad41b64e01e707330ca9381`

この記録は候補 scaffold であり、SCF-B-0023は未使用のregistered状態です。authority、意味atom、正式保存先、実装、完了は未確定です。
