const cloudinary = require("cloudinary");
const bcrypt = require("bcrypt");
const Doctors = require("../model/admin_model");
const Users = require("../model/user_model");

// Create Doctor
const createDoctor = async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  
  const {
    fullName,
    email,
    password,
    phoneNumber,
    gender,
    address,
    city,
    state,
    qualification,
    servicesOffered,
  } = req.body;

  const { uploadValidId } = req.files;

  // Validate required fields
  if (
    !fullName ||
    !email ||
    !password ||
    !phoneNumber ||
    !gender ||
    !address ||
    !city ||
    !state ||
    !qualification ||
    !servicesOffered ||
    !uploadValidId
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the required fields.",
    });
  }

  try {
    const uploadedImage = await cloudinary.v2.uploader.upload(uploadValidId.path, {
      folder: "doctors",
      crop: "scale",
    });

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctors({
      fullName,
      email,
      password: encryptedPassword,
      phoneNumber,
      gender,
      address,
      city,
      state,
      qualification,
      servicesOffered,
      uploadValidIdUrl: uploadedImage.secure_url,
    });

    await newDoctor.save();

    const newUser = new Users({
      _id: newDoctor._id,
      username: fullName,  // Ensure this matches the required field in your Users model
      email,
      phoneNumber,
      password: encryptedPassword,
      confirmPassword: encryptedPassword,
      isDoctor: true,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Doctor created successfully.",
    });

  } catch (error) {
    console.error('Error during doctor creation:', error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};
// Fetch all doctors
const getDoctors = async (req, res) => {
  try {
    const allDoctors = await Doctors.find({});
    res.status(200).json({
      success: true,
      message: "All doctors fetched successfully.",
      doctors: allDoctors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Fetch single doctor by ID
const getSingleDoctor = async (req, res) => {
  const doctorId = req.params.id;
  try {
    const singleDoctor = await Doctors.findById(doctorId);
    if (!singleDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Doctor fetched successfully.",
      doctor: singleDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Update Doctor
const updateDoctor = async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  const {
    fullName,
    email,
    phoneNumber,
    gender,
    address,
    city,
    state,
    qualification,
    servicesOffered,
  } = req.body;

  const { uploadValidId } = req.files;

  // Validate required fields
  if (
    !fullName ||
    !email ||
    !phoneNumber ||
    !gender ||
    !address ||
    !city ||
    !state ||
    !qualification ||
    !servicesOffered
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the required fields.",
    });
  }

  try {
    let updatedData = {
      fullName,
      email,
      phoneNumber,
      gender,
      address,
      city,
      state,
      qualification,
      servicesOffered,
    };

    if (uploadValidId) {
      const uploadedImage = await cloudinary.v2.uploader.upload(uploadValidId.path, {
        folder: "doctors",
        crop: "scale",
      });
      updatedData.uploadValidIdUrl = uploadedImage.secure_url;
    }

    const doctorId = req.params.id;
    const updatedDoctor = await Doctors.findByIdAndUpdate(doctorId, updatedData, { new: true });

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: uploadValidId
        ? "Doctor details updated successfully with image."
        : "Doctor details updated successfully without image.",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Delete Doctor
const deleteDoctor = async (req, res) => {
  const doctorId = req.params.id;

  try {
    const doctor = await Doctors.findByIdAndDelete(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Pagination for Doctors
const getPagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;

  try {
    const doctors = await Doctors.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const totalDoctors = await Doctors.countDocuments();

    res.status(200).json({
      success: true,
      doctors,
      totalPages: Math.ceil(totalDoctors / pageSize),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getSingleDoctor,
  updateDoctor,
  deleteDoctor,
  getPagination,
};
