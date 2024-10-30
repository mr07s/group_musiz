"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { toast } from "@/components/ui/use-toast";
// import {lite-youtube} from lite-youtube
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Play, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Redirect from "./Redirect";

type Song = {
  id: string;
  url: string;
  title: string;
  upvote: number;
  bigImg: string;
  smallImg: string;
  extractedId: string;
  haveupvoted: boolean;
};

export default function Dashboard({ creatorId }: { creatorId: string }) {
  // const creatorId = creatorId;
  console.log(creatorId);
  const REFRESH_INTERVAL_MS = 10 * 1000;
  const { toast } = useToast();
  const session = useSession();
  console.log("Signed in with");
  console.log(session.data?.user?.email);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  // const [creatorId] = useState(session.data?.user?.email);

  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>();
  console.log(currentSong);

  const extractVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    console.log(match);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchVideoTitle = async (videoId: string) => {
    // In a real application, you would fetch this from the YouTube API
    // For this example, we'll return a placeholder title
    return `Song Title for ${videoId}`;
  };

  // const addToQueue = async () => {
  //   const videoId = extractVideoId(videoUrl);
  //   if (videoId) {
  //     const title = await fetchVideoTitle(videoId);
  //     setQueue([...queue, { id: videoId, url: videoUrl, title, upvotes: 0 }]);
  //     setVideoUrl("");
  //   }
  // };
  // if(!user)
  const vote = async (index: number, amount: number, id: string) => {
    setQueue(
      queue
        .map((video) =>
          video.id === id
            ? {
                ...video,
                upvote: amount == 1 ? video.upvote + 1 : video.upvote - 1,
                haveupvoted:
                  amount == 1
                    ? (video.haveupvoted = true)
                    : (video.haveupvoted = false),
              }
            : video
        )
        .sort((a, b) => b.upvote - a.upvote)
    );
    const res = await fetch(
      `/api/streams/${amount == 1 ? "upvote" : "downvote"}`,
      {
        method: "POST",
        body: JSON.stringify({ streamId: id }),
      }
    ).then((res) => res.json());
    console.log(res);
    // if (res.success) {
    // }
  };

  const playNext = () => {
    if (queue?.length > 0) {
      setCurrentSong(queue[0]);
      setQueue(queue?.slice(1));
    }
  };

  useEffect(() => {
    if (!currentSong && queue?.length > 0) {
      playNext();
    }
  }, [queue, currentSong]);

  // getting streams from backend
  const refreshStreams = async () => {
    console.log("Refresh stream called");
    const { streams } = await fetch(
      `/api/streams/?creatorId=${creatorId}`
    ).then((res) => res.json());
    console.log(streams);
    // // const s;
    setQueue(
      streams.sort((a: Song, b: Song) => (a.upvote < b.upvote ? 1 : -1))
    );
  };
  useEffect(() => {
    refreshStreams();
    const interval = setInterval(() => {
      refreshStreams();
    }, REFRESH_INTERVAL_MS);
  }, []);

  const sharePage = async () => {
    const shareData = {
      title: "Join my music stream!",
      text: "Vote for the next song in my stream!",
      url: `${window.location.hostname}/creator/${creatorId}`,
    };

    // if (navigator.share && navigator.canShare(shareData)) {
    //   try {
    //     await navigator.share(shareData);
    //     toast({
    //       title: "Shared successfully!",
    //       description: "Your fans can now join and vote.",
    //     });
    //   } catch (err) {
    //     console.error("Error sharing:", err);
    //   }
    // } else {
    // Fallback to copying the URL
    navigator.clipboard
      .writeText(`${window.location.href}/creator/${creatorId}`)
      .then(
        () => {
          toast({
            title: "Link copied to clipboard!",
            description: "Share this link with your fans.",
          });
        },
        (err) => {
          console.error("Could not copy text: ", err);
        }
      );
    // }
  };

  const handleSubmit = async (url: string) => {
    setLoading(true);
    const { stream } = await fetch("/api/streams", {
      method: "POST",
      body: JSON.stringify({
        // creatorId: "e242f3ff-9bd1-4f45-8780-aeb182e92730",
        creatorId: creatorId,
        url: videoUrl,
      }),
    }).then((res) => res.json());
    stream.haveupvoted = false;
    stream.upvote = 0;
    console.log("The stream is");
    console.log(stream);
    setQueue([...queue, stream]);
    setVideoUrl("");
    setLoading(false);
  };
  // if (!session?.data?.user) {
  // }
  return (
    <>
      {!session?.data?.user ? (
        <div className="w-full min-h-[100vh] flex justify-center items-center ">
          <p className="">Sign In to view the Stream</p>
        </div>
      ) : (
        <div className="container mx-auto p-4 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Song Voting Queue</CardTitle>
                  <Button
                    onClick={sharePage}
                    variant="outline"
                    className="ml-auto"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter YouTube URL"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        handleSubmit(videoUrl);
                      }}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Add to Queue"}
                    </Button>
                  </div>
                  {/* {videoUrl && extractVideoId(videoUrl) && (
              <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${extractVideoId(
                  videoUrl
                )}`}
                allowFullScreen
                title="Video preview"
              />
               </div>
                )} */}
                </CardContent>
              </Card>
              {videoUrl && !loading ? (
                <div className="flex justify-center">
                  <Card className="w-[25rem] h-[20rem] ">
                    <CardContent className="space-y-4 h-full w-full p-4">
                      <LiteYouTubeEmbed
                        title=""
                        id={`${extractVideoId(videoUrl)}`}
                        aspectHeight={1.5}
                        aspectWidth={2}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <></>
              )}
              {currentSong && (
                <Card>
                  <CardHeader>
                    <CardTitle>Now Playing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={`${currentSong.smallImg}`}
                        alt={`Thumbnail for ${currentSong.title}`}
                        className="w-24 h-18 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-bold">{currentSong.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          upvotes: {currentSong.upvote}
                        </p>
                      </div>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${extractVideoId(
                          currentSong.url
                        )}`}
                        allowFullScreen
                        title={`Now playing: ${currentSong?.title}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* </div> */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {queue?.map((song, index) => (
                  <Card key={song?.id}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{song?.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <img
                        src={`${song?.smallImg}`}
                        alt={`Thumbnail for ${song?.title}`}
                        className="w-full aspect-video object-cover rounded-md"
                      />
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {!song?.haveupvoted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => vote(index, 1, song?.id)}
                            aria-label={`Upvote ${song?.title}`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-bold">{song?.upvote}</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => vote(index, -1, song?.id)}
                            aria-label={`Downvote ${song?.title}`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span className="font-bold">{song?.upvote}</span>
                          </Button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => playNext()}
                        aria-label={`Play ${song?.title}`}
                      >
                        <Play className="w-4 h-4 mr-2" /> Play
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}