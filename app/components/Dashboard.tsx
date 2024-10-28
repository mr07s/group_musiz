"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Play, Share2 } from "lucide-react";

type Song = {
  id: string;
  url: string;
  title: string;
  votes: number;
};

export default function Dashboard() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [queue, setQueue] = useState<Song[]>([
    { id: "1", url: "nnnn", title: "dilwale", votes: 15 },
    { id: "2", url: "nnnn", title: "dilwale", votes: 15 },
    { id: "3", url: "nnnn", title: "dilwale", votes: 15 },
    { id: "4", url: "nnnn", title: "dilwale", votes: 15 },
    { id: "5", url: "nnnn", title: "dilwale", votes: 15 },
    { id: "6", url: "nnnn", title: "dilwale", votes: 15 },
    { id: "7", url: "nnnn", title: "wale", votes: 15 },
  ]);
  const [currentSong, setCurrentSong] = useState<Song | null>({
    id: "1",
    url: "nnnn",
    title: "dilwale",
    votes: 15,
  });

  const extractVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchVideoTitle = async (videoId: string) => {
    // In a real application, you would fetch this from the YouTube API
    // For this example, we'll return a placeholder title
    return `Song Title for ${videoId}`;
  };

  const addToQueue = async () => {
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      const title = await fetchVideoTitle(videoId);
      setQueue([...queue, { id: videoId, url: videoUrl, title, votes: 0 }]);
      setVideoUrl("");
    }
  };

  const vote = (index: number, amount: number) => {
    const newQueue = [...queue];
    newQueue[index].votes += amount;
    newQueue.sort((a, b) => b.votes - a.votes);
    setQueue(newQueue);
  };

  const playNext = () => {
    if (queue.length > 0) {
      setCurrentSong(queue[0]);
      setQueue(queue.slice(1));
    }
  };

  useEffect(() => {
    if (!currentSong && queue.length > 0) {
      playNext();
    }
  }, [queue, currentSong]);

  const sharePage = async () => {
    const shareData = {
      title: "Join my music stream!",
      text: "Vote for the next song in my stream!",
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Your fans can now join and vote.",
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to copying the URL
      navigator.clipboard.writeText(window.location.href).then(
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
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Song Voting Queue</CardTitle>
          <Button onClick={sharePage} variant="outline" className="ml-auto">
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
            <Button onClick={addToQueue}>Add to Queue</Button>
          </div>
          {videoUrl && extractVideoId(videoUrl) && (
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
          )}
        </CardContent>
      </Card>

      {currentSong && (
        <Card>
          <CardHeader>
            <CardTitle>Now Playing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={`https://img.youtube.com/vi/${currentSong.id}/0.jpg`}
                alt={`Thumbnail for ${currentSong.title}`}
                className="w-24 h-18 object-cover rounded"
              />
              <div>
                <h3 className="font-bold">{currentSong.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Votes: {currentSong.votes}
                </p>
              </div>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentSong.id}?autoplay=1`}
                allowFullScreen
                title={`Now playing: ${currentSong.title}`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queue.map((song, index) => (
          <Card key={song.id}>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{song.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <img
                src={`https://img.youtube.com/vi/${song.id}/0.jpg`}
                alt={`Thumbnail for ${song.title}`}
                className="w-full aspect-video object-cover rounded-md"
              />
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => vote(index, 1)}
                  aria-label={`Upvote ${song.title}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <span className="font-bold">{song.votes}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => vote(index, -1)}
                  aria-label={`Downvote ${song.title}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => playNext()}
                aria-label={`Play ${song.title}`}
              >
                <Play className="w-4 h-4 mr-2" /> Play
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
