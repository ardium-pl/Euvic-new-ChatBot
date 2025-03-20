import requests
import os
from dotenv import load_dotenv
from logger import logger_main


load_dotenv()

PHONE_NUMBER_ID = os.environ.get('PHONE_NUMBER_ID')
ACCESS_TOKEN = os.environ.get('ACCESS_TOKEN')
NUMBERS_STRING = os.environ.get('NUMBERS_LIST_2')

numbers_list = []
if NUMBERS_STRING:
    numbers_list = NUMBERS_STRING.split(',')

url = f"https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages"
headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

for number in numbers_list:
    data = {
        "messaging_product": "whatsapp",
        "to": f"{number}",
        "type": "template",
        "template": {
            "name": "welcome_message_v3",
            "language": {
                "code": "pl"
            }
        }
    }

    response = requests.post(url, headers=headers, json=data)
    logger_main.info(f'📞 Number: {number}, 🔢 R status code: {response.status_code}, R json: {response.json()}')
