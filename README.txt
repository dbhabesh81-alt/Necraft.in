NE CRAFT  -  SITE PACKAGE
=========================

Is zip mein kya hai
-------------------
index.html                  Naya site. Saari photos (banner/logo aur aapki product photos) isi ek file ke andar hain.
previous-version/index.html Purana version, jaisa pehle diya tha. Isme demo password necraft123 hai, isko public site par mat lagana.
apps-script/Code.gs         Order inbox ka code (Google Sheet + email). Neeche Step 3 dekhein.
README.txt                  Yeh guide.


STEP 1. Site live karna
-----------------------
1. index.html ko kisi bhi hosting par upload karein (jaise Netlify Drop: app.netlify.com/drop, folder ya file drag karein).
2. Site https:// par honi chahiye. Free hosting bhi chalegi.
3. Ek hi file hai, isliye koi aur setup nahi chahiye.


STEP 2. Admin panel
-------------------
1. Apni site ke link ke aakhir mein #admin lagakar kholein. Example: https://aapkisite.com/#admin
2. Pehli baar "Set your admin password" dikhega. Apna password banayein (8 ya zyada characters).
   Default password koi nahi hai. Email necraft.in@gmail.com se login hota hai.
3. Password badalna ho to: Admin > Settings > Change admin password.
4. Staff login ka link site ke footer mein bhi hai.

Admin mein aap yeh sab badal sakte hain:
- Settings: email, contact number, shop address, UPI ID, UPI par naam, UPI ya cash on delivery on/off, shipping fee, free shipping limit, COD fee.
- Products: naya product jodna, naam, price, purana price, stock, description, details, photo (file chunein, drag karein ya paste karein), category.
- Orders: har order ka status (Placed se Delivered tak), courier ID, "Payment received" mark karna.
- Ratings: customers ke reviews dekhna, chhupana ya delete karna.
- Messages: contact form se aaye messages.


STEP 3. Orders aapke paas aayein (Google Sheet + email)
------------------------------------------------------
Customer ka order unke apne phone/browser se aata hai. Use aap tak pahunchane ke liye yeh free setup karein (10 minute):

1. Google Sheet banayein (sheets.new).
2. Menu mein Extensions > Apps Script kholein.
3. Jo code dikhe wo hata dein aur apps-script/Code.gs ka poora code paste karein.
4. Upar wali line mein ADMIN_KEY ko koi lamba secret bana dein (jaise: NEC-kuch-lamba-random-9381). Isko yaad rakhein.
5. Deploy > New deployment > Type: Web app.
     Execute as: Me
     Who has access: Anyone
   Deploy dabayein. Google permission maangega (sheet aur email ke liye), Allow karein.
6. Jo "Web app URL" mile use copy karein (https://script.google.com/macros/s/.../exec).
7. Apni site ke Admin > Settings kholein:
     Order inbox link  = woh URL
     Admin key         = wahi secret jo upar point 4 mein likha
   Save settings dabayein, phir "Test order inbox" dabayein. "Order inbox is connected" dikhna chahiye.
8. Ab har naye order par:
     - Sheet ke "Orders" tab mein ek nayi row aati hai: customer ka naam, phone, poora address, map link, items, total, payment (UPI ya COD), UPI transaction ID.
     - necraft.in@gmail.com par email aata hai.
     - Admin > Orders mein "Get new orders" dabayein, order dashboard mein aa jayega.

Admin key sirf us device par rehti hai jahan aapne Settings mein likhi. Kisi ko mat batayein.


STEP 4. Products, price ya photo badalna aur live karna
------------------------------------------------------
1. Admin > Products > Edit ya Add product. Price aur photo daalkar Save karein.
2. Yeh badlav pehle sirf aapke browser mein save hota hai.
3. Sabko dikhane ke liye: Admin > Settings > "Download site file" dabayein. Nayi index.html aayegi (photos uske andar hongi).
4. Is nayi index.html ko hosting par purani ki jagah upload karein.
Settings (phone, UPI, fees) bhi isi tarah live hoti hain.


UPI payment kaise kaam karta hai
--------------------------------
- Customer checkout par aapki UPI ID par paise bhejta hai (ya "Open UPI app" dabata hai) aur transaction ID likhta hai.
- Aap apne UPI app mein paise check karein. Phir Admin > Orders > View > "Mark payment received".
- Paise apne aap verify nahi hote. Automatic payment ke liye Razorpay jaisa payment gateway judna padega (alag step).
- Cash on delivery: order mein "COD, due" dikhta hai, Delivered karne par "paid" ho jata hai.


Dhyan rakhein
-------------
- Customer ke account, cart aur saved address unke apne browser mein rehte hain. Order ID aur phone number se "Track my order" kisi bhi device par kaam karta hai (Step 3 ke baad).
- Order ki keemat customer ke browser se aati hai. Shipping se pehle total aur products ek baar jaanch lein.
- Admin panel har browser mein apna alag hota hai. Doosre log #admin kholkar aapka data ya orders nahi dekh sakte, orders sirf aapki Google Sheet aur admin key se khulte hain.
- Photos ko 900 pixel tak chhota karke save kiya jata hai, taaki site tez rahe.
- 3D effects ke liye internet chahiye (three.js aur smooth-scroll library CDN se aati hain). Agar 3D na chale to site banner photo ke saath normal dikhti hai.
