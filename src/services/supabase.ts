import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabasePublishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;


/*
 * Permet de choisir où Supabase conserve la session :
 *
 * localStorage  = Se souvenir de moi
 * sessionStorage = Ne pas se souvenir
 */

const authStorage = {
    getItem: (key: string) => {
        return (
            window.localStorage.getItem(key) ??
            window.sessionStorage.getItem(key)
        );
    },

    setItem: (key: string, value: string) => {

        const rememberMe =
            localStorage.getItem("connecteo_remember_me") !== "false";

        if (rememberMe)
        {
            localStorage.setItem(key, value);
            sessionStorage.removeItem(key);
        }
        else
        {
            sessionStorage.setItem(key, value);
            localStorage.removeItem(key);
        }
    },

    removeItem: (key: string) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    }
};


export const supabase = createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: authStorage
        }
    }
);