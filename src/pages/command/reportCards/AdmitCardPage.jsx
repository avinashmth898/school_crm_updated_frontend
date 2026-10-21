import "./ReportCardTools.css";
import "./AdmitCardTools.css";
import { useEffect, useRef, useState } from "react";
import apiClient from "../../../services/apiClient";
import { getExamsForClass, getAdmitCards } from "../../../services/reportCardService";
import { getSchoolInfo } from "../../../services/schoolInfoService";

const CARDS_PER_PAGE = 4; // 2 columns x 2 rows, filling the full A4 page each

// Bulk admit-card print: pick a class and an exam, pull every ACTIVE
// student in that class (the eligibility rule — see the clarifying
// question this was built from) along with the exam's per-subject
// schedule (set in Marks Entry), then print/PDF 4 cards per A4 page,
// each page filled edge-to-edge by the 2x2 grid.
export default function AdmitCardPage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");

  const [examsForClass, setExamsForClass] = useState([]);
  const [examId, setExamId] = useState("");

  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [schoolInfo, setSchoolInfo] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const printRef = useRef(null);

  useEffect(() => {
    apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
    getSchoolInfo().then(res => setSchoolInfo(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setExamId("");
    setCards(null);
    setStatus(null);
    if (!classId) { setExamsForClass([]); return; }
    getExamsForClass(classId)
      .then(res => setExamsForClass(res.data || []))
      .catch(() => setExamsForClass([]));
  }, [classId]);

  useEffect(() => {
    if (!printing) return;
    const handleAfterPrint = () => setPrinting(false);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [printing]);

  const handleGenerate = async () => {
    if (!classId || !examId) {
      setStatus({ type: "error", text: "Pick a class and an exam first." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await getAdmitCards(classId, examId);
      setCards(res.data || []);
      if ((res.data || []).length === 0) {
        setStatus({ type: "error", text: "No eligible (active) students found in this class." });
      }
    } catch (err) {
      setStatus({ type: "error", text: err?.response?.data?.message || "Could not load admit cards." });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => window.print(), 60);
  };

  const handlePdf = () => {
    setPdfBusy(true);
    setPrinting(true);
    setTimeout(() => {
      if (!printRef.current || !window.html2pdf) {
        setPdfBusy(false);
        setPrinting(false);
        return;
      }
      const className = classes.find(c => String(c.id) === String(classId))?.className || "class";
      window.html2pdf()
        .set({
          margin: 0,
          filename: `Admit-Cards-${className}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css"] },
        })
        .from(printRef.current)
        .save()
        .finally(() => {
          setPdfBusy(false);
          setPrinting(false);
        });
    }, 60);
  };

  const pages = [];
  if (cards) {
    for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
      pages.push(cards.slice(i, i + CARDS_PER_PAGE));
    }
  }

  return (
    <div className="rc-page">
      <div className="rc-tool-card rc-no-print">
        <h2>🎫 Admit Cards</h2>
        <p className="rc-tool-sub">
          Pick a class and an exam, then print admit cards for every active student in that class —
          4 per A4 page, each page filled edge-to-edge. Exam dates and times come from each subject's schedule in Marks Entry.
        </p>

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
              {examsForClass.map(ex => <option key={ex.examId} value={ex.examId}>{ex.examName}</option>)}
            </select>
            {classId && examsForClass.length === 0 && (
              <p className="rc-hint">No exams created for this class yet.</p>
            )}
          </div>
        </div>

        {status && <p className={`rc-status rc-status-${status.type}`}>{status.text}</p>}

        <button className="ch-btn ch-btn-primary rc-save-btn" onClick={handleGenerate} disabled={loading}>
          {loading ? "Loading…" : "Load eligible students"}
        </button>

        {cards && cards.length > 0 && (
          <>
            <div className="rc-section-title">
              {cards.length} eligible student{cards.length === 1 ? "" : "s"} — {pages.length} page{pages.length === 1 ? "" : "s"}
            </div>
            <div className="rc-ranked-actions">
              <button className="ch-btn" onClick={handlePrint}>🖨️ Print admit cards</button>
              <button className="ch-btn" onClick={handlePdf} disabled={pdfBusy}>
                {pdfBusy ? "Preparing…" : "⬇ Download as PDF"}
              </button>
            </div>
          </>
        )}
      </div>

      {cards && printing && (
        <div id="ac-print-area" ref={printRef}>
          {pages.map((pageCards, pageIdx) => (
            <div className="ac-page" key={pageIdx}>
              {pageCards.map(card => (
                <div className="ac-card" key={card.registrationNumber}>
                  <div className="ac-card-header">
                    {schoolInfo?.logoBase64 && (
                      <img className="ac-card-logo" src={schoolInfo.logoBase64} alt="School logo" />
                    )}
                    <div className="ac-card-school">{schoolInfo?.schoolName || "School Name"}</div>
                    {(schoolInfo?.address || schoolInfo?.contactPhone) && (
                      <div className="ac-card-schoolsub">
                        {[schoolInfo?.address, schoolInfo?.contactPhone && `Ph: ${schoolInfo.contactPhone}`].filter(Boolean).join(" • ")}
                      </div>
                    )}
                    <div className="ac-card-badge">Admit Card</div>
                  </div>

                  <div className="ac-card-body">
                    <div className="ac-card-fields">
                      <div><span>Exam:</span> <b>{card.examName}</b></div>
                      <div><span>Name:</span> <b>{card.name}</b></div>
                      <div><span>Father's Name:</span> <b>{card.fatherName || "—"}</b></div>
                      <div><span>Class:</span> <b>{card.className}</b> &nbsp; <span>Roll:</span> <b>{card.registrationNumber}</b></div>
                      <div><span>DOB:</span> <b>{card.dateOfBirth || "—"}</b></div>
                    </div>
                    <div className="ac-card-photo">
                      {card.photoPath ? (
                        <img src={`/api/students/${card.registrationNumber}/photo`} alt={card.name} />
                      ) : "Photo"}
                    </div>
                  </div>

                  {card.schedule && card.schedule.length > 0 && (
                    <table className="ac-card-schedule">
                      <thead>
                        <tr><th>Subject</th><th>Date</th><th>Time</th></tr>
                      </thead>
                      <tbody>
                        {card.schedule.map((sub, i) => (
                          <tr key={i}>
                            <td>{sub.subjectName}</td>
                            <td>{sub.examDate || "—"}</td>
                            <td>{sub.startTime || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <div className="ac-card-note">Carry this card to every exam. No entry without it.</div>

                  <div className="ac-card-signrow">
                    <div>Student sign</div>
                    <div>Principal</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
