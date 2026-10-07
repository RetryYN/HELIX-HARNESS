# HELIX-OS Stage 3 parent 033 applicability trace補強記録

- base revision: `4084ab11560dc19e5c7bf74ae6df7adcd0e2e9c0`
- 固定親 checkpoint: `633bf12ea8f948db8ba3d6600179c4a9507377a7`（current baseとは別）
- 作業: `codex/os-stage3-033-applicability`、read-only source確認後に6文書を編集。
- 採択親: `MPR-RC-HELIXOS-L2-033-001`、semantic digest `580778c8ef3c0e4c4676d13de203c821f990893e9aa078d8d1d2f0b8901d2dbc`。PO採択行は固定checkpointの決定記録56行。全file/spanのbefore/after SHA-256とbytesは同梱JSONを参照。

## 根拠と変更理由

固定L2-033:934は、選択された各detectorの登録入力に、適用するengine/output種別を含める。旧source HIL-FR-25/26、HAT-HIL-10、HST-HIL-008/009はengine capabilityとdetectorを分け、snapshot再実行・artifact/finding provenanceを維持する起点だが、この適用関係自体は明記していない。ここでは旧sourceへ要件を帰属させず、採択済みL2の明記条件を既存L3/L10 traceへ補った。

## 6文書の差分

|文書|変更|
|---|---|
|`docs/helix-os/L3-requirements/functional-requirements.md`|FR-033に選択detectorとengine/output種別の適用関係を明記。AC-033-02で単独欠落・不一致を拒否し、detector宣言の意味不備とOS登録receiptのみの不備を既存の担当へ分けて戻す。|
|`docs/helix-os/L10-verification/functional-verification.md`|既存CASE-033-02へ3つの独立変異を追加（適用先宣言欠落、宣言と選択対象の不一致、宣言は正しいがOS receiptが欠落・不一致）。他の入力・fieldは正常とし、scope全体の再現成功を拒否する。|
|`docs/helix-os/L3-requirements/nfr-grade.md`|NFR-033候補に宣言・選択対象・OS receiptの一致性を加え、適用関係の欠落・誤結合を再現成功として数えない。新しい数値閾値は設けない。|
|`docs/helix-os/L10-verification/nfr-verification.md`|NFRV-033-01で既存契約の失敗条件と原因別の戻し先を計測する。|
|`docs/helix-os/L3-requirements/business-requirements.md`|BR-033の品質KPIなしを維持し、選択detectorの適用関係を含むOS registry/provenance責務を追跡する。|
|`docs/helix-os/L10-verification/business-verification.md`|BIZ-033でscope限定の再現と未評価を分け、適用関係の不備は未評価のまま既存担当へ戻す。|

CASE-OS-L10-033-01の正常run/rerun条件は不変。CASE-033-02に同じ既存AC配下で独立armを置いた。

- (a) detectorの適用先宣言だけ欠落、他の入力・receiptは正常。scope全体の再現成功を拒否し、既存detector意味ownerへ返す。
- (b) 宣言された適用先だけを選択engine/output種別と不一致にする。全scope成功を拒否し、detector意味ownerへ返す。
- (c) detector宣言と選択対象は一致するが、OS登録receiptだけ欠落または不一致。全scope成功を拒否し、OS登録receipt ownerへ戻す。

各armは対象relation以外のfieldを正常に保ち、原因に応じた既存返却先を区別する。NFR/NFRVは一致性・誤受入を観測し、BR/BVはquality KPIを作らず未評価状態を保持する。新しいfield名・schema・owner・閾値・gate・authority・版・親意味は追加していない。

## 確認

編集前に対象の6文書、固定L2/L11、旧source、asset ledger、AGENTS.md／CLAUDE.md／作業入口／L3-L10著述規則／旧資産再利用規則を読んだ。`git diff --check`とcase/AC/NFR trace・変更境界の静的確認を実施する。テスト、旧CLI/hook/runtime/fixture/test/CIは実行しない。

静的設計確認のみで、L10 fixtureの実行や受入実績は確かめていない。監査対象はOS-033だけであり、他親・全Stage3・全48文書を意味監査済みとはしない。
