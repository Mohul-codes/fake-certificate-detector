import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const analyzeCertificate = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error.response?.data?.detail || "Failed to analyze certificate";
  }
};