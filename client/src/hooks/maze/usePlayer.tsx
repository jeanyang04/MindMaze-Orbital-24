import { useEffect, useCallback, useState } from 'react';
import { CellType } from '../../components/maze/Maze';
import { useEnergy } from '../../contexts/EnergyProvider';

export const usePlayer = (
  maze: CellType[][],
  visibleMaze: CellType[][],
  setPlayerPosition: React.Dispatch<React.SetStateAction<{ x: number, y: number }>>,
  generateMaze: () => void
) => {
  const [showPopup, setShowPopup] = useState(false);
  const { completeMaze } = useEnergy()

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      setPlayerPosition((prevPos) => {
        const newX = prevPos.x + dx;
        const newY = prevPos.y + dy;

        if (newX <= 0 || newX >= 30 || newY <= 0 || newY >= 30) return prevPos;
        if (maze[newY][newX] === 'wall' || visibleMaze[newY][newX] === 'fog') return prevPos;

        if (newX === 29 && newY === 29) {
          setShowPopup(true);
          completeMaze()
          return { x: 1, y: 1 }; // Reset position or handle accordingly
        }

        return { x: newX, y: newY };
      });
    },
    [maze, visibleMaze]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          movePlayer(0, -1);
          break;
        case 'a':
          movePlayer(-1, 0);
          break;
        case 's':
          movePlayer(0, 1);
          break;
        case 'd':
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  return { movePlayer, showPopup, setShowPopup };
};
