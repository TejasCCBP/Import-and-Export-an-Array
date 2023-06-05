const express = require("express");
const path = require("path");

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initilizeDBAndServer = async () => {
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3009, () => {
            console.log("Server Running at http://localhost:3009/");
        });
    }   catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};
initializeDBAndServer();
const convertDBObjectToResponseObject = (dbObject) => {
    return {
        playerId: dbObject.player_id,
        playerName: dbObject.player_name,
        jerseyNumber: dbObject.jersey_number,
        role: dbObject.role,
    };
};
//Returns a list of all players in the team
app.get("/players/", async (request, response) => {
    const getCricketQuery = 
    `SELECT 
    *
    FROM 
    cricket_team;`;
    const cricketArray = await db.all(getCricketQuery);
    response.send(
        cricketArray.map((eachPlayer) => 
        convertDBObjectToResponseObject(eachPlayer)
        )
    );
});
//Create a new player in the (database). player_id is auto-incremented
app.post("/player/", async (request, response) => {
    const playerDetails = request.body
    const {playerDetails, jerseyNumber, role} = playerDetails;
    const addPlayerQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES
    (
    `${playerName}`,
    `${jerseyNumber}`,
    `${role}`);`;
    const dbResponse = await db.run(addPlayerQuery);
    response.send("Player Added to Team");

});
app.get("/player/:playerId/", async (request, response) => {
    const {playerId} = request.params;
    const getPlayerQuery =`
    SELECT 
    * 
    cricket_id
    WHERE 
    player_id = ${playerId};`;
    const player = await db.get(getPlayerQuery);
    response.send(convertDBObjectToResponseObject(player));
});
app.put("/players/:playerId", async(request, response) => {
    const {playerId} = request.params;
    const playerDetails = request.body;
    const {playerName, jerseyNumber, role} = playerDetails;
    const updatePlayerQuery = `
    UPDATE
    cricket_team 
    SET 
    player_name= `${playerName}`,
    jersey_number = ${jerseyNumber},
    role = `${role}`
    WHERE 
    player_id = ${playerId};`;
    await db.run(updatePlayerQuery);
    response.send("player Details Updated");
});

app.delete("/player/:playerId", async (request, response) => {
    const {playerId} = request.params;
    const deletePlayerQuery = `
    DELETE FROM 
    cricket_team
    WHERE
    player_id = ${playerId};`;
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
});

module.exports = app;