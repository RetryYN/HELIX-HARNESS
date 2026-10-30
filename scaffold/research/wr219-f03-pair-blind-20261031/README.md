# WR219 F03 pair/trace witness source comparison

status: scaffold（source comparison evidence; no authority effect）
authority_effect: none

## 範囲と固定source

固定blind導出 `blind-derivation.json` と `/tmp/wr219-f03-pair-blind.json` のSHA-256は `489d2aa4786436b7cfc10b3dc4be9f2c5019727c60291d82293822e341fe60e4`。byte一致を確認した。比較sourceはa0ce1ce787cff3b61664c12d62ae471969edb433。source選択時のremote main観測はa0ce、後日の観測はa53f、2026-10-31の再確認は70499a07825f53f2fbbb85935d9888360a6ad14c。後発revisionは固定比較へ混ぜていない。

全negative assignmentの統計は [Issue #3510 comment 6531272911](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6531272911) に対応し、全体182件のうち113件assigned、69件unassigned。`F03_REQUIRED_PAIR_MISSING` 自体の所属はこの2 witness pairである。全体数をclassの所属数として扱わない。


## 上流で確定する範囲とticket候補の差

固定導出はorigin不明とtrace欠落を別の観測として保持し、双方をFull Reverse復旧候補とする。HARNESSは条件の意味を扱い、実ticket発行はOSの責務であり、候補から実ticketやReverse実行を生成しない。

比較後、origin欠落のL8/L9期待はtrigger `[origin_missing]`、ticket candidate `Reverse` だが、trace欠落はtrigger `[]`、ticket candidate `none` だった。L3の発行条件列挙はtrace欠落を独立したticket発行条件として明記していないため、この差を正誤と確定せず、trace欠落が独立triggerまたはticket candidateを生む条件を未決として残す。Full Reverse復旧候補と実ticket発行を同一視しない。

## 行ごとの比較と未決差異

### `origin=null` — `H003-F03-ORIGIN-MISSING`

- 固定blind導出は局所成功を主張せず、具体的なpair別状態・結果を未定とした。
- L4 `/contracts/3/negative_classifications/0` は `F03_REQUIRED_PAIR_MISSING`、axis `pair_trace`、state `missing`、owner `HARNESS` を定義する。「missingを保持し、反対の成立値で置き換えない」と明記する。
- L8 `/cases/3/cases/4` とL9 `/cases/3/negative_cases/0` は `valley_result` と`pair_result`を`supported_synthetic_condition`、L9 10観点も同値、`meaning_backflow=[]` とする。同じL9行のnegative class assignmentは `F03_REQUIRED_PAIR_MISSING` で、reasonはoriginまたはtraceの必要原材料を直接除去し、pair/trace証拠欠落を期待するとする。
- このclass定義とsynthetic supported値の並存を差異として記録する。synthetic値は実観測・実成立の証明ではない。L9 manual projection auditにこのorigin caseの対応行は見つからなかった。

### `trace=[]` — `H003-F03-TRACE-MISSING`

- 固定blind導出は局所成功を主張せず、具体的なpair別状態・結果を未定とした。
- 同じL4 class定義（`pair_trace` / `missing` / HARNESS）が該当し得るsourceとして存在する。
- L8 `/cases/3/cases/6` とL9 `/cases/3/negative_cases/2` は`valley_result`と`pair_result`を`supported_synthetic_condition`、L9 10観点も同値、`meaning_backflow=[]` とする。同じL9行のnegative class assignmentは `F03_REQUIRED_PAIR_MISSING` のまま。
- さらにL9 `/negative_output_projection_audit/manual_projection_audit_rows/0` は `H003-F03-TRACE-MISSING` のfinding setを`unknown/unformed`（empty setではない）とし、`invalidated_prior_candidate_codes`に`F03_REQUIRED_PAIR_MISSING`を記録する。assignmentとinvalidationを両方保ち、どちらが正しいか決めない。

### 共通の意味境界

L3/L10の承認行だけから具体的なpair結果やcode/state/ownerは決まらない。今回の比較でL4 class定義を別途確認したが、それを根拠にL9のsynthetic値を実成功へ読み替えたり、L4の`missing`を成功へ置換したりしない。L9の`meaning_backflow=[]`も定義上のmissing classやinvalidationを自動的に取り消さない。source間の差異はL4/L9側の後続入力として残す。正式なL4/L9値、expected、assignmentを変更していない。

## PR説明へ反映する要旨

R1で指摘されたL4 class定義、同じwitness行にある`missing`対synthetic supported期待、trace行のL9 invalidationと残存assignmentを比較artifactに追記した。全体の113/182/69と本classの2件を分離した。修正は照合記録だけで、正式sourceの判断・値変更を含まない。L4/L5 algorithm、旧runtime/test/CIは実行していない。

## 旧HELIX対応と同種失敗

対応する旧資産は `LEGACY-ASSET-34DF3B535879CC73FA86`、旧path `docs/process/forward/L08-L14-verification-phase.md`（archive path `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）。旧記述はleft-armのtest basis/conditionとright-armのverification evidenceのtraceability、およびL3↔L10等のpair対応を扱う。保持するのは要求側条件と検証側evidenceを対応づけて追える役割。変更するのは旧gate番号・旧pass規則を移植せず、現行L3/L10 authorityと限定的なsource比較に留める点。理由は、現行の承認済みsourceを根拠とし、旧番号や旧runtimeから要求意味・gateを生成しないため。

同種失敗の監査資産は `LEGACY-ASSET-A127DEC3EEE6ED63CF17`、`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872`）。UTW-005はPR trace/review evidenceが最新HEAD/merge-baseへ継続的に再結合されない問題、UTW-024はsource refsとrequirement traceがcurrent receiptとして閉じない問題を記録する。本比較ではrevision、path/pointer、SHA、blind witness、expected、classification注釈、projection invalidationを同時に記録する。保持は差異の再追跡可能性、変更は旧failure codeや規則を移植しない点。理由は、旧失敗を反復しない監査足場を保ちながら、旧failureから新要求・gate・formal classificationを生成しないため。

固定blind導出artifactは同bundleの `blind-derivation.json` にbyte単位で保全し、元artifactとのSHA-256一致を維持する。comparison summaryのSHAはSCF bindingのverification evidenceに記録する。比較資料はscaffold artifactであり、SCF upstream sourceではない。
