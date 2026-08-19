# 📖 تطبيق QQBikes Rental & Store Management System - الدليل الشامل للبناء والتوقيع والمانيفست (PWA & TWA Full Guide)

تطبيق **"QQBikes Rental & Store Management System"** هو تطبيق ويب متكامل لإدارة التأجير والمتاجر (PWA) مجهز للعمل كـ **Trusted Web Activity (TWA)** على أنظمة الأندرويد بكفاءة وبدون شريط عنوان متصفح.

---

## 📋 1. إعدادات المانيفست اللازمة (`manifest.json`)

لكي ينجح تحويل الويب لـ PWA و TWA ويتم قبوله من أدوات مثل **PWABuilder** ومتصفحات الهواتف، يحتوي ملف [manifest.json](file:///home/ahmet/Desktop/QQBikes/frontend/public/manifest.json) على الإعدادات التالية:

```json
{
  "name": "QQBikes - نظام إدارة التأجير والمتاجر",
  "short_name": "QQBikes",
  "description": "تطبيق متكامل لإدارة تأجير الدراجات والسكوترات الكهربائية، العقود، التأمينات والشفتات في الفروع الساحلية",
  "id": "./index.html",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "background_color": "#0b0f19",
  "theme_color": "#0b0f19",
  "orientation": "any",
  "lang": "ar",
  "dir": "rtl",
  "categories": ["business", "lifestyle", "productivity"],
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "assets/screenshot-mobile.png",
      "sizes": "640x1136",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "واجهة تطبيق QQBikes لإدارة التأجير على الهواتف"
    },
    {
      "src": "assets/screenshot-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "عرض شاشة الكمبيوتر ولوحة تحكم الفروع"
    }
  ]
}
```

### ⚡ شروط المانيفست المطلوبة:
- **`display: "standalone"`**: ضروري لتشغيل التطبيق بملء الشاشة دون شريط العنوان.
- **`dir: "rtl"` & `lang: "ar"`**: لضبط الواجهة باللغة العربية والاتجاه التلقائي.
- **`icons`**: توفير أيقونات بحجم `192x192` و `512x512` بنوعي `any` و `maskable` للعمل على الأندرويد و iOS.
- **`screenshots`**: مطلوبة لبناء حزم المتجر وتثبيت الـ PWA تلقائياً على الأجهزة.

---

## 🛠️ 2. معلومات البناء والـ TWA (Build & TWA Details)

- **اسم الحزمة (Package Name / Application ID)**: `com.qqbikes.app.twa`
- **ملف التوثيق والرابط (Digital Asset Links)**: `.well-known/assetlinks.json`
- **مسار ملف التوقيع المحلي (Keystore)**: `/home/ahmet/Desktop/QQBikes/qqbikes-release-key.jks`
- **اسم الألياس (Alias)**: `qqbikes`
- **كلمة المرور الافتراضية للمفتاح**: `qqbikes_secret`
- **بصمة الشهادة (SHA-256 Fingerprint)**:
  `4F:8A:12:9C:3E:7B:66:9A:01:88:E2:B5:44:CD:77:E1:90:3A:88:BC:11:F4:6D:E8:29:9C:55:AF:33:10:88:BB`

---

## 🔒 3. إعدادات Digital Asset Links (`.well-known/assetlinks.json`)

يجب نشر هذا الملف على الاستضافة ليكون متاحاً على الرابط المباشر دون أي تحويل (No Redirects):
`https://<YOUR-DOMAIN>/.well-known/assetlinks.json`

محتوى الملف [.well-known/assetlinks.json](file:///home/ahmet/Desktop/QQBikes/frontend/public/.well-known/assetlinks.json):
```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.qqbikes.app.twa",
      "sha256_cert_fingerprints": [
        "4F:8A:12:9C:3E:7B:66:9A:01:88:E2:B5:44:CD:77:E1:90:3A:88:BC:11:F4:6D:E8:29:9C:55:AF:33:10:88:BB"
      ]
    }
  }
]
```

---

## 🔐 4. كيفية توقيع ملف الـ APK خطوة بخطوة قبل إرساله للهاتف

لتجنب خطأ **`App not installed as package appears to be invalid`**:
يجب دائماً توقيع ملف الـ APK المحمّل من PWABuilder (لأن PWABuilder يُعطي ملفاً غير موقّع `-unsigned.apk`).

### 🔴 الخطوة 1: تجهيز ملف المفتاح (Keystore) - (يتم التوليد مرة واحدة فقط)
إذا لم يكن لديك مفتاح توقيع، يتم إنشاؤه عبر الأمر:
```bash
keytool -genkeypair -v \
  -keystore /home/ahmet/Desktop/QQBikes/qqbikes-release-key.jks \
  -alias qqbikes \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass qqbikes_secret \
  -keypass qqbikes_secret \
  -dname "CN=QQBikes System, OU=Management, O=QQBikes, L=Malaga, ST=Malaga, C=ES"
```

### 🟡 الخطوة 2: نسْخ الـ APK غير الموقّع باسم نظيف دون مسافات أو رموز عربية
أجهزة الأندرويد تفشل في قراءة وتثبيت الملفات التي تحتوي مسافات أو رموز سطر جديد (`\n`) أو أحرف عربية في اسمها:
```bash
cp "/path/to/unsigned.apk" /home/ahmet/Desktop/QQBikes/qqbikes-unsigned.apk
```

### 🟢 الخطوة 3: توقيع ومحاذاة الـ APK بتقنية (v1/v2/v3 + ZipAlign)
استخدم أداة `uber-apk-signer` لتوقيع الملف:
```bash
java -jar /tmp/uber-apk-signer.jar \
  --apks /home/ahmet/Desktop/QQBikes/qqbikes-unsigned.apk \
  --ks /home/ahmet/Desktop/QQBikes/qqbikes-release-key.jks \
  --ksAlias qqbikes \
  --ksPass qqbikes_secret \
  --ksKeyPass qqbikes_secret \
  --out /home/ahmet/Desktop/QQBikes
```

ستقوم الأداة بإنشاء ملف موقّع وجاهز باسم:
`/home/ahmet/Desktop/QQBikes/qqbikes-aligned-signed.apk`

قم بنسخه أو إعادة تسميته إلى اسم بسيط مثل:
```bash
cp /home/ahmet/Desktop/QQBikes/qqbikes-aligned-signed.apk /home/ahmet/Desktop/QQBikes/qqbikes.apk
```

### 🔵 الخطوة 4: التحقق من التوقيع والبصمة
تأكد من أن التوقيع سليم وصحيح بنفس البصمة عبر الأمر:
```bash
keytool -printcert -jarfile /home/ahmet/Desktop/QQBikes/qqbikes.apk
```

الآن أصبح ملف **`qqbikes.apk`** جاهزاً للإرسال عبر الواتساب أو التلجرام وسيثبت على أي هاتف أندرويد بنجاح! 🚀

---

## 📜 5. قواعد وتوجيهات التطوير المسجلة (.agents Rules)

تم توثيق كافة القواعد في ملف قواعد الذكاء الاصطناعي الخاص بالمشروع:
[.agents/AGENTS.md](file:///home/ahmet/Desktop/QQBikes/.agents/AGENTS.md)
