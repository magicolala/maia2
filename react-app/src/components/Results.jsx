import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

function Results({ predictions }) {
  if (!predictions) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h6" component="h2">
            Résultats de Prédiction
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 6,
          color: 'text.secondary'
        }}>
          <QueryStatsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="body1" gutterBottom>
            Aucune prédiction pour le moment
          </Typography>
          <Typography variant="caption">
            Configurez les paramètres et cliquez sur "Prédire"
          </Typography>
        </Box>
      </Box>
    );
  }

  const winProbPercent = (predictions.win_probability * 100).toFixed(1);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AnalyticsIcon color="primary" />
        <Typography variant="h6" component="h2">
          Résultats de Prédiction
        </Typography>
      </Box>

      {/* Win Probability */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Probabilité de Gain
        </Typography>
        <Box sx={{ 
          position: 'relative',
          height: 48,
          bgcolor: '#f8f9fa',
          borderRadius: 24,
          overflow: 'hidden'
        }}>
          <LinearProgress
            variant="determinate"
            value={predictions.win_probability * 100}
            sx={{
              height: '100%',
              borderRadius: 24,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #34a853 0%, #1a73e8 100%)',
                borderRadius: 24
              }
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'text.primary',
              textShadow: '0 0 4px white'
            }}
          >
            {winProbPercent}%
          </Box>
        </Box>
      </Box>

      {/* Move Suggestions */}
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
          Coups Suggérés
        </Typography>
        <List sx={{ p: 0 }}>
          {predictions.top_moves.map((move, index) => {
            const moveProb = (move.probability * 100).toFixed(1);
            return (
              <ListItem
                key={index}
                sx={{
                  bgcolor: '#f8f9fa',
                  borderRadius: 1,
                  mb: 1.5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(26, 115, 232, 0.08)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    mr: 2
                  }}
                >
                  {index + 1}
                </Avatar>
                <ListItemText
                  primary={move.move}
                  primaryTypographyProps={{
                    fontFamily: 'monospace',
                    fontSize: '1.125rem',
                    fontWeight: 500
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={move.probability * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e0e0e0'
                      }}
                    />
                  </Box>
                  <Chip
                    label={`${moveProb}%`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700, minWidth: 60 }}
                  />
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

export default Results;

