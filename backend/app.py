import base64
import hashlib
import os
import re
from flask import Flask, json, redirect, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app) 

client = MongoClient("mongodb+srv://nageshgenai22:IB4LVRkoNwmrjZX3@decipher.wmjlx.mongodb.net/") 

app.secret_key = os.getenv('FLASK_SECRET_KEY')

TW_CLIENT_ID = os.getenv('TW_CLIENT_ID')
TW_CLIENT_SECRET = os.getenv('TW_CLIENT_SECRET')
TW_REDIRECT_URI = 'http://localhost:5000/auth/twitter/callback'  # MUST match Twitter App settings

fernet = Fernet(os.getenv('FERNET_KEY'))

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


def generate_pkce_pair():
    code_verifier = base64.urlsafe_b64encode(os.urandom(40)).rstrip(b'=').decode('utf-8')
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode('utf-8')).digest()
    ).rstrip(b'=').decode('utf-8')
    return code_verifier, code_challenge

# Twitter OAuth2.0 URL builder
@app.route('/auth/twitter')
def auth_twitter():
    brand_name = request.args.get("brand_name")
    if not brand_name:
        return "Missing brand name", 400
    
    code_verifier, code_challenge = generate_pkce_pair()
    session['tw_state'] = os.urandom(16).hex()
    session['code_verifier'] = code_verifier  # Save to verify later
    session['brand_name'] = brand_name

    auth_url = (
        "https://twitter.com/i/oauth2/authorize"
        "?response_type=code"
        f"&client_id={TW_CLIENT_ID}"
        f"&redirect_uri={TW_REDIRECT_URI}"
        "&scope=tweet.read users.read offline.access"
        f"&state={session['tw_state']}"
        "&code_challenge_method=S256"
        f"&code_challenge={code_challenge}"
    )
    if not auth_url:
        return "Failed to build auth URL", 500

    return redirect(auth_url)


@app.route('/auth/twitter/callback')
def twitter_callback():
    code = request.args.get('code')
    if request.args.get('state') != session.get('tw_state'):
        return "Invalid state", 400

    code_verifier = session.get('code_verifier')
    brand_name = session.get('brand_name')
    
    if not brand_name:
        return "Missing brand in session", 400
    
    if not code_verifier:
        return "Missing PKCE code_verifier", 400

    # Prepare Basic Auth header
    credentials = f"{TW_CLIENT_ID}:{TW_CLIENT_SECRET}"
    b64_credentials = base64.b64encode(credentials.encode()).decode()

    resp = requests.post(
        'https://api.twitter.com/2/oauth2/token',
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {b64_credentials}"
        },
        data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': TW_REDIRECT_URI,
            'code_verifier': code_verifier
        }
    )

    if resp.status_code != 200:
        return f"Failed to fetch token: {resp.text}", resp.status_code

    token = resp.json()
    
    # user_data = fetch_user_data(token['access_token'], '#justdoit')
    encrypted = fernet.encrypt(token['access_token'].encode()).decode()

    db = client[brand_name]
    db["Profile"].update_one({}, {"$set": {"twitter_access_token": encrypted}})
        
    print("Encrypted Token:", encrypted)
    return redirect('http://localhost:5173/')

@app.route("/api/register", methods=["POST"])
def register():
    """Register a new brand and create its own database in the cluster."""
    data = request.json

    brand_name = data.get("brand_name").strip()
    email = data.get("email")
    password = data.get("password")
    hashtags = data.get("hashtags", [])
    
    print("Received data:", data)

    if not brand_name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if brand_name in client.list_database_names():
        return jsonify({"error": "Brand already registered"}), 409
    
    exists = client.list_database_names()
    if brand_name in exists:
        return jsonify({"error": "Brand already exists"}), 409

    brand_db = client[brand_name]

    collections = initialize_collections(brand_db)

    brand_profile = {
        "brand_name": brand_name,
        "hashtags": hashtags,
        "created_at": datetime.utcnow(),
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
    brand_name = data.get("brandname").strip()
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
        return jsonify({"message": "Login successful", "brand_name": brand_name, "hashtags": profile["hashtags"]}), 200

    return jsonify({"error": "Invalid credentials"}), 401

#get sentiment score

def extract_hashtags(text):
    return re.findall(r"#\w+", text)

def build_tweet_schema(tweet, byme, username="unknown"):
    hashtags = extract_hashtags(tweet.get("text", ""))
    return {
        "tweet": tweet.get("text", ""),
        "date": tweet.get("created_at"),
        "likes": tweet.get("public_metrics", {}).get("like_count", 0) if byme else 0,
        "retweets": tweet.get("public_metrics", {}).get("retweet_count", 0) if byme else 0,
        "username": username,
        "sentiment": "Neutral",  # Placeholder, can run sentiment model later
        "score": 0,              # Placeholder
        "emotion": [],
        "processed": False,
        "byme": byme,
        "metrics": tweet.get("public_metrics", {}) if byme else None,
        "hashtags": hashtags,
        "mentions": []  # You can extract mentions later if needed
    }


@app.route("/api/fetch_user_data", methods=["POST"])
def fetch_user_data():
    brand_name = request.json.get("brand_name")
    if not brand_name:
        return jsonify({"error": "Brand name is required"}), 400

    db = client[brand_name]
    profile = db["Profile"].find_one({"brand_name": brand_name})
    if not profile:
        return jsonify({"error": "Brand profile not found"}), 404
    keyword = profile["hashtags"]
    access_token = fernet.decrypt(profile['twitter_access_token']).decode()
    tweets_colc = f"tweets_{brand_name}".lower()
    
    print("details", access_token, keyword)

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Step 1: Get user ID and username
    me_resp = requests.get("https://api.twitter.com/2/users/me", headers=headers)
    me_data = me_resp.json()
    if "data" not in me_data:
        return jsonify({
            "error": "Twitter user data could not be fetched.",
            "details": me_data
        }), 400
    user_id = me_data["data"]["id"]
    username = me_data["data"]["username"]
    
    profile["twitter_user_id"] = user_id
    profile["twitter_handle"] = username

    result = {
        "user_id": user_id,
        "username": username,
        "tweets": [],
        "mentions": [],
        "keyword_mentions": []
    }

    # Step 2: Get user's tweets
    tweets_resp = requests.get(
        f"https://api.twitter.com/2/users/{user_id}/tweets",
        headers=headers,
        params={
            "max_results": 100,
            "tweet.fields": "created_at,public_metrics,entities"
        }
    )
    tweets_data = tweets_resp.json().get("data", [])
    
    for tweet in tweets_data:
        schema_tweet = build_tweet_schema(tweet, byme=True, username=username)
        result["tweets"].append(schema_tweet)

    if result["tweets"]:
        db[tweets_colc].insert_many(result["tweets"])

    # Step 3: Get tweets mentioning the user
    mentions_resp = requests.get(
        f"https://api.twitter.com/2/users/{user_id}/mentions",
        headers=headers,
        params={
            "max_results": 100,
            "tweet.fields": "created_at,author_id"
        }
    )
    mentions_data = mentions_resp.json().get("data", [])

    for mention in mentions_data:
        mention["text"] = mention.get("text", "")
        mention["created_at"] = mention.get("created_at")
        mention["public_metrics"] = {}  # Mentions don’t include metrics
        schema_mention = build_tweet_schema(mention, byme=False)
        result["mentions"].append(schema_mention)

    if result["mentions"]:
        db[tweets_colc].insert_many(result["mentions"])


    # Step 4: Search tweets by keyword or hashtag
    search_resp = requests.get(
        "https://api.twitter.com/2/tweets/search/recent",
        headers=headers,
        params={
            "query": " OR ".join(keyword),  # Properly format list of hashtags
            "max_results": 100,
            "tweet.fields": "created_at,author_id"
        }
    )
    keyword_data = search_resp.json().get("data", [])

    for tweet in keyword_data:
        tweet["text"] = tweet.get("text", "")
        tweet["created_at"] = tweet.get("created_at")
        tweet["public_metrics"] = {}  # May not include metrics
        schema_tweet = build_tweet_schema(tweet, byme=False)
        result["keyword_mentions"].append(schema_tweet)

    if result["keyword_mentions"]:
        db[tweets_colc].insert_many(result["keyword_mentions"])

    # Save keyword mentions to MongoDB
        
    with open("tweetsFetched.json", "w", encoding="utf-8") as file:
        json.dump(result, file, indent=4)    

    return result

# @app.route("/api/getsenti_score", methods=["POST"])
# def get_senti_score():
#     data = request.json
#     print(data)
#     brand_name = data.get("brand_name")
#     platform = data.get("platform")
    
#     if not brand_name or not platform:
#         return jsonify({"error": "brand_name and platform are required"}), 400
    
#     if brand_name not in client.list_database_names():
#         return jsonify({"error": "Brand database does not exist"}), 404
    
#     db = client[brand_name]
#     sentiments_collection = f"sentiments_{brand_name}"
#     tweets_collection = f"tweets_{brand_name}"
#     comments_collection = f"instagram_comments_{brand_name}"
    
#     sentiment_data = db[sentiments_collection].find_one({"platform": platform})
    
#     if not sentiment_data:
#         return jsonify({"error": "No sentiment data found for the platform"}), 404
    
#     positive_score = sentiment_data.get("positive_score", 0)
#     negative_score = sentiment_data.get("negative_score", 0)
#     neutral_score = sentiment_data.get("neutral_score", 0)
#     overall_score = sentiment_data.get("ovr_score", 0)
#     prev_overall_score = sentiment_data.get("prev_ovr_score", 0)
 
#     recent_mentions = []
#     if platform in ["twitter", "all"]:
#         recent_tweets = list(db[tweets_collection].find().sort("date", -1).limit(10))
#         for tweet in recent_tweets:
#             tweet["platform"] = "twitter"
#         recent_mentions.extend(recent_tweets)
    
#     if platform in ["instagram", "all"]:
#         recent_comments = list(db[comments_collection].find().sort("date", -1).limit(10))
#         for comment in recent_comments:
#             comment["platform"] = "instagram"
#         recent_mentions.extend(recent_comments)

#     mentions_list = []
#     for mention in recent_mentions:
#         mention["_id"] = str(mention["_id"])  
#         if "date" in mention and isinstance(mention["date"], str): 
#             mention["date"] = datetime.fromisoformat(mention["date"]).strftime("%Y-%m-%d %H:%M:%S")
#         mentions_list.append(mention)
    
#     mentions_list.sort(key=lambda x: x.get("date", ""), reverse=True)

#     response = {
#         "platform": platform,
#         "positive_score": positive_score,
#         "negative_score": negative_score,
#         "neutral_score": neutral_score,
#         "ovr_score": overall_score,
#         "prev_ovr_score": prev_overall_score,
#         "recent_mentions": mentions_list[:10]  
#     }
#     print(response)
#     return jsonify(response)

# # get all negative sentiments 
# def determine_severity(score):
#     """
#     Calculate tweet severity based on its score.
#     Adjust threshold values as needed.
#     """
#     try:
#         score_val = float(score)
#     except Exception:
#         return "unknown"
#     if score_val < 2:
#         return "high"
#     elif score_val <= 3 and score_val >= 2:
#         return "medium"
#     elif score_val >=4:
#         return "low"

# @app.route("/api/get_negative_tweets", methods=["POST"])
# def get_negative_tweets():
#     data = request.json
#     brand_name = data.get("brand_name")
    
#     if not brand_name:
#         return jsonify({"error": "brand_name is required"}), 400

#     if brand_name not in client.list_database_names():
#         return jsonify({"error": "Brand database does not exist"}), 404

#     db = client[brand_name]
#     tweets_collection = f"tweets_{brand_name}"
    
#     negative_tweets = list(db[tweets_collection].find({
#         "sentiment": {"$regex": "^negative$", "$options": "i"}
#     },{"_id":0,"date":0}))

#     for tweet in negative_tweets:
#         tweet["severity"] = determine_severity(tweet.get("score", 0))
#         tweet["platform"] = "twitter"
#     return jsonify(negative_tweets), 200

# @app.route("/api/get_negative_comments", methods=["POST"])
# def get_negative_comments():
#     data = request.json
#     brand_name = data.get("brand_name")
    
#     if not brand_name:
#         return jsonify({"error": "brand_name is required"}), 400

#     if brand_name not in client.list_database_names():
#         return jsonify({"error": "Brand database does not exist"}), 404

#     db = client[brand_name]
#     comments_collection = f"instagram_comments_{brand_name}"
    
#     negative_comments = list(db[comments_collection].find({
#         "sentiment": {"$regex": "^negative$", "$options": "i"}
#     }, {"_id": 0, "date": 0}))

#     for comment in negative_comments:
#         comment["severity"] = determine_severity(comment.get("score", 0))
#         comment["platform"] = "instagram"  

#     return jsonify(negative_comments), 200


# @app.route("/api/get_emotion_counts", methods=["POST"])
# def get_emotion_counts():
#     data = request.json
#     brand_name = data.get("brand_name")
    
#     if not brand_name:
#         return jsonify({"error": "brand_name is required"}), 400
    
#     if brand_name not in client.list_database_names():
#         return jsonify({"error": "Brand database does not exist"}), 404
    
#     db = client[brand_name]
#     tweets_collection = f"tweets_{brand_name}"
    
#     tweets = list(db[tweets_collection].find())
    
#     emotion_counts = {}
    
#     for tweet in tweets:
#         emotion_field = tweet.get("emotion", "")
#         emotions = []
        
#         if isinstance(emotion_field, str):
#             cleaned = emotion_field.strip("[]").strip()
#             if cleaned:
#                 emotions = [em.strip().strip("'").strip('"') for em in cleaned.split(",") if em.strip()]
#         elif isinstance(emotion_field, list):
#             emotions = emotion_field
        
#         for em in emotions:
#             if em:
#                 emotion_counts[em] = emotion_counts.get(em, 0) + 1
#     result = [{"emotion": k, "count": v} for k, v in emotion_counts.items()]
    
#     return jsonify(result), 200

# # get sentiments values 

# @app.route('/api/calculate-sentiment', methods=['POST'])
# def calculate_sentiment():
#     data = request.json
#     print(data)
#     brand_name = data.get("brand_name")
#     platform = data.get("platform")
    
#     if not brand_name or not platform:
#         return jsonify({"error": "brand_name and platform are required"}), 400
    
#     if brand_name not in client.list_database_names():
#         return jsonify({"error": "Brand database does not exist"}), 404
    
#     db = client[brand_name]
#     sentiments_collection = f"sentiments_{brand_name}"
#     tweets_collection = f"tweets_{brand_name}"
#     comments_collection = f"instagram_comments_{brand_name}"
    
#     print(sentiments_collection)
    
#     sentiment_data = db[sentiments_collection].find_one({"platform": platform})
    
#     if not sentiment_data:
#         return jsonify({"error": "No sentiment data found for the platform"}), 404
    
#     positive_score = sentiment_data.get("positive_score", 0)
#     negative_score = sentiment_data.get("negative_score", 0)
#     neutral_score = sentiment_data.get("neutral_score", 0)
#     overall_score = sentiment_data.get("ovr_score", 0)
#     prev_overall_score = sentiment_data.get("prev_ovr_score", 0)
#     total_count = abs(positive_score + negative_score + neutral_score)

#     volatility_value = abs(positive_score - negative_score)
#     if volatility_value > 30:
#         volatility_level = "High"
#     elif 15 <= volatility_value <= 30:
#         volatility_level = "Medium"
#     else:
#         volatility_level = "Low"

#     if negative_score > 0:
#         pos_neg_ratio = round(positive_score / negative_score, 2)
#     else:
#         pos_neg_ratio = float('inf')  # Keep it as infinity for handling

#     if positive_score > 0:
#         neg_pos_ratio = round(negative_score / positive_score, 2)
#     else:
#         neg_pos_ratio = float('inf')

#     if total_count > 0:
#         avg_sentiment_score = round(abs(((positive_score * 1 + neutral_score * 0 + negative_score * -1) / total_count) * 100), 2)
#     else:
#         avg_sentiment_score = 0.00  # Ensure float with two decimal places

#     response = {
#         "volatility_level": volatility_level,
#         "pos_neg_ratio": pos_neg_ratio if pos_neg_ratio != float('inf') else "inf",
#         "neg_pos_ratio": neg_pos_ratio if neg_pos_ratio != float('inf') else "inf",
#         "avg_sentiment_score": avg_sentiment_score
#     }
    
#     print(response)

#     return jsonify(response)


# #get hashtags with senitments 
# @app.route("/api/get_hashtag_sentiments", methods=["POST"])
# def get_hashtag_sentiments_unique():
#     data = request.json
#     brand_name = data.get("brand_name")
    
#     if not brand_name:
#         return jsonify({"error": "brand_name is required"}), 400
    
#     if brand_name not in client.list_database_names():
#         return jsonify({"error": "Brand database does not exist"}), 404

#     db = client[brand_name]
#     tweets_collection = f"tweets_{brand_name}"
    
#     pipeline = [
#         {"$match": {"hashtags": {"$exists": True, "$ne": []}}},
#         {"$unwind": "$hashtags"},
#         {"$group": {
#             "_id": "$hashtags",
#             "sentiments": {"$addToSet": "$sentiment"}
#         }},
#         {"$project": {
#             "_id": 0,
#             "hashtag": "$_id",
#             "sentiment": {
#                 "$cond": [
#                     {"$eq": [{"$size": "$sentiments"}, 1]},
#                     {"$arrayElemAt": ["$sentiments", 0]},
#                     "$sentiments"
#                 ]
#             }
#         }}
#     ]
    
#     result = list(db[tweets_collection].aggregate(pipeline))
#     return jsonify(result), 200

if __name__ == "__main__":
    app.run(debug=True)
