FROM node:8.15-alpine

# 在镜像中创建一个文件夹存放应用程序代码
# 这将是你的应用程序工作目录
# Create app directory
WORKDIR /usr/src/app/srszd-cheerio

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --only=production
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# EXPOSE 5000

CMD [ "npm", "start" ]