# Maia2: A Unified Model for Human-AI Alignment in Chess

The official implementation of the NeurIPS 2024 paper **Maia-2** [[preprint](https://arxiv.org/abs/2409.20553)].

## Abstract
There are an increasing number of domains in which artificial intelligence (AI) systems both surpass human ability and accurately model human behavior. This introduces the possibility of algorithmically-informed teaching in these domains through more relatable AI partners and deeper insights into human decision-making. Critical to achieving this goal, however, is coherently modeling human behavior at various skill levels. Chess is an ideal model system for conducting research into this kind of human-AI alignment, with its rich history as a pivotal testbed for AI research, mature superhuman AI systems like AlphaZero, and precise measurements of skill via chess rating systems. Previous work in modeling human decision-making in chess uses completely independent models to capture human style at different skill levels, meaning they lack coherence in their ability to adapt to the full spectrum of human improvement and are ultimately limited in their effectiveness as AI partners and teaching tools. In this work, we propose a unified modeling approach for human-AI alignment in chess that coherently captures human style across different skill levels and directly captures how people improve. Recognizing the complex, non-linear nature of human learning, we introduce a skill-aware attention mechanism to dynamically integrate players’ strengths with encoded chess positions, enabling our model to be sensitive to evolving player skill. Our experimental results demonstrate that this unified framework significantly enhances the alignment between AI and human players across a diverse range of expertise levels, paving the way for deeper insights into human decision-making and AI-guided teaching tools.

## Requirements

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

The version requirements may not be very strict, but the above configuration should work.

## Installation

```sh
pip install maia2
```

## Quick Start: Batch Inference

```python
from maia2 import model, dataset, inference
```

You can load a model for `"rapid"` or `"blitz"` games with either CPU or GPU.

```python
maia2_model = model.from_pretrained(type="rapid", device="gpu")
```

Load a pre-defined example test dataset for demonstration.

```python
data = dataset.load_example_test_dataset()
```

Batch Inference
- `batch_size=1024`: Set the batch size for inference.
- `num_workers=4`: Use multiple worker threads for data loading and processing.
- `verbose=1`: Show the progress bar during the inference process.

```python
data, acc = inference.inference_batch(data, maia2_model, verbose=1, batch_size=1024, num_workers=4)
```

`data` will be updated in-place to include inference results.


## Position-wise Inference

We use the same example test dataset for demonstration.
```python
from maia2 import model, dataset, inference
data = dataset.load_example_test_dataset()
prepared = inference.prepare()
```

Once the prepapration is done, you can easily run inference position by position:
```python
for fen, move, elo_self, elo_oppo in data.values[:10]:
    predicted = inference.inference_each(maia2_model, prepared, fen, elo_self, elo_oppo)
    print(predicted)
    print(f"{predicted['predicted_move'] == move}: Human move is {move}")
```

Try to tweak the skill level (ELO) of the activce player `elo_self` and opponent play `elo_oppo`! You may find it insightful for some positions.


## Training

TODO

## Citation

If you find our code or pre-trained models useful, please cite the arxiv version for now as follows:

```bibtex
@article{tang2024maia,
  title={Maia-2: A Unified Model for Human-AI Alignment in Chess},
  author={Tang, Zhenwei and Jiao, Difan and McIlroy-Young, Reid and Kleinberg, Jon and Sen, Siddhartha and Anderson, Ashton},
  journal={arXiv preprint arXiv:2409.20553},
  year={2024}
}
```

We will update the citation infomation to the official version once NeurIPS 2024 Proceedings are published.

## Contact

If you have any questions or suggestions, please feel free to contact us via email: josephtang@cs.toronto.edu.

## License

TODO