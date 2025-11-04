import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const translations = {
  signIn: 'Iniciar Sesión',
  email: 'Correo Electrónico',
  password: 'Contraseña',
  signingIn: 'Iniciando sesión...',
  emailRequired: 'El correo es obligatorio',
  emailInvalid: 'Por favor ingrese un correo válido (debe contener @)',
  passwordRequired: 'La contraseña es obligatoria',
  passwordShort: 'La contraseña debe tener al menos 5 caracteres',
  signInError: 'Error al iniciar sesión. Por favor verifique sus credenciales.',
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const t = translations;

  const validateForm = (): string => {
    if (!email.trim()) {
      return t.emailRequired;
    }
    if (!email.includes('@')) {
      return t.emailInvalid;
    }
    if (!password) {
      return t.passwordRequired;
    }
    if (password.length < 5) {
      return t.passwordShort;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(t.signInError);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="card login-card">
            <h2 className="login-title">{t.signIn}</h2>
            
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {t.email}
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {t.password}
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  aria-required="true"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? t.signingIn : t.signIn}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;

