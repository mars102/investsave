Readme

Установить докер далее последовательно выполнить комманды:
	
 docker-compose build 
	
 docker compose up --build 

Приложение поднимается на localhost:8080/api/docs/ вернет свагер с описанием апи

Также нужно добавить файл с содержимым .env
# Порты
APP_PORT=80
APP_INTERNAL_PORT=7000
POSTGRES_PORT=5432

# База данных
POSTGRES_DB=dbname
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Password2025!!!

# Окружение
NODE_ENV=development

PORT=7000
POSTGRES_HOST=postgres

