# L3 274親意味監査indexのmapping訂正追補

- 記録時点: 2026-10-07T21:24:26Z（GitHub API確認）
- 現行main: `dddab671b034b866efeb56af8f6c0f192a06fe3f`
- 作業枝基点: `d629e25254a7c1d505543a0ce6ca3183c3fc4d67`
- 正本snapshot: `l3-stage-274-semantic-audit-index-d629e2525-2026-10-08.md`（90,171 bytes、SHA-256 `5a844bad47ad27662200c70cacbaef0d67e3c585fcd6381dd983aa27f3719aa7`）および対応JSON（1,060,032 bytes、SHA-256 `95447df5f9f63e07e19cd884744a48328031f5cdc1dea2d22602871314b9458f`）。この2ファイルは変更していない。
- この追補はPR範囲と現時点の対応関係を正すもので、要件意味の完了・独立レビューの代替・L3承認を生成しない。274親全体の同深度再監査も行っていない。

## 訂正

| 対象 | 元snapshotの位置と記載 | 確認した根拠 | 訂正後／現在の限定状態 |
|---|---|---|---|
| LABO063 | MD 211行、JSON `/parents/198`。#2687 OPENと対応付け | #2687はMERGED、head `d3b54c0edffe741bb15235c031405ed63a790c1f`、merge `f0e210b3cdf5c1f95dfcf07cfc3504a240dd2e4d`。PR題名・scope・diff・formal review02/03は親059/067のみ。新しい#2694は063限定、HEAD `838caee4f198a7dfe66c1137ac4c7a04ce8f512a`、OPEN。PR bodyと修正後review依頼comment `6047025779` を全文確認。独立formal reviewはまだ記録されていない。 | #2687を063から外す。#2694を「063残余の修正提案・OPEN、独立review待ち」と対応付ける。#2694の本文が正しい／意味完了とは判定しない。 |
| LABO064 | MD 212行、JSON `/parents/199`。#2687 OPEN | #2687のPR本文・変更ファイル・formal review02/03の全scopeは059/067。064を含む変更はない。 | #2687を外す。064のsemantic/follow-up mappingは`unknown`のまま。 |
| LABO065 | MD 213行、JSON `/parents/200`。#2687 OPEN | #2687のPR本文・変更ファイル・formal review02/03の全scopeは059/067。065を含む変更はない。 | #2687を外す。065のsemantic/follow-up mappingは`unknown`のまま。 |
| LABO061 | MD 210行、JSON `/parents/197`。semantic/follow-upはunknown | #2629のmerged PR titleは「親061のL3要件とL10総合検証を再導出」であり、今回のsemantic repair対応を示すものではない。Rootは061修正を内部検収済みと報告しているが、現時点のPR一覧ではその修正に対応する専用repair PRを特定できない。 | unknownを維持する。PR対応mappingはunknownのままにする。Root報告の内部検収は記録するが、親061の意味完了を推定しない。 |
| LABO070 | MD 218行、JSON `/parents/205`。#2661 MERGEDのみ | #2691はMERGED、head `2224d101c2fd62ecea57e0b87abc153ccd7b5dc1`、merge `ce70628e53ff5f78c1321accf57429c740ea585d`。formal review02 `6046922666` とPR diffが親070 AC-05/CASE131・132のtask/attempt成功率出力禁止を確認。現本文locator: `docs/helix-labo/L3-requirements/functional-requirements.md:1961`、`docs/helix-labo/L10-verification/functional-verification.md:3736-3737`。 | #2661に加えて#2691 MERGEDを関連PRとして追記する。PR mergeは意味完了の証拠ではない。 |
| INTELLIGENCE063 | MD 150行、JSON `/parents/137`。findingあり、repair PR未記載 | #2681はMERGED、head `94e43fa6d28ba8e798ff6bb78ac523f325aa501d`、merge `e028e18c90e83295c84d77c4829702a349bce0dc`。formal review02 `6045484458`、review03 `6045559566` とPR diffが063/069を対象と確認。現本文locator: `docs/helix-intelligence/L3-requirements/functional-requirements.md:690`、`docs/helix-intelligence/L10-verification/functional-verification.md:2454,2652-2653`。 | #2681を063にも関連付ける（069にも関連する）。reviewが示す限定修正範囲だけを記録し、全INT063意味完了とはしない。 |
| OS028 | MD 234行、JSON `/parents/221`。誤った「contract version/verification scope descriptor coverage」finding | 起点の監査source A049: `docs/governance/audits/requirements-stage/l3-stage-274-semantic-audit-source-snapshots-d629e2525-2026-10-08/os-stage2b-014_stage2c-028-029-meaning-audit-e028e18.json`, 22,055 bytes, SHA-256 `dfb417dfd3a4814d4027932f23950bc9c4420964cc75bb0c3b519d8d70abcf66`, finding locator `$/reported_findings/findings/0`。ここで扱う候補は、選択sourceのidentity/provenance/relevance/constraintsの個別oracleと、NFR分子censusにprovenance/constraintsが欠ける点。#2688はMERGED（head `1eaf8265db542fc06a7757f5da505e72f255dc9c`、merge `dddab671b034b866efeb56af8f6c0f192a06fe3f`）で028/029の選択source bindingを対象とする。現CASE locatorの例は`docs/helix-os/L10-verification/functional-verification.md:141-144`。 | finding記述をA049の選択source oracle/NFR census候補に訂正。誤ったdescriptor findingを削除する。#2688 mergedは限定修正の事実として記録するが、OS028全体の意味検収完了とはしない。 |
| OS036 | MD 241行、JSON `/parents/229`（A051/A052参照、#2680 MERGED） | #2680はMERGED、head `3fa0f40c62bc937252ca0bf98be772661eedd320`、merge `d8a6be234c17a8ce44b9f000c2f41ebf15a70434`。今回のindex追補ではA051/A052の旧hash疑義を修正・再検証していない。Rootから旧監査のhash訂正は別の新追補で扱うと通知されている。 | #2680は狭い修正として維持。既存semantic evidence/meaning statusはunknownのまま。旧監査hash訂正が済んだとは書かず、全親の意味完了を推定しない。 |

## API・本文の確認範囲

GitHub APIで#2681、#2687、#2688、#2691、#2694および#2629、#2680の状態・head・merge commitを照合した。#2694の現状態はOPEN、HEAD `838caee4f198a7dfe66c1137ac4c7a04ce8f512a`、base `ce70628e53ff5f78c1321accf57429c740ea585d`。確認できたcomment `6047025779` は作成側のreview依頼であり、独立formal reviewではない。LABO063修正後の6本文のsemantic completenessは未検収である。

#2687の正式review02/03、#2691の正式review02/03、#2681の正式review02/03、#2688の正式review01/04と各PR差分を根拠にした。snapshot内のA049 source JSONを再hash確認した。#2687が059/067に限定されること、#2688がOS028/029に限定されること、#2694が現時点で独立review待ちであることを反映した。

この追補はmapping訂正である。未読の全consumer、全旧source、全274親の再review、fixture実行、PR外でのRoot検収内容は検証済みと主張しない。LABO061はPR対応mapping unknown（Root報告の内部検収済みと区別）、OS036も旧hash訂正・広範な意味監査が未了である。PRのmerge・review・index記載だけから承認や完了を生成しない。
