import { SnakeGame } from './components/SnakeGame';

export default function App() {
  return (
    <div className="size-full min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 overflow-auto">
      <SnakeGame />
    </div>
  );
}