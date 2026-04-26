import json
from pathlib import Path
from flask import Flask, jsonify, render_template, request, abort

ROOT = Path(__file__).parent
PLAYERS_FILE = ROOT / "players.json"

VALID_STATUSES = {"active", "banished", "murdered"}

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


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/state")
def get_state():
    return jsonify(load_players())


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
    return jsonify(players)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
