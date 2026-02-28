import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
            <h1 className="text-5xl font-extrabold text-slate-800">404</h1>
            <p className="mt-2 text-slate-500 text-center">
                The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
                to="/"
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
            >
                Go back to Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;
