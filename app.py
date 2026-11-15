from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import numpy as np

app = Flask(__name__)

CORS(app)

# Σύνδεση με τη MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/onlypans_db"
mongo = PyMongo(app)

# Endpoint Αναζήτησης (/search)
@app.route('/search', methods=['GET'])
def search_products():
    name_query = request.args.get('name', '')
    
    # Αν το search είναι κενό, φέρε όλα τα προϊόντα 
    if name_query == '':
        results = list(mongo.db.products.find())
    else:
        query = {"name": {"$regex": name_query, "$options": "i"}}
        results = list(mongo.db.products.find(query).sort("price", -1))
    
    # Μετατροπή των αποτελεσμάτων της βάσης σε μορφή κατάλληλη για το Frontend
    output = []
    for item in results:
        output.append({
            "_id": str(item.get('_id', '')),
            "name": item.get('name', 'Άγνωστο Όνομα'),
            "image": item.get('image', ''),
            "description": item.get('description', 'Χωρίς περιγραφή'),
            "likes": item.get('likes', 0),
            "price": item.get('price', 0)
        })
    
    return jsonify(output) # Επιστροφή λίστας

# Endpoint για Likes (/like)
@app.route('/like', methods=['POST'])
def add_like():
    data = request.get_json() # Λήψη δεδομένων JSON
    product_id = data.get('id')
    
    if product_id:
        # Ενημέρωση του πεδίου Likes
        mongo.db.products.update_one(
            {'_id': ObjectId(product_id)},
            {'$inc': {'likes': 1}}
        )
        return jsonify({"message": "Like added!"}), 200
    
    return jsonify({"error": "Product ID missing"}), 400

# Endpoint για Δημοφιλή (/popular)
@app.route('/popular', methods=['GET'])
def get_popular():
    # Επιστροφή top-5 με βάση τα Likes
    popular_items = list(mongo.db.products.find().sort([("likes", -1), ("name", 1)]).limit(5))

    # Μετατροπή των αποτελεσμάτων της βάσης σε μορφή κατάλληλη για το Frontend
    output = []
    for item in popular_items:
        output.append({
            "_id": str(item.get('_id', '')),
            "name": item.get('name', 'Άγνωστο Όνομα'),
            "image": item.get('image', ''),
            "likes": item.get('likes', 0)
        })
    
    return jsonify(output)

if __name__ == "__main__":
    # Εκτέλεση στην IP 127.0.0.1 και Port 5000
    app.run(host="127.0.0.1", port=5000, debug=True)
