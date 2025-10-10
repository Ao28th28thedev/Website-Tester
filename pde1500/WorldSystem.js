// WorldSystem.js

const World = require("./World"); // Ensure World class is imported

class WorldSystem {
    constructor(world) {
        this.world = world; // Store the World instance this system manages
        // Map: userId -> { socket (Socket.IO instance), wizardData, currentZone, worldName, pvpOpponentId (if matched), x, y }
        this.connectedPlayers = new Map(); // To manage Socket.IO clients for this world
        this.world.playerCount = 0; // Initialize player count for this world system

        // ⭐ NEW: PvP Matchmaking Queue and Active Matches ⭐
        this.pvpMatchmakingQueue = new Map();
        this.activePvpMatches = new Map(); 
        let nextBattleId = 1; 

        console.log(`🚀 WorldSystem: Initializing for world \"${this.world.name}\" (Path: ${this.world.path})`);
    }

    /**
     * Handles a new Socket.IO connection for a client joining this world.
     * @param {SocketIO.Socket} socket - The Socket.IO socket instance for the client.
     */
    handleConnection(socket) {
        // Socket.IO's handshake.query provides access to URL query parameters
        const userId = socket.handshake.query.userID;
        const authKey = socket.handshake.query.authKey;
        const zone = socket.handshake.query.zone;
        
        // --- Authentication & Validation ---
        if (!userId || !authKey || userId === 'FALLBACK_USERID_MISSING') {
            console.error(`❌ Connection rejected: Missing credentials or using fallbacks. UserID: ${userId}`);
            // Send failure and disconnect to prevent hanging
            socket.emit("authFailure", { message: "Invalid credentials or missing user ID." });
            socket.disconnect(true);
            return;
        }

        if (this.connectedPlayers.has(userId)) {
            console.warn(`User ${userId} already connected. Kicking old connection.`);
            this.connectedPlayers.get(userId).socket.disconnect(true);
        }

        // --- Player Initialization ---
        this.world.playerCount++;
        // Get the mock wizard data for the specific world/zone
        const wizardData = this.world._getMockWizardData(userId, zone); 

        const playerEntry = {
            socket: socket,
            wizardData: wizardData,
            currentZone: zone,
            worldName: this.world.name,
            pvpOpponentId: null,
            // Add initial position (mock starting at 50,50 for simplicity)
            x: 50,
            y: 50 
        };

        this.connectedPlayers.set(userId, playerEntry);
        console.log(`✅ User ${userId} connected to ${this.world.name}/${zone}. Total players: ${this.world.playerCount}`);

        // --- Core Game Flow: Send Initial State to New Player (CRITICAL) ---
        
        // 1. Send the player's own data back to confirm authentication/join (e.g., 'authSuccess')
        socket.emit("authSuccess", {
            userID: userId,
            wizard: wizardData.wizard,
            // Add any other crucial initial data
        });

        // 2. Send the list of existing players to the new player
        const otherPlayers = [];
        this.connectedPlayers.forEach((p, id) => {
            if (id !== userId) {
                otherPlayers.push(p.wizardData);
            }
        });
        
        // The client needs to know who else is here to render them.
        socket.emit("playersInWorld", { players: otherPlayers });
        console.log(`Sent ${otherPlayers.length} existing player records to ${userId}.`);


        // 3. Broadcast the new player's data to all other existing players
        // This makes the new player appear on others' screens.
        socket.broadcast.to(this.world.path).emit("playerJoined", {
            userID: userId,
            wizard: wizardData.wizard,
            zone: zone,
            x: playerEntry.x,
            y: playerEntry.y
        });
        console.log(`Broadcast 'playerJoined' for ${userId}.`);


        // --- Listeners for Game Events (Movement, Chat, etc.) ---
        
        socket.on("move", (data) => {
            // Update player position
            playerEntry.x = data.x;
            playerEntry.y = data.y;
            playerEntry.currentZone = data.zone;

            // Broadcast the movement to all other players in the world
            socket.broadcast.to(this.world.path).emit("playerMoved", {
                userID: userId,
                x: data.x,
                y: data.y,
                zone: data.zone,
                time: Date.now()
            });
        });

        socket.on("chat", (data) => {
            console.log(`[CHAT] ${userId}: ${data.message}`);
            // Broadcast the chat message to all players in the world
            this.world.namespace.emit("chatMessage", { // Use the namespace to broadcast to all
                userID: userId,
                message: data.message,
                time: Date.now()
            });
        });
        
        // Handle explicit request to join a zone/world (in case client tries this later)
        socket.on("joinWorld", (data) => {
            // Since they are already connected, this is usually a zone change
            console.log(`User ${userId} requested to join zone: ${data.zoneId}`);
            // We would implement zone change logic here
        });
        

        // --- Disconnect Handler ---
        socket.on("disconnect", (reason) => {
            console.log(`User ${userId} disconnected from ${this.world.name}. Reason: ${reason}`);
            this.handlePlayerLeavePvp(userId); // Handle PvP cleanup

            this.connectedPlayers.delete(userId);
            this.world.playerCount--;

            // Tell everyone else the player left
            socket.broadcast.to(this.world.path).emit("playerLeft", { userID: userId, reason: reason });
            console.log(`Current players in ${this.world.name}: ${this.world.playerCount}`);
        });

        socket.on("error", (error) => {
            console.error(`Socket.IO error for user ${userId} in world ${this.world.id}:`, error);
        });
    }

    // ... (rest of WorldSystem class methods remain the same, including matchmaking) ...
}

module.exports = WorldSystem;
