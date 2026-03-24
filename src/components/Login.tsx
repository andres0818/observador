import React, { useState } from 'react';
import { 
  Box, Container, Typography, TextField, Button, Paper, Avatar, 
  CircularProgress, Alert, InputAdornment, IconButton 
} from '@mui/material';
import { 
  Lock as LockIcon, Person as PersonIcon, 
  Visibility as ViewIcon, VisibilityOff as HideIcon, 
  Login as LoginIcon, VpnKey as KeyIcon 
} from '@mui/icons-material';
import { checkUser, setPassword as setPassApi, login as loginApi, Member } from '../hooks/usePostgresObservations';

interface LoginProps {
  onLoginSuccess: (user: Member) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'name' | 'password' | 'set-password'>('name');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleCheckName = async () => {
    if (!name) return;
    setLoading(true);
    setError('');
    try {
      const userData = await checkUser(name);
      setUser(userData);
      if (userData.hasPassword) {
        setStep('password');
      } else {
        setStep('set-password');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al verificar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      if (step === 'set-password') {
        await setPassApi(user!.id, password);
        onLoginSuccess({ ...user!, hasPassword: true });
      } else {
        const loggedUser = await loginApi(user!.id, password);
        onLoginSuccess(loggedUser);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, boxShadow: 6 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
          {step === 'name' ? <PersonIcon fontSize="large" /> : <LockIcon fontSize="large" />}
        </Avatar>
        
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {step === 'name' ? 'Bienvenido al Observador' : 
           step === 'set-password' ? 'Configura tu contraseña' : 'Ingresa tu contraseña'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {step === 'name' ? 'Ingresa tu nombre para comenzar' : 
           step === 'set-password' ? `Hola ${user?.name}, como es tu primera vez, elige una contraseña segura.` : 
           `Hola de nuevo, ${user?.name}.`}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {step === 'name' ? (
          <TextField 
            fullWidth 
            label="Tu nombre" 
            variant="outlined" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleCheckName()}
            sx={{ mb: 3 }}
          />
        ) : (
          <TextField 
            fullWidth 
            type={showPass ? 'text' : 'password'}
            label="Contraseña" 
            variant="outlined" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)}>
                    {showPass ? <HideIcon /> : <ViewIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        )}

        <Button 
          fullWidth 
          variant="contained" 
          size="large"
          onClick={step === 'name' ? handleCheckName : handleAuth}
          disabled={loading || (step === 'name' ? !name : !password)}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : 
                    (step === 'name' ? <LoginIcon /> : <CheckCircleIcon />)}
        >
          {loading ? 'Cargando...' : (step === 'name' ? 'Siguiente' : 'Entrar')}
        </Button>

        {step !== 'name' && (
          <Button 
            fullWidth 
            variant="text" 
            sx={{ mt: 1 }}
            onClick={() => { setStep('name'); setPassword(''); setError(''); }}
          >
            Volver
          </Button>
        )}
      </Paper>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
        Si no estás registrado, solicita tu acceso al administrador de la célula.
      </Typography>
    </Container>
  );
};

import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

export default Login;
