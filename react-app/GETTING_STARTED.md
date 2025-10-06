# 🚀 Guide de Démarrage Rapide - Maia2 React

## 📋 Prérequis

- **Node.js 14+** et npm
- **Python 3.8+** 
- **Maia2** installé (`pip install maia2` ou installation locale)

## ⚡ Démarrage Rapide

### 1️⃣ Installation

```bash
# Dans le dossier react-app/
npm install
```

Cela installera toutes les dépendances nécessaires :
- React 18
- Material-UI
- react-chessboard (échiquier professionnel)
- chess.js
- Axios

### 2️⃣ Démarrer en Mode Développement

**Terminal 1 - Backend Flask :**
```bash
python app_flask.py
```
Le serveur Flask démarre sur `http://localhost:5000`

**Terminal 2 - Frontend React :**
```bash
npm start
```
L'application React s'ouvre sur `http://localhost:3000`

### 3️⃣ Utiliser l'Application

1. ✅ **Initialiser le modèle** - Cliquez sur "Initialiser le Modèle"
2. ⚙️ **Configurer les paramètres** - ELO, type de modèle, etc.
3. ♟️ **Charger une position** - Utilisez la position par défaut ou chargez un FEN
4. 🎯 **Prédire** - Cliquez sur "Prédire" pour obtenir les résultats
5. 📊 **Voir les résultats** - Probabilité de gain et coups suggérés

## 🏗️ Build pour Production

### Étape 1 : Créer le build React

```bash
npm run build
```

Cela crée un dossier `build/` avec les fichiers optimisés.

### Étape 2 : Démarrer en mode production

```bash
python app_flask.py
```

Le serveur Flask détecte automatiquement le dossier `build/` et sert l'application complète sur `http://localhost:5000`

## 📁 Structure du Projet

```
react-app/
├── public/                  # Fichiers publics
│   └── index.html          # Template HTML
├── src/
│   ├── components/         # Composants React
│   │   ├── Header.jsx      # En-tête avec logo Maia2
│   │   ├── Sidebar.jsx     # Panneau de configuration
│   │   ├── ChessBoard.jsx  # Échiquier (react-chessboard)
│   │   └── Results.jsx     # Résultats des prédictions
│   ├── services/
│   │   └── api.js          # Service API Flask
│   ├── App.js              # Composant principal
│   └── index.js            # Point d'entrée
├── package.json            # Dépendances NPM
├── app_flask.py            # Serveur Flask (dev + prod)
└── README.md               # Documentation complète
```

## 🎨 Fonctionnalités

✨ **Interface Material Design** - Design Google moderne
♟️ **Échiquier Professionnel** - Bibliothèque react-chessboard
📱 **Responsive** - Adapté mobile, tablette, desktop
🔄 **API REST** - Communication avec Flask
📊 **Visualisations** - Graphiques de probabilités
⚡ **Performance** - Build optimisé pour production

## 🔧 Configuration Proxy

Le `package.json` contient :
```json
"proxy": "http://localhost:5000"
```

Cela redirige automatiquement `/api/*` vers Flask en développement.

## 🐛 Dépannage

### Port déjà utilisé
```bash
# Changer le port React (par défaut 3000)
PORT=3001 npm start
```

### Erreur de dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### CORS en développement
Le serveur Flask a déjà CORS activé via `flask-cors`.

### Build ne fonctionne pas
Vérifiez que le dossier `build/` existe après `npm run build`.

## 📚 Documentation

- 📖 **README.md** - Documentation complète
- 🎯 **Ce fichier** - Guide de démarrage rapide

## 🎯 Exemples d'Utilisation

### Position de Départ
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

## 📞 Support

- 📧 Consultez la documentation du projet Maia2
- 💬 Vérifiez les logs Flask et React
- 🔍 Utilisez la console navigateur (F12) pour déboguer

## 🎉 C'est parti !

Vous êtes prêt à utiliser Maia2 avec une interface React moderne ! 🚀

```bash
# Terminal 1
python app_flask.py

# Terminal 2  
npm start
```

Ouvrez `http://localhost:3000` et profitez ! ♟️✨

