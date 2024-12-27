import { useState } from 'react'
import { login as apiLogin } from '../services/api'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from './Card'
import PageHeader from './PageHeader'
import { LockClosedIcon } from '@heroicons/react/24/outline'

export const AdminLogin = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await apiLogin(password)
      console.log('🟢 Réponse login:', response)
      
      // Stocker les données d'authentification
      const authData = {
        state: {
          token: response.token,
          timestamp: new Date().getTime()
        }
      }
      localStorage.setItem('auth-storage', JSON.stringify(authData))
      
      // Rediriger vers la page d'origine ou le dashboard
      navigate(from, { replace: true })
    } catch (error) {
      console.error('🔴 Erreur login:', error)
      setError('Mot de passe incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <PageHeader
          icon={<LockClosedIcon className="w-8 h-8 text-indigo-600" />}
          title="Administration"
          description="Connectez-vous pour accéder au tableau de bord administrateur"
        />
      </Card>

      <div className="flex justify-center">
        <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur de connexion
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>
                    {error.includes('incorrect') && (
                      <p className="mt-2 text-sm text-red-700">
                        Veuillez vérifier votre mot de passe et réessayer.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Mot de passe administrateur"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default AdminLogin; 