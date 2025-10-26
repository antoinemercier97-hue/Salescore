import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Mail, Calendar, CheckCircle } from 'lucide-react';

// Configuration EmailJS pour recevoir les résultats des prospects
// 1. Créez un compte gratuit sur emailjs.com
// 2. Ajoutez votre service Gmail (antoinemercier97@gmail.com)
// 3. Créez un template avec ces variables : {{nom}}, {{prenom}}, {{email}}, {{score}}, {{message}}
// 4. Remplacez les 3 constantes ci-dessous par vos identifiants EmailJS
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // À configurer sur emailjs.com
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // À configurer sur emailjs.com
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // À configurer sur emailjs.com
const ADMIN_EMAIL = 'antoinemercier97@gmail.com';

// Structure des données de la scorecard
const scorecardData = [
  {
    pilier: "Pilotage",
    questions: [
      "KPIs commerciaux suivis chaque semaine",
      "Objectifs clairs et partagés avec l'équipe",
      "Forecast fiable et régulièrement mis à jour",
      "Reporting structuré et exploitable"
    ]
  },
  {
    pilier: "Organisation & Équipe",
    questions: [
      "Rôles et responsabilités clairement définis",
      "Système de rémunération variable aligné sur les objectifs",
      "Rituels hebdomadaires efficaces (réunions, points)",
      "Processus d'onboarding cadré pour les nouveaux"
    ]
  },
  {
    pilier: "Outils & CRM",
    questions: [
      "CRM utilisé par 100% de l'équipe commerciale",
      "Automatisations mises en place et utiles",
      "Données propres et fiables dans le CRM",
      "Pipeline commercial fiable et à jour"
    ]
  },
  {
    pilier: "Process Commerciaux",
    questions: [
      "Tunnel de vente clairement défini et appliqué",
      "Séquences de prospection actives et efficaces",
      "Scripts et pitchs commerciaux maîtrisés",
      "Processus de qualification structuré (BANT, MEDDIC...)"
    ]
  },
  {
    pilier: "Stratégie & Positionnement",
    questions: [
      "Profil client idéal (ICP) clairement défini",
      "Message différenciant fort et reconnaissable",
      "Alignement efficace marketing/sales",
      "Proposition de valeur claire et impactante"
    ]
  }
];

export default function ScorecardCommercial() {
  const [step, setStep] = useState('intro'); // intro, questions, score, email, final
  const [currentPilier, setCurrentPilier] = useState(0);
  const [responses, setResponses] = useState({});
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculer le score total
  const calculateScore = () => {
    const values = Object.values(responses);
    if (values.length === 0) return 0;
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(average * 20); // Score sur 100
  };

  // Obtenir le message selon le score
  const getScoreMessage = (score) => {
    if (score < 50) {
      return "Votre performance commerciale repose sur des bases fragiles. Il existe des leviers prioritaires à structurer.";
    } else if (score < 70) {
      return "Votre organisation commerciale fonctionne, mais manque de structure pour passer un cap.";
    } else if (score <= 85) {
      return "Vous êtes sur de bons rails, quelques optimisations peuvent améliorer vos résultats.";
    } else {
      return "Organisation mature et structurée. Encore optimisable à la marge pour maximiser la performance.";
    }
  };

  // Gérer la réponse à une question
  const handleResponse = (pilierIndex, questionIndex, value) => {
    const key = `${pilierIndex}-${questionIndex}`;
    setResponses({ ...responses, [key]: value });
  };

  // Vérifier si toutes les questions du pilier actuel sont répondues
  const isPilierComplete = () => {
    for (let i = 0; i < 4; i++) {
      const key = `${currentPilier}-${i}`;
      if (!responses[key]) return false;
    }
    return true;
  };

  // Navigation
  const goToNextPilier = () => {
    if (currentPilier < scorecardData.length - 1) {
      setCurrentPilier(currentPilier + 1);
    } else {
      setStep('score');
    }
  };

  const goToPreviousPilier = () => {
    if (currentPilier > 0) {
      setCurrentPilier(currentPilier - 1);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envoi de l'email via EmailJS
  const sendEmail = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const score = calculateScore();
    const message = getScoreMessage(score);

    try {
      // Note: EmailJS nécessite d'être configuré sur emailjs.com
      // Pour tester sans EmailJS, commentez le bloc emailJS et décommentez le console.log ci-dessous
      
      const emailJSScript = document.createElement('script');
      emailJSScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      document.head.appendChild(emailJSScript);

      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre le chargement

      // Envoi des résultats à Antoine
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: ADMIN_EMAIL,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          score: score,
          message: message
        },
        EMAILJS_PUBLIC_KEY
      );

      // Pour tester sans EmailJS, décommentez ceci:
      // console.log('Nouveau lead reçu !');
      // console.log('Nom:', formData.nom, formData.prenom);
      // console.log('Email:', formData.email);
      // console.log('Score:', score, '/ 100');
      // console.log('Évaluation:', message);
      // await new Promise(resolve => setTimeout(resolve, 1000));

      setStep('final');
    } catch (error) {
      console.error('Erreur envoi email:', error);
      // En cas d'erreur, on affiche quand même la page finale pour le test
      alert('Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou nous contacter directement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Page d'introduction
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-blue-600 rounded-lg mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Scorecard Commercial
              </h1>
              <p className="text-xl text-slate-600">
                Évaluez votre performance commerciale en 3 minutes
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <p className="text-slate-700 leading-relaxed">
                Répondez à <strong>20 questions rapides</strong> pour évaluer la structuration de votre organisation commerciale. 
                Notez chaque point de <strong>1 (non maîtrisé)</strong> à <strong>5 (optimal)</strong>.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {scorecardData.map((pilier, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{pilier.pilier}</h3>
                    <p className="text-sm text-slate-600">{pilier.questions.length} questions</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('questions')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Commencer l'évaluation</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Page des questions
  if (step === 'questions') {
    const currentData = scorecardData[currentPilier];
    const progress = ((currentPilier + 1) / scorecardData.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            {/* Barre de progression */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Pilier {currentPilier + 1} sur {scorecardData.length}
                </span>
                <span className="text-sm font-medium text-slate-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Titre du pilier */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                {currentData.pilier}
              </h2>
              <p className="text-slate-600">
                Évaluez chaque aspect de 1 (non maîtrisé) à 5 (optimal)
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {currentData.questions.map((question, qIndex) => {
                const key = `${currentPilier}-${qIndex}`;
                const currentValue = responses[key];

                return (
                  <div key={qIndex} className="border-b border-slate-200 pb-6 last:border-b-0">
                    <label className="block text-slate-700 font-medium mb-4">
                      {qIndex + 1}. {question}
                    </label>
                    <div className="flex justify-between items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleResponse(currentPilier, qIndex, value)}
                          className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all font-semibold ${
                            currentValue === value
                              ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                              : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>Non maîtrisé</span>
                      <span>Optimal</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={goToPreviousPilier}
                disabled={currentPilier === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentPilier === 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Précédent</span>
              </button>

              <button
                onClick={goToNextPilier}
                disabled={!isPilierComplete()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isPilierComplete()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{currentPilier === scorecardData.length - 1 ? 'Voir mon score' : 'Suivant'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page du score
  if (step === 'score') {
    const score = calculateScore();
    const message = getScoreMessage(score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                Votre score
              </h2>
              
              {/* Score affiché */}
              <div className="relative inline-block">
                <svg className="w-48 h-48 md:w-64 md:h-64" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="20"
                    strokeDasharray={`${(score / 100) * 502.4} 502.4`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                  <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dy="0.3em"
                    className="text-5xl md:text-6xl font-bold fill-slate-800"
                  >
                    {score}
                  </text>
                  <text
                    x="100"
                    y="130"
                    textAnchor="middle"
                    className="text-lg fill-slate-600"
                  >
                    / 100
                  </text>
                </svg>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 mt-6">
                <p className="text-lg text-slate-700 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('email')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-5 h-5" />
              <span>Continuer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Page formulaire email
  if (step === 'email') {
    const score = calculateScore();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-blue-600 rounded-lg mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                Accédez à votre rapport détaillé
              </h2>
              <p className="text-lg text-slate-700 mb-2">
                Vous avez obtenu un score de <strong className="text-blue-600">{score}/100</strong>
              </p>
              <p className="text-slate-600">
                Recevez instantanément votre analyse personnalisée et vos axes d'amélioration prioritaires
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-100">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                Ce que vous allez recevoir :
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">→</span>
                  <span>Votre <strong>diagnostic complet</strong> sur les 5 piliers évalués</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">→</span>
                  <span>Les <strong>points forts</strong> de votre organisation commerciale</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">→</span>
                  <span>Vos <strong>axes d'amélioration prioritaires</strong> à travailler en premier</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">→</span>
                  <span>Des <strong>recommandations concrètes</strong> adaptées à votre situation</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-slate-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Jean"
                />
                {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Dupont"
                />
                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="jean.dupont@entreprise.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <button
                onClick={sendEmail}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Recevoir mon rapport détaillé</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                📧 Vous recevrez votre analyse dans les prochaines minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page finale avec CTA
  if (step === 'final') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-green-600 rounded-lg mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                C'est parti !
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Merci <strong>{formData.prenom}</strong> ! Vous allez recevoir votre rapport d'analyse détaillé à l'adresse <strong>{formData.email}</strong> dans les prochaines minutes.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-slate-800 mb-3">
                📧 Vérifiez votre boîte mail
              </h3>
              <p className="text-slate-700 leading-relaxed text-sm">
                Vous recevrez votre diagnostic personnalisé avec vos axes d'amélioration prioritaires. Pensez à vérifier vos spams si vous ne voyez rien d'ici quelques minutes.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-100">
              <h3 className="font-semibold text-slate-800 mb-3">
                💡 Envie d'aller plus loin ?
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Pour <strong>analyser vos résultats en profondeur</strong> et élaborer un <strong>plan d'action concret</strong> adapté à votre contexte, échangeons pendant 30 minutes.
              </p>
              <p className="text-sm text-slate-600">
                Au programme : analyse détaillée de vos réponses, identification des quick wins et feuille de route pour structurer votre organisation commerciale.
              </p>
            </div>

            <a
              href="https://calendly.com/antoinemercier97/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center shadow-lg"
            >
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Réserver mon échange stratégique (30 min)</span>
              </div>
            </a>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setStep('intro');
                  setCurrentPilier(0);
                  setResponses({});
                  setFormData({ nom: '', prenom: '', email: '' });
                }}
                className="text-slate-600 hover:text-slate-800 text-sm underline"
              >
                Recommencer une évaluation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}