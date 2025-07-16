from flask import Flask, request, jsonify
from car_score_predictor import CarScorePredictor
from flask_cors import CORS
import pymysql
import sys

from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from env.config import config

app = Flask(__name__)
CORS(app)

predictor = CarScorePredictor()

def db_connection():
    db_config = config['db_config']

    return pymysql.connect(
        host=db_config['host'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
    )

@app.route('/cars')
def get_cars():
    conn = None
    try:

        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        offset = (page - 1) * per_page

        min_price = int(request.args.get('min_price', 2000))
        max_price = int(request.args.get('max_price', 100000)) 

        # Filters 
        makes = request.args.getlist('make')
        models = request.args.getlist('model')
        states = request.args.getlist('state')

        conn = db_connection()
        with conn.cursor() as cursor:

            # Base query
            base_query = """
                FROM Cars
                WHERE CAST(REPLACE(REPLACE(price, '$', ''), ',', '') AS UNSIGNED) BETWEEN %s AND %s
            """
            values = [min_price, max_price]

            # Add filtering conditions
            if makes:
                placeholders = ','.join(['%s'] * len(makes))
                base_query += f" AND make IN ({placeholders})"
                values.extend(makes)

            if models:
                placeholders = ','.join(['%s'] * len(models))
                base_query += f" AND model IN ({placeholders})"
                values.extend(models)

            if states:
                placeholders = ','.join(['%s'] * len(states))
                base_query += f" AND state IN ({placeholders})"
                values.extend(states)

            # Count total
            cursor.execute(f"SELECT COUNT(*) {base_query}", values)
            total = cursor.fetchone()[0]

            # Paginated data
            cursor.execute(
                f"SELECT * {base_query} ORDER BY value ASC LIMIT %s OFFSET %s",
                values + [per_page, offset]
            )
            
            # Convert to dictionaries
            columns = [col[0] for col in cursor.description]
            cars = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return jsonify({
            "cars": cars,
            "page": page,
            "per_page": per_page,
            "total": total
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/metadata')
def get_metadata():
    conn = None
    try:
        conn = db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT DISTINCT make FROM Cars WHERE make IS NOT NULL AND make != ''")
            makes = sorted([row[0] for row in cursor.fetchall()])

            cursor.execute("SELECT DISTINCT state FROM Cars WHERE state IS NOT NULL AND state != ''")
            states = sorted([row[0] for row in cursor.fetchall()])

            # Fetch make/model pairs
            cursor.execute("""
                SELECT DISTINCT make, model
                FROM Cars
                WHERE make IS NOT NULL AND make != ''
                  AND model IS NOT NULL AND model != ''
            """)
            models_by_make = {}
            for make, model in cursor.fetchall():
                if make not in models_by_make:
                    models_by_make[make] = []
                if model not in models_by_make[make]:
                    models_by_make[make].append(model)

        return jsonify({
            "makes": makes,
            "states": states,
            "models_by_make": models_by_make
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)  
        text_input = data.get('description', '').strip()
        if not text_input:
            return jsonify({'error': "Missing or empty 'description' field"}), 400

        print(f"Raw Input: {text_input}")
        score = predictor.predict_score(text_input)
        return jsonify({'score': round(float(score), 2)})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host=f"{config['ip']}", debug=True, port=f"{config['port']}")


# config['host'] laptop