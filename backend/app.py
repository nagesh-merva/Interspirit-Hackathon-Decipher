from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import datetime

app = Flask(__name__)
CORS(app) 

client = MongoClient("mongodb+srv://nageshgenai22:IB4LVRkoNwmrjZX3@decipher.wmjlx.mongodb.net/") 

def initialize_collections(db):
    """Initialize all required collections with empty data."""
    collections = {
        "tweets_collection": f"tweets_{db.name.lower()}",
        "comments_collection": f"instagram_comments_{db.name.lower()}",
        "sentiments_collection": f"sentiments_{db.name.lower()}",
        "alerts_collection": f"alerts_{db.name.lower()}",
        "trending_keywords_collection": f"trending_keywords_{db.name.lower()}"
    }

    for col in collections.values():
        db[col].insert_one({"initialized": True})  
    return collections

@app.route("/api/register", methods=["POST"])
def register():
    """Register a new brand and create its own database in the cluster."""
    data = request.json

    brand_name = data.get("brand_name")
    email = data.get("email")
    password = data.get("password")
    twitter_handle = data.get("twitter_handle")
    hashtags = data.get("hashtags", [])

    if not brand_name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if brand_name in client.list_database_names():
        return jsonify({"error": "Brand already registered"}), 409

    brand_db = client[brand_name]

    collections = initialize_collections(brand_db)

    brand_profile = {
        "brand_name": brand_name,
        "twitter_handle": twitter_handle,
        "hashtags": hashtags,
        "created_at": datetime.datetime.utcnow(),
        "last_fetched": None,
        "collections": collections,
        "email": email,
        "password": password
    }

    brand_db["Profile"].insert_one(brand_profile)

    return jsonify({"message": "Brand registered successfully", "brand": brand_name}), 201


@app.route("/api/login", methods=["POST"])
def login():
    """Authenticate brand login using email and password."""
    data = request.json
    brand_name = data.get("brandname")
    password = data.get("password")

    if not brand_name or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if brand_name not in client.list_database_names():
        return jsonify({"error": "Brand not registered"}), 404

    brand_db = client[brand_name]
    profile = brand_db["Profile"].find_one({"brand_name": brand_name})

    if not profile:
        return jsonify({"error": "Brand profile not found"}), 404

    if password == profile["password"]:
        return jsonify({"message": "Login successful", "brand_name": brand_name, "twitter_handle": profile["twitter_handle"], "hashtags": profile["hashtags"]}), 200

    return jsonify({"error": "Invalid credentials"}), 401


if __name__ == "__main__":
    app.run(debug=True)
