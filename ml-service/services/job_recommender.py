"""
Job Recommendation Engine
==========================
Rule-based job recommendation system that matches student profiles
to relevant job roles based on skills and scores.
"""

# Curated job database with required skills, score thresholds, and metadata
JOB_DATABASE = [
    # --- Software & Tech ---
    {
        "title": "Software Developer",
        "company_type": "IT / Product Companies",
        "companies": ["TCS", "Infosys", "Wipro", "HCL", "Tech Mahindra", "Google", "Microsoft"],
        "salary_range": "₹4-15 LPA",
        "required_skills": ["python", "java", "javascript", "c++", "data structures", "algorithms", "sql", "git"],
        "min_scores": {"coding_score": 65, "aptitude_score": 50, "cgpa": 6.5},
        "category": "Software Development",
        "description": "Design, develop, and maintain software applications and systems.",
    },
    {
        "title": "Full Stack Developer",
        "company_type": "Startups / Product Companies",
        "companies": ["Flipkart", "Zomato", "Razorpay", "CRED", "Swiggy"],
        "salary_range": "₹6-20 LPA",
        "required_skills": ["react", "node.js", "javascript", "mongodb", "html", "css", "rest api", "git"],
        "min_scores": {"coding_score": 70, "aptitude_score": 55, "cgpa": 6.0},
        "category": "Software Development",
        "description": "Build end-to-end web applications handling both frontend and backend.",
    },
    {
        "title": "Backend Developer",
        "company_type": "Tech Companies",
        "companies": ["Amazon", "Flipkart", "Paytm", "PhonePe", "Ola"],
        "salary_range": "₹5-18 LPA",
        "required_skills": ["java", "python", "node.js", "sql", "mongodb", "redis", "docker", "microservices"],
        "min_scores": {"coding_score": 70, "aptitude_score": 55, "cgpa": 6.5},
        "category": "Software Development",
        "description": "Design and implement server-side logic, databases, and APIs.",
    },
    {
        "title": "Frontend Developer",
        "company_type": "Product / Design Companies",
        "companies": ["Swiggy", "Myntra", "Urban Company", "Meesho"],
        "salary_range": "₹4-14 LPA",
        "required_skills": ["react", "javascript", "html", "css", "typescript", "ui/ux"],
        "min_scores": {"coding_score": 60, "aptitude_score": 45, "cgpa": 6.0},
        "category": "Software Development",
        "description": "Create responsive, user-friendly web interfaces and experiences.",
    },
    {
        "title": "Mobile App Developer",
        "company_type": "Product Companies",
        "companies": ["Google", "Samsung", "PhonePe", "Zomato", "Dunzo"],
        "salary_range": "₹5-16 LPA",
        "required_skills": ["flutter", "react native", "kotlin", "swift", "java", "dart"],
        "min_scores": {"coding_score": 65, "aptitude_score": 50, "cgpa": 6.0},
        "category": "Software Development",
        "description": "Develop native and cross-platform mobile applications.",
    },

    # --- Data & AI ---
    {
        "title": "Data Analyst",
        "company_type": "Analytics / Finance Companies",
        "companies": ["Deloitte", "KPMG", "EY", "Mu Sigma", "Tiger Analytics"],
        "salary_range": "₹4-10 LPA",
        "required_skills": ["python", "sql", "excel", "tableau", "power bi", "statistics", "pandas"],
        "min_scores": {"aptitude_score": 65, "coding_score": 45, "cgpa": 7.0},
        "category": "Data & Analytics",
        "description": "Analyze data to extract insights and support business decisions.",
    },
    {
        "title": "Data Scientist",
        "company_type": "Tech / Research Companies",
        "companies": ["Google", "Amazon", "Flipkart", "Microsoft", "Fractal Analytics"],
        "salary_range": "₹8-25 LPA",
        "required_skills": ["python", "machine learning", "deep learning", "statistics", "sql", "tensorflow", "scikit-learn"],
        "min_scores": {"coding_score": 70, "aptitude_score": 75, "cgpa": 7.5},
        "category": "Data & Analytics",
        "description": "Build ML models and apply statistical methods to solve complex problems.",
    },
    {
        "title": "ML Engineer",
        "company_type": "AI-first Companies",
        "companies": ["Google", "Microsoft", "Nvidia", "OpenAI", "DeepMind"],
        "salary_range": "₹10-30 LPA",
        "required_skills": ["python", "machine learning", "deep learning", "pytorch", "tensorflow", "mlops", "docker"],
        "min_scores": {"coding_score": 80, "aptitude_score": 75, "cgpa": 7.5},
        "category": "Data & Analytics",
        "description": "Design and deploy machine learning models at scale.",
    },

    # --- Cloud & DevOps ---
    {
        "title": "DevOps Engineer",
        "company_type": "Cloud / IT Companies",
        "companies": ["AWS", "Google Cloud", "Microsoft Azure", "Infosys", "HCL"],
        "salary_range": "₹5-18 LPA",
        "required_skills": ["linux", "docker", "kubernetes", "aws", "ci/cd", "jenkins", "terraform", "python"],
        "min_scores": {"coding_score": 55, "aptitude_score": 55, "cgpa": 6.0},
        "category": "Cloud & Infrastructure",
        "description": "Automate deployment pipelines and manage cloud infrastructure.",
    },
    {
        "title": "Cloud Engineer",
        "company_type": "Cloud Providers / Enterprises",
        "companies": ["AWS", "Google", "Microsoft", "IBM", "Accenture"],
        "salary_range": "₹6-20 LPA",
        "required_skills": ["aws", "azure", "gcp", "linux", "networking", "security", "python"],
        "min_scores": {"coding_score": 50, "aptitude_score": 60, "cgpa": 6.5},
        "category": "Cloud & Infrastructure",
        "description": "Design and maintain cloud solutions and infrastructure.",
    },

    # --- Cybersecurity ---
    {
        "title": "Cybersecurity Analyst",
        "company_type": "Security / IT Companies",
        "companies": ["Palo Alto", "CrowdStrike", "Wipro", "Deloitte", "PwC"],
        "salary_range": "₹5-15 LPA",
        "required_skills": ["networking", "linux", "security", "python", "penetration testing", "siem"],
        "min_scores": {"coding_score": 50, "aptitude_score": 60, "cgpa": 6.5},
        "category": "Cybersecurity",
        "description": "Protect systems and networks from cyber threats and vulnerabilities.",
    },

    # --- Testing & QA ---
    {
        "title": "QA / Test Engineer",
        "company_type": "IT / Product Companies",
        "companies": ["TCS", "Infosys", "Cognizant", "Accenture", "Capgemini"],
        "salary_range": "₹3.5-8 LPA",
        "required_skills": ["selenium", "testing", "java", "python", "sql", "jira", "agile"],
        "min_scores": {"coding_score": 40, "aptitude_score": 50, "cgpa": 6.0},
        "category": "Quality Assurance",
        "description": "Ensure software quality through automated and manual testing.",
    },

    # --- Business / Non-Tech ---
    {
        "title": "Business Analyst",
        "company_type": "Consulting / IT Companies",
        "companies": ["Deloitte", "Accenture", "Capgemini", "TCS", "Cognizant"],
        "salary_range": "₹4-12 LPA",
        "required_skills": ["excel", "sql", "communication", "problem solving", "presentation"],
        "min_scores": {"communication_score": 70, "aptitude_score": 65, "cgpa": 7.0},
        "category": "Business & Consulting",
        "description": "Bridge the gap between business needs and technology solutions.",
    },
    {
        "title": "Product Manager",
        "company_type": "Product Companies",
        "companies": ["Google", "Microsoft", "Amazon", "Flipkart", "Razorpay"],
        "salary_range": "₹10-30 LPA",
        "required_skills": ["product strategy", "analytics", "communication", "leadership", "sql", "a/b testing"],
        "min_scores": {"communication_score": 80, "aptitude_score": 75, "coding_score": 50, "cgpa": 7.5},
        "category": "Product Management",
        "description": "Drive product vision, strategy, and execution.",
    },
    {
        "title": "Technical Writer",
        "company_type": "Tech / Documentation Companies",
        "companies": ["Google", "Microsoft", "Atlassian", "Salesforce"],
        "salary_range": "₹4-10 LPA",
        "required_skills": ["writing", "communication", "documentation", "markdown", "api documentation"],
        "min_scores": {"communication_score": 75, "aptitude_score": 50, "cgpa": 6.5},
        "category": "Content & Documentation",
        "description": "Create technical documentation, guides, and API references.",
    },

    # --- Core Engineering ---
    {
        "title": "Embedded Systems Engineer",
        "company_type": "Hardware / IoT Companies",
        "companies": ["Bosch", "Samsung", "Texas Instruments", "Intel", "Qualcomm"],
        "salary_range": "₹5-15 LPA",
        "required_skills": ["c", "c++", "embedded systems", "rtos", "iot", "microcontrollers"],
        "min_scores": {"coding_score": 60, "aptitude_score": 60, "cgpa": 7.0},
        "category": "Core Engineering",
        "description": "Develop firmware and software for embedded devices.",
    },
    {
        "title": "Network Engineer",
        "company_type": "Telecom / IT Companies",
        "companies": ["Cisco", "Juniper", "Nokia", "Airtel", "Jio"],
        "salary_range": "₹4-12 LPA",
        "required_skills": ["networking", "ccna", "linux", "tcp/ip", "firewall", "routing"],
        "min_scores": {"aptitude_score": 55, "coding_score": 35, "cgpa": 6.5},
        "category": "Networking",
        "description": "Design, configure, and maintain computer networks.",
    },

    # --- UI/UX Design ---
    {
        "title": "UI/UX Designer",
        "company_type": "Design / Product Companies",
        "companies": ["Swiggy", "Flipkart", "Razorpay", "CRED", "Lenskart"],
        "salary_range": "₹4-14 LPA",
        "required_skills": ["figma", "ui/ux", "prototyping", "user research", "wireframing", "html", "css"],
        "min_scores": {"communication_score": 65, "aptitude_score": 50, "cgpa": 6.0},
        "category": "Design",
        "description": "Design intuitive and visually appealing user interfaces.",
    },

    # --- Entry Level / Mass Recruiters ---
    {
        "title": "Associate Software Engineer",
        "company_type": "Service Companies",
        "companies": ["TCS", "Infosys", "Wipro", "Cognizant", "HCL", "Capgemini"],
        "salary_range": "₹3-5 LPA",
        "required_skills": ["java", "python", "sql", "communication"],
        "min_scores": {"coding_score": 35, "aptitude_score": 40, "cgpa": 5.5},
        "category": "Software Development",
        "description": "Entry-level software development role with training and mentorship.",
    },
    {
        "title": "Systems Engineer",
        "company_type": "IT Services",
        "companies": ["TCS", "Infosys", "Tech Mahindra", "L&T Infotech"],
        "salary_range": "₹3.5-5 LPA",
        "required_skills": ["java", "python", "sql", "linux", "networking"],
        "min_scores": {"coding_score": 30, "aptitude_score": 40, "cgpa": 5.5},
        "category": "IT Services",
        "description": "Support and maintain enterprise IT systems and infrastructure.",
    },
]


def recommend_jobs(skills: list, scores: dict, top_n: int = 10) -> list:
    """
    Recommend jobs based on skills and scores.

    Args:
        skills: List of skills (strings, lowercase)
        scores: Dict with cgpa, aptitude_score, coding_score, communication_score, etc.
        top_n: Number of top recommendations to return

    Returns:
        List of job dicts sorted by match_score (descending)
    """
    skills_lower = [s.lower().strip() for s in skills] if skills else []
    recommendations = []

    for job in JOB_DATABASE:
        match_score = 0
        total_possible = 0

        # --- Skill matching (60% weight) ---
        skill_matches = 0
        job_skills = [s.lower() for s in job["required_skills"]]
        for js in job_skills:
            total_possible += 1
            for user_skill in skills_lower:
                if js in user_skill or user_skill in js:
                    skill_matches += 1
                    break

        skill_ratio = skill_matches / max(len(job_skills), 1)
        match_score += skill_ratio * 60

        # --- Score matching (40% weight) ---
        score_matches = 0
        score_total = 0

        for metric, min_val in job["min_scores"].items():
            score_total += 1
            user_val = scores.get(metric, 0)
            if user_val >= min_val:
                score_matches += 1
                # Bonus for exceeding threshold
                excess = (user_val - min_val) / max(min_val, 1)
                match_score += min(excess * 5, 5)  # up to 5 bonus points

        if score_total > 0:
            score_ratio = score_matches / score_total
            match_score += score_ratio * 40

        # Only include if at least some relevance
        if match_score > 15:
            matched_skills = []
            for js in job_skills:
                for user_skill in skills_lower:
                    if js in user_skill or user_skill in js:
                        matched_skills.append(js)
                        break

            missing_skills = [s for s in job_skills if s not in matched_skills]

            recommendations.append({
                "title": job["title"],
                "company_type": job["company_type"],
                "companies": job["companies"],
                "salary_range": job["salary_range"],
                "category": job["category"],
                "description": job["description"],
                "match_score": round(min(match_score, 100), 1),
                "matched_skills": matched_skills,
                "missing_skills": missing_skills[:5],  # Show top 5 missing
                "meets_requirements": score_matches == score_total,
            })

    # Sort by match score
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)

    return recommendations[:top_n]
