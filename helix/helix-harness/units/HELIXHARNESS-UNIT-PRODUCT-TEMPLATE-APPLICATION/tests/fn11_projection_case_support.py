"""Shared builders for FN11 concrete test packets."""

import copy


def base_packet(fixture):
    packet = copy.deepcopy(fixture["input_packet"])
    packet["brain_supply_analysis"]["candidate_refs"] = [
        copy.deepcopy(packet["brain_supply_analysis"]["candidate_refs"][0])
    ]
    packet["core_application"]["universes"] = [
        copy.deepcopy(packet["core_application"]["universes"][0])
    ]
    packet["core_application"]["templates"] = [
        copy.deepcopy(packet["core_application"]["templates"][0])
    ]
    return packet


def ref(**overrides):
    value = {
        "identity": "item-A",
        "revision": "rev-A",
        "scope": {"product": "product-A", "tenant": "tenant-A"},
        "owner": "owner-A",
        "source_locator": None,
        "sha256": None,
    }
    value.update(copy.deepcopy(overrides))
    return value


def add_case(rows, case_id, configure, expected, base):
    packet = base()
    configure(packet)
    rows.append((case_id, packet, expected))
