// src/components/CurriculumForm.js
import React, { useState, useEffect } from "react";
import { Accordion, Form, Row, Col, Button, ProgressBar, Card, Alert } from "react-bootstrap";
import { generatePlan } from "../services/curriculumService.js";
import { groupCoursesBySubject } from "../utils/groupCoursesBySubject.js";
import { ALL_COURSES } from "../utils/courseData.js";

const MAJOR_DIRECTIONS = [
  { code: 1, label: "STEM" },
  { code: 2, label: "MEDICAL" },
  { code: 3, label: "BUSINESS" },
  { code: 4, label: "SOCIAL_SCIENCE" },
  { code: 5, label: "ENVIRONMENTAL" },
  { code: 6, label: "CS_DATA" },
  { code: 7, label: "LANGUAGE_CULTURE" },
  { code: 8, label: "LAW_POLICY" },
];

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

// Subtle color for each period (optional).
const PERIOD_COLORS = {
  1: "#f9f9f9",
  2: "#f2f2f2",
  3: "#efefef",
  4: "#eaeaea",
  5: "#e5e5e5",
  6: "#e0e0e0",
  7: "#dbdbdb",
  8: "#d6d6d6",
};

const CurriculumForm = () => {
  const [grade, setGrade] = useState(9);
  const [majorDirection, setMajorDirection] = useState(1);
  const [completedCourses, setCompletedCourses] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // New state for errors

  const [coursesBySubject, setCoursesBySubject] = useState({});

  useEffect(() => {
    const grouped = groupCoursesBySubject(ALL_COURSES);
    setCoursesBySubject(grouped);
    console.log("Courses grouped by subject:", grouped); // Debugging
  }, []);

  const handleCourseToggle = (courseName) => {
    setCompletedCourses((prev) =>
      prev.includes(courseName)
        ? prev.filter((c) => c !== courseName)
        : [...prev, courseName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null); // Reset error state

    try {
      const payload = {
        grade: parseInt(grade, 10),
        completedCourses,
        majorDirectionCode: parseInt(majorDirection, 10),
      };
      console.log("Sending payload:", payload); // Debugging

      const data = await generatePlan(payload);
      console.log("Received plan data:", data); // Debugging

      setResult(data);
    } catch (error) {
      console.error("Error generating plan:", error);
      setError("Failed to generate plan. Please try again."); // Set user-friendly error
    } finally {
      setIsLoading(false);
    }
  };

  const getPeriodColor = (period) => {
    return PERIOD_COLORS[period] || "#f7f7f7";
  };

  return (
    <div className="container mt-4" style={{ fontSize: "1.02rem" }}>
      <h2 className="mb-3">Curriculum Planner</h2>

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
                {MAJOR_DIRECTIONS.map((dir) => (
                  <option key={dir.code} value={dir.code}>
                    {dir.code} - {dir.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Accordion alwaysOpen className="mb-3">
          {SUBJECT_ORDER.map((subj, index) => {
            const coursesInSubject = coursesBySubject[subj] || [];
            if (!coursesInSubject.length) return null;
            return (
              <Accordion.Item eventKey={String(index)} key={subj}>
                <Accordion.Header>{subj}</Accordion.Header>
                <Accordion.Body>
                  {coursesInSubject.map((course) => (
                    <Form.Check
                      key={course}
                      type="checkbox"
                      label={course}
                      checked={completedCourses.includes(course)}
                      onChange={() => handleCourseToggle(course)}
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
            <h4 style={{ fontSize: "1.15rem" }}>Highest GPA Plans</h4>
            {result.highestGpaPlans?.length ? (
              result.highestGpaPlans.map((plan, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Header style={{ backgroundColor: "#fafafa" }}>
                    <strong>Math &amp; English combo:</strong>{" "}
                    {plan.mathEnglishCombo}
                  </Card.Header>
                  <Card.Body>
                    {plan.periods.map((p) => (
                      <div
                        key={p.period}
                        style={{
                          backgroundColor: getPeriodColor(p.period),
                          padding: "0.5rem",
                          marginBottom: "0.5rem",
                          borderRadius: "3px",
                        }}
                      >
                        <strong>Period {p.period}:</strong>{" "}
                        {p.courseNames.join(", ")}
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
            <h4 style={{ fontSize: "1.15rem" }}>Most Relevant Plan (by period)</h4>
            {result.mostRelevantPlan?.length ? (
              result.mostRelevantPlan.map((p, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Header style={{ backgroundColor: "#fafafa" }}>
                    <strong>Most Relevant Courses</strong>
                  </Card.Header>
                  <Card.Body>
                    {p.courseNames.map((course, courseIdx) => (
                      <div
                        key={courseIdx}
                        style={{
                          backgroundColor: getPeriodColor(p.period),
                          padding: "0.5rem",
                          marginBottom: "0.5rem",
                          borderRadius: "3px",
                        }}
                      >
                        <strong>Period {p.period}:</strong> {course}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No most relevant plan found.</p>
            )}
          </div>

          {/* Easiest Plans */}
          <div className="mb-4">
            <h4 style={{ fontSize: "1.15rem" }}>Easiest Plans</h4>
            {result.easiestPlans?.length ? (
              result.easiestPlans.map((plan, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Header style={{ backgroundColor: "#fafafa" }}>
                    <strong>Math &amp; English combo:</strong>{" "}
                    {plan.mathEnglishCombo}
                  </Card.Header>
                  <Card.Body>
                    {plan.periods.map((p) => (
                      <div
                        key={p.period}
                        style={{
                          backgroundColor: getPeriodColor(p.period),
                          padding: "0.5rem",
                          marginBottom: "0.5rem",
                          borderRadius: "3px",
                        }}
                      >
                        <strong>Period {p.period}:</strong>{" "}
                        {p.courseNames.join(", ")}
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
