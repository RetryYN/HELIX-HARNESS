"""BRAIN032の局所入力検証。実TDDで同じ公開関数を段階的に形成する。"""


def validate_supply_input(raw: object) -> dict[str, object]:
    """公開返却carrierのみ。診断/decoder/資格処理はまだ未実装。"""
    return {"input": None, "input_issues": [], "unusable_source_refs": []}
