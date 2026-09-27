# CI性能・改善回収の旧条件との対応

基準commit: `c0c0a8362f3000275dd01918ce6383ab6b346cc9`。REG-01の限定的な要求追補であり、全旧CIの意味被覆、現行実装、実測合格を表さない。HELIXOS-L2-031/L11は未採択候補。

## 系譜

GH-FR-025とGH-NFR-009〜011の文書はdraftだが、`ci-system-synthesis-requirements.md`はconfirmedで、frontmatterのrefinesにGH-NFR-009〜011を持つ。したがって旧条件を「draftだから無視できる」と扱わない。CIS-R-10〜15の非縮退、resource/版、fallback、回収・因果trace、安全指標も照合した。旧文書の状態から現行の候補採択を生成しない。

| asset | path | 選定行 | file SHA-256 | 文書状態 |
|---|---|---|---|---|
| `LEGACY-ASSET-79B70809D0A1EE2D5392` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-ci-performance-requirements.md` | 14–34 | `sha256:7a9b3534671516be8810e40a8c96119e885eb431a4753518b56fe2479b9263d1` | draft |
| `LEGACY-ASSET-58CBC57F44DFDD288961` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md` | 52–64 | `sha256:52af19a483d6222f31d1d52031482fc60c62c504fe97496687d8175aa7a53756` | draft |
| `LEGACY-ASSET-DA012A9B04D5BE9419CE` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md` | 94–124 | `sha256:65400847881f1a72b273f0bdeff503a5ea302705cd0e71d7913fc7d0f8dd18fb` | confirmed |
| `LEGACY-ASSET-8B7FCC6ED4A9FDDFDEB5` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/github-ci-performance-system-test-design.md` | 20–28 | `sha256:8014f6ceab95bcfe3bdb717f2d813de12fa09d8dee492ec221a8800ed799a232` | draft |

選定範囲の51非空行を`MPR-SH-CI-PERFORMANCE-001`へ保全。38行を候補へ保持し、数値と旧固定工程等を含む13複合行は元holdingへ保留する。保留行の一部条件は031へ再導出していても、行全体の移管完了にしない。範囲外の文書部分を本receiptで被覆したとはしない。

## 既決の工程差分

[2026-09-26 PO判断](../../decisions/harness-v-valley-process-po-decisions-2026-09-26.md)の「チケット自体がCIの範囲を決める」指示と、その反映「夜間の補完はやめる。代わりにLABOが、検査をすり抜けて後で見つかった失敗を振り返り、原子CIやコネクタの契約が足りているかを評価して返す」を適用する。旧main/full/nightly固定回収を普遍的な工程として復活させない。一方、必要な検証義務の未完保持、元selector/edge/oracleへの追跡、最初のterminal receiptへの一度だけの接続は残す。古いroutingの「判断待ち」を理由にこの工程判断を再質問しない。

## 数値について残る判断材料

- **原文**：GH-NFR-009は内部CIとGitHub Actionsそれぞれの重要検査p95 60秒、GH-NFR-010はFull verification p95 3分を目標にする（原文全文はsource holdingの該当行）。GH-FR-025とGH-AC-017/GH-T-017にも同じ値が現れる。CIS confirmed refinementはこの由来を保持するが、同じ環境で達成した実績を証明しているわけではない。
- **選択肢A**：旧の重要検査集合と環境に対応する範囲で60秒/3分を数値目標として保持する。適用外ticketには適用外理由を残す。
- **選択肢B**：現行ticket/環境の計測契約から範囲別予算を具体化し、旧数値との差を要求の意味変更として確認する。旧数値は判断まで消さず、数値未確定のまま達成済みにしない。
- **推奨**：Bの具体化を要件へ渡し、旧目標の適用対象を先に対応付ける。単に遅い実装に合わせて値を緩和することは推奨しない。現時点で新しい値は選んでいない。
- **影響**：HELIXOS-L2-020/031、HARNESS-L2-022/034の計測契約、INFRASTRUCTURE実行資源、対のL11。正しさの義務や安全指標を性能目標と交換しない。候補のPO採否とL3の計測細目を区別し、未処分行を「採用済み」へ丸めない。

## 追補に保持した保証

計測と改善の証拠はHEAD、環境、cache、期間/母集団/除外、時刻・exit code・output digest・区間durationに束縛する。性能だけの超過は同episodeの別改善義務へ戻し、元の正しさ判定と別に追う。改善前後p50/p95、検査非縮退、独立review、再検証、安全指標を確認する。義務の削除、閾値緩和、timeout延長による隠蔽、検査先送りを改善とは認めない。数値の未決や旧runtime非実行から、現在の達成・失敗どちらも推定しない。
