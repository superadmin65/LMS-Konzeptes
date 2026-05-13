import React, { useState, useEffect } from "react";
import styles from "./ClickAndDrag.module.css";

export default function ClickAndDragAct({ data }) {
  const activityData = data?.rows ? data : data?.data;
  const rows = activityData?.rows || [];

  const [currentRow, setCurrentRow] = useState(0);
  const [rowStates, setRowStates] = useState({});
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // New States for Feedback and Progression
  const [submissionStatus, setSubmissionStatus] = useState("idle"); // 'idle', 'correct', or 'wrong'
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (rows.length > 0 && rows[currentRow]) {
      const row = rows[currentRow];

      const allOptions = [...row.distractors, row.correctAnswer]
        .map((opt, index) => ({
          ...opt,
          _uid: `opt_${currentRow}_${index}`,
        }))
        .sort(() => Math.random() - 0.5);

      setOptions(allOptions);
      setShowOptions(false);
      setSelectedOption(null);
      setSubmissionStatus("idle"); // Reset feedback state for the new question
    }
  }, [currentRow, rows]);

  const handleConfirm = () => {
    if (!selectedOption) return;

    const row = rows[currentRow];

    // Check correctness
    const isCorrect =
      selectedOption.id === row.correctAnswer.id ||
      selectedOption.src === row.correctAnswer.src;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setSubmissionStatus("correct");
    } else {
      setSubmissionStatus("wrong");
    }

    // Feed the image into the box and hide the popup menu
    setRowStates((prev) => ({ ...prev, [currentRow]: selectedOption.src }));
    setShowOptions(false);
  };

  // Triggered by the "Next" button in the feedback banner
  const handleNextQuestion = () => {
    if (currentRow < rows.length - 1) {
      setCurrentRow((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const resetActivity = () => {
    if (!window.confirm("Are you sure you want to reset this activity?"))
      return;
    setCurrentRow(0);
    setRowStates({});
    setScore(0);
    setIsFinished(false);
    setSelectedOption(null);
    setShowOptions(false);
    setSubmissionStatus("idle");
  };

  const handleFinalNext = () => {
    try {
      window.parent.postMessage(
        JSON.stringify({
          done: true,
          score: score,
          total: rows.length,
        }),
        "*",
      );
    } catch (_) {}
  };

  if (rows.length === 0)
    return <div className={styles.container}>No data found.</div>;

  const row = rows[currentRow];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{activityData?.title}</h2>

      <div className={styles.exerciseArea}>
        {!isFinished ? (
          <div key={currentRow} className={styles.row}>
            <div className={styles.rowHeader}>
              <span className={styles.wordLabel}>{row.word}</span>
              <div className={styles.audioWrapper}>
                <audio
                  controls
                  src={row.audioSrc}
                  className={styles.customAudio}
                  controlsList="nodownload noplaybackrate"
                />
              </div>
            </div>

            <div className={styles.grid}>
              {row.examples.map((ex, i) => (
                <div key={`ex-${i}`} className={styles.imageBlock}>
                  <img src={ex.src} alt="example" className={styles.fullImg} />
                </div>
              ))}

              <div className={styles.targetWrapper}>
                {showOptions && submissionStatus === "idle" && (
                  <div className={styles.floatingOptions}>
                    <div className={styles.optionsList}>
                      {options.map((opt) => (
                        <div
                          key={opt._uid}
                          className={`${styles.optionMiniCard} ${
                            selectedOption?._uid === opt._uid
                              ? styles.selectedHighlight
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOption(opt);
                          }}
                        >
                          <img
                            src={opt.src}
                            alt="option"
                            className={styles.fullImg}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      className={styles.submitBtn}
                      disabled={!selectedOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm();
                      }}
                    >
                      Submit
                    </button>
                  </div>
                )}

                {/* Target Box */}
                <div
                  className={`${styles.imageBlock} ${styles.dropTarget} ${
                    rowStates[currentRow] ? styles.filled : ""
                  }`}
                  // Only allow clicking if they haven't submitted an answer yet
                  onClick={() =>
                    submissionStatus === "idle" && setShowOptions(!showOptions)
                  }
                >
                  {rowStates[currentRow] ? (
                    <img
                      src={rowStates[currentRow]}
                      alt="selected"
                      className={`${styles.fullImg} ${styles.fadeIn}`}
                    />
                  ) : (
                    <div className={styles.placeholder}>?</div>
                  )}
                </div>
              </div>
            </div>

            {/* NEW: Feedback Banner */}
            {/* NEW: Separated Feedback Badge & Next Button */}
            {submissionStatus !== "idle" && (
              <div className={styles.feedbackWrapper}>
                {/* The Pill-Shaped Text Badge */}
                <div
                  className={`${styles.feedbackBadge} ${submissionStatus === "correct" ? styles.badgeCorrect : styles.badgeWrong}`}
                >
                  {submissionStatus === "correct"
                    ? "🎉 Great Job! Click Next to continue."
                    : "❌ Oops! That wasn't quite right. Click Next to continue."}
                </div>

                {/* The Separate Next Button */}
                <button
                  className={styles.nextQuestionBtn}
                  onClick={handleNextQuestion}
                >
                  Next
                </button>
              </div>
            )}

            <div className={styles.progressFooter}>
              Question {currentRow + 1} of {rows.length}
            </div>
          </div>
        ) : (
          <div className={styles.row}>
            <h2 className={styles.summaryTitle}>Activity Completed!</h2>

            <div className={styles.footerRow}>
              <div className={styles.scoreText}>
                Final Score: {score} / {rows.length}
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.resetBtn} onClick={resetActivity}>
                  Reset Activity
                </button>
                <button className={styles.nextActBtn} onClick={handleFinalNext}>
                  Next Activity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
