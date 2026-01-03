
import React, { useState } from 'react';
import Button from './Button';

interface StartScreenProps {
    onStart: (name: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) onStart(name.trim()); };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">📚</div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2 leading-tight">IOE K4 ĐỀ SỐ 08</h1>
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Năm học 2023 - 2024</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-left">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Họ tên của bạn</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên để bắt đầu..." className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-lg font-bold" required />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={!name.trim()}>Bắt đầu ngay</Button>
                </form>
                <p className="mt-8 text-xs text-slate-400 font-medium">Bộ đề gồm 200 câu hỏi luyện tập</p>
            </div>
        </div>
    );
};

export default StartScreen;
