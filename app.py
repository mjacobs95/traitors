import json
from pathlib import Path
from flask import Flask, jsonify, render_template, request, abort

ROOT = Path(__file__).parent
PLAYERS_FILE = ROOT / "players.json"
STATE_FILE = ROOT / "game_state.json"

VALID_STATUSES = {"active", "banished", "murdered"}
VALID_STAGES = ("T1", "RT1", "N1", "T2", "RT2", "N2", "T3", "RT3", "N3", "FT", "F")
DEFAULT_STAGE = "T1"

app = Flask(__name__)


def load_players():
    with PLAYERS_FILE.open() as f:
        players = json.load(f)
    for p in players:
        p.setdefault("shielded", False)
    return players


def save_players(players):
    with PLAYERS_FILE.open("w") as f:
        json.dump(players, f, indent=2)


def load_state():
    if not STATE_FILE.exists():
        return {"stage": DEFAULT_STAGE}
    with STATE_FILE.open() as f:
        return json.load(f)


def save_state(state):
    with STATE_FILE.open("w") as f:
        json.dump(state, f, indent=2)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/state")
def get_state():
    return jsonify({"players": load_players(), "stage": load_state()["stage"]})


@app.route("/api/stage", methods=["POST"])
def set_stage():
    data = request.get_json() or {}
    stage = data.get("stage")
    if stage not in VALID_STAGES:
        abort(400, f"stage must be one of {VALID_STAGES}")
    state = load_state()
    state["stage"] = stage
    save_state(state)
    return jsonify(state)


@app.route("/api/player/<player_id>/status", methods=["POST"])
def set_status(player_id):
    data = request.get_json() or {}
    status = data.get("status")
    if status not in VALID_STATUSES:
        abort(400, f"status must be one of {VALID_STATUSES}")
    players = load_players()
    for p in players:
        if p["id"] == player_id:
            if status == "murdered" and p.get("shielded"):
                abort(400, "shielded players cannot be murdered")
            p["status"] = status
            if status != "active":
                p["shielded"] = False
            save_players(players)
            return jsonify(p)
    abort(404, f"unknown player: {player_id}")


@app.route("/api/player/<player_id>/shield", methods=["POST"])
def set_shield(player_id):
    data = request.get_json() or {}
    shielded = bool(data.get("shielded"))
    players = load_players()
    for p in players:
        if p["id"] == player_id:
            if shielded and p["status"] != "active":
                abort(400, "shield only applies to active players")
            p["shielded"] = shielded
            save_players(players)
            return jsonify(p)
    abort(404, f"unknown player: {player_id}")


@app.route("/api/reset", methods=["POST"])
def reset():
    players = load_players()
    for p in players:
        p["status"] = "active"
        p["shielded"] = False
    save_players(players)
    save_state({"stage": DEFAULT_STAGE})
    return jsonify({"players": players, "stage": DEFAULT_STAGE})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
