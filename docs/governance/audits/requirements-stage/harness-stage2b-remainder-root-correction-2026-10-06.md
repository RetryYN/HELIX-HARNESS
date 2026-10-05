# HARNESS Stage 2b 残5親のroot指摘補正記録

- 旧本文revision: `fa72a858efe925f172f97e7f65c18bfcff72493e`
- 補正本文revision: `67cf94d5f81b2336ec3d98e5789e981ff283d8a8`
- 固定親revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- PO判断revision: `633bf12ea8f948db8ba3d6600179c4a9507377a7`
- 変更対象: FR/FV 2文書のみ。旧監査 `docs/governance/audits/requirements-stage/harness-stage2b-remainder-root-audit-2026-10-06.md` はSHA `6305c44dbfcc7617b9fd2069092329925e5bb89d3d3a4baaf1fa799d9c99569e` のまま保持。
- この補正は文書fixtureの静的整合だけを記録し、独立review・L3承認・受入実行を主張しない。

## 補正内容

5件の汎用R001を固定親の具体例へ置換した。017はVerified/Acceptedと開始時Release Portを持つ同一artifact、018は11品質軸のstatusとowner、019はCORE単独の任意stage入力、020は互換する隣接contract、024は既回答actorとretention owner/表示ラベルの優先例を明示した。

017ではProvisionalの受取拒否と、L2-022の対象要求revisionに不適合な外部受入evidenceの拒否を別caseにした。020では責務外ownerの割当変異をowner欠落と別caseにし、該当する前出力契約ownerまたは次入力契約ownerへ戻す。L2から owner identityを確定できないときは推測せずunknownを保持する。

018の既存R002–R034は、可用性・信頼性・性能・容量・費用・security・privacy・運用・保守・回復・observabilityの11軸について、各軸を1つずつ適用／非適用／unknownにした計33件として確認した。

024では高影響retention ownerより低影響表示ラベルを先に問う変異、旧target L1 revision回答の流用、旧source revision回答の流用、旧revisionに結び付くprototype合意の流用を各独立caseにした。timeout成功扱いは既存R049をAC-024-05へ結び替え、timeout以外を保持したまま成功化する単独negativeとして明記した。

## 静的照合

- case数: 156、ID重複なし: True。親別件数: {"017": 16, "018": 46, "019": 13, "020": 18, "024": 63}。
- 全L10 caseのFR/AC参照は実在するIDへ解決した。case tableは4列で揃っている。
- 018の11軸すべてに適用／非適用／unknownの3状態caseがある。
- 6 canonicalのStage 2b追補前prefixは旧本文と一致する。
- `git diff --check` はPASS。旧runtime/test/CI/Bunは実行していない。

## 固定sourceと変更line pins

JSONに固定L2/L11 f6の各対象span（full-file SHA・raw-LF span SHA）、PO判断行、補正前後のliteral/line SHA、6 canonicalの補正後full SHA、全case行のID/AC/literal/hashを記録した。

## 限界

- 旧root監査はimmutableの時点記録としてそのまま保持した。旧監査の当時case数149から現在の156への変化は、新設7件とtimeout既存R049の内容訂正による。
- 本記録はroot検収/独立reviewを代替しない。
