import tweepy
import requests
import time
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("twitter_monitor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger()

# Twitter API credentials
bearer_token = "AAAAAAAAAAAAAAAAAAAAAH9azwEAAAAAjfuhvTyXkDyNWFNC5TU1ee0ld0k%3DKTZrtMkoZ37SevNHxX4xRaXTLTNjVoJ7KI7lfGMeYEAfjTlM2w"  # Replace with your actual token
webhook_url = "http://localhost:5000/webhook"

# List of usernames to monitor
usernames_to_monitor = ["APlusOptionsPro"]
user_ids = {}  # Initialize as empty dictionary

# Set up client for Twitter API v2
client = tweepy.Client(bearer_token=bearer_token, wait_on_rate_limit=True)

# Dictionary to store most recent tweet IDs for each user
most_recent_ids = {}

def get_user_ids():
    """Convert usernames to user IDs and store them"""
    global user_ids
    
    for username in usernames_to_monitor:
        try:
            user_response = client.get_user(username=username)
            if user_response.data:
                user_id = user_response.data.id
                user_ids[username] = user_id
                logger.info(f"Will monitor tweets from @{username} (ID: {user_id})")
            else:
                logger.error(f"User @{username} not found")
        except tweepy.TooManyRequests:
            logger.warning(f"Rate limit exceeded for @{username}, waiting before retry...")
            time.sleep(60)
        except Exception as e:
            logger.error(f"Error getting user ID for @{username}: {e}")

def forward_tweet_to_webhook(username, tweet_id, tweet_text, created_at):
    """Send the tweet data to webhook"""
    try:
        payload = {
            "username": username,
            "tweet_id": tweet_id,
            "content": tweet_text,
            "created_at": created_at,
            "url": f"https://twitter.com/{username}/status/{tweet_id}"
        }
        
        response = requests.post(webhook_url, json=payload)
        if response.status_code in (200, 201, 202, 204):
            logger.info(f"Successfully forwarded tweet from @{username} to webhook")
            return True
        else:
            logger.error(f"Failed to forward tweet. Status code: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"Error forwarding to webhook: {e}")
        return False

def check_user_tweets(username, user_id):
    """Check for recent tweets from a specific user (sample fetch)"""
    try:
        # Get tweets from user - fetch 5 most recent, no since_id
        tweets_response = client.get_users_tweets(
            id=user_id,
            max_results=5,  # Minimum allowed by API
            tweet_fields=["created_at", "text"]
        )
        
        if tweets_response and tweets_response.data:
            tweets_to_process = list(reversed(tweets_response.data))
            logger.info(f"Found {len(tweets_to_process)} recent tweets from @{username}")
            
            for tweet in tweets_to_process:
                tweet_text = tweet.text
                tweet_id = tweet.id
                created_at = str(tweet.created_at)
                
                logger.info(f"Sample tweet from @{username} (ID: {tweet_id}): {tweet_text}")
                forward_tweet_to_webhook(username, tweet_id, tweet_text, created_at)
        else:
            logger.info(f"No tweets found for @{username}")
            
    except tweepy.TooManyRequests:
        logger.warning(f"Rate limit exceeded when checking @{username}, will retry later")
        return False
    except Exception as e:
        logger.error(f"Error fetching tweets for @{username}: {e}")
        return False
    
    return True

def monitor_all_users():
    """Check for recent tweets from all monitored users (one-time fetch)"""
    for username, user_id in user_ids.items():
        if not check_user_tweets(username, user_id):
            logger.warning("Rate limit hit, stopping...")
            break
    logger.info("Sample fetch complete. Exiting.")

def main():
    """Main function to run the Twitter monitor"""
    try:
        get_user_ids()
        
        if not user_ids:
            logger.error("No valid users found to monitor. Exiting.")
            return
            
        logger.info("Twitter monitor started. Press Ctrl+C to stop.")
        
        while True:
            monitor_all_users()
            
    except KeyboardInterrupt:
        logger.info("Monitor stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()