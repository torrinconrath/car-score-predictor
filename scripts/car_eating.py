import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os
import re
import json
import random
from urllib.robotparser import RobotFileParser
from fake_useragent import UserAgent
import pymysql
from math import ceil
from threading import Lock, Event, Thread
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
from datetime import datetime

from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from env.config import config

# Configure settings
MAX_PAGES = 200  # Limit pages to scrape (was 5)
DELAY = 3  # Seconds between requests 
BASE_URL = "https://www.cars.com"

NUM_WORKERS = 15
CSV_LOCK = Lock()

shutdown_event = Event()

def db_connection():
    db_config = config['db_config']

    return pymysql.connect(
        host=db_config['host'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
    )

def check_robots_permission():
    """Check if scraping is allowed by robots.txt"""
    rp = RobotFileParser()
    headers = get_random_headers()
    try:
        response = requests.get(f"{BASE_URL}/robots.txt", headers=headers, timeout=10)
        response.raise_for_status()
        rp.parse(response.text.splitlines())
        return rp.can_fetch(headers['User-Agent'], BASE_URL + "/shopping/results/")
    except Exception as e:
        print(f"Failed to fetch or parse robots.txt: {e}")
        return False

def get_random_headers():
    """Generate random headers for each request"""
    ua = UserAgent()
    return {
        'User-Agent': ua.random,
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': BASE_URL
    }

def scrape_car_listings(search_url, make, model):
    """Scrape car listings from search results"""
    cars_data = []
    seen_links = set()
    
    if not check_robots_permission():
        print("Scraping not allowed by robots.txt")
        return pd.DataFrame()
    
    for page in range(1, MAX_PAGES + 1):
        try:
            # Add pagination
            url = f"{search_url}&page={page}" if "?" in search_url else f"{search_url}?page={page}"  
            print(f"Scraping page {page}...")
            response = requests.get(url, headers=get_random_headers(), timeout=5) #(was 15)
            response.raise_for_status()

            print(f"Requesting: {url}")
            print(f"Status Code: {response.status_code}")
      
            if "captcha" in response.text.lower():
                print("Blocked by CAPTCHA or bot protection.")
                break
            
            soup = BeautifulSoup(response.text, 'html.parser')
            listings = soup.find_all('div', class_='vehicle-card')
            
            if not listings:
                print("No more listings found")
                break

            new_cars_this_page = 0
                
            for car in listings:

                # Ensure it is a new listing
                link = BASE_URL + car.find('a', href=True)['href'] if car.find('a', href=True) else None
                if link in seen_links:
                    continue
                
                seen_links.add(link)
                new_cars_this_page += 1

                title = get_text(car, 'h2.title')
                year_match = re.search(r'\b(\d{4})\b', title) if title else None
                year = year_match.group(1) if year_match else None 

                condition = None
                modelTitle = None

                if title and year:
                    parts = re.split(r'\b' + year + r'\b', title, maxsplit=1)
                    condition = parts[0].strip() if parts[0].strip() else None
                    modelTitle = parts[1].strip() if len(parts) > 1 else None

                car_info = {
                    'time': pd.Timestamp.now(),
                    'title': title,
                    'make': make.capitalize(),
                    'model': model,
                    'modelTitle': modelTitle, 
                    'condition': condition,
                    'year': year,
                    'price': get_text(car, 'span.primary-price'),
                    'monthly_payment': f"${get_attribute(car, 'spark-button', 'monthly-payment-est-link', 'phx-value-monthly-payment')}/mo" if get_attribute(car, 'spark-button', 'monthly-payment-est-link', 'phx-value-monthly-payment') else None,
                    'mileage': get_text(car, 'div.mileage'),
                    'dealer': get_text(car, 'div.dealer-name'),
                    'region': get_region(car),
                    'state': extract_state(get_region(car)),
                    'link': BASE_URL + car.find('a', href=True)['href'] if car.find('a', href=True) else None,
                }
                cars_data.append(car_info)

            if new_cars_this_page == 0:
                print("No new listings on the page. Stop scrapping it.")
                break
            
            time.sleep(DELAY + random.uniform(0, 1))  # Random delay
            
        except Exception as e:
            print(f"Error scraping page {page}: {str(e)}")
            continue
    
    return pd.DataFrame(cars_data)

def get_text(soup, selector):
    """Helper to safely extract text"""
    element = soup.select_one(selector)
    return element.get_text(strip=True) if element else None

def get_attribute(soup, tag, class_name, attribute):
    """Safely extract attribute value from a tag with a class"""
    element = soup.find(tag, class_=class_name)
    return element.get(attribute) if element and element.has_attr(attribute) else None

def get_region(car_soup):
    try:
        dealer_section = car_soup.find("div", class_="vehicle-dealer")
        if dealer_section:
            miles_div = dealer_section.find("div", {"data-qa": "miles-from-user"})
            if miles_div:
                text = miles_div.get_text(strip=True)
                match = re.match(r"^(.*)\s+\(\d+\s*mi\.\)$", text)
                if match:
                    return match.group(1).strip()
                else:
                    return text.split("(")[0].strip()
    except Exception as e:
        print(f"[get_region] Error: {e}")
    return None

def extract_state(region):
    if region and ',' in region:
        return region.strip()[-2:]
    return None



def add_predicted_values(df):
    values = []

    for _, row in df.iterrows():
        try:
            description = f"{row['year']} {row['model']} {row['condition']}, {row['mileage']} miles, {row['price']}"
            response = requests.post(f"http://{config['ip']}:{config['port']}/predict", json={"description": description})
            result = response.json()
            score = float(result.get('score', 0.0))
        except Exception as e:
            print(f"Prediction failed for row: {row.to_dict()}, error: {e}")
            score = 0.0  # fallback score

        values.append(score)

    df = df.copy()
    df['value'] = values
    return df


def save_to_csv(df, filename='cars_data.csv'):
    """Append results to CSV file and ensure custom header is used."""
    if df.empty:
        print("No data to save")
        return

    file_exists = os.path.exists(filename)
    df.to_csv(filename, mode='a', header=not file_exists, index=False)
    print(f"Appended {len(df)} rows to {filename}")



def save_to_mysql(df, cursor, conn, table_name='Cars'):

    if df.empty:
        print("No data to insert")
        return
    
    df['time'] = df['time'].astype(str)
    df = df.rename(columns={"monthly_payment": "monthlyPayment"})

    # Predict value for each row
    values = []
    for _, row in df.iterrows():
        try:
            description = f"{row['condition']} {row['year']} {row['model']} with {row['mileage']} miles, priced at {row['price']} or {row['monthlyPayment']} at {row['dealer']}"
            response = requests.post(f"http://{config['ip']}:{config['port']}/predict", json={"description": description})
            result = response.json()
            score = float(result.get('score', 0.0))
        except Exception as e:
            print(f"Prediction failed for row: {row.to_dict()}, error: {e}")
            score = 0.0  # fallback value if prediction fails

        values.append(score)

    df['value'] = values

    columns = [
        "title", "make", "model", "modelTitle", "`condition`", "year", "mileage", 
        "price", "monthlyPayment", "dealer", "value", "region", "state", "link", "time"
    ]
    cols_str = ",".join(columns)

    placeholders = ",".join(["%s"] * len(columns))
    insert_stmt = f"INSERT INTO {table_name} ({cols_str}) VALUES ({placeholders})"

    data = [tuple(row) for row in df[
        ["title", "make", "model", "modelTitle", "condition", "year", "mileage", 
         "price", "monthlyPayment", "dealer", "value", "region", "state", "link", "time"]
    ].itertuples(index=False, name=None)]

    cursor.executemany(insert_stmt, data)
    conn.commit()
    print(f"Inserted {len(df)} rows into {table_name}")


def load_make_model_slugs(json_file_path):
    """
    Load make-model slugs like 'acura-mdx', 'toyota-camry' from a JSON file.
    Returns a list of strings.
    """
    try:
        with open(json_file_path, "r") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            else:
                raise ValueError("JSON must contain a list of 'make-model' strings.")
    except Exception as e:
        print(f"Failed to load JSON: {e}")
        return []

def chunk_models(models, num_chunks):
    chunk_size = ceil(len(models) / num_chunks)
    return [models[i:i + chunk_size] for i in range(0, len(models), chunk_size)]

def save_to_csv_threadsafe(df, filename):
    with CSV_LOCK:
        save_to_csv(df, filename)

def listen_for_shutdown_key():
    print("[Press 'o' then Enter to stop scraping gracefully]")
    for line in sys.stdin:
        if line.strip().lower() == 'o':
            print("[!] Shutdown signal received.")
            shutdown_event.set()
            break


def scrape_model(model):

    if shutdown_event.is_set():
        return

    MODEL = model
    MAKE = model.split("-", 1)[0]

    # Added no accidents, one owner, personal use, between 2k and 100k (my essentials and defaults for the neural net)

    SEARCH_URL = f"{BASE_URL}/shopping/results/?clean_title=true&include_shippable=true&list_price_max=100000&list_price_min=2000&makes[]={MAKE}&models[]={MODEL}&no_accidents=true&one_owner=true&personal_use=true&stock_type=used&sort=best_match_desc"
            
    try: 

        # Make per-thread MySQL connection
        thread_conn = db_connection()
        thread_cursor = thread_conn.cursor()

        time.sleep(random.uniform(2, 4))

        cars_df = scrape_car_listings(SEARCH_URL, MAKE, MODEL)

        if not cars_df.empty:
            cars_df = add_predicted_values(cars_df)
            save_to_csv_threadsafe(cars_df, 'cars_data.csv')
            save_to_mysql(cars_df, thread_cursor, thread_conn)
            print(f"Scraped {len(cars_df)} listings for {MODEL}")
        else:
            print(f"No data for {MODEL}")

    except Exception as e:

        print(f"Error scraping model {MODEL}: {e}")
    

if __name__ == "__main__":

    start = datetime.now()

    models = load_make_model_slugs("all_make_model_keys.json")

    conn = db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("TRUNCATE TABLE Cars")
        conn.commit()
        print("Cleared existing rows from Cars table.")

        if os.path.exists('cars_data.csv'):
            os.remove('cars_data.csv')
            print("Reset the existing cars.csv")

        listener_thread = Thread(target=listen_for_shutdown_key, daemon=True)
        listener_thread.start()

        with ThreadPoolExecutor(max_workers=NUM_WORKERS) as executor:
            futures = [executor.submit(scrape_model, model) for model in models]
        
        try:

                for future in as_completed(futures):
                    try:
                        future.result()
                    except Exception as e:
                        print(f"Thread failed: {e}")
        
        except KeyboardInterrupt:
            print("Interrupted by user. Shutting down...")
            shutdown_event.set()
            executor.shutdown(wait=False, cancel_futures=True)
    
    except Exception as e:
        print(f"Fatal Error: {e}")
        conn.rollback()

    finally:
        now = datetime.now()
        elapsed = now - start
        total_seconds = int(elapsed.total_seconds())
        hours = total_seconds // 3600
        remaining_seconds = total_seconds % 3600
        minutes = remaining_seconds // 60
        seconds = remaining_seconds % 60
        print(f"Elapsed: {hours}h, {minutes}m, {seconds}s")

        cursor.close()
        conn.close()
