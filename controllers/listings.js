const Listing = require("../models/listing");

// Helper function to geocode location using Google Maps Geocoding API
async function geocodeLocation(location) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.includes("add_your")) {
    return { type: 'Point', coordinates: [0, 0] };
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "OK" && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
      };
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return { type: 'Point', coordinates: [0, 0] };
}

module.exports.index = async (req, res) => {
    const { search, category } = req.query;
    let query = {};
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
        ];
    }
    if (category) {
        query.category = category;
    }
    const allListings = await Listing.find(query);
    res.render("listings/index", { allListings, category: category || "" });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let url = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=cover&w=800&q=60";
    let filename = "default_image";
    if (req.file) {
        url = req.file.path.startsWith("http") ? req.file.path : `/uploads/${req.file.filename}`;
        filename = req.file.filename;
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    
    newListing.geometry = await geocodeLocation(req.body.listing.location);

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    if (originalImageUrl && originalImageUrl.includes("/upload")) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Handle Coordinate update if location changed
    if (req.body.listing.location) {
        listing.geometry = await geocodeLocation(req.body.listing.location);
        await listing.save();
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path.startsWith("http") ? req.file.path : `/uploads/${req.file.filename}`;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
