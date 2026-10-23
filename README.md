# Thai Checkers (Mak Yek) Web Game

A web-based implementation of the traditional Thai Checkers board game, complete with manga-style action animations for captures!

## Features

- **Classic Mak Yek Rules:** Features authentic movement and capture mechanics.
- **Rich UI:** Includes an 8x8 grid simulating a wooden board with dimples, and cleanly styled spherical pieces.
- **Dynamic Captures:** Support for both "Intervention" (moving between enemies) and "Custodian" (trapping enemies) captures.
- **Manga Action Effects:** Whenever a capture occurs, enjoy dramatic screen shakes, speed lines, and randomized comic text (BAM!, SLASH!, etc.).

## Rules of the Game

1. **Setup:** The board starts with 8 red pieces on the bottom row and 8 cyan pieces on the top row. Red moves first.
2. **Movement:** Pieces move similarly to a Rook in chess. They can move horizontally or vertically any number of unblocked squares.
3. **Capture - Intervention:** If a player moves their piece to a space *exactly between* two (or more) opposing pieces in a straight line, all the opponent pieces in that line are captured.
4. **Capture - Custodian (Trapping):** If a player moves their piece such that it completes a trap, flanking a line of opponent pieces against another piece of their own color, the trapped opponent pieces are captured.
5. **Winning:** A player wins when they reduce their opponent's pieces to 1 or 0.

## How to Play Locally

This is a vanilla web application. There are no build tools or bundlers required to play.

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
   - *Alternatively*, start a local development server for a cleaner experience:
     ```bash
     python3 -m http.server 8000
     ```
     Then navigate to `http://localhost:8000` in your browser.

## Technologies Used

- HTML5
- CSS3 (Flexbox, CSS Grid, Custom Properties, Keyframe Animations)
- Vanilla JavaScript (ES6+)
