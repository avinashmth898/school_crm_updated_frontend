import "./ReportCardTools.css";
import { useEffect, useRef, useState } from "react";
import apiClient from "../../../services/apiClient";
import { getExamsForClass, generateReportCards, saveReportCardNote } from "../../../services/reportCardService";
import { getSchoolInfo } from "../../../services/schoolInfoService";

const DISPLAY_MODES = [
  { key: "both", label: "Marks + Grade" },
  { key: "marks", label: "Marks only" },
  { key: "grade", label: "Grade only" },
];

const LAYOUTS = [
  { key: "detailed", label: "Detailed" },
  { key: "compact", label: "Compact" },
];

const REPORT_MODES = [
  { key: "session", label: "Per Session" },
  { key: "exam", label: "Per Exam" },
];

const noteKey = (classId, regNo) => `${classId}:${regNo}`;

// Report card builder: pick one or more classes, pick which exam(s) feed
// the report (the same exam selection applies to every class picked —
// Per Session weights several exams, Per Exam uses just one at 100%),
// generate a ranked list per class, then print or download every student
// across every selected class in one batch — marks and grade can be
// shown independently.
export default function ReportCardPage() {
  const [classes, setClasses] = useState([]);
  const [classIds, setClassIds] = useState([]); // array of selected class id strings

  const [reportMode, setReportMode] = useState("session"); // "session" | "exam"
  const [examsForClass, setExamsForClass] = useState([]); // intersection across selected classes
  const [examWeights, setExamWeights] = useState({}); // examId -> { checked, weight }
  const [singleExamId, setSingleExamId] = useState(""); // used in "exam" mode only
  const [displayMode, setDisplayMode] = useState("both");
  const [layout, setLayout] = useState("detailed");

  const [reports, setReports] = useState(null); // array of { classId, className, data }
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState(null);

  // "classId:regNo" -> { remarks, attendedDays, totalDays } — seeded from
  // the generated reports (which already carry whatever was last saved),
  // but editable here and saved independently of regenerating.
  const [notesDraft, setNotesDraft] = useState({});
  const [savingNote, setSavingNote] = useState(null);

  const [schoolInfo, setSchoolInfo] = useState(null);
  const [printMode, setPrintMode] = useState(null); // null | "single" | "all"
  const [printTarget, setPrintTarget] = useState(null); // { classId, regNo } for "single"
  const [pdfBusy, setPdfBusy] = useState(false);

  const printRef = useRef(null);

  useEffect(() => {
    apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
    getSchoolInfo().then(res => setSchoolInfo(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setExamWeights({});
    setSingleExamId("");
    setReports(null);
    setStatus(null);
    if (classIds.length === 0) { setExamsForClass([]); return; }

    Promise.all(classIds.map(id => getExamsForClass(id).then(res => res.data || [])))
      .then(lists => {
        // Only exams configured for every selected class are valid to pick
        // from — a single weight/exam selection has to apply to all of them.
        const [first, ...rest] = lists;
        const intersection = (first || []).filter(ex =>
          rest.every(list => list.some(e => e.examId === ex.examId)));
        setExamsForClass(intersection);
      })
      .catch(err => {
        console.error(err);
        setExamsForClass([]);
        setStatus({
          type: "error",
          text: err?.response?.data?.message
            || `Could not load exams for these classes (${err?.response?.status || "network error"}). Check that the backend is running the latest code.`,
        });
      });
  }, [classIds.join(",")]);

  useEffect(() => {
    setExamWeights({});
    setSingleExamId("");
    setReports(null);
    setStatus(null);
  }, [reportMode]);

  useEffect(() => {
    if (!printMode) return;
    const handleAfterPrint = () => setPrintMode(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [printMode]);

  const toggleClass = (id) => {
    setClassIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllClasses = () => {
    setClassIds(prev => prev.length === classes.length ? [] : classes.map(c => String(c.id)));
  };

  const toggleExam = (examId) => {
    setExamWeights(prev => {
      if (prev[examId]?.checked) {
        const next = { ...prev };
        delete next[examId];
        return next;
      }
      return { ...prev, [examId]: { checked: true, weight: "" } };
    });
  };

  const setWeight = (examId, weight) => {
    setExamWeights(prev => ({ ...prev, [examId]: { ...prev[examId], weight } }));
  };

  const selectedExamIds = Object.keys(examWeights).filter(id => examWeights[id]?.checked);
  const totalWeight = selectedExamIds.reduce((sum, id) => sum + (Number(examWeights[id]?.weight) || 0), 0);
  const weightRounded = Math.round(totalWeight * 100) / 100;

  const handleGenerate = async () => {
    if (classIds.length === 0) {
      setStatus({ type: "error", text: "Select at least one class." });
      return;
    }

    let examWeightsPayload;

    if (reportMode === "exam") {
      if (!singleExamId) {
        setStatus({ type: "error", text: "Select an exam." });
        return;
      }
      examWeightsPayload = [{ examId: Number(singleExamId), weightagePercent: 100 }];
    } else {
      if (selectedExamIds.length === 0) {
        setStatus({ type: "error", text: "Select at least one exam." });
        return;
      }
      if (Math.abs(totalWeight - 100) > 0.5) {
        setStatus({ type: "error", text: `Weightages must add up to 100%. Currently ${weightRounded}%.` });
        return;
      }
      examWeightsPayload = selectedExamIds.map(id => ({
        examId: Number(id),
        weightagePercent: Number(examWeights[id].weight),
      }));
    }

    setGenerating(true);
    setStatus(null);
    try {
      const results = [];
      const failures = [];

      for (const id of classIds) {
        try {
          const res = await generateReportCards({ classId: Number(id), examWeights: examWeightsPayload });
          results.push({ classId: id, className: res.data.className, data: res.data });
        } catch (err) {
          const cls = classes.find(c => String(c.id) === String(id));
          failures.push(`${cls?.className || id}: ${err?.response?.data?.message || "failed"}`);
        }
      }

      setReports(results);

      const seeded = {};
      results.forEach(({ classId, data }) => {
        (data.students || []).forEach(s => {
          seeded[noteKey(classId, s.registrationNumber)] = {
            remarks: s.remarks || "",
            attendedDays: s.attendedDays ?? "",
            totalDays: s.totalDays ?? "",
          };
        });
      });
      setNotesDraft(seeded);

      if (failures.length > 0) {
        setStatus({ type: "error", text: `Some classes couldn't be generated — ${failures.join("; ")}` });
      } else if (results.length === 0) {
        setStatus({ type: "error", text: "Could not generate report cards for any selected class." });
      }
    } finally {
      setGenerating(false);
    }
  };

  const updateNoteField = (classId, regNo, field, value) => {
    const key = noteKey(classId, regNo);
    setNotesDraft(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleSaveNote = async (classId, regNo) => {
    const key = noteKey(classId, regNo);
    const draft = notesDraft[key] || {};
    setSavingNote(key);
    try {
      await saveReportCardNote({
        classId: Number(classId),
        studentRegNo: regNo,
        remarks: draft.remarks || "",
        attendedDays: draft.attendedDays === "" ? null : Number(draft.attendedDays),
        totalDays: draft.totalDays === "" ? null : Number(draft.totalDays),
      });
      setStatus({ type: "success", text: "Remarks & attendance saved for this student." });
    } catch (err) {
      setStatus({ type: "error", text: err?.response?.data?.message || "Could not save remarks." });
    } finally {
      setSavingNote(null);
    }
  };

  const openPrint = (mode, target = null) => {
    setPrintTarget(target);
    setPrintMode(mode);
    setTimeout(() => window.print(), 60);
  };

  const openPdf = (mode, target = null) => {
    setPrintTarget(target);
    setPrintMode(mode);
    setPdfBusy(true);
    setTimeout(() => {
      if (!printRef.current || !window.html2pdf) {
        setPdfBusy(false);
        setPrintMode(null);
        return;
      }
      const label = mode === "single"
        ? `Report-Card-${target?.regNo}.pdf`
        : `Report-Cards-${reports?.length === 1 ? reports[0].className : "multi-class"}.pdf`;
      window.html2pdf()
        .set({
          margin: 0,
          filename: label,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css"] },
        })
        .from(printRef.current)
        .save()
        .finally(() => {
          setPdfBusy(false);
          setPrintMode(null);
        });
    }, 60);
  };

  // Flatten every class's ranked students into one printable list, each
  // carrying its own class context (name/id) since cards are rendered in
  // one combined sequence regardless of which class they came from.
  const allPrintable = (reports || []).flatMap(({ classId, className, data }) =>
    (data.students || []).map(s => ({ ...s, _classId: classId, _className: className, _examsUsed: data.examsUsed })));

  const studentsToRender = printMode === "single"
    ? allPrintable.filter(s => s._classId === printTarget?.classId && s.registrationNumber === printTarget?.regNo)
    : allPrintable;

  const totalStudents = (reports || []).reduce((sum, r) => sum + (r.data.students?.length || 0), 0);

  return (
    <div className="rc-page">
      <div className="rc-tool-card rc-no-print">
        <h2>🏆 Report Cards</h2>
        <p className="rc-tool-sub">
          Per Session combines several weighted exams into one report; Per Exam generates an instant
          report card from a single exam's marks, no weighting needed. Pick multiple classes to bulk
          print across all of them in one batch.
        </p>

        <div className="rc-display-toggle">
          {REPORT_MODES.map(opt => (
            <button
              key={opt.key}
              className={reportMode === opt.key ? "active" : ""}
              onClick={() => setReportMode(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="rc-section-title">Classes</div>
        <div className="rc-class-checklist">
          <label className="rc-class-check rc-class-check-all">
            <input
              type="checkbox"
              checked={classes.length > 0 && classIds.length === classes.length}
              onChange={toggleAllClasses}
            />
            <span>Select all</span>
          </label>
          {classes.map(c => (
            <label key={c.id} className="rc-class-check">
              <input
                type="checkbox"
                checked={classIds.includes(String(c.id))}
                onChange={() => toggleClass(String(c.id))}
              />
              <span>{c.className}</span>
            </label>
          ))}
        </div>

        {reportMode === "exam" && (
          <div className="rc-picker-row">
            <div className="rc-picker">
              <label>Exam</label>
              <select value={singleExamId} onChange={e => setSingleExamId(e.target.value)} disabled={classIds.length === 0}>
                <option value="">{classIds.length === 0 ? "Pick classes first" : "Select exam"}</option>
                {examsForClass.map(ex => <option key={ex.examId} value={ex.examId}>{ex.examName}</option>)}
              </select>
              {classIds.length > 0 && examsForClass.length === 0 && (
                <p className="rc-hint">No exam is common to every class selected above.</p>
              )}
            </div>
          </div>
        )}

        {classIds.length > 0 && reportMode === "session" && (
          <>
            <div className="rc-section-title">Select exams &amp; weightage</div>
            {examsForClass.length === 0 ? (
              <p className="rc-hint">No exam is common to every class selected above.</p>
            ) : (
              <div className="rc-exam-weight-list">
                {examsForClass.map(ex => {
                  const sel = examWeights[ex.examId];
                  return (
                    <div className={`rc-exam-weight-row${sel?.checked ? " checked" : ""}`} key={ex.examId}>
                      <label className="rc-exam-weight-check">
                        <input type="checkbox" checked={!!sel?.checked} onChange={() => toggleExam(ex.examId)} />
                        <span>{ex.examName}</span>
                      </label>
                      <div className="rc-exam-weight-input">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!sel?.checked}
                          value={sel?.weight ?? ""}
                          onChange={e => setWeight(ex.examId, e.target.value)}
                          placeholder="0"
                        />
                        <span>%</span>
                      </div>
                    </div>
                  );
                })}
                {selectedExamIds.length > 0 && (
                  <div className={`rc-weight-total ${Math.abs(totalWeight - 100) > 0.5 ? "off" : "ok"}`}>
                    Total weightage: {weightRounded}% {Math.abs(totalWeight - 100) > 0.5 ? "(must equal 100%)" : "✓"}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {classIds.length > 0 && (
          <>
            <div className="rc-section-title">Display on report cards</div>
            <div className="rc-display-toggle">
              {DISPLAY_MODES.map(opt => (
                <button
                  key={opt.key}
                  className={displayMode === opt.key ? "active" : ""}
                  onClick={() => setDisplayMode(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="rc-section-title">Print layout</div>
            <div className="rc-display-toggle">
              {LAYOUTS.map(opt => (
                <button
                  key={opt.key}
                  className={layout === opt.key ? "active" : ""}
                  onClick={() => setLayout(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {status && <p className={`rc-status rc-status-${status.type}`}>{status.text}</p>}

            <button className="ch-btn ch-btn-primary rc-save-btn" onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating…" : classIds.length > 1 ? `Generate Report Cards (${classIds.length} classes)` : "Generate Report Cards"}
            </button>
          </>
        )}

        {reports && reports.length > 0 && (
          <>
            <div className="rc-section-title">
              {reports.length === 1 ? reports[0].className : `${reports.length} classes`} — {totalStudents} student{totalStudents === 1 ? "" : "s"} total
            </div>

            <div className="rc-ranked-actions">
              <button className="ch-btn" onClick={() => openPrint("all")}>🖨️ Print all report cards</button>
              <button className="ch-btn" onClick={() => openPdf("all")} disabled={pdfBusy}>
                {pdfBusy && printMode === "all" ? "Preparing…" : "⬇ Download all as PDF"}
              </button>
            </div>

            {reports.map(({ classId, className, data }) => (
              <div key={classId} className="rc-class-block">
                <div className="rc-section-title">{className} — ranked ({data.students.length} student{data.students.length === 1 ? "" : "s"})</div>

                <div className="rc-grid-wrapper">
                  <table className="rc-grid rc-ranked-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Reg No</th>
                        <th>Name</th>
                        <th>Overall %</th>
                        <th>Grade</th>
                        <th>Result</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.students.map(s => (
                        <tr key={s.registrationNumber}>
                          <td className="rc-rank-cell">{s.rank}</td>
                          <td>{s.registrationNumber}</td>
                          <td>{s.name}</td>
                          <td>{s.overallPercent}%</td>
                          <td><span className="rc-grade-pill">{s.overallGrade}</span></td>
                          <td>
                            <span className={`rc-result-pill ${s.overallPassed ? "pass" : "fail"}`}>
                              {s.overallPassed ? "Pass" : "Fail"}
                            </span>
                          </td>
                          <td>
                            <button className="rc-link-btn" onClick={() => openPrint("single", { classId, regNo: s.registrationNumber })}>Print</button>
                            <button className="rc-link-btn" onClick={() => openPdf("single", { classId, regNo: s.registrationNumber })}>PDF</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rc-section-title">Remarks &amp; attendance — {className}</div>
                <div className="rc-grid-wrapper">
                  <table className="rc-grid rc-notes-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Remarks</th>
                        <th>Present days</th>
                        <th>Total days</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.students.map(s => {
                        const key = noteKey(classId, s.registrationNumber);
                        const draft = notesDraft[key] || {};
                        return (
                          <tr key={s.registrationNumber}>
                            <td className="rc-grid-name">{s.name}</td>
                            <td>
                              <input
                                type="text"
                                className="rc-note-remarks"
                                placeholder="e.g. Shows great improvement in Mathematics"
                                value={draft.remarks || ""}
                                onChange={e => updateNoteField(classId, s.registrationNumber, "remarks", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className="rc-note-days"
                                value={draft.attendedDays ?? ""}
                                onChange={e => updateNoteField(classId, s.registrationNumber, "attendedDays", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className="rc-note-days"
                                value={draft.totalDays ?? ""}
                                onChange={e => updateNoteField(classId, s.registrationNumber, "totalDays", e.target.value)}
                              />
                            </td>
                            <td>
                              <button
                                className="rc-link-btn"
                                onClick={() => handleSaveNote(classId, s.registrationNumber)}
                                disabled={savingNote === key}
                              >
                                {savingNote === key ? "Saving…" : "Save"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {reports && printMode && (
        <div id="rc-print-area" ref={printRef}>
          {studentsToRender.map(s => {
            const note = notesDraft[noteKey(s._classId, s.registrationNumber)] || {};
            const remarks = note.remarks || s.remarks || "";
            const attendedDays = note.attendedDays !== undefined && note.attendedDays !== "" ? note.attendedDays : s.attendedDays;
            const totalDays = note.totalDays !== undefined && note.totalDays !== "" ? note.totalDays : s.totalDays;
            const hasAttendance = attendedDays !== null && attendedDays !== undefined && totalDays !== null && totalDays !== undefined;
            const classTotal = (reports.find(r => r.classId === s._classId)?.data.students || []).length;

            return (
            <div className={`rc-card ${layout === "compact" ? "rc-card-compact" : ""}`} key={`${s._classId}-${s.registrationNumber}`}>
              <div className="rc-card-letterhead">
                {schoolInfo?.logoBase64 && (
                  <img className="rc-card-logo" src={schoolInfo.logoBase64} alt="School logo" />
                )}
                <h1>{schoolInfo?.schoolName || "School Name"}</h1>
                {(schoolInfo?.address || schoolInfo?.contactPhone) && (
                  <p>{[schoolInfo?.address, schoolInfo?.contactPhone && `Ph: ${schoolInfo.contactPhone}`].filter(Boolean).join(" • ")}</p>
                )}
                <div className="rc-card-badge">Report Card</div>
              </div>

              <div className="rc-card-meta">
                <div><span>Student Name:</span><b>{s.name}</b></div>
                <div><span>Father's Name:</span><b>{s.fatherName || "—"}</b></div>
                <div><span>Registration No.:</span><b>{s.registrationNumber}</b></div>
                <div><span>Class:</span><b>{s._className}</b></div>
                <div><span>Rank in Class:</span><b>{s.rank} of {classTotal}</b></div>
                {hasAttendance && (
                  <div><span>Attendance:</span><b>{attendedDays} / {totalDays} days</b></div>
                )}
              </div>

              <p className="rc-card-examline">
                Based on: {s._examsUsed.map(e => `${e.examName} (${e.weightagePercent}%)`).join(" + ")}
              </p>

              <table className="rc-card-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    {displayMode !== "grade" && <th>Marks (%)</th>}
                    {displayMode !== "marks" && <th>Grade</th>}
                    {layout !== "compact" && <th>Result</th>}
                  </tr>
                </thead>
                <tbody>
                  {s.subjectResults.map(r => (
                    <tr key={r.subjectId}>
                      <td>{r.name}</td>
                      {displayMode !== "grade" && (
                        <td>{r.allMarksEntered ? `${r.weightedPercent}%` : <span className="rc-absent">AB</span>}</td>
                      )}
                      {displayMode !== "marks" && <td>{r.grade}</td>}
                      {layout !== "compact" && (
                        <td className={r.passed ? "rc-pass-text" : "rc-fail-text"}>{r.passed ? "Pass" : "Fail"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>Overall</strong></td>
                    {displayMode !== "grade" && <td><strong>{s.overallPercent}%</strong></td>}
                    {displayMode !== "marks" && <td><strong>{s.overallGrade}</strong></td>}
                    {layout !== "compact" && (
                      <td className={s.overallPassed ? "rc-pass-text" : "rc-fail-text"}>
                        <strong>{s.overallPassed ? "Pass" : "Fail"}</strong>
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>

              {layout !== "compact" && remarks && (
                <p className="rc-card-remarks"><span>Remarks:</span> {remarks}</p>
              )}

              <div className="rc-card-signrow">
                <div>Class Teacher</div>
                <div>Principal</div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
