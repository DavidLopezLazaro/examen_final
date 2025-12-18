import { gql } from "apollo-server";

export const typeDefs = gql`

    type User {
        _id: ID!
        email: String!
        clothes: [Clothing]!
        clothesCount: Int!
    }

    type Clothing {
        _id: ID!
        name: String!
        size: String!
        color: String!
        price: Float!
        buyers: [User]!
    }

    type Query {
        me: User
        clothes(page: Int, size: Int): [Clothing]!
        clothing(id: ID!): Clothing

        clothesByColor(color: String!): [Clothing]!
        clothesBySize(size: String!): [Clothing]!
        clothesCount: Int!
        myClothes: [Clothing]!
        clothingExists(id: ID!): Boolean!
        userById(id: ID!): User
    }

    type Mutation {
        addClothing(name: String!, size: String!, color: String!, price: Float!): Clothing!
        buyClothing(clothingId: ID!): User!
        register(email: String!, password: String!): String!
        login(email: String!, password: String!): String!

        updateClothing(
            id: ID!
            name: String
            size: String
            color: String
            price: Float
        ): Clothing

        deleteClothing(id: ID!): Boolean!
        removeClothingFromUser(clothingId: ID!): User!
        changePassword(oldPassword: String!, newPassword: String!): Boolean!
        deleteUser: Boolean!
    }
`;
