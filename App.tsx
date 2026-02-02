
import React, { useState } from 'react';
import { Level, Grade, Subject, Specialization, ViewState, ReviewPeriod } from './types';
import { generateLesson, generateReview } from './services/gemini';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [mode, setMode] = useState<'lesson' | 'review'>('lesson');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ReviewPeriod | null>(null);
  const [lessonData, setLessonData] = useState<any | null>(null);
  const [reviewData, setReviewData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [lessonSearch, setLessonSearch] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  const levels: Record<Level, { label: string; grades: Grade[]; subjects?: Subject[] }> = {
    primary: {
      label: 'الطور الابتدائي',
      grades: [
        { id: 1, label: 'الأولى ابتدائي' },
        { id: 2, label: 'الثانية ابتدائي' },
        { id: 3, label: 'الثالثة ابتدائي' },
        { id: 4, label: 'الرابعة ابتدائي' },
        { id: 5, label: 'الخامسة ابتدائي' },
      ],
      subjects: [
        { id: 'ar', name: 'اللغة العربية', icon: '📖' },
        { id: 'math', name: 'الرياضيات', icon: '➕' },
        { id: 'islamic', name: 'التربية الإسلامية', icon: '🕌' },
        { id: 'sci', name: 'التربية العلمية والتكنولوجية', icon: '🧪' },
        { id: 'hist-geo', name: 'التاريخ والجغرافيا', icon: '🌍' },
        { id: 'civic', name: 'التربية المدنية', icon: '🏢' },
        { id: 'fr', name: 'اللغة الفرنسية', icon: '🇫🇷' },
        { id: 'en', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
      ]
    },
    middle: {
      label: 'الطور المتوسط',
      grades: [
        { id: 1, label: 'الأولى متوسط' },
        { id: 2, label: 'الثانية متوسط' },
        { id: 3, label: 'الثالثة متوسط' },
        { id: 4, label: 'الرابعة متوسط (BEM)' },
      ],
      subjects: [
        { id: 'ar', name: 'اللغة العربية', icon: '📖' },
        { id: 'math', name: 'الرياضيات', icon: '📐' },
        { id: 'phys', name: 'العلوم الفيزيائية والتكنولوجيا', icon: '⚡' },
        { id: 'sci', name: 'علوم الطبيعة والحياة', icon: '🌱' },
        { id: 'hist-geo', name: 'التاريخ والجغرافيا', icon: '🗺️' },
        { id: 'islamic', name: 'التربية الإسلامية', icon: '🌙' },
        { id: 'fr', name: 'اللغة الفرنسية', icon: '🇫🇷' },
        { id: 'en', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
        { id: 'civic', name: 'التربية المدنية', icon: '⚖️' },
        { id: 'it', name: 'المعلوماتية', icon: '💻' },
      ]
    },
    secondary: {
      label: 'الطور الثانوي',
      grades: [
        { id: 1, label: 'الأولى ثانوي' },
        { id: 2, label: 'الثانية ثانوي' },
        { id: 3, label: 'الثالثة ثانوي (BAC)' },
      ]
    }
  };

  const secondarySpecializations: Specialization[] = [
    { id: 'sci', name: 'علوم تجريبية', icon: '🧬' },
    { id: 'math', name: 'رياضيات', icon: '📐' },
    { id: 'tech-math', name: 'تقني رياضي', icon: '⚙️' },
    { id: 'mgt-econ', name: 'تسيير واقتصاد', icon: '📈' },
    { id: 'lit-philo', name: 'آداب وفلسفة', icon: '💭' },
    { id: 'lang', name: 'لغات أجنبية', icon: '🗣️' },
  ];

  const specializationSubjects: Record<string, Subject[]> = {
    'sci': [
      { id: 'sci', name: 'علوم الطبيعة والحياة', icon: '🌱' },
      { id: 'phys', name: 'العلوم الفيزيائية', icon: '⚛️' },
      { id: 'math', name: 'الرياضيات', icon: '📊' },
      { id: 'ar', name: 'اللغة العربية وآدابها', icon: '🖋️' },
      { id: 'philo', name: 'الفلسفة', icon: '💭' },
      { id: 'hist-geo', name: 'التاريخ والجغرافيا', icon: '🌍' },
      { id: 'islamic', name: 'العلوم الإسلامية', icon: '📜' },
      { id: 'fr', name: 'اللغة الفرنسية', icon: '🇫🇷' },
      { id: 'en', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
    ],
    'math': [
      { id: 'math', name: 'الرياضيات', icon: '📐' },
      { id: 'phys', name: 'العلوم الفيزيائية', icon: '⚛️' },
      { id: 'sci', name: 'علوم الطبيعة والحياة', icon: '🧬' },
      { id: 'ar', name: 'اللغة العربية وآدابها', icon: '🖋️' },
      { id: 'philo', name: 'الفلسفة', icon: '💭' },
      { id: 'hist-geo', name: 'التاريخ والجغرافيا', icon: '🌍' },
      { id: 'islamic', name: 'العلوم الإسلامية', icon: '📜' },
      { id: 'fr', name: 'اللغة الفرنسية', icon: '🇫🇷' },
      { id: 'en', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
    ],
    'tech-math': [
      { id: 'eng', name: 'التكنولوجيا (الهندسة)', icon: '🛠️' },
      { id: 'math', name: 'الرياضيات', icon: '📐' },
      { id: 'phys', name: 'العلوم الفيزيائية', icon: '⚛️' },
      { id: 'ar', name: 'اللغة العربية وآدابها', icon: '🖋️' },
      { id: 'philo', name: 'الفلسفة', icon: '💭' },
      { id: 'hist-geo', name: 'التاريخ والجغرافيا', icon: '🌍' },
      { id: 'islamic', name: 'العلوم الإسلامية', icon: '📜' },
      { id: 'fr', name: 'اللغة الفرنسية', icon: '🇫🇷' },
      { id: 'en', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
    ],
    'mgt-econ': [
      { id: 'acc', name: 'المحاسبة والمالية', icon: '💰' },
      { id: 'econ', name: 'الاقتصاد والمناجمنت', icon: '📈' },
      { id: 'law', name: 'القانون', icon: '⚖️' },
      { id: 'math', name: 'الرياضيات', icon: '📊' },
      { id: 'ar', name: 'اللغة العربية وآدابها', icon: '🖋️' },
      { id: 'philo', name: 'الفلسفة', icon: '💭' },
      { id: 'hist-geo', name: 'التاريخ والجغرافيا', icon: '🌍' },
      { id: 'islamic', name: 'العلوم الإسلامية', icon: '📜' },
      { id: 'fr', name: 'اللغة الفرنسية', icon: '🇫🇷' },
      { id: 'en', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
    ],
    'lit-philo': [
      { id: 'philo', name: 'الفلسفة', icon: '💭' },
      { id: 'ar-lit', name: 'الأدب العربي', icon: '📖' },
      { id: 'hist-geo', name: 'التاريخ والجغرافيا', icon: '🌍' },
      { id: 'islamic', name: 'العلوم الإسلامية', icon: '📜' },
      { id: 'math', name: 'الرياضيات (أدبي)', icon: '📊' },
      { id: 'fr', name: 'اللغة الفرنسية', icon: '🇫🇷' },
      { id: 'en', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
    ],
    'lang': [
      { id: 'ar', name: 'اللغة العربية', icon: '📖' },
      { id: 'fr', name: 'اللغة الفرنسية', icon: '🇫🇷' },
      { id: 'en', name: 'اللغة الإنجليزية', icon: '🇬🇧' },
      { id: 'lang3', name: 'اللغة الثالثة (إسباني/ألماني/إيطالي)', icon: '🌐' },
      { id: 'philo', name: 'الفلسفة', icon: '💭' },
      { id: 'hist-geo', name: 'التاريخ والجغرافيا', icon: '🌍' },
      { id: 'islamic', name: 'العلوم الإسلامية', icon: '📜' },
      { id: 'math', name: 'الرياضيات (أدبي)', icon: '📊' },
    ]
  };

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setView('grades');
  };

  const handleGradeSelect = (grade: Grade) => {
    setSelectedGrade(grade);
    setView('mode_selection');
  };

  const handleModeSelect = (m: 'lesson' | 'review') => {
    setMode(m);
    if (selectedLevel === 'secondary') {
      setView('specializations');
    } else {
      setView('subjects');
    }
  };

  const handleSpecializationSelect = (spec: Specialization) => {
    setSelectedSpecialization(spec);
    setView('subjects');
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    if (mode === 'review') {
      setView('review_periods');
    } else {
      setView('lesson');
    }
  };

  const handlePeriodSelect = async (period: ReviewPeriod) => {
    setSelectedPeriod(period);
    setLoading(true);
    setReviewData(null);
    try {
      const data = await generateReview(
        levels[selectedLevel!].label,
        selectedGrade!.label,
        selectedSubject!.name,
        selectedSpecialization?.name || '',
        period
      );
      setReviewData(data);
      setView('review');
    } catch (e) {
      console.error(e);
      alert("خطأ أثناء جلب المراجعة");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLesson = async () => {
    if (!lessonSearch || !selectedLevel || !selectedGrade || !selectedSubject) return;
    setLoading(true);
    setLessonData(null);
    setShowSolution(false);
    try {
      const specLabel = selectedSpecialization ? `شعبة ${selectedSpecialization.name}` : '';
      const data = await generateLesson(
        levels[selectedLevel].label,
        selectedGrade.label,
        `${selectedSubject.name} ${specLabel}`,
        lessonSearch
      );
      setLessonData(data);
    } catch (e) {
      console.error(e);
      alert("عذراً، حدث خطأ أثناء جلب الدروس.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSubjects = () => {
    if (selectedLevel === 'secondary' && selectedSpecialization) {
      return specializationSubjects[selectedSpecialization.id] || [];
    }
    return (selectedLevel && levels[selectedLevel].subjects) || [];
  };

  const resetAll = () => {
    setView('home');
    setSelectedLevel(null);
    setSelectedGrade(null);
    setSelectedSpecialization(null);
    setSelectedSubject(null);
    setSelectedPeriod(null);
    setLessonData(null);
    setReviewData(null);
    setLessonSearch('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Tajawal'] text-slate-900 overflow-x-hidden flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetAll}>
            <div className="bg-green-600 p-2 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight">مدرستي <span className="text-green-600">الجزائرية</span></h1>
          </div>
          <div className="flex gap-4">
             <button onClick={resetAll} className="hidden md:block hover:text-green-600 transition-colors">الرئيسية</button>
             <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span>🔥</span> مراجعات نهائية
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-grow">
        {loading && (
           <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-fade-in">
              <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-2xl font-black text-slate-800">جاري تجهيز المحتوى...</h3>
              <p className="text-slate-500 mt-2">نحن نقوم بتجميع أفضل المعلومات والتلخيصات لك 🇩🇿</p>
           </div>
        )}

        {view === 'home' && (
          <section className="animate-fade-in py-10 no-print">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">رفيقك نحو <span className="text-green-600">التفوق</span> <br/>في جميع الأطوار 🇩🇿</h2>
              <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">المنصة الجزائرية الأولى التي تجمع بين شروحات الدروس اليومية والمراجعات النهائية الشاملة للشهادات.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(Object.keys(levels) as Level[]).map(l => (
                <div key={l} onClick={() => handleLevelSelect(l)} className="bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-slate-100 group text-center relative overflow-hidden">
                  <div className="text-6xl mb-6 relative z-10">{l === 'primary' ? '🎒' : l === 'middle' ? '📘' : '🎓'}</div>
                  <h3 className="text-2xl font-black mb-3 relative z-10">{levels[l].label}</h3>
                  <p className="text-slate-400 relative z-10 font-medium">ابدأ الآن</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'grades' && selectedLevel && (
          <section className="animate-slide-up no-print">
            <h2 className="text-3xl font-black mb-10 text-center">اختر السنة الدراسية</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {levels[selectedLevel].grades.map(g => (
                <button key={g.id} onClick={() => handleGradeSelect(g)} className="bg-white p-8 rounded-3xl border-2 border-slate-100 text-center hover:border-green-500 hover:shadow-lg transition-all font-bold text-xl text-slate-700 active:scale-95">
                  {g.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {view === 'mode_selection' && selectedGrade && (
          <section className="animate-slide-up no-print py-10">
            <h2 className="text-3xl font-black mb-10 text-center">ماذا تريد أن تفعل؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               <div onClick={() => handleModeSelect('lesson')} className="bg-white p-12 rounded-[2.5rem] shadow-xl border-4 border-slate-50 hover:border-green-500 transition-all cursor-pointer group text-center">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-black mb-4">شرح درس محدد</h3>
                  <p className="text-slate-500">ابحث عن درس معين واحصل على شرحه وتمارين عليه.</p>
               </div>
               <div onClick={() => handleModeSelect('review')} className="bg-white p-12 rounded-[2.5rem] shadow-xl border-4 border-slate-50 hover:border-amber-500 transition-all cursor-pointer group text-center">
                  <div className="text-6xl mb-6">🔥</div>
                  <h3 className="text-2xl font-black mb-4 text-amber-600">المراجعة الشاملة</h3>
                  <p className="text-slate-500">ملخصات الفصول، مراجعة عامة، وتحضير للشهادات النهائية.</p>
               </div>
            </div>
          </section>
        )}

        {view === 'specializations' && selectedLevel === 'secondary' && (
          <section className="animate-slide-up no-print">
            <h2 className="text-3xl font-black mb-10 text-center">اختر الشعبة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {secondarySpecializations.map(spec => (
                <button key={spec.id} onClick={() => handleSpecializationSelect(spec)} className="bg-white p-10 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-6 hover:shadow-2xl hover:border-green-500 transition-all active:scale-95 text-center">
                  <div className="text-5xl">{spec.icon}</div>
                  <span className="font-black text-xl text-slate-800">{spec.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {view === 'subjects' && selectedLevel && (
          <section className="animate-slide-up no-print">
            <h2 className="text-3xl font-black mb-10 text-center">اختر المادة</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {getCurrentSubjects().map(s => (
                <button key={s.id} onClick={() => handleSubjectSelect(s)} className="bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 hover:shadow-xl hover:border-green-500 transition-all active:scale-95 group text-center">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</div>
                  <span className="font-bold text-slate-800">{s.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {view === 'review_periods' && selectedSubject && (
           <section className="animate-slide-up no-print py-10">
              <h2 className="text-3xl font-black mb-10 text-center">اختر فترة المراجعة للمادة: {selectedSubject.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                 {[
                   { id: 'semester1', label: 'مراجعة الفصل الأول', icon: '❄️' },
                   { id: 'semester2', label: 'مراجعة الفصل الثاني', icon: '🌱' },
                   { id: 'semester3', label: 'مراجعة الفصل الثالث', icon: '☀️' },
                   { id: 'full_year', label: 'المراجعة السنوية الشاملة', icon: '📚' },
                   { id: 'certificate_prep', label: 'التحضير للشهادة النهائية', icon: '🏆', highlight: true }
                 ].map(p => (
                   <button 
                    key={p.id} 
                    onClick={() => handlePeriodSelect(p.id as ReviewPeriod)}
                    className={`p-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 text-center active:scale-95 ${p.highlight ? 'bg-amber-50 border-amber-300 shadow-amber-50' : 'bg-white border-slate-100 hover:border-green-500 shadow-xl shadow-slate-50'}`}
                   >
                     <div className="text-5xl">{p.icon}</div>
                     <span className="font-black text-xl">{p.label}</span>
                   </button>
                 ))}
              </div>
           </section>
        )}

        {view === 'lesson' && !lessonData && (
           <section className="max-w-6xl mx-auto animate-slide-up">
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center max-w-3xl mx-auto no-print">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">🔍</div>
                <h2 className="text-3xl font-black mb-6">ابحث عن عنوان الدرس</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="text" placeholder="مثلاً: المبتدأ والخبر، جملة بيثاغورس..." value={lessonSearch} onChange={(e) => setLessonSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFetchLesson()} className="flex-grow p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-green-500 text-lg" />
                  <button onClick={handleFetchLesson} className="bg-green-600 text-white px-10 py-6 rounded-[1.5rem] font-black text-lg hover:bg-green-700 shadow-xl shadow-green-100">ابحث</button>
                </div>
              </div>
           </section>
        )}

        {view === 'review' && reviewData && (
          <div className="space-y-12 animate-fade-in pb-20">
            <div className="hidden print:block border-b-8 border-amber-500 pb-10 mb-12">
               <h1 className="text-4xl font-black text-amber-700 mb-2">{reviewData.title}</h1>
               <p className="text-xl text-slate-600 font-bold">{selectedLevel && levels[selectedLevel].label} | {selectedGrade?.label} | {selectedSubject?.name} {selectedSpecialization && `| شعبة ${selectedSpecialization.name}`}</p>
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-xl border-4 border-amber-50 print:shadow-none print:border-none">
              <div className="flex justify-between items-center mb-10 no-print">
                <h2 className="text-4xl font-black text-amber-600 leading-tight">{reviewData.title}</h2>
                <button onClick={() => setView('review_periods')} className="bg-slate-100 p-3 rounded-full text-slate-400">✕</button>
              </div>

              <div className="mb-12">
                <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-2xl"><span>📝</span> التلخيص الشامل:</h4>
                <div className="prose prose-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{reviewData.summary}</div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                 <div className="bg-green-50 p-8 rounded-[2.5rem] border border-green-100">
                    <h4 className="font-black text-green-800 mb-6 flex items-center gap-3 text-xl"><span>🎯</span> التوقعات الذهبية للاختبار:</h4>
                    <ul className="space-y-4">
                       {reviewData.examPredictions?.map((p: string, i: number) => (
                         <li key={i} className="bg-white/80 p-4 rounded-xl border border-green-200 font-bold flex gap-3"><span className="text-green-600">★</span> {p}</li>
                       ))}
                    </ul>
                 </div>
                 <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
                    <h4 className="font-black text-indigo-800 mb-6 flex items-center gap-3 text-xl"><span>💡</span> نصائح المراجعة:</h4>
                    <ul className="space-y-4">
                       {reviewData.tips?.map((t: string, i: number) => (
                         <li key={i} className="bg-white/80 p-4 rounded-xl border border-indigo-200 font-bold flex gap-3"><span className="text-indigo-600">✔</span> {t}</li>
                       ))}
                    </ul>
                 </div>
              </div>

              {reviewData.tables?.map((table: any, idx: number) => (
                <div key={idx} className="mb-10 overflow-hidden rounded-[2.5rem] border border-slate-200">
                  <div className="bg-amber-600 text-white p-5 font-black text-center text-lg">{table.title}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead><tr className="bg-slate-50 border-b">{table.headers.map((h: string, hi: number) => (<th key={hi} className="p-4 font-black">{h}</th>))}</tr></thead>
                      <tbody>{table.rows.map((row: any[], ri: number) => (<tr key={ri} className="border-b">{row.map((cell: any, ci: number) => (<td key={ci} className="p-4 font-medium text-slate-600">{cell}</td>))}</tr>))}</tbody>
                    </table>
                  </div>
                </div>
              ))}

              <div className="no-print mt-10">
                 <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-2xl"><span>🎬</span> فيديوهات المراجعة الشاملة:</h4>
                 <div className="grid md:grid-cols-2 gap-6">
                    {reviewData.videos?.map((v: any, i: number) => (
                       <div key={i} className="bg-slate-900 aspect-video rounded-3xl overflow-hidden relative">
                          {v.id ? <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${v.id}`} title={v.title} frameBorder="0" allowFullScreen></iframe> : <div className="p-8 text-white text-center h-full flex flex-col items-center justify-center"><p className="mb-4">{v.title}</p><a href={v.url} target="_blank" className="bg-red-600 px-4 py-2 rounded-xl">مشاهدة على يوتيوب</a></div>}
                       </div>
                    ))}
                 </div>
              </div>

              {reviewData.sources && reviewData.sources.length > 0 && (
                <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-200 no-print">
                   <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><span>🌐</span> المصادر والمراجع:</h4>
                   <ul className="space-y-2">
                      {reviewData.sources.map((source: any, i: number) => (
                        <li key={i} className="text-sm">
                          <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                             <span>🔗</span> {source.web?.title || source.web?.uri}
                          </a>
                        </li>
                      ))}
                   </ul>
                </div>
              )}

              <div className="flex gap-4 mt-12 no-print justify-center">
                 <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all">
                    <span>📄</span> تحميل المراجعة PDF
                 </button>
              </div>
            </div>
          </div>
        )}

        {view === 'lesson' && lessonData && (
           <div className="space-y-12 animate-fade-in pb-20">
              <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-xl border border-slate-50">
                <div className="flex justify-between items-center mb-10 no-print">
                  <h2 className="text-4xl font-black text-slate-900 leading-tight">{lessonData.title}</h2>
                  <button onClick={() => setLessonData(null)} className="bg-slate-100 p-3 rounded-full text-slate-400">✕</button>
                </div>
                <div className="bg-green-50 p-10 rounded-[2.5rem] mb-12 border border-green-100">
                  <h4 className="font-black text-green-800 mb-6 flex items-center gap-3 text-2xl"><span>📝</span> خلاصة الدرس:</h4>
                  <p className="text-xl leading-relaxed text-slate-700 font-medium">{lessonData.explanation}</p>
                </div>
                <div className="prose prose-lg max-w-none text-slate-700 mb-14 whitespace-pre-wrap">{lessonData.fullExplanation}</div>

                {lessonData.tables?.map((table: any, idx: number) => (
                  <div key={idx} className="mb-10 overflow-hidden rounded-[2.5rem] border border-slate-200">
                    <div className="bg-green-600 text-white p-5 font-black text-center text-lg">{table.title}</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right">
                        <thead><tr className="bg-slate-50 border-b">{table.headers.map((h: string, hi: number) => (<th key={hi} className="p-4 font-black">{h}</th>))}</tr></thead>
                        <tbody>{table.rows.map((row: any[], ri: number) => (<tr key={ri} className="border-b">{row.map((cell: any, ci: number) => (<td key={ci} className="p-4 font-medium text-slate-600">{cell}</td>))}</tr>))}</tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {lessonData.diagram && lessonData.diagram.length > 0 && (
                  <div className="mb-14 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                     <h4 className="font-black text-slate-800 mb-8 text-2xl text-center">المخطط المفاهيمي للدرس</h4>
                     <div className="flex flex-col items-center gap-4">
                        {lessonData.diagram.map((step: any, i: number) => (
                           <React.Fragment key={i}>
                              <div className="bg-white p-6 rounded-2xl border-2 border-green-200 shadow-sm w-full max-w-md text-center">
                                 <div className="font-black text-green-700 text-lg mb-1">{step.label}</div>
                                 <div className="text-slate-500 text-sm">{step.description}</div>
                              </div>
                              {i < lessonData.diagram.length - 1 && <div className="text-2xl text-green-300">↓</div>}
                           </React.Fragment>
                        ))}
                     </div>
                  </div>
                )}

                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white mb-14">
                   <h4 className="text-2xl font-black mb-6">تمرين تطبيقي:</h4>
                   <div className="text-xl mb-8 leading-relaxed opacity-90">{lessonData.exercise}</div>
                   <button onClick={() => setShowSolution(!showSolution)} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all">
                      {showSolution ? 'إخفاء الحل' : 'إظهار الحل النموذجي'}
                   </button>
                   {showSolution && (
                     <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
                        <div className="font-black text-green-400 mb-4 text-xl">الحل:</div>
                        <div className="leading-relaxed opacity-90">{lessonData.solution}</div>
                     </div>
                   )}
                </div>

                <div className="no-print mb-14">
                   <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-2xl"><span>🎬</span> شروحات فيديو:</h4>
                   <div className="grid md:grid-cols-2 gap-6">
                      {lessonData.videos?.map((v: any, i: number) => (
                         <div key={i} className="bg-slate-900 aspect-video rounded-3xl overflow-hidden relative shadow-lg">
                            {v.id ? <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${v.id}`} title={v.title} frameBorder="0" allowFullScreen></iframe> : <div className="p-8 text-white text-center h-full flex flex-col items-center justify-center h-full"><p className="mb-4">{v.title}</p><a href={v.url} target="_blank" className="bg-red-600 px-4 py-2 rounded-xl">يوتيوب</a></div>}
                         </div>
                      ))}
                   </div>
                </div>

                {lessonData.sources && lessonData.sources.length > 0 && (
                  <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-200 no-print">
                     <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><span>🌐</span> المصادر المستعملة:</h4>
                     <ul className="space-y-2">
                        {lessonData.sources.map((source: any, i: number) => (
                          <li key={i} className="text-sm">
                            <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                               <span>🔗</span> {source.web?.title || source.web?.uri}
                            </a>
                          </li>
                        ))}
                     </ul>
                  </div>
                )}

                <div className="flex justify-center gap-4 no-print mt-12">
                   <button onClick={() => setLessonData(null)} className="bg-slate-100 px-8 py-4 rounded-2xl font-black">بحث آخر</button>
                   <button onClick={() => window.print()} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black">تحميل PDF</button>
                </div>
              </div>
           </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16 mt-10 no-print">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-green-600 p-2.5 rounded-xl text-white font-black shadow-lg shadow-green-100">DZ</div>
            <h4 className="text-2xl font-black">مدرستي الجزائرية</h4>
          </div>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            المنصة الذكية التي ترافق التلميذ الجزائري نحو التفوق من خلال شروحات متطورة ومراجعات شاملة لجميع الأطوار.
          </p>
          
          {/* Social Links & Sharing */}
          <div className="flex justify-center gap-6 mb-10">
             <a href="https://t.me/m_im4d_madrasati" target="_blank" rel="noopener noreferrer" className="bg-[#229ED9] text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg shadow-blue-100">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.37-.48 1.02-.73 4-1.74 6.67-2.89 8-3.46 3.81-1.62 4.6-1.9 5.12-1.9.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.2z"/>
                </svg>
             </a>
             <a href="https://www.instagram.com/m.im4d" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg shadow-pink-100">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
             </a>
             <button onClick={() => {
                if (navigator.share) {
                   navigator.share({
                      title: 'مدرستي الجزائرية',
                      text: 'منصة تعليمية ذكية لجميع الأطوار التعليمية في الجزائر 🇩🇿',
                      url: window.location.href,
                   });
                } else {
                   alert('انسخ الرابط وشاركه مع أصدقائك: ' + window.location.href);
                }
             }} className="bg-green-600 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg shadow-green-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.31