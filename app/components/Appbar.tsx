"use client";
import { signIn, signOut, useSession } from "next-auth/react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Music } from "lucide-react";
import Link from "next/link";
// import Image from "next/image";
export function Appbar() {
  const session = useSession();
  return (
    <div className="fixed z-10 bg-red-200 w-full  ">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Music className="h-6 w-6 pr-2 md:pr-0" />
          <span className="ml-2 text-2xl font-bold hidden md:block">
            StreamTune
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Pricing
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Contact
          </Link>
          {session.data?.user ? (
            <button onClick={() => signOut()} className=" text-sm font-medium">
              SignOut
            </button>
          ) : (
            <button onClick={() => signIn()}>SignIn</button>
          )}
        </nav>
        {/* <div className=" border flex justify-between">
        <div className="f">GMUIZ</div>
        <div className=" w-28 flex justify-between mr-2">
        <button>SignUp</button>
        </div>
      </div> */}
      </header>
    </div>
  );
}
