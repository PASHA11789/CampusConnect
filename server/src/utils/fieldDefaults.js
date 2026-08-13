/**
 * fieldDefaults.js
 * Central backend mapping for Minhaj University & Admin catalog departments.
 * Provides tailored career default bios, skill matrices, and domain-specific daily challenges.
 */

export const getDepartmentCategoryKey = (deptStr) => {
  const s = String(deptStr || "").toLowerCase().trim();
  if (!s) return "general";

  // 1. BS English (Literature & Applied Linguistics)
  if (/\b(english|bs english|literature|linguistics)\b/i.test(s)) {
    return "english";
  }

  // 2. Media, Design & Fine Arts
  if (/\b(humanities|media|mass comm|communication|fine arts|design|graphics|multimedia|animation)\b/i.test(s)) {
    return "media_arts";
  }

  // 3. Doctor of Pharmacy, Physical Therapy & Health Sciences
  if (/\b(pharm|pharm\.d|d\.pharm|pharmacy|pharmaceutical|clinical|health|medical|nutrition|dietetics|dpt|physical therapy|laboratory technology|aesthetics|cosmetology)\b/i.test(s)) {
    return "pharmacy";
  }

  // 4. Law, Social Sciences & Humanities
  if (/\b(law|llb|political|criminology|international relations|peace|conflict|defense|strategic|sociology|psychology|education)\b/i.test(s)) {
    return "law";
  }

  // 5. Islamic Studies & Theology
  if (/\b(islamic|religion|theology|philosophy)\b/i.test(s)) {
    return "islamic_studies";
  }

  // 6. Business, Economics & FinTech
  if (/\b(bba|business|finance|accounting|management|marketing|mba|commerce|economics|b\.com|fintech|financial technology|e-commerce|analytics)\b/i.test(s)) {
    return "business";
  }

  // 7. Engineering
  if (/\b(engineer|engineering|electrical|mechanical|civil|chemical|mechatronics?|bsee|bsme)\b/i.test(s)) {
    return "engineering";
  }

  // 8. Natural Sciences, Bio & Mathematics
  if (/\b(math|maths|mathematics|statistics?|physics|chemistry|biology|biological|biotechnology|bioinformatics|biochemistry|zoology|entomology|plant|food science)\b/i.test(s)) {
    return "sciences";
  }

  // 9. Tech / Computer Science / Software Engineering / AI / Cyber
  if (/\b(computer|cs|software|se|information technology|bsit|\bit\b|data science|ai|cyber|tech|artificial intelligence|information system)\b/i.test(s)) {
    return "tech";
  }

  return "general";
};

export const DEPARTMENT_FIELD_DEFAULTS = {
  english: {
    categoryLabel: "BS English (Literature & Applied Linguistics)",
    defaultBio: "Aspiring Linguist, Literary Analyst & Content Specialist | Passionate about Applied Linguistics, Critical Analysis & Technical Communication.",
    defaultDeptLabel: "BS English & Applied Linguistics",
    skills: [
      { name: "Applied Linguistics & Phonetics", level: 90 },
      { name: "Critical Literature & Textual Analysis", level: 85 },
      { name: "Professional & Technical Writing", level: 80 },
      { name: "Research Methodology & Academic Editing", level: 75 },
      { name: "Public Speaking & Rhetoric", level: 70 },
    ],
    dailyChallengeBadge: "📖 Daily English & Linguistics Case",
    dailyChallengeBtn: "Analyze Language Brief →",
    dailyChallenges: [
      {
        id: "eng-lit-1",
        title: "Discourse Analysis: Stylistic & Semantic Analysis of Modern Text",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Linguistics", "Discourse Analysis", "Semantics"],
        estTime: "20 mins",
        solved: "165 English Students Solved",
        link: "https://www.linguisticsociety.org",
      },
      {
        id: "eng-lit-2",
        title: "Comparative Critical Essay: Romanticism vs Modernism in Literature",
        difficulty: "Hard",
        diffColor: "bg-red-100 text-red-800 border-red-200",
        tags: ["Literature", "Critical Analysis", "Literary Theory"],
        estTime: "25 mins",
        solved: "110 English Students Solved",
        link: "https://www.linguisticsociety.org",
      },
      {
        id: "eng-lit-3",
        title: "Technical Editing & Pragmatics in Corporate Communications",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["Applied Linguistics", "Pragmatics", "Editing"],
        estTime: "15 mins",
        solved: "230 English Students Solved",
        link: "https://www.linguisticsociety.org",
      },
    ],
  },
  tech: {
    categoryLabel: "BS Computer Science",
    defaultBio: "Aspiring Software Engineer & Full-Stack Developer | Passionate about DSA, Web Dev & AI | Lifelong learner.",
    defaultDeptLabel: "BS Computer Science",
    skills: [
      { name: "Full-Stack Web Development", level: 90 },
      { name: "Data Structures & Algorithms", level: 85 },
      { name: "Python & AI / Machine Learning", level: 80 },
      { name: "Database Management (SQL & NoSQL)", level: 75 },
      { name: "DevOps & Cloud (Git, Docker, AWS)", level: 65 },
    ],
    dailyChallengeBadge: "🧩 Daily Tech & CS Challenge",
    dailyChallengeBtn: "Solve Challenge on LeetCode →",
    dailyChallenges: [
      {
        id: "cs-1",
        title: "Binary Tree Zigzag Level Order Traversal",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["DSA", "Trees", "BFS / DFS"],
        estTime: "20 mins",
        solved: "148 Students Solved",
        link: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
      },
      {
        id: "cs-2",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Strings", "Sliding Window", "HashTable"],
        estTime: "15 mins",
        solved: "215 Students Solved",
        link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      },
      {
        id: "cs-3",
        title: "Merge K Sorted Linked Lists",
        difficulty: "Hard",
        diffColor: "bg-red-100 text-red-800 border-red-200",
        tags: ["Heaps", "Linked List", "Divide & Conquer"],
        estTime: "25 mins",
        solved: "94 Students Solved",
        link: "https://leetcode.com/problems/merge-k-sorted-lists/",
      },
      {
        id: "cs-4",
        title: "Validate Binary Search Tree",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Trees", "DFS", "Binary Search"],
        estTime: "15 mins",
        solved: "182 Students Solved",
        link: "https://leetcode.com/problems/validate-binary-search-tree/",
      },
    ],
  },
  business: {
    categoryLabel: "Business & Management",
    defaultBio: "Aspiring Business Analyst & Financial Consultant | Passionate about Market Strategy, Corporate Finance & Growth | Strategic thinker.",
    defaultDeptLabel: "Bachelor of Business Administration (BBA)",
    skills: [
      { name: "Financial Analysis & Valuation", level: 90 },
      { name: "Business Strategy & Consulting", level: 85 },
      { name: "Market Research & Analytics", level: 80 },
      { name: "Agile Project Management", level: 75 },
      { name: "Data Analytics & Financial Excel", level: 70 },
    ],
    dailyChallengeBadge: "📊 Daily Business & Finance Case",
    dailyChallengeBtn: "Analyze Case Study →",
    dailyChallenges: [
      {
        id: "biz-1",
        title: "Market Expansion Strategy: EV Fleet Valuation & Entry",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Strategy", "Financial Valuation", "Market Entry"],
        estTime: "25 mins",
        solved: "164 Students Analyzed",
        link: "https://hbr.org/case-studies",
      },
      {
        id: "biz-2",
        title: "Financial Ratio & Liquidity Analysis (DuPont Model)",
        difficulty: "Hard",
        diffColor: "bg-red-100 text-red-800 border-red-200",
        tags: ["Finance", "DuPont Analysis", "Balance Sheet"],
        estTime: "30 mins",
        solved: "88 Students Solved",
        link: "https://hbr.org/case-studies",
      },
      {
        id: "biz-3",
        title: "Customer Acquisition Cost (CAC) vs Lifetime Value (LTV)",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["Marketing", "Metrics", "SaaS Growth"],
        estTime: "15 mins",
        solved: "240 Students Solved",
        link: "https://hbr.org/case-studies",
      },
    ],
  },
  engineering: {
    categoryLabel: "Engineering Sciences",
    defaultBio: "Aspiring Engineering Professional | Passionate about Systems Design, CAD Modeling, Control Systems & Technical Innovation.",
    defaultDeptLabel: "BS Electrical / Mechanical Engineering",
    skills: [
      { name: "Technical CAD & FEA Modeling", level: 90 },
      { name: "Circuit Design & Control Systems", level: 85 },
      { name: "MATLAB & Embedded Programming", level: 80 },
      { name: "Project Planning & Industrial Safety", level: 75 },
      { name: "Technical Writing & Documentation", level: 70 },
    ],
    dailyChallengeBadge: "⚙️ Daily Engineering Challenge",
    dailyChallengeBtn: "Solve Technical Challenge →",
    dailyChallenges: [
      {
        id: "eng-1",
        title: "Op-Amp Circuit Gain & Signal Filtering Calculations",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Electrical", "Analog Circuits", "Filters"],
        estTime: "20 mins",
        solved: "105 Students Solved",
        link: "https://www.engineering.com",
      },
      {
        id: "eng-2",
        title: "Finite Element Stress Analysis on Cantilever Beam",
        difficulty: "Hard",
        diffColor: "bg-red-100 text-red-800 border-red-200",
        tags: ["Mechanical", "FEA", "Structural Analysis"],
        estTime: "30 mins",
        solved: "72 Students Solved",
        link: "https://www.engineering.com",
      },
      {
        id: "eng-3",
        title: "PID Controller Tuning for Automated Servo Motor",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Mechatronics", "Control Systems", "PID"],
        estTime: "25 mins",
        solved: "130 Students Solved",
        link: "https://www.engineering.com",
      },
    ],
  },
  pharmacy: {
    categoryLabel: "Pharmacy & Medical Sciences",
    defaultBio: "Aspiring Doctor of Pharmacy (Pharm.D) & Clinical Pharmacist | Passionate about Clinical Pharmacology, Therapeutics & Patient Care.",
    defaultDeptLabel: "Doctor of Pharmacy (Pharm.D)",
    skills: [
      { name: "Clinical Pharmacology & Pharmacokinetics", level: 90 },
      { name: "Drug Interactions & Clinical Toxicology", level: 85 },
      { name: "Hospital & Community Pharmacy Practice", level: 80 },
      { name: "Pharmaceutical Formulations & Quality", level: 75 },
      { name: "Medical Ethics & Patient Counseling", level: 70 },
    ],
    dailyChallengeBadge: "💊 Daily Pharm.D & Clinical Challenge",
    dailyChallengeBtn: "Review Clinical Case Brief →",
    dailyChallenges: [
      {
        id: "pharm-1",
        title: "Clinical Drug Interaction: Warfarin & NSAID Co-administration",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Pharmacology", "Therapeutics", "Patient Safety"],
        estTime: "20 mins",
        solved: "135 Pharmacy Students Solved",
        link: "https://www.pharmacist.com",
      },
      {
        id: "pharm-2",
        title: "Pediatric Antibiotic Dosing & Renal Clearance Regimen",
        difficulty: "Hard",
        diffColor: "bg-red-100 text-red-800 border-red-200",
        tags: ["Pharm.D", "Pharmacokinetics", "Renal Dosing"],
        estTime: "25 mins",
        solved: "92 Pharmacy Students Solved",
        link: "https://www.pharmacist.com",
      },
      {
        id: "pharm-3",
        title: "Hypertension & Diabetes Polypharmacy Case Review",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["Clinical Pharmacy", "Management", "Case Brief"],
        estTime: "15 mins",
        solved: "210 Pharmacy Students Solved",
        link: "https://www.pharmacist.com",
      },
    ],
  },
  sciences: {
    categoryLabel: "Natural & Applied Sciences",
    defaultBio: "Aspiring Data Analyst & Computational Scientist | Passionate about Mathematical Modeling, Statistical Analysis & Research.",
    defaultDeptLabel: "BS Mathematics & Statistics",
    skills: [
      { name: "Statistical Modeling & R / Python", level: 90 },
      { name: "Applied Mathematics & Differential Equations", level: 85 },
      { name: "Data Visualization & Hypotheses Testing", level: 80 },
      { name: "Machine Learning Mathematical Foundations", level: 75 },
      { name: "Academic & Scientific Research Methodology", level: 70 },
    ],
    dailyChallengeBadge: "📐 Daily Mathematics & Science Case",
    dailyChallengeBtn: "Solve Applied Math Problem →",
    dailyChallenges: [
      {
        id: "sci-1",
        title: "Multivariate Regression & P-Value Significance Test",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Statistics", "Regression", "R Language"],
        estTime: "20 mins",
        solved: "115 Students Solved",
        link: "https://www.khanacademy.org/math",
      },
      {
        id: "sci-2",
        title: "Bayesian Probability & Conditional Probability Modeling",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["Probability", "Bayes Theorem", "Stats"],
        estTime: "15 mins",
        solved: "195 Students Solved",
        link: "https://www.khanacademy.org/math",
      },
    ],
  },
  media_arts: {
    categoryLabel: "Arts, Media & Humanities",
    defaultBio: "Aspiring Content Strategist & Media Professional | Passionate about Visual Storytelling, Critical Writing & Digital Communications.",
    defaultDeptLabel: "BS English & Mass Communication",
    skills: [
      { name: "Content Strategy & Creative Writing", level: 90 },
      { name: "Digital Journalism & Media Production", level: 85 },
      { name: "UI/UX & Graphic Prototyping", level: 80 },
      { name: "Public Relations & Corporate Branding", level: 75 },
      { name: "Media Ethics & Mass Communication", level: 70 },
    ],
    dailyChallengeBadge: "🎨 Daily Media & Design Brief",
    dailyChallengeBtn: "Explore Creative Brief →",
    dailyChallenges: [
      {
        id: "media-1",
        title: "Accessibility Redesign: Mobile Checkout Flow for Elderly Users",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["UI/UX", "Accessibility", "Design Brief"],
        estTime: "20 mins",
        solved: "190 Students Participated",
        link: "https://www.uicoach.io",
      },
      {
        id: "media-2",
        title: "Digital PR Campaign Strategy for Campus Sustainability",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["Public Relations", "Branding", "Content"],
        estTime: "15 mins",
        solved: "220 Students Participated",
        link: "https://www.uicoach.io",
      },
    ],
  },
  law: {
    categoryLabel: "Law & Social Sciences",
    defaultBio: "Aspiring Legal Associate & Public Policy Analyst | Passionate about Constitutional Law, International Relations & Policy Research.",
    defaultDeptLabel: "BS Law & Political Science",
    skills: [
      { name: "Legal Research & Case Precedent Analysis", level: 90 },
      { name: "Constitutional Law & International Policy", level: 85 },
      { name: "Corporate Compliance & Regulatory Ethics", level: 80 },
      { name: "Public Speaking & Moot Court Advocacy", level: 75 },
      { name: "Contract Drafting & Legal Analysis", level: 70 },
    ],
    dailyChallengeBadge: "⚖️ Daily Law & Policy Brief",
    dailyChallengeBtn: "Review Legal Case Brief →",
    dailyChallenges: [
      {
        id: "law-1",
        title: "Constitutional Law Moot: Fundamental Rights vs Public Safety",
        difficulty: "Hard",
        diffColor: "bg-red-100 text-red-800 border-red-200",
        tags: ["Law", "Constitutional", "Moot Court"],
        estTime: "30 mins",
        solved: "84 Law Students Solved",
        link: "https://www.law.com",
      },
      {
        id: "law-2",
        title: "International Treaty Obligations & Arbitration Analysis",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["International Law", "Policy", "Arbitration"],
        estTime: "20 mins",
        solved: "140 Law Students Solved",
        link: "https://www.law.com",
      },
    ],
  },
  islamic_studies: {
    categoryLabel: "Islamic Studies & Philosophy",
    defaultBio: "Aspiring Scholar & Research Associate | Focused on Islamic Jurisprudence, Comparative Philosophy & Academic Ethics.",
    defaultDeptLabel: "BS Islamic Studies & Philosophy",
    skills: [
      { name: "Academic Research & Hermeneutics", level: 90 },
      { name: "Comparative Jurisprudence & Ethics", level: 85 },
      { name: "Classical Arabic Literature & Philology", level: 80 },
      { name: "Philosophy & Bioethics Research", level: 75 },
      { name: "Public Discourse & Academic Writing", level: 70 },
    ],
    dailyChallengeBadge: "📖 Daily Research & Philosophy Case",
    dailyChallengeBtn: "Analyze Research Case →",
    dailyChallenges: [
      {
        id: "isl-1",
        title: "Comparative Bioethics: Contemporary Medical Ethics in Jurisprudence",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Bioethics", "Jurisprudence", "Philosophy"],
        estTime: "25 mins",
        solved: "110 Students Solved",
        link: "https://www.al-islam.org",
      },
      {
        id: "isl-2",
        title: "Historical Analysis of Legal Maxim Application (Qawaid Fiqhiyyah)",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["Research", "Hermeneutics", "Ethics"],
        estTime: "15 mins",
        solved: "175 Students Solved",
        link: "https://www.al-islam.org",
      },
    ],
  },
  general: {
    categoryLabel: "General Academic Studies",
    defaultBio: "Enthusiastic Student & Future Professional | Focused on Academic Research, Critical Analysis, Communication & Professional Excellence.",
    defaultDeptLabel: "General Studies",
    skills: [
      { name: "Critical Research & Analytical Thinking", level: 90 },
      { name: "Professional Writing & Communication", level: 85 },
      { name: "Problem Solving & Logic Analysis", level: 80 },
      { name: "Public Speaking & Presentation Skills", level: 75 },
      { name: "Team Collaboration & Leadership", level: 70 },
    ],
    dailyChallengeBadge: "💡 Daily Career & Aptitude Challenge",
    dailyChallengeBtn: "Practice Interview Case →",
    dailyChallenges: [
      {
        id: "gen-1",
        title: "Behavioral Interview Case: Conflict Resolution & Leadership",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["STAR Method", "Leadership", "Communication"],
        estTime: "15 mins",
        solved: "340 Students Practiced",
        link: "https://www.linkedin.com/learning",
      },
      {
        id: "gen-2",
        title: "Analytical Aptitude & Logical Reasoning Test",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Aptitude", "Logic", "Problem Solving"],
        estTime: "20 mins",
        solved: "280 Students Practiced",
        link: "https://www.linkedin.com/learning",
      },
    ],
  },
};

export const getDepartmentDefaults = (deptStr) => {
  const key = getDepartmentCategoryKey(deptStr);
  return DEPARTMENT_FIELD_DEFAULTS[key] || DEPARTMENT_FIELD_DEFAULTS.general;
};
