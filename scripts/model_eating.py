import requests
from bs4 import BeautifulSoup
import json
import time
import random
from fake_useragent import UserAgent

BASE_URL = "https://www.cars.com"
DELAY = 3  # Seconds between requests

def get_random_headers():
    """Generate random headers to avoid bot detection."""
    ua = UserAgent()
    return {
        'User-Agent': ua.random,
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': BASE_URL
    }

def extract_makes_models_from_json(html_content):
    """Extract makes/models/years from the embedded JSON script."""
    soup = BeautifulSoup(html_content, "html.parser")
    script_tag = soup.find("script", id="CarsWeb.ResearchLandingController.index")
    
    if not script_tag:
        print("JSON script tag not found!")
        return None
    
    try:
        data = json.loads(script_tag.string)
        return data.get("makesModelsYears", [])
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")
        return None

def get_makes_and_models():
    """Fetch makes/models directly from the JSON data."""
    url = f"{BASE_URL}/research/"
    print(f"Fetching data from {url}")
    
    try:
        response = requests.get(url, headers=get_random_headers(), timeout=15)
        response.raise_for_status()
        
        # Extract makes/models from JSON instead of HTML dropdowns
        makes_models_data = extract_makes_models_from_json(response.text)
        
        if not makes_models_data:
            print("No makes/models found in JSON.")
            return None
        
        # Format the data: {make: [models]}
        result = {}
        for make_data in makes_models_data:
            make_slug = make_data["slug"]  # e.g., "acura"
            make_name = make_data["name"]  # e.g., "Acura"
            
            models = []
            for model in make_data["models"]:
                models.append({
                    "slug": model["slug"],  # e.g., "mdx"
                    "name": model["name"],  # e.g., "MDX"
                    "years": [year["name"] for year in model["years"]]  # e.g., ["2025", "2024", ...]
                })
            
            result[make_slug] = {
                "name": make_name,
                "models": models
            }
        
        return result
    
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def main():
    data = get_makes_and_models()
    if not data:
        print("Failed to fetch makes and models.")
        return
    
    # Extract all {make}-{model} combinations
    all_make_model_keys = []

    for make, make_info in data.items():
        models = make_info.get("models", [])
        for model in models:
            make_model_key = f"{make}-{model['slug']}"
            all_make_model_keys.append(make_model_key)

    # Print the result
    print(f"✅ Found {len(all_make_model_keys)} make-model entries:")
    for key in all_make_model_keys:
        print(f"- {key}")

    # Save to JSON
    with open("all_make_model_keys.json", "w") as f:
        json.dump(all_make_model_keys, f, indent=2)  
    
    print(f"Saved {len(all_make_model_keys)} models to all_make_model_keys.json")

if __name__ == "__main__":
    main()
