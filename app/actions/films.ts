'use server'

import { prisma } from "../lib/prisma";
const TMDB = 'https://api.themoviedb.org/3';


export async function addFilm(id: number, title: string, poster_path: string, backdrop_path: string | null, overview: string, release_date: string, genre_ids: number[], vote_average: number) {
    if (await prisma.film.findUnique({ where: { id } })) {
        return { error: 'Film already exists', status: 409 };
    }
    const film = await prisma.film.create({
        data: {
            id,
            title,
            poster_path,
            backdrop_path,
            overview,
            release_date: new Date(release_date),
            genre_ids,
            vote_average,
        }
    });
    return { film, status: 201 };
}


export async function removeFilm(id: number) {
    const film = await prisma.film.findUnique({ where: { id } });
    if (!film) {
        return { error: 'Film not found', status: 404 };
    }
    await prisma.film.delete({ where: { id } });
    return { message: 'Film deleted successfully', status: 200 };
}


export async function checkFilmExists(id: number) {
    const film = await prisma.film.findUnique({ where: { id } });
    return { exists: !!film };
}


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
                    backdrop_path: data.backdrop_path,
                    overview: data.overview,
                    release_date: new Date(data.release_date),
                    genre_ids: data.genres.map((genre: any) => genre.id),
                    vote_average: data.vote_average,
                    runtime: data.runtime
                }
            });
            return { film: data, status: 201 };
        }
        return { error: data.status_message, status: response.status };
    }
    return { film, status: 200 };
}

export async function addToPopular(filmId: number, latestListId: number) {

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
            filmDetails.film.backdrop_path,
            filmDetails.film.overview,
            filmDetails.film.release_date,
            filmDetails.film.genre_ids,
            filmDetails.film.vote_average
        );
    }


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

export async function emptyPopulars() {
    try {
        await prisma.latestList.update({
            where: { id: 1 },
            data: {
                films: {
                    set: []
                }
            }
        });
    } catch (error) {
        console.error("Erreur lors de la vidange des films populaires :", error);
    }
}

export async function refreshPopulars(region?: string, forced?: boolean) {
    try {
        if (!forced) {
        const { missingFilms } = await compareListToTMDB(1, region);
        if (missingFilms.length > 0) {
            await emptyPopulars();
            const popularFilms = await getPopularFilms(region, 40);
            for (const film of popularFilms) {
                await addToPopular(film.id, 1);
            }
        } else {
            console.log("La liste des films populaires est déjà à jour avec TMDB.");
        }} else {
            const popularFilms = await getPopularFilms(region, 40);
            await emptyPopulars();
            for (const film of popularFilms) {
                await addToPopular(film.id, 1);
            }
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour des films populaires :", error);
    }
}

export async function getList(id: number) {
    try {
        const list = await prisma.latestList.findUnique({
            where: { id },
            include: { films: true }
        });
        return list;
    } catch (error) {
        console.error("Erreur lors de la récupération de la liste :", error);
        throw error;
    }
}

export async function compareListToTMDB(listId: number, region?: string) {
    try {
        const list = await getList(listId);
        if (!list) {
            throw new Error("Liste non trouvée");
        }

        const tmdbFilms = await getPopularFilms(region, 40);

        const missingFilms = list.films.filter(film => !tmdbFilms.some(tmdbFilm => tmdbFilm.id === film.id));

        return { missingFilms };
    } catch (error) {
        console.error("Erreur lors de la comparaison de la liste avec TMDB :", error);
        throw error;
    }
}

export async function getImage(path: string) {
    const response = await fetch(`https://image.tmdb.org/t/p/original/${path}`);
    if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'image");
    }
    return response.url;
}

export async function getGenresFromTMDB() {
    const response = await fetch(`${TMDB}/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`);
    if (!response.ok) {
        throw new Error("Erreur lors de la récupération des genres");
    }
    const data = await response.json();
    return data.genres;
}

export async function getGenreNameFromTMDB(id: number) {
    const genres = await getGenresFromTMDB();
    const genre = genres.find((g: { id: number }) => g.id === id);
    return genre ? genre.name : null;
}

export async function getVideoFromTMDB(id: number) {
    const response = await fetch(`${TMDB}/movie/${id}/videos?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`);
    if (!response.ok) {
        throw new Error("Erreur lors de la récupération des vidéos");
    }
    const data = await response.json();
    return data.results;
}
