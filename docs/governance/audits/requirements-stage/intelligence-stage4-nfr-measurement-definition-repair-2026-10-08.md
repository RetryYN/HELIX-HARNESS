# INTELLIGENCE Stage 4 NFR/NFRV計数定義の修正記録

- 種別: 時点監査・本文修正根拠
- authority effect: none
- 対象base: `9229f59edc36b8396ea99bde5f6f903b35c1ccdf`
- 対象scope: HELIX-INTELLIGENCE Stage 4。L3 `nfr-grade.md` と対のL10 `nfr-verification.md` に限定。
- 修正前の具体的な曖昧さ: NFR GradeのStage 4共通段落は、field matrixの宣言field数をcoverage分母とし「未見normal fixtureとnegative fixtureを分ける」としていたが、normal source-boundの充足測定とnegative mutationの期待oracle適合を別々に集計する定義がなかった。L10側もCASE一覧・fixture・required fieldの関係を明示していなかった。このため、負例の正しい拒否をnormal coverageの成功に入れる誤集計、または正しい拒否をnormal coverageの失敗にする誤集計を防げなかった。
- 修正後の区別: (1) normal source-bound coverageは、個々のfixture/runの期待oracleが入力を受け入れるpositive runについて、固定L2/L11で適用されるrequired fieldのうち正しいsource/revision/scope/ownerへ束縛されたfield数を、同じpositive runに適用されるrequired field数で割る。(2) negative runは、missing/unknown/stale/mismatch/conflict等について期待状態・拒否・owner戻し先が観測結果と合うかをCASEごとに別記録する。正しい拒否はnormal coverageの成功にも失敗にも算入しない。分類はCASE群名でなく個々のfixture/runの期待oracleで行う。誤bindは別件数としcoverageで相殺しない。missing等はbound/successに変換せず、未実行・観測不能も独立状態にする。率なしを0件成功に変換しない。
- 具体例: `CASE-INT-036-02p` はpermission自身のrevision/state等を正常に固定し、permission対象target revisionだけをoperation candidateと不一致にする独立negativeである。期待oracleはSECURITYへ戻しoperationを実行可能にしないこと。これは正しく拒否されたとしてもnormal source-bound coverageの成功fieldではなく、negative oracle適合として記録する。対照として `CASE-INT-045-02a` は当該L10表でnormal coverage denominatorから明示的に除外されている。したがってcoverage欠陥の実例としては扱わず、除外scopeを維持したうえで、その期待状態を別記録する境界例とする。`CASE-INT-045-04b` と `CASE-INT-045-02k` も旧注記で分母内とされたが、今回の区分ではそれぞれowner unknown/direct routeのnegative oracleとして評価し、normal coverage成功・失敗には含めない。
- 固定要求への影響: 固定親、要求意味、owner、version、100%候補、誤bind 0候補、閾値、gate、機能CASE本文は変更しない。固定L2/L11の範囲にないSLA、minimum sample、latency、runtime/clock条件は追加しない。新しい承認やL10実行を示さない。
- 旧HELIX起点: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md`（asset `LEGACY-ASSET-DB669724249A14A665F0`、source SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）のlines 21–34, 58–81を読んだ。旧文書の「特性→測定方法→受入条件」という構造だけを再利用し、旧IPA grade、数値閾値、pass条件、旧runtime/CIは再利用していない。現行のsource-bound/negative二軸は固定L2/L11と現行L10 oracleから再導出した。asset disposition entryは `docs/governance/legacy-asset-disposition.jsonl:350`。
- 共通定義の境界確認: 現行 `nfr-verification.md` Stage 2aのNFR-075 matrixはnormal binding fixtureとnegative reason fixtureの双方がある宣言fieldを数えるStage 2a固有候補である。Stage 4のsource-bound coverageとnegative rejectionの関係を定義する共通規則ではないため、Stage 4へ閾値・gateとして流用していない。
- 配置・対応根拠: `docs/governance/l3-l10-authoring-layout.md` は`nfr-grade.md`と`nfr-verification.md`を対応pairとしている。変更はこのpairの計測定義に限定し、残り4本文は変更していない。

## 6本文のSHA-256

SHAはbase revisionと作業後本文の実bytesから計算した。

| 本文 | base 9229f59 | 修正後working tree |
|---|---|---|
| `docs/helix-intelligence/L3-requirements/business-requirements.md` | `026d95fbf023ef384834ebd3b215a469f2fea648190d15d45494b5ea4cc91959` | `026d95fbf023ef384834ebd3b215a469f2fea648190d15d45494b5ea4cc91959` |
| `docs/helix-intelligence/L3-requirements/functional-requirements.md` | `01ceffadc184ead3c5a73e4df4f308610394590630c222a53930e4857ee71c5a` | `01ceffadc184ead3c5a73e4df4f308610394590630c222a53930e4857ee71c5a` |
| `docs/helix-intelligence/L3-requirements/nfr-grade.md` | `a1113329da1b463968b2a67a19692db77c41b0fcdb6bf028ac969d83921066a2` | `c6407848a70cb4dc0c85fd24055f1f0726fe890b96d4608542a135ae8ba49ed5` |
| `docs/helix-intelligence/L10-verification/business-verification.md` | `b476b0939b7da50cf75db66d235095f94e591ac929ef046721224b5112d04552` | `b476b0939b7da50cf75db66d235095f94e591ac929ef046721224b5112d04552` |
| `docs/helix-intelligence/L10-verification/functional-verification.md` | `aa6cb83a2eaeeaf0d4d0fd955698e5071e27c81232ba43a1c3af94918fbccc77` | `aa6cb83a2eaeeaf0d4d0fd955698e5071e27c81232ba43a1c3af94918fbccc77` |
| `docs/helix-intelligence/L10-verification/nfr-verification.md` | `1049e8edef98fd41f1f2c57caff98eebc999e65652e558b42646976e517614a1` | `9675fe8ee19a1f3e910b8f73fa37d0e767f7df1381b3a4f6a79a43542ad91851` |

## 検証と限界

- `git diff --check`: clean。
- 対象変更pathの確認: 上記2本文と本記録のMarkdown/JSONだけを対象とする。
- 文書静的確認: formula, fixture分類、036-02p例、045除外境界の記述を相互照合する。runtime/test/CIは起動しない。
- 未実施: 実L10実行、Opus/Fableの独立再照合、PO事後確認。これらの結果や承認を本記録は主張しない。
