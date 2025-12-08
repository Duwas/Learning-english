'use client';
import { createContext, useContext } from "react";

export const AuthDialogContext = createContext(null);

export const useAuthDialog = () => useContext(AuthDialogContext);