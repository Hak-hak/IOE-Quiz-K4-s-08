
import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import Button from './Button';
import AudioPlayer from './AudioPlayer';

interface QuestionCardProps {
    question: Question;
    onAnswer: (response: string) => void;
    isAnswered: boolean;
    userAnswer?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, isAnswered, userAnswer }) => {
    const [inputVal, setInputVal] = useState('');
    const [selectedParts, setSelectedParts] = useState<string[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [hintData, setHintData] = useState<{ main: string; extra?: string; translation?: string }>({ main: '' });

    useEffect(() => {
        setInputVal('');
        setSelectedParts([]);
        setShowHint(false);
        setHintData({ main: '' });
    }, [question.id]);

    const normalize = (str: string) => str ? str.replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase() : "";
    const isCorrect = () => userAnswer && normalize(userAnswer) === normalize(question.correctAnswer);

    const handleMCSelect = (opt: string) => !isAnswered && onAnswer(opt);
    const handleInputSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!isAnswered && inputVal.trim()) onAnswer(inputVal.trim()); };
    const handlePartClick = (part: string) => { if (!isAnswered) setSelectedParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]); };
    const handleRearrangeSubmit = () => !isAnswered && selectedParts.length > 0 && onAnswer(selectedParts.join(' '));

    const generateDetailedHint = () => {
        if (hintData.main) return;
        
        let mainHint = '';
        let extraHint = '';
        // Ưu tiên vietnameseHint, nếu không có thì lấy phần đầu của explanation nếu nó ngắn
        let translation = question.vietnameseHint || (question.explanation.length < 60 ? question.explanation : 'Xem giải nghĩa bên dưới.');

        if (question.type === QuestionType.MULTIPLE_CHOICE) {
            const wrongOptions = question.options?.filter(opt => opt !== question.correctAnswer) || [];
            const randomWrong = wrongOptions.length > 0 ? wrongOptions[Math.floor(Math.random() * wrongOptions.length)] : '';
            mainHint = `Mẹo: Đáp án "${randomWrong}" là sai.`;
            extraHint = `Bắt đầu bằng chữ cái "${question.correctAnswer.charAt(0).toUpperCase()}".`;
        } 
        else if (question.type === QuestionType.FILL_IN_BLANK) {
            const answer = question.correctAnswer.trim();
            mainHint = `Từ này có ${answer.length} chữ cái.`;
            if (answer.length > 1) {
                extraHint = `Ký tự: "${answer.charAt(0).toUpperCase()} ... ${answer.charAt(answer.length - 1).toLowerCase()}".`;
            }
        } 
        else if (question.type === QuestionType.REARRANGE) {
            const words = question.correctAnswer.split(' ');
            mainHint = `Kiểu câu: Đây là một câu ${question.correctAnswer.endsWith('?') ? 'HỎI' : 'KỂ'}.`;
            extraHint = `Bắt đầu bằng: "${words.slice(0, 2).join(' ')} ..."`;
        }

        setHintData({ main: mainHint, extra: extraHint, translation: translation });
    };

    return (
        <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider">
                            {question.type.replace(/_/g, ' ')}
                        </span>
                        {!isAnswered && (
                            <button 
                                onClick={() => { generateDetailedHint(); setShowHint(!showHint); }} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-2 ${showHint ? 'bg-yellow-400 text-white border-yellow-500 shadow-md' : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'}`}
                            >
                                <span>{showHint ? '🙈 Ẩn gợi ý' : '✨ Hiện gợi ý'}</span>
                            </button>
                        )}
                    </div>
                    <span className="text-xs font-bold text-slate-300 italic">Câu {question.id}</span>
                </div>
                
                <div className="p-6 sm:p-10">
                    <div className="mb-8 space-y-4">
                        {question.imageUrl && (
                            <div className="flex justify-center bg-slate-50 p-4 rounded-2xl">
                                <img src={question.imageUrl} className="max-h-64 rounded-xl shadow-sm" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} alt="Câu hỏi" />
                            </div>
                        )}
                        {question.audioUrl && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                                <AudioPlayer src={question.audioUrl} />
                            </div>
                        )}
                    </div>

                    {showHint && !isAnswered && (
                        <div className="mb-8 bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-100 shadow-inner animate-fade-in">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white text-lg shadow-sm">💡</div>
                                <strong className="text-yellow-800 font-black uppercase tracking-widest text-sm">Gợi ý chi tiết</strong>
                            </div>
                            
                            <div className="space-y-4">
                                {hintData.translation && (
                                    <div className="bg-white/70 p-4 rounded-xl border border-yellow-200 shadow-sm">
                                        <span className="text-[10px] font-black text-yellow-600 uppercase block mb-1 tracking-widest">Dịch nghĩa & Từ vựng:</span>
                                        <p className="text-yellow-900 font-bold italic leading-relaxed text-base">"{hintData.translation}"</p>
                                    </div>
                                )}
                                <div className="pl-3 border-l-4 border-yellow-300 space-y-1.5">
                                    <p className="text-yellow-900 font-bold text-sm">• {hintData.main}</p>
                                    {hintData.extra && <p className="text-yellow-800 font-medium text-sm italic">• {hintData.extra}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-8 leading-tight">
                        {question.questionText}
                    </h2>

                    {question.type === QuestionType.MULTIPLE_CHOICE && (
                        <div className="grid grid-cols-1 gap-4">
                            {question.options?.map((opt, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handleMCSelect(opt)} 
                                    disabled={isAnswered} 
                                    className={`group w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${
                                        isAnswered 
                                        ? (opt === question.correctAnswer ? 'bg-green-100 border-green-500 text-green-900 ring-4 ring-green-50' : opt === userAnswer ? 'bg-red-100 border-red-500 text-red-900' : 'bg-slate-50 opacity-40') 
                                        : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                                >
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-colors ${
                                        isAnswered && opt === question.correctAnswer ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                                    }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-lg font-bold">{opt}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {question.type === QuestionType.FILL_IN_BLANK && (
                        <form onSubmit={handleInputSubmit} className="space-y-4">
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    value={isAnswered ? userAnswer : inputVal} 
                                    onChange={(e) => setInputVal(e.target.value)} 
                                    disabled={isAnswered} 
                                    className={`flex-1 p-5 rounded-2xl border-2 text-2xl font-black outline-none transition-all ${
                                        isAnswered 
                                        ? (isCorrect() ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') 
                                        : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm'
                                    }`} 
                                    placeholder="Nhập đáp án..." 
                                />
                                {!isAnswered && <Button type="submit" size="lg" className="px-10">Gửi</Button>}
                            </div>
                            {!isAnswered && <div className="text-sm font-bold text-slate-400 text-right pr-2">Số chữ cái: {inputVal.length}</div>}
                        </form>
                    )}

                    {question.type === QuestionType.REARRANGE && (
                        <div className="space-y-8">
                            <div className="flex flex-wrap gap-3 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner min-h-[80px]">
                                {question.rearrangeParts?.map((part, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => handlePartClick(part)} 
                                        disabled={isAnswered || selectedParts.includes(part)} 
                                        className={`px-5 py-3 rounded-xl bg-white border-2 border-slate-100 font-black shadow-sm transition-all active:scale-90 ${
                                            selectedParts.includes(part) ? 'opacity-0 scale-0 pointer-events-none' : 'hover:border-blue-400 hover:text-blue-600'
                                        }`}
                                    >
                                        {part}
                                    </button>
                                ))}
                            </div>
                            
                            <div className={`min-h-[100px] p-6 rounded-3xl border-2 flex flex-wrap gap-3 items-center transition-all ${
                                isAnswered 
                                ? (isCorrect() ? 'border-green-500 bg-green-50/50 shadow-inner' : 'border-red-500 bg-red-50/50 shadow-inner') 
                                : 'border-blue-100 bg-white shadow-sm'
                            }`}>
                                {selectedParts.length === 0 && !isAnswered && <div className="w-full text-center text-slate-300 font-bold italic">Chọn các từ ở trên để hoàn thành câu...</div>}
                                {selectedParts.map((part, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => handlePartClick(part)} 
                                        disabled={isAnswered} 
                                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black shadow-md hover:bg-rose-500 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {part}
                                    </button>
                                ))}
                            </div>
                            
                            {!isAnswered && (
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setSelectedParts([])} className="text-slate-400 hover:text-rose-500 font-bold px-4 transition-colors">Làm mới</button>
                                    <Button onClick={handleRearrangeSubmit} disabled={selectedParts.length === 0} size="lg">Xác nhận</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {isAnswered && (
                        <div className={`mt-10 p-8 rounded-[32px] border-l-8 shadow-xl animate-fade-in ${isCorrect() ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                            <div className="flex items-start gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white text-2xl shadow-lg ${isCorrect() ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {isCorrect() ? '🌟' : '❗'}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-black text-2xl mb-3 ${isCorrect() ? 'text-green-800' : 'text-red-800'}`}>
                                        {isCorrect() ? 'Chính Xác!' : 'Opps! Sai Rồi...'}
                                    </h3>
                                    {!isCorrect() && (
                                        <div className="mb-4 p-4 bg-white/60 rounded-2xl border border-red-100">
                                            <span className="text-red-600 font-black text-xs uppercase tracking-widest block mb-1">Đáp án đúng là:</span>
                                            <span className="font-black text-xl text-slate-800">{question.correctAnswer}</span>
                                        </div>
                                    )}
                                    <div className="bg-white/80 p-5 rounded-2xl text-slate-700">
                                        <span className="font-black text-blue-600 text-xs uppercase tracking-widest block mb-2 underline decoration-blue-200 decoration-2 underline-offset-4">Giải thích & Dịch nghĩa:</span>
                                        <p className="font-bold leading-relaxed italic">"{question.explanation}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
