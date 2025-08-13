import React from 'react';
import { useMemoryGame } from './hooks/useMemoryGame';
import GameMenu from './components/GameMenu';
import GameBoard from './components/GameBoard';
import GameCompleteModal from './components/GameCompleteModal';
import Loading from './components/Loading';

function App() {
  const {
    cards,
    gameStats,
    gameSettings,
    gameState,
    flippedCards,
    startGame,
    flipCard,
    resetGame
  } = useMemoryGame();

  const isNewRecord = gameStats.score > 0 && gameStats.score === gameStats.bestScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto py-8">
        {gameState === 'menu' && (
          <GameMenu 
            onStartGame={startGame} 
            bestScore={gameStats.bestScore}
          />
        )}
        
        {gameState === 'loading' && <Loading />}
        
        {gameState === 'playing' && (
          <GameBoard
            cards={cards}
            gameStats={gameStats}
            onCardClick={flipCard}
            onReset={resetGame}
            flippedCards={flippedCards}
          />
        )}
        
        {gameState === 'completed' && (
          <>
            <GameBoard
              cards={cards}
              gameStats={gameStats}
              onCardClick={() => {}}
              onReset={resetGame}
              flippedCards={[]}
            />
            <GameCompleteModal
              gameStats={gameStats}
              onNewGame={() => startGame(gameSettings.theme, gameSettings.difficulty)}
              onMainMenu={resetGame}
              isNewRecord={isNewRecord}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
