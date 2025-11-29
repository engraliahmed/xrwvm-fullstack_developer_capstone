# Uncomment the required imports before adding the code

from .restapis import (
    get_request,
    analyze_review_sentiments,
    post_review,
)
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import logout
from django.contrib import messages
from datetime import datetime

from .models import CarMake, CarModel
from .populate import initiate
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import logging
import json
from django.views.decorators.csrf import csrf_exempt

# from .populate import initiate


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.


# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    # Get username and password from request.POST dictionary
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]
    # Try to check if provide credential can be authenticated
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        # If user is valid, call login method to login current user
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    return JsonResponse(data)


# Create a `logout_request` view to handle sign out request
def logout_request(request):
    # User session terminate karna
    logout(request)

    # Ek JSON response return karna
    data = {"userName": ""}
    return JsonResponse(data)


# ...

# Create a `registration` view to handle sign up request
# @csrf_exempt
# Continue in views.py


def register_user(request):
    # Get user data from POST request body (JSON)
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]
    first_name = data["firstName"]
    last_name = data["lastName"]
    email = data["email"]

    # Check if username already exists
    if User.objects.filter(username=username).exists():
        data = {
            "status": "Already Registered",
            "error": "User with same username is already registered",
        }
        return JsonResponse(data)

    try:
        # Create user object
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )

        # Log in the new user immediately
        login(request, user)
        data = {"status": "User created and logged in", "userName": username}
        return JsonResponse(data)

    except Exception as e:
        logger.error(f"Error during registration: {e}")
        data = {"status": "Error", "error": str(e)}
        return JsonResponse(data)


# views.py mein
def get_cars(request):
    if CarMake.objects.all().count() == 0:
        initiate()

    car_models = CarModel.objects.select_related("car_make")

    cars = []
    for car_model in car_models:
        cars.append(
            {
                "CarModel": car_model.name,
                "CarMake": car_model.car_make.name,
                "Type": car_model.type,
                "Year": car_model.year,
                "DealerId": car_model.dealer_id,
            }
        )

    return JsonResponse({"CarModels": cars})


# ...


# # Update the `get_dealerships` view to render the index page with
# a list of dealerships
# def get_dealerships(request):
def get_dealerships(request, state="All"):
    endpoint = "/fetchDealers"

    params = {}

    if state == "All":
        response = get_request(endpoint)
    else:
        endpoint = f"{endpoint}/{state}"
        response = get_request(endpoint)

    if isinstance(response, list):
        dealerships = response
        return JsonResponse({"status": 200, "dealers": dealerships})

    elif isinstance(response, dict) and response.get("error"):
        return JsonResponse(
            {"status": 500, "message": f"Error from backend: {response.get('error')}"}
        )

    return JsonResponse(
        {
            "status": 500,
            "message": "Error fetching dealership data or invalid response format",
        }
    )


# ...


# Create a `get_dealer_reviews` view to render the reviews of a dealer
# def get_dealer_reviews(request,dealer_id):
def get_dealer_reviews(request, dealer_id):
    endpoint = "/fetchReviews/dealer/" + str(dealer_id)
    response = get_request(endpoint)

    if isinstance(response, list):
        reviews = response

        for review in reviews:
            review_text = review.get("review", "")

            sentiment_data = analyze_review_sentiments(review_text)

            review["sentiment"] = sentiment_data.get("sentiment", "neutral")

        return JsonResponse({"status": 200, "reviews": reviews})

    elif isinstance(response, dict) and response.get("error"):
        return JsonResponse(
            {"status": 500, "message": f"Error from backend: {response.get('error')}"}
        )

    return JsonResponse(
        {"status": 404, "message": "Reviews not found or invalid response format"}
    )


# ...


# Create a `get_dealer_details` view to render the dealer details
# def get_dealer_details(request, dealer_id):
def get_dealer_details(request, dealer_id):
    endpoint = "/fetchDealer/" + str(dealer_id)
    response = get_request(endpoint)

    if isinstance(response, list) and len(response) > 0:
        # Agar Node API Array of one dealer bhejta hai
        dealer = response[0]
        return JsonResponse({"status": 200, "dealer": dealer})

    elif isinstance(response, dict) and response.get("error") is None:
        # Agar Node API seedhe dealer object bhejta hai
        dealer = response
        return JsonResponse({"status": 200, "dealer": dealer})

    return JsonResponse({"status": 404, "message": "Dealer not found"})


# ...

# Create a `add_review` view to submit a review
# def add_review(request):
# ...
