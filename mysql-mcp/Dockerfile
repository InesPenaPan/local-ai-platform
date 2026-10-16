FROM node:18-alpine

WORKDIR /app

# Clone the official open-source mcp-server-mysql repository (by Ben Borla) into the working directory
RUN apk add --no-cache git
RUN git clone https://github.com/benborla/mcp-server-mysql.git .

RUN npm install
RUN npm run build

ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["node", "dist/index.js"]