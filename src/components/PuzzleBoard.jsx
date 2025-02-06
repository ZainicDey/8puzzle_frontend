import { useMemo } from "react";
import { motion } from "framer-motion";

function PuzzleBoard({ state, onPieceMove }) {
  const canMove = (index) => {
    const emptyIndex = state.indexOf(0);
    const row = Math.floor(index / 3);
    const emptyRow = Math.floor(emptyIndex / 3);
    const col = index % 3;
    const emptyCol = emptyIndex % 3;

    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };

  const movablePieces = useMemo(() => {
    return state.map((_, index) => canMove(index));
  }, [state]);

  const handleDragStart = (e, index) => {
    if (!movablePieces[index]) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (state[index] === 0 && movablePieces[fromIndex]) {
      onPieceMove(fromIndex, index);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[300px] aspect-square mx-auto">
      {state.map((number, index) => (
        <motion.div
          key={number}
          layout
          draggable={number !== 0 && movablePieces[index]}
          onDragStart={(e) => handleDragStart(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragOver={handleDragOver}
          onClick={() => {
            if (movablePieces[index]) {
              const emptyIndex = state.indexOf(0);
              onPieceMove(index, emptyIndex);
            }
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className={`
            ${number === 0 ? "bg-gray-100" : "bg-blue-500"}
            ${
              movablePieces[index]
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-not-allowed"
            }
            rounded-xl flex items-center justify-center
            text-3xl font-bold text-white
            w-full h-full
          `}
        >
          {number !== 0 && number}
        </motion.div>
      ))}
    </div>
  );
}

export default PuzzleBoard;
