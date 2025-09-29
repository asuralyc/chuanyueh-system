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

// 會員相關 API 介面定義
export interface Member {
  id: string
  memberNumber: string
  name: string
  phone?: string
  email?: string
  homeBranchId: string
  homeBranch: {
    id: string
    name: string
    code: string
  }
  birthDate?: string
  gender?: 'male' | 'female' | 'other'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface CreateMemberDto {
  name: string
  phone?: string
  email?: string
  homeBranchId: string
  birthDate?: string
  gender?: 'male' | 'female' | 'other'
}

export interface UpdateMemberDto extends Partial<CreateMemberDto> {}

export interface QueryMemberDto {
  search?: string
  branchId?: string
  page?: number
  limit?: number
}

export interface MembersResponse {
  data: Member[]
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

// 會員 API 方法
export const membersApi = {
  // 取得會員列表
  async getMembers(query: QueryMemberDto = {}): Promise<MembersResponse> {
    const response = await api.get('/members', { params: query })
    return response.data
  },

  // 取得單個會員
  async getMember(id: string): Promise<Member> {
    const response = await api.get(`/members/${id}`)
    return response.data
  },

  // 創建會員
  async createMember(data: CreateMemberDto): Promise<Member> {
    const response = await api.post('/members', data)
    return response.data
  },

  // 更新會員
  async updateMember(id: string, data: UpdateMemberDto): Promise<Member> {
    const response = await api.patch(`/members/${id}`, data)
    return response.data
  },

  // 刪除會員
  async deleteMember(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/members/${id}`)
    return response.data
  },

  // 取得會員服務記錄
  async getMemberServices(id: string) {
    const response = await api.get(`/members/${id}/services`)
    return response.data
  },

  // 取得分店列表
  async getBranches(): Promise<Branch[]> {
    const response = await api.get('/branches')
    return response.data
  }
}

export default membersApi