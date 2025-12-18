import { ApolloServer } from "apollo-server";
import { connectToMongoDB } from "./db/mongo"
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { getUserFromToken } from "./auth";

const start = async () => {
  await connectToMongoDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = token ? await getUserFromToken(token as string) : null;
      return { user };
    },
  });

  await server.listen({ port: 3333 });
  console.log("GQL sirviendo y de to");
};



start().catch(err=>console.error(err));

/*
git add .
git commit -m "Descripción del cambio"
git push
*/
