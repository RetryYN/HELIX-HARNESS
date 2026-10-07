---
title: "HELIX自身の段階リリースを内部デプロイとして扱い、自己開発に使った段階を記録するPO方針 decision record（2026-10-07）"
decision_record_id: HDEC-STAGE-RELEASE-INTERNAL-DEPLOYMENT-2026-10-07
decision_status: recorded
decider_role: PO
decided_at: 2026-10-07
recorded_at: 2026-10-07
source: 2026-10-07（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX自身の段階リリースを内部デプロイとして扱う（2026-10-07）

## 記録の範囲

本書は、[2026-09-27の段階リリースの判断記録](stage-release-po-decisions-2026-09-27.md)（HDEC-STAGE-RELEASE-2026-09-27、HELIXOS-L2-014。2026-09-28の[OS要求の判断記録](helix-os-requirements-po-decision-2026-09-28.md)で採択）への追補である。元の記録は書き換えない。
POの発言はそのまま引用し、AIの整理と区別する。AIの整理は、PR上でPO本人の確定を受けてからmainへ入れる。
本書から、L2の変更、要件（L3）の承認、実装許可、最初の段階リリース（v0.1）の宣言、release、tag、cutover、外部公開、Issue closeを生成しない。

## POの発言

1. 「自分にハーネスのバージョン付与して、この開発からはバージョンいくつで自己開発してるみたいなのをやったほうがいいかもよ。」
2. AIが、HELIXOS-L2-014に段階リリース（v0.1、v0.2…、1.0到達判定を通った構成をv1.0）が採択済みであること、まだ段階リリースが一つもないことを示した後：「内部デプロイみたいな扱い。」
3. 「これも部品やパーツ、システム単位での内部デプロイ構成があるといいかもな。コンパイラのミニ版の自己適応バージョン？に近いかも。」

## 方針（AIの整理。PO本人の確定を要する）

### 1. 段階リリースを内部デプロイする

- 段階リリース（v0.x）は、HELIX自身の開発環境へ内部デプロイして使う。Conceptの原則9「releaseとdeploymentを分ける」に従い、段階リリースの成立（release）と、それを自己開発に使い始めること（内部デプロイ）を別の事象として記録する。
- 内部デプロイは、元の判断記録の決定7「安定した段階で次の段階を開発し、新しい構成を検証してから乗り換える」の「乗り換え」にあたる。前の段階は切戻し先として残す。
- 内部デプロイは外部公開ではない。外部公開やWeb提供は、元の記録どおり段階リリースとは別に判断する。
- HELIX自身は、内部デプロイの通常の利用者として扱う。自己開発のためだけの例外の契約や、手で直した記録を作らない。
- 内部デプロイの切替は、repositoryの現行規則（AGENTS.md「現在の境界」）にいうcutoverにあたる。対象の段階と作用を明示したPOの許可を要する。

### 2. 自己開発に使った段階を記録する

- 作業の記録（PR、判断記録、review）に、その作業に使った内部デプロイ中の段階を記す。これは、Conceptの「1.0から入れる土台」の「ログと証拠」にある「どの要求と構成の版で」を、HELIX自身の開発に当てはめたものである。
- 段階ごとの成果と退行を、後から比べられるようにすることが目的である。

### 3. 現在の状態

- 現時点で段階リリースは一つもない。現在の開発は、Claude・Codexと`scaffold/`の仮組み（review-handoffの通知箱、scfctl、govcheck等）で行っている。
- この状態を「**v0.1前（scaffold運転）**」と呼ぶ。scaffoldは段階リリースではないため、v0.xと呼ばない（[Scaffold Bindingの要求候補](../candidates/scaffold-binding-requirements.md) SCF-HARNESS-006。Scaffoldとreleaseを区別する）。
- v0.1は、HELIXOS-L2-014の段階リリースの識別子である。正式なパックから組み、狭い範囲でも「要求の確認→作業→検証→結果の記録」が一周する構成が成立した時点で、段階リリースv0.1が成立する（release）。
- v0.1を自己開発に使い始めること（内部デプロイ）は、release とは別の事象である。元の記録の決定7の「乗り換え」にあたり、対象と作用を明示したPOの許可を要する（1.）。release済みで内部デプロイ前のv0.1もありうる。
- 作業の記録に記す「使った段階」（2.）は、その時点で内部デプロイ中の段階である。v0.1がreleaseされても、内部デプロイするまでは「v0.1前（scaffold運転）」と記す。

### 4. 内部デプロイしないもの

- 検証されていない段階は内部デプロイしない。
- 内部利用に限る構成にも、owner、理由、再評価の条件を付ける。
- 案件の実data、秘密情報、資格情報は段階に含めない（HELIXOS-L2-014、元の記録の決定6）。

### 5. 内部デプロイ構成の単位と導出

- 内部デプロイ構成は、部品（パック。unit）、接続（connection）、システム（composite。段階全体）の単位で持つ。単位の区別は、既存のunit／connection／compositeの種別（HARNESS-L2-027／028／029等）に従う。
- 各単位は、それぞれの版と検証の証拠を持つ。段階の記録には、段階の識別子に加えて、含む部品と接続の版を記す（HELIXOS-L2-014「一組として保存するもの」）。
- 自己開発に使った段階の記録（2.）も、段階の識別子と、作業が触れた部品・接続の版を記す。
- 内部デプロイ構成は、要求から段階構成（パックの集合、依存と安全依存の閉包、一周する経路、できないこと）を導く**HELIXOS-L2-026**（2026-09-28採択、`version_target: 1.0の構築過程から`）で導く。これは、[Development Compilerの判断](https://github.com/RetryYN/HELIX-HARNESS/pull/2650)でいう1.0の部品コンパイラを、HELIX自身の内部デプロイ構成へ当てはめたミニ版の自己適用にあたる（POの発言3）。
- 部品を一つ更新する場合も、その部品を差し替えた新しい段階として組み、検証してから内部デプロイする（HELIXOS-L2-014「次の段階ではパックを追加・更新する」）。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md` OPS-FR-006／OPS-R-12（162〜170行） | HELIX自身を通常のconsumerとして、Release→Deploymentを実証する。self-host専用の例外contract、手編集receiptを作らない | 対象を旧Module／Bundleから、HELIXOS-L2-014の段階リリースへ移す |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md` HWG-R06（48行）、`world-governance-acceptance.md` HWG-AC-07（21行） | 内部利用に限る構成にもowner・理由・再評価条件を付ける。未検証のものをstableへ混ぜない | なし |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md` FRS-BR-008（61行） | 正式配布の前から、必要な検証を保ったまま内部で使う（元の記録で保持済み） | なし |

新しく加わるのは、次の4点である。いずれもPOの発言1〜3による。
- 内部デプロイという呼び方
- 作業の記録に使った段階を記すこと
- 現在の状態を「v0.1前（scaffold運転）」と呼ぶこと
- 内部デプロイ構成を部品・接続・システムの単位で持ち、HELIXOS-L2-026で導くこと

## POへの問い（未決）

- 部品や接続を、段階を組み直さずに単独で内部デプロイしてよいか。現行のHELIXOS-L2-014は段階（一組の構成）を単位とし、部品の更新も新しい段階として扱う。単独のデプロイを許すと、L2-014の意味の変更にあたる。本書では、段階を単位とする現行の扱いに従う。

## 確定後に続く作業（本書では行わない）

- [GitHub上流運用モデル](../github-upstream-operating-model.md)に、PR本文と判断記録へ「開発に使った段階」を記す運用を足すか、POの確定を受けて判断する。
- HELIXOS-L2-014の本文に「内部デプロイ」の語を足すかは、L2の意味の変更にあたるかを確かめてから、別に扱う。

## 本書から生成しないもの

L2の変更、L3の承認、実装許可、v0.1の宣言、release、tag、cutover、外部公開、Issue close。
