import axios from "axios";

// Create an instance pointing directly to our local backend server
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({ baseURL: BASE_URL });

// A security interceptor: Before any request goes out, look for a saved token
API.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem("userProfile");
  if (savedUser) {
    const { token } = JSON.parse(savedUser);
    // Attach the passport key directly to the request headers
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clean endpoints we can invoke across our application
export const loginAPI = (formData) => API.post("/auth/login", formData);
export const registerAPI = (formData) => API.post("/auth/register", formData);
export const fetchCoursesAPI = () => API.get("/courses");
export const createCourseAPI = (courseData) => API.post("/courses", courseData);
export const deleteCourseAPI = (courseId) => API.delete(`/courses/${courseId}`);

export const fetchProgressAPI = (courseId) => API.get(`/progress/${courseId}`);
export const toggleProgressAPI = (courseId, lectureId) =>
  API.post(`/progress/${courseId}/toggle`, { lectureId });
