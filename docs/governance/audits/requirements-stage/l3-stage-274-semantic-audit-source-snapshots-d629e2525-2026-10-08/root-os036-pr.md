非upgrade Retrofitをupgrade専用preflight順序の対象外とする際、固定L11が保持を求める既存HARNESS検証義務とread-only verify policyの条件がL3/L10で欠けていたため補完します。

AC036-03、非upgrade正常対照、義務欠落/policy抑止の独立negativeを追加し、NFRではupgrade coverageとは別集計にしました。固定親・owner・版・適用policy・閾値を変更しません。旧sourceと6本文SHAを監査へ記録しています。

検証: Root全差分/監査/固定親と旧根拠実読、6本文前後SHA、scfctl validate147/0・stale0・diff check。fixture未実行、独立review未実施。274親全体は未完。