import React, { useState, useEffect } from "react";
import styles from "./JumbledWordsAct.module.css";
import Confetti from "react-confetti";

const STORAGE_KEY = (id) => `jumbled_progress_${id}`;

function shuffleArray(array) {
  return [...array]
    .map((item) => ({
      ...item,
      sort: Math.random(),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ sort, ...item }) => item);
}

function normalizeQuestions(raw) {
  return raw.map((item, qIndex) => {
    const text = item.text.trim();

    let parts = [];

    if (text.includes(" ")) {
      // sentence → split words
      parts = text.split(/\s+/);
    } else {
      // single word → split Hindi safely
      const segmenter = new Intl.Segmenter("hi", {
        granularity: "grapheme",
      });

      parts = [...segmenter.segment(text)].map((s) => s.segment);
    }

    return {
      id: qIndex + 1,
      original: text,
      completed: false,
      answered: false,

      shuffledWords: shuffleArray(
        parts.map((part, index) => ({
          id: `${qIndex}_${index}`,
          text: part,
        })),
      ),
    };
  });
}

export default function JumbledWordsAct({ data }) {
  const activityId = data?.id || "default_jumbled";

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [status, setStatus] = useState("STARTED");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  /* Load activity */
  useEffect(() => {
    if (!data) return;

    const saved = localStorage.getItem(STORAGE_KEY(activityId));

    if (saved) {
      const parsed = JSON.parse(saved);

      setQuestions(parsed.questions);
      setCurrent(parsed.current);
      setSelectedWords(parsed.selectedWords);
      setScore(parsed.score);
      setStatus(parsed.status);

      return;
    }

    setQuestions(normalizeQuestions(data.questions || []));
  }, [data]);

  /* Save activity */
  useEffect(() => {
    if (!questions.length) return;

    localStorage.setItem(
      STORAGE_KEY(activityId),
      JSON.stringify({
        questions,
        current,
        selectedWords,
        score,
        status,
      }),
    );
  }, [questions, current, selectedWords, score, status]);

  if (!questions.length) return null;

  const currentQuestion = questions[current];

  const answer = currentQuestion.original.includes(" ")
    ? selectedWords.map((w) => w.text).join(" ")
    : selectedWords.map((w) => w.text).join("");

  const isCorrect = answer.trim() === currentQuestion.original.trim();

  const addWord = (obj) => {
    setSelectedWords((prev) => [...prev, obj]);
  };

  const removeWord = (id) => {
    setSelectedWords((prev) => prev.filter((w) => w.id !== id));
  };

  const handleSubmit = () => {
    const updated = [...questions];

    updated[current].answered = true;

    setQuestions(updated);

    if (isCorrect) {
      updated[current].completed = true;

      setScore((s) => s + 1);

      setFeedback("🎉 Great! Correct answer");

      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 1500);
    } else {
      setFeedback(`❌ Correct answer: ${currentQuestion.original}`);
    }
  };

  const handleNext = () => {
    setFeedback("");

    if (current + 1 < questions.length) {
      setCurrent(current + 1);

      setSelectedWords([]);
    } else {
      setStatus("SUMMARY");
    }
  };

  const resetActivity = () => {
    localStorage.removeItem(STORAGE_KEY(activityId));

    setQuestions(normalizeQuestions(data.questions || []));

    setCurrent(0);
    setSelectedWords([]);
    setScore(0);
    setFeedback("");
    setStatus("STARTED");
  };

  const completedCount = questions.filter((q) => q.completed).length;
  const total = questions.length;

  const correctCount = questions.filter((q) => q.completed).length;

  const wrongCount = questions.filter((q) => q.answered && !q.completed).length;

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const handleFinalNext = () => {
    try {
      window.parent.postMessage(
        JSON.stringify({
          done: true,
          score,
          total,
        }),
        "*",
      );
    } catch (_) {}
  };

  return (
    <div className={styles.wrapper}>
      {showConfetti && <Confetti />}

      {status !== "SUMMARY" ? (
        <div className={styles.container}>
          {/* instruction */}

          <div className={styles.instructionCard}>
            <div className={styles.instrIcon}>🧩</div>

            <div>
              <div className={styles.instrTitle}>
                {data.title || "Jumbled Words"}
              </div>

              <div className={styles.instrSub}>
                Arrange the words in the correct order.
              </div>
            </div>
          </div>

          {/* progress */}

          <div className={styles.progressStrip}>
            <div className={styles.qDots}>
              {questions.map((q, i) => {
                let cls = styles.qDot;

                if (i === current) cls += ` ${styles.qDotCurrent}`;
                else if (q.completed) cls += ` ${styles.qDotCorrect}`;

                return <div key={i} className={cls} />;
              })}
            </div>

            <div className={styles.qLabel}>
              Question {current + 1} of {questions.length}
            </div>
          </div>

          {/* question */}

          <div className={styles.questionCard}>
            <div className={styles.qHeader}>
              <div className={styles.qNumBadge}>Question {current + 1}</div>
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.answerArea}>
                {!selectedWords.length ? (
                  <span className={styles.placeholder}>Tap below</span>
                ) : (
                  selectedWords.map((word) => (
                    <button
                      key={word.id}
                      className={styles.selectedWord}
                      onClick={() => removeWord(word.id)}
                    >
                      {word.text}
                    </button>
                  ))
                )}
              </div>

              <div className={styles.wordsGrid}>
                {currentQuestion.shuffledWords.map((word) => {
                  const selected = selectedWords.find((w) => w.id === word.id);

                  return (
                    <button
                      key={word.id}
                      disabled={selected}
                      className={styles.wordBtn}
                      onClick={() => addWord(word)}
                    >
                      {word.text}
                    </button>
                  );
                })}
              </div>
            </div>

            {feedback && (
              <div
                className={`${styles.explanation}
  ${isCorrect ? styles.explanationCorrect : styles.explanationWrong}`}
              >
                <span className={styles.expIcon}>💡</span>
                <span>{feedback}</span>
              </div>
            )}
          </div>

          {/* footer */}

          <div className={styles.actionBar}>
            <div className={styles.scoreDisplay}>
              <div className={styles.sdLabel}>Score</div>

              <div className={styles.sdVal}>{score}</div>

              <div className={styles.sdMax}>/ {questions.length}</div>
            </div>

            <div className={styles.actionBtns}>
              {!currentQuestion.answered ? (
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={!selectedWords.length}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              ) : (
                <button
                  className={`${styles.btn} ${styles.btnNext}`}
                  onClick={handleNext}
                >
                  {current + 1 === questions.length
                    ? "Finish 🎓"
                    : "Next Question →"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
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
              You scored {percentage}% on this activity.
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
                onClick={resetActivity}
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
