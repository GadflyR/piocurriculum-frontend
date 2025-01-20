// src/utils/groupCoursesBySubject.js

/**
 * Decide a subject for each course string.
 * Adjust as needed for your categories.
 */
function getSubject(course) {
    const lower = course.toLowerCase();
  
    if (
      lower.includes("english") ||
      lower.includes("literature") ||
      lower.includes("writing")
    ) {
      return "English";
    }
  
    if (
      lower.includes("algebra") ||
      lower.includes("geometry") ||
      lower.includes("calculus") ||
      lower.includes("statistics") ||
      lower.includes("math") ||
      lower.includes("precalculus")
    ) {
      return "Math";
    }
  
    if (
      lower.includes("biology") ||
      lower.includes("chemistry") ||
      lower.includes("psychology") ||
      lower.includes("physics") ||
      lower.includes("science") ||
      lower.includes("astronomy") ||
      lower.includes("anatomy") ||
      lower.includes("forensic") ||
      lower.includes("environmental")
    ) {
      return "Science";
    }
  
    if (
      lower.includes("history") ||
      lower.includes("government") ||
      lower.includes("geography") ||
      lower.includes("national") || // e.g. "National & International Current Affairs"
      lower.includes("anthropology") ||
      lower.includes("sociology") ||
      lower.includes("world religions") ||
      lower.includes("cultural")
    ) {
      return "Social Studies";
    }
  
    if (
      lower.includes("spanish") ||
      lower.includes("arabic") ||
      lower.includes("turkish") ||
      lower.includes("french") ||
      lower.includes("chinese")
    ) {
      return "World Language";
    }
  
    if (
      lower.includes("physical education") ||
      lower.includes("pe") ||
      lower.includes("drawing") ||
      lower.includes("principles of engineering") ||
      lower.includes("music") ||
      lower.includes("art") ||
      lower.includes("design") ||
      lower.includes("public speaking") ||
      lower.includes("broadcast") ||
      lower.includes("digital") ||
      lower.includes("sculpture") ||
      lower.includes("ceramics")
    ) {
      return "Arts/PE/Elective";
    }
  
    if (
      lower.includes("computer programming") ||
      lower.includes("web development") ||
      lower.includes("cybersecurity") ||
      lower.includes("dynamic programming") ||
      lower.includes("ap computer science")
    ) {
      return "Computer/Tech";
    }
  
    if (
      lower.includes("financial") ||
      lower.includes("business") ||
      lower.includes("marketing") ||
      lower.includes("economics") ||
      lower.includes("accounting") ||
      lower.includes("entrepreneurship")
    ) {
      return "Business/Financial";
    }
  
    return "Other";
  }
  
  /**
   * groupCoursesBySubject
   * If you want each course to appear only once
   * (even if it occurs in multiple periods),
   * we can remove duplicates using [...new Set(courses)].
   */
  export function groupCoursesBySubject(courses) {
    // Remove duplicates
    const uniqueCourseNames = [...new Set(courses)];
  
    // Build an object: { subjectName: [courseList] }
    const grouped = {};
  
    for (const course of uniqueCourseNames) {
      const subject = getSubject(course);
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push(course);
    }
  
    return grouped;
  }