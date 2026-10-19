# BRAINの要求・受入を意味JSONへ移すための表現比較

- status: research_candidate
- authority_effect: none
- binding: [SCF-B-0157](../../bindings/SCF-B-0157.json)

作業元: [FT-DESIGN-REFACTOR-001](../../../docs/governance/feature-tickets/FT-DESIGN-REFACTOR-001.md)、[Issue #3139](https://github.com/RetryYN/HELIX-HARNESS/issues/3139)

## 比較する問い

既存要求の意味・出典・採択固定revisionを保ち、意味値を一度だけ編集して、現在とbyte同一のMarkdownを復元できる最小の表現は何か。

この問いを確かめる材料として、BRAINのL2/L11 pair全体を使う。複数要求の採否を同時に決めるPRではなく、`research_premise`の比較候補である。mergeで成立するのは比較材料と静的照合の記録だけで、JSON正本への切替、形式の採用、要求の承認、製品schemaやrendererの成立ではない。

## 固定入力と保全範囲

入力はmain `0437a7886aa2d61c9121fde1a3c4e6459c09ca65` の以下の本文である。

| 入力 | bytes | SHA-256 |
|---|---:|---|
| `docs/helix-brain/L2-requirements/brain-requirements.md` | 78,839 | `ef41de572d35912a0345dad2960a3ae7015ca5434d67247503785b9f65e8346c` |
| `docs/helix-brain/L11-acceptance/brain-acceptance.md` | 27,596 | `b48433e20139daa2f6cd7da7bac1b35e1634fd802d68ada87a93a7d3d7b44c87` |

L2には一覧表40件と後続029〜032の4件、計44の要求identityがある。一般系列27件とINFRA系列17件を分け、一般系列013〜017の欠番を補わない。L11も表40行と029〜032の個別条件を保持する。ID外の共通条件、版、N/A、保留、source、旧記述、限界も比較対象である。元本文の反復・順序・空白を保存し、同じ語やJSON形だけで別責務を共通化しない。

現在の本文と、[9/28のBRAIN判断](../../../docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md)が対象とした42件の固定revisionは区別する。[032の判断](../../../docs/governance/decisions/brain-template-contract-032-po-decision-2026-10-10.md)等の後続decisionは、その指定scope・対象revisionから読む。本文中のdraft／未採択metadataは元bytesとして保存し、その文字列から現在の承認状態を生成しない。新JSONの物理bytesへ過去の承認を継承しない。

他の7機構14文書はこの比較物へ混載せず、元ticketの移行残件として維持する。BRAINを全HELIXの標準形式と仮定しない。

## 現行consumerとの境界

現行L2/L11 Markdown、48個のL3/L10 JSONと生成view、その中のL2/L11向け108 source pinsは変更しない。将来の形式移行で最初の生成Markdownをbyte同一に保てば、これらの固定bytesを維持できる。生成viewの指定は意味JSONや入口の対応から示し、Markdownへのheader追加や改行正規化を一緒に行わない案を比較する。

これは切替案であり、現在のMarkdownが既に生成viewへ移ったとは扱わない。将来Markdown bytesを変える場合も、過去のpinを一律更新せず、旧sourceの固定commit・path・digestと対応するconsumerを保持して、その変更scopeの既存経路へ戻す。

## 照合と限界

候補内の意味値、要求identity、L2参照付き受入条件と、表示用の空白・罫線等を区別して比較する。全文字列をMarkdownのままJSONで包むだけの案や、意味値と同じ本文をraw block／row／cellへ繰り返す案を完成形にしない。

- [brain-requirements.json](brain-requirements.json): `requirements[]` の実IDと、`body[]` の原ラベル・値を編集箇所として分ける。40行の候補表は各要求の `catalogue`、029〜032の詳細は原ラベルの列として保持する。同じラベルの反復をobject keyの上書きで消さない。
- [brain-acceptance.json](brain-acceptance.json): `acceptance_records[]` はL2要求IDへ結ぶ。40行の成功条件と反例は元の一つのcellのまま保持し、029〜032の追加条件は原順のラベル・値へ置く。独自のL11 IDや、存在しなかった44行の表は作らない。
- 両候補の `source_content` と `front_matter_raw` は共通条件・source等の原値を保持する。これらの意味分類は未完であり、正式な機械判定に使うfieldが全て形成されたとはしない。
- `surface_recipe` は候補内の値への `ref` と装飾文字の `literal` だけを順に連結する、この比較物専用の表現である。意味値を変えたときに別のraw全文を返すfallbackを置かない。製品共通の参照形式・resolverとして採用しない。

固定Git入力を取得できるcheckoutで、次の静的比較を再現できる。作成側の変換scriptや製品関数は呼ばない。

```sh
python3 -B scaffold/research/brain-requirement-json-migration/compare.py
```

[comparison.json](comparison.json)は、候補の全bytes復元、原ラベル337項目、表の各40行、見出し64件の対応と、限定した5反例を照合した記録である。初回候補には見出しのlevelを一つ多く格納する誤りがあった。byte復元は一致していたが型付き構造は誤っていたため、Rootの原見出し照合で検出し、`#`の個数へ修正した。本文metadataを混同しかねない派生 `source_status` も除去した。修正前の観測はローカルの非採用比較記録へ保持している。

現在の候補JSONは合計316,275 bytes、原Markdownは合計106,435 bytesである。意味値の単一編集箇所を形成した一方、2,511件のsurface操作等の保存・理解コストが増えている。容量、編集箇所、参照追随、review・復旧の各コストを分けて評価し、この形式が最適だとは認定しない。

静的な復元比較と、要求の意味の十分性は別である。全bytesが一致しても、構造fieldの切り方やL2/L11対応まで正しいとは限らない。対応を確認できない箇所は未確認として残し、candidateの出力から期待を作り直して一致させない。製品のRed→Green→Refactor、正式Design CI、実資格・配送・受入の成功は主張しない。

## 旧source・失敗との対応

旧 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md` §2・§5（LEGACY-ASSET-98372FEE8A3AC8F9C299）と、旧L4の同名文書§1〜§2（LEGACY-ASSET-4F5A1F0739EC1111D91D）を起点とする。意味のowner・構造field・source→target対応と、旧authorityを自動昇格しない点を保持する。旧compiler、registry、runtime、gateは移植しない。

今回の起点は、#3139に記録した巨大JSONと参照更新漏れ、および先行した16文書の比較候補で、2,516,532 bytesの原文に対して11,832,777 bytesの保存量になった観測である。block／row／cellのrawと監査情報を重ねた形式を日常編集する正本へそのまま採用せず、意味内容と監査情報の役割を分ける。容量削減だけで意味保存や変更コスト改善を認定しない。
