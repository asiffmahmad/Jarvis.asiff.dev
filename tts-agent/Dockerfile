FROM node:22-alpine

WORKDIR /app

# Install FFmpeg for audio processing
RUN apk add --no-cache ffmpeg

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Create necessary storage directories
RUN mkdir -p storage/audio storage/subtitles storage/temp

EXPOSE 4000

CMD ["npm", "start"]
