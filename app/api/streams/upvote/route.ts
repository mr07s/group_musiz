import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const UpvoteSchema = z.object({
  //   userID: z.string(),
  streamId: z.string(),
});
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  //You can get rid of this database call by using seesion value find it how to use it
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email || " ",
    },
  });
  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthenticated user",
      },
      {
        status: 403,
      }
    );
  }
  try {
    const data = UpvoteSchema.parse(await req.json());
    const res = await prismaClient.upvote.create({
      data: {
        userId: user?.id,
        streamId: data?.streamId,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      {
        message: "You cant upvote twice",
        sucess: false,
      },
      { status: 403 }
    );
  }
}
