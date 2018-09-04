FROM node:8.9

LABEL maintainer="Hossam Hammady <github@hammady.net>"

ENV NODE_ENV development

WORKDIR /home

ADD package*.json /home/
RUN npm install
# RUN npm install standard -g

ADD / /home/

CMD ["npm", "start"]
