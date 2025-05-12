import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import { compare } from "bcryptjs";

async function connectDb() {
  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  return client.db("gym_db");
}

export default NextAuth({
  secret: "abc",
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize({ username, password }) {
        const db = await connectDb();

        // look in both collections
        const user = await db.collection("users").findOne({ userName: username });
        const trainer = !user && await db
          .collection("trainers")
          .findOne({ trainerName: username });

        if (!user && !trainer) {
          throw new Error("No account found");
        }

        const record = user || trainer;
        const hashedPassword = user ? record.userPassword : record.trainerPassword;
        const isValid = await compare(password, hashedPassword);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: record._id.toString(),
          name: username,
          role: user ? "member" : "trainer",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // first time JWT callback is run, `user` will be the object returned from `authorize`
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // make whatever you added to token available in the session
      session.user.id = token.id;
      session.user.role = token.role;
      // session.user.name is already set by NextAuth
      return session;
    },
  },
});
