# 新世代Feature Ticket GitHub Issue投影記録

status: projection_created
repository: `RetryYN/HELIX-HARNESS`
operation_date: 2026-09-15 JST
authority_effect: projection_only

## 目的

repo-owned Feature Ticketを作業共有用のGitHub Issueへ投影した外部操作を記録する。Issueの存在、本文、label、
open／close状態から要求、上流承認、実装許可、完了を生成しない。

## 許可と操作主体

| 項目 | 記録 |
|---|---|
| 実施runtime | Codex hosted chat runtimeからGitHub CLIを使用 |
| GitHub account | `RetryYN` |
| authorization actor | PO `RetryYN` |
| authorization basis | 本sessionでIssue作成前に示された「いまこれがチケット発行の役割をしていると思え。そしてイシューに登録される。」 |
| source authority | `docs/governance/feature-tickets/`の各Feature Ticket。GitHubはprojection |
| execution effect | Issue作成・本文更新・label更新のみ。要求採用、設計、実装、Worker、CI、mergeは未開始 |

## 投影結果

| local ticket | Issue | created_at UTC | initial source commit | read-after |
|---|---:|---|---|---|
| FT-OS-REQREG-001 | [#1798](https://github.com/RetryYN/HELIX-HARNESS/issues/1798) | 2026-09-15T16:52:06Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-HARNESS-REQENG-001 | [#1799](https://github.com/RetryYN/HELIX-HARNESS/issues/1799) | 2026-09-15T16:52:19Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-OS-REQCLASS-001 | [#1800](https://github.com/RetryYN/HELIX-HARNESS/issues/1800) | 2026-09-15T16:52:31Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-HARNESS-SEMEXTRACT-001 | [#1801](https://github.com/RetryYN/HELIX-HARNESS/issues/1801) | 2026-09-15T17:07:42Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-HARNESS-DESIGNTPL-001 | [#1802](https://github.com/RetryYN/HELIX-HARNESS/issues/1802) | 2026-09-15T17:07:54Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-OS-DESIGNTPL-001 | [#1803](https://github.com/RetryYN/HELIX-HARNESS/issues/1803) | 2026-09-15T17:08:05Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-HARNESS-TICKETCONTRACT-001 | [#1804](https://github.com/RetryYN/HELIX-HARNESS/issues/1804) | 2026-09-15T17:08:18Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |
| FT-OS-TICKETISSUER-001 | [#1805](https://github.com/RetryYN/HELIX-HARNESS/issues/1805) | 2026-09-15T17:08:30Z | `0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0` | OPEN |

8件すべてに`state:proposed-upstream-waiting`を付けた。初回作成時の旧`state:backlog`は削除し、新labelを作成して
2026-09-15T17:12:00Z〜17:12:12Zにread-afterした。本文はlocal ticket ID、親要求、状態、依存、projection-only、
停止条件、source commit markerを持つ。GitHub Project itemは作成していない。

## 可逆性と残る作用

Issueは`closed / not_planned`へ変更でき、labelも削除できる。ただしIssue番号、timeline、更新履歴、通知は消去できない。
rollbackは新しい人間指示なしに行わない。local ticketの上流revisionが変わった場合は、Issueから意味を戻さず、local側を
先に改訂してから投影本文とsource commitを更新する。

## 日本語表示と責務訂正の同期

local ticketをcommit `741eddb855d9b24ac6645c4485e7d24b8123c95f`で更新した後、8件のIssueを再投影した。
人間が読むtitle、見出し、目的、境界、依存・順序を日本語へ統一し、機械識別子だけ原語を維持した。
#1799／#1801ではOS登録をHARNESS製品の実依存から外し、#1798先行をHELIX内部のdelivery sequenceとして表示した。
#1804／#1805は、HARNESSがnormative workflow vocabulary、意味、trigger、適用条件、route内順序、joinを所有し、
HELIX-OS推進機構がoperational tag、versioned mapping、composition、workflow instance生成規則を所有する境界へ
2026-09-15に再投影した。両IssueはOPEN、marker、local source path、source commit、責務文言をread-after済みである。
read-afterの`updatedAt`はUTCで次のとおり。

| Issue | updatedAt UTC |
|---:|---|
| #1798 | 2026-09-14T17:24:07Z |
| #1799 | 2026-09-14T17:24:08Z |
| #1800 | 2026-09-14T17:24:10Z |
| #1801 | 2026-09-14T17:24:52Z |
| #1802 | 2026-09-14T17:24:53Z |
| #1803 | 2026-09-14T17:24:55Z |
| #1804 | 2026-09-14T23:58:49Z |
| #1805 | 2026-09-14T23:58:50Z |

## 2026-09-16 source revision再同期と同期adapter追加

#1798〜#1805はGitHub本文ではなく各local Feature Ticketを先に読み、最新file revisionとSHA-256をIssueへ再投影した。
#1798は#1797後の最初の`requirement` PRとし、`no_loss`、未計上0、同一候補digestの管理層仮登録、人間decisionを
merge条件として追記した。#1799〜#1805を含む8件は、再投影後にIssue本文からsource commit／SHA-256をread-afterし、
local fileと8/8一致した。

| Issue | local source commit | local file SHA-256 | read-after updatedAt UTC |
|---:|---|---|---|
| #1798 | `577cba8f6f8db80a02e02841cff5f33ddb4ba03f` | `6fdc4d5bd657e4555f26260956846199ff4cb3579273c992b2a9a7046449ed70` | 2026-09-15T14:41:38Z |
| #1799 | `5c5d3e8450f33f2c194e8c17af366a781b86f2c9` | `d0479e1c6ce04ab44f4a13e009ac01a94b6d5244dc453c27ec4635ff83a63e11` | 2026-09-15T14:46:40Z |
| #1800 | `5c5d3e8450f33f2c194e8c17af366a781b86f2c9` | `62bd2e0234c9f49192c9f750aabbb9dbf46856fa653e91a8f6a724c1b9fc6b9d` | 2026-09-15T14:46:41Z |
| #1801 | `5c5d3e8450f33f2c194e8c17af366a781b86f2c9` | `952831f6fdb200593ecf51360b8186307bfe205db634c7afbc184d456e9283f3` | 2026-09-15T14:46:43Z |
| #1802 | `5c5d3e8450f33f2c194e8c17af366a781b86f2c9` | `294634919a93c8b17dfc45faf888b6d0721a7347c65216582ca5c3da2f3b7a88` | 2026-09-15T14:46:44Z |
| #1803 | `5c5d3e8450f33f2c194e8c17af366a781b86f2c9` | `f409f37874711e097563fb5eb1d3b8b359d2bf357c3bbdebbbbc069a82eadbcc` | 2026-09-15T14:46:45Z |
| #1804 | `c4b6b17fca8f2c7e7305fa286fc341b6209b40d7` | `282f6da544c2d7c5734ac8fde55dfe4e9b6ec625c8a274da79ceff3bc1dc99f9` | 2026-09-15T14:46:47Z |
| #1805 | `c4b6b17fca8f2c7e7305fa286fc341b6209b40d7` | `8fa9e356d1e82a9a8492b36cfc53f0e8a9ed74d934ef7ab93f54f66b69f3794f` | 2026-09-15T14:46:49Z |

GitHub一方向projection・read-after同期adapterをlocal ticket `FT-OS-GITHUBSYNC-001`として追加し、
[#1812](https://github.com/RetryYN/HELIX-HARNESS/issues/1812)へ投影した。GitHub metadataを除いた
projection payload digestを意味束縛に使い、source commit、remote ID、read-after時点は別証拠として保持する。
Issue本文のsource commit `04c89868c48a7ce3af3d10914bd13c811731243c`、file SHA-256
`c81612ef9121858c2364196ce43caedf94031992de701e94f6e7e5d3c2e03b9e`、payload digest
`sha256:f3c763ef97236223e8c24c648fc086284570bd25e19239317c87c1625520d161`、OPENを
2026-09-15T15:02:35Zにread-afterした。Issue作成と同期は要求採用、実装開始、CI起動を生成しない。

### #1812依存relationの追補

`FT-OS-REQREG-001`と`FT-OS-TICKETISSUER-001`に`FT-OS-GITHUBSYNC-001`への後続relationを追加したため、
#1798と#1805をlocal source commit `4895b3da5308d70be3648efac8c63ae2402e5e88`から再投影した。
#1798はfile SHA-256 `f1e26a22f7aa06ace98c3fd86c45f65ecbab5629ecaf61ad2cebaca7564ee5a0`と
updatedAt `2026-09-15T15:07:03Z`、#1805はfile SHA-256
`87a15658d6b26905c3d28fc447f2a3792e5b6782fd790f4e9f2fe58846197a16`と
updatedAt `2026-09-15T15:07:05Z`をread-afterした。両Issueに#1812を後続として表示し、要求authorityや実装状態は変更していない。

### L11 acceptance接続の追補

`FT-OS-TICKETISSUER-001`と`FT-OS-GITHUBSYNC-001`へHELIX-OS L11 acceptance sourceを追加し、#1805と#1812を
local source commit `1779579f2428c973656e997a539df13b2c3e2a2f`から再投影した。#1805はfile SHA-256
`a3cb3665d712a16f614919e5273025d7aa141a461925740c74fc25495c797d18`、updatedAt
`2026-09-15T15:10:19Z`、#1812はfile SHA-256
`d43172ded165d01bd488db835797fbe491e73df3ba8b38b027c2547db3bc723b`、updatedAt
`2026-09-15T15:10:20Z`で一致した。semantic payloadは不変で、要求採用や受入実施を生成しない。

### 自己参照解消・remote evidence echo抑止の再同期

Feature Ticket本文に過去の`projected_source_commit`を埋め込む方式は、ticket更新時に内包値がstaleになるため廃止した。
9 ticketはappend-onlyの本projection receiptへの参照だけを持つ。exact source commit、file SHA-256、remote revision、
read-afterをticket本文の外で記録し、同じticketを再commitしてSHAを埋め直す自己参照を避ける。

`FT-OS-REQREG-001`へ`remote_evidence`入力とoriginating commandを追加し、`FT-OS-GITHUBSYNC-001`へ自己投影の
webhook／read-afterをreceiptまたはduplicateへ束縛して再送しない条件を追加した。外部変更もlocalで新revisionとして
採否されるまで送信commandを生成しない。9 Issueをsource commit
`d7fb664c7d3c7cf152ccaa636ea63af550fa7dc0`から再投影し、次をread-afterした。

| Issue | local file SHA-256 | remote body SHA-256 | updatedAt UTC |
|---:|---|---|---|
| #1798 | `4f6741b75629405011880e960dd32f47b6b53282519448ef3b4653cf7fdbbe89` | `2cb4e1554872c78fde2d879fc08d79b401e9c824765cbeac145ebc6a9aa0c3e4` | `2026-09-15T15:34:55Z` |
| #1799 | `b4f349299b1bbb33fcc1f750a88084267d158bd6dd3acb5da1c9952f8500168e` | `a35d376cfc4e641a544370b2f91f08db1a8081c19ade9927da3d4427c2b42aa5` | `2026-09-15T15:34:57Z` |
| #1800 | `ba24f0685d19c4126519209b8e646d31f794092862fbf642f9626eb1692d4b02` | `c7717f06db31c274e5e7d2a2435551671100c9df26cb969b6515d9155abc27ff` | `2026-09-15T15:34:58Z` |
| #1801 | `fdf540550a16ae6666139e98d4172086782aa0df32fdb702b5cf96c7b07203cf` | `c0b6726dd674cff29a2f27b127cda14acfcaf66fc583d197d4ca178b865ee485` | `2026-09-15T15:35:00Z` |
| #1802 | `3c88549a3bc89f5a9ad4e53b5b3a5de3df9b5d7a87a10ccbd913cd111326a3a2` | `02b95d331b5fa530ba89dac5277e0e973e11bd4058a540726b200945519bcbdd` | `2026-09-15T15:35:02Z` |
| #1803 | `81decccec568e65ca2bca79fc351084aa3869107419f05530e2a6f99b78c3ecc` | `f2b5d3447795c272355adfeafc0029ec6446051cea758c4b7172f92e498dec74` | `2026-09-15T15:35:05Z` |
| #1804 | `875579274d8468b4928d502cf16c7af7cab4993fc1d08a8cb8f2c3fe35ba6f10` | `7ac5a0cb9a2f0a81675f94cd963398db7da8b5ff2a6fd1c92413bf09e3489c99` | `2026-09-15T15:35:06Z` |
| #1805 | `fd5ea6d347752134f538cfc0344917e44d8032f8445bb0fe657ec1ce48aa15da` | `2808096a24396d7b1597c4d19fde57a97379f8c7683ea5f8d56c55ccdb086907` | `2026-09-15T15:35:08Z` |
| #1812 | `bc63b0aa00762f1f7d230dcff0b5810e8a7a5aedbf2b7b0c61356ac4498b324a` | `c1a0b5053f7ca40eb75b241ceffe83943885c09347ce2854196636e5ff1f7a28` | `2026-09-15T15:35:10Z` |

9件はいずれもOPEN、`state:proposed-upstream-waiting`、Issue本文のsource commit／file SHA-256がlocal sourceと一致した。
remote evidenceの受付やecho抑止を要求採用、実装開始、同期runtime稼働の証拠にしない。

## #1798 remote専用指示の除去と投影訂正

receipt_id: `FTPROJ-1798-20260916-001`
correction_of: `2026-09-16 source revision再同期と同期adapter追加`の#1798意味投影

以前のIssue #1798にはlocal Feature Ticketにない「最初のrequirement PR」「local Feature Ticketを起点にbranch／PRを作る」
「Refs #1798」の指示があり、local sourceからの転記限定規則に違反していた。これらを削除し、requirement PRの入口を
親Concept／L1 revision、source、対象product、要求kindとbootstrap registerへ戻した。Issue本文は要約であること、
local本文の完全な参照行区間、要約にない条項を対象外にしないことを明示した。

| 項目 | read-after値 |
|---|---|
| local source commit | `cb31f86e8b23bb2215a04503df0b3417d395a4a3` |
| local file SHA-256 | `4f6741b75629405011880e960dd32f47b6b53282519448ef3b4653cf7fdbbe89` |
| remote revision | `updatedAt:2026-09-15T16:19:47Z+body_sha256:600345a2c131c9f7e35ef1be62d259ae775330b6f505c449634cafdba3fec364` |
| state／label | `OPEN`／`state:proposed-upstream-waiting` |
| authority effect | `none` |

`remote body SHA-256`はGitHub APIが返すIssue本文文字列を、末尾改行を追加せずUTF-8 bytesへ変換して計算する。
訂正後本文には上記三つのremote専用指示が0件であり、remote evidenceのsource system、delivery identity、
remote revision、originating projection commandの四項目が表示されることをread-afterした。

## #1798参照行区間の訂正

receipt_id: `FTPROJ-1798-20260916-002`
correction_of: `FTPROJ-1798-20260916-001`

Issue本文の要約はlocal Source全本文を意味契約としていたが、表示した二つの参照行区間が節境界と一致していなかった。
入出力契約候補を`Source 59–91行`、要求PR merge admissionを
`management-provisional-requirement-registration.md 52–64行`へ訂正した。意味本文、要求、relation、状態は変更していない。

| 項目 | read-after値 |
|---|---|
| local source commit | `cb31f86e8b23bb2215a04503df0b3417d395a4a3` |
| local file SHA-256 | `4f6741b75629405011880e960dd32f47b6b53282519448ef3b4653cf7fdbbe89` |
| previous remote revision | `updatedAt:2026-09-15T16:20:07Z+body_sha256:600345a2c131c9f7e35ef1be62d259ae775330b6f505c449634cafdba3fec364` |
| corrected remote revision | `updatedAt:2026-09-15T17:45:28Z+body_sha256:59d98860b1102e34bacf4a1eb361b32f8897b9b98a60e41e1dbc8e8b75ee44cb` |
| state／label | `OPEN`／`state:proposed-upstream-waiting` |
| authority effect | `none` |

この訂正はGitHub本文を正本にせず、Issueの表示をlocal sourceの正確なnavigationへ合わせたprojection補正である。

## #1798のrevision別要求保持条件への再同期

receipt_id: `FTPROJ-1798-20260916-003`
correction_of: `FTPROJ-1798-20260916-002`

要求PR merge admissionへ、333 pathに含まれるsourceは監査基準revisionと隔離直前revisionを両方atom入力へ含め、
同値としてまとめる場合も両digestへ束縛した人間decisionを要求する条件を追加した。このlocal変更を含むcommitへ
Issue #1798のsource revisionを更新し、merge admissionの参照区間を`52–65行`へ再同期した。

| 項目 | read-after値 |
|---|---|
| local source commit | `a25be494d720ba67afeec76859b0b24a3d91e50c` |
| local Feature Ticket SHA-256 | `4f6741b75629405011880e960dd32f47b6b53282519448ef3b4653cf7fdbbe89` |
| previous remote revision | `updatedAt:2026-09-15T17:45:28Z+body_sha256:59d98860b1102e34bacf4a1eb361b32f8897b9b98a60e41e1dbc8e8b75ee44cb` |
| corrected remote revision | `updatedAt:2026-09-15T17:47:57Z+body_sha256:d6640ce7552d70dc23f9c9fbe234e96ad5408c6acc7e7c18a5bc3169eff903d5` |
| state／label | `OPEN`／`state:proposed-upstream-waiting` |
| authority effect | `none` |

Feature Ticket本文の意味digestは変わっていない。同期対象commitとnavigationを更新しただけであり、要求採用、
baselineと隔離直前revisionの同値判断、実装開始を生成しない。

## #1798のrevision差分admission補強への再同期

receipt_id: `FTPROJ-1798-20260916-004`
correction_of: `FTPROJ-1798-20260916-003`

要求PRのmerge admission条件6・7を、入力atomの原`source_path`だけでなく、保持copy pathとsource file SHA-256からも
333件のrevision差分へ照合するよう補強した。保持copy pathだけを入力して基準revisionを落とせる抜け道を閉じたため、
Issue #1798が参照するlocal source commitを、補強後のexact revisionへ再同期した。参照区間`52–65行`は補強後も節境界と
一致する。

| 項目 | read-after値 |
|---|---|
| local source commit | `b5514ad1f95226f871698288bdfa77f845637064` |
| local Feature Ticket SHA-256 | `4f6741b75629405011880e960dd32f47b6b53282519448ef3b4653cf7fdbbe89` |
| previous remote revision | `updatedAt:2026-09-15T17:47:57Z+body_sha256:d6640ce7552d70dc23f9c9fbe234e96ad5408c6acc7e7c18a5bc3169eff903d5` |
| corrected remote revision | `updatedAt:2026-09-15T18:41:45Z+body_sha256:773e110deced3c29a3fd594116e37646e69157f63e6dc826fd52377d7e81f029` |
| state／label | `OPEN`／`state:proposed-upstream-waiting` |
| authority effect | `none` |

Feature Ticket本文のbytesと意味は変えていない。GitHub本文を正本へ昇格せず、local contractの新revisionを指すprojectionへ
合わせた操作証拠である。要求採用、両revisionの意味同値、実装開始、CI起動を生成しない。
