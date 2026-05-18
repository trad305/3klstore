import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, X, ShoppingBag, RefreshCw, ShoppingBag as Logo, Play, Users, Palette, Volume2, VolumeX, PartyPopper, Settings, Shuffle } from 'lucide-react';

const ARABIC_ALPHABET = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
];

const GRID_LAYOUT = [6, 5, 6, 5, 6]; // 28 total

const getNeighbors = (r: number, c: number) => {
  const isOffset = r % 2 !== 0; 
  const neighbors: [number, number][] = [[0, -1], [0, 1]];
  if (isOffset) {
    neighbors.push([-1, 0], [-1, 1], [1, 0], [1, 1]);
  } else {
    neighbors.push([-1, -1], [-1, 0], [1, -1], [1, 0]);
  }
  return neighbors.map(([dr, dc]) => ({ r: r + dr, c: c + dc }));
};

const HEX_GRID = (() => {
  const result: { letterIndex: number; r: number; c: number; offset: boolean }[] = [];
  let letterIdx = 0;
  GRID_LAYOUT.forEach((cols, r) => {
    for (let c = 0; c < cols; c++) {
      if (letterIdx < ARABIC_ALPHABET.length) {
        result.push({ 
          letterIndex: letterIdx, 
          r, 
          c, 
          offset: r % 2 !== 0
        });
        letterIdx++;
      }
    }
  });
  return result;
})();

type OwnerState = 'red' | 'green' | 'transparent' | null;
type GameState = 'menu' | 'playing';

const THEME_OPTIONS = [
  { name: 'كلاسيك', red: '#E11D48', green: '#10B981' },
  { name: 'المحيط', red: '#2563EB', green: '#F59E0B' },
  { name: 'النيون', red: '#F472B6', green: '#22D3EE' },
  { name: 'الذهبي', red: '#8B5CF6', green: '#FACC15' },
  { name: 'الليل', red: '#6366F1', green: '#F97316' },
  { name: 'الغابة', red: '#059669', green: '#EF4444' },
  { name: 'البرق', red: '#FBBF24', green: '#4F46E5' },
  { name: 'الحلوى', red: '#FF7597', green: '#00D1B2' },
  { name: 'الأناقة', red: '#2D3436', green: '#DFE6E9' },
  { name: 'البحر', red: '#00CEC9', green: '#D63031' },
  { name: 'الخريف', red: '#D35400', green: '#27AE60' },
  { name: 'الفضاء', red: '#6C5CE7', green: '#FD79A8' },
];

const QUESTION_BANK: Record<string, { q: string; a: string }[]> = {
  'أ': [
    { q: 'حيوان يلقب بملك الغابة؟', a: 'أسد' },
    { q: 'أكبر القارات من حيث المساحة؟', a: 'آسيا' },
    { q: 'عضو الشم الأساسي في جسم الإنسان؟', a: 'أنف' },
    { q: 'كائن بحري بثماني أرجل؟', a: 'أخطبوط' },
    { q: 'مخترع المصباح الكهربائي؟', a: 'أديسون' },
    { q: 'أول نبي خلقه الله عز وجل؟', a: 'آدم' },
    { q: 'الغاز الذي تحتاجه الكائنات للتنفس؟', a: 'أكسجين' },
    { q: 'عاصمة دولة إثيوبيا؟', a: 'أديس أبابا' },
    { q: 'حيوان سريع ذو أذنين طويلتين؟', a: 'أرنب' },
    { q: 'مادة تستخدم في البناء وتتصلب بالماء؟', a: 'أسمنت' },
    { q: 'أحد أسماء الأسد؟', a: 'أسامة' },
    { q: 'طائر يضرب به المثل في الحذر؟', a: 'أوزة' },
    { q: 'اسم يطلق على معدن الذهب قديماً؟', a: 'أبريز' },
    { q: 'ألوان الطيف تبدأ بـ؟', a: 'أحمر' },
    { q: 'أحد أصابع اليد؟', a: 'إبهام' },
    { q: 'أداة تُستخدم لتثبيت الملابس؟', a: 'إبرة' }
  ],
  'ب': [
    { q: 'حيوان صيني يحب أكل خشب البامبو؟', a: 'باندا' },
    { q: 'فاكهة صيفية كبيرة حمراء من الداخل؟', a: 'بطيخ' },
    { q: 'طائر بحري لا يطير ويمشي ببطء؟', a: 'بطريق' },
    { q: 'عاصمة جمهورية العراق؟', a: 'بغداد' },
    { q: 'سائل أسود يستخرج من الأرض؟', a: 'بترول' },
    { q: 'فتحة في القشرة الأرضية تخرج منها الحمم؟', a: 'بركان' },
    { q: 'عاصمة لبنان وتلقب بست الدنيا؟', a: 'بيروت' },
    { q: 'أداة تُستخدم لمعرفة الاتجاهات الأربعة؟', a: 'بوصلة' },
    { q: 'بناء مرتفع جداً يتكون من طوابق كثيرة؟', a: 'برج' },
    { q: 'كائن حي يعيش في الماء وعلى اليابسة؟', a: 'برمائي' },
    { q: 'فاكهة شتوية برتقالية اللون غنية بفيتامين ج؟', a: 'برتقال' },
    { q: 'حشرة طائرة تسبب لدغاتها الحكة؟', a: 'بعوضة' },
    { q: 'تجمع مائي أصغر من البحر؟', a: 'بحيرة' },
    { q: 'حيوان هجين بين الحصان والحمار؟', a: 'بغل' },
    { q: 'حبوب تستخدم لصناعة القهوة؟', a: 'بن' }
  ],
  'ت': [
    { q: 'فاكهة مجففة يبدأ بها الصائم إفطاره؟', a: 'تمر' },
    { q: 'زاحف مائي وبري ضخم وله أسنان حادة؟', a: 'تمساح' },
    { q: 'دولة في شمال أفريقيا عاصمتها تونس؟', a: 'تونس' },
    { q: 'أداة تُستخدم لمشاهدة النجوم والكواكب؟', a: 'تلسكوب' },
    { q: 'فاكهة حمراء مستديرة الطعم منها حلو وحامض؟', a: 'تفاح' },
    { q: 'كائن خيالي ضخم ينفث النار؟', a: 'تنين' },
    { q: 'تمثال شهير في نيويورك يرمز للحرية؟', a: 'تمثال الحرية' },
    { q: 'نبات عطري يوضع في الشاي؟', a: 'ترنجان' },
    { q: 'وسيلة تواصل قديمة تعتمد على الموجات؟', a: 'تلفاز' },
    { q: 'جهاز يحول الطاقة الحركية إلى كهربائية؟', a: 'توربين' },
    { q: 'مرض يصيب الجهاز التنفسي قديماً؟', a: 'تدرن' },
    { q: 'الحرف الثالث في حروف الهجاء؟', a: 'تاء' },
    { q: 'عملية نقل الأخبار أو المعلومات؟', a: 'تبليغ' },
    { q: 'فاكهة صيفية صغيرة حلوة المذاق؟', a: 'توت' },
    { q: 'تناوب الشيء أو تكراره؟', a: 'تناوب' }
  ],
  'ث': [
    { q: 'حيوان يضرب به المثل في المكر؟', a: 'ثعلب' },
    { q: 'لباس الرجل التقليدي في دول الخليج؟', a: 'ثوب' },
    { q: 'ما يتجمد من الماء في درجات الحرارة المنخفضة؟', a: 'ثلج' },
    { q: 'حيوان زاحف ليس له أرجل؟', a: 'ثعبان' },
    { q: 'حيوان ضخم ذو قرنين يعيش في الحقول؟', a: 'ثور' },
    { q: 'نبات يستخدم كنوع من البهارات وله فصوص؟', a: 'ثوم' },
    { q: 'عدد أضلاع المثلث؟', a: 'ثلاثة' },
    { q: 'الشيء الذي يُوضع فيه الطعام لحفظه بارداً؟', a: 'ثلاجة' },
    { q: 'مجموعة من النجوم تسمى؟', a: 'ثريا' },
    { q: 'مرض يصيب الجلد يظهر كزوائد؟', a: 'ثآليل' },
    { q: 'الحرف الرابع في حروف الهجاء؟', a: 'ثاء' },
    { q: 'نبات عشبي يستخدم في الطب الشعبي؟', a: 'ثيم' },
    { q: 'حيوان يلقب بـ "الثور"؟', a: 'ثور' },
    { q: 'رجل ذو مال كثير؟', a: 'ثري' },
    { q: 'شيء يخرج من البركان عند انفجاره؟', a: 'ثوران' }
  ],
  'ج': [
    { q: 'حيوان يلقب بسفينة الصحراء؟', a: 'جمل' },
    { q: 'مدينة سعودية تلقب بعروس البحر الأحمر؟', a: 'جدة' },
    { q: 'كتلة صخرية مرتفعة جداً عن سطح الأرض؟', a: 'جبل' },
    { q: 'أنسجة مرنة تغطي عظام جسم الإنسان؟', a: 'جلد' },
    { q: 'عاصمة جزيرة إندونيسيا هي؟', a: 'جاكرتا' },
    { q: 'اسم يطلق على مجمع العظام في الرأس؟', a: 'جمجمة' },
    { q: 'دولة أفريقية عاصمتها الجزائر؟', a: 'الجزائر' },
    { q: 'آلة موسيقية وترية تشبه العود؟', a: 'جيتار' },
    { q: 'قوة خفية اكتشفها نيوتن؟', a: 'جاذبية' },
    { q: 'جهاز يتحكم في التلفاز عن بعد؟', a: 'جهاز تحكم' },
    { q: 'جزء من النبات يمتص الماء من التربة؟', a: 'جذر' },
    { q: 'بقايا الحيوانات والنباتات الميتة؟', a: 'جيفة' },
    { q: 'نبات يستخدم في العطور والزينة؟', a: 'جوري' },
    { q: 'فاكهة استوائية صفراء؟', a: 'جوافة' },
    { q: 'جزء من أجزاء القرآن الثلاثين؟', a: 'جزء' }
  ],
  'ح': [
    { q: 'طائر يرمز للسلام والمحبة؟', a: 'حمامة' },
    { q: 'سائل أبيض غني بالكالسيوم؟', a: 'حليب' },
    { q: 'مدينة سورية قديمة تعتبر من أقدم المدن؟', a: 'حلب' },
    { q: 'حيوان بحري ضخم جداً؟', a: 'حوت' },
    { q: 'أداة تستخدم في الكتابة قديماً؟', a: 'حبر' },
    { q: 'شيء يلبس في القدم للمشي؟', a: 'حذاء' },
    { q: 'نبات يستخدم في تزيين الأيدي في المناسبات؟', a: 'حناء' },
    { q: 'كائن يغير لونه حسب البيئة؟', a: 'حرباء' },
    { q: 'حيوان سريع يركبه الفرسان؟', a: 'حصان' },
    { q: 'مكان مخصص للسباحة والاستجمام؟', a: 'حوض سباحة' },
    { q: 'حشرة صغيرة تسير في جماعات؟', a: 'حشرة' },
    { q: 'نبات شوكي يعيش في الصحراء؟', a: 'حسك' },
    { q: 'حيوان يلقب بـ "أبو الحصين"؟', a: 'حصني' },
    { q: 'أحد فترات التاريخ؟', a: 'حقبة' },
    { q: 'شيء يلبس حول الخصر؟', a: 'حزام' }
  ],
  'خ': [
    { q: 'حيوان يغطي جسمه الصوف؟', a: 'خروف' },
    { q: 'ثمرة صيفية حلوة المذاق؟', a: 'خوخ' },
    { q: 'حيوان ذكي يختفي في جحور؟', a: 'خلد' },
    { q: 'دابة يركبها الإنسان تشبه الحصان؟', a: 'خيل' },
    { q: 'بيت النحل يسمى؟', a: 'خلية' },
    { q: 'معدن يستخدم في البناء يأتي من الأشجار؟', a: 'خشب' },
    { q: 'طائر يخرج في الليل ينام معلقاً؟', a: 'خفاش' },
    { q: 'شيء يلبس في الإصبع للزينة؟', a: 'خاتم' },
    { q: 'أداة تستخدم للخياطة؟', a: 'خيط' },
    { q: 'فاكهة خضراء تؤكل في السلطة؟', a: 'خيار' },
    { q: 'طعام أساسي يحضر من الدقيق؟', a: 'خبز' },
    { q: 'رسم توضيحي لسطح الأرض؟', a: 'خريطة' },
    { q: 'حيوان مفترس يشبه الكلب؟', a: 'خنزير بري' },
    { q: 'نبات يستخدم في العطور؟', a: 'خزامى' },
    { q: 'خوف شديد من شيء ما؟', a: 'خوف' }
  ],
  'د': [
    { q: 'حيوان بحري ذكي جداً؟', a: 'دلفين' },
    { q: 'طائر منزلي يعطينا البيض؟', a: 'دجاج' },
    { q: 'حيوان ضخم انقرض قديماً؟', a: 'ديناصور' },
    { q: 'شيء يتناوله المريض للشفاء؟', a: 'دواء' },
    { q: 'آلة موسيقية إيقاعية دائرية؟', a: 'دف' },
    { q: 'أداة حادة صغيرة للخياطة؟', a: 'دبوس' },
    { q: 'حيوان يحب العسل؟', a: 'دب' },
    { q: 'مدينة إماراتية عالمية؟', a: 'دبي' },
    { q: 'وسيلة نقل على عجلتين؟', a: 'دراجة' },
    { q: 'عاصمة سورية؟', a: 'دمشق' },
    { q: 'أداة لثقب الجدران؟', a: 'دريل' },
    { q: 'حيوان يغرد في الصباح؟', a: 'ديك' },
    { q: 'الشيء الذي يستخدمه الرسام للألوان؟', a: 'دواية' },
    { q: 'مرض يصيب السكر؟', a: 'داء' },
    { q: 'شكل هندسي مستدير؟', a: 'دائرة' }
  ],
  'ذ': [
    { q: 'معدن نفيس لونه أصفر؟', a: 'ذهب' },
    { q: 'حشرة طائرة مزعجة؟', a: 'ذبابة' },
    { q: 'حيوان مفترس يشبه الكلب؟', a: 'ذئب' },
    { q: 'شيء يملكه الحيوان في نهاية جسمه؟', a: 'ذيل' },
    { q: 'إحدى الحواس الخمس؟', a: 'ذوق' },
    { q: 'أحد شهور السنة الهجرية؟', a: 'ذو الحجة' },
    { q: 'أصغر جزء في المادة؟', a: 'ذرة' },
    { q: 'نبات أصفر الحبوب يؤكل مشوياً؟', a: 'ذرة' },
    { q: 'قمة الجبل العالية؟', a: 'ذروة' },
    { q: 'قدرة الإنسان على الفهم؟', a: 'ذكاء' },
    { q: 'أحد أطراف جسم الإنسان؟', a: 'ذراع' },
    { q: 'خطيئة يرتكبها الإنسان؟', a: 'ذنب' },
    { q: 'ما يذبح من الأنعام؟', a: 'ذبيحة' },
    { q: 'ذكرى من الماضي؟', a: 'ذكرى' },
    { q: 'الشعر الذي ينبت تحت الفم؟', a: 'ذقن' }
  ],
  'ر': [
    { q: 'فصل تتفتح فيه الزهور؟', a: 'ربيع' },
    { q: 'عاصمة إيطاليا؟', a: 'روما' },
    { q: 'أحد أجزاء جسم الإنسان في الأعلى؟', a: 'رأس' },
    { q: 'نبات عطري للطبخ والزينة؟', a: 'ريحان' },
    { q: 'الشخص الذي يسافر في مركبة فضائية؟', a: 'رائد فضاء' },
    { q: 'أكبر دولة في العالم مساحة؟', a: 'روسيا' },
    { q: 'فاكهة حمراء ذكرت في القرآن؟', a: 'رمان' },
    { q: 'أداة يستخدمها الرسام للتلوين؟', a: 'ريشة' },
    { q: 'صوت الرعد القوي؟', a: 'رعد' },
    { q: 'آلة لاستقبال الإشارات الإذاعية؟', a: 'راديو' },
    { q: 'حبيبات تغطي أرض الصحراء؟', a: 'رمل' },
    { q: 'لاعب كرة قدم برتغالي مشهور؟', a: 'رونالدو' },
    { q: 'طائر جارح كبير؟', a: 'رخم' },
    { q: 'عاصمة المغرب؟', a: 'الرباط' },
    { q: 'صوت الجرس أو الهاتف؟', a: 'رنين' }
  ],
  'ز': [
    { q: 'حيوان طويل الرقبة يقتات على أوراق الشجر؟', a: 'زرافة' },
    { q: 'ثمرة مباركة ذكرت في القرآن الكريم مع التين؟', a: 'زيتون' },
    { q: 'كوكب في المجموعة الشمسية يتميز بحلقاته؟', a: 'زحل' },
    { q: 'حجر كريم أخضر اللون ونفيس؟', a: 'زمرد' },
    { q: 'نبات جميل الشكل والرائحة؟', a: 'زهرة' },
    { q: 'مرض يصيب كبار السن ويؤثر على الذاكرة؟', a: 'زهايمر' },
    { q: 'دولة في وسط أفريقيا عاصمتها لوساكا؟', a: 'زامبيا' },
    { q: 'غاز خامل يستخدم في المصابيح الكهربائية؟', a: 'زينون' },
    { q: 'مركب مائي صغير يستخدم للتنقل؟', a: 'زورق' },
    { q: 'فن الزخرفة والتزيين؟', a: 'زخرفة' },
    { q: 'نبات يستخدم كبهار وله طعم حار؟', a: 'زنجبيل' },
    { q: 'صوت يطلقه الأسد؟', a: 'زئير' },
    { q: 'مادة بيضاء تستخرج من الحليب؟', a: 'زبادي' },
    { q: 'أحد أنواع الفواكه الصيفية؟', a: 'زعرور' },
    { q: 'ما يضعه الرجل على ملابسه للزينة؟', a: 'زنار' }
  ],
  'س': [
    { q: 'حيوان بحري بطيء يحمل قوقعته على ظهره؟', a: 'سلحفاة' },
    { q: 'أداة حادة تستخدم في المطبخ للتقطيع؟', a: 'سكين' },
    { q: 'وسيلة نقل مائية ضخمة؟', a: 'سفينة' },
    { q: 'طائر صغير يهاجر في الشتاء ويضرب به المثل في السرعة؟', a: 'سنونو' },
    { q: 'دولة عربية عاصمتها الخرطوم؟', a: 'السودان' },
    { q: 'حيوان زاحف لونه أخضر يتواجد في الحدائق؟', a: 'سحلية' },
    { q: 'طعام ياباني شهير يتكون من السمك والأرز؟', a: 'سوشي' },
    { q: 'نوع من الكلاب السلوقية المشهورة بالسرعة؟', a: 'سلوقي' },
    { q: 'أعلى جزء في الغرفة؟', a: 'سقف' },
    { q: 'طائر يغرد في الصباح الباكر؟', a: 'سمن' },
    { q: 'مادة حلوة المذاق نستخدمها في التحلية؟', a: 'سكر' },
    { q: 'ساعة الحائط أو اليد؟', a: 'ساعة' },
    { q: 'حيوان صغير يجمع البندق؟', a: 'سنجاب' },
    { q: 'أداة للارتقاء للأماكن العالية؟', a: 'سلم' },
    { q: 'نوع من أنواع السمك؟', a: 'سلمون' }
  ],
  'ش': [
    { q: 'النجم الذي يمد الأرض بالضوء والحرارة؟', a: 'شمس' },
    { q: 'قرد ذكي جداً قريب في صفاته من الإنسان؟', a: 'شمبانزي' },
    { q: 'سائل منبه نشربه ساخناً وله أنواع أسود وأخضر؟', a: 'شاي' },
    { q: 'شهر هجري يأتي مباشرة بعد رمضان؟', a: 'شوال' },
    { q: 'إحدى إمارات دولة الإمارات العربية المتحدة؟', a: 'الشارقة' },
    { q: 'أداة تستخدم للإضاءة قديماً تعتمد على النار؟', a: 'شعلة' },
    { q: 'إحدى الحواس الخمس مرتبطة بالأنف؟', a: 'شم' },
    { q: 'فصل من فصول السنة يتميز بالبرودة؟', a: 'شتاء' },
    { q: 'نبات تنبت له أشواك للحماية؟', a: 'شوك' },
    { q: 'ما يغطي جسم الإنسان من الأعلى؟', a: 'شعر' },
    { q: 'قطعة قماش كبيرة تحرك السفينة بالرياح؟', a: 'شراع' },
    { q: 'مكان مخصص للمشي في المدينة؟', a: 'شارع' },
    { q: 'سقوط مائي من مكان مرتفع؟', a: 'شلال' },
    { q: 'شخص يشهد في قضية أمام القاضي؟', a: 'شاهد' },
    { q: 'نوع من أنواع الفاكهة الصيفية؟', a: 'شمام' }
  ],
  'ص': [
    { q: 'طائر جارح يطلق عليه الصقر؟', a: 'صقر' },
    { q: 'نبات يعيش في الصحراء؟', a: 'صبار' },
    { q: 'أحد فصول السنة؟', a: 'صيف' },
    { q: 'مادة تُصنع منها الصحون؟', a: 'صيني' },
    { q: 'الشيء الذي يستخدم في البناء؟', a: 'صخر' },
    { q: 'دولة عاصمتها مقديشو؟', a: 'الصومال' },
    { q: 'أداة تستخدم في الصيد؟', a: 'صنارة' },
    { q: 'عاصمة اليمن؟', a: 'صنعاء' },
    { q: 'طائر مائي يعيش في القطب؟', a: 'صنقر' },
    { q: 'أحد أنواع المعادن؟', a: 'صدأ' },
    { q: 'صوت الرعد الشديد؟', a: 'صاعقة' },
    { q: 'مادة لزجة تُستخرج من الأشجار؟', a: 'صمغ' },
    { q: 'صوت الاحتكاك أو صوت الماء؟', a: 'صليل' },
    { q: 'أداة تُستخدم في صهر المعادن؟', a: 'صهر' }
  ],
  'ض': [
    { q: 'حيوان برمائي يقفز؟', a: 'ضفدع' },
    { q: 'عضو في جسم الإنسان للهضم؟', a: 'ضرس' },
    { q: 'حيوان مفترس يشبه الكلب؟', a: 'ضبع' },
    { q: 'حيوان زاحف يعيش في الصحراء؟', a: 'ضب' },
    { q: 'طاقة نراها بالعين؟', a: 'ضوء' },
    { q: 'أحد أسماء الأسد؟', a: 'ضرغام' },
    { q: 'الحالة التي يكون فيها الجو مليئاً بالماء؟', a: 'ضباب' },
    { q: 'مرض يصيب السكر؟', a: 'ضغط' },
    { q: 'صوت الضفدع؟', a: 'نقيق' },
    { q: 'أداة تستخدم في الرياضة؟', a: 'ضارب' },
    { q: 'صفة تقال للشخص القوي؟', a: 'ضليع' },
    { q: 'عضو في جسم الإنسان للمضغ؟', a: 'ضرس' },
    { q: 'نور القمر أو الشمس؟', a: 'ضياء' },
    { q: 'مكان غير واسع؟', a: 'ضيق' },
    { q: 'أحد العمليات الحسابية الأربعة؟', a: 'ضرب' }
  ],
  'ط': [
    { q: 'وسيلة نقل جوية؟', a: 'طائرة' },
    { q: 'طائر جميل الريش؟', a: 'طاووس' },
    { q: 'طبيب العيون؟', a: 'طبيب' },
    { q: 'عاصمة اليابان؟', a: 'طوكيو' },
    { q: 'دولة عاصمتها طرابلس؟', a: 'ليبيا' },
    { q: 'أداة تستخدم في الطبخ؟', a: 'طنجرة' },
    { q: 'قائد عربي فتح الأندلس؟', a: 'طارق بن زياد' },
    { q: 'عاصمة إيران؟', a: 'طهران' },
    { q: 'طائر يهاجر في الشتاء؟', a: 'طيهوج' },
    { q: 'صفة تطلق على الطعام الشهي؟', a: 'طيب' },
    { q: 'وصف يطلق على الطيور؟', a: 'طير' },
    { q: 'أداة طبخ قديمة؟', a: 'طشت' },
    { q: 'مذاق الطعام؟', a: 'طعم' },
    { q: 'رتبة عسكرية لمن يقود الطائرة؟', a: 'طيار' },
    { q: 'ممر يمر به الناس والسيارات؟', a: 'طريق' }
  ],
  'ظ': [
    { q: 'حيوان يشبه الغزال؟', a: 'ظبي' },
    { q: 'شيء يتبعك في الشمس؟', a: 'ظل' },
    { q: 'عضو في اليد؟', a: 'ظفر' },
    { q: 'وقت منتصف النهار؟', a: 'ظهر' },
    { q: 'الاسم الذي يطلق على التعب الشديد؟', a: 'ظماء' },
    { q: 'صفة تطلق على الشخص الجائر؟', a: 'ظالم' },
    { q: 'الحالة التي تسبق النور؟', a: 'ظلام' },
    { q: 'حيوان بري سريع؟', a: 'ظربان' },
    { q: 'أحد أسماء الله الحسنى؟', a: 'الظاهر' },
    { q: 'الاسم الذي يطلق على الرسالة؟', a: 'ظرف' },
    { q: 'صوت الظباء؟', a: 'ظأظأة' },
    { q: 'اسم يطلق على الليل الشديد السواد؟', a: 'ظلام' },
    { q: 'الانتصار في المعركة أو المسابقة؟', a: 'ظفر' },
    { q: 'صفة للمبالغ في الظلم؟', a: 'ظلوم' },
    { q: 'الاعتقاد بشيء دون التأكد منه؟', a: 'ظن' }
  ],
  'ع': [
    { q: 'طائر جارح قوي؟', a: 'عقاب' },
    { q: 'سائل يُستخرج من الزهور؟', a: 'عطر' },
    { q: 'أحد الحواس الخمس؟', a: 'عين' },
    { q: 'حيوان صحراوي يلدغ؟', a: 'عقرب' },
    { q: 'دولة عربية عاصمتها بغداد؟', a: 'العراق' },
    { q: 'أداة تُستخدم في القياس الزمني؟', a: 'عقارب' },
    { q: 'نبات يستخدم كبخور؟', a: 'عود' },
    { q: 'طائر يضرب به المثل في الكبر؟', a: 'عنقاء' },
    { q: 'أحد الأقارب من جهة الأب؟', a: 'عم' },
    { q: 'معلومات تدل على مكان السكن؟', a: 'عنوان' },
    { q: 'مرض يصيب العين في الليل؟', a: 'عشا' },
    { q: 'حيوان زاحف يشبه السحلية؟', a: 'عظاءة' },
    { q: 'اسم يطلق على المشاجرة؟', a: 'عراك' },
    { q: 'نبات يستخدم كصبغة وعلاج؟', a: 'عصفر' }
  ],
  'غ': [
    { q: 'حيوان سريع جداً؟', a: 'غزال' },
    { q: 'طائر أسود اللون؟', a: 'غراب' },
    { q: 'مكان مليء بالأشجار؟', a: 'غابة' },
    { q: 'دولة في غرب أفريقيا؟', a: 'غانا' },
    { q: 'طائر يسبح في الماء؟', a: 'غواص' },
    { q: 'الاسم الذي يطلق على عمق البحر؟', a: 'غور' },
    { q: 'أحد أسماء الله الحسنى؟', a: 'الغفور' },
    { q: 'غلاف للكتب؟', a: 'غلاف' },
    { q: 'طائر مائي أبيض؟', a: 'غرنوق' },
    { q: 'طعام يُقدم للضيوف؟', a: 'غداء' },
    { q: 'حبوب الشعير أو القمح؟', a: 'غلال' },
    { q: 'خفض البصر عما حرم الله؟', a: 'غض' },
    { q: 'جمع كلمة غراب؟', a: 'غربان' },
    { q: 'سائل يستخدم في التنظيف؟', a: 'غسول' }
  ],
  'ف': [
    { q: 'أكبر حيوان بري؟', a: 'فيل' },
    { q: 'فاكهة حمراء صغيرة؟', a: 'فراولة' },
    { q: 'حشرة ذات ألوان جميلة؟', a: 'فراشة' },
    { q: 'حيوان صغير يحب الجبن؟', a: 'فأر' },
    { q: 'دولة عاصمتها باريس؟', a: 'فرنسا' },
    { q: 'دولة عربية عاصمتها القدس؟', a: 'فلسطين' },
    { q: 'أداة تستخدم في الإضاءة؟', a: 'فانوس' },
    { q: 'نجم يلمع في السماء؟', a: 'فضاء' },
    { q: 'أداة تستخدم في النجارة؟', a: 'فأس' },
    { q: 'حيوان مفترس يشبه القطة؟', a: 'فهد' },
    { q: 'الاسم الذي يطلق على الشخص الماهر؟', a: 'فارس' },
    { q: 'معدن غالي الثمن؟', a: 'فضة' },
    { q: 'نوع من أنواع البقوليات؟', a: 'فول' },
    { q: 'آلة تصوير فوتوغرافي؟', a: 'فوتوغراف' }
  ],
  'ق': [
    { q: 'حيوان يحب الموز؟', a: 'قرد' },
    { q: 'جسم سماوي ينير الليل؟', a: 'قمر' },
    { q: 'حيوان أليف يربى في المنزل؟', a: 'قطة' },
    { q: 'أداة تستخدم في الكتابة؟', a: 'قلم' },
    { q: 'عاصمة مصر؟', a: 'القاهرة' },
    { q: 'آلة موسيقية وترية؟', a: 'قانون' },
    { q: 'دولة عربية عاصمتها الدوحة؟', a: 'قطر' },
    { q: 'شيء يلبسه الرجال على الرأس؟', a: 'قبعة' },
    { q: 'أداة تستخدم في الصيد؟', a: 'قوس' },
    { q: 'مدينة في فلسطين؟', a: 'قلقيلية' },
    { q: 'نوع من أنواع الملابس؟', a: 'قميص' },
    { q: 'وحدة قياس طول قديمة؟', a: 'قدم' },
    { q: 'حيوان يغطيه الشوك؟', a: 'قنفذ' },
    { q: 'قائد السفينة أو الطائرة؟', a: 'قبطان' }
  ],
  'ك': [
    { q: 'حيوان يلقب بالوفاء؟', a: 'كلب' },
    { q: 'كشر يعيش في الغابة؟', a: 'كوالا' },
    { q: 'عاصمة ماليزيا؟', a: 'كوالالمبور' },
    { q: 'دولة خليجية عاصمتها مدينة الكويت؟', a: 'الكويت' },
    { q: 'شيء نقرأ فيه؟', a: 'كتاب' },
    { q: 'أداة تستخدم في المطبخ؟', a: 'كوب' },
    { q: 'رياضة عالمية؟', a: 'كرة القدم' },
    { q: 'عاصمة أفغانستان؟', a: 'كابول' },
    { q: 'جهاز للحاسوب؟', a: 'كيبورد' },
    { q: 'أحد الغازات السامة؟', a: 'كلور' },
    { q: 'وعاء يوضع فيه العسل وقرص النحل؟', a: 'كور' },
    { q: 'صوت الضحك الشديد؟', a: 'كركرة' },
    { q: 'مادة صمغية متحجرة شفافة؟', a: 'كهرمان' },
    { q: 'فاكهة تشبه التفاح؟', a: 'كمثرى' }
  ],
  'ل': [
    { q: 'سائل أبيض غني بالكالسيوم؟', a: 'لبن' },
    { q: 'فاكهة حامضة صفراء؟', a: 'ليمون' },
    { q: 'دولة عربية عاصمتها بيروت؟', a: 'لبنان' },
    { q: 'أصل الإنسان من؟', a: 'لحم' },
    { q: 'شيء يضيء في الليل؟', a: 'لمبة' },
    { q: 'عضو في الفم للتذوق؟', a: 'لسان' },
    { q: 'دولة أفريقية عاصمتها طرابلس؟', a: 'ليبيا' },
    { q: 'رياضة تعتمد على الضرب باليد؟', a: 'لكم' },
    { q: 'مدينة في بريطانيا؟', a: 'لندن' },
    { q: 'أحد أسماء الله الحسنى؟', a: 'اللطيف' },
    { q: 'أداة تستخدم في اللعب؟', a: 'لعبة' },
    { q: 'نوع من أنواع المكسرات؟', a: 'لوز' },
    { q: 'حيوان من فصيلة الجمال يعيش في أمريكا؟', a: 'لاما' },
    { q: 'مدينة أمريكية شهيرة؟', a: 'لوس أنجلوس' },
    { q: 'معدن ثمين يستخرج من البحار؟', a: 'لؤلؤ' }
  ],
  'م': [
    { q: 'قائد عسكري شهير فتح مصر؟', a: 'عمرو بن العاص' },
    { q: 'مكان لتعلم الطلاب وتلقي العلم؟', a: 'مدرسة' },
    { q: 'دولة عربية تقع في شمال أفريقيا عاصمتها الرباط؟', a: 'المغرب' },
    { q: 'فاكهة صيفية صفراء لذيذة ذات نوى كبيرة؟', a: 'مانجو' },
    { q: 'شخص يقوم بتمثيل الأدوار في السينما؟', a: 'ممثل' },
    { q: 'دولة عاصمتها القاهرة وقلب العروبة والذكرى؟', a: 'مصر' },
    { q: 'أداة حادة تستخدم لمسح الأوراق والأقمشة أو قصها؟', a: 'مقص' },
    { q: 'عاصمة دولة روسيا الاتحادية؟', a: 'موسكو' },
    { q: 'آلة موسيقية وترية شرقية تشبه العود؟', a: 'مزهر' },
    { q: 'دولة سياحية في المحيط الهندي تتكون من جزر؟', a: 'مالديف' },
    { q: 'أداة نستخدمها لتناول الطعام السائل؟', a: 'ملعقة' },
    { q: 'مساحة شاسعة من المياه المالحة؟', a: 'محيط' },
    { q: 'مرض معدٍ يسببه البعوض؟', a: 'ملاريا' },
    { q: 'أداة تعكس الضوء ونرى فيها أنفسنا؟', a: 'مرآة' },
    { q: 'معدن غالي الثمن؟', a: 'ماس' }
  ],
  'ن': [
    { q: 'حشرة تضرب بها المثل في العمل الجماعي والادخار؟', a: 'نملة' },
    { q: 'حيوان مفترس من الفصيلة القططية يتميز بجلده المرقط؟', a: 'نمر' },
    { q: 'طائر جارح قوي البصر جداً؟', a: 'نسر' },
    { q: 'حشرة مفيدة تنتج العسل؟', a: 'نحلة' },
    { q: 'أداة نرتديها لتحسين الرؤية أو الحماية من الشمس؟', a: 'نظارة' },
    { q: 'دولة في جنوب آسيا تضم أعلى قمة في العالم؟', a: 'نيبال' },
    { q: 'طائر ضخم لا يطير ويشتهر بسرعته في الجري؟', a: 'نعامة' },
    { q: 'معدن لونه أحمر مائل للبرتقالي موصل جيد للكهرباء؟', a: 'نحاس' },
    { q: 'أحد كواكب المجموعة الشمسية البعيدة والباردة؟', a: 'نبتون' },
    { q: 'عاصمة الجمهورية الإسلامية الموريتانية؟', a: 'نواكشوط' },
    { q: 'صوت أو لحن موسيقي جميل؟', a: 'نغم' },
    { q: 'نهر طويل يجري في مصر والسودان؟', a: 'النيل' },
    { q: 'طائر أبيض جميل يسبح في البحيرات؟', a: 'نورس' },
    { q: 'نبات عطري يستخدم في الطبخ؟', a: 'نعناع' },
    { q: 'من الفواكه الصغيرة التي تنمو في الشجر؟', a: 'نبق' }
  ],
  'ه': [
    { q: 'شكل القمر في بداية ونهاية الشهر الهجري؟', a: 'هلال' },
    { q: 'دولة في آسيا عاصمتها نيودلهي؟', a: 'الهند' },
    { q: 'وسيلة تواصل حديثة لاسلكية؟', a: 'هاتف' },
    { q: 'عاصمة دولة هولندا الرسمية؟', a: 'لاهاي' },
    { q: 'حيوان ضخم يسمى سيد قشطة؟', a: 'هيبو' },
    { q: 'طائر يضرب به المثل في التغريد الجميل؟', a: 'هزار' },
    { q: 'اسم يطلق على أنثى القط؟', a: 'هرة' },
    { q: 'أحد أسماء الله الحسنى يدل على الإرشاد؟', a: 'الهادي' },
    { q: 'دولة أوروبية عاصمتها بودابست؟', a: 'هنغاريا' },
    { q: 'بناء مصري قديم من عجائب الدنيا؟', a: 'هرم' },
    { q: 'هواء متحرك بقوة؟', a: 'هبوب' },
    { q: 'هدية تعطى في المناسبات؟', a: 'هدية' },
    { q: 'طائر ذكره القرآن الكريم في قصة سليمان؟', a: 'هدهد' },
    { q: 'هبوط الطائرة؟', a: 'هبوط' },
    { q: 'عظام الجسم كاملة تسمى؟', a: 'هيكل' }
  ],
  'و': [
    { q: 'نبات جميل الرائحة يرمز للحب والجمال؟', a: 'وردة' },
    { q: 'عاصمة الولايات المتحدة الأمريكية؟', a: 'واشنطن' },
    { q: 'حيوان ضخم مهدد بالانقراض له قرن واحد على أنفه؟', a: 'وحيد القرن' },
    { q: 'شيء نضع عليه رؤوسنا عند النوم للراحة؟', a: 'وسادة' },
    { q: 'اسم من أسماء الله الحسنى يدل على شدة الحب؟', a: 'الودود' },
    { q: 'مادة نصنع منها الكتب والكتابة؟', a: 'ورق' },
    { q: 'وعاء دموي يحمل الدم للقلب؟', a: 'وريد' },
    { q: 'وحدة قياس القدرة الكهربائية؟', a: 'وات' },
    { q: 'كلمة تقال عند الوداع؟', a: 'وداعاً' },
    { q: 'وجه الإنسان؟', a: 'وجه' },
    { q: 'حيوان زاحف كبير؟', a: 'ورل' },
    { q: 'بيت الوحش في الغابة؟', a: 'وجار' },
    { q: 'وطن الإنسان؟', a: 'وطن' },
    { q: 'وحش أسطوري؟', a: 'وحش' },
    { q: 'وزن الشيء؟', a: 'وزن' }
  ],
  'ي': [
    { q: 'دولة في شرق آسيا تسمى بلاد الشمس المشرقة؟', a: 'اليابان' },
    { q: 'عضو في جسم الإنسان نستخدمه للمس والقبض؟', a: 'يد' },
    { q: 'دولة عربية عاصمتها صنعاء وتقع في جنوب الجزيرة؟', a: 'اليمن' },
    { q: 'فاكهة شتوية من الحمضيات تشبه البرتقال؟', a: 'يوسفي' },
    { q: 'حجر كريم ذو قيمة عالية غالباً ما يكون أحمر؟', a: 'ياقوت' },
    { q: 'دولة أوروبية عاصمتها أثينا؟', a: 'اليونان' },
    { q: 'دولة أفريقية عاصمتها كمبالا؟', a: 'يوجندا' },
    { q: 'نبات زينة متسلق ذو رائحة فواحة جداً؟', a: 'ياسمين' },
    { q: 'وحدة قياس طول قديمة؟', a: 'ياردة' },
    { q: 'معدن مشع استخدم في القنابل الذرية؟', a: 'يورانيوم' },
    { q: 'صفة تطلق على الشيء السهل والبسيط؟', a: 'يسير' },
    { q: 'يابس الأرض؟', a: 'يابسة' },
    { q: 'ياقة القميص؟', a: 'ياقة' },
    { q: 'ينابيع الماء؟', a: 'ينبوع' },
    { q: 'الشخص الذي فقد أباه؟', a: 'يتيم' }
  ],
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [owners, setOwners] = useState<Record<number, OwnerState>>({});
  const [winner, setWinner] = useState<'red' | 'green' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Scoring State
  const [roundsToWin, setRoundsToWin] = useState(3);
  const [scores, setScores] = useState({ red: 0, green: 0 });
  const [overallWinner, setOverallWinner] = useState<'red' | 'green' | null>(null);
  
  const [presenterType, setPresenterType] = useState<'human' | 'ai'>('ai'); // Default to AI as requested
  const [isMuted, setIsMuted] = useState(false);
  
  // Question State
  const [activeQuestionHexIdx, setActiveQuestionHexIdx] = useState<number | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionSubIdx, setQuestionSubIdx] = useState(0);
  
  // Audio Helper
  const playSound = (type: 'click' | 'roundWin' | 'gameWin') => {
    if (isMuted) return;
    const sounds = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      roundWin: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      gameWin: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };
  
  // Customization State
  const [gameTitle, setGameTitle] = useState('حروف مع 3kl');
  const [teamRedName, setTeamRedName] = useState('الفريق الأول');
  const [teamGreenName, setTeamGreenName] = useState('الفريق الثاني');
  const [teamColorRed, setTeamColorRed] = useState('#E11D48'); 
  const [teamColorGreen, setTeamColorGreen] = useState('#10B981'); 
  const [alphabet, setAlphabet] = useState([...ARABIC_ALPHABET]);

  const selectTheme = (index: number) => {
    const theme = THEME_OPTIONS[index];
    setTeamColorRed(theme.red);
    setTeamColorGreen(theme.green);
  };

  const shuffleAlphabet = () => {
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    setAlphabet(shuffled);
  };

  const resetAlphabet = () => {
    setAlphabet([...ARABIC_ALPHABET]);
  };

  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 1024);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    const checkWin = (team: 'red' | 'green') => {
      const visited = new Set<string>();
      const queue: {r: number, c: number}[] = [];

      const maxRow = GRID_LAYOUT.length - 1;
      const minRow = 0;

      if (team === 'red') {
        HEX_GRID.forEach((h, idx) => {
          if (h.r === minRow && owners[idx] === 'red') {
            queue.push({ r: h.r, c: h.c });
            visited.add(`${h.r},${h.c}`);
          }
        });
        while (queue.length > 0) {
          const curr = queue.shift()!;
          if (curr.r === maxRow) return true;
          getNeighbors(curr.r, curr.c).forEach(nb => {
            const hexIdx = HEX_GRID.findIndex(h => h.r === nb.r && h.c === nb.c);
            if (hexIdx !== -1 && owners[hexIdx] === 'red' && !visited.has(`${nb.r},${nb.c}`)) {
              visited.add(`${nb.r},${nb.c}`);
              queue.push(nb);
            }
          });
        }
      }

      if (team === 'green') {
        HEX_GRID.forEach((h, idx) => {
          if (h.c === 0 && owners[idx] === 'green') {
            queue.push({ r: h.r, c: h.c });
            visited.add(`${h.r},${h.c}`);
          }
        });
        while (queue.length > 0) {
          const curr = queue.shift()!;
          const maxColInThisRow = GRID_LAYOUT[curr.r] - 1;
          if (curr.c === maxColInThisRow) return true;
          
          getNeighbors(curr.r, curr.c).forEach(nb => {
            const hexIdx = HEX_GRID.findIndex(h => h.r === nb.r && h.c === nb.c);
            if (hexIdx !== -1 && owners[hexIdx] === 'green' && !visited.has(`${nb.r},${nb.c}`)) {
              visited.add(`${nb.r},${nb.c}`);
              queue.push(nb);
            }
          });
        }
      }
      return false;
    };

    if (gameState === 'playing' && !winner && !overallWinner) {
      if (checkWin('red')) {
        setWinner('red');
        setScores(prev => {
          const next = { ...prev, red: prev.red + 1 };
          if (next.red >= roundsToWin) {
            setOverallWinner('red');
            playSound('gameWin');
          } else {
            playSound('roundWin');
          }
          return next;
        });
      }
      else if (checkWin('green')) {
        setWinner('green');
        setScores(prev => {
          const next = { ...prev, green: prev.green + 1 };
          if (next.green >= roundsToWin) {
            setOverallWinner('green');
            playSound('gameWin');
          } else {
            playSound('roundWin');
          }
          return next;
        });
      }
    }
  }, [owners, gameState, winner, overallWinner, roundsToWin]);

  const handleLetterClick = (idx: number) => {
    playSound('click');
    
    // AI Presenter -> Question Modal
    if (presenterType === 'ai') {
      const letter = alphabet[idx];
      const questions = QUESTION_BANK[letter] || [];
      const subIdx = Math.floor(Math.random() * questions.length);
      
      setActiveQuestionHexIdx(idx);
      setQuestionSubIdx(subIdx);
      setShowAnswer(false);
      setShowQuestionModal(true);
      return;
    }

    // Human Presenter -> Direct Cycle (Manual Control)
    setOwners(prev => {
      const current = prev[idx] || null;
      let next: OwnerState = null;
      if (current === null) next = 'transparent';
      else if (current === 'transparent') next = 'red';
      else if (current === 'red') next = 'green';
      else if (current === 'green') next = null;
      return { ...prev, [idx]: next };
    });
  };

  const changeQuestion = () => {
    if (activeQuestionHexIdx !== null) {
      const letter = alphabet[activeQuestionHexIdx];
      const questions = QUESTION_BANK[letter] || [];
      if (questions.length > 1) {
        setQuestionSubIdx((prev) => (prev + 1) % questions.length);
        setShowAnswer(false);
      }
    }
  };

  const claimLetter = (owner: OwnerState) => {
    if (activeQuestionHexIdx !== null) {
      setOwners(prev => ({ ...prev, [activeQuestionHexIdx]: owner }));
      setShowQuestionModal(false);
      setActiveQuestionHexIdx(null);
    }
  };

  const resetGame = () => {
    setOwners({});
    setWinner(null);
  };

  const fullReset = () => {
    resetGame();
    setScores({ red: 0, green: 0 });
    setOverallWinner(null);
  };

  const startGame = () => {
    setGameState('playing');
    fullReset();
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] font-sans text-white flex items-center justify-center p-6 dir-rtl relative overflow-hidden" dir="rtl">
        <AnimatePresence>
          {isPortrait && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-8 lg:hidden"
            >
              <motion.div
                animate={{ rotate: 90 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="mb-8 p-6 bg-white/10 rounded-full border border-white/20"
              >
                <RefreshCw className="w-16 h-16 text-blue-400" />
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-4 italic">يرجى تدوير الهاتف</h2>
              <p className="text-white/60 text-lg text-right">اللعبة مصممة للعب بالوضع الأفقي (Landscape) لتجربة أفضل على الجوال</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-600/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-10 shadow-3xl overflow-hidden"
        >
          <div className="text-center mb-10">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="inline-block bg-white p-6 rounded-[32px] mb-6 shadow-2xl">
              <Logo className="text-[#A80000] w-12 h-12" />
            </motion.div>
            <input 
              type="text" 
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="text-5xl font-black italic mb-2 tracking-tighter bg-transparent border-b-2 border-white/10 text-center w-full focus:border-red-600 outline-none transition-all placeholder:text-white/20"
              placeholder="اسم اللعبة"
            />
            <p className="text-white/40 uppercase tracking-widest font-bold text-sm mt-4">أدخل عالم التحدي الأبجدي</p>
          </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-white/60 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">عدد جولات الفوز</span>
                </div>
                <div className="flex gap-4">
                  {[1, 3, 5, 7].map(num => (
                    <button 
                      key={num}
                      onClick={() => setRoundsToWin(num)}
                      className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${
                        roundsToWin === num ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-white/5'
                      }`}
                    >
                      {num === 1 ? 'جولة واحدة' : `${num} جولات`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/60 mb-2">
                  <Palette className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">اختر طابع الألوان</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {THEME_OPTIONS.map((theme, idx) => (
                    <button 
                      key={idx}
                      onClick={() => selectTheme(idx)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        teamColorRed === theme.red ? 'border-white bg-white/20 scale-105' : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: theme.red }} />
                        <div className="w-6 h-6 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: theme.green }} />
                      </div>
                      <span className="font-bold text-[10px]">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/50 mb-2">
                    <Shuffle className="w-5 h-5 text-orange-500" />
                    <span className="font-bold">ترتيب الحروف</span>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={shuffleAlphabet}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 font-bold hover:bg-orange-500/20 transition-all"
                    >
                      <Shuffle className="w-5 h-5" />
                      <span>لخبطة الحروف</span>
                    </button>
                    <button 
                      onClick={resetAlphabet}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 font-bold hover:bg-white/10 transition-all"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>الترتيب الكلاسيك</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/60 mb-2">
                    <Users className="w-5 h-5 text-cyan-500" />
                    <span className="font-bold">نوع التقديم (بشري / آلي)</span>
                  </div>
                  <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button 
                      onClick={() => setPresenterType('ai')}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] transition-all font-bold ${presenterType === 'ai' ? 'bg-cyan-500 text-white shadow-xl ring-4 ring-cyan-500/20' : 'text-white/30 hover:text-white'}`}
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>مقدم آلي</span>
                    </button>
                    <button 
                      onClick={() => setPresenterType('human')}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] transition-all font-bold ${presenterType === 'human' ? 'bg-white text-black shadow-xl ring-4 ring-white/10' : 'text-white/30 hover:text-white'}`}
                    >
                      <Users className="w-5 h-5" />
                      <span>مقدم بشري</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/60 mb-2">
                    <Users className="w-5 h-5 text-red-500" />
                    <span className="font-bold">اسم الفريق 1</span>
                  </div>
                  <input 
                    type="text" 
                    value={teamRedName}
                    onChange={(e) => setTeamRedName(e.target.value)}
                    placeholder="الفريق 1"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/60 mb-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="font-bold">اسم الفريق 2</span>
                  </div>
                  <input 
                    type="text" 
                    value={teamGreenName}
                    onChange={(e) => setTeamGreenName(e.target.value)}
                    placeholder="الفريق 2"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startGame}
              className="w-full bg-white text-black py-6 rounded-[32px] text-2xl font-black flex items-center justify-center gap-4 shadow-2xl hover:shadow-white/20 transition-all mt-6"
            >
              ابدأ اللعب الآن <Play className="w-8 h-8 fill-black" />
            </motion.button>
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-20">
            <span className="text-white text-[10px] font-bold tracking-widest italic">جميع الحقوق محفوظة لمتجر 3KL</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-white p-4 md:p-8 dir-rtl overflow-hidden relative" dir="rtl" style={{ backgroundColor: teamColorGreen }}>
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div 
           className="absolute top-0 left-0 w-full h-full" 
           style={{ 
             clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
             backgroundColor: teamColorRed 
           }} 
         />
         <div 
           className="absolute bottom-0 left-0 w-full h-full" 
           style={{ 
             clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)',
             backgroundColor: teamColorRed
           }} 
         />
      </div>

      <AnimatePresence>
        {isPortrait && gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-8 lg:hidden"
          >
            <motion.div
              animate={{ rotate: 90 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mb-8 p-6 bg-white/10 rounded-full border border-white/20"
            >
              <RefreshCw className="w-16 h-16 text-blue-400" />
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-4 italic">يرجى تدوير الهاتف</h2>
            <p className="text-white/60 text-lg text-right">اللعبة مصممة للعب بالوضع الأفقي (Landscape) لتجربة أفضل على الجوال</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mb-8 relative z-20">
        <div className="flex items-center gap-6">
          <motion.div whileHover={{ rotate: 10 }} onClick={() => setGameState('menu')} className="bg-white p-4 rounded-3xl shadow-2xl cursor-pointer">
            <Logo className="text-[#A80000] w-10 h-10" />
          </motion.div>
          <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            <input 
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="text-5xl font-black text-white italic tracking-tighter bg-transparent px-6 py-4 outline-none transition-all text-center w-full min-w-[300px]"
              style={{ textShadow: `2px 2px 0 ${teamColorRed}` }}
            />
            <div className="flex items-center justify-center gap-2 bg-white/5 py-1">
              {presenterType === 'ai' ? (
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">مقدم آلي نشط</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-white/40">
                  <Users className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">إدارة بشرية</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-6 md:mt-0">
          <div className="flex items-center gap-8 bg-black/40 backdrop-blur-3xl px-10 py-5 rounded-[40px] border border-white/10 shadow-2xl relative">
             <div className="text-center">
               <div className="font-black text-2xl transition-all" style={{ color: teamColorRed }}>{teamRedName}</div>
               <div className="text-white font-black text-3xl mt-1">{scores.red}</div>
             </div>
             <div className="h-12 w-px bg-white/10" />
             <div className="text-center">
               <div className="font-black text-2xl transition-all" style={{ color: teamColorGreen }}>{teamGreenName}</div>
               <div className="text-white font-black text-3xl mt-1">{scores.green}</div>
             </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className={`p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 ${isMuted ? 'text-red-500' : 'text-white/60'}`}>
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <button onClick={() => setShowSettings(true)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
              <Settings className="w-6 h-6 text-white/60" />
            </button>
            <button onClick={resetGame} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
              <RotateCcw className="w-6 h-6 text-white/60" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center pb-32 w-full">
        <div 
          className="relative flex items-center justify-center transform scale-50 sm:scale-75 md:scale-90 lg:scale-100 transition-all duration-500" 
          style={{ 
            width: '650px', 
            height: '500px', 
            margin: '0 auto',
            transformOrigin: 'center center'
          }}
        >
          {HEX_GRID.map((hex, idx) => {
            const letter = alphabet[idx];
            const owner = owners[idx];
            
            let hexBg = '#FFFFFF';
            let textColor = '#111111';

            if (owner === 'red') {
              hexBg = teamColorRed;
              textColor = '#FFFFFF';
            } else if (owner === 'green') {
              hexBg = teamColorGreen;
              textColor = '#FFFFFF';
            } else if (owner === 'transparent') {
              hexBg = 'rgba(255, 255, 0, 0.4)'; 
              textColor = '#000000';
            }

            const hexW = 100;
            const hexH = 115.47;
            const rowShift = hex.offset ? hexW / 2 : 0;
            const top = hex.r * (hexH * 0.75) - (hex.r * 1); 
            const left = hex.c * hexW + rowShift - (hex.c * 1); 

            return (
              <motion.div
                key={idx}
                style={{ 
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}px`,
                  width: `${hexW + 1}px`,
                  height: `${hexH + 1}px`,
                  zIndex: 10,
                  backgroundColor: owner ? 'white' : 'rgba(255,255,255,0.1)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
                whileHover={{ scale: 1.05, zIndex: 60 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer p-0.5" 
                onClick={() => handleLetterClick(idx)}
              >
                <div 
                  className={`w-full h-full flex items-center justify-center transition-all duration-300 relative
                    ${owner === 'transparent' ? 'ring-4 ring-yellow-400 z-50' : ''}
                  `}
                  style={{
                    backgroundColor: hexBg,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  <span className="text-5xl font-black" style={{ color: textColor }}>
                    {letter}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSettings(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-[#1a1a1a] w-full max-w-2xl rounded-[40px] p-10 border border-white/10 shadow-3xl text-center overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black italic">إعدادات اللعبة</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-right">
                    <label className="font-bold text-white/40 block">اسم الفريق الأحمر</label>
                    <input 
                      type="text" 
                      value={teamRedName} 
                      onChange={(e) => setTeamRedName(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                  <div className="space-y-4 text-right">
                    <label className="font-bold text-white/40 block">اسم الفريق الأخضر</label>
                    <input 
                      type="text" 
                      value={teamGreenName} 
                      onChange={(e) => setTeamGreenName(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                </div>

                <div className="space-y-4 text-right">
                  <label className="font-bold text-white/40 block">المظهر والألوان</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {THEME_OPTIONS.map((theme, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectTheme(idx)}
                        className={`p-3 rounded-2xl border-2 transition-all ${teamColorRed === theme.red ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                      >
                         <div className="flex gap-1 mb-1">
                          <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: theme.red }} />
                          <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: theme.green }} />
                        </div>
                        <div className="text-[9px] font-bold text-center truncate">{theme.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-right">
                  <label className="font-bold text-white/40 block text-right italic">لخبطة الحروف</label>
                  <div className="flex gap-3">
                    <button onClick={shuffleAlphabet} className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                      <Shuffle className="w-5 h-5" /> لخبطة
                    </button>
                    <button onClick={resetAlphabet} className="flex-1 py-4 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl">
                      رجوع للأصل
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-bold text-white/40 block text-right">نوع التقديم</label>
                  <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button 
                      onClick={() => setPresenterType('ai')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold ${presenterType === 'ai' ? 'bg-cyan-500 text-white' : 'text-white/40'}`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>آلي</span>
                    </button>
                    <button 
                      onClick={() => setPresenterType('human')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold ${presenterType === 'human' ? 'bg-white text-black' : 'text-white/40'}`}
                    >
                      <Users className="w-4 h-4" />
                      <span>بشري</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-right">
                  <label className="font-bold text-white/40 block">اسم اللعبة</label>
                  <input type="text" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none" />
                </div>
              </div>

              <button onClick={() => setShowSettings(false)} className="mt-12 w-full py-5 bg-white text-black font-black rounded-[32px]">حفظ وإغلاق</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuestionModal && activeQuestionHexIdx !== null && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setShowQuestionModal(false)} />
            <motion.div initial={{ scale: 0.8, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, y: 50, opacity: 0 }} className="relative w-full max-w-4xl bg-white/5 border border-white/10 rounded-[64px] p-12 text-center shadow-4xl">
              <div className="flex flex-col items-center mb-12">
                <div className="w-32 h-32 flex items-center justify-center text-8xl font-black mb-6 bg-white text-black" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  {alphabet[activeQuestionHexIdx]}
                </div>
                <div className="text-white/40 uppercase tracking-widest font-black text-sm">سؤال الحرف</div>
              </div>

              <div className="min-h-[200px] flex items-center justify-center mb-12">
                <h3 className="text-5xl md:text-6xl font-black text-white">
                  {QUESTION_BANK[alphabet[activeQuestionHexIdx]]?.[questionSubIdx]?.q || 'لا يوجد سؤال'}
                </h3>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
                {!showAnswer ? (
                  <button onClick={() => setShowAnswer(true)} className="bg-white/10 hover:bg-white text-white hover:text-black px-12 py-6 rounded-full text-2xl font-black transition-all">إظهار الإجابة</button>
                ) : (
                  <div className="bg-yellow-500 text-black px-12 py-6 rounded-[32px] text-4xl font-black">{QUESTION_BANK[alphabet[activeQuestionHexIdx]]?.[questionSubIdx]?.a}</div>
                )}
                <button onClick={changeQuestion} className="bg-white/5 hover:bg-white/10 text-white/60 px-8 py-6 rounded-full text-xl font-bold flex items-center gap-2"><RefreshCw className="w-5 h-5" /> تغيير السؤال</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-white/10">
                <button onClick={() => claimLetter('red')} className="p-4 rounded-3xl border-2 flex flex-col items-center gap-2" style={{ borderColor: teamColorRed, backgroundColor: `${teamColorRed}22` }}>
                   <div className="w-6 h-6 rounded-full" style={{ backgroundColor: teamColorRed }} />
                   <span className="font-bold text-xs">{teamRedName}</span>
                </button>
                <button onClick={() => claimLetter('green')} className="p-4 rounded-3xl border-2 flex flex-col items-center gap-2" style={{ borderColor: teamColorGreen, backgroundColor: `${teamColorGreen}22` }}>
                   <div className="w-6 h-6 rounded-full" style={{ backgroundColor: teamColorGreen }} />
                   <span className="font-bold text-xs">{teamGreenName}</span>
                </button>
                <button onClick={() => claimLetter('transparent')} className="p-4 rounded-3xl border-2 border-yellow-500 bg-yellow-500/10 flex flex-col items-center gap-2 text-yellow-500">
                   <div className="w-6 h-6 rounded-full bg-yellow-500" />
                   <span className="font-bold text-xs">تحييد</span>
                </button>
                <button onClick={() => claimLetter(null)} className="p-4 rounded-3xl border-2 border-white/10 bg-white/5 flex flex-col items-center gap-2 text-white/40">
                   <span className="font-bold text-xs">تجاهل</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(winner || overallWinner) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6 backdrop-blur-3xl">
            <div className="text-center">
              <PartyPopper className="w-40 h-40 mx-auto mb-10 text-yellow-500" />
              <h2 className="text-7xl md:text-9xl font-black mb-8 italic">
                {overallWinner ? (overallWinner === 'red' ? teamRedName : teamGreenName) : (winner === 'red' ? teamRedName : teamGreenName)}
                <br /> {overallWinner ? 'بطل اللعبة 🏆' : 'فاز بالجولة!'}
              </h2>
              <button onClick={overallWinner ? fullReset : resetGame} className="bg-white text-black px-20 py-8 rounded-[40px] text-4xl font-black">{overallWinner ? 'لعبة جديدة' : 'الجولة التالية'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .dir-rtl { direction: rtl; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      
      <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none opacity-20">
        <span className="text-white text-[10px] font-bold tracking-widest italic">جميع الحقوق محفوظة لمتجر 3KL</span>
      </div>
    </div>
  );
}
