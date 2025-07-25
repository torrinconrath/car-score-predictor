# car_score_predictor.py 

import torch
import numpy as np
import pandas as pd
import joblib
import json
import re
import os
from transformers import pipeline
from torch import nn

# Get base dir of current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "model"))
SCRIPT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "scripts"))

# Set Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model Definition
class ImprovedMLP(nn.Module):
    def __init__(self, input_size):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Dropout(0.2),
            nn.Linear(64, 1)
        )
    
    def forward(self, x):
        return self.net(x)
        

class CarScorePredictor:
    def __init__(self):
        
        self.input_scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
        self.output_scaler = joblib.load(os.path.join(MODEL_DIR, 'model_scaler.pkl'))

        # Load model features
        with open(os.path.join(MODEL_DIR, 'model_features.json'), 'r') as f:
            self.model_features = json.load(f)

        with open(os.path.join(SCRIPT_DIR, 'all_make_model_keys.json'), 'r') as f:
            self.model_slugs = json.load(f)
        
        self.model_types = [slug.replace('_', ' ').replace('-', ' ').title() for slug in self.model_slugs]


        # Get mean values for imputation from the training data
        self.X_train_df = pd.read_pickle(os.path.join(MODEL_DIR,'X_train.pkl'))
        self.default_values = self.X_train_df.mean()

        # List of known categorical fields that were one-hot encoded
        self.one_hot_prefixes = ['Condition_', 'Model_', 'Dealer_']  
        
        # Initialize the neural network
        self.model = ImprovedMLP(input_size=len(self.model_features))  
        self.model.load_state_dict(torch.load(os.path.join(MODEL_DIR, 'best_car_model.pth'), weights_only=True))
        self.model.to(device)
        self.model.eval()
        
        # Initialize LLM for information extraction
        self.ner_pipeline = pipeline(
            "token-classification",
            model="dslim/bert-base-NER",
            aggregation_strategy="simple"
        )
        
        # Initialize LLM for text understanding
        self.qa_pipeline = pipeline(
            "question-answering",
            model="distilbert-base-uncased-distilled-squad"
        )

    def extract_car_info(self, text):
        """Extract structured car information from natural language"""
        # Extract entities using NER
        entities = self.ner_pipeline(text)

        # Initialize default values
        car_info = {
            'Year': None,
            'Model': None,
            'Mileage': None,
            'Price': None,
            'Condition': None,
            'Dealer': None,
            'Monthly Payment': None,
            'Accidents': 0,  # Default to no accidents
            'Owners': 1,     # Default to 1 owner
            'Usage': 1       # Default to personal use (1)
        }

        # Simple regex-based extractions for numerical fields
        mileage_match = re.search(r'\b([0-9,]+)\s*(mi|miles)\b\.?', text, re.IGNORECASE)
        price_match = re.search(r'\$([0-9,]+)(?![a-zA-Z/])', text)
        payment_match = re.search(r'\$([0-9,]+)\s*(?:/mo|per month)', text, re.IGNORECASE)
        year_match = re.search(r'\b(20\d{2}|19\d{2})\b', text)

        if mileage_match:
            car_info['Mileage'] = int(mileage_match.group(1).replace(',', ''))
        if price_match:
            car_info['Price'] = int(price_match.group(1).replace(',', ''))
        if payment_match:
            car_info['Monthly Payment'] = int(payment_match.group(1).replace(',', ''))
        if year_match:
            car_info['Year'] = int(year_match.group(0))

        # Extract accident information
        if re.search(r'accidents?|accident history', text, re.IGNORECASE):
            car_info['Accidents'] = 1

        # Extract owner count
        owners_match = re.search(r'(\d+)\s*(owners?|previous owners?)', text, re.IGNORECASE)
        if owners_match:
            car_info['Owners'] = int(owners_match.group(1))
        elif re.search(r'one\s*owner|single owner', text, re.IGNORECASE):
            car_info['Owners'] = 1
        elif re.search(r'two\s*owners', text, re.IGNORECASE):
            car_info['Owners'] = 2
        elif re.search(r'three\s*owners', text, re.IGNORECASE):
            car_info['Owners'] = 3
        elif re.search(r'four\+?\s*owners', text, re.IGNORECASE):
            car_info['Owners'] = 4

        # Extract usage type (mapped to your binary encoding)
        if re.search(r'commercial|business|fleet', text, re.IGNORECASE):
            car_info['Usage'] = 0  # Not personal use

        # Pull entities from NER
        for ent in entities:
            label = ent['entity_group']
            word = ent['word']

            if label == 'ORG':
                car_info['Dealer'] = word
            elif label == 'MISC' or label == 'PRODUCT':
                car_info['Model'] = word
            elif label == 'DATE' and not car_info['Year']:
                try:
                    car_info['Year'] = int(re.search(r'\d{4}', word).group(0))
                except:
                    pass

        # Try to find a matching model from the list
        found_model = None
        for model in self.model_types:
            pattern = re.compile(rf'\b{re.escape(model)}\b', re.IGNORECASE)
            if pattern.search(text):
                found_model = model
                break

        if found_model:
            car_info['Model'] = found_model

        # Extract sales condition like New, Used, Certified, etc.
        condition_match = re.search(r'\b(New|Used|Certified(?: Pre-Owned)?)\b', text, re.IGNORECASE)
        if condition_match:
            car_info['Condition'] = condition_match.group(1).title()

        if not car_info['Dealer']:
            dealer_match = re.search(
                r'\b(?:at dealer|dealer:|at)\s+([A-Z][\w&.,\- ]{2,100})',
                text,
                re.IGNORECASE
            )
            if dealer_match:
                # Clean extra whitespace and strip trailing punctuation
                dealer_name = dealer_match.group(1).strip().rstrip('.,')
                dealer_name = re.sub(r'\bdealer\b', '', dealer_name, flags=re.IGNORECASE).strip()
                car_info['Dealer'] = dealer_name

        return car_info
    
    def prepare_features(self, car_info):
        """Convert extracted car info into the model input vector"""
        # Initialize feature row with zeros
        feature_vector = np.zeros(len(self.model_features))
        feature_df = pd.DataFrame([feature_vector], columns=self.model_features)

        # Fill in numerical fields
        for col in ['Year', 'Mileage', 'Price', 'Monthly Payment', 'Accidents', 'Owners']:
            val = car_info.get(col)
            if val is not None:
                feature_df.at[0, col] = val
            else:
                feature_df.at[0, col] = self.default_values[col]

        # Fill in one-hot fields
        for prefix in self.one_hot_prefixes:
            value = car_info.get(prefix)
            if value is not None:
                encoded = f"{prefix}_{value}"
                if encoded in self.model_features:
                    feature_df.at[0, encoded] = 1.0

        # Apply input scaling
        scaled_features = self.input_scaler.transform(feature_df.values)
        
        # Convert to tensor
        return torch.tensor(scaled_features, dtype=torch.float32).to(device)

    
    def predict_score(self, text_input):
        """Main prediction pipeline"""
        # Extract information from text
        car_info = self.extract_car_info(text_input)
        print("Extracted car info:", car_info)
        
        # Prepare features for model
        features_tensor = self.prepare_features(car_info)
        
        # Make prediction
        with torch.no_grad():
            prediction = self.model(features_tensor)
            score = self.output_scaler.inverse_transform(prediction.cpu().numpy().reshape(-1, 1))
        
        return score[0][0]
