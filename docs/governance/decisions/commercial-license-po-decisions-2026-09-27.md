# 開発repositoryの全権利留保表示への切替判断記録

日付: 2026-09-27
対象: RetryYN/HELIX-HARNESS（開発repository、publicを維持）
種別: G14 / operation_change。要求候補の採択や配布契約の締結ではなく、POが明示依頼したroot LICENSEと現行表示の切替。
基準commit（切替前）: `41a477b756f4c62bc72d5554952a6ad9c5f29376`
切替前LICENSE SHA-256: `1ec00bbf092b28cae28750fb6c8cd02f2cd0999ee4d4c96d1279e09b15345796`
切替後LICENSE SHA-256: `611d5e08c469d716ffdc2aaaae77f428e094d16b31de3556c8fd1616d13ae439`

## 指示の出所と作用

PO原文は[source snapshot](../sources/commercial-license-po-original-2026-09-27.md)へbyte一致で保存した（SHA-256 `af587e03e89d939f88732f5572b0988d6808be0a5205801498d36a1f21cf9d2a`）。前書き・質問要約・当時のfork/star/contributor観測はClaudeの記述であり、PO発言でも現在の権利確認でもない。PO発言は同ファイル「PO発言」節の引用だけとする。

POの引用（原文のまま）：

> あ～。あと有償化ライセンスにしたい。

> （対象）開発repo（本repo）, 配布先はすべてプライベートにするけど、全部で。

> （形）企業みたいな証明が必要なく、発行できる最高権限。

> （private化）開発側はギットハブコスト観点からプライベートは無理。

今回のユーザー指示は「開発repoのLICENSEをMITから全権利留保（All Rights Reserved）の独自ライセンスへ差し替えるPR」と切替内容を明示した。POの「最高権限」という語から法的な優越・全資産の所有確認・例外の不存在を推定しない。
英語正文のLICENSE、READMEの案内、既存第三者通知への権利境界を同じPRで更新する。merge時点でmainのroot LICENSE表示が変わる作用は、この明示指示に含まれる。過去の候補PRのmergeを根拠に発効させるものではない。

publicは維持し、visibility変更・tag・release・配布repoの変更・価格決定・契約の締結・課金は行わない。配布先privateというPOの方針は保存するが、今回その操作をしない。

## 旧資産からの保持・変更

- `LEGACY-ASSET-3AC6722CBF61023378CB`：`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-commercial-license-requirements.md`、全体1–95行、CL-R-01〜12の表は42–53行。SHA-256 `35d25d16755239eb0b68b6b9d32250dd340df5406246c84868e5bb1aabd3e0c9`。
- `LEGACY-ASSET-1BE4A43C4A61E5CDCC5E`：`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-commercial-license-acceptance.md`、全体1–32行、CL-AC-01〜12の表は8–19行。SHA-256 `2328a8bddfc653668f28d94babbf024b8d163fe661697a8782d5608b7fa29eed`。
- [現行再分類監査](../audits/source-rebaseline/new-generation-license-distribution-source-crosswalk.md)を照合した。旧「HELIX全体を一契約」「Module／Slice／Bundle」や旧builder/runtimeは採用しない。

| 旧条件 | 今回の扱い |
|---|---|
| CL-R/AC-01 | 対象は本開発repoの表示切替。全製品の共通契約・全資産集合の権利確認は成立させない |
| CL-R/AC-02・03 | 有償書面ライセンスを別途要する。評価利用・SaaS/OEM/再配布の契約条件は未決。無償評価権を生成しない |
| CL-R/AC-04 | 利用者成果物とHELIX素材、第三者・contributor権利を区別。権利未確認部分をRetryYN所有にしない |
| CL-R/AC-05 | 切替前baseと新旧LICENSE SHAを固定し、過去MIT版と既許諾の素材を遡及変更しない |
| CL-R/AC-06 | root LICENSE・README・第三者通知を整合。現行package manifestは検索で不在、archive/snapshotの旧metadataは保持 |
| CL-R/AC-07 | 旧Module/Slice/Bundleや旧Release管理を持ち込まない。契約版・製品版の運用は今回対象外 |
| CL-R/AC-08 | 権利不明な資産の再許諾・提供を可能とみなさず、他の開発を一律停止しない |
| CL-R/AC-09 | install/upgrade/rollbackや配布を実行しない。歴史版の許諾を新表示で偽装しない |
| CL-R/AC-10 | 旧候補から発効を導かず、今回の直接指示による表示切替を独立reviewする。権利棚卸し・契約締結済みとはしない |
| CL-R/AC-11 | 紹介表示・顧客名等の宣伝利用を新条件にせず、生成物への挿入をしない |
| CL-R/AC-12 | 今回はmain上のLICENSE・表示・public維持をread-after。配布後の運用確認は未実施 |

再分類監査末尾の「法務判断が完了するまでLICENSE変更を行わない」は当時の未決状態の記録として保持する。今回の直接指示で本repoの表示切替を進める点が差分であり、正式な法務確認・全資産の権利棚卸し・配布の完了へ拡張しない。

## GitHub上の公開と例外

2026-09-27に[GitHubのライセンス案内](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)と[利用規約D節](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#d-user-generated-content)を確認した。公開repositoryの閲覧・fork等とGitHubへの規約上の許諾を保持し、独自表示だけでそれを制限できるとしない。適用法上排除できない権利も保持する。
過去MIT素材を新revisionへ含めても既存許諾は失われず、今回の切替で過去素材を独占化できるとはしない。

## 人の判断が残る点

| 対象 | 具体的選択肢 | 推奨と影響 |
|---|---|---|
| 価格・契約期間・更新解約・サポート | 都度契約／期間契約／提供単位別契約 | 提供範囲が決まってから有償書面で定める。現時点の販売条件は生成しない |
| 評価利用 | 許諾しない／範囲・期間・用途を定めて別途許諾 | 明示条件ができるまで評価権を付与しない |
| SaaS・OEM・再配布 | 個別許諾／契約から除外 | 通常利用から派生権を推定しない。提供形態ごとに判断する |
| 準拠法・責任範囲・契約書・法務確認 | 専門家確認を経て条文化／未確定として提供を保留 | 独自表示の有効性・契約条件を専門家へ確認する。本記録は法的助言ではない |
| 第三者資産・contributor権利・通知 | 根拠を確認し通知追加／不明な部分の提供を保留 | 全件棚卸しは未完。所有・再許諾可能性を表示だけで確定しない |

## 検証とreview範囲

旧sourceは読取りのみ。新旧LICENSE/PO sourceのSHA、参照、現行表示、履歴不変を静的確認する。共通手順8のscfctl・研究validator全件の個別before/after・govcheck/regen/selftest・新規を含むdiffcheck・相対リンクを記録する。旧CI/hook/runtime/CLI、配布consumer検証は起動しない。
本PRは要求本文・L2 identityを追加しないoperation_changeであり、要求registerへの新規候補やno_lossを生成しない。変更文書を読む現用binding/pinがあれば追随する。Codexが作成、Claudeがexact HEADを独立reviewしてmerge/read-afterする。
