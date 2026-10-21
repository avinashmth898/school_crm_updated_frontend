import "./ReportCardTools.css";
import { useEffect, useRef, useState } from "react";
import apiClient from "../../../services/apiClient";
import { getExamMarksGrid, saveExamMarksGrid, getExamsForClass } from "../../../services/reportCardService";

// Class-wise marks entry: pick a class, pick one of the exams already
// created for it, then fill in a spreadsheet-style grid (students x
// subjects) in one go. Max marks per subject live in the same grid so a
// teacher can adjust "out of 50" vs "out of 100" without leaving the page.
export default function MarksEntryPage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");

  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");

  const [grid, setGrid] = useState(null);
  const [maxMarksDraft, setMaxMarksDraft] = useState({});
  const [marksDraft, setMarksDraft] = useState({});
  const [absentDraft, setAbsentDraft] = useState({});
  const [examDateDraft, setExamDateDraft] = useState({});
  const [startTimeDraft, setStartTimeDraft] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    setExamId("");
    setGrid(null);
    setStatus(null);
    if (!classId) { setExams([]); return; }
    getExamsForClass(classId)
      .then(res => setExams(res.data || []))
      .catch(err => {
        console.error(err);
        setExams([]);
        setStatus({
          type: "error",
          text: err?.response?.data?.message
            || `Could not load exams for this class (${err?.response?.status || "network error"}). Check that the backend is running the latest code.`,
        });
      });
  }, [classId]);

  useEffect(() => {
    if (!classId || !examId) { setGrid(null); return; }
    setLoading(true);
    setStatus(null);
    getExamMarksGrid(examId, classId)
      .then(res => {
        const data = res.data;
        setGrid(data);

        const mm = {};
        const ed = {};
        const td = {};
        (data.subjects || []).forEach(s => {
          mm[s.subjectId] = String(s.maxMarks ?? 100);
          ed[s.subjectId] = s.examDate || "";
          td[s.subjectId] = s.startTime || "";
        });
        setMaxMarksDraft(mm);
        setExamDateDraft(ed);
        setStartTimeDraft(td);

        const md = {};
        const ad = {};
        (data.students || []).forEach(st => {
          (data.subjects || []).forEach(s => {
            const key = `${st.registrationNumber}:${s.subjectId}`;
            const v = st.marks ? st.marks[s.subjectId] : undefined;
            md[key] = (v === null || v === undefined) ? "" : String(v);
            ad[key] = !!(st.absent && st.absent[s.subjectId]);
          });
        });
        setMarksDraft(md);
        setAbsentDraft(ad);
      })
      .catch(err => setStatus({
        type: "error",
        text: err?.response?.data?.message || "Could not load the marks grid for this exam.",
      }))
      .finally(() => setLoading(false));
  }, [classId, examId]);

  const handleSave = async () => {
    if (!grid) return;
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        examId: Number(examId),
        classId: Number(classId),
        subjects: grid.subjects.map(s => ({
          subjectId: s.subjectId,
          maxMarks: Number(maxMarksDraft[s.subjectId] || 100),
          examDate: examDateDraft[s.subjectId] || null,
          startTime: startTimeDraft[s.subjectId] || null,
        })),
        entries: [],
      };

      grid.students.forEach(st => {
        grid.subjects.forEach(s => {
          const key = `${st.registrationNumber}:${s.subjectId}`;
          const raw = marksDraft[key];
          const absent = !!absentDraft[key];
          payload.entries.push({
            registrationNumber: st.registrationNumber,
            subjectId: s.subjectId,
            marksObtained: (absent || raw === "" || raw === undefined) ? null : Number(raw),
            absent,
          });
        });
      });

      await saveExamMarksGrid(payload);
      setStatus({ type: "success", text: "Marks saved." });
    } catch (err) {
      setStatus({ type: "error", text: err?.response?.data?.message || "Could not save marks." });
    } finally {
      setSaving(false);
    }
  };

  // CSV export: one row per student, one column per subject, "AB" for
  // absent, blank for not-yet-entered. Lets a teacher hand off the grid to
  // someone filling it in Excel/Sheets instead of typing into every cell.
  const handleExportCsv = () => {
    if (!grid) return;
    const header = ["RegistrationNumber", "Name", ...grid.subjects.map(s => s.name)];
    const lines = [header.join(",")];
    grid.students.forEach(st => {
      const row = [st.registrationNumber, `"${st.name}"`];
      grid.subjects.forEach(s => {
        const key = `${st.registrationNumber}:${s.subjectId}`;
        row.push(absentDraft[key] ? "AB" : (marksDraft[key] ?? ""));
      });
      lines.push(row.join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${grid.className}-${grid.examName}-marks.csv`.replace(/\s+/g, "_");
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV import: matches rows back to students by RegistrationNumber (not
  // row order), so a teacher can reorder/sort the sheet freely. A cell of
  // "AB" (case-insensitive) marks that student absent for that subject.
  const handleImportCsv = (e) => {
    const file = e.target.files?.[0];
    if (!file || !grid) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const rows = text.split(/\r?\n/).filter(r => r.trim().length > 0);
        if (rows.length < 2) throw new Error("empty");
        const header = rows[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        const subjectCols = grid.subjects.map(s => ({
          subjectId: s.subjectId,
          col: header.indexOf(s.name),
        }));

        const nextMarks = { ...marksDraft };
        const nextAbsent = { ...absentDraft };
        let matched = 0;

        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(",");
          const regNo = Number((cols[0] || "").trim());
          const student = grid.students.find(st => st.registrationNumber === regNo);
          if (!student) continue;
          matched++;

          subjectCols.forEach(({ subjectId, col }) => {
            if (col === -1) return;
            const raw = (cols[col] || "").trim().replace(/^"|"$/g, "");
            const key = `${regNo}:${subjectId}`;
            if (raw.toUpperCase() === "AB") {
              nextAbsent[key] = true;
              nextMarks[key] = "";
            } else {
              nextAbsent[key] = false;
              nextMarks[key] = raw;
            }
          });
        }

        setMarksDraft(nextMarks);
        setAbsentDraft(nextAbsent);
        setStatus({
          type: matched > 0 ? "success" : "error",
          text: matched > 0
            ? `Imported marks for ${matched} student${matched === 1 ? "" : "s"} from the CSV.`
            : "No matching registration numbers found in that CSV.",
        });
      } catch {
        setStatus({ type: "error", text: "Could not read that CSV file." });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rc-page">
      <div className="rc-tool-card">
        <h2>📝 Marks Entry</h2>
        <p className="rc-tool-sub">Pick a class and one of its exams, then enter marks for the whole class at once.</p>

        <div className="rc-picker-row">
          <div className="rc-picker">
            <label>Class</label>
            <select value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
          </div>

          <div className="rc-picker">
            <label>Exam</label>
            <select value={examId} onChange={e => setExamId(e.target.value)} disabled={!classId}>
              <option value="">{classId ? "Select exam" : "Pick a class first"}</option>
              {exams.map(ex => <option key={ex.examId} value={ex.examId}>{ex.examName}</option>)}
            </select>
            {classId && exams.length === 0 && (
              <p className="rc-hint">No exams created for this class yet — create one in Exam Setup first.</p>
            )}
          </div>
        </div>

        {status && <p className={`rc-status rc-status-${status.type}`}>{status.text}</p>}
        {loading && <p className="rc-hint">Loading grid…</p>}

        {grid && !loading && (
          <>
            {grid.students.length === 0 ? (
              <p className="rc-hint">No active students found in {grid.className}.</p>
            ) : grid.subjects.length === 0 ? (
              <p className="rc-hint">This exam has no subjects configured for {grid.className}.</p>
            ) : (
              <div className="rc-grid-wrapper">
                <table className="rc-grid">
                  <thead>
                    <tr>
                      <th className="rc-grid-sticky">Student</th>
                      {grid.subjects.map(s => <th key={s.subjectId}>{s.name}</th>)}
                    </tr>
                    <tr className="rc-grid-maxrow">
                      <th className="rc-grid-sticky">Max marks</th>
                      {grid.subjects.map(s => (
                        <th key={s.subjectId}>
                          <input
                            type="number"
                            min="1"
                            value={maxMarksDraft[s.subjectId] ?? ""}
                            onChange={e => setMaxMarksDraft(prev => ({ ...prev, [s.subjectId]: e.target.value }))}
                          />
                        </th>
                      ))}
                    </tr>
                    <tr className="rc-grid-maxrow">
                      <th className="rc-grid-sticky">Exam date</th>
                      {grid.subjects.map(s => (
                        <th key={s.subjectId}>
                          <input
                            type="date"
                            value={examDateDraft[s.subjectId] ?? ""}
                            onChange={e => setExamDateDraft(prev => ({ ...prev, [s.subjectId]: e.target.value }))}
                          />
                        </th>
                      ))}
                    </tr>
                    <tr className="rc-grid-maxrow">
                      <th className="rc-grid-sticky">Start time</th>
                      {grid.subjects.map(s => (
                        <th key={s.subjectId}>
                          <input
                            type="text"
                            placeholder="9:00 AM"
                            value={startTimeDraft[s.subjectId] ?? ""}
                            onChange={e => setStartTimeDraft(prev => ({ ...prev, [s.subjectId]: e.target.value }))}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.students.map(st => (
                      <tr key={st.registrationNumber}>
                        <td className="rc-grid-sticky rc-grid-name">
                          {st.name} <span className="rc-grid-reg">#{st.registrationNumber}</span>
                        </td>
                        {grid.subjects.map(s => {
                          const key = `${st.registrationNumber}:${s.subjectId}`;
                          const isAbsent = !!absentDraft[key];
                          const isMissing = !isAbsent && !marksDraft[key];
                          return (
                            <td key={s.subjectId} className={isMissing ? "rc-cell-missing" : undefined}>
                              <div className="rc-mark-cell">
                                <input
                                  type="number"
                                  min="0"
                                  max={maxMarksDraft[s.subjectId] || undefined}
                                  placeholder={isAbsent ? "AB" : "—"}
                                  disabled={isAbsent}
                                  value={isAbsent ? "" : (marksDraft[key] ?? "")}
                                  onChange={e => setMarksDraft(prev => ({ ...prev, [key]: e.target.value }))}
                                />
                                <label className="rc-absent-toggle" title="Mark absent">
                                  <input
                                    type="checkbox"
                                    checked={isAbsent}
                                    onChange={e => {
                                      const checked = e.target.checked;
                                      setAbsentDraft(prev => ({ ...prev, [key]: checked }));
                                      if (checked) setMarksDraft(prev => ({ ...prev, [key]: "" }));
                                    }}
                                  />
                                  AB
                                </label>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="rc-csv-actions">
              <button className="ch-btn" onClick={handleExportCsv} disabled={grid.students.length === 0}>
                ⬇ Export CSV
              </button>
              <button className="ch-btn" onClick={() => fileInputRef.current?.click()} disabled={grid.students.length === 0}>
                ⬆ Import CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleImportCsv}
              />
            </div>

            <button
              className="ch-btn ch-btn-primary rc-save-btn"
              onClick={handleSave}
              disabled={saving || grid.students.length === 0 || grid.subjects.length === 0}
            >
              {saving ? "Saving…" : "Save Marks"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
