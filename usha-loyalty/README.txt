HOTEL USHA PALACE LOYALTY APP

1) TELEGRAM NOTIFICATION (free, instant push on your phone)
   - Telegram mein @BotFather se /newbot karke bot banao, TOKEN copy karo.
   - Apne bot ko ek message bhejo (jaise "hi").
   - Browser mein kholo: https://api.telegram.org/bot<TOKEN>/getUpdates
     Usme "chat":{"id":123456789} milega. Wohi CHAT_ID hai.

2) ONLINE LAGANA (Render.com ya Railway.app)
   - Ye folder GitHub par daalo, Render par "New Web Service" banao.
   - Start command: node server.js
   - Environment variables:
       OWNER_PASSWORD   = aapka secret password
       TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID  (upar se)
       DATA_DIR = /data   (persistent disk/volume attach karo, warna restart par data jayega)
     Optional: BIZ_NAME, TOTAL_STAMPS, REWARD, COOLDOWN_MIN

3) USE
   - Owner dashboard:  https://AAPKA-LINK/owner   (QR yahin se print karo)
   - Customer QR scan -> registration -> aapko Telegram par turant message.
   - Dashboard par naam, number, signature, stamps, "Send offer" (WhatsApp), "Redeem".

4) APK
   - https://www.pwabuilder.com par apna link daalo, Android package download karo (APK/AAB).

Local test: OWNER_PASSWORD=abc node server.js  -> http://localhost:3000
