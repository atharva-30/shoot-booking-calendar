import { loginWithGoogle } from '../auth';

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-[350px]">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">
          Aperture Studio
        </h1>

        <p className="text-zinc-500 mb-6">
          Sign in to continue
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-zinc-900 text-white py-3 rounded-xl hover:bg-zinc-800 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
