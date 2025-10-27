import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SettingsIcon from '@mui/icons-material/Settings';

function Header() {
  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
        boxShadow: '0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)'
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <PsychologyIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => window.location.href='/'}>
              Maia2
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
              Modèle Unifié pour l'Alignement Humain-IA aux Échecs
            </Typography>
          </Box>
        </Box>
        
        <Button 
          component={Link} 
          to="/config" 
          variant="outlined"
          startIcon={<SettingsIcon />}
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white',
            }
          }}
        >
          Configuration
        </Button>

      </Toolbar>
    </AppBar>
  );
}

export default Header;

