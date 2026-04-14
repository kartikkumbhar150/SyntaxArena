export function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Recruiter Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-neutral-400 text-sm font-medium">Active Assessments</h3>
          <p className="text-3xl font-bold text-white mt-2">12</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-neutral-400 text-sm font-medium">Candidates Interviewed</h3>
          <p className="text-3xl font-bold text-white mt-2">148</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-neutral-400 text-sm font-medium">Average Score</h3>
          <p className="text-3xl font-bold text-white mt-2">720 <span className="text-sm font-normal text-neutral-500">/ 850</span></p>
        </div>
      </div>
    </div>
  );
}
