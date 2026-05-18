import { useEffect, useState } from "react";
import "./Timer.css";

function Timer({ initialTimeSeconds, onTimeUp, isActive = true }) {
  const [timeLeft, setTimeLeft] = useState(initialTimeSeconds);

  useEffect(() => {
    setTimeLeft(initialTimeSeconds);
  }, [initialTimeSeconds]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerClass = () => {
    const percentage = (timeLeft / initialTimeSeconds) * 100;
    if (percentage <= 10) return "timer-critical";
    if (percentage <= 25) return "timer-warning";
    return "timer-normal";
  };

  return (
    <div className={`timer-container ${getTimerClass()}`}>
      <div className="timer-icon">⏰</div>
      <div className="timer-text">
        <div className="timer-time">{formatTime(timeLeft)}</div>
        <div className="timer-label">Preostalo vreme</div>
      </div>
    </div>
  );
}

export default Timer;
