# Car Jigsaw Puzzle Game Implementation Plan

## 1. Project Goal
Build a desktop web-based jigsaw puzzle game using HTML, CSS, and JavaScript. The game will use the provided `car.avif` image and support three difficulty levels:

- Easy: 35 pieces
- Medium: 50 pieces
- Hard: 100 pieces

The game should run in the browser on a PC and allow users to drag pieces into place until the full image is restored.

## 2. Project Structure
Create the following files:

- `index.html` – page layout and controls
- `style.css` – visual styling and board layout
- `script.js` – puzzle generation, drag-and-drop logic, scoring, and win detection
- `car.avif` – source image used for the puzzle

## 3. User Interface Design
Create a single-page game interface with:

- Header title: “Car Jigsaw”
- Difficulty buttons for Easy, Medium, and Hard
- Shuffle button
- Reset button
- Move counter
- Timer
- Puzzle board area
- Status message showing progress or victory

## 4. Difficulty Configuration
Use the source image and divide it according to the selected level:

- Easy: 5 x 7 = 35 tiles
- Medium: 5 x 10 = 50 tiles
- Hard: 10 x 10 = 100 tiles

The board should dynamically size based on the selected difficulty level.

## 5. Puzzle Generation Logic
For each level:

- Determine the number of rows and columns
- Calculate tile width and height based on board size
- Split the image into tiles using CSS `background-position`
- Store each tile’s target row, column, and original image coordinates
- Randomize the tile positions for shuffle mode

## 6. Gameplay Mechanics
Implement drag-and-drop interaction:

- User clicks and holds a puzzle piece
- Piece follows the cursor while dragging
- When released, check whether it is near its correct location
- If close enough, snap the piece into its target position
- If not, return it to the shuffled position

## 7. Win Condition
Track whether all pieces are in their intended positions. The game is complete when:

- All tiles are aligned to the correct target coordinates
- Victory message appears
- Timer stops
- Move count is finalized

## 8. Important State Variables
Use JavaScript state such as:

- `currentLevel`
- `pieces[]`
- `moveCount`
- `secondsElapsed`
- `timerId`
- `solved`
- `dragPiece`

## 9. Styling Requirements
Use CSS to create a polished desktop layout:

- Dark modern background
- Centered game board
- Buttons with hover effects
- Puzzle tiles with image backgrounds and shadows
- Correctly placed tiles highlighted
- Smooth dragging appearance

## 10. Extra Features (Optional)
These can be added after the core game works:

- Sound effects
- Puzzle preview image
- Hint button
- Best time tracking
- Animated snap behavior
- Responsive design for smaller screens

## 11. Testing Plan
After building the game, test the following:

- Image loads correctly
- All difficulty levels generate the correct number of tiles
- Pieces shuffle and reposition properly
- Drag-and-drop works smoothly on desktop
- Pieces snap into correct positions
- Win condition triggers correctly
- Reset and Shuffle buttons work as expected
- Browser compatibility is acceptable in Chrome/Edge/Firefox

## 12. Development Phases
### Phase 1: Setup
- Create the HTML page structure
- Add buttons, timer, and board container

### Phase 2: Image and Tile Generation
- Load the `car.avif` image
- Create tiles for Easy, Medium, and Hard

### Phase 3: Interaction Logic
- Implement drag and release behavior
- Add snapping logic

### Phase 4: Game Flow
- Add shuffle, reset, timer, and move tracking
- Add win detection

### Phase 5: Polish
- Improve styling and user experience
- Test the full game on desktop

## 13. Acceptance Criteria
The implementation is successful when:

- The game uses `car.avif` as the puzzle image
- Difficulty levels are 35, 50, and 100 pieces
- The game runs as a desktop web app
- Users can shuffle and reset the puzzle
- Pieces can be dragged into place
- The puzzle completes correctly and shows a win state

## 14. Next Step
The next action is to implement the actual HTML, CSS, and JavaScript files to build the playable puzzle game in the project folder.
