# env/export_config.py
import json
from config import config
import os

# Output to the React frontend's public folder (adjust as needed)
output_path = os.path.join(os.path.dirname(__file__), '../CarScorePredictor/config/config.json')

with open(output_path, 'w') as f:
    json.dump(config, f, indent=2)
