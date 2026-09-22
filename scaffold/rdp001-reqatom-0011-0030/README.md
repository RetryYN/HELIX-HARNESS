# RDP-001 REQATOM A1 0011--0030

これは、A1 atomization review queue の `REQATOM-QUEUE-0011`〜`0030` を独立レビューへ渡すための研究 Scaffold 候補である。正式な要求、採否、owner、authority、successor、実装、劣化、phase、受入、CI、release は生成しない。

## 固定した範囲

- base: `origin/main` の `1310ada35dd8848a8b49b34caf373fc51398cb80`
- queue: 20 unit、59 input line、210 atomized candidate、8 `composite_unresolved` span
- source group: 1件。全unitは `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md` に属する
- source digest: `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`
- archive digest: sourceと同一。archiveは固定された旧sourceの行とdigestを照合するためだけに静的読取した

unitごとの行分母は次のとおりである。

| queue unit | source line | input line数 | atomized | composite_unresolved |
|---|---:|---:|---:|---:|
| 0011 | 00027 | 1 | 2 | 0 |
| 0012 | 00028 | 1 | 0 | 1 |
| 0013 | 00029–00040 | 12 | 65 | 1 |
| 0014 | 00041 | 1 | 2 | 0 |
| 0015 | 00042 | 1 | 0 | 1 |
| 0016 | 00043–00048 | 6 | 19 | 0 |
| 0017 | 00049–00054 | 6 | 15 | 0 |
| 0018 | 00055 | 1 | 6 | 0 |
| 0019 | 00056 | 1 | 0 | 1 |
| 0020 | 00057–00066 | 10 | 10 | 0 |
| 0021 | 00067 | 1 | 2 | 1 |
| 0022 | 00068 | 1 | 0 | 1 |
| 0023 | 00069–00072 | 4 | 17 | 0 |
| 0024 | 00073 | 1 | 9 | 0 |
| 0025 | 00074–00075 | 2 | 15 | 1 |
| 0026 | 00076 | 1 | 10 | 0 |
| 0027 | 00077–00082 | 6 | 27 | 0 |
| 0028 | 00083 | 1 | 3 | 0 |
| 0029 | 00084 | 1 | 8 | 0 |
| 0030 | 00085 | 1 | 0 | 1 |

表の右端は順に `atomized candidate数` と `composite_unresolved数` である。

各input lineは `atomization_plan.json` の意味義務anchorへ展開する。同一source lineに複数atomを置けるため、旧来の `consumed_once` 1:1 closureは使わない。各atomは最小 `source_span`、逐語 `verbatim_anchor`、行全文の `source_line_text`、正規化意味、`semantic_subject`、`inherited_subject`、`parent_context`、`semantic_action`、`semantic_condition`、`semantic_predicate`、`historical_conflict`、`typed_relation`、`product_boundary` を持つ。`retained_meaning` はそのatomの逐語spanで、行全文は別fieldに保持する。分割判断が安全でない表header・根拠spanは `composite_unresolved` に置き、atomized分母へ算入しない。

特に0013-01はV-model本体と6つの左右pair、0013-02はentry modeの階層と工程専門mode、0013-03は5職種driveとdriveではないmodeの否定関係、0013-06は4 artifact endpointと12 directed edge、0013-07はfreeze A／A2／B段階、0013-10はForward順序、0013-11は5つのguard条件、0013-12はMVP優先要求候補3要素とB10=a保留関係へ分割した。0027-01はAI rosterの起草・実装・検証・gate・commit・merge/tag・worker≠verifier・自己評価禁止、0027-02はhuman residueとL0-L3承認・escalation・override・L4+ sign-off禁止、0027-05はClaude Code/Codex→CLI→harnessのactor／interface／consumer接続へ分割した。0020のmode表10行は、mode名・入口・主要工程・Forward合流点を一つの関係atomとして保持し、単語cellを独立要求として数えていない。旧無人mergeや旧AI verifierは歴史上のactor記述であり、現行permission・merge authority・releaseへ昇格させない。

## 旧資産の確認

sourceに対応する asset は `LEGACY-ASSET-9F48ADEEB477DCA54039` revision 3 で、disposition は `source_snapshot_preservation`、implementation は `non_executable_read_only_source`、product target は `unresolved`、decision は `pending_human_confirmation` のまま保持した。revision 2から3への correction decision と read-after `READ-REQ-SNAPSHOT-9F48ADEEB477DCA54039` を静的に照合している。

failure は旧sourceの各行について、原文・actor・条件・traceの欠落またはdigest不一致ならsource closureを停止する候補として記録した。これは現行failure contractではない。legacy consumer refs は `requirement-carry-forward-ledgers` と `requirement-atomization-review` を保持し、current status は `unresolved` である。

## 四製品境界の分離

現行の四製品文書は routing candidate を作るためだけに参照した。分母は次のとおりである。

- `HELIX-HARNESS`: 149 atom、`candidate_only`
- `HELIX-OS`: 22 atom、`candidate_only`
- `HELIX-Web`: 0 atom、`no_direct_source_evidence`
- `HELIX-Web-OS`: 0 atom、`no_direct_source_evidence`
- product未確定: 39 atom

product target と OS 接続の説明は `candidate_inference` に置き、旧actor／役割／AI roster／worker≠verifier等を現行permission、CI、導入、更新、復旧、結果追跡、merge、releaseへ読み替えていない。source authority は旧sourceの宣言に限り、現行target authority は `none` である。implementation、degradation、phase は `unknown`／`unresolved`、successor と decision は空またはnullである。

## 汎用生成・検証

`generate.py` は queue unit、semantic line ledger、`atomization_plan.json` を読み、source pathごとに asset／decision／read-after／consumerの観測を束ねる。固定入力digest、source行順、意味義務anchor、atom ID（`A1-0011-01-01`〜`A1-0030-66-01`等）を使うため、再実行時のJSONLは決定的である。source groupが増えた場合もsource path単位でcatalog／decision／read-afterを解決する。

`validate.py` は次を静的に検査する。

- queue／ledgerのdigest、unit集合、source/archive digest、asset revision、append-only decision、failure／consumer観測
- input lineごとの意味義務anchor完全被覆、同一行span重複・欠落、最小source span／逐語anchor／line digest
- normalized statementのsemantic subject／predicate／condition、共通主語継承、歴史記述と現行権限の衝突境界
- actor／action／condition、taxonomy／artifact／freeze／sequence／priority／gate／negative／interfaceのtyped relationと、四製品routing候補・authority noneのproduct boundary
- atomized候補と`composite_unresolved`分母の分離
- 四製品分母、未確定分母、candidate inferenceとretained source meaningの分離
- authority、successor、implementation、degradation、phase、decisionが未解決のままであること
- generated inventory／proposalから期待値を再計算せず、59 source line、210 atom、8 composite、HARNESS 149／OS 22／Web 0／Web-OS 0／unresolved 39、unit／atom／composite keysetをvalidator側の独立定数で固定すること

`selfcheck.py` は baselineを保ったまま、同一行の義務欠落・重複、0020 mode rowの単語cell化、authority／implementation／degradation／phaseの昇格、source meaning／semantic predicate／typed relation／product boundary改変、composite欠落、inventory authority effect、queue digest改変を一時ファイルでvalidatorへ入力し、拒否を確認する。さらにgeneratorを一時planへ向け、未固定行atom削除、composite削除、product target差替えを生成後validatorが拒否することを確認する。

```sh
python3 scaffold/rdp001-reqatom-0011-0030/generate.py
python3 scaffold/rdp001-reqatom-0011-0030/validate.py
python3 scaffold/rdp001-reqatom-0011-0030/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

## Binding

`SCF-B-0052` をこの20 unitの専用Bindingとして登録する。main上の既存bindingと、open PRで確認できた `SCF-B-0048`／`0049`／`0050`／`0051`（それぞれ #1993／#1994／#1997／#1996）を確認し、次の空きIDを選んだ。今回の候補は `SCF-B-0050` の0006〜0010 sliceや他のA1 queue unitを束縛しない。

mainは候補作業中に `433785cfe917fd7e4b5403c113163e1be524088c` から `1310ada35dd8848a8b49b34caf373fc51398cb80` へ進んだ。対象source、queue、semantic ledger、asset、decision、read-afterに差分はなく、入力digestは変わらなかったため候補意味のrebaselineは不要だった。worktreeのbaseだけ最新mainへ更新した。

旧archiveのworkflow、runtime、test、CI、hook、adapterは実行していない。候補の採否と四製品の正式routing、failure／consumer closure、phase配置は人間decision待ちである。
