
# Buildaly Project Tracker — Firebase One-Shot

אפליקציית ווב לשיתוף כל צוות הניהול: **Auth + Firestore** (ריל־טיים).
שני עולמות נפרדים: **ייזמות** ו-**קבלנות ביצוע**. RTL מלא.

## מה צריך למלא
1) צור פרויקט Firebase וקבל מפתחות Web App.
2) צור קובץ `.env` בשורש עם הערכים (ראה `.env.example`).
3) ב-Firebase Console:
   - הפעלה של Authentication מסוג Email/Password + יצירת משתמשים.
   - הפעלה של Firestore (מומלץ במצב Production).
   - הדבקת ה-Rules המצורפות (`firestore.rules`) או להתחיל ב-simple-auth.

## התקנה והרצה
```bash
npm install
npm run dev
```
(פריסה ב-Vercel: הגדר את משתני הסביבה ב-Settings → Environment Variables)

## מבנה
- `/development` — יזמות: רשימה רזה + Drawer עם קלטים כלכליים; חישוב רווח (₪) ורווח %.
- `/execution` — ביצוע: רשימה רזה + Drawer עם כל נתוני מכרז; חישוב EQ, ₪/מ״ר, ₪/דירה.
- `/` — דשבורד פתיחה (סיכומים של שני העולמות).

## הערות
- הרשאות בסיס: קובץ `firestore.rules` המצורף נותן **קריאה/כתיבה למשתמשים מחוברים בלבד**. ניתן להקשיח בהמשך.
