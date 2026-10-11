# 残る要求Issueの要求ステージ照合

この記録は#1852と#1854の当初対象を既存の153行限定join、confirmed175原文、今回の4件採用へ結ぶ独立review用の資料である。要求採否/完了/Issue closeのauthorityはない。全source原子やconsumerの再監査を新しい要求終了gateにしない一方、具体的な要求意味の不足をholdingの存在だけで閉じない。

[照合JSON](requirements-issue-stage-reconciliation-2026-10-11.json)に、#1852の主13IR・副HIL-TR03とconfirmed4件、#1854の主FR02/50・副FR24/30を一意に列挙した。過去のroute/限定comparisonは当時の値として保持し、未割当0を全意味被覆と扱わない。source原文8行は行hashを再計算した。4件採用の判断記録は対象PRがmainへ入った範囲で効力を読む。

| Issue | 今回採用した差分 | 残る要求粒度の照合 | 全移管/下流へ保持するもの |
|---|---|---|---|
| #1852 | 089の全資産/8カテゴリ/充足report、版未指定 | 019/038の入口と内容閉包、14IR既存限定join、FR14/44/NFR16。特に初回不整合でproject全体を止めない要望を具体に確かめる | 旧手順/schema/consumer、catalog DB粒度、A126、formal successor |
| #1854 | 005の5規律、既決版保持 | 既決TDDORDERと旧FR02順序差、FR24の元作業との意味関係、FR30のVisual/token/a11y/回帰/UXの責務 | 旧固有依存方向表、workflow anchor、GreenDefinition/history、旧PLAN schema/具体workbench/consumer |
| #1853 | 090生成unitのB案、1.0 | 先行独立review6092938361の残条件O10選択を、生成/039関係/079証拠/049測定の既決採否へ結ぶ | 全source/formal successor、実装と実画面の合意/受入 |
| #1857 | 003hotfixへ通常Release Portを適用するB案 | 先行独立review6092550610の残条件B選択と、既存003/017/OS運転/受渡しへ結ぶ | 旧三者production主体を含む未処置source、実release、全source移管 |

要求ステージの粒度は現行[終了基準](../../requirements-stage-closure.md)の「利用者要望・配置・意味scope・人の確認と行き先の整理」に従う。旧工程L00-L06の利用者視点とシステム仕様の区別（101行）およびAP-6（262行）を起点に、技術schema/形式/全consumerの未確認と要求不足を分ける。旧test/CI/runtimeは実行しない。

本資料は独立review前のため、具体不足0や4Issue終了を宣言しない。review側は対象revisionの既決採否を読み、具体的な要求不足があればsourceと現行条項の差を指摘する。旧source全体のformal rehomeや下流実装だけが残る場合は、その生存先#1813/#2846を保ち、要求側Issueの終了を別に判断する。親program #1813/#1814/#1815は別範囲のまま保持する。
