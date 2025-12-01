"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Riddle = {
  text: string;
  answer: string;
};

const builtInRiddles: Riddle[] = [
  {
    text: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
    answer: "echo",
  },
  {
    text: "I have keys but no locks. I have space but no room. You can enter but can't go outside. What am I?",
    answer: "keyboard",
  },
  {
    text: "I can be cracked, made, told, and played. What am I?",
    answer: "joke",
  },
  {
    text: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "map",
  },
  {
    text: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
    answer: "fire",
  },
];

const difficulties = ["Easy", "Medium", "Hard"] as const;
type Difficulty = typeof difficulties[number];

export default function RiddleGame() {
  const [stage, setStage] = useState<
    "start" | "difficulty" | "round" | "result" | "final"
  >("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentRiddle, setCurrentRiddle] = useState<Riddle | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [timer, setTimer] = useState(15);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | "timeout">(
    "incorrect"
  );

  const fetchRiddle = async () => {
    const riddle = await generateRiddle(difficulty);
    setCurrentRiddle(riddle);
    setHint(null);
    setUsedHint(false);
    setTimer(15);
    setAnswer("");
    setResult("incorrect");
  };

  useEffect(() => {
    if (stage === "round") {
      fetchRiddle();
    }
  }, [stage, round]);

  useEffect(() => {
    if (timer > 0 && stage === "round") {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    } else if (timer === 0 && stage === "round") {
      setResult("timeout");
      setStage("result");
    }
  }, [timer, stage]);

  const handleSubmit = async () => {
    if (!currentRiddle) return;
    const res = await checkAnswer(currentRiddle.answer, answer);
    setResult(res);
    setStage("result");
  };

  const handleHint = async () => {
    if (!currentRiddle || hint) return;
    const h = await generateHint(currentRiddle.text);
    setHint(h);
    setUsedHint(true);
  };

  const handleNext = () => {
    if (round >= 10) {
      setStage("final");
    } else {
      setRound(round + 1);
      setStage("round");
    }
  };

  const handlePlayAgain = () => {
    setRound(1);
    setScore(0);
    setStage("round");
  };

  useEffect(() => {
    if (stage === "result") {
      if (result === "correct") {
        setScore(score + (usedHint ? 5 : 10));
      }
    }
  }, [stage, result, usedHint]);

  if (stage === "start") {
    return (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">AI Riddle Rush</h1>
        <Button onClick={() => setStage("difficulty")}>Start Game</Button>
        <Button variant="outline">How to Play</Button>
        <Button variant="outline">High Scores</Button>
      </div>
    );
  }

  if (stage === "difficulty") {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl">Choose Difficulty</h2>
        {difficulties.map((d) => (
          <Button key={d} onClick={() => { setDifficulty(d); setStage("round"); }}>
            {d}
          </Button>
        ))}
      </div>
    );
  }

  if (stage === "round" && currentRiddle) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl font-semibold">Round {round} / 10</div>
        <div className="text-2xl font-bold">{currentRiddle.text}</div>
        <div className="text-lg">Time: {timer}s</div>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="border p-2 rounded"
          placeholder="Your answer"
        />
        <div className="flex gap-2">
          <Button onClick={handleSubmit}>Submit</Button>
          <Button variant="outline" onClick={handleHint} disabled={!!hint}>
            Hint
          </Button>
        </div>
        {hint && <div className="italic text-sm">{hint}</div>}
      </div>
    );
  }

  if (stage === "result") {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl">
          {result === "correct" ? "Correct!" : result === "timeout" ? "Time's up!" : "Incorrect!"}
        </h2>
        <p>Answer: {currentRiddle?.answer}</p>
        <Button onClick={handleNext}>Next</Button>
      </div>
    );
  }

  if (stage === "final") {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-3xl font-bold">Final Score</h2>
        <p className="text-2xl">{score} points</p>
        <Button onClick={handlePlayAgain}>Play Again</Button>
      </div>
    );
  }

  return null;
}

async function generateRiddle(difficulty: Difficulty): Promise<Riddle> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const riddle = builtInRiddles[Math.floor(Math.random() * builtInRiddles.length)];
      resolve(riddle);
    }, 500);
  });
}

async function checkAnswer(correct: string, user: string): Promise<"correct" | "incorrect"> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(user.trim().toLowerCase() === correct.toLowerCase() ? "correct" : "incorrect");
    }, 300);
  });
}

async function generateHint(text: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Think about: ${text.split(" ").slice(0, 3).join(" ")}...`);
    }, 400);
  });
}
