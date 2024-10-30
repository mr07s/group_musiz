// "use client";
import Dashboard from "@/app/components/Dashboard";
// import Redirect from "@/app/components/Redirect";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
// import { useEffect } from "react";

export default function ({
  params: { creatorId },
}: {
  params: {
    creatorId: string;
  };
}) {
  console.log(creatorId);
  // const session = useSession();
  // const router = useRouter();
  // useEffect(() => {
  //   if (session?.data?.user) {
  //     router.push(`/creator/${creatorId}`);
  //   } else {
  //     router.push("/api/auth/signin");
  //   }
  // });
  return (
    <div>
      {/* <Redirect /> */}
      <Dashboard creatorId={creatorId} playVideo={false} />
    </div>
  );
}
