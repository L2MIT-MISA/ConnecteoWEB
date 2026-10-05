import { useState, useEffect } from "react";
import { type FormEvent  } from "react";
import { useNavigate } from "react-router-dom";
import {
    getCurrentUserProfile,
    signIn,
    signUp,
    emailAlredyExist,
    resetPassword,
    signInWithGoogle
} from "../../services/auth";
import Navbar  from '../../components/Navbar/Navbar'
import './Auth.css'
import {UserRound,
    Mail,
    Phone,
    LockKeyhole,
    Eye,
    EyeOff
} from "lucide-react";
import { supabase } from "../../services/supabase";


function Auth() {

    console.log("AUTH PAGE CHARGÉE");
    const navigate = useNavigate();

    const [isLogin , setIsLogin] = useState(true);
    const [first_name , setFirst_name] = useState('');
    const [last_name , setLast_name] = useState('');
    const [email, setEmail] = useState('');
    const [phone , setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(() => {

        async function checkGoogleSession()
        {
            const { data } =
                await supabase.auth.getSession();

            if (!data.session)
            {
                return;
            }

            const {
                profile,
                error
            } = await getCurrentUserProfile();

            if (error || !profile)
            {
                return;
            }

            if (profile.role === "ADMIN")
            {
                navigate("/admin");
            }
            else
            {
                navigate("/user");
            }
        }

        checkGoogleSession();

    }, [navigate]);

    async function handleGoogleLogin()
    {
        setMessage("");
        setLoading(true);

        const { error } = await signInWithGoogle();

        if (error)
        {
            setLoading(false);

            setMessage(
                "Impossible de se connecter avec Google."
            );
        }
    }

    async function handleForgotPassword()
    {
        setMessage("");

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail)
        {
            setMessage(
                "Veuillez saisir votre adresse e-mail."
            );

            return;
        }

        setLoading(true);

        const { error } = await resetPassword(cleanEmail);

        setLoading(false);

        if (error)
        {
            setMessage(
                "Impossible d'envoyer l'e-mail de récupération."
            );

            return;
        }

        setMessage(
            "Un lien de récupération a été envoyé à votre adresse e-mail."
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage('');
        
        const cleanFirst_name = first_name.trim();
        const cleanLast_name = last_name.trim();
        const cleanEmail = email.trim();
        const cleanPhone = phone.trim();

        if (!isLogin)
        {
            if (!cleanLast_name)
            {
                setMessage("Veuillez saisir votre nom.");
                return;
            }

            if (!cleanFirst_name)
            {
                setMessage("Veuillez saisir votre prénom.");
                return;
            }

            if (!cleanPhone)
            {
                setMessage("Veuillez saisir votre numéro téléphone.");
                return;
            }
        }

        if (!cleanEmail)
        {
            setMessage("Veuillez saisir votre Email.");
            return;
        }

        if (!password)
        {
            setMessage("Veuillez saisir votre mot de passe.");
            return;
        }

        setLoading(true);

        // ==========================
        // CONNEXION
        // ==========================
        if ( isLogin )
        {
            const { error } = await signIn(
                cleanEmail,
                password,
                rememberMe
            );

            if(error ) {
                setLoading(false);

                setMessage("Nom d'utilisateur ou mot de passe incorrect.");
                return;
            }

            // Récupérer le profil et le rôle
            const {profile,error:  profileError,} = await getCurrentUserProfile();

            setLoading(false);

            if(profileError || !profile) {
                setMessage('Impossible de récupérer les informations du compte.');
                return;
            }

            // Redirection selon le rôle
            if (profile.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/user');
            }

            return;
        }

        // ==========================
        // INSCRIPTION
        // ==========================
        try {
            const email_exist = await emailAlredyExist(cleanEmail);

            if(!email_exist)
            {
                setLoading(false);

                setMessage("Ce adresse email est déjà utilisé.");

                return;
            }
        }
        catch(error)
        {
            setLoading(false);
            setMessage("Impossible de vérifier l'adresse email.");
            return;
        }

        //first_name:string , last_name : string , mail : string , phone_number:string , password: string 
        const { error } = await signUp(cleanFirst_name,cleanLast_name,cleanEmail,cleanPhone,password);

        setLoading(false);

        if(error)
        {
            setMessage(`Erreur : ${error.message}`);
            return;
        }

        setMessage('Compte créé avec succès. Vous pouvez maintenant vous connecter.');

        // Redirection vers la page de l'utilisateur simple
        navigate('/user');
    }
    return (
    <div className="pages">
        <Navbar/>
        <div className="auth-page">

            {/* =========================
                PARTIE GAUCHE
            ========================= */}
            <div className="auth-left">

                <img src={isLogin ? "/images/login_2.jpeg" : "/images/login_1.jpeg"} className="auth-background" alt=""/>

                <div className="auth-overlay"></div>

                <div className="auth-left-content">

                    <div className="auth-logo">
                        

                    </div>

                    <h1>
                        {isLogin ? (
                            <>
                                "Trouver le bon service ne 
                                <br />
                                devrait jamais être compliqué."
                            </>
                        ):(
                            <>
                                Votre espace
                                <br />
                                personnel, simplement.
                            </>
                        )}
                    </h1>
                    {!isLogin && (
                        <>
                            <p className="auth-description">
                                Retrouvez vos services, recevez vos recherches
                                <br />
                                et recevez des informations près de chez vous.
                            </p>
                        </>
                    )}
                    {isLogin ? (
                        <>
                            <div className="auth-footer-text">
                                <p>L'équipe Connectéo-Antananarivo</p>
                            </div>
                        </>
                    ):(
                        <>
                            <div className="auth-advantages">
                                <p>✓ Recherches et favoris sauvegardés </p>
                                <p>✓ Alertes locales personnalisées </p>
                                <p>✓ Données protégées et confidentielles </p>
                            </div>
                        </>
                    )}

                    

                </div>

            </div>


            {/* =========================
                PARTIE DROITE
            ========================= */}
            <div className="auth-right">

                <div className="auth-card">

                    {/* TITRE */}
                    <div className="auth-title">

                        <h2>
                            {isLogin
                                ? "Bon retour parmi nous"
                                : "Créer votre compte"}
                        </h2>

                        <p>
                            {isLogin
                                ? "Connectez-vous à votre espace Connectéo."
                                : "Quelques informations suffisent pour commencer."}
                        </p>

                    </div>


                    {/* FORMULAIRE */}
                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        {/* PRÉNOM + NOM */}
                        {!isLogin && (
                            <div className="name-fields">

                                <div className="input-group">

                                    <label>Prénom </label>

                                    <div className="input-with-icon">

                                        <UserRound size={17} />

                                        <input
                                            type="text"
                                            placeholder="Votre prénom"
                                            value={first_name}
                                            onChange={(event) => setFirst_name(event.target.value)}
                                        />

                                    </div>      
                                                          

                                </div>


                                <div className="input-group">

                                    <label>Nom </label>

                                    <div className="input-with-icon">

                                        <UserRound size={17} />

                                        <input
                                            type="text"
                                            placeholder="Votre nom"
                                            value={last_name}
                                            onChange={(event) => setLast_name(event.target.value)}
                                        />

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* EMAIL */}
                        <div className="input-group">

                            <label>Adresse e-mail </label>

                            <div className="input-with-icon">

                                <Mail size={17} />

                                <input
                                    type="email"
                                    placeholder="vous@exemple.mg"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />

                            </div>

                        </div>


                        {/* TÉLÉPHONE */}
                        {!isLogin && (
                            <div className="input-group">

                                <label>Numéro de téléphone </label>

                                <div className="input-with-icon">

                                    <Phone size={17} />

                                    <input
                                        type="tel"
                                        placeholder="+261 34 00 000 00"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                    />

                                </div>

                            </div>
                        )}


                        {/* MOT DE PASSE */}
                        <div className="input-group">

                            <label>Mot de passe  </label>

                            <div className="password-wrapper">

                                <LockKeyhole size={17} className="password-icon" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Votre mot de passe"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={
                                        showPassword
                                            ? "Masquer le mot de passe"
                                            : "Afficher le mot de passe"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                            
                        </div>


                        {/* OPTIONS CONNEXION */}
                        {isLogin && (
                            <div className="auth-options">

                                <label className="remember">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(event) => setRememberMe(event.target.checked)}
                                    />
                                    <span>Se souvenir de moi </span>
                                </label>


                                <button
                                    type="button"
                                    className="forgot-password-button"
                                    onClick={handleForgotPassword}
                                    disabled={loading}
                                >
                                    Mot de passe oublié ?
                                </button>

                            </div>
                        )}


                        {/* MESSAGE */}
                        {message && (
                            <div className="auth-message">
                                {message}
                            </div>
                        )}


                        {/* BOUTON */}
                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Chargement..." : isLogin ? "→  Se connecter" : "→  Créer mon compte"}
                        </button>


                        {/* GOOGLE */}
                        {isLogin && (
                            <>
                                <div className="auth-separator">

                                    <span></span>

                                    <p>
                                        OU
                                    </p>

                                    <span></span>

                                </div>


                                <button
                                    type="button"
                                    className="google-button"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    

                                    Continuer avec Google
                                </button>
                            </>
                        )}


                        {/* CHANGEMENT LOGIN / INSCRIPTION */}
                        <p className="auth-switch">

                            {isLogin
                                ? "Pas encore de compte ?"
                                : "Vous avez déjà un compte ?"}


                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setMessage("");
                                }}
                            >
                                {isLogin
                                    ? "Créer un compte"
                                    : "Se connecter"}
                            </button>

                        </p>

                    </form>

                </div>

            </div>

        </div>
    </div>
);


}




export default Auth;


