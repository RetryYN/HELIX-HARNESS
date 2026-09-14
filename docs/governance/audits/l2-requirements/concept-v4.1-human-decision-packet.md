# Concept v4.1・対象別L1 人間判断packet

prepared_at: 2026-09-14
source_head: `bd7432c23f7a9577d56a1e55c748a5ce733438a4`
status: awaiting_human_decision

## 判断の目的

本packetは、HELIXの新世代上流をGitHub Issue、PR、CI、既存実装から推定せず、exactなローカル文書revisionに
対して人間が判断するための入力である。remote branchへの同期、Claude review、静的検査は判断材料であり、
承認を自動成立させない。

## 何を判断するpacketなのか

人間に判断を求める内容は、文書IDやSHAそのものではなく、次の製品方針である。

| 平易な判断事項 | 採用した場合 | 採用しない場合 |
|---|---|---|
| 外部へ提供する製品をHARNESSとする | V-model、工程、検証契約、利用条件をHARNESSへまとめる | 外部提供物のidentityを別途定義し直す |
| HELIX-OSを内部の管理・統制機構とする | authority、Worker、log、CI、学習、改善、配布運転をOSへまとめる | 管理・統制ownerを別途定義し直す |
| HELIX-WebをOSが管理する個別製品とする | Web固有の利用要求を持ち、OSの管理UIへ還元しない | Webの位置づけを別途定義し直す |
| Version 1をHARNESS製品群の完成境界とする | 複数プロダクトの実開発とHELIX自身への適用でHARNESSを検証し、その完成をWeb展開の必須前提とする。Web自体はVersion 1完成分母に入れない | Web展開の依存関係とVersion 1の範囲を再定義する |
| GitHubを作業・共有・証拠の投影先とする | ローカルの対象別Concept／L1／L2等を意味正本にする | Issue／PR等のどこが意味正本かを再定義する |
| 現行資産を参考資料へ退役し、新世代を上流から再構築する | 旧CI・runtime・AI文書をbaselineにせず、意味採取後に非実行archiveへ移す | 維持する旧実行系と互換範囲を別途決める |

これら6点は、2026-09-14までのPO指示で既に方向が示されている。本packetで改めて曖昧な一括承認を要求する
必要はない。残る確認対象は、下記候補文書がこの既決方針に余計な意味を追加していないか、または必要な意味を
落としていないかである。修正が必要なら、文書IDではなく「どの方針が違うか」を指示できる。

### 文書で具体化した内容

- HARNESS: L1–L12、正規V-pair、工程選択、要求形成・合意・freeze・差戻し・完了、検証義務、外部利用条件、複数プロダクトと自己プロジェクトへの適用検証。
- HELIX-OS: 対象別authority、複数project管理、Worker、CI、証拠、継続・復旧、学習・改善、release・deployment運転。
- HELIX-Web: HARNESS Version 1完成後の展開、Connector接続、ダッシュボードによる進行確認、利用者の変更・受入判断、構成版、改善利用への同意。
- 共通: GitHub非authority、旧資産非継承、Concept→L1→L2→L3の順序、L2↔L11／L3↔L10。

上記に誤りがなければ、必要な返答は「この方向で進める」で足りる。異なる点があれば、その点だけを指定する。
内部記録では対象別revisionを混同しないためDecision IDを分けるが、人間へID入力を要求しない。

## 判断対象

| 対象 | SHA-256 | 判断する意味 |
|---|---|---|
| `docs/governance/candidates/helix-concept-v4.1.md` | `ca1881bc977179fae9abb7efae6528e95a230926e37e81384db9afcbf15a4589` | HELIX、HARNESS、HELIX-OS、HELIX-Webのidentity、Version 1境界、9原則、新世代境界、authority順序 |
| `docs/design/harness/L1-planning/product-intent.md` | `1ecebf2d72d91f24f66482c244ee93d7b5fbfec14d817d68f36d34ce895321b9` | HARNESSの外部提供価値7件と対象外 |
| `docs/design/helix-os/L1-planning/system-intent.md` | `0f6511a55e550052be27ca1067071a61042e9ef894a100d918f5beb47675e62f` | HELIX-OSの管理・統制価値8件と対象外 |
| `docs/design/helix-web/L1-planning/product-intent.md` | `f6a28279965930ae6f006583656d2a2109616ca8099c26563a7925ffc68940d6` | HELIX-Webの個別製品価値6件と対象外 |

L2文書3件は上記L1とのrelation案を持つが、本判断対象には含めない。L2では利用者、場面、操作、期待結果、
prototype／非UI適用性を個別採否し、別の人間合意を行う。

## v4.0から変える意味

| 項目 | v4.1での決定候補 |
|---|---|
| 製品境界 | HARNESSを外部提供製品、HELIX-OSを内部管理・統制、HELIX-WebをOSが管理する個別製品とする |
| Version 1 | 複数プロダクトの実開発とHELIX自身への適用を含めてHELIX-HARNESS製品群を完成させ、その完成をHELIX-Web展開の必須前提にする。Web自体は完成分母へ入れない |
| Contract Compilation | Requirement IR／Release Sliceを先に固定せず、Concept→対象別L1→L2→L3→設計・検証・実装・運用の順にする |
| Durable State | semantic authority、実行事実、projection、working contextを分け、OSが原情報から再構築する |
| Composable Release | 旧Slice／Module／Bundle／DevOS artifactを新世代identityにせず、承認済み機能と適格性からHARNESS提供構成を再導出する |
| GitHub | 作業・協調・証拠projectionに限定し、要求意味・採否・合意・受入を生成しない |
| 既存資産 | sourceとして意味を採取後に非実行archiveへ移す。新世代のbaseline、parity oracle、fallbackにしない |
| CI／AI文書 | 承認済み上流から新規導出する。要求整理中は旧CIを起動せず、現行AI文書も変更しない |

## reviewと修正状態

[Claude初回review](concept-v4.1-claude-review-96171b9ba.md)はBlocker 3件、Major 6件を報告した。
修正版では次を変更した。

| 旧所見 | 修正文書上の対応 | 独立再review |
|---|---|---|
| B1 原則変更を保持と誤記 | v4.1に保持／改訂／追加と理由の表を追加 | 未取得 |
| B2 L1→L2が片方向 | 3対象のL2に`parent_l1_candidate`と全L1 ID relationを追加 | 未取得 |
| B3 v4.0／v4.1 identity衝突 | v4.1を`HELIX-CONCEPT-V4.1`へ分離 | 未取得 |
| M1 L12接続欠落 | 3対象L1の採択条件へL12運用評価を追加 | 未取得 |
| M2 L0柱がL1を迂回 | 3対象L1へP0–P9の帰属／非該当を追加 | 未取得 |
| M3 総称HELIXが要求owner | 旧HCV4-L2／L11を`migration_crosswalk_only`とし、全6件をHARNESS／OSへ分割 | 未取得 |
| M4 OS責務欠落 | release／deployment／observationとprojection再構築のL1要求を追加 | 未取得 |
| M5 HARNESS責務欠落 | 要求形成、合意、freeze、差戻し、再開、完了のL1要求を追加 | 未取得 |
| M6 移行中gate不明 | 静的意味検査と人間判断の効力、旧CI／旧gate非利用を明記 | 未取得 |

修正版へのClaude再reviewは2回ともprovider `outcome:error`で本文が返らなかった。第3回はsealed worker contextから
remote同期済みHEAD `46e441fe714bc38a26026bc9cdde7bef9f6c3d4f`を対象に起動したが、20分deadlineで
`terminal_failure=timed_out`となり本文を返さなかった。旧所見の`resolved`判定はない。
したがって人間は修正文書と未取得状態を見て判断する。初回review、provider error、timeoutを合格receiptとして扱わない。

## 内部で分けて記録する判断

| Decision ID | 対象 | 選択肢 | 依存 |
|---|---|---|---|
| HDEC-CONCEPT-4.1 | Concept v4.1 exact SHA | approve／changes_requested／reject | なし |
| HDEC-HARNESS-L1-01 | HARNESS L1 exact SHA | approve／changes_requested／reject | HDEC-CONCEPT-4.1=approve |
| HDEC-HELIXOS-L1-01 | HELIX-OS L1 exact SHA | approve／changes_requested／reject | HDEC-CONCEPT-4.1=approve |
| HDEC-HELIXWEB-L1-01 | HELIX-Web L1 exact SHA | approve／changes_requested／defer／reject | HDEC-CONCEPT-4.1=approve |

人間に4つのDecision IDを回答させるための表ではない。人間の平易な回答を、対象とrevisionを失わないようOS側の
記録で4判断へ投影する。Webを保留する指示があってもHARNESS／HELIX-OSの上流判断を自動失効させず、Web固有L2だけを
保留する。修正指示では対象、変更理由、維持する条件を記録する。

## この判断で成立しないもの

- 対象別L2の採択・合意、prototype合意、L11受入。
- L3／L10、Requirement IR、runtime、DB、CLI、hook、adapter、AI manifest、新世代CIの設計・実装。
- v3.1／v4.0や旧L0-L14資産の物理archive、削除、consumer切替。
- PR作成、merge、Issue close、release、deployment、公開。

ConceptとL1が承認された場合だけ、次は要求source atomを対象別L2へ個別採否する。
