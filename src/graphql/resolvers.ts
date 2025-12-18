import { IResolvers } from "@graphql-tools/utils";
import {
    addClothing,
    buyClothing,
    getClothes,
    getClothingById,
    getClothesByColor,
    getClothesBySize,
    updateClothing,
    deleteClothing,
} from "../collections/productsClothingStore";
import {
    createUser,
    validateUser,
    findUserById,
} from "../collections/usersClothingStore";
import { signToken } from "../auth";
import { ClothingUser } from "../types";
import { getDB } from "../db/mongo";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export const resolvers: IResolvers = {
    Query: {
        clothes: async (_, { page, size }) => getClothes(page, size),

        clothing: async (_, { id }) => getClothingById(id),

        me: async (_, __, { user }) => {
            if (!user) return null;
            return { _id: user._id.toString(), ...user };
        },

        clothesByColor: async (_, { color }) => getClothesByColor(color),

        clothesBySize: async (_, { size }) => getClothesBySize(size),

        clothesCount: async () => {
            const db = getDB();
            return db.collection("productsClothingStore").countDocuments();
        },

        myClothes: async (_, __, { user }) => {
            if (!user) throw new Error("Not authenticated");
            return user.clothes || [];
        },

        clothingExists: async (_, { id }) => {
            const db = getDB();
            const clothing = await db
                .collection("productsClothingStore")
                .findOne({ _id: new ObjectId(id) });
            return !!clothing;
        },

        userById: async (_, { id }) => findUserById(id),
    },

    Mutation: {
        addClothing: async (_, { name, size, color, price }) =>
            addClothing(name, size, color, price),

        buyClothing: async (_, { clothingId }, { user }) => {
            if (!user) throw new Error("You must be logged in");
            return buyClothing(clothingId, user._id.toString());
        },

        register: async (_, { email, password }) =>
            signToken(await createUser(email, password)),

        login: async (_, { email, password }) => {
            const user = await validateUser(email, password);
            if (!user) throw new Error("Invalid credentials");
            return signToken(user._id.toString());
        },

        updateClothing: async (_, args) => {
            const { id, ...updates } = args;
            return updateClothing(id, updates);
        },

        deleteClothing: async (_, { id }) => deleteClothing(id),

        removeClothingFromUser: async (_, { clothingId }, { user }) => {
            if (!user) throw new Error("Not authenticated");
            const db = getDB();

            await db.collection("usersClothingStore").updateOne(
                { _id: user._id },
                { $pull: { clothes: clothingId } }
            );

            return db.collection("usersClothingStore").findOne({ _id: user._id });
        },

        changePassword: async (_, { oldPassword, newPassword }, { user }) => {
            if (!user) throw new Error("Not authenticated");

            const ok = await bcrypt.compare(oldPassword, user.password);
            if (!ok) throw new Error("Old password incorrect");

            const hashed = await bcrypt.hash(newPassword, 10);
            const db = getDB();

            await db.collection("usersClothingStore").updateOne(
                { _id: user._id },
                { $set: { password: hashed } }
            );

            return true;
        },

        deleteUser: async (_, __, { user }) => {
            if (!user) throw new Error("Not authenticated");
            const db = getDB();
            await db.collection("usersClothingStore").deleteOne({
                _id: user._id,
            });
            return true;
        },
    },

    /* ===== ENCADENADOS TIPO EXAMEN ===== */

    User: {
        clothes: async (parent: ClothingUser) => {
            const db = getDB();
            if (!parent.clothes) return [];

            const objectIds = parent.clothes.map((id) => new ObjectId(id));

            return db
                .collection("productsClothingStore")
                .find({ _id: { $in: objectIds } })
                .toArray();
        },

        clothesCount: async (parent: ClothingUser) => {
            if (!parent.clothes) return 0;
            return parent.clothes.length;
        },
    },

    Clothing: {
        buyers: async (parent) => {
            const db = getDB();
            const clothingId = parent._id.toString();

            return db
                .collection("usersClothingStore")
                .find({ clothes: clothingId })
                .toArray();
        },
    },
};
