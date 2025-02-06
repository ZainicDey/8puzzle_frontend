function countInversions(array) {
  let inversions = 0;
  // Don't count the empty tile (0) in inversions
  const numbers = array.filter((num) => num !== 0);

  for (let i = 0; i < numbers.length - 1; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      if (numbers[i] > numbers[j]) {
        inversions++;
      }
    }
  }
  return inversions;
}

function isSolvable(array) {
  // For 3x3 puzzle, if the number of inversions is even, the puzzle is solvable
  return countInversions(array) % 2 === 0;
}

export function shuffleArray(array) {
  let shuffled;
  do {
    shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } while (!isSolvable(shuffled));

  return shuffled;
}
