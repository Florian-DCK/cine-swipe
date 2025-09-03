'use client';
import FilmCard from '@/app/components/filmCard';
import { useEffect, useState, useRef } from 'react';
import { getList, getImage } from './actions/films';
import { CircularProgress } from '@mui/material';

type Film = {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string | null;
  overview: string;
  release_date: Date;
  genre_ids: number[];
  vote_average: number;
  createdAt: Date;
  latestListId: number | null;
  runtime: number | null;
};

type PopularFilmsResponse = {
  films: Film[];

};

export default function Home() {
  const [popularFilm, setPopularFilm] = useState<PopularFilmsResponse | null>(null);
  const [currentFilmIndex, setCurrentFilmIndex] = useState<number>(0);
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backdropVisible, setBackdropVisible] = useState<boolean>(false);
  const prevBackdropUrl = useRef<string | null>(null);

  useEffect(() => {
    const fetchPopularFilms = async () => {
      setIsLoading(true);
      const popularFilms = await getList(1);
      setPopularFilm(popularFilms);

      if (popularFilms && popularFilms.films.length > 0) {
        const url = await getImage(popularFilms.films[0].poster_path);
        setPosterUrl(url);
        let backdropUrl: string | null = null;
        if (popularFilms.films[0].backdrop_path) {
          backdropUrl = await getImage(popularFilms.films[0].backdrop_path);
        }
        setBackdropUrl(backdropUrl);
      }
      setIsLoading(false);
    };
    fetchPopularFilms();
  }, []);


  useEffect(() => {
    const updatePosterAndBackdrop = async () => {
      if (popularFilm && popularFilm.films.length > 0) {
        setIsLoading(true);
        const film = popularFilm.films[currentFilmIndex];
        if (film) {
          const url = await getImage(film.poster_path);
          setPosterUrl(url);
          let backdrop: string | null = null;
          if (film.backdrop_path) {
            backdrop = await getImage(film.backdrop_path);
          }
          setBackdropUrl(backdrop);
        }
        setIsLoading(false);
      }
    };
    updatePosterAndBackdrop();
  }, [currentFilmIndex, popularFilm]);

  // Effet pour gérer le fade-in/fade-out du backdrop
  useEffect(() => {
    if (backdropUrl) {
      setBackdropVisible(false); // Lance le fade-out
      const timeout = setTimeout(() => {
        prevBackdropUrl.current = backdropUrl;
        setBackdropVisible(true); // Lance le fade-in
      }, 200); // Durée du fade-out avant de changer l'image
      return () => clearTimeout(timeout);
    } else {
      setBackdropVisible(false);
    }
  }, [backdropUrl]);

  const handleRight = () => {
    if (popularFilm && currentFilmIndex < popularFilm.films.length - 1) {
      console.log("Swiped right");
      setCurrentFilmIndex(currentFilmIndex + 1);
    }
  };

  const handleLeft = () => {
    if (popularFilm && currentFilmIndex < popularFilm.films.length - 1) {
      console.log("Swiped left")
      setCurrentFilmIndex(currentFilmIndex + 1);
    }
  };

  const film = popularFilm?.films[currentFilmIndex];

  const filmProps = film
    ? {
        id: film.id,
        title: film.title,
        posterPath: posterUrl,
        backdropPath: backdropUrl,
        overview: film.overview,
        releaseDate: film.release_date.toLocaleDateString(),
        genreIds: film.genre_ids,
        voteAverage: film.vote_average,
        runtime: film.runtime,
      }
    : null;

  return (
    <>
      {/* Backdrop flouté avec overlay sombre et blur total */}
      {/* Ancien backdrop */}
      {prevBackdropUrl.current && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: backdropVisible ? 0 : 1,
            backgroundImage: `url(${prevBackdropUrl.current})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'opacity 0.5s',
            // backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(20,20,30,0.65)',
            // Ajout : toujours visible si le nouveau backdrop n'est pas prêt
            visibility: backdropUrl ? 'visible' : 'visible'
          }}
          aria-hidden="true"
        />
      )}
      {/* Nouveau backdrop */}
      {backdropUrl && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: backdropVisible ? 1 : 0,
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'opacity 0.5s',
            // backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(20,20,30,0.65)',
            // Ajout : toujours visible pendant la transition
            visibility: 'visible'
          }}
          aria-hidden="true"
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(20,20,30,0.65)'
            }}
          />
        </div>
      )}
      <div className="flex flex-col min-h-screen items-center justify-center font-sans p-8 pb-20 sm:p-20 relative z-10">
        {!isLoading && film && posterUrl && filmProps ? (
        <div className="animate-slide-down flex justify-center items-center">
          <FilmCard
          {...filmProps}
          onSwipeLeft={handleLeft}
          onSwipeRight={handleRight}
          />
        </div>
        ) : (
        <CircularProgress color='inherit' className='flex justify-center items-center' />
        )}
        <div className="fixed bottom-0 right-0 size-32 z-10">
          <div className="">
            <svg viewBox="0 0 32 32" preserveAspectRatio="xMinYMin meet" style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', bottom: 0, left: 0 }}>
              <path d="M 0 32 Q 23 22 32 0 L 32 32 Z" fill="var(--color-primary)" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
