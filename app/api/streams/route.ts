import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
//@ts-expect-error
import youtubesearchapi from "youtube-search-api";
import { getServerSession } from "next-auth";

const YT_REGX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});
const MAX_LIMIT = 15;

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const session = await getServerSession();
    const isYt = data.url.match(YT_REGX);

    if (!isYt) {
      return NextResponse.json(
        {
          message: "Wrong url format",
        },
        {
          status: 411,
        }
      );
    }
    const extractedId = data.url.split("?v=")[1];

    const res = await youtubesearchapi.GetVideoDetails(extractedId);

    const user = await prismaClient.user.findFirst({
      where: {
        email: session?.user?.email ?? "",
      },
    });
    const stream_added_count = await prismaClient.stream.count({
      where: {
        addedById: user?.id,
      },
    });
    if (stream_added_count > MAX_LIMIT) {
      return NextResponse.json(
        {
          message: "Already at limit",
        },
        { status: 411 }
      );
    }
    console.log("Rate limit checked and done");
    console.log(res);

    const thumbnails = await res?.thumbnail?.thumbnails;
    thumbnails?.sort((a: { width: number }, b: { width: number }) =>
      a.width <= b.width ? -1 : 1
    );
    console.log(thumbnails);
    console.log("Finally Reached here");

    const stream = await prismaClient.stream.create({
      data: {
        userId: data?.creatorId,
        url: data?.url,
        extractedId,
        addedById: user?.id ?? "",
        title: res?.title ?? " Cant find video",
        smallImg: "",
        // thumbnails?.length > 1
        //   ? thumbnails[thumbnails?.length - 2]?.url ?? ""
        //   : thumbnails[thumbnails?.length - 1]?.url ?? "",
        bigImg: " ",
        //  thumbnails[thumbnails?.length - 1]?.url ?? "",
        type: "Youtube",
        // upvote: 0,
      },
    });
    console.log("Completed");
    return NextResponse.json({
      stream,
      // hasvoted: false,
      // upvote: 0,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: "error",
      },
      { status: 411 }
    );
  }
}

export async function GET(req: NextRequest) {
  //console.log("req");
  //console.log("This is called");
  // const session = useServer
  // //console.log(req.nextUrl.searchParams);
  const session = await getServerSession();
  //You can get rid of this database call by using seesion value find it how to use it
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email || " ",
    },
  });
  //console.log("This is user id");
  //console.log(user?.id);
  // if (!user) {
  // }
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  //console.log(creatorId);
  if (!creatorId) {
    return NextResponse.json(
      {
        message: "Error",
      },
      { status: 411 }
    );
  }
  const [streams, activeStream] = await Promise.all([
    prismaClient.stream.findMany({
      where: {
        userId: creatorId,
        played: false,
      },
      include: {
        _count: {
          select: {
            upvote: true,
          },
        },
        upvote: {
          where: {
            userId: user?.id,
          },
        },
      },
    }),
    prismaClient.currentStream.findFirst({
      where: {
        userId: creatorId,
        // played: false,
      },
      include: {
        stream: true,
      },
    }),
  ]);
  // //console.log(currneStream);
  // //console.log(stream[0].title);
  //console.log("Active Stream is");
  //console.log(activeStream);
  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvote: _count.upvote,
      haveupvoted: rest.upvote.length == 1 ? true : false,
    })),
    activeStream,
  });
}
