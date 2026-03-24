import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  IconButton, 
  Tooltip, 
  Badge,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { 
  AddCircle as AddCircleIcon, 
  RemoveCircle as RemoveCircleIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as SadIcon,
  Person as PersonIcon,
  FormatListBulleted as ListIcon
} from '@mui/icons-material';

interface MemberCardProps {
  name: string;
  positiveCount: number;
  negativeCount: number;
  onAddObservation: () => void;
  onViewDetails: () => void;
  isCurrentUser?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  name, 
  positiveCount, 
  negativeCount, 
  onAddObservation,
  onViewDetails,
  isCurrentUser = false
}) => {
  const theme = useTheme();
  const balance = positiveCount - negativeCount;

  const getStatusIcon = () => {
    if (balance > 0) return <HappyIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />;
    if (balance < 0) return <SadIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />;
    return <NeutralIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />;
  };

  const getStatusText = () => {
    if (balance > 0) return "Satisfecho";
    if (balance < 0) return "Inconforme";
    return "Neutral";
  };

  const getBgColor = () => {
    if (balance > 0) return alpha(theme.palette.success.light, 0.05);
    if (balance < 0) return alpha(theme.palette.error.light, 0.05);
    return alpha(theme.palette.warning.light, 0.05);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
        },
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ height: 6, bgcolor: balance > 0 ? 'success.main' : balance < 0 ? 'error.main' : 'warning.main' }} />
      
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4, pb: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 90, 
              height: 90, 
              bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
              color: 'primary.main',
              fontSize: 40,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <PersonIcon sx={{ fontSize: 45 }} />
          </Avatar>
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: -5, 
              right: -5, 
              bgcolor: 'background.paper', 
              borderRadius: '50%',
              display: 'flex',
              p: 0.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {getStatusIcon()}
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
          {name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
          Estado: <span style={{ color: balance > 0 ? theme.palette.success.main : balance < 0 ? theme.palette.error.main : theme.palette.warning.main }}>{getStatusText()}</span>
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3, 
          bgcolor: getBgColor(),
          py: 2,
          borderRadius: 3,
          mx: 2
        }}>
          <Tooltip title="Positivas">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 800 }}>{positiveCount}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Pos</Typography>
            </Box>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ opacity: 0.5 }} />
          <Tooltip title="Negativas">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="error.main" sx={{ fontWeight: 800 }}>{negativeCount}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Neg</Typography>
            </Box>
          </Tooltip>
        </Box>
      </CardContent>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.grey[500], 0.02) }}>
        {!isCurrentUser && (
          <Tooltip title="Nueva Observación">
            <IconButton 
              color="primary" 
              onClick={onAddObservation}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
              }}
            >
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Ver Historial">
          <IconButton 
            onClick={onViewDetails}
            sx={{ 
              bgcolor: 'background.paper',
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default MemberCard;
