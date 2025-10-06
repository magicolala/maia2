#!/usr/bin/env python3
"""
Flask server for Maia2 React application
Serves both API endpoints and React build in production
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os

# Add parent directory to path to import maia2
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from maia2 import model, inference

# Determine if we're in production (serving React build)
REACT_BUILD_DIR = os.path.join(os.path.dirname(__file__), 'build')
IS_PRODUCTION = os.path.exists(REACT_BUILD_DIR)

if IS_PRODUCTION:
    # Production: serve React build
    app = Flask(__name__, static_folder='build', static_url_path='')
else:
    # Development: CORS enabled for React dev server
    app = Flask(__name__)

CORS(app)

# Global state
maia_model = None
prepared_data = None
model_config = {
    'type': None,
    'device': None,
    'initialized': False
}


# API Routes
@app.route('/api/init', methods=['POST'])
def initialize_model():
    """Initialize the Maia2 model with specified configuration."""
    global maia_model, prepared_data, model_config
    
    try:
        data = request.json
        model_type = data.get('model_type', 'rapid')
        device = data.get('device', 'cpu')
        
        print(f"Initializing Maia2 model: type={model_type}, device={device}", flush=True)
        
        # Load the model
        maia_model = model.from_pretrained(type=model_type, device=device)
        prepared_data = inference.prepare()
        
        model_config['type'] = model_type
        model_config['device'] = device
        model_config['initialized'] = True
        
        print("Model initialized successfully!", flush=True)
        
        return jsonify({
            'success': True,
            'message': f'Modèle {model_type} initialisé avec succès sur {device.upper()}',
            'config': model_config
        })
    
    except Exception as e:
        print(f"Error initializing model: {e}", flush=True)
        model_config['initialized'] = False
        return jsonify({
            'success': False,
            'message': f'Erreur lors de l\'initialisation: {str(e)}'
        }), 500


@app.route('/api/predict', methods=['POST'])
def predict():
    """Make a prediction for a given chess position."""
    global maia_model, prepared_data, model_config
    
    if not model_config['initialized']:
        return jsonify({
            'success': False,
            'message': 'Le modèle n\'est pas initialisé. Veuillez d\'abord l\'initialiser.'
        }), 400
    
    try:
        data = request.json
        fen = data.get('fen')
        elo_self = data.get('elo_self', 1500)
        elo_opponent = data.get('elo_opponent', 1500)
        top_k = data.get('top_k', 5)
        
        if not fen:
            return jsonify({
                'success': False,
                'message': 'Position FEN manquante'
            }), 400
        
        print(f"Making prediction: FEN={fen}, elo_self={elo_self}, elo_opponent={elo_opponent}", flush=True)
        
        # Run inference
        move_probs, win_prob = inference.inference_each(
            maia_model, 
            prepared_data, 
            fen, 
            elo_self, 
            elo_opponent
        )
        
        # Get top K moves
        top_moves = list(move_probs.items())[:top_k]
        
        result = {
            'success': True,
            'win_probability': win_prob,
            'move_probabilities': move_probs,
            'top_moves': [
                {
                    'move': move,
                    'probability': prob
                }
                for move, prob in top_moves
            ]
        }
        
        print(f"Prediction successful: win_prob={win_prob}", flush=True)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error during prediction: {e}", flush=True)
        return jsonify({
            'success': False,
            'message': f'Erreur lors de la prédiction: {str(e)}'
        }), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    """Get the current status of the model."""
    return jsonify({
        'success': True,
        'initialized': model_config['initialized'],
        'config': model_config
    })


@app.route('/api/validate_fen', methods=['POST'])
def validate_fen():
    """Validate a FEN string."""
    try:
        import chess
        data = request.json
        fen = data.get('fen')
        
        if not fen:
            return jsonify({
                'success': False,
                'valid': False,
                'message': 'FEN manquant'
            }), 400
        
        # Try to create a board from the FEN
        board = chess.Board(fen)
        
        return jsonify({
            'success': True,
            'valid': True,
            'turn': 'white' if board.turn else 'black',
            'message': 'FEN valide'
        })
    
    except Exception as e:
        return jsonify({
            'success': True,
            'valid': False,
            'message': f'FEN invalide: {str(e)}'
        })


# React Routes (Production only)
if IS_PRODUCTION:
    @app.route('/')
    def serve_react():
        """Serve React index.html"""
        return send_from_directory(REACT_BUILD_DIR, 'index.html')
    
    @app.route('/<path:path>')
    def serve_react_app(path):
        """Serve React static files, fallback to index.html for client-side routing"""
        file_path = os.path.join(REACT_BUILD_DIR, path)
        if os.path.exists(file_path):
            return send_from_directory(REACT_BUILD_DIR, path)
        else:
            # For client-side routing, serve index.html
            return send_from_directory(REACT_BUILD_DIR, 'index.html')


if __name__ == '__main__':
    print("=" * 60)
    print("Starting Maia2 Flask Server")
    print("=" * 60)
    
    if IS_PRODUCTION:
        print("Mode: PRODUCTION")
        print("Serving React build from:", REACT_BUILD_DIR)
        print("Application URL: http://localhost:5000")
    else:
        print("Mode: DEVELOPMENT")
        print("API Server: http://localhost:5000")
        print("React Dev Server should be running on: http://localhost:3000")
    
    print("\nPress CTRL+C to stop the server\n")
    print("=" * 60)
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)

