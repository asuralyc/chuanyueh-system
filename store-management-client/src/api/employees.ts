import { useAuthStore } from '../store/auth'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api/v1'

// 配置 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// 請求攔截器 - 添加認證token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 回應攔截器 - 處理錯誤
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 員工相關 API 介面定義
export interface Employee {
  id: string
  userId: string
  employeeNumber: string
  name: string
  title?: string
  phone?: string
  branchId: string
  hireDate?: string
  status: 'active' | 'inactive' | 'resigned'
  resignationDate?: string
  resignationReason?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    status: 'active' | 'inactive' | 'suspended'
    lastLoginAt?: string
  }
  branch: {
    id: string
    name: string
    code: string
  }
}

export interface CreateEmployeeDto {
  email: string
  password: string
  name: string
  branchId: string
  title?: string
  phone?: string
  hireDate?: string
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  status?: 'active' | 'inactive' | 'resigned'
}

export interface ResignEmployeeDto {
  resignationReason: string
  resignationDate?: string
}

export interface QueryEmployeeDto {
  search?: string
  branchId?: string
  status?: string
  page?: number
  limit?: number
}

export interface EmployeesResponse {
  data: Employee[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Branch {
  id: string
  name: string
  code: string
}

// 員工 API 方法
export const employeesApi = {
  // 取得員工列表
  async getEmployees(query: QueryEmployeeDto = {}): Promise<EmployeesResponse> {
    const response = await api.get('/employees', { params: query })
    return response.data
  },

  // 取得單個員工
  async getEmployee(id: string): Promise<Employee> {
    const response = await api.get(`/employees/${id}`)
    return response.data
  },

  // 創建員工
  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    const response = await api.post('/employees', data)
    return response.data
  },

  // 更新員工
  async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const response = await api.patch(`/employees/${id}`, data)
    return response.data
  },

  // 刪除員工（設為離職）
  async deleteEmployee(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/employees/${id}`)
    return response.data
  },

  // 員工離職（帶原因）
  async resignEmployee(id: string, data: ResignEmployeeDto): Promise<{ message: string, data: Employee }> {
    const response = await api.post(`/employees/${id}/resign`, data)
    return response.data
  },

  // 取得員工服務記錄
  async getEmployeeServices(id: string) {
    const response = await api.get(`/employees/${id}/services`)
    return response.data
  }
}

// 分店 API 方法
export const branchesApi = {
  // 取得分店列表
  async getBranches(): Promise<Branch[]> {
    const response = await api.get('/branches')
    return response.data
  }
}

export default employeesApi