# pending Reverse pairing／dependency readiness要件

## 1. Authority

本書は要件定義書v1.3のL1〜L12、Reverse backfill、PLAN dependency fail-closeを具体化するL3要件である。
旧v1.2の双方向`requires`固定はcurrent PLAN生成契約ではなく、legacy PLANを読み取るcompatibility inputとする。

## 2. 機能要件

- `PRP-FR-001`: `kind=add-impl`と対応する`kind=reverse`は双方向にexact PLAN identityを保持する。
- `PRP-FR-002`: Reverseが`status=draft`かつ`backfill_state=pending_reverse`の間は、Forward／Reverse双方の
  `dependencies.references`をpairing正本とする。
- `PRP-FR-003`: pairing link identityをexecution dependencyと同一視せず、未終端ReverseをForwardの
  `dependencies.requires`へ推測・昇格しない。
- `PRP-FR-004`: Reverseがconfirmed以降へ遷移してもpair identityを保持し、fullback終端時のdependency化は
  PLAN dependency readinessと当該Reverse状態が許す場合だけ行う。

## 3. 受入条件

- `PRP-AC-001`: draft／pending Reverseの双方向`references`はbackfill pairingを満たす。
- `PRP-AC-002`: 片方向reference、wrong Reverse ID、`draft`と`pending_reverse`の不一致、archived linkを拒否する。
- `PRP-AC-003`: pending Reverseを`requires`へ自動変換せず、dependency readinessの一般規則を緩和しない。
- `PRP-AC-004`: enforcement境界以前のlegacy `requires` pairingをinput-onlyで読めるが、current生成物へ再出力しない。
