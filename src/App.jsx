import { useState, useCallback, useRef, useEffect } from "react";
import PuzzleBoard from "./components/PuzzleBoard";
import { shuffleArray } from "./utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  Brain,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Info,
  MoveRight,
  Loader2,
} from "lucide-react";

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initText, setInitText] = useState("Initializing...");
  const [puzzleState, setPuzzleState] = useState([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSolutionStep, setCurrentSolutionStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  const handlePieceMove = (fromIndex, toIndex) => {
    if (puzzleState[toIndex] === 0) {
      const newState = [...puzzleState];
      [newState[fromIndex], newState[toIndex]] = [
        newState[toIndex],
        newState[fromIndex],
      ];
      setPuzzleState(newState);
      setSolution(null);
      setCurrentSolutionStep(0);
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray([...puzzleState]);
    setPuzzleState(shuffled);
    setSolution(null);
    setCurrentSolutionStep(0);
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  };

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    } else {
      setIsPlaying(true);
      playIntervalRef.current = setInterval(() => {
        setCurrentSolutionStep((prev) => {
          if (prev < solution.length - 1) {
            setPuzzleState(solution[prev + 1]);
            return prev + 1;
          } else {
            setIsPlaying(false);
            clearInterval(playIntervalRef.current);
            return prev;
          }
        });
      }, 1000);
    }
  }, [isPlaying, solution]);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(
          "https://8puzzle-backend.vercel.app/"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json();
      } catch (error) {
        console.error("Server initialization error:", error);
      } finally {
        setTimeout(() => {
          setIsInitializing(false);
        }, 1000);
      }
    };

    checkServer();
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setInitText((prev) =>
        prev === "Initializing..." ? "Please wait..." : "Initializing..."
      );
    }, 2000);

    return () => clearInterval(textInterval);
  }, []);

  if (isInitializing) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
          <div
            className={`max-w-2xl mx-auto ${
              isInitializing ? "opacity-50" : ""
            }`}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                8 Puzzle Solver
              </h1>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl">
                <PuzzleBoard
                  state={puzzleState}
                  onPieceMove={handlePieceMove}
                />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={initText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 size={40} className="text-indigo-600 animate-spin" />
              <p className="text-lg font-medium text-gray-700">{initText}</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </>
    );
  }

  const solvePuzzle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://8puzzle-backend.vercel.app/solve/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: puzzleState }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSolution(data.solution_paths);
      setCurrentSolutionStep(0);
      setIsPlaying(false);
    } catch (error) {
      console.error("Error solving puzzle:", error);
      alert("Failed to connect to the solver service. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const showPreviousStep = () => {
    if (solution && currentSolutionStep > 0) {
      setCurrentSolutionStep((prev) => prev - 1);
      setPuzzleState(solution[currentSolutionStep - 1]);
    }
  };

  const showNextStep = () => {
    if (solution && currentSolutionStep < solution.length - 1) {
      setCurrentSolutionStep((prev) => prev + 1);
      setPuzzleState(solution[currentSolutionStep + 1]);
    } else {
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className={`max-w-2xl mx-auto ${isInitializing ? "opacity-50" : ""}`}>
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              8 Puzzle Solver
            </h1>
  
            <div className="text-gray-600 text-center mb-12 space-y-2">
              <p className="font-medium flex items-center justify-center gap-2">
                <Info size={18} className="text-indigo-500" />
                How to play:
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center justify-center gap-2">
                  <MoveRight size={16} className="text-purple-500" />
                  Click or drag tiles adjacent to the empty space to move them
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Shuffle size={16} className="text-purple-500" />
                  Use the shuffle button to start a new puzzle
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Brain size={16} className="text-purple-500" />
                  Click "Solve Puzzle" to find the solution
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Play size={16} className="text-purple-500" />
                  Use the playback controls to see the solution steps
                </li>
              </ul>
            </div>
  
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl">
              <PuzzleBoard state={puzzleState} onPieceMove={handlePieceMove} />
            </div>
  
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleShuffle}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex items-center justify-center gap-2"
                >
                  <Shuffle size={20} />
                  Shuffle
                </button>
  
                <button
                  onClick={solvePuzzle}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Brain size={20} className="animate-pulse" />
                      Solving...
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      Solve Puzzle
                    </>
                  )}
                </button>
              </div>
  
              {solution && (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={showPreviousStep}
                      disabled={currentSolutionStep === 0}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                    >
                      <SkipBack size={20} />
                      Previous
                    </button>

                    <button
                      onClick={togglePlay}
                      disabled={currentSolutionStep >= solution.length - 1}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={20} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={20} />
                          Play
                        </>
                      )}
                    </button>

                    <button
                      onClick={showNextStep}
                      disabled={currentSolutionStep >= solution.length - 1}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                    >
                      <SkipForward size={20} />
                      Next
                    </button>
                  </div>
                  <p className="text-center text-gray-600 font-medium">
                    Step {currentSolutionStep + 1} of {solution.length}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );  
}

export default App;
