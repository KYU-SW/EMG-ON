import Card from "../components/Card";
import { mockSessions } from "../mock/mockSessions";

export default function History() {
  return (
    <div className="page">
      <div className="page-title">
        <h2>팔 운동 기록</h2>
        <span className="badge">개인 기록</span>
      </div>
      {mockSessions.map((s) => (
        <Card key={s.id}>
          <div className="record">
            <strong>{s.date} · {s.exercise}</strong>
            <span>
              {s.reps}/{s.targetReps}회 · 평균 {s.avgContraction}초 · 수행률{" "}
              {s.completionRate}%
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}