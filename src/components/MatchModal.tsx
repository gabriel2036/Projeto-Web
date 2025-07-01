import { motion, AnimatePresence } from 'framer-motion';

interface Movie {
  id: number;
  title: string;
  year: number;
  poster: string;
  overview: string;
  originalId?: number;
}

interface MatchModalProps {
  movie: Movie | null;
  friendName: string | null;
  onClose: () => void;
  onMarkAsWatched?: (movieId: number) => void;
}

export default function MatchModal({ movie, friendName, onClose, onMarkAsWatched }: MatchModalProps) {
  const handleMarkAsWatched = async () => {
    if (movie && onMarkAsWatched) {
      try {
        await onMarkAsWatched(movie.originalId || movie.id);
        onClose();
      } catch (error) {
        console.error('Erro ao marcar filme como assistido:', error);
        // Aqui poderia mostrar uma mensagem de erro para o usuário
      }
    }
  };

  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative bg-[#1f1f2e] rounded-3xl w-full max-w-md shadow-2xl border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Cabeçalho */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-[#A8A4F8]">
                Match found with <span className="text-white">{friendName || 'Friend'}</span>!
              </h2>
              <p className="text-gray-400 mt-2 text-sm">Enjoy your movie night 🍿</p>
            </div>

            {/* Conteúdo em layout vertical */}
            <div className="flex flex-col items-center text-center">
              <div className="w-48 h-72 rounded-xl overflow-hidden shadow-md mb-4">
                <img
                  src={movie.poster}
                  alt={`Poster of ${movie.title}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{movie.title}</h3>
              <button 
                onClick={handleMarkAsWatched}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition-all"
              >
                Marque como Assistido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
