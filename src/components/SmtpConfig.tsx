import { useState, useEffect } from 'react';
import Card from './Card';
import { useAuthFetch } from '../hooks/useAuthFetch';

interface SmtpSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  smtpSecure: boolean;
  smtpAuth: boolean;
}

const SmtpConfig = () => {
  const authFetch = useAuthFetch();
  const [settings, setSettings] = useState<SmtpSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpFrom: '',
    smtpSecure: false,
    smtpAuth: false
  });
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await authFetch('/api/admin/smtp-config');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Erreur lors du chargement de la configuration'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await authFetch('/api/admin/smtp-config', {
        method: 'POST',
        body: JSON.stringify({
          ...settings,
          pass: password || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus({
          type: 'success',
          message: data.message
        });
        setPassword(''); // Effacer le mot de passe après succès
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await authFetch('/api/email/test', {
        method: 'POST'
      });

      const data = await response.json();
      
      setStatus({
        type: data.success ? 'success' : 'error',
        message: data.message
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Erreur lors du test'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration SMTP</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Serveur SMTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Serveur SMTP
            </label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={e => setSettings(s => ({ ...s, smtpHost: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="smtp.example.com"
            />
          </div>

          {/* Port */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Port
            </label>
            <input
              type="number"
              value={settings.smtpPort}
              onChange={e => setSettings(s => ({ ...s, smtpPort: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Adresse d'envoi */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresse d'envoi
            </label>
            <input
              type="email"
              value={settings.smtpFrom}
              onChange={e => setSettings(s => ({ ...s, smtpFrom: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="noreply@example.com"
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auth"
                checked={settings.smtpAuth}
                onChange={e => setSettings(s => ({ ...s, smtpAuth: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="auth" className="ml-2 block text-sm text-gray-900">
                Authentification requise
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="secure"
                checked={settings.smtpSecure}
                onChange={e => setSettings(s => ({ ...s, smtpSecure: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="secure" className="ml-2 block text-sm text-gray-900">
                Utiliser SSL/TLS
              </label>
            </div>
          </div>

          {/* Identifiant */}
          {settings.smtpAuth && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Identifiant
                </label>
                <input
                  type="text"
                  value={settings.smtpUser}
                  onChange={e => setSettings(s => ({ ...s, smtpUser: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Laisser vide pour ne pas modifier"
                />
              </div>
            </>
          )}
        </div>

        {/* Messages de statut */}
        {status && (
          <div className={`rounded-md p-4 ${
            status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {status.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  status.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {status.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Tester l'envoi
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Card>
  );
};

export default SmtpConfig; 