import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { 
  AppState, 
  UserState, 
  TrainingState, 
  NetworkState, 
  UIState,
  TrainingOption,
  Contributor,
  NetworkStats,
  TrainingSession,
  TrainingHistory,
  UserProfile,
  Notification
} from '../types/cotrain'
import { smartApi } from '../services/api'
import { handleError } from '../utils/error-handler'

// User Store
interface UserStore extends UserState {
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  loadProfile: () => Promise<void>
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        profile: null,
        isAuthenticated: false,
        loading: false,
        error: null,

        login: async (credentials) => {
          set({ loading: true, error: null })
          try {
            // TODO: Implement actual login API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Mock successful login
            const mockProfile: UserProfile = {
              id: '1',
              username: credentials.email.split('@')[0],
              email: credentials.email,
              joinDate: new Date().toISOString(),
              totalContributions: 0,
              reputation: 100,
              level: 1,
              badges: [],
              preferences: {
                theme: 'dark',
                notifications: {
                  email: true,
                  push: true,
                  training: true,
                  rewards: true
                },
                privacy: {
                  showProfile: true,
                  showStats: true,
                  showLocation: false
                }
              }
            }
            
            set({ 
              profile: mockProfile, 
              isAuthenticated: true, 
              loading: false 
            })
          } catch (error) {
            const handledError = handleError(error)
            set({ 
              error: handledError.message, 
              loading: false 
            })
          }
        },

        logout: () => {
          set({ 
            profile: null, 
            isAuthenticated: false, 
            error: null 
          })
        },

        updateProfile: async (data) => {
          set({ loading: true, error: null })
          try {
            const currentProfile = get().profile
            if (!currentProfile) throw new Error('No profile to update')
            
            const updatedProfile = { ...currentProfile, ...data }
            set({ 
              profile: updatedProfile, 
              loading: false 
            })
          } catch (error) {
            const handledError = handleError(error)
            set({ 
              error: handledError.message, 
              loading: false 
            })
          }
        },

        loadProfile: async () => {
          set({ loading: true, error: null })
          try {
            // TODO: Load profile from API
            set({ loading: false })
          } catch (error) {
            const handledError = handleError(error)
            set({ 
              error: handledError.message, 
              loading: false 
            })
          }
        }
      }),
      {
        name: 'user-store',
        partialize: (state) => ({ 
          profile: state.profile, 
          isAuthenticated: state.isAuthenticated 
        })
      }
    ),
    { name: 'UserStore' }
  )
)

// Training Store
interface TrainingStore extends TrainingState {
  loadTrainingOptions: () => Promise<void>
  joinTraining: (optionId: string) => Promise<void>
  loadTrainingHistory: () => Promise<void>
  loadActiveSessions: () => Promise<void>
  updateSessionProgress: (sessionId: string, progress: number) => void
}

export const useTrainingStore = create<TrainingStore>()(
  devtools(
    (set, get) => ({
      options: [],
      sessions: [],
      history: [],
      currentSession: null,
      loading: false,
      error: null,

      loadTrainingOptions: async () => {
        set({ loading: true, error: null })
        try {
          const response = await smartApi.getTrainingOptions()
          if (response.success && response.data) {
            set({ 
              options: response.data, 
              loading: false 
            })
          } else {
            throw new Error(response.error || 'Failed to load training options')
          }
        } catch (error) {
          const handledError = handleError(error)
          set({ 
            error: handledError.message, 
            loading: false 
          })
        }
      },

      joinTraining: async (optionId) => {
        set({ loading: true, error: null })
        try {
          // TODO: Implement actual join training API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock successful join
          const mockSession: TrainingSession = {
            id: `session-${Date.now()}`,
            trainingOptionId: optionId,
            userId: '1',
            startTime: new Date().toISOString(),
            status: 'active',
            progress: 0,
            computeContributed: 0,
            tokensEarned: 0,
            reputationEarned: 0,
            metrics: {
              throughput: 0,
              efficiency: 0,
              uptime: 100,
              errorRate: 0
            }
          }
          
          set(state => ({ 
            sessions: [...state.sessions, mockSession],
            currentSession: mockSession,
            loading: false 
          }))
        } catch (error) {
          const handledError = handleError(error)
          set({ 
            error: handledError.message, 
            loading: false 
          })
        }
      },

      loadTrainingHistory: async () => {
        set({ loading: true, error: null })
        try {
          // TODO: Load from API
          set({ loading: false })
        } catch (error) {
          const handledError = handleError(error)
          set({ 
            error: handledError.message, 
            loading: false 
          })
        }
      },

      loadActiveSessions: async () => {
        set({ loading: true, error: null })
        try {
          // TODO: Load from API
          set({ loading: false })
        } catch (error) {
          const handledError = handleError(error)
          set({ 
            error: handledError.message, 
            loading: false 
          })
        }
      },

      updateSessionProgress: (sessionId, progress) => {
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, progress }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? { ...state.currentSession, progress }
            : state.currentSession
        }))
      }
    }),
    { name: 'TrainingStore' }
  )
)

// Network Store
interface NetworkStore extends NetworkState {
  loadNetworkStats: () => Promise<void>
  loadContributors: () => Promise<void>
  addSystemLog: (log: Omit<import('../types/cotrain').SystemLog, 'timestamp'>) => void
}

export const useNetworkStore = create<NetworkStore>()(
  devtools(
    (set, get) => ({
      stats: {
        totalNodes: 0,
        activeNodes: 0,
        totalComputeHours: 0,
        modelsTraining: 0,
        totalContributors: 0,
        networkHealth: 0
      },
      contributors: [],
      logs: [],
      loading: false,
      error: null,

      loadNetworkStats: async () => {
        set({ loading: true, error: null })
        try {
          const response = await smartApi.getNetworkStats()
          if (response.success && response.data) {
            set({ 
              stats: response.data, 
              loading: false 
            })
          } else {
            throw new Error(response.error || 'Failed to load network stats')
          }
        } catch (error) {
          const handledError = handleError(error)
          set({ 
            error: handledError.message, 
            loading: false 
          })
        }
      },

      loadContributors: async () => {
        set({ loading: true, error: null })
        try {
          const response = await smartApi.getContributors()
          if (response.success && response.data) {
            set({ 
              contributors: response.data, 
              loading: false 
            })
          } else {
            throw new Error(response.error || 'Failed to load contributors')
          }
        } catch (error) {
          const handledError = handleError(error)
          set({ 
            error: handledError.message, 
            loading: false 
          })
        }
      },

      addSystemLog: (log) => {
        const newLog = {
          ...log,
          timestamp: new Date().toISOString()
        }
        
        set(state => ({
          logs: [newLog, ...state.logs].slice(0, 1000) // Keep only last 1000 logs
        }))
      }
    }),
    { name: 'NetworkStore' }
  )
)

// UI Store
interface UIStore extends UIState {
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light' | 'auto') => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  openModal: (modal: keyof import('../types/cotrain').ModalState) => void
  closeModal: (modal: keyof import('../types/cotrain').ModalState) => void
  closeAllModals: () => void
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'dark',
        sidebarOpen: true,
        notifications: [],
        modals: {
          contribute: false,
          profile: false,
          settings: false,
          training: false
        },
        loading: false,

        toggleSidebar: () => {
          set(state => ({ sidebarOpen: !state.sidebarOpen }))
        },

        setTheme: (theme) => {
          set({ theme })
          // Apply theme to document
          document.documentElement.classList.remove('light', 'dark')
          if (theme !== 'auto') {
            document.documentElement.classList.add(theme)
          } else {
            // Auto theme based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            document.documentElement.classList.add(prefersDark ? 'dark' : 'light')
          }
        },

        addNotification: (notification) => {
          const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date().toISOString(),
            read: false
          }
          
          set(state => ({
            notifications: [newNotification, ...state.notifications]
          }))
          
          // Auto remove notification after duration
          if (notification.duration && notification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id)
            }, notification.duration)
          }
        },

        removeNotification: (id) => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }))
        },

        clearNotifications: () => {
          set({ notifications: [] })
        },

        openModal: (modal) => {
          set(state => ({
            modals: { ...state.modals, [modal]: true }
          }))
        },

        closeModal: (modal) => {
          set(state => ({
            modals: { ...state.modals, [modal]: false }
          }))
        },

        closeAllModals: () => {
          set({
            modals: {
              contribute: false,
              profile: false,
              settings: false,
              training: false
            }
          })
        },

        setLoading: (loading) => {
          set({ loading })
        }
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({ 
          theme: state.theme, 
          sidebarOpen: state.sidebarOpen 
        })
      }
    ),
    { name: 'UIStore' }
  )
)

// Combined store hook for convenience
export const useAppStore = () => {
  const user = useUserStore()
  const training = useTrainingStore()
  const network = useNetworkStore()
  const ui = useUIStore()
  
  return {
    user,
    training,
    network,
    ui
  }
}

// Initialize stores
export const initializeStores = async () => {
  const { loadTrainingOptions } = useTrainingStore.getState()
  const { loadNetworkStats, loadContributors } = useNetworkStore.getState()
  
  // Load initial data
  await Promise.allSettled([
    loadTrainingOptions(),
    loadNetworkStats(),
    loadContributors()
  ])
}