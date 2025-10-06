import logging
import os
from threading import Lock
from typing import Optional

import chess
from flask import Flask, jsonify, render_template, request

from maia2 import inference, model


class ModelManager:
    """Thread-safe loader that caches MAIA-2 models and inference helpers."""

    def __init__(self, default_model_type: str = "rapid", device: str = "cpu") -> None:
        self._default_model_type = default_model_type
        self._device = device
        self._model = None
        self._prepared = None
        self._model_type = None
        self._lock = Lock()

    def load(self, requested_model_type: Optional[str] = None):
        model_type = (requested_model_type or self._default_model_type).lower()
        if model_type not in {"rapid", "blitz"}:
            raise ValueError("model_type must be 'rapid' or 'blitz'")

        with self._lock:
            if self._model is None or self._model_type != model_type:
                logging.info("Loading MAIA-2 model", extra={"model_type": model_type, "device": self._device})
                self._model = model.from_pretrained(type=model_type, device=self._device)
                self._prepared = inference.prepare()
                self._model_type = model_type
        return self._model, self._prepared, self._model_type


def _build_app(static_subdir: str = "static", templates_subdir: str = "templates") -> Flask:
    root_dir = os.path.dirname(os.path.abspath(__file__))
    static_folder = os.path.join(root_dir, static_subdir)
    templates_folder = os.path.join(root_dir, templates_subdir)
    app = Flask(__name__, static_folder=static_folder, template_folder=templates_folder)
    app.config["JSON_SORT_KEYS"] = False
    return app


def create_app(default_model_type: str = "rapid", device: str = "cpu") -> Flask:
    """Factory that wires a Flask app exposing the MAIA-2 web interface."""

    app = _build_app()
    manager = ModelManager(default_model_type=default_model_type, device=device)

    @app.get("/")
    def index():
        return render_template("index.html", default_model_type=default_model_type)

    @app.post("/analyze")
    def analyze():
        payload = request.get_json(silent=True) or {}
        fen = (payload.get("fen") or "").strip()
        elo_self = payload.get("elo_self", 1500)
        elo_oppo = payload.get("elo_oppo", 1500)
        requested_type = payload.get("game_type", default_model_type)

        if not fen:
            return jsonify({"error": "Le champ FEN est obligatoire."}), 400

        try:
            chess.Board(fen)
        except Exception as exc:  # python-chess raises ValueError
            logging.warning("Invalid FEN provided", exc_info=exc)
            return jsonify({"error": "FEN invalide. Verifiez la position."}), 400

        try:
            elo_self = int(elo_self)
            elo_oppo = int(elo_oppo)
        except (TypeError, ValueError):
            return jsonify({"error": "Les valeurs ELO doivent etre numeriques."}), 400

        elo_self = max(600, min(3000, elo_self))
        elo_oppo = max(600, min(3000, elo_oppo))

        try:
            loaded_model, prepared, active_type = manager.load(requested_model_type=requested_type)
            move_probs, win_prob = inference.inference_each(loaded_model, prepared, fen, elo_self, elo_oppo)
        except Exception as exc:  # catch torch / download errors
            logging.exception("Inference failed")
            return jsonify({"error": "Impossible de lancer l'inference. Consultez les logs."}), 500

        top_moves = list(move_probs.items())[:5]
        response = {
            "model_type": active_type,
            "player_elo": elo_self,
            "opponent_elo": elo_oppo,
            "win_probability": win_prob,
            "moves": [{"uci": move, "probability": prob} for move, prob in top_moves],
        }
        return jsonify(response)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "model_cached": manager._model is not None})

    return app


__all__ = ["create_app"]

