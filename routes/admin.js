const path = require("path");

const express = require("express");
const { body, check } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Please enter a valid title (at least 3 characters)."),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Please enter a valid price (greater than 0)."),
    body("description")
      .isLength({ min: 5, max: 400 })
      .trim()
      .withMessage(
        "Please enter a valid description (between 5 and 400 characters)."
      ),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Please enter a valid title (at least 3 characters)."),
    body("imageUrl").isURL().withMessage("Please enter a valid image URL."),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Please enter a valid price (greater than 0)."),
    body("description")
      .isLength({ min: 5, max: 400 })
      .trim()
      .withMessage(
        "Please enter a valid description (between 5 and 400 characters)."
      ),
], isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
