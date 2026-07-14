const path = require("path");
const fs = require("fs");
const multer = require("multer");

let storage;
let cloudinary = null;

const hasCloudinaryEnv = process.env.CLOUD_NAME &&
    !process.env.CLOUD_NAME.includes("add_your") &&
    process.env.CLOUD_API_KEY &&
    !process.env.CLOUD_API_KEY.includes("add_your") &&
    process.env.CLOUD_API_SECRET &&
    !process.env.CLOUD_API_SECRET.includes("add_your");

if (hasCloudinaryEnv) {
    cloudinary = require("cloudinary").v2;
    const { CloudinaryStorage } = require("multer-storage-cloudinary");
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: "wanderlust_DEV",
            allowedFormats: ["png", "jpg", "jpeg"],
        },
    });
    console.log("Cloudinary storage configured successfully.");
} else {
    // Local storage fallback
    const uploadDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
    console.log("Cloudinary credentials missing or placeholders. Using local disk storage fallback.");
}

module.exports = {
    cloudinary,
    storage
};
