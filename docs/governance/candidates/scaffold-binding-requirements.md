---
title: "仮設束縛（Scaffold Binding）の上流要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-18
updated: 2026-09-18
product_targets:
  - HELIX-HARNESS
  - HELIX-OS
derived_from:
  - docs/concept/helix-concept-v4.1.md
  - docs/helix-harness/L1-planning/product-intent.md
  - docs/helix-os/L1-planning/system-intent.md
source_po_statements:
  - 2026-09-18 PO発言（本書「PO発言」節に逐語記録）
related_projection:
  - "GitHub Issue #1847（作業projection。要求正本ではない）"
---

# 仮設束縛（Scaffold Binding）の上流要求候補

## これは何か

建物を建てるとき、先に鉄パイプで足場を組む。足場は建物ではないが、建物が立つまで作業と接続を支え、
建物が立ったら外す。HELIXでも、正式な設計・実装・CIがまだ無い間に、必要な役割を仮の物で支えたい。

本書は、その「仮の物」を管理するための要求候補である。仮の物を`Scaffold`、仮の物が「何の役割を、
何の代わりに、いつまで担うか」を記録した束縛を`Scaffold Binding`と呼ぶ。

要点は3つである。

1. 仮の物は、担っている役割と、置き換わる先を必ず持つ。役割の分からない仮の物を置かない。
   ここでいう置き換わる先は「正式な物が担うべき役割」であり、使い始める前に特定する。
   その役割を実現する具体的な正式artifactは、後で確定してよい。
2. 仮の物が動いても、正式な設計・実装・検証・受入が成立したことにしない。
3. 正式な物ができたら、役割・接続・検査がすべて移ったことを確認してから仮の物を外す。

本候補は要求整理だけを行う。schema、runtime、仮CI、runner、DB、hook、adapterを実装・起動しない。

## PO発言

2026-09-18、POは次のとおり述べた。逐語で記録する。

> 本線はまだ仮ワイヤー（イシュー1847）の機構要求を導入して進めたい。※これは建物立てるときに鉄パイプを組んで足場を作ることで本実装と組み替える仕組み。

「イシュー1847」は作業projectionであり、要求の正本ではない。同Issueが引用するPOの問題意識（要求整理で
`source_holding`やproduct routingへ一時束縛して意味を落とさない構造を、設計・実装側にも拡張したい）を、
本書の要求候補の入力とする。Issueの本文、状態、labelから要求の採否・承認を生成しない。

## 責務境界

| 対象 | 所有する責務 | 所有しない責務 |
|---|---|---|
| HELIX-HARNESS | Scaffoldを使ってよい条件、Scaffoldが保持すべき役割と義務、仮の検証と正式な検証の意味の境界、正式な物へ移すときの無損失条件 | Scaffoldの登録・実行・監視・撤去の運転 |
| HELIX-OS | Scaffold Bindingの登録、revision、owner、artifact、consumer、状態、stale、証拠、置換・撤去のlifecycle。仮runner／仮CIの隔離実行と観測 | 要求意味、設計の採否、人間承認、利用者受入の代行 |
| 対象プロダクト | 自身の要求、正式な設計・実装・検証 | HARNESS共通契約やOS運転の別正本 |

HARNESSの規範とOSの運転を一つのownerへ潰さない。POが定義したシステム群では、HARNESS側は開発方式の枠とコアに
またがる工程contract、OS側は管理（登録とlifecycle）と検収（仮の検証と正式な検証の分離）に接続する候補である。
この層の置き方は未決であり、L2判断で確定する。

## HARNESSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| SCF-HARNESS-001 | 正式な設計・実装・検証が未成立の間に限り、必要な役割をScaffoldで一時的に担わせる条件を確認できる | Scaffoldを置く理由、上流の要求またはdecisionとそのrevision、正式な物が未成立である事実が分かる。上流を持たないScaffoldを置けない |
| SCF-HARNESS-002 | 各Scaffoldが、担う役割（role）、守る義務（obligations）、接続先、consumer、依存、境界、許可する操作と禁止する操作を持つ | 仮のcodeや設定だけが存在し、何のためにあるか分からない状態を欠落として識別できる。仮のcodeそのものを正本にしない |
| SCF-HARNESS-003 | Scaffoldの存在、動作、仮の検証の成功を、設計済み・実装済み・検証済み・受入済み・release可能のいずれにもしない | 仮実装だけがある要求を`implemented`／`verified`と表示しない。Scaffoldの検証成功からL10／L11／L12の成立を生成しない |
| SCF-HARNESS-004 | 仮の検証は、当該Scaffoldが宣言した一時契約の範囲だけを確認対象とし、正式な検証と別の証拠種別として扱う | 仮のschema／interface整合、決定的な振る舞い、stub／adapter接続、source revisionとstaleの検出、negative case、禁止writeとscope越境だけを対象にでき、正式CI profileへ暗黙に昇格しない |
| SCF-HARNESS-005 | 正式な物へ置き換えるとき、Scaffoldが保持していた役割・義務・接続・consumer・oracle・negative caseが、正式な成果物へ全件対応したことを確認できる | 未移管の役割、接続先を失ったconsumer、二重owner、二重writer、二重CIが1件でもあれば置換完了にしない。oracleを外す場合は理由付きの置換を要する |
| SCF-HARNESS-006 | ScaffoldをPoC、Research、新しい開発style、V-modelのlayer、production Featureと区別する | Researchは情報と比較証拠を得る作業、PoCは成立性の仮説を検証するticket、Scaffoldは正式な物が未成立の間の役割と接続を保持する一時構造として、別identityで扱える。PoC／Researchの成果をScaffoldへ接続できるが、同一視しない |

## HELIX-OSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| SCF-OS-001 | Scaffold Bindingを、安定したidentity、対象productと責務owner候補、上流sourceとrevision、role、obligations、接続、仮artifactへの参照、置換先候補または未決状態とともに登録できる | どの仮artifactがどの役割を、どの上流revisionに対して担っているかを一覧できる。置換先の役割が未特定のBindingは登録だけを許し、有効にしない。置換先の役割が特定済みで、具体的な正式artifactだけが未決のBindingは有効にできる |
| SCF-OS-002 | Scaffold Bindingの状態を、少なくとも有効、stale、conflict、orphan、二重binding、置換中、撤去済みで区別できる | 上流revisionが変わったScaffoldをstaleにする。ownerや上流を失ったScaffoldをorphanとして検出する。根拠なく複数の正式ownerへ二重にbindingされた状態を拒否する |
| SCF-OS-003 | 仮runner／仮CIを、正式なruntime／CIと別のnamespace、別のwriter、別の証拠種別で隔離して実行・観測できる | 仮の検証結果が正式な検証結果の保存先・表示・admissionへ混入しない。旧CI、旧runtime、旧DB、旧hookを仮設の名義で復活・fallbackさせない |
| SCF-OS-004 | 正式な物が投入されたとき、consumer・依存・interfaceを正式なbindingへ付け替え、SCF-HARNESS-005の確認結果を対象revisionと証拠付きで記録できる | 付け替え対象のrevisionと証拠のrevisionが一致しない場合は置換を完了にしない |
| SCF-OS-005 | 置換の確認が完了し、その結果を読み直して確かめた後にだけ、Scaffoldを撤去済みへ遷移できる | 置換完了前のScaffold削除を拒否する。正式な物が不足する間はScaffoldを残し、実装済み・移管済み・撤去可能と表示しない |
| SCF-OS-006 | 置換完了後に残ったScaffold、仮adapter、stub、仮CIを検出できる | 正式な物と仮の物が同じ役割を二重に担う状態、撤去漏れを一覧できる |
| SCF-OS-007 | Scaffoldから要求、設計、承認、受入を直接writeしない | Scaffoldの登録、実行、検証成功、撤去のいずれからも、要求の採否・人間承認・工程完了を生成しない |

## 想定する使い方

以下は例であり、採用の決定ではない。個別のScaffoldは、対象の上流が決まった後に個別に判断する。

- 要求エンジンの正式な意味契約が決まる前に、意味処理の役割を仮interfaceと仮のPython実装へ束縛する。
- JSON、DB、file等の保存方式が決まる前に、必要なauthorityとprojectionの役割を仮adapterで接続する。
- 新世代の正式CIが未構築の間に、Scaffold領域の中だけでschema、relation、failureの検査を回す。
- runtime bindingが未確定の間に、必要なcapabilityの役割と一時adapterを対応づける。
- 本実装を入れたときに、古いstub、一時adapter、仮CIの残留を検出する。

## 本線（対象別L2の採否）との関係

[対象別L2 source採否順序](../audits/source-rebaseline/l2-source-adoption-sequence.md)に、判断単位`L2D-S0-01`として接続する。
S1以降の採否が進んでも正式なL3、設計、実装、CIはすぐには成立しない。その間に必要になる仮の物を、
役割を失わず、正式な成立と混同せずに扱う条件を先に決めるため、S1の前に置く。

本候補の採否はScaffoldを実装・起動する許可ではない。採否の後も、Scaffoldのschema、保存方式、runtime、
仮CIの実現方式はL3／L10から導出する。保存方式と技術比較はADRの候補として別に扱う。

次の判断単位へ接続する候補である。

- `L2D-S1-04 requirements-authority-materialization`: 正式なauthorityと、仮のprojection／artifactを分ける。
- `L2D-S2-01 next-generation-ci-requirements`: 仮の検証と正式CIの証拠種別を分け、昇格を禁止する。
- `L2D-S2-02 execution-ticket`: Scaffoldを扱う作業のscope、budget、証拠を管理する。

対象別L2本文への接続先の候補は、HARNESS-L2-003／004／005と、HELIXOS-L2-002／007／008である。
L2／L11本文は`L2D-S1-01`の判断packetがexact digestで参照しているため、本候補の追加では変更しない。
本文への接続は、本候補の人間判断の後に、要求PRとして別に行う。

## 現在の停止条件

- 本候補の記載で、HARNESS／HELIX-OSのL2合意や人間承認を成立させない。
- Scaffoldのschema、runtime、仮CI、runner、DB、hook、adapterを実装・起動しない。
- 旧CI、旧runtime、旧DB、旧hookを仮設の名義で復活させない。
- Scaffoldの導入を理由に、Concept→L1→L2／L11→L3／L10の順序を飛ばさない。
- Issue #1847の状態、label、closeから、本候補の採否・完了を生成しない。

## L11受入候補

全件未実行である。各項目の末尾に、対応する要求IDを示す。

- 正式な設計が無い状態で、仮artifactから、担っている役割と上流のsource revisionへ辿れる。（SCF-HARNESS-001／002、SCF-OS-001）
- 上流を持たないScaffold、役割を宣言しないScaffoldの登録を拒否する。（SCF-HARNESS-001／002）
- 置換先の役割が未特定のScaffold Bindingを有効にしようとし、拒否する。具体的な正式artifactだけが未決のBindingは有効にできる。（SCF-OS-001）
- 仮実装だけがある要求を与え、`implemented`／`verified`と表示しない。（SCF-HARNESS-003）
- 仮の検証が成功し、正式CIが未実行の状態を与え、正式な結果をgreenやverifiedにしない。仮の検証結果が正式な検証結果の保存先・admissionへ混入しない。（SCF-HARNESS-003／004、SCF-OS-003）
- Scaffoldが宣言した一時契約の範囲外を仮の検証の対象にしようとし、拒否する。（SCF-HARNESS-004）
- 上流revisionを変更し、対応するScaffoldがstaleになる。ownerまたは上流を失ったScaffoldをorphanとして検出する。（SCF-OS-002）
- 正式な物を投入し、役割・義務・consumer・oracleのうち1件を未移管にした場合、置換完了を拒否する。（SCF-HARNESS-005、SCF-OS-004）
- 付け替え対象のrevisionと証拠のrevisionが一致しない置換を与え、置換完了を拒否する。（SCF-OS-004）
- 置換完了前のScaffold削除を拒否する。（SCF-OS-005）
- 置換の確認結果の読み直し（read-after）が無い、または読み直した結果が確認結果と一致しない状態で撤去済みへ遷移しようとし、拒否する。（SCF-OS-005）
- 置換完了後にScaffold、仮adapter、仮CIを1件残し、残留として検出する。（SCF-OS-006）
- 1つのScaffoldを根拠なく2つの正式ownerへbindingし、拒否する。（SCF-OS-002）
- 旧CIまたは旧runtimeを呼び出すScaffoldを登録し、拒否する。（SCF-OS-003）
- PoCまたはResearchのticketをScaffoldとして登録する、あるいはScaffoldをPoCの成立性判断・production Featureとして扱う入力を与え、identityの混同として拒否する。PoCの成果をScaffoldへ接続する場合は別identityのまま関係だけを持つ。（SCF-HARNESS-006）
- Scaffoldの登録、検証成功、撤去のいずれかを入力として、要求の採否・人間承認・工程完了を生成しようとし、拒否する。（SCF-OS-007）
