# Scaffold Binding全150件の置換・撤去棚卸し（2026-10-22）

```yaml
evidence_kind: audit
authority_effect: none
request_id: WR-CODEX-BINDING-INVENTORY-3544-20261022-01
base_sha: 8600d8b3855c12bbf668302b6b1e5ca2863556ea
```

## 対象と結論

[#3544](https://github.com/RetryYN/HELIX-HARNESS/issues/3544)の依頼に従い、上記baseの`scaffold/bindings/*.json`全150件を棚卸しした。置換・撤去候補0件、継続66件、不明84件。stateはactive 28件／registered 122件で、replacing／retiredは0件である。分類はこの時点の証拠の整理であり、Bindingのstate変更、正式移管、要求採否、実装成立、撤去許可を生成しない。製品属性を持つHELIX-HARNESSの契約と、製品ではないHELIX-OSのlifecycle管理を区別する。

- **継続**：現行文書に直接consumerがある7件と、それ以外で別Bindingの現行`/upstream`に本体または宣言artifactへのpinが残る59件の計66件。全pin連鎖をたどると、現行consumerに届くもの13件（直接7＋0040への連鎖6）、根の必要性が不明のもの53件に分かれる。後者は参照残留だけを保持する内訳であり、継続利用の必要性を確認した意味ではない。どちらもruntime実利用の証明ではない。
- **不明**：84件は検索範囲で現行外部consumerの利用を確認できない。自己説明、宣言consumer、過去のaudit／decision、append-only仮登録履歴、他研究の単なる言及から利用を生成しない。参照が見つからないこともconsumerゼロの証明ではない。
- **置換・撤去候補**：正式側への完全移管または役割不要を現在の証拠で確かめられたものは0件。候補を推測で補わず、実際の撤去は依頼どおり候補ごとの別PRへ渡す。

正式物の有無について、全150件の`/replacement/formal_artifacts`は空、`/replacement/transfer`は未記録、`/replacement/target_revisions`は空である。表のBindingリンクから各pointerを照合できる。**正式置換先は全件「登録なし・有無未確認」**であり、repository全体で正式物が不存在との結論ではない。22件では`role_target`も未特定である。既存の役割・義務・consumer・oracleの移管を未確認のまま退役可能とは扱わない。

## 数量と削減見込み

| 区分 | Binding数 | outgoing pin総数 | docs/ | その他 | Binding依存 |
|---|---:|---:|---:|---:|---:|
| 継続（現行consumer接続） | 13 | 135 | 84 | 51 | 0 |
| 継続（pin連鎖の根不明） | 53 | 1,956 | 1,339 | 614 | 3 |
| 不明 | 84 | 1,975 | 1,434 | 527 | 14 |
| 置換・撤去候補 | 0 | 0 | 0 | 0 | 0 |
| 全件 | 150 | 4,066 | 2,857 | 1,192 | 17 |

全件を横断した一意pathは831（docs/ 247、その他574、Binding 10）。表のD/O/Bは各Bindingがpinするdocs/文書・その他・Bindingの件数で、各Binding内に同一pathの重複はない。全体のpin件数と一意文書数を混同しない。

**現時点で確定できる削減は0件**。各行の総数は、そのBindingを将来適正に退役できた場合に`stale`対象から外れる旧outgoing edgeの上限であり、現時点の削減予測ではない。正式側へ移すpin、他Bindingからの参照修正、監査用履歴の保持が未確定なので、全行の純減見込みは不明である。`scfctl.py:634`の`stale`はretiredを除くが、単にpinを削る操作は行っていない。

[10/03監査](source-rebaseline/l3-d0-scaffold-retirement-inventory-2026-10-03.md)のbase `633bf12ea8f948db8ba3d6600179c4a9507377a7`では143件。その後0153／0154／0155／0156／0157／0158／0160の7件が加わり削除0件。[#1866](https://github.com/RetryYN/HELIX-HARNESS/issues/1866)の148件時点のmain `89d4da8eb5112a7bf4b9f86f37e9d72e4ba84fe6`との差分は0158／0160の追加2件、削除0件。件数の増減自体から移管・完了を判断しない。

[#3565 comment 6330111771](https://github.com/RetryYN/HELIX-HARNESS/issues/3565#issuecomment-6330111771)は#3566の約12行の文書変更について「20 Bindings・33 pin」と報告した。一方、base `c39235ce29db9dccdd0e659d7605c4a14fce9c77`と最終content `3540dba9e7a5b36e0f128f96ba29d5c255481e76`の`upstream[].sha256`をpathで照合すると、20 Bindings・**32 pin（docs/ 31＋Binding間1）**である。通知値と区別し、この監査の実測は32とする。旧報告本文は変更しない。手動追随の波及という失敗は確認するが、この棚卸しから新しいgateや自動更新方式を要求へ追加しない。

## 読取範囲と旧sourceとの対応

150件の`/role`・`/obligations`・`/connections`・`/artifacts`・`/replacement`・`/upstream`を読んだ。consumer検索はtrackedなAGENTS／CLAUDE、docs、非self scaffold、別Binding upstreamのBinding ID／pathと宣言artifactのliteral pathを対象とし、宣言directoryはtracked descendantも照合した。audit／decision／archive／append-only MPRと同一artifact内の説明を分けた。動的参照、ローカル外部設定、GitHub上だけのconsumerを網羅した証拠ではない。表は代表1件を示し、他の参照を消したという意味ではない。

- 旧[ddd-tdd-rules.md:85](../../../archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md#L85)（`LEGACY-ASSET-5E22432B0A5A8F7CC8B3`、SHA-256 `9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af`）のremoval_trigger／consumer_zeroを確認した。
- 旧[deprecation-cutover.md:34](../../../archive/legacy-generation-2026-09-14/root/docs/skills/deprecation-cutover.md#L34)（`LEGACY-ASSET-95E14F385D8C1F71C209`、SHA-256 `cc83066540bb93976343e4d4044b943c77fd1572e9dfe51473b3f223ff6dc089`）のlanded replacement、残存reference、rollbackを確認した。両assetは台帳上unresolvedで、旧consumer閉包・稼働実績は未確認である。
- **意味再導出**：置換先とconsumer移管を確かめて旧物を除く点を保持し、旧PLAN／CLI／旧CIの手続きを現行へcopyせず、既存[Scaffold説明](../../../scaffold/README.md)と[候補契約](../candidates/scaffold-binding-requirements.md)、[L2D-S0判断](../decisions/l2d-s0-approval-and-s1-01-defer-2026-09-19.md)のHARNESS契約／OS管理の分離、`check-replacement`の移管確認へ対応させた。旧要求の意味変更や新承認手続きは提案しない。

## 全件表

全行の正式側の根拠は、Bindingリンク先`/replacement/formal_artifacts`・`/replacement/transfer`・`/replacement/target_revisions`（上記の未登録）である。不明行の`宣言のみ`は同ファイル`/connections/consumers`を指す。継続のpinは当該consumer BindingのJSON Pointerを示す。継続行の「現行根／不明根」は全inbound pin経路を推移的にたどった根IDであり、代表1件だけから根を選ばない。現行根は0001／0003／0040／0152／0153／0154／0158の7件。現行根に届かない場合はinbound pinのない根をすべて記す。根不明の53件を実利用確認済みへ読み替えず、不明84件と同じ未確認を保持する。D/O/Bと純減不明の読み方は前節を適用する。

| Binding | state／分類 | pin総数（D/O/B） | consumer根拠 |
|---|---|---:|---|
| [SCF-B-0001](../../../scaffold/bindings/SCF-B-0001.json) | active／継続 | 2（2/0/0） | [AGENTS.md:53](../../../AGENTS.md#L53) scfctlによる置換確認の現行指示；現行根：0001 |
| [SCF-B-0002](../../../scaffold/bindings/SCF-B-0002.json) | active／継続 | 3（3/0/0） | [SCF-B-0102.json](../../../scaffold/bindings/SCF-B-0102.json) `/upstream/47/path` → `scaffold/governance/README.md`；不明根：0146 |
| [SCF-B-0003](../../../scaffold/bindings/SCF-B-0003.json) | active／継続 | 7（6/1/0） | [docs/governance/github-upstream-operating-model.md:321](../../../docs/governance/github-upstream-operating-model.md#L321) 現行GUI通知運用；現行根：0003 |
| [SCF-B-0004](../../../scaffold/bindings/SCF-B-0004.json) | active／不明 | 11（4/7/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0005](../../../scaffold/bindings/SCF-B-0005.json) | active／不明 | 13（9/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0006](../../../scaffold/bindings/SCF-B-0006.json) | active／不明 | 13（9/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0007](../../../scaffold/bindings/SCF-B-0007.json) | active／不明 | 12（7/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0008](../../../scaffold/bindings/SCF-B-0008.json) | active／不明 | 13（9/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0009](../../../scaffold/bindings/SCF-B-0009.json) | active／不明 | 12（7/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0010](../../../scaffold/bindings/SCF-B-0010.json) | active／継続 | 13（9/4/0） | [SCF-B-0048.json](../../../scaffold/bindings/SCF-B-0048.json) `/upstream/18/path` → `scaffold/research/delegated-doc-002-013-004-029/README.md`；不明根：0048 |
| [SCF-B-0011](../../../scaffold/bindings/SCF-B-0011.json) | active／不明 | 8（8/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0012](../../../scaffold/bindings/SCF-B-0012.json) | active／不明 | 13（8/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0013](../../../scaffold/bindings/SCF-B-0013.json) | active／不明 | 13（9/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0014](../../../scaffold/bindings/SCF-B-0014.json) | active／不明 | 16（15/1/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0015](../../../scaffold/bindings/SCF-B-0015.json) | active／不明 | 13（8/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0016](../../../scaffold/bindings/SCF-B-0016.json) | active／不明 | 21（20/1/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0017](../../../scaffold/bindings/SCF-B-0017.json) | active／不明 | 13（9/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0018](../../../scaffold/bindings/SCF-B-0018.json) | active／不明 | 13（8/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0019](../../../scaffold/bindings/SCF-B-0019.json) | active／不明 | 13（8/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0020](../../../scaffold/bindings/SCF-B-0020.json) | active／継続 | 22（18/4/0） | [SCF-B-0101.json](../../../scaffold/bindings/SCF-B-0101.json) `/upstream/10/path` → `scaffold/research/phcap20-memory-research/inventory.json`；不明根：0115／0116／0119／0129／0130／0131／0132／0134／0146 |
| [SCF-B-0021](../../../scaffold/bindings/SCF-B-0021.json) | active／不明 | 16（12/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0022](../../../scaffold/bindings/SCF-B-0022.json) | active／不明 | 7（7/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0023](../../../scaffold/bindings/SCF-B-0023.json) | registered／継続 | 6（5/1/0） | [SCF-B-0034.json](../../../scaffold/bindings/SCF-B-0034.json) `/upstream/8/path` → `scaffold/research/pre-isolation-outside-holding-67/report.json`；現行根：0040 |
| [SCF-B-0024](../../../scaffold/bindings/SCF-B-0024.json) | active／不明 | 16（12/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0025](../../../scaffold/bindings/SCF-B-0025.json) | active／不明 | 21（17/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0027](../../../scaffold/bindings/SCF-B-0027.json) | registered／継続 | 9（8/1/0） | [SCF-B-0040.json](../../../scaffold/bindings/SCF-B-0040.json) `/upstream/24/path` → `scaffold/research/rdp001-unassessed-atom-audit/validate.py`；現行根：0040 |
| [SCF-B-0028](../../../scaffold/bindings/SCF-B-0028.json) | active／不明 | 13（9/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0029](../../../scaffold/bindings/SCF-B-0029.json) | registered／継続 | 8（7/1/0） | [SCF-B-0032.json](../../../scaffold/bindings/SCF-B-0032.json) `/upstream/0/path` → `scaffold/research/rdp001-delegated-doc003-unprocessed8/report.json`；現行根：0040 |
| [SCF-B-0030](../../../scaffold/bindings/SCF-B-0030.json) | active／不明 | 25（21/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0031](../../../scaffold/bindings/SCF-B-0031.json) | active／不明 | 19（15/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0032](../../../scaffold/bindings/SCF-B-0032.json) | registered／不明 | 6（5/1/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0033](../../../scaffold/bindings/SCF-B-0033.json) | registered／不明 | 11（10/1/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0034](../../../scaffold/bindings/SCF-B-0034.json) | registered／継続 | 14（11/3/0） | [SCF-B-0040.json](../../../scaffold/bindings/SCF-B-0040.json) `/upstream/20/path` → `scaffold/research/phcap02-03-registration-classification-audit/generate.py`；現行根：0040 |
| [SCF-B-0035](../../../scaffold/bindings/SCF-B-0035.json) | registered／継続 | 20（17/3/0） | [SCF-B-0036.json](../../../scaffold/bindings/SCF-B-0036.json) `/upstream/5/path` → `scaffold/research/pre-isolation-outside-holding-first15/inventory.json`；現行根：0040 |
| [SCF-B-0036](../../../scaffold/bindings/SCF-B-0036.json) | registered／不明 | 16（10/6/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0037](../../../scaffold/bindings/SCF-B-0037.json) | registered／継続 | 17（13/4/0） | [SCF-B-0054.json](../../../scaffold/bindings/SCF-B-0054.json) `/upstream/16/path` → `scaffold/research/phcap15-deploy-research/README.md`；不明根：0054 |
| [SCF-B-0038](../../../scaffold/bindings/SCF-B-0038.json) | registered／継続 | 16（8/8/0） | [SCF-B-0040.json](../../../scaffold/bindings/SCF-B-0040.json) `/upstream/16/path` → `scaffold/research/pre-isolation-outside-holding-67-proposal/inventory.json`；現行根：0040 |
| [SCF-B-0039](../../../scaffold/bindings/SCF-B-0039.json) | registered／不明 | 17（13/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0040](../../../scaffold/bindings/SCF-B-0040.json) | registered／継続 | 36（12/24/0） | [management-provisional-requirement-registration.md:86](../management-provisional-requirement-registration.md#L86) `docs/governance/tools/verify_management_register_append.py`の実行指示；現行根：0040 |
| [SCF-B-0041](../../../scaffold/bindings/SCF-B-0041.json) | registered／不明 | 25（20/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0042](../../../scaffold/bindings/SCF-B-0042.json) | registered／不明 | 18（13/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0043](../../../scaffold/bindings/SCF-B-0043.json) | registered／不明 | 10（4/6/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0044](../../../scaffold/bindings/SCF-B-0044.json) | registered／不明 | 9（2/7/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0045](../../../scaffold/bindings/SCF-B-0045.json) | registered／不明 | 12（4/8/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0046](../../../scaffold/bindings/SCF-B-0046.json) | registered／不明 | 23（17/5/1） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0047](../../../scaffold/bindings/SCF-B-0047.json) | registered／不明 | 15（11/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0048](../../../scaffold/bindings/SCF-B-0048.json) | registered／不明 | 20（13/6/1） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0049](../../../scaffold/bindings/SCF-B-0049.json) | registered／不明 | 19（13/6/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0050](../../../scaffold/bindings/SCF-B-0050.json) | registered／不明 | 19（13/6/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0051](../../../scaffold/bindings/SCF-B-0051.json) | active／不明 | 11（7/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0052](../../../scaffold/bindings/SCF-B-0052.json) | registered／不明 | 14（13/1/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0053](../../../scaffold/bindings/SCF-B-0053.json) | registered／不明 | 11（7/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0054](../../../scaffold/bindings/SCF-B-0054.json) | registered／不明 | 22（16/5/1） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0055](../../../scaffold/bindings/SCF-B-0055.json) | registered／不明 | 13（9/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0056](../../../scaffold/bindings/SCF-B-0056.json) | registered／不明 | 14（13/1/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0057](../../../scaffold/bindings/SCF-B-0057.json) | registered／継続 | 16（8/8/0） | [SCF-B-0096.json](../../../scaffold/bindings/SCF-B-0096.json) `/upstream/11/path` → `scaffold/research/rdp001-outside67-web-webos-l2-gap-057/selected-source-items.jsonl`；不明根：0096／0099 |
| [SCF-B-0058](../../../scaffold/bindings/SCF-B-0058.json) | registered／不明 | 14（13/1/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0059](../../../scaffold/bindings/SCF-B-0059.json) | registered／不明 | 14（10/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0060](../../../scaffold/bindings/SCF-B-0060.json) | registered／不明 | 13（9/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0061](../../../scaffold/bindings/SCF-B-0061.json) | registered／継続 | 23（15/8/0） | [SCF-B-0064.json](../../../scaffold/bindings/SCF-B-0064.json) `/upstream/7/path` → `scaffold/research/legacy-semantic-review-wave37/legacy-requirement-direct-semantic-review-wave37.jsonl`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0062](../../../scaffold/bindings/SCF-B-0062.json) | registered／不明 | 23（12/11/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0063](../../../scaffold/bindings/SCF-B-0063.json) | registered／不明 | 14（10/4/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0064](../../../scaffold/bindings/SCF-B-0064.json) | registered／継続 | 23（13/10/0） | [SCF-B-0101.json](../../../scaffold/bindings/SCF-B-0101.json) `/upstream/52/path` → `scaffold/research/legacy-semantic-review-wave38/legacy-requirement-direct-semantic-review-wave38.jsonl`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0065](../../../scaffold/bindings/SCF-B-0065.json) | registered／継続 | 14（10/4/0） | [SCF-B-0067.json](../../../scaffold/bindings/SCF-B-0067.json) `/upstream/14/path` → `scaffold/bindings/SCF-B-0065.json`；不明根：0067 |
| [SCF-B-0066](../../../scaffold/bindings/SCF-B-0066.json) | registered／不明 | 38（17/21/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0067](../../../scaffold/bindings/SCF-B-0067.json) | registered／不明 | 15（10/4/1） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0068](../../../scaffold/bindings/SCF-B-0068.json) | registered／継続 | 22（14/8/0） | [SCF-B-0101.json](../../../scaffold/bindings/SCF-B-0101.json) `/upstream/53/path` → `scaffold/research/legacy-semantic-review-wave39/legacy-requirement-direct-semantic-review-wave39.jsonl`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0069](../../../scaffold/bindings/SCF-B-0069.json) | registered／不明 | 25（25/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0070](../../../scaffold/bindings/SCF-B-0070.json) | registered／継続 | 22（14/8/0） | [SCF-B-0101.json](../../../scaffold/bindings/SCF-B-0101.json) `/upstream/54/path` → `scaffold/research/legacy-semantic-review-wave40/legacy-requirement-direct-semantic-review-wave40.jsonl`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0071](../../../scaffold/bindings/SCF-B-0071.json) | registered／不明 | 21（21/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0072](../../../scaffold/bindings/SCF-B-0072.json) | registered／継続 | 23（15/8/0） | [SCF-B-0101.json](../../../scaffold/bindings/SCF-B-0101.json) `/upstream/55/path` → `scaffold/research/legacy-semantic-review-wave41/legacy-requirement-direct-semantic-review-wave41.jsonl`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0073](../../../scaffold/bindings/SCF-B-0073.json) | registered／継続 | 18（18/0/0） | [SCF-B-0095.json](../../../scaffold/bindings/SCF-B-0095.json) `/upstream/17/path` → `scaffold/research/rdp001-outside67-boundary-followup-073/product-units.jsonl`；不明根：0095／0096 |
| [SCF-B-0074](../../../scaffold/bindings/SCF-B-0074.json) | registered／継続 | 17（17/0/0） | [SCF-B-0095.json](../../../scaffold/bindings/SCF-B-0095.json) `/upstream/24/path` → `scaffold/research/rdp001-outside67-boundary-followup-074/product-units.jsonl`；不明根：0095 |
| [SCF-B-0075](../../../scaffold/bindings/SCF-B-0075.json) | registered／継続 | 23（15/8/0） | [SCF-B-0101.json](../../../scaffold/bindings/SCF-B-0101.json) `/upstream/56/path` → `scaffold/research/legacy-semantic-review-wave42/legacy-requirement-direct-semantic-review-wave42.jsonl`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0076](../../../scaffold/bindings/SCF-B-0076.json) | registered／継続 | 17（17/0/0） | [SCF-B-0095.json](../../../scaffold/bindings/SCF-B-0095.json) `/upstream/31/path` → `scaffold/research/rdp001-outside67-product-entry-followup-076/product-units.jsonl`；不明根：0095／0096 |
| [SCF-B-0077](../../../scaffold/bindings/SCF-B-0077.json) | registered／継続 | 23（15/8/0） | [SCF-B-0101.json](../../../scaffold/bindings/SCF-B-0101.json) `/upstream/57/path` → `scaffold/research/legacy-semantic-review-wave43/legacy-requirement-direct-semantic-review-wave43.jsonl`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0078](../../../scaffold/bindings/SCF-B-0078.json) | registered／継続 | 23（15/8/0） | [SCF-B-0082.json](../../../scaffold/bindings/SCF-B-0082.json) `/upstream/15/path` → `scaffold/research/legacy-semantic-review-wave44/README.md`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0079](../../../scaffold/bindings/SCF-B-0079.json) | registered／不明 | 18（18/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0080](../../../scaffold/bindings/SCF-B-0080.json) | registered／継続 | 12（8/4/0） | [SCF-B-0081.json](../../../scaffold/bindings/SCF-B-0081.json) `/upstream/1/path` → `scaffold/research/rdp001-web-webos-vision-source-0080/inventory.json`；不明根：0091／0124 |
| [SCF-B-0081](../../../scaffold/bindings/SCF-B-0081.json) | registered／継続 | 11（7/3/1） | [SCF-B-0084.json](../../../scaffold/bindings/SCF-B-0084.json) `/upstream/1/path` → `scaffold/research/rdp001-web-webos-vision-semantic-atoms-0081/inventory.json`；不明根：0091／0124 |
| [SCF-B-0082](../../../scaffold/bindings/SCF-B-0082.json) | registered／継続 | 31（15/16/0） | [SCF-B-0086.json](../../../scaffold/bindings/SCF-B-0086.json) `/upstream/23/path` → `scaffold/research/legacy-semantic-review-wave45/README.md`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0083](../../../scaffold/bindings/SCF-B-0083.json) | registered／不明 | 23（23/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0084](../../../scaffold/bindings/SCF-B-0084.json) | registered／継続 | 6（2/3/1） | [SCF-B-0088.json](../../../scaffold/bindings/SCF-B-0088.json) `/upstream/1/path` → `scaffold/research/rdp001-web-webos-vision-semantic-atoms-0084/inventory.json`；不明根：0091／0124 |
| [SCF-B-0085](../../../scaffold/bindings/SCF-B-0085.json) | registered／不明 | 18（18/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0086](../../../scaffold/bindings/SCF-B-0086.json) | registered／継続 | 31（15/16/0） | [SCF-B-0089.json](../../../scaffold/bindings/SCF-B-0089.json) `/upstream/8/path` → `scaffold/research/legacy-semantic-review-wave46/legacy-requirement-direct-semantic-review-wave46.meta.json`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0087](../../../scaffold/bindings/SCF-B-0087.json) | registered／不明 | 15（15/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0088](../../../scaffold/bindings/SCF-B-0088.json) | registered／継続 | 12（5/6/1） | [SCF-B-0091.json](../../../scaffold/bindings/SCF-B-0091.json) `/upstream/20/path` → `scaffold/research/rdp001-web-webos-vision-semantic-atoms-0088/inventory.json`；不明根：0091／0124 |
| [SCF-B-0089](../../../scaffold/bindings/SCF-B-0089.json) | registered／継続 | 17（8/9/0） | [SCF-B-0093.json](../../../scaffold/bindings/SCF-B-0093.json) `/upstream/8/path` → `scaffold/research/legacy-semantic-review-wave47/legacy-requirement-direct-semantic-review-wave47.meta.json`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0090](../../../scaffold/bindings/SCF-B-0090.json) | registered／不明 | 15（15/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0091](../../../scaffold/bindings/SCF-B-0091.json) | registered／不明 | 30（10/16/4） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0092](../../../scaffold/bindings/SCF-B-0092.json) | registered／不明 | 15（15/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0093](../../../scaffold/bindings/SCF-B-0093.json) | registered／継続 | 17（8/9/0） | [SCF-B-0094.json](../../../scaffold/bindings/SCF-B-0094.json) `/upstream/10/path` → `scaffold/research/legacy-semantic-review-wave48/plan.json`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0094](../../../scaffold/bindings/SCF-B-0094.json) | registered／継続 | 24（8/16/0） | [SCF-B-0097.json](../../../scaffold/bindings/SCF-B-0097.json) `/upstream/10/path` → `scaffold/research/legacy-semantic-review-wave49/selfcheck.py`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0095](../../../scaffold/bindings/SCF-B-0095.json) | registered／不明 | 36（17/19/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0096](../../../scaffold/bindings/SCF-B-0096.json) | registered／不明 | 19（10/9/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0097](../../../scaffold/bindings/SCF-B-0097.json) | registered／継続 | 21（5/16/0） | [SCF-B-0101.json](../../../scaffold/bindings/SCF-B-0101.json) `/upstream/64/path` → `scaffold/research/legacy-semantic-review-wave50/legacy-requirement-direct-semantic-review-wave50.jsonl`；不明根：0115／0116／0118／0119／0122／0125／0129／0130／0131／0132／0134／0144／0146／0149／0150 |
| [SCF-B-0099](../../../scaffold/bindings/SCF-B-0099.json) | registered／不明 | 17（10/7/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0100](../../../scaffold/bindings/SCF-B-0100.json) | registered／不明 | 16（16/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0101](../../../scaffold/bindings/SCF-B-0101.json) | registered／継続 | 65（49/16/0） | [SCF-B-0105.json](../../../scaffold/bindings/SCF-B-0105.json) `/upstream/19/path` → `scaffold/research/legacy-phase-gap-review-0101/inventory.json`；不明根：0116／0119／0130／0131／0134 |
| [SCF-B-0102](../../../scaffold/bindings/SCF-B-0102.json) | registered／継続 | 63（47/16/0） | [SCF-B-0146.json](../../../scaffold/bindings/SCF-B-0146.json) `/upstream/3/path` → `scaffold/research/br-implementation-evidence-0102/evidence.jsonl`；不明根：0146 |
| [SCF-B-0103](../../../scaffold/bindings/SCF-B-0103.json) | registered／不明 | 32（32/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0104](../../../scaffold/bindings/SCF-B-0104.json) | registered／継続 | 59（45/14/0） | [SCF-B-0146.json](../../../scaffold/bindings/SCF-B-0146.json) `/upstream/4/path` → `scaffold/research/br-implementation-evidence-0104/evidence.jsonl`；不明根：0146 |
| [SCF-B-0105](../../../scaffold/bindings/SCF-B-0105.json) | registered／継続 | 72（53/19/0） | [SCF-B-0134.json](../../../scaffold/bindings/SCF-B-0134.json) `/upstream/64/path` → `scaffold/research/phase-status-taxonomy-0105/units.jsonl`；不明根：0134 |
| [SCF-B-0106](../../../scaffold/bindings/SCF-B-0106.json) | registered／継続 | 59（45/14/0） | [SCF-B-0146.json](../../../scaffold/bindings/SCF-B-0146.json) `/upstream/5/path` → `scaffold/research/br-implementation-evidence-0106/evidence.jsonl`；不明根：0146 |
| [SCF-B-0107](../../../scaffold/bindings/SCF-B-0107.json) | registered／継続 | 66（52/14/0） | [SCF-B-0126.json](../../../scaffold/bindings/SCF-B-0126.json) `/upstream/63/path` → `scaffold/research/legacy-asset-product-classification-0107/classification-research.jsonl`；不明根：0144／0149／0150 |
| [SCF-B-0108](../../../scaffold/bindings/SCF-B-0108.json) | registered／継続 | 66（52/14/0） | [SCF-B-0126.json](../../../scaffold/bindings/SCF-B-0126.json) `/upstream/65/path` → `scaffold/research/legacy-lint-product-classification-0108/classification-research.jsonl`；不明根：0144／0149／0150 |
| [SCF-B-0109](../../../scaffold/bindings/SCF-B-0109.json) | registered／継続 | 66（50/16/0） | [SCF-B-0129.json](../../../scaffold/bindings/SCF-B-0129.json) `/upstream/6/path` → `scaffold/research/fr-implementation-evidence-0109/evidence.jsonl`；不明根：0129／0132／0146 |
| [SCF-B-0110](../../../scaffold/bindings/SCF-B-0110.json) | registered／継続 | 66（50/16/0） | [SCF-B-0146.json](../../../scaffold/bindings/SCF-B-0146.json) `/upstream/1/path` → `scaffold/research/fr-implementation-evidence-0110/evidence.jsonl`；不明根：0146 |
| [SCF-B-0111](../../../scaffold/bindings/SCF-B-0111.json) | registered／継続 | 68（52/16/0） | [SCF-B-0146.json](../../../scaffold/bindings/SCF-B-0146.json) `/upstream/2/path` → `scaffold/research/fr-implementation-evidence-0111/evidence.jsonl`；不明根：0146 |
| [SCF-B-0112](../../../scaffold/bindings/SCF-B-0112.json) | registered／継続 | 66（50/16/0） | [SCF-B-0146.json](../../../scaffold/bindings/SCF-B-0146.json) `/upstream/8/path` → `scaffold/research/tr-implementation-evidence-0112/evidence.jsonl`；不明根：0146 |
| [SCF-B-0113](../../../scaffold/bindings/SCF-B-0113.json) | registered／継続 | 66（50/16/0） | [SCF-B-0146.json](../../../scaffold/bindings/SCF-B-0146.json) `/upstream/6/path` → `scaffold/research/nfr-implementation-evidence-0113/evidence.jsonl`；不明根：0146 |
| [SCF-B-0114](../../../scaffold/bindings/SCF-B-0114.json) | registered／継続 | 66（50/16/0） | [SCF-B-0146.json](../../../scaffold/bindings/SCF-B-0146.json) `/upstream/7/path` → `scaffold/research/nfr-implementation-evidence-0114/evidence.jsonl`；不明根：0146 |
| [SCF-B-0115](../../../scaffold/bindings/SCF-B-0115.json) | registered／不明 | 66（50/16/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0116](../../../scaffold/bindings/SCF-B-0116.json) | registered／不明 | 74（54/20/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0117](../../../scaffold/bindings/SCF-B-0117.json) | registered／継続 | 4（4/0/0） | [SCF-B-0126.json](../../../scaffold/bindings/SCF-B-0126.json) `/upstream/66/path` → `scaffold/research/legacy-runtime-product-classification-0117/classification-research.jsonl`；不明根：0144／0149／0150 |
| [SCF-B-0118](../../../scaffold/bindings/SCF-B-0118.json) | registered／不明 | 66（52/14/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0119](../../../scaffold/bindings/SCF-B-0119.json) | registered／不明 | 74（54/20/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0120](../../../scaffold/bindings/SCF-B-0120.json) | registered／継続 | 66（52/14/0） | [SCF-B-0126.json](../../../scaffold/bindings/SCF-B-0126.json) `/upstream/68/path` → `scaffold/research/legacy-schema-product-classification-0120/classification-research.jsonl`；不明根：0144／0149／0150 |
| [SCF-B-0121](../../../scaffold/bindings/SCF-B-0121.json) | registered／不明 | 12（12/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0122](../../../scaffold/bindings/SCF-B-0122.json) | registered／不明 | 97（83/14/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0123](../../../scaffold/bindings/SCF-B-0123.json) | registered／継続 | 66（52/14/0） | [SCF-B-0126.json](../../../scaffold/bindings/SCF-B-0126.json) `/upstream/69/path` → `scaffold/research/legacy-source-product-classification-0123/classification-research.jsonl`；不明根：0144／0149／0150 |
| [SCF-B-0124](../../../scaffold/bindings/SCF-B-0124.json) | registered／不明 | 21（10/7/4） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0125](../../../scaffold/bindings/SCF-B-0125.json) | registered／不明 | 68（54/14/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0126](../../../scaffold/bindings/SCF-B-0126.json) | registered／継続 | 71（49/22/0） | [SCF-B-0141.json](../../../scaffold/bindings/SCF-B-0141.json) `/upstream/73/path` → `scaffold/research/legacy-implementation-residual-0126/classification-research.jsonl`；不明根：0149／0150 |
| [SCF-B-0127](../../../scaffold/bindings/SCF-B-0127.json) | registered／継続 | 11（11/0/0） | [SCF-B-0126.json](../../../scaffold/bindings/SCF-B-0126.json) `/upstream/70/path` → `scaffold/research/legacy-state-db-product-classification-0127/classification-research.jsonl`；不明根：0144／0149／0150 |
| [SCF-B-0128](../../../scaffold/bindings/SCF-B-0128.json) | registered／継続 | 13（13/0/0） | [SCF-B-0126.json](../../../scaffold/bindings/SCF-B-0126.json) `/upstream/64/path` → `scaffold/research/legacy-lint-candidate-product-classification-0128/classification-research.jsonl`；不明根：0144／0149／0150 |
| [SCF-B-0129](../../../scaffold/bindings/SCF-B-0129.json) | registered／不明 | 65（48/17/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0130](../../../scaffold/bindings/SCF-B-0130.json) | registered／不明 | 74（54/20/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0131](../../../scaffold/bindings/SCF-B-0131.json) | registered／不明 | 74（54/20/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0132](../../../scaffold/bindings/SCF-B-0132.json) | registered／不明 | 65（48/17/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0133](../../../scaffold/bindings/SCF-B-0133.json) | registered／継続 | 14（14/0/0） | [SCF-B-0126.json](../../../scaffold/bindings/SCF-B-0126.json) `/upstream/67/path` → `scaffold/research/legacy-runtime-residual-product-classification-0133/classification-research.jsonl`；不明根：0144／0149／0150 |
| [SCF-B-0134](../../../scaffold/bindings/SCF-B-0134.json) | registered／不明 | 66（47/19/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0141](../../../scaffold/bindings/SCF-B-0141.json) | registered／継続 | 74（51/23/0） | [SCF-B-0142.json](../../../scaffold/bindings/SCF-B-0142.json) `/upstream/67/path` → `scaffold/research/legacy-config-product-classification-0141/classification-research.jsonl`；不明根：0149／0150 |
| [SCF-B-0142](../../../scaffold/bindings/SCF-B-0142.json) | registered／継続 | 76（50/26/0） | [SCF-B-0148.json](../../../scaffold/bindings/SCF-B-0148.json) `/upstream/15/path` → `scaffold/research/legacy-research-assets-product-classification-0142/classification-research.jsonl`；不明根：0149／0150 |
| [SCF-B-0144](../../../scaffold/bindings/SCF-B-0144.json) | registered／不明 | 19（11/8/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0145](../../../scaffold/bindings/SCF-B-0145.json) | registered／継続 | 165（54/111/0） | [SCF-B-0142.json](../../../scaffold/bindings/SCF-B-0142.json) `/upstream/65/path` → `scaffold/research/legacy-ai-instruction-product-classification-0145/classification-research.jsonl`；不明根：0149／0150 |
| [SCF-B-0146](../../../scaffold/bindings/SCF-B-0146.json) | registered／不明 | 22（8/14/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0147](../../../scaffold/bindings/SCF-B-0147.json) | registered／継続 | 19（18/1/0） | [SCF-B-0148.json](../../../scaffold/bindings/SCF-B-0148.json) `/upstream/14/path` → `scaffold/research/legacy-execution-ticket-product-classification-0147/classification-research.jsonl`；不明根：0149／0150 |
| [SCF-B-0148](../../../scaffold/bindings/SCF-B-0148.json) | registered／継続 | 23（13/10/0） | [SCF-B-0149.json](../../../scaffold/bindings/SCF-B-0149.json) `/upstream/13/path` → `scaffold/research/legacy-test-design-worker-workflow-0148/classification-research.jsonl`；不明根：0149／0150 |
| [SCF-B-0149](../../../scaffold/bindings/SCF-B-0149.json) | registered／不明 | 18（0/16/2） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0150](../../../scaffold/bindings/SCF-B-0150.json) | registered／不明 | 24（15/9/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0151](../../../scaffold/bindings/SCF-B-0151.json) | registered／不明 | 7（2/5/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0152](../../../scaffold/bindings/SCF-B-0152.json) | registered／継続 | 5（3/2/0） | [AGENTS.md:12](../../../AGENTS.md#L12) DT-SDOP必須読込；現行根：0152／0154 |
| [SCF-B-0153](../../../scaffold/bindings/SCF-B-0153.json) | registered／継続 | 5（2/3/0） | [AGENTS.md:12](../../../AGENTS.md#L12) DT-VT必須読込；現行根：0153／0154 |
| [SCF-B-0154](../../../scaffold/bindings/SCF-B-0154.json) | registered／継続 | 4（1/3/0） | [AGENTS.md:11](../../../AGENTS.md#L11) DT-MSG必須読込；現行根：0154 |
| [SCF-B-0155](../../../scaffold/bindings/SCF-B-0155.json) | registered／継続 | 5（3/2/0） | [SCF-B-0156.json](../../../scaffold/bindings/SCF-B-0156.json) `/upstream/1/path` → `scaffold/research/brain-domain-material-inventory-20261004/README.md`；不明根：0156 |
| [SCF-B-0156](../../../scaffold/bindings/SCF-B-0156.json) | registered／不明 | 4（1/3/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0157](../../../scaffold/bindings/SCF-B-0157.json) | registered／不明 | 6（4/2/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |
| [SCF-B-0158](../../../scaffold/bindings/SCF-B-0158.json) | registered／継続 | 3（2/1/0） | [docs/governance/github-upstream-operating-model.md:376](../../../docs/governance/github-upstream-operating-model.md#L376) 現行local worktree回収運用；現行根：0158 |
| [SCF-B-0160](../../../scaffold/bindings/SCF-B-0160.json) | registered／不明 | 3（3/0/0） | `/connections/consumers` 宣言のみ、現行外部利用未確認 |

## 留保と検証

SCF-B-0121は[9/25 Goal6監査](source-rebaseline/goal6-research-disposition-2026-09-25.md)でvalidator撤去候補とされたが、[現行README:25](../../../scaffold/research/rdp001-outside67-web-webos-l1-anchor-0121/README.md#L25)は10/10に、後続現行pinと旧研究入力を混同した不整合を訂正している（`71cd92e30`／`e59d60737`）。現在の役割は固定旧revisionとregister来歴の照合であり、Web／WEB-OSは既決のVision材料である。別Bindingのinbound pinは0件だが、訂正後の役割不要・正式移管・現行consumer閉包は未確認なので不明とした。12旧pinの消滅を確定見込みへ数えない。

SCF-B-0160の宣言consumerは#3545の限定coverage監査である。過去の監査の成立はhelperの正式移管や利用終了の証明ではなく、tracked literal参照0件から不要とは結論しない。

全150 IDと全4,066 pinの現在path・SHAを再照合した。欠落path 0、SHA不一致0。directory artifactをfile不存在と扱わず、宣言artifactは実在を照合した。表のconsumer pointerとpath:lineも照合した。

- `python3 -B scaffold/tools/scfctl.py validate`：150件、fail=0。
- `python3 -B scaffold/tools/scfctl.py stale`：stale=0。
- 全150件の`check-replacement ID`（`--record`なし）：150件とも正式artifact未指定・transferなしを検出、うち22件でrole未特定。これは移管未成立の検出であり、`validate`失敗や正式物不存在の証明ではない。
- 全150行のID一意性、state、分類、pin内訳・集計、相対参照、旧source digestを静的照合した。archive内のruntime／test／CI、研究validatorの実行はしていない。`retire`とBinding編集は行っていない。

merge後に#1866へ本記録リンクと150件をcommentし、旧148件のIssue本文は書き換えない。正式物・consumerを確かめる調査と候補ごとの撤去は、この監査とは別の作業である。
