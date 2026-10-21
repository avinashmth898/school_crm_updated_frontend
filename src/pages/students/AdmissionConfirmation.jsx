import "./AdmissionConfirmation.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStudentProfile } from "../../services/studentService";
import { getSchoolInfo } from "../../services/schoolInfoService";

const DOCUMENT_ROWS = [
  { key: "aadharSubmitted", en: "Student's Aadhaar Card (Original for verification, photocopy submitted)", hi: "छात्र का आधार कार्ड (सत्यापन के लिए मूल, फोटोकॉपी जमा की गई)" },
  { key: "fatherAadharSubmitted", en: "Father's Aadhaar Card (Photocopy)", hi: "पिता का आधार कार्ड (फोटोकॉपी)" },
  { key: "motherAadharSubmitted", en: "Mother's Aadhaar Card (Photocopy)", hi: "माता का आधार कार्ड (फोटोकॉपी)" },
  { key: "transferCertificateSubmitted", en: "Previous School Transfer Certificate (if applicable)", hi: "पूर्व विद्यालय स्थानांतरण प्रमाण पत्र (यदि लागू हो)" },
  { key: "birthCertificateSubmitted", en: "Birth Certificate", hi: "जन्म प्रमाण पत्र" },
  { key: "photosSubmitted", en: "Recent Passport-size Photographs", hi: "हाल की पासपोर्ट साइज फोटो" },
];

export default function AdmissionConfirmation() {
  const { regNo } = useParams();
  const [student, setStudent] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);

  useEffect(() => {
    fetchStudent();
    getSchoolInfo().then(res => setSchoolInfo(res.data)).catch(err => console.error("Failed to load school info", err));
  }, [regNo]);

  const fetchStudent = async () => {
    try {
      const res = await getStudentProfile(regNo);
      setStudent(res.data);
    } catch (err) {
      console.error("Failed to load student", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = document.getElementById("admission-document").innerHTML;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>${student.name}_Admission_Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: black;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            td {
              border-bottom: 1px solid black;
              padding: 6px;
            }

            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
            }

            .checkbox-mark {
              font-size: 20px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();

    // wait for render
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  if (!student) {
    return (
      <div className="admission-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admission details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admission-wrapper">

      {/* ACTION BAR - Hidden on print */}
      <div className="top-actions no-print">
        <button className="btn-print" onClick={handlePrint}>
          🖨️ Print
        </button>
        <button className="btn-download" onClick={handleDownload}>
          ⬇️ Download PDF
        </button>
      </div>

      {/* ADMISSION DOCUMENT */}
      <div className="admission-document" id="admission-document">

        {/* HEADER */}
        <div className="document-header">
          {student.photoPath && (
            <img
              src={`/api/students/${regNo}/photo`}
              alt={student.name}
              style={{ width: 72, height: 90, objectFit: "cover", borderRadius: 4, float: "right" }}
            />
          )}
          <h1 className="school-name">{(schoolInfo?.schoolName || "School Name Not Set").toUpperCase()}</h1>
          <p className="address-line">{schoolInfo?.address || "Address not set — configure it in Command Centre → School Info"}</p>
          {schoolInfo?.affiliationNumber && (
            <p className="affiliation">Affiliation No: {schoolInfo.affiliationNumber}</p>
          )}
        </div>

        <div className="divider-line"></div>

        {/* DOCUMENT TITLE */}
        <div className="document-title-section">
          <h2 className="title-english">ADMISSION CONFIRMATION</h2>
          <h3 className="title-hindi">प्रवेश पुष्टिकरण</h3>
        </div>

        {/* STUDENT DETAILS TABLE */}
        <div className="details-section">
          <table className="details-table">
            <tbody>
              <tr>
                <td className="label-cell">
                  <span className="label-text">Student Name / छात्र का नाम</span>
                </td>
                <td className="value-cell">{student.name}</td>
              </tr>

              <tr>
                <td className="label-cell">
                  <span className="label-text">Father's Name / पिता का नाम</span>
                </td>
                <td className="value-cell">{student.fatherName}</td>
              </tr>

              <tr>
                <td className="label-cell">
                  <span className="label-text">Mother's Name / माता का नाम</span>
                </td>
                <td className="value-cell">{student.motherName}</td>
              </tr>

              <tr>
                <td className="label-cell">
                  <span className="label-text">Class / कक्षा</span>
                </td>
                <td className="value-cell">{student.currentClass}</td>
              </tr>

              <tr>
                <td className="label-cell">
                  <span className="label-text">Registration No / पंजीकरण संख्या</span>
                </td>
                <td className="value-cell">{student.registrationNumber}</td>
              </tr>

              <tr>
                <td className="label-cell">
                  <span className="label-text">Date of Admission / प्रवेश तिथि</span>
                </td>
                <td className="value-cell">{student.admissionDate}</td>
              </tr>

              <tr>
                <td className="label-cell">
                  <span className="label-text">Academic Session / शैक्षणिक सत्र</span>
                </td>
                <td className="value-cell">{student.academicSession || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DOCUMENT CONSENT SECTION */}
        <div className="consent-section">
          <h4 className="section-heading">
            DOCUMENT SUBMISSION CONSENT / दस्तावेज़ जमा करने की सहमति
          </h4>

          <p className="consent-text">
            I/We, the undersigned parent(s)/guardian(s), hereby confirm that I/we have
            submitted the following documents to the school for the admission of the
            above-mentioned student:
          </p>

          <p className="consent-text-hindi">
            मैं/हम, नीचे हस्ताक्षरकर्ता अभिभावक/संरक्षक, पुष्टि करते हैं कि मैंने/हमने
            उपरोक्त छात्र के प्रवेश के लिए विद्यालय को निम्नलिखित दस्तावेज़ जमा किए हैं:
          </p>

          {/* DOCUMENT CHECKLIST TABLE — reflects the school's actual records, not a fixed assumption */}
          <table className="checklist-table">
            <tbody>
              {DOCUMENT_ROWS.map(doc => (
                <tr key={doc.key}>
                  <td className="checkbox-cell">
                    <span className="checkbox-mark">{student[doc.key] ? "☑" : "☐"}</span>
                  </td>
                  <td className="checklist-text">
                    {doc.en}
                    <br />
                    <span className="hindi-small">{doc.hi}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* CONSENT DECLARATION */}
          <p className="declaration-text">
            I/We hereby give consent to {schoolInfo?.schoolName || "the school"} to collect, process,
            and maintain the above-mentioned documents for official records and regulatory
            compliance. I/We understand that these documents will be kept confidential and
            used solely for educational and administrative purposes.
          </p>

          <p className="declaration-text-hindi">
            मैं/हम {schoolInfo?.schoolName || "विद्यालय"} को उपरोक्त दस्तावेज़ों को आधिकारिक रिकॉर्ड
            और नियामक अनुपालन के लिए एकत्र करने, संसाधित करने और बनाए रखने की सहमति देते हैं।
            मैं/हम समझते हैं कि ये दस्तावेज़ गोपनीय रखे जाएंगे और केवल शैक्षिक और प्रशासनिक
            उद्देश्यों के लिए उपयोग किए जाएंगे।
          </p>

          <p className="checklist-text" style={{ marginTop: 12 }}>
            <strong>Parent/Guardian consent on file:</strong>{" "}
            {student.parentConsent ? "☑ Recorded" : "☐ Not yet recorded"}
          </p>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="signature-section">
          <div className="signature-block">
            <div className="signature-line"></div>
            <p className="signature-label">Parent/Guardian Signature</p>
            <p className="signature-label-hindi">अभिभावक/संरक्षक के हस्ताक्षर</p>
            <p className="date-line">Date / तिथि: _________________</p>
          </div>

          <div className="signature-block seal-block">
            <div className="seal-placeholder">[School Seal]</div>
            <div className="signature-line"></div>
            <p className="signature-label">Authorized Signatory</p>
            <p className="signature-label-hindi">प्राधिकृत हस्ताक्षरकर्ता</p>
            <p className="designation">(Principal / School Head)</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="document-footer">
          <div className="footer-divider"></div>
          <p className="footer-text">
            This is an official document. Please keep it safe for future reference.
          </p>
          <p className="footer-text-hindi">
            यह एक आधिकारिक दस्तावेज़ है। कृपया इसे भविष्य के संदर्भ के लिए सुरक्षित रखें।
          </p>
        </div>

      </div>
    </div>
  );
}