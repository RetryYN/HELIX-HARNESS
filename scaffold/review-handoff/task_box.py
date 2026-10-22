#!/usr/bin/env python3
"""Atomic manifest dispatch and serial claim gating for GUI mailbox work."""
import copy
import re

import packet as p

SCHEMA = "scaffold-task-box.v1"
MAX_CHILDREN = 5


def digest(value):
    return p.sha(p.encode(value))


def validate_manifest(manifest, validate_child):
    """Validate manifest shape and every exact v1 packet using packet.py callback."""
    p.require(isinstance(manifest, dict) and set(manifest) == {
        "schema", "evidence_kind", "authority_effect", "box_id", "lanes"
    }, "box field不一致")
    p.require(manifest["schema"] == SCHEMA and manifest["evidence_kind"] == "scaffold"
            and manifest["authority_effect"] == "none", "box authority不一致")
    p.require(isinstance(manifest["box_id"], str)
            and re.fullmatch(r"[A-Za-z0-9_-]{1,100}", manifest["box_id"]), "box_id不正")
    p.require(isinstance(manifest["lanes"], list) and manifest["lanes"], "lanesが必要")
    ids, total = set(), 0
    for lane in manifest["lanes"]:
        p.require(isinstance(lane, dict) and set(lane) == {"mode", "wait_for", "requests"}, "lane field不一致")
        p.require(lane["mode"] in ("parallel", "serial") and lane["wait_for"] in ("merge", "result"),
                "lane mode/wait_for不正")
        p.require(isinstance(lane["requests"], list) and lane["requests"], "lane requestsが必要")
        for request in lane["requests"]:
            p.require(isinstance(request, dict) and request.get("schema") == "scaffold-work-request.v1",
                    "child v1 packetが必要")
            p.require(isinstance(request.get("request_id"), str) and request["request_id"]
                    and request["request_id"] not in ids, "request_id不正または重複")
            ids.add(request["request_id"])
            validate_child(request)
            total += 1
            p.require(total <= MAX_CHILDREN, "box child上限は5件")
    return digest(manifest)


def _walk(box):
    for lane in box["lanes"]:
        for child in lane["children"]:
            yield lane, child


def send_box(data, manifest, send_child):
    """Callback is (staged_data,event_id,exact_v1_request); commit only after all sends pass."""
    manifest_sha = validate_manifest(manifest, lambda child: p.validate_work(child, child["base_sha"]))
    old = data.get("task_boxes", {}).get(manifest["box_id"])
    if old:
        p.require(old["manifest_sha256"] == manifest_sha, "box_idの異なる再利用")
        return [copy.deepcopy(data["messages"].get(row["event_id"], row)) for row in old["dispatch"]]
    staged, rows, sent, ordinal = copy.deepcopy(data), [], [], 0
    owner, receiver_session = None, None
    for lane_index, lane in enumerate(manifest["lanes"]):
        children = []
        for request in lane["requests"]:
            identity = (request["dispatcher"], request["worker"])
            p.require(owner is None or owner == identity, "box内dispatcher/worker不一致")
            owner = identity
            event_id = "%s-%d" % (manifest["box_id"], ordinal)
            message = send_child(staged, event_id, request)
            payload = message.get("payload", {})
            p.require(payload.get("event_id") == event_id and payload.get("request") == request
                    and payload.get("receiver_runtime") == request["worker"], "send child binding不一致")
            identity_session = payload["receiver_session"]
            p.require(receiver_session is None or receiver_session == identity_session, "box内worker session不一致")
            receiver_session = identity_session
            child = {"event_id": event_id, "request_id": request["request_id"],
                     "payload_sha256": request["payload_sha256"], "base_sha": request["base_sha"],
                     "references_sha256": digest(request["references"]), "worker": request["worker"],
                     "dispatcher": request["dispatcher"], "session": payload["receiver_session"],
                     "status": "active" if lane["mode"] == "parallel" or not children else "waiting"}
            children.append(child)
            sent.append(copy.deepcopy(message))
            ordinal += 1
        rows.append({"lane_index": lane_index, "mode": lane["mode"], "wait_for": lane["wait_for"],
                     "children": children})
    box = {"box_id": manifest["box_id"], "manifest_sha256": manifest_sha,
           "lanes": rows, "dispatch": [{"event_id": m["payload"]["event_id"], "digest": m["digest"]}
                                        for m in sent], "created": min(m["created"] for m in sent)}
    staged.setdefault("task_boxes", {})[manifest["box_id"]] = box
    data.clear()
    data.update(staged)
    return copy.deepcopy(sent)


def can_claim(data, event_id):
    """Inactive serial children are skipped; non-box work keeps existing behavior."""
    for box in data.get("task_boxes", {}).values():
        for _, child in _walk(box):
            if child["event_id"] == event_id:
                return child["status"] == "active"
    return True


def info(data, event_id):
    for box in data.get("task_boxes", {}).values():
        for lane, child in _walk(box):
            if child["event_id"] == event_id:
                return {"box_id": box["box_id"], "lane_index": lane["lane_index"], "mode": lane["mode"],
                        "wait_for": lane["wait_for"], "request_id": child["request_id"],
                        "status": child["status"]}
    return None


def cleanup(data, active_event_ids, now, retention):
    """Keep assignments; remove released boxes after the existing retention period."""
    boxes = data.get("task_boxes", {})
    for box_id, box in list(boxes.items()):
        pending = any(child["event_id"] in active_event_ids
                      for lane in box["lanes"] for child in lane["children"])
        if pending:
            box.pop("closed_at", None)
        else:
            box.setdefault("closed_at", now)
            if now - box["closed_at"] >= retention:
                del boxes[box_id]
    if not boxes:
        data.pop("task_boxes", None)
