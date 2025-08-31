"use client";
import { addFilm, getPopularFilms, checkFilmExists, addToPopular } from "../actions/films";

async function testFilm() {
    try {
        const films = await getPopularFilms(undefined, 50);
        if (!films || films.length === 0) {
            throw new Error("Aucun film populaire trouvé");
        }
        console.log("Films populaires récupérés :", films.length);

    } catch (error) {
        console.error(error);
    }
}

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-10">Bienvenue sur CineSwipe !</h1>
      <h2 className="text-2xl font-semibold text-center mb-10">Zone de test</h2>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <form className="flex flex-col gap-4 background-white p-4 rounded shadow" action={async (formData: FormData) => {
          const title = formData.get("title");
          const poster_path = formData.get("poster_path");
          const overview = formData.get("overview");
          const release_date = formData.get("release_date");
          const genre_ids = formData.get("genre_ids");
          const vote_average = formData.get("vote_average");

          if (typeof title === "string" && typeof poster_path === "string" && typeof overview === "string" &&
              typeof release_date === "string" && Array.isArray(genre_ids) && typeof vote_average === "number") {
            // Remplacez 0 par l'ID réel du film si nécessaire
            const result = await addFilm(
              0, // id (à remplacer par un vrai identifiant si besoin)
              title,
              poster_path,
              overview,
              release_date,
              typeof genre_ids === "string"
                ? genre_ids.split(",").map((id) => Number(id.trim())).filter((id) => !isNaN(id))
                : [],
              typeof vote_average === "string" ? Number(vote_average) : vote_average
            );
            alert(result.error ? result.error : "Film ajouté avec succès.");
          } else {
            alert("Veuillez remplir tous les champs.");
          }
        }}>
          <input type="text" name="title" placeholder="Titre du film" required />
          <input type="text" name="poster_path" placeholder="Chemin de l'affiche" required />
          <textarea name="overview" placeholder="Résumé" required></textarea>
          <input type="date" name="release_date" placeholder="Date de sortie" required />
          <input type="text" name="genre_ids" placeholder="IDs des genres (séparés par des virgules)" required />
          <input type="number" name="vote_average" placeholder="Note moyenne" required />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Ajouter un film
          </button>
        </form>
        <form className="flex flex-col gap-4 background-white p-4 rounded shadow" action={async (formData: FormData) => {
          const idValue = formData.get("id");
          const id = typeof idValue === "string" ? Number(idValue) : undefined;
          if (typeof id === "number" && !isNaN(id)) {
            const result = await checkFilmExists(id);
            alert(result.exists ? "Le film existe." : "Le film n'existe pas.");
          } else {
            alert("ID du film invalide.");
          }
        }}>
            <input type="text" name="id" placeholder="ID du film" required />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              Vérifier l'existence du film
            </button>
        </form>
        <form className="flex flex-col gap-4 background-white p-4 rounded shadow" action={async (formData: FormData) => {
          const idValue = formData.get("id");
          const id = typeof idValue === "string" ? Number(idValue) : undefined;
          if (typeof id === "number" && !isNaN(id)) {
            const result = await addToPopular(id, 1);
            if (result) {
              alert(result.error ? result.error : "Film ajouté aux populaires.");
            } else {
              alert("Une erreur est survenue lors de l'ajout du film aux populaires.");
            }
          } else {
            alert("ID du film invalide.");
          }
        }}>
            <input type="text" name="id" placeholder="ID du film" required />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              Ajouter aux films populaires
            </button>
        </form>

      </section>
    </div>
  );
}
