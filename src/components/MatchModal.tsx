

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Movie {
  title: string;
  year: number;
  poster: string;
  overview: string;
}

interface MatchModalProps {
  movie: Movie | null;
  friendName: string | null;
  onClose: () => void;
}

export default function MatchModal({ movie, friendName, onClose }: MatchModalProps) {
  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[#2a2a3e] rounded-2xl w-full max-w-2xl shadow-2xl relative border border-white/10 p-8"
            onClick={(e) => e.stopPropagation()} // Impede que o clique feche o modal
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-[#A8A4F8]">
                Match found with {friendName || 'Friend'}!
              </h2>
              <p className="text-gray-300 mt-1">Enjoy your movie.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-48 h-72 rounded-lg overflow-hidden flex-shrink-0">
                <img src={movie.poster} alt={`Pôster de ${movie.title}`} className="w-full h-full object-cover" />
              </div>
              <div className="text-left flex flex-col h-full">
                <h3 className="text-2xl font-bold text-white">{movie.title} ({movie.year})</h3>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed flex-grow">
                  {movie.overview}
                </p>
                <div className="flex gap-4 mt-6">
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Not Interested!
                  </button>
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Watched!
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}