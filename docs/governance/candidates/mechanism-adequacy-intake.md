# 機構充足性要求の取り込み台帳

状態：要求・要件・受入の候補とPLAN-L3-89へ分解し、対象PLAN lintを通過。独立レビュー、正本昇格、IR収載、runtimeは未完了。
受付追跡：https://github.com/RetryYN/HELIX-HARNESS/issues/1248#issuecomment-5548311084
採番予約：https://github.com/RetryYN/HELIX-HARNESS/issues/1248#issuecomment-5548320520
照合基準：main `ff51260578c22124190964b6cc003612a83c075d`。
原稿：`HELIX_MECHANISM_ADEQUACY_REQUEST_v0.1.md`。原文は[要求候補](mechanism-adequacy-requests.md)へ保持する。
本台帳は追跡用であり、要求・承認・完了の第二正本にはしない。

## 原稿の移管対応

| 原稿 | 分解先 | 受入 |
|---|---|---|
| 目的、R1 | MA-R-01 | MA-AC-01/02 |
| R2 | MA-R-02 | MA-AC-03..08 |
| R3 | MA-R-03 | MA-AC-06/09/10 |
| R4 | MA-R-04 | MA-AC-11/12/21 |
| R5 証拠 | MA-R-05 | MA-AC-13..15 |
| R5 費用 | MA-R-06 | MA-AC-07/16/17 |
| R6 効果 | MA-R-07 | MA-AC-18/19/21 |
| R6 Web | MA-R-08 | MA-AC-20 |
| 既存責務、実装段階 | 要件候補の主担当と下記導入順 | MA-AC-12/21 |

原稿の受入1→03..08、2→10/17、3→13/14、4→14/16/17/20、5→18/19、6→21。

## 現行契約との差分

確認した現行正本：`docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md` と
`docs/test-design/helix/universal-improvement-loop-acceptance.md`。UIL-R-04/05にはcandidateと意味影響分類があり、
UIL-R-06..14に評価・配車・効果・学習・replay・AI境界、UIL-R-15に世代保全がある。
追加差分は六分類、限定した不足証明、方式ごとの適用実績、撤回可能な評価receipt、通常観測LLM追加0。
既存機構を再実装せず、ownerをUIL-04 #1248に集約する。

最適化点：AI出力の再生成決定性と、固定証拠からの機械評価の決定性を区別した。
六分類と既存routeは一対一対応ではない。Web横断学習を初期判定へ一括hard dependencyにしない。

## 導入とRelease接続

1. 本候補のPLAN採番・予約、L1目的/L12観測とL3/L10のtrace、対象revisionの承認・独立reviewを揃える。
2. 既存UIL正本へのversion-upとmain read-after後、#397でRequirement IRへ収載する。Issueから直接IRを生成しない。
3. 一領域のread-only評価：MA-R-01..03/05/06。確認済み機構集合を固定し既知事例で分類する。
4. 設計候補・既存配車：MA-R-04。UIL-05/06と必要なSystem Synthesis契約だけへ接続する。
5. 運用効果：MA-R-07。許諾・Learning境界が成立した範囲でのみMA-R-08へ進む。

Release所属候補は既存の改善・再設計機能群。#1494/#1500の確定revisionへ対応を登録し、正式なRelease IDや出荷済みを捏造しない。
各段階は要求→設計→実装→検証→Release→L12のedgeと後続義務を持つ。#1037の保留解除、独立DB、常駐ループ、
新承認gate、公開操作は非対象。既存P0・CI・Cursorを本機能完成待ちにしない。

## 原稿削除条件

原文移管の一致とtraceの欠落なしを確認し、PLAN/追跡先と独立検収を揃えて安全に保存した後にroot原稿を削除する。
現在は検収前のため原稿を保持する。他レーンの変更を混載・削除しない。

## 受付時の検証記録

2026-09-05、上記baselineに本sliceの候補5ファイルを追加した隔離worktreeで確認した。

- `helix plan lint docs/plans/PLAN-L3-89-mechanism-adequacy-authority.md`：exit 0。対象1件、採番1158件、新規衝突0。
- `vitest run tests/plan-lint.test.ts`：55/55成功。これはlint実装の回帰であり、本機能runtimeの検証ではない。
- Node assert：要求候補末尾の原稿bytes一致、8要件、重複なし21AC、要件とACの相互参照、候補間リンクの実在を確認。
- `git diff --check`：exit 0。ただし未追跡ファイルの内容検査を代替しないため、stage後にも実行する。

既知のdesign-reality-binding advisoryはbaseline47件のまま。独立レビュー、全体doctor、DB replay、
outstanding snapshot同期、CIおよびPR admissionはこの記録で成功としない。
