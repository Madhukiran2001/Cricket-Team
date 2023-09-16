const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3017, () => {
      console.log("Server Running at http://localhost:3017/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
intializeDBAndServer();
const convertDBobjectToResponse = (dbOject) => {
  return {
    playerId: dbOject.player_id,
    playerName: dbOject.player_name,
    jerseyNumber: dbOject.jersey_number,
    role: dbOject.role,
  };
};
// Returns a list of all players in the team
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    * FROM cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachplayer) => convertDBobjectToResponse(eachplayer))
  );
});

// Creates a new player in the team (database). player is auto-inremented
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
    cricket_team(player_name,jersey_number,role)
    VALUES (
        ${playerName},
        ${jerseyNumber},
        ${role});`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

// Returns a player based on player_id
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQurey = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerQurey);
  response.send(convertDBobjectToResponse(player));
});

// Updates the details of the player in the team (database) based on  the playerID
app.put("/players/:playerId", async (request, response) => {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const {playerName, jerseyNumber, role} = playerDetails;
    const updatePlayerQuery = `
    UPDATE 
    cricket_team
    SET 
    player_name = `${playerName}`,
    jersey_number = ${jerseyNumber},
    role = `${role}`
    WHERE 
    player_id = ${playerId};`;
    await db.run(updatePlayerQuery);
    response.send("Player Details Uploaded");
})

// Deletes a player from the team (database) based on the playerID
app.delete("/players/:playerId", async (request,response) => {
    const {playerId} = request.params;
    const deletePlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE player_id = ${playerId};`;
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
});

module.exports = app;