import { useState, useEffect } from 'react';
import Card from './Card';
import PageHeader from './PageHeader';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface Config {
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
  };
}

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/admin/config', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la configuration');
        }

        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
        setPasswordError(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    const formData = new FormData(e.currentTarget);
    
    // Vérifier que les mots de passe correspondent
    const password = formData.get('adminPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password && password !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      const newConfig = {
        smtp: {
          host: formData.get('smtpHost'),
          port: Number(formData.get('smtpPort')),
          user: formData.get('smtpUser'),
          pass: formData.get('smtpPass'),
          from: formData.get('smtpFrom'),
          secure: formData.get('smtpSecure') === 'on'
        },
        security: {
          adminPassword: password || undefined
        }
      };

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newConfig)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      alert('Configuration mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setPasswordError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
          <PageHeader
            icon={<Cog6ToothIcon className="w-8 h-8 text-indigo-600" />}
            title="Configuration Système"
            description="Gérez les paramètres globaux de l'application"
          />
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Configuration Email */}
            <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration Email</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serveur SMTP</label>
                  <input 
                    name="smtpHost"
                    type="text"
                    defaultValue={config?.smtp?.host}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Port</label>
                  <input 
                    name="smtpPort"
                    type="number"
                    defaultValue={config?.smtp?.port}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
                  <input 
                    name="smtpUser"
                    type="text"
                    defaultValue={config?.smtp?.user}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <input 
                    name="smtpPass"
                    type="password"
                    autoComplete="new-password"
                    defaultValue={config?.smtp?.pass}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email expéditeur</label>
                  <input 
                    name="smtpFrom"
                    type="email"
                    defaultValue={config?.smtp?.from}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
                <div className="flex items-center">
                  <input 
                    name="smtpSecure"
                    type="checkbox"
                    defaultChecked={config?.smtp?.secure}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <label className="ml-2 block text-sm text-gray-700">Utiliser SSL/TLS</label>
                </div>
              </div>
            </Card>

            {/* Configuration Sécurité */}
            <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sécurité</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe administrateur</label>
                  <input 
                    name="adminPassword"
                    type="password"
                    autoComplete="new-password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                  <input 
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
                {passwordError && (
                  <div className="text-sm text-red-600">
                    {passwordError}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard; 