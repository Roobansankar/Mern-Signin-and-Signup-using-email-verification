const router = require("express").Router();
const { User, validate } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res
        .status(409)
        .send({ message: "User with given email already exists!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    let user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      password: hashPassword,
    });

    if (req.file) {
      user.image = req.file.buffer;
      user.imageType = req.file.mimetype;
    }

    user = await user.save();

    const token = new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    await token.save();

    const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
    await sendEmail(user.email, "Verify Email", url);

    res.status(201).send({
      message: "An email has been sent to your account. Please verify.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:id/verify/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOneAndDelete({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    await User.findByIdAndUpdate(user._id, { verified: true });

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:id/image", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.image) {
      return res.status(404).send({ message: "Image not found" });
    }

    res.set("Content-Type", user.imageType);
    res.send(user.image);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
