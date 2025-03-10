import tweepy
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger()

# Twitter API credentials
bearer_token = "AAAAAAAAAAAAAAAAAAAAAH9azwEAAAAAjfuhvTyXkDyNWFNC5TU1ee0ld0k%3DKTZrtMkoZ37SevNHxX4xRaXTLTNjVoJ7KI7lfGMeYEAfjTlM2w"  # Your bearer token

# Set up client
client = tweepy.Client(bearer_token=bearer_token, wait_on_rate_limit=True)

def fetch_sample_tweets():
    """Fetch 5 recent tweets from @APlusOptionsPro"""
    try:
        # Hardcode the user ID to avoid extra API call
        user_id = 1387542700463960067  # @APlusOptionsPro
        tweets_response = client.get_users_tweets(
            id=user_id,
            max_results=5,
            tweet_fields=["created_at", "text"]
        )
        
        if tweets_response and tweets_response.data:
            logger.info(f"Found {len(tweets_response.data)} recent tweets:")
            for tweet in tweets_response.data:
                logger.info(f"ID: {tweet.id} | Created: {tweet.created_at} | Text: {tweet.text}")
        else:
            logger.info("No tweets found.")
            
    except tweepy.TooManyRequests:
        logger.warning("Rate limit exceeded. Waiting automatically...")
    except Exception as e:
        logger.error(f"Error: {e}")

if __name__ == "__main__":
    fetch_sample_tweets()
