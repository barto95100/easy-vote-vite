import { useState, useEffect } from 'react';
import Card from './Card';
import PageHeader from './PageHeader';
import { Cog6ToothIcon, InformationCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { getConfig } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { api, decodeHTMLEntities } from '../services/api';

interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  from: string;
  secure: boolean;
}

interface Settings {
  senderEmail: string;
  senderName: string;
  emailSubject: string;
  emailTemplate: string;
}

const AdminSettings = () => {
  useSession();
  const navigate = useNavigate();
  const [config, setConfig] = useState<{ smtp?: SmtpConfig } | null>(null);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: '',
    port: '',
    user: '',
    password: '',
    from: '',
    secure: false
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    senderEmail: '',
    senderName: '',
    emailSubject: '',
    emailTemplate: ''
  });
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await getConfig();
        setConfig(response);
        if (response.smtp) {
          setSmtpConfig(response.smtp);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await api.updateConfig({ smtp: smtpConfig });
      setSuccess('Configuration SMTP mise à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-storage');
    navigate('/admin/login');
  };

  const isValidEmailFormat = (email: string) => {
    const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const displayEmailRegex = /^[^<>]+ <[^\s@]+@[^\s@]+\.[^\s@]+>$/;
    
    return simpleEmailRegex.test(email) || displayEmailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidEmailFormat(settings.senderEmail)) {
      setError("Format d'email invalide");
      return;
    }

    try {
      await api.updateSettings(settings);
      setSuccess('Paramètres mis à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <div className="relative">
          <div className="absolute right-0 top-0">
            <button
              onClick={handleLogout}
              className="inline-flex items-center p-2 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              title="Déconnexion"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
              <Cog6ToothIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Paramètres d'administration</h2>
            <p className="mt-1 text-sm text-gray-500">Gérez les paramètres de l'application</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sécurité
            </h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Note importante :</strong> Pour des raisons de sécurité, la modification du mot de passe administrateur 
                    ne peut être effectuée que via le fichier de configuration du serveur.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-2">
              Pour modifier le mot de passe administrateur :
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-2">
              <li>Accédez au fichier <code className="px-2 py-1 bg-gray-100 rounded text-sm">.env</code> dans le dossier racine du backend</li>
              <li>Modifiez la variable <code className="px-2 py-1 bg-gray-100 rounded text-sm">DEFAULT_ADMIN_PASSWORD</code></li>
              <li>Sauvegardez le fichier</li>
              <li>Redémarrez le serveur pour appliquer les changements</li>
            </ol>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuration Email (SMTP)
        </h3>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-600">Chargement de la configuration...</div>
        ) : (
          <form onSubmit={handleSmtpSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="smtp-host" className="block text-sm font-medium text-gray-700">
                  Serveur SMTP
                </label>
                <input
                  type="text"
                  id="smtp-host"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700">
                  Port SMTP
                </label>
                <input
                  type="text"
                  id="smtp-port"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="smtp-user" className="block text-sm font-medium text-gray-700">
                  Utilisateur SMTP
                </label>
                <input
                  type="text"
                  id="smtp-user"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="smtp-password" className="block text-sm font-medium text-gray-700">
                  Mot de passe SMTP
                </label>
                <input
                  type="password"
                  id="smtp-password"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="smtp-from" className="block text-sm font-medium text-gray-700">
                  Email expéditeur
                </label>
                <input
                  type="text"
                  id="smtp-from"
                  value={smtpConfig.from}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, from: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  SSL/TLS
                </label>
                <select
                  value={smtpConfig.secure ? "true" : "false"}
                  onChange={(e) => setSmtpConfig(prev => ({ 
                    ...prev, 
                    secure: e.target.value === "true"
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="false">Désactivé</option>
                  <option value="true">Activé</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                className="inline-flex justify-center py-2 px-4 border border-indigo-200 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Tester la configuration
              </button>
              
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Enregistrer la configuration
              </button>
            </div>
          </form>
        )}
      </Card>

      {showTestModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Test de la configuration SMTP
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de test
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Entrez l'adresse email de test"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setError(null);
                    if (!testEmail) {
                      setError("Veuillez entrer une adresse email de test");
                      return;
                    }
                    await api.testSmtp({ 
                      ...smtpConfig, 
                      testEmail,
                      from: decodeHTMLEntities(smtpConfig.from)
                    });
                    setSuccess('Test d\'envoi réussi ! Vérifiez votre boîte mail.');
                    setShowTestModal(false);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Erreur lors du test d\'envoi');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Envoyer le test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings; 