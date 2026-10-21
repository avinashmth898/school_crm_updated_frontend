import "./PromotionPage.css";
import { useState, useEffect } from "react";
import apiClient from "../../../services/apiClient";
import { useToast } from "../../../ui/ToastContext";
import { useConfirm, usePrompt } from "../../../ui/ConfirmContext";

export default function PromotionPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const prompt = usePrompt();

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [ticked, setTicked] = useState({}); // regNo -> boolean, default true
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState(null);

  // Real class list — same source Class Setup, admission, and fee config
  // use — instead of a hardcoded list that can silently drift out of sync.
  useEffect(() => {
    apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
  }, []);

  const loadStudents = async (cls) => {
    setSelectedClass(cls);
    setResult(null);
    try {
      // Only ACTIVE students can be promoted — withdrawn/graduated students
      // shouldn't show up in the tick list at all.
      const res = await apiClient.get("/students", { params: { status: "ACTIVE" } });
      const classStudents = (res.data || []).filter(s => s.currentClass === cls);
      setStudents(classStudents);

      // 🔹 Everyone ticked by default — untick the ones NOT being promoted
      const defaults = {};
      classStudents.forEach(s => { defaults[s.registrationNumber] = true; });
      setTicked(defaults);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load students for this class");
    }
  };

  const allTicked = students.length > 0 && students.every(s => ticked[s.registrationNumber]);

  // 🔹 Select All / Deselect All — the fast path to a single mid-session
  // promotion is: Deselect All, then tick just the one student.
  const toggleAll = () => {
    const next = {};
    students.forEach(s => { next[s.registrationNumber] = !allTicked; });
    setTicked(next);
  };

  const toggleOne = (regNo) => {
    setTicked(prev => ({ ...prev, [regNo]: !prev[regNo] }));
  };

  // Promotion is a one-way, class-wide action, so it gets real friction
  // before it runs. The actual access boundary is the backend's
  // ROLE_ADMIN check on /api/promotion/** (SecurityConfig) — only an
  // authenticated admin can even reach this page/action — so this is
  // deliberately a "are you sure, and do you mean it" gate rather than a
  // second password prompt that would just duplicate (and, shown in
  // plaintext, undermine) the real auth check.
  const handlePromote = async () => {
    const promoteRegNos = students
      .filter(s => ticked[s.registrationNumber])
      .map(s => s.registrationNumber);

    const heldBackCount = students.length - promoteRegNos.length;

    const summary = promoteRegNos.length === 0
      ? `No students are ticked — this will hold back everyone in ${selectedClass}.`
      : `This will promote ${promoteRegNos.length} student(s) from ${selectedClass}` +
        (heldBackCount > 0 ? `, and hold back ${heldBackCount}.` : ".") +
        " This can't be undone.";

    const ok = await confirm({ message: summary, confirmLabel: "Continue", danger: true });
    if (!ok) return;

    const typed = await prompt({
      message: `Type PROMOTE to confirm promoting class ${selectedClass}:`,
    });
    if (typed !== "PROMOTE") {
      if (typed !== null) toast.error("Promotion cancelled — confirmation text didn't match.");
      return;
    }

    setPromoting(true);
    try {
      const res = await apiClient.post("/promotion/promote-class", {
        className: selectedClass,
        promoteRegNos,
      });
      setResult(res.data);
      // Reload — promoted students have left this class, held-back ones remain
      await loadStudents(selectedClass);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Promotion failed");
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="promotion-page">

      <div className="promo-header">
        <h2>🎓 Student Promotion</h2>
        <p>Everyone starts ticked. Untick anyone who should stay back, then promote.
           For a single mid-session promotion: Deselect All, tick just that student, promote.</p>
      </div>

      {/* CLASS TILES */}
      <div className="class-tile-grid">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className={`class-card ${selectedClass === cls.className ? "active" : ""}`}
            onClick={() => loadStudents(cls.className)}
          >
            <div className="class-title">{cls.className}</div>
          </div>
        ))}
      </div>

      {/* STUDENT PANEL */}
      <div className="student-panel">

        {!selectedClass && (
          <div className="empty-state-pro">
            <div className="empty-icon">📚</div>
            <h3>Select a Class</h3>
            <p>Choose a class above to review who gets promoted</p>
          </div>
        )}

        {selectedClass && (
          <>
            <div className="panel-header">
              <div>
                <h3>Class {selectedClass}</h3>
                <p>{students.length} Students</p>
              </div>

              <div className="actions">
                <label className="select-all">
                  <input
                    type="checkbox"
                    checked={allTicked}
                    onChange={toggleAll}
                  />
                  {allTicked ? "Deselect All" : "Select All"}
                </label>

                <button className="promote-btn" onClick={handlePromote} disabled={promoting || students.length === 0}>
                  {promoting ? "Promoting…" : "Promote Ticked →"}
                </button>
              </div>
            </div>

            {result && (
              <div className="empty-state-pro" style={{ marginBottom: 16 }}>
                <p>
                  Promoted {result.promoted} to {result.nextClassName || "—"} · Held back {result.heldBack} in {result.className}
                </p>
              </div>
            )}

            {result && result.dueWarnings && result.dueWarnings.length > 0 && (
              <div className="promo-due-warning">
                <p className="promo-due-warning-title">
                  ⚠️ {result.dueWarnings.length} promoted student(s) still have unpaid fees:
                </p>
                <ul className="promo-due-warning-list">
                  {result.dueWarnings.map((w) => (
                    <li key={w.regNo}>
                      {w.studentName} (#{w.regNo}) — ₹{Number(w.dueAmount).toLocaleString("en-IN")} due
                    </li>
                  ))}
                </ul>
                <p className="promo-due-warning-note">
                  They were promoted as requested — the dues weren't cleared, just carried forward. Follow up from the Defaulters page.
                </p>
              </div>
            )}

            <div className="student-table">
              {students.length === 0 && (
                <p style={{ opacity: 0.7, padding: "12px 0" }}>No students in this class.</p>
              )}

              {students.map((s, index) => (
                <div key={s.registrationNumber} className="student-row">
                  <div className="student-left">
                    <input
                      type="checkbox"
                      checked={!!ticked[s.registrationNumber]}
                      onChange={() => toggleOne(s.registrationNumber)}
                    />
                    <span className="student-name">{s.name}</span>
                  </div>

                  <div className="student-right">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

    </div>
  );
}
