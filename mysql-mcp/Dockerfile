FROM node:18-alpine

WORKDIR /app

# Clone the official open-source mcp-server-mysql repository (by Ben Borla) into the working directory
RUN apk add --no-cache git
RUN git clone https://github.com/benborla/mcp-server-mysql.git .

RUN npm install
RUN npm run build

ENV SERVER_PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start"]