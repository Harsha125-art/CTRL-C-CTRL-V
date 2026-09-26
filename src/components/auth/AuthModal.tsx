'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Briefcase, Lock, Mail, ArrowRight, X } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, role } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(role || 'candidate');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, email || undefined, name || undefined);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md px-4 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">HireRank Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">Select your portal access level to continue</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-black/40 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setSelectedRole('candidate')}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
              selectedRole === 'candidate'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Candidate / Employee</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('recruiter')}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
              selectedRole === 'recruiter'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Recruiter Portal</span>
          </button>
        </div>

        {/* Instant 1-Click Demo Buttons */}
        <div className="space-y-2.5 mb-6">
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 text-center">
            Fast 1-Click Role Login
          </p>
          <button
            type="button"
            onClick={() => login('recruiter', 'recruiter@techcorp.com', 'Sarah Jenkins')}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-indigo-400" />
              Recruiter Demo (Access All Candidates)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => login('candidate', 'alex.rivera@example.com', 'Alex Rivera')}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2 text-emerald-400" />
              Candidate Demo (Take Interview & Personal Feedback)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-500">Or custom login</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Custom Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === 'recruiter' ? 'Sarah Jenkins' : 'Alex Rivera'}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'recruiter' ? 'recruiter@company.com' : 'candidate@gmail.com'}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all mt-2"
          >
            Enter {selectedRole === 'recruiter' ? 'Recruiter Talent Hub' : 'Interview Portal'} &rarr;
          </button>
        </form>
      </motion.div>
    </div>
  );
}
