import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Category, Product } from "./src/models/index.js";
import { categories, products } from "./seedData.js";

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Category.deleteMany({});
    await Product.deleteMany({});

    const categoryDocs = await Category.insertMany(categories);
    const categoryMap = categoryDocs.reduce((map, category) => {
      map[category.name] = category._id;
      return map;
    }, {});

    const productWithCategoryIds = products.map((product) => ({
      ...product,
      category: categoryMap[product.category],
    }));
    await Product.insertMany(productWithCategoryIds);
    console.log("Database seeded");
    process.exit();
  } catch (error) {
    console.log("Error in Seeding Data", error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
