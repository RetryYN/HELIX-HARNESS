"""BRAIN032の局所入力検証。実TDDで同じ公開関数を段階的に形成する。"""

import copy


def validate_supply_input(raw: object) -> dict[str, object]:
    """root形不正を診断する。source照合は次の実TDDの未完成状態。"""
    if isinstance(raw, dict):
        if "sources" not in raw or not isinstance(raw["sources"], list):
            raise NotImplementedError("SupplyInput object decoding is not implemented")
        # 同じ公開carrierで未実装source照合を露出する初期Red版。
        # 資格成功を返すstubではなく、供給sourceをまだ使えないと報告する。
        # nested shape decodeも未完成であり、この版を利用可能にしない。
        return {
            "input": copy.deepcopy(raw),
            "input_issues": [{
                "locator": "/sources",
                "reason": "Source validation is not implemented.",
                "source_ref": None,
            }],
            "unusable_source_refs": [copy.deepcopy(source["ref"]) for source in raw["sources"]],
        }
    return {
        "input": None,
        "input_issues": [{
            "locator": "",
            "reason": "SupplyInput root must be an object.",
            "source_ref": None,
        }],
        "unusable_source_refs": [],
    }
