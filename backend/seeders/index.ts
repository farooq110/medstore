import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import User from "../Api/models/user.model";
import Business from "../Api/models/business.model";
import Client from "../Api/models/client.model";
import Category from "../Api/models/category.model";
import Item from "../Api/models/item.model";
import Order from "../Api/models/order.model";
import Alert from "../Api/models/alert.model";
import { generateOrderNumber } from "../Api/Helper/utils";
import { connect, disconnect } from "mongoose";
import { config } from "dotenv";

// config({ path: ".env.development" });
// const MONGODB_URI = process.env.DB_CONNECT_DEV;
config({ path: ".env.production" });
const MONGODB_URI = process.env.DB_CONNECT_PROD;

// ============ USER & BUSINESS SEEDER (MULTI-OWNER) ============
async function seedOwnersAndBusinesses() {
  console.log("Seeding Owners and Businesses...\n");

  const ownersData = [
    {
      name: "Store Owner",
      email: "owner@medstore.com",
      phone: "03001234567",
      business: {
        name: "MedStore Pharmacy",
        country: "Pakistan",
        phone: "03001234567",
        address: "123 Main Street, Karachi",
      },
    },
    {
      name: "Ali Ahmed",
      email: "owner2@medstore.com",
      phone: "03009876543",
      business: {
        name: "Health Plus Pharmacy",
        country: "Pakistan",
        phone: "03009876543",
        address: "456 Defense Road, Lahore",
      },
    },
  ];

  const owners = [];
  const businesses = [];

  for (const ownerData of ownersData) {
    // Create owner user
    const owner = new User({
      name: ownerData.name,
      email: ownerData.email,
      password: await bcrypt.hash("password", 10),
      phone: ownerData.phone,
      role: "owner",
      isActive: true,
    });

    await owner.save();
    owners.push(owner);

    // Create business for owner
    const business = new Business({
      name: ownerData.business.name,
      owner: owner._id,
      country: ownerData.business.country,
      phone: ownerData.business.phone,
      address: ownerData.business.address,
      isActive: true,
    });

    await business.save();
    businesses.push(business);

    console.log(`✓ Created owner: ${owner.email} → Business: ${business.name}`);
  }

  console.log();
  return { owners, businesses };
}

// ============ SALES PERSONS SEEDER ============
async function seedSalesPersons(business: any, businessIndex: number = 0) {
  console.log("Seeding Sales Persons...");

  const salesPersons = [];
  const emailSuffix = businessIndex * 2;

  for (let i = 1; i <= 2; i++) {
    const salesPersonNum = emailSuffix + i;
    const salesPerson = new User({
      name: `Sales Person ${salesPersonNum}`,
      email: `sales${salesPersonNum}@medstore.com`,
      password: await bcrypt.hash("password", 10),
      phone: `03009${String(salesPersonNum).padStart(6, "0")}`,
      role: "sales_person",
      business: business._id,
      isActive: true,
    });
    await salesPerson.save();
    salesPersons.push(salesPerson);
  }

  console.log(`✓ Created ${salesPersons.length} sales persons`);
  return salesPersons;
}

// ============ CLIENT SEEDER ============
async function seedClients(business: any, salesPersons: any[]) {
  console.log("Seeding Clients...");

  const clients = [];

  const clientData = [
    { name: "City Hospital", shopName: "City Hospital", due: 0 },
    { name: "Metro Clinic", shopName: "Metro Clinic", due: 5000 },
    { name: "Central Pharmacy", shopName: "Central Pharmacy", due: 2500 },
    { name: "Health Plus Center", shopName: "Health Plus Center", due: 0 },
    { name: "Prime Medical Store", shopName: "Prime Medical", due: 3500 },
    { name: "Well Care Pharmacy", shopName: "Well Care", due: 1500 },
    { name: "Quick Med Shop", shopName: "Quick Med", due: 4000 },
    { name: "Family Health Center", shopName: "Family Health", due: 0 },
  ];

  // Create clients and assign to sales persons - 4 clients per sales person
  const clientsPerSalesPerson = Math.ceil(clientData.length / salesPersons.length);
  console.log(`  • Assigning ${clientsPerSalesPerson} clients to each of ${salesPersons.length} sales persons`);

  for (let i = 0; i < clientData.length; i++) {
    // Distribute clients evenly: first half to sales person 1, second half to sales person 2, etc.
    const salesPersonIndex = Math.floor(i / clientsPerSalesPerson) % salesPersons.length;
    const assignedSalesPerson = salesPersons[salesPersonIndex];
    
    const client = new Client({
      name: clientData[i].name,
      phone: faker.phone.number("0300#######"),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      shopName: clientData[i].shopName,
      totalDue: clientData[i].due,
      creditLimit: faker.number.int({ min: 30000, max: 100000 }),
      salesPerson: assignedSalesPerson._id,
      business: business._id,
      isActive: true,
    });
    await client.save();
    clients.push(client);
    console.log(`  → ${client.name} → Assigned to ${assignedSalesPerson.name}`);
  }

  console.log(`✓ Created ${clients.length} clients with assigned sales persons`);
  return clients;
}

// ============ CATEGORY SEEDER ============
async function seedCategories(business: any) {
  console.log("Seeding Categories...");

  const categories = [];

  const categoryData = [
    { name: "Medicine", description: "Pharmaceutical medicines and drugs" },
    { name: "Surgical", description: "Surgical instruments and equipment" },
    { name: "Personal Care", description: "Personal hygiene and care products" },
    { name: "General", description: "General pharmacy items" },
  ];

  for (const cat of categoryData) {
    const category = new Category({
      name: cat.name,
      description: cat.description,
      business: business._id,
      isActive: true,
    });
    await category.save();
    categories.push(category);
  }

  console.log(`✓ Created ${categories.length} categories`);
  return categories;
}

// ============ ITEMS SEEDER ============
async function seedItems(business: any, categories: any[]) {
  console.log("Seeding Items...");

  const items = [];

  const medicines = [
    { name: "Paracetamol 500mg", price: 15, stock: 50 },
    { name: "Amoxicillin 250mg", price: 25, stock: 3 },
    { name: "Ibuprofen 400mg", price: 20, stock: 0 },
    { name: "Aspirin 75mg", price: 10, stock: 120 },
  ];

  const surgicals = [
    { name: "Surgical Masks (Box of 50)", price: 150, stock: 75 },
    { name: "Latex Gloves (Box of 100)", price: 350, stock: 40 },
    { name: "Surgical Tape", price: 45, stock: 15 },
    { name: "Gauze Pads", price: 20, stock: 55 },
  ];

  const personalCare = [
    { name: "Hand Sanitizer 500ml", price: 250, stock: 60 },
    { name: "Body Wash", price: 300, stock: 20 },
    { name: "Toothpaste", price: 150, stock: 5 },
  ];

  const general = [
    { name: "Thermometer", price: 450, stock: 12 },
    { name: "First Aid Kit", price: 850, stock: 6 },
    { name: "Ice Pack", price: 200, stock: 15 },
  ];

  const allItemsInfo = [
    { list: medicines, catIndex: 0 },
    { list: surgicals, catIndex: 1 },
    { list: personalCare, catIndex: 2 },
    { list: general, catIndex: 3 },
  ];

  for (const group of allItemsInfo) {
    const categoryId = categories[group.catIndex]._id;
    for (const itemData of group.list) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + Math.random() * 12);

      const item = new Item({
        name: itemData.name,
        category: categoryId,
        sku: `SKU-${String(Math.floor(Math.random() * 10000)).padStart(5, "0")}`,
        stockQuantity: itemData.stock,
        lowStockThreshold: 10,
        sellingPrice: itemData.price,
        costPrice: itemData.price * 0.6,
        expiryDate,
        isExpired: false,
        description: `${itemData.name} - High quality product`,
        business: business._id,
      });
      await item.save();
      items.push(item);
    }
  }

  console.log(`✓ Created ${items.length} items`);
  return items;
}

// ============ ORDER SEEDER ============
async function seedOrders(business: any, owner: any, salesPersons: any[], clients: any[], items: any[]) {
  console.log("Seeding Orders with comprehensive test scenarios...");

  const orders = [];

  const createOrderItems = (itemList: any[], count = 3) => {
    const orderItems = [];
    let subtotal = 0;

    for (let j = 0; j < count; j++) {
      const item = itemList[Math.floor(Math.random() * itemList.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const itemSubtotal = quantity * item.sellingPrice;

      orderItems.push({
        itemId: item._id,
        itemName: item.name,
        quantity,
        sellingPrice: item.sellingPrice,
        subtotal: itemSubtotal,
        expiryDate: item.expiryDate,
        /* BACKORDER FEATURE DISABLED - isBackorder field */
        isBackorder: false, // Always false now that backorder is disabled
      });

      subtotal += itemSubtotal;
    }

    return { orderItems, subtotal };
  };

  // SCENARIO 1: Owner creates orders (status: 'created')
  console.log("  → Creating unassigned orders (status: 'created')...");
  for (let i = 0; i < 3; i++) {
    const client = clients[i];
    const { orderItems, subtotal } = createOrderItems(items);
    const totalAmount = subtotal;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "delivery",
      client: client._id,
      createdBy: owner._id,
      business: business._id,
      items: orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: "pending",
      orderStatus: "created",
      notes: "Pending assignment from owner",
    });
    await order.save();
    orders.push(order);
  }

  // SCENARIO 2: Owner assigns orders to sales persons for DELIVERY
  console.log("  → Creating assigned orders for DELIVERY (status: 'assigned')...");
  for (let i = 0; i < 2; i++) {
    const client = clients[3 + i];
    const salesPerson = salesPersons[i];
    const { orderItems, subtotal } = createOrderItems(items);
    const totalAmount = subtotal;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "delivery",
      client: client._id,
      createdBy: owner._id,
      business: business._id,
      assignedTo: salesPerson._id,
      assignedFor: "delivery",
      assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: "pending",
      orderStatus: "assigned",
      notes: "Assigned for delivery to sales person",
    });
    await order.save();
    orders.push(order);
  }

  // SCENARIO 3: Owner assigns orders to sales persons for PAYMENT COLLECTION
  console.log("  → Creating assigned orders for PAYMENT COLLECTION (status: 'assigned')...");
  for (let i = 0; i < 2; i++) {
    const client = clients[5 + i];
    const salesPerson = salesPersons[i];
    const { orderItems, subtotal } = createOrderItems(items);
    const totalAmount = subtotal;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "delivery",
      client: client._id,
      createdBy: owner._id,
      business: business._id,
      assignedTo: salesPerson._id,
      assignedFor: "payment_collection",
      assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: "pending",
      orderStatus: "assigned",
      notes: "Assigned for payment collection",
    });
    await order.save();
    orders.push(order);
  }

  // SCENARIO 4: Delivered but unpaid orders
  console.log("  → Creating delivered orders (isDelivered: true, awaiting payment)...");
  for (let i = 0; i < 2; i++) {
    const client = clients[i % clients.length];
    const salesPerson = salesPersons[i % salesPersons.length];
    const { orderItems, subtotal } = createOrderItems(items);
    const totalAmount = subtotal;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "delivery",
      client: client._id,
      createdBy: owner._id,
      business: business._id,
      assignedTo: salesPerson._id,
      assignedFor: "delivery",
      assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isDelivered: true,
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: "pending",
      orderStatus: "assigned",
      notes: "Delivered, awaiting payment collection",
    });
    await order.save();
    orders.push(order);
  }

  // SCENARIO 5: Fully paid orders (completed)
  console.log("  → Creating fully paid orders (status: 'completed')...");
  for (let i = 0; i < 2; i++) {
    const client = clients[(2 + i) % clients.length];
    const salesPerson = salesPersons[i % salesPersons.length];
    const { orderItems, subtotal } = createOrderItems(items);
    const totalAmount = subtotal;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "delivery",
      client: client._id,
      createdBy: owner._id,
      business: business._id,
      assignedTo: salesPerson._id,
      assignedFor: "delivery",
      assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      isDelivered: true,
      deliveredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      dueCollected: true,
      dueCollectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount: totalAmount,
      dueAmount: 0,
      paymentStatus: "fully_paid",
      orderStatus: "completed",
      payments: [
        {
          amount: totalAmount,
          method: "cash",
          recordedBy: salesPerson._id,
          recordedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          notes: "Full payment collected",
        },
      ],
    });
    await order.save();
    orders.push(order);
  }

  // SCENARIO 6: Partial payment orders
  console.log("  → Creating partial payment orders (paymentStatus: 'partial')...");
  for (let i = 0; i < 2; i++) {
    const client = clients[(4 + i) % clients.length];
    const salesPerson = salesPersons[i % salesPersons.length];
    const { orderItems, subtotal } = createOrderItems(items);
    const totalAmount = subtotal;
    const paidAmount = Math.floor(totalAmount * 0.6);

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "delivery",
      client: client._id,
      createdBy: owner._id,
      business: business._id,
      assignedTo: salesPerson._id,
      assignedFor: "payment_collection",
      assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isDelivered: true,
      deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      items: orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount,
      dueAmount: totalAmount - paidAmount,
      paymentStatus: "partial",
      orderStatus: "assigned",
      payments: [
        {
          amount: paidAmount,
          method: "card",
          recordedBy: salesPerson._id,
          recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          notes: "Partial payment received",
        },
      ],
      notes: "Partial payment collected, due amount pending",
    });
    await order.save();
    orders.push(order);
  }

  // SCENARIO 7: Borrow orders
  console.log("  → Creating borrow orders (paymentStatus: 'borrow')...");
  for (let i = 0; i < 2; i++) {
    const client = clients[(6 + i) % clients.length];
    const salesPerson = salesPersons[i % salesPersons.length];
    const { orderItems, subtotal } = createOrderItems(items);
    const totalAmount = subtotal;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "delivery",
      client: client._id,
      createdBy: owner._id,
      business: business._id,
      assignedTo: salesPerson._id,
      assignedFor: "payment_collection",
      assignedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      isDelivered: true,
      deliveredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      items: orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: "borrow",
      orderStatus: "assigned",
      notes: "Credit given - full due amount pending",
    });
    await order.save();
    orders.push(order);
  }

  // SCENARIO 8: POS orders
  console.log("  → Creating POS orders (status: 'completed', instant billing)...");
  for (let i = 0; i < 2; i++) {
    const { orderItems, subtotal } = createOrderItems(items, 2);
    const totalAmount = subtotal;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "pos",
      client: clients[0]._id,
      createdBy: salesPersons[0]._id,
      business: business._id,
      items: orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount: totalAmount,
      dueAmount: 0,
      paymentStatus: "fully_paid",
      orderStatus: "completed",
      payments: [
        {
          amount: totalAmount,
          method: "cash",
          recordedBy: salesPersons[0]._id,
          recordedAt: new Date(),
          notes: "POS payment",
        },
      ],
      notes: "POS in-store sale - immediate completion",
    });
    await order.save();
    orders.push(order);
  }

  /* BACKORDER FEATURE DISABLED - SCENARIO 9: Backorder orders
  console.log("  → Creating backorder orders (with out-of-stock items)...");
  for (let i = 0; i < 2; i++) {
    const client = clients[(1 + i) % clients.length];

    const outOfStockItems = items.filter((it: any) => it.stockQuantity === 0);
    const backorderItems = [];
    let subtotal = 0;

    for (let j = 0; j < 2 && j < outOfStockItems.length; j++) {
      const item = outOfStockItems[j];
      const quantity = Math.floor(Math.random() * 5) + 2;
      const itemSubtotal = quantity * item.sellingPrice;

      backorderItems.push({
        itemId: item._id,
        itemName: item.name,
        quantity,
        sellingPrice: item.sellingPrice,
        subtotal: itemSubtotal,
        expiryDate: item.expiryDate,
        isBackorder: true,
      });

      subtotal += itemSubtotal;
    }

    const totalAmount = subtotal;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      orderType: "delivery",
      client: client._id,
      createdBy: owner._id,
      business: business._id,
      items: backorderItems.length > 0 ? backorderItems : createOrderItems(items).orderItems,
      subtotal,
      discount: 0,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: "pending",
      orderStatus: "backorder",
      notes: "Awaiting stock for backorder items",
    });
    await order.save();
    orders.push(order);
  }
  */

  console.log(`✓ Created ${orders.length} orders with comprehensive test scenarios`);
  return orders;
}

// ============ ALERT SEEDER ============
async function seedAlerts(business: any, items: any[], orders: any[]) {
  console.log("Seeding Alerts (all types)...");

  const alerts = [];

  const lowStockItems = items.filter((i) => i.stockQuantity > 0 && i.stockQuantity <= i.lowStockThreshold);
  for (const item of lowStockItems) {
    const alert = new Alert({
      type: "low_stock",
      itemId: item._id,
      business: business._id,
      message: `${item.name}: Stock is low (${item.stockQuantity} units remaining)`,
      severity: "warning",
      seenByOwner: false,
      seenBySalesPerson: false,
      resolved: false,
    });
    await alert.save();
    alerts.push(alert);
  }

  const outOfStockItems = items.filter((i) => i.stockQuantity === 0);
  for (const item of outOfStockItems.slice(0, 3)) {
    const alert = new Alert({
      type: "out_of_stock",
      itemId: item._id,
      business: business._id,
      message: `${item.name}: Out of stock - requires immediate reorder`,
      severity: "urgent",
      seenByOwner: false,
      seenBySalesPerson: false,
      resolved: false,
    });
    await alert.save();
    alerts.push(alert);
  }

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const expiringItems = items.filter((i) => i.expiryDate <= thirtyDaysFromNow && i.expiryDate > new Date());

  for (const item of expiringItems.slice(0, 3)) {
    const alert = new Alert({
      type: "expiring_soon",
      itemId: item._id,
      business: business._id,
      message: `${item.name}: Expiring on ${item.expiryDate.toDateString()} - push sales`,
      severity: "warning",
      seenByOwner: false,
      seenBySalesPerson: false,
      resolved: false,
    });
    await alert.save();
    alerts.push(alert);
  }

  const expiredItems = items.filter((i) => i.expiryDate < new Date());
  for (const item of expiredItems.slice(0, 2)) {
    const alert = new Alert({
      type: "expired",
      itemId: item._id,
      business: business._id,
      message: `${item.name}: Expired on ${item.expiryDate.toDateString()} - remove from stock`,
      severity: "urgent",
      seenByOwner: false,
      seenBySalesPerson: false,
      resolved: false,
    });
    await alert.save();
    alerts.push(alert);
  }

  /* BACKORDER FEATURE DISABLED - Backorder alerts
  const backorderOrders = orders.filter((o) => o.orderStatus === "backorder");
  for (const order of backorderOrders.slice(0, 2)) {
    const alert = new Alert({
      type: "backorder_pending",
      orderId: order._id,
      business: business._id,
      message: `Order ${order.orderNumber}: Awaiting stock arrival - ${order.items.length} items on backorder`,
      severity: "warning",
      seenByOwner: false,
      seenBySalesPerson: false,
      resolved: false,
    });
    await alert.save();
    alerts.push(alert);
  }
  */

  if (alerts.length > 0) {
    console.log(`✓ Created ${alerts.length} alerts (low stock, out of stock, expiring, expired)`);
  } else {
    console.log(`✓ No alerts needed at this time`);
  }
}

// ============ MAIN SEED FUNCTION ============
async function runSeeders() {
  try {
    console.log("🌱 Starting database seeding...\n");

    await connect(MONGODB_URI!);
    console.log("✓ Connected to MongoDB\n");

    console.log("STEP 1: Clearing all existing data from database...");
    await User.deleteMany({});
    await Business.deleteMany({});
    await Client.deleteMany({});
    await Category.deleteMany({});
    await Item.deleteMany({});
    await Order.deleteMany({});
    await Alert.deleteMany({});
    console.log("✅ Database completely cleared!\n");

    console.log("STEP 2: Creating fresh test data for multiple owners...\n");

    // Seed all owners and businesses
    const { owners, businesses } = await seedOwnersAndBusinesses();

    console.log("STEP 3: Creating test data for each business...\n");
    
    // For each business, create sales persons, clients, and orders
    for (let idx = 0; idx < businesses.length; idx++) {
      const owner = owners[idx];
      const business = businesses[idx];
      
      console.log(`\n━━━━ Setting up Business ${idx + 1}: ${business.name} ━━━━`);
      
      const salesPersons = await seedSalesPersons(business, idx);
      const clients = await seedClients(business, salesPersons);
      const categories = await seedCategories(business);
      const items = await seedItems(business, categories);
      const orders = await seedOrders(business, owner, salesPersons, clients, items);
      await seedAlerts(business, items, orders);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    
    console.log("\n👥 CLIENT-SALES PERSON ASSIGNMENTS (BY BUSINESS):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    for (const business of businesses) {
      console.log(`\n📍 ${business.name}:`);
      const allClients = await Client.find({ business: business._id }).populate('salesPerson', 'name email');
      
      // Group clients by sales person
      const groupedBySalesPerson = new Map();
      for (const client of allClients) {
        const spName = (client.salesPerson as any)?.name || 'Unassigned';
        if (!groupedBySalesPerson.has(spName)) {
          groupedBySalesPerson.set(spName, []);
        }
        groupedBySalesPerson.get(spName).push(client);
      }
      
      for (const [spName, clientList] of groupedBySalesPerson.entries()) {
        console.log(`\n  ${spName}:`);
        clientList.forEach((client: any) => {
          console.log(`    ✓ ${client.name} (${client.phone})`);
        });
      }
    }
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n📊 Summary:");
    console.log("  • All old database records deleted");
    console.log("  • Fresh test data created with realistic scenarios");
    console.log("  • 2 Owners created (with separate businesses)");
    console.log("  • 2 Businesses created (isolated multi-tenant setup)");
    console.log("  • 4 Sales persons created (2 per business, linked to business)");
    console.log("  • 16 Clients created (8 per business with assigned sales persons via salesPerson field)");
    console.log("  • 8 Categories created (4 per business, all linked)");
    console.log("  • 28 Items created (14 per business with stock, expiry, and pricing)");
    console.log("  • 42 Orders created (21 per business, covering all workflows)");
    console.log("  • 20+ Alerts auto-generated (10+ per business, all linked)");

    console.log("\n📋 Test Credentials (Owner 1 - MedStore):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Owner:       owner@medstore.com / password");
    console.log("Sales Pers:  sales1@medstore.com / password");
    console.log("Sales Pers:  sales2@medstore.com / password");
    
    console.log("\n📋 Test Credentials (Owner 2 - Health Plus):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Owner:       owner2@medstore.com / password");
    console.log("Sales Pers:  sales3@medstore.com / password");
    console.log("Sales Pers:  sales4@medstore.com / password");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n✅ Test Workflows Covered:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("OWNER WORKFLOWS:");
    console.log("  ✓ Create orders for any client");
    console.log("  ✓ Assign orders to sales persons (delivery task)");
    console.log("  ✓ Assign orders to sales persons (payment collection task)");
    console.log("  ✓ View all orders and monitor order statuses");
    console.log("  ✓ Monitor alerts (stock and expiry issues)");
    console.log("\nSALES PERSON WORKFLOWS:");
    console.log("  ✓ View assigned clients only");
    console.log("  ✓ Create orders for assigned clients");
    console.log("  ✓ Create POS orders (instant billing)");
    console.log("  ✓ Mark orders as delivered");
    console.log("  ✓ Record full payment (completes order)");
    console.log("  ✓ Record partial payment (due amount remains)");
    console.log("  ✓ Record borrow/credit payment (zero amount paid)");
    console.log("  ✓ Collect due from delivered orders");
    console.log("\nORDER STATUS FLOW:");
    console.log("  ✓ 'created' → Owner creates order");
    console.log("  ✓ 'assigned' → Owner assigns to sales person");
    console.log("  ✓ 'completed' → Full payment collected or due cleared");
    /* BACKORDER FEATURE DISABLED
    console.log("  ✓ 'backorder' → Items out of stock");
    */
    console.log("\nALERT SYSTEM:");
    console.log("  ✓ Low stock alerts (≤10 units) - warning severity");
    console.log("  ✓ Out of stock alerts (0 units) - urgent severity");
    console.log("  ✓ Expiring soon alerts (≤30 days) - warning severity");
    console.log("  ✓ Expired alerts (<today) - urgent severity");
    /* BACKORDER FEATURE DISABLED
    console.log("  ✓ Backorder pending alerts - warning severity");
    */
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await disconnect();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

runSeeders();
