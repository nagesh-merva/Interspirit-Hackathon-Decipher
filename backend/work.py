import json
import os
import sys
import importlib.util
from pymongo import MongoClient
from datetime import datetime
import logging
from collections import Counter
import re
import google.generativeai as genai
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TweetProcessor:
    def __init__(self):
        self.client = MongoClient("mongodb+srv://nageshgenai22:IB4LVRkoNwmrjZX3@decipher.wmjlx.mongodb.net/")
        self.username = self.load_username()
        self.db_name = self.username.lower()
        self.db = self.client[self.db_name]
        
        # Collection names
        self.tweets_collection = f"tweets_{self.db_name}"
        self.sentiments_collection = f"sentiments_{self.db_name}"
        self.profile_collection = "Profile"
        
        # Initialize Gemini AI
        self.initialize_gemini()
        
        logger.info(f"Initialized processor for username: {self.username}")
        logger.info(f"Database: {self.db_name}")
        logger.info(f"Collections: {self.tweets_collection}, {self.sentiments_collection}")

    def initialize_gemini(self):
        """Initialize Gemini AI with API key"""
        try:
            # Set the API key directly
            api_key = "AIzaSyBOusJrsk4zJrVkIb3R-H-QSyfmfvnVgg4"
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            self.gemini_available = True
            logger.info("✅ Gemini AI initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini AI: {e}")
            logger.warning("Falling back to rule-based sentiment analysis")
            self.gemini_available = False

    def analyze_emotion_with_gemini(self, tweet_text):
        """
        Analyze emotion of a tweet using Gemini AI.
        Returns a single emotion word.
        """
        if not self.gemini_available or not tweet_text:
            return "neutral"
            
        try:
            prompt = f"""
            Analyze the emotion in this tweet and respond with only ONE word that best describes the primary emotion.
            Choose from: joy, anger, sadness, fear, surprise, disgust, neutral, excitement, love, disappointment, frustration, pride, gratitude, curiosity, anxiety, hope, confidence, nostalgia, embarrassment, admiration
            
            Tweet: "{tweet_text}"
            
            Response format: Just one emotion word, nothing else.
            """
            
            response = self.model.generate_content(prompt)
            emotion = response.text.strip().lower()
            
            # Validate the emotion is a single word
            if ' ' in emotion or len(emotion.split()) > 1:
                emotion = emotion.split()[0]
                
            logger.debug(f"Gemini emotion analysis: '{tweet_text[:50]}...' -> {emotion}")
            return emotion
            
        except Exception as e:
            logger.error(f"Error analyzing emotion with Gemini: {e}")
            return "neutral"

    def analyze_sentiment_with_gemini(self, tweet_text):
        """
        Analyze sentiment of a tweet using Gemini AI.
        Returns sentiment and confidence score.
        """
        if not self.gemini_available or not tweet_text:
            return "neutral", 3
            
        try:
            prompt = f"""
            Analyze the sentiment of this tweet and provide:
            1. Sentiment: positive, negative, or neutral
            2. Confidence score: 1-5 (where 1=very negative, 2=negative, 3=neutral, 4=positive, 5=very positive)
            
            Tweet: "{tweet_text}"
            
            Response format: sentiment,score (example: positive,4)
            """
            
            response = self.model.generate_content(prompt)
            result = response.text.strip().lower()
            
            # Parse response
            if ',' in result:
                sentiment, score_str = result.split(',', 1)
                sentiment = sentiment.strip()
                try:
                    score = int(float(score_str.strip()))
                    score = max(1, min(5, score))  # Ensure score is between 1-5
                except:
                    score = 3
            else:
                sentiment = result.strip()
                score = 3
            
            # Validate sentiment
            if sentiment not in ['positive', 'negative', 'neutral']:
                sentiment = 'neutral'
                score = 3
                
            logger.debug(f"Gemini sentiment analysis: '{tweet_text[:50]}...' -> {sentiment}, {score}")
            return sentiment, score
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment with Gemini: {e}")
            return "neutral", 3

    def load_username(self):
        """Load USERNAME from tweet_extract.py"""
        try:
            spec = importlib.util.spec_from_file_location("tweets_extract", "tweet_extract.py")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            username = getattr(module, 'USERNAME', None)
            if not username:
                raise ValueError("USERNAME not found in tweet_extract.py")
            logger.info(f"Loaded USERNAME: {username}")
            return username
        except Exception as e:
            logger.error(f"Error loading USERNAME: {e}")
            raise

    def load_tweets_from_json(self):
        """Load tweets from tweets.json file"""
        try:
            with open('tweets.json', 'r', encoding='utf-8') as file:
                tweets = json.load(file)
            logger.info(f"Loaded {len(tweets)} tweets from tweets.json")
            return tweets
        except FileNotFoundError:
            logger.error("tweets.json file not found")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing tweets.json: {e}")
            return []

    def analyze_sentiment_fallback(self, text):
        """
        Fallback sentiment analysis using keyword matching (when Gemini is unavailable)
        Returns: sentiment (positive/negative/neutral), score (1-5), emotions
        """
        if not text or not isinstance(text, str):
            return "neutral", 3, ["neutral"]

        text_lower = text.lower()
        
        # Sentiment keywords
        positive_words = [
            'love', 'amazing', 'excellent', 'fantastic', 'great', 'awesome', 'wonderful',
            'perfect', 'outstanding', 'brilliant', 'superb', 'incredible', 'marvelous',
            'good', 'nice', 'happy', 'pleased', 'satisfied', 'delighted', 'thrilled',
            'excited', 'grateful', 'thankful', 'appreciate', 'recommend', 'best',
            'impressive', 'stunning', 'beautiful', 'lovely', 'sweet', 'cool', 'rad'
        ]
        
        negative_words = [
            'hate', 'terrible', 'awful', 'horrible', 'disgusting', 'worst', 'bad',
            'disappointing', 'frustrated', 'angry', 'annoyed', 'upset', 'sad',
            'pathetic', 'useless', 'stupid', 'ridiculous', 'outrageous', 'unacceptable',
            'poor', 'weak', 'fail', 'broken', 'wrong', 'problem', 'issue', 'complaint',
            'disaster', 'nightmare', 'scam', 'fake', 'lie', 'cheat', 'rude', 'offensive'
        ]
        
        # Emotion keywords
        emotion_keywords = {
            'joy': ['happy', 'excited', 'thrilled', 'delighted', 'cheerful', 'elated'],
            'anger': ['angry', 'furious', 'mad', 'rage', 'outraged', 'irritated'],
            'sadness': ['sad', 'depressed', 'disappointed', 'upset', 'heartbroken'],
            'fear': ['scared', 'afraid', 'worried', 'anxious', 'terrified', 'nervous'],
            'surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'stunned'],
            'disgust': ['disgusted', 'revolted', 'sick', 'nauseated', 'repulsed'],
            'trust': ['trust', 'confident', 'reliable', 'secure', 'faith'],
            'anticipation': ['excited', 'eager', 'hopeful', 'optimistic', 'looking forward']
        }
        
        # Count sentiment words
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        # Detect emotions
        detected_emotions = []
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_emotions.append(emotion)
        
        if not detected_emotions:
            detected_emotions = ["neutral"]
        
        # Analyze punctuation and patterns
        exclamation_count = text.count('!')
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        
        # Determine sentiment and score
        if positive_count > negative_count:
            sentiment = "positive"
            if positive_count >= 3 or exclamation_count >= 2:
                score = 5  # Very positive
            elif positive_count >= 2:
                score = 4  # Positive
            else:
                score = 4  # Slightly positive
        elif negative_count > positive_count:
            sentiment = "negative"
            if negative_count >= 3 or caps_ratio > 0.3:
                score = 1  # Very negative
            elif negative_count >= 2:
                score = 2  # Negative
            else:
                score = 2  # Slightly negative
        else:
            sentiment = "neutral"
            score = 3  # Neutral
        
        return sentiment, score, detected_emotions

    def extract_hashtags(self, text):
        """Extract hashtags from tweet text"""
        if not text:
            return []
        hashtags = re.findall(r'#(\w+)', text, re.IGNORECASE)
        return [tag.lower() for tag in hashtags]

    def process_tweet_data(self, tweet):
        """Process individual tweet and add sentiment analysis"""
        # Get tweet text
        tweet_text = tweet.get('tweet', '') or tweet.get('text', '')
        
        if self.gemini_available:
            # Use Gemini AI for analysis
            sentiment, score = self.analyze_sentiment_with_gemini(tweet_text)
            emotion = self.analyze_emotion_with_gemini(tweet_text)
            emotions = [emotion] if emotion else ["neutral"]
            
            # Add small delay to avoid rate limiting
            time.sleep(0.1)
        else:
            # Use fallback analysis
            sentiment, score, emotions = self.analyze_sentiment_fallback(tweet_text)
        
        # Extract hashtags
        hashtags = self.extract_hashtags(tweet_text)
        
        # Add processed fields
        tweet.update({
            'sentiment': sentiment,
            'score': score,
            'emotion': emotions,
            'hashtags': hashtags,
            'processed': True,
            'processed_at': datetime.utcnow(),
            'platform': 'twitter',
            'analysis_method': 'gemini' if self.gemini_available else 'fallback'
        })
        
        return tweet

    def calculate_sentiment_summary(self, tweets):
        """Calculate overall sentiment statistics"""
        if not tweets:
            return {
                'platform': 'twitter',
                'positive_score': 0,
                'negative_score': 0,
                'neutral_score': 0,
                'ovr_score': 0,
                'prev_ovr_score': 0,
                'total_tweets': 0,
                'last_updated': datetime.utcnow(),
                'analysis_method': 'gemini' if self.gemini_available else 'fallback'
            }
        
        sentiment_counts = Counter()
        total_score = 0
        
        for tweet in tweets:
            sentiment = tweet.get('sentiment', 'neutral')
            score = tweet.get('score', 3)
            
            sentiment_counts[sentiment] += 1
            total_score += score
        
        total_tweets = len(tweets)
        avg_score = total_score / total_tweets if total_tweets > 0 else 0
        
        # Get previous overall score
        existing_sentiment = self.db[self.sentiments_collection].find_one({"platform": "twitter"})
        prev_ovr_score = existing_sentiment.get('ovr_score', 0) if existing_sentiment else 0
        
        return {
            'platform': 'twitter',
            'positive_score': sentiment_counts.get('positive', 0),
            'negative_score': sentiment_counts.get('negative', 0),
            'neutral_score': sentiment_counts.get('neutral', 0),
            'ovr_score': round(avg_score * 20, 2),  # Scale to 0-100
            'prev_ovr_score': prev_ovr_score,
            'total_tweets': total_tweets,
            'last_updated': datetime.utcnow(),
            'analysis_method': 'gemini' if self.gemini_available else 'fallback'
        }

    def upload_tweets_to_db(self, tweets):
        """Upload processed tweets to MongoDB"""
        if not tweets:
            logger.warning("No tweets to upload")
            return 0
        
        collection = self.db[self.tweets_collection]
        uploaded_count = 0
        
        for tweet in tweets:
            try:
                # Check if tweet already exists
                existing_tweet = collection.find_one({"ID": tweet.get("ID")})
                
                if existing_tweet:
                    # Update existing tweet with new processing data
                    collection.update_one(
                        {"ID": tweet.get("ID")},
                        {"$set": tweet}
                    )
                    logger.debug(f"Updated existing tweet ID: {tweet.get('ID')}")
                else:
                    # Insert new tweet
                    collection.insert_one(tweet)
                    uploaded_count += 1
                    logger.debug(f"Inserted new tweet ID: {tweet.get('ID')}")
                    
            except Exception as e:
                logger.error(f"Error uploading tweet {tweet.get('ID', 'unknown')}: {e}")
        
        logger.info(f"Successfully uploaded {uploaded_count} new tweets")
        return uploaded_count

    def update_sentiment_database(self, sentiment_summary):
        """Create/update sentiment collection"""
        try:
            collection = self.db[self.sentiments_collection]
            
            # Update or insert sentiment summary
            result = collection.update_one(
                {"platform": "twitter"},
                {"$set": sentiment_summary},
                upsert=True
            )
            
            if result.upserted_id:
                logger.info(f"Created new sentiment record: {result.upserted_id}")
            else:
                logger.info("Updated existing sentiment record")
                
        except Exception as e:
            logger.error(f"Error updating sentiment database: {e}")

    def update_user_profile(self, total_processed):
        """Update user profile with processing statistics"""
        try:
            profile_collection = self.db[self.profile_collection]
            
            update_data = {
                'last_processed': datetime.utcnow(),
                'total_processed_tweets': total_processed,
                'last_fetched': datetime.utcnow(),
                'gemini_enabled': self.gemini_available
            }
            
            result = profile_collection.update_one(
                {"brand_name": self.username},
                {"$set": update_data},
                upsert=True
            )
            
            logger.info(f"Updated user profile for {self.username}")
            
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")

    def process_all_tweets(self):
        """Main processing function"""
        logger.info("=" * 50)
        logger.info("STARTING TWEET PROCESSING WITH GEMINI AI")
        logger.info("=" * 50)
        
        try:
            # Step 1: Load tweets from JSON
            raw_tweets = self.load_tweets_from_json()
            if not raw_tweets:
                logger.warning("No tweets found to process")
                return
            
            # Step 2: Process each tweet (add sentiment analysis)
            analysis_method = "Gemini AI" if self.gemini_available else "Fallback Rule-based"
            logger.info(f"Processing tweets with {analysis_method} sentiment analysis...")
            processed_tweets = []
            
            total_tweets = len(raw_tweets)
            for i, tweet in enumerate(raw_tweets, 1):
                if i % 10 == 0 or i == total_tweets:
                    logger.info(f"Processing tweet {i}/{total_tweets}")
                
                processed_tweet = self.process_tweet_data(tweet)
                processed_tweets.append(processed_tweet)
            
            logger.info(f"Processed {len(processed_tweets)} tweets with {analysis_method}")
            
            # Step 3: Upload tweets to database
            logger.info("Uploading tweets to MongoDB...")
            uploaded_count = self.upload_tweets_to_db(processed_tweets)
            
            # Step 4: Calculate and update sentiment summary
            logger.info("Calculating sentiment summary...")
            sentiment_summary = self.calculate_sentiment_summary(processed_tweets)
            
            logger.info("Sentiment Summary:")
            logger.info(f"  - Positive: {sentiment_summary['positive_score']}")
            logger.info(f"  - Negative: {sentiment_summary['negative_score']}")
            logger.info(f"  - Neutral: {sentiment_summary['neutral_score']}")
            logger.info(f"  - Overall Score: {sentiment_summary['ovr_score']}")
            logger.info(f"  - Analysis Method: {sentiment_summary['analysis_method']}")
            
            # Step 5: Update sentiment database
            logger.info("Updating sentiment database...")
            self.update_sentiment_database(sentiment_summary)
            
            # Step 6: Update user profile
            logger.info("Updating user profile...")
            self.update_user_profile(len(processed_tweets))
            
            # Step 7: Show emotion analysis summary if using Gemini
            if self.gemini_available:
                emotion_counts = Counter()
                for tweet in processed_tweets:
                    emotions = tweet.get('emotion', [])
                    for emotion in emotions:
                        emotion_counts[emotion] += 1
                
                logger.info("Emotion Analysis Summary:")
                for emotion, count in emotion_counts.most_common(5):
                    logger.info(f"  - {emotion.capitalize()}: {count}")
            
            logger.info("=" * 50)
            logger.info("PROCESSING COMPLETED SUCCESSFULLY!")
            logger.info(f"✅ Database: {self.db_name}")
            logger.info(f"✅ Tweets Collection: {self.tweets_collection}")
            logger.info(f"✅ Sentiments Collection: {self.sentiments_collection}")
            logger.info(f"✅ Total Tweets Processed: {len(processed_tweets)}")
            logger.info(f"✅ New Tweets Uploaded: {uploaded_count}")
            logger.info(f"✅ Analysis Method: {analysis_method}")
            logger.info("=" * 50)
            
        except Exception as e:
            logger.error(f"Error in main processing: {e}")
            raise

def main():
    """Main execution function"""
    try:
        processor = TweetProcessor()
        processor.process_all_tweets()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()