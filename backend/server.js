/* eslint-disable no-case-declarations */
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(bodyParser.json());

// Serve React build in production (adjust if needed).
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// =========================================================================
// 1) ENUMS & CONSTANTS
// =========================================================================

// MajorDirections
const MajorDirection = {
  STEM: 1,
  MEDICAL: 2,
  BUSINESS: 3,
  SOCIAL_SCIENCE: 4,
  ENVIRONMENTAL: 5,
  CS_DATA: 6,
  LANGUAGE_CULTURE: 7,
  LAW_POLICY: 8,
};

function fromCode(c) {
  switch (c) {
    case 1: return "STEM";
    case 2: return "MEDICAL";
    case 3: return "BUSINESS";
    case 4: return "SOCIAL_SCIENCE";
    case 5: return "ENVIRONMENTAL";
    case 6: return "CS_DATA";
    case 7: return "LANGUAGE_CULTURE";
    case 8: return "LAW_POLICY";
    default: return "STEM";
  }
}

// CourseCategory
const CourseCategory = {
  ENGLISH: "ENGLISH",
  MATH: "MATH",
  SCIENCE: "SCIENCE",
  SOCIAL_STUDIES: "SOCIAL_STUDIES",
  FINANCIAL: "FINANCIAL",
  PE_HEALTH: "PE_HEALTH",
  VPA: "VPA",
  WL: "WL",
  LIFE_CAREERS: "LIFE_CAREERS",
  ELECTIVES: "ELECTIVES",
  FREE_PERIOD: "FREE_PERIOD",
};

// Utility to unify CP/Honors in names, leaving “AP” alone
function unifyNonAPName(originalName) {
  if (originalName.includes("AP ")) {
    return originalName.trim();
  }
  return originalName
    .replace("CP/Honors", "")
    .replace(", CP", "")
    .replace(", Honors", "")
    .trim();
}

// Conflict bases
const CONFLICT_BASES = new Set(["Biology", "Chemistry", "US History"]);

// =========================================================================
// 2) GRADUATION REQUIREMENTS
// =========================================================================
class GraduationRequirements {
  constructor() {
    this.englishNeeded = 20;
    this.mathNeeded = 15;
    this.scienceNeeded = 15;
    this.socialNeeded = 15;
    this.financialNeeded = 5;
    this.peHealthNeeded = 10;
    this.vpaNeeded = 5;
    this.wlNeeded = 10;
    this.lifeCareersNeeded = 5;
    this.electivesNeeded = 30;
  }
  updateRequirements(completedCourses) {
    for (const c of completedCourses) {
      switch (c.category) {
        case CourseCategory.ENGLISH: this.englishNeeded -= 5; break;
        case CourseCategory.MATH: this.mathNeeded -= 5; break;
        case CourseCategory.SCIENCE: this.scienceNeeded -= 5; break;
        case CourseCategory.SOCIAL_STUDIES: this.socialNeeded -= 5; break;
        case CourseCategory.FINANCIAL: this.financialNeeded -= 5; break;
        case CourseCategory.PE_HEALTH: this.peHealthNeeded -= 5; break;
        case CourseCategory.VPA: this.vpaNeeded -= 5; break;
        case CourseCategory.WL: this.wlNeeded -= 5; break;
        case CourseCategory.LIFE_CAREERS: this.lifeCareersNeeded -= 5; break;
        case CourseCategory.ELECTIVES: this.electivesNeeded -= 5; break;
        default:
          break;
      }
    }
    // Clamp each requirement to zero
    this.englishNeeded = Math.max(0, this.englishNeeded);
    this.mathNeeded = Math.max(0, this.mathNeeded);
    this.scienceNeeded = Math.max(0, this.scienceNeeded);
    this.socialNeeded = Math.max(0, this.socialNeeded);
    this.financialNeeded = Math.max(0, this.financialNeeded);
    this.peHealthNeeded = Math.max(0, this.peHealthNeeded);
    this.vpaNeeded = Math.max(0, this.vpaNeeded);
    this.wlNeeded = Math.max(0, this.wlNeeded);
    this.lifeCareersNeeded = Math.max(0, this.lifeCareersNeeded);
    this.electivesNeeded = Math.max(0, this.electivesNeeded);
  }
}

// =========================================================================
// 3) HELPER MAPS: LEVELS + PREREQS
// =========================================================================

// Course levels mapped by original course name
const rawCourseLevelMap = new Map([
  // MATH
  ["Algebra I", 4],
  ["Geometry, CP", 5],
  ["Geometry, Honors", 5],
  ["Algebra II", 5],
  ["Algebra 2, Honors", 5],
  ["Precalculus, CP", 6],
  ["Honors Precalculus", 6],
  ["AP Precalculus", 6],
  ["Calculus", 7],
  ["AP Calculus AB", 7],
  ["AP Calculus BC", 8],
  ["AP Statistics", 9],
  ["SAT Math (Fall)/SAT Math (Spring)", 4],

  // SCIENCE + others
  ["Biology, CP", 3],
  ["Biology, Honors", 3],
  ["AP Biology", 4],
  ["Chemistry, CP", 3],
  ["Chemistry, Honors", 3],
  ["AP Chemistry", 4],
  ["Physics, CP/Honors", 3],
  ["AP Physics I", 4],
  ["Spanish I /Arabic I /Turkish I / Chinese I / French I (Independent Study with a Supervisor)", 1],
  ["Honors Spanish I", 2],
  ["Spanish II, Honors", 3],
  ["Spanish III, Honors", 4],
  ["Spanish IV, Honors", 5],
  ["US History, CP", 3],
  ["US History, Honors", 3],
  ["AP US History", 4],
  ["Computer Programming I (Fall) / Computer Programming II (Spring)", 3],
  ["AP Computer Science A", 4],
  ["AP Computer Science Principles", 4],

  // Additional courses
  ["Modern World History, CP", 4],
  ["Modern World History, Honors", 5],
  ["AP English Language & Composition", 5],
  ["AP Psychology", 5],
  ["AP Comparative Government and Politics", 5],
  ["AP Macroeconomics", 5],
  ["AP Microeconomics", 5],
  ["AP US Government and Politics", 5],
  ["AP European History", 5],
  ["AP Environmental Science", 4],
  ["AP Precalculus", 6],
  ["Honors Probability & Statistics", 5],
]);

// Prerequisites mapped by original course name
const rawPrereqMap = new Map([
  // MATH
  ["Geometry, CP", ["Algebra I"]],
  ["Geometry, Honors", ["Algebra I"]],
  ["Algebra II", ["Algebra I"]],
  ["Algebra 2, Honors", ["Algebra I"]],
  ["Precalculus, CP", ["Algebra II", "Algebra 2, Honors"]],
  ["Honors Precalculus", ["Algebra II", "Algebra 2, Honors"]],
  ["AP Precalculus", ["Algebra II", "Algebra 2, Honors"]],
  ["Calculus", ["Precalculus, CP", "Honors Precalculus", "AP Precalculus"]],
  ["AP Calculus AB", ["Precalculus, CP", "Honors Precalculus", "AP Precalculus"]],
  ["AP Calculus BC", ["AP Calculus AB"]],
  ["AP Statistics", ["AP Calculus BC"]],

  // Science
  ["AP Biology", ["Biology, CP", "Biology, Honors"]],
  ["AP Chemistry", ["Chemistry, CP", "Chemistry, Honors"]],
  ["AP Physics I", ["Physics, CP/Honors"]],
  ["AP Environmental Science", ["Biology, CP", "Chemistry, CP"]],

  // CS
  ["AP Computer Science A", ["Computer Programming I (Fall) / Computer Programming II (Spring)"]],
  ["AP Computer Science Principles", ["Computer Programming I (Fall) / Computer Programming II (Spring)"]],

  // Social
  ["AP US History", ["US History, CP", "US History, Honors"]],
  ["AP US Government and Politics", ["Modern World History, Honors"]],
  ["AP Macroeconomics", []],
  ["AP Microeconomics", []],
  ["AP Psychology", []],
  ["AP Comparative Government and Politics", []],
  ["AP European History", []],

  // Language
  ["Spanish II, Honors", ["Spanish I"]],
  ["Spanish III, Honors", ["Spanish II, Honors"]],
  ["Spanish IV, Honors", ["Spanish III, Honors"]],
  ["Arabic II, CP", ["Arabic I"]],
  ["Arabic III & IV, Honors", ["Arabic II, CP"]],
]);

// =========================================================================
// 4) COURSE BUILDER
// =========================================================================
function getCategoryByName(originalName) {
  const lower = originalName.toLowerCase();
  if (
    lower.includes("english 9") ||
    lower.includes("english 10") ||
    lower.includes("english 11") ||
    lower.includes("english 12") ||
    lower.includes("ap english language") ||
    lower.includes("essay writing for seniors") ||
    lower.includes("sat english")
  ) {
    return CourseCategory.ENGLISH;
  }
  if (
    lower.includes("algebra i") ||
    lower.includes("algebra ii") ||
    lower.includes("algebra 2") ||
    lower.includes("geometry") ||
    lower.includes("precalculus") ||
    lower.includes("precalculus") ||
    lower.includes("ap precalculus") ||
    lower.includes("honors precalculus") ||
    lower.includes("calculus") ||
    lower.includes("ap calculus") ||
    lower.includes("statistics") ||
    lower.includes("probability & statistics") ||
    lower.includes("sat math")
  ) {
    return CourseCategory.MATH;
  }
  if (
    lower.includes("biology") ||
    lower.includes("chemistry") ||
    lower.includes("physics") ||
    lower.includes("anatomy and physiology") ||
    lower.includes("environmental science") ||
    lower.includes("forensic science") ||
    lower.includes("organic chemistry")
  ) {
    return CourseCategory.SCIENCE;
  }
  if (
    lower.includes("world history") ||
    lower.includes("us history") ||
    lower.includes("ap us government") ||
    lower.includes("ap us history") ||
    lower.includes("ap comparative government") ||
    lower.includes("ap european history") ||
    lower.includes("ap macroeconomics") ||
    lower.includes("ap microeconomics") ||
    lower.includes("ap psychology") ||
    lower.includes("sociology") ||
    lower.includes("global issues") ||
    lower.includes("intro to world religions") ||
    lower.includes("mythology") ||
    lower.includes("cultural studies")
  ) {
    return CourseCategory.SOCIAL_STUDIES;
  }
  if (
    lower.includes("financial literacy") ||
    lower.includes("intro to business") ||
    lower.includes("principles of business") ||
    lower.includes("project management") ||
    lower.includes("entrepreneurship") ||
    lower.includes("marketing") ||
    lower.includes("econ") // For "economics"
  ) {
    return CourseCategory.FINANCIAL;
  }
  if (lower.includes("pe/health")) {
    return CourseCategory.PE_HEALTH;
  }
  if (
    lower.includes("instrumental music") ||
    lower.includes("pencil and ink illustration") ||
    lower.includes("drawing and painting") ||
    lower.includes("digital visual art") ||
    lower.includes("cultivating creativity") ||
    lower.includes("animated thinking")
  ) {
    return CourseCategory.VPA;
  }
  if (
    lower.includes("spanish") ||
    lower.includes("arabic") ||
    lower.includes("turkish") ||
    lower.includes("chinese") ||
    lower.includes("french")
  ) {
    return CourseCategory.WL;
  }
  if (
    lower.includes("national & international current affairs") ||
    lower.includes("public speaking") ||
    lower.includes("graphic design") ||
    lower.includes("cybersecurity") ||
    lower.includes("web development") ||
    lower.includes("computer programming") ||
    lower.includes("ap computer science") ||
    lower.includes("dynamic programming") ||
    lower.includes("principles of engineering") ||
    lower.includes("architectural cad")
  ) {
    return CourseCategory.LIFE_CAREERS;
  }
  if (
    lower.includes("broadcast media production") ||
    lower.includes("juniors only") ||
    lower.includes("seniors only independent online courses")
  ) {
    return CourseCategory.ELECTIVES;
  }
  return CourseCategory.ELECTIVES;
}

function makeCourse(originalName, gpa, diff, rel, period, minG, maxG, isAP) {
  const unified = unifyNonAPName(originalName);
  const cat = getCategoryByName(originalName);
  const lvl = rawCourseLevelMap.get(originalName) || 0;
  const rawPreArr = rawPrereqMap.get(originalName) || [];
  const unifiedPrereqs = rawPreArr.map((r) => unifyNonAPName(r));

  return {
    name: originalName,         // keep CP/Honors in final
    unifiedName: unified,       // stripped for logic
    category: cat,
    gpa,
    difficulty: diff,
    relevance: rel,
    prerequisites: unifiedPrereqs,
    period,
    gradeLevelMin: minG,
    gradeLevelMax: maxG,
    isAP,
    level: lvl,
  };
}

// =========================================================================
// 5) BUILD ALL COURSES
// =========================================================================
function initAllCourses() {
  const list = [];
  function helper(name, gpa, diff, rel, period, minG, maxG, ap) {
    list.push(makeCourse(name, gpa, diff, rel, period, minG, maxG, ap));
  }

  // Period 1
  helper("Biology, CP", 4.33, 4.5, 4.7, 1, 9, 12, false);
  helper("Geometry, Honors", 5.00, 2.6, 2.5, 1, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 4.6, 2.4, 1, 9, 12, false);
  helper("Chemistry, Honors", 5.00, 2.7, 2.6, 1, 9, 12, false);
  helper("Modern World History, CP", 4.33, 3.5, 4.3, 1, 9, 12, false);
  helper("Financial Literacy (Fall)/ Intro to Business (Spring)", 4.00, 4.3, 3.5, 1, 9, 12, false);
  helper("SAT English (Spring)", 4.00, 4.9, 3.7, 1, 9, 12, false);
  helper("SAT Math (Fall)/SAT Math (Spring)", 4.00, 4.6, 3.4, 1, 9, 12, false);
  helper("English 11, Honors", 5.00, 4.0, 4.6, 1, 11, 11, false);
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.9, 3.1, 1, 9, 12, false);
  helper("Spanish IV, Honors", 5.00, 3.7, 4.7, 1, 9, 12, false);
  helper("Arabic III & IV, Honors", 5.00, 3.9, 4.8, 1, 9, 12, false);
  helper("Essay Writing for Seniors (Fall)", 4.00, 3.8, 4.5, 1, 12, 12, false);
  helper("AP Statistics", 5.33, 4.8, 5.0, 1, 10, 12, true);
  helper("Cybersecurity", 4.00, 4.5, 4.8, 1, 9, 12, false);

  // Period 2
  helper("Algebra I", 4.00, 3.2, 3.8, 2, 9, 12, false);
  helper("Geometry, CP", 4.33, 3.5, 4.0, 2, 9, 12, false);
  helper("Graphic Design - Full Year", 4.00, 3.9, 4.2, 2, 9, 12, false);
  helper("Modern World History, CP", 4.33, 4.0, 4.3, 2, 9, 12, false);
  helper("English 10, Honors", 5.00, 4.1, 4.7, 2, 10, 10, false);
  helper("Honors Precalculus", 5.00, 4.7, 5.0, 2, 9, 12, false);
  helper("Spanish III, Honors", 5.00, 3.6, 4.8, 2, 9, 12, false);
  helper("Anatomy and Physiology", 4.00, 4.5, 4.2, 2, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 3.0, 2.9, 2, 9, 12, false);
  helper("National & International Current Affairs (Fall) / Public Speaking (Spring)", 4.00, 3.7, 4.0, 2, 9, 12, false);
  helper("English 12, CP", 4.33, 4.2, 4.5, 2, 12, 12, false);
  helper("AP US History", 5.33, 4.9, 5.0, 2, 10, 12, true);
  helper("Broadcast Media Production", 4.00, 3.7, 4.0, 2, 9, 12, false);
  helper("Dynamic Programming", 4.00, 4.8, 5.0, 2, 9, 12, false);

  // Period 3
  helper("Spanish I /Arabic I /Turkish I / Chinese I / French I (Independent Study with a Supervisor)", 4.00, 3.2, 3.5, 3, 9, 12, false);
  helper("English 9, Honors", 5.00, 3.6, 4.5, 3, 9, 9, false);
  helper("Digital Visual Art (Fall) / Cultivating Creativity (Spring)", 4.00, 4.0, 3.7, 3, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 3.2, 3.0, 3, 9, 12, false);
  helper("English 10, CP", 4.33, 3.5, 4.0, 3, 10, 10, false);
  helper("AP Precalculus", 5.33, 4.8, 5.0, 3, 10, 12, true);
  helper("Chemistry, CP", 4.33, 3.5, 4.7, 3, 9, 12, false);
  helper("Web Development I (Fall)/Web Development II", 4.00, 4.6, 5.0, 3, 9, 12, false);
  helper("Sociology of the Future (Fall) / Global Issues (Spring)", 4.00, 3.8, 4.3, 3, 9, 12, false);
  helper("Precalculus, CP", 4.33, 4.0, 4.6, 3, 9, 12, false);
  helper("National & International Current Affairs (Fall) / Public Speaking (Spring)", 4.00, 3.7, 3.8, 3, 9, 12, false);
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.8, 3.0, 3, 9, 12, false);
  helper("AP English Language & Composition", 5.33, 4.6, 5.0, 3, 11, 12, true);
  helper("Calculus", 4.00, 4.3, 4.7, 3, 9, 12, false);
  helper("AP Physics I", 5.33, 4.9, 5.0, 3, 10, 12, true);

  // Period 4
  helper("US History, CP", 4.33, 3.7, 4.2, 4, 9, 12, false);
  helper("Biology, Honors", 5.00, 4.2, 4.8, 4, 9, 12, false);
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.9, 3.2, 4, 9, 12, false);
  helper("Spanish II, Honors", 5.00, 3.8, 4.7, 4, 9, 12, false);
  helper("Arabic II, CP", 4.33, 3.5, 4.0, 4, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 3.1, 3.0, 4, 9, 12, false);
  helper("English 11", 4.00, 3.9, 4.3, 4, 11, 11, false);
  helper("AP Computer Science A", 5.33, 4.9, 5.0, 4, 10, 12, true);
  helper("AP Chemistry", 5.33, 5.0, 5.0, 4, 10, 12, true);
  helper("Financial Literacy (Fall)/ Intro to Business (Spring)", 4.00, 4.1, 4.3, 4, 9, 12, false);
  helper("Juniors Only with cumulative unweighted GPA 3.75 and above", 4.00, 4.0, 4.0, 4, 11, 11, false);
  helper("Seniors Only Independent Online Courses with a Supervisor (Fall) / Independent Online Courses with a Supervisor (Spring)", 4.00, 3.8, 4.2, 4, 12, 12, false);
  helper("Intro to World Religions, Mythology, and Belief Systems I (Fall) / Intro to World Religions, Mythology, and Belief", 4.00, 3.7, 4.0, 4, 9, 12, false);
  helper("Sociology (Fall)/Anthropology(Spring)", 4.00, 4.0, 4.5, 4, 9, 12, false);

  // Period 5
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.8, 3.2, 5, 9, 12, false);
  helper("English 9, Honors", 5.00, 3.5, 4.6, 5, 9, 9, false);
  helper("Pencil and Ink Illustration (Fall) / Drawing and Painting (Spring)", 4.00, 4.0, 3.5, 5, 9, 12, false);
  helper("US History, Honors", 5.00, 4.4, 5.0, 5, 9, 12, false);
  helper("Chemistry, CP", 4.33, 3.9, 4.5, 5, 9, 12, false);
  helper("Computer Programming I (Fall) / Computer Programming II (Spring)", 4.00, 4.7, 5.0, 5, 9, 12, false);
  helper("AP Biology", 5.33, 4.9, 5.0, 5, 10, 12, true);
  helper("AP Psychology", 5.33, 4.8, 5.0, 5, 10, 12, true);
  helper("Physics, CP/Honors", 5.00, 4.5, 4.9, 5, 9, 12, false);
  helper("AP Comparative Government and Politics", 5.33, 5.0, 5.0, 5, 10, 12, true);
  helper("Entrepreneurship / Marketing", 4.00, 4.2, 4.7, 5, 9, 12, false);
  helper("Precalculus, CP", 4.33, 4.1, 4.6, 5, 9, 12, false);
  helper("Calculus", 4.00, 4.5, 4.7, 5, 9, 12, false);
  helper("AP Calculus AB", 5.33, 4.9, 5.0, 5, 10, 12, true);
  helper("Principles of Business (Fall)/ Project Management (Spring)", 4.00, 4.3, 4.6, 5, 9, 12, false);

  // Period 7
  helper("English 9, CP", 4.33, 3.5, 4.0, 7, 9, 9, false);
  helper("US History, Honors", 5.00, 4.4, 5.0, 7, 9, 12, false);
  helper("Biology, Honors", 5.00, 4.3, 4.8, 7, 9, 12, false);
  helper("Algebra II", 4.00, 4.0, 4.3, 7, 9, 12, false);
  helper("Modern World History, Honors", 5.00, 4.1, 4.8, 7, 9, 12, false);
  helper("Pencil and Ink Illustration (Fall) / Drawing and Painting (Spring)", 4.00, 3.5, 3.6, 7, 9, 12, false);
  helper("English 10, CP", 4.33, 3.7, 4.2, 7, 10, 10, false);
  helper("AP US Government and Politics", 5.33, 4.9, 5.0, 7, 10, 12, true);
  helper("AP Macroeconomics", 5.33, 5.0, 5.0, 7, 10, 12, true);
  helper("AP Computer Science Principles", 5.33, 4.7, 5.0, 7, 10, 12, true);
  helper("Principles of Engineering (Fall)\nArchitectural CAD (Spring)", 4.00, 4.5, 4.8, 7, 9, 12, false);
  helper("Environmental Science", 4.00, 3.8, 4.6, 7, 9, 12, false);
  helper("English 12, Honors", 5.00, 4.2, 4.8, 7, 12, 12, false);
  helper("Honors Probability & Statistics", 5.00, 4.5, 4.6, 7, 9, 12, false);

  // Period 8
  helper("Digital Visual Art (Fall) / Animated Thinking (Spring)", 4.00, 3.9, 3.7, 8, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 3.2, 3.0, 8, 9, 12, false);
  helper("Honors Spanish I", 5.00, 3.8, 4.5, 8, 9, 12, false);
  helper("Geometry, CP", 4.33, 3.5, 4.0, 8, 9, 12, false);
  helper("Algebra 2, Honors", 5.00, 4.5, 4.7, 8, 9, 12, false);
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.8, 3.2, 8, 9, 12, false);
  helper("Cultural Studies I/ Cultural Studies II", 4.00, 3.7, 4.0, 8, 9, 12, false);
  helper("Forensic Science (Fall)/ Introduction to Organic Chemistry (Spring)", 4.00, 4.4, 4.5, 8, 9, 12, false);
  helper("AP European History", 5.33, 4.8, 5.0, 8, 10, 12, true);
  helper("English 11, Honors", 5.00, 4.0, 4.6, 8, 11, 11, false);
  helper("AP Microeconomics", 5.33, 5.0, 5.0, 8, 10, 12, true);
  helper("AP Calculus BC", 5.33, 5.0, 5.0, 8, 10, 12, true);
  helper("English 12, Honors", 5.00, 4.3, 4.8, 8, 12, 12, false);

  return list;
}

const ALL = initAllCourses();

// =========================================================================
// 6) UNIFY THE USER’S COMPLETED COURSES & FILTERING LOGIC
// =========================================================================
function unifyCompletedCourses(userCompleted) {
  return (userCompleted || []).map((c) => unifyNonAPName(c));
}

// Helper to find the next English if user has completed the normal one
function getRequiredEnglishForGrade(grade, completedUnifiedSet) {
  if (grade === 9) {
    if ([...completedUnifiedSet].some((c) => unifyNonAPName(c).toLowerCase() === "english 9")) {
      return "English 10";
    }
    return "English 9";
  } else if (grade === 10) {
    if ([...completedUnifiedSet].some((c) => unifyNonAPName(c).toLowerCase() === "english 10")) {
      return "English 11";
    }
    return "English 10";
  } else if (grade === 11) {
    if ([...completedUnifiedSet].some((c) =>
      unifyNonAPName(c).toLowerCase() === "english 11" || unifyNonAPName(c).toLowerCase().includes("ap english")
    )) {
      return "English 12";
    }
    return "English 11";
  } else if (grade === 12) {
    return "English 12"; // Always require English 12 for 12th grade
  }
  return "English 9"; // Fallback
}

function filterCourses(allCourses, completedUnifiedSet, grade, req) {
  const res = [];

  // Collect conflict bases from user's completed courses
  const userConflictBases = new Set();
  for (const unifiedName of completedUnifiedSet) {
    const base = unifyNonAPName(unifiedName).replace("AP ", "").trim();
    if (CONFLICT_BASES.has(base)) {
      userConflictBases.add(base);
    }
  }

  // Find highest math level
  let highestMathLevel = 0;
  for (const cName of completedUnifiedSet) {
    const lvl = rawCourseLevelMap.get(cName) || 0;
    const cat = getCategoryByName(cName);
    if (cat === CourseCategory.MATH && lvl > highestMathLevel) {
      highestMathLevel = lvl;
    }
  }

  // Track highest levels for non-math categories with a "base"
  const highestNonMathLevelMap = {};
  for (const cName of completedUnifiedSet) {
    const nm = getNonMathCategoryBase(unifyNonAPName(cName));
    if (nm) {
      const lvl = rawCourseLevelMap.get(cName) || 0;
      if (!(nm in highestNonMathLevelMap)) {
        highestNonMathLevelMap[nm] = lvl;
      } else {
        highestNonMathLevelMap[nm] = Math.max(highestNonMathLevelMap[nm], lvl);
      }
    }
  }

  // Determine the required English for this student
  const requiredEnglish = getRequiredEnglishForGrade(grade, completedUnifiedSet);

  for (const course of allCourses) {
    // Skip if user has already completed the course
    if (completedUnifiedSet.has(course.unifiedName)) continue;

    // Skip if there's a conflict and the course is not AP
    if (!course.isAP) {
      const base = unifyNonAPName(course.unifiedName.replace("AP ", ""));
      if (CONFLICT_BASES.has(base) && userConflictBases.has(base)) {
        continue;
      }
    }

    // Check if the course is the required English for this grade
    if (course.category === CourseCategory.ENGLISH) {
      if (unifyNonAPName(course.name).toLowerCase() !== unifyNonAPName(requiredEnglish).toLowerCase()) {
        continue; // Only include the required English
      }
    }

    // **Modified Grade Level Check: Bypass for Required English**
    if (!(course.category === CourseCategory.ENGLISH &&
          unifyNonAPName(course.name).toLowerCase() === unifyNonAPName(requiredEnglish).toLowerCase())) {
      // Skip if grade level does not match, except for required English
      if (grade < course.gradeLevelMin || grade > course.gradeLevelMax) {
        continue;
      }
    }

    // Check prerequisites
    if (!arePrerequisitesMet(course, completedUnifiedSet)) {
      continue;
    }

    // If Math, ensure it's strictly higher level than what's completed
    if (course.category === CourseCategory.MATH) {
      if (course.level <= highestMathLevel) {
        continue;
      }
    } else {
      // For non-Math categories with a "base", ensure it's higher than completed
      const nm = getNonMathCategoryBase(unifyNonAPName(course.unifiedName));
      if (nm) {
        const cLevel = course.level;
        const maxLvl = highestNonMathLevelMap[nm] || 0;
        if (cLevel <= maxLvl) continue;
      }
    }

    res.push(course);
  }

  return res;
}

function arePrerequisitesMet(course, completedUnifiedSet) {
  if (!course.prerequisites || !course.prerequisites.length) return true;

  // Assume all prerequisites are ANDed; adjust if they are ORed
  for (const pr of course.prerequisites) {
    if (!completedUnifiedSet.has(pr)) {
      return false;
    }
  }
  return true;
}

// 6-non-math categories
function getNonMathCategoryBase(courseName) {
  if (courseName.includes("Biology")) return "Biology";
  if (courseName.includes("Chemistry")) return "Chemistry";
  if (courseName.includes("Physics")) return "Physics";
  if (
    courseName.includes("Spanish") ||
    courseName.includes("Arabic") ||
    courseName.includes("Turkish") ||
    courseName.includes("Chinese") ||
    courseName.includes("French")
  ) {
    return "WL";
  }
  if (courseName.includes("US History")) return "USHistory";
  if (
    courseName.includes("Computer Programming") ||
    courseName.includes("AP Computer Science") ||
    courseName.includes("Web Development")
  ) {
    return "CS";
  }
  return null;
}

// =========================================================================
// 7) GENERATE ALL POSSIBLE PLANS
// =========================================================================
function generateAllPossiblePlans(periodMap) {
  const periods = Object.keys(periodMap).map(Number).sort((a, b) => a - b);
  const results = [];

  function backtrack(idx, current) {
    if (idx === periods.length) {
      results.push([...current]);
      return;
    }
    const p = periods[idx];
    const candidates = periodMap[p] || [];
    for (const c of candidates) {
      current.push(c);
      if (checkNoDuplicateUnified(current)) {
        backtrack(idx + 1, current);
      }
      current.pop();
    }
  }
  backtrack(0, []);
  return results;
}

function checkNoDuplicateUnified(plan) {
  const set = new Set();
  for (const c of plan) {
    if (set.has(c.unifiedName)) return false;
    set.add(c.unifiedName);
  }
  return true;
}

// =========================================================================
// 8) FEASIBILITY CHECKS
// =========================================================================
function isFeasible(plan, grade, completedUnifiedSet) {
  // must have exactly 1 math
  const math = plan.filter((c) => c.category === CourseCategory.MATH);
  if (math.length !== 1) return false;

  // Determine required English for this grade
  const requiredEnglish = getRequiredEnglishForGrade(grade, completedUnifiedSet);

  // plan must contain exactly 1 English that matches the required English
  const eng = plan.filter((c) => c.category === CourseCategory.ENGLISH);
  if (eng.length !== 1) return false;

  const englishCourse = eng[0];

  // Modified comparison using unifyNonAPName
  if (unifyNonAPName(englishCourse.name).toLowerCase() !== unifyNonAPName(requiredEnglish).toLowerCase()) {
    return false;
  }

  return true;
}

// =========================================================================
// 9) SUMMARIES
// =========================================================================
function averageGPA(plan) {
  let sum = 0;
  let count = 0;
  for (const c of plan) {
    if (c.category !== CourseCategory.FREE_PERIOD) {
      sum += c.gpa;
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

function averageDifficulty(plan) {
  let sum = 0;
  let count = 0;
  for (const c of plan) {
    if (c.category !== CourseCategory.FREE_PERIOD) {
      sum += c.difficulty;
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

function getHighestGPAPlans(feasible) {
  let maxGPA = -1;
  for (const plan of feasible) {
    const g = averageGPA(plan);
    if (g > maxGPA) maxGPA = g;
  }
  return feasible.filter((p) => Math.abs(averageGPA(p) - maxGPA) < 1e-9);
}

function getEasiestPlans(feasible) {
  let minDiff = Infinity;
  for (const plan of feasible) {
    const d = averageDifficulty(plan);
    if (d < minDiff) minDiff = d;
  }
  return feasible.filter((p) => Math.abs(averageDifficulty(p) - minDiff) < 1e-9);
}

// For "Most Relevant," pick highest relevance in major per period
function getMostRelevantPlan(feasible, direction) {
  const periodSet = new Set();
  for (const plan of feasible) {
    plan.forEach((c) => periodSet.add(c.period));
  }
  const sortedPeriods = [...periodSet].sort((a, b) => a - b);

  const result = [];
  for (const p of sortedPeriods) {
    let cands = [];
    for (const plan of feasible) {
      const found = plan.filter((cc) => cc.period === p);
      cands.push(...found);
    }
    // Remove duplicates (based on unifiedName)
    const uniqueCandsMap = new Map();
    for (const c of cands) {
      if (!uniqueCandsMap.has(c.unifiedName)) {
        uniqueCandsMap.set(c.unifiedName, c);
      }
    }
    cands = Array.from(uniqueCandsMap.values());

    // Only include courses in the major
    cands = cands.filter((c) => isCourseInMajor(direction, c));
    if (cands.length === 0) {
      result.push({ period: p, courseNames: ["<<<FREE>>>"] });
      continue;
    }

    // Find courses with the highest relevance
    let maxRel = -1;
    for (const c of cands) {
      if (c.relevance > maxRel) maxRel = c.relevance;
    }
    const best = cands.filter((c) => Math.abs(c.relevance - maxRel) < 1e-9);
    const names = best.map((c) => c.name);
    result.push({ period: p, courseNames: names });
  }
  return result;
}

function isCourseInMajor(directionStr, c) {
  switch (directionStr) {
    case "STEM":
      return (
        c.category === CourseCategory.MATH ||
        c.category === CourseCategory.SCIENCE ||
        (c.category === CourseCategory.LIFE_CAREERS &&
          (c.name.includes("Computer") || c.name.includes("Programming")))
      );
    case "MEDICAL":
      if (c.category === CourseCategory.SCIENCE) return true;
      if (c.name.includes("Physiology") || c.name.includes("Psychology")) return true;
      return false;
    case "BUSINESS":
      if (c.category === CourseCategory.FINANCIAL) return true;
      if (
        c.name.includes("Business") ||
        c.name.includes("Marketing") ||
        c.name.includes("Economics")
      ) {
        return true;
      }
      return false;
    case "SOCIAL_SCIENCE":
      if (c.category === CourseCategory.SOCIAL_STUDIES) return true;
      if (
        c.name.includes("Sociology") ||
        c.name.includes("Anthropology") ||
        c.name.includes("Psychology")
      ) {
        return true;
      }
      return false;
    case "ENVIRONMENTAL":
      if (c.name.includes("Environmental")) return true;
      if (c.category === CourseCategory.SCIENCE && c.name.includes("Chemistry")) return true;
      return false;
    case "CS_DATA":
      if (
        c.category === CourseCategory.LIFE_CAREERS &&
        (c.name.includes("Computer") || c.name.includes("Web") || c.name.includes("Programming"))
      ) {
        return true;
      }
      if (
        c.category === CourseCategory.MATH &&
        (c.name.includes("Calculus") || c.name.includes("Statistics"))
      ) {
        return true;
      }
      return false;
    case "LANGUAGE_CULTURE":
      if (c.category === CourseCategory.WL) return true;
      if (c.category === CourseCategory.ENGLISH && c.name.includes("English")) return true;
      if (
        c.category === CourseCategory.SOCIAL_STUDIES &&
        (c.name.includes("History") || c.name.includes("Culture"))
      ) {
        return true;
      }
      return false;
    case "LAW_POLICY":
      if (
        c.category === CourseCategory.SOCIAL_STUDIES &&
        (c.name.includes("Government") || c.name.includes("Politics") || c.name.includes("History"))
      ) {
        return true;
      }
      if (c.name.includes("Economics") || c.name.includes("Law")) return true;
      return false;
    default:
      return false;
  }
}

// =========================================================================
// 10) PLANNING FUNCTIONS
// =========================================================================

// Convert plan => { mathEnglishCombo, periods: [ {period, courseNames[]} ] }
function transformPlanList(planList) {
  const out = [];
  for (const plan of planList) {
    // Find the single math & english
    const math = plan.find((c) => c.category === CourseCategory.MATH) || { name: "None" };
    const eng = plan.find((c) => c.category === CourseCategory.ENGLISH) || { name: "None" };
    const comboName = `${math.name} & ${eng.name}`;
    // Group by period
    const periodMap = {};
    for (const c of plan) {
      if (!periodMap[c.period]) {
        periodMap[c.period] = [];
      }
      periodMap[c.period].push(c.name);
    }
    const sortedPeriods = Object.keys(periodMap).map(Number).sort((a, b) => a - b);
    const periodOutputs = sortedPeriods.map((p) => ({
      period: p,
      courseNames: periodMap[p],
    }));
    out.push({
      mathEnglishCombo: comboName,
      periods: periodOutputs,
    });
  }
  return out;
}

// Merge multiple plan objects that share the same mathEnglishCombo
function mergePlansByPeriod(planJSON) {
  const map = new Map();
  for (const p of planJSON) {
    const key = p.mathEnglishCombo;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(p);
  }
  const merged = [];
  for (const [combo, arr] of map.entries()) {
    const periodMap = new Map();
    for (const item of arr) {
      for (const pr of item.periods) {
        if (!periodMap.has(pr.period)) {
          periodMap.set(pr.period, new Set());
        }
        pr.courseNames.forEach((cn) => periodMap.get(pr.period).add(cn));
      }
    }
    const sortedP = [...periodMap.keys()].sort((a, b) => a - b);
    const newPeriods = sortedP.map((pp) => ({
      period: pp,
      courseNames: [...periodMap.get(pp)].sort(),
    }));
    merged.push({
      mathEnglishCombo: combo,
      periods: newPeriods,
    });
  }
  return merged;
}

// =========================================================================
// 11) MAIN ENDPOINT: /api/curriculum/plan
// =========================================================================
app.post("/api/curriculum/plan", (req, res) => {
  const { grade, completedCourses, majorDirectionCode } = req.body;

  // Step 1: Unify completed courses
  const completedUnified = unifyCompletedCourses(completedCourses);
  const completedCourseObjs = ALL.filter((c) => completedUnified.includes(c.unifiedName));

  // Step 2: Update graduation requirements
  const reqs = new GraduationRequirements();
  reqs.updateRequirements(completedCourseObjs);

  // Step 3: Filter out courses based on completion, conflicts, prerequisites, etc.
  let filtered = filterCourses(ALL, new Set(completedUnified), grade || 9, reqs);

  // Step 4: Skip more PE courses if already completed 2+
  const userPECount = completedCourseObjs.filter((c) => c.category === CourseCategory.PE_HEALTH).length;
  const finalFiltered = filtered.filter((c) => {
    if (c.category === CourseCategory.PE_HEALTH) {
      return userPECount < 2;
    }
    return true;
  });

  // Step 5: Group courses by period
  const periodMap = {};
  for (const c of finalFiltered) {
    if (!periodMap[c.period]) {
      periodMap[c.period] = [];
    }
    periodMap[c.period].push(c);
  }

  // Step 6: Generate all possible plans
  const allPlans = generateAllPossiblePlans(periodMap);

  // Step 7: Filter feasible plans
  const feasible = [];
  for (const plan of allPlans) {
    if (isFeasible(plan, grade, new Set(completedUnified))) {
      feasible.push(plan);
    }
  }

  if (!feasible.length) {
    return res.json({
      highestGpaPlans: [],
      mostRelevantPlan: [],
      easiestPlans: [],
    });
  }

  // Step 8: Generate summaries
  const directionStr = fromCode(majorDirectionCode || 1);

  const highest = getHighestGPAPlans(feasible);
  const easiest = getEasiestPlans(feasible);
  const mr = getMostRelevantPlan(feasible, directionStr);

  // Step 9: Transform and merge plan lists
  const highestRaw = transformPlanList(highest);
  const highestGpaPlans = mergePlansByPeriod(highestRaw);

  const easiestRaw = transformPlanList(easiest);
  const easiestPlans = mergePlansByPeriod(easiestRaw);

  // Step 10: Respond with the summaries
  return res.json({
    highestGpaPlans,
    mostRelevantPlan: mr,
    easiestPlans,
  });
});

// =========================================================================
// 12) START SERVER
// =========================================================================
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});