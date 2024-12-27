import { useState } from 'react'
import { api } from '../services/api'
import type { CreatePollData, Poll } from '../types'
import Card from './Card'
import { useNavigate } from 'react-router-dom'
import SharePollButton from './SharePollButton'
import Popup from './Popup'
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline'
import PageHeader from './PageHeader'

interface ValidationError {
  type: string;
  value: any;
  msg: string;
  path: string;
  location: string;
}

interface PollFormData {
  title: string;
  description: string;
  expiresAt: string;
  password: string;
  options: { text: string }[];
}

const PollForm = () => {
  const [formData, setFormData] = useState<PollFormData>({
    title: '',
    description: '',
    expiresAt: '',
    password: '',
    options: [{ text: '' }, { text: '' }]
  });
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({})
  const [countdown, setCountdown] = useState<number>(5);
  const [showShare, setShowShare] = useState(false)
  const [pollCreated, setPollCreated] = useState<Poll | null>(null)
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [showEmailSection, setShowEmailSection] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Nettoyer et valider les données avant l'envoi
      const cleanedOptions = formData.options
        .map(opt => ({ text: opt.text.trim() }))
        .filter(opt => opt.text !== '');

      // Filtrer les emails valides
      const validEmails = showEmailSection ? inviteEmails.filter(email => email.trim() !== '') : [];

      const pollData: CreatePollData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        options: cleanedOptions,
        password: formData.password,
        expiresAt: new Date(formData.expiresAt).toISOString(),
        isPrivate: validEmails.length > 0, // Rendre le sondage privé si des emails sont fournis
        emails: validEmails
      };

      // Log détaillé des données avant envoi
      console.log('Données du formulaire:', {
        ...formData,
        isPrivate: pollData.isPrivate,
        emails: validEmails
      });

      const createdPoll = await api.createPoll(pollData);
      setSuccess('Sondage créé avec succès !');
      setPollCreated(createdPoll);
      
      // Démarrer le compte à rebours
      let timeLeft = 5;
      setCountdown(timeLeft);
      
      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft === 0) {
          clearInterval(timer);
          navigate(`/polls/${createdPoll.id}`);
        }
      }, 1000);

    } catch (err) {
      console.error('Erreur détaillée:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la création du sondage');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const minDate = new Date()
  minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset())
  const minDateString = minDate.toISOString().slice(0, 16)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <PageHeader
          icon={<PencilIcon className="w-8 h-8 text-indigo-600" />}
          title="Créer un sondage"
          description="Créez votre sondage en quelques étapes simples et partagez-le avec qui vous voulez"
        />
      </Card>

      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">
              <div className="font-medium mb-2">Erreurs :</div>
              <pre className="text-sm whitespace-pre-wrap">
                {error}
              </pre>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Section 1: Informations générales */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                  1
                </div>
                <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre du sondage
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    minLength={3}
                    placeholder="Ex: Quelle est votre couleur préférée ?"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (optionnelle)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Donnez plus de contexte à votre sondage..."
                  />
                </div>
              </div>
            </Card>

            {/* Section 2: Options de vote */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                  2
                </div>
                <h2 className="text-lg font-medium text-gray-900">Options de vote</h2>
              </div>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...formData.options]
                          newOptions[index] = { text: e.target.value }
                          setFormData(prev => ({ ...prev, options: newOptions }))
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder={`Option ${index + 1}`}
                        required
                        minLength={1}
                      />
                    </div>
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, options: formData.options.filter((_, i) => i !== index) }))}
                        className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Supprimer cette option"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, options: [...formData.options, { text: '' }] }))}
                  className="w-full mt-2 py-2 px-3 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-indigo-500 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <div className="flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter une option
                  </div>
                </button>
              </div>
            </Card>

            {/* Section 3: Paramètres */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                  3
                </div>
                <h2 className="text-lg font-medium text-gray-900">Paramètres du sondage</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe du sondage
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                      autoComplete="current-password"
                      className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-16"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xs">
                        Min. 6 caractères
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ce mot de passe sera nécessaire pour arrêter ou supprimer le sondage
                  </p>
                </div>

                <div>
                  <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                    Date d'expiration
                  </label>
                  <div className="mt-1">
                    <input
                      type="datetime-local"
                      id="expiresAt"
                      value={formData.expiresAt}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, expiresAt: e.target.value }));
                        setFieldErrors(prev => ({ ...prev, expiresAt: '' }));
                      }}
                      min={minDateString}
                      className={`
                        block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500
                        ${fieldErrors.expiresAt ? 'border-red-300 text-red-900' : 'border-gray-300'}
                        ${shakeFields.expiresAt ? 'animate-shake' : ''}
                      `}
                      required
                    />
                    {fieldErrors.expiresAt && (
                      <div className="mt-2 text-sm text-red-600">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fieldErrors.expiresAt}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 4: Invitations par email */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                  4
                </div>
                <h2 className="text-lg font-medium text-gray-900">Invitations par email</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowEmailSection(!showEmailSection)}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600"
                  >
                    <svg 
                      className={`h-5 w-5 mr-2 transition-transform ${showEmailSection ? 'rotate-90' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Inviter des participants par email
                  </button>
                </div>

                {showEmailSection && (
                  <div className="space-y-3 pt-4">
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-amber-700">
                            <strong>Important :</strong> N'oubliez pas d'ajouter votre propre email si vous souhaitez pouvoir voter au sondage. Seules les personnes ayant reçu une invitation par email pourront voter.
                          </p>
                        </div>
                      </div>
                    </div>

                    {inviteEmails.map((email, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...inviteEmails];
                            newEmails[index] = e.target.value;
                            setInviteEmails(newEmails);
                          }}
                          placeholder="email@exemple.com"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {index === inviteEmails.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => setInviteEmails([...inviteEmails, ''])}
                            className="p-2 text-indigo-600 hover:text-indigo-500"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const newEmails = inviteEmails.filter((_, i) => i !== index);
                              setInviteEmails(newEmails);
                            }}
                            className="p-2 text-red-600 hover:text-red-500"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <p className="text-sm text-gray-500">
                      Les invitations seront envoyées automatiquement à la création du sondage
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Boutons d'action */}
            <div className="col-span-2 mt-8">
              <div className="flex justify-center space-x-4">
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annuler
                </a>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Création en cours...
                    </>
                  ) : (
                    'Créer le sondage'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Popup de succès */}
        {success && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <p className="text-green-800">{success}</p>
            <p className="text-green-600 mt-2">
              Redirection vers le sondage dans {countdown} seconde{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default PollForm 