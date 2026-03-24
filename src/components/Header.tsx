import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Container, 
  Box, 
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Assessment as DashboardIcon
} from '@mui/icons-material';
import { useColorMode } from '../theme';

interface HeaderProps {
  filterDays: number | null;
  onFilterChange: (days: number | null) => void;
}

const Header: React.FC<HeaderProps> = ({ filterDays, onFilterChange }) => {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <DashboardIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '.1rem' }}
          >
            OBSERVADOR CELULA
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="period-filter-label">Periodo</InputLabel>
              <Select
                labelId="period-filter-label"
                value={filterDays === null ? 'all' : filterDays}
                label="Periodo"
                onChange={(e) => {
                  const val = e.target.value;
                  onFilterChange(val === 'all' ? null : Number(val));
                }}
              >
                <MenuItem value={7}>Últimos 7 días</MenuItem>
                <MenuItem value={30}>Últimos 30 días</MenuItem>
                <MenuItem value={90}>Últimos 3 meses</MenuItem>
                <MenuItem value="all">Todo el tiempo</MenuItem>
              </Select>
            </FormControl>

            <Tooltip title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
              <IconButton onClick={toggleColorMode} color="inherit">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
