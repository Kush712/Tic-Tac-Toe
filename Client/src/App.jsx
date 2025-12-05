import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [winnerLine, setWinnerLine] = useState([]);

  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    const res = await fetch(`${API_URL}/api/game`);
    const data = await res.json();
    setGame(data);
    detectWinnerLine(data.board);
  };

  const handleMove = async (index) => {
    if (loading || !game || game.game_over || game.board[index] !== "") return;

    setLoading(true);

    const res = await fetch(`${API_URL}/api/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position: index }),
    });

    const data = await res.json();
    setGame(data);
    detectWinnerLine(data.board);
    setLoading(false);
  };

  const resetGame = async () => {
    const res = await fetch(`${API_URL}/api/reset`, {
      method: "POST",
    });

    const data = await res.json();
    setGame(data);
    setWinnerLine([]);
  };

  // Detect winning combination for highlighting
  const detectWinnerLine = (board) => {
    const combos = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (let combo of combos) {
      if (
        board[combo[0]] !== "" &&
        board[combo[0]] === board[combo[1]] &&
        board[combo[1]] === board[combo[2]]
      ) {
        setWinnerLine(combo);
        return;
      }
    }
    setWinnerLine([]);
  };

  if (!game) return <h2 style={{ color: "white" }}>Loading...</h2>;

  return (
    <div className="game-container">

      <h1 className="title">✨ Tic Tac Toe Deluxe ✨</h1>

      <p className="status">
        {game.game_over
          ? game.winner
            ? `🏆 Winner: ${game.winner}`
            : "🤝 Draw!"
          : `Turn: ${game.current_player}`}
      </p>

      <div className="board">
        {game.board.map((cell, idx) => (
          <div
            key={idx}
            className={`cell 
              ${winnerLine.includes(idx) ? "win-glow" : ""} 
              ${cell === "X" ? "x-style" : cell === "O" ? "o-style" : ""}`
            }
            onClick={() => handleMove(idx)}
          >
            {cell}
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={resetGame}>
        🔄 Restart
      </button>

      {loading && <p className="loading">Processing...</p>}
    </div>
  );
}

export default App;
