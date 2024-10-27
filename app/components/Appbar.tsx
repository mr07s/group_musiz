"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export function Appbar() {
  const session = useSession();
  return (
    <div>
      <div className=" border flex justify-between">
        <div className="f">GMUIZ</div>
        <div className=" w-28 flex justify-between mr-2">
          {session.data?.user ? (
            <button onClick={() => signOut()}>SignOut</button>
          ) : (
            <button onClick={() => signIn()}>SignIn</button>
          )}

          <button>SignUp</button>
        </div>
      </div>
    </div>
  );
}
