'use client';
import FilmCard from '@/app/components/filmCard';
import { useEffect, useState } from 'react';
import { getList, getImage } from './actions/films';

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
  runtime: number | null; // Allow runtime to be null
};

type PopularFilmsResponse = {
  films: Film[];
  // add other properties if getList returns more
};

export default function Home() {
  const [popularFilm, setPopularFilm] = useState<PopularFilmsResponse | null>(null);
  const [currentFilmIndex, setCurrentFilmIndex] = useState<number>(0);
  const [posterUrl, setPosterUrl] = useState<string>("");

  useEffect(() => {
    const fetchPopularFilms = async () => {
      const popularFilms = await getList(1);
      setPopularFilm(popularFilms);

      if (popularFilms && popularFilms.films.length > 0) {
        const url = await getImage(popularFilms.films[0].poster_path);
        setPosterUrl(url);
      }
    };
    fetchPopularFilms();
  }, []);

  // Met à jour l'affiche quand l'index change
  useEffect(() => {
    const updatePoster = async () => {
      if (popularFilm && popularFilm.films.length > 0) {
        const film = popularFilm.films[currentFilmIndex];
        if (film) {
          const url = await getImage(film.poster_path);
          setPosterUrl(url);
        }
      }
    };
    updatePoster();
  }, [currentFilmIndex, popularFilm]);

  const handleNext = () => {
    if (popularFilm && currentFilmIndex < popularFilm.films.length - 1) {
      setCurrentFilmIndex(currentFilmIndex + 1);
    }
  };

  const handlePrev = () => {
    if (popularFilm && currentFilmIndex > 0) {
      setCurrentFilmIndex(currentFilmIndex - 1);
    }
  };

  const film = popularFilm?.films[currentFilmIndex];

  return (
    <div className="font-sans justify-items-center min-h-screen p-8 pb-20 sm:p-20">
      {film && posterUrl ? (
        <FilmCard 
          id={film.id}
          title={film.title} 
          posterPath={posterUrl}
          overview={film.overview}
          releaseDate={film.release_date.toLocaleDateString()}
          genreIds={film.genre_ids}
          voteAverage={film.vote_average}
          runtime={film.runtime}
        />
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}
