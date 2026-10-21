import "./DocumentGenerator.css";
import { useState } from "react";

export default function DocumentGenerator() {

const [step, setStep] = useState("list");
const [docType, setDocType] = useState("");
const [form, setForm] = useState({
name: "",
class: "",
father: "",
mother: "",
dob: "",
address: "",
contact: ""
});

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

// 🔥 DOCUMENT CONTENT
const renderDocument = () => {

if (docType === "bonafide") {
  return (
    <div className="doc-paper">
      <h2>SCHOOL NAME</h2>
      <h3>BONAFIDE CERTIFICATE</h3>

      <p>
        This is to certify that <b>{form.name}</b> is a student of
        class <b>{form.class}</b> in our school.
      </p>

      <p>
        Father's Name: <b>{form.father}</b>
      </p>

      <p>
        Date of Birth: <b>{form.dob}</b>
      </p>

      <p>
        This certificate is issued for official purposes.
      </p>

      <div className="sign">Principal Signature</div>
    </div>
  );
}

if (docType === "admission") {
  return (
    <div className="doc-paper">
      <h2>SCHOOL NAME</h2>
      <h3>ADMISSION CONFIRMATION</h3>

      <p>
        This is to confirm that <b>{form.name}</b> has been admitted
        to class <b>{form.class}</b>.
      </p>

      <p>Father: <b>{form.father}</b></p>
      <p>Mother: <b>{form.mother}</b></p>
      <p>Address: <b>{form.address}</b></p>

      <div className="sign">Principal</div>
    </div>
  );
}

return null;


};

return ( <div className="doc-page">


  <h2>📄 Document Generator</h2>

  {/* STEP 1 */}
  {step === "list" && (
    <div className="doc-list">

      <div onClick={() => { setDocType("admission"); setStep("form"); }}>
        Admission Confirmation
      </div>

      <div onClick={() => { setDocType("bonafide"); setStep("form"); }}>
        Bonafide Certificate
      </div>

      <div onClick={() => { setDocType("tc"); setStep("form"); }}>
        Transfer Certificate (TC)
      </div>

      <div onClick={() => { setDocType("character"); setStep("form"); }}>
        Character Certificate
      </div>

      <div onClick={() => { setDocType("migration"); setStep("form"); }}>
        Migration Certificate
      </div>

      <div onClick={() => { setDocType("study"); setStep("form"); }}>
        Study Certificate
      </div>

      <div onClick={() => { setDocType("promotion"); setStep("form"); }}>
        Promotion Certificate
      </div>

      <div onClick={() => { setDocType("leave"); setStep("form"); }}>
        Leave Application
      </div>

      <div onClick={() => { setDocType("readmission"); setStep("form"); }}>
        Re-admission Form
      </div>

      <div onClick={() => { setDocType("subjectChange"); setStep("form"); }}>
        Subject Change Request
      </div>

      <div onClick={() => { setDocType("feeReceipt"); setStep("form"); }}>
        Fee Receipt
      </div>

      <div onClick={() => { setDocType("feeDue"); setStep("form"); }}>
        Fee Due Notice
      </div>

      <div onClick={() => { setDocType("medical"); setStep("form"); }}>
        Medical Certificate
      </div>

      <div onClick={() => { setDocType("consent"); setStep("form"); }}>
        Parent Consent Form
      </div>

      <div onClick={() => { setDocType("transport"); setStep("form"); }}>
        Transport Request Form
      </div>


    </div>
  )}

  {/* STEP 2 */}
  {step === "form" && (
    <div className="doc-form">

      <input name="name" placeholder="Student Name" onChange={handleChange} />
      <input name="class" placeholder="Class" onChange={handleChange} />
      <input name="father" placeholder="Father Name" onChange={handleChange} />
      <input name="mother" placeholder="Mother Name" onChange={handleChange} />
      <input name="dob" placeholder="DOB" onChange={handleChange} />
      <input name="address" placeholder="Address" onChange={handleChange} />
      <input name="contact" placeholder="Contact" onChange={handleChange} />

      <button onClick={() => setStep("preview")}>
        Preview Document
      </button>

    </div>
  )}

  {/* STEP 3 */}
  {step === "preview" && (
    <div>

      {renderDocument()}

      <div className="actions">
        <button onClick={() => window.print()}>🖨 Print</button>
        <button onClick={() => setStep("form")}>✏ Edit</button>
      </div>

    </div>
  )}

</div>


);
}
