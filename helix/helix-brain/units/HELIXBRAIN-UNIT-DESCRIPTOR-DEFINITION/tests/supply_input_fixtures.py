"""BRAIN032の合成入力を読む。変異・期待値・製品の判定は所有しない。"""

import copy
import json
from pathlib import Path


# tests→unit→units→helix-brain→helix→repository。起動cwdへ依存しない。
L8_PATH = Path(__file__).resolve().parents[5] / (
    "docs/helix-brain/L8-unit-verification/template-semantic-supply.json"
)


def load_document():
    """同じL8正本をUTF-8 JSONとして読む。cacheやfallbackは持たない。"""
    return json.loads(L8_PATH.read_bytes().decode("utf-8"))


def base_input(document):
    """case間で変異が漏れないように正常対照の独立コピーを返す。"""
    return copy.deepcopy(document["fixture_contract"]["normal_control"]["input"])
