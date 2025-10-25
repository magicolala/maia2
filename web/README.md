# Interface Web Maia‑2 — Guide d’utilisation

Interface web pour tester Maia‑2, visualiser une position FEN, configurer l’ELO et obtenir les meilleurs coups et la probabilité de gain.

## Fonctionnalités
- Design moderne et responsive
- Échiquier visuel (position FEN)
- Sélection du modèle (Rapid/Blitz) et du dispositif (CPU/GPU)
- Prédictions en temps réel: probabilité de gain + top coups
- API REST simple pour l’intégration

## Prérequis
- Python 3.8+
- Dépendances Maia2 installées en mode éditable
- Flask et Flask‑CORS

## Installation
1) Installer les dépendances web
```bash
pip install -r requirements-web.txt
```

2) S’assurer que `maia2` est installé (à la racine du dépôt)
```bash
cd ..
python -m pip install -e .
```

Astuce: utilisez un environnement virtuel (`python -m venv .venv && . .venv/bin/activate` sous Unix, `.venv\Scripts\activate` sous Windows).

## Démarrage
Depuis le dossier `web/`:
```bash
python app.py
```

Ouvrez ensuite `http://localhost:5000` dans votre navigateur.

## Utilisation
1) Initialiser le modèle
- Choisissez le type: Rapid ou Blitz
- Choisissez le dispositif: CPU ou GPU
- Cliquez sur « Initialiser le Modèle » puis attendez l’état « Modèle prêt »

2) Charger une position
- Par défaut: position initiale
- Personnalisée: entrez une FEN puis « Charger Position »

Exemple de FEN:
```
rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
```

3) Régler les paramètres
- ELO joueur actif et ELO adversaire (800–2800 conseillés)
- Nombre de coups suggérés (top‑K)

4) Lancer la prédiction
- Cliquez sur « Prédire »
- Consultez la probabilité de gain et les meilleurs coups avec leurs probabilités

5) Réinitialiser
- Cliquez sur « Réinitialiser » pour revenir au début

## API
Base URL: `http://localhost:5000/api`

- POST `/api/init`
  - Initialise le modèle
  - JSON: `{ "model_type": "rapid"|"blitz", "device": "cpu"|"gpu" }`

- POST `/api/predict`
  - Prédiction pour une FEN
  - JSON: `{ "fen": "...", "elo_self": 1500, "elo_opponent": 1500, "top_k": 5 }`

- GET `/api/status`
  - État d’initialisation et configuration

- POST `/api/validate_fen`
  - Valide une chaîne FEN
  - JSON: `{ "fen": "..." }`

## Dépannage
- Serveur ne démarre pas
  - `pip install -r requirements-web.txt`
  - Vérifiez que le port 5000 est libre

- Erreur d’initialisation
  - `python -m pip install -e .`
  - Sur GPU, confirmez CUDA dans PyTorch
  - Essayez `device=cpu`

- Prédiction échoue
  - Initialisez d’abord le modèle
  - FEN valide (utilisez « Charger Position » ou `/api/validate_fen`)
  - ELOs dans la plage 800–2800

## Compatibilité
- Chrome, Firefox, Edge, Safari récents (desktop et mobile)

## Remarques
- Les gros artefacts (modèles, checkpoints) ne doivent pas être versionnés
- Une app React d’exemple existe dans `react-app/` (non requise pour cette interface)

