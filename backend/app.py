from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta

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


@app.route("/api/getsenti_score", methods=["POST"])
def get_senti_score():
    data = request.json
    print(data)
    brand_name = data.get("brand_name")
    platform = data.get("platform")
    
    if not brand_name or not platform:
        return jsonify({"error": "brand_name and platform are required"}), 400
    
    if brand_name not in client.list_database_names():
        return jsonify({"error": "Brand database does not exist"}), 404
    
    db = client[brand_name]
    sentiments_collection = f"sentiments_{brand_name}"
    tweets_collection = f"tweets_{brand_name}"
    comments_collection = f"instagram_comments_{brand_name}"
    
    print(sentiments_collection)
    
    sentiment_data = db[sentiments_collection].find_one({"platform": platform})
    
    if not sentiment_data:
        return jsonify({"error": "No sentiment data found for the platform"}), 404
    
    positive_score = sentiment_data.get("positive_score", 0)
    negative_score = sentiment_data.get("negative_score", 0)
    neutral_score = sentiment_data.get("neutral_score", 0)
    overall_score = sentiment_data.get("ovr_score", 0)
    prev_overall_score = sentiment_data.get("prev_ovr_score", 0)
 
    recent_mentions = []
    if platform in ["twitter", "all"]:
        recent_tweets = list(db[tweets_collection]
                             .find()
                             .sort("date", -1) 
                             .limit(10))
        recent_mentions.extend(recent_tweets)
    
    if platform in ["instagram", "all"]:
        recent_comments = list(db[comments_collection]
                               .find()
                               .sort("date", -1)  
                               .limit(10))
        recent_mentions.extend(recent_comments)

    mentions_list = []
    for mention in recent_mentions:
        mention["_id"] = str(mention["_id"])  
        if "date" in mention and isinstance(mention["date"], str): 
            mention["date"] = datetime.fromisoformat(mention["date"]).strftime("%Y-%m-%d %H:%M:%S")
        mentions_list.append(mention)
    
 
    mentions_list.sort(key=lambda x: x.get("date", ""), reverse=True)

    
    response = {
        "platform": platform,
        "positive_score": positive_score,
        "negative_score": negative_score,
        "neutral_score": neutral_score,
        "ovr_score": overall_score,
        "prev_ovr_score": prev_overall_score,
        "recent_mentions": mentions_list[:10]  
    }
    print(response)
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
