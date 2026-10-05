import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { updatePassword } from "../../services/auth";
import "./Auth.css";

function ResetPassword()
{
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);


    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    )
    {
        event.preventDefault();

        setMessage("");

        if (!password)
        {
            setMessage("Veuillez saisir votre nouveau mot de passe.");
            return;
        }

        if (password.length < 8)
        {
            setMessage(
                "Le mot de passe doit contenir au moins 8 caractères."
            );
            return;
        }

        if (password !== confirmPassword)
        {
            setMessage(
                "Les deux mots de passe ne correspondent pas."
            );
            return;
        }

        setLoading(true);

        const { error } = await updatePassword(password);

        setLoading(false);

        if (error)
        {
            setMessage(
                "Impossible de modifier le mot de passe."
            );
            return;
        }

        setMessage(
            "Votre mot de passe a été modifié avec succès."
        );

        setTimeout(() => {
            navigate("/auth");
        }, 2000);
    }


    return (
        <div className="pages">

            <div className="auth-right">

                <div className="auth-card">

                    <div className="auth-title">

                        <h2>
                            Nouveau mot de passe
                        </h2>

                        <p>
                            Choisissez un nouveau mot de passe sécurisé.
                        </p>

                    </div>


                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="input-group">

                            <label>
                                Nouveau mot de passe
                            </label>

                            <div className="password-wrapper">

                                <LockKeyhole
                                    size={17}
                                    className="password-icon"
                                />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Nouveau mot de passe"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                        </div>


                        <div className="input-group">

                            <label>
                                Confirmer le mot de passe
                            </label>

                            <div className="password-wrapper">

                                <LockKeyhole
                                    size={17}
                                    className="password-icon"
                                />

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirmez votre mot de passe"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                        </div>


                        {message && (
                            <div className="auth-message">
                                {message}
                            </div>
                        )}


                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Modification..."
                                : "Modifier mon mot de passe"
                            }
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default ResetPassword;