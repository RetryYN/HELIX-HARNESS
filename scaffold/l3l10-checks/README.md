# scaffold/l3l10-checks — L3／L10本文PRの違反検出器（仮組み）

status: scaffold（仮組み。正式な設計・実装・CI・検証ではない）
authority_effect: none
binding: [SCF-B-0157](../bindings/SCF-B-0157.json)
replacement_issue: GitHub Issue #1866（仮組み→本実装差し替え台帳。作業projectionであり正本ではない）

## これは何か

L3／L10本文PRのうち、**機械で検出できる違反**を拾う検出器である。L3／L10の承認は作成と別系統の独立reviewで成立し
（[GitHub上流運用モデル](../../docs/governance/github-upstream-operating-model.md)「L3／L10承認の委任」）、
この検出器はそのreviewへの入力に留まる。

**違反の検出器であり、合格の十分条件ではない。** violationが0件でも「承認可」「合格」「merge可」を出力しない。
receiptから承認、合格、merge admission、要求意味、工程完了を生成しない。意味の対応（固定親の禁止文ごとに拒否CASEがあるか、
L3とL10の強弱の食い違い、別文書との主張の矛盾）は検出しない。それらはreviewが本文を読んで判断する。

## 使い方

```
# 1つのPRを検査する（receiptを標準出力へ、要約を標準エラーへ出す）
python3 -B scaffold/l3l10-checks/l3l10check.py \
  --head <PRのcontent HEAD> --base <PRのbase> --fixed-rev <固定L2／L11のrevision> \
  --mech helix-labo --parent 060 [--parent 061 ...] \
  [--pin docs/governance/audits/.../xxx-pin.json] [--pin-rev <revisionを持たないpinの既定revision>] \
  [--online]   # receiptは標準出力、要約は標準エラー。本検査器はfileへ書かない

# 自己検査（回帰コーパスと合成case）。--recordで scaffold/evidence/ に結果を書く
python3 -B scaffold/l3l10-checks/selftest.py [--record]
```

終了codeは、pass 0、violation 1、入力不正 2、unknown 3である。`--online`を付けた時だけ`gh api repos/<repo>/issues/comments/<id>`を
読み取りで呼ぶ（既定はoffline）。gitは`cat-file`、`ls-tree`、`diff`、`rev-parse`の読み取りだけを使う。
**検査器はfileへ何も書かない。** receipt JSONは標準出力へ、要約は標準エラーへ出す。receiptを保存する場合は、呼び出し側が自分の権限と書込み方針の範囲で出力先を選ぶ。本bindingの許可操作は標準出力への出力までであり、保存先（`scaffold/`外を含む）への書込みを本bindingの操作に含めない。
書き込むのは、selftestの`--record`が書く固定path`scaffold/evidence/l3l10-checks-selftest-2026-10-08.json`だけである。

当初は`--receipt`で出力先を受け取り、`scaffold/`配下へ制限していた。#2700のreview01〜04で、範囲外のpath、ハードリンク、
検証後の途中directoryのsymlink差替え、directory fd取得後の親directoryの移動という順で抜け道が見つかった。
同じUIDで並行してfilesystemを操作する相手に対して、path名による書込み範囲の制限はuser空間だけでは保証できない。
そのため出力先を受け取る機能自体を削除し、書込み境界を持たない設計にした（`SCF-B-0157`の「`scaffold/`外への書込み禁止」を構造で満たす）。
selftestの`--record`の固定pathも、同じUIDによる並行操作は脅威の範囲外とする。これは既存のscaffold tool（`scfctl selftest --record`等）と同じ前提である。

## 3値の扱い

| 値 | 意味 |
|---|---|
| `pass` | その検査が照合でき、違反候補を見つけなかった。承認・合格ではない |
| `violation` | 照合の結果、違反候補を見つけた（根拠のpath:lineと照合値つき） |
| `unknown` | 入力が空・欠損・解析不能、照合先を1つに決められない、表記が曖昧で確信が低い。**passにしない** |
| `advisory` | 境界の削除（検査5）だけが使う。判定ではなくreviewの注意点 |

検査ごとの結果は、findingのどれかがviolationならviolation、そうでなくunknownがあればunknown、findingが無ければunknownである。
全体（`overall`）は、hard検査（1〜4）の結果から同じ規則で決め、**登録した検査と評価した検査の件数・集合が食い違えば必ずunknown**にする。
検査器が例外で止まった場合も、その検査はunknownとして記録し、合格へ縮退させない。

## 各検査の意味と限界

### 1. pin_recompute（pin再計算）

- 判断記録・pin JSONのうち、`path`と`sha256`／`full_sha256`／`span_sha256`／`bytes`を持つobjectをすべて拾い、指定revisionの実bytesと照合する。
  `start_line`と`end_line_inclusive`があればspanも照合する（行をLFで連結した形と、各行をLFで終えた形の両方を試し、一致した形をreceiptに書く）。
- revisionは、pin自身の`revision`、無ければ`--pin-rev`、そのrevisionにpathが無ければ`--head`の順に読む。最後の候補で読んだpinの不一致は、
  どのrevisionを指すか確定しないためunknownに留める。
- `formal_body_raw`があれば、そのUTF-8 bytesのSHA-256とbytesを`formal_body_sha256`／`formal_body_utf8_bytes`と照合する。`--online`の時だけ、
  `formal_comment_id`のcomment bodyとも照合する。
- Markdownの判断記録は、1行にrepository path 1つと64桁hex 1つがある行だけを拾う。全文・spanのどちらとも一致しなければ、対応づけが曖昧なためunknownにする。
  pathを伴わない本文SHA（例：comment本文のSHAだけを書いた行）は照合しない。
- 限界：pinが指すべきrevisionを本文から推測しない。revisionを持たないpinは`--pin-rev`の指定に依存する。

### 2. count_ids（件数・ID）

- FV（functional-verification.md）で、行頭（表の第1 cell、list item、見出し）に置かれたCASE IDのうち、最初の3桁segmentが親番号に一致し、
  その後ろにsegmentを持つものを親の定義行として数え、行数とunique ID数を出す（`NFR`を含むIDは数えない）。
- 6本文で、見出しの入れ子から親番号に属する節を決め、その節の中の件数記述を照合する。照合する表記は閉じた一覧
  （`CASE定義IDはN件`、`L10のN件（…）の定義`、`全定義N件`、`全N定義行`、`N件の定義`、`CASE ID一意数N`、`定義IDはN件`）に限る。
  同じ文で数値より前に「旧」がある表記は旧の件数として除外し、notesに書く。
- 一覧に無い「N件」がCASE・定義を含む文にあり、実数と異なる場合はunknown（何の件数かを本文から確定できない）にする。
- 同じIDが複数の定義行に現れる場合は、索引表の再掲か二重定義かを決められないためunknownにする。
- 限界：正常・negative・索引の内訳は照合しない。件数記述が一覧外の言い回しなら拾えない。親の節を見出しで判別できない本文では照合しない。

### 3. fixed_quote（固定引用の照合）

3つの形を抽出し、`--fixed-rev`の固定L2／L11と照合する。

- 形式A（行番号つき「」引用）：`L11 line 52の現行文「…」`、`固定L2:1053「…」`のように、行番号つき参照の直後（15字以内）に始まる「」の中身を、
  その行（範囲）の本文に逐語で含まれるかで照合する（入れ子の「」に対応。`…`は省略として前後の断片を順に照合）。照合先fileが1つに決まらなければunknown。
  直前に他機構名（`HARNESS L2:…`等）がある参照は照合しない。
- 形式B（`固定L11受入oracle`ラベル行）：括弧内のID・行番号、無ければ直前の`…-CASE-NNN-…`見出しから親を決め、固定L11でその親のL2 IDを持つ表の行を1行に決める。
  ラベル本文を「。」で文に分け、各文がその行に逐語で含まれなければviolation。括弧内の行番号が実際の行と違えばviolation。
- 形式C（`| 固定親 | 入力 | 出力 |`表）：各行のL2 IDについて、固定L2の同じ親の節にある`**入力**：`／`**出力**：`等の行と、cellが一致しなければviolation。
- 比較は、`**`と`` ` ``を除き空白を詰めた形で行う。
- 限界：引用であることを示す形が上の3つ以外（地の文での言い換え等）は拾えない。形式Bは「文がL11行に含まれる」だけを見るため、文の削除は拾わない。
  `introduced_in_diff`（`--base`指定時）で、PRの差分で入った行か既存の行かを区別して示すが、既存の差分も違反候補として出す。

### 4. return_vocab（戻し先の語彙）

- 固定L2で親の節を見出しから取り、その節の`**…戻し先…**：`または`**失敗時…**：`の行だけから語彙を作る（他の親の語彙を流用しない）。
  語彙は、機構名、`Ln-NNN`のID、`X owner`の句（`source/domain owner`は`source owner`と`domain owner`に分配）、「へ戻す／返す」の直前の句である。
- FVの親のCASE行（定義行と、親のCASE IDを持つ見出しの節）で、「へ戻す／返す」の直前の句を語に分け、語彙と照合する。
  他機構名を前置したID（`HARNESS L2-010/011`）は、その機構名が語彙にあれば語彙内とする。`requirement owner`と`要求owner`は同一視する。
- 語彙外の語があればviolation。同じ記述に判別できない語（`oracle`、`authority`等の区分名）が混ざる場合は確信が低いためunknownにする。
- 限界：「へ」を伴わない列挙（`AはX、BはYへ返す`のX）はFV側では最後の句しか見ない。語の同一視は上の1組だけで、言い換えはviolationまたはunknownとして出る。

### 5. boundary_removed（境界の削除、advisory）

- `--base`→`--head`の差分で削除された行を文（表はcell→文）に分け、境界語（しない、拒否、禁止、不合格、限る、だけ、戻す 等）またはIDを含み、
  HEADの同じfileのどこにも同じ文が残っていないものを列挙する。結果は常に`advisory`（base不明ならunknown）で、violationにしない。
- 限界：言い換えで意味が残った場合も列挙する（reviewで確かめる）。文の一部だけの削除は、文が変わったものとして列挙する。

## receiptの形

```
{
  "record_type": "l3l10_violation_check_receipt",
  "status": "scaffold", "evidence_kind": "scaffold", "authority_effect": "none",
  "binding": "scaffold/bindings/SCF-B-0157.json",
  "checker": {"version": "...", "source_digests": {"scaffold/l3l10-checks/<file>": "<sha256>", ...}},
  "generated_at": "...",
  "inputs": {"repo_root", "gh_repo", "mech", "parents", "online",
             "base"/"head"/"fixed_rev"/"pin_rev": {"given", "resolved"},
             "pins": [{"source", "sha256"}],
             "target_files": {"<path>": {"revision", "sha256", "bytes"}, "<path>@fixed": {...}}},
  "registry": {"registered": [...], "evaluated": [...], "registered_count", "evaluated_count", "match"},
  "overall": "pass|violation|unknown", "overall_reason": "...",
  "results": {"<check>": {"result", "severity": "hard|advisory", "counts", "findings": [{"result", "path", "line", "detail", "evidence"}], "notes"}},
  "authority_note": "…承認、合格、merge admission、要求意味、工程完了を生成しない。"
}
```

## 自己検査（回帰コーパス）

`corpus/major-corpus.json`は、PR #2674〜#2697のClaude review_mergeでMajorとして返された13件（bad_head、fixed_head、path、line、型、bad_text、fixed_source）の写しである。
`selftest.py`は各要素について、該当する型の検査が**bad_headの同じ箇所でviolation（境界の削除はadvisory）を出し、fixed_headの同じ箇所で出さない**ことを確かめる。
各実行は登録した全検査を評価し、registered＝evaluatedも毎回確かめる。結果は[scaffold証拠](../evidence/l3l10-checks-selftest-2026-10-08.json)に記録した。

- 対象10件：fixed_quote 3件（#2676 M1、#2677 M1、#2689 M1）、count_ids 3件（#2679 M1、#2685 M1、#2694 M1）、return_vocab 3件（#2680 M2、#2688 M1、#2689 M2）、
  boundary_removed 1件（#2680 M1、advisoryとして検出）。#2679 M1は件数の部分だけが対象で、同じ指摘のclaim_overreach（古い現在形の主張）は対象外。
- 対象外3件：#2674 M1（固定親の禁止文ごとの拒否CASEの有無）、#2678 M1（L3とL10の分母定義の強弱）、#2697 M1（別記録との主張の矛盾）。意味判断のため、passにせず対象外として記録する。
- pin_sha_mismatch型のMajorはコーパスに0件のため、pin再計算は実在pin（CONNECT Stage 1 parent001 review02のpin JSON）とその改変写しの合成caseで確かめる。
- 抽出規則はコーパスを見ながら作った。コーパスは学習とは別の検証集合ではないため、検出率をそのまま未知のPRへの検出率とみなさない。
- fixed_headの**他の箇所**には違反候補が残る（例：SECURITY FVの固定L11受入oracle行の既存差分、OS FVの語彙外の戻し先）。件数を証拠の`violations_elsewhere_same_check`に記録した。
  これらは既存の差分か検出器の誤検出であり、どちらかはreviewで判断する。

## 旧HELIXとの対応

旧sourceは読むだけで、codeを写さず、実行していない（[旧資産の完全一致再利用統制](../../docs/governance/legacy-asset-reuse-control.md)上、src配下は除外classが付き、
docs配下も内容監査前は完全一致再利用にできないため、すべて意味の再導出（`semantic_rederive`）である）。行番号は本作業で再読して確かめた。
asset IDとSHA-256は[資産明細台帳](../../docs/governance/legacy-asset-disposition.jsonl)の値である。

| 旧source（asset ID／path:行） | 保持する点 | 変更する点 | 変更理由 |
|---|---|---|---|
| LEGACY-ASSET-2E09592A003B32C118C1／`docs/governance/gate-design.md:157`（`count-matches`：header件数宣言vs実数）、`:159`（`dup-id`）、`:171-172`（構造はengine、意味はreview） | 宣言件数と実数の照合、同一IDの二重定義の検出、構造の検査と意味のreviewの分担 | 宣言件数を自由文から拾うため、表記を閉じた一覧に限り、一覧外の表記や二重定義はunknownにする。ruleのengine・`helix gate`配線は作らない | 新世代の6本文は件数を地の文で書くため、確信の低い抽出をviolationにしない。旧engineと旧CLIは実行しない |
| LEGACY-ASSET-ED86DAA9D6A1511A591C／`src/lint/pin-chain-derivation.ts:6-7`（`deterministic_pin`／`semantic_review_pin`）、`:127-131`、`:165-169`（記録値とlive値の比較でstale） | 記録値（recorded）と実値（live）を照合し、決定論的なpinだけを機械で判定する | pin JSONの`path`＋`sha256`／`bytes`／span、`formal_body_raw`を対象にし、`requires_reassessment`の代わりにviolation／unknownを返す。意味のpinは扱わない | 現行の判断記録・pin JSONの形に合わせる。意味の再評価はreviewが行う |
| LEGACY-ASSET-6CC1A5B9E9472F1100AF／`src/doctor/check-registry.ts:11`（`hard`／`advisory`）、`:22-23`、`:39-40`（`registeredHardCount`／`evaluatedHardCount`）、`:26`（advisoryは判定に参加しない） | 登録した検査と評価した検査の照合、hardとadvisoryの分離、advisoryを判定に入れないこと | 件数だけでなくIDの集合も照合し、食い違いを全体unknownにする。照合結果を実行ごとのreceiptに残す | PLAN-L7-428の教訓（下記）。評価漏れを合格へ縮退させない |
| LEGACY-ASSET-9B572F6E5E5E57606D81／`src/lint/rule-drift.ts:16`（`SHARED_MARKERS`）、`:77` | 指示面の間の文言のずれを機械で見る | 固定literalのmarkerではなく、固定revisionの本文との逐語照合にする | 旧はliteral markerだけを見て、伝わっていない規律があってもgreenになった（legacy-crosswalk §18が引くgap-audit ISSUE-07の評価） |
| LEGACY-ASSET-C0F9CE549442BA1D551E／`docs/plans/PLAN-L7-428-enforcement-wiring-gap.md:88-109`（W1：判定module 3本が実行経路から到達不能。unit testだけgreen、`generates:`の存在検査は通過。受け入れは実行routeのtestで示す） | **検査器は配線され、実行された証拠がなければ効いていない**という教訓 | 各実行のreceiptに`registry.registered`／`evaluated`を残し、selftestも毎回全検査を評価してregistered＝evaluatedを確かめる | 旧ではfileの存在とunit testのgreenだけで「実装済み」とされ、circuit breakerが一度も実行されていなかった |
| LEGACY-ASSET-59E7DCC3DF0FDD2DC7C0／`docs/feedback-log.md:16`（FB-001：coverage≠substance） | 件数・ID・link存在を中身の証拠にしない | violation 0件でも承認可を出さず、receiptに`authority_effect: none`と生成しない旨を書く | 件数やIDの検査器が完了の近道になった失敗の再発防止 |

旧HELIXに直接の対応が無い部分（新規案）：固定L2の「失敗時／戻し先」行から作る閉じた語彙と、FVの戻し先の照合（検査4）は、
legacy-crosswalk §18がDAC-R（document-authority-census）の閉じた語彙を近いものとして挙げるだけで、同じ検査は旧に無い。
境界の削除の列挙（検査5）も旧に同じ検査は無い。いずれもviolationにせずunknown／advisoryを多めに出す設計にし、判断はreviewに残す。

## 置換と撤去

正式な物（新世代CIまたはHARNESS-COREのV-pair／層間trace gate）が同じ役割を担った時点で、[SCF-B-0157](../bindings/SCF-B-0157.json)を
`replacing`にし、`scfctl check-replacement`の合格を確かめてから`retire`する。

## しないこと

- 旧HELIXのworkflow・CLI・hook・script・test・CIを実行しない。archiveのcodeを写さない。
- docs/配下の正本（Concept、L1〜L3、L10、L11、判断記録、運用モデル）を編集しない。
- GitHubへ投稿しない。push、merge、Issue操作をしない。
- 検査結果から、L3／L10の承認、合格、merge admission、要求意味、工程完了を生成しない。
