// src/services/curriculumService.js
import axios from 'axios';

const API_URL = "http://localhost:8080/api/curriculum";

export const generatePlan = async (payload) => {
  // payload should be { grade, completedCourses, majorDirectionCode }
  const response = await axios.post(`${API_URL}/plan`, payload);
  return response.data; // This is a CurriculumResponse
};
