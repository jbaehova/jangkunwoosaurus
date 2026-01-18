# Jangkunwoosaurus

A fun endless runner game inspired by the classic Google Chrome dinosaur game. Jump over obstacles and try to beat your high score!

## About

Jangkunwoosaurus is a browser-based endless runner game that pays homage to the iconic Chrome dinosaur game that appears when you're offline. Control your dinosaur character as it runs through an ever-changing desert landscape, dodging cacti and flying pterodactyls.

## Features

- **Simple Controls**: Jump using spacebar, arrow up, or tap/click on mobile devices
- **Progressive Difficulty**: Game speed increases as you score higher
- **Multiple Obstacles**:
  - Small cacti
  - Large cacti
  - Flying birds (pterodactyls) at various heights
- **Score System**:
  - Real-time score tracking
  - Local high score persistence
  - Visual effects at every 100 points
- **Global Leaderboard**:
  - Submit your scores to the online leaderboard
  - View top 10 players worldwide
  - Powered by Firebase Firestore
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Custom Graphics**: Features custom dinosaur sprite or fallback to procedurally drawn character

## How to Play

1. Click "게임 시작" (Start Game) or press spacebar to begin
2. Press spacebar, arrow up, or tap the screen to make your dinosaur jump
3. Avoid obstacles by jumping over them
4. Survive as long as possible to achieve the highest score
5. Submit your score to the leaderboard and compete with other players

## Technical Details

- Built with vanilla JavaScript
- Canvas API for rendering
- Firebase for leaderboard functionality
- Responsive CSS design
- Optimized for 60 FPS gameplay

## Game Mechanics

- **Gravity**: Realistic jump physics with gravity simulation
- **Collision Detection**: Precise hitbox detection with padding for fair gameplay
- **Dynamic Spawning**: Obstacles spawn at random intervals with varying distances
- **Running Animation**: Character bob animation while on the ground
- **Background Elements**: Animated clouds and scrolling ground texture

## Credits

Inspired by the Google Chrome offline dinosaur game (T-Rex Runner).

## License

See [LICENSE](LICENSE) file for details.
