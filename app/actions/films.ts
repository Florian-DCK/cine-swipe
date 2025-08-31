'use server'

import { prisma } from "../lib/prisma";
const TMDB = 'https://api.themoviedb.org/3';

//
// Ajoute un film à la base de données
// IN : id : number, title : string, poster_path : string, overview : string, release_date : string, genre_ids : number[], vote_average : number
// OUT : Promise<{ film: Film, status: number }>
//
export async function addFilm(id: number, title: string, poster_path: string, overview: string, release_date: string, genre_ids: number[], vote_average: number) {
    if (await prisma.film.findUnique({ where: { id } })) {
        return { error: 'Film already exists', status: 409 };
    }
    const film = await prisma.film.create({
        data: {
            id,
            title,
            poster_path,
            overview,
            release_date: new Date(release_date),
            genre_ids,
            vote_average,
        }
    });
    return { film, status: 201 };
}

//
// Retire un film de la base de données
// IN : id : number
// OUT : Promise<{ message: string, status: number }>
//
export async function removeFilm(id: number) {
    const film = await prisma.film.findUnique({ where: { id } });
    if (!film) {
        return { error: 'Film not found', status: 404 };
    }
    await prisma.film.delete({ where: { id } });
    return { message: 'Film deleted successfully', status: 200 };
}

//
// Vérifie si un film existe dans la base de données
// IN : id : number
// OUT : Promise<{ exists: boolean }>
//
export async function checkFilmExists(id: number) {
    const film = await prisma.film.findUnique({ where: { id } });
    return { exists: !!film };
}

//
// Retourne <amount> films populaires (au plus proche d'un multiple de 20) de la région
// IN : region? : string, amount? : number
// OUT : Promise<Film[]>
//
export async function getPopularFilms(region?: string, amount?: number) {
    const apiKey = process.env.TMDB_API_KEY;
    const numberOfPages = amount ? Math.ceil(amount / 20) : 1;
    const urls = Array.from({ length: numberOfPages }, (_, i) =>
        `${TMDB}/movie/popular?language=fr-FR${region ? `&region=${region}` : ''}&api_key=${apiKey}&page=${i + 1}`
    );
    const responses = await Promise.all(urls.map(url => fetch(url)));
    const datas = await Promise.all(responses.map(res => res.json()));
    const films = datas.flatMap(data => data.results);
    return films;
}

export async function getFilmDetails(filmId: number) {
    const film = await prisma.film.findUnique({ where: { id: filmId } });
    if (!film) {
        const apiKey = process.env.TMDB_API_KEY;
        const url = `${TMDB}/movie/${filmId}?api_key=${apiKey}&language=fr-FR`;
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            await prisma.film.create({
                data: {
                    id: data.id,
                    title: data.title,
                    poster_path: data.poster_path,
                    overview: data.overview,
                    release_date: new Date(data.release_date),
                    genre_ids: data.genres.map((genre: any) => genre.id),
                    vote_average: data.vote_average,
                }
            });
            return { film: data, status: 201 };
        }
        return { error: data.status_message, status: response.status };
    }
    return { film, status: 200 };
}

export async function addToPopular(filmId: number, latestListId: number) {
    // Vérifie si le film existe, sinon va le chercher et l'ajoute
    const exists = await checkFilmExists(filmId);
    if (!exists.exists) {
        const filmDetails = await getFilmDetails(filmId);
        if (filmDetails.error) {
            return { error: filmDetails.error, status: filmDetails.status };
        }
        await addFilm(
            filmDetails.film.id,
            filmDetails.film.title,
            filmDetails.film.poster_path,
            filmDetails.film.overview,
            filmDetails.film.release_date,
            filmDetails.film.genre_ids,
            filmDetails.film.vote_average
        );
    }

    // Ajoute le film à la LatestList existante
    await prisma.latestList.update({
        where: { id: latestListId },
        data: {
            films: {
                connect: { id: filmId }
            }
        }
    });

    return { message: "Film ajouté à la liste populaire", status: 200 };
}