import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Cambiar a la URL real cuando se despliegue

export type ObservationType = 'positive' | 'negative';

export interface Observation {
  id: number;
  member_id: string;
  type: ObservationType;
  comment?: string;
  created_at: string;
}

export const MEMBERS = [
  { id: 'la_ratica99', name: 'la ratica99' },
  { id: 'ferilo12', name: 'ferilo12' },
  { id: 'derek', name: 'Derek' },
  { id: 'andres', name: 'Andrés' },
];

export const useObservations = (filterDays: number | null) => {
  return useQuery({
    queryKey: ['observations', filterDays],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/observations`, {
        params: { days: filterDays === null ? 'all' : filterDays }
      });
      return data as Observation[];
    },
    staleTime: 30000, // Los datos se consideran frescos por 30 segundos
    refetchInterval: 60000, // Recarga automática cada minuto para mantener fluidez
  });
};

export const useAddObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, type, comment }: { memberId: string, type: ObservationType, comment?: string }) => {
      const { data } = await axios.post(`${API_URL}/observations`, {
        memberId,
        type,
        comment
      });
      return data;
    },
    onSuccess: () => {
      // Invalida la caché para refrescar los datos de inmediato
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    }
  });
};
