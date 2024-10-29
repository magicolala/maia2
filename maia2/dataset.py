import gdown
import os
import pandas as pd

def load_example_test_dataset(save_root = "../data"):
    
    url = "https://drive.google.com/uc?id=1fSu4Yp8uYj7xocbHAbjBP6DthsgiJy9X"
    if os.path.exists(save_root) == False:
        os.makedirs(save_root)
    output_path = os.path.join(save_root, "example_test_dataset.csv")
    
    if os.path.exists(output_path):
        print("Example test dataset already downloaded.")
    else:
        gdown.download(url, output_path, quiet=False)
        
    data = pd.read_csv(output_path)
    data = data[data.move_ply > 10][['board', 'move', 'active_elo', 'opponent_elo']]
    
    return data
    
