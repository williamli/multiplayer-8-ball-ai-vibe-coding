class UIManager {
  constructor(game) {
    this.game = game;
    this.isDarkMode = false;
  }

  // Initialize UI elements and event listeners
  initialize() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Permission screen
    const grantAccessBtn = document.getElementById('grantAccessBtn');
    if (grantAccessBtn) {
      grantAccessBtn.addEventListener('click', () => {
        // Show loading spinner
        grantAccessBtn.disabled = true;
        document.getElementById('permissionStatus').classList.remove('hidden');
        document.getElementById('permissionError').classList.add('hidden');

        // Call the global requestNetworkPermission function
        requestNetworkPermission();
      });
    }

    // Connection buttons
    const createGameBtn = document.getElementById('createGameBtn');
    if (createGameBtn) {
      createGameBtn.addEventListener('click', () => this.game.createGame());
    }

    const joinGameBtn = document.getElementById('joinGameBtn');
    if (joinGameBtn) {
      joinGameBtn.addEventListener('click', () => this.showJoinForm());
    }

    const copyIdBtn = document.getElementById('copyIdBtn');
    if (copyIdBtn) {
      copyIdBtn.addEventListener('click', () => this.game.network.copyGameId());
    }

    // Chat functionality
    const sendChatBtn = document.getElementById('sendChatBtn');
    if (sendChatBtn) {
      sendChatBtn.addEventListener('click', () => this.game.sendChatMessage());
    }

    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.game.sendChatMessage();
        }
      });
    }

    // Check for stored theme preference
    this.loadThemePreference();
  }

  // Toggle between light and dark themes
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }

  // Load theme preference from localStorage
  loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }

  // Show the join game form
  showJoinForm() {
    const connectionInfo = document.getElementById('connectionInfo');

    // Check if form already exists
    if (document.getElementById('joinForm')) {
      return;
    }

    // Create join form
    const joinForm = document.createElement('div');
    joinForm.id = 'joinForm';
    joinForm.innerHTML = `
            <p>Enter the Game ID shared by your friend:</p>
            <div class="flex mt-2">
                <input type="text" id="joinIdInput" placeholder="Game ID" class="mr-2">
                <button id="connectBtn" class="game-button">Connect</button>
                <button id="cancelJoinBtn" class="game-button ml-2 bg-gray-500">Cancel</button>
            </div>
        `;

    connectionInfo.appendChild(joinForm);

    // Add event listeners
    document.getElementById('connectBtn').addEventListener('click', () => {
      const peerId = document.getElementById('joinIdInput').value.trim();
      if (peerId) {
        this.game.joinGame(peerId);
      }
    });

    document.getElementById('cancelJoinBtn').addEventListener('click', () => {
      connectionInfo.removeChild(joinForm);
    });

    // Focus input
    document.getElementById('joinIdInput').focus();
  }

  // Update the game info display
  updateGameInfo() {
    // Update turn indicator
    const turnIndicator = document.getElementById('turnIndicator');

    if (!this.game.opponentConnected) {
      turnIndicator.textContent = 'Waiting for opponent...';
    } else if (this.game.isGameOver) {
      const winner =
        this.game.winner === this.game.myPlayerNumber ? 'You' : 'Opponent';
      turnIndicator.textContent = `Game Over! ${winner} won!`;
    } else if (this.game.ballsMoving) {
      turnIndicator.textContent = 'Balls in motion...';
    } else if (this.game.isMyTurn) {
      turnIndicator.textContent = 'Your turn';
    } else {
      turnIndicator.textContent = "Opponent's turn";
    }

    // Update player indicators
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');

    player1.classList.toggle('active', this.game.currentPlayer === 1);
    player2.classList.toggle('active', this.game.currentPlayer === 2);

    // Update ball type indicators if assigned
    if (this.game.player1BallType) {
      document.getElementById('player1Group').classList.remove('hidden');
      document.getElementById('player2Group').classList.remove('hidden');

      const player1BallType = document.getElementById('player1BallType');
      const player2BallType = document.getElementById('player2BallType');

      player1BallType.className = 'ball-indicator';
      player2BallType.className = 'ball-indicator';

      if (this.game.player1BallType === 'solid') {
        player1BallType.classList.add('solid');
        player2BallType.classList.add('stripe');
      } else {
        player1BallType.classList.add('stripe');
        player2BallType.classList.add('solid');
      }
    }

    // Update pocketed balls display
    this.updatePocketedBalls();
  }

  // Update the display of pocketed balls
  updatePocketedBalls() {
    const player1Balls = document.getElementById('player1Balls');
    const player2Balls = document.getElementById('player2Balls');

    // Clear existing balls
    player1Balls.innerHTML = '';
    player2Balls.innerHTML = '';

    // Add player 1 balls
    this.game.player1Balls.forEach((ballNumber) => {
      const ball = document.createElement('div');
      ball.className = 'racked-ball';
      ball.style.backgroundColor = this.getBallColor(ballNumber);
      player1Balls.appendChild(ball);
    });

    // Add player 2 balls
    this.game.player2Balls.forEach((ballNumber) => {
      const ball = document.createElement('div');
      ball.className = 'racked-ball';
      ball.style.backgroundColor = this.getBallColor(ballNumber);
      player2Balls.appendChild(ball);
    });
  }

  // Get the color for a ball based on its number
  getBallColor(number) {
    const colors = {
      1: '#FDD835', // Yellow
      2: '#1E88E5', // Blue
      3: '#E53935', // Red
      4: '#6A1B9A', // Purple
      5: '#FF8F00', // Orange
      6: '#2E7D32', // Green
      7: '#5D4037', // Brown
      8: '#000000', // Black
      9: '#FDD835', // Yellow stripe
      10: '#1E88E5', // Blue stripe
      11: '#E53935', // Red stripe
      12: '#6A1B9A', // Purple stripe
      13: '#FF8F00', // Orange stripe
      14: '#2E7D32', // Green stripe
      15: '#5D4037', // Brown stripe
    };

    return colors[number] || '#FFFFFF';
  }

  // Add a message to the game log
  logMessage(message) {
    const messageLog = document.getElementById('messageLog');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageLog.appendChild(messageElement);

    // Scroll to bottom
    messageLog.scrollTop = messageLog.scrollHeight;
  }

  // Add a message to the chat
  addChatMessage(message, isFromSelf) {
    const chatMessages = document.getElementById('chatMessages');

    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${
      isFromSelf ? 'self' : ''
    }`;

    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${
      isFromSelf ? 'message-self' : 'message-other'
    }`;
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);
    chatMessages.appendChild(messageContainer);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Show the permission screen
  showPermissionScreen() {
    document.getElementById('permissionScreen').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
  }

  // Show the game container
  showGameContainer() {
    document.getElementById('permissionScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
  }

  // Update the power meter display
  updatePowerMeter(power) {
    const powerLevel = document.getElementById('powerLevel');
    powerLevel.style.width = `${power * 100}%`;
  }
}
