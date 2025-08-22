"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useCallback, useEffect, useState } from "react";
import type { QuizQuestion } from "../../data/game-config";
import {
  QUIZ_BANK,
  SUBJECT_ICONS
} from "../../data/game-config";

interface QuizModalProps {
  isOpen: boolean;
  unitType: string;
  spellId?: string;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  unitType,
  spellId,
  onAnswer,
  onClose,
}) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [numericAnswer, setNumericAnswer] = useState<string>("");
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const generateQuestion = useCallback(
    (unitType: string, spellId?: string): QuizQuestion | null => {
      // If it's a spell quiz, determine subject based on spell
      if (spellId) {
        const spellSubjectMap: Record<string, string> = {
          freeze: "science", // Ice/freezing is science
          meteor: "math", // Astronomy/meteors is science
        };

        const subject = spellSubjectMap[spellId] || "math";
        const subjectQuestions = QUIZ_BANK.filter((q) => q.subject === subject);

        if (subjectQuestions.length === 0) return null;

        return subjectQuestions[
          Math.floor(Math.random() * subjectQuestions.length)
        ];
      }

      // Otherwise, it's a unit quiz
      const subjectMap: Record<string, string> = {
        knight: "math",
        mage: "science",
        archer: "history",
      };

      const subject = subjectMap[unitType] || "math";
      const subjectQuestions = QUIZ_BANK.filter((q) => q.subject === subject);

      if (subjectQuestions.length === 0) return null;

      return subjectQuestions[
        Math.floor(Math.random() * subjectQuestions.length)
      ];
    },
    []
  );

  useEffect(() => {
    if (isOpen && !hasAnswered) {
      const newQuestion = generateQuestion(unitType, spellId);
      setQuestion(newQuestion);
      setTimeLeft(10);
      setSelectedAnswer("");
      setNumericAnswer("");
      setShowResult(false);
      setHasAnswered(false);
    }
  }, [isOpen, unitType, spellId, hasAnswered, generateQuestion]);

  useEffect(() => {
    if (!isOpen || hasAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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
      // Don't call onClose if we're handling the answer
      // onClose();
      // Reset state after closing
      setHasAnswered(false);
      setShowResult(false);
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

    const correct =
      String(userAnswer).toLowerCase() ===
      String(question.correctAnswer).toLowerCase();

    setHasAnswered(true);
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
      // Don't call onClose if we're handling the answer
      // onClose();
      // Reset state after closing
      setHasAnswered(false);
      setShowResult(false);
    }, 1500);
  }, [question, selectedAnswer, numericAnswer, hasAnswered, onAnswer, onClose]);

  if (!isOpen || !question) return null;

  const subjectMap: Record<string, string> = {
    knight: "math",
    mage: "science",
    archer: "history",
  };

  const subject = subjectMap[unitType] || "math";
  // const subjectColor = SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS];
  const subjectIcon = SUBJECT_ICONS[subject as keyof typeof SUBJECT_ICONS];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white/95 backdrop-blur-sm border-2 shadow-2xl  ">
        <CardHeader className="text-center p-3 sm:p-4">
          <CardTitle 
            className="text-lg sm:text-xl md:text-2xl flex items-center justify-center gap-1 sm:gap-2"
            style={{ 
              color: "black", 
              fontFamily: "'Press Start 2P', cursive",
              lineHeight: "1.4"
            }}
          >
            <span className="text-xl sm:text-2xl md:text-3xl">{subjectIcon}</span>
            <span className="text-center px-1">
              {spellId ? "Spell Quiz" : "Quiz Challenge"}
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl">{subjectIcon}</span>
          </CardTitle>
          
          {/* Mobile-optimized Timer and Progress */}
          <div className="space-y-2">
            <div className=" p-2">
              <progress 
                className="nes-progress is-warning w-full"
                value={timeLeft} 
                max="10"
                style={{ height: "20px" }}
              />
              <div 
                className="text-center mt-1"
                style={{ 
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "10px",
                  color: "black"
                }}
              >
                Time: {timeLeft}s
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 md:p-6">
          {!showResult ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Question Text - Mobile Optimized */}
              <div className="  p-3 sm:p-4 mb-2">
                <h5 
                  className="text-sm sm:text-base md:text-lg text-center"
                  style={{ 
                    fontFamily: "'Press Start 2P', cursive",
                    lineHeight: "1.6",
                    color: "#212529"
                  }}
                >
                  {question.question}
                </h5>
              </div>

              {question.options ? (
                <div className="space-y-3 sm:space-y-4">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      className={`nes-btn w-full text-left p-3 sm:p-4 ${
                        selectedAnswer === option 
                          ? "is-primary" 
                          : hasAnswered 
                            ? "is-disabled" 
                            : ""
                      }`}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={hasAnswered}
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: "10px",
                        lineHeight: "1.4",
                        minHeight: "44px", // Touch-friendly minimum height
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start"
                      }}
                    >
                      <span className="mr-2 font-bold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span style={{ fontSize: "9px", lineHeight: "1.3" }}>
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="nes-field">
                    <input
                      type="text"
                      className="nes-input w-full"
                      placeholder="Enter your answer..."
                      value={numericAnswer}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNumericAnswer(e.target.value)
                      }
                      disabled={hasAnswered}
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: "12px",
                        textAlign: "center",
                        minHeight: "44px", // Touch-friendly
                        padding: "12px"
                      }}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          handleSubmitAnswer();
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Mobile-Optimized Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-6">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={
                    hasAnswered ||
                    (question.options ? !selectedAnswer : !numericAnswer.trim())
                  }
                  className={`nes-btn ${
                    hasAnswered ||
                    (question.options ? !selectedAnswer : !numericAnswer.trim())
                      ? "is-disabled"
                      : "is-success"
                  } flex-1`}
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "10px",
                    minHeight: "48px", // Extra touch-friendly
                    padding: "12px 16px"
                  }}
                >
                  Submit Answer
                </button>
                <button
                  onClick={() => {
                    onAnswer(false);
                    onClose();
                  }}
                  className="nes-btn is-error sm:w-auto w-full"
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "10px",
                    minHeight: "48px", // Extra touch-friendly
                    padding: "12px 16px"
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 sm:space-y-6">
              {/* Mobile-Optimized Result Display */}
              <div className="nes-container is-rounded p-4 sm:p-6">
                <div
                  className={`text-4xl sm:text-5xl md:text-6xl mb-4`}
                >
                  {isCorrect ? "✅" : "❌"}
                </div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    color: isCorrect ? "#22c55e" : "#ef4444",
                    marginBottom: "16px"
                  }}
                >
                  {isCorrect ? "Correct!" : "Wrong Answer"}
                </h3>
                <p 
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "10px",
                    lineHeight: "1.6",
                    color: "#6b7280",
                    marginBottom: "12px"
                  }}
                >
                  {isCorrect
                    ? "You will deploy a full-strength unit!"
                    : "You will deploy a weakened unit."}
                </p>
                {!isCorrect && (
                  <p 
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: "9px",
                      lineHeight: "1.5",
                      color: "#9ca3af",
                      marginBottom: "12px"
                    }}
                  >
                    Correct answer: {question.correctAnswer}
                  </p>
                )}
                {question.explanation && (
                  <p 
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: "8px",
                      lineHeight: "1.5",
                      color: "#3b82f6",
                      fontStyle: "italic"
                    }}
                  >
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizModal;
