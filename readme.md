# Traitors

A lightweight Flask app for hosting a game of The Traitors with friends. Edit `players.json` with your roster (names, photos, roles), then use the browser UI to mark players as banished or murdered as the game plays out.

Photos go in `static/photos/` — filenames must match the `photo` field in `players.json`.

## Setup

```
make install
```

Creates a `.venv` and installs Flask.

## Run

```
make run
```

Then open http://127.0.0.1:5000.

## Reset the game

Sets every player's status back to `active`:

```
make reset
```
