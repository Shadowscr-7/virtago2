// Helper para importaciones seguras de la API
import type { LoginData, RegisterData, OTPVerifyData, CreateDistributorData } from '@/api';

// Funciones wrapper para evitar problemas de chunks
export const apiHelpers = {
  async register(data: RegisterData) {
    try {
      const { api } = await import('@/api');
      return await api.auth.register(data);
    } catch (error) {
      throw error;
    }
  },

  async login(data: LoginData) {
    try {
      const { api } = await import('@/api');
      return await api.auth.login(data);
    } catch (error) {
      throw error;
    }
  },

  async verifyOTP(data: OTPVerifyData) {
    try {
      const { api } = await import('@/api');
      return await api.auth.verifyOTP(data);
    } catch (error) {
      throw error;
    }
  },

  async resendOTP(email: string) {
    try {
      const { api } = await import('@/api');
      return await api.auth.resendOTP(email);
    } catch (error) {
      throw error;
    }
  },

  async selectPlan(planId: string) {
    try {
      const { api } = await import('@/api');
      return await api.plans.selectPlan(planId);
    } catch (error) {
      throw error;
    }
  },

  async getPlans() {
    try {
      const { api } = await import('@/api');
      return await api.plans.getPlans();
    } catch (error) {
      throw error;
    }
  },

  async createDistributor(data: CreateDistributorData) {
    try {
      const { api } = await import('@/api');
      return await api.distributors.create(data);
    } catch (error) {
      throw error;
    }
  },
};

export type { LoginData, RegisterData, OTPVerifyData, CreateDistributorData };