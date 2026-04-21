import { GoogleGenAI, Modality } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Character = 'DETECTIVE PIG' | 'WOLF' | 'LAWYER PIG';

const VOICE_MAP: Record<Character, string> = {
  'DETECTIVE PIG': 'Charon',
  'WOLF': 'Fenrir',
  'LAWYER PIG': 'Aoede'
};

const SCRIPT: Array<{ character: Character, text: string, translation?: string, slowTtsText?: string, normalTtsText?: string }> = [
  { character: 'DETECTIVE PIG', text: "Is that so, Wolfy? Well, I'm not afraid of you! And I'm taking you in!" },
  { character: 'WOLF', text: "Is that so?" },
  { character: 'DETECTIVE PIG', text: "Yeah, that's right!" },
  { character: 'WOLF', text: "For what crime?" },
  { character: 'DETECTIVE PIG', text: "For being a prowling, scheming wolf, that's what!" },
  { character: 'WOLF', text: "But surely it's no crime to be a wolf!" },
  { character: 'DETECTIVE PIG', text: "Yeah, yeah. Tell it to the judge! I've heard it all before. You're a danger to society!" },
  { character: 'WOLF', text: "But don't I have a right to an attorney or something?" },
  { character: 'DETECTIVE PIG', text: "Oh, all right. Fine." },
  { character: 'LAWYER PIG', text: "Hey! At-whay up-yay, etective-day?", slowTtsText: "Hey!!! Att way... upp yay... ee teck tiv day?!", normalTtsText: "Hey! Att-way upp-yay, ee-tecktiv-day?", translation: "Hey! What's up, detective?" },
  { character: 'DETECTIVE PIG', text: "Not much. Just got a perp here requesting a lawyer." },
  { character: 'LAWYER PIG', text: "Okay-yay. And what's his ory-stay?", slowTtsText: "Oh kay yay! And what's his oar ee stay??", normalTtsText: "Oh-kay-yay! And what's his oar-ee-stay?", translation: "Okay. And what's his story?" },
  { character: 'DETECTIVE PIG', text: "This is Big Bad Wolf. He's been prowling our meadow for days." },
  { character: 'WOLF', text: "Who's this?" },
  { character: 'DETECTIVE PIG', text: "Your lawyer." },
  { character: 'LAWYER PIG', text: "And the etective-day here tells me you're a persona non grata.", slowTtsText: "And the ee teck tiv day here tells me... you're a persona non grata.", normalTtsText: "And the ee-tecktiv-day here tells me you're a persona non grata.", translation: "And the detective here tells me you're a persona non grata." },
  { character: 'WOLF', text: "What?" },
  { character: 'DETECTIVE PIG', text: "You're someone who's unwelcome here." },
  { character: 'LAWYER PIG', text: "Ergo, I'm not inclined-yay to help oo-yay out-yay.", slowTtsText: "Ergo! I'm NOT in clined yay... to help ooh yay... owt yay!", normalTtsText: "Ergo! I'm not inclined-yay to help ooh-yay owt-yay!", translation: "Ergo, I'm not inclined to help you out." },
  { character: 'WOLF', text: "Come on! I have the right to an attorney!" },
  { character: 'LAWYER PIG', text: "Erhaps-pay, ut-bay I don't ork-way o-pray ono-bay, okay?", slowTtsText: "Air haps pay... uhtt bay I don't oark way... oh pray oh no bay! Okay?!", normalTtsText: "Air-haps-pay, uhtt-bay I don't oark-way oh-pray oh-no-bay! Okay?", translation: "Perhaps, but I don't work pro bono, okay?" },
  { character: 'WOLF', text: "What?" },
  { character: 'DETECTIVE PIG', text: "She doesn't work for free." },
  { character: 'WOLF', text: "I'm confused. Why is she talking like that?" },
  { character: 'DETECTIVE PIG', text: "She's a lawyer. She speaks in Pig Latin. All lawyers do! Surely with a rap sheet like yours, you've had a lawyer before!" },
  { character: 'WOLF', text: "Well, yes, but I've never had a pig lawyer before." },
  { character: 'LAWYER PIG', text: "Vis-a-vis, pro tempore, we ould-cay oo-day a little id-quay o-pray, okay? Whaddaya say?", slowTtsText: "Vis a vis! Pro tempore! We ood kay... ooh day... a little idd kway oh pray... okay?! Whaddaya say?!", normalTtsText: "Vis-a-vis! Pro tempore! We ood-kay ooh-day a little idd-kway oh-pray, okay? Whaddaya say?", translation: "Vis-a-vis, pro tempore, we could do a little quid pro quo, okay? Whaddaya say?" },
  { character: 'WOLF', text: "That's what I want to know! What did she say?" },
  { character: 'DETECTIVE PIG', text: "She won't work for free, but in the meantime, she might help you out for a little something in exchange." },
  { character: 'LAWYER PIG', text: "Ergo, if I elp-hay oo-yay, you have to omise-pray to ever-nay eat ee-may.", slowTtsText: "Ergo! If I ellp hay ooh yay... you HAVE to omm iss pray... to eh ver nay eat ee may!", normalTtsText: "Ergo! If I ellp-hay ooh-yay, you have to omm-iss-pray to eh-ver-nay eat ee-may!", translation: "Ergo, if I help you, you have to promise to never eat me." },
  { character: 'WOLF', text: "Huh?" },
  { character: 'DETECTIVE PIG', text: "You would have to promise to never eat her!" },
  { character: 'WOLF', text: "Okay, okay! Anything you want!" },
  { character: 'LAWYER PIG', text: "Ad-yay infinitum-yay!", slowTtsText: "Add yay... in fin eye tum yay!!!", normalTtsText: "Add-yay in-fin-eye-tum-yay!!!", translation: "Ad infinitum! (forever)" },
  { character: 'DETECTIVE PIG', text: "Forever." },
  { character: 'WOLF', text: "Yeah, yeah. Forever. I'll never eat you!" },
  { character: 'LAWYER PIG', text: "Ery-vay ell-way! Emove-ray the andcuffs-hay.", slowTtsText: "Eh ree vay... ell way! Ee moov ray... the and cuffs hay!", normalTtsText: "Eh-ree-vay ell-way! Ee-moov-ray the and-cuffs-hay!", translation: "Very well! Remove the handcuffs." },
  { character: 'DETECTIVE PIG', text: "Are you serious?" },
  { character: 'LAWYER PIG', text: "Es-yay! My lient-cay has ommitted-cay no imes-cray.", slowTtsText: "Ess yay! My lie ent kay... has oh mitt id kay... NO eye ms cray!", normalTtsText: "Ess-yay! My lie-ent-kay has oh-mitt-id-kay NO eye-ms-cray!", translation: "Yes! My client has committed no crimes." },
  { character: 'DETECTIVE PIG', text: "But he's Big Bad Wolf!" },
  { character: 'LAWYER PIG', text: "And-yay it's-yay no ime-cray to be a ig-bay ad-bay olf-way!", slowTtsText: "And yay... itts yay... NO eye m cray... to be a igg bay... add bay... oolf way!", normalTtsText: "And-yay itts-yay NO eye-m-cray to be a igg-bay add-bay oolf-way!", translation: "And it's no crime to be a big bad wolf!" },
  { character: 'WOLF', text: "What'd she say?" },
  { character: 'DETECTIVE PIG', text: "She said it's no crime to be a Big Bad Wolf!" },
  { character: 'WOLF', text: "Aha! See?! That's what I said! Thanks, uh, eh?" },
  { character: 'DETECTIVE PIG', text: "Thanks a lot! You just let a big bad wolf get away." },
  { character: 'LAWYER PIG', text: "Unless he ommits-cay a ime-cray, you annot-cay etain-day im-hay.", slowTtsText: "Unless he oh mitts kay... a eye m cray... you an nott kay... ee tane day... imm hay!", normalTtsText: "Unless he oh-mitts-kay a eye-m-cray, you an-nott-kay ee-tane-day imm-hay!", translation: "Unless he commits a crime, you cannot detain him." },
  { character: 'DETECTIVE PIG', text: "You think so, eh? We'll see about that." },
  { character: 'LAWYER PIG', text: "Oo-yay an't-cay andle-hay the uth-tray!", slowTtsText: "Ooh yay... ant kay... and ull hay... the ooth tray!!!", normalTtsText: "Ooh-yay ant-kay and-ull-hay the ooth-tray!!!", translation: "You can't handle the truth!" },
  { character: 'DETECTIVE PIG', text: "Ugh! Lawyers. And all that legalese they speak!" },
  { character: 'WOLF', text: "Aha! That was a close one! Now, where might I find a little pig to eat!" }
];

async function generateAudio() {
  console.log("Using Vertex AI Application Default Credentials...");
  const genAI = new GoogleGenAI({ 
    vertexai: { 
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1' 
    } as any
  });
  const ai = genAI as any;

  const outputPath = path.resolve(__dirname, '../src/data/audioData.json');
  const audioData: Record<string, string> = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf8')) : {};

  console.log('Starting audio generation for', SCRIPT.length, 'lines...');
  
  for (let i = 0; i < SCRIPT.length; i++) {
    const line = SCRIPT[i];
    
    if (line.character === 'LAWYER PIG') {
      // Generate both normal and slow versions for Lawyer Pig
      const speeds: Array<'normal' | 'slow'> = ['normal', 'slow'];
      
      for (const speed of speeds) {
        const id = `${line.character}:${line.text}:${speed}`;
        const spokenText = speed === 'slow' ? line.slowTtsText : line.normalTtsText;
        if (audioData[id]) {
          console.log(`Skipping line ${i + 1}/${SCRIPT.length}: [${line.character}] (${speed}) (already exists)`);
          continue;
        }
        console.log(`Generating line ${i + 1}/${SCRIPT.length}: [${line.character}] (${speed}) ${line.text}`);
        
        await generateSingleAudio(ai, id, spokenText!, VOICE_MAP[line.character as Character], audioData);
      }
    } else {
      // Single version for others
      const id = `${line.character}:${line.text}`;
      if (audioData[id]) {
        console.log(`Skipping line ${i + 1}/${SCRIPT.length}: [${line.character}] (already exists)`);
        continue;
      }
      console.log(`Generating line ${i + 1}/${SCRIPT.length}: [${line.character}] ${line.text}`);
      await generateSingleAudio(ai, id, line.text, VOICE_MAP[line.character as Character], audioData);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(audioData, null, 2));
  console.log(`\nSuccessfully generated audio data and saved to ${outputPath}`);
}

async function generateSingleAudio(ai: any, id: string, text: string, voice: string, audioData: Record<string, string>) {
  let retries = 0;
  const maxRetries = 5;
  let success = false;

  while (retries < maxRetries && !success) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const generated = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (generated) {
        audioData[id] = generated;
        success = true;
      } else {
        throw new Error('No audio data returned from API');
      }

      // Wait a bit to prevent rate limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (error: any) {
      retries++;
      console.warn(`Error generating audio (attempt ${retries}/${maxRetries}):`, error.message);
      if (retries >= maxRetries) {
        console.error(`Failed to generate audio for ID: ${id}`);
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, Math.pow(2, retries) * 10000));
    }
  }
}

generateAudio().catch(console.error);
