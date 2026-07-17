# ADR-010: Python 恒久意味コアと Node 単一 commit 境界（ADR-009 部分改定）

- status: accepted
- date: 2026-07-17
- decision_authority: PO 委任裁定（2026-07-17 チャット指示「技術的にどちらが優位かで決めろ」に基づき、
  監査比較の結果を採用。委任記録は本 ADR とフルチェック監査レポートに残す）
- supersedes: ADR-009 の一部条項（下記「改定範囲」参照）。ADR-009 のその他の決定
  （Node 24 LTS `>=24.15.0 <25`、脱 Bun、Linux full canonical gate、cutover receipt 機構、
  Python への network default deny・DB path/credential/`.helix/` 非付与）は存続する。
- 関連: `docs/adr/ADR-009-node-python-linux-runtime.md`、
  `docs/governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md`、
  `HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0.zip`

## 背景

REBASELINE v0.4.0/v0.5.0 のフルチェック監査で、ADR-009 の「Python = proposal-only worker、
分類不能な機能は reject して TS/Node 再実装」という条項と、ハイブリッド設計ドキュメント v1
（実証済み Python コアエンジン、715 ファイル・122 文書カタログ・検出・trace）の温存方針が
正面衝突した。両案の技術比較を行った結果は次のとおり。

1. Python への DB 直接 write 開放（全面 supersede 案）は劣位。Claude↔Codex が同一
   `harness.db`/Git を並行運用する本ハーネスでは、書き込み口が 2 つになると lease/fence/
   監査証跡を Python 側へ二重実装する必要が生じ、競合破損リスクだけが増える。
2. ADR-009 現状維持も劣位。「分類不能 → TS/Node 再実装」既定は、実証済みエンジンに対して
   退行リスクのみでメリットがない。実測でも hybrid の全 29 ツールが既存 capability class に
   分類され、この条項は一度も発火していない（死文の書き直し圧力）。
3. ADR-009 で技術的価値が実証されているのは「commit の一手を Node の単一境界に通す」こと
   のみ。従属的な呼称・再実装既定は本質ではない。

## 決定

1. **Python = 恒久意味コア（semantic core）**。ハイブリッド設計ドキュメント v1 由来の
   Python 実装は、要件抽出・typed spec・trace・検出・impact・review・文書生成という
   意味判断・生成能力の**正本**であり、書き換え対象ではない。TS/Node への再実装義務
   （reject-for-TS-reimplementation 既定）は**廃止**する。capability class に分類できない
   新規機能は、ADR 改定による class 追加で扱う（書き直しを既定姿勢にしない）。
   逆方向の bulk port（動作している Python エンジンの TS 一括書き直し）は高リスク行為として
   原則禁止し、実施には PO の個別承認を要する。
2. **Node = 実行境界（transactional boundary）**。`harness.db` および Git/GitHub への
   commit・副作用は従来どおり Node の単一境界のみが実行する（lease/fence/audit は既存
   Node 機構）。Python へ DB path・credential・repository・`.helix/` を渡さない実装手段も
   維持する。これは Python の従属ではなく、multi-runtime 並行運用の直列化点である。
3. **呼称の改定**。「proposal-only worker」という従属的呼称を廃止し、
   Python = 「意味コア（semantic core）」、Node = 「実行境界（transactional boundary）」とする。
   両者は層別権威（layered authority）であり、意味判断の正本 = Python、
   トランザクション・外部副作用の正本 = Node、として**同格**に扱う。
4. **権威順序**。人が承認した要求・判断記録・確定 ADR を最上位とし、その直下に
   「意味判断の正本 = Python semantic contract」と「実行の正本 = Node runtime contract」を
   同格併記する。一方を他方の全面上位とする記述を禁止する。

## 改定範囲（ADR-009 のうち本 ADR が上書きする条項）

- 「Python は proposal-only worker」という位置付け・呼称 → 決定 3 に置換。
- 「capability class に分類できない機能は reject し TS/Node で再実装」→ 決定 1 に置換。
- 権威関係の非対称記述（Node contract を Python source の全面上位とする読み） → 決定 4 に置換。

## 影響

- REBASELINE v0.5.0 の該当文言（01/02 章、HBR-CORE-001、HBR-ARCH-009、AC-CORE-01 ほか）を
  本 ADR 準拠へ更新する。
- `.claude/CLAUDE.md` / `CLAUDE.md` の Cutover 境界節にある「Python proposal-only」表現は、
  次回の CLAUDE.md 改訂で本 ADR の呼称（意味コア／実行境界）へ追従させる（機能的変更なし）。
