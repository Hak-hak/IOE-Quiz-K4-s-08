
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GameState, Question, QuestionType, UserAnswer } from './types';
import { QUIZ_DATA } from './constants';

/** UI Components **/

const Button: React.FC<any> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transform active:scale-95";
    const variants: any = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 focus:ring-blue-500",
        secondary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 focus:ring-emerald-500",
        danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 focus:ring-rose-500",
        outline: "bg-white border-2 border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600"
    };
    const sizes: any = { sm: "px-4 py-1.5 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };
    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };
    return (
        <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-lg border border-slate-200">
            <button type="button" onClick={togglePlay} className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                {isPlaying ? '❚❚' : '▶'}
            </button>
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Nghe câu hỏi</span>
            <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} className="hidden" />
        </div>
    );
};

/** QuestionCard with Vietnamese Hints **/

const QuestionCard: React.FC<{ question: Question; onAnswer: (response: string) => void; isAnswered: boolean; userAnswer?: string }> = ({ question, onAnswer, isAnswered, userAnswer }) => {
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

    const generateDetailedHint = () => {
        if (hintData.main) return;
        let mainHint = '';
        let extraHint = '';
        let translation = question.vietnameseHint || (question.explanation.length < 60 ? question.explanation : 'Xem giải nghĩa bên dưới.');

        if (question.type === QuestionType.MULTIPLE_CHOICE) {
            const wrongOptions = question.options?.filter(opt => opt !== question.correctAnswer) || [];
            const randomWrong = wrongOptions.length > 0 ? wrongOptions[Math.floor(Math.random() * wrongOptions.length)] : '';
            mainHint = `Loại trừ: Đáp án "${randomWrong}" là không đúng.`;
            extraHint = `Bắt đầu bằng chữ cái: "${question.correctAnswer.charAt(0).toUpperCase()}".`;
        } 
        else if (question.type === QuestionType.FILL_IN_BLANK) {
            const answer = question.correctAnswer.trim();
            mainHint = `Số lượng ký tự: ${answer.length}.`;
            if (answer.length > 1) {
                extraHint = `Gợi ý ký tự: "${answer.charAt(0).toUpperCase()} ... ${answer.charAt(answer.length - 1).toLowerCase()}".`;
            }
        } 
        else if (question.type === QuestionType.REARRANGE) {
            const words = question.correctAnswer.split(' ');
            mainHint = `Loại câu: Đây là một câu ${question.correctAnswer.endsWith('?') ? 'HỎI' : 'KỂ/KHẲNG ĐỊNH'}.`;
            extraHint = `Hai từ đầu tiên: "${words.slice(0, 2).join(' ')} ..."`;
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
                            <button onClick={() => { generateDetailedHint(); setShowHint(!showHint); }} className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-2 ${showHint ? 'bg-yellow-400 text-white border-yellow-500 shadow-md' : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'}`}>
                                <span>{showHint ? '🙈 Ẩn gợi ý' : '✨ Hiện gợi ý'}</span>
                            </button>
                        )}
                    </div>
                    <span className="text-xs font-bold text-slate-300 italic">Câu {question.id}</span>
                </div>
                
                <div className="p-6 sm:p-10">
                    <div className="mb-8 space-y-4">
                        {question.imageUrl && <div className="flex justify-center bg-slate-50 p-4 rounded-2xl"><img src={question.imageUrl} className="max-h-64 rounded-xl shadow-sm" alt="Câu hỏi" /></div>}
                        {question.audioUrl && <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100"><AudioPlayer src={question.audioUrl} /></div>}
                    </div>

                    {showHint && !isAnswered && (
                        <div className="mb-8 bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-100 shadow-inner animate-fade-in">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white text-lg shadow-sm">💡</div>
                                <strong className="text-yellow-800 font-black uppercase tracking-widest text-sm">Gợi ý dịch nghĩa</strong>
                            </div>
                            <div className="space-y-4">
                                {hintData.translation && (
                                    <div className="bg-white/70 p-4 rounded-xl border border-yellow-200 shadow-sm">
                                        <span className="text-[10px] font-black text-yellow-600 uppercase block mb-1 tracking-widest">Dịch & Từ vựng:</span>
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

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-8 leading-tight">{question.questionText}</h2>

                    {question.type === QuestionType.MULTIPLE_CHOICE && (
                        <div className="grid grid-cols-1 gap-4">
                            {question.options?.map((opt, idx) => (
                                <button key={idx} onClick={() => !isAnswered && onAnswer(opt)} disabled={isAnswered} className={`group w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${isAnswered ? (opt === question.correctAnswer ? 'bg-green-100 border-green-500 text-green-900 ring-4 ring-green-50' : opt === userAnswer ? 'bg-red-100 border-red-500 text-red-900' : 'bg-slate-50 opacity-40') : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5'}`}>
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-colors ${isAnswered && opt === question.correctAnswer ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-lg font-bold">{opt}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {question.type === QuestionType.FILL_IN_BLANK && (
                        <form onSubmit={(e) => { e.preventDefault(); if(!isAnswered && inputVal.trim()) onAnswer(inputVal.trim()); }} className="space-y-4">
                            <div className="flex gap-3">
                                <input type="text" value={isAnswered ? userAnswer : inputVal} onChange={(e) => setInputVal(e.target.value)} disabled={isAnswered} className={`flex-1 p-5 rounded-2xl border-2 text-2xl font-black outline-none transition-all ${isAnswered ? (isCorrect() ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm'}`} placeholder="Nhập đáp án..." />
                                {!isAnswered && <Button type="submit" size="lg" className="px-10">Gửi</Button>}
                            </div>
                            {!isAnswered && <div className="text-sm font-bold text-slate-400 text-right pr-2">Số chữ cái: {inputVal.length}</div>}
                        </form>
                    )}

                    {question.type === QuestionType.REARRANGE && (
                        <div className="space-y-8">
                            <div className="flex flex-wrap gap-3 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner min-h-[80px]">
                                {question.rearrangeParts?.map((part, idx) => (
                                    <button key={idx} onClick={() => !isAnswered && setSelectedParts(p => p.includes(part) ? p.filter(x => x !== part) : [...p, part])} disabled={isAnswered || selectedParts.includes(part)} className={`px-5 py-3 rounded-xl bg-white border-2 border-slate-100 font-black shadow-sm transition-all active:scale-90 ${selectedParts.includes(part) ? 'opacity-0 scale-0 pointer-events-none' : 'hover:border-blue-400 hover:text-blue-600'}`}>
                                        {part}
                                    </button>
                                ))}
                            </div>
                            <div className={`min-h-[100px] p-6 rounded-3xl border-2 flex flex-wrap gap-3 items-center transition-all ${isAnswered ? (isCorrect() ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50') : 'border-blue-100 bg-white shadow-sm'}`}>
                                {selectedParts.length === 0 && !isAnswered && <div className="w-full text-center text-slate-300 font-bold italic">Bấm chọn các từ để hoàn chỉnh câu...</div>}
                                {selectedParts.map((part, idx) => <button key={idx} onClick={() => !isAnswered && setSelectedParts(p => p.filter((_, i) => i !== idx))} disabled={isAnswered} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black shadow-md hover:bg-rose-500 transition-all">{part}</button>)}
                            </div>
                            {!isAnswered && (
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setSelectedParts([])} className="text-slate-400 hover:text-rose-500 font-bold px-4">Xóa hết</button>
                                    <Button onClick={() => onAnswer(selectedParts.join(' '))} disabled={selectedParts.length === 0} size="lg">Xác nhận</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {isAnswered && (
                        <div className={`mt-10 p-8 rounded-[32px] border-l-8 shadow-xl animate-fade-in ${isCorrect() ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                            <div className="flex items-start gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white text-2xl shadow-lg ${isCorrect() ? 'bg-green-500' : 'bg-red-500'}`}>{isCorrect() ? '🌟' : '❗'}</div>
                                <div className="flex-1">
                                    <h3 className={`font-black text-2xl mb-3 ${isCorrect() ? 'text-green-800' : 'text-red-800'}`}>{isCorrect() ? 'Bạn làm rất tốt!' : 'Rất tiếc, chưa đúng...'}</h3>
                                    {!isCorrect() && <div className="mb-4 p-4 bg-white/60 rounded-2xl border border-red-100"><span className="text-red-600 font-black text-xs uppercase tracking-widest block mb-1">Đáp án đúng là:</span><span className="font-black text-xl text-slate-800">{question.correctAnswer}</span></div>}
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

const QuestionGrid: React.FC<any> = ({ questions, userAnswers, currentIndex, onJump, onClose }) => {
    const getStatusColor = (q: Question, idx: number) => {
        const ans = userAnswers.find((a: UserAnswer) => a.questionId === q.id);
        if (idx === currentIndex) return "ring-2 ring-blue-500 border-blue-500 text-blue-600 bg-white";
        if (!ans) return "bg-slate-100 text-slate-400 border-transparent";
        return ans.isCorrect ? "bg-green-500 text-white border-green-600" : "bg-red-500 text-white border-red-600";
    };
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <div><h2 className="text-xl font-bold">Danh sách câu hỏi</h2><p className="text-sm text-slate-500">Tiến độ: {userAnswers.length} / {questions.length}</p></div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar grid grid-cols-5 sm:grid-cols-10 gap-3">
                    {questions.map((q: any, idx: number) => <button key={q.id} onClick={() => { onJump(idx); onClose(); }} className={`h-10 w-10 rounded-lg font-bold border transition-all ${getStatusColor(q, idx)}`}>{idx + 1}</button>)}
                </div>
            </div>
        </div>
    );
};

const ResultScreen: React.FC<any> = ({ userName, userAnswers, onRetryAll, onRetryWrong }) => {
    const correct = userAnswers.filter((a: any) => a.isCorrect).length;
    const total = userAnswers.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in bg-slate-50 text-center">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl w-full">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Tuyệt vời, {userName}!</h2>
                <div className="text-5xl font-black text-blue-600 mb-8">{correct * 10} Điểm</div>
                <div className="grid grid-cols-2 gap-4 mb-10 bg-slate-50 p-6 rounded-3xl">
                    <div><div className="text-3xl font-black text-green-600">{correct}</div><div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đúng</div></div>
                    <div className="border-l border-slate-200"><div className="text-3xl font-black text-red-500">{total - correct}</div><div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sai</div></div>
                </div>
                <div className="flex gap-4 justify-center">
                    <Button onClick={onRetryAll} size="lg">Học lại từ đầu</Button>
                    {correct < total && <Button onClick={onRetryWrong} variant="danger" size="lg">Làm lại câu sai</Button>}
                </div>
            </div>
        </div>
    );
};

const StartScreen: React.FC<{ onStart: (name: string) => void }> = ({ onStart }) => {
    const [name, setName] = useState('');
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
                <div className="mb-8"><div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">📖</div><h1 className="text-3xl font-extrabold text-slate-800 mb-2 leading-tight">IOE K4 ĐỀ SỐ 08</h1><p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Luyện thi 2023 - 2024</p></div>
                <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onStart(name.trim()); }} className="space-y-6">
                    <div className="text-left"><label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Tên của bạn:</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên..." className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-lg font-bold" required /></div>
                    <Button type="submit" className="w-full" size="lg" disabled={!name.trim()}>Bắt đầu luyện tập</Button>
                </form>
            </div>
        </div>
    );
};

/** Main Application **/

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.START);
    const [userName, setUserName] = useState('');
    const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [showGrid, setShowGrid] = useState(false);

    const startSession = (questions: Question[]) => {
        setActiveQuestions(questions);
        setCurrentIndex(0);
        setUserAnswers([]);
        setGameState(GameState.PLAYING);
    };

    const handleAnswer = (response: string) => {
        const q = activeQuestions[currentIndex];
        const normalize = (s: string) => s.replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        const isCorrect = normalize(response) === normalize(q.correctAnswer);
        setUserAnswers(prev => [...prev.filter(a => a.questionId !== q.id), { questionId: q.id, userResponse: response, isCorrect }]);
    };

    if (gameState === GameState.START) return <StartScreen onStart={(name) => { setUserName(name); startSession(QUIZ_DATA); }} />;
    if (gameState === GameState.FINISHED) return <ResultScreen userName={userName} userAnswers={userAnswers} onRetryAll={() => startSession(QUIZ_DATA)} onRetryWrong={() => { const wrongIds = userAnswers.filter(a => !a.isCorrect).map(a => a.questionId); startSession(QUIZ_DATA.filter(q => wrongIds.includes(q.id))); }} />;

    const currentQ = activeQuestions[currentIndex];
    const answer = userAnswers.find(a => a.questionId === currentQ.id);
    const isAnswered = !!answer;
    
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 pb-32">
            <div className="w-full max-w-3xl flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Học viên</span><span className="font-black text-slate-700">{userName}</span></div>
                <div className="flex flex-col items-center px-6 border-l border-r border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm số</span><span className="font-black text-emerald-600 text-2xl">{userAnswers.filter(a => a.isCorrect).length * 10}</span></div>
                <button onClick={() => setShowGrid(true)} className="px-3 py-1.5 bg-slate-50 hover:bg-white border rounded-lg text-xs font-black text-slate-500 transition-all uppercase tracking-tighter shadow-sm">📑 Lưới câu hỏi</button>
                <div className="flex flex-col items-end"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến trình</span><span className="font-black text-blue-600 text-2xl">{currentIndex + 1}<span className="text-slate-300 text-sm">/{activeQuestions.length}</span></span></div>
            </div>

            <div className="w-full max-w-3xl bg-slate-200 rounded-full h-1.5 mb-8 overflow-hidden"><div className="bg-blue-600 h-full transition-all duration-300 shadow-sm" style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}></div></div>

            <QuestionCard question={currentQ} onAnswer={handleAnswer} isAnswered={isAnswered} userAnswer={answer?.userResponse} />

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t shadow-lg z-10">
                <div className="w-full max-w-3xl mx-auto flex justify-between items-center gap-4">
                    <Button onClick={() => currentIndex > 0 && setCurrentIndex(c => c - 1)} variant="outline" disabled={currentIndex === 0} className="w-24">← Trước</Button>
                    <div className="flex-1 flex justify-center gap-3">
                        {isAnswered ? (
                            <>
                                {currentIndex < activeQuestions.length - 1 ? <Button onClick={() => setCurrentIndex(c => c + 1)} size="md">Câu tiếp →</Button> : <Button onClick={() => setGameState(GameState.FINISHED)} variant="secondary">Kết thúc</Button>}
                            </>
                        ) : <Button onClick={() => currentIndex < activeQuestions.length - 1 && setCurrentIndex(c => c + 1)} variant="outline" className="text-slate-400">Bỏ qua</Button>}
                    </div>
                    <Button onClick={() => currentIndex < activeQuestions.length - 1 && setCurrentIndex(c => c + 1)} variant="outline" disabled={currentIndex === activeQuestions.length - 1} className="w-24">Sau →</Button>
                </div>
            </div>
            {showGrid && <QuestionGrid questions={activeQuestions} userAnswers={userAnswers} currentIndex={currentIndex} onJump={setCurrentIndex} onClose={() => setShowGrid(false)} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
