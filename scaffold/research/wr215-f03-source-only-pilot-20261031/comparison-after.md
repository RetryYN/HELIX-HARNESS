# WR215 F03 比較後監査

対象はL5↔L8の1 V-pairに関連づくL9の2 synthetic witnessである。source-only記録を固定した後にL4/L5/L8/L9の該当class・case・witnessだけを照合した。比較前artifactは読み替えず、期待値に合わせて変更していない。

## 2 witnessの対応

| witness | 入力理由 | 既存class / axis / state / backflow owner | Reverse候補・個別trigger・ticket候補 | 実ticket / 実Reverse |
|---|---|---|---|---|
| `H003-F03-ORIGIN-MISSING` → `H003-L8-F03-ORIGIN-MISSING` | `origin`をnull化。変更の正規由来が不明 | `F03_REQUIRED_PAIR_MISSING` / `pair_trace` / `missing` / `HARNESS` | Full Reverse recovery candidate / `origin_missing` / Reverse候補（発行ownerはOS） | false / false |
| `H003-F03-TRACE-MISSING` → `H003-L8-F03-TRACE-MISSING` | `trace`を空にする。pair間のtrace辺が欠落 | `F03_REQUIRED_PAIR_MISSING` / `pair_trace` / `missing` / `HARNESS` | Full Reverse recovery candidate / triggerなし / ticket候補なし（issuer fieldの意味上ownerはOS） | false / false |

両witnessの共通classはpair/trace証拠がmissingであることを表す。入力理由、source packet identity、trigger、ticket候補は各witness内に残す。class一致だけでfindingやactual incidentをdedupしない。packet identityは異なるsynthetic fixtureだが、共通のfixture revision/scope/ownerを使っており、別の実incidentまたは独立した実観測を立証しない。

L4の`F03_TICKET_REVERSE_EFFECT_CONFLICT`（axis `actual_ticket_reverse_effect`、state `conflict`、owner `OS`）は、実ticket発行またはReverse実行を通常照合から生成した時の分類である。2 witnessとも実ticket/実Reverseはfalseなので該当しない。候補値と実作用を混同しない。

## 固定source-only artifactとの一致・限界

固定artifactは由来不明とtrace欠落を別理由として保持し、両方に全体Reverse復旧候補を残した。この意味は既存L9期待と一致する。artifactは個別trigger・ticket候補の具体値を確定しなかったため、origin側の`origin_missing`/Reverse ticket候補とtrace側のtriggerなし/ticket候補なしは、比較後の追加情報である。artifactがこのfieldを誤って予測した、または独立に確定したとは扱わない。

class群、axis/state/owner、実作用は既存L4/L5 classと一致し、追加class差分はない。source-only導出の後に期待を参照した履歴を固定していることが本記録の再利用価値であり、既存2-row表の複製ではない。現行L8へのpointer追加も行わない。既存L8は各caseのL5 contract・L9 mutation・input/expectedに明示参照を持ち、source-only artifactはL8 algorithmやoracleの一部ではない。

## 読取範囲と逸脱

意図した比較対象はL4/L5のF03 class/rule、L8の上記2 case、L9の対応するnegative witnessである。先の読取で、L8の該当2 caseを表示する際に`cases`配列全体をtoolへ渡し、出力が大きく切り詰められた。未対象caseの内容はこの比較判断に使わず、本bundleへ転記しない。

旧失敗sourceを探す初回の文字列検索でもL4/L5/L8/L9 JSONを対象に含めてしまい、出力にL5の埋込`logical_source_code`が含まれた。algorithmは実行せず、その出力・内容を比較判断や本bundleの根拠に使わない。旧sourceと失敗記録の根拠は、README記載の特定Markdown path/行を直接読んだ内容だけに限定した。

rootがbase 4beeで静的child 223 failuresを測定し、対象4文書のbase 51ebeとのbytes一致を確認した。これは4-way成立や223個の独立した意味欠陥を意味しない。4-way marker、case ID、input、既存expected、algorithmは変更していない。

## 静的な再確認案

1. 固定source-only artifactのSHA-256が`0f388cac639d6b1e056ec263849d0b133cc7e2b68b4bca2695b691d3d9bd7800`と一致すること。
2. 各case IDが個別のmutation・reason・class refへ対応し、共通class投影でtrigger/ticket候補を潰さないこと。
3. 実ticket/実Reverseがfalseのままで、候補値をactual effectへ昇格しないこと。
4. SCF Bindingの形式・upstream hashを静的確認すること。

この記録ではalgorithm、旧runtime/test/CI、formal L8/L9検証を実行していない。
