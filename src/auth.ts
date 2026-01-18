import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  // 💡 세션 전략을 jwt로 명시해줍니다.
  session: { strategy: "jwt" }, 
  callbacks: {
    async signIn({ user }) {
      return user.email === process.env.ADMIN_EMAIL;
    },
    // 💡 미들웨어에서 세션을 더 잘 인식하게 돕습니다.
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.email = token.email as string;
      return session;
    }
  },
  trustHost: true,
});