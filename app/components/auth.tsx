"use client";

import { useState } from "react";

export const RegisterForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    if (!email) {
      setErrorMessage("Veuillez entrer un email");
    } else if (!password) {
      setErrorMessage("Veuillez entrer un mot de passe");
    } else if (!name) {
      setErrorMessage("Veuillez entrer un pseudo");
    } else {
      setErrorMessage(null);
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 201) {
        setValidationMessage("Inscription réussie !");
        setErrorMessage(null);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Erreur lors de l'inscription");
        setValidationMessage(null);
      }
    }
  };
  return (
    <div className="glass max-w-2xl py-3 flex- flex-col justify-center items-center">
      <h2 className="text-center col-span-2 text-2xl font-bold ">
        Pas encore de compte ?
      </h2>
      <form
        onSubmit={handleRegister}
        id="registerForm"
        className="grid grid-cols-2  p-5 gap-4 gap-y-2"
      >
        <input
          className="text-white bg-background rounded-lg p-2"
          type="text"
          name="name"
          placeholder="Votre pseudo"
        />
        <input
          className="text-white bg-background rounded-lg p-2"
          type="email"
          name="email"
          placeholder="Votre email"
        />
        <hr className="col-span-2 my-2 rounded-full" />
        <input
          className="text-white bg-background rounded-lg p-2 col-span-2"
          type="password"
          name="password"
          placeholder="Votre mot de passe"
        />
        <input
          className="text-white bg-background rounded-lg p-2 col-span-2"
          type="password"
          name="confirmPassword"
          placeholder="Votre mot de passe ... encore"
        />
      </form>
      <div className="flex justify-between items-center w-full px-5">
        <button
          form="registerForm"
          type="submit"
          className="text-white bg-background rounded-lg p-2 cursor-pointer hover:bg-background/90"
        >
          S'inscrire
        </button>
        {errorMessage && (
          <p className="bg-red-500/60 px-2 py-1 rounded border border-red-200 text-center text-red-200">
            {errorMessage}
          </p>
        )}
        {validationMessage && (
          <p className="bg-green-500/60 px-2 py-1 rounded border border-green-200 text-center text-green-200">
            {validationMessage}
          </p>
        )}
      </div>
    </div>
  );
};
