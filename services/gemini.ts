
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLesson = async (level: string, grade: string, subject: string, lessonTitle: string): Promise<any> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `أريد درساً تعليمياً متكاملاً وفيديوهات يوتيوب حقيقية تشرح درس "${lessonTitle}" لمادة "${subject}" للسنة "${grade}" في الجزائر.
    
    قم بالبحث واستخدام معلومات دقيقة لتقديم:
    1. شرح مفصل وشامل للدرس.
    2. جداول تعليمية (للمقارنات أو تصنيفات أو تلخيص قوانين).
    3. مخطط تدفقي (Flowchart) أو مخطط مفاهيمي يشرح تسلسل الأفكار.
    4. تمرين تطبيقي لاختبار الفهم مع الحل النموذجي.
    5. روابط فيديوهات يوتيوب شغالة من قنوات جزائرية موثوقة.

    أعطني النتيجة بتنسيق JSON حصراً تحتوي على:
    - title: عنوان الدرس.
    - explanation: ملخص سريع (فقرة واحدة).
    - fullExplanation: شرح مفصل وعميق مقسم إلى فقرات.
    - keyPoints: قائمة بأهم النقاط المستخلصة.
    - tables: مصفوفة من الجداول، كل جدول يحتوي على title و headers و rows (مصفوفة من المصفوفات).
    - diagram: مصفوفة من الخطوات (steps) للمخطط، كل خطوة لها label و description.
    - exercise: نص تمرين تطبيقي حول الدرس.
    - solution: الحل المفصل لهذا التمرين.
    - videos: مصفوفة تحتوي على فيديوهات (كل فيديو له title و url).`,
    config: {
      systemInstruction: "أنت أستاذ جزائري خبير. هدفك تقديم محتوى تعليمي غني ودقيق يوافق المنهاج الوزاري الجزائري. يجب أن تكون الجداول والمخططات دقيقة ومفيدة جداً للطلبة. تأكد من إخراج JSON نظيف وصالح.",
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
          fullExplanation: { type: Type.STRING },
          keyPoints: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          tables: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
              },
              required: ["title", "headers", "rows"]
            }
          },
          diagram: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["label"]
            }
          },
          exercise: { type: Type.STRING },
          solution: { type: Type.STRING },
          videos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "url"]
            }
          }
        },
        required: ["title", "explanation", "fullExplanation", "keyPoints", "exercise", "solution", "videos"]
      }
    }
  });

  // Access text directly. Note that googleSearch grounding might include citation marks which we attempt to clean if present.
  let jsonStr = (response.text || '{}').trim();
  
  // Basic cleanup in case of markdown blocks
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```$/, '').trim();
  }

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON parse error:", e, "Raw string:", jsonStr);
    data = { title: "خطأ في معالجة البيانات", explanation: "عذراً، حدث خطأ أثناء قراءة الرد من الخادم.", keyPoints: [], videos: [] };
  }
  
  const extractId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const processedVideos = (data.videos || []).map((v: any) => ({
    ...v,
    id: extractId(v.url)
  }));

  return {
    ...data,
    videos: processedVideos,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateReview = async (level: string, grade: string, subject: string, specialization: string, period: string): Promise<any> => {
  const periodLabel = {
    semester1: "الفصل الأول",
    semester2: "الفصل الثاني",
    semester3: "الفصل الثالث",
    full_year: "المراجعة السنوية الكاملة",
    certificate_prep: "التحضير للشهادة النهائية (BAC/BEM)"
  }[period as keyof typeof periodLabel] || period;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `أريد مراجعة شاملة ومنظمة لمادة "${subject}"، للسنة "${grade}" ${specialization ? 'شعبة ' + specialization : ''} في الجزائر، للفترة: "${periodLabel}".
    
    يجب أن تتضمن المراجعة:
    1. ملخصاً ذكياً للمفاهيم الأساسية التي تم تناولها في هذه الفترة.
    2. جدولاً شاملاً لأهم القوانين أو القواعد أو التواريخ (حسب المادة).
    3. توقعات لأهم المواضيع التي قد ترد في الاختبارات أو الشهادة.
    4. نصائح ذهبية للمراجعة والتعامل مع ورقة الامتحان.
    5. فيديو مراجعة شاملة (Marathon review) شغال من يوتيوب لأساتذة جزائريين.

    أعطني النتيجة بتنسيق JSON يحتوي على:
    - title: عنوان المراجعة (مثلاً: المراجعة الشاملة للفصل الأول).
    - summary: ملخص شامل مقسم لفقرات.
    - keyConcepts: قائمة بالمفاهيم الأساسية.
    - tables: مصفوفة جداول (title, headers, rows).
    - examPredictions: قائمة بالتوقعات الهامة للاختبار.
    - tips: نصائح للمراجعة.
    - videos: مصفوفة فيديوهات (title, url).`,
    config: {
      systemInstruction: "أنت أستاذ خبير متخصص في المراجعات النهائية والتحضير لشهادات الباكالوريا والتعليم المتوسط في الجزائر. ركز على التلخيص المركز والمفيد جداً للتلميذ ليلة الامتحان. تأكد من الرد بتنسيق JSON صالح.",
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  let jsonStr = (response.text || '{}').trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```$/, '').trim();
  }

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON parse error:", e);
    data = { title: "خطأ في التحميل", summary: "حدث خطأ أثناء تحميل المراجعة.", keyConcepts: [], tables: [], examPredictions: [], tips: [], videos: [] };
  }

  const extractId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const processedVideos = (data.videos || []).map((v: any) => ({
    ...v,
    id: extractId(v.url)
  }));

  return { 
    ...data, 
    videos: processedVideos,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
