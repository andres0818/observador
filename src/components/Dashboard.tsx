import { useState } from 'react';
import { Container, Box, Typography, CircularProgress, Paper, Snackbar, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import Header from './Header';
import MemberCard from './MemberCard';
import AddObservationDialog from './AddObservationDialog';
import MemberDetailsDialog from './MemberDetailsDialog';
import AdminPanel from './AdminPanel';
import Login from './Login';
import { useObservations, useAddObservation, useMembers } from '../hooks/usePostgresObservations';
import type { ObservationType, Member } from '../hooks/usePostgresObservations';
import { Settings as AdminIcon, Logout as LogoutIcon, Search as SearchIcon } from '@mui/icons-material';
import { InputAdornment, TextField, IconButton, Tooltip } from '@mui/material';

const Dashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const saved = localStorage.getItem('obs_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [filterDays, setFilterDays] = useState<number | null>(30);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: observations = [], isLoading: obsLoading } = useObservations(filterDays);
  const addObservationMutation = useAddObservation();
  
  const loading = membersLoading || obsLoading;
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);
  const [viewDetailsMember, setViewDetailsMember] = useState<{ id: string; name: string } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleAddObservation = async (type: ObservationType, comment: string) => {
    if (!selectedMember) return;
    
    await addObservationMutation.mutateAsync({
      memberId: selectedMember.id,
      type,
      comment
    });
    
    setSnackbarOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('obs_user');
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user: Member) => {
    localStorage.setItem('obs_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const getCounts = (memberId: string) => {
    const memberObs = observations.filter(obs => obs.member_id === memberId);
    const positive = memberObs.filter(obs => obs.type === 'positive').length;
    const negative = memberObs.filter(obs => obs.type === 'negative').length;
    return { positive, negative };
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (isAdminMode) {
    return <AdminPanel onBack={() => setIsAdminMode(false)} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header filterDays={filterDays} onFilterChange={setFilterDays} />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
          <Tooltip title="Cerrar Sesión">
            <IconButton 
              sx={{ position: 'absolute', left: 0, top: 0 }}
              onClick={handleLogout}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Panel de Administración">
            <IconButton 
              sx={{ position: 'absolute', right: 0, top: 0 }}
              onClick={() => setIsAdminMode(true)}
            >
              <AdminIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
            Estado de la Célula
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido, <strong>{currentUser.name}</strong>. Visualiza el desempeño del equipo.
          </Typography>
        </Box>

        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Buscar miembro..."
            variant="outlined"
            size="medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              width: { xs: '100%', sm: 400 },
              bgcolor: 'background.paper',
              borderRadius: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : (
          <Grid container spacing={8} justifyContent="center" sx={{ mb: 10, px: { xs: 2, md: 4 } }}>
            {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((member) => {
              const { positive, negative } = getCounts(member.id);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={member.id}>
                  <MemberCard
                    name={member.name}
                    positiveCount={positive}
                    negativeCount={negative}
                    onAddObservation={() => setSelectedMember(member)}
                    onViewDetails={() => setViewDetailsMember(member)}
                    isCurrentUser={member.id === currentUser.id}
                  />
                </Grid>
              );
            })}
            {members.length > 0 && members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 10, width: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                  No se encontraron miembros con "{searchTerm}"
                </Typography>
              </Box>
            )}
            {members.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
                No hay miembros registrados. Ve al panel de admin para agregar uno.
              </Typography>
            )}
          </Grid>
        )}

        <Paper 
          sx={{ 
            mt: 6, 
            p: 3, 
            borderRadius: 4, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Sobre este observador
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>😃 Satisfecho:</strong> Más observaciones positivas que negativas.<br />
            <strong>😐 Neutral:</strong> Igual cantidad de observaciones positivas y negativas.<br />
            <strong>☹️ Inconforme:</strong> Más observaciones negativas que positivas.
          </Typography>
        </Paper>
      </Container>

      <AddObservationDialog
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        memberName={selectedMember?.name || ''}
        onConfirm={handleAddObservation}
      />

      <MemberDetailsDialog
        open={!!viewDetailsMember}
        onClose={() => setViewDetailsMember(null)}
        memberName={viewDetailsMember?.name || ''}
        observations={observations.filter(obs => obs.member_id === viewDetailsMember?.id)}
      />

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Observación registrada con éxito
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
