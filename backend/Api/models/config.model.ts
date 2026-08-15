import { Schema, model } from "mongoose";

interface IConfig {
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

const configSchema = new Schema<IConfig>(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const Config = model<IConfig>("Config", configSchema);

export default Config;
