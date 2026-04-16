FROM node:20-alpine

RUN npm i -g @nestjs/cli

WORKDIR /app

COPY package*.json ./

RUN chown -R node:node /app

RUN npm install

COPY . .

#RUN npm run build

EXPOSE 3000

# Start app
CMD ["npm", "run", "start:dev"]