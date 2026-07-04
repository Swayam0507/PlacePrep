/**
 * Combined Seed Script with DNS Fix
 * Forces Google DNS to resolve MongoDB Atlas SRV records
 * Run: node utils/runSeed.js
 */

// ========== FORCE GOOGLE DNS BEFORE ANYTHING ELSE ==========
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
console.log("🔧 DNS forced to Google/Cloudflare:", dns.getServers());

// ========== NOW LOAD EVERYTHING ==========
require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const TestAttempt = require("../models/TestAttempt");
const ForumPost = require("../models/ForumPost");

const MONGO_URI = process.env.MONGO_URI;

// =================== ADMIN DATA ===================
const ADMIN_DATA = {
  name: "Dr. Rajesh Kumar",
  email: "admin@placeprep.com",
  password: "Admin@2026",
  role: "admin",
  branch: "Training & Placement Cell",
  semester: 1,
  cgpa: 10,
  bio: "Head of Training & Placement Cell. 15+ years of experience in campus recruitment and student career development.",
  phone: "+91 98765 43210",
  skills: ["Student Mentoring", "Industry Relations", "Recruitment Strategy", "Career Counseling"],
};

// =================== STUDENT DATA ===================
const STUDENTS = [
  { name: "Aarav Mehta", branch: "Computer Science", semester: 8, cgpa: 9.12, skills: ["React", "Node.js", "TypeScript", "MongoDB"], bio: "Full-stack developer with a passion for building scalable web applications. ICPC regionalist 2025." },
  { name: "Diya Sharma", branch: "Computer Science", semester: 7, cgpa: 9.45, skills: ["Python", "TensorFlow", "NLP", "AWS"], bio: "AI/ML enthusiast working on NLP research. Published a paper on transformer architectures at EMNLP." },
  { name: "Vihaan Patel", branch: "Information Technology", semester: 8, cgpa: 8.67, skills: ["Java", "Spring Boot", "Kubernetes", "PostgreSQL"], bio: "Backend engineer specializing in microservices. Ex-intern at Flipkart." },
  { name: "Ananya Reddy", branch: "Computer Science", semester: 7, cgpa: 9.28, skills: ["React Native", "Flutter", "Firebase", "Figma"], bio: "Mobile app developer and UI/UX enthusiast. Built 3 apps with 10K+ downloads on Play Store." },
  { name: "Arjun Nair", branch: "Electronics", semester: 8, cgpa: 8.34, skills: ["Embedded C", "VHDL", "IoT", "Python"], bio: "Embedded systems developer with IoT project experience. Smart India Hackathon 2025 finalist." },
  { name: "Ishita Gupta", branch: "Computer Science", semester: 6, cgpa: 9.56, skills: ["C++", "DSA", "Competitive Programming", "Go"], bio: "Competitive programmer rated 2100+ on Codeforces. 3-star on CodeChef." },
  { name: "Kabir Singh", branch: "Information Technology", semester: 8, cgpa: 7.89, skills: ["DevOps", "Docker", "Jenkins", "Terraform"], bio: "DevOps enthusiast automating deployments. AWS Certified Cloud Practitioner." },
  { name: "Meera Iyer", branch: "Computer Science", semester: 7, cgpa: 9.01, skills: ["Python", "Django", "REST APIs", "Redis"], bio: "Backend developer passionate about clean code and system design. Open-source contributor." },
  { name: "Rohan Desai", branch: "Mechanical", semester: 8, cgpa: 8.15, skills: ["Python", "Data Analysis", "Tableau", "SQL"], bio: "Mechanical engineer transitioning to data analytics. Completed Google Data Analytics certificate." },
  { name: "Priya Joshi", branch: "Computer Science", semester: 7, cgpa: 8.78, skills: ["React", "Next.js", "Tailwind CSS", "Prisma"], bio: "Frontend developer who loves creating beautiful, accessible user interfaces. GSSoC contributor." },
  { name: "Aditya Verma", branch: "Computer Science", semester: 8, cgpa: 9.33, skills: ["Java", "System Design", "LLD", "HLD"], bio: "Aspiring SDE at FAANG. 500+ problems solved on LeetCode. Passionate about distributed systems." },
  { name: "Sneha Kulkarni", branch: "Information Technology", semester: 6, cgpa: 8.92, skills: ["Python", "Machine Learning", "OpenCV", "Scikit-learn"], bio: "Computer vision researcher working on real-time object detection for autonomous vehicles." },
  { name: "Tanmay Bhatt", branch: "Computer Science", semester: 8, cgpa: 7.65, skills: ["Blockchain", "Solidity", "Web3.js", "Ethereum"], bio: "Web3 developer building DeFi protocols. Won ETHIndia hackathon 2025." },
  { name: "Kavya Menon", branch: "Electronics", semester: 7, cgpa: 8.45, skills: ["MATLAB", "Signal Processing", "Python", "Deep Learning"], bio: "Signal processing researcher applying deep learning to medical imaging." },
  { name: "Siddharth Rao", branch: "Computer Science", semester: 8, cgpa: 9.18, skills: ["Rust", "C++", "Systems Programming", "Linux"], bio: "Systems programmer contributing to open-source projects. Google Summer of Code 2025 participant." },
  { name: "Riya Mishra", branch: "Information Technology", semester: 7, cgpa: 8.56, skills: ["Angular", "RxJS", "NgRx", "Jest"], bio: "Enterprise frontend developer building complex dashboards. Ex-intern at Deloitte Digital." },
  { name: "Harsh Pandey", branch: "Computer Science", semester: 6, cgpa: 8.23, skills: ["Python", "FastAPI", "GraphQL", "MongoDB"], bio: "Full-stack developer exploring GraphQL and microservices. Technical writer on Medium." },
  { name: "Tanya Saxena", branch: "Computer Science", semester: 8, cgpa: 9.42, skills: ["Data Science", "R", "Spark", "Hadoop"], bio: "Data science enthusiast with expertise in big data processing. Research intern at IIT Bombay." },
  { name: "Nikhil Agarwal", branch: "Mechanical", semester: 7, cgpa: 7.98, skills: ["AutoCAD", "SolidWorks", "Python", "ANSYS"], bio: "Mechanical design engineer with CAD/CAE expertise. Interested in computational fluid dynamics." },
  { name: "Pooja Choudhary", branch: "Computer Science", semester: 8, cgpa: 8.87, skills: ["Cybersecurity", "Ethical Hacking", "Network Security", "Kali Linux"], bio: "Cybersecurity analyst with CEH certification. Bug bounty hunter with 15+ valid reports." },
  { name: "Arnav Kapoor", branch: "Information Technology", semester: 7, cgpa: 8.71, skills: ["Vue.js", "Nuxt.js", "Vuex", "Cypress"], bio: "Frontend developer specialized in Vue ecosystem. Building accessible and performant SPAs." },
  { name: "Shruti Bhat", branch: "Computer Science", semester: 6, cgpa: 9.08, skills: ["Kotlin", "Android", "Jetpack Compose", "Room DB"], bio: "Android developer building modern apps with Jetpack Compose. Google Developer Student Club lead." },
  { name: "Devansh Tiwari", branch: "Electronics", semester: 8, cgpa: 8.12, skills: ["ARM", "RTOS", "PCB Design", "C"], bio: "Firmware developer working on RTOS-based embedded systems for industrial automation." },
  { name: "Nandini Pillai", branch: "Computer Science", semester: 7, cgpa: 9.35, skills: ["Swift", "iOS Development", "SwiftUI", "Core Data"], bio: "iOS developer with 2 published apps on App Store. Apple WWDC scholar 2025." },
  { name: "Yash Chauhan", branch: "Information Technology", semester: 8, cgpa: 8.44, skills: ["AWS", "Lambda", "DynamoDB", "CloudFormation"], bio: "Cloud architect building serverless applications. AWS Solutions Architect Associate certified." }
];

const FORUM_QUESTIONS = [
  { title: "TCS Digital Interview Experience — June 2026 Batch", content: "Just had my TCS Digital interview yesterday. They asked 2 coding questions (graph BFS and dynamic programming knapsack), followed by a technical round on DBMS and OS concepts. The HR round was pretty standard. Sharing my experience for those preparing!", tags: ["TCS", "Interview Experience", "Placement 2026"] },
  { title: "How to crack Amazon SDE-1 for freshers in 2026?", content: "I have my Amazon online assessment next month. I've been grinding LeetCode for 3 months but unsure about which topics to prioritize. For those who've cleared it recently — did they focus more on graphs/trees or DP? Any recommended resources?", tags: ["Amazon", "SDE-1", "Preparation Tips"] },
  { title: "Infosys Power Programmer vs Specialist Programmer — Which is better?", content: "Got shortlisted for both Infosys PP and SP roles. The CTC for PP is 9.5 LPA and SP is 6.5 LPA. But I heard PP has a bond and more demanding work. Can someone who joined either role share their experience?", tags: ["Infosys", "Career Advice", "Package Comparison"] },
  { title: "Best approach to learn System Design for placements?", content: "Many companies are now asking system design questions even for entry-level positions. I started with 'Designing Data-Intensive Applications' but it feels too theoretical. What practical resources helped you?", tags: ["System Design", "Preparation", "Learning Resources"] },
  { title: "CGPA vs Skills — What matters more in 2026 placements?", content: "I have a 7.5 CGPA but strong project experience and 400+ LeetCode problems solved. My friend has 9.2 CGPA but minimal projects. Does CGPA still matter as a filter?", tags: ["CGPA", "Placements", "Career Discussion"] },
  { title: "Wipro Elite NLTH 2026 — Coding round difficulty level?", content: "Registered for Wipro's Elite National Level Talent Hunt. Last year's cutoff was reportedly 70% in the aptitude section. How tough is the coding section compared to TCS NQT?", tags: ["Wipro", "NLTH", "Aptitude Test"] },
  { title: "Resume tips for freshers with no internship experience", content: "I couldn't land any internships due to personal reasons. Now placements are starting and my resume feels empty. How should I structure it?", tags: ["Resume", "Freshers", "Career Advice"] },
];

const FORUM_REPLIES = [
  "Thanks for sharing! This is really helpful for those of us preparing.",
  "I went through a similar process. Focus heavily on trees and graphs — they seem to be favorites this year.",
  "Great advice! I'd also recommend practicing on GeeksforGeeks for company-specific questions.",
  "I'm in the same boat. Started with Striver's SDE sheet and it's been a game changer.",
  "For system design, I found Gaurav Sen's YouTube channel extremely helpful.",
  "Honestly, projects and problem-solving skills matter way more than CGPA at product companies.",
  "I got placed at a service company with 7.8 CGPA and strong DSA skills. Don't let CGPA demotivate you!",
  "Pro tip: Tailor your resume for each company. Highlight skills that match their JD.",
  "Can confirm the aptitude section is tricky. Practice R.S. Aggarwal thoroughly.",
  "Mock interviews helped me the most. Try Pramp or do peer mock interviews.",
  "I'd suggest starting with LLD first — it's asked more frequently.",
  "Remember to prepare behavioral questions too! Many candidates bomb the HR round.",
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// =================== MAIN SEED FUNCTION ===================
const runSeed = async () => {
  try {
    console.log("\n⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 30000 });
    console.log("✅ Connected to MongoDB\n");

    // ========== SEED ADMIN ==========
    console.log("=== 1/3: Seeding Admin ===");
    await User.deleteMany({ role: "admin" });
    const admin = await User.create(ADMIN_DATA);
    console.log(`✅ Admin created: ${admin.email} / Admin@2026\n`);

    // ========== SEED STUDENTS ==========
    console.log("=== 2/3: Seeding Students ===");
    await User.deleteMany({ role: "student" });
    await TestAttempt.deleteMany({});
    await ForumPost.deleteMany({});
    console.log("🗑️  Old data cleaned");

    let createdUsers = [];
    for (let i = 0; i < STUDENTS.length; i++) {
      const s = STUDENTS[i];
      const email = `${s.name.toLowerCase().replace(/ /g, ".")}@gmail.com`;
      const user = await User.create({
        name: s.name, email, password: "Student@123", role: "student",
        branch: s.branch, semester: s.semester, cgpa: s.cgpa,
        skills: s.skills, bio: s.bio,
        github: `https://github.com/${s.name.toLowerCase().replace(/ /g, "")}`,
        linkedin: `https://linkedin.com/in/${s.name.toLowerCase().replace(/ /g, "-")}`,
        phone: `+91 ${randomInt(70000, 99999)}${randomInt(10000, 99999)}`,
        streak: { current: randomInt(1, 21), longest: randomInt(7, 45), lastActiveDate: new Date(Date.now() - randomInt(0, 3) * 86400000) }
      });
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} students`);

    // Test attempts
    const testCategories = ["quantitative", "logical", "technical", "mixed"];
    let testCount = 0;
    for (let user of createdUsers) {
      const numTests = randomInt(3, 7);
      for (let j = 0; j < numTests; j++) {
        const totalQuestions = 20;
        const score = randomInt(6, 20);
        await TestAttempt.create({
          userId: user._id, category: getRandom(testCategories),
          score, totalQuestions, percentage: Math.round((score / totalQuestions) * 100),
          answers: [], timeTaken: randomInt(480, 1200),
          difficulty: getRandom(["easy", "medium", "hard"]),
          createdAt: new Date(Date.now() - randomInt(0, 30) * 86400000)
        });
        testCount++;
      }
    }
    console.log(`✅ Created ${testCount} test attempts`);

    // Forum posts
    let postCount = 0;
    for (let q of FORUM_QUESTIONS) {
      const post = await ForumPost.create({
        title: q.title, content: q.content, userId: getRandom(createdUsers)._id,
        tags: q.tags,
        upvotes: Array.from({ length: randomInt(3, 12) }, () => getRandom(createdUsers)._id),
        replies: [], createdAt: new Date(Date.now() - randomInt(0, 14) * 86400000)
      });
      postCount++;
      const numReplies = randomInt(2, 5);
      const usedReplies = new Set();
      for (let k = 0; k < numReplies; k++) {
        let reply;
        do { reply = getRandom(FORUM_REPLIES); } while (usedReplies.has(reply) && usedReplies.size < FORUM_REPLIES.length);
        usedReplies.add(reply);
        await ForumPost.findByIdAndUpdate(post._id, {
          $push: { replies: { content: reply, userId: getRandom(createdUsers)._id, upvotes: Array.from({ length: randomInt(0, 5) }, () => getRandom(createdUsers)._id) } }
        });
      }
    }
    console.log(`✅ Created ${postCount} forum posts with replies\n`);

    // ========== DONE ==========
    console.log("🎉 All seeding completed successfully!");
    console.log("📧 Admin login: admin@placeprep.com / Admin@2026");
    console.log("📧 Student login example: aarav.mehta@gmail.com / Student@123\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message || error);
    process.exit(1);
  }
};

runSeed();
