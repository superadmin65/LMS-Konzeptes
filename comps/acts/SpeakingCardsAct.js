import React, { useState, useEffect, useRef } from "react";
import styles from "./SpeakingCardsAct.module.css";
import { apiService } from "../../utils/apiService";
import Confetti from "react-confetti";

function normalizeCards(raw) {
  return raw.map((item, idx) => ({
    id: item.id || idx + 1,
    text: item.text || "",
    audio: item.audio || "",
    image: item.image || "",
    listened: false,
  }));
}

export default function SpeakingCardsAct({ data }) {
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState("STARTED");
  const [userId, setUserId] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const total = cards.length;

  const activityId = data?.id || "speaking_default";

  const successMsgs = [
    "🎉 Excellent Speaking!",
    "👏 Great Pronunciation!",
    "🌟 Amazing!",
    "🥳 Well Done!",
  ];
  useEffect(() => {
    if (!data) return;

    const currentUserId = Number(
      data.user_id || localStorage.getItem("user_id") || 0,
    );

    setUserId(currentUserId);

    const initActivity = async () => {
      const raw = data.cards || [];
      let initialCards = normalizeCards(raw);

      try {
        const response = await apiService.getSpeakingProgress(
          currentUserId,
          activityId,
        );

        const saved = response.data || response;

        if (saved && saved.cards && saved.cards.length) {
          initialCards = saved.cards;

          setCurrent(saved.current || 0);

          if (saved.status === "COMPLETED") {
            setStatus("SUMMARY");
          }
        }
      } catch (err) {
        console.log(err);
      }

      setCards(initialCards);
    };

    initActivity();
  }, [data]);

  const saveProgressAPI = async (
    updatedCards,
    currIdx,
    overrideStatus = "IN_PROGRESS",
  ) => {
    try {
      await apiService.saveSpeakingProgress({
        user_id: userId,
        activity_id: activityId,
        progress_json: JSON.stringify({
          current: currIdx,
          cards: updatedCards,
          total: updatedCards.length,
          status: overrideStatus,
        }),
        status: overrideStatus,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handlePlayAudio = () => {
    if (!currentCard.audio) return;

    const audio = new Audio(currentCard.audio);

    audio.play();

    audio.onended = () => {
      const updated = [...cards];

      updated[current] = {
        ...updated[current],
        listened: true,
      };

      setCards(updated);

      saveProgressAPI(updated, current);

      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 1500);
    };
  };

  const handleNext = async () => {
    if (current + 1 < total) {
      const next = current + 1;

      await saveProgressAPI(cards, next);

      setCurrent(next);
    } else {
      await saveProgressAPI(cards, total, "COMPLETED");

      setStatus("SUMMARY");
    }
  };
  const resetActivity = async () => {
    if (!window.confirm("Reset activity?")) return;

    const resetCards = normalizeCards(data.cards || []);

    setCards(resetCards);

    setCurrent(0);

    setStatus("STARTED");

    await saveProgressAPI(resetCards, 0);
  };
  const handleFinalNext = () => {
    try {
      window.parent.postMessage(
        JSON.stringify({
          done: true,
          total,
        }),
        "*",
      );
    } catch (_) {}
  };

  if (cards.length === 0) return null;

  const currentCard = cards[current];

  const isSummary = status === "SUMMARY";
  const completedCount = cards.filter((c) => c.listened).length;

  return (
    <div className={styles.container}>
      {showConfetti && <Confetti />}

      {!isSummary ? (
        <>
          <div className={styles.instructionCard}>
            <div className={styles.instrIcon}>🎤</div>

            <div>
              <div className={styles.instrTitle}>
                {data.title || "Speaking Practice"}
              </div>

              <div className={styles.instrSub}>
                Listen and practise speaking
              </div>
            </div>
          </div>

          <div className={styles.progressStrip}>
            <div className={styles.qDots}>
              {cards.map((c, i) => (
                <div
                  key={i}
                  className={
                    i === current
                      ? `${styles.qDot} ${styles.qDotCurrent}`
                      : c.listened
                        ? `${styles.qDot} ${styles.qDotCorrect}`
                        : styles.qDot
                  }
                />
              ))}
            </div>

            <div className={styles.qLabel}>
              Card {current + 1} of {total}
            </div>
          </div>

          <div className={styles.questionCard}>
            <div className={styles.qHeader}>
              <div className={styles.qNumBadge}>Card {current + 1}</div>
            </div>

            <div className={styles.contentArea}>
              {currentCard.image && (
                <div className={styles.imageWrapper}>
                  <img
                    src={currentCard.image}
                    className={styles.image}
                    alt=""
                  />
                </div>
              )}

              <div className={styles.question}>{currentCard.text}</div>

              <div className={styles.audioControls}>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={handlePlayAudio}
                >
                  🔊 Play Audio
                </button>
              </div>
            </div>
          </div>

          <div className={styles.actionBar}>
            <div className={styles.scoreDisplay}>
              Completed: {completedCount}/{total}
            </div>

            <button
              className={`${styles.btn} ${styles.btnNext}`}
              onClick={handleNext}
              disabled={!currentCard.listened}
            >
              {current + 1 === total ? "Finish 🎓" : "Next →"}
            </button>
          </div>
        </>
      ) : (
        <div className={styles.resultOverlay}>
          <div className={styles.resultBox}>
            <div className={styles.resultEmoji}>
              {completedCount === total ? "🏆" : "🎉"}
            </div>

            <div className={styles.resultTitle}>
              {completedCount === total ? "Perfect!" : "Well Done!"}
            </div>

            <div className={styles.resultSub}>
              You completed {Math.round((completedCount / total) * 100)}% of
              this activity.
            </div>

            <div className={styles.resultScoreBig}>{completedCount}</div>

            <div className={styles.resultScoreLbl}>out of {total} cards</div>

            <div className={styles.resultBreakdown}>
              <div className={`${styles.rbItem} ${styles.rbCorrect}`}>
                ✓ {completedCount} heard
              </div>

              <div className={`${styles.rbItem} ${styles.rbWrong}`}>
                ✗ {total - completedCount} remaining
              </div>
            </div>

            <div className={styles.resultBtns}>
              <button
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={resetActivity}
              >
                ↺ Reset Activity
              </button>

              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleFinalNext}
              >
                Next Activity 🎓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
