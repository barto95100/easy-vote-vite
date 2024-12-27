import type { CreatePollData, Poll, VoteData } from '../types';

const BASE_URL = '/api';  // Utilise le proxy Vite

const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Vérifier si nous avons des erreurs de validation
    if (response.status === 400 && Array.isArray(data.errors)) {
      // Créer un objet pour stocker les erreurs uniques par champ
      const errorsByField = new Map<string, Set<string>>();
      
      // Regrouper les messages d'erreur uniques par champ
      data.errors.forEach((error: any) => {
        if (!error.path || !error.msg) return;
        
        if (!errorsByField.has(error.path)) {
          errorsByField.set(error.path, new Set());
        }
        errorsByField.get(error.path)?.add(error.msg);
      });

      // Traduire les noms des champs et formater les messages
      const fieldTranslations: Record<string, string> = {
        'title': 'Titre',
        'options': 'Options',
        'expiresAt': 'Date d\'expiration',
        'password': 'Mot de passe'
      };

      const formattedErrors = Array.from(errorsByField.entries())
        .map(([field, messages]) => {
          const fieldName = fieldTranslations[field] || field;
          const uniqueMessages = Array.from(messages);
          return `${fieldName}: ${uniqueMessages.join(', ')}`;
        })
        .filter(msg => msg)
        .join('\n');

      if (formattedErrors) {
        throw new Error(formattedErrors);
      }
    }
    
    // Si ce n'est pas une erreur de validation ou si le format est incorrect
    throw new Error(data.message || data.error || 'Une erreur est survenue lors de la requête');
  }
  
  return data;
};

const getAuthToken = () => {
  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) return null;
  
  try {
    const authData = JSON.parse(authStorage);
    return authData.state?.token;
  } catch (e) {
    console.error('Erreur de parsing du token:', e);
    return null;
  }
};

const fetchWithConfig = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Ajouter le token d'authentification si disponible
  const token = getAuthToken();
  if (token) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  try {
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      }
    };

    console.log('🟡 Requête:', {
      url: `${BASE_URL}${url}`,
      method: finalOptions.method,
      headers: finalOptions.headers
    });

    const response = await fetch(`${BASE_URL}${url}`, finalOptions);
    console.log('🟡 Status:', response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('🔴 Erreur fetch:', error);
    throw error;
  }
};

export const api = {
  // Polls
  getPolls: () => fetchWithConfig('/polls'),
  getPoll: (id: string) => fetchWithConfig(`/polls/${id}`),
  createPoll: (data: CreatePollData) => {
    console.log('Données reçues dans createPoll:', data);
    return fetchWithConfig('/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  },
  votePoll: (id: string, data: VoteData) => fetchWithConfig(`/polls/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  closePoll: (id: string, password: string) => fetchWithConfig(`/polls/${id}/close`, {
    method: 'POST',
    body: JSON.stringify({ password })
  }),
  deletePoll: (id: string, password: string) => fetchWithConfig(`/polls/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password })
  }),
  sharePoll: (pollId: string, data: { emails: string[], title: string }) => 
    fetchWithConfig(`/polls/${pollId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin
  login: (password: string) => fetchWithConfig('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
  getConfig: () => fetchWithConfig('/admin/config', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  }),
  updateConfig: (config: any) => fetchWithConfig('/admin/config', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(config)
  }),
  testSmtp: (smtpConfig: SmtpConfig & { testEmail: string }) => fetchWithConfig('/admin/smtp/test', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      password: smtpConfig.password,
      from: decodeHTMLEntities(smtpConfig.from),
      secure: false,
      testEmail: smtpConfig.testEmail
    })
  }),
};

// Export des méthodes individuelles
export const getPolls = () => api.getPolls();
export const getPoll = (id: string) => api.getPoll(id);
export const createPoll = (data: CreatePollData) => api.createPoll(data);
export const votePoll = async (pollId: string, data: { optionId: string; fingerprint: string; token?: string }) => {
  const { token, ...voteData } = data;
  const url = token 
    ? `/api/polls/${pollId}/vote?token=${token}`
    : `/api/polls/${pollId}/vote`;

  const response = await fetchWithConfig(url, {
    method: 'POST',
    body: JSON.stringify(voteData)
  });

  return response;
};
export const closePoll = async (pollId: string, password: string) => {
  // ✅ Utiliser HTTPS pour la transmission
  // ✅ Ne jamais stocker le mot de passe en clair dans le state
  return api.post(`/polls/${pollId}/close`, { 
    password: password // Le mot de passe est envoyé via HTTPS
  });
};
export const deletePoll = (pollId: string, password: string) => api.deletePoll(pollId, password);
export const sharePoll = (pollId: string, data: { emails: string[], title: string }) => 
  api.sharePoll(pollId, data);
export const login = (password: string) => api.login(password);
export const getConfig = () => api.getConfig();
export const updateConfig = (config: any) => api.updateConfig(config);

// Exporter la fonction utilitaire
export const decodeHTMLEntities = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};