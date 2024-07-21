document.addEventListener('DOMContentLoaded', () => {
    const bird = document.getElementById('bird');
    const gameContainer = document.getElementById('gameContainer');
    const scoreDisplay = document.getElementById('score');
    const gameOverScreen = document.getElementById('gameOver');
    const finalScoreDisplay = document.getElementById('finalScore');
    const restartButton = document.getElementById('restartButton');
    const menuButton = document.getElementById('menuButton');
    const menuContainer = document.getElementById('menuContainer');
    const difficultyButtons = document.querySelectorAll('.difficulty-button');
    const soundToggle = document.getElementById('sound');
    let birdY = bird.offsetTop;
    const initialBirdY = birdY;
    let gravity = 0.5;
    let lift = -7; // Reduced lift value
    let velocity = 0;
    let isGameOver = false;
    let pipes = [];
    let pipeInterval;
    let pipeSpeed = 2;
    let pipeGap = 150;
    let pipeMoveSpeed = 0.5;
    let score = 0;
    let gameStarted = false;
    let soundEnabled = true;
    const flapSound = new Audio('flap.mp3');
    const gameOverSound = new Audio('gameover.mp3');
  
    soundToggle.addEventListener('change', () => {
      soundEnabled = soundToggle.checked;
    });
  
    difficultyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const difficulty = e.target.getAttribute('data-difficulty');
        setDifficulty(difficulty);
        menuContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        startGame();
      });
    });
  
    function setDifficulty(difficulty) {
      switch (difficulty) {
        case 'easy':
          pipeSpeed = 2;
          pipeGap = 200;
          pipeMoveSpeed = 0.5;
          break;
        case 'normal':
          pipeSpeed = 3;
          pipeGap = 150;
          pipeMoveSpeed = 1;
          break;
        case 'hard':
          pipeSpeed = 4;
          pipeGap = 100;
          pipeMoveSpeed = 1.5;
          break;
      }
    }
  
    function startGame() {
      birdY = initialBirdY;
      gravity = 0.5;
      lift = -7;
      velocity = 0;
      isGameOver = false;
      pipes = [];
      score = 0;
      scoreDisplay.textContent = score;
      gameOverScreen.style.display = 'none';
      bird.style.top = birdY + 'px';
      gameStarted = false;
  
      document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
  
      document.addEventListener('keydown', startGameOnKeyPress, { once: true });
      gameContainer.addEventListener('touchstart', startGameOnKeyPress, { once: true });
      requestAnimationFrame(gameLoop);
    }
  
    function startGameOnKeyPress() {
      gameStarted = true;
      pipeInterval = setInterval(createPipe, 1500);
    }
  
    function gameLoop() {
      if (isGameOver) return;
  
      if (gameStarted) {
        velocity += gravity;
        birdY += velocity;
      }
  
      if (birdY <= 0) {
        birdY = 0;
        velocity = 0;
      }
  
      if (birdY + bird.clientHeight >= gameContainer.clientHeight) {
        birdY = gameContainer.clientHeight - bird.clientHeight;
        endGame();
        return;
      }
  
      bird.style.top = birdY + 'px';
  
      pipes.forEach(pipeSet => {
        pipeSet.topPipe.x -= pipeSpeed;
        pipeSet.bottomPipe.x -= pipeSpeed;
  
        if (score >= 2) {
          // Randomly change the direction of movement
          if (Math.random() < 0.01) {
            pipeSet.direction *= -1;
          }
  
          // Move the gap up and down
          pipeSet.gapPosition += pipeSet.direction * pipeMoveSpeed;
  
          if (pipeSet.gapPosition <= 0 || pipeSet.gapPosition >= gameContainer.clientHeight - pipeGap) {
            pipeSet.direction *= -1;
          }
  
          pipeSet.topPipe.height = pipeSet.gapPosition;
          pipeSet.bottomPipe.y = pipeSet.gapPosition + pipeGap;
          pipeSet.bottomPipe.height = gameContainer.clientHeight - pipeSet.bottomPipe.y;
  
          pipeSet.topPipe.el.style.height = pipeSet.topPipe.height + 'px';
          pipeSet.bottomPipe.el.style.top = pipeSet.bottomPipe.y + 'px';
          pipeSet.bottomPipe.el.style.height = pipeSet.bottomPipe.height + 'px';
        }
  
        if (pipeSet.topPipe.x + pipeSet.topPipe.width < 0) {
          pipeSet.topPipe.el.remove();
          pipeSet.bottomPipe.el.remove();
          pipes.shift();
        } else {
          pipeSet.topPipe.el.style.left = pipeSet.topPipe.x + 'px';
          pipeSet.bottomPipe.el.style.left = pipeSet.bottomPipe.x + 'px';
        }
  
        if (!pipeSet.passed && pipeSet.topPipe.x + pipeSet.topPipe.width < bird.offsetLeft) {
          score++;
          scoreDisplay.textContent = score;
          pipeSet.passed = true;
        }
  
        if (checkCollision(bird, pipeSet.topPipe.el) || checkCollision(bird, pipeSet.bottomPipe.el)) {
          endGame();
          return;
        }
      });
  
      requestAnimationFrame(gameLoop);
    }
  
    function flap() {
      if (gameStarted) {
        velocity = lift;
        if (soundEnabled) {
          flapSound.play();
        }
      }
    }
  
    function createPipe() {
      let pipeTopHeight = Math.random() * (gameContainer.clientHeight - pipeGap - 100) + 50;
      let pipeBottomHeight = gameContainer.clientHeight - pipeTopHeight - pipeGap;
  
      let pipeTop = document.createElement('div');
      pipeTop.classList.add('pipe');
      pipeTop.style.height = pipeTopHeight + 'px';
      pipeTop.style.left = gameContainer.clientWidth + 'px';
      gameContainer.appendChild(pipeTop);
  
      let pipeBottom = document.createElement('div');
      pipeBottom.classList.add('pipe', 'bottom');
      pipeBottom.style.height = pipeBottomHeight + 'px';
      pipeBottom.style.left = gameContainer.clientWidth + 'px';
      gameContainer.appendChild(pipeBottom);
  
      let pipeSet = {
        topPipe: { el: pipeTop, x: gameContainer.clientWidth, y: 0, width: 40, height: pipeTopHeight }, // Updated width
        bottomPipe: { el: pipeBottom, x: gameContainer.clientWidth, y: gameContainer.clientHeight - pipeBottomHeight, width: 40, height: pipeBottomHeight }, // Updated width
        gapPosition: pipeTopHeight,
        direction: Math.random() < 0.5 ? 1 : -1,  // Random initial direction
        passed: false
      };
  
      pipes.push(pipeSet);
    }
  
    function checkCollision(bird, pipe) {
      let birdRect = bird.getBoundingClientRect();
      let pipeRect = pipe.getBoundingClientRect();
  
      return !(
        birdRect.top > pipeRect.bottom ||
        birdRect.bottom < pipeRect.top ||
        birdRect.right < pipeRect.left ||
        birdRect.left > pipeRect.right
      );
    }
  
    function endGame() {
      isGameOver = true;
      clearInterval(pipeInterval);
      if (soundEnabled) {
        gameOverSound.play();
      }
      finalScoreDisplay.textContent = `Score: ${score}`;
      gameOverScreen.style.display = 'block';
    }
  
    document.addEventListener('keydown', flap);
    gameContainer.addEventListener('touchstart', flap);
    restartButton.addEventListener('click', startGame);
    menuButton.addEventListener('click', () => {
      gameOverScreen.style.display = 'none';
      gameContainer.style.display = 'none';
      menuContainer.style.display = 'block';
    });
  
    menuContainer.style.display = 'block';
    gameContainer.style.display = 'none';
  });
  