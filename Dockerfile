FROM node:current-alpine
LABEL maintainer="https://github.com/bitofant"

# RUN npm -v && node -v

ARG HOSTNAMES=localhost,email.local
ARG PORT=25
ARG SSL_PORT=587
ARG SSL_PATH=./cert/
ARG SSL_CERT=fullchain.cer
ARG SSL_KEY=${HOSTNAME}.key

EXPOSE ${PORT}
EXPOSE ${SSL_PORT}

ENV HOME /root

WORKDIR $HOME
COPY ./*.json ${HOME}/
COPY ./src ${HOME}/src/
RUN npm install

ENV NODE_ENV=production
RUN npm run build
RUN npm prune --production

CMD ["node","dist/app.js"]
