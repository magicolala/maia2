# Maia2: A Unified Model for Human-AI Alignment in Chess

TODO: include abstarct and link to paper

## Requirements

TODO: A list of packages and their versions

## Installation

```sh
pip install maia2
```

## Quick Start

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

TODO

## Training

TODO

## License

TODO

## Citation

TODO

## Acknowledgement

TODO