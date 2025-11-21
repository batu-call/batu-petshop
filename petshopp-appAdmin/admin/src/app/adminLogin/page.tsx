import AdminLoginForm from "./components/AdminLogin";

export default function AdminLoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-primary">
      <div className="bg-white p-12 rounded-2xl shadow-2xl">
        <AdminLoginForm />
      </div>
    </div>
  );
}