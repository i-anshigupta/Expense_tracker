import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import {
    updateProfileApi,
    changePasswordApi,
    setUser,
    resetAuthState,
} from "../../features/auth/authSlice";

const AVATAR_COLORS = [
    "emerald",
    "sky",
    "rose",
    "amber",
    "violet",
    "slate",
    "teal",
];
const colorMap = {
    emerald: "#10B981",
    sky: "#0EA5E9",
    rose: "#F43F5E",
    amber: "#F59E0B",
    violet: "#8B5CF6",
    slate: "#64748B",
    teal: "#14B8A6",
};

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { user, token, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || "",
        avatarColor: user?.avatarColor || "emerald",
    });

    const avatarHex = colorMap[form.avatarColor] || colorMap["emerald"];

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (isError) {
            toast.error(message || "An error occurred");
            dispatch(resetAuthState());
        }

        if (isSuccess) {
            toast.success("Operation successful");
            dispatch(resetAuthState());
        }
    }, [isError, isSuccess, message, dispatch]);

    useEffect(() => {
        setForm({
            name: user?.name || "",
            avatarColor: user?.avatarColor || "emerald",
        });
    }, [user]);

    const onChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        if (!form.name) {
            toast.error("Name cannot be empty");
            return;
        }

        try {
            const res = await dispatch(
                updateProfileApi({ name: form.name, avatarColor: form.avatarColor })
            ).unwrap();

            dispatch(setUser(res.user));
            setEditing(false);
        } catch (err) {
            toast.error(err || "Failed to update profile");
        }
    };

    const openPasswordModal = () => {
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setShowPasswordModal(true);
    };

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = passwordForm;
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must have at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await dispatch(
                changePasswordApi({ currentPassword, newPassword })
            ).unwrap();
            toast.success("Password changed successfully");
            setShowPasswordModal(false);
        } catch (err) {
            toast.error(err || "Failed to change password");
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-800">
                    Profile
                </h1>
                <p className="text-sm text-slate-800 dark:text-slate-800 mt-1">
                    Manage your account details
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border-2 border-slate-100 dark:border-slate-600">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Avatar */}
                    <div
                        className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm"
                        style={{ backgroundColor: avatarHex }}
                    >
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Name
                        </p>
                        <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                            {user?.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {user?.email}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditing((s) => !s)}
                            className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
                        >
                            {editing ? "Cancel" : "Edit Profile"}
                        </button>

                        <button
                            onClick={openPasswordModal}
                            className="px-4 py-2 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            Change Password
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                {editing && (
                    <form onSubmit={saveProfile} className="mt-6 pt-6 border-t-2 border-slate-100 dark:border-slate-600 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                Name
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                Avatar Color
                            </label>
                            <div className="flex gap-3 items-center flex-wrap">
                                {AVATAR_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, avatarColor: c }))}
                                        className={`h-10 w-10 rounded-full transition-all ${form.avatarColor === c
                                            ? "ring-4 ring-emerald-500 dark:ring-emerald-400 scale-110"
                                            : "ring-2 ring-slate-200 dark:ring-slate-600 hover:scale-105"
                                            }`}
                                        style={{ backgroundColor: colorMap[c] }}
                                        title={c.charAt(0).toUpperCase() + c.slice(1)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="px-4 py-2 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xl w-full max-w-md relative">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-3 right-3 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                            Change Password
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            Enter your current password and choose a new one
                        </p>

                        <form onSubmit={submitPasswordChange} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) =>
                                        setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                                    }
                                    className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={(e) =>
                                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                                    }
                                    className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Enter new password (min. 6 characters)"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                                    }
                                    className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;