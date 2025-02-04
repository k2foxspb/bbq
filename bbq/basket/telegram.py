from os import environ

import telebot
from telebot import apihelper
bot = telebot.TeleBot('8010937064:AAE35qP4DLE00VwyGpmb8nbDjSb3y4qQunk')

# from telebot import types
def send_message(message):
    chat_id_2 = 7169510671
    chat_id_fox = 939130884
    bot.send_message(chat_id_2, message)
    bot.send_message(chat_id_fox, message)
