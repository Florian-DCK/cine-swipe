'use client';
import FilmCard from '@/app/components/filmCard';
import { useEffect, useState } from 'react';
import { getList, getImage } from './actions/films';
import { CircularProgress } from '@mui/material';

type Film = {
  id: number;
  title: string;
  poster_path: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPopularFilms = async () => {
      setIsLoading(true);
      const popularFilms = await getList(1);
      setPopularFilm(popularFilms);

      if (popularFilms && popularFilms.films.length > 0) {
        const url = await getImage(popularFilms.films[0].poster_path);
        setPosterUrl(url);
      }
      setIsLoading(false);
    };
    fetchPopularFilms();
  }, []);


  useEffect(() => {
    const updatePoster = async () => {
      if (popularFilm && popularFilm.films.length > 0) {
        setIsLoading(true);
        const film = popularFilm.films[currentFilmIndex];
        if (film) {
          const url = await getImage(film.poster_path);
          setPosterUrl(url);
        }
        setIsLoading(false);
      }
    };
    updatePoster();
  }, [currentFilmIndex, popularFilm]);

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
        overview: film.overview,
        releaseDate: film.release_date.toLocaleDateString(),
        genreIds: film.genre_ids,
        voteAverage: film.vote_average,
        runtime: film.runtime,
      }
    : null;

  return (
    <div className="flex items-center justify-center font-sans p-8 pb-20 sm:p-20">
      {!isLoading && film && posterUrl && filmProps ? (
      <div className="animate-slide-down">
        <FilmCard
        {...filmProps}
        onSwipeLeft={handleLeft}
        onSwipeRight={handleRight}
        />
      </div>
      ) : (
      <CircularProgress color='inherit' className='flex justify-center items-center' />
      )}
    </div>
  );
}
