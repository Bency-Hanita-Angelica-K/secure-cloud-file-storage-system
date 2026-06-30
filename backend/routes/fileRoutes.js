const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const File = require("../models/File");
const { storage, cloudinary } = require("../config/cloudinary");

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Upload File
router.post(
  "/upload",
  auth,
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
      if (err) {
        console.error("MULTER/CLOUDINARY ERROR:", err.message);
        return res.status(500).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = await File.create({
        fileName: req.file.originalname,
        fileUrl: req.file.path,
        publicId: req.file.filename,
        user: req.user.id,
      });

      res.status(201).json({
        message: "File uploaded successfully",
        file,
      });
    } catch (error) {
      console.error("========== UPLOAD ERROR ==========");
      console.error("Message:", error.message);
      console.error(error);
      console.error("==================================");

      res.status(500).json({
        message: error.message,
      });
    }
  }
);

// Get All Files of Logged-in User
router.get("/", auth, async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch files" });
  }
});

// Delete File
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    await cloudinary.uploader.destroy(file.publicId);

    await File.findByIdAndDelete(file._id);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to delete file" });
  }
});

module.exports = router;