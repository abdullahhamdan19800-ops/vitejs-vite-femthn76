import React, { useState, useEffect } from 'react';
import { Star, Building, User, MessageSquare, CheckCircle, Send, PenTool, Home, AlertCircle, FileText, Users, Clock, Phone, Mail } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// --- بيانات مشروعك (تم نسخها من الصورة التي أرسلتها) ---
const firebaseConfig = {
  apiKey: "AIzaSyBWH9d0OhEcUcTMYxTYIXpw_URi_7Dt51U",
  authDomain: "survey-app999.firebaseapp.com",
  projectId: "survey-app999",
  storageBucket: "survey-app999.firebasestorage.app",
  messagingSenderId: "240042826536",
  appId: "1:240042826536:web:8380f5cd360f40557f8e1d",
  measurementId: "G-T3MCQP57NY"
};

// تهيئة التطبيق
let app, db, auth;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const App = () => {
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    tenantName: '',
    phoneNumber: '',
    unitNumber: '',
    buildingName: '',
    maintenanceRating: 0,
    cleanlinessRating: 0,
    safetyRating: 0,
    communicationRating: 0,
    renewalRating: 0,
    staffRating: 0,
    responseSpeedRating: 0,
    feedback: ''
  });

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth Error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRating = (category, value) => {
    setFormData(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!db || !user) {
      setError('جاري الاتصال بقاعدة البيانات... يرجى الانتظار لحظة والمحاولة مجدداً.');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'surveys'), {
        ...formData,
        submittedAt: serverTimestamp(),
        userId: user.uid,
        status: 'new'
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error:", err);
      setError('حدث خطأ أثناء الإرسال. تأكد من اتصال الإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ category, value, label, icon: Icon }) => (
    <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Icon size={20} /></div>
        <span>{label}</span>
      </div>
      <div className="flex flex-row-reverse justify-end gap-2">
        {[5, 4, 3, 2, 1].map((star) => (
          <button key={star} type="button" onClick={() => handleRating(category, star)} className="focus:outline-none transition-transform hover:scale-110">
            <Star size={32} strokeWidth={1.5} className={value >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
          </button>
        ))}
      </div>
    </div>
  );

  const Footer = () => (
    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
      <h3 className="text-gray-600 font-semibold mb-3 text-sm">للتواصل والشكاوى المباشرة</h3>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm mb-6">
        <a href="mailto:realestate@rcuae.ae" className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
          <Mail size={18} /><span className="font-medium">realestate@rcuae.ae</span>
        </a>
        <a href="tel:026996619" className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-green-600 hover:bg-green-50 transition-colors shadow-sm dir-ltr">
          <Phone size={18} /><span className="font-medium">02 699 6619</span>
        </a>
      </div>
      <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} شركة إدارة العقارات</p>
    </div>
  );

  if (submitted) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">شكراً لك!</h2>
          <p className="text-gray-600 mb-6">تم حفظ تقييمك بنجاح.</p>
          <button onClick={() => { setSubmitted(false); setFormData({ tenantName: '', phoneNumber: '', unitNumber: '', buildingName: '', maintenanceRating: 0, cleanlinessRating: 0, safetyRating: 0, communicationRating: 0, renewalRating: 0, staffRating: 0, responseSpeedRating: 0, feedback: '' }); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium mb-6">إرسال تقييم جديد</button>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-t-2xl p-8 text-white shadow-lg">
          <div className="text-center mb-6 pb-4 border-b border-white/20">
            <h2 className="text-lg md:text-xl font-bold opacity-95">الهلال الأحمر الإماراتي - شركة ذا اتش العقارية</h2>
          </div>
          <h1 className="text-3xl font-bold mb-4">استبيان رضا المستأجرين</h1>
          <p className="text-blue-100 text-lg opacity-90">نسعى دائماً لتقديم أفضل تجربة سكنية لك.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-lg p-6 sm:p-8">
          {error && <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle size={20} /><span className="text-sm">{error}</span></div>}

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-r-4 border-blue-500 pr-3">بيانات المستأجر والوحدة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستأجر</label>
                <input type="text" name="tenantName" value={formData.tenantName} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="الاسم الكريم" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="05x xxx xxxx" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المبنى</label>
                <input type="text" name="buildingName" value={formData.buildingName} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="اسم المبنى" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الوحدة</label>
                <input type="text" name="unitNumber" value={formData.unitNumber} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="رقم الشقة" />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-r-4 border-blue-500 pr-3">تقييم الخدمات</h3>
            <StarRating category="renewalRating" value={formData.renewalRating} label="سهولة تجديد عقد الايجار" icon={FileText} />
            <StarRating category="staffRating" value={formData.staffRating} label="تعامل موظفين الشركة" icon={Users} />
            <StarRating category="responseSpeedRating" value={formData.responseSpeedRating} label="سرعة استجابة الشركة للمستأجرين" icon={Clock} />
            <StarRating category="maintenanceRating" value={formData.maintenanceRating} label="جودة وسرعة الصيانة" icon={PenTool} />
            <StarRating category="cleanlinessRating" value={formData.cleanlinessRating} label="نظافة المرافق العامة والممرات" icon={CheckCircle} />
            <StarRating category="safetyRating" value={formData.safetyRating} label="الأمن والسلامة في المبنى" icon={Home} />
            <StarRating category="communicationRating" value={formData.communicationRating} label="سهولة التواصل مع الإدارة" icon={User} />
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-r-4 border-blue-500 pr-3">ملاحظات واقتراحات</h3>
            <div className="relative">
              <MessageSquare className="absolute top-3 right-3 text-gray-400" size={20} />
              <textarea name="feedback" value={formData.feedback} onChange={handleInputChange} rows="4" className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="هل لديك أي ملاحظات؟"></textarea>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 text-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? <span>جاري الإرسال...</span> : <><span>إرسال التقييم</span><Send size={20} className="rotate-180" /></>}
          </button>
          <Footer />
        </form>
      </div>
    </div>
  );
};
export default App;



