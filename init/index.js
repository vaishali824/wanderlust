require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const locationCoordinates = {
  "New York City": [ -74.0060, 40.7128 ],
  "Aspen": [ -106.8175, 39.1911 ],
  "Florence": [ 11.2558, 43.7696 ],
  "Portland": [ -122.6784, 45.5152 ],
  "Lake Tahoe": [ -120.0324, 39.0968 ],
  "Los Angeles": [ -118.2437, 34.0522 ],
  "Verbier": [ 7.2286, 46.0961 ],
  "Serengeti National Park": [ 34.8333, -2.1540 ],
  "Amsterdam": [ 4.8952, 52.3702 ],
  "Fiji": [ 178.0650, -17.7134 ],
  "Cotswolds": [ -1.8262, 51.9294 ],
  "Boston": [ -71.0589, 42.3601 ],
  "Bali": [ 115.1889, -8.4095 ],
  "Banff": [ -115.5708, 51.1784 ],
  "Miami": [ -80.1918, 25.7617 ],
  "Phuket": [ 98.3923, 7.8804 ],
  "Scottish Highlands": [ -4.2026, 57.4778 ],
  "Dubai": [ 55.2708, 25.2048 ],
  "Montana": [ -110.3626, 46.8797 ],
  "Mykonos": [ 25.3667, 37.4500 ],
  "Costa Rica": [ -84.0907, 9.7489 ],
  "Charleston": [ -79.9311, 32.7765 ],
  "Tokyo": [ 139.6917, 35.6762 ],
  "New Hampshire": [ -71.5724, 43.1939 ],
  "Maldives": [ 73.5089, 3.2028 ]
};

const titleCategories = {
  "Modern Loft in Downtown": "Iconic Cities",
  "Mountain Retreat": "Mountains",
  "Historic Villa in Tuscany": "Iconic Cities",
  "Secluded Treehouse Getaway": "Rooms",
  "Rustic Cabin by the Lake": "Farms",
  "Luxury Penthouse with City Views": "Iconic Cities",
  "Ski-In/Ski-Out Chalet": "Arctic",
  "Safari Lodge in the Serengeti": "Farms",
  "Historic Canal House": "Iconic Cities",
  "Private Island Retreat": "Beach",
  "Charming Cottage in the Cotswolds": "Rooms",
  "Historic Brownstone in Boston": "Iconic Cities",
  "Beachfront Bungalow in Bali": "Beach",
  "Mountain View Cabin in Banff": "Mountains",
  "Art Deco Apartment in Miami": "Beach",
  "Tropical Villa in Phuket": "Amazing Pools",
  "Historic Castle in Scotland": "Domes",
  "Desert Oasis in Dubai": "Amazing Pools",
  "Rustic Log Cabin in Montana": "Mountains",
  "Beachfront Villa in Greece": "Beach",
  "Eco-Friendly Treehouse Retreat": "Domes",
  "Historic Cottage in Charleston": "Rooms",
  "Modern Apartment in Tokyo": "Iconic Cities",
  "Lakefront Cabin in New Hampshire": "Mountains",
  "Luxury Villa in the Maldives": "Amazing Pools",
  "Ski Chalet in Aspen": "Arctic",
  "Secluded Beach House in Costa Rica": "Beach"
};

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    
    // Find or create default admin/owner user
    let defaultUser = await User.findOne({ username: "admin" });
    if (!defaultUser) {
      defaultUser = new User({ email: "admin@gmail.com", username: "admin" });
      defaultUser = await User.register(defaultUser, "adminpassword");
      console.log("Default admin user created");
    }

    const updatedData = initData.data.map((obj) => {
      const coords = locationCoordinates[obj.location] || [0, 0];
      const category = titleCategories[obj.title] || "Trending";
      return {
        ...obj,
        owner: defaultUser._id,
        geometry: {
          type: "Point",
          coordinates: coords
        },
        category: category
      };
    });

    await Listing.insertMany(updatedData);
    console.log("Data was initialized successfully with owners, categories, and coordinates");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error during DB initialization:", err);
  }
};