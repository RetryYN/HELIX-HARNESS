# G19 作業中のWorker支援を具体化する判断記録

record_id: HDEC-WORKER-SUPPORT-DERIVATION-2026-09-27
status: candidate_derivation_record
authority_effect: none

## 原文と親

[PO原文](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)第5項と[全5項の起点記録](capability-reinforcement-po-decisions-2026-09-27.md)を使う。source SHA-256は `ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8`。前書き1〜4行はClaude、区切り以降はPOである。引用原文をこの記録で要約へ置き換えない。

POが求めたのは、配置先を強いモデルへ変更するだけでなく、同じ軽いモデルが難所を越えられる処理である。配置・権限はOS、必要な知識・相談・分解・修正案はINTELLIGENCE、知識材料はBRAIN/CORE/LABOの既存接続、支援有無の独立比較はLABOへ置く。親L1の現行revisionは候補状態を保ち、起草をその採択としない。

## 旧sourceの読取りと保持・変更

| 旧source | 保持点 | 変更点と理由 |
|---|---|---|
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:147,224`、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | HR-FR-P2-04/HAC-P2-04bの、強い役がtest/oracle・指示を用意→軽い役が実装/相談→review/修正指示→元の軽い役が修正する循環。実装証拠が同時にあっても未回答相談をpassにしない | 旧pair-agent CLI、DB、marker、固定cycle予算を復活せず、OS割当・HARNESS検証義務・INTELLIGENCE支援案へ意味を再導出。支援者と独立reviewの分離は現行OS018/020へ接続し、モデル名だけで独立としない |
| `LEGACY-ASSET-1D32912A9A194FEAA7DE`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/harness-agent-lifecycle.md:34-303`、SHA-256 `894500dee389a2fab00961697bae4baa71427c5ffe1431bbc77592497b2b3fd7` | 版付き役割/入力契約、task scope、限定context、lease・budget・checkpoint、handoffの追跡と失敗保持 | 旧HARNESS所有のagent registry/runtime projectionを移植しない。現行のWorker割当はOSであり、相談による権限移譲や新主体を作らない |
| `LEGACY-ASSET-D4E9C31E6AE7D18CA11D`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/harness-agent-lifecycle.md:27-359`、SHA-256 `7c3fbb7c6f0ea8dcbdb8cdb7e06143331455f48c59263f29f970ae5c79a9e275` | worker/verifier/consult区別、入力/成果/provenance、独立検証への作成側context混入防止 | 旧function/schema/transaction/実装方式は採らない。支援用packetと独立review用packetの目的を区別し、独立性は現行契約で判定 |
| `LEGACY-ASSET-15D88CCE539AA79ED788`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/worker-budget-lifecycle.md:9-55`、SHA-256 `dc366afb9d17229d3d963b4323bb3dad98a39ea0df268847f930cd9385acc8a2` | packetのbudget、停止/期限/未回収を成功にしない、停止までの時間を記録する | process group、exit code、CLI facadeを新要求へ固定しない。OSの累積budgetと停止条件を使い、支援で予算や失敗回数をリセットしない |

方式は意味の再導出である。旧test・hook・runtime・CLI・CIは実行せず、旧sourceの実装済みや成功の記述を現行成立の証拠にしない。旧atomの移管・retireは行わず既存holdingに保持する。今回のreceiptのno_lossは旧atom入力空集合に限る。

## PO条件と候補の対応

| 原文の条件 | 候補・受入への行き先 |
|---|---|
| 必要な設計・コード・過去の失敗例を選んで渡す | INT068の最小context生成と正常/誤り/未見、既存AIDOC/CLRの必須情報保持 |
| 詰まった部分だけ上位へ相談 | INT068の限定相談案、OS028のscope/版/許可付き受渡し |
| 助言を元のWorkerへ戻す、作業分解、修正指示 | INT068の指示候補、OS028の復帰handoff、OS029の一周と検証 |
| 強いモデルがtest/指示→軽いモデルが実装/相談→強いreview→軽い修正 | OS029の構成体と対L11。助言者を独立review扱いせずHARNESS022・OS020へ接続 |
| 同じ軽いモデルでも支援で成立したこと | LABO060の同一model/provider/version/effort設定で支援有無を分離した比較、品質firstと欠測表示 |
| 性能差吸収、低コスト化とは限らない救援 | LABO059/INT067のG13優先入力を再利用し、救援・再作業・人の時間と費用を全体へ計上 |

G9の未評価初回経路は全適格条件が満たされる場合だけ維持する。G10の依存四区分を各候補へ適用し、安全依存や必須情報を任意へ変えない。G11の意味判断済み事項を再質問せず、G12の内容品質を具体的な修正前/後oracleで確認し、G13の同条件比較を使う。G15の設計合成を作り直さず、G18の生成処理を先行実装したとしない。

## 人の判断が残る点

| 原文 | 選択肢 | 推奨 | 影響 |
|---|---|---|---|
| 第5項「同じ軽いモデルでも、HELIXの支援で仕事を成立させる」 | 本文revision採択／支援対象を限定／保留 | 独立review後、元Workerへ戻して事前oracleを満たす条件を含む本文をL11と対で確認 | OS028/029、INT068、LABO060 |
| 終段「段階ごとに構築する対象を選ぶ」 | G8の導出で段階を選択／後段へ保持 | version_target 1.0の要求範囲とv0.1の収載判断を分ける | 上記候補の段階収載。tag/release/配布は発生しない |

作業別の予算・許容悪化・人時間換算等はG13の有効な既存判断を再利用する。未決・失効・scope外に限り対象ownerへ戻し、候補追加を理由に毎run新しい人間承認を求めない。
