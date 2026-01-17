import { useEffect, useRef, useState, useCallback } from 'react';
import { LinkedList } from './LinkedList';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 100;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export function SnakeGame() {
  const [snake, setSnake] = useState<LinkedList>(new LinkedList());
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [justAte, setJustAte] = useState(false);
  
  const directionRef = useRef<Direction>('RIGHT');
  const snakeRef = useRef<LinkedList>(new LinkedList());

  // Initialize snake
  const initializeGame = useCallback(() => {
    const newSnake = new LinkedList();
    newSnake.addToHead(5, 10);
    newSnake.addToHead(6, 10);
    newSnake.addToHead(7, 10);
    
    snakeRef.current = newSnake;
    setSnake(newSnake);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setSpeed(INITIAL_SPEED);
    setJustAte(false);
    generateFood(newSnake);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Generate random food position
  const generateFood = (currentSnake: LinkedList) => {
    let newX, newY;
    do {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
    } while (currentSnake.contains(newX, newY));
    
    setFood({ x: newX, y: newY });
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      const head = snakeRef.current.getHead();
      if (!head) return;

      let newX = head.x;
      let newY = head.y;

      // Calculate new head position based on direction
      switch (directionRef.current) {
        case 'UP':
          newY -= 1;
          break;
        case 'DOWN':
          newY += 1;
          break;
        case 'LEFT':
          newX -= 1;
          break;
        case 'RIGHT':
          newX += 1;
          break;
      }

      // Check wall collision
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      // Check self collision
      if (snakeRef.current.contains(newX, newY)) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      // Add new head
      snakeRef.current.addToHead(newX, newY);

      // Check if food is eaten
      if (newX === food.x && newY === food.y) {
        setScore(prev => prev + 10);
        setSpeed(prev => Math.max(30, prev - 10)); // Increase speed
        setJustAte(true);
        setTimeout(() => setJustAte(false), 200);
        generateFood(snakeRef.current);
      } else {
        // Remove tail if no food eaten
        snakeRef.current.removeTail();
      }

      // Update state to trigger re-render
      setSnake(new LinkedList());
    }, speed);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, food, speed]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      const newDirection: Direction | null = 
        e.key === 'ArrowUp' && directionRef.current !== 'DOWN' ? 'UP' :
        e.key === 'ArrowDown' && directionRef.current !== 'UP' ? 'DOWN' :
        e.key === 'ArrowLeft' && directionRef.current !== 'RIGHT' ? 'LEFT' :
        e.key === 'ArrowRight' && directionRef.current !== 'LEFT' ? 'RIGHT' :
        null;

      if (newDirection) {
        directionRef.current = newDirection;
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const handleDirectionClick = (newDirection: Direction) => {
    if (!isPlaying) return;
    
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    };

    if (directionRef.current !== opposites[newDirection]) {
      directionRef.current = newDirection;
      setDirection(newDirection);
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    initializeGame();
  };

  const snakeArray = snakeRef.current.toArray();

  return (
    <div className="flex flex-col items-center gap-8 p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl mb-3 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
          🐍 Linked List Snake
        </h1>
        <p className="text-lg text-gray-600">Each segment is a node in the linked list data structure</p>
      </motion.div>

      <div className="flex flex-wrap gap-8 justify-center items-start w-full">
        {/* Game Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-2 border-gray-200">
            <div className="relative">
              <div
                className="border-4 border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-inner"
                style={{
                  width: GRID_SIZE * CELL_SIZE,
                  height: GRID_SIZE * CELL_SIZE,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                }}
              >
                {/* Grid cells */}
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                  const x = idx % GRID_SIZE;
                  const y = Math.floor(idx / GRID_SIZE);
                  const isSnake = snakeRef.current.contains(x, y);
                  const isHead = snakeRef.current.head?.x === x && snakeRef.current.head?.y === y;
                  const isFood = food.x === x && food.y === y;

                  return (
                    <motion.div
                      key={idx}
                      className={`border border-gray-700/20 transition-all duration-100 ${
                        isHead
                          ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/50'
                          : isSnake
                          ? 'bg-gradient-to-br from-green-300 to-green-500'
                          : isFood
                          ? 'bg-gradient-to-br from-red-400 to-rose-600'
                          : (x + y) % 2 === 0 
                          ? 'bg-gray-800/30' 
                          : 'bg-gray-800/10'
                      } ${isHead ? 'rounded-full' : isSnake ? 'rounded-sm' : ''}`}
                      animate={isFood ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={isFood ? {
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                    >
                      {isFood && (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          🍎
                        </div>
                      )}
                      {isHead && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Game Over Overlay */}
              <AnimatePresence>
                {gameOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
                  >
                    <motion.div
                      initial={{ scale: 0.5, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      className="bg-white p-8 rounded-2xl text-center shadow-2xl max-w-sm"
                    >
                      <div className="mb-4">
                        <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
                      </div>
                      <h2 className="text-3xl mb-2">Game Over!</h2>
                      <p className="text-gray-600 mb-4">You did great!</p>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg mb-6">
                        <div className="text-sm opacity-90">Final Score</div>
                        <div className="text-4xl">{score}</div>
                      </div>
                      <Button onClick={resetGame} size="lg" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                        <RotateCcw className="mr-2 h-5 w-5" />
                        Play Again
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Controls and Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 min-w-[280px]"
        >
          {/* Score Card */}
          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg border-0">
            <motion.div
              animate={justAte ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm opacity-90">Score</div>
                  <div className="text-4xl">{score}</div>
                </div>
                <Trophy className="w-12 h-12 opacity-80" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                  <div className="opacity-80">Length</div>
                  <div className="text-xl">{snakeRef.current.length}</div>
                </div>
                <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                  <div className="opacity-80">Level</div>
                  <div className="text-xl">{Math.round((INITIAL_SPEED - speed) / 5) + 1}</div>
                </div>
              </div>
            </motion.div>
          </Card>

          {/* Control Buttons */}
          <Card className="p-4 shadow-lg">
            <div className="flex gap-2 mb-3">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant={isPlaying ? "secondary" : "default"}
                className="flex-1 h-12 text-base bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                disabled={gameOver}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    {gameOver ? 'Game Over' : 'Start'}
                  </>
                )}
              </Button>
              <Button onClick={resetGame} variant="outline" className="h-12 px-4 border-2">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

            {/* Direction Controls */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
              <div className="text-sm mb-3 text-center">Direction Controls</div>
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDirectionClick('UP')}
                  className="p-3 h-12 bg-white hover:bg-green-50 border-2 hover:border-green-400 transition-all"
                  disabled={!isPlaying}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <div></div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDirectionClick('LEFT')}
                  className="p-3 h-12 bg-white hover:bg-green-50 border-2 hover:border-green-400 transition-all"
                  disabled={!isPlaying}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDirectionClick('DOWN')}
                  className="p-3 h-12 bg-white hover:bg-green-50 border-2 hover:border-green-400 transition-all"
                  disabled={!isPlaying}
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDirectionClick('RIGHT')}
                  className="p-3 h-12 bg-white hover:bg-green-50 border-2 hover:border-green-400 transition-all"
                  disabled={!isPlaying}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-3 text-center">
                Use arrow keys ⌨️
              </div>
            </div>
          </Card>

          {/* Data Structure Info */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <div className="text-sm">Linked List Operations</div>
            </div>
            <ul className="text-xs space-y-2">
              <li className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
                <span className="text-green-600">→</span>
                <div>
                  <strong className="text-blue-700">addToHead()</strong>
                  <div className="text-gray-600">Adds new position at front</div>
                </div>
              </li>
              <li className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
                <span className="text-green-600">→</span>
                <div>
                  <strong className="text-blue-700">removeTail()</strong>
                  <div className="text-gray-600">Removes last segment</div>
                </div>
              </li>
              <li className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
                <span className="text-green-600">→</span>
                <div>
                  <strong className="text-blue-700">contains(x, y)</strong>
                  <div className="text-gray-600">Checks for collisions</div>
                </div>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* Linked List Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full"
      >
        <Card className="p-6 bg-gradient-to-br from-white to-purple-50 shadow-xl border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl">
              🔗
            </div>
            <h3 className="text-2xl">Linked List Visualization</h3>
          </div>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center gap-3 min-w-min">
              <AnimatePresence mode="popLayout">
                {snakeArray.map((segment, idx) => (
                  <motion.div
                    key={`${segment.x}-${segment.y}-${idx}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`${
                      idx === 0 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-700' 
                        : 'bg-gradient-to-br from-green-300 to-green-500 border-green-600'
                    } border-3 rounded-xl p-4 min-w-[140px] shadow-lg`}>
                      <div className="text-xs text-white/90 mb-1">
                        {idx === 0 ? '👑 HEAD' : idx === snakeArray.length - 1 ? '🔚 TAIL' : `Node ${idx}`}
                      </div>
                      <div className="text-sm text-white">
                        <div className="bg-white/20 rounded px-2 py-1 mb-1">x: {segment.x}</div>
                        <div className="bg-white/20 rounded px-2 py-1">y: {segment.y}</div>
                      </div>
                      <div className="text-xs text-white/70 mt-2">next →</div>
                    </div>
                    {idx < snakeArray.length - 1 && (
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-3xl text-green-500"
                      >
                        ➜
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-br from-gray-300 to-gray-400 border-3 border-gray-500 rounded-xl p-4 min-w-[140px] shadow-lg"
              >
                <div className="text-sm text-gray-700 text-center">null</div>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}