import { supabase } from './supabase';


// Vérifie si l'email est déjà utiliser
export async function emailAlredyExist(email:string):Promise<boolean> {
    const cleanEmail = email.trim();

    const { data , error } = await supabase.rpc('email_alredy_exist',
        {
            p_email: cleanEmail,
        }
    );

    if(error)
    {
        throw error;
    }

    return data === true;

}


//Inscription 
export async function signUp(first_name:string , last_name : string , mail : string , phone_number:string , password: string )
{
    const { data , error } = await supabase.auth.signUp({
        email: mail.trim().toLowerCase(),
        password,
        options: {
            data: {
                first_name ,
                last_name,
                phone : phone_number.replace(/[\s-]/g, ''),
            },
            emailRedirectTo: 'http://localhost:5173/auth',
        },
    });

    return {
        data,
        error,
    }
}

//Connexion
export async function signIn(
    mail: string,
    password: string,
    rememberMe: boolean = true
) {

    localStorage.setItem(
        "connecteo_remember_me",
        rememberMe ? "true" : "false"
    );

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: mail.trim().toLowerCase(),
            password,
        });

    return {
        data,
        error,
    };
}

//Déconnexion
export async function signOut() {
    return await supabase.auth.signOut();
}

//Récupérer le profil de l'utilisateur connecté
export async function getCurrentUserProfile() {
    const { data : {user},} = await supabase.auth.getUser();

    if(!user) {
        return {
            user : null ,
            profile : null,
            error : null ,
        };
    }

    const { data: profile, error } = await supabase.from('users').select('id,email,first_name,last_name,phone,role,created_at').eq('id',user.id).single();

    return {
        user,
        profile,
        error,
    };
}

// ================================
// MOT DE PASSE OUBLIÉ
// ================================

export async function resetPassword(email: string)
{
    const cleanEmail = email.trim().toLowerCase();

    return await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
            redirectTo: `${window.location.origin}/reset-password`,
        }
    );
}


// ================================
// NOUVEAU MOT DE PASSE
// ================================

export async function updatePassword(
    newPassword: string
)
{
    return await supabase.auth.updateUser({
        password: newPassword,
    });
}

// ================================
// CONNEXION GOOGLE
// ================================

export async function signInWithGoogle()
{
    return await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
            redirectTo: `${window.location.origin}/auth`,
        },
    });
}