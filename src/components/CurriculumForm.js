import React, { useState, useEffect } from "react";
import { Accordion, Form, Row, Col, Button, ProgressBar, Card, Alert } from "react-bootstrap";
import { generatePlan } from "../services/curriculumService";
import { ALL_COURSES } from "../utils/courseData";

// Utility function to unify CP/Honors in names, leaving AP courses alone.
function unifyNonAPName(name) {
  if (name.includes("AP ")) return name.trim();
  return name
    .replace("CP/Honors", "")
    .replace(", CP", "")
    .replace(", Honors", "")
    .trim();
}

/**
 * This function groups the unified course names by subject, searching
 * for keywords in the course name (e.g. "biology", "history", "spanish", etc.)
 * so that we can classify them under:
 * - English
 * - Math
 * - Science
 * - Social Studies
 * - World Language
 * - Computer/Tech
 * - Business/Financial
 * - Arts/PE/Elective
 * - Other
 */
function groupCoursesBySubjectUnified(courses) {
  const subjectMap = {};

  for (const originalName of courses) {
    // unify CP/Honors for display
    const unified = unifyNonAPName(originalName);
    const lower = unified.toLowerCase();

    // Default to "Other," then refine based on keywords
    let subject = "Other";

    if (lower.includes("english")) {
      subject = "English";
    } else if (
      lower.includes("algebra") ||
      lower.includes("geometry") ||
      lower.includes("calculus") ||
      lower.includes("statistics") ||
      lower.includes("precalculus") ||
      lower.includes("pre calculus") ||
      lower.includes("sat math")
    ) {
      subject = "Math";
    } else if (
      lower.includes("biology") ||
      lower.includes("chemistry") ||
      lower.includes("physics") ||
      lower.includes("anatomy") ||
      lower.includes("environmental") ||
      lower.includes("forensic") ||
      lower.includes("organic chemistry")
    ) {
      subject = "Science";
    } else if (
      lower.includes("history") ||
      lower.includes("government") ||
      lower.includes("politics") ||
      lower.includes("sociology") ||
      lower.includes("anthropology") ||
      lower.includes("psychology") ||
      lower.includes("world religions") ||
      lower.includes("mythology") ||
      lower.includes("global issues") ||
      lower.includes("social studies")
    ) {
      subject = "Social Studies";
    } else if (
      lower.includes("spanish") ||
      lower.includes("arabic") ||
      lower.includes("turkish") ||
      lower.includes("french") ||
      lower.includes("chinese")
    ) {
      subject = "World Language";
    } else if (
      lower.includes("computer") ||
      lower.includes("web") ||
      lower.includes("cybersecurity") ||
      lower.includes("programming") ||
      lower.includes("graphic design") ||
      lower.includes("dynamic programming") ||
      lower.includes("tech") ||
      lower.includes("engineering") ||
      lower.includes("architectural cad")
    ) {
      subject = "Computer/Tech";
    } else if (
      lower.includes("financial") ||
      lower.includes("business") ||
      lower.includes("entrepreneurship") ||
      lower.includes("marketing") ||
      lower.includes("econ") // for "economics"
    ) {
      subject = "Business/Financial";
    } else if (
      lower.includes("pe/health") ||
      lower.includes("music") ||
      lower.includes("pencil and ink") ||
      lower.includes("drawing and painting") ||
      lower.includes("art") ||
      lower.includes("vpa") ||
      lower.includes("instrumental") ||
      lower.includes("illustration") ||
      lower.includes("theater") ||
      lower.includes("dance") ||
      lower.includes("animation")
    ) {
      subject = "Arts/PE/Elective";
    }

    // Create a set for the subject if it doesn't exist
    if (!subjectMap[subject]) {
      subjectMap[subject] = new Set();
    }
    // Store the unified name (to avoid duplicates)
    subjectMap[subject].add(unified);
  }

  // Convert each set to a sorted array
  const result = {};
  for (const subj in subjectMap) {
    result[subj] = Array.from(subjectMap[subj]).sort();
  }
  return result;
}

// We define the subject order for the UI – the headings in the Accordion
const SUBJECT_ORDER = [
  "English",
  "Math",
  "Science",
  "Social Studies",
  "World Language",
  "Computer/Tech",
  "Business/Financial",
  "Arts/PE/Elective",
  "Other",
];

const CurriculumForm = () => {
  const [grade, setGrade] = useState(9);
  const [majorDirection, setMajorDirection] = useState(1);
  // Here we store "unified" names in completedCourses
  const [completedCourses, setCompletedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // This object maps subjects ("Math", "Science") to arrays of unified course names
  const [coursesBySubject, setCoursesBySubject] = useState({});

  // On mount, group all your course names (ALL_COURSES) by subject
  useEffect(() => {
    const grouped = groupCoursesBySubjectUnified(ALL_COURSES);
    setCoursesBySubject(grouped);
  }, []);

  // Toggle a course in the completedCourses array
  const handleCourseToggle = (unifiedName) => {
    setCompletedCourses((prev) =>
      prev.includes(unifiedName)
        ? prev.filter((c) => c !== unifiedName)
        : [...prev, unifiedName]
    );
  };

  // Handle form submission to generate the plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    const payload = {
      grade: parseInt(grade, 10),
      completedCourses: completedCourses, // we pass the unified names
      majorDirectionCode: parseInt(majorDirection, 10),
    };

    try {
      const data = await generatePlan(payload);
      setResult(data);
    } catch (err) {
      console.error("Error generating plan:", err);
      setError("Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Curriculum Planner</h2>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="gradeSelect">
              <Form.Label>Student Grade</Form.Label>
              <Form.Select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="majorDirectionSelect">
              <Form.Label>Major Direction</Form.Label>
              <Form.Select
                value={majorDirection}
                onChange={(e) => setMajorDirection(e.target.value)}
              >
                <option value="1">1 - STEM</option>
                <option value="2">2 - MEDICAL</option>
                <option value="3">3 - BUSINESS</option>
                <option value="4">4 - SOCIAL_SCIENCE</option>
                <option value="5">5 - ENVIRONMENTAL</option>
                <option value="6">6 - CS_DATA</option>
                <option value="7">7 - LANGUAGE_CULTURE</option>
                <option value="8">8 - LAW_POLICY</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="mb-3">
          <p>
            Please select any courses you've taken in the past. CP/Honors courses
            are merged into a single label (e.g., "English 9"). AP courses remain
            labeled as "AP ...".
          </p>
        </div>

        <Accordion alwaysOpen className="mb-3">
          {SUBJECT_ORDER.map((subj, index) => {
            const coursesInThisSubject = coursesBySubject[subj] || [];
            if (!coursesInThisSubject.length) return null;

            return (
              <Accordion.Item eventKey={String(index)} key={subj}>
                <Accordion.Header>{subj}</Accordion.Header>
                <Accordion.Body>
                  {coursesInThisSubject.map((unifiedName) => (
                    <Form.Check
                      key={unifiedName}
                      type="checkbox"
                      label={unifiedName}
                      checked={completedCourses.includes(unifiedName)}
                      onChange={() => handleCourseToggle(unifiedName)}
                      className="mb-2"
                    />
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>

        <Button type="submit" variant="primary" disabled={isLoading}>
          Generate Plan
        </Button>
      </Form>

      {isLoading && (
        <div className="mt-3">
          <ProgressBar animated now={100} label="Generating..." />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {result && !isLoading && (
        <div className="mt-5">
          <h3>Results</h3>

          {/* Highest GPA Plans */}
          <div className="mb-4">
            <h4>Highest GPA Plans</h4>
            {result.highestGpaPlans?.length ? (
              result.highestGpaPlans.map((plan, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Header>
                    <strong>{plan.mathEnglishCombo}</strong>
                  </Card.Header>
                  <Card.Body>
                    {plan.periods.map((p) => (
                      <div key={p.period} className="mb-2">
                        <strong>Period {p.period}:</strong> {p.courseNames.join(", ")}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No highest GPA plan found.</p>
            )}
          </div>

          {/* Most Relevant Plan */}
          <div className="mb-4">
            <h4>Most Relevant Plan</h4>
            {result.mostRelevantPlan?.length ? (
              <Card className="mb-3">
                <Card.Header>Most Relevant</Card.Header>
                <Card.Body>
                  {result.mostRelevantPlan.map((p, idx) => (
                    <div key={idx} className="mb-2">
                      <strong>Period {p.period}:</strong> {p.courseNames.join(", ")}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            ) : (
              <p>No most relevant plan found.</p>
            )}
          </div>

          {/* Easiest Plans */}
          <div className="mb-4">
            <h4>Easiest Plans</h4>
            {result.easiestPlans?.length ? (
              result.easiestPlans.map((plan, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Header>
                    <strong>{plan.mathEnglishCombo}</strong>
                  </Card.Header>
                  <Card.Body>
                    {plan.periods.map((p) => (
                      <div key={p.period} className="mb-2">
                        <strong>Period {p.period}:</strong> {p.courseNames.join(", ")}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No easiest plan found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumForm;