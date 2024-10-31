import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";

import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email || " ",
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "UnAuthenticated user",
      },
      {
        status: 403,
      }
    );
  }
  //console.log(user.id);
  const streams = await prismaClient.stream.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          upvote: true,
        },
      },
      upvote: {
        where: {
          userId: user.id,
        },
      },
    },
  });
  // //console.log(stream[0].title);
  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvote: _count.upvote,
      haveupvoted: rest.upvote.length ? true : false,
    })),
  });
}
