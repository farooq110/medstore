import { connect, disconnect } from "mongoose";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import Plan from "../Api/models/plan.model";

// Determine which environment we are in
const envPath = path.resolve(__dirname, "../.env.development");
if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  config(); // fallback to default
}

const MONGODB_URI = process.env.DB_CONNECT_DEV || process.env.DB_CONNECT_PROD;

if (!MONGODB_URI) {
  console.error("❌ MongoDB connection string not found in environment variables.");
  process.exit(1);
}

const plansData = [
  {
    name: "US-Basic",
    stripePriceId: "price_1TMuECJsCRs3NUXw7wnyIxfB", // Extracted from Stripe MCP
    country: "US",
    tier: "Basic",
    price: 10,
    currency: "usd",
  },
  {
    name: "US-Pro",
    stripePriceId: "price_1TNA1PJsCRs3NUXwgsOsRQXs", // Extracted from Stripe MCP
    country: "US",
    tier: "Pro",
    price: 25,
    currency: "usd",
  },
  {
    name: "PK-Basic",
    stripePriceId: "price_1TMuFXJsCRs3NUXwdu7Ed7HT", // Extracted from Stripe MCP
    country: "PK",
    tier: "Basic",
    price: 3000,
    currency: "pkr",
  },
  {
    name: "PK-Pro",
    stripePriceId: "price_1TNA1mJsCRs3NUXwCQYGPGTt", // Extracted from Stripe MCP
    country: "PK",
    tier: "Pro",
    // Note: Stripe had this at 900000 USD, we are storing it explicitly as PKR in DB
    // Assuming backend will eventually display this in PKR. 
    price: 9000, 
    currency: "pkr", 
  },
];

async function seedPlans() {
  try {
    console.log("🌱 Starting Plans database seeding...\n");

    await connect(MONGODB_URI as string);
    console.log("✓ Connected to MongoDB\n");

    // Clear existing plans
    const deletedPlans = await Plan.deleteMany({});
    console.log(`✓ Deleted ${deletedPlans.deletedCount} existing plans`);

    // Insert new plans
    const createdPlans = await Plan.insertMany(plansData);
    console.log(`✓ Created ${createdPlans.length} plans successfully!`);
    
    console.log("\n📦 Plans Summary:");
    createdPlans.forEach(plan => {
      console.log(` - ${plan.name} (${plan.country}): ${plan.currency.toUpperCase()} ${plan.price}`);
    });

  } catch (error) {
    console.error("❌ Error seeding plans:", error);
  } finally {
    await disconnect();
    console.log("\n👋 Disconnected from MongoDB.");
    process.exit(0);
  }
}

seedPlans();
