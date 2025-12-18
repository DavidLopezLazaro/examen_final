import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client: MongoClient;
let dB: Db;
const dbName = "back";

export const connectToMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    client = new MongoClient(mongoUrl!);
    await client.connect();
    dB = client.db(dbName);
    console.log("Estás conectado al mondongo cosa guapa!");
  } catch (err) {
    console.log("Error del mondongo baby: ", err);
  }
};

export const getDB = (): Db => dB;

export const closeMongoDB = async () => {
  try {
    if (client) await client.close();
  } catch (err) {
    console.log("Error cerrando el mondongo baby: ", err);
  }
};
