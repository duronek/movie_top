var express = require('express');
var router = express.Router();
const request = require('request');
const passport = require('passport');

const apiKey = "1fb720b97cc13e580c2c35e1138f90f8";
const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}&language=pl`;

function GetLastMovies() {
  return new Promise((resolve, reject) => {
    request.get(nowPlayingUrl, { timeout: 1500 }, (error, response, moviData) => {
      if (error) {
        console.log("============The Error=================");
        console.log(error);
        reject(error);
      } else {
        console.log("============The Response=================");
        const statusCode = response && response.statusCode; // Print the response status code if a response was received
        console.log('statusCode:', statusCode);
        if (statusCode === 200) {
          let moviesJson = JSON.parse(moviData);
          resolve(moviesJson);
        } else {
          return null;
        }
      }
    });
  });
}

function GetMovieDetails(movieId) {
  return new Promise((resolve, reject) => {
    const movieDetailsUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}&language=pl`;
    request.get(movieDetailsUrl, { timeout: 1500 }, (error, response, moviData) => {
      if (error) {
        console.log("============The Error=================");
        console.log(error);
        reject(error);
      } else {
        console.log("============The Response=================");
        const statusCode = response && response.statusCode; // Print the response status code if a response was received
        console.log('statusCode:', statusCode);
        if (statusCode === 200) {
          let movieJson = JSON.parse(moviData);
          resolve(movieJson);
        } else {
          return null;
        }
      }
    });
  });
}

function GetSerachMovie(query) {
  let url = `${apiBaseUrl}/search/movie?api_key=${apiKey}&language=pl&page=1&include_adult=true&query=${query}`;

  return new Promise((resolve, reject) => {
    request.get(url, { timeout: 1500 }, (error, response, moviData) => {
      if (error) {
        console.log("============The Error=================");
        console.log(error);
        reject(error);
      } else {
        console.log("============The Response=================");
        const statusCode = response && response.statusCode; // Print the response status code if a response was received
        console.log('statusCode:', statusCode);
        if (statusCode === 200) {
          let moviesJson = JSON.parse(moviData);
          resolve(moviesJson);
        } else {
          return null;
        }
      }
    });
  });
}

function GetSerachActors(query) {
  let url = `${apiBaseUrl}/search/person?api_key=${apiKey}&language=pl&page=1&include_adult=true&query=${query}`;

  return new Promise((resolve, reject) => {
    request.get(url, { timeout: 1500 }, (error, response, personData) => {
      if (error) {
        console.log("============The Error=================");
        console.log(error);
        reject(error);
      } else {
        console.log("============The Response=================");
        const statusCode = response && response.statusCode; // Print the response status code if a response was received
        console.log('statusCode:', statusCode);
        if (statusCode === 200) {
          let personJson = JSON.parse(personData);
          resolve(personJson);
        } else {
          return null;
        }
      }
    });
  });
}

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log('User info !!!!');
  console.log('--->req.user data: ', req.user);
  
  GetLastMovies()
    .then((moviesJson) => {
      res.render('index', {
        movies: moviesJson.results,
        title: 'Nowosci filmowe'
      });
    })
    .catch((reason) => {
      console.log("Cos poszlo nie tak: ", reason);
      res.json({
        msg: `Cos poszlo nie tak: ${reason}`
      })
    });
});

router.get('/favorites', (req, res) => {
  //res.send("Ulubione");
  res.json(req.user.displayName);
})

router.get('/single_movie/:movieId', function (req, res, next) {
  let movieId = Number(req.params.movieId);
  if ((movieId) && (typeof movieId === 'number')) {

    GetMovieDetails(movieId)
      .then((movieJson) => {
        res.render('single_movie', {
          movie: movieJson
        });
      })
      .catch((reason) => {
        console.log("Cos poszlo nie tak: ", reason);
        res.json({
          msg: `Cos poszlo nie tak: ${reason}`
        })
      });
  } else {
    res.send("Nieznany film ;-(");
  }
});

router.get('/login', passport.authenticate('github'));

router.get('/auth', passport.authenticate('github', { 
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true  
}));

router.post('/search', (req, res, next) => {
  console.dir(req.query);
  console.log(req.body.cat);
  console.log(req.body.query);

  let functionQuery;
  switch (req.body.cat) {
    case 'movie': functionQuery = GetSerachMovie; break;
    case 'person': functionQuery = GetSerachActors; break;
  }

  functionQuery(req.body.query)
    .then((moviesJson) => {
      res.render('index', {
        movies: moviesJson.results,
        title: 'Znalezione filmy'
      });
    })
    .catch((reason) => {
      console.log("Cos poszlo nie tak: ", reason);
      res.json({
        msg: `Cos poszlo nie tak: ${reason}`
      })
    });
});



module.exports = router;
