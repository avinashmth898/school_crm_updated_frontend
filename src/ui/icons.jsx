/**
 * icons.jsx
 * ---------
 * A small, self-hosted set of outline icons (no external font/CDN
 * dependency, so they always render even offline). Every icon shares
 * the same viewBox, stroke width, and `currentColor` fill so they
 * inherit whatever color/size the parent element sets — this is what
 * makes them read as "one icon set" instead of mismatched emoji.
 *
 * Usage: <Icon.Home size={18} /> — size defaults to 18.
 */
const base = (props) => ({
  width: props.size || 18,
  height: props.size || 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const Home = (props) => (
  <svg {...base(props)}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" /></svg>
);

export const Grid = (props) => (
  <svg {...base(props)}><rect x="3.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.2" /></svg>
);

export const GraduationCap = (props) => (
  <svg {...base(props)}><path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Z" /><path d="M6.5 11v5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-5" /><path d="M21.5 9v6" /></svg>
);

export const Teacher = (props) => (
  <svg {...base(props)}><circle cx="12" cy="7.5" r="3.2" /><path d="M5 20.5c0-3.6 3.1-6.3 7-6.3s7 2.7 7 6.3" /><path d="M16.3 6.2c1 .4 1.7 1.3 1.7 2.4 0 1.1-.7 2-1.7 2.4" /></svg>
);

export const Wallet = (props) => (
  <svg {...base(props)}><rect x="3" y="6.5" width="18" height="12.5" rx="2" /><path d="M3 9.5h18" /><circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none" /></svg>
);

export const Settings = (props) => (
  <svg {...base(props)}><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1h-.2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6v-.2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></svg>
);

export const FileText = (props) => (
  <svg {...base(props)}><path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" /><path d="M14 3.5v4h4" /><path d="M8.5 13h7M8.5 16.5h7M8.5 9.5h3" /></svg>
);

export const BarChart = (props) => (
  <svg {...base(props)}><path d="M4 20V10M10 20V4M16 20v-7M20 20H4" /></svg>
);

export const CreditCard = (props) => (
  <svg {...base(props)}><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 10h19" /><path d="M6 14.5h4" /></svg>
);

export const FileEdit = (props) => (
  <svg {...base(props)}><path d="M12.5 3.5H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9.5" /><path d="M20.4 5.6a1.6 1.6 0 0 1 0 2.3l-6.2 6.2-3 .7.7-3 6.2-6.2a1.6 1.6 0 0 1 2.3 0Z" /></svg>
);

export const AlertTriangle = (props) => (
  <svg {...base(props)}><path d="M12 4 2.5 20.5h19L12 4Z" /><path d="M12 10v4.5" /><circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" /></svg>
);

export const Rocket = (props) => (
  <svg {...base(props)}><path d="M14.5 3.5c3 1 5 3 6 6-2.5 0-5 .7-7.3 2.9-1.4 1.4-2.3 3-2.8 4.4l-3.3-3.3c1.4-.5 3-1.4 4.4-2.8C13.7 8.6 14.5 6 14.5 3.5Z" /><path d="M9.5 14.5 5 19M8 13l-4 1.2L5 10M11 16l-1.2 4L14 19" /></svg>
);

export const Building = (props) => (
  <svg {...base(props)}><rect x="4.5" y="3.5" width="10" height="17" rx="1" /><path d="M14.5 10.5h5v10h-5" /><path d="M7.5 7h1M11.5 7h1M7.5 10.5h1M11.5 10.5h1M7.5 14h1M11.5 14h1" /></svg>
);

export const Folder = (props) => (
  <svg {...base(props)}><path d="M3.5 6.5a1 1 0 0 1 1-1H9l2 2.2h8.5a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-11.5Z" /></svg>
);

export const Receipt = (props) => (
  <svg {...base(props)}><path d="M6 3.5h12v17l-2.2-1.5L13.6 20l-1.6-1.5L10.4 20l-2.2-1-2.2 1v-16.5Z" /><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" /></svg>
);

export const TrendingUp = (props) => (
  <svg {...base(props)}><path d="M3.5 16.5 10 10l4 4 6.5-6.5" /><path d="M15 7.5h5.5V13" /></svg>
);

export const BookOpen = (props) => (
  <svg {...base(props)}><path d="M12 6.5c-1.8-1.5-4.3-2-7.5-2v13c3.2 0 5.7.5 7.5 2 1.8-1.5 4.3-2 7.5-2v-13c-3.2 0-5.7.5-7.5 2Z" /><path d="M12 6.5v13" /></svg>
);

export const Target = (props) => (
  <svg {...base(props)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg>
);

export const Award = (props) => (
  <svg {...base(props)}><circle cx="12" cy="8.5" r="5" /><path d="M9 12.8 7.5 20.5 12 18l4.5 2.5L15 12.8" /></svg>
);

export const Ticket = (props) => (
  <svg {...base(props)}><path d="M3.5 9a2 2 0 0 0 0 4v3.5a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V13a2 2 0 0 1 0-4V6.5a1 1 0 0 0-1-1h-15a1 1 0 0 0-1 1V9Z" /><path d="M14.5 5.5v13" strokeDasharray="2.4 2.4" /></svg>
);

export const Key = (props) => (
  <svg {...base(props)}><circle cx="7.5" cy="14.5" r="4" /><path d="M10.5 11.5 20 2M16.5 5.5l2.5 2.5M13.5 8.5 16 11" /></svg>
);

export const User = (props) => (
  <svg {...base(props)}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" /></svg>
);

export const Smartphone = (props) => (
  <svg {...base(props)}><rect x="6" y="2.5" width="12" height="19" rx="2" /><path d="M10.5 19h3" /></svg>
);

export const Lock = (props) => (
  <svg {...base(props)}><rect x="4.5" y="10.5" width="15" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>
);

export const Search = (props) => (
  <svg {...base(props)}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.4-4.4" /></svg>
);

export const Plus = (props) => (
  <svg {...base(props)}><path d="M12 5v14M5 12h14" /></svg>
);

export const ClipboardList = (props) => (
  <svg {...base(props)}><rect x="5" y="4.5" width="14" height="16" rx="1.5" /><rect x="9" y="2.5" width="6" height="3.5" rx="1" /><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5" /></svg>
);

export const ArrowUp = (props) => (
  <svg {...base(props)}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
);

export const Bell = (props) => (
  <svg {...base(props)}><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" /><path d="M10 18.5a2 2 0 0 0 4 0" /></svg>
);

export const Download = (props) => (
  <svg {...base(props)}><path d="M12 3.5v12M7 11l5 5 5-5" /><path d="M4.5 18v1.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V18" /></svg>
);

export const Upload = (props) => (
  <svg {...base(props)}><path d="M12 20.5v-12M7 13l5-5 5 5" /><path d="M4.5 18v1.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V18" /></svg>
);

const Icon = {
  Home, Grid, GraduationCap, Teacher, Wallet, Settings, FileText, BarChart,
  CreditCard, FileEdit, AlertTriangle, Rocket, Building, Folder, Receipt,
  TrendingUp, BookOpen, Target, Award, Ticket, Key, User, Smartphone, Lock,
  Search, Plus, ClipboardList, ArrowUp, Bell, Download, Upload,
};

export default Icon;
