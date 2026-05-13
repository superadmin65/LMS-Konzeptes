import React, { useState, useEffect, useRef } from 'react';
// We are REUSING the existing CSS to keep the design consistent!
import styles from './InformationProcessingAct.module.css';
import confetti from 'canvas-confetti';

// Helpers
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Custom normalizer for the NEW Visual JSON structure
function normalizeVisualQuestions(raw) {
  return raw.map((q) => {
    const originalText = q.qText || q.question || '';
    const rawOpts = Array.isArray(q.options) ? q.options : [];
    const correctIndex = parseInt(q.correct_answer || '0', 10);

    const indices = rawOpts.map((_, i) => i);
    const shuffledIndices = shuffleArray(indices);

    const shuffledOpts = [];
    let newCorrect = 0;

    shuffledIndices.forEach((origIdx, newIdx) => {
      shuffledOpts.push(rawOpts[origIdx]);
      if (origIdx === correctIndex) newCorrect = newIdx;
    });

    return {
      qTextRaw: originalText,
      qText: originalText,
      options: shuffledOpts,
      correctIndex: newCorrect,
      selectedOption: null,
      userChoice: null,
      answered: false,
    };
  });
}

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function VisualInfoProcessingAct({ data }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [status, setStatus] = useState('PLAYING');

  const [title, setTitle] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!data) return;

    const actTitle = data.title || data.label || 'Select the correct image';
    setTitle(actTitle.replace(/\s*\(/, '\n('));

    // The data comes from data_json in the backend
    setImageSrc(data.image || null);
    setAudioSrc(data.audio || null);

    const rawQuestions = data.questions || [];
    if (rawQuestions.length > 0) {
      setQuestions(normalizeVisualQuestions(rawQuestions));
    }
  }, [data]);

  // AUDIO HANDLERS
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const currentT = audioRef.current.currentTime;
    const totalD = audioRef.current.duration;
    setCurrentTime(currentT);
    if (totalD > 0) setAudioProgress((currentT / totalD) * 100);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setAudioProgress(e.target.value);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
    setCurrentTime(0);
  };

  // GAME HANDLERS
  const handleOptionClick = (idx) => {
    const updated = [...questions];
    const activeQ = updated[current];
    if (activeQ.answered) return;
    activeQ.selectedOption = idx;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    const updated = [...questions];
    const activeQ = updated[current];

    if (activeQ.selectedOption === null) return;

    activeQ.answered = true;
    activeQ.userChoice = activeQ.selectedOption;

    const isCorrect = activeQ.userChoice === activeQ.correctIndex;

    setQuestions(updated);
    setAttempted((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      const scrollContainer = document.getElementById('visualProcInner');
      if (scrollContainer)
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStatus('SUMMARY');
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const resetActivity = () => {
    if (!window.confirm('Are you sure you want to reset this activity?'))
      return;
    const rawQuestions = data.questions || [];
    setQuestions(normalizeVisualQuestions(rawQuestions));
    setCurrent(0);
    setScore(0);
    setAttempted(0);
    setStatus('PLAYING');

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setAudioProgress(0);
    setCurrentTime(0);
  };

  const handleFinalNext = () => {
    try {
      window.parent.postMessage(
        JSON.stringify({ done: true, score, total: attempted }),
        '*'
      );
    } catch (_) {}
  };

  if (questions.length === 0) return null;

  const q = questions[current];
  const total = questions.length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.mainCard}>
        <div className={styles.mainCardInner} id="visualProcInner">
          {/* MEDIA PROMPT */}
          {(title || imageSrc || audioSrc) && status === 'PLAYING' && (
            <div className={styles.mediaWrap}>
              {title && <div className={styles.title}>{title}</div>}

              {imageSrc && (
                <div className={styles.imageWrap}>
                  <img src={imageSrc} alt="Prompt Resource" />
                </div>
              )}

              {audioSrc && (
                <div className={styles.customAudioPlayer}>
                  <audio
                    ref={audioRef}
                    src={audioSrc}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleAudioEnded}
                  />
                  <button className={styles.playPauseBtn} onClick={togglePlay}>
                    {isPlaying ? '❚❚' : '▶'}
                  </button>
                  <div className={styles.seekBarContainer}>
                    <div
                      className={styles.seekFill}
                      style={{ width: `${audioProgress}%` }}
                    />
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

          {/* GAMEPLAY */}
          {status === 'PLAYING' ? (
            <>
              <div className={styles.qTitle}>
                Question {current + 1} of {total}
              </div>

              {q.qText && (
                <div
                  className={styles.question}
                  dangerouslySetInnerHTML={{ __html: q.qText }}
                />
              )}

              {/* IMAGE OPTIONS GRID */}
              <div
                className={styles.options}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  width: '100%',
                }}
              >
                {q.options.map((optUrl, i) => {
                  const isSelected = q.selectedOption === i;
                  const isCorrectAns = q.correctIndex === i;

                  let labelClass = styles.optLabel;
                  if (!q.answered && isSelected)
                    labelClass += ` ${styles.selected}`;
                  if (q.answered) {
                    if (isCorrectAns) labelClass += ` ${styles.correct}`;
                    else if (q.userChoice === i)
                      labelClass += ` ${styles.wrong}`;
                  }

                  return (
                    <div
                      key={i}
                      className={styles.option}
                      onClick={() => handleOptionClick(i)}
                      style={{ flexDirection: 'column', alignItems: 'center' }}
                    >
                      <div
                        className={labelClass}
                        style={{
                          padding: '10px',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {optUrl ? (
                          <img
                            src={optUrl}
                            alt={`Option ${i + 1}`}
                            style={{
                              width: '100%',
                              height: '180px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              height: '180px',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#999',
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {q.answered && (
                <div
                  className={`${styles.mark} ${q.userChoice === q.correctIndex ? styles.right : styles.wrong}`}
                >
                  {q.userChoice === q.correctIndex ? '✔' : '✖'}
                </div>
              )}

              <div className={styles.controlsRow}>
                <div className={styles.score}>
                  Score : {score} / {attempted}
                </div>
                <button
                  className={styles.nextBtn}
                  onClick={!q.answered ? handleSubmit : handleNext}
                  disabled={!q.answered && q.selectedOption === null}
                >
                  {!q.answered
                    ? 'Submit'
                    : current + 1 === total
                      ? 'Finish'
                      : 'Next'}
                </button>
              </div>
            </>
          ) : (
            /* SUMMARY SCREEN */
            <>
              <div className={styles.summaryTitle}>Activity Completed!</div>
              <div className={styles.summary}>
                {questions.map((sq, i) => (
                  <div key={i} className={styles.summaryItem}>
                    <div>
                      {i + 1}. {sq.qTextRaw || 'Image Selection'}
                    </div>
                    <div
                      className={
                        sq.userChoice === sq.correctIndex
                          ? styles.summaryCorrect
                          : styles.summaryWrong
                      }
                    >
                      Result:{' '}
                      {sq.userChoice === sq.correctIndex ? 'Correct' : 'Wrong'}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.controlsRow}>
                <div className={styles.score}>
                  Final Score: {score} / {attempted}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className={`${styles.btn} ${styles.primary}`}
                    onClick={resetActivity}
                  >
                    Reset Activity
                  </button>
                  <button
                    className={`${styles.btn} ${styles.primary}`}
                    onClick={handleFinalNext}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
