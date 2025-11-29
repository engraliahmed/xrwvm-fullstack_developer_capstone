# Uncomment the imports below before you add the function code
import requests
import os
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv("backend_url", default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    "sentiment_analyzer_url", default="http://localhost:5050/"
)

# def get_request(endpoint, **kwargs):
# Add code for get requests to back end
# server/djangoapp/restapis.py
# ... previous code ...


def get_request(endpoint, **kwargs):
    # Base URL mein endpoint jodna
    request_url = backend_url + endpoint

    print(f"GET from: {request_url}")

    try:
        # URL parameters ko handle karna
        # Agar kwargs mein parameters hain, toh unhe 'params' mein pass karein
        response = requests.get(request_url, params=kwargs)

        # Agar response OK hai (200), toh JSON data return karein
        response.raise_for_status()  
        return response.json()

    except requests.exceptions.RequestException as e:
        # Agar koi network ya HTTP error aati hai
        print(f"Network exception occurred: {e}")
        return None  # None return karein ya empty list


# def analyze_review_sentiments(text):
# request_url = sentiment_analyzer_url+"analyze/"+text
# Add code for retrieving sentiments
def analyze_review_sentiments(text):

    request_url = sentiment_analyzer_url + "analyze/" + text

    print(f"GET to Sentiment Microservice: {request_url}")

    try:
        # GET call to the microservice
        response = requests.get(request_url)
        response.raise_for_status()

        return response.json()

    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred during sentiment analysis")
        return {"sentiment": "neutral"}


# def post_review(data_dict):
# Add code for posting review
def post_review(data_dict):
    request_url = backend_url + "/insert_review"

    print(f"POST to: {request_url}")

    try:
        response = requests.post(request_url, json=data_dict)
        response.raise_for_status()

        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"Network exception occurred during POST: {e}")
        return {"status": "error",
                 "message": "Network error during review submission"}
