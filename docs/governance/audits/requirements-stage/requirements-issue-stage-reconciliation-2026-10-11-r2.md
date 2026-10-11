# 残る要求Issueの独立照合追補

初回[照合JSON](requirements-issue-stage-reconciliation-2026-10-11.json)は時点証拠として保持する。[r2 JSON](requirements-issue-stage-reconciliation-2026-10-11-r2.json)は[独立review](https://github.com/RetryYN/HELIX-HARNESS/pull/2899#issuecomment-6108054870)で特定した具体不足を追記した後継証拠で、source原文/carry/prior join/input pinsは変更しない。

- F1（#1852）：NFR-16/FR-L1-44の途中導入・初回不整合でproject全体を止めない・段階移行の保証が019に不足。
- F2（#1854）：FR-L1-02の実装前Red→本体実装Greenと既決015の順序差が、旧要求を明示した人間判断として未解消。

他の19行は要求粒度の具体不足なしという独立結果を結ぶ。全source形式移管や旧consumer/schema完成を主張しない。FR24の元作業との意味関係、FR30のVisual/token/a11y/回帰/UX、13IR+TR03の対象decisionはreview本文の根拠から読む。過去join行の未採択表示を現在の状態へ流用しない。

[固定判断案](../../crosswalks/requirements-resolution-packet.md)のONBOARDINGとREDFIRSTが対象。未回答を採択とせず、#1852/#1854はOPENを維持する。#1853は2896統合で既存残条件を充足、#1857は2898統合後に残条件を照合し、別criteriaでreview側がcloseする。

4件の既決判断・canonical・MPR・carry・Bindingは変更しない。全source意味対応#1813、親#1814/#1815、L3以降#2846は別範囲で保持する。
