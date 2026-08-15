const express = require("express");
const app = express();
const server = require("http").createServer(app);
import dotenv from "dotenv";
import os from "os";
import localPath from "path";
import fs from "fs";

let path = "";

if (os.platform() === "win32") {
  path = "development";
} else {
  path = process.env.NODE_ENV as string;
}

dotenv.config({ path: `.env.${path}` });

import OpenRoute from "./BaseRoutes/routes.open";
import CloseRoute from "./BaseRoutes/routes.close";
import { connect, set, connection } from "mongoose";
import cors from "cors";

import closeRoutesController from "./BaseRoutes/controller";
import { handleError } from "./Api/Helper/errorHandler";
const { verifyUser, checkUser } = closeRoutesController;

class Server {
  constructor() {
    const allowedOrigins = (
      process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:8100"
    ).split(",");

    const corsOptions = {
      // origin: (origin: any, callback: any) => {
      //   if (!origin) return callback(null, true);
      //   if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      //   return callback(new Error("Not allowed by CORS"));
      // },
      origin: "*",
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    };

    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions));
    
    // Stripe webhook requires raw body for verification (disabled - not used in multi-tenant)
    // app.use(["/api/stripe/webhook", "/api/stripe/webhook/"], express.raw({ type: "application/json" }));
    
    app.use(express.json());
    app.use("/upload", express.static(localPath.join(__dirname, "upload")));

    const uploadDir = localPath.join(__dirname, "upload");
    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err && err.code !== "EEXIST") {
        console.error("Error creating upload folder:", err);
      } else {
        console.log("Upload folder ready");
      }
    });

    // Public health/test endpoints (useful in production for quick checks)
    app.get("/health", (req: any, res: any) => {
      const mongoState = (connection && (connection as any).readyState) || 0;
      const stateMap: any = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
      res.json({
        status: "ok",
        environment: process.env.NODE_ENV || "undefined",
        time: new Date().toISOString(),
        mongo: { state: mongoState, stateText: stateMap[mongoState] || "unknown" },
      });
    });

    // Also expose a quick API-level test route (no auth) for external uptime checks
    app.get("/api/test", (req: any, res: any) => {
      const mongoState = (connection && (connection as any).readyState) || 0;
      res.json({ ok: true, env: process.env.NODE_ENV || null, mongoReadyState: mongoState });
    });

    app.use("/api", checkUser, OpenRoute);
    app.use("/api", verifyUser, CloseRoute);
    app.use((err: any, req: any, res: any, next: any) => {
      handleError(err, res);
    });
  }

  getMongoDbUrl = () => {
    const { DB_CONNECT_DEV, DB_CONNECT_PROD, DB_CONNECT_QC } = process.env;
    if (process.env.NODE_ENV === "production") {
      return DB_CONNECT_PROD;
    } else if (process.env.NODE_ENV === "qc") {
      return DB_CONNECT_QC;
    } else {
      return DB_CONNECT_DEV;
    }
  };

  connectDB = async () => {
    try {
      const MONGO_URL: string = this.getMongoDbUrl() || "";
      set("strictQuery", false);
      await connect(MONGO_URL, { family: 4 });
      console.log("MongoDB connected");
    } catch (error) {
      console.log("Mongo ERROR::", error);
    }
  };

  async run() {
    await this.connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`🚀 MedStore API running on ${process.env.NODE_ENV} - Port ${PORT}`)
    );
  }
}

const instance = new Server();
instance.run();
