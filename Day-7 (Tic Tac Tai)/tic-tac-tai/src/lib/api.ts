
type Board = (null | 'X' | 'O')[];

interface MoveRequest {
  board: Board;
  player: 'X' | 'O';
}

export const getAIMove = async (gameState: MoveRequest): Promise<number> => {
  const prompt = `
You are the world's best Tic Tac Toe player (AI).  
You always play optimally and never lose.  
The board is a 1D array of 9 elements representing the Tic Tac Toe board from index 0 to 8:  

- 'null' represents an empty cell  
- 'X' represents the human player's move  
- 'O' represents your move (AI)  

Your goal is to return the best possible move (an index from 0 to 8) to either **win** the game, **block** the opponent from winning, or **maximize your chances** of winning in future moves.

Only return a single number (0 - 8), the index of your optimal move. Do not return anything else.

Current Board:  
${JSON.stringify(gameState.board)}

What is your move?
`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  const aiReply = data.choices[0].message.content.trim();

//   console.log('AI Reply:', aiReply);
  const match = aiReply.match(/\b[0-8]\b/);

  const move = parseInt(match[0], 10);
  if (isNaN(move) || move < 0 || move > 8) throw new Error('Invalid AI Move');
  return move;
};
