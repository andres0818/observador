import React, { useState } from 'react';
import { 
  Box, Container, Typography, TextField, Button, Paper, Divider, 
  List, ListItem, ListItemText, IconButton, Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Delete as DeleteIcon, PersonAdd as AddIcon, ArrowBack as BackIcon, 
  Lock as LockIcon, CheckCircle as CheckIcon, Person as PersonIcon
} from '@mui/icons-material';
import { useMembers, useAddMember, useDeleteMember, useObservations, useDeleteObservation } from '../hooks/usePostgresObservations';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  
  const { data: members = [] } = useMembers();
  const { data: observations = [] } = useObservations(null); // Ver todo el tiempo

  const addMemberMutation = useAddMember();
  const deleteMemberMutation = useDeleteMember();
  const deleteObsMutation = useDeleteObservation();

  const handleLogin = () => {
    if (password === 'contrasenia') {
      setIsAuthorized(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName) return;
    const id = newMemberName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100);
    await addMemberMutation.mutateAsync({ id, name: newMemberName });
    setNewMemberName('');
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('¿Seguro? Se eliminarán también todas sus observaciones.')) {
      await deleteMemberMutation.mutateAsync(id);
    }
  };

  const handleDeleteObs = async (id: number) => {
    if (window.confirm('¿Eliminar este comentario?')) {
      await deleteObsMutation.mutateAsync(id);
    }
  };

  if (!isAuthorized) {
    return (
      <Container maxWidth="xs" sx={{ mt: 10 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}><LockIcon /></Avatar>
          <Typography variant="h5" gutterBottom>Acceso Admin</Typography>
          <TextField 
            fullWidth 
            type="password" 
            label="Contraseña" 
            variant="outlined" 
            sx={{ my: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <Button fullWidth variant="contained" onClick={handleLogin}>Entrar</Button>
          <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={onBack}>Volver al Dashboard</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={onBack} color="primary"><BackIcon /></IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>Panel de Control</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Gestión de Miembros */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon /> Gestión de Equipo
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField 
                size="small" 
                fullWidth 
                placeholder="Nombre del nuevo miembro"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
              />
              <Button variant="contained" onClick={handleAddMember}><AddIcon /></Button>
            </Box>
            <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
              {members.map(member => (
                <ListItem key={member.id} divider secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => handleDeleteMember(member.id)}><DeleteIcon /></IconButton>
                }>
                  <ListItemText primary={member.name} secondary={`ID: ${member.id}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Moderación de Observaciones */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Moderación de Comentarios</Typography>
            <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              {observations.map(obs => {
                const member = members.find(m => m.id === obs.member_id);
                return (
                  <ListItem key={obs.id} divider alignItems="flex-start" secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => handleDeleteObs(obs.id)}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2">{member?.name || obs.member_id}</Typography>
                          <Chip label={obs.type} size="small" color={obs.type === 'positive' ? 'success' : 'error'} variant="outlined" />
                        </Box>
                      }
                      secondary={obs.comment || 'Sin comentario'}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Necesario importar Grid para que funcione
import Grid from '@mui/material/Grid';

export default AdminPanel;
