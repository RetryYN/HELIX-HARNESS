---
title: "L2D-S0-01・L2D-S0-02 承認とL2D-S1-01 defer のdecision record"
decision_record_id: HDEC-L2D-S0-AND-S1-01-DEFER-2026-09-19
decision_status: recorded
recorded_at: 2026-09-19
source_repository_revision: 33f50356d28bbe472bba5ef07ecd83050dd0b1fb
authority_effect: effective_when_this_record_is_admitted_to_main
---

# L2D-S0-01・L2D-S0-02 承認とL2D-S1-01 defer のdecision record

## 人間判断

POは2026-09-19（Asia/Tokyo）の要求整理sessionで、次の判断を明示した。

> 1. S0-01 Scaffold Binding → approve
> 2. S0-02 WBS Ledger → approve
> 3. それぞれexact revision付きdecision record → L2/L11適用は別PR
> 4. S1-01 → defer

この指示を、下記3文書のexact bytesに対する判断として記録する。会話要約、GitHub状態、PR merge、CI結果、
外部監査の評価から判断を推定したものではない。

POの指示は判断単位を名前で指しており、digestを指定していない。本recordはこれを、指示の時点のmain
（`source_repository_revision`）にあった各文書のbytesへ束縛する。両S0候補は、それぞれ`caca863c1`と`6967ceef8`
以降mainで変更されていない。POが別のrevisionを指していた場合、本recordは誤りであり、新しい判断として訂正する。

## 判断対象

| Decision ID | 判断単位 | 対象 | 判断したSHA-256 | 結果 |
|---|---|---|---|---|
| `HDEC-L2D-S0-01` | `L2D-S0-01 scaffold-binding` | `docs/governance/candidates/scaffold-binding-requirements.md` | `c7e47993c2ae0ba9524b55f7ba1041026712d5f6cf281cf10c7ee812cb8c26eb` | approve |
| `HDEC-L2D-S0-02` | `L2D-S0-02 wbs-ledger` | `docs/governance/candidates/wbs-ledger-requirements.md` | `34711045caea9a6bac6fa1084b056e393593efe76099b7f124af4e17265a84f6` | approve |
| `HDEC-L2D-S1-01-DEFER-01` | `L2D-S1-01 authority-vocabulary` | `docs/governance/audits/source-rebaseline/l2d-s1-01-authority-vocabulary-human-decision-packet-v2.md` | `f2c2db07995b10ee8a384fdafc8c54b2e2bb9d4a5fc64d8057f28a8daa569c46` | defer |

3件を一つの曖昧なrevisionへまとめず、各Decision IDとfile SHA-256を維持する。`L2D-S0-01`と`L2D-S0-02`は
互いの判断を前提にしない独立の判断単位であり（[対象別L2 source採否順序](../audits/source-rebaseline/l2-source-adoption-sequence.md)）、
どちらも`L2D-S1-01`の判断を前提にしない。

## exact revision再確認

記録前に、`source_repository_revision`のGit treeと作業treeの双方から3文書を読み、SHA-256が上表と一致することを確認した。
`L2D-S0-01`候補のdigestは、仮組み`scaffold/bindings/SCF-B-0001.json`が上流として束縛しているdigestとも一致する。

## HDEC-L2D-S0-01：承認した意味

仮設束縛（Scaffold Binding）の上流要求候補を、その本文のとおり承認する。

- 正式な設計・実装・検証が未成立の間に限り、必要な役割をScaffoldで一時的に担わせる。Scaffoldは上流の要求または
  decisionとそのrevision、担う役割、守る義務、接続先、consumer、依存、境界、許可・禁止する操作を持つ
  （`SCF-HARNESS-001`／`002`）。
- Scaffoldの存在、動作、仮の検証の成功を、設計済み・実装済み・検証済み・受入済み・release可能のいずれにもしない。
  仮の検証は宣言した一時契約の範囲だけを対象とし、正式な検証と別の証拠種別として扱う（`SCF-HARNESS-003`／`004`）。
- 正式な物へ置き換えるときは、役割・義務・接続・consumer・oracle・negative caseの全件対応を確認する
  （`SCF-HARNESS-005`）。ScaffoldをPoC、Research、新しい開発style、V-modelのlayer、production Featureと区別する
  （`SCF-HARNESS-006`）。
- HELIX-OSは、Scaffold Bindingの登録、状態（有効、stale、conflict、orphan、二重binding、置換中、撤去済み）、
  仮runner／仮CIの隔離実行、正式な物への付け替え、置換確認後の撤去、残留検出を担い、Scaffoldから要求・設計・
  承認・受入を直接writeしない（`SCF-OS-001`〜`007`）。
- 責務はHARNESS（使ってよい条件、保持すべき役割と義務、仮と正式の検証の境界、無損失条件）とHELIX-OS
  （登録・実行・監視・撤去の運転）へsplitする。一つのownerへ潰さない。
- L11受入候補16項目を、要求の確認条件の候補として承認する。全件未実行のままである。

## HDEC-L2D-S0-02：承認した意味

要求からの作業分解（WBS）台帳の管理層要求候補を、その本文のとおり承認する。

- WBS台帳（作業identity、親要求revision、依存、優先度、予算、期限、停止条件、進捗、差戻し）の登録・整合・統制を
  HELIX-OS管理が所有する（`WBS-OS-001`〜`006`）。入力は採否済み要求のexact revisionだけであり、登録は要求の採否・
  承認を生成しない。親要求revisionの変更で影響する作業を`stale`にする。
- 要求からの分解と開発方式・HARNESS routeの選定は推進が、生成された作業graphの独立確認は検収が持つ
  （`WBS-OS-007`／`008`）。管理は分解を先取りしない。
- 作業単位が持つべき形の規範はHELIX-HARNESSが定め、OSはそれを台帳のschemaへ写す。HARNESSは台帳を運転せず、
  OSは規範を改変しない（`WBS-HARNESS-001`）。
- L11受入候補10項目を、要求の確認条件の候補として承認する。全件未実行のままである。

## HDEC-L2D-S1-01-DEFER-01：deferの意味

`L2D-S1-01`は採否を先送りする。承認でも却下でもない。判断packet v2は
`status: input_denominator_incomplete_not_decision_ready`であり、同packetは現時点で選べる結果を`changes_requested`と
`defer`に限っている。本判断はそのうち`defer`を選んだものである。

- packet v2と、その計上台帳・holding screenの内容を変更しない。`authority_effect: none`のままである。
- `L2D-S1-01`のL2／L11本文への適用、successor割当、次のdecision unitへの前進を行わない。
- 生存中13 source holdingのうち未評価11件の処分を進め、decision-readyへ戻ったときに改めて人間判断へ送るという
  従前の進め方を変えない。本deferはその作業を止めない。

## 採否時に判断するとされていたが、本recordで決めていないもの

両候補の本文は、次の2点を採否の時点かL2判断で決めるとしている。POの指示はこれらに触れていないため、
本recordは決めたものとして扱わず、未決として残す。L2／L11適用PRで、意味の選択を伴う場合は人間判断を要求する。

1. **`wbs-ledger`と既存候補`development-ticket-derivation`（`DTK-OS-001`〜`007`）を統合するか。**
   候補本文は両者を`partial_overlap`とし、「統合するかは採否時に判断する」としている。本recordは統合も非統合も
   決めていない。
2. **`scaffold-binding`の責務を、POが定義したシステム群のどの層に置くか。** 候補本文は、HARNESS側を開発方式の枠と
   コアにまたがる工程contractへ、OS側を管理と検収へ接続する候補とし、「この層の置き方は未決であり、L2判断で確定する」
   としている。本recordが承認したのはHARNESSとHELIX-OSの間のsplitであり、各製品内の層の置き方ではない。

## この判断で成立しないもの

- **対象別L2／L11本文への適用。** POの指示どおり別PRで行う。両候補の本文も、人間判断の後に要求PRとして
  接続するとしている。接続先の候補は、`L2D-S0-01`がHARNESS-L2-003／004／005とHELIXOS-L2-002／007／008、
  `L2D-S0-02`が`HELIXOS-L2-001`／`010`／`011`／`013`とHARNESS-L2-001／002／003である。
- **Scaffoldの正式なschema、runtime、CI、runner、DB、hook、adapterの実装・起動。** 候補本文は、採否はScaffoldを
  実装・起動する許可ではなく、それらはL3／L10から導出するとしている。
- **WBSエンジン、台帳schema、DB、GitHub連携の実装・起動と、PoCの実施。** 候補本文の停止条件は、この禁止の解除を
  `L2D-S0-02`の採否後に別PRで決めるとしている。本recordはその解除を決めていない。
- **旧ルール群の規則atomの処分。** `wbs-ledger`は`RUL-TKT-01`／`02`／`03`と`RUL-OSP-06`に主として対応づいた
  規則atom計336件（副を含めると686件）を入力に挙げている。本承認はこれらをcarryもretireもしない。規則atomは
  `MPR-SH-LEGACY-RULE-004`に保持されたままであり、処分は要否・再配置review program（RDP-001）で行う。
- **仮組み`SCF-B-0001`（Scaffold Binding lifecycle）と`SCF-B-0002`（旧ルール群の仮rulebook）の正式化。**
  両者はscaffoldのままであり、証拠種別は`scaffold`、`authority_effect: none`である。
- **両候補文書のfrontmatter更新。** 候補文書は`status: draft_candidate`、`authority_status: awaiting_human_approval`
  のまま変更しない。書き換えると承認したbytesが変わるためである。承認状態の正本は本recordである。

## 本承認で満たされる前提

`wbs-ledger`の「最初のパイロット」手順3（仮設束縛）は、「`L2D-S0-01 scaffold-binding`が人間判断で承認されるまで、
この手順へ進めない」としている。本recordの`HDEC-L2D-S0-01`がmainへ入った時点でこの前提は満たされる。
ただし手順3の実施そのものは別PRであり、前の手順の合格から次の手順の承認を生成しない。

## revision変更時の扱い

判断対象3文書のいずれかでbytesが変わった場合、その文書に対する判断を新revisionへ自動継承しない。誤記訂正を含め、
semantic diff、影響範囲、既存decisionとの関係を示した新しい判断を要求する。本record自体の追記やPR mergeによる
commit SHA変更は、上表の対象file SHA-256が不変である限り対象bytesを変えない。
