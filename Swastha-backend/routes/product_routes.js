const express = require("express");
const router = express.Router();
const { authGuardAdmin, authGuard } = require("../middleware/authGuard"); // make sure this path is correct
const productController = require("../controllers/product_controller");
router.get("/test",productController.test)
router.post("/create", authGuardAdmin, productController.createProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getSingleProduct);
router.put("/:id", authGuardAdmin, productController.updateProduct);
router.delete("/:id", authGuardAdmin, productController.deleteProduct); 
module.exports = router;
