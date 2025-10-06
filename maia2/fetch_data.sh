#!/bin/bash

# Boucle sur chaque année
for year in {2018..2023}; do
    # Boucle sur chaque mois
    for month in {05..12}; do
        # Former l'URL
        url="https://database.lichess.org/standard/lichess_db_standard_rated_${year}-${month}.pgn.zst"

        # Vérifier si l'URL existe
        if wget --spider $url 2>/dev/null; then
            # Télécharger le fichier
            wget "$url"

            # Le nom du fichier téléchargé
            filename="lichess_db_standard_rated_${year}-${month}.pgn.zst"

        else
            echo "Le fichier pour ${year}-${month} n'existe pas."
        fi

        # Arrêter la boucle si nous avons atteint octobre 2023
        if [ "$year" -eq 2023 ] && [ "$month" = "10" ]; then
            break
        fi
    done

done
