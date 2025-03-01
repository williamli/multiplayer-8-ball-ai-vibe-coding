class NetworkManager {
  constructor(game) {
    this.game = game;
    this.peer = null;
    this.connection = null;
    this.peerId = null;
    this.isHost = false;
    this.isConnected = false;
  }

  // Initialize PeerJS for networking
  async initializePeerJS() {
    try {
      this.peer = new Peer();

      return new Promise((resolve, reject) => {
        this.peer.on('open', (id) => {
          console.log('My peer ID is: ' + id);
          this.peerId = id;
          resolve(id);
        });

        this.peer.on('error', (error) => {
          console.error('PeerJS error:', error);
          reject(error);
        });

        this.peer.on('connection', (conn) => {
          this.handleIncomingConnection(conn);
        });
      });
    } catch (error) {
      console.error('Failed to initialize PeerJS:', error);
      throw error;
    }
  }

  // Handle an incoming connection as the host
  handleIncomingConnection(conn) {
    console.log('Incoming connection from:', conn.peer);

    if (this.isConnected) {
      console.log('Already connected to a peer, rejecting connection');
      conn.close();
      return;
    }

    this.connection = conn;
    this.isHost = true;
    this.isConnected = true;

    this.setupConnectionHandlers();

    // Update game state
    this.game.myPlayerNumber = 1;
    this.game.opponentConnected = true;
    this.game.isMyTurn = true;

    // Update UI
    this.game.logMessage('Player 2 has joined! You are Player 1 (red).');
    this.game.updateGameInfo();

    // Hide connection controls
    document.getElementById('connectionInfo').classList.add('hidden');

    // Show game ID
    document.getElementById('gameIdDisplay').classList.remove('hidden');
    document.getElementById('currentGameId').textContent = this.peerId;

    // Send initial game state
    setTimeout(() => {
      this.game.syncGameStateToRemote();
    }, 500);
  }

  // Connect to another peer as a client
  connectToPeer(peerId) {
    if (this.isConnected) {
      console.log('Already connected to a peer');
      return;
    }

    try {
      console.log('Connecting to peer:', peerId);
      const conn = this.peer.connect(peerId);

      conn.on('open', () => {
        console.log('Connected to peer:', peerId);
        this.connection = conn;
        this.isHost = false;
        this.isConnected = true;

        this.setupConnectionHandlers();

        // Update game state
        this.game.myPlayerNumber = 2;
        this.game.opponentConnected = true;
        this.game.isMyTurn = false;

        // Update UI
        this.game.logMessage('Connected to Player 1! You are Player 2 (blue).');
        this.game.updateGameInfo();

        // Hide connection controls
        document.getElementById('connectionInfo').classList.add('hidden');

        // Show game ID
        document.getElementById('gameIdDisplay').classList.remove('hidden');
        document.getElementById('currentGameId').textContent = peerId;
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
        this.game.logMessage('Failed to connect: ' + error.message);
      });
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      this.game.logMessage('Failed to connect: ' + error.message);
    }
  }

  // Set up event handlers for the connection
  setupConnectionHandlers() {
    this.connection.on('data', (data) => {
      console.log('Received data:', data);
      this.game.handleNetworkMessage(data);
    });

    this.connection.on('close', () => {
      console.log('Connection closed');
      this.handleDisconnect();
    });

    this.connection.on('error', (error) => {
      console.error('Connection error:', error);
      this.handleDisconnect();
    });
  }

  // Handle a disconnection
  handleDisconnect() {
    this.connection = null;
    this.isConnected = false;

    // Update game state
    this.game.opponentConnected = false;

    // Update UI
    this.game.logMessage('Opponent disconnected.');
    this.game.updateGameInfo();

    // Show connection controls
    document.getElementById('connectionInfo').classList.remove('hidden');
  }

  // Send data to the connected peer
  sendData(data) {
    if (this.connection && this.isConnected) {
      this.connection.send(data);
    }
  }

  // Copy the game ID to clipboard
  async copyGameId() {
    if (!this.peerId) return;

    const textArea = document.createElement('textarea');
    textArea.value = this.peerId;
    document.body.appendChild(textArea);

    try {
      textArea.select();
      const successful = document.execCommand('copy');

      // Show appropriate message
      if (successful) {
        this.game.logMessage(
          'Game ID copied to clipboard! Share it with a friend.'
        );
      } else {
        this.game.logMessage('Please select and copy the Game ID manually.');
        // Highlight the ID to make manual copying easier
        const idElement = document.getElementById('hostId');
        idElement.style.backgroundColor = 'rgba(93, 92, 222, 0.4)';
        setTimeout(() => {
          idElement.style.backgroundColor = 'rgba(93, 92, 222, 0.1)';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      this.game.logMessage('Please select and copy the Game ID manually.');
    } finally {
      // Clean up
      document.body.removeChild(textArea);
    }
  }
}
