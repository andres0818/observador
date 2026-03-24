import { useState } from 'react';
import { Container, Box, Typography, CircularProgress, Paper, Snackbar, Alert, Grid, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import Header from './Header';
import MemberCard from './MemberCard';
import AddObservationDialog from './AddObservationDialog';
import MemberDetailsDialog from './MemberDetailsDialog';
import AdminPanel from './AdminPanel';
import Login from './Login';
import { useObservations, useAddObservation, useMembers } from '../hooks/usePostgresObservations';
import type { ObservationType, Member } from '../hooks/usePostgresObservations';
import { Settings as AdminIcon, Logout as LogoutIcon, Search as SearchIcon } from '@mui/icons-material';

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
    await addObservationMutation.mutateAsync({ memberId: selectedMember.id, type, comment });
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

  if (!currentUser) return <Login onLoginSuccess={handleLoginSuccess} />;
  if (isAdminMode) return <AdminPanel onBack={() => setIsAdminMode(false)} />;

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header filterDays={filterDays} onFilterChange={setFilterDays} />
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Encabezado con botones */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip title="Cerrar Sesión">
            <IconButton onClick={handleLogout} color="error" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
              Estado de la Célula
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hola, <strong>{currentUser.name}</strong>. Gestiona tu equipo.
            </Typography>
          </Box>

          <Tooltip title="Administración">
            <IconButton onClick={() => setIsAdminMode(true)} color="primary" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <AdminIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Buscador - Con margen asegurado */}
        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Buscar por nombre..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              maxWidth: 500,
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-root': { borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Rejilla de Tarjetas - Corregida para evitar superposición */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={60} /></Box>
        ) : (
          <Grid container spacing={4}>
            {filteredMembers.map((member) => {
              const { positive, negative } = getCounts(member.id);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
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
          </Grid>
        )}

        {/* Info Footer */}
        {!loading && filteredMembers.length > 0 && (
          <Paper sx={{ mt: 10, p: 4, borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Leyenda de Estados</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2"><strong>😃 Satisfecho:</strong> Balance Positivo</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2"><strong>😐 Neutral:</strong> Balance Cero</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2"><strong>☹️ Inconforme:</strong> Balance Negativo</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
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

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" variant="filled">Observación guardada con éxito</Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
