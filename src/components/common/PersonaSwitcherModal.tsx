import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { X, ShieldCheck, Store, UserCheck, Check, Sparkles, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../../types';

interface PersonaSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoleView?: (role: UserRole) => void;
}

export const PersonaSwitcherModal: React.FC<PersonaSwitcherModalProps> = ({ isOpen, onClose, onSelectRoleView }) => {
  const { currentUser, availableUsers, switchPersona, register } = useAuth();
  const { showToast } = useNotification();
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('customer');
  const [newStoreName, setNewStoreName] = useState('');

  if (!isOpen) return null;

  const handleSelect = async (userId: string, role: UserRole) => {
    await switchPersona(userId);
    showToast('success', `Switched active persona to ${role.toUpperCase()}`);
    if (onSelectRoleView) {
      onSelectRoleView(role);
    }
    onClose();
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      showToast('error', 'Please fill in name and email');
      return;
    }
    try {
      await register({
        name: newName,
        email: newEmail,
        role: newRole,
        storeName: newRole === 'seller' ? newStoreName || `${newName}'s Shop` : undefined
      });
      showToast('success', `Account created! Welcome, ${newName}`);
      if (onSelectRoleView) {
        onSelectRoleView(newRole);
      }
      setIsCreatingNew(false);
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create account');
    }
  };

  return (
    <AnimatePresence>
      <div id="persona-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          id="persona-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#161616]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Role & Persona Switcher</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Instantly experience the OS from different roles</p>
              </div>
            </div>
            <button
              id="persona-modal-close-btn"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!isCreatingNew ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Pre-configured Demo Personas
                </p>

                <div className="grid gap-3">
                  {availableUsers.map(user => {
                    const isCurrent = currentUser?.id === user.id;
                    const getRoleBadge = () => {
                      if (user.role === 'admin') {
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        );
                      }
                      if (user.role === 'seller') {
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            <Store className="w-3 h-3" /> Seller
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <UserCheck className="w-3 h-3" /> Customer
                        </span>
                      );
                    };

                    return (
                      <button
                        key={user.id}
                        id={`persona-select-btn-${user.id}`}
                        onClick={() => handleSelect(user.id, user.role)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 ring-1 ring-zinc-900 dark:ring-zinc-100'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{user.name}</span>
                              {getRoleBadge()}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {user.storeName ? `Store: ${user.storeName}` : user.email}
                            </p>
                          </div>
                        </div>

                        {isCurrent ? (
                          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-200/60 dark:bg-zinc-700/60 px-2.5 py-1 rounded-md">
                            <Check className="w-3.5 h-3.5" /> Active
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Switch &rarr;</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    id="persona-create-toggle-btn"
                    onClick={() => setIsCreatingNew(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> Create Custom Test User / Vendor
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Create New Account</h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    &larr; Back to personas
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Account Type / Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['customer', 'seller', 'admin'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewRole(r)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-all ${
                          newRole === r
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>

                {newRole === 'seller' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Store / Brand Name</label>
                    <input
                      type="text"
                      value={newStoreName}
                      onChange={e => setNewStoreName(e.target.value)}
                      placeholder="e.g. Lin Nordic Studio"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="flex-1 py-2 px-4 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="persona-create-submit-btn"
                    className="flex-1 py-2 px-4 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
                  >
                    Register & Activate
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
