import { useState } from 'react';
import { Container, Box, Typography, CircularProgress, Paper, Snackbar, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import Header from './Header';
import MemberCard from './MemberCard';
import AddObservationDialog from './AddObservationDialog';
import MemberDetailsDialog from './MemberDetailsDialog';
import { useObservations, useAddObservation, MEMBERS } from '../hooks/usePostgresObservations';
import type { ObservationType } from '../hooks/usePostgresObservations';

const Dashboard: React.FC = () => {
  const [filterDays, setFilterDays] = useState<number | null>(30);
  const { data: observations = [], isLoading: loading } = useObservations(filterDays);
  const addObservationMutation = useAddObservation();
  
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

  const getCounts = (memberId: string) => {
    const memberObs = observations.filter(obs => obs.member_id === memberId);
    const positive = memberObs.filter(obs => obs.type === 'positive').length;
    const negative = memberObs.filter(obs => obs.type === 'negative').length;
    return { positive, negative };
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header filterDays={filterDays} onFilterChange={setFilterDays} />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
            Estado de la Célula
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualiza y registra el desempeño del equipo de forma objetiva y constructiva.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {MEMBERS.map((member) => {
              const { positive, negative } = getCounts(member.id);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={member.id}>
                  <MemberCard
                    name={member.name}
                    positiveCount={positive}
                    negativeCount={negative}
                    onAddObservation={() => setSelectedMember(member)}
                    onViewDetails={() => setViewDetailsMember(member)}
                  />
                </Grid>
              );
            })}
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
          <Typography variant="body2" color="text.secondary" paragraph>
            Este sistema utiliza PostgreSQL para mayor velocidad y React Query para una interfaz instantánea. 
            El nivel de satisfacción se calcula en tiempo real.
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
