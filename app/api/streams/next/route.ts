import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { promise } from "zod";

export async function GET() {
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthenticated User",
      },
      {
        status: 403,
      }
    );
  }
  const mostupvotedStream = await prismaClient.stream.findFirst({
    where: {
      userId: user.id,
      played: false,
    },
    orderBy: {
      upvote: {
        _count: "desc",
      },
    },
  });
  console.log("mostupvotedStream");
  console.log(mostupvotedStream);

  await Promise.all([
    prismaClient.currentStream.upsert({
      where: {
        userId: user?.id,
      },
      update: {
        streamId: mostupvotedStream?.id,
      },
      create: {
        userId: user?.id ?? "",
        streamId: mostupvotedStream?.id,
      },
    }),
    prismaClient.stream.update({
      where: {
        id: mostupvotedStream?.id ?? "",
      },
      data: {
        played: true,
        playedTS: new Date(),
      },
    }),
  ]);
  console.log("Request fullfilled");
  return NextResponse.json({
    stream: mostupvotedStream,
  });
}
