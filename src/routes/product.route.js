import { getAllProducts } from "../controllers/product/product.controller.js";
import { getAllCategories } from "../controllers/product/category.controller.js";
import Router from "express";

const router = Router();

//get all categories
router.get("/categories", getAllCategories);
//get all products of a category
router.get("/products/:categoryId", getAllProducts);

export default router;
