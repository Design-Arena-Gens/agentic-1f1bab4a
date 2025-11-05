'use client';

import { useState } from 'react';
import { Sparkles, Copy, Download, Trash2, Plus, MessageSquare, HelpCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

interface Answer {
  questionId: string;
  value: string | string[];
}

interface Section {
  id: string;
  name: string;
  content: string;
}

const defaultQuestions: Question[] = [
  {
    id: '1',
    text: 'Qual é o objetivo principal do seu prompt?',
    type: 'text',
    required: true
  },
  {
    id: '2',
    text: 'Quem é o público-alvo?',
    type: 'text',
    required: true
  },
  {
    id: '3',
    text: 'Qual o tom desejado?',
    type: 'select',
    options: ['Formal', 'Casual', 'Técnico', 'Criativo', 'Educacional', 'Profissional'],
    required: true
  },
  {
    id: '4',
    text: 'Qual formato de resposta você prefere?',
    type: 'select',
    options: ['Texto corrido', 'Lista com tópicos', 'Passo a passo', 'Tabela', 'Código', 'Misto'],
    required: true
  },
  {
    id: '5',
    text: 'Existe algum contexto específico que deve ser considerado?',
    type: 'text',
    required: false
  },
  {
    id: '6',
    text: 'Quais restrições ou limitações devem ser respeitadas?',
    type: 'text',
    required: false
  },
  {
    id: '7',
    text: 'Exemplos de saída esperada (opcional)',
    type: 'text',
    required: false
  }
];

export default function PromptBuilder() {
  const [step, setStep] = useState<'questions' | 'building' | 'editing'>('questions');
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [copied, setCopied] = useState(false);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, value } : a);
      }
      return [...prev, { questionId, value }];
    });
  };

  const addCustomQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type: 'text',
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    setAnswers(answers.filter(a => a.questionId !== id));
  };

  const buildPrompt = () => {
    const answersMap = new Map(answers.map(a => [a.questionId, a.value]));

    const objetivo = (answersMap.get('1') as string) || '';
    const publico = (answersMap.get('2') as string) || '';
    const tom = (answersMap.get('3') as string) || '';
    const formato = (answersMap.get('4') as string) || '';
    const contexto = (answersMap.get('5') as string) || '';
    const restricoes = (answersMap.get('6') as string) || '';
    const exemplos = (answersMap.get('7') as string) || '';

    const newSections: Section[] = [];

    // Seção de Contexto
    if (contexto) {
      newSections.push({
        id: 'context',
        name: 'Contexto',
        content: `# Contexto\n\n${contexto}`
      });
    }

    // Seção de Objetivo
    newSections.push({
      id: 'objective',
      name: 'Objetivo',
      content: `# Objetivo\n\n${objetivo}`
    });

    // Seção de Público-Alvo
    newSections.push({
      id: 'audience',
      name: 'Público-Alvo',
      content: `# Público-Alvo\n\n${publico}`
    });

    // Seção de Tom e Estilo
    newSections.push({
      id: 'tone',
      name: 'Tom e Estilo',
      content: `# Tom e Estilo\n\n- Tom: ${tom}\n- Formato de resposta: ${formato}`
    });

    // Seção de Restrições
    if (restricoes) {
      newSections.push({
        id: 'restrictions',
        name: 'Restrições',
        content: `# Restrições\n\n${restricoes}`
      });
    }

    // Seção de Exemplos
    if (exemplos) {
      newSections.push({
        id: 'examples',
        name: 'Exemplos',
        content: `# Exemplos\n\n${exemplos}`
      });
    }

    // Processar perguntas customizadas
    questions.slice(7).forEach(q => {
      const answer = answersMap.get(q.id);
      if (answer) {
        newSections.push({
          id: q.id,
          name: q.text,
          content: `# ${q.text}\n\n${Array.isArray(answer) ? answer.join(', ') : answer}`
        });
      }
    });

    // Seção de Instruções Finais
    newSections.push({
      id: 'instructions',
      name: 'Instruções',
      content: `# Instruções de Execução\n\nPor favor, forneça uma resposta que:\n1. Atenda ao objetivo especificado\n2. Seja adequada para o público-alvo definido\n3. Mantenha o tom ${tom.toLowerCase()}\n4. Siga o formato de ${formato.toLowerCase()}\n${restricoes ? `5. Respeite as restrições mencionadas\n` : ''}\nSeja claro, preciso e completo em sua resposta.`
    });

    setSections(newSections);
    setGeneratedPrompt(newSections.map(s => s.content).join('\n\n'));
    setStep('editing');
  };

  const updateSection = (id: string, content: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
    setGeneratedPrompt(sections.map(s => s.id === id ? content : s.content).join('\n\n'));
  };

  const removeSection = (id: string) => {
    const newSections = sections.filter(s => s.id !== id);
    setSections(newSections);
    setGeneratedPrompt(newSections.map(s => s.content).join('\n\n'));
  };

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      name: 'Nova Seção',
      content: '# Nova Seção\n\n'
    };
    setSections([...sections, newSection]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-complexo.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStep('questions');
    setAnswers([]);
    setGeneratedPrompt('');
    setSections([]);
    setQuestions(defaultQuestions);
  };

  const canProceed = questions
    .filter(q => q.required)
    .every(q => answers.find(a => a.questionId === q.id)?.value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Construtor de Prompts Complexos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Assistente interativo e robusto para criar prompts eficazes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 'questions' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'questions' ? 'bg-indigo-600 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Perguntas</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <div className={`flex items-center ${step === 'editing' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'editing' ? 'bg-indigo-600 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium">Edição</span>
            </div>
          </div>
        </div>

        {/* Questions Step */}
        {step === 'questions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Responda as perguntas para construir seu prompt
              </h2>

              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {index < 7 ? (
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            {question.text}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                        ) : (
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                            placeholder="Digite sua pergunta personalizada"
                            className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        )}
                      </div>
                      {index >= 7 && (
                        <button
                          onClick={() => removeQuestion(question.id)}
                          className="ml-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {question.type === 'text' && (
                      <textarea
                        value={(answers.find(a => a.questionId === question.id)?.value as string) || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        rows={3}
                        placeholder="Digite sua resposta..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}

                    {question.type === 'select' && question.options && (
                      <select
                        value={(answers.find(a => a.questionId === question.id)?.value as string) || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Selecione uma opção...</option>
                        {question.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addCustomQuestion}
                className="mt-6 flex items-center space-x-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar pergunta personalizada</span>
              </button>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={buildPrompt}
                disabled={!canProceed}
                className={`px-8 py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 ${
                  canProceed
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Gerar Prompt
              </button>
            </div>
          </div>
        )}

        {/* Editing Step */}
        {step === 'editing' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edite e personalize seu prompt
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={downloadPrompt}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar</span>
                  </button>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Recomeçar</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {section.name}
                      </h3>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addSection}
                className="mt-4 flex items-center space-x-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar seção</span>
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Visualização Final
              </h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 font-mono overflow-x-auto">
                {generatedPrompt}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
