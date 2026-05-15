import React, { useState, useEffect, useRef } from "react";
import styles from "./McqAudioAct.module.css";
import Confetti from "react-confetti";

const LABELS = ["A", "B", "C", "D", "E", "F"];

function parseOptionsString(raw) {
  return (raw || "").split(/\n|,/).map((s) => s.trim()).filter(Boolean);
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
      if (opt.includes("*")) { originalCorrectIndex = idx; return opt.replace(/\*/g, "").trim(); }
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
    return { qTextRaw: original, qText: original, options: shuffled, correctIndex: newCorrectIndex, answered: false, userChoice: null, selectedOption: null };
  });
}

function formatTime(s) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

export default function McqAudioAct({ data }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [status, setStatus] = useState("STARTED");
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Audio state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const total = questions.length;
  const audioSrc = data?.audio || null;
  const imageSrc = data?.image || data?.bgData?.bgImg || null;
  const actTitle = data?.title || data?.label || "Listening Activity";

    useEffect(() => {
    if (!data) return;
    const raw = data.questions || (Array.isArray(data) ? data : []);
    if (raw.length === 0) return;
    setQuestions(normalizeQuestions(raw));
  }, [data]);

  // Audio handlers
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    const d = audioRef.current.duration;
    setCurrentTime(t);
    if (d > 0) setAudioProgress((t / d) * 100);
  };
  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setAudioProgress(e.target.value);
  };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleAudioEnded = () => { setIsPlaying(false); setAudioProgress(0); setCurrentTime(0); };

  const handleOptionClick = (idx) => {
    const updated = [...questions];
    if (updated[current].answered) return;
    updated[current] = { ...updated[current], selectedOption: idx };
    setQuestions(updated);
  };

  const handleSubmit = () => {
    const updated = [...questions];
    const activeQ = { ...updated[current] };
    if (activeQ.selectedOption === null) return;
    activeQ.answered = true;
    activeQ.userChoice = activeQ.selectedOption;
    updated[current] = activeQ;
    const isCorrect = activeQ.userChoice === activeQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setFeedback("🎉 Awesome! That's correct!");
    } else {
      setFeedback(`The correct answer is: ${activeQ.options[activeQ.correctIndex]}`);
    }
    setAttempted((a) => a + 1);
    setQuestions(updated);
  };

  const handleNext = async () => {
    setFeedback("");
    setIsSaving(true);
    if (current + 1 < total) {
      setCurrent((c) => c + 1);
    } else {
      if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
      setStatus("SUMMARY");
    }
    setIsSaving(false);
  };

  const handleSkip = () => {
    setFeedback("");
    const updated = [...questions];
    updated[current] = { ...updated[current], answered: true, userChoice: -1 };
    setQuestions(updated);
    setAttempted((a) => a + 1);
    if (current + 1 < total) {
      setCurrent((c) => c + 1);
    } else {
      setStatus("SUMMARY");
    }
  };

  const resetQuiz = () => {
    if (!window.confirm("Reset this activity?")) return;
    setQuestions(normalizeQuestions(data.questions || []));
    setCurrent(0); setScore(0); setAttempted(0);
    setStatus("STARTED"); setFeedback("");
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false); setAudioProgress(0); setCurrentTime(0);
  };

  const handleFinalNext = () => {
    try { window.parent.postMessage(JSON.stringify({ done: true, score, total: attempted }), "*"); } catch (_) {}
  };

  if (questions.length === 0) return null;

  const currentQ = questions[current];
  const isSummary = status === "SUMMARY";
  const correctCount = questions.filter((q) => q.answered && q.userChoice === q.correctIndex).length;
  const wrongCount = questions.filter((q) => q.answered && q.userChoice !== q.correctIndex && q.userChoice !== -1).length;

  return (
    <div className={styles.wrapper}>
      {showConfetti && <Confetti />}

      {!isSummary ? (
        <div className={styles.container}>

          {/* Instruction card with audio player */}
          <div className={styles.instructionCard}>
            <div className={styles.instrIcon}>🎧</div>
            <div className={styles.instrBody}>
              <div className={styles.instrTitle}>{actTitle}</div>
              <div className={styles.instrSub}>Listen and choose the correct answer.</div>
            </div>
          </div>

          {/* Audio player card */}
          {(audioSrc || imageSrc) && (
            <div className={styles.audioCard}>
              {imageSrc && (
                <div className={styles.audioImageWrap}>
                  <img src={imageSrc} alt="activity" className={styles.audioImage} />
                </div>
              )}
              {audioSrc && (
                <div className={styles.audioPlayer}>
                  <audio
                    ref={audioRef}
                    src={audioSrc}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleAudioEnded}
                  />
                  <button className={styles.playBtn} onClick={togglePlay}>
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <div className={styles.seekWrap}>
                    <div className={styles.seekFill} style={{ width: `${audioProgress}%` }} />
                    <input
                      type="range"
                      className={styles.seekBar}
                      value={audioProgress}
                      max="100"
                      onChange={handleSeek}
                    />
                  </div>
                  <span className={styles.timeDisplay}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              )}
            </div>
          )}

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
            <div className={styles.qLabel}>Question {current + 1} of {total}</div>
          </div>

          {/* Question card */}
          <div className={styles.questionCard}>
            <div className={styles.qHeader}>
              <div className={styles.qNumBadge}>Question {current + 1}</div>
            </div>
            <div className={styles.optionsGrid}>
              {data.passage && <div className={styles.passageBox}>{data.passage}</div>}
              <div className={styles.questionText} dangerouslySetInnerHTML={{ __html: currentQ.qText }} />
              {currentQ.options.map((opt, i) => {
                const isSelected = currentQ.selectedOption === i;
                const isCorrectAns = currentQ.correctIndex === i;
                let cls = styles.option;
                let indicator = null;
                if (!currentQ.answered && isSelected) cls = `${styles.option} ${styles.optionSelected}`;
                if (currentQ.answered) {
                  if (isCorrectAns) { cls = `${styles.option} ${styles.optionCorrect}`; indicator = "✅"; }
                  else if (isSelected) { cls = `${styles.option} ${styles.optionWrong}`; indicator = "❌"; }
                  else cls = `${styles.option} ${styles.optionDimmed}`;
                }
                return (
                  <button key={i} className={cls} onClick={() => handleOptionClick(i)}>
                    <div className={styles.optLabel}>{LABELS[i]}</div>
                    <div className={styles.optText}>{opt}</div>
                    {indicator && <div className={styles.optIndicator}>{indicator}</div>}
                  </button>
                );
              })}
            </div>
            {currentQ.answered && (
              <div className={`${styles.explanation} ${currentQ.userChoice === currentQ.correctIndex ? styles.explanationCorrect : styles.explanationWrong}`}>
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
                  <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleSkip}>Skip →</button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit} disabled={currentQ.selectedOption === null}>Submit</button>
                </>
              )}
              {currentQ.answered && (
                <button className={`${styles.btn} ${styles.btnNext}`} onClick={handleNext} disabled={isSaving}>
                  {isSaving ? "Saving..." : current + 1 === total ? "Finish 🎓" : "Next Question →"}
                </button>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Result overlay */
        <div className={styles.resultOverlay}>
          <div className={styles.resultBox}>
            <div className={styles.resultEmoji}>{score / total >= 0.8 ? "🏆" : score / total >= 0.6 ? "🎉" : "📚"}</div>
            <div className={styles.resultTitle}>{score === total ? "Perfect Score!" : score / total >= 0.6 ? "Well Done!" : "Keep Practising!"}</div>
            <div className={styles.resultSub}>You scored {Math.round((score / total) * 100)}% on this activity.</div>
            <div className={styles.resultScoreBig}>{score}</div>
            <div className={styles.resultScoreLbl}>out of {total} points</div>
            <div className={styles.resultBreakdown}>
              <div className={`${styles.rbItem} ${styles.rbCorrect}`}>✓ {correctCount} correct</div>
              <div className={`${styles.rbItem} ${styles.rbWrong}`}>✗ {wrongCount} wrong</div>
            </div>
            <div className={styles.resultBtns}>
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={resetQuiz}>↺ Try Again</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleFinalNext}>Finish 🎓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}