import time
import json
import tweepy
import re
import os

# ====================
# CONFIGURATION VARIABLES - CHANGE THESE AS NEEDED
# ====================

# Brand Configuration
USERNAME="NIKHIL"
BRAND_NAME = "nike"  # Brand name for searches
HASHTAGS = ["nike", "nikeshoes"]  # List of hashtags to search

# Twitter API Credentials - Switch between different API keys as needed
# Active API (nagesh)
API_KEY = "zzKYJWiiyzSpOAASd6CpZjxYx"
API_SECRET = "O32RD1aDXXFjuLGv7LCcKzqJf16cs2hUfJAas0FaGxtTiQD6Pl"
ACCESS_TOKEN = "1741513990994362368-F08JIpwXLGZwzdRBPTQvUZzycCxiCx"
ACCESS_SECRET = "MKULQCf1GE0mtyE9axMyozOUK3zqjfOm32yrg1NvBrQqb"
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAFJnzgEAAAAAtnYArKc5uPDrL9sj5VqRX7ZIMZ0%3DLits0vZPxQDhrKAWVRi9bFgevaoWRqNJUFGvutZ2E5Xg5OFULz"

# Alternative API Keys (uncomment to use)
# prathma
# API_KEY = "lhe0aIMg34ZpyULdscyW6UCSg"
# API_SECRET = "1EVWgC4ZUSAwWZSMtqbRDvUbOYWl3aBiZWNIgi4S5tZ74y7LdR"
# ACCESS_TOKEN = "1405819723812466689-0d5Q6ZzBTw8KO0Sal33XaaVPAZXJgl"
# ACCESS_SECRET = "5PkJ20QtWkP39cqZfLNSHAUwMKzVoK6S4heCiajuyfJsy"
# BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAEZ2zgEAAAAA%2B1E9uCBR%2F9Ib8aGofb%2BNa4Hz%2Bb4%3DaJEcsm8EagnK3Q1FkKsXM36sTLyJ2BpjoEsDht8jSKvcKjzHPz"

# nikhil
# API_KEY = "BfmJlNVY6gyqpMLjRVUqyDAdu"
# API_SECRET = "a94KwbpexmTGR7IJcWPteTfnxaESRkHNTLradkTVsLNP27Mnc2"
# ACCESS_TOKEN = "1895002008098418688-vvLTu4v1sLHHDxe0VcPjbOd2w3bd0d"
# ACCESS_SECRET = "Juta2MNK2PY6rea76sBOGsEfyXeDlc6QcBMdHLGpeqlzb"
# BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAMxazgEAAAAAxZux6b5l%2Fu5285TxzI%2F2%2BvzxYTk%3Dp8zZULtma0hg7QnxbD98y2TCN3B2cvoeNC04OkeIm46qckUIF6"

# ====================

# Authenticate using Bearer Token (For v2 API)
client = tweepy.Client(bearer_token=BEARER_TOKEN)

def extract_hashtags(tweet_text):
    """Extract hashtags from tweet text."""
    hashtags = re.findall(r'#\w+', tweet_text)
    # Remove the # symbol and convert to lowercase for consistency
    return [tag[1:].lower() for tag in hashtags]

def tweet_contains_target_hashtags(tweet_text, target_hashtags):
    """Check if tweet contains at least one of the target hashtags."""
    tweet_hashtags = extract_hashtags(tweet_text)
    # Convert target hashtags to lowercase for comparison
    target_hashtags_lower = [tag.lower() for tag in target_hashtags]
    
    # Check if any of the tweet's hashtags match our target hashtags
    return any(hashtag in target_hashtags_lower for hashtag in tweet_hashtags)

def load_existing_tweets(filename):
    """Load existing tweets from JSON file if it exists."""
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as file:
                existing_tweets = json.load(file)
                print(f"Loaded {len(existing_tweets)} existing tweets from {filename}")
                return existing_tweets
        except (json.JSONDecodeError, FileNotFoundError):
            print(f"Could not load existing file {filename}, starting fresh.")
            return []
    else:
        print(f"No existing file {filename} found, starting fresh.")
        return []

def save_tweets_to_file(tweets, filename):
    """Save tweets to JSON file."""
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(tweets, file, indent=4, ensure_ascii=False)
    print(f"Saved {len(tweets)} total tweets to {filename}")

def tweets_already_exists(tweet_id, existing_tweets):
    """Check if a tweet ID already exists in the existing tweets."""
    return any(str(tweet['ID']) == str(tweet_id) for tweet in existing_tweets)

def build_search_query(brand_name, hashtags):
    """Build a search query using the configured variables."""
    query_parts = []
    
    # Add hashtags
    for hashtag in hashtags:
        query_parts.append(f"#{hashtag}")
    
    # Add brand name (optional - you can remove this if not needed)
    if brand_name:
        query_parts.append(brand_name)
    
    # Combine all parts with OR operator and exclude retweets
    query = f"({' OR '.join(query_parts)}) -is:retweet"
    
    return query

def fetch_brand_tweets(max_results=10, total_batches=1):
    """Fetch recent tweets for the configured brand and save them in a JSON file."""
    
    # Build the search query using configuration variables
    query = build_search_query(BRAND_NAME, HASHTAGS)
    print(f"Search query: {query}")
    
    # Static filename for all brands
    filename = "tweets.json"
    
    # Load existing tweets
    existing_tweets = load_existing_tweets(filename)
    all_new_tweets = []
    
    for batch in range(total_batches):
        print(f"\n--- Fetching Batch {batch + 1}/{total_batches} ---")
        
        while True:
            try:
                response = client.search_recent_tweets(
                    query=query,
                    max_results=max_results,
                    tweet_fields=["created_at", "public_metrics", "author_id"]
                )

                if response.data:
                    new_tweets = []
                    duplicate_count = 0
                    filtered_count = 0
                    
                    for tweet in response.data:
                        # Skip if tweet already exists (check both existing and newly fetched)
                        if (tweets_already_exists(tweet.id, existing_tweets) or 
                            tweets_already_exists(tweet.id, all_new_tweets)):
                            duplicate_count += 1
                            continue
                        
                        # Manually filter out retweets (tweets starting with "RT ")
                        if not tweet.text.startswith("RT "):
                            # Check if tweet contains our target hashtags
                            if tweet_contains_target_hashtags(tweet.text, HASHTAGS):
                                # Extract hashtags from the tweet text
                                hashtags_found = extract_hashtags(tweet.text)
                                
                                new_tweet = {
                                    "ID": tweet.id,
                                    "tweet": tweet.text,
                                    "date": str(tweet.created_at),
                                    "likes": tweet.public_metrics["like_count"],
                                    "retweets": tweet.public_metrics["retweet_count"],
                                    "emotion": [],
                                    "sentiment": "",
                                    "hashtags": hashtags_found,
                                    "mentions": [],
                                    "processed": False,
                                    "username": "unknown",
                                    "brand_searched": BRAND_NAME,
                                    "author_id": tweet.author_id if hasattr(tweet, 'author_id') else "unknown",
                                    "batch_number": batch + 1
                                }
                                new_tweets.append(new_tweet)
                            else:
                                filtered_count += 1

                    # Add new tweets to our collection
                    all_new_tweets.extend(new_tweets)
                    
                    print(f"Batch {batch + 1}: Fetched {len(new_tweets)} new tweets")
                    if duplicate_count > 0:
                        print(f"Batch {batch + 1}: Skipped {duplicate_count} duplicate tweets")
                    if filtered_count > 0:
                        print(f"Batch {batch + 1}: Filtered out {filtered_count} tweets without target hashtags")
                    
                    # Break out of the retry loop for this batch
                    break
                else:
                    print(f"Batch {batch + 1}: No recent tweets found for {BRAND_NAME}.")
                    break

            except tweepy.TooManyRequests as e:
                reset_time = int(e.response.headers.get("x-rate-limit-reset", time.time() + 900))
                sleep_duration = max(reset_time - int(time.time()) + 5, 60)

                print(f"Rate limit reached. Sleeping for {sleep_duration} seconds...")
                time.sleep(sleep_duration)

            except Exception as e:
                print("Error:", e)
                break
        
        # Add delay between batches to avoid rate limiting
        if batch < total_batches - 1 and all_new_tweets:
            print(f"Waiting 5 seconds before next batch...")
            time.sleep(5)
    
    # Combine existing and all new tweets
    all_tweets = existing_tweets + all_new_tweets
    
    # Save combined tweets to file
    if all_new_tweets:
        save_tweets_to_file(all_tweets, filename)
        print(f"\n✅ Total new tweets fetched: {len(all_new_tweets)}")
        print(f"✅ Total tweets in file: {len(all_tweets)}")
    
    return all_new_tweets

# Example usage
if __name__ == "__main__":
    print("=" * 60)
    print("TWITTER BRAND TWEET FETCHER - HASHTAG FILTERED")
    print("=" * 60)
    print(f"Brand: {BRAND_NAME}")
    print(f"Required Hashtags: {HASHTAGS}")
    print("-" * 60)
    print("⚠️  IMPORTANT: Only tweets containing the specified hashtags will be saved!")
    print("   This ensures all saved tweets have your target hashtags.")
    print("-" * 60)
    
    # Configure how many tweets you want to fetch
    TWEETS_PER_BATCH = 100  # Max 100 per API call
    NUMBER_OF_BATCHES = 3   # How many batches to fetch
    
    print(f"📊 Fetching {TWEETS_PER_BATCH} tweets per batch, {NUMBER_OF_BATCHES} batches total")
    print(f"📊 Maximum new tweets: {TWEETS_PER_BATCH * NUMBER_OF_BATCHES}")
    print("-" * 60)
    
    tweets = fetch_brand_tweets(max_results=TWEETS_PER_BATCH, total_batches=NUMBER_OF_BATCHES)
    
    if tweets:
        print(f"✅ Successfully fetched {len(tweets)} new tweets!")
        
        # Show some statistics about hashtags found
        all_hashtags = []
        for tweet in tweets:
            all_hashtags.extend(tweet['hashtags'])
        
        if all_hashtags:
            unique_hashtags = list(set(all_hashtags))
            print(f"📊 Found hashtags in new tweets: {', '.join(unique_hashtags[:10])}")
            if len(unique_hashtags) > 10:
                print(f"   ... and {len(unique_hashtags) - 10} more")
            
            # Show which target hashtags were found
            target_hashtags_found = [tag for tag in unique_hashtags if tag in [h.lower() for h in HASHTAGS]]
            print(f"🎯 Target hashtags found: {target_hashtags_found}")
            
            # Show batch distribution
            batch_counts = {}
            for tweet in tweets:
                batch_num = tweet.get('batch_number', 1)
                batch_counts[batch_num] = batch_counts.get(batch_num, 0) + 1
            
            print(f"📈 Tweets per batch: {dict(sorted(batch_counts.items()))}")
        else:
            print("📊 No hashtags found in the new tweets")
    else:
        print("❌ No new tweets were fetched.")
    
    print("=" * 60)