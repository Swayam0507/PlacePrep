require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const TestAttempt = require("../models/TestAttempt");
const ForumPost = require("../models/ForumPost");

const MONGO_URI = process.env.MONGO_URI;

const INDIAN_NAMES = [
  "Rahul Sharma", "Priya Patel", "Anjali Desai", "Rohit Kumar", "Aditi Gupta",
  "Vikram Singh", "Sneha Iyer", "Karan Malhotra", "Neha Reddy", "Arjun Nair",
  "Pooja Joshi", "Aakash Verma", "Divya Menon", "Siddharth Rao", "Shruti Bhat",
  "Rishabh Agarwal", "Tanya Mehra", "Deepak Pillai", "Kritika Jain", "Manoj Das",
  "Sanjana Kapoor", "Prateek Tiwari", "Riya Mishra", "Vivek Chauhan", "Swati Pandey"
];

const BRANCHES = ["Computer Science", "Information Technology", "Electronics", "Mechanical"];
const SKILLS = [
  ["React", "Node.js", "MongoDB", "Express"],
  ["Python", "Django", "Machine Learning", "SQL"],
  ["Java", "Spring Boot", "MySQL", "AWS"],
  ["C++", "Data Structures", "Algorithms", "Problem Solving"],
  ["HTML", "CSS", "JavaScript", "Figma"]
];

const FORUM_QUESTIONS = [
  { title: "TCS NQT Cutoff details for this year?", content: "Does anyone know the safe score for TCS Digital profile in the recent NQT? I heard they raised the cutoff." },
  { title: "Amazon SDE 1 Technical Interview tips?", content: "I have my Amazon interview next week. What should I focus more on? Graphs or Dynamic Programming?" },
  { title: "Wipro Elite National Talent Hunt", content: "Can someone share their experience with the Wipro Elite NTH coding round? How difficult were the arrays questions?" },
  { title: "Infosys System Engineer vs Specialist Programmer", content: "Is it worth trying for SP role if my competitive programming isn't very strong? What's the CTC difference?" },
  { title: "How to prepare for Cognizant GenC Next?", content: "What are the typical technical questions asked in the GenC Next interview? Any past experiences?" },
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

const seedStudents = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("⏳ Generating 25 Indian student dummy profiles...");
    
    let createdUsers = [];

    // Create Users
    for (let i = 0; i < INDIAN_NAMES.length; i++) {
      const name = INDIAN_NAMES[i];
      const email = `${name.toLowerCase().replace(" ", ".")}@example.com`;
      const password = "password123";
      
      // Check if exists
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          password,
          role: "student",
          branch: getRandom(BRANCHES),
          semester: randomInt(6, 8),
          cgpa: randomFloat(6.5, 9.8),
          skills: getRandom(SKILLS),
          bio: `Final year engineering student passionate about technology and software development. Actively preparing for placements.`,
          github: `https://github.com/${name.toLowerCase().replace(" ", "")}`,
          linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(" ", "")}`,
          streak: {
            current: randomInt(1, 15),
            longest: randomInt(5, 30),
            lastActiveDate: Date.now()
          }
        });
      }
      createdUsers.push(user);
    }
    
    console.log(`✅ Successfully created/retrieved ${createdUsers.length} student profiles.`);

    console.log("⏳ Generating Mock Test Attempts for Leaderboard...");
    const testCategories = ["quantitative", "logical", "technical", "mixed"];
    let testCount = 0;

    for (let user of createdUsers) {
      // Create 2-5 test attempts for each user
      const numTests = randomInt(2, 5);
      for (let j = 0; j < numTests; j++) {
        const category = getRandom(testCategories);
        const totalQuestions = 20;
        const score = randomInt(8, 20); // between 8 and 20 correct
        const percentage = Math.round((score / totalQuestions) * 100);
        
        await TestAttempt.create({
          userId: user._id,
          category,
          score,
          totalQuestions,
          percentage,
          answers: [], // dummy answers
          timeTaken: randomInt(600, 1200), // 10-20 mins
          difficulty: getRandom(["easy", "medium", "hard"])
        });
        testCount++;
      }
    }
    console.log(`✅ Created ${testCount} mock test attempts.`);

    console.log("⏳ Generating Mock Forum Posts and Replies...");
    let postCount = 0;
    
    for (let q of FORUM_QUESTIONS) {
      const author = getRandom(createdUsers);
      
      const post = await ForumPost.create({
        title: q.title,
        content: q.content,
        userId: author._id,
        tags: ["Placement", "Interview", "Tips"],
        upvotes: [author._id, getRandom(createdUsers)._id, getRandom(createdUsers)._id],
        replies: []
      });
      postCount++;

      // Generate 1-3 replies
      const numReplies = randomInt(1, 3);
      for(let k = 0; k < numReplies; k++) {
        const replyAuthor = getRandom(createdUsers);
        await ForumPost.findByIdAndUpdate(post._id, {
          $push: {
            replies: {
              content: "Thanks for starting this thread! Based on my research, focus heavily on DSA and core CS concepts. Good luck!",
              userId: replyAuthor._id,
              upvotes: []
            }
          }
        });
      }
    }
    console.log(`✅ Created ${postCount} forum posts with realistic replies.`);

    console.log("🎉 Seeding completely successful! The platform is now populated with realistic data.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedStudents();
