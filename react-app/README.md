# Maia2 React Interface

Interface web moderne construite avec React et Material-UI pour tester et configurer le modèle Maia2.

## 🎯 Fonctionnalités

- ✨ **Interface moderne** avec Material-UI et Google Material Design
- ♟️ **Échiquier professionnel** avec `react-chessboard`
- 🎨 **Design responsive** adapté à tous les écrans
- ⚡ **Performance optimisée** avec React 18
- 🔄 **Communication API** avec Flask backend via Axios
- 📊 **Visualisations interactives** des prédictions

## 📦 Technologies

- **React 18** - Framework UI
- **Material-UI v5** - Composants et design system
- **react-chessboard** - Échiquier professionnel
- **chess.js** - Logique d'échecs
- **Axios** - Client HTTP
- **React Scripts** - Tooling et configuration

## 🚀 Installation

### Prérequis

- Node.js 14+ et npm
- Python 3.8+ avec le backend Flask démarré

### Étapes

1. **Installer les dépendances** :

```bash
npm install
```

2. **S'assurer que le serveur Flask est démarré** :

```bash
# Dans le dossier web/
python app.py
```

Le serveur Flask doit tourner sur `http://localhost:5000`

## 💻 Développement

### Démarrer l'application en mode développement

```bash
npm start
```

L'application s'ouvrira automatiquement sur `http://localhost:3000`

Les modifications seront rechargées automatiquement (Hot Reload).

### Configuration du proxy

Le fichier `package.json` contient une configuration proxy qui redirige toutes les requêtes `/api/*` vers `http://localhost:5000`.

Cela permet d'éviter les problèmes de CORS en développement.

## 🏗️ Build pour Production

### Créer un build optimisé

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `build/`.

### Servir le build avec Flask

Le serveur Flask peut servir l'application React en production. Les fichiers du dossier `build/` doivent être copiés dans le dossier approprié du backend Flask.

## 📁 Structure du Projet

```
react-app/
├── public/              # Fichiers publics
│   └── index.html       # Template HTML
├── src/
│   ├── components/      # Composants React
│   │   ├── Header.jsx   # En-tête avec logo
│   │   ├── Sidebar.jsx  # Panneau de configuration
│   │   ├── ChessBoard.jsx  # Échiquier avec react-chessboard
│   │   └── Results.jsx  # Affichage des résultats
│   ├── services/        # Services
│   │   └── api.js       # Service API pour Flask
│   ├── App.js           # Composant principal
│   └── index.js         # Point d'entrée
├── package.json         # Dépendances et scripts
└── README.md           # Ce fichier
```

## 🎨 Composants

### Header

- Logo et titre Maia2
- Gradient bleu Material Design
- Sticky en haut de page

### Sidebar

- Sélection du type de modèle (Rapid/Blitz)
- Choix du dispositif (CPU/GPU)
- Configuration des ELO (joueur actif et adversaire)
- Input pour position FEN
- Nombre de suggestions
- Boutons d'action
- Indicateur de statut

### ChessBoard

- Échiquier professionnel avec `react-chessboard`
- Affichage de la position FEN
- Indicateur du tour (Blancs/Noirs)
- Design élégant avec ombres

### Results

- État vide avec icône et message
- Barre de progression pour probabilité de gain
- Liste des coups suggérés avec :
  - Numéro de rang
  - Notation du coup (UCI)
  - Barre de progression
  - Pourcentage de probabilité

## 🔧 API Backend

L'application communique avec le backend Flask via les endpoints suivants :

### `POST /api/init`

Initialise le modèle Maia2

```json
{
  "model_type": "rapid",
  "device": "cpu"
}
```

### `POST /api/predict`

Fait une prédiction

```json
{
  "fen": "...",
  "elo_self": 1500,
  "elo_opponent": 1500,
  "top_k": 5
}
```

### `GET /api/status`

Vérifie le statut du modèle

### `POST /api/validate_fen`

Valide une position FEN

```json
{
  "fen": "..."
}
```

## 🎯 Utilisation

1. **Démarrer le backend Flask** (port 5000)
2. **Démarrer l'application React** avec `npm start`
3. **Ouvrir** `http://localhost:3000`
4. **Initialiser** le modèle dans la sidebar
5. **Configurer** les paramètres ELO
6. **Charger** une position (ou utiliser la position de départ)
7. **Cliquer** sur "Prédire" pour obtenir les résultats

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreur de proxy

Vérifiez que le serveur Flask tourne sur `http://localhost:5000`

### Erreur de compilation

Assurez-vous d'utiliser Node.js 14+ :

```bash
node --version
```

## 📱 Responsive Design

L'interface s'adapte automatiquement aux différentes tailles d'écran :

- **Desktop** : Layout en 2 colonnes (sidebar + contenu)
- **Tablet** : Layout adaptatif
- **Mobile** : Layout en 1 colonne, échiquier adapté

## 🎨 Personnalisation

### Modifier les couleurs

Éditez le theme dans `src/App.js` :

```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#1a73e8' },
    secondary: { main: '#34a853' },
    // ...
  }
});
```

### Modifier la taille de l'échiquier

Dans `src/components/ChessBoard.jsx` :

```javascript
<Chessboard 
  boardWidth={600}  // Modifier cette valeur
  // ...
/>
```

## 📄 Scripts Disponibles

- `npm start` - Démarre le serveur de développement
- `npm run build` - Crée un build de production
- `npm test` - Lance les tests
- `npm run eject` - Éjecte la configuration (⚠️ irréversible)

## 🤝 Support

Pour toute question ou problème :

- Vérifiez que le backend Flask fonctionne
- Consultez les logs de la console navigateur (F12)
- Vérifiez les logs du terminal React

## 📄 Licence

Ce projet suit la même licence que Maia2 (MIT License).
