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
  alpha
} from '@mui/material';
import { 
  AddCircle as AddCircleIcon, 
  RemoveCircle as RemoveCircleIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as SadIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface MemberCardProps {
  name: string;
  positiveCount: number;
  negativeCount: number;
  onAddObservation: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  name, 
  positiveCount, 
  negativeCount, 
  onAddObservation 
}) => {
  const theme = useTheme();
  const balance = positiveCount - negativeCount;

  const getStatusIcon = () => {
    if (balance > 0) return <HappyIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />;
    if (balance < 0) return <SadIcon sx={{ fontSize: 48, color: theme.palette.error.main }} />;
    return <NeutralIcon sx={{ fontSize: 48, color: theme.palette.warning.main }} />;
  };

  const getStatusText = () => {
    if (balance > 0) return "Satisfecho";
    if (balance < 0) return "Inconforme";
    return "Neutral";
  };

  const getBgColor = () => {
    if (balance > 0) return alpha(theme.palette.success.light, 0.1);
    if (balance < 0) return alpha(theme.palette.error.light, 0.1);
    return alpha(theme.palette.warning.light, 0.1);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
        bgcolor: getBgColor()
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: theme.palette.primary.main,
              boxShadow: theme.shadows[2]
            }}
          >
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: -10, 
              right: -10, 
              bgcolor: theme.palette.background.paper, 
              borderRadius: '50%',
              display: 'flex',
              boxShadow: theme.shadows[1]
            }}
          >
            {getStatusIcon()}
          </Box>
        </Box>

        <Typography variant="h5" component="h2" gutterBottom>
          {name}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Estado: <strong>{getStatusText()}</strong>
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 3 }}>
          <Tooltip title="Observaciones Positivas">
            <Badge badgeContent={positiveCount} color="success" showZero>
              <AddCircleIcon sx={{ color: theme.palette.success.main, fontSize: 30 }} />
            </Badge>
          </Tooltip>
          <Tooltip title="Observaciones Negativas">
            <Badge badgeContent={negativeCount} color="error" showZero>
              <RemoveCircleIcon sx={{ color: theme.palette.error.main, fontSize: 30 }} />
            </Badge>
          </Tooltip>
        </Box>
      </CardContent>

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Tooltip title="Agregar observación">
          <IconButton 
            color="primary" 
            onClick={onAddObservation}
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              color: 'white',
              '&:hover': { bgcolor: theme.palette.primary.dark }
            }}
          >
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default MemberCard;
