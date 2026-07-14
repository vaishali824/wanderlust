if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
// mongoose.connect(process.env.ATLASDB_URL);


const listing = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

// const Listing = require("./models/listing.js");
const Review = require("./models/review.js");   // ✅ ONLY ONCE

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ejsLayouts = require("express-ejs-layouts");

// const { listingSchema, reviewSchema } = require("./schema.js");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// MongoDB Connection
const dbUrl = (process.env.ATLASDB_URL && !process.env.ATLASDB_URL.includes("mongodb+srv://vaishalimuddasani_db_user:PFSjpYNVCSgCoK5O@cluster0.vebfugj.mongodb.net/?appName=Cluster0"))
  ? process.env.ATLASDB_URL
  : "mongodb://127.0.0.1:27017/wanderlust";

let isConnecting = false;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  if (isConnecting) {
    return;
  }
  isConnecting = true;
  try {
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout instead of 30 seconds
    });
    console.log("Connected to DB successfully");
  } catch (err) {
    console.error("DB Connection Error:", err);
  } finally {
    isConnecting = false;
  }
}

// Initial connection attempt
connectDB();


// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.set("layout", "layouts/boilerplate");


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
      secret: process.env.SECRET || "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions={
  store,
  secret: process.env.SECRET || "mysupersecretcode",
  resave:false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() +7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Ensure DB connection is established before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Root Route
app.get("/", (req, res) => {  
  res.redirect("/listings");
});


app.use((req,res,next)=>{
  res.locals.success =req.flash("success");
  res.locals.error =req.flash("error");
  res.locals.currUser = req.user;
  res.locals.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  next();
});

// ---------------------- ROUTES ----------------------

app.use("/listings", listing);
app.use("/listings/:id/reviews", reviews);
app.use("/", userRouter);


// 404 PAGE NOT FOUND
app.use((req, res) => {
  throw new ExpressError(404, "Page Not Found");
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).send(err.message || "Something went wrong!");
});


// LISTENER
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = app;



