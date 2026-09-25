---
title: "HELIX-BRAIN L1要求アイデアのPO提示と判断 decision record（2026-09-26）"
decision_record_id: HDEC-BRAIN-L1-IDEA-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: docs/helix-brain/sources/brain-l1-idea-po-original-2026-09-26.md
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-BRAIN L1要求アイデアのPO提示と判断（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POがHELIX-BRAINの企画（L1）の要求アイデアを示した。本書はその会話の記録である。
POの発言はそのまま引用し、AIの整理と区別する。本文の原文は[source snapshot](../../helix-brain/sources/brain-l1-idea-po-original-2026-09-26.md)に保存した。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## 経緯

POは、各機構のCore Engineについての外部の評価を共有した。AIは、BRAIN・INTELLIGENCE・SECURITYのCoreの本文をPOが書くかAIが下書きするかを聞いた。
POは、BRAINの本文を示し、「こんな感じのアイディアで」と述べた。

## ビジュアルデザインの領域の版

原文は、BRAIN-L1-006でビジュアルデザインを独立した設計知識の領域とする。一方、末尾の「初期Domain候補」（1.0でschema上扱えるようにする領域）の8つには、Visual DesignとUXが入っていない。
AIが、ビジュアルデザインの領域をどの版から扱うかを聞いたところ、POは「1.0から扱う」を選んだ。

AIの整理：1.0で扱える初期の領域は、原文の8つにVisual DesignとUX／Interactionを加えたものとする。

## Visual Design HARNESSとの連携

続けて、POは次のように述べた。

- 「Designハーネスと連携する方向性で。」
- 「ここでいうDesignハーネスは設計じゃなくてビジュアルデザインのデザインな。」
- 「ビジュアルデザインHARNESSと書き直してもいい。」
- 「英語な。それさっき命名ルールとして書いたよね？」

AIは旧HELIXを確かめた。
- 旧v1.3は、「ビジュアルDesign HARNESSはUI/UXの生成・評価を担う」とした（`docs/governance/requirements-source/helix-requirements_v1.3.md:67`）。
- 旧§4.5「AI Vision Design HARNESSエンジン」（同:265-275）は、Experience Contract、UI Contract、Frontend Contractで、利用者の体験意図を画面とfrontend実装へ連続させた。
- 旧§4.9「統合Design HARNESS」（同:379-393）は、System Design（設計）まで含めてDesign Registryへ接続していた。POの言うVisual Design HARNESSはビジュアルデザインのものであり、設計の側は含まない。
- 現行では、旧Design HARNESSの内容はHELIX-HARNESSの中に置かれている（[要求v1.3の対象crosswalk](../audits/source-rebaseline/requirements-v1.3-target-crosswalk.md):15、HARNESS-L2-003／004／005）。

AIの整理：
- 名前は、下の「名前の表記の線引き」により、Visual Design HARNESSと書く。旧HELIXの呼び名はDesign HARNESS（旧v1.3:67では「ビジュアルDesign HARNESS」）である。
- ここでのVisual Design HARNESSは、ビジュアルデザイン（画面の見た目と体験）の生成と評価を担うものであり、設計（アーキテクチャや詳細設計）のHARNESSではない。旧v1.3:67の「ビジュアルDesign HARNESS」と§4.5に当たる。
- BRAINは、再利用できるビジュアルデザインとUXの知識（Pattern、Design Unit、Part）を持つ。
- Visual Design HARNESSは、それを使って画面の見た目と体験を生成・評価し、prototypeを担う。
- 2つは接続の要求でつなぐ。接続にはコネクタを入れる（LABOの判断記録の「エンジンどうしの接続」）。
- 流れは次のとおりとする。
  - BRAINからVisual Design HARNESSへ、使えるPattern・Unit・Part、適用の条件、反例を渡す。
  - Visual Design HARNESSでの利用の結果と評価は、LABOを経てBRAINへ戻る。Visual Design HARNESSから直接BRAINの汎用知識へ昇格させない。
- ビジュアルデザインのうち、製品をまたぐ再利用の構造はBRAINが持つ。製品固有のscreen、flow、design token、Visual Identityは、各製品のHELIX-HARNESS-COREが持つ。

## 名前の表記の線引き

AIは、初めに英語の表記を「Visual design HARNESS」とした。これは、[LABOの判断記録](labo-core-engine-po-decisions-2026-09-26.md)（PR #2143）の名前の表記のPO指示「そのほかは1文字目大文字ほか小文字」によるものだった。
POが「どっちがかっこいい？ｗ」と聞いた。AIは、単語ごとに頭を大文字にするほうが名前らしく見えると答え、次の3段の線引きを示した。POは「じゃあそれで」と答えた。

- 全部大文字：コアシステムの名前（HELIX-HARNESS、HELIX-HARNESS-CORE、HELIX-OS、HELIX-BRAIN、HELIX-LABO、HELIX-INTELLIGENCE、HELIX-SECURITY、HELIX-CONNECT。名前の中のHARNESS等の部分を含む）。
- 単語ごとに頭を大文字：仕組み、領域、部品の名前（例：Visual Design HARNESS、Software Architecture、Design Unit）。
- 1文字目だけを大文字：ticketと状態の名前（例：Decide、Design-refactor、Add-feature、Provisional）。

AIの整理：
- LABOの判断記録の「そのほかは1文字目大文字ほか小文字」は、ticketと状態の名前についての規則として保つ。
- 仕組み、領域、部品の名前には、単語ごとに頭を大文字にする段を加える。
- 原文の領域名（Visual Design、Software Architecture等）は、この線引きにそのまま合う。

## 反映先

- [HELIX-BRAINのL1企画案](../../helix-brain/L1-planning/brain-intent.md)を新しく作る。
- [BRAINの候補](../../helix-brain/candidates/design-template-system-requirements.md)のうちBRAINが持つ項目（DST-HARNESS-002、005、DST-OS-001の汎用templateの版と状態）の親を、L1企画案の要求へ付け替える案を書く。
