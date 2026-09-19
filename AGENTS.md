# HELIX 新世代 AI 作業規則

## 必須入口

作業前に[新世代作業入口](docs/governance/new-generation-start-here.md)を読み、対象製品、authority状態、
現在の層、許可された操作、停止条件を確認する。

## 現在の境界

- 日本語で報告し、人間向け文書は日本語で書く。
- Concept → 対象別L1 → L2／L11 → L3／L10 → 下流pairの順を飛ばさない。
- GitHub、Issue、PR、CI、DB、memory、会話から要求意味・承認・完了を生成しない。
- `archive/legacy-generation-2026-09-14/`内の旧workflow、CLI、hook、adapter、source、test、設定を実行しない。
- 旧資産は意味、判断史、failure、consumerを調べるreferenceとしてだけ読み、新世代のbaseline、oracle、fallbackにしない。
- 新世代CIは未構築である。旧CIを動かさない。
- reviewer名や「reviewを通す」という依頼から実行通路を推定しない。GitHub、CLI、API、IDE、Workerの各通路は明示許可が必要である。Capability Leaseの対象PRでは、review依頼・delivery receipt・応答commentの投稿を、対象PRへのcomment作成だけを行う投稿command（`scaffold/lease/leasepost.py`）に限り、POは実行環境にこのcommandとexecutor command（`scaffold/lease/leasectl.py`）だけを許可する（例外は、非常経路と再bootstrapで`recovery`へ対象を引数に固定して許可する非常用commandと、AI側の各runtimeへ許可する削除不能の実測commandだけ）。GitHub APIへの直接書込み、他のPR・Issueへの書込み、comment編集・削除は許可しない。leaseの有効化の前に限り、準備command（`scaffold/lease/leaseboot.py`。状態Issueと試験PRの作成、実測の実行だけで、mainへは押せない）と、POがrootで1回実行する`scaffold/lease-bootstrap/install.sh`を許可してよい。有効化の後はこの準備commandは動かない。
- PR作成・修正側はreview依頼と指摘対応までを担い、merge、post-merge read-after、対応Issueのcloseを実行しない。exact HEADのreviewを完了し、merge／close通路を明示許可されたレビュー対応側（作成側と異なるcontextのruntime。人を含めない）が、merge admission確認後にmergeとcloseを行う。有効な`merge_executor` leaseを持ち、作成側・reviewerと異なるcontextの主体は、leaseの条件を満たしたPRを人間の追加確認なしでmergeしてよい。人間が担うのは意味の判断と実行環境の許可設定・取消し・lease停止であり、PRをmergeしない。この責務割当は通路の明示許可を代替しない。
- 未承認、missing、unknown、conflict、staleでは下流実装へ進まない。仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く。正式な物が入ったら`scfctl check-replacement`→`retire`で置換・撤去し、残留を残さない。
- secrets、PII、credentialsを書かない。不可逆操作、外部公開、release、deploymentは対象と作用を明示した許可を要する。

## 編集と検証

対象ファイルを読んでから編集する。上流整理中の検証は文書revision、ID対応、参照、責務境界の静的確認に限定する。
既存CI、archive内test、archive内runtimeを完了証拠にしない。
