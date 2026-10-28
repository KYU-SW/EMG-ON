import { Link } from "react-router-dom";
import Card from "../components/Card";
import { mockSessions } from "../mock/mockSessions";

export default function Dashboard() {
  const last = mockSessions[0];
  return (
    <div className="page">
      <div className="page-title">
        <h2>오늘의 팔 운동</h2>
        <span className="badge">DEMO</span>
      </div>
      <Card>
        <h3>팔 근활성 변화를 확인해 보세요</h3>
        <p>
          표면 근전도(sEMG)를 개인별 기준값과 비교하여 팔 운동 중 근활성 구간,
          수축 지속시간, 반복 수행 횟수와 수행률을 확인합니다.
        </p>
        <Link to="/prepare" className="btn">측정 시작</Link>
      </Card>
      <Card>
        <h3>최근 운동 요약</h3>
        <p>
          {last.date} · {last.exercise} · {last.reps}/{last.targetReps}회 · 수행률{" "}
          {last.completionRate}%
        </p>
      </Card>
    </div>
  );
}