import Dashboard from "../components/Dashboard";

export default function dashboard() {
  const creatorId = "e242f3ff-9bd1-4f45-8780-aeb182e92730";
  return (
    <>
      <Dashboard creatorId={creatorId} playVideo={true} />
    </>
  );
}
