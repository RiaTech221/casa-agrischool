import api from './api';
import { User } from '../types';

export interface UserUpdateDto {
  nom: string;
  prenom: string;
  telephone: string;
  localisation?: string;
}

export interface ExpertUpdateDto {
  specialite?: string;
  biographie?: string;
  organisme?: string;
}

export const userService = {
  updateProfile: async (data: UserUpdateDto): Promise<User> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  updateExpertProfile: async (data: ExpertUpdateDto): Promise<User> => {
    const response = await api.put('/users/me/expert', data);
    return response.data;
  }
};
