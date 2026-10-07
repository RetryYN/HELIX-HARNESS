# INTELLIGENCE Stage 3 review02追補（072 source-category補正、2026-10-08）

この追補は、#2658 review02に対応する既存の2026-10-07修正記録を遡及変更せず、Rootの再読指摘を追記する時点証拠である。対象はHELIX-INTELLIGENCE Stage 3、固定親HELIXINTELLIGENCE-L2-072とHELIXINTELLIGENCE-L2-007の追補部分に限る。PR全体には先行修正の011価格・metric修正も含まれる。review comment bodyはUTF-8 5,890 bytes、SHA-256 `f113e3b21c5f6b360ed1dccab36ac82131a2ac1ba5d585e8605994b948c4b645`。権限効果はnoneで、新承認、L10 pass、親意味・scope・版の変更を作らない。

## 旧fixtureの保持と分離

HEAD `65af0caa2ea95b9a89a05240fb0274135a034a4a` の既存CASE-072-07-04/07/09を読み、元の独立predicateを復元した。

- 07-04は「必要evidence出力欠落」を維持する。fixtureでは対象要件ownerが要求するevidence `receipt-src@r1` を明示し、対象要件ownerへ照合する。BRAIN knowledge、LABO実験評価、HARNESS共通pack契約のsource categoryと混同しない。
- 07-07は「model適性出力欠落」を維持し、選択済みLABO評価結果を明示する。model適性のshadow実験/evaluation evidence欠落とは分ける。
- 07-09は「candidate pack version出力欠落」を維持する。候補versionはINTELLIGENCE candidate ownerへ戻し、HARNESS共通pack contract version欠落とは分ける。

今回追加したsource-specificな変異は別IDとした。BRAIN knowledge source identityとversionは単独欠落を別fixtureにしBRAINへ戻す。model適性shadow実験/evaluation evidenceだけの欠落はLABO、HARNESS共通pack contract versionだけの欠落はHARNESS-L2-010/011へ戻す。どのfixtureも残る出力・source・scopeの正常値を固定する。

## 007-03 traceの明確化

episode identityは共通のまま、support obs-a/obs-bとrefutation obs-cはそれぞれ独立したsource identity/revisionを持つ。source revisionが一つだけという読みを避けるため、「全観測は同じepisodeへ結び、各観測はそれぞれのsource identity/revisionへ追跡可能」と明記した。type=support/refutation、oracle出力、既存owner境界は保持する。

## 根拠と検証

固定L2-072 (633bf12:561–590)、L2-007 (633bf12:84–90)、L11全文、旧source inventoryと旧asset 28FB/A952の参照pinはJSONに記録した。2026-10-07の元追補JSONは変更せずSHA-256 `7ecf2061baf37095697610e20cc15373ae4a7181439e0961cfe995cd38c49556` で保持する。このfollow-upの6本文SHAはJSONに記録した。

CASE predicateの比較、個別CASE ID、007-03のepisode/source関係、6本文SHA、`git diff --check` を静的確認する。fixtureは未実行であり独立reviewも未完了。旧runtime/CLI/hook/test/CIは起動していない。

元追補のspan SHAのうち、原文の行末を保持したbytesの再計算と異なる値は、JSONの`source_pin_corrections`へ訂正値を記録した。元追補の時点記録は保持し、固定親原文は変更していない。
