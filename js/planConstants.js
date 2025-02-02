// js/planConstants.js

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
    case 1:
      return "STEM";
    case 2:
      return "MEDICAL";
    case 3:
      return "BUSINESS";
    case 4:
      return "SOCIAL_SCIENCE";
    case 5:
      return "ENVIRONMENTAL";
    case 6:
      return "CS_DATA";
    case 7:
      return "LANGUAGE_CULTURE";
    case 8:
      return "LAW_POLICY";
    default:
      return "STEM";
  }
}

// --- Modified unifyNonAPName ---
// This function now checks for Algebra II variants and always returns "Algebra II".
function unifyNonAPName(originalName) {
  let name = originalName.trim();

  // Special handling for Algebra II variants:
  // Matches "Algebra II" or "Algebra 2" (with or without extra markers)
  if (/^algebra\s+(ii|2)/i.test(name)) {
    return "Algebra II";
  }

  // If it's an AP course, return it as is.
  if (name.includes("AP ")) return name;

  // For courses mentioning "precalculus", remove any ", CP" marker and a leading "Honors " (if any)
  if (name.toLowerCase().includes("precalculus")) {
    name = name.replace(/,?\s*CP/gi, ""); // removes e.g. ", CP"
    name = name.replace(/^Honors\s+/i, ""); // removes a starting "Honors "
    return name.trim();
  }

  // For other courses, remove extraneous markers.
  return name.replace("CP/Honors", "").replace(", CP", "").replace(", Honors", "").trim();
}

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
};

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
    lower.includes("econ")
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

// Raw maps for course levels and prerequisites
const rawCourseLevelMap = new Map([
  // MATH courses
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
  ["AP Statistics", 7],
  ["SAT Math (Fall)/SAT Math (Spring)", 4],
  // SCIENCE courses
  ["Biology, CP", 3],
  ["Biology, Honors", 3],
  ["AP Biology", 4],
  ["Chemistry, CP", 3],
  ["Chemistry, Honors", 3],
  ["AP Chemistry", 4],
  ["Physics, CP/Honors", 3],
  ["AP Physics I", 4],
  // Languages and others
  [
    "Spanish I /Arabic I /Turkish I / Chinese I / French I (Independent Study with a Supervisor)",
    1,
  ],
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
  ["Honors Probability & Statistics", 5],
]);

const rawPrereqMap = new Map([
  // MATH prerequisites
  ["Geometry, CP", ["Algebra I"]],
  ["Geometry, Honors", ["Algebra I"]],
  ["Algebra II", ["Algebra I"]],
  ["Algebra 2, Honors", ["Algebra I"]],
  // Both prerequisites will be unified to "Algebra II" by our updated function.
  ["Precalculus, CP", ["Algebra II", "Algebra 2, Honors"]],
  ["Honors Precalculus", ["Algebra II", "Algebra 2, Honors"]],
  ["AP Precalculus", ["Algebra II", "Algebra 2, Honors"]],
  ["Calculus", ["Precalculus, CP", "Honors Precalculus", "AP Precalculus"]],
  ["AP Calculus AB", ["Precalculus, CP", "Honors Precalculus", "AP Precalculus"]],
  [
    "AP Calculus BC",
    ["Precalculus, CP", "Honors Precalculus", "AP Precalculus", "AP Calculus AB"],
  ],
  ["AP Statistics", ["AP Calculus BC"]],
  // SCIENCE prerequisites
  ["AP Biology", ["Biology, CP", "Biology, Honors"]],
  ["AP Chemistry", ["Chemistry, CP", "Chemistry, Honors"]],
  ["AP Physics I", ["Physics, CP/Honors"]],
  ["AP Environmental Science", ["Biology, CP", "Chemistry, CP"]],
  // CS prerequisites
  [
    "AP Computer Science A",
    ["Computer Programming I (Fall) / Computer Programming II (Spring)"],
  ],
  [
    "AP Computer Science Principles",
    ["Computer Programming I (Fall) / Computer Programming II (Spring)"],
  ],
  // History prerequisites
  ["AP US History", ["US History, CP", "US History, Honors"]],
  // Language prerequisites
  ["Spanish II, Honors", ["Spanish I"]],
  ["Spanish III, Honors", ["Spanish II, Honors"]],
  ["Spanish IV, Honors", ["Spanish III, Honors"]],
  ["Arabic II, CP", ["Arabic I"]],
  ["Arabic III & IV, Honors", ["Arabic II, CP"]],
]);
