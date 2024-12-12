import { ChangeEvent, useEffect, useState } from "react";
import "./App.css";
import TestText from "./meta-data/typingText";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [input, setInput] = useState("");
  const [toTypeText] = useState(TestText.trim());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLength, setCurrentLength] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    let interval: unknown;
    if (isTyping) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(interval as number);
    }
    return () => clearInterval(interval as number);
  }, [isTyping]);

  const handleType = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newValue = e.target.value;

    // Start the timer on the first input
    if (!isTyping && newValue.length > 0) {
      setIsTyping(true);
    }
    if (newValue.length > currentLength) {
      setCurrentLength(newValue.length);
      setCurrentIndex(newValue.length - 1);
      if (currentIndex >= toTypeText.trim().length - 1) {
        toast.success("You completed the test!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          window.location.reload();
        }, 5000);
        return;
      }

      if (newValue[currentIndex] === toTypeText[currentIndex]) {
        setAccuracy((prevAccuracy) => prevAccuracy + 1);
      } else {
        setErrors((prevErrors) => prevErrors + 1);
      }
      setInput(newValue);
    } else if (newValue.length < currentLength) {
      setCurrentLength(newValue.length);
      setCurrentIndex(newValue.length - 1);
      if (accuracy > 0) {
        setAccuracy((prevAccuracy) => prevAccuracy - 1);
      }

      setInput(newValue);
    }

    // Calculate WPM: (Correct characters / 5) / (Time in minutes)
    const correctCharacters = newValue
      .split("")
      .filter((char, index) => char === toTypeText[index]).length;
    setWpm(Math.floor(correctCharacters / 5 / (timer / 60 || 1)));

    // Stop the timer if all text is typed
    if (newValue === toTypeText) {
      setIsTyping(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="title">sType</div>
        <div className="modes">
          <span># punctuation</span>
          <span># numbers</span>
          <span className="active"># time</span>
          <span># words</span>
          <span># quote</span>
          <span># zen</span>
        </div>
      </header>

      <main className="typing-test">
        <div className="stats">
          <span>Time: {timer}s</span> <span>WPM: {wpm}</span>{" "}
          <span>
            Accuracy:{" "}
            {Math.max(
              0,
              ((toTypeText.length - errors) / toTypeText.length) * 100
            ).toFixed(2)}
            %
          </span>
        </div>
        <div className="text-area">
          {toTypeText.split("").map((char, index) => (
            <span
              key={index}
              className={`char ${
                input[index] === char
                  ? "correct"
                  : input[index] !== char && index < currentIndex
                  ? "incorrect"
                  : ""
              }`}
            >
              {char}
              {index === currentIndex && isTyping && (
                <span className="cursor">|</span>
              )}
            </span>
          ))}
        </div>
        <input
          type="text"
          className="text-input"
          value={input}
          onChange={handleType}
          placeholder="Start typing..."
        />
      </main>

      <footer className="footer">
        <p>
          <span>tab</span> + <span>enter</span> - restart test |{" "}
          <span>esc</span> - quit
        </p>
      </footer>
      <ToastContainer />
    </div>
  );
}

export default App;
