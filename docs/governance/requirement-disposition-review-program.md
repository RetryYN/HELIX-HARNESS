# 全要求の要否・再配置review program

status: proposed_upstream_waiting
program_id: RDP-001
owner: HELIX-OS management
authority_effect: none
source_population: management provisional source holdings

## 目的

旧要求を一件も落とさず、新世代HELIXで各要求が必要か、どの対象productへ置くか、分割・表現変更・意味変更・
archive限定・retireの判断が必要かを整理する。本programは要否判断を追跡する親作業であり、Issueの作成・close、
AI分類、類似判定、旧実装の有無から要求を削除しない。

HELIX-DBの要否は本programで扱う技術制約の一論点である。専用DBという実装名の要否と、永続化、排他、冪等性、
再開、因果追跡、横断検索、projection再構築という意味機能の要否を分ける。実装名を不要と判断しても、原要求の
目的・failure・回復・制約を未計上にしない。

## 入力母集団

[管理層の要求仮登録契約](management-provisional-requirement-registration.md)に従い、
`management-provisional-requirement-register.jsonl`で生存中の全`registered_source_holding`を入力入口にする。
現在の十二のholdingは、IR 153要求、confirmed identity 175件、semantic line 2,386行、補助source 655件、
旧candidate 4,755行、workflow索引108件、構造見出し317件、Scrum Reverse 300行、archive隔離前に変更された
基準source revision 333 pathに加え、旧v1.3の直接委任22文書から意味frontmatter relation 265 edgeを再帰的に辿った
closure 117文書を、114 file blobとScrum Reverse行台帳3文書へ保持する。さらに同じ117文書から抽出したfrontmatter・
本文参照788 edgeを、参照元行とtarget blob digest付きの分類待ちholdingへ保持する。さらにPOが提示した5大目標5件と
七大原則7件のexact原文を、企画価値sourceと行動規律sourceの12 atomとして保持する。

これらの件数は重複・包含・派生関係を含むため単純合算しない。一つのholdingや索引に無いことを非要求・不要の
根拠にせず、新しいsourceを発見した場合は先に`source_holding`へ追加する。file blob／path単位のholdingは発見・保存の
入口であり、要否を判断する分母ではない。対象文書、そのrevision、または文書が宣言するpair、上下流設計、authority、
意味台帳、tailoring、legacy source relationをreviewする要求PRでは、先に意味relation closureを固定して無損失な
atom集合へ分解し、別holdingへ仮登録してから扱う。本文参照やPLAN・process・migration参照も分類前に消さず、利用・
縮退・retireするときは参照IDと対象blobを入力へ含める。sourceで`confirmed`だった意味を、
新世代targetが未承認であることを理由にcandidateへ降格しない。

## 整理する単位と状態

review単位はsource-qualified requirement identityまたはatomとする。複数要求を一括で「必要／不要」にせず、
各単位について次のいずれかを候補として記録する。

| disposition候補 | 意味 | 確定条件 |
|---|---|---|
| `preserve_and_rehome` | 原意味を保持して対象別successorへ再配置する | successor、対象product、保持atom、L11、未被覆atomを記録 |
| `split_with_full_coverage` | 一つの原要求を複数のunit／connection／compositeへ分ける | 原identityを残し、全successorの合成で意味を無損失被覆 |
| `reword_with_equivalence` | 表現を変え、意味を変えない | 対象revision付きの人間による同値確認 |
| `change_candidate` | 新世代Conceptとの関係から意味変更を検討する | 原文、変更案、影響、未保持atomを示し、人間decisionを別記録 |
| `archive_only_candidate` | historical sourceとして保持し、current要求にしない案 | source authorityと利用者影響を示し、人間decisionを別記録 |
| `retire_candidate` | 不要化を検討する | 理由、影響、consumer、replacementまたはreplacement不要根拠を示し、人間decisionを別記録 |
| `unresolved` | 判断材料、対象、relationのいずれかが不足 | 原文を保持し、欠落と次の調査を記録 |

`change_candidate`、`archive_only_candidate`、`retire_candidate`は判断結果ではない。対象revision付きの人間decisionが
ない限り、`preserved_pending_rehome`を維持する。元からcandidateだったsourceの不採用と、sourceで採用済みだった要求の
retireを同じ処理にしない。

## 処理順

1. PR #1797でrepository foundation、旧source snapshot、holding、上流運用を固定する。
2. [bootstrap register](management-provisional-requirement-registration.md#bootstrap境界)で要求PRの仮登録を受ける。自動登録入口の実装完了を前提にしない。
3. 各holdingを別queueとして扱う。IRは[IR再配置wave](legacy-ir-rehome-wave-register.md)に従い、業務価値、機能、非機能、技術制約の順で一つずつreviewする。semantic lineは既存A1／A2 queueを使い、file blob／path集合は対象文書と意味relation closureを先にatom化する。参照候補holdingは参照元・target・分類を保ったまま、要求意味を持つかを別に判断する。残るholdingの順序とrelationは、そのholdingを扱う要求整理PRで明示する。
4. 対象productと`unit`／`connection`／`composite`を分け、責務重複や意味類似はrelation候補として示す。
   重複候補は[責務・機能重複review program](requirement-overlap-review-program.md)で比較し、原identityと固有atomを残す。
   旧技術の拘束は[技術代替可能性review program](requirement-technical-substitutability-review-program.md)で、意味機能と実現方式を分けて比較する。
5. 必要な場合は親Concept／Vision／企画からresearch、PoC、prototypeへ進み、結果を判断論点へ戻す。
6. 一つの要求identityごとに、人間decision、対象別L2／L11、無損失被覆receipt、管理層の`registered_proposal`を同じ要求PRへ束縛する。
7. 全atomが「当該successorへ保持」「別の生存中仮登録へ保留」「人間decision対象」のいずれかに入り、未計上0であることをread-afterする。

HARNESSは無損失被覆、要求kind、工程順序、pair、停止・差戻し・完了条件を規定する。HELIX-OS管理は母集団、候補、
decision、未決、進行を登録し、推進は承認済み要求から後続ticketを発行する。管理や推進が要求の要否を自己承認しない。

## 親Issueの役割

GitHub Issueは本programの進行と未決論点を共有するprojectionに限定する。親Issueのcheckbox、label、closeから
個別要求の採否、successor割当、意味変更、retire、要求整理完了を生成しない。各要求の判断は別の要求PRと
対象revision付き人間decisionで行い、親Issueにはその参照と未完状態だけを投影する。

責務・機能重複は別の子Issueでclusterとして整理する。親Issueの「重複」一項目で複数要求を統合済みにせず、
完全重複、部分重複、責務分割、共通能力、接続要求、実装だけの重複を区別する。
技術代替可能性も別の子Issueで整理し、旧技術の不採用を要求意味の不採用へ変換しない。

## 完了条件

- 生存中の全source holdingについて、file blob／path集合は無損失なatom集合へ展開され、対象名前空間内のatomが一度ずつ処理され、重複・包含・派生relationが明示される。
- sourceで採用済みだった全要求は、無損失successorまたは対象revision付き人間decisionへ辿れる。
- 未分類、未配置、未判断、未被覆は0に見せず、`unresolved`または生存中仮登録として残る。
- 各要求PRが`coverage_result: no_loss`、`unaccounted_atom_refs: []`、同一候補digestの`registered_proposal`を持つ。
- HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの責務と、unit／connection／compositeの粒度が混在していない。
- Issue／PR／CI／DB／実装状態から要求の採否・承認・完了を逆生成していない。

## 現在の停止条件

Concept v4.1と4対象L1は2026-09-17のdecision recordで承認済みである。現在は旧要求を全件保持したまま、
管理分類登録の第1層として対象製品候補を一件ずつ登録する。対象別L2／L11が未採否であるため、要求の要否判断、
successor確定、意味変更、縮退、retireは開始しない。L3、実装、DB、runtime、新世代CI、archiveの物理削除も
本Issueから開始しない。
