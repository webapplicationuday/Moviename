const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

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

const convertDbObjectToResponseObjectOfMovie = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
 SELECT
 *
 FROM
 movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachItem) =>
      convertDbObjectToResponseObjectOfMovie(eachItem)
    )
  );
});

// add movie

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie ( 
    director_id,
    movie_name,
    lead_actor)
    VALUES
      (
         ${directorId},
         '${movieName}',
         '${leadActor}'
         
      );`;

  const dbResponse = await db.run(addMovieQuery);
  const addId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

// get one movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getOneMovieQuery = `
    SELECT
      *
    FROM
    movie 
    WHERE
      movie_id = ${movieId};`;
  const movieObject = await db.get(getOneMovieQuery);
  response.send(convertDbObjectToResponseObjectOfMovie(movieObject));
});

// update movie

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
     
    WHERE
      movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// Delete movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDbObjectToResponseObjectOfDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// get directors

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
 SELECT
 *
 FROM
 director;`;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachItem) =>
      convertDbObjectToResponseObjectOfDirector(eachItem)
    )
  );
});

// get one directors

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getOneMovieQuery = `
    SELECT
      *
    FROM
    movie 
    WHERE
      movie_id = ${movieId};`;
  const movieObject = await db.get(getOneMovieQuery);
  response.send(convertDbObjectToResponseObjectOfMovie(movieObject));
});
