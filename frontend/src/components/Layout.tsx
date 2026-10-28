import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "대시보드" },
  { to: "/prepare", label: "측정 준비" },
  { to: "/live", label: "실시간 측정" },
  { to: "/result", label: "운동 결과" },
  { to: "/history", label: "운동 기록" },
];

export default function Layout() {
  return (
    <div className="app">
      <header className="header">
        <h1>EMG:ON</h1>
        <p>팔 근전도 기반 운동 수행 모니터</p>
        <nav className="tabs">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/"}
              className={({ isActive }) => (isActive ? "tab active" : "tab")}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}