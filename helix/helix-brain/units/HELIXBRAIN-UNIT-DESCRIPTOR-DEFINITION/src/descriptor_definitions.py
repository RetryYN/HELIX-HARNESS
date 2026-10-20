"""BRAIN032の局所入力検証。実TDDで同じ公開関数を段階的に形成する。"""


def validate_supply_input(raw: object) -> dict[str, object]:
    """root形不正だけを診断する。objectのdecode/資格処理は未実装。"""
    if isinstance(raw, dict):
        raise NotImplementedError("SupplyInput object decoding and source qualification are not implemented")
    return {
        "input": None,
        "input_issues": [{
            "locator": "",
            "reason": "SupplyInput root must be an object.",
            "source_ref": None,
        }],
        "unusable_source_refs": [],
    }
