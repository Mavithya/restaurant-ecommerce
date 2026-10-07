"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  AuthToken,
  User,
} from "@/types";


interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<User>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<User>;

  logout: () => void;
}


const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );


const TOKEN_KEY =
  "kora-access-token";


async function getCurrentUser(
  token: string
): Promise<User> {

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  const response = await fetch(
    `${apiUrl}/api/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to fetch current user"
    );
  }

  return response.json();
}


export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    const storedToken =
      localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    getCurrentUser(storedToken)
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem(
          TOKEN_KEY
        );

        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  async function login(
    email: string,
    password: string
  ): Promise<User> {

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000";

    const body =
      new URLSearchParams();

    body.set(
      "username",
      email.trim().toLowerCase()
    );

    body.set(
      "password",
      password
    );

    const response = await fetch(
      `${apiUrl}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body,
      }
    );

    if (!response.ok) {
      let message =
        "Incorrect email or password";

      try {
        const data =
          await response.json();

        message =
          data.detail || message;
      } catch {
        // Keep default message
      }

      throw new Error(message);
    }

    const data: AuthToken =
      await response.json();

    localStorage.setItem(
      TOKEN_KEY,
      data.access_token
    );

    setToken(
      data.access_token
    );

    const currentUser =
      await getCurrentUser(
        data.access_token
      );

    setUser(currentUser);

    return currentUser;
  }


  async function register(
    name: string,
    email: string,
    password: string
  ): Promise<User> {

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000";

    const response = await fetch(
      `${apiUrl}/api/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          email:
            email.trim().toLowerCase(),
          password,
        }),
      }
    );

    if (!response.ok) {
      let message =
        "Unable to create account";

      try {
        const data =
          await response.json();

        message =
          data.detail || message;
      } catch {
        // Keep default message
      }

      throw new Error(message);
    }

    return response.json();
  }


  function logout() {
    localStorage.removeItem(
      TOKEN_KEY
    );

    setToken(null);
    setUser(null);
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}