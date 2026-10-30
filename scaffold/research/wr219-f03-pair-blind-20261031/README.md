# WR219 F03 pair/trace witness source comparison

status: scaffold（source comparison evidence; no authority effect）
authority_effect: none

## 範囲

固定artifact `wr219-f03-pair-blind.json`（SHA-256 `489d2aa4786436b7cfc10b3dc4be9f2c5019727c60291d82293822e341fe60e4`）の2 synthetic mutationを、固定base `a0ce1ce787cff3b61664c12d62ae471969edb433` のL8/L9 F03期待値と比較した。`origin=null` と `trace=[]` は別入力・別観測として保つ。再確認した`git ls-remote origin refs/heads/main`の実値は同じ`a0ce...`であり、このrevisionを比較sourceとした。d88b9b等のPR headはmainとして扱わない。

## 観察

- 両caseは`Full Reverse recovery candidate`、`Provisional` ceilingを期待し、実ticket発行・Reverse実行・acceptance・release・completionはfalse。候補と実作用の区別は固定artifactと整合する。
- `origin=null` caseは`reverse_trigger_materials=[origin_missing]`、`reverse_ticket_candidate=Reverse`。`trace=[]` caseは同じFull Reverse scope candidateだが、trigger materialsは空、ticket candidateは`none`。
- 固定L3はorigin不明とtrace欠落をFull Reverse recovery candidateに含める。L10は両入力を別々に照合し、triggerの違いを追えることを期待する。一方、L3のticket発行条件の列挙はorigin欠落を明記するが、trace欠落を独立したticket発行条件としては明記しない。このため、trace caseの空trigger/none ticketを誤りとも正しいとも確定しない。差異として保持する。
- 両caseのpair resultとL9 10観点は`supported_synthetic_condition`。これは合成fixtureの期待値であり、実pair成立・検証成功ではない。L3/L10だけからpair別値は決まらない。
- 固定baseのL8/L9 caseには`F03_REQUIRED_PAIR_MISSING`の同一negative-class annotationがある。L9のassignment auditは候補annotationをchecker passと見なさず、独立oracle未reviewと記録している。承認済みL3/L10はcodeやownerを定めていないため、正式taxonomyとして扱わない。

## 決まらないこと

具体的なfinding code／state／owner／serialized shape、pair結果の実証性、trace欠落時に個別ticket candidateを立てる条件は、参照sourceだけでは一意に決まらない。既存L4/L8/L9期待値、分類、要求意味を変更しない。原因、trigger、candidate、実ticketを同一視しない。

## 禁止範囲

L4/L5 algorithm本文の実行、旧runtime/test/CI、またはL8/L9 expectedの実行・生成は行わない。本資料から新しい要求、gate、正式classificationを作らない。

## Remote revision と全negative棚卸し

比較source選定時の `git ls-remote origin refs/heads/main` は `a0ce1ce787cff3b61664c12d62ae471969edb433` を返した。後日の再照合ではremote mainは `a53f04482ff883decf1019dc9c212ab712271749`。比較対象は引き続き固定base a0ceであり、後発revisionを混ぜていない。

全negative棚卸しは [Issue #3510 comment 6531272911](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6531272911) を参照。a0ce snapshot（対象4文書が同一bytesとなるsnapshot commit `51ebe7e7e563cdc85607f72fdc234e1c7f665a70`）ではL9 negative 182件中113件assigned、69件unassigned。F03は39件中16件assigned、23件unassigned。この比較の対象2件はF03のmembershipに含まれる。文字列・codeの集計は意味の一致や不在を証明しない。

## 旧HELIX対応と同種失敗

対応する旧資産は `LEGACY-ASSET-34DF3B535879CC73FA86`、旧path `docs/process/forward/L08-L14-verification-phase.md`（archive path `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）。旧記述はleft-armのtest basis/conditionとright-armのverification evidenceのtraceability、およびL3↔L10等のpair対応を扱う。保持するのは要求側条件と検証側evidenceを対応づけて追えるという役割。変更するのは旧gate番号・旧pass規則を移植せず、現行L3/L10 authorityと本scaffoldの限定的なsource comparisonに留める点。理由は現行の承認済み要求・verification sourceを直接根拠とし、旧番号や旧runtimeから要求意味・gateを生成しないため。

同種失敗の監査資産は `LEGACY-ASSET-A127DEC3EEE6ED63CF17`、`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872`）。UTW-005はPR trace/review evidenceが最新HEAD/merge-baseへ継続的に再結合されない問題、UTW-024はsource refsとrequirement traceがcurrent receiptとして閉じない問題を記録する。本比較では選択revision、source path/pointer、SHA、synthetic witnessと分類注釈を一緒に固定する点を保持し、過去監査のfailure codeや規則は移植しない。理由は今回の差分照合の再現性を支えつつ、旧失敗から新たな製品要求・gate・正式classificationを起こさないため。

固定blind導出artifactは同bundleの `blind-derivation.json` にbyte単位で保全し、元artifactとのSHA-256一致を確認する。comparison summaryのSHAはSCF bindingのverification evidenceに記録する。これらの比較資料はscaffold内artifactであり、SCF upstream sourceではない。
