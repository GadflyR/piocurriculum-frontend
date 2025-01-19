// src/services/curriculumService.js
import axios from "axios";

// In dev: Node is on port 5000, React is on 3000
// In prod: We'll rely on the same domain (if we serve the React build from Node)
const API_URL = 
  process.env.NODE_ENV === "production"
    ? "/api/curriculum" // if served from same domain
    : "https://piocurriculum-frontend-drf3ehh5fegqhmfg.eastus2-01.azurewebsites.net/api/curriculum";

export const generatePlan = async (payload) => {
  const response = await axios.post(`${API_URL}/plan`, payload);
  return response.data;
};
