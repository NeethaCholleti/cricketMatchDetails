const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
module.exports = app;

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.match,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      player_details
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      player_details
    WHERE
      player_id = ${playerId};`;
  const playersIdArray = await db.get(getPlayerQuery);
  //console.log(player);
  response.send({
    playerId: playersIdArray.player_id,
    playerName: playersIdArray.player_name,
  });
});

//API3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  //console.log(playerDetails);
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
    UPDATE
      player_details
    SET
       player_name ='${playerName}'
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
//API4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
      match_id = ${matchId};`;
  const matchArray = await db.get(getMatchQuery);
  //console.log(matchArray);
  response.send({
    matchId: matchArray.match_id,
    match: matchArray.match,
    year: matchArray.year,
  });
});

//API 5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT
      *
    FROM
    player_match_score
     Natural Join match_details
    WHERE
      player_id = ${playerId};`;
  const playerMatchArray = await db.all(getPlayerMatchesQuery);
  //console.log(matchArray);
  response.send(
    playerMatchArray.map((eachMatch) =>
      convertDbObjectToResponseObject(eachMatch)
    )
  );
});

//API 6
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
	    SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
  const playerMatchArray = await db.all(getMatchPlayersQuery);
  console.log(playerMatchArray);
  response.send(
    playerMatchArray.map((eachMatch) =>
      convertDbObjectToResponseObject(eachMatch)
    )
  );
});

//API7
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const playerMatchArray = await db.get(getMatchPlayersQuery);
  console.log(playerMatchArray);
  response.send(
    playerMatchArray.map((eachMatch) =>
      convertDbObjectToResponseObject(eachMatch)
    )
  );
});
