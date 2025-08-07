
import { useState, useEffect } from 'react';
import { getAIMove } from '../lib/api';
import { Button } from './ui/button';

type Board = (null | 'X' | 'O')[];

const emptyBoard: Board = Array(9).fill(null);

const checkWinner = (board: Board): string | null => {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const [a, b, c] of winLines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  return board.includes(null) ? null : 'Draw';
};

export const Game = () => {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [status, setStatus] = useState<string>('Your Turn');

  const handleClick = async (index: number) => {
    if (!isPlayerTurn || board[index] || status !== 'Your Turn') return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  useEffect(() => {
    const winner = checkWinner(board);
    if (winner) {
      setStatus(winner === 'Draw' ? 'Game Draw' : `${winner} Wins`);
      return;
    }

    if (!isPlayerTurn) {
      const getMove = async () => {
        setStatus('AI Thinking...');
        try {
          const aiMove = await getAIMove({ board, player: 'O' });
          if (board[aiMove]) {
            setStatus('AI tried an invalid move. You win!');
            return;
          }
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          setIsPlayerTurn(true);
          setStatus('Your Turn');
        } catch (error) {
          setStatus('Error: ' + (error as Error).message);
        }
      };
      getMove();
    }
  }, [isPlayerTurn, board]);

  const resetGame = () => {
    setBoard(emptyBoard);
    setIsPlayerTurn(true);
    setStatus('Your Turn');
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h1 className="text-2xl font-bold">Tic Tac Toe vs AI 🤖</h1>
      <p>{status}</p>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <Button
            key={i}
            onClick={() => handleClick(i)}
            className="w-20 h-20 text-3xl border rounded shadow-md hover:bg-gray-600"
          >
            {cell}
          </Button>
        ))}
      </div>
      <Button
        onClick={resetGame}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Reset Game
      </Button>
    </div>
  );
};
