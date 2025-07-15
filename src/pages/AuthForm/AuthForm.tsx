import React, { useState } from 'react';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import './AuthForm.scss';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('red');
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const url = isLogin ? 'users/login' : 'users/register';
    const method = 'POST';
    const bodyContent = isLogin
        ? { email: formData.email, password: formData.password }
        : { fullName: formData.fullName, email: formData.email, password: formData.password };

    try {
        const response = await request(url, method, bodyContent);

        if (!response.ok) {
        setMessageColor('red');

        if (response.status === 401) {
            setMessage("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.");
        } else if (response.status === 400) {
            setMessage("Données invalides. Merci de vérifier les informations saisies.");
        } else if (response.message) {
            setMessage(response.message);
        } else {
            setMessage("Une erreur est survenue. Veuillez réessayer.");
        }
        } else {
        if (isLogin) {
            setMessageColor('green');
            setMessage('Connexion réussie !');
            navigate('/');
        } else {
            setMessageColor('green');
            setMessage('Inscription réussie !');
            setTimeout(() => {
            setIsLogin(true);
            setMessage('');
            setFormData({ email: '', password: '', fullName: '' });
            }, 2000);
        }
        }
    } catch (error) {
        setMessageColor('red');
        setMessage("Erreur réseau. Veuillez vérifier votre connexion.");
    }
    }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Se connecter' : "S'inscrire"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>
                Nom complet<br />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Ton nom complet"
                />
              </label>
            </div>
          )}

          <div className="form-group">
            <label>
              Email<br />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="exemple@domaine.com"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Mot de passe<br />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mot de passe"
              />
            </label>
          </div>

          <button type="submit">{isLogin ? 'Se connecter' : "S'inscrire"}</button>
        </form>

        {message && (
          <p className={`message ${messageColor === 'green' ? 'success' : 'error'}`}>
            {message}
          </p>
        )}

        <hr />

        <button
          className="toggle-btn"
          onClick={() => {
            setMessage('');
            setIsLogin(!isLogin);
          }}
        >
          {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
