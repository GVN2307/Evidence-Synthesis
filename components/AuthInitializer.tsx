"use client";

import { useEffect } from "react";
import { getAuth, signInAnonymously } from "firebase/auth";
import { app } from "@/lib/firebase";

export function AuthInitializer() {
    useEffect(() => {
        const auth = getAuth(app);
        signInAnonymously(auth).catch((error) => {
            console.error("Firebase Anonymous Auth Error:", error);
        });
    }, []);

    return null;
}
