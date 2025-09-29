import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

// Axios instance for API calls
const apiClient = axios.create({ baseURL: API_URL });

// Interceptor to add the auth token to every request
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null as any | null, // Store user profile
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials: { email: string; password:string }): Promise<boolean> {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/auth/login', credentials);
        const { access_token } = response.data;
        
        this.token = access_token;
        localStorage.setItem('token', access_token);

        // After login, fetch user profile
        await this.fetchUser();

        this.loading = false;
        return true;
      } catch (error: any) {
        this.loading = false;
        if (axios.isAxiosError(error) && error.response) {
          this.error = error.response.data.message || '登入失敗，請檢查您的帳號密碼。';
        } else {
          this.error = '發生未知錯誤';
        }
        return false;
      }
    },

    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await apiClient.get('/auth/profile');
        this.user = response.data;
      } catch (error) {
        console.error('Failed to fetch user profile', error);
        this.logout(); // If token is invalid, log out
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      // No need to clear axios header here due to the interceptor logic
    },
  },
});
