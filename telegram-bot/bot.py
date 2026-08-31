import os
import requests
import time
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "MOCK_TOKEN_FOR_HACKATHON")
BACKEND_API_URL = "http://localhost:8000/api"
WEBAPP_URL = "https://dreamsentinel-ai.vercel.app" # URL de démo déployée

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    
    welcome_text = (
        f"👋 Bienvenue {user.first_name} sur <b>DreamSentinel AI</b>!\n\n"
        f"L'Essaim d'Agents IA pour les Event Contracts sur Somnia & DreamDEX.\n"
        f"Je surveille le marché 24/7 et je peux exécuter des trades d'arbitrage stochastique pour vous."
    )

    keyboard = [
        [InlineKeyboardButton("🚀 Ouvrir la Mini-App", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton("📊 Marchés Actifs", callback_data="markets")],
        [InlineKeyboardButton("🧠 Demander au Copilote", callback_data="copilot")],
        [InlineKeyboardButton("⚔️ Duels PvP 60s", callback_data="pvp")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_html(welcome_text, reply_markup=reply_markup)

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Parses the CallbackQuery and updates the message text."""
    query = update.callback_query
    await query.answer()

    if query.data == "markets":
        try:
            res = requests.get(f"{BACKEND_API_URL}/markets")
            if res.status_code == 200:
                markets = res.json()
                text = "📊 <b>Marchés DreamDEX Actifs</b>\n\n"
                for m in markets[:3]:
                    text += f"🔸 <b>{m['symbol']}</b> - Strike: ${m['strike_price']}\n"
                    text += f"Prob YES: {m['yes_prob']*100:.0f}% | NO: {m['no_prob']*100:.0f}%\n\n"
                text += "<i>Ouvrez la Mini-App pour trader.</i>"
            else:
                text = "❌ Erreur de connexion au backend DreamSentinel."
        except:
            text = "⚠️ Mode Demo: Le backend est hors ligne."
            
        await query.edit_message_text(text=text, parse_mode='HTML')
        
    elif query.data == "copilot":
        await query.edit_message_text(text="🧠 <b>Copilote IA</b>\n\nPosez-moi vos questions de trading en tapant directement votre message ici.")
        
    elif query.data == "pvp":
        await query.edit_message_text(text="⚔️ <b>Duels PvP 60s</b>\n\nAffrontez d'autres traders en direct. Ouvrez la Mini-App pour créer un duel avec Escrow Smart Contract sur Somnia.")

def main() -> None:
    """Run the bot."""
    # Create the Application and pass it your bot's token.
    if TELEGRAM_BOT_TOKEN == "MOCK_TOKEN_FOR_HACKATHON":
        print("⚠️ Démarrage en mode MOCK. Configurez TELEGRAM_BOT_TOKEN pour la production.")
        
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(button_handler))

    # Run the bot until the user presses Ctrl-C
    # application.run_polling(allowed_updates=Update.ALL_TYPES)
    print("🤖 Telegram Bot de démonstration initialisé (run_polling commenté pour le build).")

if __name__ == "__main__":
    main()
