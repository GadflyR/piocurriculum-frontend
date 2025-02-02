// js/app.js

const { useState, useEffect } = React;
const {
  Form,
  Row,
  Col,
  Button,
  ProgressBar,
  Card,
  Alert,
  Table,
  Accordion,
} = ReactBootstrap;

// --- Modified unifyNonAPName ---
// This version (used in the UI) now normalizes Algebra II variants.
function unifyNonAPName(name) {
  let n = name.trim();

  // Special handling for Algebra II variants: normalize both "Algebra II" and "Algebra 2, Honors" to "Algebra II"
  if (/^algebra\s+(ii|2)/i.test(n)) {
    return "Algebra II";
  }

  // If it's an AP course, return it as is.
  if (n.includes("AP ")) return n;

  // Remove extraneous markers.
  n = n.replace(/CP\/Honors/gi, "");
  n = n.replace(/,\s?CP/gi, "");
  n = n.replace(/,\s?Honors/gi, "");

  // If the course starts with "Honors " and is a precalculus variant, remove "Honors "
  n = n.replace(/^Honors\s+(Precalc(ulus)?)/i, "$1");
  return n.trim();
}

function getPeriodBgColor(period) {
  const colors = [
    "#fdfdfd",
    "#f8f9fa",
    "#f1f3f5",
    "#eceeef",
    "#e9ecef",
    "#e2e6ea",
    "#dee2e6",
    "#d6d8db",
  ];
  return colors[(period - 1) % colors.length] || "#f8f9fa";
}

const SUBJECT_LEVELS = {
  Math: {
    "Algebra I": 1,
    "Algebra II": 2, // now both Algebra II variants use the same level
    Geometry: 2,
    Precalculus: 3,
    Calculus: 4,
    "AP Statistics": 5,
    "AP Precalculus": 6,
    "AP Calculus AB": 7,
    "AP Calculus BC": 8,
    "Honors Probability & Statistics": 9,
    "SAT Math": 10,
  },
  English: {
    "English 9": 1,
    "English 10": 2,
    "English 11": 3,
    "English 12": 4,
    "AP English Language & Composition": 5,
  },
  Science: {
    Biology: 1,
    Chemistry: 2,
    Physics: 3,
    "AP Biology": 4,
    "AP Chemistry": 5,
    "AP Physics I": 6,
    "AP Environmental Science": 7,
    "Biology Honors": 2.5,
    "Chemistry Honors": 3.5,
  },
  SocialStudies: {
    "Financial Literacy": 1,
    "Intro to Business": 2,
    Marketing: 3,
    Economics: 4,
    "US History": 5,
    "Modern World History": 6,
  },
};

function groupCoursesBySubjectUnified(courses) {
  const subjectMap = {};
  for (const originalName of courses) {
    const unified = unifyNonAPName(originalName);
    const lower = unified.toLowerCase();
    let subject = "Other";
    if (
      lower.includes("cultural studies") ||
      lower.includes("current affairs") ||
      lower.includes("public speaking")
    ) {
      subject = "Social Studies";
    } else if (lower.includes("english")) {
      subject = "English";
    } else if (
      lower.includes("algebra") ||
      lower.includes("geometry") ||
      lower.includes("calculus") ||
      lower.includes("statistics") ||
      lower.includes("precalculus") ||
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
      lower.includes("social studies") ||
      lower.includes("financial") ||
      lower.includes("business") ||
      lower.includes("entrepreneurship") ||
      lower.includes("marketing") ||
      lower.includes("econ")
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
    if (!subjectMap[subject]) {
      subjectMap[subject] = new Set();
    }
    subjectMap[subject].add(unifyNonAPName(originalName));
  }
  const result = {};
  for (const subj in subjectMap) {
    result[subj] = Array.from(subjectMap[subj]);
  }
  return result;
}

function sortByLevel(subject, courses) {
  const levelMap = SUBJECT_LEVELS[subject.replace(/\s/g, "")] || {};
  return [...courses].sort((a, b) => {
    const levA = levelMap[a] ?? 9999;
    const levB = levelMap[b] ?? 9999;
    return levA === levB ? a.localeCompare(b) : levA - levB;
  });
}

function splitIntoThreeColumns(subject, courseList) {
  const col1 = []; // Non-AP
  const col2 = []; // AP
  const col3 = []; // Special (Honors, SAT, etc.)
  courseList.forEach((courseName) => {
    if (courseName.startsWith("AP ")) {
      col2.push(courseName);
    } else if (/honors|sat|probability|statistics/i.test(courseName) && !courseName.startsWith("AP ")) {
      col3.push(courseName);
    } else {
      col1.push(courseName);
    }
  });
  const sorted1 = sortByLevel(subject, col1);
  const sorted2 = sortByLevel(subject, col2);
  const sorted3 = sortByLevel(subject, col3);
  return { col1: sorted1, col2: sorted2, col3: sorted3 };
}

const SUBJECT_ORDER = [
  "English",
  "Math",
  "Science",
  "Social Studies",
  "Computer/Tech",
  "World Language",
  "Arts/PE/Elective",
  "Other",
];

const CurriculumForm = () => {
  const [grade, setGrade] = useState(9);
  const [majorDirection, setMajorDirection] = useState(1);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [coursesBySubject, setCoursesBySubject] = useState({});

  useEffect(() => {
    const grouped = groupCoursesBySubjectUnified(ALL_COURSES);
    setCoursesBySubject(grouped);
  }, []);

  const handleCourseToggle = (unifiedName) => {
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

    try {
      const payload = {
        grade: parseInt(grade, 10),
        completedCourses,
        majorDirectionCode: parseInt(majorDirection, 10),
      };
      const data = await CurriculumService.generatePlan(payload);
      setResult(data);
    } catch (err) {
      console.error("Error generating plan:", err);
      setError("Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container p-4" style={{ backgroundColor: "#fdfdfd" }}>
      <h2 className="mb-4">Curriculum Planner</h2>
      <Form onSubmit={handleSubmit} className="mb-4">
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
        <p className="mb-4">
          Check the boxes for any courses you've already taken. Expand a subject's panel to see Non-AP, AP, and Special columns, or just one column for World Language, Arts/PE/Elective, and Other.
        </p>
        <Button type="submit" variant="primary" disabled={isLoading}>
          Generate Plan
        </Button>
      </Form>
      {isLoading && (
        <div className="my-3">
          <ProgressBar animated now={100} label="Generating..." />
        </div>
      )}
      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}
      <Accordion flush className="mb-5">
        {SUBJECT_ORDER.map((subj, idx) => {
          const courseArray = coursesBySubject[subj] || [];
          if (!courseArray.length) return null;
          return (
            <Accordion.Item eventKey={`${idx}`} key={subj}>
              <Accordion.Header>{subj}</Accordion.Header>
              <Accordion.Body>
                {(subj === "World Language" ||
                  subj === "Arts/PE/Elective" ||
                  subj === "Other") ? (
                  (() => {
                    const sortedSingleColumn = sortByLevel(subj, courseArray);
                    return (
                      <Table bordered hover responsive className="mb-3">
                        <thead>
                          <tr>
                            <th>Courses</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedSingleColumn.map((courseName, idx2) => (
                            <tr key={idx2}>
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  label={courseName}
                                  checked={completedCourses.includes(courseName)}
                                  onChange={() =>
                                    handleCourseToggle(courseName)
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    );
                  })()
                ) : (
                  (() => {
                    const { col1, col2, col3 } = splitIntoThreeColumns(subj, courseArray);
                    const rowCount = Math.max(col1.length, col2.length, col3.length);
                    return (
                      <Table bordered hover responsive className="mb-3">
                        <thead>
                          <tr>
                            <th>Non-AP</th>
                            <th>AP</th>
                            <th>Special</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: rowCount }).map((_, rowIndex) => {
                            const c1 = col1[rowIndex] || null;
                            const c2 = col2[rowIndex] || null;
                            const c3 = col3[rowIndex] || null;
                            return (
                              <tr key={rowIndex}>
                                <td>
                                  {c1 && (
                                    <Form.Check
                                      type="checkbox"
                                      label={c1}
                                      checked={completedCourses.includes(c1)}
                                      onChange={() => handleCourseToggle(c1)}
                                    />
                                  )}
                                </td>
                                <td>
                                  {c2 && (
                                    <Form.Check
                                      type="checkbox"
                                      label={c2}
                                      checked={completedCourses.includes(c2)}
                                      onChange={() => handleCourseToggle(c2)}
                                    />
                                  )}
                                </td>
                                <td>
                                  {c3 && (
                                    <Form.Check
                                      type="checkbox"
                                      label={c3}
                                      checked={completedCourses.includes(c3)}
                                      onChange={() => handleCourseToggle(c3)}
                                    />
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    );
                  })()
                )}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
      {result && !isLoading && (
        <div className="mt-5">
          <h3 className="mb-4">Results</h3>
          <div className="mb-5">
            <h4>Highest GPA Plans</h4>
            {result && result.highestGpaPlans && result.highestGpaPlans.length > 0 ? (
              result.highestGpaPlans.map((plan, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Header>
                    <strong>{plan.mathEnglishCombo}</strong>
                  </Card.Header>
                  <Card.Body>
                    {plan.periods.map((p) => (
                      <div
                        key={p.period}
                        className="mb-3 p-3 rounded"
                        style={{ backgroundColor: getPeriodBgColor(p.period) }}
                      >
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

          <div className="mb-5">
            <h4>Most Relevant Plan</h4>
            {result && result.mostRelevantPlan && result.mostRelevantPlan.length > 0 ? (
              <Card className="mb-3">
                <Card.Header>Most Relevant</Card.Header>
                <Card.Body>
                  {result.mostRelevantPlan.map((p, idx) => (
                    <div
                      key={idx}
                      className="mb-3 p-3 rounded"
                      style={{ backgroundColor: getPeriodBgColor(p.period) }}
                    >
                      <strong>Period {p.period}:</strong> {p.courseNames.join(", ")}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            ) : (
              <p>No most relevant plan found.</p>
            )}
          </div>

          <div className="mb-5">
            <h4>Easiest Plans</h4>
            {result && result.easiestPlans && result.easiestPlans.length > 0 ? (
              result.easiestPlans.map((plan, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Header>
                    <strong>{plan.mathEnglishCombo}</strong>
                  </Card.Header>
                  <Card.Body>
                    {plan.periods.map((p) => (
                      <div
                        key={p.period}
                        className="mb-3 p-3 rounded"
                        style={{ backgroundColor: getPeriodBgColor(p.period) }}
                      >
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

ReactDOM.render(<CurriculumForm />, document.getElementById("root"));
