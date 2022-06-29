#This is the base image we are inheriting from
FROM node

#Start in this directory, and create it if it doesn't already exist
WORKDIR /app

#Copy this first so there's no conflict with the node_modules directory
COPY package.json ./

RUN npm install

COPY . ./

#This is different from RUN in that this defines the last command that's run; this command is what ultimately starts the service
CMD npm start