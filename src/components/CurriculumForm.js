import React, { useState, useEffect } from "react";
import { Accordion, Form, Row, Col, Button, ProgressBar, Card, Alert } from "react-bootstrap";
import { generatePlan } from "../services/curriculumService";
import { ALL_COURSES } from "../utils/courseData";

// Utility to unify "CP/Honors"
function unifyNonAPName(name) {
  if (name.includes("AP ")) return name.trim();
  return name
    .replace("CP/Honors", "")
    .replace(", CP", "")
    .replace(", Honors", "")
    .trim();
}

// Group courses by subject: we store them in a map, but unify CP/Honors keys
function groupCoursesBySubjectUnified(courses) {
  const subjectMap = {};
  for (const c of courses) {
    // c is presumably the raw original name from your data
    // unify it
    const unified = unifyNonAPName(c);
    // then figure out subject
    // For simplicity, let's guess subject by partial keywords
    let subject = "Other";
    if (unified.toLowerCase().includes("english")) subject = "English";
    else if (unified.toLowerCase().includes("algebra") || unified.toLowerCase().includes("geometry") || unified.toLowerCase().includes("calculus")) {
      subject = "Math";
    }
    // etc. (Fill in your logic)
    if (!subjectMap[subject]) {
      subjectMap[subject] = new Set();
    }
    // store the unified name in that set
    subjectMap[subject].add(unified);
  }
  // convert each set to sorted array
  const result = {};
  for (const subj in subjectMap) {
    result[subj] = Array.from(subjectMap[subj]).sort();
  }
  return result;
}

// We define the subject order for the UI
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

  const [coursesBySubject, setCoursesBySubject] = useState({});

  useEffect(() => {
    // Suppose ALL_COURSES is your array of original course names:
    // e.g. ["English 9, CP", "English 9, Honors", "AP English Lit", ...]
    // We'll unify them for display so CP/Honors appear as a single checkbox.
    const grouped = groupCoursesBySubjectUnified(ALL_COURSES);
    setCoursesBySubject(grouped);
  }, []);

  const handleCourseToggle = (unifiedName) => {
    // If user toggles "English 9," we store "English 9" in completedCourses
    setCompletedCourses((prev) =>
      prev.includes(unifiedName)
        ? prev.filter((c) => c !== unifiedName)
        : [...prev, unifiedName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    const payload = {
      grade: parseInt(grade, 10),
      // We directly send the unified names to the backend
      // The backend's unifyCompletedCourses() won't break anything,
      // but it effectively sees them as already unified.
      completedCourses: completedCourses,
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
            Please select any courses you've taken in the past. Honors/CP are
            merged into one label (e.g., "English 9").
          </p>
        </div>

        <Accordion alwaysOpen className="mb-3">
          {SUBJECT_ORDER.map((subj, idx) => {
            const unifiedArray = coursesBySubject[subj] || [];
            if (!unifiedArray.length) return null;

            return (
              <Accordion.Item eventKey={String(idx)} key={subj}>
                <Accordion.Header>{subj}</Accordion.Header>
                <Accordion.Body>
                  {unifiedArray.map((unifiedName) => (
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
          {/* Example output for highest/easiest/most relevant */}
          <div className="mb-4">
            <h4>Highest GPA Plans</h4>
            {result.highestGpaPlans?.length ? (
              result.highestGpaPlans.map((plan, i) => (
                <Card key={i} className="mb-3">
                  <Card.Header>
                    <strong>{plan.mathEnglishCombo}</strong>
                  </Card.Header>
                  <Card.Body>
                    {plan.periods.map((p) => (
                      <div key={p.period}>
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

          <div className="mb-4">
            <h4>Most Relevant Plan</h4>
            {result.mostRelevantPlan?.length ? (
              <Card>
                <Card.Header>Most Relevant</Card.Header>
                <Card.Body>
                  {result.mostRelevantPlan.map((r, idx) => (
                    <p key={idx}>
                      <strong>Period {r.period}:</strong> {r.courseNames.join(", ")}
                    </p>
                  ))}
                </Card.Body>
              </Card>
            ) : (
              <p>No most relevant plan found.</p>
            )}
          </div>

          <div className="mb-4">
            <h4>Easiest Plans</h4>
            {result.easiestPlans?.length ? (
              result.easiestPlans.map((plan, i) => (
                <Card key={i} className="mb-3">
                  <Card.Header>
                    <strong>{plan.mathEnglishCombo}</strong>
                  </Card.Header>
                  <Card.Body>
                    {plan.periods.map((p) => (
                      <div key={p.period}>
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