'use client';
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X as CloseIcon, Check } from "lucide-react";

/**
 * CineMatch – Match (Swipe) Page
 * --------------------------------------------------------
 * This component replicates the Tinder‑style swipe screen you described.
 * It uses Framer Motion for drag‑to‑swipe interactions and Tailwind for styling.
 * The sidebar shows a (mock) friend list with a search box.
 * Replace the movie / friend data with real API calls as needed.
 */
export default function MatchPage() {
  // ───────────────────────────  Mock data  ───────────────────────────
  const initialMovies = [
    {
      id: 1,
      title: "10 Things I Hate About You",
      year: 1999,
      poster: "/posters/10things.jpg" // add real path or external URL
    },
    {
      id: 2,
      title: "Inception",
      year: 2010,
      poster: "/posters/inception.jpg"
    },
    {
      id: 3,
      title: "La La Land",
      year: 2016,
      poster: "/posters/lalaland.jpg"
    }
  ];

  const friends = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bruno" },
    { id: 3, name: "Carla" },
    { id: 4, name: "Diego" }
  ];

  // ───────────────────────────  State  ───────────────────────────
  const [movies, setMovies] = useState(initialMovies);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [search, setSearch] = useState("");

  // ───────────────────────────  Handlers  ───────────────────────────
  interface Movie {
    id: number;
    title: string;
    year: number;
    poster: string;
  }

  interface Friend {
    id: number;
    name: string;
  }

  type SwipeDirection = "left" | "right";

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      // TODO: send like/dislike to backend with movies[currentIndex].id + direction
      setCurrentIndex((prev: number) => prev + 1);
    },
    [currentIndex]
  );

  interface DragInfo {
    offset: {
      x: number;
      y: number;
    };
    velocity: {
      x: number;
      y: number;
    };
    point: {
      x: number;
      y: number;
    };
  }

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: DragInfo
  ) => {
    const threshold = 150; // px
    if (info.offset.x > threshold) {
      handleSwipe("right");
    } else if (info.offset.x < -threshold) {
      handleSwipe("left");
    }
  };

  // ───────────────────────────  Derived  ───────────────────────────
  const currentMovie = movies[currentIndex];
  const nextMovie = movies[currentIndex + 1];

  // ───────────────────────────  Render  ───────────────────────────
  return (
    <div className="h-screen w-full bg-[#1A1A2B] text-white flex flex-col p-4">
      {/* Header */}
      <header className="flex items-center gap-3 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-8 h-8 text-indigo-400"
          fill="currentColor"
        >
          <path d="M12 2l8 4v6c0 5-3 9-8 10-5-1-8-5-8-10V6l8-4z" />
        </svg>
        <h1 className="text-2xl font-semibold">
          Invite someone to your <span className="text-indigo-400">YouVerse.</span>
        </h1>
      </header>

      <p className="text-sm text-gray-400 mb-6">You can see your friends here!</p>

      {/* Layout */}
      <div className="flex-1 flex gap-6">
        {/* Sidebar – Friend list */}
        <aside className="w-56 flex flex-col">
          <div className="relative mb-6">
            <Input
              placeholder="Search in your friend list…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#282845] placeholder-gray-400 border-none focus:ring-0"
            />
            <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            {friends
              .filter((f) =>
                f.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 bg-[#282845] rounded-xl px-3 py-2 cursor-pointer hover:bg-[#303054] transition"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-400" />
                  <span>{f.name}</span>
                </div>
              ))}
          </div>
        </aside>

        {/* Swipe zone */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Next card as background preview */}
          {nextMovie && (
            <Card className="absolute w-64 h-96 rotate-6 scale-90 opacity-30 bg-gradient-to-br from-[#282845] to-[#1A1A2B]" />
          )}

          {/* Current card */}
          <AnimatePresence>
            {currentMovie && (
              <motion.div
                key={currentMovie.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="w-64 h-96 relative cursor-grab"
              >
                <Card className="w-full h-full overflow-hidden">
                  <CardContent className="p-0 flex flex-col h-full">
                    <img
                      src={currentMovie.poster}
                      alt={currentMovie.title}
                      className="object-cover h-4/5 w-full"
                    />
                    <div className="flex-1 flex flex-col justify-center items-center bg-[#1A1A2B]">
                      <h2 className="text-lg font-semibold text-center px-2">
                        {currentMovie.title}
                      </h2>
                      <span className="text-gray-400 text-sm">{currentMovie.year}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Action buttons overlay */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-6">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="w-14 h-14 rounded-full shadow-xl"
                    onClick={() => handleSwipe("left")}
                  >
                    <CloseIcon className="w-6 h-6" />
                  </Button>
                  <Button
                    size="icon"
                    className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-xl"
                    onClick={() => handleSwipe("right")}
                  >
                    <Check className="w-6 h-6" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!currentMovie && (
            <p className="text-gray-400">No more movies to show 🙌</p>
          )}
        </div>
      </div>
    </div>
  );
}
