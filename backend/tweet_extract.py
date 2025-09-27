import time
import json
import tweepy

# Twitter API Credentials

# nagesh
API_KEY = "zzKYJWiiyzSpOAASd6CpZjxYx"
API_SECRET = "O32RD1aDXXFjuLGv7LCcKzqJf16cs2hUfJAas0FaGxtTiQD6Pl"
ACCESS_TOKEN = "1741513990994362368-F08JIpwXLGZwzdRBPTQvUZzycCxiCx"
ACCESS_SECRET = "MKULQCf1GE0mtyE9axMyozOUK3zqjfOm32yrg1NvBrQqb"
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAFJnzgEAAAAAtnYArKc5uPDrL9sj5VqRX7ZIMZ0%3DLits0vZPxQDhrKAWVRi9bFgevaoWRqNJUFGvutZ2E5Xg5OFULz"


#prathma

# API_KEY = "lhe0aIMg34ZpyULdscyW6UCSg"
# API_SECRET = "1EVWgC4ZUSAwWZSMtqbRDvUbOYWl3aBiZWNIgi4S5tZ74y7LdR"
# ACCESS_TOKEN = "1405819723812466689-0d5Q6ZzBTw8KO0Sal33XaaVPAZXJgl"
# ACCESS_SECRET = "5PkJ20QtWkP39cqZfLNSHAUwMKzVoK6S4heCiajuyfJsy"
# BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAEZ2zgEAAAAA%2B1E9uCBR%2F9Ib8aGofb%2BNa4Hz%2Bb4%3DaJEcsm8EagnK3Q1FkKsXM36sTLyJ2BpjoEsDht8jSKvcKjzHPz"

#nikhil 
# API_KEY = "BfmJlNVY6gyqpMLjRVUqyDAdu"
# API_SECRET = "a94KwbpexmTGR7IJcWPteTfnxaESRkHNTLradkTVsLNP27Mnc2"
# ACCESS_TOKEN = "1895002008098418688-vvLTu4v1sLHHDxe0VcPjbOd2w3bd0d"
# ACCESS_SECRET = "Juta2MNK2PY6rea76sBOGsEfyXeDlc6QcBMdHLGpeqlzb"
# BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAMxazgEAAAAAxZux6b5l%2Fu5285TxzI%2F2%2BvzxYTk%3Dp8zZULtma0hg7QnxbD98y2TCN3B2cvoeNC04OkeIm46qckUIF6"


# Authenticate using Bearer Token (For v2 API)
client = tweepy.Client(bearer_token=BEARER_TOKEN)

def fetch_tweets_mentioning_nike(query, max_results=10):
    """Fetch recent tweets mentioning Nike and save them in a JSON file."""
    while True:
        try:
            response = client.search_recent_tweets(
                query=query,
                max_results=max_results,
                tweet_fields=["created_at", "public_metrics"]
            )

            if response.data:
                tweets = []
                for tweet in response.data:
                    # Manually filter out retweets (tweets starting with "RT ")
                    if not tweet.text.startswith("RT "):
                        tweets.append({
                            "ID": tweet.id,
                            "tweet": tweet.text,
                            "date": str(tweet.created_at),
                            "likes": tweet.public_metrics["like_count"],
                            "retweets": tweet.public_metrics["retweet_count"]
                            "emotion": [],
                            "sentiment": "",
                            "hashtags": [],
                            "mentions": [],
                            "processed": False,
                            "username":"unkown"
                        })
                
                # Save to JSON file
                with open("boat4_tweets.json", "w", encoding="utf-8") as file:
                    json.dump(tweets, file, indent=4)
                
                print(f"Fetched and saved {len(tweets)} tweets in 'boat4_tweets.json'.")
                return tweets
            else:
                print("No recent tweets found.")
                return []

        except tweepy.TooManyRequests as e:
            reset_time = int(e.response.headers.get("x-rate-limit-reset", time.time() + 900))
            sleep_duration = max(reset_time - int(time.time()) + 5, 60) 
            print(f"Rate limit reached. Sleeping for {sleep_duration} seconds...")
            time.sleep(sleep_duration)

        except Exception as e:
            print("Error:", e)
            return None


# if __name__ == "__main__":
#     query = "(#boAt OR @boAt OR #BoatLife OR #NirvanaxDhruvKapoor OR #adventure) -is:retweet"
#     tweets = fetch_tweets_mentioning_nike(query, max_results=10)

