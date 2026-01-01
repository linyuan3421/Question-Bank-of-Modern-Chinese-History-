import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Question, QuestionType } from '../types';

interface QuizCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  isReviewMode?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswer, isReviewMode }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelected([]);
    setIsSubmitted(false);
    setIsCorrect(false);
  }, [question.id]);

  const handleSelect = (key: string) => {
    if (isSubmitted) return;

    if (question.type === QuestionType.Single) {
      setSelected([key]);
      // Auto submit for single choice
      submitAnswer([key]);
    } else {
      // Toggle for multiple choice
      setSelected(prev => 
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    }
  };

  const submitAnswer = (currentSelected = selected) => {
    // Sort both arrays to ensure order doesn't matter
    const sortedSelected = [...currentSelected].sort();
    const sortedAnswer = [...question.answer].sort();
    
    const correct = JSON.stringify(sortedSelected) === JSON.stringify(sortedAnswer);
    
    setIsSubmitted(true);
    setIsCorrect(correct);
    onAnswer(correct);
  };

  const getOptionStyle = (optionKey: string) => {
    const isSelected = selected.includes(optionKey);
    const isAnswer = question.answer.includes(optionKey);

    if (!isSubmitted) {
      return isSelected 
        ? "bg-blue-100 border-blue-500 text-blue-900" 
        : "bg-white border-gray-200 hover:bg-gray-50";
    }

    if (isAnswer) {
      return "bg-green-100 border-green-500 text-green-900";
    }

    if (isSelected && !isAnswer) {
      return "bg-red-100 border-red-500 text-red-900";
    }

    return "bg-gray-50 border-gray-200 text-gray-500 opacity-60";
  };

  const extractKey = (opt: string) => opt.split('.')[0].trim();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-bold px-2 py-1 rounded ${question.type === QuestionType.Single ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
          {question.type === QuestionType.Single ? '单选题' : '多选题'}
        </span>
        {isReviewMode && (
           <span className="text-xs font-bold px-2 py-1 rounded bg-orange-100 text-orange-700 flex items-center gap-1">
             <AlertCircle size={12} /> 错题重练
           </span>
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-6 leading-relaxed">
        {question.question}
      </h3>

      <div className="space-y-3">
        {question.options.map((option) => {
          const key = extractKey(option);
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-start group ${getOptionStyle(key)}`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium mr-3 shrink-0 ${
                selected.includes(key) ? 'border-current' : 'border-gray-300 text-gray-500'
              }`}>
                {key}
              </span>
              <span className="mt-0.5">{option.substring(option.indexOf('.') + 1)}</span>
              
              {isSubmitted && question.answer.includes(key) && (
                <CheckCircle className="ml-auto text-green-600 shrink-0" size={20} />
              )}
              {isSubmitted && selected.includes(key) && !question.answer.includes(key) && (
                <XCircle className="ml-auto text-red-500 shrink-0" size={20} />
              )}
            </button>
          );
        })}
      </div>

      {question.type === QuestionType.Multiple && !isSubmitted && (
        <div className="mt-6">
          <button
            onClick={() => submitAnswer()}
            disabled={selected.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            提交答案
          </button>
        </div>
      )}

      {isSubmitted && (
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
            <p className="font-bold flex items-center gap-2">
              {isCorrect ? '回答正确！' : '回答错误'}
            </p>
            {!isCorrect && (
               <div className="mt-2 text-sm">
                  正确答案是: <span className="font-bold">{question.answer.join(', ')}</span>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;