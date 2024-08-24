const cloudinary = require("cloudinary").v2;
const Product = require("../model/product_model");

const test = async (req, res) => {
  return res.status(200).json("Hello from server");
}
// Create Product
const createProduct = async (req, res) => {
  const { name, description, price } = req.body;
  const { image } = req.files;

  if (!name || !description || !price || !image) {
    return res.json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  try {
    const uploadedImage = await cloudinary.uploader.upload(image.path, {
      folder: "products",
      crop: "scale",
    });

    const newProduct = new Product({
      name,
      description,
      image: uploadedImage.secure_url,
      price,
    });

    await newProduct.save();

    res.json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({});
    res.json({
      success: true,
      message: "All products fetched successfully!",
      products: allProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Single Product
const getSingleProduct = async (req, res) => {
  const productId = req.params.id;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  try {
    const singleProduct = await Product.findById(productId);
    if (!singleProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product fetched successfully",
      product: singleProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  const productId = req.params.id;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  const { name, description, price } = req.body;
  const { image } = req.files;

  if (!name || !description || !price) {
    return res.json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  try {
    let updatedData = {
      name,
      description,
      price,
    };

    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image.path, {
        folder: "products",
        crop: "scale",
      });
      updatedData.image = uploadedImage.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  test,
};
