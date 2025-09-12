import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userType?: 'client' | 'distributor'
  isVerified: boolean
  profile?: {
    phone?: string
    gender?: string
    country?: string
    city?: string
    address?: string
    zip?: string
    documentType?: string
    document?: string
  }
  distributorInfo?: {
    distributorCode?: string
    distributorName?: string
    pdv?: string
    pdvname?: string
    warehouse?: string
    withCredit?: boolean
    paymentTerm?: string
    paymentMethodCode?: string
    companyCode?: string
  }
}

interface AuthState {
  // Estado
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Registro
  registrationData: {
    firstName: string
    lastName: string
    email: string
    password: string
  } | null
  isRegistering: boolean
  otpSent: boolean
  otpVerified: boolean
  registrationStep: 'initial' | 'otp' | 'userType' | 'personalInfo' | 'businessInfo' | 'completed'
  
  // Acciones
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  
  // Acciones de registro
  setRegistrationData: (data: Partial<AuthState['registrationData']>) => void
  setIsRegistering: (isRegistering: boolean) => void
  setOtpSent: (otpSent: boolean) => void
  setOtpVerified: (otpVerified: boolean) => void
  setRegistrationStep: (step: AuthState['registrationStep']) => void
  
  // Helpers
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>
  verifyOTP: (otp: string) => Promise<void>
  resendOTP: () => Promise<void>
  setUserType: (userType: 'client' | 'distributor') => Promise<void>
  selectUserType: (userType: 'client' | 'distributor') => Promise<void>
  updatePersonalInfo: (data: Record<string, unknown>) => Promise<void>
  updateBusinessInfo: (data: Record<string, unknown>) => Promise<void>
  completeRegistration: () => Promise<void>
  updateUserDetails: (data: Partial<User['profile']>) => Promise<void>
  updateDistributorInfo: (data: Partial<User['distributorInfo']>) => Promise<void>
  resetRegistration: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Estado de registro
      registrationData: null,
      isRegistering: false,
      otpSent: false,
      otpVerified: false,
      registrationStep: 'initial',
      
      // Setters básicos
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token })
        if (token) {
          localStorage.setItem('auth_token', token)
        } else {
          localStorage.removeItem('auth_token')
        }
      },
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),
      
      // Setters de registro
      setRegistrationData: (data) => 
        set((state) => ({ 
          registrationData: { ...state.registrationData, ...data } as AuthState['registrationData']
        })),
      setIsRegistering: (isRegistering) => set({ isRegistering }),
      setOtpSent: (otpSent) => set({ otpSent }),
      setOtpVerified: (otpVerified) => set({ otpVerified }),
      setRegistrationStep: (registrationStep) => set({ registrationStep }),
      
      // Funciones de autenticación
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Aquí iría la llamada real a la API
          // const response = await api.auth.login({ email, password })
          
          // Simulación por ahora
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          const mockUser: User = {
            id: '1',
            email,
            firstName: 'Usuario',
            lastName: 'Demo',
            userType: 'client',
            isVerified: true
          }
          
          const mockToken = 'mock-jwt-token'
          
          set({ 
            user: mockUser, 
            token: mockToken, 
            isAuthenticated: true,
            isLoading: false 
          })
          
          localStorage.setItem('auth_token', mockToken)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          registrationData: null,
          isRegistering: false,
          otpSent: false,
          otpVerified: false,
          registrationStep: 'initial'
        })
        localStorage.removeItem('auth_token')
      },
      
      register: async (data) => {
        set({ isLoading: true, isRegistering: true })
        try {
          // Aquí iría la llamada real a la API
          // const response = await api.auth.register(data)
          
          // Simulación
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          set({ 
            registrationData: data,
            otpSent: true,
            registrationStep: 'otp',
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false, isRegistering: false })
          throw error
        }
      },
      
      verifyOTP: async (otp: string) => {
        set({ isLoading: true })
        try {
          // Verificar OTP (por ahora 123456)
          if (otp === '123456') {
            set({ 
              otpVerified: true,
              registrationStep: 'userType',
              isLoading: false
            })
          } else {
            throw new Error('OTP inválido')
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      selectUserType: async (userType: 'client' | 'distributor') => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { registrationData } = get()
          
          if (userType === 'client') {
            // Si es cliente, completar registro automáticamente
            const newUser: User = {
              id: Date.now().toString(),
              email: registrationData?.email || '',
              firstName: registrationData?.firstName || '',
              lastName: registrationData?.lastName || '',
              userType: 'client',
              isVerified: true
            }
            
            set({
              user: newUser,
              isAuthenticated: true,
              registrationStep: 'completed',
              isLoading: false,
              isRegistering: false
            })
          } else {
            // Si es distribuidor, ir a formulario de información personal
            set({
              registrationStep: 'personalInfo',
              isLoading: false
            })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      updateUserDetails: async (data) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { user } = get()
          if (user) {
            const updatedUser = {
              ...user,
              profile: { ...user.profile, ...data }
            }
            set({ user: updatedUser })
          }
          
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      updateDistributorInfo: async (data) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { user, registrationData } = get()
          
          // Completar registro del distribuidor
          const completedUser: User = {
            id: Date.now().toString(),
            email: registrationData?.email || user?.email || '',
            firstName: registrationData?.firstName || user?.firstName || '',
            lastName: registrationData?.lastName || user?.lastName || '',
            userType: 'distributor',
            isVerified: true,
            profile: user?.profile,
            distributorInfo: data
          }
          
          set({
            user: completedUser,
            isAuthenticated: true,
            registrationStep: 'completed',
            isLoading: false,
            isRegistering: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      resetRegistration: () => {
        set({
          registrationData: null,
          isRegistering: false,
          otpSent: false,
          otpVerified: false,
          registrationStep: 'initial'
        })
      },

      // Nuevos métodos requeridos por los componentes
      resendOTP: async () => {
        set({ isLoading: true })
        try {
          // Simular reenvío de OTP
          await new Promise(resolve => setTimeout(resolve, 1000))
          set({ 
            otpSent: true,
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      setUserType: async (userType: 'client' | 'distributor') => {
        return get().selectUserType(userType)
      },

      updatePersonalInfo: async (data: Record<string, unknown>) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Actualizar datos del usuario con información personal
          const { user } = get()
          if (user) {
            const updatedUser = {
              ...user,
              profile: { ...user.profile, ...data }
            }
            set({ user: updatedUser })
          }
          
          // Pasar al siguiente paso
          set({ 
            registrationStep: 'businessInfo',
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateBusinessInfo: async (data: Record<string, unknown>) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Actualizar información de negocio
          const { user } = get()
          if (user) {
            const updatedUser = {
              ...user,
              distributorInfo: { ...user.distributorInfo, ...data }
            }
            set({ user: updatedUser })
          }
          
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      completeRegistration: async () => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { registrationData, user } = get()
          
          // Crear usuario final con toda la información
          const completedUser: User = {
            id: Date.now().toString(),
            email: registrationData?.email || user?.email || '',
            firstName: registrationData?.firstName || user?.firstName || '',
            lastName: registrationData?.lastName || user?.lastName || '',
            userType: user?.userType || 'distributor',
            isVerified: true,
            profile: user?.profile,
            distributorInfo: user?.distributorInfo
          }
          
          const mockToken = 'completed-registration-token'
          
          set({
            user: completedUser,
            token: mockToken,
            isAuthenticated: true,
            registrationStep: 'completed',
            isLoading: false,
            isRegistering: false
          })
          
          localStorage.setItem('auth_token', mockToken)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
