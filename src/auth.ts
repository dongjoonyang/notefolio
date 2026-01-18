import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Vercel에 넣은 ADMIN_EMAIL과 로그인한 이메일이 같을 때만 허용
      return user.email === process.env.ADMIN_EMAIL;
    },
  },
});