import axios from 'axios';

const API_BASE_URL = '/api';

class ApiService {
  async initializeModel(modelType, device) {
    try {
      const response = await axios.post(`${API_BASE_URL}/init`, {
        model_type: modelType,
        device: device
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'initialisation du modèle');
    }
  }

  async predict(fen, eloSelf, eloOpponent, topK) {
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, {
        fen: fen,
        elo_self: eloSelf,
        elo_opponent: eloOpponent,
        top_k: topK
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la prédiction');
    }
  }

  async getStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      return response.data;
    } catch (error) {
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  async validateFen(fen) {
    try {
      const response = await axios.post(`${API_BASE_URL}/validate_fen`, {
        fen: fen
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation du FEN');
    }
  }
}

export default new ApiService();

