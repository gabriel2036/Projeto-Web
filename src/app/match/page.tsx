'use client';

import { useState, useCallback } from "react";
import {
  motion,
  useMotionValue
} from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, X as CloseIcon, Check } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  year: number;
  poster: string;
}

interface Friend {
  id: number;
  name: string;
  movies: Movie[];
}

export default function YouVersePage() {
  const [search, setSearch] = useState("");
  const [interesses, setInteresses] = useState<string[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendProgress, setFriendProgress] = useState<Record<number, number>>({});

  const x = useMotionValue(0);

  const friends: Friend[] = [
    {
      id: 1,
      name: "Alice",
      movies: [
        { id: 1, title: "10 Things I Hate About You", year: 1999, poster: "/posters/10things.jpg" },
        { id: 2, title: "Inception", year: 2010, poster: "/posters/inception.jpg" },
      ],
    },
    {
      id: 2,
      name: "Bruno",
      movies: [
        { id: 3, title: "La La Land", year: 2016, poster: "/posters/lalaland.jpg" },
        { id: 4, title: "Whiplash", year: 2014, poster: "/posters/whiplash.jpg" },
      ],
    },
    {
      id: 3,
      name: "Carla",
      movies: [
        { id: 5, title: "Interstellar", year: 2014, poster: "/posters/interstellar.jpg" },
        { id: 6, title: "Dune", year: 2021, poster: "/posters/dune.jpg" },
      ],
    },
  ];

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(prev => (prev?.id === friend.id ? null : friend));
  };

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!selectedFriend) return;

      const friendId = selectedFriend.id;
      const index = friendProgress[friendId] || 0;
      const movie = selectedFriend.movies[index];

      if (direction === "right" && movie) {
        setInteresses((prev) => [...prev, movie.title]);
      }

      setSwipeDirection(direction);
    },
    [selectedFriend, friendProgress]
  );

  const handleDragEnd = (_e: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      handleSwipe("right");
    } else if (info.offset.x < -threshold) {
      handleSwipe("left");
    } else {
      x.set(0);
    }
  };

  const currentIndex = selectedFriend ? friendProgress[selectedFriend.id] || 0 : 0;

  return (
    <div className="min-h-screen bg-[#0e0e13] text-[#7471D9] font-sans overflow-x-hidden relative p-6">
      <div className="bg-[#1F1F26] rounded-[36px] max-w-[1850px] mx-auto p-8 relative shadow-lg">
        <h1 className="text-center text-5xl font-bold mb-2 text-[#A8A4F8]">
          Let’s Match <span className="text-[#A8A4F8]">YouVerses</span>
        </h1>
        <p className="text-center text-lg mb-6 text-[#A8A4F8]">
          Choose a friend and swipe through movie matches!
        </p>

        <div className="flex gap-10 items-start">
          <aside className="w-64">
            <div className="relative mb-4">
              <Input
                placeholder="Search in your friend list..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#282845] placeholder-gray-400 border-none focus:ring-0"
              />
              <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[300px] mb-6">
              {friends
                .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
                .map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleSelectFriend(f)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#303054] transition ${
                      selectedFriend?.id === f.id ? "bg-indigo-600" : "bg-[#282845]"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-400" />
                    <span>{f.name}</span>
                  </div>
                ))}
            </div>
          </aside>

          <div className="flex-1 flex items-center justify-center relative min-h-[400px]">
            {selectedFriend ? (
              <div className="relative w-64 h-96">
                {[...Array(3)].map((_, i) => {
                  const index = currentIndex + i;
                  const movie = selectedFriend.movies[index];
                  if (!movie) return null;

                  const isTop = i === 0;
                  const zIndex = 50 - i * 10;
                  const topOffset = i * 6;
                  const scale = i === 0 ? 1 : 0.95;

                  return isTop ? (
                    <motion.div
                      key={movie.id}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={handleDragEnd}
                      style={{ x, scale, zIndex, top: 0, left: 0 }}
                      animate={
                        swipeDirection
                          ? {
                              x: swipeDirection === "left" ? -500 : 500,
                              opacity: 0
                            }
                          : { x: 0, opacity: 1 }
                      }
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onAnimationComplete={() => {
                        if (swipeDirection) {
                          setFriendProgress((prev) => ({
                            ...prev,
                            [selectedFriend.id]: currentIndex + 1,
                          }));
                          setSwipeDirection(null);
                          x.set(0);
                        }
                      }}
                      className="absolute w-full h-full"
                    >
                      <Card className="w-full h-full overflow-hidden">
                        <CardContent className="p-0 flex flex-col h-full">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="object-cover h-4/5 w-full"
                          />
                          <div className="flex-1 flex flex-col justify-center items-center bg-[#1A1A2B]">
                            <h2 className="text-lg font-semibold text-center px-2">{movie.title}</h2>
                            <span className="text-gray-400 text-sm">{movie.year}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-6">
                        <button
                          onClick={() => handleSwipe("left")}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:scale-105 transition-transform duration-300 shadow-md flex items-center justify-center border border-white/10"
                        >
                          <CloseIcon className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => handleSwipe("right")}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:scale-105 transition-transform duration-300 shadow-md flex items-center justify-center border border-white/10"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div
                      key={movie.id}
                      className="absolute w-full h-full bg-[#1A1A2B]"
                      style={{
                        top: topOffset,
                        left: topOffset,
                        zIndex,
                        transform: `scale(${scale})`,
                        opacity: 1,
                      }}
                    >
                      <Card className="w-full h-full overflow-hidden">
                        <CardContent className="p-0 flex flex-col h-full">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="object-cover h-4/5 w-full"
                          />
                          <div className="flex-1 flex flex-col justify-center items-center bg-[#1A1A2B]">
                            <h2 className="text-lg font-semibold text-center px-2">{movie.title}</h2>
                            <span className="text-gray-400 text-sm">{movie.year}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-[#A8A4F8] flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">👥</div>
                <p className="text-xl">Select a friend to start swiping!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}