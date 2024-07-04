import React, { useState, useEffect, useCallback } from 'react';
import { convertMazeToFrontendFormat, generateUnevenGrid } from '../../utils/maze';
import { useEnergy } from '../../contexts/EnergyProvider';
import MazePopup from './MazePopup';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useAuth } from '../../contexts/AuthProvider';

export type CellType = 'wall' | 'path' | 'player' | 'exit' | 'fog';

const Maze: React.FC = () => {
  const [maze, setMaze] = useState<CellType[][]>([[]]);
  const [visibleMaze, setVisibleMaze] = useState<CellType[][]>([[]]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [fogGroups, setFogGroups] = useState<number[][]>([[]]);
  const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);
  const [popupData, setPopupData] = useState<{ isOpen: boolean; groupSize: number; groupId: number }>({
    isOpen: false,
    groupSize: 0,
    groupId: 0,
  });
  const [hasUnsavedPlayerMovement, setHasUnsavedPlayerMovement] = useState(false);

  const { energy, decreaseEnergy } = useEnergy()
  const { currentUser, token } = useAuth()

  useEffect(() => {
    loadMazeState();
  }, []); 

  const loadMazeState = async () => {
    const getUid = async () => currentUser?.uid
    try {
      const uid = await getUid()
      const response = await axios.get(`/api/maze/${uid}`,{
        headers: {
          Authorization: "Bearer " + token
        }
      });
      const loadedState = response.data;
      if (loadedState) {
        const formattedLoadedState = convertMazeToFrontendFormat(loadedState)
        setMaze(formattedLoadedState.maze);
        setVisibleMaze(formattedLoadedState.visibleMaze);
        setPlayerPosition(formattedLoadedState.playerPosition);
        setFogGroups(formattedLoadedState.fogGroups);
      } else {
        generateMaze(); 
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.log("Hi Axios error:", error.response?.status, error.response?.data);
      } else {
        console.log("Unexpected error:", error);
      }
    }
  };

  const saveMazeState = async (onlyPlayerPosition = false) => {
    const getUid = async () => currentUser?.uid
    try {
      const uid = await getUid()
      const stateToSave = onlyPlayerPosition 
        ? { playerPosition }
        : {
            maze,
            visibleMaze,
            fogGroups,
            playerPosition,
            // ... other state variables you want to save
          };

      await axios.put(`/api/maze/${uid}`, {
        mazeState: stateToSave
      }, {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      console.log("Maze state saved successfully");
      if (onlyPlayerPosition) {
        setHasUnsavedPlayerMovement(false);
      }
    } catch (error) {
      console.error("Failed to save maze state:", error);
    }
  };

  const debouncedSavePlayerPosition = useCallback(
    debounce(() => {
      saveMazeState(true);
    }, 5000),
    [playerPosition]
  );

  useEffect(() => {
    setHasUnsavedPlayerMovement(true);
    debouncedSavePlayerPosition();
  }, [playerPosition]);

  useEffect(() => {
    if (maze[0].length !== 0) {
      saveMazeState();
    }
  }, [maze, visibleMaze, fogGroups]);

  useEffect(() => {
    return () => {
      if (hasUnsavedPlayerMovement) {
        saveMazeState(true);
      }
    };
  }, [hasUnsavedPlayerMovement]);

  const generateMaze = () => {
    const newMaze: CellType[][] = Array(31).fill(null).map(() => Array(31).fill('wall'));

    const carve = (x: number, y: number) => {
      const directions = [
        [0, -1], [1, 0], [0, 1], [-1, 0]
      ].sort(() => Math.random() - 0.5);

      for (const [dx, dy] of directions) {
        const nx = x + dx * 2;
        const ny = y + dy * 2;
        if (nx > 0 && nx < 30 && ny > 0 && ny < 30 && newMaze[ny][nx] === 'wall') {
          newMaze[y + dy][x + dx] = 'path';
          newMaze[ny][nx] = 'path';
          carve(nx, ny);
        }
      }
    };

    newMaze[1][1] = 'path';
    carve(1, 1);

    if (newMaze[29][29] === 'wall') {
      let x = 29, y = 29;
      while (newMaze[y][x] === 'wall') {
        newMaze[y][x] = 'path';
        if (x > 1) x--;
        if (y > 1) y--;
      }
    }

    newMaze[1][1] = 'player';
    newMaze[29][29] = 'exit';

    setMaze(newMaze);
    
    const newVisibleMaze: CellType[][] = newMaze.map((row, y) => 
      row.map((cell, x) => (x <= 2 && y <= 2) ? cell : 'fog')
    );
    setVisibleMaze(newVisibleMaze);

    // Generate fog groups
    let newFogGroups: number[][] = [];
    let groupId = 1;
    newFogGroups = generateUnevenGrid(31, 31, 25, 30)
    setFogGroups(newFogGroups);

    setPlayerPosition({ x: 1, y: 1 });
  };

  useEffect(() => {
    generateMaze();
  }, []);

  const movePlayer = (dx: number, dy: number) => {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (newX <= 0 || newX >= 30 || newY <= 0 || newY >= 30) return;
    if (maze[newY][newX] === 'wall' || visibleMaze[newY][newX] === 'fog') return;

    const newVisibleMaze = visibleMaze.map(row => [...row]);
    const newestMaze = maze.map(row => [...row]);
    newestMaze[playerPosition.y][playerPosition.x] = 'path';
    newestMaze[newY][newX] = 'player';
    newVisibleMaze[playerPosition.y][playerPosition.x] = 'path';
    newVisibleMaze[newY][newX] = 'player';
    setVisibleMaze(newVisibleMaze);
    setMaze(newestMaze);
    setPlayerPosition({ x: newX, y: newY });

    if (newX === 29 && newY === 29) {
      alert('You won! Generating new maze.');
      generateMaze();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': movePlayer(0, -1); break;
        case 'a': movePlayer(-1, 0); break;
        case 's': movePlayer(0, 1); break;
        case 'd': movePlayer(1, 0); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPosition, maze, visibleMaze]);

  const handleCellClick = (x: number, y: number) => {
    if (visibleMaze[y][x] === 'fog') {
      const groupId = fogGroups[y][x];
      let groupSize = 0;
      for (let fy = 0; fy < 31; fy++) {
        for (let fx = 0; fx < 31; fx++) {
          if (fogGroups[fy][fx] === groupId) {
            groupSize++;
          }
        }
      }
      setPopupData({ isOpen: true, groupSize, groupId });
    }
  };

  const handleReveal = () => {
    const { groupId } = popupData;
    const newVisibleMaze = visibleMaze.map(row => [...row]);
    for (let fy = 0; fy < 31; fy++) {
      for (let fx = 0; fx < 31; fx++) {
        if (fogGroups[fy][fx] === groupId) {
          newVisibleMaze[fy][fx] = maze[fy][fx];
        }
      }
    }
    decreaseEnergy(popupData.groupSize)
    setVisibleMaze(newVisibleMaze);
    setPopupData({ isOpen: false, groupSize: 0, groupId: 0 });
  };

  const handleCancel = () => {
    setPopupData({ isOpen: false, groupSize: 0, groupId: 0 });
  };

  const handleHoverStart = (x: number, y: number) => {
    if (visibleMaze[y][x] === 'fog') {
      setHoveredGroup(fogGroups[y][x]);
    }
  };

  const handleHoverEnd = () => {
    setHoveredGroup(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-100%">
      <div>
        Energy Points: {energy}
      </div>
      <div className="border-2 border-gray-300">
        {visibleMaze.map((row, y) =>
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-3 h-3 ${
                  cell === 'wall' ? 'bg-black' :
                  cell === 'player' ? 'bg-blue-500 border border-white' :
                  cell === 'exit' ? 'bg-green-500' :
                  cell === 'fog' && fogGroups[y][x] === hoveredGroup ? 'bg-red-500' :
                  cell === 'fog' ? 'bg-gray-500' :
                  'bg-white'
                }`}
                onClick={() => handleCellClick(x, y)}
                onMouseEnter={() => handleHoverStart(x, y)}
                onMouseLeave={handleHoverEnd}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 text-sm">Use W, A, S, D keys to move the player (blue) to the exit (green)</div>
      <div className="mt-2 text-sm">Click on gray areas to clear fog groups</div>
      <MazePopup 
        isOpen={popupData.isOpen}
        groupSize={popupData.groupSize}
        onReveal={handleReveal}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Maze;