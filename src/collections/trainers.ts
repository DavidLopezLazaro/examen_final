import { getDB } from "../db/mongo";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { COLLECTION_TRAINERS, COLLECTION_POKEMONS} from "../utils";


export const createTrainer = async (name: string, password: string) => {
  const db = getDB();

  const exists = await db.collection(COLLECTION_TRAINERS).findOne({ name });
  if (exists) throw new Error("Trainer already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.collection(COLLECTION_TRAINERS).insertOne({
    name,
    password: hashedPassword,
    pokemons: [],
  });

  return result.insertedId.toString();
};

export const validateTrainer = async (name: string, password: string) => {
  const db = getDB();

  const trainer = await db.collection(COLLECTION_TRAINERS).findOne({ name });
  if (!trainer) return null;

  const ok = await bcrypt.compare(password, trainer.password);
  if (!ok) return null;

  return trainer;
};

export const findTrainerById = async (id: string) => {
  const db = getDB();
  return await db.collection(COLLECTION_TRAINERS).findOne({
    _id: new ObjectId(id),
  });
};

export const catchPokemonForTrainer = async ( trainerId: string, pokemonId: string, nickname?: string) => {
  const db = getDB();
  const pokemon = await db.collection(COLLECTION_POKEMONS).findOne({ _id: new ObjectId(pokemonId) });
  if (!pokemon) throw new Error("Pokemon not found");

  const result = await db.collection(COLLECTION_TRAINERS).insertOne({
    trainerId,
    pokemonId,
    nickname: nickname || pokemon.name,
    level: 1,
  });

  const ownedId = result.insertedId.toString();

  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $addToSet: { pokemons: ownedId } }
  );

  return await db.collection(COLLECTION_TRAINERS).findOne({
    _id: new ObjectId(ownedId),
  });
};

export const freeOwnedPokemon = async (trainerId: string, ownedPokemonId: string) => {
  const db = getDB();

  await db.collection(COLLECTION_TRAINERS).deleteOne({
    _id: new ObjectId(ownedPokemonId),
  });

  await db.collection(COLLECTION_TRAINERS).updateOne(
    { _id: new ObjectId(trainerId) },
    { $pull: { pokemons: ownedPokemonId } as any}
  );

  return await db.collection(COLLECTION_TRAINERS).findOne({
    _id: new ObjectId(trainerId),
  });
};