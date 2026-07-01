"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const ws_1 = require("ws");
/**
 * =========================
 * ⚙️ CONFIGURAÇÃO GERAL
 * =========================
 */
const QUEUE_DIR = path_1.default.join(process.cwd(), "queue");
const INBOX = path_1.default.join(QUEUE_DIR, "inbox");
const PROCESSING = path_1.default.join(QUEUE_DIR, "processing");
const DONE = path_1.default.join(QUEUE_DIR, "done");
const MAX_CONCURRENT_JOBS = 3;
/**
 * 🌐 WEBSOCKET SERVER (PROGRESSO EM TEMPO REAL)
 */
const wss = new ws_1.WebSocketServer({ port: 3010 });
function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
        // @ts-ignore
        if (client.readyState === 1)
            client.send(msg);
    });
}
/**
 * ⚡ ESTADO DO WORKER
 */
let activeJobs = 0;
/**
 * 🧠 1. IA DE STORYBOARD (EVOLUÇÃO V3)
 * agora gera cenas mais inteligentes e estruturadas
 */
function generateAIStoryboard(prompt, duration) {
    const sceneCount = Math.max(3, Math.min(8, duration));
    return Array.from({ length: sceneCount }).map((_, i) => {
        const scenePrompt = `
CENA ${i + 1}:

Contexto geral: ${prompt}

Objetivo narrativo: evoluir a história de forma cinematográfica.

Elementos obrigatórios:
- iluminação cinematográfica realista
- câmera dinâmica com movimento suave
- estética de filme high-end
- consistência de personagens
- progressão emocional da cena

Detalhe específico desta cena:
${i === 0 ? "introdução do mundo e contexto inicial"
            : i === sceneCount - 1 ? "clímax e resolução emocional"
                : "desenvolvimento da narrativa com transição visual"}
    `.trim();
        return {
            id: i + 1,
            duration: Math.floor(duration / sceneCount),
            prompt: scenePrompt
        };
    });
}
/**
 * 🧠 2. IA MOCK (PRONTO PRA GPT REAL)
 * aqui depois você troca por OpenAI / Claude
 */
function enhancePromptWithAI(basePrompt, scene) {
    return `
[AI ENHANCED SCENE ${scene}]
${basePrompt}

STYLE: cinematic ultra realistic 8K, volumetric lighting, film grain subtle
CAMERA: steadycam, dolly motion, depth of field
MOOD: emotional progression, high immersion storytelling
  `.trim();
}
/**
 * 🎬 3. RENDER REAL COM PROGRESSO
 */
function renderScene(scene, outputPath, jobId, sceneIndex, totalScenes) {
    return new Promise((resolve, reject) => {
        const finalPrompt = enhancePromptWithAI(scene.prompt, scene.id);
        const cmd = `
ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=${scene.duration} \
-vf "drawtext=text='${finalPrompt.replace(/'/g, "")}':fontsize=18:fontcolor=white:x=50:y=50" \
${outputPath}
`;
        (0, child_process_1.exec)(cmd, (err) => {
            if (err)
                return reject(err);
            const progress = Math.floor(((sceneIndex + 1) / totalScenes) * 100);
            broadcast({
                type: "scene_complete",
                jobId,
                sceneId: scene.id,
                progress
            });
            resolve();
        });
    });
}
/**
 * 📦 4. PRIORITY QUEUE SYSTEM
 */
function getNextJob() {
    const files = fs_1.default.readdirSync(INBOX);
    if (!files.length)
        return null;
    const jobs = files.map(file => {
        const raw = fs_1.default.readFileSync(path_1.default.join(INBOX, file), "utf-8");
        const job = JSON.parse(raw);
        return { file, job };
    });
    // prioridade maior primeiro
    jobs.sort((a, b) => (b.job.priority || 1) - (a.job.priority || 1));
    return jobs[0];
}
/**
 * 🎬 5. PROCESSAMENTO PRINCIPAL
 */
async function processJob(file, job) {
    const jobId = job.id;
    broadcast({ type: "job_started", jobId });
    const storyboard = generateAIStoryboard(job.name, job.duration || 6);
    const jobFolder = path_1.default.join(PROCESSING, jobId);
    fs_1.default.mkdirSync(jobFolder, { recursive: true });
    const renderedScenes = [];
    for (let i = 0; i < storyboard.length; i++) {
        const scene = storyboard[i];
        const output = path_1.default.join(jobFolder, `scene-${scene.id}.mp4`);
        broadcast({
            type: "scene_start",
            jobId,
            sceneId: scene.id
        });
        await renderScene(scene, output, jobId, i, storyboard.length);
        renderedScenes.push(output);
    }
    /**
     * 🎞️ MERGE FINAL
     */
    const listFile = path_1.default.join(jobFolder, "list.txt");
    fs_1.default.writeFileSync(listFile, renderedScenes.map(v => `file '${v}'`).join("\n"));
    const finalOutput = path_1.default.join(DONE, `${jobId}.mp4`);
    await new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`ffmpeg -y -f concat -safe 0 -i ${listFile} -c copy ${finalOutput}`, (err) => {
            if (err)
                return reject(err);
            resolve(true);
        });
    });
    fs_1.default.renameSync(path_1.default.join(INBOX, file), path_1.default.join(DONE, file));
    broadcast({
        type: "job_complete",
        jobId,
        progress: 100
    });
}
/**
 * ⚡ 6. WORKER PARALELO V3
 */
function startWorker() {
    console.log("⚡ Worker V3 ONLINE + AI + WS + PRIORITY QUEUE");
    setInterval(async () => {
        if (activeJobs >= MAX_CONCURRENT_JOBS)
            return;
        const next = getNextJob();
        if (!next)
            return;
        activeJobs++;
        processJob(next.file, next.job)
            .catch((err) => {
            console.error("❌ Job error:", err);
        })
            .finally(() => {
            activeJobs--;
        });
    }, 800);
}
startWorker();
