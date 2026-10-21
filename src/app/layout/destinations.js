import Icon from "../../ui/icons";

// Shared list of "jump to a page" destinations, used by both the top
// bar's inline search and the Cmd/Ctrl+K command palette so the two
// stay in sync instead of drifting into two different page lists.
const DESTINATIONS = [
  { label: "Dashboard", path: "/", icon: Icon.Home, keywords: "home command hub" },
  { label: "Students", path: "/students", icon: Icon.GraduationCap },
  { label: "New admission", path: "/students/new", icon: Icon.FileEdit, keywords: "register admit" },
  { label: "Fees", path: "/fees", icon: Icon.Wallet },
  { label: "Collect a fee", path: "/fees/pay", icon: Icon.CreditCard, keywords: "pay payment" },
  { label: "Defaulters", path: "/fees/defaulters", icon: Icon.AlertTriangle, keywords: "due overdue" },
  { label: "Promotions", path: "/command-centre/promotion", icon: Icon.Rocket, keywords: "promote class" },
  { label: "Command centre", path: "/command-centre", icon: Icon.Settings, keywords: "settings admin config" },
  { label: "Admin panel", path: "/admin-panel", icon: Icon.Lock, keywords: "access license staff accounts devices backup restore" },
  { label: "School info", path: "/command-centre/school-info", icon: Icon.Building },
  { label: "Reports", path: "/reports", icon: Icon.FileText, keywords: "finance collection" },
  { label: "Teachers", path: "/teachers", icon: Icon.Teacher, keywords: "staff" },
  { label: "Forms & documents", path: "/command-centre/documents", icon: Icon.Folder, keywords: "certificate" },
  { label: "Exam structure", path: "/exam-structure", icon: Icon.Receipt, keywords: "exams marks" },
  { label: "EdNuvo", path: "/ednuvo", icon: Icon.Grid, keywords: "ems fms sms tms hub" },
];

export default DESTINATIONS;
