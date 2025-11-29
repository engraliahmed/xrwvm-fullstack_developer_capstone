// server/database/app.js - FINAL CORRECTED CODE
const Dealership = require("./dealership");
const Review = require("./review");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const app = express();
const port = 3030;

app.use(cors());
app.use(express.json());

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", "utf8"));
const dealerships_data = JSON.parse(
    fs.readFileSync("dealerships.json", "utf8")
);

mongoose.connect("mongodb://mongo_db:27017/", { dbName: "dealershipsDB" });

const Reviews = require("./review");
const Dealerships = require("./dealership");

Reviews.deleteMany({}).then(() => {
    Reviews.insertMany(reviews_data["reviews"]);
});
Dealerships.deleteMany({}).then(() => {
    Dealerships.insertMany(dealerships_data["dealerships"]);
});

// Express route to home
app.get("/", async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

// Express route to fetch all reviews
app.get("/fetchReviews", async (req, res) => {
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: "Error fetching documents" });
    }
});

// Express route to fetch reviews by a particular dealer
app.get("/fetchReviews/dealer/:id", async (req, res) => {
    try {
        const documents = await Reviews.find({ dealership: req.params.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: "Error fetching documents" });
    }
});

// Express route to fetch all dealerships
app.get("/fetchDealers", async (req, res) => {
    try {
        const dealers = await Dealership.find();
        res.status(200).json(dealers);
    } catch (error) {
        console.error("Error fetching all dealers:", error);
        res.status(500).json({
            error: "Internal Server Error: Failed to retrieve data from Mongo.",
        });
    }
});

// Express route to fetch Dealers by a particular state
app.get("/fetchDealers/:state", async (req, res) => {
    const state = req.params.state;
    try {
        const dealers = await Dealership.find({
            state: { $regex: new RegExp(`^${state}$`, "i") },
        });

        if (dealers.length > 0) {
            res.json(dealers);
        } else {
            res.status(404).json({
                error: "No dealerships found in the specified state",
            });
        }
    } catch (error) {
        console.error(`Error fetching dealers for state ${state}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Express route to fetch dealer by a particular id
app.get("/fetchDealer/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const dealer = await Dealership.findOne({ id: id });

        if (dealer) {
            res.json(dealer);
        } else {
            res.status(404).json({ error: "Dealer not found" });
        }
    } catch (error) {
        console.error(`Error fetching dealer with ID ${id}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Express route to insert review
app.post("/insert_review", async (req, res) => {
    // FIX 2: express.raw middleware removed, using express.json middleware
    // FIX 2: Data is now in req.body because of express.json() middleware
    const data = req.body;

    // ID generation
    const documents = await Reviews.find().sort({ id: -1 });
    let new_id = documents.length > 0 ? documents[0]["id"] + 1 : 1;

    const review = new Reviews({
        id: new_id,
        name: data["user_name"] || data["name"], // Django se user_name
        user_id: data["user_id"], // Django se user ID
        dealership: data["dealership"],
        review: data["review"],
        purchase: data["purchase"],
        purchase_date: data["purchase_date"],
        car_make: data["car_make"],
        car_model: data["car_model"],
        car_year: data["car_year"],
    });

    try {
        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error) {
        console.error("Error inserting review:", error);
        res.status(500).json({ error: "Error inserting review" });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
