from os import environ

import telebot
from telebot import apihelper
bot = telebot.TeleBot('7013936598:AAG9HKVZoltQnDfoz0UAUJoziWOrgm-FhA0')

# from telebot import types
def send_message(message):
    chat_id = 939130884
    bot.send_message(chat_id, message)