// server.js - Node.js + Express server for multiplayer game worlds and Socket.IO

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io"); // Using socket.io

// Custom server-side modules
const World = require("./World");
const WorldSystem = require("./WorldSystem");

// --- Server Setup ---
const app = express();
const PORT = process.env.PORT || 10000;
const server = http.createServer(app);

// Global variable to hold the WorldSystem instance so HTTP routes can access connected players.
let worldSystem;

// Middleware setup
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // CRITICAL: Middleware to parse JSON request bodies

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ⭐ Socket.IO Server Setup ⭐
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development.
        methods: ["GET", "POST"]
    }
});

// ⭐ NEW: Handle client connections attempting to connect to the root namespace (/) ⭐
// This catches the client's current broken behavior (no world path)
io.on('connection', (socket) => {
    const query = socket.handshake.query;
    const isFallback = query.worldId === 'FALLBACK_WORLDID_MISSING';

    if (isFallback) {
        console.warn(`\n[SOCKET.IO WARNING] Client connected to root (/) using FALLBACK credentials.`);
        console.warn(`Connection Query: ${JSON.stringify(query)}`);
        console.warn(`This client needs to send an explicit 'joinWorld' or 'auth' event next.`);
    } else {
        console.log(`\n[SOCKET.IO INFO] Client connected to root (/) with valid query params. Treating as a generic connection.`);
    }

    // Add a simple disconnect handler for generic connections
    socket.on('disconnect', (reason) => {
        console.log(`[SOCKET.IO INFO] Root connection disconnected. Reason: ${reason}`);
    });
});

// --- API Endpoints ---

// ⭐ HTTP GET for World List ⭐
app.get("/game-api/v2/worlds", (req, res) => {
    console.log(`\n--- World List GET Request ---`);
    const worldsData = World.allWorlds.map(w => ({
        id: w.id,
        name: w.name,
        path: w.path,
        icon: w.icon,
        tag: w.tag,
        maxPlayers: w.maxPlayers,
        playerCount: worldSystem && worldSystem.world.id === w.id ? worldSystem.world.playerCount : 0,
        full: w.full
    }));

    res.status(200).json(worldsData);
    console.log(`Responded with ${worldsData.length} worlds.`);
});

// ⭐ HTTP GET for PvP and Class Leaderboards ⭐
app.get(["/leaderboard/:type/:id?", "/game-api/v1/leaderboard/:type/:id?"], (req, res) => {
    const { type, id } = req.params;
    const { page = 0, limit = 30 } = req.query;

    console.log(`\n--- Leaderboard GET Request ---`);
    console.log(`Fetching ${type} leaderboard (ID: ${id || 'N/A'}) Page: ${page}, Limit: ${limit}`);

    // Generate static mock data (as done previously)
    const mockWizards = Array.from({ length: 30 }, (_, i) => ({
        _id: `bot_wizard_${1000 + i}`,
        userID: `bot_user_${1000 + i}`,
        pvpScore: 500 + Math.floor(Math.random() * 500),
        pvpStars: Math.floor(Math.random() * 5),
        name: `BotWizard ${i + 1}`,
        // ... (Other properties) ...
    }));

    let allPlayers = [...mockWizards];
    let connectedPlayersList = [];

    // Add currently connected players (if worldSystem is initialized)
    if (worldSystem) {
        connectedPlayersList = Array.from(worldSystem.connectedPlayers.values()).map(p => ({
            _id: p.wizardData.wizard._id,
            userID: p.wizardData.wizard.userID,
            pvpScore: p.wizardData.wizard.pvpScore || 1500, // Use mock score if missing
            pvpStars: p.wizardData.wizard.pvpStars || 3,    // Use mock stars if missing
            name: p.wizardData.wizard.name,
            // Add other necessary properties for the client
        }));
        allPlayers = [...connectedPlayersList, ...mockWizards];
    }

    allPlayers.sort((a, b) => b.pvpScore - a.pvpScore);

    const playerRank = {
        rank: allPlayers.findIndex(p => p.userID === req.query.userID) + 1 || 0,
        score: parseInt(req.query.player_score) || 0,
        stars: parseInt(req.query.player_stars) || 0
    };

    const start = parseInt(page) * parseInt(limit);
    const end = start + parseInt(limit);
    const leaderboardList = allPlayers.slice(start, end);

    res.status(200).json({
        leaderboard: {
            leaderboard: leaderboardList,
            playerRank: playerRank
        }
    });
});

// ⭐ HTTP POST for game events (for tracking/telemetry) ⭐
app.post("/game-api/v1/game-events", (req, res) => {
    console.log(`\n--- Game Event POST Request ---`);
    const userId = req.body.userID || req.body.userId || req.body.id || req.body.authKey || "N/A";
    const eventType = req.body.event || "Unknown";
    console.log(`[GAME EVENT] Type: ${eventType}, User: ${userId}. Event from IP: ${req.ip}`);
    console.log(`Request Body (Game Event Data):`, JSON.stringify(req.body, null, 2));
    res.status(200).json({ status: "received", message: "Game event logged." });
    console.log(`Responded to game event POST.`);
});


// ⭐ HTTP POST for matchmaking (e.g., startMatchmaking) ⭐
app.post("/game-api/v1/matchmaking-api/begin", (req, res) => {
    console.log(`\n--- Matchmaking POST Request ---`);
    console.log(`Received POST request for /game-api/v1/matchmaking-api/begin from IP: ${req.ip}`);
    console.log(`Matchmaking Data:`, JSON.stringify(req.body, null, 2));

    // Simulate matchmaking logic here
    res.status(200).json({ status: "success", message: "Matchmaking request received." });
    console.log(`Responded to matchmaking POST.`);
});

// ⭐ HTTP POST for Login/Authentication (Mock) ⭐
app.post("/api/user/authenticate", (req, res) => {
    // Mock user authentication
    const { username, password, authMethod } = req.body;

    const mockUserId = `user_${authMethod || 'mock'}-${crypto.randomUUID()}`;
    const mockToken = `auth_token_${crypto.randomUUID()}`;

    console.log(`\n--- Auth POST Request ---`);
    console.log(`Attempting login for user: ${username || 'N/A'} via method: ${authMethod || 'Basic'}`);

    if (authMethod === 'Google') {
        console.log(`[SERVER][LOG] ⭐ User successfully logged in via Google. Generated UserID: ${mockUserId}`);
    } else {
        console.log(`[SERVER][LOG] User successfully logged in. Generated UserID: ${mockUserId}`);
    }

    res.status(200).json({
        status: "success",
        userID: mockUserId,
        uniqueKey: mockToken,
        message: "Authentication successful."
    });
});

// --- Server Startup ---
server.listen(PORT, () => {
    console.log(`\n--- Server Startup ---`);
    console.log(`✅ Server is listening on port ${PORT}...`);
    console.log(`🌐 HTTP endpoints for world list, status, game events, and matchmaking are online.`);

    // Initialize the World and WorldSystem
    const fireplaneWorld = World.allWorlds.find(w => w.id === "fireplane");
    if (!fireplaneWorld) {
        throw new Error("Fireplane world definition not found!");
    }
    worldSystem = new WorldSystem(fireplaneWorld); // Assign to global variable

    console.log(`🚀 Socket.IO server is online and ready for game world: ${fireplaneWorld.name}`);

    // --- Start Socket.IO handling for the correct world namespace ---
    // This is the correct path: /worlds/fireplane
    const worldNamespace = io.of(fireplaneWorld.path);
    worldNamespace.on('connection', (socket) => {
        worldSystem.handleConnection(socket);
    });
});
