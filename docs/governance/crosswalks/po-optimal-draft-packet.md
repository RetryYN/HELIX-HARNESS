# PO最適ドラフト 統合要求案パッケージ

親：[HELIX Concept](../../concept/helix-concept.md)。本書は、2026-09-24と2026-09-25のPO判断を要求・受入・候補の本文へ写した結果をまとめ、
POに確認してもらうrevisionと、本当に残る判断だけを示す。本書は採否・承認・Issue closeを記録しない。POの回答は別のdecision recordに記録し、本書は判断を求めた時点の一覧として残す。

## 本書の方針

- 判断記録ですでに決まった内容は、AI側で本文へ写した。POへ聞き直さない。
- 残る判断は、判断記録にも旧HELIXにも答えがない意味の問題だけとした。
- 研究用の検査（`scaffold/**/validate.py`）は、全件を合格させることを目標にしない。本PRが変えた文書を固定している検査だけを付け直す。

2026-09-25、POは外部監査の評価を共有し、次のように述べた（要旨を崩さずに引用する）。
- 「もう『調査を深める』より『決まった構想を要求として仕上げる』段階です」
- 「これは追加研究ではなく、AI側で整合させる作業です。決まったことまで再び帝王様へ質問してはいけません」
- 「研究検査46件の失敗を全部直してから進む必要もありません。過去の前提を保持した検査と現行方針が食い違うものが含まれるため、次の判断に使う証拠を選び、その範囲の有効性を確認すればよいです。全部を緑にすること自体を目標にすると、また遠回りします」
- 「次の成果は資料の追加件数ではなく、PO判断を反映したL2／L11が揃い、本当に残った判断だけを提示できる統合要求案であるべきです」

## 本PRで写した決定

| 何を | どこへ | 根拠 |
|---|---|---|
| DiscoveryとPoCの分離、DECIDEの独立、Researchから決定を外すこと | HARNESS L2の工程規則表の旧Discovery／PoC、S4、Research・ADRの3行。HARNESS L11の対応シナリオ | [2026-09-24判断](../decisions/concept-requirement-po-decisions-2026-09-24.md)のticket節、旧`docs/process/modes/discovery.md:47-51`（S0〜S4とS4の`decision_outcome`）、旧`research.md:32-60`（ADRの接続先L1／L4） |
| L2.5（PrototypeとPoCを別に判定）、リリースカンバン、動的CI、サービス①〜⑦の単位での導入、1.0土台7項目、1次・2次の要求形成、Backflow ticket | HARNESS L11の主表と確認シナリオ | 2026-09-24判断の「要求ごとの判断」HARNESS表。L2はすでに反映済みで、L11だけが従来の条件のままだった |
| リリースカンバン、Workerの4機構分担、改善の登録とLABOの評価の分担、サービス単位の導入、共通記録形式（BASE-01）、動的CI、動的ワークフロー、計画と実行の境目 | HELIX-OS L11の主表 | 2026-09-24判断の「要求ごとの判断」OS表。L2はすでに反映済みだった |
| 設計template systemの担当の読み替え | [BRAINの候補](../../helix-brain/candidates/design-template-system-requirements.md)に担当の対応表を追加。HARNESS L2とOS L2の該当段落 | Conceptの機構表（BRAINは汎用の構造、ヘリックスコアは製品固有の意味と設計、OSの管理は登録と版の管理、LABOは評価）、[2026-09-25のPO指示](../decisions/brain-helix-core-po-intent-2026-09-25.md) |
| 限定修復とOSの推進・検収の接点 | [Intelligenceの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md)に接点の表を追加 | 2026-09-25判断（検出から実行までIntelligence）、Conceptの機構表（認可と隔離はSecurity、実行はRunner／Sandbox、検収はOS） |
| 退役したDTKへの参照の案内 | [OSのWBS候補](../../helix-os/candidates/wbs-ledger-requirements.md)の冒頭 | 2026-09-24判断（DTKは「いらない」） |

旧HELIXとの差分は、それぞれの行に旧sourceと保持点を残した。旧S4の`decision_outcome`（confirmed／rejected／pivot）は、DECIDEの合流先（採用→Forward、不採用→記録して終了、方針変更→次の計画）と同じ3つに対応する。
要求の意味に関わる裁定を人が持つ点は、旧S4（POが記録）のまま保つ。旧Researchは決定（ADR）まで含んでいたが、PO判断で決定をDECIDEへ移した。

本PRが変えた文書を固定していた研究用の検査13本（PHCAP-04/05、06、07、08/09、10/11、12/13、14、16、17、18、19、20と`rdp001-outside67-boundary-followup-074`）は、行位置・SHAの更新、または同じ節の後継文への再固定で付け直した。検査条件と意味の欄は変えていない。
ただし、PHCAP-06（設計）の研究は、設計template system候補を「HARNESSの直接候補」「OSのtemplateのlifecycle」として記録している。本PRの担当の読み替えで、候補の機構はBRAINになり、OSの担当は各製品での使用記録の登録に狭まった。本文は変わらないため参照は付け直したが、この記録の意味は現行の担当と食い違う。この研究は統合要求案の判断に使わないため、意味の食い違いとしてここに記録するにとどめる。

ticket節の条件への要求IDの付与と親要求への接続は、AI側の作業としてCodexの別PRで行う。本PRはticket節の本文を変えない。

## POに確認してもらうrevision

判断記録が「追記・分割・書換え後のrevisionはPO最適ドラフトPRで確認する」とした文書と、本PRで書き換えたL2・L11である。
SHA-256は本文全体のもの。PRのmerge前に内容が変わった場合は、変わった後のSHAで確認し直す。

| 文書 | 確認すること | 前に判断されたrevision |
|---|---|---|
| [HARNESS L1](../../helix-harness/L1-planning/product-intent.md) | 1.0土台7項目の追記 | `ece3e268…4e96`の内容を採用し、追記を指示（2026-09-24） |
| [HELIX-OS L1](../../helix-os/L1-planning/system-intent.md) | HELIXOS-L1-011と012をLABOの候補への案内行にした2行 | `ffbafa47…51bc`を採用（2026-09-24）。2行の移管は2026-09-25判断 |
| [5大目標](../../concept/helix-five-goals.md) | 関与表を参照用に縮約した本文 | `e9668e77…2f29`の内容を採用し、縮約を指示（2026-09-24） |
| [HARNESSのWBS候補](../../helix-harness/candidates/wbs-ledger-requirements.md)と[OSのWBS候補](../../helix-os/candidates/wbs-ledger-requirements.md) | 1文書を機構ごとに分けたこと（要求と受入の行の文言は変えていない） | `34711045…84f6`を承認（2026-09-19、`HDEC-L2D-S0-02`） |
| [HARNESS L2](../../helix-harness/L2-requirements/product-requirements.md)と[L11](../../helix-harness/L11-acceptance/product-acceptance.md) | 本PRで写した決定 | 要求ごとの判断（2026-09-24） |
| [HELIX-OS L2](../../helix-os/L2-requirements/governance-requirements.md)と[L11](../../helix-os/L11-acceptance/governance-acceptance.md) | 本PRで写した決定 | 要求ごとの判断（2026-09-24） |

## 本当に残る判断

どれも、判断記録にも旧HELIXにも答えがない。答えは、該当する機構の企画（L1）や、1.0の受入基準の入力になる。

### Version 1に含めるサービス

Conceptは、HARNESSをサービス①〜⑦（画面プロト／PoC、要件定義、設計、開発、リファクタリング、リリース、運用保守）の統合とし、各サービスは単独で成立・利用・リリースできるとしている。
一方、「Version 1に含めるリリース単位は、1.0の受入基準を決めるときに定める」とも書いている。
どのサービスを1.0で成り立たせたいか、そのサービスごとに何ができれば1.0と言えるかが決まらないと、HARNESS-L2-007の受入（1.0の完成条件）を具体にできない。
本PRのL11は「定まる前に全サービス完成を必須としない」とだけ書いた。

### BRAINが稼働中に担う役割

Conceptは、BRAINに2つの役割を書いている。
- 設計テンプレ等から汎用の構造（設計パターン、設計ユニット・パーツ）を取り出して増やす役割。2026-09-25に追加した。
- 稼働中の理解、計画、予測、診断、レビュー、配置案。以前から書かれていた。

後者を、BRAINに残すか、IntelligenceやOSへ移すかが決まっていない。
これにより、Workerの割当て案（HELIXOS-L2-004でBRAINの担当としている）と、設計templateの選定候補を誰が作るか（BRAINの候補のDST-OS-002）が決まる。

### 機構どうしをつなぐコネクタの担当

ヘリックスコアとBRAIN、BRAINとIntelligenceをコネクタで接続する（1.0土台「後から加わる機構の受け口」）。
このコネクタを、機構どうしの接続として新しく定めるか、外部接続を担うHELIX-CONNECTに持たせるかが決まっていない。

### 「原本」と「正本」

POは「原本と正本の関係」と発言した。AIは「原本＝HELIX側が持つ意味と構造、正本＝利用者へ渡す成果物」と理解したが、POは確認していない。
Conceptには「利用者が作ったシステムの原本はHELIXが保有する。原本は後で解体してパターンだけを取り込み、破棄する」とある。この「原本」が何を指すかで、データの利用区分（1.0土台）の要求が変わる。

### Intelligenceの各botを動かし始める時期

BRAINとIntelligenceは1.0からコネクタで接続できるようにする（PO）。バグbotは、版ではなく、ログがたまって機械で判定できるようになった時点で発行する（PO）。
ヘルプbot、クローラー、全体監査をいつから動かすかが決まっていない。Conceptの版表では、Intelligenceは3.0で加わるとしている。

### LABOの技術調査とIntelligenceのクローラーの関係

技術調査はLABOに置いた（2026-09-25）。一方、Intelligenceはクローラーを発行する（2026-09-25）。
2026-09-24には、技術進化への追従をBRAIN／LABOが担うとした。
クローラーが集めたものをLABOが評価・研究するのか、両者は別の目的の仕組みなのかが決まっていない。

### BRAINが「学習する」の意味と時期

POは「HELIX-BRAINは本来、こういう設計テンプレとかを学習して意味から構造を取り出す仕組みにしたい」と述べた。
ここでの学習が、モデルの調整を指すのか、構造（パターン、ユニット、パーツ）の蓄積を指すのか、それをどの版から行うのかが決まっていない。

### 対応する実行環境をLinuxに限るか（検討中）

2026-09-25、POは「対応はLinuxだけにしようかなと思ってる」と述べた。範囲を確認したところ、HELIX自身が動く環境だけでなく、外部利用者がHARNESSを導入して使う環境も含むと答えた。
今の時点では決定とせず、検討中として置くと答えた。
- 旧HELIXは、Linuxを正式な検査の基準とし、Windows・macOSでは同じ部品が動くかを別に確かめていた（[要件v1.3](../requirements-source/helix-requirements_v1.3.md):575、受入`HR-AC-HYB-008-06`）。
- Linuxに限ると、この互換の確認を外すことになり、旧要求の意味の変更になる。
- WindowsではWSL（Windowsの中で動くLinux）で使う形になる。Conceptの1.xは「利用者のPC・WSL・VPS」を操作対象としている。
- HARNESSで作る製品の動作環境は、この話に含まない。Conceptは、HARNESSが対象製品の言語や画面の方式に依存しないとしている。

## AI側で進めること（POに聞かない）

- ticket節の条件への要求IDの付与、親要求への接続、対のL11（Codexの別PR）。
- 研究用の検査は、次の判断に使うものだけを今の要求へ対応させる。使わないものは、記録を保持したうえで扱いを決める（Codexの調査PR）。
- LABO・BRAIN・Intelligenceの企画（L1）は、上の残る判断の答えを受けて起こす。候補の採否はL1の後に行う。
