# Maia2 : Un modèle unifié pour l'alignement humain-IA aux échecs

L'implémentation officielle du papier NeurIPS 2024 **Maia-2** [[papier](https://arxiv.org/abs/2409.20553)]. Ce travail est dirigé par le [CSSLab](https://csslab.cs.toronto.edu/) de l'Université de Toronto.

## Résumé

Il y a un nombre croissant de domaines dans lesquels les systèmes d'intelligence artificielle (IA) surpassent à la fois les capacités humaines et modélisent avec précision le comportement humain. Cela introduit la possibilité d'un enseignement informé d'algorithmes dans ces domaines grâce à des partenaires IA plus accessibles et à des insights plus profonds sur la prise de décision humaine. Cependant, essentiel à l'atteinte de cet objectif est la modélisation cohérente du comportement humain à différents niveaux de compétence. Les échecs sont un système modèle idéal pour mener des recherches sur ce type d'alignement humain-IA, avec son riche historique en tant que terrain d'essai crucial pour la recherche en IA, des systèmes IA surhumains matures comme AlphaZero, et des mesures précises de compétence via les systèmes de notation d'échecs. Les travaux précédents sur la modélisation de la prise de décision humaine aux échecs utilisent des modèles complètement indépendants pour capturer le style humain à différents niveaux de compétence, ce qui signifie qu'ils manquent de cohérence dans leur capacité à s'adapter au spectre complet de l'amélioration humaine et sont finalement limités dans leur efficacité en tant que partenaires IA et outils d'enseignement. Dans ce travail, nous proposons une approche de modélisation unifiée pour l'alignement humain-IA aux échecs qui capture coheremment le style humain à travers différents niveaux de compétence et capture directement comment les gens progressent. Reconnaissant la nature complexe et non linéaire de l'apprentissage humain, nous introduisons un mécanisme d'attention sensibilisé aux compétences pour intégrer dynamiquement les forces des joueurs avec les positions d'échecs encodées, permettant à notre modèle d'être sensible à l'évolution des compétences des joueurs. Nos résultats expérimentaux démontrent que ce cadre unifié améliore considérablement l'alignement entre IA et joueurs humains à travers une large gamme de niveaux d'expertise, ouvrant la voie à des insights plus profonds sur la prise de décision humaine et aux outils d'enseignement guidés par IA.

## Exigences

```sh
chess==1.10.0
einops==0.8.0
gdown==5.2.0
numpy==2.1.3
pandas==2.2.3
pyzstd==0.15.9
Requests==2.32.3
torch==2.4.0
tqdm==4.65.0
```

Les exigences de version peuvent ne pas être très strictes, mais la configuration ci-dessus devrait fonctionner.

## Installation

```sh
pip install maia2
```

## Démarrage rapide : Inférence par lot

```python
from maia2 import model, dataset, inference
```

Vous pouvez charger un modèle pour les parties `"rapid"` ou `"blitz"` avec CPU ou GPU.

```python
maia2_model = model.from_pretrained(type="rapid", device="gpu")
```

Chargez un ensemble de données de test d'exemple pré-défini pour la démonstration.

```python
data = dataset.load_example_test_dataset()
```

Inférence par lot

- `batch_size=1024` : Définissez la taille du lot pour l'inférence.
- `num_workers=4` : Utilisez plusieurs threads de travail pour le chargement et le traitement des données.
- `verbose=1` : Affichez la barre de progression pendant le processus d'inférence.

```python
data, acc = inference.inference_batch(data, maia2_model, verbose=1, batch_size=1024, num_workers=4)
print(acc)
```

`data` sera mis à jour sur place pour inclure les résultats d'inférence.

## Inférence par position

Nous utilisons le même ensemble de données de test d'exemple pour la démonstration.

```python
prepared = inference.prepare()
```

Une fois la préparation terminée, vous pouvez facilement exécuter l'inférence position par position :

```python
for fen, move, elo_self, elo_oppo, _, _ in data.values[:10]:
    move_probs, win_prob = inference.inference_each(maia2_model, prepared, fen, elo_self, elo_oppo)
    print(f"Move: {move}, Predicted: {move_probs}, Win Prob: {win_prob}")
    print(f"Correct: {max(move_probs, key=move_probs.get) == move}")
```

Essayez de modifier le niveau de compétence (ELO) du joueur actif `elo_self` et du joueur opposé `elo_oppo` ! Vous pourriez trouver cela perspicace pour certaines positions.

## Entraînement

### Téléchargez des données depuis [Lichess Database](https://database.lichess.org/)

Veuillez télécharger les données de parties pour la période que vous souhaitez entraîner en format `.pgn.zst`. La décompression des données est gérée par `maia2`, vous n'avez donc pas besoin de décompresser ces fichiers avant l'entraînement.

### Entraînement avec nos paramètres par défaut

Veuillez modifier `data_root` dans le fichier de configuration pour indiquer où vous avez stocké les données Lichess téléchargées. Cela prendra environ 1 semaine pour finir l'entraînement d'1 époque avec 2*A100 et 16*CPU.

```python
from maia2 import train, utils
cfg = utils.parse_args(cfg_file_path="./maia2_models/config.yaml")
train.run(cfg)
```

Si vous souhaitez restaurer l'entraînement à partir d'un point de contrôle, veuillez modifier le `from_checkpoint`, `checkpoint_year`, et `checkpoint_month` pour indiquer l'initialisation dont vous avez besoin.

## Citation

Si vous trouvez notre code ou les modèles pré-entraînés utiles, veuillez citer notre travail comme suit :

```bibtex
@inproceedings{
tang2024maia,
title={Maia-2: A Unified Model for Human-{AI} Alignment in Chess},
author={Zhenwei Tang and Difan Jiao and Reid McIlroy-Young and Jon Kleinberg and Siddhartha Sen and Ashton Anderson},
booktitle={The Thirty-eighth Annual Conference on Neural Information Processing Systems},
year={2024},
url={https://openreview.net/forum?id=XWlkhRn14K}
}
```

## Contact

Si vous avez des questions ou des suggestions, n'hésitez pas à nous contacter par email : <josephtang@cs.toronto.edu>.

## Licence

Ce projet est licencié sous la [licence MIT](LICENSE).
