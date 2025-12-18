import { IResolvers } from "@graphql-tools/utils";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { signToken } from "../auth";
import {COLLECTION_TRAINERS} from "../utils";
import { getPokemons, getPokemonById, addPokemon } from "../collections/pokemons";
import { createTrainer, validateTrainer, catchPokemonForTrainer,freeOwnedPokemon, } from "../collections/trainers";
import { TrainerUser } from "../types";


export const resolvers: IResolvers = {
  Query: {
    me: async (_, __, { trainer }) => {
      if (!trainer) throw new Error("Not authenticated");

      return {
        _id: trainer._id.toString(),
        ...trainer
      };
      
    },

    pokemons: async (_, { page, size }) => {
      return await getPokemons(page, size);
    },

    pokemon: async (_, { id }) => {
      return await getPokemonById(id);
    },
  },

  Mutation: {
    startJourney: async (_, { name, password }) => {
      const trainerId = await createTrainer(name, password);
      return signToken(trainerId);
    },

    login: async (_, { name, password }) => {
      const trainer = await validateTrainer(name, password);
      if (!trainer) throw new Error("Invalid credentials");
      return signToken(trainer._id.toString());
    },

    createPokemon: async (_, {name, description, height, weight, types}, { trainer }) => {
      if (!trainer) throw new Error("Not authenticated");

      return await addPokemon(name, description, height, weight, types);
    },

    catchPokemon: async (_, { pokemonId, nickname }, { trainer }) => {
      if (!trainer) throw new Error("Not authenticated");

      const owned = await catchPokemonForTrainer(trainer._id.toString(), pokemonId, nickname);

      return {
        _id: owned!._id.toString(),
        nickname: owned!.nickname,
        level: owned!.level,
      };
    },

    freePokemon: async (_, { ownedPokemonId }, { trainer }) => {
      if (!trainer) throw new Error("Not authenticated");

      await freeOwnedPokemon(trainer._id.toString(), ownedPokemonId);

      return {
        _id: trainer!._id.toString(),
        name: trainer!.name,
        pokemons: trainer!.pokemons || [],
      };
    },
  },

  Trainer: {
  pokemons: async (parent: TrainerUser) => {
    const db = getDB();
    const listaDeIdsDePokemons = parent.pokemons;
    if (!listaDeIdsDePokemons) return [];

    const objectIds = listaDeIdsDePokemons.map(
      (id) => new ObjectId(id)
    );

    return db
      .collection(COLLECTION_TRAINERS)
      .find({ _id: { $in: objectIds } })
      .toArray();
  },
},

};