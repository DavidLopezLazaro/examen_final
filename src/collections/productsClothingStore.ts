import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_PRODUCTS, COLLECTION_USERS } from "../utils";

export const getClothes = async (page?: number, size?: number) => {
    const db = getDB();
    page = page || 1;
    size = size || 10;
    return await db
        .collection(COLLECTION_PRODUCTS)
        .find()
        .skip((page - 1) * size)
        .limit(size)
        .toArray();
};

export const getClothingById = async (id: string) => {
    const db = getDB();
    return await db
        .collection(COLLECTION_PRODUCTS)
        .findOne({ _id: new ObjectId(id) });
};

export const addClothing = async (
    name: string,
    size: string,
    color: string,
    price: number
) => {
    const db = getDB();
    const result = await db.collection(COLLECTION_PRODUCTS).insertOne({
        name,
        size,
        color,
        price,
    });

    return getClothingById(result.insertedId.toString());
};

export const buyClothing = async (clothingId: string, userId: string) => {
    const db = getDB();
    const localUserId = new ObjectId(userId);
    const localClothingId = new ObjectId(clothingId);

    const clothingToAdd = await db
        .collection(COLLECTION_PRODUCTS)
        .findOne({ _id: localClothingId });

    if (!clothingToAdd) throw new Error("Clothing not found");

    await db.collection(COLLECTION_USERS).updateOne(
        { _id: localUserId },
        { $addToSet: { clothes: clothingId } }
    );

    return db.collection(COLLECTION_USERS).findOne({ _id: localUserId });
};

/* ===== NUEVAS FUNCIONES ===== */

export const getClothesByColor = async (color: string) => {
    const db = getDB();
    return db.collection(COLLECTION_PRODUCTS).find({ color }).toArray();
};

export const getClothesBySize = async (size: string) => {
    const db = getDB();
    return db.collection(COLLECTION_PRODUCTS).find({ size }).toArray();
};

export const updateClothing = async (
    id: string,
    updates: Partial<{
        name: string;
        size: string;
        color: string;
        price: number;
    }>
) => {
    const db = getDB();
    await db.collection(COLLECTION_PRODUCTS).updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
    );
    return getClothingById(id);
};

export const deleteClothing = async (id: string) => {
    const db = getDB();
    const result = await db.collection(COLLECTION_PRODUCTS).deleteOne({
        _id: new ObjectId(id),
    });
    return result.deletedCount === 1;
};
