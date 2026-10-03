# RDP-001 REQATOM A1 0031--0050

これは、A1 atomization review queue の `REQATOM-QUEUE-0031`〜`0050`を独立reviewへ渡すための研究 Scaffold候補である。正式な要求、採否、owner、authority、successor、実装、縮退、phase、受入、CI、releaseは生成しない。

## 固定した範囲

- base: `origin/main`の`685c69c3c174ac6121812dade30ed75e510986e6`
- queue: 20 unit、101 input line、98 atomized candidate、9 `composite_unresolved` span
- source group: 1件。全unitは`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md`に属する
- source digest: `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`
- archive digest: sourceと同一。archiveは固定された旧sourceの行とdigestを照合するためだけに静的読取した

unitごとの行分母は次のとおりである。

| queue unit | source line | input line数 | atomized | composite_unresolved |
|---|---:|---:|---:|---:|
| 0031 | 00086–00090 | 5 | 5 | 0 |
| 0032 | 00091 | 1 | 0 | 1 |
| 0033 | 00092–00098 | 7 | 7 | 0 |
| 0034 | 00099 | 1 | 0 | 1 |
| 0035 | 00100–00104 | 5 | 5 | 0 |
| 0036 | 00105 | 1 | 0 | 1 |
| 0037 | 00115 | 1 | 0 | 1 |
| 0038 | 00116–00127 | 12 | 12 | 0 |
| 0039 | 00128 | 1 | 0 | 1 |
| 0040 | 00129–00136 | 8 | 8 | 0 |
| 0041 | 00137 | 1 | 0 | 1 |
| 0042 | 00138–00166 | 29 | 29 | 0 |
| 0043 | 00167 | 1 | 0 | 1 |
| 0044 | 00168–00179 | 12 | 12 | 0 |
| 0045 | 00180 | 1 | 2 | 0 |
| 0046 | 00181 | 1 | 0 | 1 |
| 0047 | 00182–00192 | 11 | 11 | 0 |
| 0048 | 00193 | 1 | 6 | 0 |
| 0049 | 00194 | 1 | 1 | 0 |
| 0050 | 00195 | 1 | 0 | 1 |

表の右端は順にatomized candidate数と`composite_unresolved`数である。表header、文書境界、行集合の説明だけで独立義務を確定できない行はcompositeへ置いた。

## 意味単位化の判断

各input lineは`atomization_plan.json`の意味義務anchorへ展開する。各atomは最小`source_span`、逐語`verbatim_anchor`、行全文の`source_line_text`、正規化意味、`semantic_subject`、`inherited_subject`、`parent_context`、`semantic_action`、`semantic_condition`、`semantic_predicate`、`historical_conflict`、`typed_relation`、`product_boundary`を保持する。`retained_meaning`はそのatomの逐語spanで、行全文は別fieldに保持する。

表の単語cellは要求数として数えない。0031のstakeholder行、0033の課題→あるべき姿→BR行、0038のBR／OT／test観点行、0042のcarry項目→送り先→根拠行、0044と0047のentity mapping行は、それぞれ行全体を一つの関係atomとして保存した。0040の関連doc行はnavigation／reference connectionとして一行一関係にした。

0045はL3起草からL1 entityへのback-propagation起点とL4で集約境界／値オブジェクトを確定するcarryの二つへ分けた。0048は新概念発見の起点条件、boundary再定義PLAN、L1 entity更新、V-pair再trace、L3受入条件反映、L4 protocol起票候補を順序関係として分けた。旧sourceの手順を現行reverse authorityや実装完了へ昇格させない。

## 旧資産の確認

対応assetは`LEGACY-ASSET-9F48ADEEB477DCA54039` revision 3で、dispositionは`source_snapshot_preservation`、implementationは`non_executable_read_only_source`、product targetは`unresolved`、decisionは`pending_human_confirmation`である。revision 2から3へのcorrection decisionとread-after `READ-REQ-SNAPSHOT-9F48ADEEB477DCA54039`を静的に照合した。

failureは旧sourceの原文・actor・条件・trace欠落またはdigest不一致ならsource closureを停止する候補として記録した。これは現行failure contractではない。legacy consumer refsは`requirement-carry-forward-ledgers`と`requirement-atomization-review`を保持し、current statusは`unresolved`である。

## 四製品境界の分離

現行の四製品文書はrouting candidateを作るためだけに参照した。分母は次のとおりである。

- `HELIX-HARNESS`: 58 atom、`candidate_only`
- `HELIX-OS`: 26 atom、`candidate_only`
- `HELIX-Web`: 0 atom、`no_direct_source_evidence`
- `HELIX-Web-OS`: 0 atom、`no_direct_source_evidence`
- product未確定: 14 atom

product targetは`product_boundary`、現行routingの理由は`candidate_inference`へ隔離した。旧stakeholder、AI worker/verifier、dashboard、carry、entity、CLI／state記述を現行permission、CI運転、導入、更新、復旧、結果追跡、deployment、release authorityへ読み替えていない。特に0033-05、0038-06／10／11、0042-04／18／21／28、0047-11のdashboard／UX／tenant／derived-view、0042-20のonboarding／whole-product記述には旧source上のHELIX-Web／Web-OS固有identityがない。現行Web L1のConnector型AI開発SaaS利用者体験、Web-OS L1のtenant／job／service runtimeはrouting比較にのみ使い、これら14 atomはHARNESS／OS／Web／Web-OSの候補集合を保持した`candidate_target=unresolved`とした。source authorityは旧sourceの宣言に限り、target authorityは`none`である。implementation、degradation、phaseは`unknown`／`unresolved`、successorとdecisionは空またはnullである。

## 汎用生成・検証

`generate.py`はqueue unit、semantic line ledger、`atomization_plan.json`を読み、source pathごとにasset／decision／read-after／consumer観測を束ねる。固定入力digest、source行順、意味義務anchor、階層atom ID（`A1-0031-01-01`〜`A1-0050-01-01`）を使うため、再実行時のJSONLは決定的である。source groupが増えてもsource path単位でcatalog／decision／read-afterを解決する。

`validate.py`は次を静的に検査する。

- queue／ledgerのdigest、unit集合、source／archive digest、asset revision、append-only decision、failure／consumer観測
- input lineごとの意味義務anchor完全被覆、同一行span重複・欠落、最小source span／逐語anchor／line digest
- actor／action／condition、否定、順序、接続を含むtyped relationと、四製品routing候補・authority noneのproduct boundary
- atomized候補と`composite_unresolved`分母の分離。headerや説明行の単語分割を許さない
- 四製品分母、未確定分母、candidate inferenceとretained source meaningの分離
- generated inventory／proposalから期待値を再計算せず、101 source line、98 atom、9 composite、HARNESS 58／OS 26／Web 0／Web-OS 0／unresolved 14、unit／atom／composite keysetをvalidator側の独立定数で固定すること
- proposal／line_coverage／atom／composite／inventoryの未知keyを拒否するschema keyset
- authority、successor、implementation、degradation、phase、decisionが未解決のままであること

`selfcheck.py`はbaselineを保ったまま、同一行の義務欠落・重複、table cellの断片化、authority／implementation／degradation／phaseの昇格、source meaning／semantic predicate／typed relation／product boundary／Web単独routing／ordered sequence改変、composite欠落、未知key、inventory authority effect、queue digest改変を一時ファイルでvalidatorへ入力し、拒否を確認する。さらにgeneratorを一時planへ向け、未固定行atom削除、composite削除、product target差替えを生成後validatorが拒否することを確認する。

```sh
python3 -B scaffold/rdp001-reqatom-0031-0050/generate.py
python3 -B scaffold/rdp001-reqatom-0031-0050/validate.py
python3 -B scaffold/rdp001-reqatom-0031-0050/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

## Binding

`SCF-B-0056`をこの20 unit専用Bindingとして登録する。mainの既存Bindingとopen PRで確認できた`SCF-B-0049`〜`0054`（#1994、#1997、#1996、#2003、#1999、#2001）を確認し、0055を含む未使用候補を避けて0056以降の空きIDを選んだ。本候補は先行A1 slice、後続A1 unit、別の四製品reviewを束縛しない。

mainは`685c69c3c174ac6121812dade30ed75e510986e6`をbaseとした。source、queue、semantic ledger、asset、decision、read-afterの固定入力digestが変わった場合はrebaselineが必要である。

旧archiveのworkflow、runtime、test、CI、hook、adapterは実行していない。候補の採否、四製品の正式routing、failure／consumer closure、phase配置、entity／carryの現行設計は人間decision待ちである。
