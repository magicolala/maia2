# Interface Web Maia2 - Application de Test et Configuration

Interface web moderne de style Google Material Design pour tester et configurer le modèle Maia2.

## 🎯 Fonctionnalités

- **Design moderne Google Material Design** avec animations fluides
- **Échiquier interactif** avec visualisation des positions FEN
- **Configuration complète** du modèle (type, dispositif, ELO)
- **Prédictions en temps réel** avec probabilités de gain
- **Suggestions de coups** classées par probabilité
- **Interface responsive** adaptée à tous les écrans

## 📋 Prérequis

- Python 3.8+
- Les dépendances du projet Maia2 installées
- Flask et Flask-CORS

## 🚀 Installation

1. **Installer les dépendances web** :
```bash
pip install -r requirements-web.txt
```

2. **S'assurer que maia2 est installé** :
```bash
cd ..
pip install -e .
```

## 💻 Démarrage

1. **Démarrer le serveur Flask** :
```bash
python app.py
```

Le serveur démarrera sur `http://localhost:5000`

2. **Ouvrir l'interface** :
- Ouvrez votre navigateur et accédez à `http://localhost:5000`
- Ou cliquez sur le lien affiché dans le terminal

## 📖 Utilisation

### 1. Initialisation du Modèle

1. Dans la barre latérale, sélectionnez :
   - **Type de modèle** : Rapid ou Blitz
   - **Dispositif** : CPU ou GPU

2. Cliquez sur **"Initialiser le Modèle"**

3. Attendez que le statut passe à "Modèle prêt" (vert)

### 2. Configuration d'une Position

#### Option A : Position par défaut
L'échiquier affiche automatiquement la position de départ.

#### Option B : Charger une position FEN
1. Entrez une position FEN dans le champ de texte
2. Cliquez sur **"Charger Position"**
3. L'échiquier se mettra à jour automatiquement

Exemple de FEN :
```
rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
```

### 3. Configuration des Paramètres

- **ELO du joueur actif** : 800 - 2800 (défaut: 1500)
- **ELO de l'adversaire** : 800 - 2800 (défaut: 1500)
- **Nombre de suggestions** : 1 - 10 (défaut: 5)

### 4. Faire une Prédiction

1. Cliquez sur **"Prédire"**
2. Les résultats s'affichent avec :
   - **Probabilité de gain** : barre de progression animée
   - **Top coups suggérés** : classés avec leurs probabilités

### 5. Réinitialiser

Cliquez sur **"Réinitialiser"** pour revenir à la position de départ.

## 🎨 Interface

L'interface est divisée en trois sections principales :

### 1. Header
- Logo et titre Maia2
- Description du projet

### 2. Barre Latérale (Configuration)
- Sélection du modèle et dispositif
- Configuration des ELO
- Position FEN
- Boutons d'action
- Indicateur de statut

### 3. Zone Principale
- **Échiquier** : Visualisation de la position actuelle
- **Résultats** : Probabilités et suggestions de coups

## 🔧 API Endpoints

Le serveur Flask expose les endpoints suivants :

### `POST /api/init`
Initialise le modèle Maia2
```json
{
  "model_type": "rapid",
  "device": "cpu"
}
```

### `POST /api/predict`
Fait une prédiction pour une position donnée
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "elo_self": 1500,
  "elo_opponent": 1500,
  "top_k": 5
}
```

### `GET /api/status`
Obtient le statut actuel du modèle

### `POST /api/validate_fen`
Valide une chaîne FEN
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
}
```

## 🎯 Exemples de Positions FEN Intéressantes

### Position de départ
```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

### Défense Sicilienne
```
rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2
```

### Gambit du Roi
```
rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2
```

### Milieu de partie complexe
```
r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5
```

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que Flask est installé : `pip install flask flask-cors`
- Vérifiez que le port 5000 n'est pas utilisé

### Erreur lors de l'initialisation du modèle
- Vérifiez que maia2 est correctement installé
- Si vous utilisez GPU, vérifiez que CUDA est disponible
- Essayez d'utiliser CPU à la place

### La prédiction échoue
- Assurez-vous que le modèle est initialisé (statut vert)
- Vérifiez que la position FEN est valide
- Vérifiez les valeurs ELO (800-2800)

### L'échiquier ne s'affiche pas correctement
- Rafraîchissez la page (F5)
- Vérifiez que JavaScript est activé
- Utilisez un navigateur moderne (Chrome, Firefox, Edge)

## 📱 Compatibilité

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Mobile (iOS, Android)

## 🎨 Design

L'interface utilise :
- **Google Material Design** : principes de design moderne
- **Roboto Font** : typographie Google
- **Material Icons** : icônes officielles
- **Animations fluides** : transitions CSS optimisées
- **Responsive Design** : adapté à tous les écrans

## 📝 Notes

- Le premier chargement du modèle peut prendre quelques minutes
- Les prédictions sur GPU sont beaucoup plus rapides
- Les résultats dépendent du niveau ELO configuré
- Testez différentes positions pour voir comment Maia2 s'adapte

## 🤝 Support

Pour toute question ou problème :
- Consultez le README principal du projet Maia2
- Vérifiez les logs du serveur Flask
- Ouvrez une issue sur GitHub

## 📄 Licence

Ce projet suit la même licence que Maia2 (MIT License).

