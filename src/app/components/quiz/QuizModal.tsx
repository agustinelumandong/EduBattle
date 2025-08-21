'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import React, { useCallback, useEffect, useState } from 'react';
import type { QuizQuestion } from '../../data/game-config';
import { QUIZ_BANK, SUBJECT_COLORS, SUBJECT_ICONS } from '../../data/game-config';

interface QuizModalProps {
  isOpen: boolean;
  unitType: string;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  unitType,
  onAnswer,
  onClose
}) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [numericAnswer, setNumericAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const generateQuestion = useCallback((unitType: string): QuizQuestion | null => {
    const subjectMap: Record<string, string> = {
      knight: 'math',
      mage: 'science',
      archer: 'history'
    };
    
    const subject = subjectMap[unitType] || 'math';
    const subjectQuestions = QUIZ_BANK.filter(q => q.subject === subject);
    
    if (subjectQuestions.length === 0) return null;
    
    return subjectQuestions[Math.floor(Math.random() * subjectQuestions.length)];
  }, []);

  useEffect(() => {
    if (isOpen && !hasAnswered) {
      const newQuestion = generateQuestion(unitType);
      setQuestion(newQuestion);
      setTimeLeft(10);
      setSelectedAnswer('');
      setNumericAnswer('');
      setShowResult(false);
      setHasAnswered(false);
    }
  }, [isOpen, unitType, hasAnswered, generateQuestion]);

  useEffect(() => {
    if (!isOpen || hasAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, hasAnswered]);

  const handleTimeUp = useCallback(() => {
    if (hasAnswered) return;
    
    setHasAnswered(true);
    setIsCorrect(false);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(false);
      onClose();
    }, 1500);
  }, [hasAnswered, onAnswer, onClose]);

  const handleSubmitAnswer = useCallback(() => {
    if (!question || hasAnswered) return;

    let userAnswer: string | number;
    if (question.options) {
      userAnswer = selectedAnswer;
    } else {
      userAnswer = parseFloat(numericAnswer) || numericAnswer;
    }

    const correct = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
    
    setHasAnswered(true);
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
      onClose();
    }, 1500);
  }, [question, selectedAnswer, numericAnswer, hasAnswered, onAnswer, onClose]);

  if (!isOpen || !question) return null;

  const subjectMap: Record<string, string> = {
    knight: 'math',
    mage: 'science',
    archer: 'history'
  };
  
  const subject = subjectMap[unitType] || 'math';
  const subjectColor = SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS];
  const subjectIcon = SUBJECT_ICONS[subject as keyof typeof SUBJECT_ICONS];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center" style={{ backgroundColor: subjectColor, color: 'white' }}>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <span className="text-3xl">{subjectIcon}</span>
            Quiz Challenge
            <span className="text-3xl">{subjectIcon}</span>
          </CardTitle>
          <div className="mt-2">
            <Progress 
              value={(timeLeft / 10) * 100} 
              className="w-full h-3"
            />
            <p className="text-sm mt-1 font-bold">
              Time: {timeLeft}s
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {!showResult ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">
                {question.question}
              </h3>
              
              {question.options ? (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === option ? "default" : "outline"}
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedAnswer(option)}
                      disabled={hasAnswered}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter your answer..."
                    value={numericAnswer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumericAnswer(e.target.value)}
                    disabled={hasAnswered}
                    className="text-center text-lg"
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        handleSubmitAnswer();
                      }
                    }}
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={
                    hasAnswered || 
                    (question.options ? !selectedAnswer : !numericAnswer.trim())
                  }
                  className="flex-1"
                  size="lg"
                >
                  Submit Answer
                </Button>
                <Button
                  onClick={() => {
                    onAnswer(false);
                    onClose();
                  }}
                  variant="outline"
                  size="lg"
                >
                  Skip
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className={`text-6xl ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? '✅' : '❌'}
              </div>
              <h3 className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'Correct!' : 'Wrong Answer'}
              </h3>
              <p className="text-gray-600">
                {isCorrect 
                  ? 'You will deploy a full-strength unit!'
                  : 'You will deploy a weakened unit.'
                }
              </p>
              {!isCorrect && (
                <p className="text-sm text-gray-500">
                  Correct answer: {question.correctAnswer}
                </p>
              )}
              {question.explanation && (
                <p className="text-sm text-blue-600 italic">
                  {question.explanation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizModal;