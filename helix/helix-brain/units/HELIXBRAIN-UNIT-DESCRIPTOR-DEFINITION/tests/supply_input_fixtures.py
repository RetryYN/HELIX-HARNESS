"""BRAIN032の合成入力を読む。変異・期待値・製品の判定は所有しない。"""

import copy
import json
from pathlib import Path


# tests→unit→units→helix-brain→helix→repository。起動cwdへ依存しない。
L8_PATH = Path(__file__).resolve().parents[5] / (
    "docs/helix-brain/L8-unit-verification/template-semantic-supply.json"
)


# L8から撤去した入力材料のL7側の置き場。撤去前revisionの値をそのまま持つ。
MATERIALS_PATH = Path(__file__).resolve().parent / "fixtures" / "supply-input-materials.json"


def load_document():
    """同じL8正本をUTF-8 JSONとして読む。cacheやfallbackは持たない。"""
    return json.loads(L8_PATH.read_bytes().decode("utf-8"))


def load_materials():
    """L7のtest材料をUTF-8 JSONとして読む。cacheやfallbackは持たない。"""
    return json.loads(MATERIALS_PATH.read_bytes().decode("utf-8"))


def base_input(document):
    """case間で変異が漏れないように正常対照の独立コピーを返す。

    正常対照の入力はL8から撤去済みのため、L7のtest材料から読む。
    documentはcase行の参照用に受け取るが、入力の取得には使わない。
    """
    return copy.deepcopy(load_materials()["normal_control_input"])
