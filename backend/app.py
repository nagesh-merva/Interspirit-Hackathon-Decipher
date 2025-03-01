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

#get sentiment score


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
        recent_tweets = list(db[tweets_collection].find().sort("date", -1).limit(10))
        for tweet in recent_tweets:
            tweet["platform"] = "twitter"
        recent_mentions.extend(recent_tweets)
    
    if platform in ["instagram", "all"]:
        recent_comments = list(db[comments_collection].find().sort("date", -1).limit(10))
        for comment in recent_comments:
            comment["platform"] = "instagram"
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

# get all negative sentiments 
def determine_severity(score):
    """
    Calculate tweet severity based on its score.
    Adjust threshold values as needed.
    """
    try:
        score_val = float(score)
    except Exception:
        return "unknown"
    if score_val < 2:
        return "high"
    elif score_val <= 3 and score_val >= 2:
        return "medium"
    elif score_val >=4:
        return "low"

@app.route("/api/get_negative_tweets", methods=["POST"])
def get_negative_tweets():
    data = request.json
    brand_name = data.get("brand_name")
    
    if not brand_name:
        return jsonify({"error": "brand_name is required"}), 400

    if brand_name not in client.list_database_names():
        return jsonify({"error": "Brand database does not exist"}), 404

    db = client[brand_name]
    tweets_collection = f"tweets_{brand_name}"
    
    negative_tweets = list(db[tweets_collection].find({
        "sentiment": {"$regex": "^negative$", "$options": "i"}
    },{"_id":0,"date":0}))

    for tweet in negative_tweets:
        tweet["severity"] = determine_severity(tweet.get("score", 0))
        tweet["platform"] = "twitter"
    return jsonify(negative_tweets), 200

@app.route("/api/get_negative_comments", methods=["POST"])
def get_negative_comments():
    data = request.json
    brand_name = data.get("brand_name")
    
    if not brand_name:
        return jsonify({"error": "brand_name is required"}), 400

    if brand_name not in client.list_database_names():
        return jsonify({"error": "Brand database does not exist"}), 404

    db = client[brand_name]
    comments_collection = f"instagram_comments_{brand_name}"
    
    negative_comments = list(db[comments_collection].find({
        "sentiment": {"$regex": "^negative$", "$options": "i"}
    }, {"_id": 0, "date": 0}))

    for comment in negative_comments:
        comment["severity"] = determine_severity(comment.get("score", 0))
        comment["platform"] = "instagram"  

    return jsonify(negative_comments), 200


@app.route("/api/get_emotion_counts", methods=["POST"])
def get_emotion_counts():
    data = request.json
    brand_name = data.get("brand_name")
    
    if not brand_name:
        return jsonify({"error": "brand_name is required"}), 400
    
    if brand_name not in client.list_database_names():
        return jsonify({"error": "Brand database does not exist"}), 404
    
    db = client[brand_name]
    tweets_collection = f"tweets_{brand_name}"
    
    tweets = list(db[tweets_collection].find())
    
    emotion_counts = {}
    
    for tweet in tweets:
        emotion_field = tweet.get("emotion", "")
        emotions = []
        
        if isinstance(emotion_field, str):
            cleaned = emotion_field.strip("[]").strip()
            if cleaned:
                emotions = [em.strip().strip("'").strip('"') for em in cleaned.split(",") if em.strip()]
        elif isinstance(emotion_field, list):
            emotions = emotion_field
        
        for em in emotions:
            if em:
                emotion_counts[em] = emotion_counts.get(em, 0) + 1
    result = [{"emotion": k, "count": v} for k, v in emotion_counts.items()]
    
    return jsonify(result), 200

# get sentiments values 

@app.route('/api/calculate-sentiment', methods=['POST'])
def calculate_sentiment():
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
    total_count = abs(positive_score + negative_score + neutral_score)

    volatility_value = abs(positive_score - negative_score)
    if volatility_value > 30:
        volatility_level = "High"
    elif 15 <= volatility_value <= 30:
        volatility_level = "Medium"
    else:
        volatility_level = "Low"

    if negative_score > 0:
        pos_neg_ratio = round(positive_score / negative_score, 2)
    else:
        pos_neg_ratio = float('inf')  # Keep it as infinity for handling

    if positive_score > 0:
        neg_pos_ratio = round(negative_score / positive_score, 2)
    else:
        neg_pos_ratio = float('inf')

    if total_count > 0:
        avg_sentiment_score = round(abs(((positive_score * 1 + neutral_score * 0 + negative_score * -1) / total_count) * 100), 2)
    else:
        avg_sentiment_score = 0.00  # Ensure float with two decimal places

    response = {
        "volatility_level": volatility_level,
        "pos_neg_ratio": pos_neg_ratio if pos_neg_ratio != float('inf') else "inf",
        "neg_pos_ratio": neg_pos_ratio if neg_pos_ratio != float('inf') else "inf",
        "avg_sentiment_score": avg_sentiment_score
    }
    
    print(response)

    return jsonify(response)


#get hashtags with senitments 
@app.route("/api/get_hashtag_sentiments", methods=["POST"])
def get_hashtag_sentiments_unique():
    data = request.json
    brand_name = data.get("brand_name")
    
    if not brand_name:
        return jsonify({"error": "brand_name is required"}), 400
    
    if brand_name not in client.list_database_names():
        return jsonify({"error": "Brand database does not exist"}), 404

    db = client[brand_name]
    tweets_collection = f"tweets_{brand_name}"
    
    pipeline = [
        {"$match": {"hashtags": {"$exists": True, "$ne": []}}},
        {"$unwind": "$hashtags"},
        {"$group": {
            "_id": "$hashtags",
            "sentiments": {"$addToSet": "$sentiment"}
        }},
        {"$project": {
            "_id": 0,
            "hashtag": "$_id",
            "sentiment": {
                "$cond": [
                    {"$eq": [{"$size": "$sentiments"}, 1]},
                    {"$arrayElemAt": ["$sentiments", 0]},
                    "$sentiments"
                ]
            }
        }}
    ]
    
    result = list(db[tweets_collection].aggregate(pipeline))
    return jsonify(result), 200

if __name__ == "__main__":
    app.run(debug=True)
