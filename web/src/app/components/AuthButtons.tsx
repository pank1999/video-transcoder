"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-full"></div>;
  }

  if (session?.user) {
    return (
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {session.user.image ? (
            <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <User size={16} />
            </div>
          )}
          <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
        </div>
        <button 
          onClick={() => signOut()}
          className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
        >
          <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block">
        Log in
      </Link>
      <Link href="/register" className="text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors px-5 py-2.5 rounded-full shadow-sm">
        Sign Up Free
      </Link>
    </div>
  );
}
