# Directives du dépôt

## Structure du projet et organisation des modules

Le package maia2/ contient le code de production. main.py orchestre le découpage PGN et le prétraitement distribué, train.py lance l'entraînement multi-GPU, model.py définit le réseau MAIA-2, inference.py expose les aides par lot et par position, dataset.py regroupe les tables d'évaluation, et utils.py contient les utilitaires partagés pour la configuration, l'ensemencement et la compression. Les aides de shell telles que fetch_data.sh automatisent les téléchargements Lichess ; exécutez-les depuis un répertoire de données dédié pour garder les gros artefacts hors du contrôle de version.

## Commandes de construction, de test et de développement

Créez un environnement isolé avant de modifier le code :
`sh
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m pip install -e .
`
Les installations éditables exposent le package en tant que maia2. Reconstruisez les distributables avec python -m flit build. Pour une vérification rapide d'inférence : python -c "from maia2 import dataset, inference, model; m = model.from_pretrained(type='rapid', device='cpu'); data = dataset.load_example_test_dataset(); _, acc = inference.inference_batch(data, m, verbose=1, batch_size=64, num_workers=0); print(acc)".

## Style de codage et conventions de nommage

Suivez PEP 8 avec une indentation de quatre espaces, des enveloppes douces ~100 caractères, snake_case pour les fonctions, PascalCase pour les classes, et UPPER_CASE pour les constantes de module. Privilégiez les indices de type explicites sur les API publiques, ajoutez des docstrings pour les routines complexes, et réutilisez des utilitaires tels que seed_everything pour un comportement torch déterministe. Gardez les imports groupés (stdlib, tiers, local) et reproduisez les motifs environnants plutôt que d'imposer de nouveaux dialectes.

## Directives de test

Le dépôt est actuellement livré sans tests automatisés. Les nouvelles fonctionnalités devraient introduire des suites pytest sous un répertoire tests/ qui reflète la structure du package. Nommez les tests d'après le comportement qu'ils protègent (test_inference_batch_handles_empty_input). Préférez les fixtures légères basées sur dataset.load_example_test_dataset() et barrez les chemins lourds en GPU pour que les vérifications CPU seules restent pratiques. Capturez les chiffres de précision de base dans les descriptions de PR lorsque la logique d'entraînement change.

## Directives de commit et de pull request

L'historique récent privilégie des résumés courts et impératifs ("Add dependencies to pyproject.yaml"). Suivez ce ton, gardez les lignes du corps sous 72 caractères, et référencez les issues avec Refs #123 si pertinent. Les pull requests devraient décrire la motivation, les changements clés, les étapes de vérification (commandes, métriques ou captures d'écran), et noter toute tâche de suivi. Demandez des avis avant la fusion et attendez que CI ou les tests de fumée manuels passent.

## Conseils sur les données et la configuration

L'entraînement dépend des archives PGN multi-GB ; stockez-les en dehors du dépôt et référencez des chemins absolus dans votre configuration. fetch_data.sh suppose un shell POSIX - exécutez-le dans WSL ou un conteneur et déplacez les résultats dans votre volume de données. Lors du lancement de l'entraînement, chargez les configs YAML via utils.parse_args et respectez la disposition par défaut du point de contrôle sous ../saves/. Ne commitez jamais de données de jeu brutes, de points de contrôle ou de jetons d'accès.
