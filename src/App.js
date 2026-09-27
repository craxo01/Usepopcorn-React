import { use, useEffect, useRef, useState } from "react";
import "./index.css";
import StarRating from "./starrating";
import useLocalstoragestate from "./useLocalstoragestate.js";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "2f200daf";

export default function App() {
  const [movies, setMovies] = useState("");
  const [errorsearch, setError] = useState("");
  const [query, setQuery] = useState("");
  const [load, setload] = useState(false);
  const [selectmovie, setselectmovie] = useState(null);
  const [watched, setWatched] = useLocalstoragestate([],"watched")
    
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovie() {
        try {
          setload(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal },
          );
          if (!res.ok)
            throw new Error("something went wrong with fetching movies");
          if (!query) {
            setMovies(query);
            throw new Error("Search the Movie");
          }
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setError("");
          setMovies(data.Search);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setload(false);
        }
      }
      fetchMovie();
      return function () {
        controller.abort();
      };
    },
    [query],
  );

  return (
    <>
      <Header movies={movies} query={query} setQuery={setQuery} />
      <Main
        movies={movies}
        errorsearch={errorsearch}
        load={load}
        selectmovie={selectmovie}
        setselectmovie={setselectmovie}
        watched={watched}
        setWatched={setWatched}
      />
    </>
  );
}
//////////////////////////////////////////////
function Header({ movies, query, setQuery }) {
  const inputEl=useRef(null)
  useEffect(function(){
    function callback(e){
      if (document.activeElement===inputEl.current)return
      if (e.code==="Enter") {
        inputEl.current.focus()
        setQuery('')
      }
    }
    document.addEventListener('keydown',callback)
    return function(){
      document.removeEventListener('keydown',callback)
    }
  },[setQuery])
  return (
    <nav className="nav-bar">
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    </nav>
  );
}
//////////////////////////////////////

function Main({ movies, errorsearch, load, selectmovie, setselectmovie,watched,setWatched }) {
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(true);
  console.log(watched)
  const avgImdbRating = average(watched.map((movie) => (movie.imdbRating)));
  const avgUserRating = average(watched.map((movie) => movie.ratingmovie));
  const avgRuntime = average(watched.map((movie) => movie.Runtime));

  return (
    <main className="main">
      <Leftside
        isOpen1={isOpen1}
        setIsOpen1={setIsOpen1}
        movies={movies}
        errorsearch={errorsearch}
        load={load}
        selectmovie={selectmovie}
        setselectmovie={setselectmovie}
      />
      <Rightside
        isOpen2={isOpen2}
        setIsOpen2={setIsOpen2}
        watched={watched}
        setWatched={setWatched}
        avgImdbRating={avgImdbRating}
        avgRuntime={avgRuntime}
        avgUserRating={avgUserRating}
        selectmovie={selectmovie}
        setselectmovie={setselectmovie}
      />
    </main>
  );
}
///////////////////
function Leftside({
  isOpen1,
  setIsOpen1,
  movies,
  errorsearch,
  load,
  selectmovie,
  setselectmovie,
}) {
  function handleselect(id) {
    setselectmovie(id === selectmovie ? null : id);
  }
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {!movies && !errorsearch && load && <p className="loader">Loading...</p>}
      {!movies && errorsearch && <p className="error">{errorsearch}</p>}
      {isOpen1 && movies && (
        <ul className="list list-movies">
          {movies?.map((movie) => (
            <li onClick={() => handleselect(movie.imdbID)} key={movie.imdbID}>
              <img src={movie.Poster} alt={`${movie.Title} poster`} />
              <h3>{movie.Title}</h3>
              <div>
                <p>
                  <span>🗓</span>
                  <span>{movie.Year}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

///////////////////
function MovieDetails({ selectmovie, setselectmovie, watched, setWatched }) {
  const [MovieDetail, setMovieDetail] = useState({});
  const [loadDetailmovie, setloadDetailmovie] = useState(false);
  const [ratingmovie, setratingmovie] = useState("");
  function CloseDetail() {
    setselectmovie(null);
  }
  const meraj = watched.some((item) => item.imdbID === selectmovie);
  const shima = watched.map((item) =>
    item.imdbID === selectmovie ? item.ratingmovie : "",
  );
  const {
    Title,
    Year,
    Poster,
    Runtime,
    imdbID,
    Plot,
    Released,
    Actors,
    Director,
    Genre,
    imdbRating,
  } = MovieDetail;
  useEffect(
    function () {
      async function getdetailmovie() {
        try {
          setloadDetailmovie(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&i=${selectmovie}`,
          );
          if (!res.ok) throw new Error("somthin was wrong in fetching data");
          const data = await res.json();
          setMovieDetail(data);
        } catch (err) {
          console.log(err.message);
        } finally {
          setloadDetailmovie(false);
        }
      }
      getdetailmovie();
    },
    [selectmovie],
  );
  function handlewatched(movie) {
    const newWatched = {
      imdbRating,
      Runtime: Number(Runtime.split(" ").slice(0, 1).join("")),
      Poster,
      Title,
      imdbID,
      ratingmovie,
    };
    setWatched((watched) => [...watched, newWatched]);
    console.log(watched);
    CloseDetail();
  }

  useEffect(
    function () {
      if (!Title) return;
      document.title = `Movie | ${Title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [Title],
  );
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          CloseDetail();
        }
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [CloseDetail],
  );
  return (
    <div className="details">
      {loadDetailmovie ? (
        <p className="loader">Loading...</p>
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={CloseDetail}>
              &larr;
            </button>
            <img src={Poster} alt={`Poster of ${MovieDetail} movie`} />
            <div className="details-overview">
              <h2>{Title}</h2>
              <p>
                {Released} &bull; {Runtime}
              </p>
              <p>{Genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {meraj ? (
                <p>You rated with movie {shima}⭐</p>
              ) : (
                <>
                  <StarRating
                    maxlength={10}
                    size={24}
                    setmovie={setratingmovie}
                  />
                  {ratingmovie && (
                    <button
                      className="btn-add"
                      onClick={() => handlewatched(MovieDetail)}
                    >
                      +Add to list
                    </button>
                  )}
                  <p>{Plot}</p>
                  <p>Starring : {Actors}</p>
                  <p>Directed : {Director}</p>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
///////////////////////////
function Rightside({
  isOpen2,
  setIsOpen2,
  watched,
  setWatched,
  avgImdbRating,
  avgUserRating,
  avgRuntime,
  selectmovie,
  setselectmovie,
}) {
  function handledelete(id) {
    setWatched((items) => items.filter((item) => item.imdbID !== id));
  }
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {selectmovie ? (
        <MovieDetails
          selectmovie={selectmovie}
          setselectmovie={setselectmovie}
          setWatched={setWatched}
          watched={watched}
        />
      ) : (
        isOpen2 && (
          <>
            <div className="summary">
              <h2>Movies you watched</h2>
              <div>
                <p>
                  <span>#️⃣</span>
                  <span>{watched.length} movies</span>
                </p>
                <p>
                  <span>⭐️</span>
                  <span>{Math.round(avgImdbRating * 10) / 10}</span>
                </p>
                <p>
                  <span>🌟</span>
                  <span>{Math.round(avgUserRating * 10) / 10}</span>
                </p>
                <p>
                  <span>⏳</span>
                  <span>{Math.round(avgRuntime)} min</span>
                </p>
              </div>
            </div>

            <ul className="list">
              {watched.map((movie) => (
                <li key={movie.imdbID}>
                  <img src={movie.Poster} alt={`${movie.Title} poster`} />
                  <h3>{movie.Title}</h3>
                  <div>
                    <p>
                      <span>⭐️</span>
                      <span>{movie.imdbRating}</span>
                    </p>
                    <p>
                      <span>🌟</span>
                      <span>{movie.ratingmovie}</span>
                    </p>
                    <p>
                      <span>⏳</span>
                      <span>{movie.Runtime} min</span>
                    </p>
                    <button
                      className="btn-delete"
                      onClick={() => handledelete(movie.imdbID)}
                    >
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )
      )}
    </div>
  );
}
