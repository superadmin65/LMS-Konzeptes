import React, { useState, useEffect } from "react";
import styles from "./McqAct.module.css";
import { apiService } from "../../utils/apiService";
import Confetti from "react-confetti";

const LABELS = ["A", "B", "C", "D", "E", "F"];

function parseOptionsString(raw) {
  return (raw || "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeQuestions(raw) {
  return raw.map((q) => {
    const original = q.qText || q.text || "";
    const rawOpts = parseOptionsString(q.options || q.option || "");

    let originalCorrectIndex = -1;
    const cleanedOpts = rawOpts.map((opt, idx) => {
      if (opt.includes("*")) {
        originalCorrectIndex = idx;
        return opt.replace(/\*/g, "").trim();
      }
      return opt;
    });
    if (originalCorrectIndex === -1) originalCorrectIndex = 0;

    const order = shuffleArray(cleanedOpts.map((_, i) => i));
    const shuffled = [];
    let newCorrectIndex = -1;
    order.forEach((oldIndex, newIndex) => {
      shuffled.push(cleanedOpts[oldIndex]);
      if (oldIndex === originalCorrectIndex) newCorrectIndex = newIndex;
    });

    return {
      qTextRaw: original,
      qText: original,
      options: shuffled,
      correctIndex: newCorrectIndex,
      answered: false,
      userChoice: null,
      selectedOption: null,
    };
  });
}

export default function McqAct({ data }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [status, setStatus] = useState("STARTED");
  const [userId, setUserId] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState("");

  const total = questions.length;
  const activityId = data?.id || "mcq_default";

  useEffect(() => {
    if (!data) return;
    const currentUserId = Number(
      data.user_id || localStorage.getItem("user_id") || 0
    );
    setUserId(currentUserId);

    const initQuiz = async () => {
      const raw = data.questions || [];
      let initialQuestions = normalizeQuestions(raw);

      try {
        const response = await apiService.getMcqProgress(currentUserId, activityId);
        const savedState = response.data || response;

        if (savedState && savedState.status !== "empty") {
          if (
            savedState.questions &&
            savedState.questions.length === initialQuestions.length
          ) {
            initialQuestions = savedState.questions;
          }
          setCurrent(savedState.current || 0);
          setScore(savedState.score || 0);
          setAttempted(savedState.attempted || 0);

          const isFinished =
            savedState.attempted >= initialQuestions.length ||
            savedState.current >= initialQuestions.length;
          if (isFinished && initialQuestions.length > 0) setStatus("SUMMARY");
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      }

      setQuestions(initialQuestions);
    };

    initQuiz();
  }, [data, activityId]);

  const saveProgressAPI = async (
    qs,
    currIdx,
    currentScore,
    currentAttempted,
    overrideStatus = "IN_PROGRESS"
  ) => {
    if (!userId) return;
    try {
      await apiService.saveMcqProgress({
        user_id: userId,
        activity_id: activityId,
        progress_json: JSON.stringify({
          current: currIdx,
          score: currentScore,
          attempted: currentAttempted,
          questions: qs,
          total: qs.length,
          status: overrideStatus,
        }),
        score: currentScore,
        attempted: currentAttempted,
        status: overrideStatus,
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  const completeQuizAPI = async () => {
    if (!userId) return;
    try {
      await apiService.completeMcq({
        user_id: userId,
        activity_id: activityId,
        score,
        attempted,
      });
    } catch (err) {
      console.error("Failed to complete quiz", err);
    }
  };

  const handleOptionClick = (idx) => {
    const updated = [...questions];
    if (updated[current].answered) return;
    updated[current] = { ...updated[current], selectedOption: idx };
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    const updated = [...questions];
    const activeQ = { ...updated[current] };
    if (activeQ.selectedOption === null) return;

    activeQ.answered = true;
    activeQ.userChoice = activeQ.selectedOption;
    updated[current] = activeQ;

    let newScore = score;
    const isCorrect = activeQ.userChoice === activeQ.correctIndex;
    if (isCorrect) {
      newScore += 1;
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setFeedback("🎉 Awesome! That's correct!");
    } else {
      setFeedback(
        `The correct answer is: ${activeQ.options[activeQ.correctIndex]}`
      );
    }

    const newAttempted = attempted + 1;
    setQuestions(updated);
    setScore(newScore);
    setAttempted(newAttempted);
    await saveProgressAPI(updated, current, newScore, newAttempted);
  };

  const handleNext = async () => {
    setFeedback("");
    setIsSaving(true);
    if (current + 1 < total) {
      const nextIdx = current + 1;
      await saveProgressAPI(questions, nextIdx, score, attempted);
      setCurrent(nextIdx);
    } else {
      await saveProgressAPI(questions, total, score, attempted, "COMPLETED");
      await completeQuizAPI();
      setStatus("SUMMARY");
    }
    setIsSaving(false);
  };

  const handleSkip = async () => {
    setFeedback("");
    const updated = [...questions];
    updated[current] = { ...updated[current], answered: true, userChoice: -1 };
    setQuestions(updated);
    const newAttempted = attempted + 1;
    setAttempted(newAttempted);

    if (current + 1 < total) {
      await saveProgressAPI(updated, current + 1, score, newAttempted);
      setCurrent((c) => c + 1);
    } else {
      await saveProgressAPI(updated, total, score, newAttempted, "COMPLETED");
      setStatus("SUMMARY");
    }
  };

  const resetQuiz = async () => {
    if (!window.confirm("Are you sure you want to reset this activity?")) return;
    const raw = data.questions || [];
    const resetQuestions = normalizeQuestions(raw);
    setQuestions(resetQuestions);
    setCurrent(0);
    setScore(0);
    setAttempted(0);
    setStatus("STARTED");
    setFeedback("");
    await saveProgressAPI(resetQuestions, 0, 0, 0, "IN_PROGRESS");
  };

  const handleFinalNext = () => {
    try {
      window.parent.postMessage(
        JSON.stringify({ done: true, score, total: attempted }),
        "*"
      );
    } catch (_) {}
  };

  if (questions.length === 0) return null;

  const currentQ = questions[current];
  const isSummary = status === "SUMMARY";
  const correctCount = questions.filter(
    (q) => q.answered && q.userChoice === q.correctIndex
  ).length;
  const wrongCount = questions.filter(
    (q) => q.answered && q.userChoice !== q.correctIndex && q.userChoice !== -1
  ).length;

  return (
    <div className={styles.wrapper}>
      {showConfetti && <Confetti />}

      {!isSummary ? (
        <div className={styles.container}>

          {/* Instruction card */}
          <div className={styles.instructionCard}>
            <div className={styles.instrIcon}>🎯</div>
            <div>
              <div className={styles.instrTitle}>
                {(data.title || "Multiple Choice Question").replace(/\s*\(/, "\n(")}
              </div>
              <div className={styles.instrSub}>
                Choose the correct answer from the options below.
              </div>
            </div>
          </div>

          {/* Progress strip */}
          <div className={styles.progressStrip}>
            <div className={styles.qDots}>
              {questions.map((q, i) => {
                const isCorrect = q.answered && q.userChoice === q.correctIndex;
                const isWrong = q.answered && q.userChoice !== q.correctIndex;
                let cls = styles.qDot;
                if (i === current) cls = `${styles.qDot} ${styles.qDotCurrent}`;
                else if (isCorrect) cls = `${styles.qDot} ${styles.qDotCorrect}`;
                else if (isWrong) cls = `${styles.qDot} ${styles.qDotWrong}`;
                return <div key={i} className={cls} />;
              })}
            </div>
            <div className={styles.qLabel}>
              Question {current + 1} of {total}
            </div>
          </div>

          {/* Question card */}
          <div className={styles.questionCard}>
            <div className={styles.qHeader}>
              <div className={styles.qNumBadge}>Question {current + 1}</div>
            </div>

            <div className={styles.optionsGrid}>
              {data.passage && (
                <div className={styles.passageBox}>{data.passage}</div>
              )}
              <div
                className={styles.questionText}
                dangerouslySetInnerHTML={{ __html: currentQ.qText }}
              />

              {currentQ.options.map((opt, i) => {
                const isSelected = currentQ.selectedOption === i;
                const isCorrectAns = currentQ.correctIndex === i;

                let cls = styles.option;
                let indicator = null;

                if (!currentQ.answered && isSelected) {
                  cls = `${styles.option} ${styles.optionSelected}`;
                }
                if (currentQ.answered) {
                  if (isCorrectAns) {
                    cls = `${styles.option} ${styles.optionCorrect}`;
                    indicator = "✅";
                  } else if (isSelected) {
                    cls = `${styles.option} ${styles.optionWrong}`;
                    indicator = "❌";
                  } else {
                    cls = `${styles.option} ${styles.optionDimmed}`;
                  }
                }

                return (
                  <button key={i} className={cls} onClick={() => handleOptionClick(i)}>
                    <div className={styles.optLabel}>{LABELS[i]}</div>
                    <div className={styles.optText}>{opt}</div>
                    {indicator && (
                      <div className={styles.optIndicator}>{indicator}</div>
                    )}
                  </button>
                );
              })}
            </div>

            {currentQ.answered && (
              <div
                className={`${styles.explanation} ${
                  currentQ.userChoice === currentQ.correctIndex
                    ? styles.explanationCorrect
                    : styles.explanationWrong
                }`}
              >
                <span className={styles.expIcon}>💡</span>
                <span>{feedback}</span>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className={styles.actionBar}>
            <div className={styles.scoreDisplay}>
              <div className={styles.sdLabel}>Score</div>
              <div className={styles.sdVal}>{score}</div>
              <div className={styles.sdMax}>/ {total}</div>
            </div>
            <div className={styles.actionBtns}>
              {!currentQ.answered && (
                <>
                  <button
                    className={`${styles.btn} ${styles.btnOutline}`}
                    onClick={handleSkip}
                  >
                    Skip →
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleSubmit}
                    disabled={currentQ.selectedOption === null}
                  >
                    Submit
                  </button>
                </>
              )}
              {currentQ.answered && (
                <button
                  className={`${styles.btn} ${styles.btnNext}`}
                  onClick={handleNext}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : current + 1 === total
                    ? "Finish 🎓"
                    : "Next Question →"}
                </button>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* ── Result overlay ── */
        <div className={styles.resultOverlay}>
          <div className={styles.resultBox}>
            <div className={styles.resultEmoji}>
              {score / total >= 0.8 ? "🏆" : score / total >= 0.6 ? "🎉" : "📚"}
            </div>
            <div className={styles.resultTitle}>
              {score === total
                ? "Perfect Score!"
                : score / total >= 0.6
                ? "Well Done!"
                : "Keep Practising!"}
            </div>
            <div className={styles.resultSub}>
              You scored {Math.round((score / total) * 100)}% on this activity.
            </div>
            <div className={styles.resultScoreBig}>{score}</div>
            <div className={styles.resultScoreLbl}>out of {total} points</div>
            <div className={styles.resultBreakdown}>
              <div className={`${styles.rbItem} ${styles.rbCorrect}`}>
                ✓ {correctCount} correct
              </div>
              <div className={`${styles.rbItem} ${styles.rbWrong}`}>
                ✗ {wrongCount} wrong
              </div>
            </div>
            <div className={styles.resultBtns}>
              <button
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={resetQuiz}
              >
                ↺ Try Again
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleFinalNext}
              >
                Finish 🎓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}