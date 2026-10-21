import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { getExamById, createExam, updateExam } from "../../services/reportCardService";
import { useToast } from "../../ui/ToastContext";
import "./ExamSetupPage.css";

export default function ExamSetupPage() {
  const { examId } = useParams();
  const isEdit = !!examId;
  const navigate = useNavigate();
  const toast = useToast();

  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [loadingExam, setLoadingExam] = useState(isEdit);

  useEffect(() => {
    apiClient.get("/classes").then(res => {
      setClasses(res.data || []);
    });
  }, []);

  // Prefill the form when editing an existing exam, once the class list
  // (needed to resolve class/subject ids into checkboxes) has loaded too.
  useEffect(() => {
    if (!isEdit || classes.length === 0) return;
    getExamById(examId)
      .then(res => {
        const exam = res.data;
        setExamName(exam.examName || "");
        setExamDate(exam.examDate || "");
        const classIds = (exam.classes || []).map(c => c.classId);
        setSelectedClasses(classIds);
        const subjMap = {};
        (exam.classes || []).forEach(c => { subjMap[c.classId] = c.subjectIds || []; });
        setSelectedSubjects(subjMap);
      })
      .catch(() => toast.error("Could not load this exam for editing"))
      .finally(() => setLoadingExam(false));
  }, [isEdit, examId, classes.length]);

  const toggleClass = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(prev => prev.filter(id => id !== classId));

      setSelectedSubjects(prev => {
        const updated = { ...prev };
        delete updated[classId];
        return updated;
      });

    } else {
      const cls = classes.find(c => c.id === classId);

      setSelectedClasses(prev => [...prev, classId]);

      // default select all subjects
      setSelectedSubjects(prev => ({
        ...prev,
        [classId]: (cls.subjects || []).map(s => s.id)
      }));
    }
  };

  const toggleSubject = (classId, subjectId) => {
    setSelectedSubjects(prev => {
      const current = prev[classId] || [];

      const updated = current.includes(subjectId)
        ? current.filter(id => id !== subjectId)
        : [...current, subjectId];

      return {
        ...prev,
        [classId]: updated
      };
    });
  };

  const handleCreate = async () => {

    if (!examName || !examDate || selectedClasses.length === 0) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const payload = {
        examName,
        examDate,
        classSubjectMap: selectedSubjects
      };

      if (isEdit) {
        await updateExam(examId, payload);
        toast.success("Exam updated successfully");
        navigate("/exam-structure");
        return;
      }

      await createExam(payload);

      toast.success("Exam created successfully");

      // reset
      setExamName("");
      setExamDate("");
      setSelectedClasses([]);
      setSelectedSubjects({});

    } catch (err) {
      console.error(err);
      toast.error(isEdit ? "Failed to update exam" : "Failed to create exam");
    }
  };

  if (loadingExam) {
    return <div className="student-bg"><p style={{ padding: 24 }}>Loading exam…</p></div>;
  }

  return (
    <div className="student-bg">
      <div className="profile-card exam-card">

        <h2>{isEdit ? "Edit Exam" : "Create Exam"}</h2>

        {/* FORM */}
        <div className="form-row">
          <input
            placeholder="Exam Name"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />

          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>

        {/* CLASS GRID */}
        <div className="section-title">Select Classes</div>

        <div className="class-box">
          {classes.map(c => (
            <label key={c.id} className="class-item">
              <input
                type="checkbox"
                checked={selectedClasses.includes(c.id)}
                onChange={() => toggleClass(c.id)}
              />
              <span>{c.className}</span>
            </label>
          ))}
        </div>

        {/* SUBJECTS PER CLASS */}
        {selectedClasses.map(classId => {
          const cls = classes.find(c => c.id === classId);

          return (
            <div key={classId} className="subject-wrapper">

              <div className="section-title">
                {cls?.className} Subjects
              </div>

              <div className="subject-grid">

                {(cls?.subjects || []).length === 0 && (
                  <p className="no-subject">
                    No subjects available
                  </p>
                )}

                {(cls?.subjects || []).map(s => (
                  <label key={s.id} className="subject-item">
                    <input
                      type="checkbox"
                      checked={(selectedSubjects[classId] || []).includes(s.id)}
                      onChange={() => toggleSubject(classId, s.id)}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}

              </div>

            </div>
          );
        })}

        <button onClick={handleCreate}>
          {isEdit ? "Save Changes" : "Create Exam"}
        </button>

      </div>
    </div>
  );
}