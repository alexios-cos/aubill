FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN chown -R node:node /app

USER node

RUN npm install

COPY . .

#RUN npm run build

EXPOSE 3000

# Start app
CMD ["npm", "run", "start:dev"]