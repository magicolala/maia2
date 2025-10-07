import axios from 'axios';

const API_BASE_URL = '/api';

// Enable debug mode
const DEBUG = true;

const logDebug = (method, endpoint, data, response = null, error = null) => {
  if (!DEBUG) return;
  
  const timestamp = new Date().toISOString();
  console.group(`🔵 API ${method} ${endpoint}`);
  console.log('⏰ Time:', timestamp);
  console.log('📤 Request:', data);
  if (response) {
    console.log('✅ Response:', response);
  }
  if (error) {
    console.error('❌ Error:', error);
  }
  console.groupEnd();
};

class ApiService {
  async initializeModel(modelType, device) {
    const requestData = {
      model_type: modelType,
      device: device
    };
    
    logDebug('POST', '/init', requestData);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/init`, requestData);
      logDebug('POST', '/init', requestData, response.data);
      return response.data;
    } catch (error) {
      logDebug('POST', '/init', requestData, null, error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'initialisation du modèle');
    }
  }

  async predict(fen, eloSelf, eloOpponent, topK) {
    const requestData = {
      fen: fen,
      elo_self: eloSelf,
      elo_opponent: eloOpponent,
      top_k: topK
    };
    
    logDebug('POST', '/predict', requestData);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, requestData);
      logDebug('POST', '/predict', requestData, response.data);
      return response.data;
    } catch (error) {
      logDebug('POST', '/predict', requestData, null, error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la prédiction');
    }
  }

  async getStatus() {
    logDebug('GET', '/status', null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      logDebug('GET', '/status', null, response.data);
      return response.data;
    } catch (error) {
      logDebug('GET', '/status', null, null, error);
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  async validateFen(fen) {
    const requestData = { fen: fen };
    
    logDebug('POST', '/validate_fen', requestData);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/validate_fen`, requestData);
      logDebug('POST', '/validate_fen', requestData, response.data);
      return response.data;
    } catch (error) {
      logDebug('POST', '/validate_fen', requestData, null, error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation du FEN');
    }
  }
}

export default new ApiService();

