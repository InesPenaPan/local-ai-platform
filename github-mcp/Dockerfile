FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY index.js ./

ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["node", "index.js"]