import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  Chip,
  Divider,
  IconButton,
  Avatar
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Person as PersonIcon,
  CalendarMonth as DateIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import type { Observation } from '../hooks/usePostgresObservations';

interface MemberDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  memberName: string;
  observations: Observation[];
}

const MemberDetailsDialog: React.FC<MemberDetailsDialogProps> = ({ 
  open, 
  onClose, 
  memberName, 
  observations 
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}><PersonIcon /></Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Historial de {memberName}</Typography>
            <Typography variant="caption" color="text.secondary">
              Total: {observations.length} observaciones
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ p: 0, maxHeight: '60vh' }}>
        {observations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">No hay observaciones registradas en este periodo.</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {observations.map((obs, index) => (
              <React.Fragment key={obs.id}>
                <ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={obs.type === 'positive' ? 'Positiva' : 'Negativa'} 
                          color={obs.type === 'positive' ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, height: 24 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DateIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(obs.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <CommentIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.3 }} />
                        <Typography variant="body2" color="text.primary" sx={{ fontStyle: obs.comment ? 'normal' : 'italic' }}>
                          {obs.comment || 'Sin comentarios registrados.'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < observations.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailsDialog;
