import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Box, Typography, Chip } from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import InfoIcon from '@mui/icons-material/Info';

function ChessBoard({ fen, setFen }) {
  const [game] = useState(new Chess(fen));

  // Update game when FEN changes externally
  React.useEffect(() => {
    try {
      game.load(fen);
    } catch (error) {
      console.error('Invalid FEN:', error);
    }
  }, [fen, game]);

  // Get turn information
  const getTurnInfo = () => {
    try {
      const chess = new Chess(fen);
      return chess.turn() === 'w' ? 'Blancs' : 'Noirs';
    } catch (error) {
      return 'Blancs';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <GridOnIcon color="primary" />
        <Typography variant="h6" component="h2">
          Échiquier
        </Typography>
      </Box>

      <Box sx={{ 
        maxWidth: 600, 
        margin: '0 auto',
        boxShadow: '0 2px 6px 2px rgba(60,64,67,.15), 0 8px 24px 4px rgba(60,64,67,.15)',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Chessboard 
          position={fen}
          boardWidth={600}
          arePiecesDraggable={false}
          customBoardStyle={{
            borderRadius: '4px',
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Chip
          icon={<InfoIcon />}
          label={`Tour: ${getTurnInfo()}`}
          color="primary"
          variant="outlined"
        />
      </Box>
    </Box>
  );
}

export default ChessBoard;

