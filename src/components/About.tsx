import Card from './Card'

const About = () => {
  const technologies = [
    {
      category: "Frontend",
      items: [
        { 
          name: "React", 
          description: "Bibliothèque JavaScript pour construire des interfaces utilisateur",
          icon: <img src="/tech/react.png" alt="React" className="h-6 w-6" />
        },
        { 
          name: "TypeScript", 
          description: "JavaScript typé pour un code plus robuste",
          icon: <img src="/tech/typescript.png" alt="TypeScript" className="h-6 w-6" />
        },
        { 
          name: "TailwindCSS", 
          description: "Framework CSS utilitaire pour un design moderne",
          icon: <img src="/tech/tailwind.png" alt="TailwindCSS" className="h-6 w-6" />
        },
        {
          name: "Zustand",
          description: "Gestion d'état simple et efficace",
          icon: <img src="/tech/zustand.svg" alt="Zustand" className="h-6 w-6" />
        },
        {
          name: "Vite",
          description: "Outil de build ultra-rapide pour le développement",
          icon: <img src="/tech/vite.svg" alt="Vite" className="h-6 w-6" />
        }
      ]
    },
    {
      category: "Backend",
      items: [
        {
          name: "Node.js",
          description: "Environnement d'exécution JavaScript côté serveur",
          icon: <img src="/tech/node.png" alt="Node.js" className="h-6 w-6" />
        },
        {
          name: "Express",
          description: "Framework web minimaliste et flexible",
          icon: <img src="/tech/express.png" alt="Express" className="h-6 w-6" />
        },
        {
          name: "Prisma",
          description: "ORM moderne pour la gestion de base de données",
          icon: <img src="/tech/prisma.png" alt="Prisma" className="h-6 w-6" />
        },
        {
          name: "WebSocket",
          description: "Communication en temps réel",
          icon: <img src="/tech/websocket.png" alt="WebSocket" className="h-6 w-6" />
        },
        {
          name: "SQLite",
          description: "Base de données légère et performante",
          icon: <img src="/tech/sqlite.png" alt="SQLite" className="h-6 w-6" />
        },
        {
          name: "Nodemailer",
          description: "Service d'envoi d'emails",
          icon: <img src="/tech/nodemailer.png" alt="Nodemailer" className="h-6 w-6" />
        }
      ]
    },
    {
      category: "Sécurité",
      items: [
        {
          name: "JWT",
          description: "Authentification sécurisée par tokens",
          icon: <img src="/tech/jwt.svg" alt="JWT" className="h-6 w-6" />
        },
        {
          name: "Bcrypt",
          description: "Hashage sécurisé des mots de passe",
          icon: <img src="/tech/bcrypt.svg" alt="Bcrypt" className="h-6 w-6" />
        },
        {
          name: "CORS",
          description: "Sécurité des requêtes cross-origin",
          icon: <img src="/tech/cors.svg" alt="CORS" className="h-6 w-6" />
        },
        {
          name: "Helmet",
          description: "Protection des en-têtes HTTP",
          icon: <img src="/tech/helmet.svg" alt="Helmet" className="h-6 w-6" />
        },
        {
          name: "CSRF",
          description: "Protection contre les attaques CSRF",
          icon: <img src="/tech/csrf.svg" alt="CSRF" className="h-6 w-6" />
        },
        {
          name: "Rate Limit",
          description: "Protection contre les attaques par force brute",
          icon: <img src="/tech/rate-limit.svg" alt="Rate Limit" className="h-6 w-6" />
        }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-4">
            <img src="/easyvote.svg" alt="EasyVote Logo" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">À propos d'EasyVote</h1>
          
          <div className="max-w-6xl mx-auto">
            <p className="text-m text-gray-500 leading-relaxed">
            Simplifié vos décisions collectives ! Créez, partagez et analysez vos sondages et votes en ligne en toute simplicité. Avec une interface intuitive et une priorité donnée à la confidentialité, EasyVote est l’outil idéal pour engager votre communauté et obtenir des résultats clairs, rapidement.
	    </p>
          </div>
        </div>
      </Card>

      {/* Technologies */}
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Technologies utilisées</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {technologies.map((tech) => (
            <div key={tech.category}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{tech.category}</h3>
              <div className="space-y-4">
                {tech.items.map((item) => (
                  <div key={item.name} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    {item.icon}
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fonctionnalités */}
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">Fonctionnalités principales</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 ml-3">Gestion des sondages</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Création de sondages publics ou privés</span>
              </li>
              <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Protection par mot de passe</span>
              </li>
              <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Résultats en temps réel avec WebSocket</span>
              </li>
              <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Date d'expiration automatique</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 ml-3">Administration</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Interface d'administration sécurisée</span>
              </li>
              <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Configuration SMTP personnalisable</span>
              </li>
              <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Gestion des invitations par email</span>
              </li>
              <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Nettoyage automatique des sondages</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Sécurité */}
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">Sécurité renforcée</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-3 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentification</h3>
            <p className="text-gray-600">JWT et bcrypt pour une protection robuste des accès</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-3 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Protection CSRF</h3>
            <p className="text-gray-600">Sécurisation contre les attaques cross-site</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-3 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rate Limiting</h3>
            <p className="text-gray-600">Protection contre les attaques par force brute</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-3 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Protection Helmet</h3>
            <p className="text-gray-600">Sécurisation des en-têtes HTTP</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-3 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">CORS</h3>
            <p className="text-gray-600">Contrôle d'accès cross-origin sécurisé</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-3 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Anti-Spam</h3>
            <p className="text-gray-600">Protection contre les votes multiples</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default About
