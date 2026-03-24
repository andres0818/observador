import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormControl, 
  FormLabel,
  Typography,
  Box
} from '@mui/material';
import type { ObservationType } from '../hooks/usePostgresObservations';

interface AddObservationDialogProps {
  open: boolean;
  onClose: () => void;
  memberName: string;
  onConfirm: (type: ObservationType, comment: string) => Promise<void>;
}

const AddObservationDialog: React.FC<AddObservationDialogProps> = ({ 
  open, 
  onClose, 
  memberName, 
  onConfirm 
}) => {
  const [type, setType] = useState<ObservationType>('positive');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onConfirm(type, comment);
      setComment('');
      onClose();
    } catch (error) {
      alert("Error al guardar la observación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Nueva observación para <strong>{memberName}</strong>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Tipo de observación</FormLabel>
            <RadioGroup 
              row 
              value={type} 
              onChange={(e) => setType(e.target.value as ObservationType)}
            >
              <FormControlLabel 
                value="positive" 
                control={<Radio color="success" />} 
                label="Positiva (+)" 
              />
              <FormControlLabel 
                value="negative" 
                control={<Radio color="error" />} 
                label="Negativa (-)" 
              />
            </RadioGroup>
          </FormControl>
          
          <TextField
            autoFocus
            margin="dense"
            label="Comentario (opcional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué sucedió?"
            sx={{ mt: 2 }}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            * Las observaciones son anónimas.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color={type === 'positive' ? 'success' : 'error'}
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddObservationDialog;
