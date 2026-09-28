# confirmed175残差3件：旧条件と採択L2/L11の限定照合

監査時点: `2026-09-28T20:46:05+09:00`
基準main: `8ada49b272d1c25b288f7e16832da539395d4420`
状態: read-only監査記録、authority effectなし。

対象はconfirmed175の既知残差3件のみ。旧source原文・file/line digestは実照合した。現行採択範囲は2026-09-28 PO decisionの固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2/L11 bytesに限定し、後続の未採択候補を採択要求に含めない。既存[confirmed175監査](legacy-confirmed175-full-audit-2026-09-28.json)、[残差分類](legacy-confirmed175-residual-disposition-2026-09-28.md)、[REG-06母集団・join監査](legacy-source-origin-reg06-population-audit-2026-09-28.md)の件数・joinは再集計しない。formal successorは3件とも未割当。以下は意味差候補の記録であり、採択・retire・実装を宣言しない。

固定L2/L11のfile SHA-256は各判断記録に従う。HARNESS: L2 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` / L11 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。OS: L2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` / L11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`。LABO: L2 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` / L11 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`。SECURITY: L2 `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` / L11 `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

## 1. Incident即releaseとbackfill — `harness/L1-requirements/functional-requirements.md::FR-L1-16`

**旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:47`、`LEGACY-ASSET-6B6C5CB0E481BE01088B`。file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `c68d0f29aaf2ad024f3a0ea37892eb84b7ffb54568e0726299f4b648115ddc7a`。旧条件atomは「検出 → hotfix → 即release → 収束 → current L1〜L12へbackfill」。

**現行採択対応**: HARNESS-L2-003（固定L2 `product-requirements.md:112–113`）は成果状態とRelease Portの必須条件を定める。対L11-003 (`product-acceptance.md:23`) は未検証で進行可能と判定しない。さらに対L11-003 `:138` は管理上の緊急性があってもV-pair・trace・検証・利用者受入を省略しない受入条件を明示する。したがって旧「即release」は現行条件と意味上の緊張があるが、旧FR-L1-16はそれらを省略するとは書いておらず、直ちに矛盾とは断定できない。OS-L2/L11-017 (`governance-requirements.md:662–670`, `governance-acceptance.md:338–344`) はIncident ticket/workflowと事後の運用評価・恒久対策を扱い、019/020/023は証拠・continuity・検収・受渡しを扱う。HARNESS-031/032はincident入力を含み得る失敗再現・回帰candidateの境界であり、本番release authorityではない。

**未回復atom**: 即releaseを現行Release Portと、緊急時にもV-pair/trace/検証/利用者受入を省略しないL11条件へどう接続するか、収束後backfillの範囲・時点。旧語句だけでbypass許可を生成しない。

**PO選択肢**: A) 「即release」を、現行のV-pair・trace・検証・利用者受入・Release Port条件を満たす範囲で優先的に進めるIncident経路として保持する。B) その保証をretireし、Incident hotfixにも通常の現行工程条件を適用する。旧FR-L1-16に工程省略の記述はなく、省略を許す案を旧要求の保持として提示しない。**推奨**: 現行portと緊急時の省略不可条件を維持し、旧即releaseの期待をその条件内で満たすか、旧即時性保証を変更/retireするかPOへ問う。PHCAP-17の旧三者承認条件は別source atomであり本件に併合しない。

## 2. GitHub監査資格の失効 — `helix/L1-requirements/three-lane-cloud-governance-requests.md::3L-BR-008`

**旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md:67,69`、`LEGACY-ASSET-A6926200F28B26300432`。file SHA-256 `e96a70f02c517f33d9cbdc43d92e6d7b36ded7bbf023226f1cc4f63b5f7c2765`。identity heading line 67 SHA-256 `d4d4e772fe334d81af99c5aa5856f07e0c2fd6d2107a01812264907941c9cfc0`; normative condition line 69 SHA-256 `cdb797e688296917ee4c54a9bf77ff12ac650ae56dc8dcf414f4e100c0e71969`。line 69はGitHub監査task class/model revision別評価、称号・資格・権限・assignmentの分離、重大missまたはmodel更新による資格失効を定める。

**現行採択対応**: HELIXLABO-L2/L11-055（固定L2 `labo-requirements.md:150–154`、L11 `labo-acceptance.md:56,191`）はWorker履歴を作業種別/model class別に集計し、根拠・範囲・未評価を保持する。採択059（L2 `:416–429`、L11 `:170–176`）は同task/scope/oracleでの比較・quality gate。OS-018 (L2 `governance-requirements.md:672–680`, L11 `governance-acceptance.md:345–350`) はassignment/handoff、SECURITY-008 (L2 `security-requirements.md:140–148`, L11 `security-acceptance.md:32,58`) は操作別permission/expiry/revokeを扱う。これらにGitHub監査固有major-miss基準やmodel revision時の資格失効は明記されず、permission expiryとも同義でない。

**未採択候補との区別**: main 8ada49b上のLABO-065（L2 `labo-requirements.md:503–514`、L11 `labo-acceptance.md:241–259`）は別の旧source (`infinity-loop-platform-requirements.md:151–152`)に基づく選択runtime資格/scorecard候補。task・fixture・rubric等を限定する隣接案だが未採択で、3L-BR-008、GitHub-audit task class、major-miss、model-update失効を採択した根拠ではない。

**未回復atom / PO選択肢**: GitHub監査task class、major-missの資格上の帰結、model revision変更時の再評価/失効。A) 既存LABO/OS/SECURITY責務内で専用資格条件を保持する。B) 専用条件をretireし、採択済み一般task-class評価と既存permission/review境界で置換する。**推奨**: generic Benchやcredential expiryから自動被覆と推定せず、provider laneやLABOのassignment/authorityを新設せずにPOへ選択を問う。

## 3. 4軸doc専用read-only review — `harness/L1-requirements/functional-requirements.md::FR-L1-45`

**旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:76`、`LEGACY-ASSET-6B6C5CB0E481BE01088B`。file SHA-256は1件目と同じ、line SHA-256 `c88465a7d0f5f2f881791256b0d45ba182573df4e1919f13d80b20ba1e0505d7`。FR-L1-45行の条件atomは大規模doc改定/gate evidence/pair freeze前の専用reviewer必須召喚、整合・網羅・一貫・明確の4軸review、未召喚時の特定gate fail-close。read-only属性は同一sourceではなく、明示的に派生元とされるBR-08 `business-requirements.md:48`（asset `LEGACY-ASSET-9F48ADEEB477DCA54039`、file SHA-256 `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`、line SHA-256 `45c182bcd3eb0eb9261eb2de58c12dca8c1a4e1de60f4d4c0263fa4ccc631c2f`）の「read-only reviewer」から採る。二つのsource identityは統合しない。

**現行採択対応**: HARNESS-L2/L11-005（固定L2 `product-requirements.md:56,118–121`、L11 `product-acceptance.md:25`）はticket/risk別の検証義務・oracle・expected failure・evidenceを定め、014（L2 `:379–393`、L11 `:209`）はdesign obligationと対の検証設計を扱う。OS-018（L2 `governance-requirements.md:672–680`, L11 `governance-acceptance.md:345–350`）は独立review担当を区別する。GitHub上流運用モデル `:114,136–138` は全PRのexact-HEAD独立reviewとfinding記録を定める。これらは一般PR reviewで、旧doc trigger/4軸oracleとの同値性は示されない。

**未採択候補との区別**: HARNESS-036は検証観点の完全性/local-CI同一契約の未採択候補で、doc専用reviewer・trigger・4軸oracleを扱わない。

**未回復atom / PO選択肢**: doc専用review trigger、4軸受入oracle、未実施時のgate効果。A) 専用doc-quality reviewを既存独立review責務内で定義する。B) exact-HEAD独立PR reviewを置換とし、専用reviewer/trigger/4軸条件をretireする。**推奨**: 現行の独立reviewを維持し、監査だけから専用reviewerや新fail-close gateを追加せず、doc専用価値の保持/置換をPOへ問う。

旧sourceの他行・同一assetの他identity、全source条件のcoverage、L3化、実装・実行・受入は対象外。旧runtime/test/CIは実行していない。
