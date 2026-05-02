import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Plan } from "@/api";
import { apiHelpers } from "./api-helpers";
import { showToast } from "./toast-helpers";

// Interface local para el Plan (para evitar dependencias circulares)
export interface PlanInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  limits: {
    clients: number;
    products: number;
    storage: number;
    orders: number;
    categories: number;
    brands: number;
    discounts: number;
    aiRequests: number;
  };
  isActive: boolean;
  isDefault: boolean;
  order: number;
  aiSupport: boolean;
  supportLevel: string;
}

export type UserRole = 'user' | 'admin' | 'distributor' | 'company' | 'vendor' | 'superadmin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType?: "client" | "distributor" | "company" | "vendor";
  role?: UserRole;
  isVerified: boolean;
  profile?: {
    phone?: string;
    gender?: string;
    country?: string;
    city?: string;
    address?: string;
    zip?: string;
    documentType?: string;
    document?: string;
    birthDate?: string;
  };
  distributorInfo?: {
    distributorCode?: string;
    businessName?: string;
    businessType?: string;
    ruc?: string;
    businessAddress?: string;
    businessCity?: string;
    businessCountry?: string;
    businessPhone?: string;
    businessEmail?: string;
    website?: string;
    description?: string;
    yearsInBusiness?: string;
    numberOfEmployees?: string;
    distributorName?: string;
    pdv?: string;
    pdvname?: string;
    warehouse?: string;
    withCredit?: boolean;
    paymentTerm?: string;
    paymentMethodCode?: string;
    companyCode?: string;
  };
  plan?: {
    id: string;
    name: string;
    displayName: string;
    price: number;
    currency: string;
    billingCycle: string;
  };
  // OAuth provider info
  oauthProvider?: 'google' | 'microsoft' | null;
  // Profile completeness flag (invisible to user, for distributor/company)
  profileComplete?: boolean;
}

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Registro
  registrationData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  } | null;
  isRegistering: boolean;
  otpSent: boolean;
  otpVerified: boolean;
  registrationStep:
    | "initial"
    | "otp"
    | "userType"
    | "personalInfo"
    | "businessInfo"
    | "planSelection"
    | "completed";

  // Login con OTP (post-login para usuarios existentes)
  loginOtpStep: boolean;
  loginEmail: string | null;

  // Rol pendiente de asignación (usuarios nuevos sin rol)
  rolePending: boolean;

  // Acciones
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  // Acciones de registro
  setRegistrationData: (data: Partial<AuthState["registrationData"]>) => void;
  setIsRegistering: (isRegistering: boolean) => void;
  setOtpSent: (otpSent: boolean) => void;
  setOtpVerified: (otpVerified: boolean) => void;
  setRegistrationStep: (step: AuthState["registrationStep"]) => void;

  // Helpers
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'microsoft', token: string) => Promise<void>;
  verifyLoginOTP: (otp: string) => Promise<void>;
  assignRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  setUserType: (userType: "client" | "distributor" | "company" | "vendor") => Promise<void>;
  selectUserType: (userType: "client" | "distributor" | "company" | "vendor") => Promise<void>;
  updatePersonalInfo: (data: Record<string, unknown>) => Promise<void>;
  updateBusinessInfo: (data: Record<string, unknown>) => Promise<void>;
  completeRegistration: () => Promise<void>;
  updateUserDetails: (data: Partial<User["profile"]>) => Promise<void>;
  updateDistributorInfo: (
    data: Partial<User["distributorInfo"]>,
  ) => Promise<void>;
  selectPlan: (plan: Plan) => Promise<void>;
  resetRegistration: () => void;
}

/** Redirect destination based on assigned role */
export function getRedirectForRole(role: UserRole): string {
  switch (role) {
    case 'superadmin':
      return '/superadmin';
    case 'admin':
    case 'distributor':
    case 'company':
    case 'vendor':
      return '/admin';
    case 'user':
    default:
      return '/';
  }
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
      registrationStep: "initial",

      // Login OTP step
      loginOtpStep: false,
      loginEmail: null,

      // Role pending
      rolePending: false,

      // Setters básicos
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("auth_token", token); // Compatibilidad
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
        }
      },
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),

      // Setters de registro
      setRegistrationData: (data) =>
        set((state) => ({
          registrationData: {
            ...state.registrationData,
            ...data,
          } as AuthState["registrationData"],
        })),
      setIsRegistering: (isRegistering) => set({ isRegistering }),
      setOtpSent: (otpSent) => set({ otpSent }),
      setOtpVerified: (otpVerified) => set({ otpVerified }),
      setRegistrationStep: (registrationStep) => set({ registrationStep }),

      // Funciones de autenticación
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiHelpers.login({ email, password });

          console.log("Login exitoso:", response.data);

          const loginData = (response.data as any).data || response.data;

          const { token, user } = loginData;

          const userType: User["userType"] =
            user.role === 'company' ? 'company' :
            user.role === 'vendor' ? 'vendor' :
            (user.distributorCode || user.role === 'distributor' || (user.planName && user.planName !== 'free'))
            ? 'distributor'
            : 'client';

          const loggedUser: User = {
            id: user.email,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType,
            isVerified: user.isVerified,
            role: user.role as UserRole,
            plan: user.planId ? {
              id: user.planId,
              name: user.planName,
              displayName: user.planDisplayName,
              price: 0,
              currency: 'USD',
              billingCycle: 'monthly',
            } : undefined,
            distributorInfo: user.distributorCode ? {
              distributorCode: user.distributorCode,
            } : undefined,
            oauthProvider: null,
          };

          // Store temp token; login page will trigger OTP step
          localStorage.setItem("temp_auth_token", token);
          localStorage.setItem("user", JSON.stringify(loggedUser));

          set({
            isLoading: false,
            loginOtpStep: true,
            loginEmail: email,
            // Store user temporarily to have it available after OTP
            user: loggedUser,
          });

        } catch (error: unknown) {
          console.error("Error en login:", error);
          set({ isLoading: false });

          const errorMessage = error instanceof Error
            ? error.message
            : "Error al iniciar sesión. Verifica tus credenciales.";

          showToast({
            title: "Error de autenticación",
            description: errorMessage,
            type: "error",
          });

          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error("Error al iniciar sesión. Verifica tus credenciales.");
          }
        }
      },

      /** Verify OTP sent after email+password login */
      verifyLoginOTP: async (otp: string) => {
        set({ isLoading: true });
        try {
          const { loginEmail, user } = get();

          if (!loginEmail) {
            throw new Error("No se encontraron datos de login");
          }

          const response = await apiHelpers.verifyOTP({
            email: loginEmail,
            otp,
          });

          const verifyData = (response.data as any).data || response.data;
          console.log("Login OTP verificado:", verifyData);

          const tempToken = localStorage.getItem('temp_auth_token');
          if (tempToken) {
            localStorage.removeItem('temp_auth_token');
            get().setToken(tempToken);
          }

          // Check if role is already assigned
          const rolePending = !user?.role || user.role === 'user' && !user.isVerified;
          // More accurate check: only show role selection if this is truly a new unverified user
          // For existing verified users, always skip role selection
          const isNewUser = user && !user.isVerified;

          set({
            isLoading: false,
            loginOtpStep: false,
            loginEmail: null,
            isAuthenticated: true,
            rolePending: !!isNewUser,
          });

          if (!isNewUser) {
            showToast({
              title: "¡Bienvenido!",
              description: `Sesión iniciada como ${user?.firstName} ${user?.lastName}`,
              type: "success",
            });
          }

        } catch (error: unknown) {
          console.error("Error verificando OTP de login:", error);
          set({ isLoading: false });

          const errorMessage = error instanceof Error
            ? error.message
            : "Código incorrecto. Inténtalo de nuevo.";

          showToast({
            title: "Código incorrecto",
            description: errorMessage,
            type: "error",
          });

          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error("Código incorrecto. Inténtalo de nuevo.");
          }
        }
      },

      /** Authenticate via Google or Microsoft OAuth token */
      loginWithOAuth: async (provider: 'google' | 'microsoft', providerToken: string) => {
        set({ isLoading: true });
        try {
          const endpoint = provider === 'google' ? 'google' : 'microsoft';
          const response = await apiHelpers.oauthLogin(endpoint, providerToken);

          const loginData = (response.data as any).data || response.data;
          const { token, user } = loginData;

          const userType: User["userType"] =
            user.role === 'company' ? 'company' :
            user.role === 'vendor' ? 'vendor' :
            (user.distributorCode || user.role === 'distributor') ? 'distributor' : 'client';

          const loggedUser: User = {
            id: user.id || user.email,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            userType,
            isVerified: true, // OAuth users are auto-verified
            role: user.role as UserRole,
            oauthProvider: provider,
            plan: user.planId ? {
              id: user.planId,
              name: user.planName,
              displayName: user.planDisplayName,
              price: 0,
              currency: 'USD',
              billingCycle: 'monthly',
            } : undefined,
          };

          get().setToken(token);
          localStorage.setItem("user", JSON.stringify(loggedUser));

          // Determine if role selection needed (new OAuth user)
          const isNewUser = user.isNew === true || !user.role;

          set({
            user: loggedUser,
            isAuthenticated: true,
            isLoading: false,
            rolePending: isNewUser,
            loginOtpStep: false,
          });

          if (!isNewUser) {
            showToast({
              title: "¡Bienvenido!",
              description: `Sesión iniciada con ${provider === 'google' ? 'Google' : 'Microsoft'}`,
              type: "success",
            });
          }
        } catch (error: unknown) {
          console.error(`Error en OAuth ${provider}:`, error);
          set({ isLoading: false });

          const errorMessage = error instanceof Error
            ? error.message
            : `Error al autenticar con ${provider === 'google' ? 'Google' : 'Microsoft'}`;

          showToast({
            title: "Error de autenticación",
            description: errorMessage,
            type: "error",
          });

          throw error instanceof Error ? error : new Error(errorMessage);
        }
      },

      /** Assign role to a new user (post-login role selection for OAuth users) */
      assignRole: async (role: UserRole) => {
        set({ isLoading: true });
        try {
          const { user } = get();

          // Call backend to persist role
          await apiHelpers.setRole(role);

          // For distributor and company: mark profileComplete=false (data pending, invisible to user)
          const needsProfileCompletion = role === 'distributor' || role === 'company';

          const updatedUser: User = {
            ...user!,
            role,
            userType:
              role === 'company' ? 'company' :
              role === 'vendor' ? 'vendor' :
              role === 'distributor' ? 'distributor' : 'client',
            isVerified: true,
            profileComplete: needsProfileCompletion ? false : true,
          };

          set({
            user: updatedUser,
            rolePending: false,
            isLoading: false,
          });

          localStorage.setItem("user", JSON.stringify(updatedUser));

          showToast({
            title: "¡Bienvenido a Virtago!",
            description: `Cuenta configurada como ${
              role === 'user' ? 'Cliente' :
              role === 'distributor' ? 'Distribuidor' :
              role === 'company' ? 'Compañía' :
              role === 'vendor' ? 'Vendedor' : role
            }`,
            type: "success",
          });
        } catch (error: unknown) {
          console.error("Error asignando rol:", error);
          set({ isLoading: false });

          showToast({
            title: "Error",
            description: "No se pudo asignar el rol. Inténtalo de nuevo.",
            type: "error",
          });

          throw error instanceof Error ? error : new Error("Error asignando rol");
        }
      },

      logout: () => {
        const { user } = get();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          registrationData: null,
          isRegistering: false,
          otpSent: false,
          otpVerified: false,
          registrationStep: "initial",
          loginOtpStep: false,
          loginEmail: null,
          rolePending: false,
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("temp_auth_token");

        showToast({
          title: "Sesión cerrada",
          description: user
            ? `¡Hasta luego, ${user.firstName}!`
            : "Has cerrado sesión exitosamente",
          type: "info",
        });
      },

      register: async (data) => {
        set({ isLoading: true, isRegistering: true });
        try {
          const registerData = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            passwordConfirmation: data.password,
          };

          const response = await apiHelpers.register(registerData);

          const registerResponse = (response.data as any).data || response.data;
          const { user, token, otp } = registerResponse;

          if (token) {
            localStorage.setItem('temp_auth_token', token);
          }

          const registeredUser: User = {
            id: user.email,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified || false,
            userType: undefined,
          };

          set({
            registrationData: data,
            user: registeredUser,
            otpSent: true,
            registrationStep: "otp",
            isLoading: false,
          });

          showToast({
            title: "¡Registro exitoso!",
            description: `Código de verificación enviado a ${data.email}`,
            type: "success",
          });

          console.log("OTP para desarrollo:", otp);
        } catch (error: unknown) {
          set({ isLoading: false, isRegistering: false });

          let errorMessage = "Error al registrar usuario. Inténtalo de nuevo.";
          let errorTitle = "Error en el registro";

          if (error instanceof Error) {
            errorMessage = error.message;
            const errorData = (error as Error & { data?: { errorCode?: string; email?: string } }).data;
            if (errorData?.errorCode === 'EMAIL_ALREADY_EXISTS') {
              errorTitle = "Correo ya registrado";
              errorMessage = `El correo ${errorData.email || data.email} ya está registrado. Por favor, usa otro correo o inicia sesión.`;
            }
          } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = String((error as { message: unknown }).message);
          }

          showToast({
            title: errorTitle,
            description: errorMessage,
            type: "error",
          });

          if (error instanceof Error) {
            throw error;
          } else if (typeof error === 'object' && error !== null && 'message' in error) {
            throw new Error(String((error as { message: unknown }).message));
          } else {
            throw new Error("Error al registrar usuario. Inténtalo de nuevo.");
          }
        }
      },

      verifyOTP: async (otp: string) => {
        set({ isLoading: true });
        try {
          const { registrationData } = get();

          if (!registrationData?.email) {
            throw new Error("No se encontraron datos de registro");
          }

          const response = await apiHelpers.verifyOTP({
            email: registrationData.email,
            otp: otp,
          });

          const verifyData = (response.data as any).data || response.data;
          console.log("OTP verificado:", verifyData);

          set({
            otpVerified: true,
            registrationStep: "userType",
            isLoading: false,
          });

          showToast({
            title: "¡Código verificado!",
            description: "Tu cuenta ha sido verificada exitosamente",
            type: "success",
          });
        } catch (error: unknown) {
          console.error("Error verificando OTP:", error);
          set({ isLoading: false });

          const errorMessage = error instanceof Error
            ? error.message
            : "Error al verificar OTP. Inténtalo de nuevo.";

          showToast({
            title: "Código incorrecto",
            description: errorMessage,
            type: "error",
          });

          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error("Error al verificar OTP. Inténtalo de nuevo.");
          }
        }
      },

      /**
       * Selects user type during registration (normal email flow).
       * All 4 types complete registration immediately — no extra steps.
       * distributor and company get profileComplete=false (pending data, invisible to user).
       */
      selectUserType: async (userType: "client" | "distributor" | "company" | "vendor") => {
        set({ isLoading: true });
        try {
          const { registrationData, user } = get();

          const tempToken = localStorage.getItem('temp_auth_token');
          if (tempToken) {
            localStorage.removeItem('temp_auth_token');
            get().setToken(tempToken);
          }

          // Map userType to role
          const role: UserRole =
            userType === 'client' ? 'user' :
            userType === 'distributor' ? 'distributor' :
            userType === 'company' ? 'company' : 'vendor';

          // Call backend to persist role
          await apiHelpers.setRole(role);

          // distributor and company: mark profileComplete=false (pending extra data, invisible to user)
          const needsProfileCompletion = userType === 'distributor' || userType === 'company';

          const newUser: User = {
            id: user?.id || Date.now().toString(),
            email: registrationData?.email || user?.email || "",
            firstName: registrationData?.firstName || user?.firstName || "",
            lastName: registrationData?.lastName || user?.lastName || "",
            userType,
            role,
            isVerified: true,
            profileComplete: needsProfileCompletion ? false : true,
          };

          set({
            user: newUser,
            token: tempToken || get().token,
            isAuthenticated: true,
            registrationStep: "completed",
            isLoading: false,
            isRegistering: false,
          });

          const roleLabel =
            userType === 'client' ? 'Cliente' :
            userType === 'distributor' ? 'Distribuidor' :
            userType === 'company' ? 'Compañía' : 'Vendedor';

          showToast({
            title: "¡Bienvenido a Virtago!",
            description: `Cuenta creada como ${roleLabel}. Ya podés empezar a usar la plataforma.`,
            type: "success",
          });
        } catch (error) {
          set({ isLoading: false });

          showToast({
            title: "Error",
            description: "Error al seleccionar tipo de usuario",
            type: "error",
          });

          throw error;
        }
      },

      updateUserDetails: async (data) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { user } = get();
          if (user) {
            const updatedUser = {
              ...user,
              profile: { ...user.profile, ...data },
            };
            set({ user: updatedUser });
          }

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateDistributorInfo: async (data) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { user, registrationData } = get();

          const completedUser: User = {
            id: Date.now().toString(),
            email: registrationData?.email || user?.email || "",
            firstName: registrationData?.firstName || user?.firstName || "",
            lastName: registrationData?.lastName || user?.lastName || "",
            userType: "distributor",
            role: "distributor",
            isVerified: true,
            profile: user?.profile,
            distributorInfo: data,
          };

          set({
            user: completedUser,
            isAuthenticated: true,
            registrationStep: "completed",
            isLoading: false,
            isRegistering: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetRegistration: () => {
        set({
          registrationData: null,
          isRegistering: false,
          otpSent: false,
          otpVerified: false,
          registrationStep: "initial",
        });
      },

      resendOTP: async () => {
        set({ isLoading: true });
        try {
          const { registrationData } = get();

          if (!registrationData?.email) {
            throw new Error("No se encontraron datos de registro");
          }

          const response = await apiHelpers.resendOTP(registrationData.email);

          const resendData = (response.data as any).data || response.data;
          console.log("OTP reenviado:", resendData);

          const { otp } = resendData;

          set({
            otpSent: true,
            isLoading: false,
          });

          showToast({
            title: "Código reenviado",
            description: `Se envió un nuevo código de verificación a ${registrationData.email}`,
            type: "info",
          });

          console.log("Nuevo OTP para desarrollo:", otp);
        } catch (error: unknown) {
          console.error("Error reenviando OTP:", error);
          set({ isLoading: false });

          const errorMessage = error instanceof Error
            ? error.message
            : "Error al reenviar OTP. Inténtalo de nuevo.";

          showToast({
            title: "Error al reenviar",
            description: errorMessage,
            type: "error",
          });

          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error("Error al reenviar OTP. Inténtalo de nuevo.");
          }
        }
      },

      setUserType: async (userType: "client" | "distributor" | "company" | "vendor") => {
        return get().selectUserType(userType);
      },

      updatePersonalInfo: async (data: Record<string, unknown>) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { user } = get();
          if (user) {
            const updatedUser: User = {
              ...user,
              userType: user.userType || "distributor",
              role: user.role || "distributor",
              profile: { ...user.profile, ...data },
            };
            set({ user: updatedUser });
          }

          set({
            registrationStep: "businessInfo",
            isLoading: false,
          });

          showToast({
            title: "Información personal guardada",
            description: "Ahora completa tu información empresarial",
            type: "success",
          });
        } catch (error) {
          set({ isLoading: false });

          showToast({
            title: "Error",
            description: "Error al guardar información personal",
            type: "error",
          });

          throw error;
        }
      },

      updateBusinessInfo: async (data: Record<string, unknown>) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { user } = get();
          if (user) {
            const updatedUser: User = {
              ...user,
              userType: user.userType || "distributor",
              role: user.role || "distributor",
              distributorInfo: { ...user.distributorInfo, ...data },
            };
            set({ user: updatedUser });
          }

          set({
            registrationStep: "planSelection",
            isLoading: false,
          });

          showToast({
            title: "Información empresarial guardada",
            description: "Ahora selecciona tu plan de suscripción",
            type: "success",
          });
        } catch (error) {
          set({ isLoading: false });

          showToast({
            title: "Error",
            description: "Error al guardar información empresarial",
            type: "error",
          });

          throw error;
        }
      },

      selectPlan: async (plan: Plan) => {
        console.log("Store: Iniciando selectPlan para plan:", plan.displayName);
        set({ isLoading: true });
        try {
          const { user, registrationData } = get();

          const currentToken = localStorage.getItem('auth_token') || localStorage.getItem('temp_auth_token');
          if (!currentToken) {
            throw new Error('No se encontró un token de autenticación válido. Por favor inicia sesión nuevamente.');
          }

          const distributorPayload = {
            firstName: registrationData?.firstName || user?.firstName || "",
            lastName: registrationData?.lastName || user?.lastName || "",
            email: registrationData?.email || user?.email || "",
            phone: user?.profile?.phone || "",
            birthDate: user?.profile?.birthDate || "",
            address: user?.profile?.address || "",
            city: user?.profile?.city || "",
            country: user?.profile?.country || "Uruguay",
            businessName: user?.distributorInfo?.businessName || "",
            businessType: user?.distributorInfo?.businessType || "",
            ruc: user?.distributorInfo?.ruc || "",
            distributorCode: user?.distributorInfo?.distributorCode || "",
            businessAddress: user?.distributorInfo?.businessAddress || "",
            businessCity: user?.distributorInfo?.businessCity || "",
            businessCountry: user?.distributorInfo?.businessCountry || "Uruguay",
            businessPhone: user?.distributorInfo?.businessPhone || "",
            businessEmail: user?.distributorInfo?.businessEmail || "",
            website: user?.distributorInfo?.website || "",
            description: user?.distributorInfo?.description || "",
            yearsInBusiness: parseInt(user?.distributorInfo?.yearsInBusiness as string || "0"),
            numberOfEmployees: user?.distributorInfo?.numberOfEmployees || "",
            selectedPlan: {
              id: plan.id,
              name: plan.name,
              displayName: plan.displayName,
              price: plan.price,
              currency: plan.currency,
              billingCycle: plan.billingCycle,
            },
          };

          const apiResult = await apiHelpers.createDistributor(distributorPayload);

          const distributorData = (apiResult.data as any).data || apiResult.data;

          if (user && distributorData?.distributor) {
            const backendDistributor = distributorData.distributor;
            const updatedUser: User = {
              ...user,
              id: backendDistributor.id || user.id,
              userType: "distributor",
              role: "distributor",
              plan: {
                id: plan.id,
                name: plan.name,
                displayName: plan.displayName,
                price: plan.price,
                currency: plan.currency,
                billingCycle: plan.billingCycle,
              },
              distributorInfo: {
                ...user.distributorInfo,
                distributorCode: backendDistributor.distributorCode,
              },
            };
            set({ user: updatedUser });
          }

          if (localStorage.getItem('temp_auth_token')) {
            const tempToken = localStorage.getItem('temp_auth_token')!;
            localStorage.removeItem('temp_auth_token');
            get().setToken(tempToken);
          }

          set({
            token: currentToken,
            registrationStep: "completed",
            isLoading: false,
            isRegistering: false,
            isAuthenticated: true,
          });

          showToast({
            title: "¡Registro completado!",
            description: `Bienvenido a Virtago con el plan ${plan.displayName}. Tu cuenta está lista.`,
            type: "success",
          });
        } catch (error) {
          console.error("Error en selectPlan:", error);
          set({ isLoading: false });

          const errorMessage = error instanceof Error
            ? error.message
            : "Error al seleccionar el plan";

          showToast({
            title: "Error al seleccionar plan",
            description: errorMessage,
            type: "error",
          });

          throw error;
        }
      },

      completeRegistration: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { registrationData, user } = get();

          const completedUser: User = {
            id: Date.now().toString(),
            email: registrationData?.email || user?.email || "",
            firstName: registrationData?.firstName || user?.firstName || "",
            lastName: registrationData?.lastName || user?.lastName || "",
            userType: user?.userType || "distributor",
            role: user?.userType === "client" ? "user" : "distributor",
            isVerified: true,
            profile: user?.profile,
            distributorInfo: user?.distributorInfo,
          };

          const existingToken = localStorage.getItem('auth_token') || localStorage.getItem('temp_auth_token');

          if (!existingToken) {
            throw new Error('No se encontró un token de autenticación válido. Por favor inicia sesión nuevamente.');
          }

          if (localStorage.getItem('temp_auth_token')) {
            const tempToken = localStorage.getItem('temp_auth_token')!;
            localStorage.removeItem('temp_auth_token');
            get().setToken(tempToken);
          }

          set({
            user: completedUser,
            token: existingToken,
            isAuthenticated: true,
            registrationStep: "completed",
            isLoading: false,
            isRegistering: false,
          });

          showToast({
            title: "¡Registro completado!",
            description: `Bienvenido a Virtago, ${completedUser.firstName}. Tu cuenta de distribuidor está lista.`,
            type: "success",
          });
        } catch (error) {
          set({ isLoading: false });

          showToast({
            title: "Error",
            description: "Error al completar el registro",
            type: "error",
          });

          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
