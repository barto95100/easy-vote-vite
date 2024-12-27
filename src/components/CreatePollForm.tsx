'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

interface PollOption {
  id: string;
  text: string;
}

interface ApiError {
  message: string;
}

interface CreatePollResponse {
  id: string;
  title: string;
  options: Array<{ id: string; text: string }>;
}

export function CreatePollForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [expirationValue, setExpirationValue] = useState('');
  const [expirationUnit, setExpirationUnit] = useState<'minutes' | 'days'>('minutes');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = () => {
    setOptions([...options, { id: String(options.length + 1), text: '' }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const handleOptionChange = (id: string, value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text: value } : option
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (title.trim().length < 3) {
      setError('Le titre doit contenir au moins 3 caractères');
      return;
    }

    if (options.some(opt => !opt.text.trim())) {
      setError('Toutes les options doivent être remplies');
      return;
    }

    if (options.length < 2) {
      setError('Au moins 2 options sont requises');
      return;
    }

    if (!expirationValue || parseInt(expirationValue) <= 0) {
      setError('Une durée valide est requise');
      return;
    }

    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsSubmitting(true);
    try {
      const expirationMs = parseInt(expirationValue) * (expirationUnit === 'minutes' ? 60000 : 86400000);
      const expiresAt = new Date(Date.now() + expirationMs);

      console.log('Données envoyées:', {
        title: title.trim(),
        options: options.map(opt => ({ text: opt.text.trim() })),
        expiresAt: expiresAt.toISOString(),
        password
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/polls`, {
        title: title.trim(),
        options: options.map(opt => ({ text: opt.text.trim() })),
        expiresAt: expiresAt.toISOString(),
        password
      });

      console.log('Réponse:', response.data);
      router.push(`/poll/${response.data.id}`);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Erreur serveur:', error.response.data);
        const errorMessage = error.response.data.message || 
          (error.response.data.errors && error.response.data.errors[0]?.message) || 
          'Erreur lors de la création du sondage';
        setError(errorMessage);
      } else {
        setError('Erreur lors de la création du sondage');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-6 bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre du sondage
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez le titre du sondage"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Options</label>
        {options.map((option, index) => (
          <div key={option.id} className="flex gap-2">
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(option.id, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Option ${index + 1}`}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(option.id)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
                aria-label="Supprimer l'option"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddOption}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Ajouter une option
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
            Durée
          </label>
          <input
            type="number"
            id="expiration"
            min="1"
            value={expirationValue}
            onChange={(e) => setExpirationValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="expirationUnit" className="block text-sm font-medium text-gray-700 mb-1">
            Unité
          </label>
          <select
            id="expirationUnit"
            value={expirationUnit}
            onChange={(e) => setExpirationUnit(e.target.value as 'minutes' | 'days')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="minutes">Minutes</option>
            <option value="days">Jours</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Mot de passe pour gérer le sondage"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="spinner" />
            Création en cours...
          </div>
        ) : (
          'Créer le sondage'
        )}
      </button>
    </form>
  );
} 