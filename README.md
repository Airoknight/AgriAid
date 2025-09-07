# ArgiAid

**ArgiAid** is a mobile-first web app designed for farmers to easily understand what crop they’ve planted, see possible diseases, and get clear guidance—both visual and vocal—to tackle crop health issues.  

---

##  Overview  
ArgiAid helps farmers by:  
- Asking **what crop** they have planted and capturing their **location**.  
- Using AI (Nano Banana) to **anticipate probable diseases or pests** based on crop type, region, and season.  
- Generating **realistic images** of those diseases at various severity levels (mild, moderate, severe) as visual references.  
- Letting the farmer **select the image that matches** what they observe in their field.  
- Delivering **straightforward, localized steps to resolve the issue**, spoken aloud using ElevenLabs for accessibility.

This MVP is a helping hand—not a diagnostic tool—to support farmers with visual comparison and voice-guided recommendations tailored to their needs.

---

##  Key Features (MVP)  
- **Crop & location input**: Farmer chooses crop (e.g., paddy, sugarcane) and optionally region.  
- **Disease anticipation**: Backend predicts likely threats and explains why.  
- **AI-generated disease imagery**: Nano Banana creates reference images realistic to field conditions.  
- **Easy image comparison**: Farmer picks the best match to their crop's condition.  
- **Voice-guided advice**: ElevenLabs vocalizes simple, trusted steps for remediation in local languages.  
- **Export & record**: Download guidance and images as a package for future use or agronomist consultation.

---

##  How It Works (User Flow)

1. **Start**: Farmer selects crop and optionally region.  
2. **Prediction**: App suggests top likely diseases for that crop-location-season combination.  
3. **Visualization**: For each disease, Nano Banana generates images (mild/moderate/severe).  
4. **Selection**: Farmer taps the image that matches what they see in their field.  
5. **Guidance**: App presents practical next steps and offers an audio narration of the advice via ElevenLabs.  
6. **Export**: Farmer can download a package containing images, prompts, and voice guidance—or share it with help services.

---

##  Project Structure  
