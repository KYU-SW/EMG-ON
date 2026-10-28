import Card from "../components/Card";

export default function Result() {
  return (
    <div className="page">
      <div className="page-title">
        <h2>운동 결과</h2>
        <span className="badge">팔 운동 완료</span>
      </div>

      <Card>
        <div className="stat-label">유효 반복</div>
        <div className="stat-big">8회</div>
      </Card>
      <Card>
        <div className="stat-label">평균 수축시간</div>
        <div className="stat-big">2.8초</div>
      </Card>
      <Card>
        <div className="stat-label">수행률</div>
        <div className="stat-big">80%</div>
      </Card>
      <Card>
        <h3>수행 피드백</h3>
        <p>
          목표 10회 중 8회의 유효 수행이 확인되었습니다. 충분히 이완한 뒤 일정한
          리듬으로 반복해 보세요.
        </p>
      </Card>
      <Card>
        <h3>추천 콘텐츠</h3>
        <p>상완이두근 팔꿈치 굽힘 기본 동작 · 초급 가이드</p>
      </Card>
    </div>
  );
}