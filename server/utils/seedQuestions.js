const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("../models/Question");

dotenv.config();

const questions = [
  // ===== QUANTITATIVE =====
  {
    category: "quantitative",
    question: "If the cost price of 20 articles is equal to the selling price of 16 articles, what is the profit percentage?",
    options: ["20%", "25%", "30%", "33.33%"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "CP of 20 = SP of 16. Let CP = 1 each. SP of 16 = 20, SP of 1 = 20/16 = 1.25. Profit = 25%.",
  },
  {
    category: "quantitative",
    question: "A train 150m long passes a pole in 15 seconds. What is its speed in km/hr?",
    options: ["36 km/hr", "32 km/hr", "40 km/hr", "28 km/hr"],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "Speed = 150/15 = 10 m/s = 10 × 18/5 = 36 km/hr.",
  },
  {
    category: "quantitative",
    question: "Two pipes can fill a tank in 12 and 15 hours respectively. If both are opened together, how long to fill the tank?",
    options: ["6 hr 40 min", "6 hr", "7 hr", "5 hr 30 min"],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "Combined rate = 1/12 + 1/15 = 9/60 = 3/20. Time = 20/3 = 6 hr 40 min.",
  },
  {
    category: "quantitative",
    question: "What is the compound interest on ₹10,000 at 10% per annum for 2 years?",
    options: ["₹2,000", "₹2,100", "₹2,200", "₹1,900"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "CI = 10000[(1+0.1)² - 1] = 10000[1.21 - 1] = 10000 × 0.21 = ₹2,100.",
  },
  {
    category: "quantitative",
    question: "The average of 5 consecutive odd numbers is 27. What is the largest number?",
    options: ["29", "31", "33", "35"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "Middle number = 27. Five consecutive odd: 23, 25, 27, 29, 31. Largest = 31.",
  },
  {
    category: "quantitative",
    question: "A mixture of 40 litres has milk and water in the ratio 3:1. How much water must be added to make the ratio 2:1?",
    options: ["5 litres", "6 litres", "8 litres", "10 litres"],
    correctAnswer: 0,
    difficulty: "hard",
    explanation: "Milk = 30L, Water = 10L. For 2:1 ratio: 30/(10+x) = 2/1 → x = 5L.",
  },
  {
    category: "quantitative",
    question: "If 6 workers can complete a job in 8 days, how many days will 4 workers take?",
    options: ["10 days", "12 days", "14 days", "16 days"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "Total work = 6 × 8 = 48 man-days. Time for 4 workers = 48/4 = 12 days.",
  },
  {
    category: "quantitative",
    question: "What is 35% of 240 + 65% of 160?",
    options: ["188", "176", "192", "204"],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "35% of 240 = 84. 65% of 160 = 104. Total = 84 + 104 = 188.",
  },
  {
    category: "quantitative",
    question: "The HCF and LCM of two numbers are 12 and 360 respectively. If one number is 60, find the other.",
    options: ["72", "48", "84", "96"],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "HCF × LCM = Product of numbers. 12 × 360 = 60 × x → x = 72.",
  },
  {
    category: "quantitative",
    question: "A car covers 432 km in 6 hours. What is the speed in m/s?",
    options: ["20 m/s", "18 m/s", "22 m/s", "24 m/s"],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "Speed = 432/6 = 72 km/hr = 72 × 5/18 = 20 m/s.",
  },

  // ===== LOGICAL REASONING =====
  {
    category: "logical",
    question: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "Differences: 4, 6, 8, 10, 12. Next = 30 + 12 = 42.",
  },
  {
    category: "logical",
    question: "If COMPUTER is coded as DPNQVUFS, how is KEYBOARD coded?",
    options: ["LFZCPBSE", "LFZCPBRD", "LFZBPBSE", "KFZCPBSE"],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "Each letter shifted by +1: K→L, E→F, Y→Z, B→C, O→P, A→B, R→S, D→E.",
  },
  {
    category: "logical",
    question: "In a certain code, 'GREAT' is written as 'HSFBU'. How is 'POWER' written?",
    options: ["QPXFS", "QPWFS", "RPXFS", "QPXFT"],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "Each letter +1: P→Q, O→P, W→X, E→F, R→S.",
  },
  {
    category: "logical",
    question: "A is the father of B. C is the daughter of B. D is the brother of B. What is A to C?",
    options: ["Father", "Grandfather", "Uncle", "Brother"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "A is B's father. C is B's daughter. So A is C's grandfather.",
  },
  {
    category: "logical",
    question: "If all Bloops are Razzies and some Razzies are Lazzies, which statement must be true?",
    options: [
      "All Bloops are Lazzies",
      "Some Bloops may be Lazzies",
      "No Bloops are Lazzies",
      "All Lazzies are Bloops",
    ],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "Since some Razzies are Lazzies and all Bloops are Razzies, some Bloops may also be Lazzies.",
  },
  {
    category: "logical",
    question: "Looking at a portrait, Arun said, 'He is the son of my grandfather's only son.' Who is in the portrait?",
    options: ["Arun himself", "Arun's father", "Arun's son", "Arun's brother"],
    correctAnswer: 3,
    difficulty: "hard",
    explanation: "Grandfather's only son = Arun's father. Son of Arun's father = Arun or his brother. Since he said 'He', it's his brother.",
  },
  {
    category: "logical",
    question: "Complete the analogy: Book : Pages :: Tree : ?",
    options: ["Branches", "Leaves", "Roots", "Forest"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "A book is made up of pages, a tree is made up of leaves.",
  },
  {
    category: "logical",
    question: "Which figure comes next in the pattern: △, □, ○, △, □, ?",
    options: ["△", "□", "○", "◇"],
    correctAnswer: 2,
    difficulty: "easy",
    explanation: "The pattern repeats every 3: △, □, ○. Next is ○.",
  },
  {
    category: "logical",
    question: "If 1st January 2023 is a Sunday, what day is 1st March 2023?",
    options: ["Tuesday", "Wednesday", "Thursday", "Friday"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "Jan has 31 days (4 weeks + 3 days). Feb 2023 has 28 days (4 weeks). Sun + 3 = Wed.",
  },
  {
    category: "logical",
    question: "Statement: All pens are chairs. All chairs are tables. Conclusion: All pens are tables.",
    options: ["True", "False", "Cannot be determined", "Partially true"],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "If all pens are chairs and all chairs are tables, then all pens are tables (transitive).",
  },

  // ===== TECHNICAL =====
  {
    category: "technical",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "Binary search halves the search space each iteration, giving O(log n).",
  },
  {
    category: "technical",
    question: "Which data structure uses FIFO (First In First Out)?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "Queue follows FIFO — elements are removed in the order they were added.",
  },
  {
    category: "technical",
    question: "What does SQL stand for?",
    options: [
      "Structured Query Language",
      "Simple Query Language",
      "Standard Query Logic",
      "Sequential Query Language",
    ],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "SQL stands for Structured Query Language.",
  },
  {
    category: "technical",
    question: "In OOP, which principle allows a subclass to provide a specific implementation of a method already defined in its superclass?",
    options: ["Encapsulation", "Abstraction", "Polymorphism", "Inheritance"],
    correctAnswer: 2,
    difficulty: "medium",
    explanation: "Method overriding is a form of runtime polymorphism.",
  },
  {
    category: "technical",
    question: "Which of the following is NOT a valid HTTP method?",
    options: ["GET", "POST", "FETCH", "DELETE"],
    correctAnswer: 2,
    difficulty: "easy",
    explanation: "FETCH is not a standard HTTP method. The standard methods include GET, POST, PUT, DELETE, PATCH, etc.",
  },
  {
    category: "technical",
    question: "What is the worst-case time complexity of quicksort?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "When the pivot is always the smallest/largest element, quicksort degrades to O(n²).",
  },
  {
    category: "technical",
    question: "Which normal form eliminates transitive dependencies in database design?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctAnswer: 2,
    difficulty: "medium",
    explanation: "Third Normal Form (3NF) eliminates transitive functional dependencies.",
  },
  {
    category: "technical",
    question: "In operating systems, what is a deadlock?",
    options: [
      "A situation where a process runs infinitely",
      "A situation where two or more processes are blocked forever, each waiting on the other",
      "A scheduling algorithm failure",
      "A memory leak condition",
    ],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "Deadlock occurs when processes hold resources and wait for resources held by others, creating a circular wait.",
  },
  {
    category: "technical",
    question: "What is the output of: console.log(typeof NaN)?",
    options: ["'NaN'", "'undefined'", "'number'", "'object'"],
    correctAnswer: 2,
    difficulty: "medium",
    explanation: "In JavaScript, typeof NaN returns 'number' — NaN is technically a numeric value.",
  },
  {
    category: "technical",
    question: "Which protocol operates at the transport layer of the OSI model?",
    options: ["HTTP", "TCP", "IP", "Ethernet"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "TCP (Transmission Control Protocol) operates at Layer 4 (Transport Layer).",
  },
];

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing questions
    await Question.deleteMany({});
    console.log("Cleared existing questions");

    // Insert seed data
    const inserted = await Question.insertMany(questions);
    console.log(`✅ Seeded ${inserted.length} questions`);

    console.log("\nBreakdown:");
    const quant = inserted.filter((q) => q.category === "quantitative").length;
    const logical = inserted.filter((q) => q.category === "logical").length;
    const tech = inserted.filter((q) => q.category === "technical").length;
    console.log(`  Quantitative: ${quant}`);
    console.log(`  Logical Reasoning: ${logical}`);
    console.log(`  Technical: ${tech}`);

    await mongoose.disconnect();
    console.log("\nDisconnected. Done!");
    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
};

seedQuestions();
