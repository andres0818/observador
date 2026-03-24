import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://observador1.linapps.online/api' : '/api');

export type ObservationType = 'positive' | 'negative';

export interface Observation {
  id: number;
  member_id: string;
  type: ObservationType;
  comment?: string;
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  hasPassword?: boolean;
}

// Auth API
export const checkUser = async (name: string) => {
  const { data } = await axios.post(`${API_URL}/auth/check`, { name });
  return data as Member;
};

export const setPassword = async (id: string, password: string) => {
  const { data } = await axios.post(`${API_URL}/auth/set-password`, { id, password });
  return data;
};

export const login = async (id: string, password: string) => {
  const { data } = await axios.post(`${API_URL}/auth/login`, { id, password });
  return data as Member;
};

// Hook para obtener todos los miembros
export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/members`);
      return data as Member[];
    }
  });
};

// Hook para añadir un miembro
export const useAddMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (member: { id: string; name: string }) => {
      const { data } = await axios.post(`${API_URL}/members`, member);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] })
  });
};

// Hook para eliminar un miembro
export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`${API_URL}/members/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    }
  });
};

// Hook para obtener observaciones
export const useObservations = (filterDays: number | null, memberId?: string) => {
  return useQuery({
    queryKey: ['observations', filterDays, memberId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/observations`, {
        params: { 
          days: filterDays === null ? 'all' : filterDays,
          memberId 
        }
      });
      return data as Observation[];
    }
  });
};

// Hook para añadir observación
export const useAddObservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, type, comment }: { memberId: string, type: ObservationType, comment?: string }) => {
      const { data } = await axios.post(`${API_URL}/observations`, { memberId, type, comment });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['observations'] })
  });
};

// Hook para eliminar observación
export const useDeleteObservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axios.delete(`${API_URL}/observations/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['observations'] })
  });
};
