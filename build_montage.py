import os
import sys
import asyncio
import subprocess
import json
import numpy as np
import scipy.io.wavfile as wav
from PIL import Image, ImageDraw, ImageFont
import edge_tts

# Paths
BASE_DIR = r"C:\Users\hp\Documents\projet kaggle\DreamSentinel-AI"
RAW_VIDEO = os.path.join(BASE_DIR, "DreamSentinel AI _ Somnia Event Contracts – Brave 2026-09-05 16-36-07.mp4")
OUTPUT_DIR = os.path.join(r"C:\Users\hp\.gemini\antigravity\brain\de23ed71-cbe4-468b-b94f-24fad7ec5451\scratch\montage_build")
os.makedirs(OUTPUT_DIR, exist_ok=True)

LOGO_PATH = os.path.join(BASE_DIR, "frontend", "public", "logo.jpg")

# Fonts
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_MONO = r"C:\Windows\Fonts\consola.ttf"

def get_duration(media_path):
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", media_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return float(res.stdout.strip())

def create_intro_card(out_path, duration=5.0):
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), (7, 10, 19))
    draw = ImageDraw.Draw(img)
    
    # Load and paste logo
    if os.path.exists(LOGO_PATH):
        logo = Image.open(LOGO_PATH).resize((220, 220), Image.Resampling.LANCZOS)
        # Create circular mask
        mask = Image.new('L', (220, 220), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse((0, 0, 220, 220), fill=255)
        img.paste(logo, (w//2 - 110, 200), mask)
    
    font_badge = ImageFont.truetype(FONT_MONO, 22)
    font_main = ImageFont.truetype(FONT_BOLD, 64)
    font_sub = ImageFont.truetype(FONT_REG, 28)
    font_pill = ImageFont.truetype(FONT_MONO, 20)

    # Top pill
    badge_text = "SOMNIA x DREAMDEX HACKATHON * EVENT CONTRACTS TRACK"
    bbox = font_badge.getbbox(badge_text)
    bw = bbox[2] - bbox[0]
    draw.rounded_rectangle([w//2 - bw//2 - 20, 120, w//2 + bw//2 + 20, 160], radius=10, fill=(20, 25, 45), outline=(168, 85, 247), width=1)
    draw.text((w//2 - bw//2, 128), badge_text, font=font_badge, fill=(216, 180, 254))

    # Main Title
    title = "DreamSentinel AI"
    bbox = font_main.getbbox(title)
    tw = bbox[2] - bbox[0]
    draw.text((w//2 - tw//2, 450), title, font=font_main, fill=(255, 255, 255))

    # Subtitle
    sub = "Autonomous Bayesian Swarm Intelligence for Prediction Markets"
    bbox = font_sub.getbbox(sub)
    sw = bbox[2] - bbox[0]
    draw.text((w//2 - sw//2, 535), sub, font=font_sub, fill=(167, 139, 250))

    # Feature badges row
    pills = [
        "105,420 TPS Reactive L1",
        "Sub-Second CLOB Execution",
        "Bayesian Kelly Sizing",
        "PvPDuelEscrow.sol",
        "ERC-4626 Copy-Vaults"
    ]
    px = 240
    py = 630
    for p in pills:
        b = font_pill.getbbox(p)
        pw = b[2] - b[0]
        draw.rounded_rectangle([px, py, px + pw + 30, py + 44], radius=12, fill=(15, 23, 42), outline=(59, 130, 246), width=1)
        draw.text((px + 15, py + 10), p, font=font_pill, fill=(147, 197, 253))
        px += pw + 50

    # Live platform URL
    url_text = "Production Terminal: https://dream-sentinel-ai.vercel.app  *  Somnia Shannon (50312)"
    bbox = font_pill.getbbox(url_text)
    uw = bbox[2] - bbox[0]
    draw.text((w//2 - uw//2, 730), url_text, font=font_pill, fill=(148, 163, 184))

    img.save(out_path)

def create_outro_card(out_path):
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), (7, 10, 19))
    draw = ImageDraw.Draw(img)

    if os.path.exists(LOGO_PATH):
        logo = Image.open(LOGO_PATH).resize((180, 180), Image.Resampling.LANCZOS)
        mask = Image.new('L', (180, 180), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse((0, 0, 180, 180), fill=255)
        img.paste(logo, (w//2 - 90, 140), mask)

    font_main = ImageFont.truetype(FONT_BOLD, 54)
    font_sub = ImageFont.truetype(FONT_REG, 26)
    font_mono = ImageFont.truetype(FONT_MONO, 20)

    title = "DreamSentinel AI - Somnia L1"
    bbox = font_main.getbbox(title)
    draw.text((w//2 - (bbox[2]-bbox[0])//2, 340), title, font=font_main, fill=(255, 255, 255))

    sub = "Institutional Quantitative Intelligence for On-Chain Event Contracts"
    bbox = font_sub.getbbox(sub)
    draw.text((w//2 - (bbox[2]-bbox[0])//2, 410), sub, font=font_sub, fill=(167, 139, 250))

    # Box for contracts
    box_x, box_y, box_w, box_h = 360, 480, 1200, 320
    draw.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + box_h], radius=16, fill=(15, 23, 42), outline=(168, 85, 247), width=1)
    
    draw.text((box_x + 30, box_y + 25), "VERIFIED SMART CONTRACTS ON SOMNIA SHANNON TESTNET (50312):", font=font_mono, fill=(216, 180, 254))
    
    contracts = [
        ("DreamSentinelOracle:", "0xE1B0f9Fdab26E6470520911BA7CCBda48650541D"),
        ("DreamSentinelVault:",  "0x7F4EA982ef392D1e7F46798fE7618e31F1bE689a"),
        ("PvPDuelEscrow:",       "0x91F5EB86F0F6E5faCAbc648834F4711D9fa6892e"),
        ("MockUSDso Token:",     "0x3563459c0C1Ae2D4b48622119dE56997A52a23eb")
    ]
    cy = box_y + 75
    for name, addr in contracts:
        draw.text((box_x + 30, cy), name, font=font_mono, fill=(147, 197, 253))
        draw.text((box_x + 300, cy), addr, font=font_mono, fill=(255, 255, 255))
        cy += 45

    # Footer
    footer = "Live Platform: dream-sentinel-ai.vercel.app  *  GitHub: github.com/sissokocheick/DreamSentinel-AI"
    bbox = font_mono.getbbox(footer)
    draw.text((w//2 - (bbox[2]-bbox[0])//2, 840), footer, font=font_mono, fill=(148, 163, 184))

    img.save(out_path)

def create_lower_third(out_path, badge_text, title_text, sub_text):
    w, h = 1920, 1080
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    font_mono = ImageFont.truetype(FONT_MONO, 19)
    font_title = ImageFont.truetype(FONT_BOLD, 34)
    font_sub = ImageFont.truetype(FONT_REG, 22)

    # Card dimensions
    cx, cy, cw, ch = 60, 870, 960, 150
    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=20, fill=(10, 14, 26, 235), outline=(168, 85, 247, 200), width=2)

    # Glowing Badge
    b_box = font_mono.getbbox(badge_text)
    bw = b_box[2] - b_box[0]
    draw.rounded_rectangle([cx + 24, cy + 16, cx + 24 + bw + 24, cy + 46], radius=8, fill=(147, 51, 234, 70), outline=(192, 132, 252, 160), width=1)
    draw.text((cx + 36, cy + 20), badge_text, font=font_mono, fill=(233, 213, 255))

    # Title
    draw.text((cx + 24, cy + 58), title_text, font=font_title, fill=(255, 255, 255))

    # Subtitle
    draw.text((cx + 24, cy + 104), sub_text, font=font_sub, fill=(148, 163, 184))

    # Top right watermark badge
    top_w, top_h = 420, 44
    draw.rounded_rectangle([w - top_w - 40, 30, w - 40, 30 + top_h], radius=12, fill=(10, 14, 26, 210), outline=(255, 255, 255, 40), width=1)
    wm_text = "DreamSentinel AI * Somnia L1"
    draw.text((w - top_w - 20, 42), wm_text, font=font_mono, fill=(203, 213, 225))

    overlay.save(out_path)

SCENES = [
    {
        "id": "scene_00_intro",
        "type": "card",
        "card_func": create_intro_card,
        "narration_en": "Welcome to DreamSentinel AI — Autonomous Swarm Intelligence for DreamDEX Event Contracts on Somnia Layer 1.",
        "narration_fr": "Bienvenue sur DreamSentinel AI — L'intelligence d'essaim autonome pour les contrats d'événements DreamDEX sur Somnia L1."
    },
    {
        "id": "scene_01_terminal",
        "type": "video",
        "src_start": 0.0,
        "src_end": 18.0,
        "badge": "⚡ SOMNIA SHANNON L1 * 105,420 TPS",
        "title": "High-Frequency Trading Terminal",
        "sub": "Sub-second CLOB finality * Micro-gas < 0.0001 STT * $1.00 USDso payout settlement",
        "narration_en": "Prediction markets face three major bottlenecks: fragmented liquidity, slow chain latency, and emotional sizing errors. DreamSentinel AI solves this by fusing Bayesian probability models, mathematical Kelly Criterion, and Somnia's 105,000 TPS Reactive L1.",
        "narration_fr": "Les marchés de prédiction souffrent de 3 écueils : liquidité fragmentée, latence élevée et erreurs de sizing. DreamSentinel AI résout ces défis en fusionnant modèles bayésiens, critère de Kelly et les 105 000 TPS de Somnia."
    },
    {
        "id": "scene_02_ecosystem",
        "type": "video",
        "src_start": 72.0,
        "src_end": 88.0,
        "badge": "🛠️ ECOSYSTEM & QUANT SUITE",
        "title": "Institutional Financial Tooling",
        "sub": "Kelly Simulator * STT Testnet Faucet * Telegram Bot * 4 Verified Contracts",
        "narration_en": "Our platform provides a complete trading ecosystem, including a mathematical Kelly Criterion simulator, instant testnet faucets, and a mobile-first Telegram Mini-App gateway.",
        "narration_fr": "Notre plateforme intègre un simulateur mathématique de Kelly, des faucets de testnet et une passerelle mobile Telegram ultra-rapide."
    },
    {
        "id": "scene_03_execution",
        "type": "video",
        "src_start": 105.0,
        "src_end": 142.0,
        "badge": "🎯 NON-CUSTODIAL EXECUTION",
        "title": "1-Click Trade & Mathematical Kelly Sizing",
        "sub": "Live wallet balance $5,801 USDso * Optimal capital sizing * Instant on-chain signing",
        "narration_en": "In our live Trading Terminal, winning shares settle at exactly one dollar USDso. The AI computes optimal Kelly capital allocation, and orders execute non-custodially on Somnia Shannon with sub-second finality.",
        "narration_fr": "Dans le terminal de trading, chaque part gagnante règle à 1 dollar USDso. L'IA calcule le dimensionnement optimal de Kelly et les ordres s'exécutent en un clic sur Somnia Shannon."
    },
    {
        "id": "scene_04_cashout",
        "type": "video",
        "src_start": 153.0,
        "src_end": 171.0,
        "badge": "💰 INSTANT CASH-OUT & SETTLEMENT",
        "title": "Real-Time Microsecond Profit Realization",
        "sub": "My Positions telemetry * Early exit liquidity * Toast: +$298 USDso credited",
        "narration_en": "Positions can be monitored and cashed out at any microsecond before event resolution, with profits instantly realized and credited directly to the trader's on-chain wallet.",
        "narration_fr": "Les traders suivent leurs positions en direct et peuvent sécuriser leurs gains avant l'échéance avec un règlement on-chain immédiat."
    },
    {
        "id": "scene_05_radar",
        "type": "video",
        "src_start": 188.0,
        "src_end": 205.0,
        "badge": "📡 CROSS-MARKET ARBITRAGE RADAR",
        "title": "DreamDEX vs Polymarket Discrepancy",
        "sub": "Real-time spread detection * +15.6% alpha edge * Atomic probabilistic convergence",
        "narration_en": "Beyond directional bets, our Cross-Market Arbitrage Radar continuously identifies probabilistic mispricings between DreamDEX CLOB and Polymarket, capturing risk-free alpha through atomic convergence.",
        "narration_fr": "Le Radar d'Arbitrage cross-market détecte en continu les anomalies de prix entre DreamDEX et Polymarket, capturant un alpha sans risque."
    },
    {
        "id": "scene_06_backtest",
        "type": "video",
        "src_start": 207.0,
        "src_end": 228.0,
        "badge": "📈 QUANTITATIVE MONTE CARLO",
        "title": "Institutional Strategy Backtesting",
        "sub": "Sentinel-BayesArb strategy * Sharpe Ratio 3.77 * Equity: $10k -> $3.98M (+39,767%)",
        "narration_en": "Traders can backtest our multi-agent quantitative models over historical event data, tuning Kelly parameters to verify Sharpe ratios and drawdown resilience.",
        "narration_fr": "Le backtester institutionnel évalue nos modèles d'essaim bayésien sur données historiques, démontrant un ratio de Sharpe de 3,77 et un drawdown maîtrisé."
    },
    {
        "id": "scene_07_pvp",
        "type": "video",
        "src_start": 235.0,
        "src_end": 255.0,
        "badge": "⚔️ 60-SECOND PVP DUELS ARENA",
        "title": "Gamified Decentralized Micro-Predictions",
        "sub": "PvPDuelEscrow.sol * $100 & $50 pots * 60s Binary Expiry * Autonomous Escrow",
        "narration_en": "For gamified micro-predictions, our 60-Second PvP Duels Arena enables rapid peer-to-peer wagers secured by decentralized smart contract escrow on Somnia.",
        "narration_fr": "Pour les micro-prédictions gamifiées, l'Arène de Duels PvP permet des défis de 60 secondes sécurisés par escrow décentralisé sur Somnia."
    },
    {
        "id": "scene_08_vaults",
        "type": "video",
        "src_start": 268.0,
        "src_end": 292.0,
        "badge": "🏦 ERC-4626 COPY-TRADING VAULTS",
        "title": "Passive Yield Managed by AI Swarm",
        "sub": "dsALPHA 64.2% APY * DreamSentinelVault.sol * Non-custodial USDso deposits",
        "narration_en": "For passive liquidity providers, our ERC-4626 Vaults automate multi-strategy copy-trading across the swarm, providing sustainable, non-inflationary yield directly on-chain.",
        "narration_fr": "Les fournisseurs de liquidité peuvent déposer des USDso dans nos coffres ERC-4626 vérifiés pour générer un rendement passif automatisé par l'IA."
    },
    {
        "id": "scene_09_telegram",
        "type": "video",
        "src_start": 312.0,
        "src_end": 330.0,
        "badge": "📱 TELEGRAM MINI-APP GATEWAY",
        "title": "Mobile-First Trading & High-Speed Alerts",
        "sub": "DreamSentinel Bot online * Somnia 105,420 TPS * 1-Click Buy YES from chat",
        "narration_en": "Everything is accessible on mobile through our Telegram Mini-App, giving traders instant arbitrage alerts and one-tap trade execution wherever they are.",
        "narration_fr": "Et grâce à notre Mini-App Telegram, les utilisateurs reçoivent des alertes haute fréquence et tradent directement depuis leur messagerie mobile."
    },
    {
        "id": "scene_10_outro",
        "type": "card",
        "card_func": create_outro_card,
        "narration_en": "DreamSentinel AI: Revolutionizing event contracts with institutional quantitative intelligence on Somnia L1. Visit our live terminal and test it today!",
        "narration_fr": "DreamSentinel AI : la finance quantitative appliquée aux contrats d'événements sur Somnia L1. Testez notre terminal en direct dès aujourd'hui !"
    }
]

async def generate_audio(text, voice, out_path):
    tts = edge_tts.Communicate(text, voice, rate="+6%")
    await tts.save(out_path)

def generate_synth_music(duration, out_path):
    sr = 44100
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    
    # Atmospheric synth progression
    chord_freqs = [
        [146.83, 174.61, 220.00, 293.66], # Dm
        [116.54, 146.83, 174.61, 233.08], # Bb
        [130.81, 164.81, 196.00, 261.63], # C
        [110.00, 130.81, 164.81, 220.00]  # Am
    ]
    
    signal = np.zeros_like(t)
    chord_len = 6.0 # 6 seconds per chord
    n_chords = int(np.ceil(duration / chord_len))
    
    for c_idx in range(n_chords):
        c_start = c_idx * chord_len
        c_end = min((c_idx + 1) * chord_len, duration)
        mask = (t >= c_start) & (t < c_end)
        local_t = t[mask] - c_start
        cur_len = c_end - c_start
        env = np.sin(np.pi * local_t / cur_len) ** 1.5
        freqs = chord_freqs[c_idx % len(chord_freqs)]
        for f in freqs:
            signal[mask] += 0.05 * env * (np.sin(2 * np.pi * f * local_t) + 0.3 * np.sin(4 * np.pi * f * local_t))
    
    # Add subtle sub-bass pulse at 120 bpm (0.5s)
    pulse = np.sin(2 * np.pi * 55.0 * t) * (np.sin(2 * np.pi * 2.0 * t) ** 4) * 0.03
    signal += pulse

    # Smooth fade-in (2s) and fade-out (3s)
    fade_in_len = int(2.0 * sr)
    signal[:fade_in_len] *= np.linspace(0, 1, fade_in_len)
    fade_out_len = int(3.0 * sr)
    signal[-fade_out_len:] *= np.linspace(1, 0, fade_out_len)

    wav.write(out_path, sr, (signal * 32767).astype(np.int16))

async def process_montage(lang="en"):
    voice = "en-US-ChristopherNeural" if lang == "en" else "fr-FR-HenriNeural"
    print(f"\n=======================================================")
    print(f"  BUILDING CINEMATIC REALISTIC MONTAGE ({lang.upper()})")
    print(f"=======================================================\n")

    scene_videos = []
    
    for idx, sc in enumerate(SCENES):
        sc_id = sc["id"]
        print(f"[{idx+1}/{len(SCENES)}] Processing {sc_id}...")
        
        # 1. Generate Voiceover Audio
        narration = sc[f"narration_{lang}"]
        audio_file = os.path.join(OUTPUT_DIR, f"{sc_id}_{lang}.mp3")
        await generate_audio(narration, voice, audio_file)
        dur = get_duration(audio_file)
        target_dur = dur + 0.6
        print(f"  -> Narration duration: {dur:.2f}s (scene target: {target_dur:.2f}s)")

        # 2. Render Visual
        out_scene_video = os.path.join(OUTPUT_DIR, f"{sc_id}_{lang}.mp4")

        if sc["type"] == "card":
            img_file = os.path.join(OUTPUT_DIR, f"{sc_id}.png")
            sc["card_func"](img_file)
            cmd = [
                "ffmpeg", "-y", "-loop", "1", "-i", img_file,
                "-i", audio_file,
                "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
                "-t", str(target_dur),
                "-c:a", "aac", "-b:a", "192k",
                "-shortest",
                out_scene_video
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        elif sc["type"] == "video":
            overlay_file = os.path.join(OUTPUT_DIR, f"{sc_id}_overlay.png")
            create_lower_third(overlay_file, sc["badge"], sc["title"], sc["sub"])
            
            src_dur = sc["src_end"] - sc["src_start"]
            pts_ratio = target_dur / src_dur

            filter_str = (
                f"[0:v]trim=start={sc['src_start']}:end={sc['src_end']},setpts=PTS-STARTPTS,"
                f"setpts={pts_ratio}*PTS,pad=1920:1080:0:30:black[base];"
                f"[base][1:v]overlay=0:0[v]"
            )
            cmd = [
                "ffmpeg", "-y",
                "-i", RAW_VIDEO,
                "-i", overlay_file,
                "-i", audio_file,
                "-filter_complex", filter_str,
                "-map", "[v]", "-map", "2:a",
                "-c:v", "libx264", "-preset", "fast", "-crf", "19", "-pix_fmt", "yuv420p",
                "-t", str(target_dur),
                "-c:a", "aac", "-b:a", "192k",
                out_scene_video
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        scene_videos.append(out_scene_video)
        print(f"  OK: Scene rendered: {out_scene_video}")

    # 3. Concat all scenes with seamless re-encoding filter
    unmixed_video = os.path.join(OUTPUT_DIR, f"unmixed_{lang}.mp4")
    print(f"\nConcatenating {len(scene_videos)} scenes with seamless filter...")
    cmd_concat = ["ffmpeg", "-y"]
    filter_parts = []
    for i, s in enumerate(scene_videos):
        cmd_concat.extend(["-i", s])
        filter_parts.append(f"[{i}:v][{i}:a]")
    
    filter_str = "".join(filter_parts) + f"concat=n={len(scene_videos)}:v=1:a=1[v][a]"
    cmd_concat.extend([
        "-filter_complex", filter_str,
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k",
        unmixed_video
    ])
    subprocess.run(cmd_concat, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    total_dur = get_duration(unmixed_video)
    print(f"OK: Total video duration: {total_dur:.1f} seconds ({total_dur/60:.1f} minutes)")

    # 4. Generate & Mix Background Music Bed
    print(f"Synthesizing atmospheric synth music bed ({total_dur:.1f}s)...")
    music_file = os.path.join(OUTPUT_DIR, f"music_{lang}.wav")
    generate_synth_music(total_dur, music_file)

    # 5. Final Output Assembly with Audio Mix (Voiceover + Music at -22dB)
    final_output = os.path.join(BASE_DIR, "frontend", "public", f"dreamsentinel_montage_demo_{lang}.mp4")
    print(f"Mixing master soundtrack and rendering final high-production MP4...")
    
    mix_filter = "[0:a]volume=1.0[voice];[1:a]volume=0.07[music];[voice][music]amix=inputs=2:duration=first[aout]"
    cmd_final = [
        "ffmpeg", "-y",
        "-i", unmixed_video,
        "-i", music_file,
        "-filter_complex", mix_filter,
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "256k",
        final_output
    ]
    subprocess.run(cmd_final, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    final_size_mb = os.path.getsize(final_output) / (1024 * 1024)
    print(f"\n=======================================================")
    print(f"  SUCCESS! Master Montage ({lang.upper()}) Created:")
    print(f"  Path: {final_output}")
    print(f"  Duration: {total_dur:.1f}s | Size: {final_size_mb:.2f} MB")
    print(f"=======================================================\n")
    return final_output

async def main():
    en_video = await process_montage("en")
    default_demo = os.path.join(BASE_DIR, "frontend", "public", "demo_video.mp4")
    import shutil
    shutil.copyfile(en_video, default_demo)
    print(f"Copied master English montage to {default_demo}")

    fr_video = await process_montage("fr")
    print(f"All montages ready for production deployment!")

if __name__ == "__main__":
    asyncio.run(main())
