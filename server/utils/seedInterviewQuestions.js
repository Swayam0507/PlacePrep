const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const InterviewQuestion = require("../models/InterviewQuestion");

const sampleQuestions = [
  // HR Questions
  { category: "hr", question: "Tell me about yourself.", sampleAnswer: "I am a [year] year student pursuing [degree] from [university]. I have strong skills in [technologies]. I have worked on projects like [project] which helped me develop skills in [skills].", tips: ["Keep it 2-3 minutes", "Follow the Present-Past-Future format", "Highlight relevant skills"], difficulty: "easy", company: "", tags: ["introduction", "common"] },
  { category: "hr", question: "What are your strengths and weaknesses?", sampleAnswer: "My strength is problem-solving. I enjoy breaking down complex problems. My weakness is that I sometimes spend too much time perfecting code, but I've learned to balance quality with deadlines.", tips: ["Be genuine about weaknesses", "Show how you're improving", "Relate strengths to the role"], difficulty: "easy", company: "", tags: ["self-awareness"] },
  { category: "hr", question: "Why should we hire you?", sampleAnswer: "I bring a combination of strong technical skills and a willingness to learn. My projects demonstrate my ability to work with real-world problems, and I'm eager to contribute to your team.", tips: ["Align with company values", "Mention specific skills", "Show enthusiasm"], difficulty: "medium", company: "", tags: ["persuasion"] },
  { category: "hr", question: "Where do you see yourself in 5 years?", sampleAnswer: "In 5 years, I see myself as a senior developer who has deep expertise in [domain] and has contributed to meaningful projects at this organization.", tips: ["Show ambition but be realistic", "Align with company growth", "Don't say you want to leave"], difficulty: "easy", company: "", tags: ["career-goals"] },
  { category: "hr", question: "Why do you want to work at our company?", sampleAnswer: "I admire your company's work in [specific area]. Your culture of innovation and the opportunity to work with cutting-edge technologies align perfectly with my career goals.", tips: ["Research the company beforehand", "Be specific about what attracts you", "Avoid generic answers"], difficulty: "easy", company: "", tags: ["company-research"] },

  // Technical Questions
  { category: "technical", question: "Explain the difference between array and linked list.", sampleAnswer: "Arrays store elements in contiguous memory with O(1) access but O(n) insertion/deletion. Linked lists use nodes with pointers, offering O(1) insertion/deletion but O(n) access.", tips: ["Mention time complexity", "Discuss use cases", "Draw diagrams if possible"], difficulty: "easy", company: "TCS", tags: ["data-structures"] },
  { category: "technical", question: "What is the difference between SQL and NoSQL databases?", sampleAnswer: "SQL databases are relational with fixed schemas and use SQL (e.g., MySQL, PostgreSQL). NoSQL databases are non-relational with flexible schemas (e.g., MongoDB, Redis) and support horizontal scaling.", tips: ["Give examples", "Discuss when to use each", "Mention CAP theorem"], difficulty: "medium", company: "", tags: ["databases"] },
  { category: "technical", question: "Explain OOP concepts with examples.", sampleAnswer: "The four pillars are: Encapsulation (hiding data), Inheritance (extending classes), Polymorphism (method overriding), and Abstraction (abstract classes/interfaces).", tips: ["Give real-world analogies", "Provide code examples", "Explain practical use"], difficulty: "easy", company: "Infosys", tags: ["oop", "fundamentals"] },
  { category: "technical", question: "What is the time complexity of binary search?", sampleAnswer: "Binary search has O(log n) time complexity. It works on sorted arrays by repeatedly dividing the search interval in half.", tips: ["Explain the algorithm step by step", "Mention prerequisites (sorted array)", "Compare with linear search"], difficulty: "easy", company: "Wipro", tags: ["algorithms"] },
  { category: "technical", question: "Explain REST API and its methods.", sampleAnswer: "REST (Representational State Transfer) is an architectural style. Key methods: GET (read), POST (create), PUT (update), DELETE (remove). It uses HTTP and follows stateless communication.", tips: ["Mention status codes", "Explain idempotency", "Give examples"], difficulty: "medium", company: "", tags: ["web-development", "api"] },

  // Behavioral Questions
  { category: "behavioral", question: "Tell me about a time you worked in a team.", sampleAnswer: "During my final year project, I led a team of 4. We used Agile methodology, held daily standups, and divided tasks based on strengths. We delivered the project ahead of schedule.", tips: ["Use the STAR method", "Highlight your role", "Mention the outcome"], difficulty: "easy", company: "", tags: ["teamwork", "star-method"] },
  { category: "behavioral", question: "Describe a challenging problem you solved.", sampleAnswer: "I faced a performance issue in my project where API calls were taking 5+ seconds. I identified the bottleneck using profiling, added caching, and reduced response time to under 500ms.", tips: ["Be specific about the problem", "Explain your approach", "Quantify the impact"], difficulty: "medium", company: "", tags: ["problem-solving"] },
  { category: "behavioral", question: "How do you handle pressure and tight deadlines?", sampleAnswer: "I prioritize tasks, break them into smaller milestones, and focus on delivering the most critical features first. I also communicate proactively with the team about progress.", tips: ["Give a specific example", "Show time management skills", "Stay positive"], difficulty: "easy", company: "", tags: ["time-management"] },

  // Company-Specific
  { category: "company-specific", question: "What do you know about TCS Digital?", sampleAnswer: "TCS Digital is the premium hiring track of TCS that offers higher packages and more challenging roles. It focuses on candidates with strong coding and problem-solving skills.", tips: ["Research latest news", "Know the package structure", "Understand selection process"], difficulty: "easy", company: "TCS", tags: ["tcs", "research"] },
  { category: "company-specific", question: "Explain Infosys's business model.", sampleAnswer: "Infosys is a global IT consulting company offering services in digital transformation, AI, cloud computing, and enterprise solutions. It follows a GDM (Global Delivery Model).", tips: ["Know recent acquisitions", "Understand service offerings", "Mention key clients"], difficulty: "medium", company: "Infosys", tags: ["infosys", "research"] },
];

async function seedInterviewQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await InterviewQuestion.countDocuments();
    if (existing > 0) {
      console.log(`Already ${existing} interview questions exist. Skipping seed.`);
      process.exit(0);
    }

    await InterviewQuestion.insertMany(sampleQuestions);
    console.log(`✅ Seeded ${sampleQuestions.length} interview questions successfully!`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedInterviewQuestions();
