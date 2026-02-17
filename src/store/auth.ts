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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType?: "client" | "distributor";
  role?: 'user' | 'admin' | 'distributor';
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
  logout: () => void;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  setUserType: (userType: "client" | "distributor") => Promise<void>;
  selectUserType: (userType: "client" | "distributor") => Promise<void>;
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

      // Setters básicos
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem("token", token); // ✅ Clave correcta
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
          // Llamar a la API real de login
          const response = await apiHelpers.login({ email, password });

          console.log("🔵 Login exitoso:", response.data);
          
          // 🔧 El backend devuelve: { success, message, data: { token, user } }
          // Necesitamos acceder a response.data.data para obtener token y user
          const loginData = (response.data as any).data || response.data;
          
          console.log("🔵 Token recibido:", loginData.token);
          console.log("🔵 User recibido:", loginData.user);
          console.log("🔵 Role del user:", loginData.user?.role);
          console.log("🔵 distributorCode del user:", loginData.user?.distributorCode);
          console.log("🔵 distributorCode tipo:", typeof loginData.user?.distributorCode, "| valor:", JSON.stringify(loginData.user?.distributorCode));

          const { token, user } = loginData;

          // Determinar userType basado en múltiples criterios
          const userType: 'client' | 'distributor' = 
            user.distributorCode || 
            user.role === 'distributor' || 
            (user.planName && user.planName !== 'free') 
            ? 'distributor' 
            : 'client';

          // Crear el usuario con la estructura esperada
          const loggedUser: User = {
            id: user.email, // Usar email como ID ya que no viene ID en la respuesta
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType,
            isVerified: user.isVerified,
            role: user.role,
            plan: user.planId ? {
              id: user.planId,
              name: user.planName,
              displayName: user.planDisplayName,
              price: 0, // No viene en la respuesta, poner default
              currency: 'USD',
              billingCycle: 'monthly',
            } : undefined,
            // Mapear distributorCode (el único campo que viene en la respuesta de login)
            distributorInfo: user.distributorCode ? {
              distributorCode: user.distributorCode,
            } : undefined,
          };

          console.log("🔵 Usuario creado para el store:", loggedUser);
          console.log("🔵 Role guardado en loggedUser:", loggedUser.role);

          set({
            user: loggedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log("🔵 Estado actualizado en el store");

          // 🔧 Guardar token y usuario en localStorage con las claves correctas
          localStorage.setItem("token", token); // ✅ Clave correcta para auth guard
          localStorage.setItem("user", JSON.stringify(loggedUser)); // ✅ Guardar usuario también
          localStorage.setItem("auth_token", token); // Mantener por compatibilidad
          
          console.log("✅ Token y usuario guardados en localStorage");

          // Mostrar notificación de éxito
          showToast({
            title: "¡Bienvenido!",
            description: `Sesión iniciada como ${loggedUser.firstName} ${loggedUser.lastName}`,
            type: "success",
          });
        } catch (error: unknown) {
          console.error("Error en login:", error);
          set({ isLoading: false });
          
          // Mostrar notificación de error
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
        });
        
        // 🔧 Limpiar todas las claves de localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("temp_auth_token");

        // Mostrar notificación de despedida
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
          // Preparar los datos con passwordConfirmation
          const registerData = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            passwordConfirmation: data.password, // Agregar confirmación
          };

          // Llamar a la API real
          const response = await apiHelpers.register(registerData);

          // 🔧 El backend devuelve: { success, message, data: { otp, token, user } }
          const registerResponse = (response.data as any).data || response.data;
          const { user, token, otp } = registerResponse;

          // Guardar el token temporal para verificación
          if (token) {
            localStorage.setItem('temp_auth_token', token);
          }

          // Crear usuario temporal con los datos de la respuesta
          const registeredUser: User = {
            id: user.email, // Usar email como id temporal hasta que tengamos un id real
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified || false,
            userType: undefined, // Se definirá después de la verificación OTP
          };

          set({
            registrationData: data,
            user: registeredUser,
            otpSent: true,
            registrationStep: "otp",
            isLoading: false,
          });

          // Mostrar notificación de éxito con el OTP en desarrollo (solo para debugging)
          showToast({
            title: "¡Registro exitoso!",
            description: `Código de verificación enviado a ${data.email}`,
            type: "success",
          });

          // En desarrollo, mostrar el OTP en consola
          console.log("🔐 OTP para desarrollo:", otp);
        } catch (error: unknown) {
          set({ isLoading: false, isRegistering: false });
          
          // Extraer mensaje de error del backend
          let errorMessage = "Error al registrar usuario. Inténtalo de nuevo.";
          let errorTitle = "Error en el registro";
          
          if (error instanceof Error) {
            errorMessage = error.message;
            
            // Personalizar el título según el tipo de error
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
          
          // Lanzar error con mensaje más específico
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

          // Verificar OTP con la API real
          const response = await apiHelpers.verifyOTP({
            email: registrationData.email,
            otp: otp,
          });

          // 🔧 El backend devuelve: { success, message, data: {...} }
          const verifyData = (response.data as any).data || response.data;
          console.log("OTP verificado:", verifyData);

          set({
            otpVerified: true,
            registrationStep: "userType",
            isLoading: false,
          });

          // Mostrar notificación de éxito
          showToast({
            title: "¡Código verificado!",
            description: "Tu cuenta ha sido verificada exitosamente",
            type: "success",
          });
        } catch (error: unknown) {
          console.error("Error verificando OTP:", error);
          set({ isLoading: false });
          
          // Mostrar notificación de error
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

      selectUserType: async (userType: "client" | "distributor") => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { registrationData } = get();

          if (userType === "client") {
            // 🔐 Obtener el token temporal y moverlo a auth_token permanente
            const tempToken = localStorage.getItem('temp_auth_token');
            if (tempToken) {
              localStorage.removeItem('temp_auth_token');
              
              // Usar setToken para guardar correctamente en ambas claves
              get().setToken(tempToken);
              console.log("✅ Token movido de temp_auth_token a auth_token para cliente usando setToken");
            } else {
              console.warn("⚠️ No se encontró temp_auth_token al completar registro de cliente");
            }

            // Si es cliente, completar registro automáticamente
            const newUser: User = {
              id: Date.now().toString(),
              email: registrationData?.email || "",
              firstName: registrationData?.firstName || "",
              lastName: registrationData?.lastName || "",
              userType: "client",
              role: "user",
              isVerified: true,
            };

            set({
              user: newUser,
              token: tempToken || null,
              isAuthenticated: true,
              registrationStep: "completed",
              isLoading: false,
              isRegistering: false,
            });

            // Mostrar notificación de bienvenida para clientes
            showToast({
              title: "¡Registro completado!",
              description: `Bienvenido a Virtago, ${newUser.firstName}`,
              type: "success",
            });
          } else {
            // Si es distribuidor, crear/actualizar usuario con el tipo y continuar al siguiente paso
            const { user } = get();
            const updatedUser: User = {
              ...user,
              id: user?.id || Date.now().toString(),
              email: registrationData?.email || user?.email || "",
              firstName: registrationData?.firstName || user?.firstName || "",
              lastName: registrationData?.lastName || user?.lastName || "",
              userType: "distributor",
              role: "distributor",
              isVerified: user?.isVerified || true,
            };

            set({
              user: updatedUser,
              registrationStep: "personalInfo",
              isLoading: false,
            });

            // Mostrar notificación informativa para distribuidores
            showToast({
              title: "Tipo de cuenta seleccionado",
              description: "Por favor completa tu información personal",
              type: "info",
            });
          }
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

          // Completar registro del distribuidor
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

      // Nuevos métodos requeridos por los componentes
      resendOTP: async () => {
        set({ isLoading: true });
        try {
          const { registrationData } = get();
          
          if (!registrationData?.email) {
            throw new Error("No se encontraron datos de registro");
          }

          // Reenviar OTP con la API real
          const response = await apiHelpers.resendOTP(registrationData.email);

          // 🔧 El backend devuelve: { success, message, data: { otp, token, user } }
          const resendData = (response.data as any).data || response.data;
          console.log("OTP reenviado:", resendData);

          // La API devuelve: { success, message, data: { otp, token, user } }
          const { otp } = resendData;

          set({
            otpSent: true,
            isLoading: false,
          });

          // Mostrar notificación de éxito
          showToast({
            title: "Código reenviado",
            description: `Se envió un nuevo código de verificación a ${registrationData.email}`,
            type: "info",
          });

          // En desarrollo, mostrar el nuevo OTP en consola
          console.log("🔐 Nuevo OTP para desarrollo:", otp);
        } catch (error: unknown) {
          console.error("Error reenviando OTP:", error);
          set({ isLoading: false });
          
          // Mostrar notificación de error
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

      setUserType: async (userType: "client" | "distributor") => {
        return get().selectUserType(userType);
      },

      updatePersonalInfo: async (data: Record<string, unknown>) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Actualizar datos del usuario con información personal preservando userType y role
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

          // Pasar al siguiente paso
          set({
            registrationStep: "businessInfo",
            isLoading: false,
          });

          // Mostrar notificación de éxito
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

          // Actualizar información de negocio preservando userType y role
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

          // Pasar al siguiente paso: selección de plan
          set({
            registrationStep: "planSelection",
            isLoading: false,
          });

          // Mostrar notificación de éxito
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
        console.log("🟡 Store: Iniciando selectPlan para plan:", plan.displayName);
        set({ isLoading: true });
        try {
          // Recopilar todos los datos del distribuidor
          const { user, registrationData } = get();
          console.log("🟡 Store: Datos recopilados, creando payload...");
          
          // Verificar que tenemos un token válido
          const currentToken = localStorage.getItem('auth_token') || localStorage.getItem('temp_auth_token');
          if (!currentToken) {
            throw new Error('No se encontró un token de autenticación válido. Por favor inicia sesión nuevamente.');
          }
          console.log("🟡 Store: Token encontrado:", currentToken ? 'Presente' : 'No presente');
          
          // Crear el payload completo del distribuidor
          const distributorPayload = {
            // Información personal
            firstName: registrationData?.firstName || user?.firstName || "",
            lastName: registrationData?.lastName || user?.lastName || "",
            email: registrationData?.email || user?.email || "",
            phone: user?.profile?.phone || "",
            birthDate: user?.profile?.birthDate || "",
            address: user?.profile?.address || "",
            city: user?.profile?.city || "",
            country: user?.profile?.country || "Uruguay",
            
            // Información empresarial
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
            
            // Plan seleccionado
            selectedPlan: {
              id: plan.id,
              name: plan.name,
              displayName: plan.displayName,
              price: plan.price,
              currency: plan.currency,
              billingCycle: plan.billingCycle,
            },
          };

          // Llamar SOLO a la API para crear el distribuidor completo (incluye el plan)
          console.log("🟡 Store: Llamando a apiHelpers.createDistributor...");
          console.log("🟡 Store: Payload enviado:", distributorPayload);
          
          let apiResult;
          try {
            apiResult = await apiHelpers.createDistributor(distributorPayload);
            console.log("✅ Store: createDistributor exitoso, respuesta:", apiResult);
            
            // 🔧 El backend devuelve: { success, message, data: { distributor } }
            const distributorData = (apiResult.data as any).data || apiResult.data;
            
            console.log("✅ Store: distributorCode recibido del backend:", distributorData.distributor?.distributorCode);
            console.log("✅ Store: Actualizando estado...");
          } catch (apiError) {
            console.error("❌ Store: Error específico de la API:", apiError);
            console.log("❌ Store: Tipo de error:", typeof apiError);
            console.log("❌ Store: Error props:", Object.keys(apiError || {}));
            throw apiError; // Re-lanzar para que sea capturado por el catch principal
          }

          // SOLO si la API fue exitosa, actualizar el estado
          
          // 🔧 Extraer el objeto distributor de la respuesta correcta
          const distributorData = (apiResult.data as any).data || apiResult.data;
          
          // Actualizar usuario con el plan seleccionado, role, userType Y distributorCode del backend
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
                distributorCode: backendDistributor.distributorCode, // 🔥 GUARDAR el distributorCode del backend
              },
            };
            console.log("✅ Store: Usuario actualizado con distributorCode:", updatedUser.distributorInfo?.distributorCode);
            set({ user: updatedUser });
          }

          // IMPORTANTE: Usar el token existente (del registro), no crear uno mock
          const finalToken = currentToken;
          
          // Si había un temp_auth_token, moverlo a auth_token permanente usando setToken
          if (localStorage.getItem('temp_auth_token')) {
            const tempToken = localStorage.getItem('temp_auth_token')!;
            localStorage.removeItem('temp_auth_token');
            
            // Usar setToken para guardar correctamente en ambas claves
            get().setToken(tempToken);
            console.log("✅ Store: Token temporal movido a auth_token permanente usando setToken");
          }

          // Pasar al paso final
          set({
            token: finalToken,
            registrationStep: "completed",
            isLoading: false,
            isRegistering: false,
            isAuthenticated: true,
          });

          // Mostrar notificación de éxito
          showToast({
            title: "¡Registro completado!",
            description: `Bienvenido a Virtago con el plan ${plan.displayName}. Tu cuenta está lista.`,
            type: "success",
          });
        } catch (error) {
          console.error("❌ Store: Error en selectPlan:", error);
          console.log("❌ Store: Restableciendo isLoading a false");
          set({ isLoading: false });
          
          // Mostrar notificación de error
          const errorMessage = error instanceof Error 
            ? error.message 
            : "Error al seleccionar el plan";
          
          showToast({
            title: "Error al seleccionar plan",
            description: errorMessage,
            type: "error",
          });
          
          console.log("❌ Store: Haciendo throw del error para propagarlo al componente");
          throw error;
        }
      },

      completeRegistration: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { registrationData, user } = get();

          // Crear usuario final con toda la información
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

          // Usar el token existente del registro/verificación, no crear uno mock
          const existingToken = localStorage.getItem('auth_token') || localStorage.getItem('temp_auth_token');
          
          if (!existingToken) {
            throw new Error('No se encontró un token de autenticación válido. Por favor inicia sesión nuevamente.');
          }

          // Si había un temp_auth_token, moverlo a auth_token permanente usando setToken
          if (localStorage.getItem('temp_auth_token')) {
            const tempToken = localStorage.getItem('temp_auth_token')!;
            localStorage.removeItem('temp_auth_token');
            
            // Usar setToken para guardar correctamente en ambas claves
            get().setToken(tempToken);
            console.log("✅ Store: Token temporal movido a auth_token permanente en completeRegistration");
          }

          set({
            user: completedUser,
            token: existingToken,
            isAuthenticated: true,
            registrationStep: "completed",
            isLoading: false,
            isRegistering: false,
          });

          // Mostrar notificación de finalización exitosa
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
