// Make sure you included Howler.js in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>

// Setup PIXI app
const app = new PIXI.Application({
    view: document.getElementById('game'),
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000,
    antialias: true
  });
  
  // Load sounds with Howler.js
  
  const bgMusic = new Howl({
    src: ['https://cdn.pixabay.com/download/audio/2022/05/25/audio_ef7ec08ce4.mp3?filename=upbeat-dark-knight-11207.mp3'],
    loop: true,
    volume: 1.0,
  });
  
  const beepSound = new Howl({
    src: ['https://freesound.org/data/previews/341/341695_62482-lq.mp3'], 
    volume: 0.7,
  });
  
  // Play music on first key press (to allow browser autoplay policy)
  window.addEventListener('keydown', () => {
    if (!bgMusic.playing()) {
      bgMusic.play();
    }
  });
  
  // Lanes setup
  const lanes = [
    app.screen.width / 2 - 200,
    app.screen.width / 2,
    app.screen.width / 2 + 200
  ];
  
  // Background grid
  const background = new PIXI.Graphics();
  app.stage.addChild(background);
  
  // Lane lines
  const laneLines = new PIXI.Graphics();
  app.stage.addChild(laneLines);
  
  // Player circle
  const player = new PIXI.Graphics();
  player.beginFill(0x00ffff);
  player.drawCircle(0, 0, 30);
  player.endFill();
  player.x = lanes[1];
  player.y = app.screen.height - 100;
  app.stage.addChild(player);
  
  let currentLane = 1;
  
  // Score text
  const scoreStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fill: '#00ffff'
  });
  const scoreText = new PIXI.Text('Score: 0', scoreStyle);
  scoreText.x = 20;
  scoreText.y = 20;
  app.stage.addChild(scoreText);
  
  // Controls
  window.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' && currentLane > 0) currentLane--;
    if (e.key === 'ArrowRight' && currentLane < 2) currentLane++;
  });
  
  // Obstacles
  let obstacles = [];
  let spawnTimer = 0;
  
  // Game state
  let score = 0;
  let gameOver = false;
  let endText = null;
  let playAgainButton = null;
  let difficulty = 1;
  
  // Background offset for grid animation
  let backgroundOffset = 0;
  
  // Game loop
  app.ticker.add(delta => {
    if (gameOver) return;
  
    // Difficulty ramps up
    difficulty += 0.0005 * delta;
  
    // Smooth player lane movement
    player.x += (lanes[currentLane] - player.x) * 0.2;
  
    // Draw grid background
    background.clear();
    background.lineStyle(2, 0x00ffff, 0.2);
    backgroundOffset += 5 * delta;
    for (let i = -50; i < app.screen.height; i += 50) {
      background.moveTo(0, i + (backgroundOffset % 50));
      background.lineTo(app.screen.width, i + (backgroundOffset % 50));
    }
  
    // Draw lane lines
    laneLines.clear();
    laneLines.lineStyle(4, 0x00ffff, 0.3);
    lanes.forEach(x => {
      laneLines.moveTo(x, 0);
      laneLines.lineTo(x, app.screen.height);
    });
  
    // Spawn obstacles faster with difficulty
    spawnTimer -= delta;
    if (spawnTimer <= 0) {
      const obs = new PIXI.Graphics();
      obs.beginFill(0xff00ff);
      obs.drawRect(-30, -30, 60, 60);
      obs.endFill();
      const laneIndex = Math.floor(Math.random() * 3);
      obs.x = lanes[laneIndex];
      obs.y = -50;
      obs.laneIndex = laneIndex;
      app.stage.addChild(obs);
      obstacles.push(obs);
      spawnTimer = (30 + Math.random() * 30) / difficulty;
    }
  
    // Move obstacles and check collisions
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.y += 10 * delta * difficulty;
  
      // Collision check
      const dx = player.x - obs.x;
      const dy = player.y - obs.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 50) {
        endGame();
      }
  
      // Remove off-screen obstacles & update score
      if (obs.y > app.screen.height + 50) {
        app.stage.removeChild(obs);
        obstacles.splice(i, 1);
        score++;
        scoreText.text = 'Score: ' + score;
      }
    }
  });
  
  // End game function
  function endGame() {
    gameOver = true;
    beepSound.play();
  
    // Show game over text
    endText = new PIXI.Text('GAME OVER', new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 80,
      fill: '#ff00ff',
      align: 'center'
    }));
    endText.anchor.set(0.5);
    endText.x = app.screen.width / 2;
    endText.y = app.screen.height / 2 - 60;
    app.stage.addChild(endText);
  
    // Play again button
    playAgainButton = new PIXI.Text('Play Again', new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 40,
      fill: '#00ffff',
      align: 'center',
      fontWeight: 'bold'
    }));
    playAgainButton.anchor.set(0.5);
    playAgainButton.x = app.screen.width / 2;
    playAgainButton.y = app.screen.height / 2 + 40;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
  
    playAgainButton.on('pointerdown', () => {
      beepSound.play();
      restartGame();
    });
  
    app.stage.addChild(playAgainButton);
  }
  
  // Restart game
  function restartGame() {
    gameOver = false;
    score = 0;
    scoreText.text = 'Score: 0';
    currentLane = 1;
    player.x = lanes[1];
    difficulty = 1;
  
    obstacles.forEach(obs => app.stage.removeChild(obs));
    obstacles = [];
    spawnTimer = 0;
  
    app.stage.removeChild(endText);
    app.stage.removeChild(playAgainButton);
  }
  