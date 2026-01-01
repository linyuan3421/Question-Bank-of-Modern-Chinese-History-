import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, RefreshCw, ChevronLeft, Award, AlertTriangle, Trash2, LayoutGrid } from 'lucide-react';
import { chapters } from './data';
import { Chapter, AppMode, Question } from './types';
import QuizCard from './components/QuizCard';
import { 
  getProgress, 
  saveProgress, 
  getWrongAnswers, 
  saveWrongAnswer, 
  removeWrongAnswer,
  resetAllData
} from './utils/storage';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('home');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(getWrongAnswers());
  const [progress, setProgress] = useState(getProgress());
  const [isGridOpen, setIsGridOpen] = useState(false);

  // Derived state
  const activeChapter = useMemo(() => 
    chapters.find(c => c.id === selectedChapterId), 
  [selectedChapterId]);

  const questionsToPlay = useMemo(() => {
    if (!activeChapter) return [];
    if (mode === 'quiz') return activeChapter.questions;
    if (mode === 'review') {
      return activeChapter.questions.filter(q => wrongAnswers[q.id]);
    }
    return [];
  }, [activeChapter, mode, wrongAnswers]);

  const currentQuestion = questionsToPlay[currentQuestionIndex];

  // Stats
  const totalQuestions = useMemo(() => chapters.reduce((acc, c) => acc + c.questions.length, 0), []);
  const completedQuestions = Object.keys(progress).length;
  const totalWrong = Object.keys(wrongAnswers).length;

  // Reset grid when chapter changes
  useEffect(() => {
    setIsGridOpen(false);
  }, [selectedChapterId, mode]);

  const handleChapterSelect = (id: string, playMode: 'quiz' | 'review') => {
    setSelectedChapterId(id);
    setMode(playMode);
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentQuestion) return;

    // 1. Update Progress (Always)
    if (mode === 'quiz') {
       saveProgress(currentQuestion.id, isCorrect);
       setProgress(getProgress());
    }

    // 2. Handle Wrong Answers Logic
    if (isCorrect) {
      if (wrongAnswers[currentQuestion.id]) {
        removeWrongAnswer(currentQuestion.id);
        setWrongAnswers(getWrongAnswers());
      }
    } else {
      saveWrongAnswer(currentQuestion.id);
      setWrongAnswers(getWrongAnswers());
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsToPlay.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // End of quiz
      alert("本章练习结束！");
      setMode('home');
      setSelectedChapterId(null);
    }
  };

  const handleReset = () => {
      if(confirm("确定要重置所有刷题记录吗？这将清空错题本和进度。")) {
          resetAllData();
      }
  }

  // --- Views ---

  const renderHome = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 serif">中国近现代史纲要</h1>
        <p className="text-gray-500">2022版题库刷题系统</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <Award className="text-blue-500 mb-2" size={28} />
            <span className="text-3xl font-bold text-gray-800">{completedQuestions} <span className="text-sm text-gray-400 font-normal">/ {totalQuestions}</span></span>
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">已刷题目</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <AlertTriangle className="text-orange-500 mb-2" size={28} />
            <span className="text-3xl font-bold text-gray-800">{totalWrong}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">当前错题</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">章节选择</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {chapters.map(chapter => {
           const chapterWrongCount = chapter.questions.filter(q => wrongAnswers[q.id]).length;
           const chapterTotal = chapter.questions.length;
           
           return (
            <div key={chapter.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition-all shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1">{chapter.title}</h3>
              <p className="text-sm text-gray-500 mb-4">共 {chapterTotal} 题</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleChapterSelect(chapter.id, 'quiz')}
                  className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <BookOpen size={16} />
                  开始练习
                </button>
                {chapterWrongCount > 0 && (
                  <button 
                    onClick={() => handleChapterSelect(chapter.id, 'review')}
                    className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCw size={16} />
                    错题 ({chapterWrongCount})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
          <button onClick={handleReset} className="text-gray-400 hover:text-red-500 text-sm flex items-center justify-center mx-auto gap-1">
              <Trash2 size={14} /> 重置所有数据
          </button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!currentQuestion) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
             <div className="bg-white p-8 rounded-xl text-center shadow-sm">
                 <h2 className="text-xl font-bold mb-2">太棒了！</h2>
                 <p className="text-gray-500 mb-6">本章节没有错题，或者你已经全部攻克了。</p>
                 <button onClick={() => setMode('home')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">返回首页</button>
             </div>
         </div>
      )
    }

    const progressPercent = ((currentQuestionIndex + 1) / questionsToPlay.length) * 100;

    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b z-30 shadow-sm transition-all">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <button 
                  onClick={() => setMode('home')}
                  className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="text-sm font-medium text-gray-800 truncate">
                    {activeChapter?.title}
                </div>
            </div>
            
            <button 
                onClick={() => setIsGridOpen(!isGridOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isGridOpen 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                <LayoutGrid size={18} />
                <span className="font-mono">
                  {currentQuestionIndex + 1}/{questionsToPlay.length}
                </span>
            </button>
          </div>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-gray-100">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Grid Dropdown */}
        {isGridOpen && (
            <div className="fixed inset-0 z-20 top-14" onClick={() => setIsGridOpen(false)}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <div 
                    className="relative bg-white border-b shadow-xl max-h-[70vh] overflow-y-auto animate-in slide-in-from-top-2"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">答题卡</h3>
                            <div className="flex gap-4 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> 已掌握</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> 错题</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span> 未答</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                            {questionsToPlay.map((q, idx) => {
                                const isCurrent = idx === currentQuestionIndex;
                                const isWrong = wrongAnswers[q.id];
                                const isDone = progress[q.id];
                                
                                let statusClass = "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300";
                                
                                if (isWrong) {
                                    statusClass = "bg-red-50 border-red-200 text-red-600";
                                } else if (isDone) {
                                    statusClass = "bg-green-50 border-green-200 text-green-600";
                                }

                                if (isCurrent) {
                                    statusClass = "ring-2 ring-blue-500 border-blue-500 bg-blue-50 text-blue-700 font-bold z-10";
                                }

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setCurrentQuestionIndex(idx);
                                            setIsGridOpen(false);
                                        }}
                                        className={`h-10 w-full rounded-lg border flex items-center justify-center text-sm transition-all ${statusClass}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Content */}
        <div className="flex-1 px-4 py-6 bg-[#F8FAFC]">
          <QuizCard 
            question={currentQuestion} 
            onAnswer={handleAnswer}
            isReviewMode={mode === 'review'}
          />
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 z-10">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
             <span className="text-xs text-gray-400">
                {mode === 'review' ? '答对后自动移出错题本' : '答错后自动加入错题本'}
             </span>
             <button 
                onClick={handleNext}
                className="bg-gray-900 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-black transition-colors shadow-lg shadow-gray-200"
             >
                {currentQuestionIndex === questionsToPlay.length - 1 ? '完成' : '下一题'}
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {mode === 'home' ? renderHome() : renderQuiz()}
    </div>
  );
};

export default App;