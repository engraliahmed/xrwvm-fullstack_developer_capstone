// server/database/app.js mein, file ke top par
const Dealership = require("./dealership");
const Review = require("./review");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const app = express();
const port = 3030;

app.use(cors());
app.use(require("body-parser").urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", "utf8"));
const dealerships_data = JSON.parse(
    fs.readFileSync("dealerships.json", "utf8")
);

mongoose.connect("mongodb://mongo_db:27017/", { dbName: "dealershipsDB" });

const Reviews = require("./review");

const Dealerships = require("./dealership");

try {
    Reviews.deleteMany({}).then(() => {
        Reviews.insertMany(reviews_data["reviews"]);
    });
    Dealerships.deleteMany({}).then(() => {
        Dealerships.insertMany(dealerships_data["dealerships"]);
    });
} catch (error) {
    res.status(500).json({ error: "Error fetching documents" });
}

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
        // Simple find operation
        const dealers = await Dealership.find();

        // Agar data milta hai, toh array of objects return karein
        res.status(200).json(dealers);
    } catch (error) {
        console.error("Error fetching all dealers:", error);
        // Database ya Mongoose connection error
        // Important: Agar app.js crash ho raha hai, toh yeh error use dikhni chahiye.
        res.status(500).json({
            error: "Internal Server Error: Failed to retrieve data from Mongo.",
        });
    }
});


// Express route to fetch Dealers by a particular state
app.get("/fetchDealers/:state", async (req, res) => {
    //Write your code here
    const state = req.params.state;
    try {
        // Case-insensitive search for the state
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
        // FIX: Numeric ID field se query karna
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
app.post("/insert_review", express.raw({ type: "*/*" }), async (req, res) => {
    data = JSON.parse(req.body);
    const documents = await Reviews.find().sort({ id: -1 });
    let new_id = documents[0]["id"] + 1;

    const review = new Reviews({
        id: new_id,
        name: data["name"],
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
        res.json(savedReview);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error inserting review" });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
