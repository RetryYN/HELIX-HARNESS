---
title: "本体先行・パック化・Web編成の方針 decision record（2026-09-26）"
decision_record_id: HDEC-CORE-FIRST-PACK-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: docs/helix-harness/sources/core-first-pack-policy-po-endorsed-2026-09-26.md
source_body_sha256: 5640a862cefdbb9f62899ccad14c3d04473d82f1bcff6d87d507b22624940fd8
source_repository_revision: 0ce6e12b9
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 本体先行・パック化・Web編成の方針（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POが方針の文を貼り付けて「この方針で」と指示した。本書はその判断の記録である。
POが示した文は[source snapshot](../../helix-harness/sources/core-first-pack-policy-po-endorsed-2026-09-26.md)に保存した。snapshotの区切り線より下が原文のbytesそのままであり、そのSHA-256は`5640a862cefdbb9f62899ccad14c3d04473d82f1bcff6d87d507b22624940fd8`である（snapshotファイル全体のSHA-256は`7df1d88766697afca7cbccbff2c84277905f51a42d30cf1cfb390e44d29e64e7`）。
POの文と指示はそのまま扱い、AIの整理と区別する。本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## 経緯

同じsessionで、POは全体要求の統合起草の指示（本体とWeb製品群の要求を新しい構成で書き直し、受入と揃える）を貼り付けた。AIは、Webの要求をL2・L11の本文へ入れると2026-09-24のPO判断（Web系をVisionレベルの材料へ分類）と2026-09-26のPO判断（Web製品群の原案を`candidates/`に置く）を変えることになると指摘し、案A（Webは`candidates/`の中で候補として書く）と案B（先にPOがWebを要求層へ戻すか決める）を示した。POは本方針を示して「この方針で」と答えた。

## POが決めたこと

原文から読み取れる決定を、原文の言葉で並べる。

1. **順序**：本体で機能を成立させ、検証済みのパックを作り、それをWeb版の製品として編成する。進め方は「本体の要求・受入を機能単位で揃える → 構築・検証 → 本体や対象製品で実証 → 版付きでパック化 → Web製品へ組み込み、Web固有の接続・受入を確認する」である。
2. **パックの単位**：関数やフォルダごとではなく、入力・出力・必要な依存・検証範囲が明確で、交換・更新できる能力のまとまりとする。小さな部品を検証し、組み合わせて7製品のリリース単位を成立させる。全部を一つの巨大パックへ戻さない。
3. **Web側との分離**：Web版はその能力をバックグラウンドで使い、ノード編集、案件操作、顧客環境への接続、顧客案件の運転を付ける。エンジンは共通でも、Web側の案件状態・権限・提供版は別に持つ。パックを利用することは、本体の稼働DBや鍵、内部統制をそのまま共有することではない。
4. **本体を作る際に押さえる条件**：画面や特定の作業環境から切り離して呼べる入出力、版・依存、権限の受渡し、進行・結果・証拠、停止・再開。Webの詳細設計を先にするのではなく、後でWebから利用できなくなる作り方を避けるための条件である。
5. **Web原案の扱い**：今あるWeb原案は将来の利用条件として保持し、具体的な要求化は、使うパックと提供範囲が見えた製品から進める。構想を縮めず、欲しいWeb能力に足りない部分は本体の後続要求へ戻す。
6. **次の主作業**：Web要求の全面展開ではなく、本体の機能単位の要求・受入と、パックとして成立する境界を揃える。Web側の未完成を、本体の構築を止める理由にしない。

先の問い（案A／案B）への答えは、Webの原案を`candidates/`のまま将来の利用条件として保持し、L2・L11の本文へ入れないことである。2026-09-24と2026-09-26のWebの分類・配置の判断は変えない。

## AIの整理

### 既存の上流との関係

- Concept（「HELIX-HARNESS」の節）は、サービス①〜⑦を単独で成立・利用・リリースできる単位とし、要求を単体・接続・構成体に分け、7製品すべてを1.0に含める。本方針は、この独立性を構築の順序に使うものであり、Conceptの意味を変えない。
- HARNESS L1の冒頭は「個別サービスと接続の受入差分は要求対応表へ送る」とし、サービス別の要求をL2へ送っている。現行のHARNESS L2（HARNESS-L2-001〜009）はサービスを横断する観点で並んでおり、サービスごとの単体要求とパックの境界が欠けている。本方針の次の主作業はこの欠落を埋めることである。
- 「パック」はConceptの版の表（1.x「実案件でpackageと並行開発を磨く」）のpackageと同じ系統の語として扱う。Conceptに「パック」の定義はなく、本記録はConceptを改訂しない。語の定義は、本方針に従ってHARNESS L2の候補本文に置く。

### 旧HELIXとの対応

旧source：`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md`（`LEGACY-ASSET-201EED9C5D6D2FF4D41B`、SHA-256 `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20`、台帳上`unresolved`）の旧FRS v0.2候補。現行HARNESS L2の「提供構成と再現性の条件」がFRS-BR-001／002／003／004／005／007／009の意味候補を既に保持している。

| 旧FRS | 保持する点 | 変更する点 |
|---|---|---|
| FRS-BR-001「単一または密結合したbehavior contractを`Functional Release Slice`として識別し、source authority、依存、受入、artifact、rollbackの証拠を独立して確認したうえで昇格」 | 小さな能力のまとまりを、依存・受入・artifact・復旧の証拠とともに独立して検証・昇格する | 呼び名をパックとし、所有先を旧Moduleからサービス①〜⑦（リリース単位）と部品・コアにする |
| FRS-BR-002「収載するSliceと除外するSliceをexact setで確認」「未適格なSliceを…暗黙に含めてはならない」 | 上位の構成へ収める・除くを明示し、未適格なものを暗黙に含めない | 上位の構成を旧Bundleからリリース単位、統合したHELIX-HARNESS、Web製品の編成にする |
| FRS-BR-003「Slice、Module、Bundleのchannelとversionを別々に追跡し、Sliceの昇格だけでModuleやBundleを自動昇格させず」 | パック、リリース単位、製品の版と成熟度を別に持つ | 旧channel enumを採らない |
| FRS-BR-005「同一source／registry／profileから同一Slice manifestとartifactを再生成し、clean consumerで検証し、失敗時に直前のqualified Sliceまたは明示されたreplacementへ戻せ」 | 再現性と、直前の適格な版への戻し | なし |
| FRS-BR-009「Lite／Fullは検収済みSliceの組合せとし、その統合・更新・rollback・L12運用検証を個別Sliceの成功とは別に確認」 | 組合せの統合・更新・復旧・運用検証を個別の成功と分ける | Lite／Fullの構成名を採らない |

旧FRSの「関数・フォルダ」への言及はない。POの「関数やフォルダごとではなく」は、旧FRSの「単一または密結合したbehavior contract」を単位とする考え方と同じ向きである。
Web側から呼べる条件（決定4）に対応する旧記述は、旧FRSと現行Conceptの「1.0から入れる土台」（接続契約と版、隔離の単位、構成版の固定と切戻し、ログと証拠）である。画面・作業環境から切り離すという言い方そのものは旧FRSにない。POの判断による追加として扱う。

## 反映

- [HARNESS L2](../../helix-harness/L2-requirements/product-requirements.md)の末尾に「リリース単位の要求とパック境界」の節を追加し、HARNESS-L2-010〜021を候補として置く。既存の要求本文と行位置は変えない。
- [HARNESS L11](../../helix-harness/L11-acceptance/product-acceptance.md)の末尾に対の受入を置く。
- Webの原案（`helix-web/docs/`の`candidates/`）は変えない。
- HELIX-OS、BRAIN、LABO、INTELLIGENCE、SECURITY、INFRASTRUCTURE、CONNECTの機能単位の要求とパック境界は、後続のPRで機構ごとに扱う。

## 人の判断が残る点

- HARNESS L1の対象revision確認（2026-09-24から継続）。今回の候補はL1の本文を変えず、既存のHARNESS-L1-005／007／008を親とする。
- 候補HARNESS-L2-010〜021の採否。本記録と候補本文の存在から採択・実装許可を生成しない。
