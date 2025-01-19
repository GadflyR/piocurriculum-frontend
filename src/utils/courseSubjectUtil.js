// src/utils/courseSubjectUtil.js
export const coursesByLevel = {
    standard: [
      "Drawing & Painting",
      "Digital Media",
      "Sculpture & Ceramics",
      "Music",
      "Physical Education",
      "Public Speaking",
      "Astronomy",
      "Cultural Studies I",
      "Cultural Studies II",
      "National & International Current Affairs",
      "Public Speaking",
      "Broadcast Media Production",
      "Instrumental Music I / II",
      "Pencil and Ink Illustration / Drawing and Painting",
      "Principles of Engineering / Architectural CAD",
    ],
    collegePrep: [
      "Introduction to Literature",
      "World Literature",
      "American Literature",
      "British Literature",
      "CP Geometry",
      "CP Algebra I",
      "CP Algebra II",
      "PreCalculus, CP",
      "Calculus",
      "Statistics",
      "Biology",
      "Anatomy and Physiology",
      "Chemistry",
      "Organic Chemistry",
      "Forensic Science / Introduction to Organic Chemistry",
      "Environmental Science",
      "US History",
      "Sociology of the Future",
      "Modern World History",
      "Ancient World History",
      "Introduction to World Religions",
      "Computer Programming I / II",
      "Spanish I / Arabic I / Turkish I / Chinese I / French I",
      "CP Arabic II",
      "Turkish",
      "SAT Math",
      "SAT English",
      "Independent Online Courses with a Supervisor",
      "Essay Writing for Seniors",
      "Financial Literacy",
      "Cybersecurity",
      "Web Development I / II",
      "Dynamic Programming",
      "Principles of Business / Project Management",
      "Sociology / Anthropology",
      "Graphic Design",
    ],
    honors: [
      "Honors US History",
      "Honors World History",
      "Honors Chemistry",
      "Honors Physics",
      "Honors Algebra I",
      "Honors Algebra II",
      "Honors Precalculus",
      "Honors Calculus",
      "Honors American Literature",
      "Honors British Literature",
      "Honors World Literature",
      "Honors Spanish II",
      "Honors Spanish IV",
      "Honors Arabic III & IV",
      "Honors Probability & Statistics",
    ],
    ap: [
      "AP Computer Science Principles",
      "AP Computer Science A",
      "AP Human Geography",
      "AP Psychology",
      "AP US History",
      "AP European History",
      "AP World History",
      "AP Comparative Government and Politics",
      "AP US Government and Politics",
      "AP Biology",
      "AP Chemistry",
      "AP Physics 1",
      "AP Precalculus",
      "AP Calculus AB",
      "AP Calculus BC",
      "AP Statistics",
      "AP English Language and Composition",
      "AP Macroeconomics",
      "AP Microeconomics",
    ],
  };
  
  // Flatten everything into a single array:
  export const ALL_COURSES = [
    ...coursesByLevel.standard,
    ...coursesByLevel.collegePrep,
    ...coursesByLevel.honors,
    ...coursesByLevel.ap,
  ];
  
  /**
   * Simple function to guess the subject from a course name.
   * Customize as needed!
   */
  export function getSubject(course) {
    const lower = course.toLowerCase();
  
    if (lower.includes("english") || lower.includes("literature") || lower.includes("writing")) {
      return "English";
    }
    if (lower.includes("algebra") || lower.includes("geometry") || lower.includes("calculus") || lower.includes("statistics") || lower.includes("math") || lower.includes("precalculus")) {
      return "Math";
    }
    if (lower.includes("biology") || lower.includes("chemistry") || lower.includes("psychology") || lower.includes("physics") || lower.includes("science") || lower.includes("astronomy") || lower.includes("anatomy") || lower.includes("forensic") || lower.includes("environmental")) {
      return "Science";
    }
    if (lower.includes("history") || lower.includes("government") || lower.includes("geography") || lower.includes("national") || lower.includes("anthropology") || lower.includes("sociology") || lower.includes("world religions") || lower.includes("cultural")) {
      return "Social Studies";
    }
    if (lower.includes("spanish") || lower.includes("arabic") || lower.includes("turkish") || lower.includes("french") || lower.includes("chinese")) {
      return "World Language";
    }
    if (lower.includes("physical education") || lower.includes("pe") || lower.includes("drawing") || lower.includes("principles of engineering") || lower.includes("music") || lower.includes("art") || lower.includes("design") || lower.includes("public speaking") || lower.includes("broadcast") || lower.includes("digital") || lower.includes("sculpture") || lower.includes("ceramics")) {
      return "Arts/PE/Elective";
    }
    if (lower.includes("computer programming") || lower.includes("web development") || lower.includes("cybersecurity") || lower.includes("dynamic programming") || lower.includes("ap computer science")) {
      return "Computer/Tech";
    }
    if (lower.includes("financial") || lower.includes("business") || lower.includes("marketing") || lower.includes("economics") || lower.includes("accounting") || lower.includes("entrepreneurship")) {
      return "Business/Financial";
    }
  
    return "Other";
  }

  export function groupCoursesBySubject(courses) {
    const grouped = {};
    for (const c of courses) {
      const subject = getSubject(c);
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push(c);
    }
    return grouped;
  }
  